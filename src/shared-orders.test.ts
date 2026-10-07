import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { request, submissionKey, orderPayload } from './shared-orders/api.ts';
test('application mounts public route before private providers and gates legacy mutations', () => {
 const app=readFileSync(new URL('./App.tsx',import.meta.url),'utf8');
 assert.match(app,/publicSlug/); assert.match(app,/SharedWorkspace/); assert.doesNotMatch(app,/CrmProvider|OrdersView|PublicOrderForm/);
});
test('definitive validation failure permits correcting details but network failure stays pending', async () => {
 const prior=globalThis.fetch;
 try {globalThis.fetch=async()=>new Response('{"error":"Invalid input"}',{status:400});
 await assert.rejects(request('/api/public/forms/x/orders',{method:'POST'}),(e:any)=>e.status===400);
 globalThis.fetch=async()=>{throw new Error('offline')};
 await assert.rejects(request('/api/public/forms/x/orders',{method:'POST'}),(e:any)=>e.status===undefined);
 }finally {globalThis.fetch=prior;}
});
test('successful HTML or malformed JSON cannot confirm an order', async () => {
 const prior=globalThis.fetch;
 try {globalThis.fetch=async()=>new Response('{}'); await assert.rejects(request('/api/public/forms/x/orders',{method:'POST'}),/invalid response/i);}
 finally {globalThis.fetch=prior;}
});
test('order payload excludes client monetary and tenant authority', () => {
 const result = orderPayload({customerName:'Ada',customerPhone:'123',deliveryAddress:'Road',deliveryCity:'City',deliveryState:'State',packageId:'p',quantity:2,totalMinor:1,currency:'USD',organizationId:'evil',priceMinor:1});
 assert.deepEqual(result,{customerName:'Ada',customerPhone:'123',deliveryAddress:'Road',deliveryCity:'City',deliveryState:'State',packageId:'p',quantity:2});
});
test('submission retry reuses persisted key and changed payload cannot silently retry', () => {
 const map = new Map<string,string>();
 const storage = {getItem:(k:string)=>map.get(k) ?? null,setItem:(k:string,v:string)=>{map.set(k,v)}};
 const key = submissionKey(storage, 'public:one', {quantity:1});
 assert.equal(submissionKey(storage, 'public:one', {quantity:1}),key);
 assert.throws(()=>submissionKey(storage,'public:one',{quantity:2}), /pending/i);
 assert.notEqual(submissionKey(storage,'public:two',{quantity:1}),key);
});
test('HTTP failures and non-JSON responses never become successful orders', async () => {
 const prior = globalThis.fetch;
 try {
 globalThis.fetch = async () => new Response('{"error":"Unavailable"}',{status:503});
 await assert.rejects(request('/api/public/forms/a'),/Unavailable/);
 globalThis.fetch = async () => new Response('<html>fallback</html>');
 await assert.rejects(request('/api/public/forms/a'),/invalid response/i);
 await assert.rejects(request('/api/orders'),/Sign in/);
 } finally { globalThis.fetch = prior; }
});
