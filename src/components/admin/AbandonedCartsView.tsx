import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { CartStatus, AbandonedCart, Order } from '../../types/crm';
import { ScheduleDeliveryModal } from '../common/ScheduleDeliveryModal';
import { formatCurrency, convertAmount, createWhatsAppLink } from '../../utils/formatters';
import { 
  PhoneCall, 
  MessageSquare, 
  ShoppingCart, 
  UserCheck, 
  Clock, 
  MapPin, 
  RotateCw,
  CheckCircle2,
  XCircle,
  Filter,
  Calendar
} from 'lucide-react';

export const AbandonedCartsView: React.FC = () => {
  const { 
    abandonedCarts, 
    updateCartStatus, 
    reassignCartRep, 
    convertCartToOrder, 
    users, 
    currency,
    addNotification
  } = useCrm();

  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [orderToSchedule, setOrderToSchedule] = useState<Order | null>(null);

  const openCount = abandonedCarts.filter(c => c.status === 'ABANDONED' || c.status === 'ASSIGNED').length;
  const contactedCount = abandonedCarts.filter(c => c.status === 'CONTACTED').length;
  const convertedCount = abandonedCarts.filter(c => c.status === 'CONVERTED').length;
  const lostCount = abandonedCarts.filter(c => c.status === 'NOT INTERESTED' || c.status === 'LOST').length;

  const conversionRate = (convertedCount + lostCount) > 0 
    ? Math.round((convertedCount / (convertedCount + lostCount)) * 100) 
    : 40;

  const filteredCarts = abandonedCarts.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    return true;
  });

  const handlePlaceOrder = (cartId: string) => {
    const newOrder = convertCartToOrder(cartId);
    if (newOrder) {
      if (addNotification) {
        addNotification({
          title: 'Cart Converted to Order',
          message: `Order #${newOrder.orderNumber} created for ${newOrder.customerName}. Please set the delivery date.`,
          type: 'success'
        });
      }
      setOrderToSchedule(newOrder);
    }
  };

  const salesReps = users.filter(u => u.role === 'Sales Representative' || u.role === 'Owner');

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Abandoned Carts Recovery
            <span className="text-xs font-mono font-normal text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded">
              {openCount} needs attention
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track inactive form leads, monitor sales rep follow-up, and recover high-intent shoppers.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          {(['all', 'today', 'week', 'month'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeFilter(t)}
              className={`px-3 py-1 font-medium rounded-md transition-colors capitalize ${
                timeFilter === t ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'all' ? 'All Time' : t === 'today' ? 'Today' : t === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Open Carts</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">{openCount}</p>
          <p className="text-[11px] text-slate-500">Uncontacted form drop-offs</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Rep Assigned</p>
          <p className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {abandonedCarts.filter(c => c.assignedRepId).length}
          </p>
          <p className="text-[11px] text-slate-500">In rep follow-up sequence</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Contacted</p>
          <p className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{contactedCount}</p>
          <p className="text-[11px] text-slate-500">Call / WhatsApp sent</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Conversion Rate</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{conversionRate}%</p>
          <p className="text-[11px] text-slate-500">{convertedCount} converted to orders</p>
        </div>
      </div>

      {/* Filter by Cart Status */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 text-xs flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Status:
        </span>
        {['ALL', 'ABANDONED', 'ASSIGNED', 'CONTACTED', 'NO RESPONSE', 'CONVERTED', 'LOST'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-lg font-mono text-xs transition whitespace-nowrap ${
              statusFilter === st
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCarts.map((cart) => {
          const waMessage = `Hello ${cart.customerName}, noticed you were ordering the ${cart.productName} on our store. Do you have any questions or would you like me to reserve your package for cash-on-delivery?`;
          return (
            <div 
              key={cart.id} 
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-mono text-xs font-bold text-white">{cart.cartNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    cart.status === 'CONVERTED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                    cart.status === 'CONTACTED' ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
                    cart.status === 'ASSIGNED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {cart.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <p className="text-sm font-semibold text-white">{cart.customerName}</p>
                  <p className="font-mono text-slate-400 text-xs">{cart.customerPhone || 'Phone uncompleted'}</p>
                  
                  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/60 my-2 space-y-1">
                    <p className="font-medium text-slate-200">{cart.productName}</p>
                    <p className="text-[11px] text-slate-400">{cart.packageName || '1 Unit'}</p>
                    <p className="font-mono text-xs font-bold text-emerald-400">
                      {formatCurrency(convertAmount(cart.amount, currency), currency)}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{cart.deliveryCity || 'City Unknown'}, {cart.deliveryState}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Activity: {cart.lastActivity}</span>
                    </div>
                  </div>

                  {cart.notes && (
                    <p className="p-2 rounded bg-slate-800/40 text-[11px] text-slate-300 italic border-l-2 border-amber-500">
                      "{cart.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Assignment & Action Buttons */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Assigned Rep:</span>
                  <select
                    value={cart.assignedRepId || ''}
                    onChange={(e) => reassignCartRep(cart.id, e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {salesReps.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={createWhatsAppLink(cart.customerPhone, waMessage)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-medium text-xs transition border border-emerald-500/30"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {cart.status !== 'CONVERTED' ? (
                    <button
                      onClick={() => handlePlaceOrder(cart.id)}
                      className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Place Order</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-center text-xs text-emerald-400 font-mono font-medium">
                      ✓ Order Placed
                    </div>
                  )}
                </div>

                {cart.status !== 'CONVERTED' && (
                  <div className="flex items-center gap-1 justify-between pt-1">
                    <button
                      onClick={() => updateCartStatus(cart.id, 'CONTACTED')}
                      className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                    >
                      Mark Contacted
                    </button>
                    <button
                      onClick={() => updateCartStatus(cart.id, 'LOST')}
                      className="text-[10px] text-red-400 hover:text-red-300 px-2 py-0.5 rounded bg-slate-800"
                    >
                      Mark Lost
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {orderToSchedule && (
        <ScheduleDeliveryModal
          order={orderToSchedule}
          onClose={() => setOrderToSchedule(null)}
        />
      )}
    </div>
  );
};
