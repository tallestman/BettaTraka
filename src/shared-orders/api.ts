export async function request(path: string, options: RequestInit = {}, token?: string) {
 const isPublic = path.startsWith('/api/public/');
 if (!isPublic && !token) throw new Error('Sign in to access shared records.');
 let response: Response;
 try { response = await fetch(path, {...options, credentials: 'omit', headers: {'Content-Type':'application/json', ...(!isPublic ? {Authorization: `Bearer ${token}`} : {}), ...options.headers}, signal: options.signal ?? AbortSignal.timeout(20000)}); }
 catch { throw new Error('Backend unavailable. Nothing is confirmed. Retry the same submission.'); }
 let data: any;
 try { data = await response.json(); } catch { throw new Error('Backend returned an invalid response. Nothing is confirmed.'); }
 if (!response.ok) throw Object.assign(new Error(typeof data?.error === 'string' ? data.error : `Request failed (${response.status}).`), {status:response.status});
 if (/\/orders(?:\/[^/]+)?$/.test(path) && options.method && options.method !== 'GET' && (!data?.order?.id || !Number.isSafeInteger(data.order.totalMinor))) throw new Error('Backend returned an invalid response. Nothing is confirmed.');
 return data;
}
export function submissionKey(storage: Pick<Storage,'getItem'|'setItem'>, scope: string, payload: unknown) {
 const name = `bettatraka:pending:${scope}`;
 const fingerprint = JSON.stringify(payload);
 const prior = storage.getItem(name);
 if (prior) {
  const saved = JSON.parse(prior);
  if (saved.fingerprint !== fingerprint) throw new Error('A pending submission has different details. Restore its details and retry before starting another order.');
  return saved.key as string;
 }
 const key = crypto.randomUUID();
 storage.setItem(name, JSON.stringify({key,fingerprint}));
 return key;
}
export type Package = { id: string; name: string; quantity: number; priceMinor: number };
export type Product = { id: string; name: string; sku: string; currency: string; active: boolean; packages: Package[] };
export type Order = { id: string; orderNumber: string; customerName: string; customerPhone: string; alternatePhone?: string; customerEmail?: string; deliveryAddress: string; deliveryCity: string; deliveryState: string; notes?: string; currency: string; totalMinor: number; status: 'NEW' | 'CONFIRMED' | 'SCHEDULED'; assignedUserId: string | null; createdAt: string; scheduledDate: string | null; items: {productId: string; productName: string; packageId: string; packageName: string; packageQuantity: number; quantity: number; priceMinor: number; lineTotalMinor: number}[] };
export type Member = {user_id: string; full_name: string; email: string; role: string; status: string};
export function orderPayload(input: Record<string, unknown>) {
 const keys = ['customerName','customerPhone','alternatePhone','customerEmail','deliveryAddress','deliveryCity','deliveryState','packageId','quantity','notes','utm','assignedUserId'];
 return Object.fromEntries(keys.filter(k => input[k] !== undefined && input[k] !== '').map(k => [k,input[k]]));
}
