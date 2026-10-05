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
  Menu,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Coins,
  Truck,
  Megaphone,
  Briefcase,
  Building2
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const { 
    persona, 
    setPersona, 
    logout,
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
    toggleMobileSidebar,
    isSidebarCollapsed,
    toggleSidebarCollapse
  } = useCrm();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isLight = themeMode === 'light';

  const handlePersonaChange = (newPersona: ActivePersona) => {
    setPersona(newPersona);
    if (newPersona === 'rep') {
      const rep = users.find(u => u.role === 'Sales Representative') || users[1];
      setCurrentUser(rep);
    } else if (newPersona === 'distributor') {
      const dist = users.find(u => u.role === 'Distributor') || users.find(u => u.id === 'user-distributor-1');
      if (dist) setCurrentUser(dist);
    } else if (newPersona === 'inventory') {
      const inv = users.find(u => u.role === 'Inventory Manager') || users[5];
      setCurrentUser(inv);
    } else if (newPersona === 'media_buyer') {
      const mb = users.find(u => u.role === 'Media Buyer') || users.find(u => u.id === 'user-media-buyer-1') || {
        id: 'user-media-buyer-1',
        name: 'Kayode Daniels',
        email: 'kayode.ads@growthpilot.ng',
        phone: '+234 802 881 9922',
        role: 'Media Buyer' as const,
        status: 'Active' as const,
        createdAt: '2026-03-10',
        payStructure: 'Performance-based' as const,
        fixedSalary: 150000
      };
      setCurrentUser(mb);
    } else if (newPersona === 'manager') {
      const mgr = users.find(u => u.role === 'Manager') || {
        id: 'user-mgr-optin',
        name: 'Ngozi Eze (Ops Manager)',
        email: 'ngozi.e@apexbrands.ng',
        phone: '+234 805 777 8899',
        role: 'Manager' as const,
        status: 'Active' as const,
        createdAt: '2026-05-02',
        payStructure: 'Fixed' as const,
        fixedSalary: 220000,
        permissions: {
          sales: { orders: true, salesReps: true, teamPerformance: true, customers: true, deliveries: true },
          operations: { deliveryAgents: true, inventory: true, roundRobin: true },
          finance: { expenses: true, reports: true, orderReports: true, remittances: true, mediaBuyers: true, payroll: true },
          admin: { users: true, notifications: true, orderFormBuilder: true, adTracker: true, aiAgent: false, aiSandbox: false, tokenReporting: false, integrations: false, subscription: true, settings: true }
        }
      };
      setCurrentUser(mgr);
    } else if (newPersona === 'accountant') {
      const acct = users.find(u => u.role === 'Accountant') || users.find(u => u.id === 'user-accountant-1') || {
        id: 'user-accountant-1',
        name: 'Kemi Adeleke, FCA (Head Accountant)',
        email: 'kemi.finance@apexbrands.ng',
        phone: '+234 803 445 1199',
        role: 'Accountant' as const,
        status: 'Active' as const,
        createdAt: '2026-02-01',
        payStructure: 'Fixed' as const,
        fixedSalary: 280000,
        permissions: {
          sales: { orders: true, salesReps: false, teamPerformance: false, customers: false, deliveries: true },
          operations: { deliveryAgents: false, inventory: false, roundRobin: false },
          finance: { expenses: true, reports: true, orderReports: true, remittances: true, mediaBuyers: false, payroll: true },
          admin: { users: false, notifications: true, orderFormBuilder: false, adTracker: false, aiAgent: false, aiSandbox: false, tokenReporting: false, integrations: false, subscription: false, settings: true }
        }
      };
      setCurrentUser(acct);
      setAdminActiveTab('dashboard');
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
    <header className={`sticky top-0 z-40 w-full h-14 backdrop-blur border-b flex items-center justify-between px-2 sm:px-4 lg:px-6 gap-1.5 sm:gap-2 transition-colors ${
      isLight ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xs' : 'bg-black/95 border-neutral-800 text-white'
    }`}>
      {/* Zone 1: Mobile Hamburger, Desktop Collapse & Wordmark */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {(persona === 'admin' || persona === 'manager' || persona === 'accountant' || persona === 'rep' || persona === 'distributor' || persona === 'inventory' || persona === 'media_buyer') && (
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
          onClick={(e) => { e.preventDefault(); setPersona('admin'); setAdminActiveTab('dashboard'); }}
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

      {/* Zone 2: Fast Persona Switcher (Responsive) */}
      <div className={`flex items-center p-0.5 rounded-lg border overflow-x-auto scrollbar-none min-w-0 flex-shrink max-w-[36vw] xs:max-w-[46vw] sm:max-w-none ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/80 border-neutral-800'
      }`}>
        <button
          onClick={() => handlePersonaChange('admin')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            persona === 'admin' 
              ? (isLight ? 'bg-white text-slate-900 border border-slate-300 shadow-xs font-bold' : 'bg-emerald-600 text-white shadow-sm font-semibold')
              : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200')
          }`}
          title="Admin Operational Hub (32 Pages)"
        >
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">Admin View</span>
          <span className="sm:hidden text-[11px]">Admin</span>
        </button>

        <button
          onClick={() => handlePersonaChange('manager')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            persona === 'manager' 
              ? (isLight ? 'bg-white text-slate-900 border border-slate-300 shadow-xs font-bold' : 'bg-emerald-600 text-white shadow-sm font-semibold')
              : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200')
          }`}
          title="Manager Operations & Oversight Dashboard"
        >
          <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">Manager</span>
          <span className="sm:hidden text-[11px]">Mgr</span>
        </button>

        <button
          onClick={() => handlePersonaChange('accountant')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            persona === 'accountant' 
              ? (isLight ? 'bg-white text-slate-900 border border-slate-300 shadow-xs font-bold' : 'bg-emerald-600 text-white shadow-sm font-semibold')
              : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200')
          }`}
          title="Accountant Dashboard & Financial Ledgers"
        >
          <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">Accountant</span>
          <span className="sm:hidden text-[11px]">Acct</span>
        </button>

        <button
          onClick={() => handlePersonaChange('rep')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            persona === 'rep' 
              ? (isLight ? 'bg-white text-slate-900 border border-slate-300 shadow-xs font-bold' : 'bg-emerald-600 text-white shadow-sm font-semibold')
              : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200')
          }`}
          title="Sales Rep Dashboard (11 Pages)"
        >
          <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">Sales Rep</span>
          <span className="sm:hidden text-[11px]">Rep</span>
        </button>

        <button
          onClick={() => handlePersonaChange('distributor')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            persona === 'distributor' 
              ? (isLight ? 'bg-white text-slate-900 border border-slate-300 shadow-xs font-bold' : 'bg-emerald-600 text-white shadow-sm font-semibold')
              : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200')
          }`}
          title="Distributor Dashboard & Regional Inventory Hub"
        >
          <Truck className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">Distributor</span>
          <span className="sm:hidden text-[11px]">Dist</span>
        </button>

        <button
          onClick={() => handlePersonaChange('inventory')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            persona === 'inventory' 
              ? (isLight ? 'bg-white text-slate-900 border border-slate-300 shadow-xs font-bold' : 'bg-emerald-600 text-white shadow-sm font-semibold')
              : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200')
          }`}
          title="Inventory Manager View (6 Pages)"
        >
          <Package className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden md:inline">Inventory Mgr</span>
          <span className="md:hidden text-[11px]">Stock</span>
        </button>

        <button
          onClick={() => handlePersonaChange('media_buyer')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            persona === 'media_buyer' 
              ? (isLight ? 'bg-white text-slate-900 border border-slate-300 shadow-xs font-bold' : 'bg-emerald-600 text-white shadow-sm font-semibold')
              : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200')
          }`}
          title="Media Buyer Performance Marketing Dashboard"
        >
          <Megaphone className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden md:inline">Media Buyer</span>
          <span className="md:hidden text-[11px]">Ads</span>
        </button>

        <button
          onClick={() => handlePersonaChange('public_form')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            persona === 'public_form' 
              ? (isLight ? 'bg-white text-slate-900 border border-slate-300 shadow-xs font-bold' : 'bg-emerald-600 text-white shadow-sm font-semibold')
              : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200')
          }`}
          title="Public Customer Checkout Page"
        >
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden md:inline">Order Form</span>
          <span className="md:hidden text-[11px]">Form</span>
        </button>

        <button
          onClick={() => handlePersonaChange('marketing')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            persona === 'marketing' 
              ? (isLight ? 'bg-white text-slate-900 border border-slate-300 shadow-xs font-bold' : 'bg-emerald-600 text-white shadow-sm font-semibold')
              : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200')
          }`}
          title="Public Marketing Site & Pricing"
        >
          <Globe className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden md:inline">Marketing</span>
          <span className="md:hidden text-[11px]">Site</span>
        </button>
      </div>

      {/* Zone 3: Currency, Night/Day Mode, PWA Install, Notifications & User */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
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

        {/* Currency Switcher */}
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className={`text-[11px] sm:text-xs rounded-lg px-1.5 sm:px-2.5 py-1 sm:py-1.5 appearance-none pr-4 sm:pr-6 font-mono focus:outline-none cursor-pointer transition border ${
              isLight 
                ? 'bg-white border-slate-200 text-slate-800 focus:border-lime-500 shadow-xs' 
                : 'bg-neutral-900 border-neutral-800 text-slate-200 focus:border-emerald-500'
            }`}
          >
            {currencyOptions.map((opt) => (
              <option key={opt.code} value={opt.code} className={isLight ? 'bg-white text-slate-900' : 'bg-neutral-900 text-white'}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className={`w-3 h-3 absolute right-1.5 sm:right-2 top-2.5 pointer-events-none ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`} />
        </div>

        {/* Real-time Token Metering Tracker Button */}
        <button
          type="button"
          onClick={() => {
            setPersona('admin');
            setAdminActiveTab('tokens');
          }}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer group ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800 shadow-xs'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 hover:border-emerald-500/40 text-white'
          }`}
          title={`Token Metering: ${settings.tokenBalance} Tokens Remaining. Click to configure VAPI/SMS APIs & token quota.`}
        >
          <Coins className={`w-3.5 h-3.5 ${
            settings.tokenBalance < 30 
              ? 'text-amber-500 animate-pulse' 
              : (isLight ? 'text-lime-700' : 'text-emerald-400')
          } group-hover:scale-110 transition-transform`} />
          <span className={`font-bold text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>{settings.tokenBalance}</span>
          <span className={`text-[10px] hidden lg:inline ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>tokens</span>
        </button>

        {/* PWA Install Button */}
        <div className="hidden sm:block">
          <PWAInstallButton compact />
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-1.5 rounded-lg transition relative cursor-pointer ${
              isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-neutral-900'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ring-2 animate-pulse ${
                isLight ? 'bg-lime-600 ring-white' : 'bg-emerald-500 ring-black'
              }`} />
            )}
          </button>

          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm rounded-xl border shadow-2xl p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2 ${
              isLight ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50' : 'bg-neutral-950 border-neutral-800 text-white'
            }`}>
              <div className={`flex items-center justify-between pb-3 border-b ${
                isLight ? 'border-slate-100' : 'border-neutral-800'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Notifications</span>
                  {unreadCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold border ${
                      isLight ? 'bg-lime-100 text-lime-800 border-lime-300' : 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                    }`}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllNotificationsAsRead}
                  className={`transition font-medium cursor-pointer ${
                    isLight ? 'text-slate-500 hover:text-lime-700' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  Mark all read
                </button>
              </div>

              <div className={`divide-y max-h-72 overflow-y-auto mt-2 ${
                isLight ? 'divide-slate-100' : 'divide-slate-800/60'
              }`}>
                {notifications.length === 0 ? (
                  <p className={`py-6 text-center ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>No new notifications</p>
                ) : (
                  notifications.slice(0, 6).map((n, idx) => (
                    <div 
                      key={`${n.id || 'notif'}-${idx}`} 
                      className={`py-2.5 px-2 rounded transition ${
                        isLight 
                          ? (!n.isRead ? 'bg-lime-50/70' : 'hover:bg-slate-50') 
                          : (!n.isRead ? 'bg-slate-800/20' : 'hover:bg-slate-800/40')
                      }`}
                    >
                      <div className={`flex items-center justify-between text-[11px] ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{n.title}</span>
                        <span>{n.timestamp}</span>
                      </div>
                      <p className={`mt-1 leading-normal text-[11px] ${
                        isLight ? 'text-slate-600' : 'text-slate-300'
                      }`}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className={`pt-2.5 mt-2 border-t ${
                isLight ? 'border-slate-100' : 'border-neutral-800'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    setPersona('admin');
                    setAdminActiveTab('notifications');
                  }}
                  className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isLight 
                      ? 'bg-lime-50 hover:bg-lime-100 text-lime-900 border-lime-300' 
                      : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Open Full Notification Center</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg border transition cursor-pointer ${
              isLight 
                ? 'border-slate-200 bg-slate-100 hover:bg-slate-200/80 text-slate-900 shadow-xs' 
                : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-200'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isLight ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-emerald-600 text-white'
            }`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden lg:block">
              <p className={`text-xs font-semibold leading-none truncate max-w-[110px] ${
                isLight ? 'text-slate-900' : 'text-slate-200'
              }`}>
                {currentUser.name}
              </p>
              <p className={`text-[10px] leading-tight mt-0.5 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {currentUser.role}
              </p>
            </div>
            <ChevronDown className={`w-3 h-3 hidden lg:block ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`} />
          </button>

          {showUserMenu && (
            <div className={`absolute right-0 mt-2 w-64 rounded-xl border shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 ${
              isLight ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50' : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              <div className={`pb-2.5 border-b text-xs ${
                isLight ? 'border-slate-100' : 'border-slate-800'
              }`}>
                <p className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentUser.name}</p>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{currentUser.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{settings.name}</span>
                </div>
              </div>

              <div className="pt-2 text-xs">
                <p className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 ${
                  isLight ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Switch Active Role Persona
                </p>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      if (u.role === 'Sales Representative') setPersona('rep');
                      else if (u.role === 'Distributor') setPersona('distributor');
                      else if (u.role === 'Inventory Manager') setPersona('inventory');
                      else if (u.role === 'Media Buyer') setPersona('media_buyer');
                      else setPersona('admin');
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition cursor-pointer ${
                      currentUser.id === u.id 
                        ? (isLight ? 'bg-lime-50 text-lime-900 font-bold border border-lime-200' : 'text-emerald-400 font-medium bg-slate-800/50') 
                        : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800')
                    }`}
                  >
                    <div>
                      <p className="text-xs">{u.name}</p>
                      <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{u.role}</p>
                    </div>
                    {currentUser.id === u.id && <Check className={`w-3.5 h-3.5 ${isLight ? 'text-lime-700' : 'text-emerald-400'}`} />}
                  </button>
                ))}
              </div>

              <div className={`pt-2 border-t mt-2 ${
                isLight ? 'border-slate-100' : 'border-slate-800'
              }`}>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition text-xs font-semibold cursor-pointer ${
                    isLight ? 'text-rose-600 hover:bg-rose-50' : 'text-rose-400 hover:bg-rose-500/10'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
