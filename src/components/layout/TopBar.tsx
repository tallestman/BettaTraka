import React, { useState } from 'react';
import { useCrm, ActivePersona } from '../../context/CrmContext';
import { CurrencyCode } from '../../types/crm';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { 
  Bell, 
  Globe, 
  ShieldCheck, 
  UserCheck, 
  Package, 
  ExternalLink, 
  Sparkles,
  Check,
  ChevronDown,
  Sun,
  Moon,
  Menu
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const { 
    persona, 
    setPersona, 
    currency, 
    setCurrency, 
    notifications, 
    markAllNotificationsAsRead, 
    currentUser,
    users,
    setCurrentUser,
    settings,
    setAdminActiveTab,
    themeMode,
    toggleThemeMode,
    setThemeMode,
    toggleMobileSidebar
  } = useCrm();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handlePersonaChange = (newPersona: ActivePersona) => {
    setPersona(newPersona);
    if (newPersona === 'rep') {
      const rep = users.find(u => u.role === 'Sales Representative') || users[1];
      setCurrentUser(rep);
    } else if (newPersona === 'inventory') {
      const inv = users.find(u => u.role === 'Inventory Manager') || users[5];
      setCurrentUser(inv);
    } else if (newPersona === 'admin') {
      const owner = users.find(u => u.role === 'Owner') || users[0];
      setCurrentUser(owner);
    }
  };

  const currencyOptions: { code: CurrencyCode; label: string }[] = [
    { code: 'NGN', label: '₦ NGN' },
    { code: 'GHS', label: 'GH₵ GHS' },
    { code: 'KES', label: 'KSh KES' },
    { code: 'ZAR', label: 'R ZAR' },
    { code: 'AED', label: 'AED' },
    { code: 'USD', label: '$ USD' },
    { code: 'GBP', label: '£ GBP' },
    { code: 'EUR', label: '€ EUR' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-slate-900/95 backdrop-blur border-b border-slate-800 flex items-center justify-between px-2.5 sm:px-4 lg:px-6 gap-2">
      {/* Zone 1: Mobile Hamburger & Wordmark */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {persona === 'admin' && (
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Open 32-Page Admin Menu"
            aria-label="Toggle Mobile Navigation"
          >
            <Menu className="w-5 h-5 text-emerald-400" />
          </button>
        )}
        <a 
          href="#dashboard"
          onClick={(e) => { e.preventDefault(); setPersona('admin'); setAdminActiveTab('dashboard'); }}
          className="flex items-center gap-2 text-sm sm:text-base font-bold tracking-tight text-white group"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:bg-emerald-500 transition flex-shrink-0">
            B
          </div>
          <span className="font-semibold text-slate-100 tracking-tight hidden xs:inline sm:inline">BettaTraka</span>
          <span className="text-[10px] tracking-wider uppercase font-mono text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 hidden lg:inline-block">
            POD CRM
          </span>
        </a>
      </div>

      {/* Zone 2: Fast Persona / Interactive Tour Switcher */}
      <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 overflow-x-auto scrollbar-none max-w-[42vw] xs:max-w-[48vw] sm:max-w-none">
        <button
          onClick={() => handlePersonaChange('admin')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            persona === 'admin' 
              ? 'bg-emerald-600 text-white shadow-sm font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Admin Operational Hub (32 Pages)"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Admin View</span>
          <span className="md:hidden">Admin</span>
        </button>

        <button
          onClick={() => handlePersonaChange('rep')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            persona === 'rep' 
              ? 'bg-emerald-600 text-white shadow-sm font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Sales Rep Dashboard (11 Pages)"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Sales Rep</span>
          <span className="md:hidden">Rep</span>
        </button>

        <button
          onClick={() => handlePersonaChange('inventory')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            persona === 'inventory' 
              ? 'bg-emerald-600 text-white shadow-sm font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Inventory Manager View (6 Pages)"
        >
          <Package className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Inventory Mgr</span>
          <span className="lg:hidden">Stock</span>
        </button>

        <button
          onClick={() => handlePersonaChange('public_form')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            persona === 'public_form' 
              ? 'bg-emerald-600 text-white shadow-sm font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Public Customer Checkout Page"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Order Form</span>
          <span className="md:hidden">Form</span>
        </button>

        <button
          onClick={() => handlePersonaChange('marketing')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            persona === 'marketing' 
              ? 'bg-emerald-600 text-white shadow-sm font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Public Marketing Site & Pricing"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Marketing</span>
          <span className="md:hidden">Site</span>
        </button>
      </div>

      {/* Zone 3: Currency, Night/Day Mode, PWA Install, Notifications & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Night / Day Mode Settings Switcher */}
        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800" title="Night & Day Appearance Settings">
          <button
            onClick={() => setThemeMode('light')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${
              themeMode === 'light'
                ? 'bg-amber-500/20 text-amber-500 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Switch to Day Mode (Clean Light Setting)"
            aria-label="Day Mode"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline text-[11px]">Day</span>
          </button>
          <button
            onClick={() => setThemeMode('dark')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${
              themeMode === 'dark'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Switch to Night Mode (Refined Dark Setting)"
            aria-label="Night Mode"
          >
            <Moon className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline text-[11px]">Night</span>
          </button>
        </div>

        {/* Currency Switcher */}
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 appearance-none pr-6 font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {currencyOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
        </div>

        {/* PWA Install Button */}
        <div className="hidden sm:block">
          <PWAInstallButton compact />
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded font-mono text-[10px]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-slate-500">No new notifications</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div 
                      key={n.id} 
                      className={`py-2.5 px-2 hover:bg-slate-800/40 rounded transition ${!n.isRead ? 'bg-slate-800/20' : ''}`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-medium text-slate-200">{n.title}</span>
                        <span>{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-slate-300 leading-normal text-[11px]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800 transition"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-medium text-slate-200 leading-none truncate max-w-[110px]">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                {currentUser.role}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-3 z-50">
              <div className="pb-2.5 border-b border-slate-800 text-xs">
                <p className="font-semibold text-white">{currentUser.name}</p>
                <p className="text-slate-400 text-[11px]">{currentUser.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-300">{settings.name}</span>
                </div>
              </div>

              <div className="pt-2 text-xs">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 py-1">
                  Switch Active Role Persona
                </p>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      if (u.role === 'Sales Representative') setPersona('rep');
                      else if (u.role === 'Inventory Manager') setPersona('inventory');
                      else setPersona('admin');
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left hover:bg-slate-800 transition ${
                      currentUser.id === u.id ? 'text-emerald-400 font-medium bg-slate-800/50' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="text-xs">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.role}</p>
                    </div>
                    {currentUser.id === u.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
