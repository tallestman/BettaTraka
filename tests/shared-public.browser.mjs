// Public visual/receipt contract; synthetic route fixtures, no database writes.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/**',async route=>{
  assert.ok(new URL(route.request().url()).pathname.startsWith('/api/public/'));
  assert.equal(route.request().headers().authorization,undefined);
  await route.fulfill({json:route.request().method()==='POST'?{order:{id:'receipt',orderNumber:'BT-RECEIPT',totalMinor:500,currency:'NGN'}}:{form:{title:'Synthetic product order'},products:[{id:'product',name:'Synthetic product',active:true,currency:'NGN',packages:[{id:'pack',name:'Single pack',quantity:1,priceMinor:500}]}]}});
 });
 await page.goto('http://127.0.0.1:55440/order-form/synthetic');
 await page.getByText('Step 1: Select Your Package Bundle',{exact:true}).waitFor();
 await page.getByRole('radio',{name:/Single pack/}).check();
 for(const [label,value] of [['Customer name','Synthetic Buyer'],['Phone','12345'],['Delivery address','Road'],['City','City'],['State','State']])await page.getByLabel(label,{exact:true}).fill(value);
 assert.equal(await page.locator('nav,header').count(),0);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'/root/.hermes/cache/scratch/bettatraka-public-form-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Submit order',exact:true}).click();await page.getByText('Order received',{exact:true}).waitFor();
 const receipt=await page.getByRole('status').innerText();assert.match(receipt,/BT-RECEIPT/);assert.doesNotMatch(receipt,/undefined|NEW|CONFIRMED|Assigned|Notes/);
 await page.screenshot({path:'/root/.hermes/cache/scratch/bettatraka-public-receipt.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS public: original package-card/step layout, mobile width, no private auth request, allowlisted receipt-only success.');
}finally{await browser.close()}
