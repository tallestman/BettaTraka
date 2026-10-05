import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { CustomerRecord, CurrencyCode } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  Repeat, 
  Search, 
  Filter, 
  RotateCcw, 
  Calendar, 
  Download, 
  ChevronDown, 
  X, 
  Check, 
  Phone, 
  MessageSquare, 
  Eye, 
  ShieldAlert, 
  ShieldCheck, 
  MapPin, 
  ShoppingBag,
  TrendingUp,
  Clock
} from 'lucide-react';

type DatePeriod = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

export const CustomersView: React.FC = () => {
  const { 
    customers, 
    orders, 
    toggleCustomerBlock, 
    currency, 
    setCurrency, 
    addNotification,
    themeMode
  } = useCrm();

  const isLight = themeMode === 'light';

  // Filter & Search states (Matching BettaTraka Screenshot)
  const [datePeriod, setDatePeriod] = useState<DatePeriod>('today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('All');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Customer for Profile Modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // Currency options matching BettaTraka format
  const currencyOptions: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
    { code: 'USD', label: 'US Dollar', symbol: '$' },
    { code: 'GHS', label: 'Ghana Cedi', symbol: 'GH₵' },
    { code: 'KES', label: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'ZAR', label: 'South African Rand', symbol: 'R' },
    { code: 'GBP', label: 'British Pound', symbol: '£' },
    { code: 'EUR', label: 'Euro', symbol: '€' }
  ];

  const currentCurrencyInfo = currencyOptions.find(c => c.code === currency) || currencyOptions[0];

  // Distinct sources for filter dropdown
  const allSources = useMemo(() => {
    const s = new Set<string>();
    customers.forEach(c => {
      if (c.source) s.add(c.source);
    });
    // Add common acquisition channels if not present
    ['Meta Ads', 'TikTok Ads', 'Order Form', 'WhatsApp', 'Google Ads', 'WooCommerce', 'Shopify'].forEach(ch => s.add(ch));
    return Array.from(s);
  }, [customers]);

  // Helper to filter customers by time period
  const filterByDatePeriod = (custs: CustomerRecord[], period: DatePeriod) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return custs.filter(c => {
      if (period === 'all') return true;
      if (!c.lastOrderDate) return false;

      const cDate = new Date(c.lastOrderDate);

      switch (period) {
        case 'today': {
          const isToday = c.lastOrderDate.startsWith(todayStr) ||
            (cDate.getUTCFullYear() === now.getUTCFullYear() &&
             cDate.getUTCMonth() === now.getUTCMonth() &&
             cDate.getUTCDate() === now.getUTCDate());
          return isToday;
        }
        case 'week': {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return cDate >= oneWeekAgo;
        }
        case 'month': {
          return cDate.getUTCMonth() === now.getUTCMonth() && cDate.getUTCFullYear() === now.getUTCFullYear();
        }
        case 'year': {
          return cDate.getUTCFullYear() === now.getUTCFullYear();
        }
        case 'custom': {
          if (customStartDate) {
            const start = new Date(customStartDate);
            if (cDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (cDate > end) return false;
          }
          return true;
        }
        default:
          return true;
      }
    });
  };

  // Customers in current period
  const customersInPeriod = useMemo(() => {
    return filterByDatePeriod(customers, datePeriod);
  }, [customers, datePeriod, customStartDate, customEndDate]);

  // =========================================================
  // 4 STATS CALCULATIONS (Matching Screenshot: customer list.png)
  // 1. TOTAL CUSTOMERS
  // 2. ACTIVE CUSTOMERS
  // 3. RETURNING RATE
  // 4. AVG. LIFETIME VALUE
  // =========================================================
  const totalCustomersCount = customersInPeriod.length;
  const activeCustomersCount = customersInPeriod.filter(c => !c.isBlocked && c.totalOrders > 0).length;
  
  const repeatCustomersCount = customersInPeriod.filter(c => c.totalOrders > 1).length;
  const returnRatePercent = totalCustomersCount > 0 
    ? (repeatCustomersCount / totalCustomersCount) * 100 
    : 0;

  const totalPeriodSpendNgn = customersInPeriod.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
  const avgLifetimeValueNgn = totalCustomersCount > 0 
    ? Math.round(totalPeriodSpendNgn / totalCustomersCount) 
    : 0;

  // Filtered customers by search & source
  const filteredCustomers = useMemo(() => {
    return customersInPeriod.filter(c => {
      // Search matches name, email, or phone
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q));

      // Source filter
      const matchesSource = selectedSource === 'All' || c.source.toLowerCase() === selectedSource.toLowerCase();

      return matchesSearch && matchesSource;
    });
  }, [customersInPeriod, searchQuery, selectedSource]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset pagination when search or filters change
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSource('All');
    setDatePeriod('all');
    setCurrentPage(1);
    setShowDatePicker(false);
  };

  // Export Data CSV Handler matching BettaTraka format
  const handleExportData = () => {
    const filename = `bettatraka_customers_export_${datePeriod}_${new Date().toISOString().slice(0, 10)}.csv`;
    let csv = "Customer Name,Phone,Email,City,State,Total Orders,Successful Orders,Cancelled Orders,Total Spend (NGN),Reliability Score,Acquisition Source,Blocked Status,Last Order Date\n";
    
    filteredCustomers.forEach(c => {
      csv += `"${c.name}","${c.phone}","${c.email || ''}","${c.city}","${c.state}",${c.totalOrders},${c.successfulOrders},${c.cancelledOrders},${c.totalSpend},"${c.reliabilityScore}%","${c.source}","${c.isBlocked ? 'Blocked' : 'Active'}","${c.lastOrderDate || ''}"\n`;
    });

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (addNotification) {
      addNotification({
        title: 'Customers Exported',
        message: `Exported ${filteredCustomers.length} customer records to CSV.`,
        type: 'success'
      });
    }
  };

  // Customer orders list for the modal
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(o => 
      o.customerPhone === selectedCustomer.phone ||
      (selectedCustomer.email && o.customerEmail === selectedCustomer.email) ||
      o.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()
    );
  }, [selectedCustomer, orders]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 animate-in fade-in select-none">
      {/* =========================================================
          1. TOP BAR & FILTER ROW (Exact match to Screenshot: customer list.png)
          Pills: Today | This Week | This Month | This Year | Date Range | Currency
          Right: Export Data button
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        {/* Left Side: Date pills, Date Range button & Currency selector */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Date Filter Pills (BettaTraka Signature: solid white when active) */}
          <div className="flex items-center bg-black/80 p-0.5 rounded-xl border border-neutral-800">
            {(
              [
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
                { key: 'year', label: 'This Year' }
              ] as const
            ).map((item) => {
              const isActive = datePeriod === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setDatePeriod(item.key);
                    setShowDatePicker(false);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? (isLight ? 'bg-lime-600 text-white shadow-xs font-bold' : 'bg-white text-black shadow-sm')
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Date Range Modal / Popover Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer shadow-xs ${
                datePeriod === 'custom' || showDatePicker
                  ? (isLight ? 'bg-slate-200 border-slate-400 text-slate-900 font-bold' : 'bg-neutral-900 border-neutral-700 text-white')
                  : (isLight ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' : 'bg-black/80 border-neutral-800 text-slate-300 hover:text-white hover:border-neutral-700')
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
              <span>Date Range</span>
            </button>

            {showDatePicker && (
              <div className={`absolute left-0 mt-2 p-4 rounded-xl border shadow-2xl z-50 w-72 space-y-3 animate-in fade-in slide-in-from-top-2 ${
                isLight ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50' : 'bg-neutral-950 border-neutral-800 text-white'
              }`}>
                <div className={`flex items-center justify-between pb-2 border-b ${
                  isLight ? 'border-slate-100' : 'border-neutral-800'
                }`}>
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Select Date Range</span>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className={isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className={`text-[10px] block mb-1 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none transition border ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-lime-500' : 'bg-neutral-900 border-neutral-800 text-white focus:border-sky-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] block mb-1 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none transition border ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-lime-500' : 'bg-neutral-900 border-neutral-800 text-white focus:border-sky-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDatePeriod('custom');
                      setShowDatePicker(false);
                      setCurrentPage(1);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-white text-xs font-bold transition cursor-pointer ${
                      isLight ? 'bg-lime-600 hover:bg-lime-700' : 'bg-sky-600 hover:bg-sky-500'
                    }`}
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Currency Selector Dropdown (BettaTraka Signature: ₦ Nigerian Naira) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-xs ${
                isLight 
                  ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' 
                  : 'bg-black/90 border-neutral-800 hover:border-neutral-700 text-white'
              }`}
            >
              <span>{currentCurrencyInfo.symbol} {currentCurrencyInfo.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            </button>

            {showCurrencyDropdown && (
              <div className={`absolute left-0 mt-1.5 w-52 rounded-xl border shadow-2xl z-30 p-1 space-y-0.5 animate-in fade-in ${
                isLight ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50' : 'bg-neutral-950 border-neutral-800 text-white'
              }`}>
                {currencyOptions.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      setCurrency(opt.code);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition text-left cursor-pointer ${
                      currency === opt.code 
                        ? (isLight ? 'bg-lime-50 text-lime-900 font-bold border border-lime-200' : 'bg-sky-600 text-white font-semibold')
                        : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-neutral-900 hover:text-white')
                    }`}
                  >
                    <span>{opt.symbol} {opt.label}</span>
                    {currency === opt.code && <Check className={`w-3.5 h-3.5 ${isLight ? 'text-lime-700' : 'text-white'}`} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Export Data Button (Solid Sky Blue) */}
        <button
          type="button"
          onClick={handleExportData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs sm:text-sm shadow-sm transition cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 stroke-[2.2]" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Currency Info Subtext Banner */}
      <div className="flex items-center text-xs">
        <span className="font-semibold text-white px-2.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800">
          Currency: {currentCurrencyInfo.label}
        </span>
        <span className="text-slate-500 ml-2.5">
          All amounts shown in this currency only
        </span>
      </div>

      {/* =========================================================
          2. FOUR KPI STATS CARDS (Exact match to Screenshot: customer list.png)
          TOTAL CUSTOMERS | ACTIVE CUSTOMERS | RETURNING RATE | AVG. LIFETIME VALUE
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: TOTAL CUSTOMERS */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              TOTAL CUSTOMERS
            </span>
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <div className="pt-3">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {totalCustomersCount}
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono mt-1">
              <span>~0%</span>
            </div>
          </div>
        </div>

        {/* Card 2: ACTIVE CUSTOMERS */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              ACTIVE CUSTOMERS
            </span>
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="pt-3">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {activeCustomersCount}
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono mt-1">
              <span>~0%</span>
            </div>
          </div>
        </div>

        {/* Card 3: RETURNING RATE */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              RETURNING RATE
            </span>
            <Repeat className="w-5 h-5 text-sky-400" />
          </div>
          <div className="pt-3">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {returnRatePercent.toFixed(1)}%
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono mt-1">
              <span>~0%</span>
            </div>
          </div>
        </div>

        {/* Card 4: AVG. LIFETIME VALUE */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              AVG. LIFETIME VALUE
            </span>
            <DollarSign className="w-5 h-5 text-sky-400" />
          </div>
          <div className="pt-3">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight truncate">
              {formatCurrency(convertAmount(avgLifetimeValueNgn, currency), currency)}
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono mt-1">
              <span>~0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. SEARCH & SOURCE FILTER BAR (Exact match to Screenshot: customer list.png)
          Left: Search by name, email, or phone...
          Right: Source: All dropdown & Reset Button
          ========================================================= */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Search input */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Side: Source: All dropdown & Reload icon button */}
        <div className="flex items-center gap-2">
          {/* Source Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSourceDropdown(!showSourceDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold text-white transition cursor-pointer shadow-sm"
            >
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Source: {selectedSource}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showSourceDropdown && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-neutral-950 border border-neutral-800 shadow-2xl z-30 p-1 space-y-0.5 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSource('All');
                    setShowSourceDropdown(false);
                    setCurrentPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition text-left ${
                    selectedSource === 'All' 
                      ? 'bg-sky-600 text-white font-semibold' 
                      : 'text-slate-300 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <span>All Sources</span>
                  {selectedSource === 'All' && <Check className="w-3.5 h-3.5" />}
                </button>
                {allSources.map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => {
                      setSelectedSource(source);
                      setShowSourceDropdown(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition text-left ${
                      selectedSource === source 
                        ? 'bg-sky-600 text-white font-semibold' 
                        : 'text-slate-300 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    <span>{source}</span>
                    {selectedSource === source && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset / Reload Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Reset Filters & Search"
            aria-label="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================
          4. CUSTOMER TABLE (Exact match to Screenshot: customer list.png)
          Headers: Customer | Contact Details | Orders | Source | Successful | Cancelled | Total Spend | Reliability | Actions
          ========================================================= */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/60 text-slate-300 font-semibold text-xs">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4 text-center">Successful</th>
                <th className="py-3.5 px-4 text-center">Cancelled</th>
                <th className="py-3.5 px-4 text-right">Total Spend</th>
                <th className="py-3.5 px-4 text-center">Reliability</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredCustomers.length === 0 ? (
                /* Empty State (Exact match to Screenshot: customer list.png) */
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 text-sm font-medium">
                    No customers found
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => (
                  <tr 
                    key={c.id}
                    className="hover:bg-neutral-900/40 transition group"
                  >
                    {/* 1. Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {c.name.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">{c.name}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{c.city}, {c.state}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Contact Details */}
                    <td className="py-3.5 px-4">
                      <p className="font-mono text-xs text-white">{c.phone}</p>
                      {c.email ? (
                        <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{c.email}</p>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">No email provided</p>
                      )}
                    </td>

                    {/* 3. Orders */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                      {c.totalOrders}
                    </td>

                    {/* 4. Source */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-medium text-slate-300">
                        {c.source}
                      </span>
                    </td>

                    {/* 5. Successful */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                      {c.successfulOrders}
                    </td>

                    {/* 6. Cancelled */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-rose-400">
                      {c.cancelledOrders}
                    </td>

                    {/* 7. Total Spend */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums">
                      {formatCurrency(convertAmount(c.totalSpend, currency), currency)}
                    </td>

                    {/* 8. Reliability */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        c.reliabilityScore >= 80 
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' 
                          : c.reliabilityScore >= 50 
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60' 
                          : 'bg-red-950/80 text-red-400 border border-red-800/60'
                      }`}>
                        {c.reliabilityScore}%
                      </span>
                    </td>

                    {/* 9. Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Click */}
                        {c.phone && (
                          <a
                            href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-emerald-400 hover:text-emerald-300 transition"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* View History */}
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-sky-400 hover:text-sky-300 text-[11px] font-semibold transition cursor-pointer"
                          title="View Customer Profile & Orders"
                        >
                          View
                        </button>

                        {/* Block / Unblock Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleCustomerBlock(c.id);
                            if (addNotification) {
                              addNotification({
                                title: c.isBlocked ? 'Customer Unblocked' : 'Customer Blocked',
                                message: `${c.name} has been ${c.isBlocked ? 'removed from blacklist' : 'blocked from new orders'}.`,
                                type: 'info'
                              });
                            }
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                            c.isBlocked 
                              ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900' 
                              : 'bg-neutral-900 text-slate-400 border border-neutral-800 hover:text-slate-200'
                          }`}
                          title={c.isBlocked ? 'Unblock customer' : 'Block serial cancellation'}
                        >
                          {c.isBlocked ? 'Blocked' : 'Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* =========================================================
            5. PAGINATION FOOTER (Exact match to Screenshot: customer list.png)
            Left: Showing 1 to X of Y customers
            Right: Previous | Next buttons
            ========================================================= */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {filteredCustomers.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer font-medium"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages || filteredCustomers.length === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL: CUSTOMER PROFILE & ORDER HISTORY
          ========================================================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800/60 text-sky-400 font-bold flex items-center justify-center text-sm">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedCustomer.name}</span>
                    {selectedCustomer.isBlocked && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        Blocked
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedCustomer.city}, {selectedCustomer.state} • Source: {selectedCustomer.source}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 gap-2.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-center flex-shrink-0 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Total Orders</span>
                <span className="font-mono font-bold text-white text-sm">{selectedCustomer.totalOrders}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Fulfilled</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{selectedCustomer.successfulOrders}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Reliability</span>
                <span className="font-mono font-bold text-white text-sm">{selectedCustomer.reliabilityScore}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Lifetime Spend</span>
                <span className="font-mono font-bold text-white text-sm">
                  {formatCurrency(convertAmount(selectedCustomer.totalSpend, currency), currency)}
                </span>
              </div>
            </div>

            {/* Order History Timeline */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
                <span>Orders History ({customerOrders.length})</span>
              </h4>

              {customerOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No orders recorded on this account yet.
                </div>
              ) : (
                customerOrders.map(order => (
                  <div 
                    key={order.id}
                    className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{order.orderNumber}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                          order.status === 'DELIVERED' 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : order.status === 'CANCELLED'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs mt-1">
                        {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Address: {order.deliveryAddress}, {order.deliveryCity}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-mono font-bold text-white">
                        {formatCurrency(convertAmount(order.totalAmount, currency), currency)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  toggleCustomerBlock(selectedCustomer.id);
                  setSelectedCustomer(prev => prev ? { ...prev, isBlocked: !prev.isBlocked } : null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCustomer.isBlocked
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {selectedCustomer.isBlocked ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Unblock Customer</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Block Customer from Ordering</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
