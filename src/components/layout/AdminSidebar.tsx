import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { hasUserAccessToTab } from '../../utils/permissions';
import {
  LayoutGrid,
  ShoppingBag,
  ShoppingCart,
  CalendarClock,
  Package,
  Users,
  Users2,
  Trophy,
  Truck,
  Banknote,
  DollarSign,
  PieChart,
  FileSpreadsheet,
  Target,
  Megaphone,
  FormInput,
  RotateCcw,
  Bot,
  FlaskConical,
  Coins,
  MessageSquare,
  ShieldCheck,
  Blocks,
  Settings,
  Headphones,
  GraduationCap,
  Store,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  X,
  Receipt,
  UserCheck,
  Bell
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const AdminSidebar: React.FC = () => {
  const { 
    adminActiveTab, 
    setAdminActiveTab, 
    orders, 
    abandonedCarts, 
    remittances,
    distributors,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    currentUser,
    persona,
    setPersona,
    settings,
    notifications,
    addNotification,
    themeMode
  } = useCrm();

  const isLight = themeMode === 'light';
  const isManager = currentUser?.role === 'Manager' || persona === 'manager';
  const isAccountant = currentUser?.role === 'Accountant' || persona === 'accountant';
  const permissions = currentUser?.permissions?.admin;
  const hasAiAgent = !isManager || Boolean(permissions?.aiAgent);
  const hasAiSandbox = !isManager || Boolean(permissions?.aiSandbox);
  const hasTokenReporting = !isManager || Boolean(permissions?.tokenReporting);
  const hasIntegrations = !isManager || Boolean(permissions?.integrations);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Keyboard shortcut Ctrl/Cmd + B to toggle collapsible sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebarCollapse]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setIsMobileSidebarOpen(false);
    setPersona('logout');
    window.location.hash = '#logout';
    if (addNotification) {
      addNotification({
        title: 'Sign Out',
        message: 'Redirecting to session termination page...',
        type: 'info'
      });
    }
  };

  const newOrdersCount = orders.filter(o => o.status === 'NEW').length;
  const openCartsCount = abandonedCarts.filter(c => c.status === 'ABANDONED' || c.status === 'ASSIGNED').length;
  const pendingRemitCount = remittances.filter(r => r.status === 'Pending').length;
  const unreadNotifsCount = notifications ? notifications.filter(n => !n.isRead).length : 0;
  const distributorsCount = distributors ? distributors.length : 0;

  // Exact navigation menu list matching BettaTraka CRM sidebar screenshot (side menu bar.png)
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: newOrdersCount > 0 ? newOrdersCount : undefined },
    { id: 'abandoned-carts', label: 'Abandoned Carts', icon: ShoppingCart, badge: openCartsCount > 0 ? openCartsCount : undefined },
    { id: 'scheduled', label: 'Scheduled Deliveries', icon: CalendarClock },
    { id: 'deliveries', label: 'Deliveries', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sales-reps', label: 'Sales Reps', icon: Users },
    { id: 'sales-teams', label: 'Sales Teams', icon: Users2 },
    { id: 'team-performance', label: 'Team Performance', icon: Trophy },
    { id: 'distributors', label: 'Distributors', icon: Truck, badge: distributorsCount > 0 ? distributorsCount : undefined },
    { id: 'agents', label: 'Agents', icon: UserCheck },
    { id: 'payroll', label: 'Payroll', icon: Banknote },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'financial-reports', label: 'Finance & Accounting', icon: PieChart },
    { id: 'order-reports', label: 'Order Reports', icon: FileSpreadsheet },
    { id: 'ad-tracking', label: 'Ad Tracking (UTM)', icon: Target },
    { id: 'media-buyers', label: 'Media Buyers', icon: Megaphone },
    { id: 'embed-forms', label: 'Embed Form Builder', icon: FormInput },
    { id: 'round-robin', label: 'Round-Robin', icon: RotateCcw },
    { 
      id: 'ai-agent', 
      label: 'AI Voice Agent', 
      icon: Bot, 
      badge: isManager && !hasAiAgent ? '🔒 Locked' : undefined 
    },
    { 
      id: 'ai-sandbox', 
      label: 'AI Sandbox', 
      icon: FlaskConical, 
      badge: isManager && !hasAiSandbox ? '🔒 Locked' : undefined 
    },
    { 
      id: 'tokens', 
      label: 'Token Reporting', 
      icon: Coins, 
      badge: isManager && !hasTokenReporting ? '🔒 Locked' : `${settings?.tokenBalance ?? 0} tok` 
    },
    { id: 'remittances', label: 'Remittances', icon: Banknote, badge: pendingRemitCount > 0 ? pendingRemitCount : undefined },
    { id: 'team-chat', label: 'Team Chat', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined },
    { id: 'users', label: 'User Management', icon: ShieldCheck },
    { 
      id: 'integrations', 
      label: 'Integrations', 
      icon: Blocks, 
      badge: isManager && !hasIntegrations ? '🔒 Locked' : undefined 
    },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Customer Support', icon: Headphones },
    { id: 'academy', label: 'BettaTraka Academy', icon: GraduationCap },
  ];

  const accountantNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Financial Portal', icon: LayoutGrid, badge: 'Overview' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: 'View Only' },
    { id: 'deliveries', label: 'Deliveries', icon: Package, badge: 'View Only' },
    { id: 'payroll', label: 'Payroll', icon: Banknote, badge: 'View Only' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, badge: 'View Only' },
    { id: 'financial-reports', label: 'Finance & Accounting', icon: PieChart, badge: 'P&L Audit' },
    { id: 'remittances', label: 'Remittances', icon: Banknote, badge: pendingRemitCount > 0 ? `${pendingRemitCount} Pend` : 'Audit' },
    { id: 'team-chat', label: 'Team Chat', icon: MessageSquare },
    { id: 'settings', label: 'Accountant Settings', icon: Settings, badge: 'Preferences' },
  ];

  const displayedNavItems = React.useMemo(() => {
    if (isAccountant) {
      const baseIds = new Set(accountantNavItems.map(i => i.id));
      const extraGrantedItems = navItems
        .filter(item => !baseIds.has(item.id) && hasUserAccessToTab(currentUser, item.id));

      const updatedAccountantItems = accountantNavItems.map(item => {
        const allowed = hasUserAccessToTab(currentUser, item.id);
        if (!allowed && item.id !== 'dashboard' && item.id !== 'settings') {
          return { ...item, badge: '🔒 Locked' };
        }
        return item;
      });

      return [...updatedAccountantItems, ...extraGrantedItems];
    }

    return navItems.map(item => {
      const allowed = hasUserAccessToTab(currentUser, item.id);
      if (!allowed && item.id !== 'dashboard' && item.id !== 'support' && item.id !== 'academy') {
        return { ...item, badge: '🔒 Locked' };
      }
      return item;
    });
  }, [isAccountant, accountantNavItems, navItems, currentUser]);

  // Render Expanded Content (Exact match to side menu bar.png)
  const renderExpandedContent = (isMobile = false) => (
    <div className={`w-full flex-shrink-0 border-r flex flex-col h-full select-none ${
      isLight ? 'bg-white border-slate-200' : 'bg-[#090d16] border-slate-800/80'
    }`}>
      
      {/* 1. Header: Brand Logo & Title + Collapse Toggle */}
      <div className={`p-3.5 flex items-center justify-between border-b ${
        isLight ? 'border-slate-200 bg-white' : 'border-slate-800/80'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          {/* Concentric rings logo badge in our emerald brand color */}
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
            isLight ? 'bg-emerald-50 border-emerald-200 shadow-xs' : 'bg-slate-900 border-emerald-500/30 shadow-inner'
          }`}>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              isLight ? 'border-emerald-500/50' : 'border-emerald-400/40'
            }`}>
              <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                isLight ? 'border-emerald-600' : 'border-emerald-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isLight ? 'bg-emerald-600' : 'bg-emerald-400'
                }`} />
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <h1 className={`text-sm font-extrabold tracking-tight leading-tight truncate flex items-center gap-1.5 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <span>{isAccountant ? 'Accountant Office' : 'BettaTraka'}</span>
              <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold border ${
                isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
              }`}>
                {isAccountant ? 'AUDIT' : 'CRM'}
              </span>
            </h1>
            <p className={`text-[10px] font-medium leading-tight truncate ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {isAccountant ? 'Financial Control & Ledgers' : 'Operations & Order OS'}
            </p>
          </div>
        </div>

        {/* Desktop Collapse Toggle (<| icon with emerald border matching our theme) */}
        {!isMobile ? (
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isLight
                ? 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
            }`}
            title="Collapse Sidebar (Ctrl/Cmd + B)"
            aria-label="Collapse Navigation"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isLight
                ? 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Close Navigation"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Workspace / Store Selector Pill (Betta Herbals Limited) */}
      <div className="px-3 pt-3 pb-1">
        <div className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold shadow-xs transition cursor-pointer ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
            : 'bg-slate-900/90 border-slate-800/90 text-white hover:border-slate-700'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <Store className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <span className="truncate text-xs font-medium">{settings?.name || 'Betta Herbals Limited'}</span>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        </div>
      </div>

      {/* 3. Navigation Items List (Flat, continuous list matching clean CRM hierarchy) */}
      <div className={`flex-1 overflow-y-auto px-2.5 py-2.5 space-y-1 ${
        isLight ? 'scrollbar-thin scrollbar-thumb-slate-300' : 'scrollbar-thin scrollbar-thumb-slate-800'
      }`}>
        {displayedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminActiveTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setAdminActiveTab(item.id);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all group cursor-pointer ${
                isActive
                  ? isLight
                    ? 'bg-lime-50 text-lime-900 font-bold border border-lime-400 shadow-xs'
                    : 'bg-emerald-950/70 text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm shadow-emerald-950/50'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/70 font-normal'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 flex-shrink-0 ${
                  isActive 
                    ? (isLight ? 'text-lime-700' : 'text-emerald-400')
                    : (isLight ? 'text-slate-400 group-hover:text-slate-700' : 'text-slate-400 group-hover:text-emerald-300')
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                  isActive
                    ? isLight
                      ? 'bg-lime-200 text-lime-950 font-bold border border-lime-400'
                      : 'bg-emerald-500 text-slate-950'
                    : isLight
                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-slate-800 text-emerald-400 border border-emerald-900/60'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Bottom User Profile Section */}
      <div className={`p-3.5 border-t space-y-2.5 ${
        isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800/80 bg-[#060a12]'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar circle: Emerald circle with clear user initial */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${
            isLight ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-emerald-600 text-white'
          }`}>
            {currentUser?.name ? currentUser.name.charAt(0) : 'D'}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-bold truncate leading-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`} title={currentUser?.name}>
              {currentUser?.name || (isAccountant ? 'Kemi Adeleke, FCA' : 'Desmond Ufuoma Okosi')}
            </p>
            <p className={`text-[10px] truncate leading-tight mt-0.5 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {currentUser?.role || (isAccountant ? 'Head Accountant' : 'Owner')}
            </p>
          </div>
        </div>

        {/* Sign Out Action in red: [-> Sign Out */}
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className={`w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg transition cursor-pointer ${
            isLight
              ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/80 shadow-xs'
              : 'text-red-400 hover:text-red-300 hover:bg-red-950/20'
          }`}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );

  // Render Collapsed Slim Content
  const renderCollapsedContent = () => (
    <div className={`w-full flex-shrink-0 border-r flex flex-col h-full select-none items-center ${
      isLight ? 'bg-white border-slate-200' : 'bg-[#090d16] border-slate-800/80'
    }`}>
      {/* Header: Brand Logo & Expand Toggle */}
      <div className={`p-2.5 border-b w-full flex flex-col items-center gap-2 ${
        isLight ? 'border-slate-200' : 'border-slate-800/80'
      }`}>
        <button
          type="button"
          onClick={toggleSidebarCollapse}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition cursor-pointer shadow-sm ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              : 'bg-slate-900 border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
          }`}
          title="Expand Sidebar (Ctrl/Cmd + B)"
          aria-label="Expand Sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </div>

      {/* Nav List: Centered Icons with Flyout Tooltips */}
      <div className="flex-1 overflow-y-auto py-2.5 w-full space-y-1.5 flex flex-col items-center scrollbar-none">
        {displayedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminActiveTab === item.id;

          return (
            <div key={item.id} className="relative group flex items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setAdminActiveTab(item.id)}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? isLight
                      ? 'bg-lime-50 text-lime-800 border border-lime-400 font-bold shadow-xs'
                      : 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm shadow-emerald-950/50'
                    : isLight
                      ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />

                {item.badge !== undefined && (
                  <span className={`absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center font-mono ${
                    isLight ? 'bg-emerald-100 text-emerald-950 font-bold border border-emerald-300' : 'bg-emerald-500 text-slate-950'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Flyout Tooltip on hover */}
              <div className={`opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl border text-xs font-medium z-50 whitespace-nowrap shadow-xl flex items-center gap-1.5 ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white shadow-2xl'
              }`}>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                    isLight ? 'bg-lime-100 text-lime-800 border border-lime-200' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Session & Compact Logout at Bottom */}
      <div className={`p-2 border-t w-full flex flex-col items-center gap-2 ${
        isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800/80 bg-[#060a12]'
      }`}>
        <div
          className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-sm cursor-pointer"
          title={`${currentUser?.name || 'Desmond Ufuoma Okosi'} (${currentUser?.role || 'Owner'})`}
        >
          {currentUser?.name ? currentUser.name.charAt(0) : 'D'}
        </div>

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className={`p-1.5 rounded-lg transition cursor-pointer ${
            isLight ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50' : 'text-red-400 hover:text-red-300 hover:bg-red-950/20'
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Collapsible) */}
      <aside 
        className={`hidden md:flex flex-shrink-0 flex-col h-full select-none transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-[68px]' : 'w-64'
        } ${isLight ? 'bg-white border-r border-slate-200' : 'bg-[#090d16] border-r border-slate-800/80'}`}
      >
        {isSidebarCollapsed ? renderCollapsedContent() : renderExpandedContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          {/* Drawer */}
          <aside className={`relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200 ${
            isLight ? 'bg-white' : 'bg-[#090d16]'
          }`}>
            {renderExpandedContent(true)}
          </aside>
        </div>
      )}

      {/* Log Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-sm rounded-2xl border p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Sign Out?</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                You will be signed out of your administrative session.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  isLight 
                    ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700' 
                    : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow transition cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
