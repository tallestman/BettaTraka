import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount, createWhatsAppLink } from '../../utils/formatters';
import { OrderDetailsModal } from '../admin/OrderDetailsModal';
import { CreateOrderModal } from '../admin/CreateOrderModal';
import { ScheduleDeliveryModal } from '../common/ScheduleDeliveryModal';
import { Order, OrderStatus, AbandonedCart, CartStatus, User } from '../../types/crm';
import { 
  Trophy, 
  ShoppingCart, 
  PhoneCall, 
  CalendarClock, 
  Calendar,
  Users, 
  MessageSquare, 
  Bell, 
  Settings, 
  GraduationCap, 
  Package, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Plus,
  Eye,
  ArrowRight,
  LogOut,
  MessageCircle,
  Phone,
  Search,
  Check,
  Copy,
  ExternalLink,
  Flame,
  Award,
  Crown,
  Medal,
  ShieldCheck,
  Building,
  CreditCard,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Filter,
  DollarSign,
  Send,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  PanelLeftOpen,
  PanelLeftClose,
  Menu,
  X
} from 'lucide-react';

export const SalesRepView: React.FC = () => {
  const { 
    currentUser, 
    orders, 
    abandonedCarts, 
    products, 
    agents, 
    agentStock, 
    currency, 
    updateOrderStatus,
    assignOrderDistributor,
    distributors,
    users, 
    chatMessages,
    sendChatMessage,
    setPersona,
    addNotification,
    updateCartStatus,
    convertCartToOrder,
    reassignCartRep,
    updateUser,
    salesTeams,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleMobileSidebar
  } = useCrm();

  const [repTab, setRepTab] = useState<string>('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToSchedule, setOrderToSchedule] = useState<Order | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [targetExtraDeliveries, setTargetExtraDeliveries] = useState<number>(10);
  const [chatInput, setChatInput] = useState('');

  // -------------------------------------------------------------
  // ABANDONED CARTS TAB STATE
  // -------------------------------------------------------------
  const [cartScope, setCartScope] = useState<'my' | 'unassigned'>('my');
  const [cartStatusFilter, setCartStatusFilter] = useState<'all' | 'ASSIGNED' | 'CONTACTED' | 'CONVERTED' | 'LOST'>('all');
  const [cartSearch, setCartSearch] = useState('');
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);
  const [convertingCartId, setConvertingCartId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // LEADERBOARD TAB STATE
  // -------------------------------------------------------------
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<'month' | 'week' | 'all'>('month');

  // -------------------------------------------------------------
  // SETTINGS TAB STATE
  // -------------------------------------------------------------
  const [repName, setRepName] = useState(currentUser.name);
  const [repPhone, setRepPhone] = useState(currentUser.phone);
  const [repWhatsApp, setRepWhatsApp] = useState(currentUser.phone);
  const [isAvailableForLeads, setIsAvailableForLeads] = useState<boolean>(true);
  const [payoutBank, setPayoutBank] = useState('Guaranty Trust Bank (GTBank)');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [accountName, setAccountName] = useState(currentUser.name);
  const [customGreeting, setCustomGreeting] = useState(
    'Hello {customer_name}, this is {rep_name} from BettaTraka. I am your assigned delivery coordinator for your order of {product_name}. Do you need doorstep payment confirmation?'
  );
  const [alertSound, setAlertSound] = useState(true);
  const [deliveryAlert, setDeliveryAlert] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Logout Handler
  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setPersona('marketing');
    if (addNotification) {
      addNotification({
        title: 'Signed Out',
        message: 'You have been logged out of your session.',
        type: 'info'
      });
    }
  };

  // Rep-specific assigned data
  const myOrders = useMemo(() => {
    return orders.filter(o => o.salesRepId === currentUser.id);
  }, [orders, currentUser.id]);

  const myDeliveredOrders = useMemo(() => {
    return myOrders.filter(o => o.status === 'DELIVERED');
  }, [myOrders]);

  const myPendingOrders = useMemo(() => {
    return myOrders.filter(o => o.status === 'NEW' || o.status === 'CONFIRMED' || o.status === 'NOT_PICKING_CALLS');
  }, [myOrders]);

  const myRevenueNgn = useMemo(() => {
    return myDeliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [myDeliveredOrders]);

  const myConversion = myOrders.length > 0 ? Math.round((myDeliveredOrders.length / myOrders.length) * 100) : 0;

  // Carts Data
  const myCarts = useMemo(() => {
    return abandonedCarts.filter(c => c.assignedRepId === currentUser.id);
  }, [abandonedCarts, currentUser.id]);

  const unassignedCarts = useMemo(() => {
    return abandonedCarts.filter(c => !c.assignedRepId || c.status === 'ABANDONED');
  }, [abandonedCarts]);

  const myRecoveredCarts = useMemo(() => {
    return myCarts.filter(c => c.status === 'CONVERTED');
  }, [myCarts]);

  const myCartsValue = useMemo(() => {
    return myCarts.reduce((sum, c) => sum + c.amount, 0);
  }, [myCarts]);

  const myRecoveryRate = myCarts.length > 0 
    ? Math.round((myRecoveredCarts.length / myCarts.length) * 100) 
    : 0;

  // Commission calculations
  const commissionRate = currentUser.commissionPerOrder || 1500;
  const estimatedCommissionsNgn = myDeliveredOrders.length * commissionRate;
  const fixedSalary = currentUser.fixedSalary || 0;
  const estimatedTotalEarningsNgn = fixedSalary + estimatedCommissionsNgn;
  const simulatedExtraCommissionNgn = targetExtraDeliveries * commissionRate;

  // Team
  const myTeam = useMemo(() => {
    return salesTeams.find(t => t.id === currentUser.teamId);
  }, [salesTeams, currentUser.teamId]);

  // -------------------------------------------------------------
  // ABANDONED CARTS FILTERING & RECOVERY ACTIONS
  // -------------------------------------------------------------
  const filteredCarts = useMemo(() => {
    const list = cartScope === 'my' ? myCarts : unassignedCarts;

    return list.filter(c => {
      // Status filter
      if (cartStatusFilter !== 'all') {
        if (cartStatusFilter === 'ASSIGNED' && c.status !== 'ASSIGNED' && c.status !== 'ABANDONED') return false;
        if (cartStatusFilter === 'CONTACTED' && c.status !== 'CONTACTED') return false;
        if (cartStatusFilter === 'CONVERTED' && c.status !== 'CONVERTED') return false;
        if (cartStatusFilter === 'LOST' && (c.status !== 'LOST' && c.status !== 'NOT INTERESTED')) return false;
      }

      // Search filter
      if (cartSearch.trim()) {
        const q = cartSearch.toLowerCase().trim();
        const matchesName = c.customerName.toLowerCase().includes(q);
        const matchesPhone = c.customerPhone.includes(q);
        const matchesCity = (c.deliveryCity || '').toLowerCase().includes(q);
        const matchesProduct = c.productName.toLowerCase().includes(q);
        const matchesCartNum = c.cartNumber.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesCity && !matchesProduct && !matchesCartNum) {
          return false;
        }
      }

      return true;
    });
  }, [cartScope, myCarts, unassignedCarts, cartStatusFilter, cartSearch]);

  // Convert Cart to Live Order Handler
  const handleConvertCart = (cartId: string) => {
    setConvertingCartId(cartId);
    setTimeout(() => {
      const order = convertCartToOrder(cartId);
      setConvertingCartId(null);
      if (order) {
        if (addNotification) {
          addNotification({
            title: 'Cart Converted to Order!',
            message: `Order #${order.orderNumber} successfully created for ${order.customerName} (₦${order.totalAmount.toLocaleString()}). Please set customer delivery date!`,
            type: 'success'
          });
        }
        setOrderToSchedule(order);
      }
    }, 600);
  };

  // Claim Lead Handler
  const handleClaimLead = (cartId: string) => {
    reassignCartRep(cartId, currentUser.id);
    if (addNotification) {
      addNotification({
        title: 'Lead Claimed Successfully',
        message: 'This abandoned cart has been assigned to your personal pipeline.',
        type: 'success'
      });
    }
  };

  // Copy Script Handler
  const handleCopyScript = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptIndex(index);
    setTimeout(() => setCopiedScriptIndex(null), 2500);
  };

  // -------------------------------------------------------------
  // LEADERBOARD COMPUTATIONS
  // -------------------------------------------------------------
  const repRankings = useMemo(() => {
    const salesReps = users.filter(u => u.role === 'Sales Representative' || u.id.startsWith('user-rep'));
    
    const rankings = salesReps.map(rep => {
      const repOrders = orders.filter(o => o.salesRepId === rep.id);
      const delivered = repOrders.filter(o => o.status === 'DELIVERED');
      const revenue = delivered.reduce((sum, o) => sum + o.totalAmount, 0);
      const conversion = repOrders.length > 0 ? Math.round((delivered.length / repOrders.length) * 100) : 0;
      const repRate = rep.commissionPerOrder || 1500;
      const commissions = delivered.length * repRate;
      const team = salesTeams.find(t => t.id === rep.teamId)?.name || 'Direct Sales';

      return {
        id: rep.id,
        name: rep.name,
        email: rep.email,
        team,
        assignedCount: repOrders.length,
        deliveredCount: delivered.length,
        revenue,
        conversion,
        commissions,
        isCurrent: rep.id === currentUser.id
      };
    });

    // Sort by delivered count descending, then by revenue
    rankings.sort((a, b) => {
      if (b.deliveredCount !== a.deliveredCount) {
        return b.deliveredCount - a.deliveredCount;
      }
      return b.revenue - a.revenue;
    });

    return rankings;
  }, [users, orders, salesTeams, currentUser.id]);

  const myRank = useMemo(() => {
    const index = repRankings.findIndex(r => r.id === currentUser.id);
    return index !== -1 ? index + 1 : 1;
  }, [repRankings, currentUser.id]);

  // -------------------------------------------------------------
  // SETTINGS SAVE HANDLER
  // -------------------------------------------------------------
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      updateUser(currentUser.id, {
        name: repName,
        phone: repPhone
      });
      if (addNotification) {
        addNotification({
          title: 'Sales Rep Settings Saved',
          message: 'Your profile, lead availability, and payout bank information have been updated.',
          type: 'success'
        });
      }
    }, 700);
  };

  const repNavItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: TrendingUp },
    { id: 'orders', label: 'My Orders', icon: ShoppingCart, badge: myPendingOrders.length },
    { id: 'abandoned', label: 'My Abandoned Carts', icon: PhoneCall, badge: myCarts.filter(c => c.status === 'ASSIGNED').length },
    { id: 'agent-stock', label: 'Agent Inventory', icon: Package },
    { id: 'leaderboard', label: 'Rep Leaderboard', icon: Trophy, badge: `#${myRank}` },
    { id: 'chat', label: 'Team Chat', icon: MessageSquare },
    { id: 'settings', label: 'My Settings', icon: Settings },
    { id: 'log-out', label: 'Log Out', icon: LogOut, isLogOut: true },
  ];

  // Render Expanded Rep Sidebar
  const renderExpandedContent = (isMobile = false) => (
    <div className="w-full flex-shrink-0 bg-[#090d16] border-r border-slate-800/80 flex flex-col h-full select-none justify-between p-3">
      {/* Scrollable Nav Area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
        {/* User Profile Mini Badge & Collapse Toggle */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-3 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-lime-950 border border-lime-500/40 flex items-center justify-center font-bold text-xs text-lime-400 shrink-0">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-xs truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                  <p className="text-[10px] text-lime-400 font-mono truncate">
                    {isAvailableForLeads ? 'Online & Active' : 'Away / Paused'}
                  </p>
                </div>
              </div>
            </div>

            {/* Collapse toggle button */}
            {!isMobile ? (
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                className="p-1 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
                title="Collapse Sidebar"
                aria-label="Collapse Navigation"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
                title="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {myTeam && (
            <p className="text-[9px] text-slate-400 font-mono truncate pt-1 border-t border-slate-800/60">
              {myTeam.name}
            </p>
          )}
        </div>

        {repNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = repTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isLogOut) {
                  setShowLogoutConfirm(true);
                } else {
                  setRepTab(item.id);
                }
                if (isMobile) setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                item.isLogOut
                  ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 mt-2 border border-rose-500/20'
                  : isActive 
                  ? 'bg-lime-500 text-black font-extrabold shadow-md shadow-lime-950/40' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isActive 
                    ? 'bg-black text-lime-400' 
                    : item.id === 'leaderboard'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                    : 'bg-lime-950 text-lime-400 border border-lime-800/60'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Rep Bottom Session & Log Out */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2 mt-2">
        <div className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>Rate / Order:</span>
          <span className="text-lime-400 font-bold">₦{commissionRate.toLocaleString()}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/50 text-xs font-semibold transition cursor-pointer"
          title="Log Out of Session"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  // Render Collapsed Rep Sidebar (Icon-Only Rail)
  const renderCollapsedContent = () => (
    <div className="w-full flex-shrink-0 bg-[#090d16] border-r border-slate-800/80 flex flex-col h-full select-none justify-between items-center py-3 px-1.5">
      <div className="space-y-3 flex flex-col items-center w-full">
        {/* Expand Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebarCollapse}
          className="w-9 h-9 rounded-xl bg-slate-900 border border-lime-500/40 text-lime-400 hover:bg-lime-950/40 flex items-center justify-center transition cursor-pointer shadow-sm"
          title="Expand Rep Menu"
          aria-label="Expand Sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>

        {/* Centered Icons with Tooltips */}
        <div className="space-y-1.5 w-full flex flex-col items-center">
          {repNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = repTab === item.id;
            return (
              <div key={item.id} className="relative group flex items-center justify-center w-full">
                <button
                  type="button"
                  onClick={() => setRepTab(item.id)}
                  className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-lime-500 text-black font-extrabold shadow-md shadow-lime-950/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-lime-400 text-black text-[8px] font-black flex items-center justify-center font-mono">
                      •
                    </span>
                  )}
                </button>

                {/* Flyout Tooltip on Hover */}
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold z-50 whitespace-nowrap shadow-2xl flex items-center gap-1.5">
                  <span>{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Logout at Bottom */}
      <div className="pt-2 border-t border-slate-800/80 w-full flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition cursor-pointer"
          title="Log Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] bg-slate-950 select-none overflow-hidden">
      
      {/* 1. Mobile Drawer (Overlay when opened on small devices) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 shadow-2xl flex flex-col">
            {renderExpandedContent(true)}
          </div>
        </div>
      )}

      {/* 2. Desktop Persistent Sidebar (Collapsible to 68px) */}
      <aside 
        className={`hidden md:flex flex-shrink-0 bg-[#090d16] border-r border-slate-800/80 flex-col h-full select-none transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-[68px]' : 'w-56'
        }`}
      >
        {isSidebarCollapsed ? renderCollapsedContent() : renderExpandedContent(false)}
      </aside>

      {/* 3. Mobile Top Bar for Sales Rep (Visible only on mobile devices) */}
      <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-800 bg-[#090d16] shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="p-1.5 rounded-lg border border-slate-800 text-lime-400 hover:bg-slate-900 transition cursor-pointer"
            aria-label="Open Rep Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-white">
            Rep: {repNavItems.find(i => i.id === repTab)?.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-[10px] text-lime-400 font-mono font-bold">
            ₦{commissionRate.toLocaleString()}/order
          </span>
        </div>
      </div>

      {/* Main Rep Content Area */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
        
        {/* ============================================================ */}
        {/* TAB 1: MY DASHBOARD                                          */}
        {/* ============================================================ */}
        {repTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <span>Welcome back, {currentUser.name.split(' ')[0]} 👋</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Here is your personal pipeline, conversion rate, and estimated commission earnings.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white shadow transition cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Order</span>
                </button>
              </div>
            </div>

            {/* 4 Core Rep Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
                <p className="text-xs text-slate-400">Delivered Revenue</p>
                <p className="text-2xl font-bold font-mono text-white tabular-nums">
                  {formatCurrency(convertAmount(myRevenueNgn, currency), currency)}
                </p>
                <p className="text-[11px] text-slate-500">Collected at doorsteps</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
                <p className="text-xs text-slate-400">Conversion Rate</p>
                <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{myConversion}%</p>
                <p className="text-[11px] text-slate-500">{myDeliveredOrders.length} / {myOrders.length} delivered</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
                <p className="text-xs text-slate-400">Pending Actions</p>
                <p className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  {myPendingOrders.length} orders
                </p>
                <p className="text-[11px] text-slate-500">Requires customer call</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
                <p className="text-xs text-slate-400">Estimated Earnings</p>
                <p className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                  {formatCurrency(convertAmount(estimatedTotalEarningsNgn, currency), currency)}
                </p>
                <p className="text-[11px] text-slate-500">Fixed + ₦{commissionRate.toLocaleString()}/delivery</p>
              </div>
            </div>

            {/* Commission Opportunity Simulator */}
            <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-white text-sm">Commission Opportunity Simulator</h3>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  +{targetExtraDeliveries} more delivered orders
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Slide to see how many extra delivered orders you need to hit your monthly income goal:
              </p>

              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="2"
                  value={targetExtraDeliveries}
                  onChange={(e) => setTargetExtraDeliveries(Number(e.target.value))}
                  className="flex-1 accent-emerald-500 cursor-pointer"
                />
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-right min-w-[140px]">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Extra Commissions</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    +{formatCurrency(convertAmount(simulatedExtraCommissionNgn, currency), currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Orders Quick Table */}
            <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-sm">Assigned Orders Awaiting Follow-up</h3>
                <button
                  onClick={() => setRepTab('orders')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  View All Orders <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">City &amp; State</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myOrders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-slate-900/60 transition">
                        <td className="py-2.5 px-3 font-mono font-medium text-white">{o.orderNumber}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{o.customerName}</td>
                        <td className="py-2.5 px-3 text-slate-300">{o.deliveryCity}, {o.deliveryState}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            o.status === 'DELIVERED' 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : o.status === 'CONFIRMED'
                              ? 'bg-sky-950 text-sky-400 border border-sky-800/60'
                              : o.status === 'SCHEDULED'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                              : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                          {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setOrderToSchedule(o)}
                            className="px-2 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-700/80 text-xs text-sky-300 cursor-pointer inline-flex items-center gap-1"
                            title="Set delivery date"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Schedule</span>
                          </button>
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MY ORDERS                                             */}
        {/* ============================================================ */}
        {repTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">My Assigned Orders ({myOrders.length})</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm delivery address, payment readiness, and assign to regional dispatch agents.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white shadow cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Order</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#090d16] overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400">
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Delivery City</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No orders assigned to you yet.
                        </td>
                      </tr>
                    ) : (
                      myOrders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-900/60 transition">
                          <td className="py-3 px-4 font-mono font-medium text-white">{o.orderNumber}</td>
                          <td className="py-3 px-4 font-semibold text-slate-200">{o.customerName}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{o.customerPhone}</td>
                          <td className="py-3 px-4 text-slate-300">
                            <p>{o.deliveryCity}</p>
                            {o.distributorName ? (
                              <span className="text-[10px] text-lime-400 bg-lime-950/70 border border-lime-800/50 px-1.5 py-0.5 rounded font-mono inline-block mt-0.5">
                                Hub: {o.distributorName.split(' ')[0]}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Direct Delivery</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px]">
                            <span className={`px-2 py-0.5 rounded ${
                              o.status === 'DELIVERED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 
                              o.status === 'SCHEDULED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60' :
                              'bg-slate-800 text-slate-300'
                            }`}>
                              {o.status}
                            </span>
                            {(o.scheduledDate || o.status === 'SCHEDULED') && (
                              <button
                                type="button"
                                onClick={() => setOrderToSchedule(o)}
                                className="block mt-1 text-[10px] text-sky-400 hover:text-sky-300 font-mono transition cursor-pointer"
                                title="Click to change scheduled delivery date"
                              >
                                🗓 {o.scheduledDate || 'Set Date'}
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setOrderToSchedule(o)}
                              className="px-2 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-700/80 text-sky-300 text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                              title="Set or reschedule delivery date"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>Schedule</span>
                            </button>
                            <select
                              value={o.distributorId || ''}
                              onChange={(e) => assignOrderDistributor(o.id, e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-lime-300 focus:outline-none focus:border-lime-500 cursor-pointer"
                              title="Assign this order to Regional Distributor Hub"
                            >
                              <option value="">No Distributor</option>
                              {distributors.map(d => (
                                <option key={d.id} value={d.id}>
                                  {d.name.split(' ')[0]} (Distributor)
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: MY ABANDONED CARTS (NOW FULLY IMPLEMENTED)           */}
        {/* ============================================================ */}
        {repTab === 'abandoned' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header with Pipeline Title & Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-emerald-400" />
                  <span>Abandoned Cart Recovery Pipeline</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reach out to customers who filled the order form but dropped off. Every cart you convert earns you ₦{commissionRate.toLocaleString()} upon delivery!
                </p>
              </div>

              {/* Scope Switch: My Assigned vs Unassigned Leads Pool */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto gap-1">
                <button
                  type="button"
                  onClick={() => setCartScope('my')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    cartScope === 'my'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>My Assigned Carts</span>
                  <span className="font-mono text-[10px] px-1.5 rounded bg-slate-950 text-emerald-300">
                    {myCarts.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCartScope('unassigned')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    cartScope === 'unassigned'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Claim extra leads to earn more commissions"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Claimable Leads</span>
                  <span className="font-mono text-[10px] px-1.5 rounded bg-slate-950 text-amber-300">
                    {unassignedCarts.length}
                  </span>
                </button>
              </div>
            </div>

            {/* 4 Pipeline Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
                <span className="text-xs text-slate-400">Total In Pipeline</span>
                <p className="text-2xl font-bold font-mono text-white">
                  {cartScope === 'my' ? myCarts.length : unassignedCarts.length}
                </p>
                <span className="text-[10px] text-slate-500 font-mono">
                  {cartScope === 'my' ? 'Assigned to your queue' : 'Available to claim'}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
                <span className="text-xs text-slate-400">Recovered &amp; Converted</span>
                <p className="text-2xl font-bold font-mono text-emerald-400">
                  {myRecoveredCarts.length}
                </p>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {myRecoveryRate}% Conversion Rate
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
                <span className="text-xs text-slate-400">Potential Gross Value</span>
                <p className="text-xl sm:text-2xl font-bold font-mono text-amber-300 truncate">
                  {formatCurrency(convertAmount(myCartsValue, currency), currency)}
                </p>
                <span className="text-[10px] text-slate-500 font-mono">Unrecovered value</span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
                <span className="text-xs text-slate-400">Earnable Commissions</span>
                <p className="text-2xl font-bold font-mono text-cyan-400">
                  +₦{(myCarts.filter(c => c.status !== 'CONVERTED' && c.status !== 'LOST').length * commissionRate).toLocaleString()}
                </p>
                <span className="text-[10px] text-cyan-400/80 font-mono">₦{commissionRate.toLocaleString()}/order</span>
              </div>
            </div>

            {/* Quick WhatsApp Proven Recovery Scripts Drawer */}
            <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 sm:p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-xs sm:text-sm">High-Converting WhatsApp Recovery Scripts (Nigeria COD)</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">1-Click Copy &amp; Send</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {[
                  {
                    title: '1. Gentle Address & Assistance Check',
                    badge: 'MOST POLITE',
                    text: `Hello {customer_name}, this is ${currentUser.name} from BettaTraka. I noticed you were placing an order for {product_name}. Did you encounter any network interruption, or would you like me to finalize your doorstep delivery address for you?`
                  },
                  {
                    title: '2. Payment on Delivery Reassurance',
                    badge: 'OVERCOMES FEAR',
                    text: `Good day {customer_name}! Kindly note you do not pay any money online. Delivery is 100% Payment on Delivery (Cash or Transfer) upon physical inspection at your doorstep. Shall I dispatch your order?`
                  },
                  {
                    title: '3. Regional Hub Stock Reservation',
                    badge: 'URGENCY',
                    text: `Hello {customer_name}, our local dispatch hub has only 3 packages of {product_name} remaining for same-day delivery. I have temporarily held one for you—should we dispatch to you today?`
                  }
                ].map((script, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800/80">
                        <span className="font-semibold text-slate-200 text-xs">{script.title}</span>
                        <span className="text-[9px] font-mono font-bold text-emerald-400 px-1 rounded bg-emerald-950/80">
                          {script.badge}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed italic">
                        "{script.text}"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyScript(script.text, idx)}
                      className="w-full py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedScriptIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Template</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Pills & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['all', 'ASSIGNED', 'CONTACTED', 'CONVERTED', 'LOST'] as const).map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setCartStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      cartStatusFilter === status
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {status === 'all' ? 'All Carts' : status}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search customer, phone, city..."
                  value={cartSearch}
                  onChange={(e) => setCartSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Abandoned Carts Table */}
            <div className="rounded-2xl border border-slate-800 bg-[#090d16] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Cart #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Phone / WhatsApp</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Product Bundle</th>
                      <th className="py-3 px-4 text-right">Value</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Instant Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCarts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500 space-y-2">
                          <PhoneCall className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="font-semibold text-slate-400">No abandoned carts matching this filter.</p>
                          <p className="text-xs text-slate-500">
                            {cartScope === 'my' 
                              ? 'Switch to "Claimable Leads" above to claim unassigned carts!'
                              : 'All unassigned leads have been claimed! Good job team.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredCarts.map((cart) => {
                        const isConverted = cart.status === 'CONVERTED';
                        const isClaimable = !cart.assignedRepId || cart.status === 'ABANDONED';

                        const waMsg = `Hello ${cart.customerName}, this is ${currentUser.name} from BettaTraka. I noticed your order for ${cart.productName} (₦${cart.amount.toLocaleString()}). Payment is 100% Cash/Transfer on Delivery in ${cart.deliveryCity || 'your city'}. Can we confirm delivery today?`;
                        const waLink = createWhatsAppLink(cart.customerWhatsApp || cart.customerPhone, waMsg);

                        return (
                          <tr key={cart.id} className="hover:bg-slate-900/60 transition">
                            {/* Cart # */}
                            <td className="py-3 px-4 font-mono font-medium text-white whitespace-nowrap">
                              <span className="block">{cart.cartNumber}</span>
                              <span className="text-[10px] text-slate-500">{cart.lastActivity || 'Recent'}</span>
                            </td>

                            {/* Customer */}
                            <td className="py-3 px-4 font-semibold text-slate-200 whitespace-nowrap">
                              {cart.customerName}
                              {cart.notes && (
                                <span className="block text-[10px] font-normal text-slate-400 max-w-xs truncate" title={cart.notes}>
                                  Note: {cart.notes}
                                </span>
                              )}
                            </td>

                            {/* Phone & Direct Dial */}
                            <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                              <a 
                                href={`tel:${cart.customerPhone}`}
                                className="hover:text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 text-slate-500" />
                                <span>{cart.customerPhone}</span>
                              </a>
                            </td>

                            {/* Location */}
                            <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                              <span>{cart.deliveryCity || 'Nigeria'}</span>
                              <span className="block text-[10px] text-slate-500">{cart.deliveryState}</span>
                            </td>

                            {/* Product */}
                            <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={cart.productName}>
                              <span className="font-medium text-white block truncate">{cart.productName}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{cart.packageName}</span>
                            </td>

                            {/* Value */}
                            <td className="py-3 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                              {formatCurrency(convertAmount(cart.amount, currency), currency)}
                            </td>

                            {/* Status Selector */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <select
                                value={cart.status}
                                onChange={(e) => updateCartStatus(cart.id, e.target.value as CartStatus)}
                                className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                  cart.status === 'CONVERTED'
                                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                    : cart.status === 'CONTACTED'
                                    ? 'bg-sky-950 text-sky-400 border-sky-800'
                                    : cart.status === 'LOST' || cart.status === 'NOT INTERESTED'
                                    ? 'bg-rose-950 text-rose-400 border-rose-800'
                                    : 'bg-amber-950 text-amber-400 border-amber-800'
                                }`}
                              >
                                <option value="ASSIGNED">ASSIGNED</option>
                                <option value="CONTACTED">CONTACTED</option>
                                <option value="NO RESPONSE">NO RESPONSE</option>
                                <option value="NOT INTERESTED">NOT INTERESTED</option>
                                <option value="CONVERTED">CONVERTED</option>
                                <option value="LOST">LOST</option>
                              </select>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Claim Lead Button (if unassigned) */}
                                {isClaimable && (
                                  <button
                                    type="button"
                                    onClick={() => handleClaimLead(cart.id)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow"
                                    title="Claim this lead to your pipeline"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    <span>Claim Lead</span>
                                  </button>
                                )}

                                {/* WhatsApp 1-Click */}
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 transition cursor-pointer flex items-center gap-1 text-xs"
                                  title="Chat with customer on WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline font-semibold">WhatsApp</span>
                                </a>

                                {/* Convert to Live Order */}
                                {!isConverted ? (
                                  <button
                                    type="button"
                                    disabled={convertingCartId === cart.id}
                                    onClick={() => handleConvertCart(cart.id)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1 disabled:opacity-60"
                                    title="Convert cart into a live confirmed COD order"
                                  >
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>{convertingCartId === cart.id ? 'Converting...' : 'Convert to Order'}</span>
                                  </button>
                                ) : (
                                  <span className="px-2 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Order Created</span>
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: AGENT INVENTORY LOOKUP                                */}
        {/* ============================================================ */}
        {repTab === 'agent-stock' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Regional Agent Stock Lookup</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Check stock availability in your customer's state before confirming same-day dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map(ag => {
                const stocks = agentStock.filter(s => s.agentId === ag.id);
                return (
                  <div key={ag.id} className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-2 text-xs shadow">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-semibold text-white">{ag.name}</span>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                        {ag.primaryZone.split(' ')[0]}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {stocks.map(s => {
                        const prod = products.find(p => p.id === s.productId);
                        return (
                          <div key={s.productId} className="flex justify-between py-1 border-b border-slate-800/40">
                            <span className="text-slate-300 truncate max-w-[150px]">{prod?.name}</span>
                            <span className="font-mono font-bold text-white">{s.unitsHeld} in hub</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: REP LEADERBOARD (NOW FULLY IMPLEMENTED)              */}
        {/* ============================================================ */}
        {repTab === 'leaderboard' && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Header & Monthly Incentive Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Sales Rep Performance Leaderboard</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time national rankings, delivery conversion rates, and monthly closer bonuses.
                </p>
              </div>

              {/* Timeframe Filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setLeaderboardTimeframe('month')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    leaderboardTimeframe === 'month' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardTimeframe('week')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    leaderboardTimeframe === 'week' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardTimeframe('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    leaderboardTimeframe === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All-Time
                </button>
              </div>
            </div>

            {/* Monthly Grand Prize Challenge Card */}
            <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                  <Crown className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950 border border-amber-800 uppercase">
                      Active Challenge
                    </span>
                    <h3 className="font-extrabold text-white text-sm sm:text-base">Top Closer of the Month: ₦50,000 Cash Bonus</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    The representative with the highest number of door-delivered COD orders wins the monthly champion cash reward.
                  </p>
                </div>
              </div>

              {/* Personal Standing Pill */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-right shrink-0">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Your Current Rank</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  Rank #{myRank} <span className="text-xs text-slate-400 font-sans">of {repRankings.length} reps</span>
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {myDeliveredOrders.length} Delivered Orders
                </span>
              </div>
            </div>

            {/* Top 3 Podium Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {repRankings.slice(0, 3).map((rep, idx) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;

                return (
                  <div
                    key={rep.id}
                    className={`rounded-2xl border p-4 space-y-3 relative overflow-hidden transition ${
                      rep.isCurrent 
                        ? 'border-emerald-500 bg-emerald-950/20 shadow-emerald-950/50 shadow-lg' 
                        : isFirst
                        ? 'border-amber-500/40 bg-slate-900/90'
                        : 'border-slate-800 bg-[#090d16]'
                    }`}
                  >
                    {/* Top Podium Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isFirst ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                          isSecond ? 'bg-slate-700/40 text-slate-300 border border-slate-600' :
                          'bg-amber-900/30 text-amber-600 border border-amber-800/40'
                        }`}>
                          {isFirst ? <Trophy className="w-4 h-4 text-amber-400" /> : isSecond ? <Medal className="w-4 h-4 text-slate-300" /> : <Award className="w-4 h-4 text-amber-600" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">{rep.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{rep.team}</span>
                        </div>
                      </div>

                      {rep.isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse">
                          YOU
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Delivered</span>
                        <span className="text-base font-bold text-white">{rep.deliveredCount} orders</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Success Rate</span>
                        <span className="text-base font-bold text-emerald-400">{rep.conversion}%</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Gross Collected:</span>
                      <span className="text-white font-bold">{formatCurrency(convertAmount(rep.revenue, currency), currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Complete Leaderboard Table */}
            <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 space-y-3 shadow-xl">
              <h3 className="font-bold text-white text-sm">Full National Rep Standings</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Sales Representative</th>
                      <th className="py-3 px-4">Region / Hub</th>
                      <th className="py-3 px-4 text-center">Assigned Leads</th>
                      <th className="py-3 px-4 text-center">Delivered Orders</th>
                      <th className="py-3 px-4 text-center">Conversion Rate</th>
                      <th className="py-3 px-4 text-right">Delivered Cash (₦)</th>
                      <th className="py-3 px-4 text-right">Commissions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {repRankings.map((rep, idx) => {
                      const rankNum = idx + 1;
                      return (
                        <tr 
                          key={rep.id} 
                          className={`transition ${
                            rep.isCurrent 
                              ? 'bg-emerald-950/30 hover:bg-emerald-950/40 border-l-4 border-l-emerald-500' 
                              : 'hover:bg-slate-900/60'
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                            <span className={`w-6 h-6 rounded-lg inline-flex items-center justify-center text-xs ${
                              rankNum === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black' :
                              rankNum === 2 ? 'bg-slate-700/30 text-slate-300 border border-slate-700 font-bold' :
                              rankNum === 3 ? 'bg-amber-900/30 text-amber-600 border border-amber-800 font-bold' :
                              'text-slate-400'
                            }`}>
                              #{rankNum}
                            </span>
                          </td>

                          {/* Name */}
                          <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span>{rep.name}</span>
                              {rep.isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                  YOU
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Team */}
                          <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                            {rep.team}
                          </td>

                          {/* Assigned */}
                          <td className="py-3 px-4 text-center font-mono text-slate-300">
                            {rep.assignedCount}
                          </td>

                          {/* Delivered */}
                          <td className="py-3 px-4 text-center font-mono font-bold text-white">
                            {rep.deliveredCount}
                          </td>

                          {/* Conversion % */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full" 
                                  style={{ width: `${Math.min(100, rep.conversion)}%` }} 
                                />
                              </div>
                              <span className="font-mono font-bold text-emerald-400">{rep.conversion}%</span>
                            </div>
                          </td>

                          {/* Revenue */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                            {formatCurrency(convertAmount(rep.revenue, currency), currency)}
                          </td>

                          {/* Commissions */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                            {formatCurrency(convertAmount(rep.commissions, currency), currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: TEAM CHAT                                             */}
        {/* ============================================================ */}
        {repTab === 'chat' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Team Chat</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Coordinate with sales managers, fellow reps, and dispatch hubs in real-time.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl border border-slate-800 bg-[#090d16] max-h-96 overflow-y-auto shadow">
              {chatMessages.map(m => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-emerald-400">{m.userName}</span>
                    <span className="text-slate-500 font-mono">{m.timestamp}</span>
                  </div>
                  <p className="text-slate-200">{m.content}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Message your sales team or regional dispatch rider..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    sendChatMessage(chatInput.trim());
                    setChatInput('');
                  }
                }}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => { if (chatInput.trim()) { sendChatMessage(chatInput.trim()); setChatInput(''); } }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white shadow cursor-pointer transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: MY SETTINGS (NOW FULLY IMPLEMENTED)                  */}
        {/* ============================================================ */}
        {repTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-400" />
                  <span>Sales Representative Settings &amp; Profile</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage your lead routing availability, payout bank account, calling line, and default WhatsApp closing scripts.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-60"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{isSavingSettings ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>

            {/* 1. Lead Routing Availability (Round-Robin) */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#090d16] space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Round-Robin Lead Assignment Status</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control whether new order form submissions and leads are automatically assigned to your queue.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAvailableForLeads(!isAvailableForLeads)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    isAvailableForLeads
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isAvailableForLeads ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span>{isAvailableForLeads ? 'Active & Receiving Leads' : 'Paused / Offline'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Active Calling Shift:</span>
                  <input
                    type="text"
                    defaultValue="08:00 AM – 06:00 PM (West Africa Time)"
                    readOnly
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-300 text-xs"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Assigned Sales Team:</span>
                  <input
                    type="text"
                    defaultValue={myTeam?.name || 'Lagos Central Telemarketing Hub'}
                    readOnly
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 2. Rep Profile Information */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4 shadow-lg text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Personal Contact &amp; Calling Identity</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Work Email</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    readOnly
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-mono text-xs select-all"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Outbound Calling Phone Line</label>
                  <input
                    type="tel"
                    value={repPhone}
                    onChange={(e) => setRepPhone(e.target.value)}
                    placeholder="+234 812 456 7890"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500 text-xs"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">The phone number displayed to customers during order confirmation calls</span>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">WhatsApp Customer Outreach Number</label>
                  <input
                    type="tel"
                    value={repWhatsApp}
                    onChange={(e) => setRepWhatsApp(e.target.value)}
                    placeholder="+234 812 456 7890"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500 text-xs"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">Used for direct WhatsApp chat routing</span>
                </div>
              </div>
            </div>

            {/* 3. Commission Payout Bank Account Details */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4 shadow-lg text-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Commission Payout Bank Account</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  Verified Payout Method
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Nigerian Bank</label>
                  <select
                    value={payoutBank}
                    onChange={(e) => setPayoutBank(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs cursor-pointer"
                  >
                    <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                    <option value="Access Bank Plc">Access Bank Plc</option>
                    <option value="Zenith Bank Plc">Zenith Bank Plc</option>
                    <option value="Kuda Microfinance Bank">Kuda Microfinance Bank</option>
                    <option value="OPay Digital Services">OPay Digital Services</option>
                    <option value="Palmpay">Palmpay</option>
                    <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                    <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                    <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">NUBAN Account Number (10 Digits)</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Verified Account Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Commission Structure Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-white block">Your Agreed Pay Structure</span>
                  <span className="text-slate-400 text-[11px]">
                    Fixed Base Salary: <strong>₦{fixedSalary.toLocaleString()}</strong> + <strong>₦{commissionRate.toLocaleString()}</strong> commission per door-delivered COD order.
                  </span>
                </div>
                <div className="font-mono text-emerald-400 font-bold text-right text-xs">
                  Accumulated This Month: ₦{estimatedCommissionsNgn.toLocaleString()}
                </div>
              </div>
            </div>

            {/* 4. Custom WhatsApp Default Closing Template */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#090d16] space-y-3 shadow-lg text-xs">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Personal WhatsApp Greeting Template</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Pre-populates on 1-Click WhatsApp</span>
              </div>

              <textarea
                rows={3}
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
              />

              <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
                <span className="text-slate-500">Insert Dynamic Variables:</span>
                {['{customer_name}', '{product_name}', '{order_number}', '{rep_name}', '{delivery_city}'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCustomGreeting(prev => `${prev} ${tag}`)}
                    className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-mono cursor-pointer"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Alerts & Notification Preferences */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#090d16] space-y-3 shadow-lg text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <span>Audio &amp; Delivery Notifications</span>
              </h3>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-semibold text-white block">Audible Chime on New Order Assigned</span>
                    <span className="text-slate-400 text-[11px]">Play chime when an order is assigned to you via round-robin</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertSound}
                    onChange={(e) => setAlertSound(e.target.checked)}
                    className="rounded border-slate-800 text-emerald-600 focus:ring-0 w-4 h-4 bg-slate-900"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-semibold text-white block">Notify on Doorstep Delivery Completion</span>
                    <span className="text-slate-400 text-[11px]">Alert me the moment the dispatch agent marks my order DELIVERED</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={deliveryAlert}
                    onChange={(e) => setDeliveryAlert(e.target.checked)}
                    className="rounded border-slate-800 text-emerald-600 focus:ring-0 w-4 h-4 bg-slate-900"
                  />
                </label>
              </div>
            </div>

            {/* Bottom Save Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isSavingSettings ? 'Saving Settings...' : 'Save My Settings'}</span>
              </button>
            </div>
          </form>
        )}

      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Schedule Delivery Modal */}
      {orderToSchedule && (
        <ScheduleDeliveryModal
          order={orderToSchedule}
          onClose={() => setOrderToSchedule(null)}
        />
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateOrderModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Log Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Log Out of BettaTraka?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You will be signed out of your sales representative session.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
