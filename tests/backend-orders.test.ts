import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { app } from '../server/app.js';
import { pool } from '../server/db/index.js';
import { IntakeRateLimiter } from '../server/routes/intake-rate-limit.js';
const db = new URL(process.env.DATABASE_URL || 'http://missing');
assert.equal(db.hostname, '127.0.0.1'); assert.equal(db.port, '55439'); assert.equal(db.pathname, '/bettatraka_auth_test');
let a: any, b: any, product: any, form: any, order: any;
const api = (method: string, path: string, token?: string, body?: any, key?: string) => {
 let r = (request(app) as any)[method]('/api' + path);
 if(token) r = r.set('Authorization', `Bearer ${token}`);
 if(key) r = r.set('Idempotency-Key', key);
 return body === undefined ? r : r.send(body);
};
const input = () => ({customerName:'Test Buyer',customerPhone:'08012345678',deliveryAddress:'12 Test Road',deliveryCity:'Lagos',deliveryState:'Lagos',packageId:product.packages[0].id,quantity:2});
before(async () => {
 for(const name of ['A','B']) {
 const r = await api('post','/auth/register',undefined,{email:`orders-${randomUUID()}@example.invalid`,password:'Synthetic-Password-42!',fullName:`Owner ${name}`,organizationName:`Orders ${randomUUID()}`});
 assert.equal(r.status,201); if(name==='A') a=r.body; else b=r.body;
 }
});
after(async () => { await pool.end(); });
test('new tenants contain no seeded business records', async () => {
 for(const table of ['products','order_forms','orders','customers','remittances','inventory_movements']) assert.equal((await pool.query(`SELECT count(*)::int n FROM ${table} WHERE organization_id=$1`,[a.organization.id])).rows[0].n,0);
});
test('public intake is durable, server priced, and concurrent retries are one order', async () => {
 const p=await api('post','/catalog/products',a.token,{name:'Intake',sku:randomUUID(),active:true,packages:[{name:'Two',quantity:2,priceMinor:500}]}); product=p.body.product;
 const f=await api('post','/order-forms',a.token,{title:'Intake',slug:`intake-${randomUUID()}`,productIds:[product.id],published:true}); form=f.body.form;
 const key=randomUUID(), body=input();
 const results=await Promise.all(Array.from({length:6},()=>api('post',`/public/forms/${form.slug}/orders`,undefined,body,key)));
 assert.ok(results.every(r=>[200,201].includes(r.status)),JSON.stringify(results.map(r=>r.body)));
 order=results[0].body.order; assert.ok(order.id); assert.equal(new Set(results.map(r=>r.body.order.id)).size,1);
 assert.equal(order.totalMinor,1000);
 const internal=(await api('get',`/orders/${order.id}`,a.token)).body.order;
 assert.equal(internal.items[0].packageQuantity,2); assert.equal(internal.status,'NEW');
 assert.equal((await pool.query('SELECT count(*)::int n FROM orders WHERE id=$1',[order.id])).rows[0].n,1);
 assert.equal((await api('post',`/public/forms/${form.slug}/orders`,undefined,{...body,quantity:3},key)).status,409);
 for(const field of ['priceMinor','totalMinor','currency','organizationId']) assert.equal((await api('post',`/public/forms/${form.slug}/orders`,undefined,{...body,[field]:1},randomUUID())).status,400);
 assert.equal((await api('get',`/orders/${order.id}`,a.token)).body.order.id,order.id);
 assert.equal((await api('get',`/orders/${order.id}`,b.token)).status,404);
 assert.deepEqual((await api('get','/orders',b.token)).body.orders,[]);
});
test('public creation and replay return only an immutable creation receipt', async () => {
 const body={...input(),notes:'Customer supplied note'},key=randomUUID(),path=`/public/forms/${form.slug}/orders`;
 const created=await api('post',path,undefined,body,key); assert.equal(created.status,201);
 const receipt=created.body.order;
 const changed=await api('patch',`/orders/${receipt.id}`,a.token,{notes:'STAFF SECRET',assignedUserId:a.user.id,status:'SCHEDULED',scheduledDate:'2027-03-01'});
 assert.equal(changed.status,200);
 // A later correction must not change the receipt of the original creation.
 await pool.query('UPDATE orders SET total_amount_kobo=9999 WHERE id=$1',[receipt.id]);
 const replay=await api('post',path,undefined,body,key); assert.equal(replay.status,200);
 assert.deepEqual(Object.keys(receipt).sort(),['currency','id','orderNumber','totalMinor']);
 assert.equal(receipt.totalMinor,1000); assert.equal(receipt.currency,'NGN');
 assert.deepEqual(replay.body,{order:receipt});
 assert.equal((await pool.query('SELECT count(*)::int n FROM orders WHERE id=$1',[receipt.id])).rows[0].n,1);
});
test('assignment is manager-only, reps see only own orders and updates have no delivery/cash effects', async () => {
 await pool.query("INSERT INTO organization_memberships(organization_id,user_id,role) VALUES($1,$2,'Sales Representative')",[a.organization.id,b.user.id]);
 const switched=await api('post','/auth/switch-org',b.token,{organizationId:a.organization.id}); const rep=switched.body.token;
 assert.equal((await api('get',`/orders/${order.id}`,rep)).status,404);
 assert.equal((await api('patch',`/orders/${order.id}`,a.token,{assignedUserId:b.user.id})).status,200);
 assert.equal((await api('get',`/orders/${order.id}`,rep)).body.order.id,order.id);
 assert.equal((await api('patch',`/orders/${order.id}`,rep,{assignedUserId:a.user.id})).status,403);
 assert.equal((await api('patch',`/orders/${order.id}`,b.token,{notes:'cross tenant'})).status,404);
 assert.equal((await api('patch',`/orders/${order.id}`,rep,{status:'DELIVERED'})).status,400);
 assert.equal((await api('patch',`/orders/${order.id}`,rep,{status:'SCHEDULED'})).status,400);
 const updated=await api('patch',`/orders/${order.id}`,rep,{status:'SCHEDULED',scheduledDate:'2027-02-28',notes:'Call first'});
 assert.equal(updated.status,200); assert.equal(updated.body.order.scheduledDate,'2027-02-28');
 assert.equal((await api('patch',`/orders/${order.id}`,rep,{scheduledDate:'2027-02-30'})).status,400);
 for(const table of ['remittances','inventory_movements']) assert.equal((await pool.query(`SELECT count(*)::int n FROM ${table} WHERE organization_id=$1`,[a.organization.id])).rows[0].n,0);
 const manual=await api('post','/orders',rep,input(),randomUUID()); assert.equal(manual.status,201); assert.equal(manual.body.order.assignedUserId,b.user.id);
 assert.equal((await api('post','/catalog/products',rep,{})).status,403);
});
test('representative replay enforces current assignment without duplicating the order', async () => {
 const switched=await api('post','/auth/switch-org',b.token,{organizationId:a.organization.id}); const rep=switched.body.token;
 const other=await api('post','/auth/register',undefined,{email:`orders-${randomUUID()}@example.invalid`,password:'Synthetic-Password-42!',fullName:'Rep B',organizationName:`Orders ${randomUUID()}`}); assert.equal(other.status,201);
 await pool.query("INSERT INTO organization_memberships(organization_id,user_id,role) VALUES($1,$2,'Sales Representative')",[a.organization.id,other.body.user.id]);
 const body=input(),key=randomUUID(),created=await api('post','/orders',rep,body,key); assert.equal(created.status,201);
 const id=created.body.order.id;
 assert.equal((await api('patch',`/orders/${id}`,a.token,{assignedUserId:other.body.user.id,notes:'NEW ASSIGNEE SECRET'})).status,200);
 assert.equal((await api('get',`/orders/${id}`,rep)).status,404);
 const replays=await Promise.all(Array.from({length:3},()=>api('post','/orders',rep,body,key)));
 for(const replay of replays){assert.equal(replay.status,404);assert.deepEqual(replay.body,{error:'Order not found.'});}
 assert.equal((await pool.query('SELECT count(*)::int n FROM orders WHERE organization_id=$1 AND intake->>\'customerPhone\'=$2 AND id=$3',[a.organization.id,body.customerPhone,id])).rows[0].n,1);
 assert.equal((await api('patch',`/orders/${id}`,a.token,{assignedUserId:b.user.id})).status,200);
 const visible=await api('post','/orders',rep,body,key); assert.equal(visible.status,200); assert.equal(visible.body.order.id,id);
});
test('inactive form, product, package and tenant are rejected', async () => {
 for(const [table,column,value,id] of [['order_forms','is_active',false,form.id],['products','is_active',false,product.id],['product_packages','status','Inactive',product.packages[0].id],['organizations','status','SUSPENDED',a.organization.id]] as const){
 await pool.query(`UPDATE ${table} SET ${column}=$1 WHERE id=$2`,[value,id]);
 try {assert.ok([400,404].includes((await api('post',`/public/forms/${form.slug}/orders`,undefined,input(),randomUUID())).status));}
 finally {await pool.query(`UPDATE ${table} SET ${column}=$1 WHERE id=$2`,[column==='is_active'?true:table==='product_packages'?'Active':'ACTIVE',id]);}
 }
});
test('foreign packages, foreign assignees, missing keys and invalid counts never create orders', async () => {
 const foreign=await api('post','/catalog/products',b.token,{name:'Foreign',sku:randomUUID(),active:true,packages:[{name:'One',quantity:1,priceMinor:10}]});
 for(const body of [{...input(),packageId:foreign.body.product.packages[0].id},{...input(),quantity:0},{...input(),quantity:1.5},{...input(),assignedUserId:b.user.id}]) {
  const r=await api('post',`/public/forms/${form.slug}/orders`,undefined,body,randomUUID());assert.equal(r.status,400);
 }
 assert.equal((await api('post','/orders',a.token,{...input(),assignedUserId:randomUUID()},randomUUID())).status,400);
 assert.equal((await api('post',`/public/forms/${form.slug}/orders`,undefined,input())).status,400);
 const row=(await pool.query('SELECT organization_id FROM orders WHERE id=$1',[order.id])).rows[0]; assert.equal(row.organization_id,a.organization.id);
});
test('transaction failure never returns success and rolls back customer/order; retry is safe', async () => {
 const body={...input(),customerPhone:randomUUID()},key=randomUUID();
 await pool.query(`CREATE FUNCTION orders_test_fail_item() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic item failure'; END $$`);
 await pool.query(`CREATE TRIGGER orders_test_fail_item BEFORE INSERT ON order_items FOR EACH ROW WHEN (NEW.organization_id='${a.organization.id}') EXECUTE FUNCTION orders_test_fail_item()`);
 try {
 const failed=await api('post','/orders',a.token,body,key);assert.equal(failed.status,500);assert.equal(failed.body.order,undefined);
 assert.equal((await pool.query('SELECT count(*)::int n FROM customers WHERE organization_id=$1 AND phone=$2',[a.organization.id,body.customerPhone])).rows[0].n,0);
 }finally {await pool.query('DROP TRIGGER orders_test_fail_item ON order_items');await pool.query('DROP FUNCTION orders_test_fail_item()');}
 const retry=await api('post','/orders',a.token,body,key);assert.equal(retry.status,201);assert.equal((await api('post','/orders',a.token,body,key)).body.order.id,retry.body.order.id);
});
test('published forms expose only their tenant products', async () => {
 const p=await api('post','/catalog/products',a.token,{name:'Form Widget',sku:randomUUID(),active:true,packages:[{name:'Pair',quantity:2,priceMinor:15000}]}); product=p.body.product;
 const r=await api('post','/order-forms',a.token,{title:'Buy Widget',slug:`buy-${randomUUID()}`,productIds:[product.id],published:true});
 assert.equal(r.status,201); form=r.body.form;
 assert.deepEqual(form.productIds,[product.id]); assert.equal(form.published,true);
 assert.ok((await api('get','/order-forms',a.token)).body.forms.some((f:any)=>f.id===form.id));
 assert.deepEqual((await api('get','/order-forms',b.token)).body.forms,[]);
 const pub=await api('get',`/public/forms/${form.slug}`); assert.equal(pub.status,200); assert.equal(pub.body.products[0].id,product.id);
 assert.equal((await api('post','/order-forms',b.token,{title:'Bad',slug:`bad-${randomUUID()}`,productIds:[product.id],published:true})).status,400);
});
test('terminal orders cannot be reopened by routine staff edits', async () => {
 for(const terminal of ['DELIVERED','CANCELLED','RETURNED']) {
  const created=await api('post','/orders',a.token,input(),randomUUID()); assert.equal(created.status,201); const id=created.body.order.id;
  await pool.query('UPDATE orders SET status=$1,notes=$2 WHERE id=$3',[terminal,'Original terminal note',id]);
  for(const status of ['NEW','CONFIRMED','SCHEDULED']) {
   const r=await api('patch',`/orders/${id}`,a.token,{status,scheduledDate:'2027-04-02',notes:'Should not persist'});
   assert.equal(r.status,409,`${terminal} -> ${status}`);
   const stored=(await api('get',`/orders/${id}`,a.token)).body.order;
   assert.equal(stored.status,terminal); assert.equal(stored.notes,'Original terminal note');
  }
  const notesOnly=await api('patch',`/orders/${id}`,a.token,{notes:'Safe correction'});
  assert.equal(notesOnly.status,200); assert.equal(notesOnly.body.order.status,terminal);
 }
});
test('pilot catalog rejects unsupported currencies without persisting products', async () => {
 for(const currency of ['JPY','KWD','USD','XXX']) {
  const sku=randomUUID();
  const r=await api('post','/catalog/products',a.token,{name:'Unsupported',sku,currency,active:true,packages:[{name:'One',quantity:1,priceMinor:100}]});
  assert.equal(r.status,400,currency);
  assert.equal((await pool.query('SELECT count(*)::int n FROM products WHERE organization_id=$1 AND sku=$2',[a.organization.id,sku])).rows[0].n,0);
 }
 const r=await api('post','/catalog/products',a.token,{name:'Supported',sku:randomUUID(),currency:'NGN',active:true,packages:[{name:'One',quantity:1,priceMinor:100}]});
 assert.equal(r.status,201); assert.equal(r.body.product.currency,'NGN');
});
test('catalog creates durable packages and isolates tenant lists', async () => {
 const r = await api('post','/catalog/products',a.token,{name:'Widget',sku:randomUUID(),active:true,packages:[{name:'Pair',quantity:2,priceMinor:15000}]});
 assert.equal(r.status,201); product=r.body.product;
 assert.equal(product.currency,'NGN'); assert.equal(product.packages[0].priceMinor,15000);
 assert.ok((await api('get','/catalog/products',a.token)).body.products.some((p:any)=>p.id===product.id));
 assert.ok((await api('get','/catalog/products',b.token)).body.products.every((p:any)=>p.id!==product.id));
 assert.equal((await api('get','/catalog/products')).status,401);
});
test('limiter bounds memory without evicting active limits and recovers after expiry', () => {
 let now=0; const limiter=new IntakeRateLimiter(1000,()=>now,2);
 assert.equal(limiter.consume('one',1),0); assert.equal(limiter.consume('two',2),0);
 assert.equal(limiter.consume('three',1),1,'Capacity exhaustion must fail closed');
 assert.equal(limiter.consume('one',1),1,'Do not evict active buckets to admit new keys');
 assert.equal(limiter.consume('two',2),0); assert.equal(limiter.consume('two',2),1);
 now=1000;
 assert.equal(limiter.consume('three',1),0); assert.equal(limiter.consume('one',1),0);
 assert.equal(limiter.consume('three',1),1);
});
test('public intake limits unique-key writes despite spoofed forwarding headers', async () => {
 const published=await api('get',`/public/forms/${form.slug}`); assert.equal(published.status,200);
 const phone=randomUUID(),body={...input(),customerPhone:phone,packageId:published.body.products[0].packages[0].id};
 let accepted=0,limited:any;
 for(let i=0;i<61;i++) {
  const r=await request(app).post(`/api/public/forms/${form.slug}/orders`).set('Idempotency-Key',randomUUID()).set('X-Forwarded-For',`192.0.2.${i+1}`).send(body);
  if(r.status===429){limited=r;break;}
  assert.equal(r.status,201); accepted++;
 }
 assert.ok(limited,'Expected public rate limit before 61 new orders');
 assert.ok(Number(limited.headers['retry-after'])>0);
 assert.deepEqual(limited.body,{error:'Too many public submissions. Please retry later.'});
 const again=await api('post',`/public/forms/${form.slug}/orders`,undefined,body,randomUUID()); assert.equal(again.status,429);
 assert.equal((await pool.query("SELECT count(*)::int n FROM orders WHERE organization_id=$1 AND intake->>'customerPhone'=$2",[a.organization.id,phone])).rows[0].n,accepted);
 assert.equal((await api('get',`/public/forms/${form.slug}`)).status,200);
 assert.equal((await api('post','/orders',a.token,input(),randomUUID())).status,201);
});
test('form and tenant intake budgets also limit submissions from distinct trusted client IPs', async () => {
 const p=await api('post','/catalog/products',b.token,{name:'Budget test',sku:randomUUID(),active:true,packages:[{name:'One',quantity:1,priceMinor:100}]}); assert.equal(p.status,201);
 const forms=[];
 for(let i=0;i<3;i++){
  const r=await api('post','/order-forms',b.token,{title:'Budget test',slug:`budget-${randomUUID()}`,productIds:[p.body.product.id],published:true}); assert.equal(r.status,201); forms.push(r.body.form);
 }
 const phone=randomUUID(),body={...input(),customerPhone:phone,packageId:p.body.product.packages[0].id};
 const trustProxy=app.get('trust proxy'); let client=0;
 // Explicit test-only proxy trust simulates distinct clients; production stays unchanged.
 app.set('trust proxy','loopback');
 try {
  const submit=(slug:string)=>request(app).post(`/api/public/forms/${slug}/orders`).set('Idempotency-Key',randomUUID()).set('X-Forwarded-For',`2001:db8::${(++client).toString(16)}`).send(body);
  for(let i=0;i<120;i++)assert.equal((await submit(forms[0].slug)).status,201);
  const formLimited=await submit(forms[0].slug); assert.equal(formLimited.status,429); assert.ok(Number(formLimited.headers['retry-after'])>0);
  for(let i=0;i<120;i++)assert.equal((await submit(forms[1].slug)).status,201);
  for(let i=0;i<60;i++)assert.equal((await submit(forms[2].slug)).status,201);
  assert.equal((await submit(forms[2].slug)).status,429);
  assert.equal((await pool.query("SELECT count(*)::int n FROM orders WHERE organization_id=$1 AND intake->>'customerPhone'=$2",[b.organization.id,phone])).rows[0].n,300);
 } finally {app.set('trust proxy',trustProxy);}
});
