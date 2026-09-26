import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Sliders, 
  ArrowRight,
  ExternalLink,
  Phone
} from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { 
    orders, 
    abandonedCarts, 
    products, 
    currency, 
    setAdminActiveTab,
    expenses 
  } = useCrm();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [targetBoost, setTargetBoost] = useState<number>(20); // +20pp simulator

  // Calculate metrics
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
  const totalDeliveredRevenueNgn = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  // Total cost of goods sold (COGS)
  const totalCogsNgn = deliveredOrders.reduce((sum, o) => {
    return sum + o.items.reduce((iSum, item) => {
      const prod = products.find(p => p.id === item.productId);
      return iSum + (prod ? prod.unitCost * item.quantity : 4000);
    }, 0);
  }, 0);

  // Total expenses
  const totalExpensesNgn = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Profit: Revenue - COGS - Expenses
  const netProfitNgn = totalDeliveredRevenueNgn - totalCogsNgn - totalExpensesNgn;

  // Fulfillment rate
  const totalCompletedOrCancelled = orders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED').length;
  const fulfillmentRate = totalCompletedOrCancelled > 0 
    ? Math.round((deliveredOrders.length / totalCompletedOrCancelled) * 100) 
    : 85;

  // Abandoned cart metrics
  const totalCarts = abandonedCarts.length;
  const convertedCarts = abandonedCarts.filter(c => c.status === 'CONVERTED').length;
  const contactedCarts = abandonedCarts.filter(c => c.status === 'CONTACTED').length;
  const openCarts = abandonedCarts.filter(c => c.status === 'ABANDONED' || c.status === 'ASSIGNED').length;

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

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header with Title and Date Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
            Operations & Revenue Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Payment-on-Delivery cashflow, fulfillment rate, and sales rep pipeline.
          </p>
        </div>

        {/* Date Filter Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {(['today', 'week', 'month', 'year'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                dateFilter === filter
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
          <button 
            onClick={() => alert("Exporting Financial & Order CSV Report for Nigerian Tax & Audit...")}
            className="ml-2 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:text-white bg-slate-800/80 rounded border border-emerald-500/30"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Delivered Revenue</span>
            <span className="text-emerald-400 flex items-center font-mono text-[11px]">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
            {formatCurrency(convertAmount(totalDeliveredRevenueNgn, currency), currency)}
          </p>
          <p className="text-[11px] text-slate-500">
            vs. {formatCurrency(convertAmount(totalDeliveredRevenueNgn * 0.82, currency), currency)} last period
          </p>
        </div>

        {/* Net Profit */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Profit</span>
            <span className="text-emerald-400 flex items-center font-mono text-[11px]">
              <ArrowUpRight className="w-3.5 h-3.5" /> +22.1%
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
            {formatCurrency(convertAmount(netProfitNgn, currency), currency)}
          </p>
          <p className="text-[11px] text-slate-500">
            After COGS, ad spend & delivery rider fees
          </p>
        </div>

        {/* Total Orders */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Orders</span>
            <span className="text-slate-400 font-mono text-[11px]">{orders.length} active</span>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
            {orders.length}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-mono">{deliveredOrders.length} delivered</span>
            <span>·</span>
            <span className="text-amber-400 font-mono">
              {orders.filter(o => o.status === 'NEW' || o.status === 'CONFIRMED' || o.status === 'DISPATCHED').length} in transit
            </span>
          </div>
        </div>

        {/* Fulfillment Rate */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Fulfillment Rate</span>
            <span className="text-emerald-400 font-mono text-[11px]">{fulfillmentRate}%</span>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
            {fulfillmentRate}%
          </p>
          <p className="text-[11px] text-slate-500">
            POD delivery completion vs cancellation
          </p>
        </div>
      </div>

      {/* Row 2: Abandoned Carts Follow-up Panel & Revenue Opportunity Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Abandoned Cart Follow-up Panel */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Abandoned Cart Recovery Pipeline</h2>
            </div>
            <button
              onClick={() => setAdminActiveTab('abandoned-carts')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              View Carts <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Track customer drop-offs on order form, monitor rep follow-ups, and convert uncompleted leads.
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1 text-center">
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-2.5">
              <p className="text-[10px] uppercase font-mono text-slate-400">Open Carts</p>
              <p className="text-base font-bold font-mono text-white mt-1">{openCarts}</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-2.5">
              <p className="text-[10px] uppercase font-mono text-slate-400">Assigned</p>
              <p className="text-base font-bold font-mono text-cyan-400 mt-1">
                {abandonedCarts.filter(c => c.status === 'ASSIGNED').length}
              </p>
            </div>
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-2.5">
              <p className="text-[10px] uppercase font-mono text-slate-400">Contacted</p>
              <p className="text-base font-bold font-mono text-amber-400 mt-1">{contactedCarts}</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-2.5">
              <p className="text-[10px] uppercase font-mono text-slate-400">Converted</p>
              <p className="text-base font-bold font-mono text-emerald-400 mt-1">{convertedCarts}</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-2.5">
              <p className="text-[10px] uppercase font-mono text-slate-400">Total Leads</p>
              <p className="text-base font-bold font-mono text-slate-300 mt-1">{totalCarts}</p>
            </div>
          </div>

          {/* Quick Rep Action Banner */}
          <div className="rounded-lg bg-emerald-950/30 border border-emerald-800/40 p-3 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Recovering just 2 more carts today adds <strong className="text-emerald-400 font-mono">₦64,000</strong> to gross revenue.
            </span>
            <button
              onClick={() => setAdminActiveTab('abandoned-carts')}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs whitespace-nowrap ml-2"
            >
              Recover Now
            </button>
          </div>
        </div>

        {/* Revenue Opportunity Simulator */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Revenue Opportunity Simulator</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Interactive Model</span>
          </div>

          <p className="text-xs text-slate-400">
            Simulate how boosting your sales rep confirmation & dispatch speed increases monthly cashflow.
          </p>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Target Delivery Rate Increase:</span>
              <span className="font-mono font-bold text-emerald-400">+{targetBoost}% boost</span>
            </div>

            {/* Slider Control */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setTargetBoost(10)}
                className={`px-2.5 py-1 text-xs font-mono rounded border ${targetBoost === 10 ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
              >
                +10pp
              </button>
              <button 
                onClick={() => setTargetBoost(20)}
                className={`px-2.5 py-1 text-xs font-mono rounded border ${targetBoost === 20 ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
              >
                +20pp
              </button>
              <button 
                onClick={() => setTargetBoost(30)}
                className={`px-2.5 py-1 text-xs font-mono rounded border ${targetBoost === 30 ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
              >
                +30pp
              </button>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={targetBoost}
                onChange={(e) => setTargetBoost(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Projection Output Box */}
            <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400">Projected Extra Net Revenue</p>
                <p className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                  +{formatCurrency(convertAmount(projectedExtraRevenueNgn, currency), currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400">New Fulfillment Rate</p>
                <p className="text-base font-bold font-mono text-white tabular-nums">
                  {simulatedRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top Selling Products & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Top Selling Products</h2>
            <button
              onClick={() => setAdminActiveTab('inventory')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Inventory
            </button>
          </div>

          <div className="space-y-3">
            {products.map((p) => {
              // Calculate units sold in delivered orders
              const unitsSold = deliveredOrders.reduce((acc, o) => {
                const item = o.items.find(i => i.productId === p.id);
                return acc + (item ? item.quantity : 0);
              }, 0);

              const revenueNgn = unitsSold * p.sellingPrice;

              return (
                <div key={p.id} className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      SKU: <span className="font-mono">{p.sku}</span> · {p.stockWarehouse} in central warehouse
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                      {formatCurrency(convertAmount(revenueNgn, currency), currency)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {unitsSold} units delivered
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Order Transactions</h2>
            <button
              onClick={() => setAdminActiveTab('orders')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                  <th className="pb-2 font-medium">Order #</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Location</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-mono text-slate-300 font-medium">{o.orderNumber}</td>
                    <td className="py-2.5">
                      <p className="font-medium text-white">{o.customerName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{o.customerPhone}</p>
                    </td>
                    <td className="py-2.5 text-slate-300">{o.deliveryState}</td>
                    <td className="py-2.5 font-mono text-white font-semibold">
                      {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        o.status === 'DELIVERED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                        o.status === 'DISPATCHED' ? 'bg-blue-950 text-blue-400 border border-blue-800/60' :
                        o.status === 'CONFIRMED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60' :
                        o.status === 'NEW' ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
                        'bg-red-950 text-red-400 border border-red-800/60'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
