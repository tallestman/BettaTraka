import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Order, OrderStatus, CurrencyCode } from '../../types/crm';
import { formatCurrency, convertAmount, createWhatsAppLink, formatDate } from '../../utils/formatters';
import { OrderDetailsModal } from './OrderDetailsModal';
import { CreateOrderModal } from './CreateOrderModal';
import { ScheduleDeliveryModal } from '../common/ScheduleDeliveryModal';
import { 
  Plus, 
  Download, 
  Trash2, 
  MessageSquare, 
  Search, 
  Copy, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Package, 
  TrendingUp, 
  Calendar, 
  CheckSquare, 
  Square,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { 
    orders, 
    deletedOrders, 
    currency, 
    setCurrency,
    products, 
    users,
    updateOrderStatus,
    scheduleOrderDelivery,
    deleteOrder,
    themeMode,
    addNotification
  } = useCrm();

  const isLight = themeMode === 'light';

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [orderToSchedule, setOrderToSchedule] = useState<Order | null>(null);
  const [showBulkScheduleModal, setShowBulkScheduleModal] = useState(false);
  const [bulkScheduleDate, setBulkScheduleDate] = useState<string>('2026-10-02');
  const [bulkScheduleTime, setBulkScheduleTime] = useState<string>('Morning (8:00 AM - 12:00 PM)');
  
  // Date period state matching orders.png
  const [datePeriod, setDatePeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  // 3 Full-width Collapsible Accordion Dropdown States (One column per line, with a drop down)
  const [showRevenueOpportunity, setShowRevenueOpportunity] = useState(false);
  const [showOrdersByProduct, setShowOrdersByProduct] = useState(false);
  const [showTopStates, setShowTopStates] = useState(false);

  // Selected orders checkbox state
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [repFilter, setRepFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');

  // Stats calculation
  const totalOrdersCount = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
  const deliveryRate = totalOrdersCount > 0 
    ? Math.round((deliveredOrders.length / totalOrdersCount) * 100) 
    : 0;
  const totalRevenueNgn = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Today-specific handled orders
  const todayOrders = useMemo(() => {
    return orders.filter(o => {
      const createdStr = o.createdAt ? o.createdAt.split('T')[0] : '';
      return createdStr === '2026-10-01' || o.scheduledDate?.includes('2026-10-01') || o.scheduledDate?.includes('Oct 01');
    });
  }, [orders]);

  const handledCount = datePeriod === 'today' ? (todayOrders.length > 0 ? todayOrders.length : 0) : orders.length;

  // Pipeline Revenue Opportunity breakdown
  const confirmedOrders = useMemo(() => orders.filter(o => o.status === 'CONFIRMED'), [orders]);
  const confirmedRev = useMemo(() => confirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0), [confirmedOrders]);

  const dispatchedOrders = useMemo(() => orders.filter(o => o.status === 'DISPATCHED'), [orders]);
  const dispatchedRev = useMemo(() => dispatchedOrders.reduce((sum, o) => sum + o.totalAmount, 0), [dispatchedOrders]);

  const scheduledOrders = useMemo(() => orders.filter(o => o.status === 'SCHEDULED' || o.scheduledDate), [orders]);
  const scheduledRev = useMemo(() => scheduledOrders.reduce((sum, o) => sum + o.totalAmount, 0), [scheduledOrders]);

  const totalOpportunityRev = confirmedRev + dispatchedRev + scheduledRev;

  // Top states breakdown
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      counts[o.deliveryState] = (counts[o.deliveryState] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  // Product counts
  const productCounts = useMemo(() => {
    const counts: Record<string, { orders: number; units: number }> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        if (!counts[item.productName]) counts[item.productName] = { orders: 0, units: 0 };
        counts[item.productName].orders += 1;
        counts[item.productName].units += item.quantity;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1].units - a[1].units);
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const cleanOrderNum = o.orderNumber.replace(/^#/, '');
      const matchesSearch = 
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cleanOrderNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerPhone.includes(searchQuery) ||
        o.deliveryCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.deliveryState.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const matchesSource = sourceFilter === 'ALL' || o.source === sourceFilter;
      const matchesLocation = locationFilter === 'ALL' || o.deliveryState === locationFilter;
      const matchesRep = repFilter === 'ALL' || o.salesRepId === repFilter;
      const matchesProduct = productFilter === 'ALL' || o.items.some(i => i.productId === productFilter || i.productName.toLowerCase().includes(productFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesSource && matchesLocation && matchesRep && matchesProduct;
    });
  }, [orders, searchQuery, statusFilter, sourceFilter, locationFilter, repFilter, productFilter]);

  // Checkbox helpers
  const allFilteredSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedOrderIds.has(o.id));
  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const toggleSelectOrder = (id: string) => {
    const updated = new Set(selectedOrderIds);
    if (updated.has(id)) updated.delete(id);
    else updated.add(id);
    setSelectedOrderIds(updated);
  };

  const copyOrder = (order: Order) => {
    const text = `Order #${order.orderNumber}: ${order.customerName} (${order.customerPhone}), Total: ₦${order.totalAmount.toLocaleString()}, Status: ${order.status}`;
    navigator.clipboard.writeText(text);
    alert(`Copied ${order.orderNumber} summary to clipboard!`);
  };

  const exportCSV = () => {
    const rows = [
      ['Order Number', 'Customer Name', 'Phone', 'State', 'City', 'Total Amount', 'Currency', 'Status', 'Sales Rep', 'Date'],
      ...filteredOrders.map(o => [
        o.orderNumber,
        o.customerName,
        o.customerPhone,
        o.deliveryState,
        o.deliveryCity,
        o.totalAmount,
        o.currency,
        o.status,
        o.salesRepName || 'Unassigned',
        o.createdAt
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BettaTraka_Orders_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueStates = Array.from(new Set(orders.map(o => o.deliveryState))).filter(Boolean);
  const uniqueSources = Array.from(new Set(orders.map(o => o.source))).filter(Boolean);
  const salesReps = users.filter(u => u.role === 'Sales Representative' || u.id.startsWith('user-rep') || u.role === 'Admin');

  return (
    <div className={`p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in ${
      isLight ? 'text-slate-900' : 'text-slate-100'
    }`}>
      
      {/* 1. Top Header (orders.png) */}
      <div className="space-y-1">
        <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          Orders Management
        </h1>
        <p className={`text-xs sm:text-sm ${
          isLight ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Track and manage your assigned customer orders in real-time
        </p>
      </div>

      {/* 2. Date Tabs, Date Range, Currency & Action Buttons Bar (orders.png) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Today / This Week / This Month / This Year + Date Range + Currency */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Pills */}
          <div className={`flex items-center gap-1 p-1 rounded-xl text-xs border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <button
              type="button"
              onClick={() => setDatePeriod('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                datePeriod === 'today'
                  ? (isLight ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'bg-emerald-600 text-white shadow-sm font-semibold')
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDatePeriod('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                datePeriod === 'week'
                  ? (isLight ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'bg-emerald-600 text-white shadow-sm font-semibold')
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setDatePeriod('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                datePeriod === 'month'
                  ? (isLight ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'bg-emerald-600 text-white shadow-sm font-semibold')
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setDatePeriod('year')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                datePeriod === 'year'
                  ? (isLight ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'bg-emerald-600 text-white shadow-sm font-semibold')
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              This Year
            </button>
          </div>

          {/* Date Range Button */}
          <button
            type="button"
            onClick={() => setShowDateRangePicker(!showDateRangePicker)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer shadow-sm ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' 
                : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            <span>Date Range</span>
          </button>

          {/* Currency Dropdown Selector */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none transition shadow-sm border ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-800 hover:border-slate-400' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <option value="NGN">₦ Nigerian Naira</option>
              <option value="USD">$ US Dollar</option>
              <option value="GHS">GH₵ Ghanaian Cedi</option>
              <option value="KES">KSh Kenyan Shilling</option>
              <option value="GBP">£ British Pound</option>
              <option value="EUR">€ Euro</option>
            </select>
          </div>
        </div>

        {/* Right Side: Create Order, Export CSV, Deleted Orders (orders.png) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm shadow-emerald-950/40 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Order</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition shadow-sm cursor-pointer active:scale-95 ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRecycleBin(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer shadow-sm ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-red-600' 
                : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Recycle bin for deleted orders"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Deleted Orders</span>
            {deletedOrders.length > 0 && (
              <span className={`font-mono text-[10px] px-1 rounded border ml-0.5 ${
                isLight ? 'bg-red-100 text-red-700 border-red-200' : 'bg-red-950 text-red-400 border-red-800/60'
              }`}>
                {deletedOrders.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Currency Notice Label (orders.png) */}
      <div className="flex items-center gap-2 text-xs">
        <span className={`px-2.5 py-0.5 rounded-md border font-semibold text-[11px] ${
          isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900/80 border-slate-800 text-slate-300'
        }`}>
          Currency: Nigerian Naira
        </span>
        <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
          All amounts shown in this currency only
        </span>
      </div>

      {/* 3 Core Metric Cards (orders.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Handled */}
        <div className={`rounded-2xl border p-4 sm:p-5 space-y-1 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Total Handled ({datePeriod})
          </p>
          <div className="flex items-baseline justify-between">
            <p className={`text-3xl font-bold font-mono tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {handledCount}
            </p>
            <span className="text-xs font-mono font-medium text-emerald-500 flex items-center gap-0.5">
              ↗ 0%
            </span>
          </div>
        </div>

        {/* Card 2: Delivery Rate */}
        <div className={`rounded-2xl border p-4 sm:p-5 space-y-1 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Delivery Rate
          </p>
          <div className="flex items-baseline justify-between">
            <p className={`text-3xl font-bold font-mono tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {deliveryRate}%
            </p>
            <span className="text-xs font-mono font-medium text-emerald-500 flex items-center gap-0.5">
              ↗ 0%
            </span>
          </div>
        </div>

        {/* Card 3: Revenue Generated */}
        <div className={`rounded-2xl border p-4 sm:p-5 space-y-1 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Revenue Generated
          </p>
          <div className="flex items-baseline justify-between">
            <p className={`text-3xl font-bold font-mono tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
              ₦{totalRevenueNgn.toLocaleString()}
            </p>
            <span className="text-xs font-mono font-medium text-emerald-500 flex items-center gap-0.5">
              ↗ 0%
            </span>
          </div>
        </div>
      </div>

      {/* 4. THE THREE FULL-WIDTH ACCORDION ROWS ("One column per line, with a drop down" - orders.png) */}
      <div className="space-y-3">
        
        {/* Row 1: Orders Revenue Opportunity */}
        <div className={`rounded-xl border overflow-hidden shadow-sm transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <TrendingUp className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <h3 className={`font-bold text-xs sm:text-sm tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Orders Revenue Opportunity
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowRevenueOpportunity(!showRevenueOpportunity)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95 ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                  : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/80 text-slate-200'
              }`}
            >
              <span>{showRevenueOpportunity ? 'Hide Details' : 'View Details'}</span>
              {showRevenueOpportunity ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Dropped down content */}
          {showRevenueOpportunity && (
            <div className={`p-4 sm:p-5 border-t space-y-4 animate-in fade-in duration-200 ${
              isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className={`p-3 rounded-lg border space-y-1 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
                }`}>
                  <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Dispatched (In Transit)
                  </span>
                  <p className={`font-bold text-lg font-mono ${isLight ? 'text-sky-600' : 'text-sky-400'}`}>
                    ₦{dispatchedRev.toLocaleString()}
                  </p>
                  <p className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    {dispatchedOrders.length} orders on delivery
                  </p>
                </div>

                <div className={`p-3 rounded-lg border space-y-1 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
                }`}>
                  <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Confirmed (Pending Dispatch)
                  </span>
                  <p className={`font-bold text-lg font-mono ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
                    ₦{confirmedRev.toLocaleString()}
                  </p>
                  <p className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    {confirmedOrders.length} orders locked
                  </p>
                </div>

                <div className={`p-3 rounded-lg border space-y-1 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
                }`}>
                  <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Scheduled Deliveries
                  </span>
                  <p className={`font-bold text-lg font-mono ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                    ₦{scheduledRev.toLocaleString()}
                  </p>
                  <p className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    {scheduledOrders.length} committed delivery dates
                  </p>
                </div>

                <div className={`p-3 rounded-lg border space-y-1 ${
                  isLight 
                    ? 'bg-emerald-50/80 border-emerald-200' 
                    : 'bg-emerald-950/30 border-emerald-800/60'
                }`}>
                  <span className={`text-[11px] block font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    Total Pipeline Opportunity
                  </span>
                  <p className={`font-bold text-lg font-mono ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    ₦{totalOpportunityRev.toLocaleString()}
                  </p>
                  <p className={`text-[10px] font-mono ${isLight ? 'text-emerald-600' : 'text-slate-400'}`}>
                    Collectable cash in pipeline
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Row 2: New Orders by Product */}
        <div className={`rounded-xl border overflow-hidden shadow-sm transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Package className={`w-4 h-4 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
              <h3 className={`font-bold text-xs sm:text-sm tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                New Orders by Product
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowOrdersByProduct(!showOrdersByProduct)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95 ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                  : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/80 text-slate-200'
              }`}
            >
              <span>{showOrdersByProduct ? 'Hide Details' : 'View Details'}</span>
              {showOrdersByProduct ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Dropped down content */}
          {showOrdersByProduct && (
            <div className={`p-4 sm:p-5 border-t space-y-2.5 animate-in fade-in duration-200 ${
              isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
            }`}>
              {productCounts.length === 0 ? (
                <p className={`py-4 text-center text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  No product orders logged yet.
                </p>
              ) : (
                productCounts.map(([name, data], idx) => {
                  const maxUnits = productCounts[0]?.[1]?.units || 1;
                  const relativeWidth = Math.round((data.units / maxUnits) * 100);

                  return (
                    <div 
                      key={name}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-4 text-xs ${
                        isLight 
                          ? 'bg-white border-slate-200 hover:bg-slate-50' 
                          : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                          isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 border border-slate-700 text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className={`font-semibold truncate ${isLight ? 'text-slate-800' : 'text-white'}`} title={name}>
                          {name}
                        </span>
                      </div>

                      {/* Visual progress distribution bar */}
                      <div className={`hidden sm:flex items-center w-36 md:w-48 shrink-0 h-1.5 rounded-full overflow-hidden ${
                        isLight ? 'bg-slate-200' : 'bg-slate-800'
                      }`}>
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${relativeWidth}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 font-mono text-xs">
                        <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                          {data.orders} {data.orders === 1 ? 'order' : 'orders'}
                        </span>
                        <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>·</span>
                        <span className={`font-bold ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                          {data.units} {data.units === 1 ? 'unit' : 'units'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Row 3: Top States by Orders */}
        <div className={`rounded-xl border overflow-hidden shadow-sm transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <MapPin className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <h3 className={`font-bold text-xs sm:text-sm tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Top States by Orders
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowTopStates(!showTopStates)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95 ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                  : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/80 text-slate-200'
              }`}
            >
              <span>{showTopStates ? 'Hide Details' : 'View Details'}</span>
              {showTopStates ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Dropped down content */}
          {showTopStates && (
            <div className={`p-4 sm:p-5 border-t space-y-2.5 animate-in fade-in duration-200 ${
              isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
            }`}>
              {stateCounts.length === 0 ? (
                <p className={`py-4 text-center text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  No states recorded yet.
                </p>
              ) : (
                stateCounts.map(([st, cnt], idx) => {
                  const maxVal = stateCounts[0]?.[1] || 1;
                  const percentage = Math.round((cnt / Math.max(1, totalOrdersCount)) * 100);
                  const relativeWidth = Math.round((cnt / maxVal) * 100);

                  return (
                    <div 
                      key={st}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-4 text-xs ${
                        isLight 
                          ? 'bg-white border-slate-200 hover:bg-slate-50' 
                          : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                          isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 border border-slate-700 text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className={`font-semibold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>
                          {st}
                        </span>
                      </div>

                      {/* Visual progress distribution bar */}
                      <div className={`hidden sm:flex items-center w-36 md:w-48 shrink-0 h-1.5 rounded-full overflow-hidden ${
                        isLight ? 'bg-slate-200' : 'bg-slate-800'
                      }`}>
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${relativeWidth}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 font-mono text-xs">
                        <span className={`font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                          {cnt} {cnt === 1 ? 'order' : 'orders'}
                        </span>
                        <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

      </div>

      {/* 5. Filters Bar (orders.png) */}
      <div className={`rounded-xl border p-3.5 space-y-3 shadow-sm ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Order #, name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none border ${
                isLight 
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500' 
                  : 'bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500'
              }`}
            />
          </div>

          {/* Select Filters (orders.png: All Orders, All Sources, All Locations, All Sales Reps, All Products) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`rounded-lg px-2.5 py-1.5 text-xs cursor-pointer focus:outline-none border ${
                isLight 
                  ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100' 
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <option value="ALL">All Orders</option>
              <option value="NEW">New</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="DELIVERED">Delivered</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="NOT_REACHABLE">Not Reachable</option>
              <option value="NOT_PICKING_CALLS">Not Picking</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className={`rounded-lg px-2.5 py-1.5 text-xs cursor-pointer focus:outline-none border ${
                isLight 
                  ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100' 
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <option value="ALL">All Sources</option>
              {uniqueSources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className={`rounded-lg px-2.5 py-1.5 text-xs cursor-pointer focus:outline-none border ${
                isLight 
                  ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100' 
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <option value="ALL">All Locations</option>
              {uniqueStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Sales Rep Filter */}
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className={`rounded-lg px-2.5 py-1.5 text-xs cursor-pointer focus:outline-none border ${
                isLight 
                  ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100' 
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <option value="ALL">All Sales Reps</option>
              {salesReps.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            {/* Product Filter */}
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className={`rounded-lg px-2.5 py-1.5 text-xs cursor-pointer focus:outline-none border ${
                isLight 
                  ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100' 
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <option value="ALL">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 6. Main Table (orders.png) */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        {/* Bulk Action Bar */}
        {selectedOrderIds.size > 0 && (
          <div className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 animate-in fade-in ${
            isLight ? 'bg-sky-50 border-sky-200 text-sky-900' : 'bg-sky-950/40 border-sky-800 text-sky-200'
          }`}>
            <div className="flex items-center gap-2 font-bold text-xs">
              <CheckSquare className="w-4 h-4 text-sky-500" />
              <span>{selectedOrderIds.size} orders selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBulkScheduleModal(true)}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Delivery Date</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  selectedOrderIds.forEach(id => updateOrderStatus(id, 'CONFIRMED'));
                  setSelectedOrderIds(new Set());
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer transition"
              >
                Mark Confirmed
              </button>
              <button
                type="button"
                onClick={() => {
                  selectedOrderIds.forEach(id => updateOrderStatus(id, 'DISPATCHED'));
                  setSelectedOrderIds(new Set());
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer transition"
              >
                Mark Dispatched
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrderIds(new Set())}
                className="px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs transition cursor-pointer"
              >
                Deselect
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b text-[11px] font-semibold ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/90 border-slate-800 text-slate-400'
              }`}>
                <th className="py-3 px-3 w-8">
                  <button type="button" onClick={toggleSelectAll} className={`cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                    {allFilteredSelected ? <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> : <Square className="w-3.5 h-3.5" />}
                  </button>
                </th>
                <th className="py-3 px-3 font-semibold">Order ID</th>
                <th className="py-3 px-3 font-semibold">Customer Name</th>
                <th className="py-3 px-3 font-semibold">Source</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Response</th>
                <th className="py-3 px-3 font-semibold">Sales Rep</th>
                <th className="py-3 px-3 font-semibold">Location</th>
                <th className="py-3 px-3 text-right font-semibold">Total</th>
                <th className="py-3 px-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isLight ? 'divide-slate-100' : 'divide-slate-800/50'
            }`}>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className={`py-12 text-center text-slate-500 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const displayOrderNum = o.orderNumber.startsWith('#') ? o.orderNumber : `#${o.orderNumber.replace(/^ORD-/, '')}`;
                  const isChecked = selectedOrderIds.has(o.id);

                  return (
                    <tr 
                      key={o.id} 
                      className={`transition-colors ${
                        isLight 
                          ? (isChecked ? 'bg-emerald-50/70' : 'hover:bg-slate-50/80') 
                          : (isChecked ? 'bg-emerald-950/20' : 'hover:bg-slate-800/40')
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3">
                        <button type="button" onClick={() => toggleSelectOrder(o.id)} className={`cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                          {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> : <Square className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Order ID */}
                      <td className={`py-3 px-3 font-mono font-bold hover:underline cursor-pointer whitespace-nowrap ${
                        isLight ? 'text-emerald-700 hover:text-emerald-800' : 'text-emerald-400 hover:text-emerald-300'
                      }`}>
                        <span onClick={() => setSelectedOrder(o)}>
                          {displayOrderNum}
                        </span>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{o.customerName}</p>
                        <p className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{o.customerPhone}</p>
                      </td>

                      {/* Source */}
                      <td className={`py-3 px-3 text-xs whitespace-nowrap ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {o.source}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          value={o.status}
                          onChange={(e) => {
                            const val = e.target.value as OrderStatus;
                            if (val === 'SCHEDULED') {
                              setOrderToSchedule(o);
                            } else {
                              updateOrderStatus(o.id, val);
                            }
                          }}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border cursor-pointer focus:outline-none ${
                            isLight
                              ? (o.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                 o.status === 'DISPATCHED' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                 o.status === 'CONFIRMED' ? 'bg-purple-50 text-purple-700 border-purple-300' :
                                 o.status === 'SCHEDULED' ? 'bg-sky-50 text-sky-700 border-sky-300' :
                                 o.status === 'NEW' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                                 'bg-rose-50 text-rose-700 border-rose-300')
                              : (o.status === 'DELIVERED' ? 'bg-[#052416] text-[#4ade80] border-[#16a34a]/60' :
                                 o.status === 'DISPATCHED' ? 'bg-[#0c1a36] text-[#60a5fa] border-[#2563eb]/60' :
                                 o.status === 'CONFIRMED' ? 'bg-[#1e1035] text-[#c084fc] border-[#7e22ce]/60' :
                                 o.status === 'SCHEDULED' ? 'bg-[#0a192f] text-[#38bdf8] border-[#0284c7]/60' :
                                 o.status === 'NEW' ? 'bg-[#1c1917] text-[#fdba74] border-[#ea580c]/60' :
                                 'bg-[#3b1219] text-[#f87171] border-[#dc2626]/60')
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="DISPATCHED">DISPATCHED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="SCHEDULED">SCHEDULED</option>
                          <option value="NOT_REACHABLE">NOT_REACHABLE</option>
                          <option value="NOT_PICKING_CALLS">NOT_PICKING</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>

                        {(o.scheduledDate || o.status === 'SCHEDULED') && (
                          <button
                            type="button"
                            onClick={() => setOrderToSchedule(o)}
                            className={`flex items-center gap-1 mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded border transition cursor-pointer ${
                              isLight ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' : 'bg-sky-950/70 text-sky-300 border-sky-800 hover:bg-sky-900/60'
                            }`}
                            title="Click to change scheduled delivery date"
                          >
                            <Calendar className="w-2.5 h-2.5 text-sky-400" />
                            <span>{o.scheduledDate ? (o.scheduledDate.includes('2026-') ? o.scheduledDate.replace('2026-', '') : o.scheduledDate) : 'Set Date'}</span>
                          </button>
                        )}
                      </td>

                      {/* Response Time */}
                      <td className={`py-3 px-3 font-mono text-[11px] whitespace-nowrap ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {o.responseTimeMinutes ? `${o.responseTimeMinutes}m` : 'Just now'}
                      </td>

                      {/* Sales Rep */}
                      <td className={`py-3 px-3 text-xs whitespace-nowrap ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {o.salesRepName || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>

                      {/* Location */}
                      <td className={`py-3 px-3 text-xs whitespace-nowrap ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {o.deliveryCity}, {o.deliveryState}
                      </td>

                      {/* Total */}
                      <td className={`py-3 px-3 text-right font-mono font-bold text-xs tabular-nums whitespace-nowrap ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        ₦{o.totalAmount.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setOrderToSchedule(o)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isLight 
                                ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700' 
                                : 'bg-sky-950/70 hover:bg-sky-900/80 border-sky-800 text-sky-300'
                            }`}
                            title="Schedule Delivery Date"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(o)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isLight 
                                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' 
                                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
                            }`}
                            title="View Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => copyOrder(o)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isLight 
                                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' 
                                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
                            }`}
                            title="Copy Order Summary"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={createWhatsAppLink(o.customerPhone, `Hello ${o.customerName}, regarding your order #${o.orderNumber}...`)}
                            target="_blank"
                            rel="noreferrer"
                            className={`p-1.5 rounded-lg border transition ${
                              isLight 
                                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700' 
                                : 'bg-emerald-950/80 hover:bg-emerald-900/80 border-emerald-800/80 text-emerald-400'
                            }`}
                            title="WhatsApp Customer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Recycle Bin Modal */}
      {showRecycleBin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-xl rounded-xl border p-5 space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' : 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Trash2 className="w-4 h-4 text-rose-500" /> Deleted Orders Recycle Bin
              </h3>
              <button 
                onClick={() => setShowRecycleBin(false)} 
                className={`p-1 rounded-lg ${isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                ✕
              </button>
            </div>
            {deletedOrders.length === 0 ? (
              <p className={`py-8 text-center text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Recycle bin is empty.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {deletedOrders.map(d => (
                  <div key={d.id} className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}>
                    <div>
                      <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{d.orderNumber}</span>
                      <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>{d.customerName} ({d.deliveryCity})</p>
                    </div>
                    <button
                      onClick={() => {
                        // restore
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm cursor-pointer"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Individual Order Schedule Delivery Date Modal */}
      {orderToSchedule && (
        <ScheduleDeliveryModal
          order={orderToSchedule}
          onClose={() => setOrderToSchedule(null)}
        />
      )}

      {/* Bulk Orders Schedule Modal */}
      {showBulkScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className={`w-full max-w-md rounded-2xl border p-5 space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm">Schedule {selectedOrderIds.size} Orders</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkScheduleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Set a uniform scheduled delivery date and preferred time window for all {selectedOrderIds.size} selected customer orders.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold block mb-1">Scheduled Delivery Date:</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[
                    { label: 'Today (Oct 01)', date: '2026-10-01' },
                    { label: 'Tomorrow (Oct 02)', date: '2026-10-02' },
                    { label: 'Saturday (Oct 03)', date: '2026-10-03' },
                    { label: 'Monday (Oct 05)', date: '2026-10-05' },
                  ].map(p => (
                    <button
                      key={p.date}
                      type="button"
                      onClick={() => setBulkScheduleDate(p.date)}
                      className={`px-2 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
                        bulkScheduleDate === p.date
                          ? 'bg-sky-600 border-sky-500 text-white font-bold'
                          : isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  value={bulkScheduleDate}
                  onChange={(e) => setBulkScheduleDate(e.target.value)}
                  className={`w-full p-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-sky-500 cursor-pointer ${
                    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold block mb-1">Time Window:</label>
                <select
                  value={bulkScheduleTime}
                  onChange={(e) => setBulkScheduleTime(e.target.value)}
                  className={`w-full p-2 rounded-xl border text-xs focus:outline-none focus:border-sky-500 cursor-pointer ${
                    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12:00 PM - 4:00 PM)</option>
                  <option value="Evening (4:00 PM - 7:30 PM)">Evening (4:00 PM - 7:30 PM)</option>
                  <option value="Anytime / Flexible">Anytime / Flexible</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowBulkScheduleModal(false)}
                className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  selectedOrderIds.forEach(id => {
                    scheduleOrderDelivery(id, bulkScheduleDate, bulkScheduleTime);
                  });
                  if (addNotification) {
                    addNotification({
                      title: 'Bulk Delivery Scheduled',
                      message: `Scheduled ${selectedOrderIds.size} orders for ${bulkScheduleDate} (${bulkScheduleTime})`,
                      type: 'info'
                    });
                  }
                  setShowBulkScheduleModal(false);
                  setSelectedOrderIds(new Set());
                }}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Confirm Bulk Schedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
