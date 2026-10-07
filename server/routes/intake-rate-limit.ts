import type { Request, Response, NextFunction } from 'express';

// Single-process pilot protection. No forwarded headers are read directly.
export class IntakeRateLimiter {
 private readonly buckets = new Map<string, { count:number; expiresAt:number }>();
 constructor(private readonly windowMs=600_000, private readonly now=Date.now, private readonly capacity=10_000) {}
 consume(key:string, limit:number):number {
  const now=this.now();
  // Only expired buckets may be removed: evicting active ones enables bypass.
  for(const [storedKey,bucket] of this.buckets) if(bucket.expiresAt<=now)this.buckets.delete(storedKey);
  let bucket=this.buckets.get(key);
  if(!bucket){
   if(this.buckets.size>=this.capacity)return Math.max(1,Math.ceil(this.windowMs/1000));
   bucket={count:0,expiresAt:now+this.windowMs};this.buckets.set(key,bucket);
  }
  if(bucket.count>=limit)return Math.max(1,Math.ceil((bucket.expiresAt-now)/1000));
  bucket.count++;
  return 0;
 }
}
const intakeLimiter=new IntakeRateLimiter();
function limited(res:Response,retryAfter:number):boolean {
 if(!retryAfter)return false;
 res.set('Retry-After',String(retryAfter)).status(429).json({error:'Too many public submissions. Please retry later.'});
 return true;
}
export function publicIntakeScopeLimit(res:Response,formId:string,organizationId:string):boolean {
 // Resolved server IDs only; random unpublished slugs cannot fill these buckets.
 return limited(res,intakeLimiter.consume('form:'+formId,120)) || limited(res,intakeLimiter.consume('tenant:'+organizationId,300));
}
export function publicIntakeIpLimit(req:Request,res:Response,next:NextFunction){
 const retryAfter=intakeLimiter.consume('ip:'+(req.ip || req.socket.remoteAddress || 'unknown'),60);
 if(limited(res,retryAfter))return;
 next();
}
