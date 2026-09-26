import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  PieChart, 
  BarChart2, 
  FileSpreadsheet, 
  Target, 
  Megaphone, 
  Banknote, 
  Check, 
  Download, 
  Calendar,
  Share2,
  ExternalLink,
  Plus
} from 'lucide-react';

export const FinancialReportsView: React.FC = () => {
  const { orders, expenses, products, currency } = useCrm();
  const [activeTab, setActiveTab] = useState<'overview' | 'pnl' | 'products'>('overview');

  const delivered = orders.filter(o => o.status === 'DELIVERED');
  const revenueNgn = delivered.reduce((s, o) => s + o.totalAmount, 0);
  const expensesNgn = expenses.reduce((s, e) => s + e.amount, 0);
  const cogsNgn = delivered.reduce((s, o) => {
    return s + o.items.reduce((is, i) => {
      const p = products.find(prod => prod.id === i.productId);
      return is + ((p?.unitCost || 4000) * i.quantity);
    }, 0);
  }, 0);
  const grossProfitNgn = revenueNgn - cogsNgn;
  const netProfitNgn = grossProfitNgn - expensesNgn;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Finance & Accounting Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Detailed P&L statements, product margin analysis, and hourly cash collection trends.
          </p>
        </div>

        <button
          onClick={() => alert("Downloading full Excel financial audit export...")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
        >
          <Download className="w-3.5 h-3.5" /> Export P&L
        </button>
      </div>

      {/* 4 Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Revenue</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(convertAmount(revenueNgn, currency), currency)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Gross Margin</p>
          <p className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {revenueNgn > 0 ? Math.round((grossProfitNgn / revenueNgn) * 100) : 0}%
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Expenses</p>
          <p className="text-2xl font-bold font-mono text-red-400 tabular-nums">
            {formatCurrency(convertAmount(expensesNgn, currency), currency)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Net Profit</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatCurrency(convertAmount(netProfitNgn, currency), currency)}
          </p>
        </div>
      </div>

      {/* Product Profitability Breakdown */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
        <h3 className="text-xs font-semibold text-white">Product Profitability Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3 text-right">Selling Price</th>
                <th className="py-2.5 px-3 text-right">Unit COGS</th>
                <th className="py-2.5 px-3 text-right">Gross Margin / Unit</th>
                <th className="py-2.5 px-3 text-center">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map(p => {
                const marginUnitNgn = p.sellingPrice - p.unitCost;
                const marginPct = Math.round((marginUnitNgn / p.sellingPrice) * 100);
                return (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-white">
                      {formatCurrency(convertAmount(p.sellingPrice, currency), currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      {formatCurrency(convertAmount(p.unitCost, currency), currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      +{formatCurrency(convertAmount(marginUnitNgn, currency), currency)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-white">
                      {marginPct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AdTrackingView: React.FC = () => {
  const { orders, currency } = useCrm();
  const [toggleView, setToggleView] = useState<'campaigns' | 'creatives' | 'sources'>('campaigns');

  // Attribution stats
  const trackedOrders = orders.filter(o => o.utmSource || o.utmCampaign);
  const delivered = trackedOrders.filter(o => o.status === 'DELIVERED');
  const revenueNgn = delivered.reduce((s, o) => s + o.totalAmount, 0);
  const convRate = trackedOrders.length > 0 ? Math.round((delivered.length / trackedOrders.length) * 100) : 0;

  const campaigns = [
    { name: 'clarifying_glow_sept26', orders: 48, delivered: 42, conv: 87.5, revenueNgn: 1029000 },
    { name: 'smartwatch_gadget_review', orders: 36, delivered: 31, conv: 86.1, revenueNgn: 992000 },
    { name: 'knee_pain_elderly_relief', orders: 28, delivered: 22, conv: 78.5, revenueNgn: 407000 },
    { name: 'skincare_retargeting_v2', orders: 19, delivered: 17, conv: 89.4, revenueNgn: 416500 }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Ad Tracking & UTM Attribution
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          See which Meta, TikTok, and Google Ads campaigns deliver real doorstep cash collections. Always 100% free.
        </p>
      </div>

      {/* 4 Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Tracked Orders</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">{trackedOrders.length}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Delivered Orders</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{delivered.length}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Attributed Cashflow</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(convertAmount(revenueNgn, currency), currency)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Ad Conv. Rate</p>
          <p className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{convRate}%</p>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs w-fit">
        <button
          onClick={() => setToggleView('campaigns')}
          className={`px-3 py-1 font-medium rounded-md capitalize ${
            toggleView === 'campaigns' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Campaigns
        </button>
        <button
          onClick={() => setToggleView('creatives')}
          className={`px-3 py-1 font-medium rounded-md capitalize ${
            toggleView === 'creatives' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Creatives
        </button>
        <button
          onClick={() => setToggleView('sources')}
          className={`px-3 py-1 font-medium rounded-md capitalize ${
            toggleView === 'sources' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Traffic Sources
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 font-medium">Campaign Name</th>
                <th className="py-3 px-4 font-medium text-center">Orders</th>
                <th className="py-3 px-4 font-medium text-center">Delivered</th>
                <th className="py-3 px-4 font-medium text-center">Conversion %</th>
                <th className="py-3 px-4 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {campaigns.map((c) => (
                <tr key={c.name} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-white">{c.name}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300">{c.orders}</td>
                  <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">{c.delivered}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-white">{c.conv}%</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                    {formatCurrency(convertAmount(c.revenueNgn, currency), currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const RemittancesView: React.FC = () => {
  const { remittances, markRemittanceAsPaid, currency } = useCrm();
  const [tab, setTab] = useState<'pending' | 'remitted'>('pending');

  const pending = remittances.filter(r => r.status === 'Pending');
  const remitted = remittances.filter(r => r.status === 'Remitted');
  const displayed = tab === 'pending' ? pending : remitted;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Agent Delivery Remittances
            <span className="text-xs font-mono font-normal text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded">
              {pending.length} awaiting settlement
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Delivered orders awaiting doorstep cash remittance from your delivery agents.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setTab('pending')}
            className={`px-3 py-1 font-medium rounded-md ${
              tab === 'pending' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Remittance ({pending.length})
          </button>
          <button
            onClick={() => setTab('remitted')}
            className={`px-3 py-1 font-medium rounded-md ${
              tab === 'remitted' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Remitted Settlements ({remitted.length})
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 font-medium">Order #</th>
                <th className="py-3 px-4 font-medium">Customer Details</th>
                <th className="py-3 px-4 font-medium">Delivery Agent & Zone</th>
                <th className="py-3 px-4 font-medium">Delivered Date</th>
                <th className="py-3 px-4 font-medium text-right">Net Remittance Due</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No records found in this remittance state.
                  </td>
                </tr>
              ) : (
                displayed.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-white">{r.orderNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{r.customerName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{r.customerPhone}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {r.agentName} ({r.agentZone})
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{r.deliveredDate}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      {formatCurrency(convertAmount(r.amountToRemit, currency), currency)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {r.status === 'Pending' ? (
                        <button
                          onClick={() => {
                            markRemittanceAsPaid(r.id);
                            alert(`Confirmed remittance of ₦${r.amountToRemit.toLocaleString()} from ${r.agentName}!`);
                          }}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 font-medium text-white text-xs transition"
                        >
                          Confirm Received
                        </button>
                      ) : (
                        <span className="font-mono text-emerald-400 text-xs">✓ Settled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
