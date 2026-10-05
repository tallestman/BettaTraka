import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { Order } from '../../types/crm';
import { CreateOrderModal } from '../admin/CreateOrderModal';
import { ScheduleDeliveryModal } from '../common/ScheduleDeliveryModal';
import { 
  Briefcase, 
  ShoppingBag, 
  Truck, 
  CalendarClock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Plus, 
  ArrowRight, 
  Boxes, 
  ShieldCheck, 
  Package, 
  TrendingUp, 
  Clock, 
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export const ManagerDashboardView: React.FC = () => {
  const { 
    orders, 
    users, 
    products, 
    distributors, 
    agents, 
    currency, 
    setAdminActiveTab, 
    currentUser, 
    themeMode,
    addNotification 
  } = useCrm();

  const isLight = themeMode === 'light';

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orderToSchedule, setOrderToSchedule] = useState<Order | null>(null);

  // Manager specific permissions
  const permissions = currentUser?.permissions?.admin;
  const hasAiAgent = Boolean(permissions?.aiAgent);
  const hasAiSandbox = Boolean(permissions?.aiSandbox);
  const hasTokenReporting = Boolean(permissions?.tokenReporting);
  const hasIntegrations = Boolean(permissions?.integrations);

  // Orders pipeline breakdown
  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'DELIVERED'), [orders]);
  const dispatchedOrders = useMemo(() => orders.filter(o => o.status === 'DISPATCHED'), [orders]);
  const confirmedOrders = useMemo(() => orders.filter(o => o.status === 'CONFIRMED'), [orders]);
  const scheduledOrders = useMemo(() => orders.filter(o => o.status === 'SCHEDULED' || o.scheduledDate), [orders]);
  const newOrders = useMemo(() => orders.filter(o => o.status === 'NEW'), [orders]);
  const cancelledOrders = useMemo(() => orders.filter(o => o.status === 'CANCELLED'), [orders]);

  const deliveredRevenue = useMemo(() => {
    return deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [deliveredOrders]);

  const totalActivePipelineValue = useMemo(() => {
    return orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const fulfillmentRate = useMemo(() => {
    const closed = deliveredOrders.length + cancelledOrders.length;
    if (closed === 0) return 85;
    return Math.round((deliveredOrders.length / closed) * 100);
  }, [deliveredOrders, cancelledOrders]);

  // Orders requiring immediate scheduling or action
  const urgentOrders = useMemo(() => {
    return orders
      .filter(o => (o.status === 'CONFIRMED' || o.status === 'NEW') && !o.scheduledDate)
      .slice(0, 5);
  }, [orders]);

  // Distributor orders
  const distributorOrders = useMemo(() => {
    return orders.filter(o => !!o.distributorId);
  }, [orders]);

  // Active Sales Reps
  const salesReps = useMemo(() => {
    return users.filter(u => u.role === 'Sales Representative');
  }, [users]);

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
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border ${
                isLight 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                <Briefcase className={`w-3 h-3 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
                <span>Manager Operations Dashboard</span>
              </span>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Signed in as: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{currentUser?.name || 'Operations Manager'}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Operations & Fulfillment Command Center
            </h1>
            <p className={`text-xs max-w-2xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Real-time oversight over team lead conversion, delivery dispatch routes, regional distributor hubs, and inventory velocity across Nigeria.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Order</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminActiveTab('scheduled')}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5 text-sky-400" />
              <span>Dispatch Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Active Pipeline */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Active Pipeline Value</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono">
            {formatCurrency(convertAmount(totalActivePipelineValue, currency), currency)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-medium">
            <span>{orders.length} total customer orders</span>
          </div>
        </div>

        {/* Metric 2: Delivered Revenue */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Delivered Revenue</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono">
            {formatCurrency(convertAmount(deliveredRevenue, currency), currency)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-teal-400 font-medium">
            <span>{deliveredOrders.length} orders delivered</span>
          </div>
        </div>

        {/* Metric 3: Fulfillment Success Rate */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Fulfillment Velocity</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono">
            {fulfillmentRate}%
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-blue-400 font-medium">
            <span>{dispatchedOrders.length} currently in transit</span>
          </div>
        </div>

        {/* Metric 4: Sales Rep Capacity */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Sales Reps Capacity</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono">
            {salesReps.filter(r => r.status === 'Active').length} / {salesReps.length}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-purple-400 font-medium">
            <span>Active reps in rotation</span>
          </div>
        </div>
      </div>

      {/* 3. Restricted Sections Access Status Card */}
      <div className={`rounded-2xl p-5 border transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090d16] border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Manager Section Access & Administrative Delegation</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              The manager has full operational oversight. The following advanced sections require Administrator delegation:
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdminActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <span>Manage Users & Roles</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3.5">
          {/* 1. Token Reporting */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
            hasTokenReporting 
              ? (isLight ? 'bg-emerald-50 border-emerald-300' : 'bg-emerald-950/20 border-emerald-800/60') 
              : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800')
          }`}>
            <div>
              <p className="font-bold text-xs">Token Reporting</p>
              <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Metering & billing usage</p>
            </div>
            {hasTokenReporting ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                <Unlock className="w-3 h-3" />
                <span>Granted</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Locked</span>
              </span>
            )}
          </div>

          {/* 2. AI Voice Agent */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
            hasAiAgent 
              ? (isLight ? 'bg-emerald-50 border-emerald-300' : 'bg-emerald-950/20 border-emerald-800/60') 
              : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800')
          }`}>
            <div>
              <p className="font-bold text-xs">AI Voice Agent</p>
              <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Automated voice outbound</p>
            </div>
            {hasAiAgent ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                <Unlock className="w-3 h-3" />
                <span>Granted</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Locked</span>
              </span>
            )}
          </div>

          {/* 3. AI Sandbox */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
            hasAiSandbox 
              ? (isLight ? 'bg-emerald-50 border-emerald-300' : 'bg-emerald-950/20 border-emerald-800/60') 
              : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800')
          }`}>
            <div>
              <p className="font-bold text-xs">AI Sandbox</p>
              <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Prompt engineering testing</p>
            </div>
            {hasAiSandbox ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                <Unlock className="w-3 h-3" />
                <span>Granted</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Locked</span>
              </span>
            )}
          </div>

          {/* 4. Integrations */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
            hasIntegrations 
              ? (isLight ? 'bg-emerald-50 border-emerald-300' : 'bg-emerald-950/20 border-emerald-800/60') 
              : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800')
          }`}>
            <div>
              <p className="font-bold text-xs">Integrations</p>
              <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Shopify, Webhooks & APIs</p>
            </div>
            {hasIntegrations ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                <Unlock className="w-3 h-3" />
                <span>Granted</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Locked</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Split Grid: Action Queue & Active Reps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Urgent Dispatch & Customer Action Queue */}
        <div className={`lg:col-span-2 rounded-2xl border p-5 space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090d16] border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="font-bold text-sm flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-sky-400" />
                <span>Orders Requiring Delivery Scheduling</span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Confirmed orders awaiting committed delivery date or dispatch agent assignment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAdminActiveTab('orders')}
              className={`text-xs font-semibold cursor-pointer hover:underline flex items-center gap-1 ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {urgentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              ✓ All confirmed orders are currently scheduled!
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentOrders.map(o => (
                <div 
                  key={o.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100/70' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white bg-slate-800 px-2 py-0.5 rounded">
                        {o.orderNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        o.status === 'CONFIRMED' ? 'bg-purple-950 text-purple-400 border border-purple-800/60' : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      }`}>
                        {o.status}
                      </span>
                      {o.distributorName && (
                        <span className="text-[10px] text-lime-400 bg-lime-950/60 border border-lime-800/60 px-1.5 py-0.2 rounded font-mono">
                          Hub: {o.distributorName.split(' ')[0]}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-xs text-white">
                      {o.customerName} · <span className="font-mono text-slate-400">{o.customerPhone}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {o.deliveryCity}, {o.deliveryState} · <span className="text-white font-bold">{formatCurrency(convertAmount(o.totalAmount, currency), currency)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setOrderToSchedule(o)}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Set Delivery Date</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Sales Reps & Roster */}
        <div className={`rounded-2xl border p-5 space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090d16] border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Sales Staff Oversight</span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {salesReps.length} sales representatives enrolled
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAdminActiveTab('sales-reps')}
              className={`text-xs font-semibold cursor-pointer hover:underline ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {salesReps.map(rep => {
              const repOrders = orders.filter(o => o.salesRepId === rep.id);
              const repDelivered = repOrders.filter(o => o.status === 'DELIVERED').length;

              return (
                <div 
                  key={rep.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800/70'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate text-white">{rep.name}</p>
                    <p className="text-[10px] text-slate-400">{rep.phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {repDelivered} Delivered
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {repOrders.length} assigned
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payroll View Banner */}
          <div className={`p-3 rounded-xl border space-y-1.5 ${
            isLight ? 'bg-sky-50 border-sky-200' : 'bg-sky-950/20 border-sky-800/40'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Staff Compensation</span>
              </span>
              <span className="text-[10px] font-mono text-sky-300 bg-sky-900/40 px-1.5 py-0.5 rounded">
                View Only
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Managers can audit compensation, commission payouts, and rates. Salary and commission configuration is reserved for Admin.
            </p>
            <button
              type="button"
              onClick={() => setAdminActiveTab('payroll')}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 mt-1 cursor-pointer"
            >
              <span>Review Staff Payroll</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Regional Distributor Hubs Overview */}
      <div className={`rounded-2xl border p-5 space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090d16] border-slate-800'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="font-bold text-sm flex items-center gap-2">
              <Boxes className="w-4 h-4 text-lime-400" />
              <span>Regional Fulfillment Hubs & Distributor Stock</span>
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Track regional stock balance and orders routed through partner distributors across Nigeria.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdminActiveTab('distributors')}
            className={`text-xs font-semibold cursor-pointer hover:underline ${
              isLight ? 'text-lime-700' : 'text-lime-400'
            }`}
          >
            Manage Distributors
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {distributors.map(dist => {
            const hubOrders = orders.filter(o => o.distributorId === dist.id);
            const hubDelivered = hubOrders.filter(o => o.status === 'DELIVERED').length;

            return (
              <div 
                key={dist.id}
                className={`p-4 rounded-xl border space-y-2 transition ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{dist.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-lime-950 text-lime-400 border border-lime-800/60 font-bold">
                    {dist.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Contact: <span className="font-mono text-slate-300">{dist.phone}</span>
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <span className="text-slate-400">{hubOrders.length} orders allocated</span>
                  <span className="font-bold text-lime-400 font-mono">{hubDelivered} delivered</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateOrderModal onClose={() => setShowCreateModal(false)} />
      )}

      {orderToSchedule && (
        <ScheduleDeliveryModal
          order={orderToSchedule}
          onClose={() => setOrderToSchedule(null)}
          onScheduled={(date, time) => {
            if (addNotification) {
              addNotification({
                title: 'Order Scheduled',
                message: `Order #${orderToSchedule.orderNumber} scheduled for ${date} (${time})`,
                type: 'success'
              });
            }
          }}
        />
      )}

    </div>
  );
};
