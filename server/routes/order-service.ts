import { createHash, randomUUID } from 'node:crypto';
import { pool, withTransaction } from '../db/index.js';
import type { PoolClient } from 'pg';
export class OrderError extends Error { constructor(public status:number,message:string){super(message);} }
export const reject=(status:number,message:string):never=>{throw new OrderError(status,message)};
export async function readOrders(org:string, user?:string, id?:string, c:Pick<PoolClient,'query'>=pool){
 const r=await c.query(`SELECT o.id,o.order_number AS "orderNumber",o.intake,o.currency,o.total_amount_kobo::float8 AS "totalMinor", CASE WHEN o.status='PENDING' THEN 'NEW' ELSE o.status END AS status,o.sales_rep_id AS "assignedUserId",o.created_at AS "createdAt",to_char(o.scheduled_date,'YYYY-MM-DD') AS "scheduledDate",o.notes,
 (SELECT jsonb_agg(jsonb_build_object('productId',i.product_id,'productName',i.product_name,'packageId',i.package_id,'packageName',i.package_name,'packageQuantity',i.package_quantity,'quantity',i.quantity,'priceMinor',i.unit_price_kobo,'lineTotalMinor',i.line_total_kobo)) FROM order_items i WHERE i.order_id=o.id AND i.organization_id=o.organization_id) AS items
 FROM orders o WHERE o.organization_id=$1 AND ($2::uuid IS NULL OR o.sales_rep_id=$2) AND ($3::uuid IS NULL OR o.id=$3) ORDER BY o.created_at DESC,o.id`,[org,user??null,id??null]);
 return r.rows.map(({intake,...o})=>({...intake,...o}));
}
export async function assignee(c:Pick<PoolClient,'query'>,org:string,id:string|null){
 if(id===null)return;
 const r=await c.query(`SELECT m.user_id FROM organization_memberships m JOIN users u ON u.id=m.user_id WHERE m.organization_id=$1 AND m.user_id=$2 AND m.status='ACTIVE' AND u.status='ACTIVE' AND m.role IN ('Owner','Admin','Manager','Sales Representative')`,[org,id]);
 if(!r.rowCount)reject(400,'Assignee must be active staff in this workspace.');
}
function publicReceipt(o:{id:string;orderNumber:string;totalMinor:number;currency:string}) {
 return {id:o.id,orderNumber:o.orderNumber,totalMinor:o.totalMinor,currency:o.currency};
}
type CreationAccess = {kind:'public';formId:string} | {kind:'staff';userId:string;role:string};
export async function createOrder(org:string, b:any, key:string, access:CreationAccess){
 const formId=access.kind==='public'?access.formId:undefined;
 const scope=access.kind==='public'?'form:'+access.formId:'manual:'+access.userId;
 const visibleUser=access.kind==='staff'&&access.role==='Sales Representative'?access.userId:undefined;
 const fingerprint=createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(b).sort(([a],[b])=>a.localeCompare(b))))).digest('hex');
 const storedKey=createHash('sha256').update(org+':'+scope+':'+key).digest('hex');
 return withTransaction(async c=>{
 // Transaction-scoped lock serializes identical keys before checking/inserting.
 await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[storedKey]);
 const prior=await c.query('SELECT id,request_fingerprint,public_creation_receipt FROM orders WHERE idempotency_key=$1 AND organization_id=$2',[storedKey,org]);
 if(prior.rowCount){
  if(prior.rows[0].request_fingerprint!==fingerprint)reject(409,'Idempotency key already used for different details.');
  if(formId){
   if(!prior.rows[0].public_creation_receipt)reject(409,'Creation receipt unavailable. Contact staff.');
   return {order:publicReceipt(prior.rows[0].public_creation_receipt),replayed:true};
  }
  const order=(await readOrders(org,visibleUser,prior.rows[0].id,c))[0];
  if(!order)reject(404,'Order not found.');
  return {order,replayed:true};
 }
 const pkg=await c.query(`SELECT k.*,p.name AS product_name,p.currency FROM product_packages k JOIN products p ON p.id=k.product_id AND p.organization_id=k.organization_id JOIN organizations o ON o.id=p.organization_id WHERE k.id=$1 AND k.organization_id=$2 AND k.status='Active' AND p.is_active AND o.status='ACTIVE' FOR SHARE OF k,p,o`,[b.packageId,org]);
 if(!pkg.rowCount)reject(400,'Package unavailable.'); const k=pkg.rows[0];
 if(b.productId && b.productId!==k.product_id)reject(400,'Package does not belong to product.');
 if(formId){const f=await c.query('SELECT id FROM order_forms WHERE id=$1 AND organization_id=$2 AND is_active AND $3::uuid=ANY(product_ids) FOR SHARE',[formId,org,k.product_id]);if(!f.rowCount)reject(400,'Product unavailable on this form.');}
 await assignee(c,org,b.assignedUserId??null);
 const total=Number(k.price_kobo)*b.quantity; if(!Number.isSafeInteger(total))reject(400,'Order total too large.');
 const customer=await c.query(`INSERT INTO customers(organization_id,name,phone,email,alt_phone) VALUES($1,$2,$3,$4,$5) ON CONFLICT(organization_id,phone) DO UPDATE SET phone=EXCLUDED.phone RETURNING id`,[org,b.customerName,b.customerPhone,b.customerEmail??null,b.alternatePhone??null]);
 const intake=Object.fromEntries(['customerName','customerPhone','customerEmail','alternatePhone','deliveryAddress','deliveryCity','deliveryState','utm'].filter(x=>b[x]!==undefined).map(x=>[x,b[x]]));
 const r=await c.query(`INSERT INTO orders(organization_id,order_number,customer_id,sales_rep_id,total_amount_kobo,currency,delivery_address,delivery_city,delivery_state,idempotency_key,request_fingerprint,intake,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,[org,randomUUID(),customer.rows[0].id,b.assignedUserId??null,total,k.currency,b.deliveryAddress,b.deliveryCity,b.deliveryState,storedKey,fingerprint,intake,b.notes??null]);
 await c.query(`INSERT INTO order_items(organization_id,order_id,product_id,package_id,product_name,package_name,package_quantity,quantity,unit_price_kobo,line_total_kobo) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[org,r.rows[0].id,k.product_id,k.id,k.product_name,k.name,k.quantity,b.quantity,k.price_kobo,total]);
 // Only these creation-time fields are public, even if the internal DTO grows.
 const created=(await readOrders(org,undefined,r.rows[0].id,c))[0];
 if(formId){
  const receipt=publicReceipt(created);
  await c.query('UPDATE orders SET public_creation_receipt=$1 WHERE id=$2 AND organization_id=$3',[receipt,created.id,org]);
  return {order:receipt,replayed:false};
 }
 return {order:created,replayed:false};
 });
}
