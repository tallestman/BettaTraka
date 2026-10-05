import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  RotateCcw, 
  Bot, 
  Coins, 
  FormInput, 
  Sliders, 
  Check, 
  Copy, 
  Play, 
  PhoneCall, 
  FlaskConical, 
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Link,
  ArrowUpRight,
  Tag,
  Package,
  Gift,
  ShoppingBag,
  Percent
} from 'lucide-react';

export { EmbedFormGeneratorView } from './EmbedFormGeneratorView';
export { AIAgentAndTokensView } from './TokensAndAIAgentView';

export const RoundRobinView: React.FC = () => {
  const { 
    roundRobin, 
    updateRoundRobinPool, 
    skipRoundRobinRep, 
    resetRoundRobinSequence, 
    updateSettings, 
    settings,
    users
  } = useCrm();

  const [poolType, setPoolType] = useState<'order' | 'cart'>('order');
  const salesRepUserIds = new Set(users.filter(u => u.role === 'Sales Representative').map(u => u.id));
  const pool = (poolType === 'order' ? roundRobin.orderPool : roundRobin.cartPool).filter(r => salesRepUserIds.has(r.repId));
  const nextIndex = poolType === 'order' ? roundRobin.nextRepIndexOrder : roundRobin.nextRepIndexCart;
  const nextRep = pool[nextIndex % Math.max(1, pool.length)];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Automated Round-Robin Rotation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fair weighted lead distribution strictly restricted to verified Sales Representatives.
          </p>
        </div>

        {/* Pool Selector */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setPoolType('order')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              poolType === 'order' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Order Inflow Pool
          </button>
          <button
            onClick={() => setPoolType('cart')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              poolType === 'cart' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Abandoned Cart Pool
          </button>
        </div>
      </div>

      {/* Next Up Banner */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold font-mono">
            {nextRep ? nextRep.repName.charAt(0) : '?'}
          </div>
          <div>
            <p className="text-xs text-emerald-400 font-mono font-medium">NEXT SALES REP IN LINE</p>
            <p className="text-base font-bold text-white">{nextRep ? nextRep.repName : 'No Active Sales Reps'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => skipRoundRobinRep(poolType)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Skip Turn</span>
          </button>
          <button
            onClick={() => resetRoundRobinSequence(poolType)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <span>Reset Cycle</span>
          </button>
        </div>
      </div>

      {/* Global Rules Settings */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white">Automated Routing Safeguards</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer">
            <div>
              <p className="font-medium text-white">Returning Customer Loyalty Routing</p>
              <p className="text-[11px] text-slate-400">Route repeat phone numbers to their previously assigned sales rep</p>
            </div>
            <input
              type="checkbox"
              checked={roundRobin.routeReturningCustomersToPreviousRep}
              onChange={(e) => updateSettings({ name: settings.name })}
              className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
            <div>
              <p className="font-medium text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strict Sales Reps Only Policy</span>
              </p>
              <p className="text-[11px] text-slate-400">Round Robin orders are strictly restricted to active Sales Representatives only</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              ENFORCED
            </span>
          </div>
        </div>
      </div>

      {/* Agent Roster Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white">
            {poolType === 'order' ? 'Orders Routing Pool Roster' : 'Abandoned Cart Pool Roster'}
          </h3>
          <span className="text-xs text-slate-400">{pool.filter(r => r.isIncluded && r.isAvailable).length} Active Reps</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3 px-4">Sales Representative</th>
                <th className="py-3 px-4">Weight Ratio</th>
                <th className="py-3 px-4">Assigned Count</th>
                <th className="py-3 px-4">Queue Availability</th>
                <th className="py-3 px-4 text-right">Pool Membership</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pool.map((rep, idx) => {
                const isNext = idx === (nextIndex % pool.length);
                return (
                  <tr key={rep.repId} className={`hover:bg-slate-800/30 transition-colors ${isNext ? 'bg-emerald-950/20' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{rep.repName}</span>
                        {isNext && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            NEXT
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={rep.weight}
                        onChange={(e) => updateRoundRobinPool(poolType, rep.repId, { weight: Number(e.target.value) })}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none"
                      >
                        <option value={1}>1x Normal</option>
                        <option value={2}>2x Double</option>
                        <option value={3}>3x Triple</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {rep.assignedOrderCount}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => updateRoundRobinPool(poolType, rep.repId, { isAvailable: !rep.isAvailable })}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border transition ${
                          rep.isAvailable 
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60' 
                            : 'bg-amber-950 text-amber-400 border-amber-800/60'
                        }`}
                      >
                        {rep.isAvailable ? 'Available on Duty' : 'Paused / On Break'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rep.isIncluded}
                          onChange={(e) => updateRoundRobinPool(poolType, rep.repId, { isIncluded: e.target.checked })}
                          className="accent-emerald-500 w-4 h-4 rounded"
                        />
                      </label>
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
