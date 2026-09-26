import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { User, SalesTeam } from '../../types/crm';
import { 
  Trophy, 
  Users, 
  Building2, 
  Award, 
  TrendingUp, 
  Phone, 
  Mail, 
  CheckCircle2, 
  PauseCircle, 
  Plus,
  ShieldCheck
} from 'lucide-react';

export const SalesRepsView: React.FC = () => {
  const { users, orders, currency, updateUser } = useCrm();

  const reps = users.filter(u => u.role === 'Sales Representative');
  
  // Calculate performance per rep
  const repStats = reps.map(rep => {
    const assignedOrders = orders.filter(o => o.salesRepId === rep.id);
    const deliveredOrders = assignedOrders.filter(o => o.status === 'DELIVERED');
    const revenueNgn = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const conversion = assignedOrders.length > 0 
      ? Math.round((deliveredOrders.length / assignedOrders.length) * 100) 
      : 0;

    return {
      rep,
      totalOrders: assignedOrders.length,
      deliveredOrders: deliveredOrders.length,
      conversion,
      revenueNgn
    };
  }).sort((a, b) => b.conversion - a.conversion);

  const avgConversion = repStats.length > 0 
    ? Math.round(repStats.reduce((sum, r) => sum + r.conversion, 0) / repStats.length) 
    : 0;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Sales Representatives & Leaderboard
          <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
            {reps.length} reps active
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor rep conversion rates, delivery confirmations, and commission leaderboards.
        </p>
      </div>

      {/* 4 Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Reps</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">{reps.length}</p>
          <p className="text-[11px] text-slate-500">In rotation sequence</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Active Reps</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {reps.filter(r => r.status === 'Active').length}
          </p>
          <p className="text-[11px] text-slate-500">Handling orders today</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Handled</p>
          <p className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {repStats.reduce((sum, r) => sum + r.totalOrders, 0)} orders
          </p>
          <p className="text-[11px] text-slate-500">Assigned across reps</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Avg Rep Conversion</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{avgConversion}%</p>
          <p className="text-[11px] text-slate-500">Order to doorstep collection</p>
        </div>
      </div>

      {/* Performance Leaderboard */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Monthly Rep Conversion Leaderboard</h2>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">
            🏆 ₦50,000 Top Performer Bonus Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {repStats.slice(0, 4).map((r, idx) => (
            <div 
              key={r.rep.id} 
              className={`p-4 rounded-xl border relative overflow-hidden ${
                idx === 0 
                  ? 'border-amber-500/50 bg-amber-950/20 shadow-lg shadow-amber-950/30' 
                  : 'border-slate-800 bg-slate-950/60'
              }`}
            >
              {idx === 0 && (
                <span className="absolute top-2 right-2 text-xs font-mono font-bold text-amber-400 bg-amber-950 border border-amber-800/80 px-2 py-0.5 rounded">
                  🥇 1st Place
                </span>
              )}
              {idx === 1 && (
                <span className="absolute top-2 right-2 text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                  🥈 2nd
                </span>
              )}
              {idx === 2 && (
                <span className="absolute top-2 right-2 text-xs font-mono font-bold text-amber-700 bg-slate-800 px-2 py-0.5 rounded">
                  🥉 3rd
                </span>
              )}

              <p className="font-semibold text-white text-sm">{r.rep.name}</p>
              <p className="text-[11px] text-slate-400">{r.rep.email}</p>

              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Conversion Rate:</span>
                  <span className="font-mono font-bold text-emerald-400">{r.conversion}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivered Orders:</span>
                  <span className="font-mono font-medium text-white">{r.deliveredOrders} / {r.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Revenue Generated:</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(convertAmount(r.revenueNgn, currency), currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reps Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 font-medium">Sales Rep Details</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Pay Structure</th>
                <th className="py-3 px-4 font-medium text-center">Total Orders</th>
                <th className="py-3 px-4 font-medium text-center">Delivered</th>
                <th className="py-3 px-4 font-medium text-center">Conversion %</th>
                <th className="py-3 px-4 font-medium text-right">Revenue Generated</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {repStats.map(({ rep, totalOrders, deliveredOrders, conversion, revenueNgn }) => (
                <tr key={rep.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{rep.name}</p>
                    <p className="text-[11px] text-slate-400">{rep.email} · {rep.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => updateUser(rep.id, { status: rep.status === 'Active' ? 'Paused' : 'Active' })}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        rep.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      }`}
                      title="Click to toggle status"
                    >
                      {rep.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                    {rep.payStructure} ({rep.commissionPerOrder ? `₦${rep.commissionPerOrder}/order` : 'Fixed'})
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-white font-medium">{totalOrders}</td>
                  <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">{deliveredOrders}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-white">{conversion}%</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                    {formatCurrency(convertAmount(revenueNgn, currency), currency)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Viewing detailed call logs & follow-ups for ${rep.name}`)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      Audit
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

export const SalesTeamsView: React.FC = () => {
  const { salesTeams, users, products, mediaBuyers, addSalesTeam } = useCrm();
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [leadId, setLeadId] = useState(users[1]?.id || '');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) return;
    const lead = users.find(u => u.id === leadId);
    addSalesTeam({
      name: teamName,
      teamLeadId: leadId,
      teamLeadName: lead?.name || 'Lead',
      repIds: [leadId],
      productLinks: ['prod-1', 'prod-2'],
      mediaBuyerLinks: []
    });
    setShowAddTeam(false);
    setTeamName('');
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Sales Teams & Territorial Units
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Group sales reps into regional squads, assign team leads, and route products and media buyer traffic.
          </p>
        </div>

        <button
          onClick={() => setShowAddTeam(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Sales Team</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salesTeams.map((team) => {
          const lead = users.find(u => u.id === team.teamLeadId);
          const repsInTeam = users.filter(u => team.repIds.includes(u.id));

          return (
            <div key={team.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-white text-sm">{team.name}</h3>
                </div>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {team.repIds.length} Reps
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Assigned Team Lead:</span>
                  <p className="font-semibold text-white mt-0.5">{team.teamLeadName}</p>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Eligible Products:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {team.productLinks.map(pId => {
                      const prod = products.find(p => p.id === pId);
                      return (
                        <span key={pId} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                          {prod?.name.split(' ')[0] || 'Product'}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Linked Media Buyers:</span>
                  <p className="text-slate-300 mt-0.5">
                    {team.mediaBuyerLinks.length > 0 ? `${team.mediaBuyerLinks.length} media buyer(s) routed` : 'Default unassigned routing'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-emerald-400 text-[11px] font-mono">Territory Active</span>
                <button
                  onClick={() => alert(`Managing product links & assignments for ${team.name}`)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                >
                  Configure Links
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100">
            <h3 className="font-semibold text-white text-sm mb-3">Create New Sales Team</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eastern Tigers Unit"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Team Lead</label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                >
                  {users.filter(u => u.role === 'Sales Representative' || u.role === 'Team Lead').map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddTeam(false)} className="px-4 py-1.5 rounded bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-emerald-600 font-semibold text-white">
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
