// Run against the isolated loopback server. Uses only synthetic fixture credentials.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const { chromium }=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base='http://127.0.0.1:55440';
async function api(path,body,token){const r=await fetch(base+'/api'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();assert.ok(r.ok,JSON.stringify(d));return d;}
const id=randomUUID();
const owner=await api('/auth/register',{email:`browser-${id}@example.invalid`,password:'Synthetic-browser-only-42!',fullName:'Browser Owner',organizationName:'Browser '+id});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
 const staff=await browser.newContext();await staff.addInitScript(token=>localStorage.setItem('bettatraka_token',token),owner.token);
 const page=await staff.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.getByText('No orders yet.',{exact:false}).waitFor();
 await page.getByRole('button',{name:'Products',exact:true}).click();
 for(const [name,value] of [['Product name','Browser widget'],['SKU',id],['Package name','Pair'],['Units per package','2'],['Price in minor units','12500']])await page.getByLabel(name,{exact:false}).fill(value);
 await page.getByRole('button',{name:'Save product',exact:true}).click();await page.getByText('Pair: 2 units',{exact:false}).waitFor();
 await page.getByRole('button',{name:'Embed Form Builder',exact:true}).click();await page.getByLabel('Form title').fill('Browser purchase');await page.getByLabel('Public slug').fill('browser-'+id);await page.getByLabel('Browser widget',{exact:true}).check();
 await page.getByRole('button',{name:'Create form',exact:true}).click();await page.getByRole('link',{name:'/order-form/browser-'+id,exact:true}).waitFor();
 const anon=await browser.newContext();const publicPage=await anon.newPage();publicPage.on('pageerror',e=>errors.push(e.message));await publicPage.goto(base+'/order-form/browser-'+id);
 await publicPage.getByLabel('Customer name',{exact:true}).fill('Browser Buyer');assert.equal(await publicPage.locator('nav,header').count(),0);
 for(const [name,value] of [['Phone','0805550000'],['Delivery address','Synthetic Road'],['City','Lagos'],['State','Lagos'],['Number of packages','3']])await publicPage.getByLabel(name,{exact:true}).fill(value);
 await publicPage.getByRole('radio',{name:/Pair/}).check();
 // A lost response must not claim success; reload restores the pending details and key.
 let once=true;await publicPage.route('**/api/public/forms/*/orders',async route=>{if(once){once=false;await route.abort()}else await route.continue()});
 await publicPage.getByRole('button',{name:'Submit order',exact:true}).click();await publicPage.getByRole('alert').filter({hasText:'Nothing is confirmed'}).waitFor();
 assert.equal(await publicPage.getByText('Order received',{exact:true}).count(),0);
 await publicPage.reload();await publicPage.getByLabel('Customer name',{exact:true}).waitFor();assert.equal(await publicPage.getByLabel('Customer name',{exact:true}).inputValue(),'Browser Buyer');
 await publicPage.getByRole('button',{name:'Submit order',exact:true}).click();await publicPage.getByText('Order received',{exact:true}).waitFor();
 const records=await api('/orders',undefined,owner.token);assert.equal(records.orders.length,1);assert.equal(records.orders[0].totalMinor,37500);
 await page.getByRole('button',{name:'Orders',exact:true}).click();await page.getByRole('button',{name:'Refresh',exact:true}).click();await page.getByRole('button',{name:`View order ${records.orders[0].orderNumber}`,exact:true}).click();await page.getByRole('heading',{name:'Browser Buyer',exact:true}).waitFor();
 await page.locator('select[name=status]').selectOption('CONFIRMED');await page.getByRole('button',{name:'Save order',exact:true}).click();await page.getByText('CONFIRMED',{exact:false}).first().waitFor();await page.reload();await page.getByRole('button',{name:`View order ${records.orders[0].orderNumber}`,exact:true}).click();await page.getByRole('heading',{name:'Browser Buyer',exact:true}).waitFor();assert.equal(await page.locator('select[name=status]').inputValue(),'CONFIRMED');
 await page.getByRole('button',{name:'New order',exact:true}).click();
 for(const [name,value] of [['Customer name','Manual Buyer'],['Phone','0805550001'],['Delivery address','Manual Road'],['City','Lagos'],['State','Lagos']])await page.getByLabel(name,{exact:true}).fill(value);
 await page.locator('select[name=packageId]').selectOption({index:1});await page.getByRole('button',{name:'Submit order',exact:true}).click();await page.getByText('Order received',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Finance & Accounting',exact:true}).click();await page.getByText('Not available in this milestone',{exact:true}).waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS browser: empty tenant → product/package → published form → anonymous failed/retried intake → one server-priced order → staff refresh/update/reload → finance gated; no JS errors.');
 await page.screenshot({path:'/root/.hermes/cache/scratch/shared-orders-staff.png',fullPage:true});
 await publicPage.screenshot({path:'/root/.hermes/cache/scratch/shared-orders-public.png',fullPage:true});
}finally {await browser.close();}
