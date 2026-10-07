import React, {useState} from 'react';
import {useAuth} from '../../context/AuthContext';

export function WorkspaceSelector() {
 const {activeOrganization,organizations,switchOrganization}=useAuth();
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const options=organizations.length?organizations:activeOrganization?[activeOrganization]:[];
 return <div className="min-w-0"><label className="sr-only" htmlFor="workspace-selector">Workspace</label><select id="workspace-selector" value={activeOrganization?.id??''} disabled={busy} onChange={async e=>{setBusy(true);setError('');try{if(!await switchOrganization(e.target.value))setError('Could not switch workspace. Please retry.')}catch{setError('Could not switch workspace. Please retry.')}finally{setBusy(false)}}} className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-white max-w-[170px] sm:max-w-[220px]">{options.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>{busy&&<span role="status" className="sr-only">Switching workspace…</span>}{error&&<p role="alert" className="absolute right-2 top-14 p-3 rounded-xl bg-slate-900 border border-rose-500 text-xs text-rose-400">{error}</p>}</div>;
}
