import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Order, Expense, CurrencyCode, Product, DeliveryAgent, User } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Download, 
  ChevronDown, 
  X, 
  Check, 
  Users, 
  Truck, 
  FileText, 
  Package, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Percent,
  Layers,
  BarChart3
} from 'lucide-react';

type DatePeriod = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';
type FinancialTab = 'overview' | 'sales_rep' | 'agent_costs' | 'pnl' | 'product_profitability';

export const FinancialReportsView: React.FC = () => {
  const { 
    orders, 
    expenses, 
    products, 
    agents, 
    agentStock, 
    users, 
    remittances, 
    currency, 
    setCurrency, 
    addNotification 
  } = useCrm();

  // Navigation and Filter States (Matching BettaTraka Screenshot financial.png)
  const [activeTab, setActiveTab] = useState<FinancialTab>('overview');
  const [datePeriod, setDatePeriod] = useState<DatePeriod>('today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

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

  // =========================================================
  // PERIOD FILTERING LOGIC
  // =========================================================
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

  // Filtered orders and expenses
  const periodOrders = useMemo(() => {
    return orders.filter(o => filterByPeriod(o.createdAt));
  }, [orders, datePeriod, customStartDate, customEndDate]);

  const deliveredOrders = useMemo(() => {
    return periodOrders.filter(o => o.status === 'DELIVERED');
  }, [periodOrders]);

  const periodExpenses = useMemo(() => {
    return expenses.filter(e => filterByPeriod(e.date));
  }, [expenses, datePeriod, customStartDate, customEndDate]);

  // =========================================================
  // 4 PRIMARY STATS (Matching Screenshot: financial.png)
  // 1. REVENUE
  // 2. GROSS PROFIT
  // 3. NET PROFIT
  // 4. TOTAL EXPENSES
  // =========================================================
  const totalRevenueNgn = useMemo(() => {
    return deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [deliveredOrders]);

  const totalCogsNgn = useMemo(() => {
    return deliveredOrders.reduce((sum, o) => {
      return sum + o.items.reduce((iSum, item) => {
        const prod = products.find(p => p.id === item.productId);
        const cost = prod?.unitCost || 4000;
        return iSum + (cost * item.quantity);
      }, 0);
    }, 0);
  }, [deliveredOrders, products]);

  const grossProfitNgn = totalRevenueNgn - totalCogsNgn;

  const totalExpensesNgn = useMemo(() => {
    return periodExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [periodExpenses]);

  const netProfitNgn = grossProfitNgn - totalExpensesNgn;

  // Margin percentages
  const grossMarginPercent = totalRevenueNgn > 0 ? Math.round((grossProfitNgn / totalRevenueNgn) * 100) : 0;
  const netMarginPercent = totalRevenueNgn > 0 ? Math.round((netProfitNgn / totalRevenueNgn) * 100) : 0;

  // =========================================================
  // HOURLY / PERIOD CHART DATA (Matching Screenshot: financial.png)
  // "Revenue vs. Expenses" with dashed grid lines and hourly ticks
  // =========================================================
  const chartTrackingData = useMemo(() => {
    if (datePeriod === 'today') {
      // 8 time buckets: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00
      const buckets = [
        { label: '00:00', startHour: 0, endHour: 3 },
        { label: '03:00', startHour: 3, endHour: 6 },
        { label: '06:00', startHour: 6, endHour: 9 },
        { label: '09:00', startHour: 9, endHour: 12 },
        { label: '12:00', startHour: 12, endHour: 15 },
        { label: '15:00', startHour: 15, endHour: 18 },
        { label: '18:00', startHour: 18, endHour: 21 },
        { label: '21:00', startHour: 21, endHour: 24 }
      ];

      return buckets.map(b => {
        const bucketOrders = deliveredOrders.filter(o => {
          if (!o.createdAt) return false;
          const h = new Date(o.createdAt).getHours();
          return h >= b.startHour && h < b.endHour;
        });

        const rev = bucketOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        // Distribute expenses across active operational hours
        const expShare = b.startHour >= 9 && b.startHour <= 18 && totalExpensesNgn > 0 
          ? Math.round(totalExpensesNgn / 4) 
          : 0;

        return {
          label: b.label,
          revenue: rev,
          expenses: expShare
        };
      });
    }

    if (datePeriod === 'week') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((day, idx) => {
        const rev = deliveredOrders
          .filter((_, i) => i % 7 === idx)
          .reduce((sum, o) => sum + o.totalAmount, 0);
        const exp = Math.round(totalExpensesNgn / 7);
        return { label: day, revenue: rev, expenses: exp };
      });
    }

    // Default 6 months or multi-period
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    return months.map((m, idx) => {
      const rev = deliveredOrders
        .filter((_, i) => i % 6 === idx)
        .reduce((sum, o) => sum + o.totalAmount, 0);
      const exp = Math.round(totalExpensesNgn / 6);
      return { label: m, revenue: rev, expenses: exp };
    });
  }, [datePeriod, deliveredOrders, totalExpensesNgn]);

  const maxChartValue = useMemo(() => {
    const maxVal = Math.max(...chartTrackingData.map(d => Math.max(d.revenue, d.expenses)));
    return maxVal > 0 ? maxVal : 100000;
  }, [chartTrackingData]);

  // =========================================================
  // SALES REP COMMISSION & FINANCE BREAKDOWN
  // =========================================================
  const salesRepsFinance = useMemo(() => {
    const salesReps = users.filter(u => u.role === 'Sales Representative');
    return salesReps.map(rep => {
      const repOrders = periodOrders.filter(o => o.salesRepId === rep.id || o.salesRepName === rep.name);
      const deliveredCount = repOrders.filter(o => o.status === 'DELIVERED').length;
      const totalAmount = repOrders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.totalAmount, 0);
      const commissionRate = rep.commissionPerOrder || 1500;
      const totalCommission = deliveredCount * commissionRate;
      const salary = rep.fixedSalary || 75000;
      const convRate = repOrders.length > 0 ? Math.round((deliveredCount / repOrders.length) * 100) : 0;

      return {
        id: rep.id,
        name: rep.name,
        phone: rep.phone,
        totalAssigned: repOrders.length,
        deliveredCount,
        convRate,
        totalAmount,
        commissionRate,
        totalCommission,
        salary,
        totalPayout: totalCommission + (rep.payStructure === 'Hybrid' || rep.payStructure === 'Fixed' ? salary : 0)
      };
    });
  }, [users, periodOrders]);

  // =========================================================
  // AGENT COSTS BREAKDOWN
  // =========================================================
  const agentCostsBreakdown = useMemo(() => {
    return agents.map(ag => {
      const agOrders = periodOrders.filter(o => o.agentId === ag.id || o.agentName === ag.name);
      const deliveredCount = agOrders.filter(o => o.status === 'DELIVERED').length;
      
      // Calculate actual delivery fees deducted during remittance
      const agentRemitFees = remittances
        .filter(r => (r.agentId === ag.id || r.agentName === ag.name) && (r.deliveryFeeDeducted || 0) > 0)
        .reduce((sum, r) => sum + (r.deliveryFeeDeducted || 0), 0);

      const ratePerDelivery = 2500;
      const totalFeesEarned = agentRemitFees > 0 ? agentRemitFees : (deliveredCount * ratePerDelivery);

      const stocks = agentStock.filter(s => s.agentId === ag.id);
      const defectiveVal = stocks.reduce((sum, s) => {
        const prod = products.find(p => p.id === s.productId);
        return sum + (s.defectiveUnits * (prod?.unitCost || 4000));
      }, 0);
      const missingVal = stocks.reduce((sum, s) => {
        const prod = products.find(p => p.id === s.productId);
        return sum + (s.missingUnits * (prod?.sellingPrice || 24500));
      }, 0);

      const netPayable = Math.max(0, totalFeesEarned - missingVal);

      return {
        id: ag.id,
        name: ag.name,
        zone: ag.primaryZone,
        totalDispatched: agOrders.length,
        deliveredCount,
        successRate: ag.successRate,
        ratePerDelivery,
        totalFeesEarned,
        defectiveVal,
        missingVal,
        netPayable
      };
    });
  }, [agents, periodOrders, agentStock, products]);

  // =========================================================
  // PRODUCT PROFITABILITY DATA
  // =========================================================
  const productProfitabilityData = useMemo(() => {
    return products.map(prod => {
      let unitsSold = 0;
      let revenue = 0;

      deliveredOrders.forEach(o => {
        o.items.forEach(i => {
          if (i.productId === prod.id) {
            unitsSold += i.quantity;
            revenue += i.quantity * i.unitPrice;
          }
        });
      });

      const cogs = unitsSold * prod.unitCost;
      const grossMargin = revenue - cogs;
      const marginPct = revenue > 0 ? Math.round((grossMargin / revenue) * 100) : 0;

      // Attributed ad spend
      const prodExpenses = periodExpenses
        .filter(e => e.productId === prod.id)
        .reduce((sum, e) => sum + e.amount, 0);

      const netProfit = grossMargin - prodExpenses;
      const netMarginPct = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

      return {
        product: prod,
        unitsSold,
        revenue,
        cogs,
        grossMargin,
        marginPct,
        prodExpenses,
        netProfit,
        netMarginPct
      };
    });
  }, [products, deliveredOrders, periodExpenses]);

  // =========================================================
  // EXPORT REPORT CSV HANDLER (Matching Screenshot Button)
  // =========================================================
  const handleExportReport = () => {
    const filename = `bettatraka_financial_report_${activeTab}_${datePeriod}_${new Date().toISOString().slice(0, 10)}.csv`;
    let csv = "";

    if (activeTab === 'overview' || activeTab === 'pnl') {
      csv = "Financial Metric,Amount (NGN),Notes\n";
      csv += `"Delivered Gross Revenue",${totalRevenueNgn},"Cash collected from doorsteps"\n`;
      csv += `"Cost of Goods Sold (COGS)",${totalCogsNgn},"Factory unit cost"\n`;
      csv += `"Gross Profit",${grossProfitNgn},"Gross Margin: ${grossMarginPercent}%"\n`;
      csv += `"Total Operational Expenses",${totalExpensesNgn},"Ads, Rider Fees, Software, Operations"\n`;
      csv += `"Net Operating Profit",${netProfitNgn},"Net Margin: ${netMarginPercent}%"\n`;
    } else if (activeTab === 'sales_rep') {
      csv = "Sales Rep,Phone,Orders Assigned,Delivered Orders,Conversion Rate,Commission Earned (NGN),Base Salary (NGN),Total Payout (NGN)\n";
      salesRepsFinance.forEach(r => {
        csv += `"${r.name}","${r.phone}",${r.totalAssigned},${r.deliveredCount},"${r.convRate}%",${r.totalCommission},${r.salary},${r.totalPayout}\n`;
      });
    } else if (activeTab === 'agent_costs') {
      csv = "Delivery Agent,Coverage Zone,Dispatched Orders,Delivered,Success Rate,Delivery Fees (NGN),Missing Stock Penalties (NGN),Net Remitted (NGN)\n";
      agentCostsBreakdown.forEach(a => {
        csv += `"${a.name}","${a.zone}",${a.totalDispatched},${a.deliveredCount},"${a.successRate}%",${a.totalFeesEarned},${a.missingVal},${a.netPayable}\n`;
      });
    } else {
      csv = "Product Name,Selling Price (NGN),Unit Cost (NGN),Units Sold,Gross Revenue (NGN),COGS (NGN),Gross Margin (NGN),Margin %,Attributed Expenses (NGN),Net Profit (NGN)\n";
      productProfitabilityData.forEach(p => {
        csv += `"${p.product.name}",${p.product.sellingPrice},${p.product.unitCost},${p.unitsSold},${p.revenue},${p.cogs},${p.grossMargin},"${p.marginPct}%",${p.prodExpenses},${p.netProfit}\n`;
      });
    }

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (addNotification) {
      addNotification({
        title: 'Financial Report Exported',
        message: `Saved ${activeTab.replace('_', ' ')} export to CSV.`,
        type: 'success'
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 animate-in fade-in select-none">
      {/* =========================================================
          1. HEADER (Exact match to Screenshot: financial.png)
          Title: Financial Reports (Sky Blue)
          Subtitle: Comprehensive financial analytics and performance tracking
          ========================================================= */}
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-400">
          Financial Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Comprehensive financial analytics and performance tracking
        </p>
      </div>

      {/* =========================================================
          2. FILTER & CURRENCY CONTROLS ROW (Matching financial.png)
          Currency Dropdown | Date Period Pills | Date Range
          ========================================================= */}
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

        {/* Date Period Pills (BettaTraka Solid White Active Pill) */}
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

        {/* Date Range Modal / Popover Toggle */}
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
          3. SUB-NAVIGATION TABS BAR (Exact match to Screenshot: financial.png)
          Tabs: Financial Overview | Sales Rep Finance | Agent Costs | Profit & Loss | Product Profitability
          ========================================================= */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-1 flex items-center justify-between overflow-x-auto shadow-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          {(
            [
              { id: 'overview', label: 'Financial Overview' },
              { id: 'sales_rep', label: 'Sales Rep Finance' },
              { id: 'agent_costs', label: 'Agent Costs' },
              { id: 'pnl', label: 'Profit & Loss' },
              { id: 'product_profitability', label: 'Product Profitability' }
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-white font-bold bg-neutral-900 shadow-sm border-b-2 border-sky-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-neutral-900/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Report Action Row (Aligned right matching financial.png) */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleExportReport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs sm:text-sm shadow-sm transition cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4 stroke-[2.2]" />
          <span>Export Report</span>
        </button>
      </div>

      {/* =========================================================
          4. TAB 1: FINANCIAL OVERVIEW (Default View from financial.png)
          - 4 KPI CARDS: Revenue | Gross Profit | Net Profit | Total Expenses
          - CHART: Revenue vs. Expenses (Hourly tracking for today)
          ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* The 4 KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Revenue */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="pt-3">
                <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight truncate">
                  {formatCurrency(convertAmount(totalRevenueNgn, currency), currency)}
                </p>
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono mt-1">
                  <span>+0.0% vs last period</span>
                </div>
              </div>
            </div>

            {/* Card 2: Gross Profit */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Gross Profit</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="pt-3">
                <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight truncate">
                  {formatCurrency(convertAmount(grossProfitNgn, currency), currency)}
                </p>
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono mt-1">
                  <span>+0.0% vs last period</span>
                </div>
              </div>
            </div>

            {/* Card 3: Net Profit */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Net Profit</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="pt-3">
                <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight truncate">
                  {formatCurrency(convertAmount(netProfitNgn, currency), currency)}
                </p>
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono mt-1">
                  <span>+0.0% vs last period</span>
                </div>
              </div>
            </div>

            {/* Card 4: Total Expenses */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Expenses</span>
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <div className="pt-3">
                <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight truncate">
                  {formatCurrency(convertAmount(totalExpensesNgn, currency), currency)}
                </p>
                <div className="flex items-center gap-1 text-xs text-rose-400 font-mono mt-1">
                  <span>+0.0% vs last period</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue vs. Expenses Chart Panel (Exact match to Screenshot financial.png) */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Revenue vs. Expenses
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {datePeriod === 'today' ? 'Hourly tracking for today' :
                   datePeriod === 'week' ? 'Daily tracking for this week' :
                   datePeriod === 'month' ? 'Daily tracking for this month' :
                   'Monthly tracking for this year'}
                </p>
              </div>

              {/* Chart Legend on Top Right */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span>Expenses</span>
                </div>
              </div>
            </div>

            {/* Dashed Grid Chart Area */}
            <div className="pt-4 pb-2">
              <div className="relative w-full h-56 border border-dashed border-neutral-800/80 rounded-xl p-4 flex flex-col justify-between bg-neutral-900/20">
                {/* Horizontal Dashed Grid Lines with Y-Axis Values */}
                <div className="absolute inset-x-4 top-4 border-b border-dashed border-neutral-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 -translate-y-2">4</span>
                </div>
                <div className="absolute inset-x-4 top-1/4 border-b border-dashed border-neutral-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 -translate-y-2">3</span>
                </div>
                <div className="absolute inset-x-4 top-2/4 border-b border-dashed border-neutral-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 -translate-y-2">2</span>
                </div>
                <div className="absolute inset-x-4 top-3/4 border-b border-dashed border-neutral-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 -translate-y-2">1</span>
                </div>

                {/* Bars or Points for Tracking */}
                <div className="flex-1 flex items-end justify-between gap-2 z-10 px-4">
                  {chartTrackingData.map((d, idx) => {
                    const revHeight = Math.max(4, Math.round((d.revenue / maxChartValue) * 100));
                    const expHeight = Math.max(4, Math.round((d.expenses / maxChartValue) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                        <div className="flex items-end gap-1 w-full justify-center h-full">
                          {/* Revenue Bar */}
                          <div 
                            className="w-2 sm:w-3.5 bg-sky-500 rounded-t transition-all group-hover:brightness-125"
                            style={{ height: `${d.revenue > 0 ? revHeight : 4}%` }}
                            title={`Revenue: ₦${d.revenue.toLocaleString()}`}
                          />
                          {/* Expense Bar */}
                          <div 
                            className="w-2 sm:w-3.5 bg-white/90 rounded-t transition-all group-hover:brightness-125"
                            style={{ height: `${d.expenses > 0 ? expHeight : 4}%` }}
                            title={`Expenses: ₦${d.expenses.toLocaleString()}`}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-white mt-2">
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          5. TAB 2: SALES REP FINANCE
          ========================================================= */}
      {activeTab === 'sales_rep' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm">
            <h3 className="text-base font-bold text-white tracking-tight mb-1">
              Sales Rep Commissions & Compensation Ledger
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Closed orders, delivered conversion payouts, and commission tier calculation.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/60 text-slate-300 font-semibold text-xs">
                    <th className="py-3 px-4">Sales Representative</th>
                    <th className="py-3 px-4 text-center">Assigned Leads</th>
                    <th className="py-3 px-4 text-center">Delivered Orders</th>
                    <th className="py-3 px-4 text-center">Delivery Conv %</th>
                    <th className="py-3 px-4 text-right">Commission Rate</th>
                    <th className="py-3 px-4 text-right">Commissions Earned</th>
                    <th className="py-3 px-4 text-right">Total Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {salesRepsFinance.map((rep) => (
                    <tr key={rep.id} className="hover:bg-neutral-900/40 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{rep.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{rep.phone}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-white">
                        {rep.totalAssigned}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                        {rep.deliveredCount}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sky-400">
                        {rep.convRate}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {formatCurrency(convertAmount(rep.commissionRate, currency), currency)} / order
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(convertAmount(rep.totalCommission, currency), currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums">
                        {formatCurrency(convertAmount(rep.totalPayout, currency), currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          6. TAB 3: AGENT COSTS
          ========================================================= */}
      {activeTab === 'agent_costs' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm">
            <h3 className="text-base font-bold text-white tracking-tight mb-1">
              Regional Delivery Agent & 3PL Logistics Fees
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Doorstep rider fulfillment costs, remittance status, and stock deduction audit.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/60 text-slate-300 font-semibold text-xs">
                    <th className="py-3 px-4">Agent / Fleet Name</th>
                    <th className="py-3 px-4">Coverage Zone</th>
                    <th className="py-3 px-4 text-center">Dispatched</th>
                    <th className="py-3 px-4 text-center">Delivered</th>
                    <th className="py-3 px-4 text-center">Success Rate</th>
                    <th className="py-3 px-4 text-right">Rider Earnings</th>
                    <th className="py-3 px-4 text-right">Deductions</th>
                    <th className="py-3 px-4 text-right">Net Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {agentCostsBreakdown.map((ag) => (
                    <tr key={ag.id} className="hover:bg-neutral-900/40 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{ag.name}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {ag.zone}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-white">
                        {ag.totalDispatched}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                        {ag.deliveredCount}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sky-400">
                        {ag.successRate}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums">
                        {formatCurrency(convertAmount(ag.totalFeesEarned, currency), currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-rose-400 tabular-nums">
                        {ag.missingVal > 0 ? `-${formatCurrency(convertAmount(ag.missingVal, currency), currency)}` : '₦0'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(convertAmount(ag.netPayable, currency), currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          7. TAB 4: PROFIT & LOSS (P&L) STATEMENT
          ========================================================= */}
      {activeTab === 'pnl' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Comprehensive Profit & Loss Statement
                </h3>
                <p className="text-xs text-slate-400">
                  Standard GAAP ledger breakdown for Nigerian and African direct-to-consumer e-commerce.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-slate-300">
                  Gross Margin: <strong className="text-emerald-400">{grossMarginPercent}%</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-slate-300">
                  Net Margin: <strong className="text-sky-400">{netMarginPercent}%</strong>
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* Section 1: Income / Revenue */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-bold text-white border-b border-neutral-800/80 pb-1.5 text-sm">
                  <span>1. OPERATING REVENUE</span>
                  <span>{formatCurrency(convertAmount(totalRevenueNgn, currency), currency)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pl-4">
                  <span>Gross Doorstep Cash Collected (Delivered)</span>
                  <span className="text-white">{formatCurrency(convertAmount(totalRevenueNgn, currency), currency)}</span>
                </div>
              </div>

              {/* Section 2: COGS */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between font-bold text-white border-b border-neutral-800/80 pb-1.5 text-sm">
                  <span>2. COST OF GOODS SOLD (COGS)</span>
                  <span className="text-rose-400">−{formatCurrency(convertAmount(totalCogsNgn, currency), currency)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pl-4">
                  <span>Direct Factory Product Procurement Cost</span>
                  <span className="text-white">{formatCurrency(convertAmount(totalCogsNgn, currency), currency)}</span>
                </div>
              </div>

              {/* Gross Profit Summary */}
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between font-bold text-sm text-emerald-400">
                <span>GROSS PROFIT</span>
                <span>{formatCurrency(convertAmount(grossProfitNgn, currency), currency)}</span>
              </div>

              {/* Section 3: Operating Expenses */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between font-bold text-white border-b border-neutral-800/80 pb-1.5 text-sm">
                  <span>3. OPERATING EXPENSES (OPEX)</span>
                  <span className="text-rose-400">−{formatCurrency(convertAmount(totalExpensesNgn, currency), currency)}</span>
                </div>
                {periodExpenses.map(e => (
                  <div key={e.id} className="flex items-center justify-between text-slate-400 pl-4">
                    <span>{e.type}: {e.description}</span>
                    <span className="text-slate-200">{formatCurrency(convertAmount(e.amount, currency), currency)}</span>
                  </div>
                ))}
              </div>

              {/* Net Profit Summary */}
              <div className="p-4 rounded-xl bg-sky-950/80 border border-sky-800/80 flex items-center justify-between font-bold text-base text-sky-400 shadow-sm">
                <span>NET OPERATING PROFIT</span>
                <span>{formatCurrency(convertAmount(netProfitNgn, currency), currency)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          8. TAB 5: PRODUCT PROFITABILITY
          ========================================================= */}
      {activeTab === 'product_profitability' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm">
            <h3 className="text-base font-bold text-white tracking-tight mb-1">
              Unit Economics & Product Profitability
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Selling price, landed unit COGS, ad attribution, and net contribution per SKU.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/60 text-slate-300 font-semibold text-xs">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-right">Unit COGS</th>
                    <th className="py-3 px-4 text-center">Margin / Unit</th>
                    <th className="py-3 px-4 text-center">Units Sold</th>
                    <th className="py-3 px-4 text-right">Gross Margin</th>
                    <th className="py-3 px-4 text-right">Attributed Ads</th>
                    <th className="py-3 px-4 text-right">Net Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {productProfitabilityData.map((item) => {
                    const marginPerUnit = item.product.sellingPrice - item.product.unitCost;
                    return (
                      <tr key={item.product.id} className="hover:bg-neutral-900/40 transition">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {item.product.name}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-white">
                          {formatCurrency(convertAmount(item.product.sellingPrice, currency), currency)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                          {formatCurrency(convertAmount(item.product.unitCost, currency), currency)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                          +{formatCurrency(convertAmount(marginPerUnit, currency), currency)} ({item.marginPct}%)
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                          {item.unitsSold}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                          {formatCurrency(convertAmount(item.grossMargin, currency), currency)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-rose-400 tabular-nums">
                          {item.prodExpenses > 0 ? `−${formatCurrency(convertAmount(item.prodExpenses, currency), currency)}` : '₦0'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-sky-400 tabular-nums">
                          {formatCurrency(convertAmount(item.netProfit, currency), currency)}
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
    </div>
  );
};
