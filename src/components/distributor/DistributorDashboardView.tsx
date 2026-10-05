import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount, createWhatsAppLink } from '../../utils/formatters';
import { OrderDetailsModal } from '../admin/OrderDetailsModal';
import { ScheduleDeliveryModal } from '../common/ScheduleDeliveryModal';
import { Order, OrderStatus, AbandonedCart, CartStatus, DistributorStockItem } from '../../types/crm';
import { 
  ShoppingCart, 
  PhoneCall, 
  MessageSquare, 
  Settings, 
  Package, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Eye,
  LogOut,
  Phone,
  Search,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Building,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  Send,
  ToggleLeft,
  ToggleRight,
  PanelLeftOpen,
  PanelLeftClose,
  Menu,
  X,
  Warehouse,
  Boxes,
  Truck,
  CheckCircle,
  Calendar
} from 'lucide-react';

export const DistributorDashboardView: React.FC = () => {
  const { 
    currentUser, 
    orders, 
    abandonedCarts, 
    products, 
    distributorStock,
    stockMovements,
    currency, 
    updateOrderStatus,
    users,
    chatMessages,
    sendChatMessage,
    setPersona,
    addNotification,
    updateCartStatus,
    updateUser,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    requestDistributorRestock,
    distributorActiveTab,
    setDistributorActiveTab,
    themeMode
  } = useCrm();

  const isLight = themeMode === 'light';

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToSchedule, setOrderToSchedule] = useState<Order | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockProductId, setRestockProductId] = useState(products[0]?.id || '');
  const [restockUnits, setRestockUnits] = useState<number>(50);
  const [restockUrgency, setRestockUrgency] = useState<'standard' | 'urgent'>('standard');
  const [restockNotes, setRestockNotes] = useState('');
  const [chatInput, setChatInput] = useState('');

  // Orders Tab Filters & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');

  // Abandoned Carts State
  const [cartSearch, setCartSearch] = useState('');
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);

  // Settings State
  const [phoneState, setPhoneState] = useState(currentUser.phone);
  const [bankNameState, setBankNameState] = useState(currentUser.bankName || 'Jaiz Bank PLC');
  const [accountNumberState, setAccountNumberState] = useState(currentUser.accountNumber || '0019283741');
  const [accountNameState, setAccountNameState] = useState(currentUser.accountName || 'Haruna Bello Distribution Ent');
  const [territoryState, setTerritoryState] = useState('Kano, Kaduna, Jos & Northern Hub');
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // -------------------------------------------------------------
  // DISTRIBUTOR DATA COMPUTATIONS
  // -------------------------------------------------------------
  const activeDistributor = useMemo(() => {
    if (currentUser.role === 'Distributor') return currentUser;
    const found = users.find(u => u.role === 'Distributor');
    return found || currentUser;
  }, [currentUser, users]);

  // Inventory assigned to this distributor
  const myStock = useMemo(() => {
    return distributorStock.filter(s => s.distributorId === activeDistributor.id);
  }, [distributorStock, activeDistributor.id]);

  const myTotalStockUnits = useMemo(() => {
    return myStock.reduce((sum, s) => sum + s.unitsHeld, 0);
  }, [myStock]);

  const myStockValueNgn = useMemo(() => {
    return myStock.reduce((sum, s) => {
      const prod = products.find(p => p.id === s.productId);
      return sum + (s.unitsHeld * (prod?.sellingPrice || 25000));
    }, 0);
  }, [myStock, products]);

  // Orders assigned to this distributor
  const myAssignedOrders = useMemo(() => {
    return orders.filter(o => 
      o.distributorId === activeDistributor.id || 
      (o.deliveryState && (o.deliveryState.includes('Kano') || o.deliveryState.includes('Kaduna') || o.deliveryState.includes('Jos')))
    );
  }, [orders, activeDistributor.id]);

  const myDeliveredOrders = useMemo(() => {
    return myAssignedOrders.filter(o => o.status === 'DELIVERED');
  }, [myAssignedOrders]);

  const myPendingOrders = useMemo(() => {
    return myAssignedOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  }, [myAssignedOrders]);

  const myDeliveredRevenueNgn = useMemo(() => {
    return myDeliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [myDeliveredOrders]);

  const distributorFeePerOrder = activeDistributor.commissionPerOrder || 2500;
  const myTotalFeeEarningsNgn = myDeliveredOrders.length * distributorFeePerOrder;

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return myAssignedOrders.filter(o => {
      const matchesSearch = 
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerPhone.includes(orderSearch) ||
        o.deliveryCity.toLowerCase().includes(orderSearch.toLowerCase());
      
      const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [myAssignedOrders, orderSearch, orderStatusFilter]);

  // Stock movements for this distributor
  const myMovements = useMemo(() => {
    return stockMovements.filter(m => 
      m.toLocation.toLowerCase().includes(activeDistributor.name.toLowerCase()) ||
      m.fromLocation.toLowerCase().includes(activeDistributor.name.toLowerCase()) ||
      m.type === 'Warehouse to Distributor' ||
      m.type === 'Distributor to Customer'
    );
  }, [stockMovements, activeDistributor.name]);

  // Abandoned carts for recovery in this territory
  const myCarts = useMemo(() => {
    return abandonedCarts.filter(c => 
      c.deliveryState?.includes('Kano') || 
      c.deliveryState?.includes('Kaduna') || 
      c.deliveryCity?.includes('Kano')
    );
  }, [abandonedCarts]);

  // Execute Restock Request
  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProductId || restockUnits <= 0) return;
    requestDistributorRestock(activeDistributor.id, restockProductId, Number(restockUnits), `Urgency: ${restockUrgency.toUpperCase()} | Note: ${restockNotes || 'Regular dispatch request'}`);
    setShowRestockModal(false);
    setRestockNotes('');
    addNotification({
      title: 'Restock Request Submitted',
      message: `Your request for ${restockUnits} units has been dispatched to Central Warehouse & Operations.`,
      type: 'success'
    });
  };

  // Execute Quick Status Change
  const handleQuickStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    addNotification({
      title: `Order Status Updated: ${status}`,
      message: `Order status changed to ${status}`,
      type: 'info'
    });
  };

  // Copy Script Handler
  const handleCopyScript = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptIndex(index);
    setTimeout(() => setCopiedScriptIndex(null), 2500);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(activeDistributor.id, {
      phone: phoneState,
      bankName: bankNameState,
      accountNumber: accountNumberState,
      accountName: accountNameState
    });
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 3000);
    addNotification({
      title: 'Distributor Profile Updated',
      message: 'Banking details and operational coverage saved.',
      type: 'success'
    });
  };

  // -------------------------------------------------------------
  // NAVIGATION ITEMS - EXACTLY PER SPEC:
  // - NO create order button
  // - NO agent inventory
  // - NO rep leaderboard
  // - INCLUDE sign out
  // - INCLUDE inventory
  // -------------------------------------------------------------
  const distributorNavItems = [
    { id: 'dashboard', label: 'Distributor Dashboard', icon: TrendingUp },
    { id: 'orders', label: 'Assigned Orders', icon: ShoppingCart, badge: myPendingOrders.length },
    { id: 'inventory', label: 'Inventory', icon: Warehouse, badge: `${myTotalStockUnits} units` },
    { id: 'abandoned', label: 'Customer Follow-ups', icon: PhoneCall, badge: myCarts.filter(c => c.status === 'ASSIGNED').length },
    { id: 'chat', label: 'Dispatch & Team Chat', icon: MessageSquare },
    { id: 'settings', label: 'Distributor Settings', icon: Settings },
    { id: 'log-out', label: 'Log Out', icon: LogOut, isSignOut: true }
  ];

  // Render Expanded Sidebar
  const renderExpandedContent = (isMobile = false) => (
    <div className={`w-full flex-shrink-0 border-r flex flex-col h-full select-none justify-between p-3 ${
      isLight ? 'bg-white border-slate-200' : 'bg-[#090d16] border-slate-800/80'
    }`}>
      {/* Scrollable Nav Area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
        {/* User Profile Mini Badge & Collapse Toggle */}
        <div className={`p-2.5 rounded-xl border mb-3 space-y-1 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${
                isLight ? 'bg-lime-100 text-lime-800 border-lime-300' : 'bg-lime-950 border-lime-500/40 text-lime-400'
              }`}>
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-semibold text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{activeDistributor.name}</p>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLight ? 'bg-lime-600' : 'bg-lime-400'}`} />
                  <p className={`text-[10px] font-mono truncate ${isLight ? 'text-lime-700' : 'text-lime-400'}`}>
                    Distributor Hub (Online)
                  </p>
                </div>
              </div>
            </div>

            {/* Collapse toggle button */}
            {!isMobile ? (
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                className={`p-1 rounded-lg border transition cursor-pointer ml-1 ${
                  isLight ? 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Collapse Sidebar"
                aria-label="Collapse Navigation"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`p-1 rounded-lg border transition cursor-pointer ml-1 ${
                  isLight ? 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className={`text-[9px] font-mono truncate pt-1 border-t ${
            isLight ? 'text-slate-500 border-slate-200' : 'text-slate-400 border-slate-800/60'
          }`}>
            {territoryState}
          </p>
        </div>

        {distributorNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = distributorActiveTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isSignOut) {
                  setShowLogoutConfirm(true);
                } else {
                  setDistributorActiveTab(item.id);
                }
                if (isMobile) setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                item.isSignOut
                  ? isLight
                    ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 mt-2 border border-rose-200'
                    : 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 mt-2 border border-rose-500/20'
                  : isActive 
                  ? isLight
                    ? 'bg-lime-100 text-lime-950 font-extrabold border border-lime-300 shadow-xs'
                    : 'bg-lime-500 text-black font-extrabold shadow-md shadow-lime-950/40' 
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                    ? (isLight ? 'bg-lime-200 text-lime-950 border border-lime-400' : 'bg-black text-lime-400') 
                    : (isLight ? 'bg-lime-100 text-lime-800 border border-lime-300' : 'bg-lime-950 text-lime-400 border border-lime-800/60')
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Render Collapsed Sidebar (Icon-Only Rail)
  const renderCollapsedContent = () => (
    <div className={`w-full flex-shrink-0 border-r flex flex-col h-full select-none justify-between items-center py-3 px-1.5 ${
      isLight ? 'bg-white border-slate-200' : 'bg-[#090d16] border-slate-800/80'
    }`}>
      <div className="space-y-3 flex flex-col items-center w-full">
        {/* Expand Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebarCollapse}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition cursor-pointer shadow-sm ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-lime-500/40 text-lime-400 hover:bg-lime-950/40'
          }`}
          title="Expand Distributor Menu"
          aria-label="Expand Sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>

        {/* Centered Icons with Tooltips */}
        <div className="space-y-1.5 w-full flex flex-col items-center">
          {distributorNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = distributorActiveTab === item.id;
            return (
              <div key={item.id} className="relative group flex items-center justify-center w-full">
                <button
                  type="button"
                  onClick={() => {
                    if (item.isSignOut) {
                      setShowLogoutConfirm(true);
                    } else {
                      setDistributorActiveTab(item.id);
                    }
                  }}
                  className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    item.isSignOut
                      ? (isLight ? 'text-rose-600 hover:bg-rose-50 mt-2' : 'text-rose-400 hover:bg-rose-500/20 mt-2')
                      : isActive
                      ? (isLight ? 'bg-lime-100 text-lime-950 font-bold border border-lime-400 shadow-xs' : 'bg-lime-500 text-black font-extrabold shadow-md shadow-lime-950/50')
                      : (isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-900')
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.badge !== undefined && (
                    <span className={`absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-black flex items-center justify-center font-mono ${
                      isLight ? 'bg-emerald-600 text-white' : 'bg-lime-400 text-black'
                    }`}>
                      {item.badge.toString().slice(0, 3)}
                    </span>
                  )}
                </button>

                {/* Flying Hover Tooltip */}
                <div className={`absolute left-full ml-2 px-2.5 py-1 rounded-md border text-xs font-semibold shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                }`}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex-1 flex overflow-hidden ${isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-black text-white'}`}>
      {/* ------------------------------------------------------------- */}
      {/* 1. DESKTOP SIDEBAR (Collapsible between 224px and 68px)        */}
      {/* ------------------------------------------------------------- */}
      <aside 
        className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-200 select-none ${
          isSidebarCollapsed ? 'w-[68px]' : 'w-56'
        }`}
      >
        {isSidebarCollapsed ? renderCollapsedContent() : renderExpandedContent(false)}
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. MOBILE DRAWER SIDEBAR                                      */}
      {/* ------------------------------------------------------------- */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderExpandedContent(true)}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MAIN CONTENT CONTAINER                                     */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ============================================================ */}
        {/* TAB 1: DISTRIBUTOR DASHBOARD                                 */}
        {/* ============================================================ */}
        {distributorActiveTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header with territory info and Quick Restock button (NO create order button) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>Welcome, {activeDistributor.name} 👋</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Regional Distribution Center & Dispatch Hub • Coverage: <span className="text-lime-400 font-semibold">{territoryState}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRestockModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-600 hover:bg-lime-500 font-bold text-xs text-black shadow transition cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Request Warehouse Restock</span>
                </button>
              </div>
            </div>

            {/* 4 Core Distributor Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
                <p className="text-xs text-slate-400">Allocated Inventory</p>
                <p className="text-2xl font-bold font-mono text-white tabular-nums">
                  {myTotalStockUnits} <span className="text-sm font-normal text-slate-400">units</span>
                </p>
                <p className="text-[11px] text-lime-400">
                  Valued at {formatCurrency(convertAmount(myStockValueNgn, currency), currency)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
                <p className="text-xs text-slate-400">Regional Orders</p>
                <p className="text-2xl font-bold font-mono text-lime-400 tabular-nums">
                  {myAssignedOrders.length}
                </p>
                <p className="text-[11px] text-slate-400">
                  {myPendingOrders.length} in dispatch pipeline
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
                <p className="text-xs text-slate-400">Delivered Volume</p>
                <p className="text-2xl font-bold font-mono text-white tabular-nums">
                  {myDeliveredOrders.length}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatCurrency(convertAmount(myDeliveredRevenueNgn, currency), currency)} collected COD
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
                <p className="text-xs text-slate-400">Distributor Fee Earned</p>
                <p className="text-2xl font-bold font-mono text-white tabular-nums">
                  {formatCurrency(convertAmount(myTotalFeeEarningsNgn, currency), currency)}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  @ ₦{distributorFeePerOrder.toLocaleString()} / order
                </p>
              </div>
            </div>

            {/* Allocated Products Overview & Quick Order Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Regional Stock Overview */}
              <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-lime-400" />
                    <h2 className="text-sm font-bold text-white">Stock in Custody ({myStock.length} SKUs)</h2>
                  </div>
                  <button 
                    onClick={() => setDistributorActiveTab('inventory')}
                    className="text-xs text-lime-400 hover:underline font-medium"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {myStock.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
                      No stock allocated yet. Contact warehouse admin.
                    </p>
                  ) : (
                    myStock.map(stock => {
                      const prod = products.find(p => p.id === stock.productId);
                      const isLow = stock.unitsHeld <= 20;
                      return (
                        <div key={stock.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold text-white">
                            <span className="truncate pr-2">{prod?.name || stock.productName}</span>
                            <span className={`font-mono px-2 py-0.5 rounded text-[11px] ${
                              isLow ? 'bg-amber-950 text-amber-400 border border-amber-800/60' : 'bg-lime-950 text-lime-400 border border-lime-800/60'
                            }`}>
                              {stock.unitsHeld} units
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>SKU: {prod?.sku || 'SKU-GEN'}</span>
                            <span className="font-mono text-slate-300">
                              {formatCurrency(convertAmount((prod?.sellingPrice || 25000) * stock.unitsHeld, currency), currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Priority Assigned Orders Queue */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#090d16] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-lime-400" />
                    <h2 className="text-sm font-bold text-white">Orders Awaiting Dispatch / Delivery ({myPendingOrders.length})</h2>
                  </div>
                  <button 
                    onClick={() => setDistributorActiveTab('orders')}
                    className="text-xs text-lime-400 hover:underline font-medium"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                        <th className="py-2.5 px-3">Order #</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Destination</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {myPendingOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            No pending orders. All regional orders have been delivered!
                          </td>
                        </tr>
                      ) : (
                        myPendingOrders.slice(0, 5).map(o => (
                          <tr key={o.id} className="hover:bg-slate-900/60 transition">
                            <td className="py-2.5 px-3 font-mono font-medium text-white">{o.orderNumber}</td>
                            <td className="py-2.5 px-3">
                              <p className="font-semibold text-slate-200">{o.customerName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{o.customerPhone}</p>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">
                              {o.deliveryCity}, {o.deliveryState}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px]">
                              <span className={`px-2 py-0.5 rounded ${
                                o.status === 'DELIVERED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                                o.status === 'DISPATCHED' ? 'bg-blue-950 text-blue-400 border border-blue-800/60' :
                                o.status === 'CONFIRMED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60' :
                                o.status === 'SCHEDULED' ? 'bg-sky-950 text-sky-400 border border-sky-800/60' :
                                'bg-slate-800 text-slate-300'
                              }`}>
                                {o.status}
                              </span>
                              {(o.scheduledDate || o.status === 'SCHEDULED') && (
                                <button
                                  type="button"
                                  onClick={() => setOrderToSchedule(o)}
                                  className="block mt-1 text-[10px] text-sky-400 hover:text-sky-300 font-mono transition cursor-pointer"
                                  title="Click to set or change delivery date"
                                >
                                  🗓 {o.scheduledDate || 'Set Date'}
                                </button>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                              {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setOrderToSchedule(o)}
                                className="px-2 py-1 rounded bg-sky-950/80 hover:bg-sky-900 border border-sky-700/80 text-sky-300 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                                title="Schedule customer delivery date"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Schedule</span>
                              </button>
                              {o.status !== 'DISPATCHED' && (
                                <button
                                  onClick={() => handleQuickStatus(o.id, 'DISPATCHED')}
                                  className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-[11px] font-semibold cursor-pointer"
                                  title="Mark as Dispatched from Regional Center"
                                >
                                  Dispatch
                                </button>
                              )}
                              <button
                                onClick={() => handleQuickStatus(o.id, 'DELIVERED')}
                                className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-[11px] font-semibold cursor-pointer"
                                title="Mark as Delivered to Customer"
                              >
                                Deliver
                              </button>
                              <button
                                onClick={() => setSelectedOrder(o)}
                                className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] font-semibold cursor-pointer"
                              >
                                Details
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
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ASSIGNED ORDERS                                       */}
        {/* ============================================================ */}
        {distributorActiveTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Regional Assigned Orders ({myAssignedOrders.length})</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Orders routed to your regional hub by Managers, Team Leads, and Sales Reps.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search customer, city, #"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-500 w-44 sm:w-56"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-500 font-mono"
                >
                  <option value="all">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="DISPATCHED">DISPATCHED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#090d16] overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400">
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Address / Destination</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No matching orders found for your distribution center.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-900/60 transition">
                          <td className="py-3 px-4 font-mono font-medium text-white">{o.orderNumber}</td>
                          <td className="py-3 px-4 font-semibold text-slate-200">{o.customerName}</td>
                          <td className="py-3 px-4 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300">{o.customerPhone}</span>
                              <a 
                                href={createWhatsAppLink(o.customerWhatsApp || o.customerPhone, `Hello ${o.customerName}, this is ${activeDistributor.name} regarding your order #${o.orderNumber}. We are preparing to dispatch to you in ${o.deliveryCity}.`)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/80 transition"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3" />
                              </a>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <p className="truncate max-w-[200px]">{o.deliveryAddress}</p>
                            <p className="text-[10px] text-slate-400">{o.deliveryCity}, {o.deliveryState}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                            {o.items.map(i => `${i.quantity}x ${i.productName.split(' ')[0]}`).join(', ')}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px]">
                            <span className={`px-2 py-0.5 rounded ${
                              o.status === 'DELIVERED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                              o.status === 'DISPATCHED' ? 'bg-blue-950 text-blue-400 border border-blue-800/60' :
                              o.status === 'CONFIRMED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60' :
                              o.status === 'SCHEDULED' ? 'bg-sky-950 text-sky-400 border border-sky-800/60' :
                              'bg-slate-800 text-slate-300'
                            }`}>
                              {o.status}
                            </span>
                            {(o.scheduledDate || o.status === 'SCHEDULED') && (
                              <button
                                type="button"
                                onClick={() => setOrderToSchedule(o)}
                                className="block mt-1 text-[10px] text-sky-400 hover:text-sky-300 font-mono transition cursor-pointer"
                                title="Click to set or change delivery date"
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
                              className="px-2 py-1 rounded bg-sky-950/80 hover:bg-sky-900 border border-sky-700/80 text-sky-300 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                              title="Schedule customer delivery date"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>Schedule</span>
                            </button>
                            {o.status !== 'DISPATCHED' && o.status !== 'DELIVERED' && (
                              <button
                                onClick={() => handleQuickStatus(o.id, 'DISPATCHED')}
                                className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold cursor-pointer"
                                title="Dispatch order from regional center"
                              >
                                Dispatch
                              </button>
                            )}
                            {o.status !== 'DELIVERED' && (
                              <button
                                onClick={() => handleQuickStatus(o.id, 'DELIVERED')}
                                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                                title="Confirm door-step delivery & COD payment"
                              >
                                Deliver
                              </button>
                            )}
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
        {/* TAB 3: INVENTORY (ALLOCATED DISTRIBUTOR STOCK)               */}
        {/* ============================================================ */}
        {distributorActiveTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-lime-400" />
                  <span>Regional Inventory & Custody</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Products allocated to your regional hub by Admin and Inventory Manager.
                </p>
              </div>

              <button
                onClick={() => setShowRestockModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-extrabold text-xs shadow-md transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>+ Request Restock from Warehouse</span>
              </button>
            </div>

            {/* Inventory Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-1">
                <p className="text-xs text-slate-400">Total Units in Custody</p>
                <p className="text-2xl font-bold font-mono text-white tabular-nums">
                  {myTotalStockUnits} units
                </p>
                <p className="text-[11px] text-lime-400">Ready for regional dispatch</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-1">
                <p className="text-xs text-slate-400">Total Inventory Value</p>
                <p className="text-2xl font-bold font-mono text-white tabular-nums">
                  {formatCurrency(convertAmount(myStockValueNgn, currency), currency)}
                </p>
                <p className="text-[11px] text-slate-400">Selling value in inventory</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-1">
                <p className="text-xs text-slate-400">Active SKUs Held</p>
                <p className="text-2xl font-bold font-mono text-lime-400 tabular-nums">
                  {myStock.length} Products
                </p>
                <p className="text-[11px] text-slate-400">Managed in regional center</p>
              </div>
            </div>

            {/* Allocated Products Table */}
            <div className="rounded-2xl border border-slate-800 bg-[#090d16] overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <h3 className="text-sm font-bold text-white">Allocated Product Batches</h3>
                <span className="text-xs text-slate-400 font-mono">{myStock.length} Batches Held</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 bg-slate-950/40">
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Allocated Date</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Units Held</th>
                      <th className="py-3 px-4 text-right">Batch Value</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myStock.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No stock allocated to your distribution hub yet. The Admin or Inventory Manager can assign units from Central Warehouse.
                        </td>
                      </tr>
                    ) : (
                      myStock.map(item => {
                        const prod = products.find(p => p.id === item.productId);
                        const isLow = item.unitsHeld <= 25;
                        const valueNgn = (prod?.sellingPrice || 25000) * item.unitsHeld;
                        return (
                          <tr key={item.id} className="hover:bg-slate-900/60 transition">
                            <td className="py-3 px-4 font-semibold text-white">
                              {prod?.name || item.productName}
                              {item.notes && (
                                <p className="text-[10px] text-slate-400 font-normal">{item.notes}</p>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-300">{prod?.sku || 'SKU-REG'}</td>
                            <td className="py-3 px-4 text-slate-400">{prod?.category || 'Wellness'}</td>
                            <td className="py-3 px-4 font-mono text-slate-400">{item.allocatedDate}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                isLow ? 'bg-amber-950 text-amber-400 border border-amber-800/60' : 'bg-lime-950 text-lime-400 border border-lime-800/60'
                              }`}>
                                {isLow ? 'LOW STOCK' : 'IN STOCK'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                              {item.unitsHeld}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-lime-400 font-semibold">
                              {formatCurrency(convertAmount(valueNgn, currency), currency)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setRestockProductId(item.productId);
                                  setShowRestockModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-lime-600/20 text-lime-400 hover:bg-lime-600/30 text-xs font-semibold cursor-pointer border border-lime-500/30"
                              >
                                Request More
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Regional Stock Movements & Dispatch History */}
            <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-lime-400" />
                <span>Regional Stock Transfer & Fulfillment Activity</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Movement Type</th>
                      <th className="py-2.5 px-3">From</th>
                      <th className="py-2.5 px-3">To</th>
                      <th className="py-2.5 px-3 text-right">Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myMovements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500">
                          No recent movement logs for this distribution center.
                        </td>
                      </tr>
                    ) : (
                      myMovements.map(m => (
                        <tr key={m.id} className="hover:bg-slate-900/60 transition">
                          <td className="py-2 px-3 font-mono text-slate-400">{m.date}</td>
                          <td className="py-2 px-3 font-semibold text-slate-200">{m.productName}</td>
                          <td className="py-2 px-3 font-mono text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {m.type}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-400">{m.fromLocation}</td>
                          <td className="py-2 px-3 text-slate-300 font-medium">{m.toLocation}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-lime-400">
                            +{m.quantity}
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
        {/* TAB 4: CUSTOMER FOLLOW-UPS (ABANDONED CARTS)                 */}
        {/* ============================================================ */}
        {distributorActiveTab === 'abandoned' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Regional Customer Inquiries ({myCarts.length})</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customers in your delivery zone who left inquiries or pending checkout carts.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#090d16] overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400">
                      <th className="py-3 px-4">Cart #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Phone / WhatsApp</th>
                      <th className="py-3 px-4">City / Area</th>
                      <th className="py-3 px-4">Product Interest</th>
                      <th className="py-3 px-4 text-right">Value</th>
                      <th className="py-3 px-4 text-right">Quick Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myCarts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No pending regional abandoned carts right now.
                        </td>
                      </tr>
                    ) : (
                      myCarts.map((c, i) => (
                        <tr key={c.id} className="hover:bg-slate-900/60 transition">
                          <td className="py-3 px-4 font-mono text-white">{c.cartNumber}</td>
                          <td className="py-3 px-4 font-semibold text-slate-200">{c.customerName}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{c.customerPhone}</td>
                          <td className="py-3 px-4 text-slate-400">{c.deliveryCity || 'Northern Zone'}</td>
                          <td className="py-3 px-4 text-slate-300 font-medium">{c.productName}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            {formatCurrency(convertAmount(c.amount, currency), currency)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <a
                              href={createWhatsAppLink(c.customerWhatsApp || c.customerPhone, `Hello ${c.customerName}, this is ${activeDistributor.name} from the Regional Distribution Center. We noticed you were interested in ${c.productName}. We have it in stock locally for same-day delivery!`)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
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
        {/* TAB 5: DISPATCH & TEAM CHAT                                  */}
        {/* ============================================================ */}
        {distributorActiveTab === 'chat' && (
          <div className="space-y-4 animate-in fade-in h-[70vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white">Operations & Dispatch Chat</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Communicate with Warehouse Managers, Admins, and Sales Reps about waybills, arrivals, and consignments.
                </p>
              </div>
            </div>

            <div className="flex-1 rounded-2xl border border-slate-800 bg-[#090d16] flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-lime-400">{msg.userName} ({msg.userRole})</span>
                      <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-200">{msg.content}</p>
                  </div>
                ))}
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatInput.trim()) return;
                  sendChatMessage(chatInput.trim());
                  setChatInput('');
                }}
                className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type message to Warehouse & Dispatch team..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-lime-500 hover:bg-lime-400 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: DISTRIBUTOR SETTINGS                                  */}
        {/* ============================================================ */}
        {distributorActiveTab === 'settings' && (
          <div className="space-y-6 max-w-2xl animate-in fade-in">
            <div className="pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Distributor Profile & Remittance Banking</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set your operating distribution zone, contact phone, and payout bank accounts for door-step COD remittances.
              </p>
            </div>

            {savedSettingsSuccess && (
              <div className="p-3 rounded-xl bg-lime-950/60 border border-lime-500/40 text-lime-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile and banking information updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-lime-400" />
                  <span>Identity & Coverage Territory</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Distributor Name</label>
                    <input
                      type="text"
                      disabled
                      value={activeDistributor.name}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Official Email</label>
                    <input
                      type="email"
                      disabled
                      value={activeDistributor.email}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={phoneState}
                      onChange={(e) => setPhoneState(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-lime-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Coverage Territory</label>
                    <input
                      type="text"
                      value={territoryState}
                      onChange={(e) => setTerritoryState(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-lime-500"
                    />
                  </div>
                </div>
              </div>

              {/* Banking & Remittances */}
              <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-lime-400" />
                  <span>Payout & Commission Account</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankNameState}
                      onChange={(e) => setBankNameState(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-lime-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={accountNumberState}
                      onChange={(e) => setAccountNumberState(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-lime-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-300 block mb-1">Account Name</label>
                    <input
                      type="text"
                      value={accountNameState}
                      onChange={(e) => setAccountNameState(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-lime-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-extrabold text-xs shadow transition cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODALS & DIALOGS                                           */}
      {/* ------------------------------------------------------------- */}

      {/* Restock Request Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-lime-400" />
                <span>Request Warehouse Restock</span>
              </h3>
              <button 
                onClick={() => setShowRestockModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Product SKU</label>
                <select
                  value={restockProductId}
                  onChange={(e) => setRestockProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-lime-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) • {p.stockWarehouse} units in central warehouse
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Requested Units</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={restockUnits}
                  onChange={(e) => setRestockUnits(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-lime-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Urgency Level</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRestockUrgency('standard')}
                    className={`p-2 rounded-xl border text-center font-semibold cursor-pointer ${
                      restockUrgency === 'standard' 
                        ? 'border-lime-500 bg-lime-950/60 text-lime-400' 
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    Standard (2-3 Days)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestockUrgency('urgent')}
                    className={`p-2 rounded-xl border text-center font-semibold cursor-pointer ${
                      restockUrgency === 'urgent' 
                        ? 'border-rose-500 bg-rose-950/60 text-rose-400' 
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    Urgent (Next Day)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Waybill Instructions / Note</label>
                <textarea
                  rows={2}
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  placeholder="e.g. Send via Peace Mass Transit or GIG Logistics to Kano Park..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-lime-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-extrabold"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Log Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Log Out of Distributor Session?</h3>
              <p className="text-xs text-slate-400 mt-1">
                You will be redirected back to the login portal. All local changes are saved automatically.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  setPersona('marketing');
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
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
