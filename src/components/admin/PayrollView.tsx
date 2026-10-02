import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { CurrencyCode, PayStructure, User, PayrollRun } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  Wallet, 
  Building2, 
  TrendingUp, 
  Trophy, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  Download, 
  Search, 
  Sliders, 
  X, 
  Check, 
  ChevronDown, 
  Layers, 
  ArrowRight, 
  Eye, 
  CreditCard, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Percent, 
  Hash, 
  Users, 
  RotateCcw,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';

type DatePeriod = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

export const PayrollView: React.FC = () => {
  const { 
    users, 
    updateUser, 
    orders, 
    payrollRuns, 
    runPayroll, 
    approvePayroll, 
    currency,
    setCurrency,
    salesTeams,
    addNotification 
  } = useCrm();

  // Navigation & Sub-Tabs
  const [activeTab, setActiveTab] = useState<'rates' | 'history' | 'rules'>('rates');

  // Period & Date Filters (BettaTraka Style)
  const [datePeriod, setDatePeriod] = useState<DatePeriod>('month');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Search & Filter in Main Table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [selectedStructureFilter, setSelectedStructureFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Modals & Drawers
  const [setRateUser, setSetRateUser] = useState<User | null>(null);
  const [breakdownUser, setBreakdownUser] = useState<User | null>(null);
  const [showRunPayrollModal, setShowRunPayrollModal] = useState(false);
  const [selectedRunMonth, setSelectedRunMonth] = useState('September 2026');
  const [runCurrency, setRunCurrency] = useState<CurrencyCode>('NGN');
  const [previewRunGenerated, setPreviewRunGenerated] = useState(false);

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

  // Filtered orders in current period
  const periodOrders = useMemo(() => {
    return orders.filter(o => filterByPeriod(o.createdAt));
  }, [orders, datePeriod, customStartDate, customEndDate]);

  // Delivered orders in current period
  const deliveredPeriodOrders = useMemo(() => {
    return periodOrders.filter(o => o.status === 'DELIVERED');
  }, [periodOrders]);

  // Eligible Staff (all staff except owner/root)
  const staff = useMemo(() => {
    return users.filter(u => u.role !== 'Owner');
  }, [users]);

  // Calculations per staff member for current reporting period
  const staffMetrics = useMemo(() => {
    return staff.map(u => {
      // Find delivered orders assigned to this user in this period
      const userDeliveredOrders = deliveredPeriodOrders.filter(o => o.salesRepId === u.id);
      const deliveredCount = userDeliveredOrders.length;

      // Base Salary
      const baseSalary = (u.payStructure === 'Fixed' || u.payStructure === 'Hybrid') ? (u.fixedSalary || 0) : 0;

      // Commission calculation
      let commissionEarned = 0;
      if (u.payStructure === 'Commission' || u.payStructure === 'Hybrid') {
        if (u.commissionType === 'percentage' && u.commissionPercentage) {
          const totalDeliveredRevenue = userDeliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
          commissionEarned = (totalDeliveredRevenue * u.commissionPercentage) / 100;
        } else {
          commissionEarned = (u.commissionPerOrder || 0) * deliveredCount;
        }
      } else if (u.payStructure === 'Performance-based') {
        // Tiered structure
        const tier1Max = u.tier1Max || 20;
        const tier1Rate = u.tier1Rate || 1000;
        const tier2Max = u.tier2Max || 50;
        const tier2Rate = u.tier2Rate || 1500;
        const tier3Rate = u.tier3Rate || 2000;

        if (deliveredCount <= tier1Max) {
          commissionEarned = deliveredCount * tier1Rate;
        } else if (deliveredCount <= tier2Max) {
          commissionEarned = (tier1Max * tier1Rate) + ((deliveredCount - tier1Max) * tier2Rate);
        } else {
          commissionEarned = (tier1Max * tier1Rate) + ((tier2Max - tier1Max) * tier2Rate) + ((deliveredCount - tier2Max) * tier3Rate);
        }
      }

      // Bonus Calculation (Target bonus + Top converter check)
      let bonusEarned = 0;
      const targetDeliveries = u.targetDeliveries || 40;
      if (deliveredCount >= targetDeliveries && u.targetBonus) {
        bonusEarned += u.targetBonus;
      }

      // Net take-home
      const totalPayout = baseSalary + commissionEarned + bonusEarned;

      return {
        user: u,
        deliveredCount,
        baseSalary,
        commissionEarned,
        bonusEarned,
        totalPayout,
        deliveredOrders: userDeliveredOrders
      };
    });
  }, [staff, deliveredPeriodOrders]);

  // Top Converter identification (staff with highest delivered orders)
  const topConverter = useMemo(() => {
    const repsWithDeliveries = staffMetrics.filter(m => m.user.role === 'Sales Representative' && m.deliveredCount > 0);
    if (repsWithDeliveries.length === 0) return null;
    return repsWithDeliveries.reduce((max, curr) => curr.deliveredCount > max.deliveredCount ? curr : max, repsWithDeliveries[0]);
  }, [staffMetrics]);

  // Filtered staff list for the table
  const filteredStaffMetrics = useMemo(() => {
    return staffMetrics.filter(m => {
      const u = m.user;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesRole = u.role.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesRole) return false;
      }
      // Role filter
      if (selectedRoleFilter !== 'All' && u.role !== selectedRoleFilter) {
        return false;
      }
      // Structure filter
      if (selectedStructureFilter !== 'All') {
        if (selectedStructureFilter === 'Not set' && u.payStructure !== 'Not set') return false;
        if (selectedStructureFilter !== 'Not set' && u.payStructure !== selectedStructureFilter) return false;
      }
      // Status filter
      if (selectedStatusFilter !== 'All' && u.status !== selectedStatusFilter) {
        return false;
      }
      return true;
    });
  }, [staffMetrics, searchQuery, selectedRoleFilter, selectedStructureFilter, selectedStatusFilter]);

  // Overall KPI totals
  const totalBaseSalaries = useMemo(() => {
    return staffMetrics.reduce((sum, m) => sum + m.baseSalary, 0);
  }, [staffMetrics]);

  const totalCommissions = useMemo(() => {
    return staffMetrics.reduce((sum, m) => sum + m.commissionEarned, 0);
  }, [staffMetrics]);

  const totalBonuses = useMemo(() => {
    const baseBonuses = staffMetrics.reduce((sum, m) => sum + m.bonusEarned, 0);
    // Add ₦50,000 for top converter if active
    return baseBonuses + (topConverter ? 50000 : 0);
  }, [staffMetrics, topConverter]);

  const grandTotalPayroll = useMemo(() => {
    return totalBaseSalaries + totalCommissions + totalBonuses;
  }, [totalBaseSalaries, totalCommissions, totalBonuses]);

  // Execute Monthly Payroll
  const handleExecutePayroll = () => {
    const run = runPayroll(selectedRunMonth, runCurrency);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    setPreviewRunGenerated(false);
    setShowRunPayrollModal(false);
    setActiveTab('history');
    if (addNotification) {
      addNotification({
        title: 'Payroll Run Executed',
        message: `${selectedRunMonth} payroll disbursements processed (${formatCurrency(convertAmount(run.totalPayout, currency), currency)})`,
        type: 'success'
      });
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Staff Name', 'Role', 'Team', 'Pay Structure', 'Base Salary', 'Delivered Orders', 'Commissions Earned', 'Bonuses', 'Total Net Pay', 'Status'];
    const rows = filteredStaffMetrics.map(m => [
      `"${m.user.name}"`,
      `"${m.user.role}"`,
      `"${salesTeams.find(t => t.id === m.user.teamId)?.name || 'General'}"`,
      `"${m.user.payStructure}"`,
      m.baseSalary,
      m.deliveredCount,
      m.commissionEarned,
      m.bonusEarned + (topConverter?.user.id === m.user.id ? 50000 : 0),
      m.totalPayout + (topConverter?.user.id === m.user.id ? 50000 : 0),
      `"${m.user.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bettatraka-payroll-${datePeriod}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto min-h-screen">
      {/* 1. Header & Top Filter Controls (Matching BettaTraka screenshot ord1.png & pay1.png) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-sky-400">Payroll</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automate staff compensation, configure commission rates, and track payroll disbursements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter Pills */}
          <div className="flex items-center gap-1 bg-[#0b0f19] border border-slate-800 p-1 rounded-full text-xs">
            {(['today', 'week', 'month', 'year'] as DatePeriod[]).map((period) => {
              const labelMap: Record<DatePeriod, string> = {
                today: 'Today',
                week: 'This Week',
                month: 'This Month',
                year: 'This Year',
                all: 'All Time',
                custom: 'Custom'
              };
              const isActive = datePeriod === period;
              return (
                <button
                  key={period}
                  onClick={() => {
                    setDatePeriod(period);
                    setShowDatePicker(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-black shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {labelMap[period]}
                </button>
              );
            })}
          </div>

          {/* Date Range Picker Popover */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs border transition ${
                datePeriod === 'custom'
                  ? 'bg-white text-black font-semibold border-white'
                  : 'bg-[#131926] text-slate-300 hover:text-white border-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Date Range</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 z-50 w-72 bg-[#0d121f] border border-slate-800 rounded-xl p-4 shadow-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-white">Custom Range</span>
                  <button onClick={() => setShowDatePicker(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <button
                  onClick={() => {
                    setDatePeriod('custom');
                    setShowDatePicker(false);
                  }}
                  className="w-full py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded text-xs font-semibold transition"
                >
                  Apply Date Range
                </button>
              </div>
            )}
          </div>

          {/* Currency Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131926] hover:bg-slate-800/80 text-slate-200 border border-slate-800 rounded-lg text-xs font-medium transition"
            >
              <span className="font-mono text-sky-400 font-bold">{currentCurrencyInfo.symbol}</span>
              <span className="hidden sm:inline">{currentCurrencyInfo.label}</span>
              <span className="sm:hidden">{currentCurrencyInfo.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute right-0 mt-2 z-50 w-56 bg-[#0d121f] border border-slate-800 rounded-xl shadow-2xl py-1">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-slate-800/60">
                  Select Reporting Currency
                </div>
                {currencyOptions.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800/60 transition ${
                      currency === c.code ? 'text-sky-400 bg-sky-500/10 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400 w-5">{c.symbol}</span>
                      <span>{c.label}</span>
                    </span>
                    {currency === c.code && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Action */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131926] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium transition"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Run Payroll CTA */}
          <button
            onClick={() => {
              setPreviewRunGenerated(false);
              setShowRunPayrollModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg text-xs transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Payroll</span>
          </button>
        </div>
      </div>

      {/* Currency conversion notice badge */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
        <span>All payroll values, commissions, and bonuses converted dynamically to <strong>{currentCurrencyInfo.label} ({currentCurrencyInfo.symbol})</strong>.</span>
      </div>

      {/* 2. Top Metric Cards (4 Cards matching BettaTraka CRM standard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Payroll */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0d121f]/90 p-5 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              TOTAL PAYROLL
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(convertAmount(grandTotalPayroll, currency), currency)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>Estimated total for {datePeriod === 'all' ? 'All Time' : datePeriod}</span>
          </div>
        </div>

        {/* Card 2: Base Salaries */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0d121f]/90 p-5 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              BASE SALARIES
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(convertAmount(totalBaseSalaries, currency), currency)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Monthly fixed salary commitments</span>
          </div>
        </div>

        {/* Card 3: Commissions Earned */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0d121f]/90 p-5 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              COMMISSIONS EARNED
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(convertAmount(totalCommissions, currency), currency)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <span>{deliveredPeriodOrders.length} delivered orders attributed</span>
          </div>
        </div>

        {/* Card 4: Performance Bonuses */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0d121f]/90 p-5 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              PERFORMANCE BONUSES
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(convertAmount(totalBonuses, currency), currency)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-400">
            <span>Includes ₦50,000 monthly top converter prize</span>
          </div>
        </div>
      </div>

      {/* Top Performer Banner Alert */}
      {topConverter && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-semibold flex items-center gap-2">
                <span>Top Converter Leader: <strong>{topConverter.user.name}</strong></span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-400/30">
                  {topConverter.deliveredCount} Delivered Orders
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Eligible for the automated <strong>₦50,000 Cash Converter Bonus</strong> on the next payroll disbursement.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSetRateUser(topConverter.user)}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium text-xs transition"
          >
            Review Pay Rate
          </button>
        </div>
      )}

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('rates')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'rates'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff Compensation & Pay Rates</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
            {staff.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'history'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Disbursement History</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
            {payrollRuns.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'rules'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Automated Bonus Rules</span>
        </button>
      </div>

      {/* TAB 1: Staff Directory & Pay Rates Table (Matches pay1.png) */}
      {activeTab === 'rates' && (
        <div className="space-y-4">
          {/* Search & Filter Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d121f] border border-slate-800 rounded-xl p-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search staff by name, role, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131926] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Role Filter */}
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="bg-[#131926] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="All">Role: All</option>
                <option value="Sales Representative">Sales Representative</option>
                <option value="Manager">Manager</option>
                <option value="Inventory Manager">Inventory Manager</option>
              </select>

              {/* Structure Filter */}
              <select
                value={selectedStructureFilter}
                onChange={(e) => setSelectedStructureFilter(e.target.value)}
                className="bg-[#131926] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="All">Pay Structure: All</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Commission">Pure Commission</option>
                <option value="Fixed">Fixed Salary</option>
                <option value="Performance-based">Performance-based</option>
                <option value="Not set">Not set</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-[#131926] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="All">Status: All</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Table matching BettaTraka CRM layout */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d121f] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Staff Member</th>
                    <th className="py-3.5 px-4 font-semibold">Role & Team</th>
                    <th className="py-3.5 px-4 font-semibold">Pay Structure</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Monthly Base</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Commission Rate</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Delivered</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Commissions</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Bonuses</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Estimated Net Pay</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Rate Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredStaffMetrics.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-500">
                        No staff members found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStaffMetrics.map((m) => {
                      const u = m.user;
                      const team = salesTeams.find(t => t.id === u.teamId);
                      const isTop = topConverter?.user.id === u.id;
                      const hasRateConfigured = u.payStructure && u.payStructure !== 'Not set';

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                          {/* Staff Member */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <div>
                                <div className="font-semibold text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isTop && (
                                    <span title="Top Converter" className="text-amber-400">🏆</span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role & Team */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="inline-block text-[11px] font-medium text-slate-300">
                                {u.role}
                              </span>
                              {team && (
                                <div className="text-[10px] text-sky-400 font-mono">
                                  {team.name}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Pay Structure Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                              u.payStructure === 'Hybrid'
                                ? 'bg-sky-950/60 text-sky-400 border-sky-800/60'
                                : u.payStructure === 'Commission'
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                                : u.payStructure === 'Fixed'
                                ? 'bg-purple-950/60 text-purple-400 border-purple-800/60'
                                : u.payStructure === 'Performance-based'
                                ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800/60'
                                : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                            }`}>
                              {u.payStructure || 'Not set'}
                            </span>
                          </td>

                          {/* Monthly Base */}
                          <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                            {u.fixedSalary && (u.payStructure === 'Fixed' || u.payStructure === 'Hybrid')
                              ? formatCurrency(convertAmount(u.fixedSalary, currency), currency)
                              : '-'}
                          </td>

                          {/* Commission Rate */}
                          <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                            {u.payStructure === 'Commission' || u.payStructure === 'Hybrid' ? (
                              u.commissionType === 'percentage' && u.commissionPercentage ? (
                                <span className="text-emerald-400">{u.commissionPercentage}%</span>
                              ) : (
                                <span className="text-emerald-400">
                                  {formatCurrency(convertAmount(u.commissionPerOrder || 0, currency), currency)}/ord
                                </span>
                              )
                            ) : u.payStructure === 'Performance-based' ? (
                              <span className="text-indigo-400 text-[10px]">Tiered</span>
                            ) : (
                              '-'
                            )}
                          </td>

                          {/* Delivered Count */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              m.deliveredCount > 0
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'text-slate-500'
                            }`}>
                              {m.deliveredCount}
                            </span>
                          </td>

                          {/* Commissions Earned */}
                          <td className="py-3.5 px-4 text-right font-mono text-white">
                            {formatCurrency(convertAmount(m.commissionEarned, currency), currency)}
                          </td>

                          {/* Bonuses */}
                          <td className="py-3.5 px-4 text-right font-mono text-amber-400">
                            {m.bonusEarned > 0 || isTop ? (
                              <span>
                                {formatCurrency(convertAmount(m.bonusEarned + (isTop ? 50000 : 0), currency), currency)}
                              </span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>

                          {/* Estimated Net Pay */}
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                            {formatCurrency(convertAmount(m.totalPayout + (isTop ? 50000 : 0), currency), currency)}
                          </td>

                          {/* Rate Status */}
                          <td className="py-3.5 px-4 text-center">
                            {hasRateConfigured ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Configured</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Rate Not Set</span>
                              </span>
                            )}
                          </td>

                          {/* Actions: Set Rate (Requested in pay1.png, pay2.png, pay3.png) */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Set Rate Button - Primary Action */}
                              <button
                                onClick={() => setSetRateUser(u)}
                                className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center gap-1 transition"
                                title="Click to open the Set Rate menu"
                              >
                                <Sliders className="w-3 h-3" />
                                <span>Set Rate</span>
                              </button>

                              {/* Audit Breakdown */}
                              <button
                                onClick={() => setBreakdownUser(u)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                title="View order audit breakdown"
                              >
                                <Eye className="w-3.5 h-3.5" />
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
          </div>
        </div>
      )}

      {/* TAB 2: Disbursement History (Past Payroll Runs) */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Disbursed Payroll Runs</h2>
            <span className="text-xs text-slate-400">Official execution records & payslips</span>
          </div>

          {payrollRuns.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-12 text-center space-y-3">
              <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-slate-300 font-semibold text-sm">No payroll runs executed yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click the "Run Payroll" button at the top to calculate and execute this month's disbursements.
              </p>
              <button
                onClick={() => setShowRunPayrollModal(true)}
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition"
              >
                Execute First Payroll Run
              </button>
            </div>
          ) : (
            payrollRuns.map((run) => (
              <div key={run.id} className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                      <span>{run.month} Payroll Run</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        run.status === 'Paid'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-sky-950 text-sky-400 border border-sky-800/60'
                      }`}>
                        {run.status}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Executed on {run.createdAt} • {run.items.length} staff members included
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Total Disbursement</div>
                      <div className="font-mono font-bold text-white text-lg">
                        {formatCurrency(convertAmount(run.totalPayout, currency), currency)}
                      </div>
                    </div>
                    {run.status !== 'Paid' && (
                      <button
                        onClick={() => {
                          approvePayroll(run.id);
                          if (addNotification) {
                            addNotification({
                              title: 'Disbursement Marked as Paid',
                              message: `${run.month} payroll marked as fully paid`,
                              type: 'success'
                            });
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-[11px] font-mono text-slate-400 uppercase">
                        <th className="py-2.5 px-3">Staff</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Structure</th>
                        <th className="py-2.5 px-3 text-right">Fixed Base</th>
                        <th className="py-2.5 px-3 text-center">Delivered Orders</th>
                        <th className="py-2.5 px-3 text-right">Commissions</th>
                        <th className="py-2.5 px-3 text-right">Bonus</th>
                        <th className="py-2.5 px-3 text-right">Net Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {run.items.map((item) => (
                        <tr key={item.userId} className="hover:bg-slate-800/20">
                          <td className="py-2.5 px-3 font-semibold text-white">{item.userName}</td>
                          <td className="py-2.5 px-3 text-slate-400">{item.role}</td>
                          <td className="py-2.5 px-3 text-slate-400">{item.payStructure}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                            {formatCurrency(convertAmount(item.fixedBase, currency), currency)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-bold">
                            {item.deliveredOrders}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                            {formatCurrency(convertAmount(item.commissionEarned, currency), currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                            {item.bonusEarned > 0 ? `+${formatCurrency(convertAmount(item.bonusEarned, currency), currency)} 🏆` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                            {formatCurrency(convertAmount(item.totalPayout, currency), currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Automated Bonus Rules */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Monthly Top Converter Bonus</h3>
                <p className="text-xs text-slate-400">Automated leaderboard incentive</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              BettaTraka automatically audits all completed deliveries for the calendar month across all active sales reps. The rep with the highest number of delivered orders automatically receives a bonus added to their payout.
            </p>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Bonus Prize Amount:</span>
                <span className="font-mono font-bold text-amber-400">₦50,000 cash bonus</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Eligibility Requirement:</span>
                <span className="text-slate-200">Minimum 10 delivered orders</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Rule Status:</span>
                <span className="text-emerald-400 font-semibold">Active & Auditing</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Volume Target Milestone Bonus</h3>
                <p className="text-xs text-slate-400">Individual delivery benchmarks</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When configuring an individual sales rep in the <strong>Set Rate</strong> menu, you can specify a monthly delivery quota (e.g. 40 deliveries) and an associated lump-sum cash reward.
            </p>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Default Target:</span>
                <span className="font-mono text-white">40 orders / month</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Standard Milestone Reward:</span>
                <span className="font-mono text-emerald-400">₦25,000</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Configuration:</span>
                <span className="text-sky-400">Customizable per staff</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. THE SET RATE MENU (Matches pay2.png and pay3.png) */}
      {setRateUser && (
        <SetRateModal
          user={setRateUser}
          onClose={() => setSetRateUser(null)}
          onSave={(updates, applyToTeam) => {
            updateUser(setRateUser.id, updates);
            if (applyToTeam && setRateUser.teamId) {
              const teamMembers = users.filter(u => u.teamId === setRateUser.teamId && u.id !== setRateUser.id);
              teamMembers.forEach(tm => updateUser(tm.id, updates));
            }
            setSetRateUser(null);
            if (addNotification) {
              addNotification({
                title: 'Compensation Rate Updated',
                message: `Pay rate for ${setRateUser.name} successfully updated.`,
                type: 'success'
              });
            }
          }}
          currency={currency}
          salesTeams={salesTeams}
        />
      )}

      {/* 5. AUDIT BREAKDOWN MODAL */}
      {breakdownUser && (
        <AuditBreakdownModal
          user={breakdownUser}
          orders={deliveredPeriodOrders.filter(o => o.salesRepId === breakdownUser.id)}
          onClose={() => setBreakdownUser(null)}
          currency={currency}
        />
      )}

      {/* 6. RUN PAYROLL MODAL */}
      {showRunPayrollModal && (
        <RunPayrollModal
          month={selectedRunMonth}
          onMonthChange={setSelectedRunMonth}
          runCurrency={runCurrency}
          onCurrencyChange={setRunCurrency}
          staffMetrics={staffMetrics}
          topConverter={topConverter}
          currency={currency}
          onClose={() => setShowRunPayrollModal(false)}
          onExecute={handleExecutePayroll}
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// SET RATE MENU / DRAWER (Matches pay2.png and pay3.png)
// -------------------------------------------------------------
interface SetRateModalProps {
  user: User;
  onClose: () => void;
  onSave: (updates: Partial<User>, applyToTeam: boolean) => void;
  currency: CurrencyCode;
  salesTeams: any[];
}

const SetRateModal: React.FC<SetRateModalProps> = ({ user, onClose, onSave, currency, salesTeams }) => {
  const [activeMenuTab, setActiveMenuTab] = useState<'model' | 'simulator' | 'bank'>('model');

  // Form states initialized with current user values
  const [payStructure, setPayStructure] = useState<PayStructure>(user.payStructure || 'Hybrid');
  const [fixedSalary, setFixedSalary] = useState<number>(user.fixedSalary || 75000);
  const [commissionType, setCommissionType] = useState<'flat' | 'percentage'>(user.commissionType || 'flat');
  const [commissionPerOrder, setCommissionPerOrder] = useState<number>(user.commissionPerOrder || 1500);
  const [commissionPercentage, setCommissionPercentage] = useState<number>(user.commissionPercentage || 5);
  
  // Tiered commission states (pay3.png)
  const [tier1Max, setTier1Max] = useState<number>(user.tier1Max || 20);
  const [tier1Rate, setTier1Rate] = useState<number>(user.tier1Rate || 1000);
  const [tier2Max, setTier2Max] = useState<number>(user.tier2Max || 50);
  const [tier2Rate, setTier2Rate] = useState<number>(user.tier2Rate || 1500);
  const [tier3Rate, setTier3Rate] = useState<number>(user.tier3Rate || 2000);

  // Targets & Bonuses
  const [targetDeliveries, setTargetDeliveries] = useState<number>(user.targetDeliveries || 40);
  const [targetBonus, setTargetBonus] = useState<number>(user.targetBonus || 25000);
  const [enableTopConverterBonus, setEnableTopConverterBonus] = useState<boolean>(true);
  const [deductCancelledOrders, setDeductCancelledOrders] = useState<boolean>(user.deductCancelledOrders || false);
  const [penaltyPerCancelledOrder, setPenaltyPerCancelledOrder] = useState<number>(user.penaltyPerCancelledOrder || 500);

  // Bank Details
  const [bankName, setBankName] = useState<string>(user.bankName || 'Access Bank');
  const [accountNumber, setAccountNumber] = useState<string>(user.accountNumber || '0123456789');
  const [accountName, setAccountName] = useState<string>(user.accountName || user.name);

  // Apply to team checkbox
  const [applyToTeam, setApplyToTeam] = useState<boolean>(false);

  // Live Simulator slider (pay3.png)
  const [simulatedDeliveries, setSimulatedDeliveries] = useState<number>(35);
  const [simulatedAvgOrderValue, setSimulatedAvgOrderValue] = useState<number>(35000);

  // Simulator Calculations
  const simBase = (payStructure === 'Fixed' || payStructure === 'Hybrid') ? fixedSalary : 0;
  let simCommission = 0;
  if (payStructure === 'Commission' || payStructure === 'Hybrid') {
    if (commissionType === 'percentage') {
      simCommission = (simulatedDeliveries * simulatedAvgOrderValue * commissionPercentage) / 100;
    } else {
      simCommission = simulatedDeliveries * commissionPerOrder;
    }
  } else if (payStructure === 'Performance-based') {
    if (simulatedDeliveries <= tier1Max) {
      simCommission = simulatedDeliveries * tier1Rate;
    } else if (simulatedDeliveries <= tier2Max) {
      simCommission = (tier1Max * tier1Rate) + ((simulatedDeliveries - tier1Max) * tier2Rate);
    } else {
      simCommission = (tier1Max * tier1Rate) + ((tier2Max - tier1Max) * tier2Rate) + ((simulatedDeliveries - tier2Max) * tier3Rate);
    }
  }

  const simBonus = simulatedDeliveries >= targetDeliveries ? targetBonus : 0;
  const simTotal = simBase + simCommission + simBonus;

  const handleSave = () => {
    onSave({
      payStructure,
      fixedSalary: Number(fixedSalary) || 0,
      commissionType,
      commissionPerOrder: Number(commissionPerOrder) || 0,
      commissionPercentage: Number(commissionPercentage) || 0,
      tier1Max: Number(tier1Max) || 20,
      tier1Rate: Number(tier1Rate) || 1000,
      tier2Max: Number(tier2Max) || 50,
      tier2Rate: Number(tier2Rate) || 1500,
      tier3Rate: Number(tier3Rate) || 2000,
      targetDeliveries: Number(targetDeliveries) || 40,
      targetBonus: Number(targetBonus) || 0,
      deductCancelledOrders,
      penaltyPerCancelledOrder: Number(penaltyPerCancelledOrder) || 0,
      bankName,
      accountNumber,
      accountName,
      lastPayRateUpdated: new Date().toISOString().split('T')[0]
    }, applyToTeam);
  };

  const userTeam = salesTeams.find(t => t.id === user.teamId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-sky-400">
                BettaTraka Compensation Configuration
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Set Pay Rate: {user.name}
            </h2>
            <p className="text-xs text-slate-400">
              Configure base salary, per-delivery commission models, and performance targets.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff Profile Bar */}
        <div className="px-5 py-3 bg-[#131926]/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center font-bold text-sky-400">
              {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="font-semibold text-white">{user.name}</div>
              <div className="text-[11px] text-slate-400">{user.email} • {user.phone}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300">
              {user.role}
            </span>
            {userTeam && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono text-sky-400 bg-sky-950/80 border border-sky-800/60">
                {userTeam.name}
              </span>
            )}
          </div>
        </div>

        {/* Menu Tabs (pay2.png & pay3.png) */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveMenuTab('model')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeMenuTab === 'model'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            1. Compensation Model & Rates
          </button>
          <button
            onClick={() => setActiveMenuTab('simulator')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeMenuTab === 'simulator'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Live Earnings Simulator</span>
          </button>
          <button
            onClick={() => setActiveMenuTab('bank')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeMenuTab === 'bank'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            3. Disbursement Bank Details
          </button>
        </div>

        {/* Tab 1: Compensation Model & Rates (pay2.png) */}
        {activeMenuTab === 'model' && (
          <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Pay Structure Radio Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Select Compensation Structure
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Hybrid */}
                <div
                  onClick={() => setPayStructure('Hybrid')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition relative ${
                    payStructure === 'Hybrid'
                      ? 'border-sky-500 bg-sky-500/10 shadow-sm'
                      : 'border-slate-800 bg-[#131926]/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">Hybrid (Base + Commission)</span>
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 font-mono px-1.5 py-0.5 rounded">Most Popular</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Guaranteed monthly safety base salary plus commission for every delivered order.
                  </p>
                </div>

                {/* 2. Pure Commission */}
                <div
                  onClick={() => setPayStructure('Commission')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    payStructure === 'Commission'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                      : 'border-slate-800 bg-[#131926]/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">Pure Commission</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded">High Incentive</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Zero fixed salary. Rep is paid strictly per successfully delivered customer order.
                  </p>
                </div>

                {/* 3. Fixed Salary */}
                <div
                  onClick={() => setPayStructure('Fixed')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    payStructure === 'Fixed'
                      ? 'border-purple-500 bg-purple-500/10 shadow-sm'
                      : 'border-slate-800 bg-[#131926]/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">Fixed Salary Only</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-1.5 py-0.5 rounded">Salaried</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Guaranteed fixed monthly salary regardless of delivery volume or order conversion.
                  </p>
                </div>

                {/* 4. Tiered Performance (pay3.png) */}
                <div
                  onClick={() => setPayStructure('Performance-based')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    payStructure === 'Performance-based'
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                      : 'border-slate-800 bg-[#131926]/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">Accelerated Volume Tiers</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-1.5 py-0.5 rounded">Tiered</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Commission rate escalates higher as the sales rep achieves higher delivery volume brackets.
                  </p>
                </div>
              </div>
            </div>

            {/* Inputs based on selected structure */}
            <div className="space-y-4 pt-2">
              {/* Base Salary Input (If Fixed or Hybrid) */}
              {(payStructure === 'Fixed' || payStructure === 'Hybrid') && (
                <div className="p-4 rounded-xl border border-slate-800 bg-[#131926]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <span>Monthly Fixed Base Salary</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Paid monthly</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs">
                      ₦
                    </span>
                    <input
                      type="number"
                      value={fixedSalary}
                      onChange={(e) => setFixedSalary(Number(e.target.value))}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-white text-sm focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-500">Presets:</span>
                    {[50000, 75000, 100000, 150000, 200000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFixedSalary(amt)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                      >
                        ₦{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Commission Rate Input (If Commission or Hybrid) */}
              {(payStructure === 'Commission' || payStructure === 'Hybrid') && (
                <div className="p-4 rounded-xl border border-slate-800 bg-[#131926]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>Commission Calculation Method</span>
                    </label>
                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setCommissionType('flat')}
                        className={`px-2 py-0.5 rounded font-medium ${
                          commissionType === 'flat' ? 'bg-sky-500 text-white font-semibold' : 'text-slate-400'
                        }`}
                      >
                        Flat Fee per Order (₦)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommissionType('percentage')}
                        className={`px-2 py-0.5 rounded font-medium ${
                          commissionType === 'percentage' ? 'bg-sky-500 text-white font-semibold' : 'text-slate-400'
                        }`}
                      >
                        % of Order Value
                      </button>
                    </div>
                  </div>

                  {commissionType === 'flat' ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs">
                          ₦
                        </span>
                        <input
                          type="number"
                          value={commissionPerOrder}
                          onChange={(e) => setCommissionPerOrder(Number(e.target.value))}
                          placeholder="e.g. 1500"
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-emerald-400 font-bold text-sm focus:border-sky-500 focus:outline-none"
                        />
                        <span className="text-slate-400 text-xs">per delivered order</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] mt-2">
                        <span className="text-slate-500">Presets:</span>
                        {[1000, 1200, 1500, 1800, 2000, 2500].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setCommissionPerOrder(amt)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                          >
                            ₦{amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={commissionPercentage}
                          onChange={(e) => setCommissionPercentage(Number(e.target.value))}
                          placeholder="e.g. 5"
                          step="0.5"
                          className="w-32 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-emerald-400 font-bold text-sm focus:border-sky-500 focus:outline-none"
                        />
                        <span className="text-white font-bold">%</span>
                        <span className="text-slate-400 text-xs">of gross subtotal per delivered order</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tiered Performance Commission (pay3.png) */}
              {payStructure === 'Performance-based' && (
                <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>Volume Commission Tiers (pay3.png)</span>
                    </label>
                    <span className="text-[10px] text-indigo-300 font-mono">Accelerated Earnings</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Tier 1 */}
                    <div className="flex items-center gap-2 bg-[#0b0f19] border border-slate-800 p-2.5 rounded-lg">
                      <span className="w-16 text-slate-400 font-medium">Tier 1:</span>
                      <span className="text-slate-400">Orders 1 to</span>
                      <input
                        type="number"
                        value={tier1Max}
                        onChange={(e) => setTier1Max(Number(e.target.value))}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-center text-white"
                      />
                      <span className="text-slate-400">Rate:</span>
                      <span className="text-slate-500 font-mono">₦</span>
                      <input
                        type="number"
                        value={tier1Rate}
                        onChange={(e) => setTier1Rate(Number(e.target.value))}
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-emerald-400 font-bold"
                      />
                      <span className="text-slate-500">/order</span>
                    </div>

                    {/* Tier 2 */}
                    <div className="flex items-center gap-2 bg-[#0b0f19] border border-slate-800 p-2.5 rounded-lg">
                      <span className="w-16 text-slate-400 font-medium">Tier 2:</span>
                      <span className="text-slate-400">Orders {tier1Max + 1} to</span>
                      <input
                        type="number"
                        value={tier2Max}
                        onChange={(e) => setTier2Max(Number(e.target.value))}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-center text-white"
                      />
                      <span className="text-slate-400">Rate:</span>
                      <span className="text-slate-500 font-mono">₦</span>
                      <input
                        type="number"
                        value={tier2Rate}
                        onChange={(e) => setTier2Rate(Number(e.target.value))}
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-emerald-400 font-bold"
                      />
                      <span className="text-slate-500">/order</span>
                    </div>

                    {/* Tier 3 */}
                    <div className="flex items-center gap-2 bg-[#0b0f19] border border-slate-800 p-2.5 rounded-lg">
                      <span className="w-16 text-slate-400 font-medium">Tier 3:</span>
                      <span className="text-slate-400">Orders {tier2Max + 1}+</span>
                      <span className="flex-1"></span>
                      <span className="text-slate-400">Rate:</span>
                      <span className="text-slate-500 font-mono">₦</span>
                      <input
                        type="number"
                        value={tier3Rate}
                        onChange={(e) => setTier3Rate(Number(e.target.value))}
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-emerald-400 font-bold"
                      />
                      <span className="text-slate-500">/order</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Targets & Bonus Milestone */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[#131926]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Monthly Target Milestone Bonus</span>
                  </label>
                  <span className="text-[10px] text-amber-300 font-mono">Bonus Incentive</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Target Deliveries</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={targetDeliveries}
                        onChange={(e) => setTargetDeliveries(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-white text-xs"
                      />
                      <span className="text-slate-400">orders</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Target Cash Bonus</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-mono">₦</span>
                      <input
                        type="number"
                        value={targetBonus}
                        onChange={(e) => setTargetBonus(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-amber-400 font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="topConverterCheck"
                    checked={enableTopConverterBonus}
                    onChange={(e) => setEnableTopConverterBonus(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
                  />
                  <label htmlFor="topConverterCheck" className="text-xs text-slate-300">
                    Eligible for the automated <strong>₦50,000 monthly top converter prize</strong>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Simulator (pay3.png) */}
        {activeMenuTab === 'simulator' && (
          <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-xs">Simulate Monthly Take-Home Pay</h3>
                  <p className="text-[11px] text-slate-400">
                    Drag the slider to test how this configured rate calculates at various delivery volumes.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-sky-400">{simulatedDeliveries}</span>
                  <span className="text-xs text-slate-400 ml-1">orders</span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={simulatedDeliveries}
                onChange={(e) => setSimulatedDeliveries(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 orders</span>
                <span>25 orders</span>
                <span>50 orders (Target)</span>
                <span>75 orders</span>
                <span>100 orders</span>
              </div>
            </div>

            {/* Simulated Breakdown Result Box */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Projected Compensation Breakdown
              </div>

              <div className="divide-y divide-slate-800/80 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-400">Fixed Base Salary:</span>
                  <span className="font-mono text-white">{formatCurrency(simBase, 'NGN')}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-400">Commissions on {simulatedDeliveries} Delivered Orders:</span>
                  <span className="font-mono text-emerald-400 font-bold">+{formatCurrency(simCommission, 'NGN')}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-400">
                    Target Milestone Bonus {simulatedDeliveries >= targetDeliveries ? '✓ (Achieved)' : `(Need ${targetDeliveries - simulatedDeliveries} more)`}:
                  </span>
                  <span className="font-mono text-amber-400">
                    {simBonus > 0 ? `+${formatCurrency(simBonus, 'NGN')}` : '₦0'}
                  </span>
                </div>
                <div className="pt-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-white">Estimated Total Take-Home:</span>
                  <span className="font-mono font-bold text-sky-400 text-lg">
                    {formatCurrency(simTotal, 'NGN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Disbursement Bank Details */}
        {activeMenuTab === 'bank' && (
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="p-4 rounded-xl border border-slate-800 bg-[#131926]/40 space-y-3">
              <h3 className="font-semibold text-white text-xs flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-sky-400" />
                <span>Nigerian Bank Account for Direct Payouts</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Staff member's payout details utilized during one-click batch payroll disbursement.
              </p>

              <div className="space-y-3 text-xs pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. GTBank, Access Bank, Zenith Bank"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">NUBAN Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="10-digit Account Number"
                    maxLength={10}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Beneficiary Name"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {userTeam ? (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="applyToTeam"
                checked={applyToTeam}
                onChange={(e) => setApplyToTeam(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
              />
              <label htmlFor="applyToTeam" className="text-xs text-slate-300">
                Apply this rate to all reps in <strong>{userTeam.name}</strong>
              </label>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              Changes apply strictly to {user.name}.
            </div>
          )}

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Apply Rate</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// -------------------------------------------------------------
// AUDIT BREAKDOWN MODAL (Order Attribution Verification)
// -------------------------------------------------------------
interface AuditBreakdownModalProps {
  user: User;
  orders: any[];
  onClose: () => void;
  currency: CurrencyCode;
}

const AuditBreakdownModal: React.FC<AuditBreakdownModalProps> = ({ user, orders, onClose, currency }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Order Delivery Audit: {user.name}</h2>
            <p className="text-xs text-slate-400">
              {orders.length} successfully delivered orders contributing to commission calculation.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No delivered orders recorded for this staff member in the selected period.
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="p-3 bg-[#131926] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-white">{o.orderNumber || o.id}</div>
                    <div className="text-[11px] text-slate-400">{o.customerName} • {o.items?.[0]?.productName || 'Order Items'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-emerald-400 font-bold">
                      {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                    </div>
                    <div className="text-[10px] text-slate-500">{o.createdAt}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// RUN PAYROLL MODAL (Review & Execute)
// -------------------------------------------------------------
interface RunPayrollModalProps {
  month: string;
  onMonthChange: (m: string) => void;
  runCurrency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  staffMetrics: any[];
  topConverter: any;
  currency: CurrencyCode;
  onClose: () => void;
  onExecute: () => void;
}

const RunPayrollModal: React.FC<RunPayrollModalProps> = ({
  month,
  onMonthChange,
  runCurrency,
  onCurrencyChange,
  staffMetrics,
  topConverter,
  currency,
  onClose,
  onExecute
}) => {
  const [step, setStep] = useState<'config' | 'preview'>('config');

  const totalRunAmount = useMemo(() => {
    return staffMetrics.reduce((sum, m) => {
      const isTop = topConverter?.user.id === m.user.id;
      return sum + m.totalPayout + (isTop ? 50000 : 0);
    }, 0);
  }, [staffMetrics, topConverter]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-sky-400">
                Payroll Execution Engine
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Initiate Monthly Payroll Run
            </h2>
            <p className="text-xs text-slate-400">
              Automatically calculate base salaries, per-delivery commissions, and performance bonuses.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'config' ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Payroll Cycle Month</label>
                <select
                  value={month}
                  onChange={(e) => onMonthChange(e.target.value)}
                  className="w-full bg-[#131926] border border-slate-700 rounded-lg p-2.5 text-white font-medium text-xs focus:outline-none"
                >
                  <option value="September 2026">September 2026</option>
                  <option value="August 2026">August 2026</option>
                  <option value="July 2026">July 2026</option>
                  <option value="October 2026">October 2026</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Disbursement Currency</label>
                <select
                  value={runCurrency}
                  onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                  className="w-full bg-[#131926] border border-slate-700 rounded-lg p-2.5 text-white font-medium text-xs font-mono focus:outline-none"
                >
                  <option value="NGN">₦ NGN (Nigerian Naira)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="GHS">GH₵ GHS (Ghana Cedi)</option>
                  <option value="KES">KSh KES (Kenyan Shilling)</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#131926]/40 p-4 space-y-2 text-xs">
              <div className="font-semibold text-white">Summary of Eligible Staff:</div>
              <p className="text-slate-400 leading-relaxed">
                Audited <strong>{staffMetrics.length} staff members</strong> across all active sales and operations roles. The engine will evaluate completed orders for the cycle and credit the ₦50,000 top converter prize.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('preview')}
                className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Generate Calculation Preview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-sm">Review Calculation: {month}</h3>
                <p className="text-xs text-slate-400">Verify total payout before executing disbursement.</p>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Total Run Commitment</div>
                <div className="text-lg font-bold font-mono text-sky-400">
                  {formatCurrency(convertAmount(totalRunAmount, currency), currency)}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#131926] overflow-x-auto max-h-[45vh]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                    <th className="py-2.5 px-3">Staff</th>
                    <th className="py-2.5 px-3">Structure</th>
                    <th className="py-2.5 px-3 text-right">Fixed</th>
                    <th className="py-2.5 px-3 text-center">Orders</th>
                    <th className="py-2.5 px-3 text-right">Commission</th>
                    <th className="py-2.5 px-3 text-right">Bonus</th>
                    <th className="py-2.5 px-3 text-right">Total Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {staffMetrics.map((m) => {
                    const isTop = topConverter?.user.id === m.user.id;
                    const bonusTotal = m.bonusEarned + (isTop ? 50000 : 0);
                    const netTotal = m.totalPayout + (isTop ? 50000 : 0);

                    return (
                      <tr key={m.user.id} className="hover:bg-slate-800/20">
                        <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-1.5">
                          <span>{m.user.name}</span>
                          {isTop && <span title="Top Converter">🏆</span>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{m.user.payStructure}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                          {formatCurrency(convertAmount(m.baseSalary, currency), currency)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-400">
                          {m.deliveredCount}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-white">
                          {formatCurrency(convertAmount(m.commissionEarned, currency), currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                          {bonusTotal > 0 ? `+${formatCurrency(convertAmount(bonusTotal, currency), currency)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-400">
                          {formatCurrency(convertAmount(netTotal, currency), currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => setStep('config')}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                &larr; Back
              </button>
              <button
                onClick={onExecute}
                className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Approve & Disburse Payroll</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
