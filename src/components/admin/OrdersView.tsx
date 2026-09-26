import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Order, OrderStatus } from '../../types/crm';
import { formatCurrency, convertAmount, createWhatsAppLink, formatDate } from '../../utils/formatters';
import { OrderDetailsModal } from './OrderDetailsModal';
import { CreateOrderModal } from './CreateOrderModal';
import { 
  Plus, 
  Download, 
  Trash2, 
  MessageSquare, 
  Sliders, 
  Search, 
  Filter, 
  RotateCcw, 
  Copy, 
  Eye, 
  ChevronDown,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { 
    orders, 
    deleteOrder, 
    deletedOrders, 
    restoreOrder, 
    currency, 
    products, 
    users,
    updateOrderStatus 
  } = useCrm();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [repFilter, setRepFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Stats calculation
  const totalOrdersCount = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
  const deliveryRate = totalOrdersCount > 0 
    ? Math.round((deliveredOrders.length / totalOrdersCount) * 100) 
    : 0;
  const totalRevenueNgn = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Top states by order breakdown
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      counts[o.deliveryState] = (counts[o.deliveryState] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  // Product counts
  const productCounts = useMemo(() => {
    const counts: Record<string, { orders: number; units: number }> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        if (!counts[item.productName]) counts[item.productName] = { orders: 0, units: 0 };
        counts[item.productName].orders += 1;
        counts[item.productName].units += item.quantity;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1].units - a[1].units);
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerPhone.includes(searchQuery) ||
        o.deliveryCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.deliveryState.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSource = sourceFilter === 'ALL' || o.source === sourceFilter;
      const matchesLocation = locationFilter === 'ALL' || o.deliveryState === locationFilter;
      const matchesRep = repFilter === 'ALL' || o.salesRepId === repFilter;
      const matchesProduct = productFilter === 'ALL' || o.items.some(i => i.productId === productFilter);
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

      return matchesSearch && matchesSource && matchesLocation && matchesRep && matchesProduct && matchesStatus;
    });
  }, [orders, searchQuery, sourceFilter, locationFilter, repFilter, productFilter, statusFilter]);

  const copyOrder = (order: Order) => {
    const text = `Order #${order.orderNumber}: ${order.customerName} (${order.customerPhone}), Total: ${order.currency} ${order.totalAmount}, Status: ${order.status}`;
    navigator.clipboard.writeText(text);
    alert(`Copied ${order.orderNumber} summary to clipboard!`);
  };

  const exportCSV = () => {
    const rows = [
      ['Order Number', 'Customer Name', 'Phone', 'State', 'City', 'Total Amount', 'Currency', 'Status', 'Sales Rep', 'Date'],
      ...filteredOrders.map(o => [
        o.orderNumber,
        o.customerName,
        o.customerPhone,
        o.deliveryState,
        o.deliveryCity,
        o.totalAmount,
        o.currency,
        o.status,
        o.salesRepName || 'Unassigned',
        o.createdAt
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BettaTraka_Orders_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueStates = Array.from(new Set(orders.map(o => o.deliveryState)));

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Orders Pipeline
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {orders.length} total
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch queue, sales rep response times, and payment-on-delivery tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Order</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowRecycleBin(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-xs text-slate-400 hover:text-red-400 transition"
            title="Recycle bin for deleted orders"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deletedOrders.length > 0 && (
              <span className="font-mono text-[10px] bg-red-950 text-red-400 px-1 rounded">
                {deletedOrders.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3 Core Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Handled</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">{totalOrdersCount} orders</p>
          <p className="text-[11px] text-slate-500">Across all media sources & reps</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Delivery Rate</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{deliveryRate}%</p>
          <p className="text-[11px] text-slate-500">{deliveredOrders.length} delivered successfully</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Delivered Revenue</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(convertAmount(totalRevenueNgn, currency), currency)}
          </p>
          <p className="text-[11px] text-slate-500">Net cash collected at doorsteps</p>
        </div>
      </div>

      {/* Top States & Orders By Product side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top States */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Top Delivery States
            </h3>
            <span className="text-[10px] font-mono text-slate-400">36 States + FCT</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {stateCounts.slice(0, 6).map(([st, cnt]) => (
              <div key={st} className="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-300 truncate max-w-[90px]">{st}</span>
                <span className="font-mono font-bold text-emerald-400">{cnt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Product */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <h3 className="text-xs font-semibold text-white">Orders & Units by Product</h3>
          <div className="space-y-2">
            {productCounts.map(([name, data]) => (
              <div key={name} className="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-200 truncate pr-2">{name}</span>
                <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
                  <span className="text-slate-400">{data.orders} orders</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">{data.units} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by order #, customer name, phone, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Select Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="DISPATCHED">DISPATCHED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="NOT_REACHABLE">NOT_REACHABLE</option>
              <option value="NOT_PICKING_CALLS">NOT_PICKING_CALLS</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs"
            >
              <option value="ALL">All Sources</option>
              <option value="Order Form">Order Form</option>
              <option value="WooCommerce">WooCommerce</option>
              <option value="Manual Rep">Manual Rep</option>
              <option value="Abandoned Cart Recovery">Abandoned Cart Recovery</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs max-w-[130px]"
            >
              <option value="ALL">All States</option>
              {uniqueStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs"
            >
              <option value="ALL">All Reps</option>
              {users.filter(u => u.role === 'Sales Representative').map(rep => (
                <option key={rep.id} value={rep.id}>{rep.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Customer Details</th>
                <th className="py-3 px-4 font-medium">Origin Source</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Response Time</th>
                <th className="py-3 px-4 font-medium">Assigned Rep</th>
                <th className="py-3 px-4 font-medium">Delivery Destination</th>
                <th className="py-3 px-4 font-medium text-right">Amount</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const waMsg = `Hello ${o.customerName}, calling from BettaTraka regarding order #${o.orderNumber}. We are preparing delivery to ${o.deliveryCity}.`;
                  return (
                    <tr key={o.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3 px-4 font-mono font-medium text-white">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="hover:text-emerald-400 text-left transition underline decoration-slate-700 underline-offset-2"
                        >
                          {o.orderNumber}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-200">{o.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{o.customerPhone}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-slate-400">{o.source}</span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border cursor-pointer focus:outline-none ${
                            o.status === 'DELIVERED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60' :
                            o.status === 'DISPATCHED' ? 'bg-blue-950 text-blue-400 border-blue-800/60' :
                            o.status === 'CONFIRMED' ? 'bg-cyan-950 text-cyan-400 border-cyan-800/60' :
                            o.status === 'NEW' ? 'bg-amber-950 text-amber-400 border-amber-800/60' :
                            'bg-red-950 text-red-400 border-red-800/60'
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="DISPATCHED">DISPATCHED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="SCHEDULED">SCHEDULED</option>
                          <option value="NOT_PICKING_CALLS">NOT_PICKING</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-400 font-mono text-[11px]">
                          {o.responseTimeMinutes ? `${o.responseTimeMinutes}m` : 'Just now'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {o.salesRepName || <span className="text-slate-500 italic">Unassigned</span>}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <p className="font-medium text-slate-200">{o.deliveryCity}</p>
                        <p className="text-[10px] text-slate-500">{o.deliveryState}</p>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                        {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Action */}
                          <a
                            href={createWhatsAppLink(o.customerPhone, waMsg)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 transition"
                            title="Chat customer on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {/* Details Modal */}
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="View Full Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Copy */}
                          <button
                            onClick={() => copyOrder(o)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Copy Order Summary"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Order */}
                          <button
                            onClick={() => deleteOrder(o.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                            title="Move to Recycle Bin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateOrderModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Recycle Bin Modal */}
      {showRecycleBin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" /> Deleted Orders (Recycle Bin)
              </h3>
              <button onClick={() => setShowRecycleBin(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            
            <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto mt-3">
              {deletedOrders.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500">Recycle bin is empty.</p>
              ) : (
                deletedOrders.map(d => (
                  <div key={d.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-mono font-semibold text-white">{d.orderNumber} - {d.customerName}</p>
                      <p className="text-[11px] text-slate-400">{d.currency} {d.totalAmount} · {d.deliveryState}</p>
                    </div>
                    <button
                      onClick={() => restoreOrder(d.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium text-xs transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
