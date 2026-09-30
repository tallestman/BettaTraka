import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { CurrencyCode, OrderStatus } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  Wallet, 
  ShoppingBag, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  XCircle, 
  Users, 
  Repeat, 
  Calendar, 
  Download, 
  ChevronDown, 
  X, 
  Check, 
  MapPin, 
  Truck, 
  Package, 
  UserCheck, 
  RotateCcw
} from 'lucide-react';

type DatePeriod = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

export const OrderReportsView: React.FC = () => {
  const { 
    orders, 
    expenses, 
    products, 
    customers, 
    agents, 
    users, 
    currency, 
    setCurrency, 
    addNotification 
  } = useCrm();

  // Filter States (Matching Ordello Screenshot ord1.png: 'This Month' active by default)
  const [datePeriod, setDatePeriod] = useState<DatePeriod>('month');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Currency options matching Ordello format
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

  // Helper to filter dates
  const filterByPeriod = (dateStr?: string) => {
    if (!dateStr) return false;
    if (datePeriod === 'all') return true;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const targetDate = new Date(dateStr);

    switch (datePeriod) {
      case 'today':
        return dateStr.startsWith(todayStr);
      case 'week': {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return targetDate >= oneWeekAgo;
      }
      case 'month':
        return targetDate.getUTCMonth() === now.getUTCMonth() && targetDate.getUTCFullYear() === now.getUTCFullYear();
      case 'year':
        return targetDate.getUTCFullYear() === now.getUTCFullYear();
      case 'custom': {
        if (customStartDate) {
          const start = new Date(customStartDate);
          if (targetDate < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (targetDate > end) return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  // Orders and expenses in period
  const periodOrders = useMemo(() => {
    return orders.filter(o => filterByPeriod(o.createdAt));
  }, [orders, datePeriod, customStartDate, customEndDate]);

  const periodExpenses = useMemo(() => {
    return expenses.filter(e => filterByPeriod(e.date));
  }, [expenses, datePeriod, customStartDate, customEndDate]);

  // =========================================================
  // ROW 1: 4 LARGE KPI CARDS (ord1.png)
  // 1. Total Revenue (From delivered orders)
  // 2. Total Orders (Placed in this period)
  // 3. Delivered (Delivered in this period)
  // 4. Delivery Rate (X of Y orders)
  // =========================================================
  const deliveredOrders = useMemo(() => {
    return periodOrders.filter(o => o.status === 'DELIVERED');
  }, [periodOrders]);

  const totalRevenueNgn = useMemo(() => {
    return deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [deliveredOrders]);

  const totalOrdersCount = periodOrders.length;
  const deliveredCount = deliveredOrders.length;

  const deliveryRatePercent = totalOrdersCount > 0
    ? Math.round((deliveredCount / totalOrdersCount) * 100)
    : 0;

  // =========================================================
  // ROW 2: 6 SMALLER KPI CARDS (ord1.png)
  // 1. Pending
  // 2. Avg Order Value
  // 3. Net Profit
  // 4. Cancel Rate
  // 5. Unique Customers
  // 6. Repeat Rate
  // =========================================================
  const pendingOrders = useMemo(() => {
    return periodOrders.filter(o => 
      o.status === 'NEW' || 
      o.status === 'CONFIRMED' || 
      o.status === 'SCHEDULED' || 
      o.status === 'DISPATCHED'
    );
  }, [periodOrders]);
  const pendingCount = pendingOrders.length;

  const avgOrderValueNgn = totalOrdersCount > 0
    ? Math.round(periodOrders.reduce((s, o) => s + (o.totalAmount || 0), 0) / totalOrdersCount)
    : 0;

  const totalCogsNgn = useMemo(() => {
    return deliveredOrders.reduce((sum, o) => {
      return sum + o.items.reduce((iSum, item) => {
        const prod = products.find(p => p.id === item.productId);
        return iSum + ((prod?.unitCost || 4000) * item.quantity);
      }, 0);
    }, 0);
  }, [deliveredOrders, products]);

  const totalExpensesNgn = useMemo(() => {
    return periodExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [periodExpenses]);

  const netProfitNgn = totalRevenueNgn - totalCogsNgn - totalExpensesNgn;

  const cancelledCount = periodOrders.filter(o => o.status === 'CANCELLED').length;
  const cancelRatePercent = totalOrdersCount > 0
    ? Math.round((cancelledCount / totalOrdersCount) * 100)
    : 0;

  // Unique customers & repeat rate
  const uniqueCustomerPhones = useMemo(() => {
    const s = new Set<string>();
    periodOrders.forEach(o => {
      if (o.customerPhone) s.add(o.customerPhone);
    });
    return s;
  }, [periodOrders]);
  const uniqueCustomersCount = uniqueCustomerPhones.size;

  const repeatCustomersCount = useMemo(() => {
    const phoneCounts = new Map<string, number>();
    periodOrders.forEach(o => {
      if (o.customerPhone) {
        phoneCounts.set(o.customerPhone, (phoneCounts.get(o.customerPhone) || 0) + 1);
      }
    });
    let repeats = 0;
    phoneCounts.forEach(count => {
      if (count > 1) repeats++;
    });
    return repeats;
  }, [periodOrders]);

  const repeatRatePercent = uniqueCustomersCount > 0
    ? Math.round((repeatCustomersCount / uniqueCustomersCount) * 100)
    : 0;

  // =========================================================
  // REVENUE TREND CHART DATA (ord1.png & ord2.png)
  // X-axis: Daily delivered revenue across Sep 2 to Sep 28
  // =========================================================
  const dailyRevenueTrend = useMemo(() => {
    // Generate dates for current month (e.g. Sep 2 to Sep 28)
    const days: { label: string; dateStr: string; revenue: number }[] = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 8 = September

    for (let day = 2; day <= 28; day++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const rev = deliveredOrders
        .filter(o => o.createdAt && o.createdAt.startsWith(dStr))
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      days.push({
        label: `Sep ${day}`,
        dateStr: dStr,
        revenue: rev
      });
    }

    return days;
  }, [deliveredOrders]);

  const maxDailyRevenue = useMemo(() => {
    const m = Math.max(...dailyRevenueTrend.map(d => d.revenue));
    return m > 0 ? m : 100000;
  }, [dailyRevenueTrend]);

  // =========================================================
  // 8 ANALYTICS BREAKDOWNS (ord2.png & ord3.png)
  // 1. Order Status Distribution
  // 2. Expenses by Category
  // 3. Top States by Orders
  // 4. Top Customers
  // 5. Top Products by Units Sold
  // 6. Top Products by Revenue
  // 7. Staff Performance
  // 8. Top Delivery Agents
  // =========================================================

  // 1. Order Status Distribution
  const orderStatusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    periodOrders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      status: status as OrderStatus,
      count,
      percent: totalOrdersCount > 0 ? Math.round((count / totalOrdersCount) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [periodOrders, totalOrdersCount]);

  // 2. Expenses by Category
  const expensesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    periodExpenses.forEach(e => {
      map.set(e.type, (map.get(e.type) || 0) + e.amount);
    });
    return Array.from(map.entries()).map(([type, amount]) => ({
      type,
      amount,
      percent: totalExpensesNgn > 0 ? Math.round((amount / totalExpensesNgn) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [periodExpenses, totalExpensesNgn]);

  // 3. Top States by Orders
  const topStatesByOrders = useMemo(() => {
    const map = new Map<string, { total: number; delivered: number }>();
    periodOrders.forEach(o => {
      const state = o.deliveryState || 'Lagos';
      const cur = map.get(state) || { total: 0, delivered: 0 };
      cur.total += 1;
      if (o.status === 'DELIVERED') cur.delivered += 1;
      map.set(state, cur);
    });
    return Array.from(map.entries()).map(([state, data]) => ({
      state,
      totalOrders: data.total,
      deliveredOrders: data.delivered,
      percent: totalOrdersCount > 0 ? Math.round((data.total / totalOrdersCount) * 100) : 0
    })).sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 5);
  }, [periodOrders, totalOrdersCount]);

  // 4. Top Customers
  const topCustomersData = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; ordersCount: number; spend: number }>();
    deliveredOrders.forEach(o => {
      const key = o.customerPhone || o.customerName;
      const cur = map.get(key) || { name: o.customerName, phone: o.customerPhone, ordersCount: 0, spend: 0 };
      cur.ordersCount += 1;
      cur.spend += o.totalAmount;
      map.set(key, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.spend - a.spend).slice(0, 5);
  }, [deliveredOrders]);

  // 5. Top Products by Units Sold
  const topProductsByUnits = useMemo(() => {
    const map = new Map<string, { product: typeof products[0]; unitsSold: number }>();
    deliveredOrders.forEach(o => {
      o.items.forEach(i => {
        const prod = products.find(p => p.id === i.productId);
        if (prod) {
          const cur = map.get(prod.id) || { product: prod, unitsSold: 0 };
          cur.unitsSold += i.quantity;
          map.set(prod.id, cur);
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);
  }, [deliveredOrders, products]);

  // 6. Top Products by Revenue
  const topProductsByRevenue = useMemo(() => {
    const map = new Map<string, { product: typeof products[0]; revenue: number }>();
    deliveredOrders.forEach(o => {
      o.items.forEach(i => {
        const prod = products.find(p => p.id === i.productId);
        if (prod) {
          const cur = map.get(prod.id) || { product: prod, revenue: 0 };
          cur.revenue += i.quantity * i.unitPrice;
          map.set(prod.id, cur);
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [deliveredOrders, products]);

  // 7. Staff Performance
  const staffPerformanceData = useMemo(() => {
    const salesReps = users.filter(u => u.role === 'Sales Representative');
    return salesReps.map(rep => {
      const repOrders = periodOrders.filter(o => o.salesRepId === rep.id || o.salesRepName === rep.name);
      const delivered = repOrders.filter(o => o.status === 'DELIVERED').length;
      const convRate = repOrders.length > 0 ? Math.round((delivered / repOrders.length) * 100) : 0;
      return {
        id: rep.id,
        name: rep.name,
        assignedOrders: repOrders.length,
        delivered,
        convRate
      };
    }).filter(s => s.assignedOrders > 0).sort((a, b) => b.delivered - a.delivered);
  }, [users, periodOrders]);

  // 8. Top Delivery Agents
  const topDeliveryAgentsData = useMemo(() => {
    return agents.map(ag => {
      const agOrders = periodOrders.filter(o => o.agentId === ag.id || o.agentName === ag.name);
      const delivered = agOrders.filter(o => o.status === 'DELIVERED').length;
      return {
        id: ag.id,
        name: ag.name,
        zone: ag.primaryZone,
        dispatched: agOrders.length,
        delivered,
        successRate: agOrders.length > 0 ? Math.round((delivered / agOrders.length) * 100) : ag.successRate
      };
    }).filter(a => a.dispatched > 0).sort((a, b) => b.delivered - a.delivered);
  }, [agents, periodOrders]);

  // Export PDF / CSV Report
  const handleExportPdf = () => {
    const filename = `ordello_order_reports_${datePeriod}_${new Date().toISOString().slice(0, 10)}.csv`;
    let csv = "Order Reports Summary\n";
    csv += `"Metric","Value"\n`;
    csv += `"Total Revenue (NGN)",${totalRevenueNgn}\n`;
    csv += `"Total Orders Placed",${totalOrdersCount}\n`;
    csv += `"Delivered Orders",${deliveredCount}\n`;
    csv += `"Delivery Success Rate","${deliveryRatePercent}%"\n`;
    csv += `"Pending Orders",${pendingCount}\n`;
    csv += `"Avg Order Value (NGN)",${avgOrderValueNgn}\n`;
    csv += `"Net Profit (NGN)",${netProfitNgn}\n`;
    csv += `"Cancel Rate","${cancelRatePercent}%"\n`;
    csv += `"Unique Customers",${uniqueCustomersCount}\n`;
    csv += `"Repeat Purchase Rate","${repeatRatePercent}%"\n`;

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (addNotification) {
      addNotification({
        title: 'Order Report Exported',
        message: 'Order analytics and store performance data exported successfully.',
        type: 'success'
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 animate-in fade-in select-none">
      {/* =========================================================
          1. HEADER (Exact match to Screenshot ord1.png)
          Title: Order Reports (Sky Blue)
          Subtitle: At-a-glance analytics for every order across your store
          ========================================================= */}
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-400">
          Order Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          At-a-glance analytics for every order across your store
        </p>
      </div>

      {/* =========================================================
          2. FILTER & CONTROLS ROW (Matching ord1.png)
          Currency Dropdown | Period Filter Pills | Date Range | Export PDF
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        {/* Left Side: Currency, Period Pills, Date Range */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Currency Dropdown (₦ Nigerian Naira) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/90 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold text-white transition cursor-pointer shadow-sm"
            >
              <span>{currentCurrencyInfo.symbol} {currentCurrencyInfo.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute left-0 mt-1.5 w-52 rounded-xl bg-neutral-950 border border-neutral-800 shadow-2xl z-30 p-1 space-y-0.5 animate-in fade-in">
                {currencyOptions.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      setCurrency(opt.code);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition text-left ${
                      currency === opt.code 
                        ? 'bg-sky-600 text-white font-semibold' 
                        : 'text-slate-300 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    <span>{opt.symbol} {opt.label}</span>
                    {currency === opt.code && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Period Pills (Ordello Solid White Active Pill: 'This Month' in ord1.png) */}
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
                  }}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Date Range Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
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
                  <span className="text-xs font-semibold text-white">Select Date Range</span>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDatePeriod('custom');
                      setShowDatePicker(false);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Export PDF Button (Ordello Sky Button) */}
        <button
          type="button"
          onClick={handleExportPdf}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs sm:text-sm shadow-sm transition cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 stroke-[2.2]" />
          <span>Export PDF</span>
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
          3. ROW 1: 4 PRIMARY LARGE KPI CARDS (Screenshot ord1.png)
          - Total Revenue (Wallet Icon)
          - Total Orders (Orange Bag Icon)
          - Delivered (Green CheckCircle Icon)
          - Delivery Rate (TrendingUp Icon)
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Revenue */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-sky-950/60 border border-sky-800/50 flex items-center justify-center text-sky-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight truncate">
              {formatCurrency(convertAmount(totalRevenueNgn, currency), currency)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              From delivered orders
            </p>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-500">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {totalOrdersCount}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Placed in this period
            </p>
          </div>
        </div>

        {/* Card 3: Delivered */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Delivered</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {deliveredCount}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Delivered in this period
            </p>
          </div>
        </div>

        {/* Card 4: Delivery Rate */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Delivery Rate</span>
            <div className="w-8 h-8 rounded-xl bg-sky-950/60 border border-sky-800/50 flex items-center justify-center text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {deliveryRatePercent}%
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {deliveredCount} of {totalOrdersCount} orders
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          4. ROW 2: 6 SMALLER METRIC CARDS (Screenshot ord1.png)
          - Pending (Amber AlertTriangle)
          - Avg Order Value (Sky TrendingUp)
          - Net Profit (Green DollarSign)
          - Cancel Rate (Red XCircle)
          - Unique Customers (Purple Users)
          - Repeat Rate (Blue Repeat)
          ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Pending */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 flex flex-col justify-between min-h-[110px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-lg bg-amber-950/60 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-medium text-slate-400 block">Pending</span>
            <p className="text-2xl font-bold font-mono text-white tracking-tight mt-0.5">
              {pendingCount}
            </p>
          </div>
        </div>

        {/* Card 2: Avg Order Value */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 flex flex-col justify-between min-h-[110px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-lg bg-sky-950/60 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-medium text-slate-400 block">Avg Order Value</span>
            <p className="text-2xl font-bold font-mono text-white tracking-tight mt-0.5 truncate">
              {formatCurrency(convertAmount(avgOrderValueNgn, currency), currency)}
            </p>
          </div>
        </div>

        {/* Card 3: Net Profit */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 flex flex-col justify-between min-h-[110px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-medium text-slate-400 block">Net Profit</span>
            <p className="text-2xl font-bold font-mono text-white tracking-tight mt-0.5 truncate">
              {formatCurrency(convertAmount(netProfitNgn, currency), currency)}
            </p>
          </div>
        </div>

        {/* Card 4: Cancel Rate */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 flex flex-col justify-between min-h-[110px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-lg bg-rose-950/60 text-rose-500 flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-medium text-slate-400 block">Cancel Rate</span>
            <p className="text-2xl font-bold font-mono text-white tracking-tight mt-0.5">
              {cancelRatePercent}%
            </p>
          </div>
        </div>

        {/* Card 5: Unique Customers */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 flex flex-col justify-between min-h-[110px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-lg bg-purple-950/60 text-purple-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-medium text-slate-400 block">Unique Customers</span>
            <p className="text-2xl font-bold font-mono text-white tracking-tight mt-0.5">
              {uniqueCustomersCount}
            </p>
          </div>
        </div>

        {/* Card 6: Repeat Rate */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 flex flex-col justify-between min-h-[110px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center">
              <Repeat className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-medium text-slate-400 block">Repeat Rate</span>
            <p className="text-2xl font-bold font-mono text-white tracking-tight mt-0.5">
              {repeatRatePercent}%
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          5. REVENUE TREND PANEL (Screenshot ord1.png & ord2.png)
          Title: Revenue Trend
          Subtitle: Daily delivered revenue
          X-Axis Dates: Sep 2 to Sep 28 along baseline
          ========================================================= */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Revenue Trend
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Daily delivered revenue
          </p>
        </div>

        {/* Chart Viewport */}
        <div className="pt-4 pb-2">
          <div className="relative w-full h-48 border-b border-neutral-800 flex items-end justify-between gap-1 overflow-x-auto">
            {/* Daily Bars & Baseline Line */}
            {dailyRevenueTrend.map((d, idx) => {
              const h = Math.max(3, Math.round((d.revenue / maxDailyRevenue) * 100));

              return (
                <div 
                  key={idx} 
                  className="flex-1 min-w-[28px] sm:min-w-[34px] flex flex-col items-center gap-1 h-full justify-end group"
                >
                  <div 
                    className="w-full max-w-[14px] bg-sky-500/80 hover:bg-sky-400 rounded-t transition-all"
                    style={{ height: `${d.revenue > 0 ? h : 3}%` }}
                    title={`${d.label}: ₦${d.revenue.toLocaleString()}`}
                  />
                  <span className="text-[9px] font-mono text-slate-500 group-hover:text-white whitespace-nowrap mt-1">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Blue baseline glow indicator matching ord2.png */}
          <div className="w-full h-0.5 bg-sky-500/90 shadow-sm shadow-sky-500/50" />
        </div>
      </div>

      {/* =========================================================
          6. 2x2 ANALYTICS GRID - ROW 1 (Screenshot ord2.png)
          - Order Status Distribution
          - Expenses by Category
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Order Status Distribution */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[220px] shadow-sm">
          <h3 className="text-base font-bold text-white tracking-tight pb-3 border-b border-neutral-800/60">
            Order Status Distribution
          </h3>

          <div className="flex-1 flex flex-col justify-center py-4">
            {orderStatusDistribution.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No orders in this period
              </div>
            ) : (
              <div className="space-y-3">
                {orderStatusDistribution.map((item) => (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">
                        {item.status}
                      </span>
                      <span className="font-mono text-slate-400 font-medium tabular-nums">
                        {item.count} orders ({item.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === 'DELIVERED' ? 'bg-emerald-500' :
                          item.status === 'CANCELLED' ? 'bg-rose-500' :
                          item.status === 'DISPATCHED' ? 'bg-sky-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, item.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Expenses by Category */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[220px] shadow-sm">
          <h3 className="text-base font-bold text-white tracking-tight pb-3 border-b border-neutral-800/60">
            Expenses by Category
          </h3>

          <div className="flex-1 flex flex-col justify-center py-4">
            {expensesByCategory.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No expenses recorded
              </div>
            ) : (
              <div className="space-y-3">
                {expensesByCategory.map((item) => (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate">
                        {item.type}
                      </span>
                      <span className="font-mono text-slate-400 font-medium tabular-nums">
                        {formatCurrency(convertAmount(item.amount, currency), currency)} ({item.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-sky-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, item.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          7. 2x2 ANALYTICS GRID - ROW 2 (Screenshot ord2.png)
          - Top States by Orders
          - Top Customers
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 3: Top States by Orders */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[220px] shadow-sm">
          <h3 className="text-base font-bold text-white tracking-tight pb-3 border-b border-neutral-800/60">
            Top States by Orders
          </h3>

          <div className="flex-1 flex flex-col justify-center py-4">
            {topStatesByOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No location data
              </div>
            ) : (
              <div className="space-y-3">
                {topStatesByOrders.map((item) => (
                  <div key={item.state} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.state}</span>
                      </span>
                      <span className="font-mono text-slate-400 font-medium tabular-nums">
                        {item.totalOrders} orders ({item.deliveredOrders} delivered)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-sky-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, item.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Top Customers */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[220px] shadow-sm">
          <h3 className="text-base font-bold text-white tracking-tight pb-3 border-b border-neutral-800/60">
            Top Customers
          </h3>

          <div className="flex-1 flex flex-col justify-center py-4">
            {topCustomersData.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No delivered orders yet
              </div>
            ) : (
              <div className="space-y-2.5">
                {topCustomersData.map((cust, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/40 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{cust.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{cust.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-white tabular-nums">
                        {formatCurrency(convertAmount(cust.spend, currency), currency)}
                      </p>
                      <p className="text-[10px] text-slate-400">{cust.ordersCount} delivered</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          8. 2x2 ANALYTICS GRID - ROW 3 (Screenshot ord3.png)
          - Top Products by Units Sold
          - Top Products by Revenue
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 5: Top Products by Units Sold */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[220px] shadow-sm">
          <h3 className="text-base font-bold text-white tracking-tight pb-3 border-b border-neutral-800/60">
            Top Products by Units Sold
          </h3>

          <div className="flex-1 flex flex-col justify-center py-4">
            {topProductsByUnits.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No sales data
              </div>
            ) : (
              <div className="space-y-3">
                {topProductsByUnits.map((item, idx) => (
                  <div key={item.product.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-medium truncate max-w-[200px]">
                        {idx + 1}. {item.product.name}
                      </span>
                      <span className="font-mono font-bold text-sky-400 tabular-nums">
                        {item.unitsSold} units
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-sky-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, (item.unitsSold / 50) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 6: Top Products by Revenue */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[220px] shadow-sm">
          <h3 className="text-base font-bold text-white tracking-tight pb-3 border-b border-neutral-800/60">
            Top Products by Revenue
          </h3>

          <div className="flex-1 flex flex-col justify-center py-4">
            {topProductsByRevenue.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No sales data
              </div>
            ) : (
              <div className="space-y-3">
                {topProductsByRevenue.map((item, idx) => (
                  <div key={item.product.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-medium truncate max-w-[200px]">
                        {idx + 1}. {item.product.name}
                      </span>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(convertAmount(item.revenue, currency), currency)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, (item.revenue / (totalRevenueNgn || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          9. 2x2 ANALYTICS GRID - ROW 4 (Screenshot ord3.png)
          - Staff Performance
          - Top Delivery Agents
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 7: Staff Performance */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[220px] shadow-sm">
          <h3 className="text-base font-bold text-white tracking-tight pb-3 border-b border-neutral-800/60">
            Staff Performance
          </h3>

          <div className="flex-1 flex flex-col justify-center py-4">
            {staffPerformanceData.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No orders assigned to staff yet
              </div>
            ) : (
              <div className="space-y-2.5">
                {staffPerformanceData.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/40 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center">
                        {staff.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-white">{staff.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-400">{staff.assignedOrders} assigned</span>
                      <span className="font-bold text-emerald-400">{staff.delivered} delivered ({staff.convRate}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 8: Top Delivery Agents */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[220px] shadow-sm">
          <h3 className="text-base font-bold text-white tracking-tight pb-3 border-b border-neutral-800/60">
            Top Delivery Agents
          </h3>

          <div className="flex-1 flex flex-col justify-center py-4">
            {topDeliveryAgentsData.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No agent dispatch data yet
              </div>
            ) : (
              <div className="space-y-2.5">
                {topDeliveryAgentsData.map((ag) => (
                  <div key={ag.id} className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/40 text-xs">
                    <div>
                      <p className="font-semibold text-white">{ag.name}</p>
                      <p className="text-[10px] text-slate-400">{ag.zone}</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-bold text-emerald-400">{ag.delivered} / {ag.dispatched} delivered</p>
                      <p className="text-[10px] text-sky-400">{ag.successRate}% success rate</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
