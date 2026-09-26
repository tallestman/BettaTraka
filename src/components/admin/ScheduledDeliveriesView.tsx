import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount, formatDate } from '../../utils/formatters';
import { OrderDetailsModal } from './OrderDetailsModal';
import { Order } from '../../types/crm';
import { CalendarClock, MapPin, Eye, CheckCircle2 } from 'lucide-react';

export const ScheduledDeliveriesView: React.FC = () => {
  const { orders, currency, updateOrderStatus } = useCrm();
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'next_tomorrow'>('today');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Scheduled or confirmed orders
  const scheduledOrders = orders.filter(o => o.status === 'SCHEDULED' || o.status === 'CONFIRMED' || o.scheduledDate);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Scheduled Deliveries
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded">
              {scheduledOrders.length} booked
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Orders locked with customer-committed delivery dates for priority dispatch.
          </p>
        </div>

        {/* Day Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'today' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today (26 Sept)
          </button>
          <button
            onClick={() => setActiveTab('tomorrow')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'tomorrow' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tomorrow (27 Sept)
          </button>
          <button
            onClick={() => setActiveTab('next_tomorrow')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'next_tomorrow' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Next Tomorrow (28 Sept)
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 font-medium">Order #</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Products</th>
                <th className="py-3 px-4 font-medium">Delivery Zone</th>
                <th className="py-3 px-4 font-medium">Delivery Agent</th>
                <th className="py-3 px-4 font-medium">Sales Rep</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Total</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {scheduledOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No scheduled orders for this delivery window.
                  </td>
                </tr>
              ) : (
                scheduledOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-white">{o.orderNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-200">{o.customerName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{o.customerPhone}</p>
                    </td>
                    <td className="py-3 px-4">
                      {o.items.map((i, idx) => (
                        <p key={idx} className="text-slate-300">
                          {i.quantity}× {i.productName}
                        </p>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <p className="font-medium text-slate-200">{o.deliveryCity}</p>
                      <p className="text-[10px] text-slate-500">{o.deliveryState}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {o.agentName || <span className="text-amber-400 text-[11px]">Unassigned Agent</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{o.salesRepName || 'Me'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                      {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateOrderStatus(o.id, 'DISPATCHED')}
                          className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition"
                        >
                          Dispatch
                        </button>
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
