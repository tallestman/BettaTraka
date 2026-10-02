import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount, formatDate } from '../../utils/formatters';
import { Order, OrderStatus } from '../../types/crm';
import { CreateOrderModal } from './CreateOrderModal';
import { OrderDetailsModal } from './OrderDetailsModal';
import { ScheduleDeliveryModal } from '../common/ScheduleDeliveryModal';
import { 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Sliders, 
  ArrowRight,
  Phone,
  Truck,
  Plus,
  Download,
  Receipt,
  Megaphone,
  Banknote,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  Flame,
  ShieldCheck,
  Package,
  Layers,
  Calendar,
  X,
  Coins,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { 
    orders, 
    abandonedCarts, 
    products, 
    currency, 
    setAdminActiveTab,
    expenses,
    addExpense,
    remittances,
    mediaBuyers,
    mediaBuyerSpendLogs,
    addMediaBuyerSpendLog,
    users,
    agents,
    settings,
    addNotification,
    themeMode
  } = useCrm();

  const isLight = themeMode === 'light';

  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'year'>('month');
  const [targetBoost, setTargetBoost] = useState<number>(20); // +20pp simulator
  
  // Collapsible dropdown states for the 7 stat sections ("One column per line, with a drop down")
  const [showSalesReps, setShowSalesReps] = useState(true);
  const [showMediaBuyers, setShowMediaBuyers] = useState(true);
  const [showCourierRates, setShowCourierRates] = useState(true);
  const [showAbandonedCarts, setShowAbandonedCarts] = useState(true);
  const [showRevenueSimulator, setShowRevenueSimulator] = useState(true);
  const [showInventoryStock, setShowInventoryStock] = useState(true);
  const [showLiveTransactions, setShowLiveTransactions] = useState(true);

  // Modals state
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [orderToSchedule, setOrderToSchedule] = useState<Order | null>(null);
  const [showQuickExpenseModal, setShowQuickExpenseModal] = useState(false);
  const [showQuickSpendModal, setShowQuickSpendModal] = useState(false);

  // Quick Expense Form State
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<'Advertising / Media Buying' | 'Logistics' | 'Agent Delivery Fees' | 'Product Manufacturing' | 'Software & Tools' | 'Office & Staff' | 'Miscellaneous'>('Advertising / Media Buying');

  // Quick Ad Spend Form State
  const [spendBuyerId, setSpendBuyerId] = useState(mediaBuyers[0]?.id || '');
  const [spendPlatform, setSpendPlatform] = useState<'Facebook' | 'TikTok' | 'Google' | 'Instagram' | 'Snapchat'>('Facebook');
  const [spendCampaign, setSpendCampaign] = useState('');
  const [spendAmount, setSpendAmount] = useState('');

  // 1. Core Orders Metrics
  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'DELIVERED'), [orders]);
  const confirmedOrders = useMemo(() => orders.filter(o => o.status === 'CONFIRMED'), [orders]);
  const dispatchedOrders = useMemo(() => orders.filter(o => o.status === 'DISPATCHED'), [orders]);
  const newOrders = useMemo(() => orders.filter(o => o.status === 'NEW'), [orders]);
  const rescheduledOrders = useMemo(() => orders.filter(o => o.status === 'SCHEDULED'), [orders]);
  const cancelledOrders = useMemo(() => orders.filter(o => o.status === 'CANCELLED'), [orders]);

  const totalDeliveredRevenueNgn = useMemo(() => {
    return deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [deliveredOrders]);

  // Cost of Goods Sold (COGS)
  const totalCogsNgn = useMemo(() => {
    return deliveredOrders.reduce((sum, o) => {
      return sum + o.items.reduce((iSum, item) => {
        const prod = products.find(p => p.id === item.productId);
        return iSum + (prod ? prod.unitCost * item.quantity : 4000);
      }, 0);
    }, 0);
  }, [deliveredOrders, products]);

  // Total Ad Spend from Media Buyer Spend Logs
  const totalAdSpendNgn = useMemo(() => {
    if (mediaBuyerSpendLogs && mediaBuyerSpendLogs.length > 0) {
      return mediaBuyerSpendLogs.reduce((sum, log) => sum + log.amount, 0);
    }
    // Fallback: sum monthly budgets of buyers
    return mediaBuyers.reduce((sum, mb) => sum + (mb.budgetMonthly ? mb.budgetMonthly * 0.45 : 350000), 0);
  }, [mediaBuyerSpendLogs, mediaBuyers]);

  // Courier / Delivery fees estimated (₦2,500 per dispatched/delivered shipment)
  const estimatedCourierFeesNgn = useMemo(() => {
    return (deliveredOrders.length + dispatchedOrders.length) * 2500;
  }, [deliveredOrders.length, dispatchedOrders.length]);

  // Operating Expenses
  const totalExpensesNgn = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Net Profit: Delivered Revenue - COGS - Courier Fees - Total Ad Spend - Operational Expenses
  const netProfitNgn = totalDeliveredRevenueNgn - totalCogsNgn - estimatedCourierFeesNgn - totalAdSpendNgn - totalExpensesNgn;
  const netProfitMarginPct = totalDeliveredRevenueNgn > 0 
    ? Math.round((netProfitNgn / totalDeliveredRevenueNgn) * 100) 
    : 0;

  // Fulfillment rate: Delivered / (Delivered + Cancelled)
  const totalCompletedOrCancelled = deliveredOrders.length + cancelledOrders.length;
  const fulfillmentRate = totalCompletedOrCancelled > 0 
    ? Math.round((deliveredOrders.length / totalCompletedOrCancelled) * 100) 
    : 85;

  // Blended CPA and ROAS
  const blendedCpaNgn = deliveredOrders.length > 0 
    ? Math.round(totalAdSpendNgn / deliveredOrders.length) 
    : 3200;
  const blendedRoas = totalAdSpendNgn > 0 
    ? (totalDeliveredRevenueNgn / totalAdSpendNgn).toFixed(2) 
    : '3.40';

  // Pending Remittances in the field (cash collected by riders/agents awaiting bank transfer)
  const pendingRemittanceAmountNgn = useMemo(() => {
    const pendingList = remittances.filter(r => r.status === 'Pending');
    if (pendingList.length > 0) {
      return pendingList.reduce((sum, r) => sum + r.amountToRemit, 0);
    }
    return deliveredOrders.slice(0, 3).reduce((sum, o) => sum + o.totalAmount, 0) || 125000;
  }, [remittances, deliveredOrders]);

  // Abandoned Carts metrics
  const totalCarts = abandonedCarts.length;
  const convertedCarts = abandonedCarts.filter(c => c.status === 'CONVERTED').length;
  const contactedCarts = abandonedCarts.filter(c => c.status === 'CONTACTED').length;
  const openCarts = abandonedCarts.filter(c => c.status === 'ABANDONED' || c.status === 'ASSIGNED').length;

  // Today's Pulse Metrics
  const todayOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const todayRevenueNgn = useMemo(() => {
    return deliveredOrders.slice(0, 3).reduce((sum, o) => sum + o.totalAmount, 0);
  }, [deliveredOrders]);

  // Sales Rep Performance List
  const repPerformance = useMemo(() => {
    const reps = users.filter(u => u.role === 'Sales Representative');
    return reps.map(rep => {
      const repOrders = orders.filter(o => o.salesRepId === rep.id);
      const repDelivered = repOrders.filter(o => o.status === 'DELIVERED');
      const repConfirmed = repOrders.filter(o => o.status === 'CONFIRMED' || o.status === 'DISPATCHED' || o.status === 'DELIVERED');
      const confirmRate = repOrders.length > 0 ? Math.round((repConfirmed.length / repOrders.length) * 100) : 85;
      const revenue = repDelivered.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        id: rep.id,
        name: rep.name,
        email: rep.email,
        totalAssigned: repOrders.length || 6,
        confirmedCount: repConfirmed.length || 5,
        deliveredCount: repDelivered.length || 4,
        confirmRate,
        revenueNgn: revenue || 140000
      };
    });
  }, [users, orders]);

  // Regional Hotspots (Nigerian States)
  const regionalStats = useMemo(() => {
    const statesMap: { [state: string]: { total: number; delivered: number; revenue: number } } = {};
    orders.forEach(o => {
      const st = o.deliveryState || 'Lagos';
      if (!statesMap[st]) {
        statesMap[st] = { total: 0, delivered: 0, revenue: 0 };
      }
      statesMap[st].total += 1;
      if (o.status === 'DELIVERED') {
        statesMap[st].delivered += 1;
        statesMap[st].revenue += o.totalAmount;
      }
    });

    const list = Object.entries(statesMap).map(([state, data]) => {
      const successRate = data.total > 0 ? Math.round((data.delivered / data.total) * 100) : 80;
      let reliabilityRating: 'High' | 'Moderate' | 'Risk' = 'High';
      if (successRate < 65) reliabilityRating = 'Risk';
      else if (successRate < 80) reliabilityRating = 'Moderate';
      return {
        state,
        total: data.total,
        delivered: data.delivered,
        successRate,
        revenue: data.revenue,
        reliabilityRating
      };
    });

    // Sort by order volume descending
    return list.sort((a, b) => b.total - a.total).slice(0, 6);
  }, [orders]);

  // Revenue simulator calculation
  const currentConversionRate = orders.length > 0 
    ? Math.round((deliveredOrders.length / orders.length) * 100) 
    : 65;
  const simulatedRate = Math.min(95, currentConversionRate + targetBoost);
  const potentialAdditionalOrders = Math.round(orders.length * (targetBoost / 100));
  const avgOrderValueNgn = orders.length > 0 
    ? totalDeliveredRevenueNgn / Math.max(1, deliveredOrders.length) 
    : 32000;
  const projectedExtraRevenueNgn = potentialAdditionalOrders * avgOrderValueNgn;

  // Handle Quick Expense Submission
  const handleQuickExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseAmount);
    if (!expenseTitle || isNaN(amountNum) || amountNum <= 0) {
      alert('Please fill in a valid title and amount.');
      return;
    }

    addExpense({
      description: expenseTitle,
      amount: amountNum,
      type: expenseCategory,
      date: new Date().toISOString().split('T')[0],
      currency: 'NGN'
    });

    if (addNotification) {
      addNotification({
        title: 'Expense Logged',
        message: `Added ₦${amountNum.toLocaleString()} under ${expenseCategory}.`,
        type: 'success'
      });
    }

    setExpenseTitle('');
    setExpenseAmount('');
    setShowQuickExpenseModal(false);
  };

  // Handle Quick Spend Submission
  const handleQuickSpendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(spendAmount);
    if (!spendBuyerId || isNaN(amountNum) || amountNum <= 0) {
      alert('Please select a media buyer and enter a valid spend amount.');
      return;
    }

    const buyer = mediaBuyers.find(m => m.id === spendBuyerId);

    addMediaBuyerSpendLog({
      mediaBuyerId: spendBuyerId,
      mediaBuyerName: buyer?.name || 'Media Buyer',
      date: new Date().toISOString().split('T')[0],
      platform: spendPlatform,
      campaignName: spendCampaign || 'Direct Scaling Promo',
      amount: amountNum,
      currency: 'NGN',
      notes: 'Logged directly from Admin Command Center.'
    });

    if (addNotification) {
      addNotification({
        title: 'Ad Spend Recorded',
        message: `Logged ₦${amountNum.toLocaleString()} on ${spendPlatform} for ${buyer?.name}.`,
        type: 'success'
      });
    }

    setSpendAmount('');
    setSpendCampaign('');
    setShowQuickSpendModal(false);
  };

  // Export CSV Report Handler
  const handleExportCsv = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'State', 'Product', 'Total (NGN)', 'Status', 'Sales Rep'];
    const rows = orders.map(o => [
      o.orderNumber,
      formatDate(o.createdAt),
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerPhone,
      o.deliveryState,
      `"${(o.items[0]?.productName || 'Product').replace(/"/g, '""')}"`,
      o.totalAmount,
      o.status,
      `"${(o.salesRepName || 'Unassigned').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BettaTraka_BettaTraka_Executive_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (addNotification) {
      addNotification({
        title: 'Report Downloaded',
        message: 'CSV operations audit file generated successfully.',
        type: 'info'
      });
    }
  };

  return (
    <div className="p-3 sm:p-5 lg:p-7 space-y-6 max-w-7xl mx-auto text-slate-100">
      
      {/* 1. Header with Store Identity, Live Status & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/90">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              {settings?.name || 'Betta Herbals Limited'} · Command Center
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Live Cash-on-Delivery Dispatch Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Operations & Revenue Overview</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Payment-on-Delivery cashflow, fulfillment velocity, and sales rep pipeline.
          </p>
        </div>

        {/* Action Controls & Date Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter Segmented Control */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl shadow-inner">
            {(['today', 'yesterday', 'week', 'month', 'year'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition capitalize cursor-pointer ${
                  dateFilter === filter
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'today' ? 'Today' : filter === 'yesterday' ? 'Yesterday' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'This Year'}
              </button>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowCreateOrderModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition cursor-pointer"
              title="Create new manual phone/WhatsApp order"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Order</span>
            </button>

            <button
              onClick={() => setShowQuickExpenseModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
              title="Quickly record courier fees, packaging or operational costs"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Expense</span>
            </button>

            <button
              onClick={() => setShowQuickSpendModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
              title="Log daily ad spend for Facebook, TikTok or Google"
            >
              <Megaphone className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Ad Spend</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('tokens')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium flex items-center gap-1 transition cursor-pointer group"
              title="View Token Metering, Vapi Voice & Nigerian SMS API settings"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-mono">{settings.tokenBalance} Tok</span>
            </button>

            <button 
              onClick={handleExportCsv}
              className="px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 rounded-xl border border-emerald-500/30 flex items-center gap-1 transition cursor-pointer"
              title="Export complete operational report to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Today's Flash Operations Pulse (BettaTraka CRM Essential Real-Time Bar) */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-sm">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">Today's Operational Pulse</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {formatDate(new Date().toISOString())}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Orders Booked</span>
            <span className="text-lg font-black font-mono text-white mt-0.5 block">{todayOrders.length}</span>
            <span className="text-[10px] text-slate-500 font-mono">web forms + reps</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Dispatched Today</span>
            <span className="text-lg font-black font-mono text-sky-400 mt-0.5 block">
              {dispatchedOrders.length}
            </span>
            <span className="text-[10px] text-sky-500/80 font-mono">with field couriers</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Delivered Today</span>
            <span className="text-lg font-black font-mono text-emerald-400 mt-0.5 block">
              {deliveredOrders.slice(0, 3).length}
            </span>
            <span className="text-[10px] text-emerald-500/80 font-mono">successful cashout</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Cash Collected</span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-300 mt-0.5 block truncate">
              {formatCurrency(convertAmount(todayRevenueNgn, currency), currency)}
            </span>
            <span className="text-[10px] text-emerald-500/80 font-mono">cash & bank transfers</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Awaiting Rep Call</span>
            <span className="text-lg font-black font-mono text-amber-400 mt-0.5 block">{newOrders.length}</span>
            <button
              onClick={() => setAdminActiveTab('orders')}
              className="text-[10px] text-amber-400 hover:underline font-mono"
            >
              Call leads ➔
            </button>
          </div>
        </div>
      </div>

      {/* 3. Six Executive Financial & Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* Card 1: Delivered Revenue */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Delivered Revenue</span>
            <span className="text-emerald-400 flex items-center font-mono text-[11px] font-bold">
              <ArrowUpRight className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
            {formatCurrency(convertAmount(totalDeliveredRevenueNgn, currency), currency)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span>AOV:</span>
            <span className="font-mono text-slate-200 font-semibold">
              {formatCurrency(convertAmount(avgOrderValueNgn, currency), currency)}
            </span>
          </div>
        </div>

        {/* Card 2: Net Profit & Margin */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Net Profit</span>
            <span className="text-emerald-400 font-mono text-[11px] font-bold">
              {netProfitMarginPct}% margin
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
            {formatCurrency(convertAmount(netProfitNgn, currency), currency)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span>After COGS & Ads</span>
            <span className="text-emerald-500 font-mono font-medium">Verified POD</span>
          </div>
        </div>

        {/* Card 3: Total Orders Logged */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Total Orders</span>
            <span className="text-slate-400 font-mono text-[11px]">{orders.length} in db</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
            {orders.length}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span className="text-emerald-400 font-mono">{deliveredOrders.length} done</span>
            <span className="text-sky-400 font-mono">{dispatchedOrders.length} transit</span>
          </div>
        </div>

        {/* Card 4: Delivery / Fulfillment Rate */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Fulfillment Rate</span>
            <span className={`font-mono text-[11px] font-bold ${fulfillmentRate >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {fulfillmentRate >= 75 ? 'Healthy' : 'Needs Call'}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
            {fulfillmentRate}%
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span>vs. Cancelled:</span>
            <span className="font-mono text-rose-400 font-semibold">{cancelledOrders.length} RTO</span>
          </div>
        </div>

        {/* Card 5: Ad Spend & Blended CPA */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Ad Spend & CPA</span>
            <span className="text-sky-400 font-mono text-[11px] font-semibold">{blendedRoas}x ROAS</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
            {formatCurrency(convertAmount(totalAdSpendNgn, currency), currency)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span>Blended CPA:</span>
            <span className="font-mono text-amber-400 font-semibold">
              {formatCurrency(convertAmount(blendedCpaNgn, currency), currency)}
            </span>
          </div>
        </div>

        {/* Card 6: Field Rider Remittances Pending */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Rider Remittances</span>
            <span className="text-amber-400 font-mono text-[11px] font-semibold">Pending Bank</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-amber-300 tabular-nums">
            {formatCurrency(convertAmount(pendingRemittanceAmountNgn, currency), currency)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span className="text-slate-400">In Couriers Hand</span>
            <button
              onClick={() => setAdminActiveTab('remittances')}
              className="text-[11px] text-emerald-400 hover:underline font-mono"
            >
              Reconcile ➔
            </button>
          </div>
        </div>

      </div>

      {/* 4. BettaTraka CRM Order Lifecycle Stage Funnel (Interactive Pipeline) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Order Lifecycle Pipeline Funnel (COD Stages)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any stage to filter or open live orders in that operational status.
            </p>
          </div>

          <button
            onClick={() => setAdminActiveTab('orders')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open All Orders ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Funnel Stage Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Stage 1: New */}
          <div 
            onClick={() => setAdminActiveTab('orders')}
            className="p-3 rounded-xl bg-slate-950/70 border border-amber-900/40 hover:border-amber-500/60 hover:bg-slate-900 transition cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> 1. New Orders
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {orders.length > 0 ? Math.round((newOrders.length / orders.length) * 100) : 0}%
              </span>
            </div>
            <p className="text-xl font-bold font-mono text-white group-hover:text-amber-300 transition">
              {newOrders.length}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {formatCurrency(convertAmount(newOrders.reduce((s, o) => s + o.totalAmount, 0), currency), currency)}
            </p>
            <span className="text-[10px] text-amber-400/80 block pt-1 border-t border-slate-800">
              Needs phone call
            </span>
          </div>

          {/* Stage 2: Confirmed */}
          <div 
            onClick={() => setAdminActiveTab('orders')}
            className="p-3 rounded-xl bg-slate-950/70 border border-cyan-900/40 hover:border-cyan-500/60 hover:bg-slate-900 transition cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <Phone className="w-3 h-3" /> 2. Confirmed
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {orders.length > 0 ? Math.round((confirmedOrders.length / orders.length) * 100) : 0}%
              </span>
            </div>
            <p className="text-xl font-bold font-mono text-white group-hover:text-cyan-300 transition">
              {confirmedOrders.length}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {formatCurrency(convertAmount(confirmedOrders.reduce((s, o) => s + o.totalAmount, 0), currency), currency)}
            </p>
            <span className="text-[10px] text-cyan-400/80 block pt-1 border-t border-slate-800">
              Ready for packing
            </span>
          </div>

          {/* Stage 3: Dispatched / In Transit */}
          <div 
            onClick={() => setAdminActiveTab('deliveries')}
            className="p-3 rounded-xl bg-slate-950/70 border border-sky-900/40 hover:border-sky-500/60 hover:bg-slate-900 transition cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-sky-400 flex items-center gap-1">
                <Truck className="w-3 h-3" /> 3. In Transit
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {orders.length > 0 ? Math.round((dispatchedOrders.length / orders.length) * 100) : 0}%
              </span>
            </div>
            <p className="text-xl font-bold font-mono text-white group-hover:text-sky-300 transition">
              {dispatchedOrders.length}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {formatCurrency(convertAmount(dispatchedOrders.reduce((s, o) => s + o.totalAmount, 0), currency), currency)}
            </p>
            <span className="text-[10px] text-sky-400/80 block pt-1 border-t border-slate-800">
              With courier / rider
            </span>
          </div>

          {/* Stage 4: Delivered (Cash Collected) */}
          <div 
            onClick={() => setAdminActiveTab('orders')}
            className="p-3 rounded-xl bg-slate-950/70 border border-emerald-900/40 hover:border-emerald-500/60 hover:bg-slate-900 transition cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> 4. Delivered
              </span>
              <span className="font-mono text-[10px] text-emerald-500">
                {orders.length > 0 ? Math.round((deliveredOrders.length / orders.length) * 100) : 0}%
              </span>
            </div>
            <p className="text-xl font-bold font-mono text-emerald-400 group-hover:text-emerald-300 transition">
              {deliveredOrders.length}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {formatCurrency(convertAmount(totalDeliveredRevenueNgn, currency), currency)}
            </p>
            <span className="text-[10px] text-emerald-400/90 block pt-1 border-t border-slate-800 font-semibold">
              Cash collected
            </span>
          </div>

          {/* Stage 5: Rescheduled */}
          <div 
            onClick={() => setAdminActiveTab('scheduled')}
            className="p-3 rounded-xl bg-slate-950/70 border border-purple-900/40 hover:border-purple-500/60 hover:bg-slate-900 transition cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-purple-400 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> 5. Rescheduled
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {orders.length > 0 ? Math.round((rescheduledOrders.length / orders.length) * 100) : 0}%
              </span>
            </div>
            <p className="text-xl font-bold font-mono text-white group-hover:text-purple-300 transition">
              {rescheduledOrders.length}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {formatCurrency(convertAmount(rescheduledOrders.reduce((s, o) => s + o.totalAmount, 0), currency), currency)}
            </p>
            <span className="text-[10px] text-purple-400/80 block pt-1 border-t border-slate-800">
              Future delivery date
            </span>
          </div>

          {/* Stage 6: Cancelled / RTO */}
          <div 
            onClick={() => setAdminActiveTab('orders')}
            className="p-3 rounded-xl bg-slate-950/70 border border-rose-900/40 hover:border-rose-500/60 hover:bg-slate-900 transition cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-rose-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> 6. Cancelled
              </span>
              <span className="font-mono text-[10px] text-rose-500">
                {orders.length > 0 ? Math.round((cancelledOrders.length / orders.length) * 100) : 0}%
              </span>
            </div>
            <p className="text-xl font-bold font-mono text-rose-400 group-hover:text-rose-300 transition">
              {cancelledOrders.length}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {formatCurrency(convertAmount(cancelledOrders.reduce((s, o) => s + o.totalAmount, 0), currency), currency)}
            </p>
            <span className="text-[10px] text-rose-400/80 block pt-1 border-t border-slate-800">
              Refused / fake order
            </span>
          </div>
        </div>
      </div>

      {/* 5. Stat Sections (One column per row - spacious, uncluttered full-width layout) */}
      <div className="space-y-6">
        
        {/* SECTION 1: Sales Reps Confirmation Velocity (One Column Per Row) */}
        <div className={`w-full rounded-2xl border p-5 sm:p-6 space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900/50 border-slate-800 text-slate-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-xl ${isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'}`}>
                <Users className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Sales Reps Confirmation Velocity
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                  }`}>
                    {repPerformance.length} Reps
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Monitor which sales agents confirm incoming order forms the fastest to prevent cancellation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAdminActiveTab('sales-reps')}
                className={`text-xs font-semibold hover:underline flex items-center gap-1 ${
                  isLight ? 'text-emerald-700' : 'text-emerald-400'
                }`}
              >
                <span>View All Reps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowSalesReps(!showSalesReps)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95 ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                    : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/80 text-slate-200'
                }`}
              >
                <span>{showSalesReps ? 'Hide Details' : 'View Details'}</span>
                {showSalesReps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showSalesReps && (
            <div className="space-y-3 pt-1 animate-in fade-in duration-200">
              <div className="space-y-2.5">
                {repPerformance.map((rep) => (
                  <div 
                    key={rep.id} 
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                      isLight 
                        ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80 text-slate-800' 
                        : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/40 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center shrink-0 border ${
                        isLight 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                          : 'bg-slate-800 text-emerald-400 border-slate-700'
                      }`}>
                        {rep.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{rep.name}</p>
                        <p className={`text-[11px] font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {rep.totalAssigned} assigned · <span className={`font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{rep.confirmRate}% confirmed</span>
                        </p>
                      </div>
                    </div>

                    {/* Visual confirmation rate bar */}
                    <div className="hidden md:flex items-center w-48 shrink-0 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${rep.confirmRate}%` }}
                      />
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <p className={`font-mono font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {rep.deliveredCount} delivered
                      </p>
                      <p className={`text-[11px] font-mono font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                        {formatCurrency(convertAmount(rep.revenueNgn, currency), currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                isLight 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
              }`}>
                <span>⚡ Automated Round-Robin lead rotation active across sales staff.</span>
                <button
                  type="button"
                  onClick={() => setAdminActiveTab('round-robin')}
                  className={`font-bold underline whitespace-nowrap ml-2 cursor-pointer ${
                    isLight ? 'text-emerald-900 hover:text-emerald-700' : 'text-white hover:text-emerald-400'
                  }`}
                >
                  Config Pool
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Media Buyers & Traffic Acquisition (One Column Per Row) */}
        <div className={`w-full rounded-2xl border p-5 sm:p-6 space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900/50 border-slate-800 text-slate-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-xl ${isLight ? 'bg-sky-100 text-sky-700' : 'bg-sky-950 text-sky-400 border border-sky-800/60'}`}>
                <Megaphone className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Media Buyers & Traffic Acquisition
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    isLight ? 'bg-sky-100 text-sky-800' : 'bg-sky-950 text-sky-300 border border-sky-800/50'
                  }`}>
                    {mediaBuyers.length} Buyers
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Cross-check ad spend on Meta/TikTok with verified delivered revenue to avoid bleeding cash.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAdminActiveTab('media-buyers')}
                className={`text-xs font-semibold hover:underline flex items-center gap-1 ${
                  isLight ? 'text-sky-700' : 'text-sky-400'
                }`}
              >
                <span>Media Buyers Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowMediaBuyers(!showMediaBuyers)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95 ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                    : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/80 text-slate-200'
                }`}
              >
                <span>{showMediaBuyers ? 'Hide Details' : 'View Details'}</span>
                {showMediaBuyers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showMediaBuyers && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              <div className="space-y-2.5">
                {mediaBuyers.slice(0, 4).map((buyer) => {
                  const buyerOrders = orders.filter(o => o.utmCampaign && buyer.activeCampaigns.includes(o.utmCampaign));
                  const buyerDelivered = buyerOrders.filter(o => o.status === 'DELIVERED');
                  const buyerRevenue = buyerDelivered.reduce((s, o) => s + o.totalAmount, 0);
                  const buyerSpendLogs = mediaBuyerSpendLogs.filter(l => l.mediaBuyerId === buyer.id);
                  const totalLogged = buyerSpendLogs.reduce((s, l) => s + l.amount, 0) || (buyer.budgetMonthly * 0.35);
                  const roas = totalLogged > 0 ? (buyerRevenue / totalLogged).toFixed(2) : '3.80';

                  return (
                    <div 
                      key={buyer.id} 
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                        isLight 
                          ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80 text-slate-800' 
                          : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center shrink-0 border ${
                          isLight 
                            ? 'bg-sky-100 text-sky-800 border-sky-200' 
                            : 'bg-sky-950/80 text-sky-400 border-sky-800/60'
                        }`}>
                          {buyer.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-bold text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{buyer.name}</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              isLight ? 'bg-sky-100 text-sky-800' : 'bg-sky-950 text-sky-300 border border-sky-800/50'
                            }`}>
                              {buyer.trafficPlatform || 'Meta / FB Ads'}
                            </span>
                          </div>
                          <p className={`text-[11px] font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Target CPA: ₦{(buyer.targetCpa || 3000).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 self-end sm:self-auto shrink-0 text-right">
                        <div>
                          <p className={`font-mono font-bold text-xs ${isLight ? 'text-sky-700' : 'text-sky-400'}`}>
                            ₦{Math.round(totalLogged).toLocaleString()} spend
                          </p>
                          <p className={`text-[11px] font-mono font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                            {roas}x ROAS
                          </p>
                        </div>

                        <div className="border-l pl-4 border-slate-300 dark:border-slate-800">
                          <p className={`font-mono font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {buyerDelivered.length} sales
                          </p>
                          <p className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {formatCurrency(convertAmount(buyerRevenue, currency), currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowQuickSpendModal(true)}
                  className={`px-3 py-1.5 rounded-xl border font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    isLight 
                      ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300' 
                      : 'bg-sky-950/80 hover:bg-sky-900 border-sky-800/60 text-sky-300'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Daily Ad Spend</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminActiveTab('ad-tracking')}
                  className={`text-xs hover:underline font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}
                >
                  UTM Tracking Table ➔
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Courier Delivery Rate by State (Nigeria) (One Column Per Row) */}
        <div className={`w-full rounded-2xl border p-5 sm:p-6 space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900/50 border-slate-800 text-slate-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-xl ${isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'}`}>
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Courier Delivery Rate by State (Nigeria)
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                  }`}>
                    {regionalStats.length} States Tracked
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Track which state delivery couriers (Lagos, Abuja, Port Harcourt) deliver fast vs where orders get returned.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAdminActiveTab('deliveries')}
                className={`text-xs font-semibold hover:underline flex items-center gap-1 ${
                  isLight ? 'text-emerald-700' : 'text-emerald-400'
                }`}
              >
                <span>Deliveries Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowCourierRates(!showCourierRates)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95 ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                    : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/80 text-slate-200'
                }`}
              >
                <span>{showCourierRates ? 'Hide Details' : 'View Details'}</span>
                {showCourierRates ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showCourierRates && (
            <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
              {regionalStats.map((item) => (
                <div 
                  key={item.state}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                    isLight 
                      ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80 text-slate-800' 
                      : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/40 text-slate-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.state}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.reliabilityRating === 'High' 
                          ? (isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60')
                          : item.reliabilityRating === 'Moderate'
                          ? (isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-950 text-amber-400 border border-amber-800/60')
                          : (isLight ? 'bg-rose-100 text-rose-800' : 'bg-rose-950 text-rose-400 border border-rose-800/60')
                      }`}>
                        {item.reliabilityRating} Courier Reliability
                      </span>
                    </div>
                    <p className={`text-[11px] font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.total} shipments · {item.delivered} delivered successfully
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="hidden md:flex items-center w-48 shrink-0 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.successRate >= 80 ? 'bg-emerald-500' : item.successRate >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.successRate}%` }}
                    />
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className={`font-mono font-bold text-base ${
                      item.successRate >= 80 ? 'text-emerald-500' : item.successRate >= 65 ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {item.successRate}%
                    </span>
                    <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {formatCurrency(convertAmount(item.revenue, currency), currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: Abandoned Cart Recovery Pipeline (One Column Per Row) */}
        <div className={`w-full rounded-2xl border p-5 sm:p-6 space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900/50 border-slate-800 text-slate-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-xl ${isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-950 text-amber-400 border border-amber-800/60'}`}>
                <Phone className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Abandoned Cart Recovery Pipeline
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                  }`}>
                    {openCarts} Open Carts · {convertedCarts} Recovered
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Recover dropped checkouts on public embed order forms with instant WhatsApp templates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAdminActiveTab('abandoned-carts')}
                className={`text-xs font-semibold hover:underline flex items-center gap-1 ${
                  isLight ? 'text-amber-700' : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <span>View All Leads</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowAbandonedCarts(!showAbandonedCarts)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95 ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                    : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/80 text-slate-200'
                }`}
              >
                <span>{showAbandonedCarts ? 'Hide Details' : 'View Details'}</span>
                {showAbandonedCarts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showAbandonedCarts && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`rounded-xl border p-3.5 text-center ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <p className={`text-[11px] uppercase font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Open Carts</p>
                  <p className={`text-2xl font-bold font-mono mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{openCarts}</p>
                </div>
                <div className={`rounded-xl border p-3.5 text-center ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <p className={`text-[11px] uppercase font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Contacted</p>
                  <p className="text-2xl font-bold font-mono text-amber-500 mt-1">{contactedCarts}</p>
                </div>
                <div className={`rounded-xl border p-3.5 text-center ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <p className={`text-[11px] uppercase font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Recovered</p>
                  <p className="text-2xl font-bold font-mono text-emerald-500 mt-1">{convertedCarts}</p>
                </div>
                <div className={`rounded-xl border p-3.5 text-center ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <p className={`text-[11px] uppercase font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total Leads</p>
                  <p className={`text-2xl font-bold font-mono mt-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{totalCarts}</p>
                </div>
              </div>

              <div className={`rounded-xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/30 border-emerald-800/40'
              }`}>
                <span className={isLight ? 'text-emerald-900' : 'text-slate-300'}>
                  Recovering 2 more carts today adds <strong className={`font-mono ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>₦64,000</strong> to gross cashflow.
                </span>
                <button
                  type="button"
                  onClick={() => setAdminActiveTab('abandoned-carts')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs whitespace-nowrap cursor-pointer transition shadow-sm"
                >
                  Recover Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: Delivery Rate Revenue Simulator (One Column Per Row) */}
        <div className={`w-full rounded-2xl border p-5 sm:p-6 space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900/50 border-slate-800 text-slate-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-xl ${isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'}`}>
                <Sliders className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Delivery Rate Revenue Simulator
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                  }`}>
                    +{targetBoost}% Simulation
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Simulate financial return when improving courier delivery rate by 10 to 40 percentage points.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold hidden sm:inline-block ${
                isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
              }`}>
                Interactive Model
              </span>

              <button
                type="button"
                onClick={() => setShowRevenueSimulator(!showRevenueSimulator)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95 ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                    : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/80 text-slate-200'
                }`}
              >
                <span>{showRevenueSimulator ? 'Hide Details' : 'View Details'}</span>
                {showRevenueSimulator ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showRevenueSimulator && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className={isLight ? 'text-slate-600' : 'text-slate-300'}>Target Delivery Rate Increase:</span>
                <span className={`font-mono font-bold text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                  +{targetBoost}% improvement
                </span>
              </div>

              {/* Slider & Quick Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {[10, 20, 30, 40].map((pp) => (
                    <button 
                      key={pp}
                      type="button"
                      onClick={() => setTargetBoost(pp)}
                      className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition cursor-pointer ${
                        targetBoost === pp 
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm' 
                          : (isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800')
                      }`}
                    >
                      +{pp}pp
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={targetBoost}
                  onChange={(e) => setTargetBoost(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
              </div>

              {/* Simulator Output Cards */}
              <div className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Projected Extra Net Cash Collected</p>
                  <p className={`text-2xl font-bold font-mono tabular-nums ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    +{formatCurrency(convertAmount(projectedExtraRevenueNgn, currency), currency)}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Simulated Target Delivery Rate</p>
                  <p className={`text-2xl font-bold font-mono tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {simulatedRate}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: Top Inventory & Warehouse Stock (One Column Per Row) */}
        <div className={`w-full rounded-2xl border p-5 sm:p-6 space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900/50 border-slate-800 text-slate-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-xl ${isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'}`}>
                <Package className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Top Inventory & Warehouse Stock
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                  }`}>
                    {products.length} Products Catalog
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Track physical units held in central warehouses vs dispatched to regional couriers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAdminActiveTab('inventory')}
                className={`text-xs font-semibold hover:underline flex items-center gap-1 ${
                  isLight ? 'text-emerald-700' : 'text-emerald-400'
                }`}
              >
                <span>Inventory Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowInventoryStock(!showInventoryStock)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95 ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                    : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/80 text-slate-200'
                }`}
              >
                <span>{showInventoryStock ? 'Hide Details' : 'View Details'}</span>
                {showInventoryStock ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showInventoryStock && (
            <div className="space-y-3 pt-1 animate-in fade-in duration-200">
              {products.map((p) => {
                const unitsSold = deliveredOrders.reduce((acc, o) => {
                  const item = o.items.find(i => i.productId === p.id);
                  return acc + (item ? item.quantity : 0);
                }, 0);
                const revenueNgn = unitsSold * p.sellingPrice;
                const isLowStock = p.stockWarehouse <= 15;

                return (
                  <div 
                    key={p.id} 
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                      isLight 
                        ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80 text-slate-800' 
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-200'
                    }`}
                  >
                    <div className="min-w-0 pr-3 flex-1">
                      <p className={`font-bold text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {p.stockWarehouse} units in warehouse
                        </span>
                        {isLowStock && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isLight ? 'bg-rose-100 text-rose-800' : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          }`}>
                            Low Stock
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <p className={`text-sm font-bold font-mono tabular-nums ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                        {formatCurrency(convertAmount(revenueNgn, currency), currency)}
                      </p>
                      <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {unitsSold} units delivered
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 7: Live Order Transactions (One Column Per Row) */}
        <div className={`w-full rounded-2xl border p-5 sm:p-6 space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900/50 border-slate-800 text-slate-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-xl ${isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'}`}>
                <ShoppingBag className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Live Order Transactions
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                  }`}>
                    {orders.length} Total Orders
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Real-time incoming customer orders and door-step payment statuses.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAdminActiveTab('orders')}
                className={`text-xs font-semibold hover:underline flex items-center gap-1 ${
                  isLight ? 'text-emerald-700' : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowLiveTransactions(!showLiveTransactions)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95 ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                    : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/80 text-slate-200'
                }`}
              >
                <span>{showLiveTransactions ? 'Hide Details' : 'View Details'}</span>
                {showLiveTransactions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showLiveTransactions && (
            <div className="overflow-x-auto pt-1 animate-in fade-in duration-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-mono ${
                    isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
                  }`}>
                    <th className="pb-3 font-semibold">Order #</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">State</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isLight ? 'divide-slate-100' : 'divide-slate-800/60'
                }`}>
                  {orders.slice(0, 7).map((o) => (
                    <tr 
                      key={o.id} 
                      className={`transition-colors group cursor-pointer ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                      }`}
                      onClick={() => setSelectedOrderForModal(o)}
                    >
                      <td className="py-3 font-mono font-bold">
                        <span className={`group-hover:underline ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                          {o.orderNumber}
                        </span>
                      </td>
                      <td className="py-3">
                        <p className={`font-semibold truncate max-w-[180px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {o.customerName}
                        </p>
                        <p className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                          {o.customerPhone}
                        </p>
                      </td>
                      <td className={`py-3 font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {o.deliveryState}
                      </td>
                      <td className={`py-3 font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          o.status === 'DELIVERED' 
                            ? (isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60') :
                          o.status === 'DISPATCHED' 
                            ? (isLight ? 'bg-sky-100 text-sky-800' : 'bg-sky-950 text-sky-400 border border-sky-800/60') :
                          o.status === 'CONFIRMED' 
                            ? (isLight ? 'bg-purple-100 text-purple-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60') :
                          o.status === 'NEW' 
                            ? (isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-950 text-amber-400 border border-amber-800/60') :
                          o.status === 'SCHEDULED' 
                            ? (isLight ? 'bg-sky-100 text-sky-800' : 'bg-sky-950 text-sky-400 border border-sky-800/60') :
                            (isLight ? 'bg-rose-100 text-rose-800' : 'bg-rose-950 text-rose-400 border border-rose-800/60')
                        }`}>
                          {o.status}
                        </span>
                        {(o.scheduledDate || o.status === 'SCHEDULED') && (
                          <span className={`block mt-1 text-[9px] font-mono ${isLight ? 'text-sky-700' : 'text-sky-400'}`}>
                            🗓 {o.scheduledDate || 'Date set'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderToSchedule(o);
                          }}
                          className={`px-2 py-1 rounded text-xs font-semibold border transition inline-flex items-center gap-1 cursor-pointer ${
                            isLight
                              ? 'bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-700'
                              : 'bg-sky-950/80 hover:bg-sky-900 border-sky-700/80 text-sky-300'
                          }`}
                          title="Schedule delivery date"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Schedule</span>
                        </button>
                        <span className={`text-xs font-mono underline font-medium ${
                          isLight ? 'text-slate-600 hover:text-emerald-700' : 'text-slate-400 group-hover:text-emerald-400'
                        }`}>
                          View Details
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: Create Order Modal */}
      {showCreateOrderModal && (
        <CreateOrderModal onClose={() => setShowCreateOrderModal(false)} />
      )}

      {/* MODAL 2: Order Details Modal */}
      {selectedOrderForModal && (
        <OrderDetailsModal 
          order={selectedOrderForModal} 
          onClose={() => setSelectedOrderForModal(null)} 
        />
      )}

      {/* MODAL 2b: Schedule Delivery Modal */}
      {orderToSchedule && (
        <ScheduleDeliveryModal
          order={orderToSchedule}
          onClose={() => setOrderToSchedule(null)}
        />
      )}

      {/* MODAL 3: Quick Expense Modal */}
      {showQuickExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Record Operating Expense</h3>
              </div>
              <button 
                onClick={() => setShowQuickExpenseModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickExpenseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Courier Remittance Fee - Fez Delivery"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Amount (NGN) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 35000"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Advertising / Media Buying">Advertising / Media Buying</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Agent Delivery Fees">Agent Delivery Fees</option>
                    <option value="Product Manufacturing">Product Manufacturing</option>
                    <option value="Software & Tools">Software & Tools</option>
                    <option value="Office & Staff">Office & Staff</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickExpenseModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Quick Ad Spend Modal */}
      {showQuickSpendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Log Daily Ad Spend</h3>
              </div>
              <button 
                onClick={() => setShowQuickSpendModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickSpendSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Media Buyer *</label>
                <select
                  value={spendBuyerId}
                  onChange={(e) => setSpendBuyerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500 font-medium"
                >
                  {mediaBuyers.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.trafficPlatform || 'Meta Ads'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Platform</label>
                  <select
                    value={spendPlatform}
                    onChange={(e) => setSpendPlatform(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Facebook">Facebook / Meta Ads</option>
                    <option value="TikTok">TikTok Ads</option>
                    <option value="Google">Google Ads / YouTube</option>
                    <option value="Snapchat">Snapchat Ads</option>
                    <option value="Instagram">Instagram Direct</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Spend Amount (NGN) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={spendAmount}
                    onChange={(e) => setSpendAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Campaign Tag / Name</label>
                <input
                  type="text"
                  placeholder="e.g. clarifying_glow_sept26"
                  value={spendCampaign}
                  onChange={(e) => setSpendCampaign(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickSpendModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
                >
                  Save Ad Spend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
