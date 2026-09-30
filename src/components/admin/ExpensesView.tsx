import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Expense, CurrencyCode } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  Wallet, 
  Boxes, 
  Coins, 
  Flame, 
  RotateCcw, 
  Plus, 
  Calendar, 
  Download, 
  Filter, 
  Search, 
  ChevronDown, 
  X, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Edit3, 
  Trash2, 
  CheckSquare, 
  Square,
  Package,
  Receipt,
  PieChart,
  BarChart3,
  DollarSign
} from 'lucide-react';

type DatePeriod = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

export const ExpensesView: React.FC = () => {
  const { 
    expenses, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    orders, 
    products, 
    currency, 
    setCurrency, 
    addNotification 
  } = useCrm();

  // Filter & Search states (Matching Ordello Screenshot exp1.png, exp2.png, exp3.png)
  const [datePeriod, setDatePeriod] = useState<DatePeriod>('today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Checkbox selection
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form states for Add / Edit
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formType, setFormType] = useState<Expense['type']>('Meta / TikTok Ads');
  const [formProductId, setFormProductId] = useState<string>('');
  const [formAmount, setFormAmount] = useState<number>(35000);
  const [formDesc, setFormDesc] = useState('');
  const [formRef, setFormRef] = useState('');

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

  // Distinct expense types
  const expenseTypes: Expense['type'][] = [
    'Meta / TikTok Ads',
    'Agent Delivery Fees',
    'Freight / Customs',
    'Product Manufacturing',
    'Software & Tools',
    'Office & Staff'
  ];

  // Helper to filter expenses by time period
  const filterExpensesByPeriod = (expList: Expense[], period: DatePeriod) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return expList.filter(e => {
      if (period === 'all') return true;
      if (!e.date) return false;

      const eDate = new Date(e.date);

      switch (period) {
        case 'today': {
          return e.date === todayStr || e.date.startsWith(todayStr);
        }
        case 'week': {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return eDate >= oneWeekAgo;
        }
        case 'month': {
          return eDate.getUTCMonth() === now.getUTCMonth() && eDate.getUTCFullYear() === now.getUTCFullYear();
        }
        case 'year': {
          return eDate.getUTCFullYear() === now.getUTCFullYear();
        }
        case 'custom': {
          if (customStartDate) {
            const start = new Date(customStartDate);
            if (eDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (eDate > end) return false;
          }
          return true;
        }
        default:
          return true;
      }
    });
  };

  // Helper to filter orders by time period for Gross Revenue & COGS
  const filterOrdersByPeriod = (orderList: typeof orders, period: DatePeriod) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return orderList.filter(o => {
      if (period === 'all') return true;
      if (!o.createdAt) return false;

      const oDate = new Date(o.createdAt);

      switch (period) {
        case 'today': {
          return o.createdAt.startsWith(todayStr);
        }
        case 'week': {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return oDate >= oneWeekAgo;
        }
        case 'month': {
          return oDate.getUTCMonth() === now.getUTCMonth() && oDate.getUTCFullYear() === now.getUTCFullYear();
        }
        case 'year': {
          return oDate.getUTCFullYear() === now.getUTCFullYear();
        }
        case 'custom': {
          if (customStartDate) {
            const start = new Date(customStartDate);
            if (oDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (oDate > end) return false;
          }
          return true;
        }
        default:
          return true;
      }
    });
  };

  // Expenses in selected period
  const expensesInPeriod = useMemo(() => {
    return filterExpensesByPeriod(expenses, datePeriod);
  }, [expenses, datePeriod, customStartDate, customEndDate]);

  // Delivered orders in selected period
  const deliveredOrdersInPeriod = useMemo(() => {
    const periodOrders = filterOrdersByPeriod(orders, datePeriod);
    return periodOrders.filter(o => o.status === 'DELIVERED');
  }, [orders, datePeriod, customStartDate, customEndDate]);

  // =========================================================
  // 1. STATS METRICS (Matching Screenshot exp1.png)
  // - TOTAL EXPENSES
  // - PRODUCT-LINKED
  // - GENERAL EXPENSES
  // - DAILY BURN RATE
  // =========================================================
  const totalExpensesNgn = useMemo(() => {
    return expensesInPeriod.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expensesInPeriod]);

  const productLinkedExpensesNgn = useMemo(() => {
    return expensesInPeriod
      .filter(e => Boolean(e.productId) || e.type === 'Product Manufacturing' || e.type === 'Freight / Customs')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expensesInPeriod]);

  const productLinkedPercent = totalExpensesNgn > 0
    ? Math.round((productLinkedExpensesNgn / totalExpensesNgn) * 100)
    : 0;

  const generalExpensesNgn = Math.max(0, totalExpensesNgn - productLinkedExpensesNgn);

  // Daily burn rate calculation
  const dailyBurnRateNgn = useMemo(() => {
    const daysCount = datePeriod === 'today' ? 1 : datePeriod === 'week' ? 7 : datePeriod === 'month' ? 30 : 365;
    return Math.round(totalExpensesNgn / daysCount);
  }, [totalExpensesNgn, datePeriod]);

  // =========================================================
  // 2. PROFIT IMPACT REPORT (Waterfall Equation & Breakdown Bar)
  // Gross Revenue - Cost of Goods - Total Expenses = Net Profit
  // =========================================================
  const grossRevenueNgn = useMemo(() => {
    return deliveredOrdersInPeriod.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [deliveredOrdersInPeriod]);

  const totalCogsNgn = useMemo(() => {
    return deliveredOrdersInPeriod.reduce((sum, o) => {
      return sum + o.items.reduce((iSum, item) => {
        const prod = products.find(p => p.id === item.productId);
        return iSum + ((prod?.unitCost || 4000) * item.quantity);
      }, 0);
    }, 0);
  }, [deliveredOrdersInPeriod, products]);

  const netProfitNgn = grossRevenueNgn - totalCogsNgn - totalExpensesNgn;

  // Breakdown percentages for progress bar
  const totalOutflowsAndProfit = Math.max(grossRevenueNgn, totalCogsNgn + totalExpensesNgn, 1);
  const cogsPercent = Math.min(100, Math.round((totalCogsNgn / totalOutflowsAndProfit) * 100));
  const expPercent = Math.min(100 - cogsPercent, Math.round((totalExpensesNgn / totalOutflowsAndProfit) * 100));
  const profitMarginPercent = grossRevenueNgn > 0 ? Math.round((netProfitNgn / grossRevenueNgn) * 100) : 0;

  // =========================================================
  // 3. TOP 5 PRODUCTS BY EXPENSE (exp2.png)
  // =========================================================
  const topProductsByExpense = useMemo(() => {
    const map = new Map<string, { product: typeof products[0]; totalExpense: number }>();

    expensesInPeriod.forEach(e => {
      if (e.productId) {
        const prod = products.find(p => p.id === e.productId);
        if (prod) {
          const current = map.get(prod.id) || { product: prod, totalExpense: 0 };
          current.totalExpense += e.amount;
          map.set(prod.id, current);
        }
      }
    });

    const list = Array.from(map.values()).sort((a, b) => b.totalExpense - a.totalExpense);
    return list.slice(0, 5);
  }, [expensesInPeriod, products]);

  // =========================================================
  // 4. MONTHLY COMPARISON (exp2.png)
  // Operating vs Marketing expenses for Apr, May, Jun, Jul, Aug, Sep
  // =========================================================
  const monthlyComparisonData = useMemo(() => {
    const months = [
      { key: '04', label: 'Apr' },
      { key: '05', label: 'May' },
      { key: '06', label: 'Jun' },
      { key: '07', label: 'Jul' },
      { key: '08', label: 'Aug' },
      { key: '09', label: 'Sep' }
    ];

    return months.map(m => {
      const monthExpenses = expenses.filter(e => {
        if (!e.date) return false;
        const [yr, mo] = e.date.split('-');
        return mo === m.key && (yr === '2026' || !yr);
      });

      const operating = monthExpenses
        .filter(e => e.type !== 'Meta / TikTok Ads')
        .reduce((sum, e) => sum + e.amount, 0);

      const marketing = monthExpenses
        .filter(e => e.type === 'Meta / TikTok Ads')
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        ...m,
        operating,
        marketing,
        total: operating + marketing
      };
    });
  }, [expenses]);

  const maxMonthValue = useMemo(() => {
    const maxVal = Math.max(...monthlyComparisonData.map(m => Math.max(m.operating, m.marketing, 1)));
    return maxVal > 0 ? maxVal : 200000;
  }, [monthlyComparisonData]);

  // =========================================================
  // 5. EXPENSES BY TYPE (exp3.png)
  // =========================================================
  const expensesByTypeData = useMemo(() => {
    return expenseTypes.map(type => {
      const typeExpenses = expensesInPeriod.filter(e => e.type === type);
      const amount = typeExpenses.reduce((sum, e) => sum + e.amount, 0);
      const percent = totalExpensesNgn > 0 ? Math.round((amount / totalExpensesNgn) * 100) : 0;
      return {
        type,
        amount,
        percent,
        count: typeExpenses.length
      };
    }).filter(t => t.amount > 0 || totalExpensesNgn === 0);
  }, [expensesInPeriod, totalExpensesNgn, expenseTypes]);

  // =========================================================
  // 6. FILTERED EXPENSES TABLE & PAGINATION (exp3.png)
  // =========================================================
  const filteredExpenses = useMemo(() => {
    return expensesInPeriod.filter(e => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        e.description.toLowerCase().includes(q) ||
        (e.reference && e.reference.toLowerCase().includes(q)) ||
        (e.productName && e.productName.toLowerCase().includes(q)) ||
        e.type.toLowerCase().includes(q);

      const matchesType = selectedTypeFilter === 'All' || e.type === selectedTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [expensesInPeriod, searchQuery, selectedTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  // Checkbox handlers
  const handleToggleSelectAll = () => {
    if (selectedExpenseIds.length === paginatedExpenses.length && paginatedExpenses.length > 0) {
      setSelectedExpenseIds([]);
    } else {
      setSelectedExpenseIds(paginatedExpenses.map(e => e.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedExpenseIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Export Data CSV Handler
  const handleExportCsv = () => {
    const filename = `ordello_expenses_export_${datePeriod}_${new Date().toISOString().slice(0, 10)}.csv`;
    let csv = "Date,Type,Product / Ref,Amount (NGN),Description,Reference Invoice\n";

    filteredExpenses.forEach(e => {
      csv += `"${e.date}","${e.type}","${e.productName || e.reference || 'N/A'}",${e.amount},"${e.description.replace(/"/g, '""')}","${e.reference || ''}"\n`;
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
        title: 'Expenses Exported',
        message: `Exported ${filteredExpenses.length} expense items to CSV.`,
        type: 'success'
      });
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormType('Meta / TikTok Ads');
    setFormProductId('');
    setFormAmount(35000);
    setFormDesc('');
    setFormRef(`EXP-${Date.now().toString().slice(-4)}`);
    setShowAddModal(true);
  };

  // Submit Add Expense
  const handleCreateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim() || formAmount <= 0) return;

    const matchedProd = products.find(p => p.id === formProductId);

    addExpense({
      date: formDate,
      type: formType,
      productId: formProductId || undefined,
      productName: matchedProd?.name || undefined,
      amount: Number(formAmount),
      currency: 'NGN',
      description: formDesc.trim(),
      reference: formRef.trim() || undefined
    });

    if (addNotification) {
      addNotification({
        title: 'Expense Recorded',
        message: `Logged ₦${Number(formAmount).toLocaleString()} for ${formType}.`,
        type: 'success'
      });
    }

    setShowAddModal(false);
  };

  // Open Edit Modal
  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setFormDate(exp.date);
    setFormType(exp.type);
    setFormProductId(exp.productId || '');
    setFormAmount(exp.amount);
    setFormDesc(exp.description);
    setFormRef(exp.reference || '');
  };

  // Submit Edit Expense
  const handleEditExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !formDesc.trim() || formAmount <= 0) return;

    const matchedProd = products.find(p => p.id === formProductId);

    updateExpense(editingExpense.id, {
      date: formDate,
      type: formType,
      productId: formProductId || undefined,
      productName: matchedProd?.name || undefined,
      amount: Number(formAmount),
      description: formDesc.trim(),
      reference: formRef.trim() || undefined
    });

    if (addNotification) {
      addNotification({
        title: 'Expense Updated',
        message: `Expense details updated.`,
        type: 'info'
      });
    }

    setEditingExpense(null);
  };

  // Handle Delete Expense
  const handleDeleteExpense = (id: string, desc: string) => {
    if (confirm(`Are you sure you want to delete this expense record: "${desc}"?`)) {
      deleteExpense(id);
      setSelectedExpenseIds(prev => prev.filter(x => x !== id));
      if (addNotification) {
        addNotification({
          title: 'Expense Deleted',
          message: 'The expense entry was removed.',
          type: 'info'
        });
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 animate-in fade-in select-none">
      {/* =========================================================
          1. HEADER & TOP FILTER BAR (Screenshot exp1.png)
          Title: Expense Management (Sky Blue)
          Pills: Today | This Week | This Month | This Year | Date Range | Currency
          Right: Refresh | + Add Expense
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-400">
            Expense Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor and manage your e-commerce operational costs
          </p>
        </div>

        {/* Top Right Actions: Refresh & + Add Expense */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setDatePeriod('today');
              setSearchQuery('');
              setSelectedTypeFilter('All');
              setCurrentPage(1);
              if (addNotification) {
                addNotification({
                  title: 'Data Refreshed',
                  message: 'Expenses and profit metrics synchronized.',
                  type: 'info'
                });
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer shadow-sm active:scale-95"
            title="Refresh calculations"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Date Filter Pills, Date Range & Currency Selector Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Filter Pills (Ordello Solid White Active Pill) */}
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
                    setCurrentPage(1);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition"
                >
                  Apply Range
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Currency Selector Dropdown */}
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
          2. THE 4 KPI CARDS (Exact match to Screenshot exp1.png)
          TOTAL EXPENSES | PRODUCT-LINKED | GENERAL EXPENSES | DAILY BURN RATE
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: TOTAL EXPENSES */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              TOTAL EXPENSES
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-950/60 border border-sky-800/50 flex items-center justify-center text-sky-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight truncate">
              {formatCurrency(convertAmount(totalExpensesNgn, currency), currency)}
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono mt-1">
              <span>~ 0% vs last period</span>
            </div>
          </div>
        </div>

        {/* Card 2: PRODUCT-LINKED */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              PRODUCT-LINKED
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight truncate">
              {formatCurrency(convertAmount(productLinkedExpensesNgn, currency), currency)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {productLinkedPercent}% of total spending
            </p>
          </div>
        </div>

        {/* Card 3: GENERAL EXPENSES */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              GENERAL EXPENSES
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight truncate">
              {formatCurrency(convertAmount(generalExpensesNgn, currency), currency)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Operations & Overhead
            </p>
          </div>
        </div>

        {/* Card 4: DAILY BURN RATE */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              DAILY BURN RATE
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight truncate">
              {formatCurrency(convertAmount(dailyBurnRateNgn, currency), currency)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Average this period
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. PROFIT IMPACT REPORT (Screenshot exp1.png & exp2.png)
          Waterfall Equation: Gross Revenue − COGS − Total Expenses = Net Profit
          Progress breakdown bar below
          ========================================================= */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm space-y-6">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Profit Impact Report
        </h2>

        {/* Waterfall Equation Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* Gross Revenue */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              GROSS REVENUE
            </span>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              {formatCurrency(convertAmount(grossRevenueNgn, currency), currency)}
            </p>
          </div>

          <span className="text-2xl text-slate-600 font-light hidden lg:inline">−</span>

          {/* Cost of Goods (COGS) */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              COST OF GOODS
            </span>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              {formatCurrency(convertAmount(totalCogsNgn, currency), currency)}
            </p>
          </div>

          <span className="text-2xl text-slate-600 font-light hidden lg:inline">−</span>

          {/* Total Expenses */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              TOTAL EXPENSES
            </span>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              {formatCurrency(convertAmount(totalExpensesNgn, currency), currency)}
            </p>
          </div>

          <span className="text-2xl text-slate-600 font-light hidden lg:inline">=</span>

          {/* Net Profit (Dark Blue Box with Sky Blue Value) */}
          <div className="rounded-xl bg-sky-950/60 border border-sky-800/60 p-4 min-w-[170px] text-left lg:text-right shadow-sm">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
              NET PROFIT
            </span>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-sky-400 tracking-tight mt-0.5">
              {formatCurrency(convertAmount(netProfitNgn, currency), currency)}
            </p>
          </div>
        </div>

        {/* Legend & Multi-Segment Progress Breakdown Bar */}
        <div className="space-y-2 pt-2">
          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full overflow-hidden flex bg-neutral-900 border border-neutral-800">
            {grossRevenueNgn === 0 && totalExpensesNgn === 0 ? (
              <div className="w-full h-full bg-neutral-800" />
            ) : (
              <>
                <div 
                  className="h-full bg-slate-400 transition-all duration-300" 
                  style={{ width: `${cogsPercent}%` }} 
                  title={`COGS: ${cogsPercent}%`}
                />
                <div 
                  className="h-full bg-slate-600 transition-all duration-300" 
                  style={{ width: `${expPercent}%` }} 
                  title={`Operating Expenses: ${expPercent}%`}
                />
                <div 
                  className="h-full bg-sky-500 transition-all duration-300" 
                  style={{ width: `${Math.max(0, 100 - cogsPercent - expPercent)}%` }} 
                  title={`Profit Margin: ${profitMarginPercent}%`}
                />
              </>
            )}
          </div>

          {/* Legend Items */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>COGS ({cogsPercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span>Operating Expenses ({expPercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Profit Margin ({profitMarginPercent}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          4. ANALYSIS ROW (Screenshot exp2.png)
          Left: Top 5 Products by Expense
          Right: Monthly Comparison (Operating vs Marketing)
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Card: Top 5 Products by Expense */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[280px] shadow-sm">
          <h3 className="text-base font-bold text-white tracking-tight">
            Top 5 Products by Expense
          </h3>

          <div className="flex-1 flex flex-col justify-center py-4">
            {topProductsByExpense.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No product-linked expenses found
              </div>
            ) : (
              <div className="space-y-3.5">
                {topProductsByExpense.map((item, idx) => {
                  const percentOfTotal = totalExpensesNgn > 0 
                    ? Math.round((item.totalExpense / totalExpensesNgn) * 100) 
                    : 0;

                  return (
                    <div key={item.product.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                          {idx + 1}. {item.product.name}
                        </span>
                        <span className="font-mono font-bold text-sky-400 tabular-nums">
                          {formatCurrency(convertAmount(item.totalExpense, currency), currency)} ({percentOfTotal}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-sky-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, percentOfTotal)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Monthly Comparison (Operating vs Marketing) */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[280px] shadow-sm">
          <div className="flex items-center justify-between gap-2 pb-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Monthly Comparison
            </h3>
            {/* Legend on Top Right (exp2.png) */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
                <span>Operating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
                <span>Marketing</span>
              </div>
            </div>
          </div>

          {/* Multi-Month Bar Visualization (Apr to Sep) */}
          <div className="flex-1 flex flex-col justify-end pt-6 pb-2">
            <div className="grid grid-cols-6 gap-2 sm:gap-4 h-36 items-end border-b border-neutral-800/80 pb-2">
              {monthlyComparisonData.map(m => {
                const opHeight = Math.max(4, Math.round((m.operating / maxMonthValue) * 100));
                const mktHeight = Math.max(4, Math.round((m.marketing / maxMonthValue) * 100));

                return (
                  <div key={m.key} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="flex items-end gap-1 w-full justify-center h-full">
                      {/* Operating Bar */}
                      <div 
                        className="w-2.5 sm:w-4 bg-sky-500 rounded-t-sm transition-all duration-300 group-hover:brightness-125"
                        style={{ height: `${m.operating > 0 ? opHeight : 2}%` }}
                        title={`Operating: ₦${m.operating.toLocaleString()}`}
                      />
                      {/* Marketing Bar */}
                      <div 
                        className="w-2.5 sm:w-4 bg-slate-600 rounded-t-sm transition-all duration-300 group-hover:brightness-125"
                        style={{ height: `${m.marketing > 0 ? mktHeight : 2}%` }}
                        title={`Marketing: ₦${m.marketing.toLocaleString()}`}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-white">
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          5. TRENDS & TYPES ROW (Screenshot exp3.png)
          Left: Expense Trends
          Right: Expenses by Type
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Card: Expense Trends */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[260px] shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Expense Trends
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
              <span>Expenses</span>
            </div>
          </div>

          {/* Trend Area Visualizer */}
          <div className="flex-1 flex flex-col justify-end pt-4 pb-2">
            <div className="w-full h-32 border border-dashed border-neutral-800/80 rounded-xl p-3 flex items-end justify-between gap-1.5 bg-neutral-900/30">
              {expensesInPeriod.length === 0 ? (
                <div className="w-full text-center text-slate-500 text-xs py-8">
                  No trend data for this period
                </div>
              ) : (
                expensesInPeriod.slice(0, 14).map((e, idx) => {
                  const h = Math.min(100, Math.max(15, Math.round((e.amount / 350000) * 100)));
                  return (
                    <div key={e.id} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      <div 
                        className="w-full max-w-[20px] bg-sky-500/80 hover:bg-sky-400 rounded-t transition-all"
                        style={{ height: `${h}%` }}
                        title={`${e.date}: ₦${e.amount.toLocaleString()} (${e.type})`}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Expenses by Type */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[260px] shadow-sm">
          <h3 className="text-base font-bold text-white tracking-tight pb-2">
            Expenses by Type
          </h3>

          <div className="flex-1 flex flex-col justify-center space-y-2.5 py-2">
            {expensesByTypeData.map((item) => (
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
                    className="h-full rounded-full bg-sky-500/80 transition-all duration-300"
                    style={{ width: `${Math.min(100, item.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================
          6. SEARCH & FILTER BAR (Screenshot exp3.png)
          Left: Search descriptions or references...
          Right: Export button | Filter: All dropdown
          ========================================================= */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Search descriptions or references */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search descriptions or references..."
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

        {/* Right Side: Export & Filter */}
        <div className="flex items-center gap-2">
          {/* Export Button (exp3.png) */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>

          {/* Filter Dropdown (exp3.png) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold text-white transition cursor-pointer shadow-sm"
            >
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter: {selectedTypeFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-neutral-950 border border-neutral-800 shadow-2xl z-30 p-1 space-y-0.5 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTypeFilter('All');
                    setShowFilterDropdown(false);
                    setCurrentPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition text-left ${
                    selectedTypeFilter === 'All' 
                      ? 'bg-sky-600 text-white font-semibold' 
                      : 'text-slate-300 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <span>All Categories</span>
                  {selectedTypeFilter === 'All' && <Check className="w-3.5 h-3.5" />}
                </button>
                {expenseTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setSelectedTypeFilter(type);
                      setShowFilterDropdown(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition text-left ${
                      selectedTypeFilter === type 
                        ? 'bg-sky-600 text-white font-semibold' 
                        : 'text-slate-300 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    <span>{type}</span>
                    {selectedTypeFilter === type && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          7. EXPENSES TABLE (Screenshot exp3.png)
          Columns: [Checkbox] | Date | Type | Product / Ref | Amount | Description | Actions
          ========================================================= */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/60 text-slate-300 font-semibold text-xs">
                <th className="py-3.5 px-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-white"
                  >
                    {selectedExpenseIds.length === paginatedExpenses.length && paginatedExpenses.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-sky-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Product / Ref</th>
                <th className="py-3.5 px-4 font-mono">Amount</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredExpenses.length === 0 ? (
                /* Empty state matching Screenshot exp3.png */
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 text-sm font-medium">
                    No expenses found
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((exp) => {
                  const isChecked = selectedExpenseIds.includes(exp.id);

                  return (
                    <tr 
                      key={exp.id}
                      className="hover:bg-neutral-900/40 transition group"
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectOne(exp.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-sky-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {exp.date}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          exp.type === 'Meta / TikTok Ads' 
                            ? 'bg-purple-950/80 text-purple-400 border border-purple-800/60'
                            : exp.type === 'Agent Delivery Fees'
                            ? 'bg-sky-950/80 text-sky-400 border border-sky-800/60'
                            : exp.type === 'Freight / Customs'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                            : exp.type === 'Product Manufacturing'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : 'bg-neutral-900 text-slate-300 border border-neutral-800'
                        }`}>
                          {exp.type}
                        </span>
                      </td>

                      {/* Product / Ref */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {exp.productName ? (
                          <div>
                            <p className="font-semibold text-white text-xs truncate max-w-[180px]">
                              {exp.productName}
                            </p>
                            {exp.reference && (
                              <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                                Ref: {exp.reference}
                              </p>
                            )}
                          </div>
                        ) : exp.reference ? (
                          <span className="font-mono text-xs text-slate-400">
                            {exp.reference}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs italic">General</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white text-xs tabular-nums">
                        {formatCurrency(convertAmount(exp.amount, currency), currency)}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate" title={exp.description}>
                        {exp.description}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                            title="Edit Expense"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(exp.id, exp.description)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {filteredExpenses.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length} expenses
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
              disabled={currentPage >= totalPages || filteredExpenses.length === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL: ADD EXPENSE (exp1.png + Add Expense)
          ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl text-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-950 text-sky-400 border border-sky-800/60 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Operational Expense</h3>
                  <p className="text-xs text-slate-400">Record marketing, production, or logistics cost</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpenseSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Category / Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {expenseTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Link to Product (Optional)</label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="">None / General Overhead</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Amount (₦ NGN) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Reference / Invoice #</label>
                  <input
                    type="text"
                    placeholder="e.g. FB-ADS-INV-9902"
                    value={formRef}
                    onChange={(e) => setFormRef(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Meta Ads Mastercard billing for Sept campaign"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: EDIT EXPENSE
          ========================================================= */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl text-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 text-sky-400 border border-neutral-800 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Expense</h3>
                  <p className="text-xs text-slate-400">{editingExpense.description}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingExpense(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditExpenseSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Category / Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {expenseTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Link to Product</label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="">None / General Overhead</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Amount (₦ NGN) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Reference / Invoice #</label>
                  <input
                    type="text"
                    value={formRef}
                    onChange={(e) => setFormRef(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
