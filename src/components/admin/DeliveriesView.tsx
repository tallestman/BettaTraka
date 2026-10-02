import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount, formatDate } from '../../utils/formatters';
import { OrderDetailsModal } from './OrderDetailsModal';
import { Order, CurrencyCode } from '../../types/crm';
import { 
  Package, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Calendar, 
  ChevronDown, 
  Search, 
  Download, 
  Zap, 
  X,
  MapPin,
  UserCheck,
  Truck
} from 'lucide-react';

type DateFilterPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

export const DeliveriesView: React.FC = () => {
  const { 
    orders, 
    currency, 
    setCurrency, 
    settings, 
    agents, 
    users, 
    mediaBuyers, 
    products,
    setAdminActiveTab 
  } = useCrm();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters State
  const [datePeriod, setDatePeriod] = useState<DateFilterPeriod>('today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedSalesRep, setSelectedSalesRep] = useState('All');
  const [selectedMediaBuyer, setSelectedMediaBuyer] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');

  // Base delivered orders
  const allDeliveredOrders = useMemo(() => {
    return orders.filter(o => o.status === 'DELIVERED');
  }, [orders]);

  // Available unique options for dropdowns
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    allDeliveredOrders.forEach(o => {
      if (o.deliveryCity) locs.add(o.deliveryCity);
      else if (o.deliveryState) locs.add(o.deliveryState);
    });
    return Array.from(locs).sort();
  }, [allDeliveredOrders]);

  const uniqueSources = useMemo(() => {
    const sources = new Set<string>();
    allDeliveredOrders.forEach(o => {
      if (o.source) sources.add(o.source);
    });
    return Array.from(sources).sort();
  }, [allDeliveredOrders]);

  // Currency options matching BettaTraka format
  const currencyOptions: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
    { code: 'USD', label: 'US Dollar', symbol: '$' },
    { code: 'GHS', label: 'Ghanaian Cedi', symbol: 'GH₵' },
    { code: 'KES', label: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'GBP', label: 'British Pound', symbol: '£' },
    { code: 'EUR', label: 'Euro', symbol: '€' }
  ];

  const currentCurrencyOpt = currencyOptions.find(c => c.code === currency) || currencyOptions[0];

  // Date filtering logic anchored to deliveredDate (or fallback to createdAt)
  const filteredOrders = useMemo(() => {
    const now = new Date('2026-09-27T14:55:00Z'); // Local reference anchor

    return allDeliveredOrders.filter(order => {
      const orderDateStr = order.deliveredDate || order.createdAt;
      const orderDate = new Date(orderDateStr);

      // Period filter
      if (datePeriod === 'today') {
        const isSameDay = 
          orderDate.getUTCFullYear() === now.getUTCFullYear() &&
          orderDate.getUTCMonth() === now.getUTCMonth() &&
          orderDate.getUTCDate() === now.getUTCDate();
        if (!isSameDay) return false;
      } else if (datePeriod === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (orderDate < oneWeekAgo) return false;
      } else if (datePeriod === 'month') {
        const isSameMonth = 
          orderDate.getUTCFullYear() === now.getUTCFullYear() &&
          orderDate.getUTCMonth() === now.getUTCMonth();
        if (!isSameMonth) return false;
      } else if (datePeriod === 'year') {
        const isSameYear = orderDate.getUTCFullYear() === now.getUTCFullYear();
        if (!isSameYear) return false;
      } else if (datePeriod === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate);
          if (orderDate < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = order.orderNumber.toLowerCase().includes(q);
        const matchesCustomer = order.customerName.toLowerCase().includes(q);
        const matchesPhone = order.customerPhone.toLowerCase().includes(q);
        if (!matchesNumber && !matchesCustomer && !matchesPhone) return false;
      }

      // Agent filter
      if (selectedAgent !== 'All') {
        if (order.agentName !== selectedAgent && order.agentId !== selectedAgent) return false;
      }

      // Source filter
      if (selectedSource !== 'All') {
        if (order.source !== selectedSource) return false;
      }

      // Location filter
      if (selectedLocation !== 'All') {
        const loc = `${order.deliveryCity} ${order.deliveryState}`.toLowerCase();
        if (!loc.includes(selectedLocation.toLowerCase())) return false;
      }

      // Sales Rep filter
      if (selectedSalesRep !== 'All') {
        if (order.salesRepName !== selectedSalesRep && order.salesRepId !== selectedSalesRep) return false;
      }

      // Media Buyer filter
      if (selectedMediaBuyer !== 'All') {
        if (order.mediaBuyerName !== selectedMediaBuyer && order.mediaBuyerId !== selectedMediaBuyer) return false;
      }

      // Product filter
      if (selectedProduct !== 'All') {
        const hasProduct = order.items.some(i => 
          i.productName.toLowerCase().includes(selectedProduct.toLowerCase()) || 
          i.productId === selectedProduct
        );
        if (!hasProduct) return false;
      }

      return true;
    });
  }, [
    allDeliveredOrders,
    datePeriod,
    customStartDate,
    customEndDate,
    searchQuery,
    selectedAgent,
    selectedSource,
    selectedLocation,
    selectedSalesRep,
    selectedMediaBuyer,
    selectedProduct
  ]);

  // Metric Calculations
  const totalDelivered = filteredOrders.length;
  const totalRevenueNgn = filteredOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalRevenueConverted = convertAmount(totalRevenueNgn, currency);

  const avgFulfillment = totalDelivered > 0
    ? (filteredOrders.reduce((sum, o) => sum + (o.fulfillmentDays || 1), 0) / totalDelivered).toFixed(1)
    : '0.0';

  const avgPerDay = useMemo(() => {
    if (totalDelivered === 0) return '0.0';
    if (datePeriod === 'today') return totalDelivered.toFixed(1);
    if (datePeriod === 'week') return (totalDelivered / 7).toFixed(1);
    if (datePeriod === 'month') return (totalDelivered / 30).toFixed(1);
    if (datePeriod === 'year') return (totalDelivered / 365).toFixed(1);
    return (totalDelivered / 7).toFixed(1);
  }, [totalDelivered, datePeriod]);

  // Export CSV Handler
  const handleExportCsv = () => {
    if (filteredOrders.length === 0) {
      alert("No deliveries found for the selected period to export.");
      return;
    }

    const headers = [
      'Order #',
      'Customer Name',
      'Phone',
      'Products',
      'Location',
      'Agent',
      'Sales Rep',
      'Delivered Date',
      'Fulfillment (Days)',
      `Revenue (${currency})`
    ];

    const rows = filteredOrders.map(o => [
      `"${o.orderNumber}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.items.map(i => `${i.quantity}x ${i.productName}`).join('; ')}"`,
      `"${o.deliveryCity}, ${o.deliveryState}"`,
      `"${o.agentName || 'Unassigned'}"`,
      `"${o.salesRepName || 'Direct'}"`,
      `"${o.deliveredDate ? formatDate(o.deliveredDate) : 'Delivered'}"`,
      `"${o.fulfillmentDays || 1}"`,
      `"${convertAmount(o.totalAmount, currency)}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bettatraka_deliveries_${datePeriod}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = 
    selectedAgent !== 'All' || 
    selectedSource !== 'All' || 
    selectedLocation !== 'All' || 
    selectedSalesRep !== 'All' || 
    selectedMediaBuyer !== 'All' || 
    selectedProduct !== 'All' || 
    searchQuery.trim() !== '';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedAgent('All');
    setSelectedSource('All');
    setSelectedLocation('All');
    setSelectedSalesRep('All');
    setSelectedMediaBuyer('All');
    setSelectedProduct('All');
  };

  return (
    <div className="p-3 sm:p-5 lg:p-8 space-y-5 max-w-[1400px] mx-auto text-slate-100 animate-in fade-in">
      {/* 1. TOP HEADER & FILTER BAR (Exactly as in BettaTraka) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1">
        {/* Left Side: Date pills, Date Range button & Currency selector */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Date Filter Pills */}
          <div className="flex items-center bg-black/80 p-0.5 rounded-xl border border-neutral-800">
            <button
              onClick={() => setDatePeriod('today')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                datePeriod === 'today'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDatePeriod('week')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                datePeriod === 'week'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDatePeriod('month')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                datePeriod === 'month'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDatePeriod('year')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                datePeriod === 'year'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              This Year
            </button>
          </div>

          {/* Date Range Modal / Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                datePeriod === 'custom' || showDatePicker
                  ? 'bg-neutral-900 border-neutral-700 text-white'
                  : 'bg-black/80 border-neutral-800 text-slate-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date Range</span>
            </button>

            {showDatePicker && (
              <div className="absolute left-0 mt-2 p-4 rounded-xl bg-neutral-950 border border-neutral-800 shadow-2xl z-50 w-72 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-semibold text-white">Custom Date Range</span>
                  <button 
                    onClick={() => setShowDatePicker(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDatePeriod('custom');
                    setShowDatePicker(false);
                  }}
                  className="w-full py-1.5 rounded-lg bg-white text-black font-semibold text-xs transition hover:bg-slate-200"
                >
                  Apply Filter
                </button>
              </div>
            )}
          </div>

          {/* Currency Dropdown (₦ Nigerian Naira v) */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-black/80 border border-neutral-800 text-white text-xs font-medium rounded-xl pl-3 pr-8 py-1.5 appearance-none focus:outline-none focus:border-neutral-700 cursor-pointer"
            >
              {currencyOptions.map((opt) => (
                <option key={opt.code} value={opt.code} className="bg-neutral-950 text-white">
                  {opt.symbol} {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Right Side: Token indicator & Export CSV */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Token count / Buy more */}
          <button
            onClick={() => setAdminActiveTab('tokens')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 hover:text-rose-200 text-xs font-medium transition cursor-pointer"
            title="AI & Voice Call Token Balance"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
            <span>{settings.tokenBalance || 0} tokens — Buy more</span>
          </button>

          {/* Export CSV Button (Sky Blue) */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0088ff] hover:bg-[#0077ee] text-white text-xs font-semibold shadow transition active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR KPI CARDS IN A ROW (BettaTraka Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Delivered */}
        <div className="rounded-2xl border border-neutral-800/90 bg-[#090d14]/90 p-4 sm:p-5 space-y-3 transition hover:border-neutral-700 min-w-0 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/70 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
            <Package className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-300 truncate">Total Delivered</p>
            <p className="text-xl sm:text-2xl xl:text-3xl font-bold font-mono text-white tracking-tight mt-1 truncate">
              {totalDelivered}
            </p>
            <p className="text-xs text-slate-500 mt-1 truncate">orders fulfilled</p>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="rounded-2xl border border-neutral-800/90 bg-[#090d14]/90 p-4 sm:p-5 space-y-3 transition hover:border-neutral-700 min-w-0 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-blue-950/70 border border-blue-800/50 flex items-center justify-center text-blue-400">
            <DollarSign className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-300 truncate">Total Revenue</p>
            <p 
              className="text-xl sm:text-2xl xl:text-3xl font-bold font-mono text-white tracking-tight mt-1 truncate"
              title={`${currentCurrencyOpt.symbol}${totalRevenueConverted.toLocaleString()}`}
            >
              {currentCurrencyOpt.symbol}{totalRevenueConverted.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1 truncate">from delivered orders</p>
          </div>
        </div>

        {/* Card 3: Avg Fulfillment */}
        <div className="rounded-2xl border border-neutral-800/90 bg-[#090d14]/90 p-4 sm:p-5 space-y-3 transition hover:border-neutral-700 min-w-0 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-amber-950/70 border border-amber-800/50 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-300 truncate">Avg Fulfillment</p>
            <p className="text-xl sm:text-2xl xl:text-3xl font-bold font-mono text-white tracking-tight mt-1 truncate">
              {avgFulfillment} days
            </p>
            <p className="text-xs text-slate-500 mt-1 truncate">order to delivery</p>
          </div>
        </div>

        {/* Card 4: Avg Per Day */}
        <div className="rounded-2xl border border-neutral-800/90 bg-[#090d14]/90 p-4 sm:p-5 space-y-3 transition hover:border-neutral-700 min-w-0 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-sky-950/70 border border-sky-800/50 flex items-center justify-center text-sky-400">
            <TrendingUp className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-300 truncate">Avg Per Day</p>
            <p className="text-xl sm:text-2xl xl:text-3xl font-bold font-mono text-white tracking-tight mt-1 truncate">
              {avgPerDay} orders
            </p>
            <p className="text-xs text-slate-500 mt-1 truncate">daily delivery rate</p>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & 6-DROPDOWN FILTER BAR (BettaTraka Filter Box) */}
      <div className="rounded-2xl border border-neutral-800/90 bg-[#090d14]/90 p-3 sm:p-4 space-y-3 shadow-md">
        {/* Search Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search customer or order #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950/80 border border-neutral-800/90 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neutral-700 transition"
            />
          </div>
          <button
            onClick={() => {}}
            className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-200 hover:text-white text-xs font-semibold hover:bg-neutral-800 transition"
          >
            Search
          </button>
        </div>

        {/* 6 Filter Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {/* 1. All Agents */}
          <div className="relative">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-neutral-950/80 border border-neutral-800/90 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium appearance-none focus:outline-none focus:border-neutral-700 cursor-pointer pr-7 truncate"
            >
              <option value="All">All Agents</option>
              {agents.map(a => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* 2. All Sources */}
          <div className="relative">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full bg-neutral-950/80 border border-neutral-800/90 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium appearance-none focus:outline-none focus:border-neutral-700 cursor-pointer pr-7 truncate"
            >
              <option value="All">All Sources</option>
              <option value="Order Form">Order Form</option>
              <option value="TikTok">TikTok</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="WooCommerce">WooCommerce</option>
              <option value="Shopify">Shopify</option>
              <option value="Manual Rep">Manual Rep</option>
              <option value="Abandoned Cart Recovery">Cart Recovery</option>
              {uniqueSources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* 3. All Locations */}
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-neutral-950/80 border border-neutral-800/90 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium appearance-none focus:outline-none focus:border-neutral-700 cursor-pointer pr-7 truncate"
            >
              <option value="All">All Locations</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* 4. All Sales Reps */}
          <div className="relative">
            <select
              value={selectedSalesRep}
              onChange={(e) => setSelectedSalesRep(e.target.value)}
              className="w-full bg-neutral-950/80 border border-neutral-800/90 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium appearance-none focus:outline-none focus:border-neutral-700 cursor-pointer pr-7 truncate"
            >
              <option value="All">All Sales Reps</option>
              {users.filter(u => u.role === 'Sales Representative' || u.role === 'Manager').map(rep => (
                <option key={rep.id} value={rep.name}>
                  {rep.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* 5. All Media Buyers */}
          <div className="relative">
            <select
              value={selectedMediaBuyer}
              onChange={(e) => setSelectedMediaBuyer(e.target.value)}
              className="w-full bg-neutral-950/80 border border-neutral-800/90 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium appearance-none focus:outline-none focus:border-neutral-700 cursor-pointer pr-7 truncate"
            >
              <option value="All">All Media Buyers</option>
              {mediaBuyers.map(mb => (
                <option key={mb.id} value={mb.name}>
                  {mb.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* 6. All Products */}
          <div className="relative">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full bg-neutral-950/80 border border-neutral-800/90 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium appearance-none focus:outline-none focus:border-neutral-700 cursor-pointer pr-7 truncate"
            >
              <option value="All">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Clear Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[11px]">
            <span className="text-slate-400">
              Active filters applied • Showing {filteredOrders.length} of {allDeliveredOrders.length} deliveries
            </span>
            <button
              onClick={handleClearFilters}
              className="text-sky-400 hover:text-sky-300 underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* 4. DELIVERIES TABLE (Matches BettaTraka Screenshot Columns) */}
      <div className="rounded-2xl border border-neutral-800/90 bg-[#090d14]/90 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800/80 bg-black/40 text-slate-300 text-[11px] font-semibold">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Products</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Agent</th>
                <th className="py-3.5 px-4">Sales Rep</th>
                <th className="py-3.5 px-4">Delivered</th>
                <th className="py-3.5 px-4">Fulfillment</th>
                <th className="py-3.5 px-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 text-xs font-normal">
                    No deliveries found for this period
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-neutral-900/60 transition-colors cursor-pointer group"
                  >
                    {/* Order # */}
                    <td className="py-3.5 px-4 font-mono font-medium text-sky-400 group-hover:underline">
                      {order.orderNumber}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-white">{order.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{order.customerPhone}</p>
                    </td>

                    {/* Products */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="space-y-0.5">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="truncate max-w-[200px]">
                            {item.quantity}× {item.productName}
                          </p>
                        ))}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <p className="font-medium text-white">{order.deliveryCity || 'City'}</p>
                      <p className="text-[11px] text-slate-400">{order.deliveryState || 'State'}</p>
                    </td>

                    {/* Agent */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="font-medium text-slate-200">
                        {order.agentName || 'Unassigned'}
                      </span>
                    </td>

                    {/* Sales Rep */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <span>{order.salesRepName || 'Direct Online'}</span>
                    </td>

                    {/* Delivered Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {order.deliveredDate ? formatDate(order.deliveredDate) : 'Delivered'}
                    </td>

                    {/* Fulfillment */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-emerald-400 font-medium">
                        {order.fulfillmentDays ? `${order.fulfillmentDays} day(s)` : '1 day'}
                      </span>
                    </td>

                    {/* Revenue */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums whitespace-nowrap">
                      {currentCurrencyOpt.symbol}{convertAmount(order.totalAmount, currency).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Order Details */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
