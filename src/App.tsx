import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import {WorkspaceUIProvider,useWorkspaceUI} from './context/WorkspaceUIContext';
import {MarketingSite} from './components/marketing/MarketingSite';
import { AuthModal } from './components/auth/AuthModal';
import {TopBar} from './components/layout/TopBar';
import {AdminSidebar} from './components/layout/AdminSidebar';
import {UnauthorizedAccessGate} from './components/auth/UnauthorizedAccessGate';
import { PublicIntake, SharedWorkspace } from './shared-orders/Views';
function PrivateApp(){
 const auth=useAuth();const {themeMode,adminActiveTab}=useWorkspaceUI();
 if(auth.isLoading)return <main className="min-h-screen flex items-center justify-center bg-black text-white"><div className="text-center space-y-4"><div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"/><p className="text-xs font-semibold tracking-wide text-slate-400">Loading BettaTraka Workspace...</p></div></main>;
 return <div className={`h-dvh flex flex-col ${themeMode==='light'?'bg-slate-50 text-slate-900':'bg-black text-white'}`}><TopBar/>
 {adminActiveTab==='marketing'?<main className="flex-1 overflow-y-auto"><MarketingSite/></main>:auth.isAuthenticated?<div className="flex flex-1 min-h-0 overflow-hidden"><AdminSidebar/><main className="flex-1 min-w-0 overflow-y-auto"><SharedWorkspace key={auth.activeOrganization?.id + ':' + auth.user?.id + ':' + auth.role}/></main></div>:<main className="flex-1 overflow-y-auto"><UnauthorizedAccessGate onSignIn={()=>{auth.setAuthModalMode('login');auth.setShowLoginModal(true)}} onCreateWorkspace={()=>{auth.setAuthModalMode('register');auth.setShowLoginModal(true)}} backendStatus={auth.backendStatus}/></main>}<AuthModal/></div>;
}
export default function App(){
 const publicSlug=window.location.pathname.match(/^\/order-form\/([^/]+)\/?$/)?.[1];
 if(publicSlug)return <PublicIntake slug={publicSlug} />;
 return <AuthProvider><WorkspaceUIProvider><PrivateApp /></WorkspaceUIProvider></AuthProvider>;
}
