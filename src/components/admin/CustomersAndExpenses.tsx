import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount, formatDate } from '../../utils/formatters';
import { CustomerRecord, Expense } from '../../types/crm';
import { 
  Users, 
  DollarSign, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  PieChart, 
  X,
  FileText
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, toggleCustomerBlock, currency } = useCrm();
  const [search, setSearch] = useState('');

  const totalCustomers = customers.length;
  const repeatCustomers = customers.filter(c => c.totalOrders > 1).length;
  const returnRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;
  
  const avgLtvNgn = totalCustomers > 0 
    ? Math.round(customers.reduce((sum, c) => sum + c.totalSpend, 0) / totalCustomers)
    : 0;

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Customers & LTV Reliability
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {totalCustomers} profiles
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customer lifetime value, delivery reliability scoring, and serial-cancellation blocking.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search customer name, phone, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 w-64"
        />
      </div>

      {/* 4 Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Customers</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">{totalCustomers}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Repeat Buyers</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{repeatCustomers}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Returning Customer Rate</p>
          <p className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{returnRate}%</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Avg Lifetime Value (LTV)</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(convertAmount(avgLtvNgn, currency), currency)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 font-medium">Customer Details</th>
                <th className="py-3 px-4 font-medium">Location</th>
                <th className="py-3 px-4 font-medium">Acquisition Source</th>
                <th className="py-3 px-4 font-medium text-center">Total Orders</th>
                <th className="py-3 px-4 font-medium text-center">Fulfilled</th>
                <th className="py-3 px-4 font-medium text-center">Reliability Score</th>
                <th className="py-3 px-4 font-medium text-right">Lifetime Spend</th>
                <th className="py-3 px-4 font-medium text-right">Fraud / Blacklist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{c.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {c.city}, {c.state}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{c.source}</td>
                  <td className="py-3 px-4 text-center font-mono font-medium text-white">{c.totalOrders}</td>
                  <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">{c.successfulOrders}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      c.reliabilityScore >= 80 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                      c.reliabilityScore >= 50 ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
                      'bg-red-950 text-red-400 border border-red-800/60'
                    }`}>
                      {c.reliabilityScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                    {formatCurrency(convertAmount(c.totalSpend, currency), currency)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleCustomerBlock(c.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                        c.isBlocked 
                          ? 'bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                      title={c.isBlocked ? "Customer is blocked from placing new orders" : "Block customer from ordering"}
                    >
                      {c.isBlocked ? 'Blocked 🚫' : 'Active'}
                    </button>
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

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, orders, products, currency } = useCrm();
  const [showAddModal, setShowAddModal] = useState(false);

  // New expense form
  const [expType, setExpType] = useState<Expense['type']>('Meta / TikTok Ads');
  const [expAmount, setExpAmount] = useState<number>(50000);
  const [expDesc, setExpDesc] = useState('');

  // Delivered revenue & COGS
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
  const grossRevenueNgn = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const totalCogsNgn = deliveredOrders.reduce((sum, o) => {
    return sum + o.items.reduce((iSum, item) => {
      const prod = products.find(p => p.id === item.productId);
      return iSum + (prod ? prod.unitCost * item.quantity : 4000);
    }, 0);
  }, 0);

  const totalExpensesNgn = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfitNgn = grossRevenueNgn - totalCogsNgn - totalExpensesNgn;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc || expAmount <= 0) return;

    addExpense({
      date: new Date().toISOString().split('T')[0],
      type: expType,
      amount: expAmount,
      currency: 'NGN',
      description: expDesc
    });

    setShowAddModal(false);
    setExpDesc('');
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Expenses & Profit Impact
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real profit engine: Gross Revenue − Cost of Goods (COGS) − Operating Expenses = True Net Profit.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Profit Impact Engine Report Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-400" /> Executive Profit Impact Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 space-y-1">
            <span className="text-[11px] text-slate-400 block font-mono">Gross Delivered Revenue</span>
            <p className="text-xl font-bold font-mono text-white tabular-nums">
              +{formatCurrency(convertAmount(grossRevenueNgn, currency), currency)}
            </p>
          </div>

          <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 space-y-1">
            <span className="text-[11px] text-slate-400 block font-mono">Cost of Goods (COGS)</span>
            <p className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              −{formatCurrency(convertAmount(totalCogsNgn, currency), currency)}
            </p>
          </div>

          <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 space-y-1">
            <span className="text-[11px] text-slate-400 block font-mono">Operating Expenses</span>
            <p className="text-xl font-bold font-mono text-red-400 tabular-nums">
              −{formatCurrency(convertAmount(totalExpensesNgn, currency), currency)}
            </p>
          </div>

          <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/60 p-3 space-y-1">
            <span className="text-[11px] text-emerald-400 block font-mono font-bold">Net Realized Profit</span>
            <p className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              ={formatCurrency(convertAmount(netProfitNgn, currency), currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 font-medium">Expense Date</th>
                <th className="py-3 px-4 font-medium">Category Type</th>
                <th className="py-3 px-4 font-medium">Description</th>
                <th className="py-3 px-4 font-medium">Reference Code</th>
                <th className="py-3 px-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">{formatDate(e.date)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-200">
                      {e.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{e.description}</td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{e.reference || '-'}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-red-400 tabular-nums">
                    −{formatCurrency(convertAmount(e.amount, currency), currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm">Record Business Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Expense Category</label>
                <select
                  value={expType}
                  onChange={(e) => setExpType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="Meta / TikTok Ads">Meta / TikTok Ads</option>
                  <option value="Agent Delivery Fees">Agent Delivery Fees</option>
                  <option value="Freight / Customs">Freight / Customs</option>
                  <option value="Product Manufacturing">Product Manufacturing</option>
                  <option value="Software & Tools">Software & Tools</option>
                  <option value="Office & Staff">Office & Staff</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Amount (₦ NGN)</label>
                <input
                  type="number"
                  min="1000"
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 font-mono text-white text-sm"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Description / Narration</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fuel allowance for Ikeja delivery dispatchers"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-1.5 rounded bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-emerald-600 font-semibold text-white">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
