import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { DeliveryAgent, Product } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  Navigation, 
  Plus, 
  RotateCcw, 
  ArrowRightLeft, 
  AlertTriangle, 
  Truck, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  X,
  FileSpreadsheet
} from 'lucide-react';

export const DeliveryAgentsView: React.FC = () => {
  const { 
    agents, 
    agentStock, 
    products, 
    orders, 
    currency, 
    assignStockToAgent,
    transferStockAgentToAgent,
    reconcileAgentStock 
  } = useCrm();

  const [selectedAgent, setSelectedAgent] = useState<DeliveryAgent | null>(null);
  const [showReconcileModal, setShowReconcileModal] = useState<DeliveryAgent | null>(null);
  const [showTransferModal, setShowTransferModal] = useState<DeliveryAgent | null>(null);

  // Reconciliation state
  const [reconcileProductId, setReconcileProductId] = useState<string>(products[0]?.id || '');
  const [defectiveInput, setDefectiveInput] = useState<number>(0);
  const [missingInput, setMissingInput] = useState<number>(0);

  // Transfer state
  const [toAgentId, setToAgentId] = useState<string>('');
  const [transferProductId, setTransferProductId] = useState<string>(products[0]?.id || '');
  const [transferUnits, setTransferUnits] = useState<number>(10);

  // Stats
  const totalAgents = agents.length;
  const onDutyCount = agents.filter(a => a.status !== 'Off Duty').length;
  
  const totalStockWithAgentsNgn = agentStock.reduce((sum, s) => {
    const prod = products.find(p => p.id === s.productId);
    return sum + (s.unitsHeld * (prod?.unitCost || 4000));
  }, 0);

  const pendingDeliveriesCount = orders.filter(o => o.status === 'DISPATCHED' || o.status === 'CONFIRMED').length;

  const totalDefectiveValueNgn = agentStock.reduce((sum, s) => {
    const prod = products.find(p => p.id === s.productId);
    return sum + (s.defectiveUnits * (prod?.sellingPrice || 24500));
  }, 0);

  const totalMissingValueNgn = agentStock.reduce((sum, s) => {
    const prod = products.find(p => p.id === s.productId);
    return sum + (s.missingUnits * (prod?.sellingPrice || 24500));
  }, 0);

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReconcileModal) return;
    reconcileAgentStock(showReconcileModal.id, reconcileProductId, defectiveInput, missingInput);
    setShowReconcileModal(null);
    setDefectiveInput(0);
    setMissingInput(0);
    alert("Agent inventory reconciled! Defective and missing audit updated.");
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTransferModal || !toAgentId || transferUnits <= 0) return;
    transferStockAgentToAgent(showTransferModal.id, toAgentId, transferProductId, transferUnits);
    setShowTransferModal(null);
    alert(`Transferred ${transferUnits} units from ${showTransferModal.name} to target hub!`);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Delivery Agents & Regional Hubs
          <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
            {totalAgents} agents registered
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cash-on-delivery riders, inventory holding limits, stock reconciliation, and inter-hub transfers.
        </p>
      </div>

      {/* 6 Stats in a compact grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
          <p className="text-[11px] text-slate-400">Total Agents</p>
          <p className="text-xl font-bold font-mono text-white tabular-nums">{totalAgents}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
          <p className="text-[11px] text-slate-400">Active On Duty</p>
          <p className="text-xl font-bold font-mono text-emerald-400 tabular-nums">{onDutyCount}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
          <p className="text-[11px] text-slate-400">Stock With Agents</p>
          <p className="text-xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(convertAmount(totalStockWithAgentsNgn, currency), currency)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
          <p className="text-[11px] text-slate-400">Pending Deliveries</p>
          <p className="text-xl font-bold font-mono text-cyan-400 tabular-nums">{pendingDeliveriesCount}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
          <p className="text-[11px] text-slate-400">Defective Stock</p>
          <p className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            {formatCurrency(convertAmount(totalDefectiveValueNgn, currency), currency)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
          <p className="text-[11px] text-slate-400">Missing Stock</p>
          <p className="text-xl font-bold font-mono text-red-400 tabular-nums">
            {formatCurrency(convertAmount(totalMissingValueNgn, currency), currency)}
          </p>
        </div>
      </div>

      {/* Agents Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 font-medium">Agent Details</th>
                <th className="py-3 px-4 font-medium">Primary Zone</th>
                <th className="py-3 px-4 font-medium">Duty Status</th>
                <th className="py-3 px-4 font-medium text-center">Success Rate</th>
                <th className="py-3 px-4 font-medium text-center">Stock Held</th>
                <th className="py-3 px-4 font-medium text-center">Stock Issues</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {agents.map((ag) => {
                const stocks = agentStock.filter(s => s.agentId === ag.id);
                const totalUnitsHeld = stocks.reduce((sum, s) => sum + s.unitsHeld, 0);
                const defectiveCount = stocks.reduce((sum, s) => sum + s.defectiveUnits, 0);
                const missingCount = stocks.reduce((sum, s) => sum + s.missingUnits, 0);

                return (
                  <tr key={ag.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{ag.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{ag.phone}</p>
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-medium">{ag.primaryZone}</td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        ag.status === 'Active on Duty' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                        ag.status === 'Order in Progress' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {ag.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                      {ag.successRate}%
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-white font-semibold">
                      {totalUnitsHeld} / {ag.capacityLimit} units
                    </td>

                    <td className="py-3 px-4 text-center">
                      {defectiveCount === 0 && missingCount === 0 ? (
                        <span className="text-emerald-400 text-[11px] font-mono">Clean</span>
                      ) : (
                        <span className="text-amber-400 text-[11px] font-mono">
                          {defectiveCount > 0 ? `${defectiveCount} def.` : ''} {missingCount > 0 ? `${missingCount} miss.` : ''}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setShowReconcileModal(ag)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium"
                          title="Reconcile defective or missing stock"
                        >
                          Reconcile
                        </button>
                        <button
                          onClick={() => {
                            setShowTransferModal(ag);
                            const other = agents.find(a => a.id !== ag.id);
                            if (other) setToAgentId(other.id);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                          title="Transfer units to another agent hub"
                        >
                          Transfer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconcile Modal */}
      {showReconcileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm">Reconcile Stock: {showReconcileModal.name}</h3>
              <button onClick={() => setShowReconcileModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReconcileSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Product</label>
                <select
                  value={reconcileProductId}
                  onChange={(e) => setReconcileProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Defective Units to Add</label>
                  <input
                    type="number"
                    min="0"
                    value={defectiveInput}
                    onChange={(e) => setDefectiveInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Missing Units to Add</label>
                  <input
                    type="number"
                    min="0"
                    value={missingInput}
                    onChange={(e) => setMissingInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 font-mono text-white"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Note: Flagged defective or missing units are deducted from the agent's available delivery balance and moved to the reconciliation audit ledger.
              </p>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setShowReconcileModal(null)} className="px-4 py-1.5 rounded bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 font-semibold text-white">
                  Update Reconciliation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agent-to-Agent Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm">Transfer Stock Between Agents</h3>
              <button onClick={() => setShowTransferModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">From Agent:</span>
                <p className="font-semibold text-white">{showTransferModal.name} ({showTransferModal.primaryZone})</p>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">To Destination Agent</label>
                <select
                  value={toAgentId}
                  onChange={(e) => setToAgentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                >
                  {agents.filter(a => a.id !== showTransferModal.id).map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.primaryZone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Product</label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Units to Transfer</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={transferUnits}
                  onChange={(e) => setTransferUnits(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 font-mono text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setShowTransferModal(null)} className="px-4 py-1.5 rounded bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-semibold text-white">
                  Execute Waybill Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
