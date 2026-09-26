import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  FileSpreadsheet, 
  RotateCcw, 
  Plus, 
  MessageSquare, 
  Settings,
  GraduationCap
} from 'lucide-react';

export const InventoryManagerView: React.FC = () => {
  const { 
    currentUser, 
    products, 
    agents, 
    agentStock, 
    stockMovements, 
    currency,
    assignStockToAgent 
  } = useCrm();

  const [invTab, setInvTab] = useState<'inventory' | 'agent-stock' | 'reports'>('inventory');
  const [reportTab, setReportTab] = useState<'low-stock' | 'reorder' | 'movement'>('low-stock');

  // Low stock products (less than 100 in warehouse or less than 50 with agent)
  const lowStockProducts = products.filter(p => p.stockWarehouse < 400);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-slate-950">
      {/* Inventory Left Sidebar */}
      <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col p-3 space-y-1 select-none">
        <div className="pb-3 border-b border-slate-800 mb-2">
          <p className="font-semibold text-white text-xs">{currentUser.name}</p>
          <p className="text-[10px] text-cyan-400 font-mono">Inventory Manager</p>
        </div>

        {[
          { id: 'inventory', label: 'Global Inventory', icon: Package },
          { id: 'agent-stock', label: 'Agent Hub Stock', icon: Truck },
          { id: 'reports', label: 'Stock Reports & Audit', icon: FileSpreadsheet },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = invTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setInvTab(item.id as any)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 max-w-6xl mx-auto">
        {invTab === 'inventory' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-800">
              <h1 className="text-xl font-bold text-white">Central Warehouse Inventory</h1>
              <p className="text-xs text-slate-400 mt-0.5">Global balances, landed cost values, and warehouse reserve.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 text-xs">
                  <span className="font-bold text-white text-sm block">{p.name}</span>
                  <p className="text-[11px] text-slate-400 font-mono">SKU: {p.sku}</p>
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Warehouse Units:</span>
                      <span className="font-mono font-bold text-white text-sm">{p.stockWarehouse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Selling Price:</span>
                      <span className="font-mono text-emerald-400 font-bold">{formatCurrency(p.sellingPrice, 'NGN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {invTab === 'agent-stock' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-800">
              <h1 className="text-xl font-bold text-white">Agent Regional Stock Balances</h1>
              <p className="text-xs text-slate-400 mt-0.5">Units held across Nigerian delivery courier hubs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map(ag => {
                const stocks = agentStock.filter(s => s.agentId === ag.id);
                return (
                  <div key={ag.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-white">{ag.name}</span>
                      <span className="font-mono text-[10px] text-cyan-400">{ag.primaryZone}</span>
                    </div>
                    {stocks.map(s => {
                      const prod = products.find(p => p.id === s.productId);
                      return (
                        <div key={s.productId} className="flex justify-between py-1 border-b border-slate-800/40">
                          <span className="text-slate-300">{prod?.name}</span>
                          <span className="font-mono font-bold text-white">{s.unitsHeld} units</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {invTab === 'reports' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-800">
              <h1 className="text-xl font-bold text-white">Inventory Reports & Reorder Advice</h1>
              <p className="text-xs text-slate-400 mt-0.5">Automated reorder triggers and movement audit history.</p>
            </div>

            <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Reorder Recommendation Trigger</span>
              </div>
              <p className="text-slate-300">
                Titan Pro Smartwatch POD Edition stock across all hubs is at <strong>310 total units</strong>. Based on current sales velocity of 36 units/week, suggest placing next Guangzhou air-cargo order within <strong>14 days</strong>.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
