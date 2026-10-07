// Frontend contract tests: isolated browser routes, synthetic data, no database writes.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:55440';
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addInitScript(()=>localStorage.setItem('bettatraka_token','synthetic-shell-token'));
 let active='one'; let failSwitch=false; const calls=[];
 const organizations=[{id:'one',name:'First workspace',role:'Owner'},{id:'two',name:'Second workspace',role:'Sales Representative'}];
 const order={id:'order-one',orderNumber:'BT-ONE',customerName:'Assigned Buyer',customerPhone:'123',deliveryAddress:'Road',deliveryCity:'City',deliveryState:'State',createdAt:'2026-01-01',status:'NEW',notes:'',currency:'NGN',totalMinor:500,assignedUserId:'self',scheduledDate:null,items:[]};
 await context.route('**/api/**',async route=>{
  const path=new URL(route.request().url()).pathname; calls.push(path);
  let data={}; let status=200;
  if(path==='/api/health') data={database:{connected:true}};
  else if(path==='/api/auth/me') data={user:{id:'self',fullName:'Synthetic Staff',email:'shell@example.invalid'},activeMembership:{organizationId:active,organizationName:organizations.find(o=>o.id===active).name,role:organizations.find(o=>o.id===active).role},organizations};
  else if(path==='/api/auth/switch-org'){if(failSwitch){status=503;data={error:'Unavailable'}}else{active=route.request().postDataJSON().organizationId;data={token:'synthetic-switched-token'}}}
  else if(path==='/api/orders') data={orders:active==='one'?[order]:[]};
  else if(path==='/api/catalog/products') data={products:[]};
  else if(path==='/api/order-forms') data={forms:[]};
  else if(path==='/api/organizations/members') data={members:[{user_id:'self',full_name:'Synthetic Staff',role:'Owner',status:'ACTIVE'}]};
  else {status=404;data={error:'Not in frontend fixture'}}
  await route.fulfill({status,json:data});
 });
 const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.getByText('Assigned Buyer',{exact:true}).first().waitFor();
 await page.getByRole('table',{name:'Orders'}).waitFor();
 await page.getByLabel('Search orders').fill('not-present');await page.getByText('No orders match your filter criteria.',{exact:true}).waitFor();await page.getByLabel('Search orders').fill('');
 await page.getByRole('button',{name:'View order BT-ONE',exact:true}).click();
 await page.getByRole('button',{name:'Collapse Navigation',exact:true}).waitFor();
 assert.equal(await page.locator('header').evaluate(e=>Math.round(e.getBoundingClientRect().height)),56);
 await page.getByRole('button',{name:'Day Mode',exact:true}).click(); assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('light')),true);
 await page.reload();await page.getByRole('button',{name:'Day Mode',exact:true}).waitFor();assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('light')),true);
 await page.getByRole('button',{name:'Finance & Accounting',exact:true}).click();await page.getByText('Not available in this milestone',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Marketing',exact:true}).click();await page.getByRole('heading',{name:/Every naira tracked/}).waitFor();
 await page.getByRole('button',{name:'Open your workspace',exact:true}).click();await page.getByRole('table',{name:'Orders'}).waitFor();
 await page.getByRole('button',{name:'Orders',exact:true}).click();await page.getByRole('button',{name:'View order BT-ONE',exact:true}).click();await page.getByLabel('Assigned staff',{exact:false}).waitFor();
 failSwitch=true;await page.getByLabel('Workspace', {exact:true}).selectOption('two');await page.getByRole('alert').filter({hasText:'Could not switch workspace'}).waitFor();assert.equal(await page.getByLabel('Workspace',{exact:true}).inputValue(),'one');
 failSwitch=false;await page.getByLabel('Workspace',{exact:true}).selectOption('two');await page.getByText('No orders yet.',{exact:false}).waitFor();assert.equal(await page.getByText('Assigned Buyer',{exact:true}).count(),0);assert.equal(await page.getByLabel('Assigned staff',{exact:false}).count(),0);
 assert.equal(await page.getByRole('button',{name:'Products',exact:true}).count(),0);
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Toggle Mobile Navigation',exact:true}).click();await page.getByRole('button',{name:'New order',exact:true}).click();await page.getByRole('heading',{name:'New order',exact:true}).waitFor();assert.equal(await page.getByLabel('Assigned staff',{exact:false}).count(),0);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'/root/.hermes/cache/scratch/bettatraka-shell-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Toggle Mobile Navigation',exact:true}).click();await page.getByRole('button',{name:'Orders',exact:true}).last().click();await page.getByText('No orders yet.',{exact:false}).waitFor();
 const guest=await browser.newContext({viewport:{width:1440,height:1000}});const guestPage=await guest.newPage();guestPage.on('pageerror',e=>errors.push(e.message));
 const guestCalls=[];await guest.route('**/api/**',async route=>{const path=new URL(route.request().url()).pathname;guestCalls.push(path);await route.fulfill({status:path==='/api/health'?200:401,json:path==='/api/health'?{database:{connected:true}}:{error:'Sign in required'}})});
 await guestPage.goto(base);await guestPage.getByRole('button',{name:'Marketing',exact:true}).click();await guestPage.getByRole('heading',{name:/Every naira tracked/}).waitFor();
 await guestPage.getByRole('button',{name:'Start 14-Day Free Trial',exact:true}).first().click();await guestPage.getByRole('heading',{name:'Create Merchant Workspace',exact:true}).waitFor();
 assert.equal(await guestPage.evaluate(()=>localStorage.getItem('bettatraka_token')),null);assert.equal(await guestPage.getByRole('table',{name:'Orders'}).count(),0);
 await guestPage.getByRole('button',{name:'Close',exact:true}).click();await guestPage.getByRole('button',{name:'Open your workspace',exact:true}).click();await guestPage.getByRole('heading',{name:'Sign In to BettaTraka',exact:true}).waitFor();
 assert.ok(guestCalls.every(path=>path==='/api/health'||path==='/api/auth/me'));await guest.close();
 assert.deepEqual(errors,[]);console.log('PASS shell: original sidebar/header, theme persistence, safe deferred navigation, failed/successful workspace switch, representative permissions, mobile routing, original marketing with real auth entry and no demo authority.');
} finally {await browser.close()}
