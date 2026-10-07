import React, {useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {useWorkspaceUI} from '../../context/WorkspaceUIContext';
import {WorkspaceSelector} from './WorkspaceSelector';
import {Menu, PanelLeftClose, PanelLeftOpen, Sun, Moon, ChevronDown, Globe, ShieldCheck, ExternalLink, LogOut, LogIn} from 'lucide-react';

export const TopBar: React.FC = () => {
 const {adminActiveTab,setAdminActiveTab,themeMode,setThemeMode,toggleThemeMode,toggleMobileSidebar,isSidebarCollapsed,toggleSidebarCollapse}=useWorkspaceUI();
 const {isAuthenticated,user,role,activeOrganization,logout,setShowLoginModal,setAuthModalMode}=useAuth();
 const [showUserMenu,setShowUserMenu]=useState(false);
 const isLight=themeMode==='light';
 const effectiveName=user?.fullName??'Guest',effectiveEmail=user?.email??'',effectiveRole=role??'Public',effectiveOrgName=activeOrganization?.name??'Sign in to your workspace';
  return (
    <header className={`sticky top-0 z-40 w-full h-14 backdrop-blur border-b flex items-center justify-between px-2 sm:px-4 lg:px-6 gap-1.5 sm:gap-2 transition-colors ${
      isLight ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xs' : 'bg-black/95 border-neutral-800 text-white'
    }`}>
      {/* Zone 1: Mobile Hamburger, Desktop Collapse & Wordmark */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {isAuthenticated && (
          <>
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={toggleMobileSidebar}
              className={`md:hidden p-1.5 rounded-lg transition cursor-pointer ${
                isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-neutral-900'
              }`}
              title="Open Navigation Menu"
              aria-label="Toggle Mobile Navigation"
            >
              <Menu className={`w-5 h-5 ${isLight ? 'text-lime-700' : 'text-lime-400'}`} />
            </button>

            {/* Desktop Sidebar Collapse / Expand Toggle Button */}
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className={`hidden md:flex p-1.5 rounded-lg transition items-center justify-center cursor-pointer ${
                isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-neutral-900'
              }`}
              title={isSidebarCollapsed ? "Expand Sidebar (Ctrl/Cmd + B)" : "Collapse Sidebar (Ctrl/Cmd + B)"}
              aria-label="Toggle Desktop Navigation Collapse"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className={`w-4 h-4 ${isLight ? 'text-lime-700' : 'text-lime-400'}`} />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </>
        )}
        <a 
          href="#dashboard"
          onClick={(e) => { e.preventDefault(); setAdminActiveTab('dashboard'); }}
          className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold tracking-tight group"
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm shadow-sm transition flex-shrink-0 ${
            isLight ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-emerald-600 text-white group-hover:bg-emerald-500'
          }`}>
            B
          </div>
          <span className={`font-semibold tracking-tight hidden xs:inline sm:inline ${
            isLight ? 'text-slate-900' : 'text-slate-100'
          }`}>BettaTraka</span>
          <span className={`text-[10px] tracking-wider uppercase font-mono font-semibold px-1.5 py-0.5 rounded hidden xl:inline-block border ${
            isLight ? 'bg-lime-100 text-lime-800 border-lime-300' : 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60'
          }`}>
            POD CRM
          </span>
        </a>
      </div>

      <nav aria-label="Workspace views" className={`hidden lg:flex items-center p-0.5 rounded-lg border overflow-x-auto scrollbar-none min-w-0 ${isLight?'bg-slate-100 border-slate-200':'bg-black/80 border-neutral-800'}`}>
        {[{id:'orders',label:role==='Sales Representative'?'Sales Rep':role==='Manager'?'Manager':'Workspace',icon:ShieldCheck},{id:'marketing',label:'Marketing',icon:Globe},{id:'public-form',label:'Order Form',icon:ExternalLink}].map(({id,label,icon:Icon})=><button key={id} onClick={()=>setAdminActiveTab(id)} className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${adminActiveTab===id?'bg-emerald-600 text-white shadow-sm':'text-slate-400 hover:text-slate-200'}`}><Icon className="w-3.5 h-3.5"/>{label}</button>)}
      </nav>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        {isAuthenticated&&<WorkspaceSelector/>}
        {/* Mobile Single-Tap Theme Toggle */}
        <button
          type="button"
          onClick={toggleThemeMode}
          className={`sm:hidden p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              : 'bg-neutral-900 border-neutral-800 text-lime-400 hover:bg-neutral-800'
          }`}
          title={isLight ? "Switch to Night Mode" : "Switch to Day Mode"}
          aria-label="Toggle Night/Day Mode"
        >
          {isLight ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-lime-400" />}
        </button>

        {/* Desktop Night / Day Mode Settings Switcher */}
        <div 
          className={`hidden sm:flex items-center p-0.5 rounded-lg border transition ${
            isLight 
              ? 'bg-slate-100 border-slate-200 shadow-inner' 
              : 'bg-neutral-900/90 border-neutral-800'
          }`} 
          title="Night & Day Appearance Settings"
        >
          <button
            onClick={() => setThemeMode('light')}
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded text-xs font-medium transition cursor-pointer ${
              themeMode === 'light'
                ? 'bg-lime-500 text-black font-extrabold shadow-xs border border-lime-600'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Switch to Day Mode (Clean White + Lemon Green Setting)"
            aria-label="Day Mode"
          >
            <Sun className={`w-3.5 h-3.5 flex-shrink-0 ${themeMode === 'light' ? 'text-amber-900' : 'text-slate-400'}`} />
            <span className="hidden sm:inline text-[11px]">Day</span>
          </button>
          <button
            onClick={() => setThemeMode('dark')}
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded text-xs font-medium transition cursor-pointer ${
              themeMode === 'dark'
                ? 'bg-lime-500 text-black font-extrabold shadow-sm shadow-lime-950/40'
                : (isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200')
            }`}
            title="Switch to Night Mode (Pure Pitch Black + Lemon Green Setting)"
            aria-label="Night Mode"
          >
            <Moon className={`w-3.5 h-3.5 flex-shrink-0 ${themeMode === 'dark' ? 'text-black' : (isLight ? 'text-slate-600' : 'text-slate-400')}`} />
            <span className="hidden sm:inline text-[11px]">Night</span>
          </button>
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            aria-label="User menu" onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg border transition cursor-pointer ${
              isLight 
                ? 'border-slate-200 bg-slate-100 hover:bg-slate-200/80 text-slate-900 shadow-xs' 
                : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-200'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isLight ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-emerald-600 text-white'
            }`}>
              {effectiveName.charAt(0)}
            </div>
            <div className="text-left hidden lg:block">
              <p className={`text-xs font-semibold leading-none truncate max-w-[110px] ${
                isLight ? 'text-slate-900' : 'text-slate-200'
              }`}>
                {effectiveName}
              </p>
              <p className={`text-[10px] leading-tight mt-0.5 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {effectiveRole}
              </p>
            </div>
            <ChevronDown className={`w-3 h-3 hidden lg:block ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`} />
          </button>

          {showUserMenu && (
            <div className={`absolute right-0 mt-2 w-72 rounded-xl border shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 ${
              isLight ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50' : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              <div className={`pb-2.5 border-b text-xs ${
                isLight ? 'border-slate-100' : 'border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <p className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{effectiveName}</p>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                    effectiveRole === 'Owner' || effectiveRole === 'Admin'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {effectiveRole}
                  </span>
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{effectiveEmail}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className={`text-[11px] font-medium truncate ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {effectiveOrgName}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-1">
                <button className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-800" onClick={()=>{setAdminActiveTab('marketing');setShowUserMenu(false)}}>Marketing</button>
                <button className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-800" onClick={()=>{setAdminActiveTab('public-form');setShowUserMenu(false)}}>Order Form</button>
                <button className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-rose-400" onClick={async()=>{setShowUserMenu(false);if(isAuthenticated)await logout();else{setAuthModalMode('login');setShowLoginModal(true)}}}>{isAuthenticated?<LogOut className="w-3.5 h-3.5"/>:<LogIn className="w-3.5 h-3.5"/>}{isAuthenticated?'Sign Out':'Sign In'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
