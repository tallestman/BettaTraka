import React, { useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  Building2, 
  Wallet, 
  TrendingUp, 
  Receipt, 
  Banknote, 
  Truck, 
  Package, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Download, 
  Coins, 
  PieChart, 
  Sliders, 
  FileSpreadsheet, 
  DollarSign, 
  Settings, 
  MessageSquare,
  Lock,
  Eye,
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const AccountantDashboardView: React.FC = () => {
  const { 
    orders, 
    expenses, 
    remittances, 
    users, 
    products, 
    currency, 
    setAdminActiveTab, 
    currentUser, 
    themeMode 
  } = useCrm();

  const isLight = themeMode === 'light';

  // 1. Orders & Deliveries Revenue Metrics
  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'DELIVERED'), [orders]);
  const dispatchedOrders = useMemo(() => orders.filter(o => o.status === 'DISPATCHED'), [orders]);
  const scheduledOrders = useMemo(() => orders.filter(o => o.status === 'SCHEDULED' || o.scheduledDate), [orders]);

  const deliveredGrossRevenue = useMemo(() => {
    return deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [deliveredOrders]);

  const dispatchedInTransitValue = useMemo(() => {
    return dispatchedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [dispatchedOrders]);

  // 2. Remittances & COD Reconciliation
  const pendingRemittances = useMemo(() => remittances.filter(r => r.status === 'Pending'), [remittances]);
  const completedRemittances = useMemo(() => remittances.filter(r => r.status === 'Remitted'), [remittances]);

  const totalPendingRemitAmount = useMemo(() => {
    return pendingRemittances.reduce((sum, r) => sum + (r.amountToRemit || r.orderTotal || 0), 0);
  }, [pendingRemittances]);

  const totalCollectedRemitAmount = useMemo(() => {
    return completedRemittances.reduce((sum, r) => sum + (r.amountToRemit || r.orderTotal || 0), 0);
  }, [completedRemittances]);

  // 3. Operating Expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Expense categories breakdown
  const expensesByType = useMemo(() => {
    const map: { [key: string]: number } = {};
    expenses.forEach(e => {
      map[e.type] = (map[e.type] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  // 4. Staff Payroll Liabilities (Accrued base salary + commissions on delivered orders)
  const totalStaffFixedSalaries = useMemo(() => {
    return users.reduce((sum, u) => sum + (u.fixedSalary || 0), 0);
  }, [users]);

  const totalCommissionsAccrued = useMemo(() => {
    let comms = 0;
    deliveredOrders.forEach(o => {
      if (o.salesRepId) {
        const rep = users.find(u => u.id === o.salesRepId);
        if (rep && rep.commissionPerOrder) {
          comms += rep.commissionPerOrder;
        }
      }
    });
    return comms;
  }, [deliveredOrders, users]);

  const totalPayrollLiability = totalStaffFixedSalaries + totalCommissionsAccrued;

  // 5. Estimated Net Operating Margin
  const netEstimatedMargin = deliveredGrossRevenue - totalExpenses - totalPayrollLiability;

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto ${isLight ? 'text-slate-900' : 'text-white'}`}>
      
      {/* 1. Header Banner */}
      <div className={`rounded-2xl p-5 sm:p-6 border shadow-sm transition-all ${
        isLight 
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-200' 
          : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#090d16] border-emerald-900/60'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-400" />
                <span>Accountant Financial Portal</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center gap-1">
                <Eye className="w-3 h-3 text-sky-400" />
                <span>Read-Only Audit Clearance</span>
              </span>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Accountant: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{currentUser?.name || 'Kemi Adeleke, FCA'}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Finance, Cashflow & Reconciliation Ledger
            </h1>
            <p className={`text-xs max-w-2xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Centralized financial oversight over cash-on-delivery collections, courier remittances, operating expenses, staff payroll accruals, and profit & loss reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setAdminActiveTab('financial-reports')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>P&L Statements</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminActiveTab('settings')}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Accounting Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Audit Mode Notice Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isLight 
          ? 'bg-sky-50 border-sky-200 text-sky-900' 
          : 'bg-sky-950/30 border-sky-800/60 text-sky-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold">Accountant View-Only Audit Mode Enforced</p>
            <p className={`text-[11px] ${isLight ? 'text-sky-700' : 'text-slate-300'}`}>
              For regulatory compliance and internal audit controls, financial ledgers (Orders, Deliveries, Payroll, Expenses, Financial Reports, Remittances, Team Chat) are provided in read-only audit mode. Modifying transactions or executing payouts is restricted to System Administrators.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono text-[11px]">
          <span className={`px-2.5 py-1 rounded-md font-semibold border ${
            isLight ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
          }`}>
            Audit Trail Active
          </span>
        </div>
      </div>

      {/* 3. Primary Financial KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Realized Delivered Inflow */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Delivered Inflow (COD)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono">
            {formatCurrency(convertAmount(deliveredGrossRevenue, currency), currency)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-medium">
            <span>{deliveredOrders.length} completed customer orders</span>
          </div>
        </div>

        {/* Metric 2: Pending Remittance */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Pending Remittances</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono">
            {formatCurrency(convertAmount(totalPendingRemitAmount, currency), currency)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-400 font-medium">
            <span>{pendingRemittances.length} settlements awaiting receipt</span>
          </div>
        </div>

        {/* Metric 3: Operating Expenses */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Operating Expenses</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono">
            {formatCurrency(convertAmount(totalExpenses, currency), currency)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-rose-400 font-medium">
            <span>{expenses.length} logged expense items</span>
          </div>
        </div>

        {/* Metric 4: Payroll Liability */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Payroll Accruals</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono">
            {formatCurrency(convertAmount(totalPayrollLiability, currency), currency)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-purple-400 font-medium">
            <span>Salaries & order commissions</span>
          </div>
        </div>
      </div>

      {/* 4. Split Section: Quick Ledger Audits & Expense Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Financial Quick Navigation & Ledgers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Ledger Navigation Card */}
          <div className={`rounded-2xl p-5 border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090d16] border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Audited Financial Ledgers</span>
              </h2>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                View-only ledger access
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5">
              {/* Ledger 1: Orders */}
              <div 
                onClick={() => setAdminActiveTab('orders')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition group ${
                  isLight 
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' 
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>Customer Orders Ledger</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-500/10 text-sky-400 rounded">View Only</span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {orders.length} total orders · audit billing & payment status
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Ledger 2: Deliveries */}
              <div 
                onClick={() => setAdminActiveTab('deliveries')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition group ${
                  isLight 
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' 
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>Deliveries & Fulfillment</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-500/10 text-sky-400 rounded">View Only</span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {deliveredOrders.length} delivered · {dispatchedOrders.length} in transit
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Ledger 3: Payroll */}
              <div 
                onClick={() => setAdminActiveTab('payroll')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition group ${
                  isLight 
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' 
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>Payroll & Compensation</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-500/10 text-sky-400 rounded">View Only</span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Staff salaries, commission rates, and payout history
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Ledger 4: Expenses */}
              <div 
                onClick={() => setAdminActiveTab('expenses')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition group ${
                  isLight 
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' 
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>Operating Expenses</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-500/10 text-sky-400 rounded">View Only</span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {expenses.length} logged expense items & receipts
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Ledger 5: Finance & Accounting */}
              <div 
                onClick={() => setAdminActiveTab('financial-reports')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition group ${
                  isLight 
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' 
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>Finance & Accounting (P&L)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded">Full Access</span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Income statements, profit margins, export reports
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Ledger 6: Remittances */}
              <div 
                onClick={() => setAdminActiveTab('remittances')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition group ${
                  isLight 
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' 
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>Courier & Hub Remittances</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-500/10 text-sky-400 rounded">View Only</span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {pendingRemittances.length} pending · {completedRemittances.length} remitted
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Ledger 7: Team Chat */}
              <div 
                onClick={() => setAdminActiveTab('team-chat')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition group ${
                  isLight 
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' 
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>Team Communication Chat</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-purple-500/10 text-purple-400 rounded">Channel</span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Cross-functional communications & audit inquiries
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Ledger 8: Accountant Settings */}
              <div 
                onClick={() => setAdminActiveTab('settings')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition group ${
                  isLight 
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' 
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>Accountant Settings</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded">Config</span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Tax/VAT rates, currency format, thresholds
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Pending COD Remittances Audit Table */}
          <div className={`rounded-2xl p-5 border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090d16] border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-amber-400" />
                  <span>Pending Remittances Reconciliation Queue</span>
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Cash collected by couriers & regional hubs awaiting administrative deposit confirmation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminActiveTab('remittances')}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <span>View Full Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto pt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-mono uppercase ${
                    isLight ? 'border-slate-200 text-slate-500 bg-slate-50' : 'border-slate-800 text-slate-400 bg-slate-950/60'
                  }`}>
                    <th className="py-2.5 px-3">Order / Customer</th>
                    <th className="py-2.5 px-3">Courier / Collector</th>
                    <th className="py-2.5 px-3">COD Amount</th>
                    <th className="py-2.5 px-3">Delivery Fee</th>
                    <th className="py-2.5 px-3">Net Due</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
                  {pendingRemittances.slice(0, 5).map(r => (
                    <tr key={r.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/40'}>
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-emerald-400">{r.orderNumber}</span>
                        <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{r.customerName}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {r.agentName}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold">
                        {formatCurrency(convertAmount(r.orderTotal || r.amountToRemit, currency), currency)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {formatCurrency(convertAmount(r.deliveryFeeDeducted || 0, currency), currency)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                        {formatCurrency(convertAmount(r.amountToRemit, currency), currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {pendingRemittances.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        All Cash-on-Delivery collections are fully reconciled. No pending remittances.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Expense Distribution & P&L Summary */}
        <div className="space-y-6">
          
          {/* P&L Net Operating Margin Snapshot */}
          <div className={`rounded-2xl p-5 border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090d16] border-slate-800'
          }`}>
            <h3 className="font-bold text-sm flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Net Operating Cashflow</span>
            </h3>

            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Gross Inflow (Delivered):</span>
                <span className="font-mono font-bold text-emerald-400">
                  +{formatCurrency(convertAmount(deliveredGrossRevenue, currency), currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Operating Expenses:</span>
                <span className="font-mono font-bold text-rose-400">
                  -{formatCurrency(convertAmount(totalExpenses, currency), currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Staff Payroll Liabilities:</span>
                <span className="font-mono font-bold text-purple-400">
                  -{formatCurrency(convertAmount(totalPayrollLiability, currency), currency)}
                </span>
              </div>

              <div className={`pt-3 border-t flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <span className="font-bold text-xs">Estimated Operating Margin:</span>
                <span className={`font-mono font-bold text-sm ${netEstimatedMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(convertAmount(netEstimatedMargin, currency), currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Operating Expense Breakdown */}
          <div className={`rounded-2xl p-5 border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090d16] border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4 text-sky-400" />
                <span>Expense Breakdown</span>
              </h3>
              <button
                type="button"
                onClick={() => setAdminActiveTab('expenses')}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
              >
                Audit
              </button>
            </div>

            <div className="pt-4 space-y-3.5">
              {expensesByType.slice(0, 5).map(([type, amount]) => {
                const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                return (
                  <div key={type} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium truncate max-w-[180px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {type}
                      </span>
                      <span className="font-mono font-semibold">
                        {formatCurrency(convertAmount(amount, currency), currency)} ({percent}%)
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
