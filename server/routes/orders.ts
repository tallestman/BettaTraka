import { Router, Request, Response } from 'express';
import { pool, withTransaction } from '../db/index.js';
import { authenticate, requireOrg, requireRole } from '../auth/middleware.js';
import type { PoolClient } from 'pg';
import { OrderError, createOrder, readOrders, assignee } from './order-service.js';
import { publicIntakeIpLimit, publicIntakeScopeLimit } from './intake-rate-limit.js';
export const sharedOrdersRouter = Router();
const managers = ['Owner','Admin','Manager'];
const staff = [...managers,'Sales Representative'];
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
function fail(status: number, message: string): never { throw new HttpError(status,message); }
const route = (fn: (req: Request,res: Response)=>Promise<void>) => async (req: Request,res: Response) => {
 try { await fn(req,res); } catch(e: any) { res.status((e instanceof HttpError || e instanceof OrderError) ? e.status : e.code==='23505' ? 409 : 500).json({error:(e instanceof HttpError || e instanceof OrderError) ? e.message : 'Request could not be completed.'}); }
};
function keys(body: any, allowed: string[]) { if(!body || typeof body!=='object' || Array.isArray(body) || Object.keys(body).some(k=>!allowed.includes(k))) fail(400,'Unsupported request fields.'); }
function text(v: any, max=255) { if(typeof v!=='string'||!v.trim()||v.length>max) fail(400,'Invalid text field.'); return v.trim(); }
function integer(v: any, min=1) { if(!Number.isSafeInteger(v)||v<min||v>2147483647) fail(400,'Invalid integer.'); return v; }
function uuid(v: any) { if(typeof v!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) fail(400,'Invalid identifier.'); return v; }
async function products(org: string, ids?: string[]) {
 const rows = await pool.query(`SELECT p.id,p.name,p.sku,p.currency,p.is_active AS active,
 COALESCE((SELECT jsonb_agg(jsonb_build_object('id',k.id,'name',k.name,'quantity',k.quantity,'priceMinor',k.price_kobo) ORDER BY k.created_at,k.id) FROM product_packages k WHERE k.product_id=p.id AND k.organization_id=p.organization_id AND k.status='Active'),'[]') AS packages
 FROM products p WHERE p.organization_id=$1 ${ids?'AND p.id=ANY($2::uuid[]) AND p.is_active=true':''} ORDER BY p.created_at,p.id`,ids?[org,ids]:[org]); return rows.rows;
}
sharedOrdersRouter.get('/catalog/products',authenticate,requireOrg,requireRole(staff),route(async(req,res)=>{ res.json({products:await products(req.membership!.organizationId)}); }));
sharedOrdersRouter.post('/catalog/products',authenticate,requireOrg,requireRole(managers),route(async(req,res)=>{
 const b=req.body; keys(b,['name','sku','currency','active','packages']);
 const name=text(b.name),sku=text(b.sku,100),currency=b.currency===undefined?'NGN':text(b.currency,3);
 if(currency!=='NGN'||typeof b.active!=='boolean'||!Array.isArray(b.packages)||!b.packages.length||b.packages.length>50) fail(400,'Invalid product: pilot currency must be NGN.');
 for(const p of b.packages){ keys(p,['name','quantity','priceMinor']); text(p.name); integer(p.quantity); integer(p.priceMinor,0); }
 const org=req.membership!.organizationId;
 const id=await withTransaction(async c=>{
 const r=await c.query('INSERT INTO products(organization_id,name,sku,currency,is_active) VALUES($1,$2,$3,$4,$5) RETURNING id',[org,name,sku,currency,b.active]);
 for(const p of b.packages) await c.query('INSERT INTO product_packages(organization_id,product_id,name,quantity,price_kobo) VALUES($1,$2,$3,$4,$5)',[org,r.rows[0].id,p.name,p.quantity,p.priceMinor]);
 return r.rows[0].id;
 });
 res.status(201).json({product:(await products(org)).find(p=>p.id===id)});
}));
function submission(req:Request, manual:boolean) {
 const b=req.body; keys(b,['customerName','customerPhone','alternatePhone','customerEmail','deliveryAddress','deliveryCity','deliveryState','packageId','quantity','notes','utm',...(manual?['assignedUserId','productId']:[])]);
 const clean:any={};
 for(const field of ['customerName','customerPhone','deliveryAddress','deliveryCity','deliveryState']) clean[field]=text(b[field],field==='deliveryAddress'?2000:field==='customerPhone'?50:100);
 for(const field of ['alternatePhone','customerEmail','notes']) if(b[field]!==undefined) clean[field]=text(b[field],field==='notes'?4000:field==='alternatePhone'?50:255);
 clean.packageId=uuid(b.packageId); clean.quantity=integer(b.quantity);
 if(b.productId!==undefined)clean.productId=uuid(b.productId);
 if(b.assignedUserId!==undefined)clean.assignedUserId=b.assignedUserId===null?null:uuid(b.assignedUserId);
 if(b.utm!==undefined){keys(b.utm,['source','medium','campaign','term','content']);clean.utm=Object.fromEntries(Object.entries(b.utm).sort().map(([k,v])=>[k,text(v,255)]));}
 const key=text(req.get('Idempotency-Key'),100); if(!/^[a-zA-Z0-9_-]+$/.test(key))fail(400,'Invalid idempotency key.');
 return {b:clean,key};
}
sharedOrdersRouter.post('/public/forms/:slug/orders',publicIntakeIpLimit,route(async(req,res)=>{
 const {b,key}=submission(req,false),f=await publicForm(req.params.slug);
 if(publicIntakeScopeLimit(res,f.id,f.organization_id))return;
 const result=await createOrder(f.organization_id,b,key,{kind:'public',formId:f.id}); res.status(result.replayed?200:201).json({order:result.order});
}));
sharedOrdersRouter.post('/orders',authenticate,requireOrg,requireRole(staff),route(async(req,res)=>{
 const {b,key}=submission(req,true);
 if(req.membership!.role==='Sales Representative') {if('assignedUserId' in b)fail(403,'Only managers assign orders.'); b.assignedUserId=req.user!.id;}
 const result=await createOrder(req.membership!.organizationId,b,key,{kind:'staff',userId:req.user!.id,role:req.membership!.role}); res.status(result.replayed?200:201).json({order:result.order});
}));
sharedOrdersRouter.get('/orders',authenticate,requireOrg,requireRole(staff),route(async(req,res)=>{
 res.json({orders:await readOrders(req.membership!.organizationId,req.membership!.role==='Sales Representative'?req.user!.id:undefined)});
}));
sharedOrdersRouter.get('/orders/:id',authenticate,requireOrg,requireRole(staff),route(async(req,res)=>{
 const result=await readOrders(req.membership!.organizationId,req.membership!.role==='Sales Representative'?req.user!.id:undefined,uuid(req.params.id)); if(!result.length)fail(404,'Order not found.'); res.json({order:result[0]});
}));
sharedOrdersRouter.patch('/orders/:id',authenticate,requireOrg,requireRole(staff),route(async(req,res)=>{
 const b=req.body; keys(b,['status','notes','scheduledDate','assignedUserId']); if(!Object.keys(b).length)fail(400,'No changes.');
 const org=req.membership!.organizationId,id=uuid(req.params.id),rep=req.membership!.role==='Sales Representative';
 if(rep && 'assignedUserId' in b)fail(403,'Only managers assign orders.');
 if(b.status!==undefined&&!['NEW','CONFIRMED','SCHEDULED'].includes(b.status))fail(400,'Unsupported status.');
 if(b.notes!==undefined && (typeof b.notes!=='string'||b.notes.length>4000))fail(400,'Invalid notes.');
 if(b.scheduledDate!==undefined&&b.scheduledDate!==null && (typeof b.scheduledDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(b.scheduledDate)||Number.isNaN(Date.parse(b.scheduledDate))||new Date(b.scheduledDate).toISOString().slice(0,10)!==b.scheduledDate))fail(400,'Invalid date.');
 if(b.assignedUserId!==undefined&&b.assignedUserId!==null)uuid(b.assignedUserId);
 const result=await withTransaction(async c=>{
 const r=await c.query('SELECT * FROM orders WHERE id=$1 AND organization_id=$2 AND ($3::uuid IS NULL OR sales_rep_id=$3) FOR UPDATE',[id,org,rep?req.user!.id:null]); if(!r.rowCount)fail(404,'Order not found.');
 const old=r.rows[0],status=b.status===undefined?old.status:b.status==='NEW'?'PENDING':b.status;
 if(['DELIVERED','CANCELLED','RETURNED'].includes(old.status)&&status!==old.status)fail(409,'Terminal orders cannot be reopened.');
 const date=b.scheduledDate===undefined?old.scheduled_date:b.scheduledDate;
 if(status==='SCHEDULED'&&!date)fail(400,'Scheduled date required.');
 if('assignedUserId' in b)await assignee(c,org,b.assignedUserId);
 await c.query('UPDATE orders SET status=$1,notes=$2,scheduled_date=$3,sales_rep_id=$4,updated_at=NOW() WHERE id=$5 AND organization_id=$6',[status,b.notes??old.notes,status==='SCHEDULED'?date:null,'assignedUserId' in b?b.assignedUserId:old.sales_rep_id,id,org]);
 return (await readOrders(org,undefined,id,c))[0];
 }); res.json({order:result});
}));
const formColumns = `id,title,public_slug AS slug,product_ids AS "productIds",is_active AS published`;
sharedOrdersRouter.get('/order-forms',authenticate,requireOrg,requireRole(managers),route(async(req,res)=>{
 res.json({forms:(await pool.query(`SELECT ${formColumns} FROM order_forms WHERE organization_id=$1 ORDER BY created_at,id`,[req.membership!.organizationId])).rows});
}));
sharedOrdersRouter.post('/order-forms',authenticate,requireOrg,requireRole(managers),route(async(req,res)=>{
 const b=req.body; keys(b,['title','slug','productIds','published']);
 const title=text(b.title),slug=text(b.slug,150);
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||typeof b.published!=='boolean'||!Array.isArray(b.productIds)||!b.productIds.length||b.productIds.length>50) fail(400,'Invalid form.');
 const ids=[...new Set<string>(b.productIds.map(uuid))],org=req.membership!.organizationId;
 if((await products(org,ids)).length!==ids.length) fail(400,'Products must be active in this workspace.');
 const r=await pool.query(`INSERT INTO order_forms(organization_id,title,public_slug,product_id,product_ids,is_active) VALUES($1,$2,$3,$4,$5,$6) RETURNING ${formColumns}`,[org,title,slug,ids[0],ids,b.published]);
 res.status(201).json({form:r.rows[0]});
}));
async function publicForm(slug:string,c: Pick<PoolClient,'query'>=pool) {
 const r=await c.query(`SELECT f.* FROM order_forms f JOIN organizations o ON o.id=f.organization_id WHERE f.public_slug=$1 AND f.is_active AND o.status='ACTIVE'`,[slug]);
 if(!r.rowCount) fail(404,'Form unavailable.'); return r.rows[0];
}
sharedOrdersRouter.get('/public/forms/:slug',route(async(req,res)=>{
 const f=await publicForm(req.params.slug); const available=await products(f.organization_id,f.product_ids);
 if(!available.length) fail(404,'Form unavailable.');
 res.json({form:{id:f.id,title:f.title,slug:f.public_slug,productIds:available.map(p=>p.id),published:true},products:available});
}));
