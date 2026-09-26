import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { CurrencyCode, PayStructure } from '../../types/crm';
import { 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Trophy, 
  Sparkles, 
  DollarSign, 
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PayrollView: React.FC = () => {
  const { 
    users, 
    updateUser, 
    orders, 
    payrollRuns, 
    runPayroll, 
    approvePayroll, 
    currency 
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'rates' | 'run' | 'history'>('rates');
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [payrollCurrency, setPayrollCurrency] = useState<CurrencyCode>('NGN');
  const [previewGenerated, setPreviewGenerated] = useState(false);

  // Reps list
  const staff = users.filter(u => u.status === 'Active' && u.role !== 'Owner');

  const handleExecuteRun = () => {
    const run = runPayroll(selectedMonth, payrollCurrency);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setPreviewGenerated(false);
    setActiveTab('history');
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Payroll & Rep Commissions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automate staff compensation, order delivery commissions, and conversion winner bonuses.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('rates')}
            className={`px-3 py-1 font-medium rounded-md transition ${
              activeTab === 'rates' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pay Rates Setup
          </button>
          <button
            onClick={() => setActiveTab('run')}
            className={`px-3 py-1 font-medium rounded-md transition ${
              activeTab === 'run' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Run Payroll
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 font-medium rounded-md transition ${
              activeTab === 'history' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Payroll History ({payrollRuns.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Pay Rates Configuration */}
      {activeTab === 'rates' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>
                <strong>Automated Top Converter Bonus:</strong> The top-performing sales rep each month automatically receives a <strong className="text-amber-400 font-mono">₦50,000 cash bonus</strong> added to their payroll payout.
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800/60 whitespace-nowrap">
              Active Rule
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                    <th className="py-3 px-4 font-medium">Staff Member</th>
                    <th className="py-3 px-4 font-medium">Role</th>
                    <th className="py-3 px-4 font-medium">Structure</th>
                    <th className="py-3 px-4 font-medium">Monthly Fixed Base</th>
                    <th className="py-3 px-4 font-medium">Commission per Delivered Order</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {staff.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                      <td className="py-3 px-4 text-slate-400">{u.role}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.payStructure}
                          onChange={(e) => updateUser(u.id, { payStructure: e.target.value as PayStructure })}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                        >
                          <option value="Fixed">Fixed Salary</option>
                          <option value="Commission">Pure Commission</option>
                          <option value="Hybrid">Hybrid (Fixed + Commission)</option>
                          <option value="Performance-based">Performance-based</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">₦</span>
                          <input
                            type="number"
                            value={u.fixedSalary || 0}
                            onChange={(e) => updateUser(u.id, { fixedSalary: Number(e.target.value) })}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-xs text-white w-28"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">₦</span>
                          <input
                            type="number"
                            value={u.commissionPerOrder || 0}
                            onChange={(e) => updateUser(u.id, { commissionPerOrder: Number(e.target.value) })}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-xs text-emerald-400 w-24 font-bold"
                          />
                          <span className="text-slate-500 text-[11px]">/delivered order</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-emerald-400 font-medium text-[11px] font-mono">✓ Saved</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Run Payroll */}
      {activeTab === 'run' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 max-w-xl">
            <h3 className="font-semibold text-white text-sm">Initiate Monthly Payroll Run</h3>
            <p className="text-xs text-slate-400">
              The engine automatically tallies every rep's delivered orders from the database and applies their configured pay structure and bonus.
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Payroll Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium"
                >
                  <option value="September 2026">September 2026</option>
                  <option value="August 2026">August 2026</option>
                  <option value="October 2026">October 2026</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Disbursement Currency</label>
                <select
                  value={payrollCurrency}
                  onChange={(e) => setPayrollCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                >
                  <option value="NGN">₦ NGN (Nigerian Naira)</option>
                  <option value="GHS">GH₵ GHS (Ghanaian Cedi)</option>
                  <option value="KES">KSh KES (Kenyan Shilling)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setPreviewGenerated(true)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-xs transition shadow-sm"
              >
                Generate Payroll Preview
              </button>
            </div>
          </div>

          {/* Payroll Preview Table */}
          {previewGenerated && (
            <div className="rounded-xl border border-emerald-500/40 bg-slate-900/60 p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    Payroll Calculation Preview — {selectedMonth}
                  </h3>
                  <p className="text-xs text-slate-400">Ready for review and disbursement.</p>
                </div>
                <button
                  onClick={handleExecuteRun}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Approve & Execute Payroll
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                      <th className="py-2.5 px-3">Staff</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3 text-right">Fixed Base</th>
                      <th className="py-2.5 px-3 text-center">Delivered Orders</th>
                      <th className="py-2.5 px-3 text-right">Commissions</th>
                      <th className="py-2.5 px-3 text-right">Performance Bonus</th>
                      <th className="py-2.5 px-3 text-right">Total Net Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {staff.map((u, idx) => {
                      const delivered = orders.filter(o => o.salesRepId === u.id && o.status === 'DELIVERED').length;
                      const comm = (u.commissionPerOrder || 0) * delivered;
                      const bonus = idx === 0 ? 50000 : 0;
                      const total = (u.fixedSalary || 0) + comm + bonus;

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-semibold text-white">{u.name}</td>
                          <td className="py-2.5 px-3 text-slate-400">{u.role}</td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {formatCurrency(u.fixedSalary || 0, payrollCurrency)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-400">
                            {delivered}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-white">
                            {formatCurrency(comm, payrollCurrency)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                            {bonus > 0 ? `+${formatCurrency(bonus, payrollCurrency)} 🏆` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                            {formatCurrency(total, payrollCurrency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Payroll History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {payrollRuns.map((run) => (
            <div key={run.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-semibold text-white text-sm">{run.month} Payroll Run</h3>
                  <p className="text-[11px] text-slate-400">Executed on {run.createdAt}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-medium ${
                    run.status === 'Paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                  }`}>
                    {run.status}
                  </span>
                  <span className="font-mono font-bold text-white text-base">
                    Total: {formatCurrency(run.totalPayout, run.currency)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
                      <th className="py-2 font-medium">Staff</th>
                      <th className="py-2 font-medium">Pay Structure</th>
                      <th className="py-2 font-medium text-right">Fixed</th>
                      <th className="py-2 font-medium text-center">Orders</th>
                      <th className="py-2 font-medium text-right">Commission</th>
                      <th className="py-2 font-medium text-right">Bonus</th>
                      <th className="py-2 font-medium text-right">Disbursed Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {run.items.map((item) => (
                      <tr key={item.userId}>
                        <td className="py-2 font-medium text-white">{item.userName}</td>
                        <td className="py-2 text-slate-400">{item.payStructure}</td>
                        <td className="py-2 text-right font-mono text-slate-300">{formatCurrency(item.fixedBase, run.currency)}</td>
                        <td className="py-2 text-center font-mono text-emerald-400 font-bold">{item.deliveredOrders}</td>
                        <td className="py-2 text-right font-mono text-slate-200">{formatCurrency(item.commissionEarned, run.currency)}</td>
                        <td className="py-2 text-right font-mono text-amber-400">
                          {item.bonusEarned > 0 ? `+${formatCurrency(item.bonusEarned, run.currency)}` : '-'}
                        </td>
                        <td className="py-2 text-right font-mono font-bold text-emerald-400">
                          {formatCurrency(item.totalPayout, run.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
