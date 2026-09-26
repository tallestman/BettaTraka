import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount, formatDate } from '../../utils/formatters';
import { OrderDetailsModal } from './OrderDetailsModal';
import { Order } from '../../types/crm';
import { Truck, CheckCircle2, Clock, Calendar, Eye } from 'lucide-react';

export const DeliveriesView: React.FC = () => {
  const { orders, currency } = useCrm();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
  const totalDeliveredRevenueNgn = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  const avgFulfillmentDays = deliveredOrders.length > 0 
    ? (deliveredOrders.reduce((sum, o) => sum + (o.fulfillmentDays || 1), 0) / deliveredOrders.length).toFixed(1)
    : '1.2';

  const avgPerDay = deliveredOrders.length > 0 
    ? Math.round(deliveredOrders.length / 7) 
    : 0;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Fulfilled Deliveries
          <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
            {deliveredOrders.length} fulfilled
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Orders successfully delivered and collected in the selected period, anchored to doorstep delivery date.
        </p>
      </div>

      {/* 4 Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Delivered</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {deliveredOrders.length} orders
          </p>
          <p className="text-[11px] text-slate-500">100% cash-on-delivery collected</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Revenue</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(convertAmount(totalDeliveredRevenueNgn, currency), currency)}
          </p>
          <p className="text-[11px] text-slate-500">Gross revenue secured</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Avg Fulfillment Time</p>
          <p className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {avgFulfillmentDays} days
          </p>
          <p className="text-[11px] text-slate-500">From order placement to doorstep</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Avg Per Day</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">
            ~{Math.max(1, avgPerDay)} orders/day
          </p>
          <p className="text-[11px] text-slate-500">Daily delivery velocity</p>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 font-medium">Order #</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Products</th>
                <th className="py-3 px-4 font-medium">Delivery Destination</th>
                <th className="py-3 px-4 font-medium">Delivery Agent</th>
                <th className="py-3 px-4 font-medium">Sales Rep</th>
                <th className="py-3 px-4 font-medium">Delivered Date</th>
                <th className="py-3 px-4 font-medium">Fulfillment Speed</th>
                <th className="py-3 px-4 font-medium text-right">Revenue</th>
                <th className="py-3 px-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deliveredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No delivered orders yet.
                  </td>
                </tr>
              ) : (
                deliveredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-white">{o.orderNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-200">{o.customerName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{o.customerPhone}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {o.items.map((i, idx) => (
                        <p key={idx}>{i.quantity}× {i.productName}</p>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <p className="font-medium text-slate-200">{o.deliveryCity}</p>
                      <p className="text-[10px] text-slate-500">{o.deliveryState}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {o.agentName || 'Agent'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{o.salesRepName || 'Me'}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {o.deliveredDate ? formatDate(o.deliveredDate) : '24 Sept 2026'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded text-[11px]">
                        {o.fulfillmentDays || 1} day(s)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                      {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
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
