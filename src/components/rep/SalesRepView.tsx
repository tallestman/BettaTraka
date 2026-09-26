import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount, createWhatsAppLink } from '../../utils/formatters';
import { OrderDetailsModal } from '../admin/OrderDetailsModal';
import { CreateOrderModal } from '../admin/CreateOrderModal';
import { Order, OrderStatus } from '../../types/crm';
import { 
  Trophy, 
  ShoppingCart, 
  PhoneCall, 
  CalendarClock, 
  Users, 
  MessageSquare, 
  Bell, 
  Settings, 
  GraduationCap, 
  Package, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Plus,
  Eye,
  ArrowRight
} from 'lucide-react';

export const SalesRepView: React.FC = () => {
  const { 
    currentUser, 
    orders, 
    abandonedCarts, 
    products, 
    agents, 
    agentStock, 
    currency, 
    updateOrderStatus,
    users,
    chatMessages,
    sendChatMessage
  } = useCrm();

  const [repTab, setRepTab] = useState<string>('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetExtraDeliveries, setTargetExtraDeliveries] = useState<number>(10);
  const [chatInput, setChatInput] = useState('');

  // Rep-specific assigned data
  const myOrders = orders.filter(o => o.salesRepId === currentUser.id);
  const myDeliveredOrders = myOrders.filter(o => o.status === 'DELIVERED');
  const myPendingOrders = myOrders.filter(o => o.status === 'NEW' || o.status === 'CONFIRMED' || o.status === 'NOT_PICKING_CALLS');
  const myRevenueNgn = myDeliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const myConversion = myOrders.length > 0 ? Math.round((myDeliveredOrders.length / myOrders.length) * 100) : 0;

  const myCarts = abandonedCarts.filter(c => c.assignedRepId === currentUser.id);

  // Commission calculation
  const commissionRate = currentUser.commissionPerOrder || 1500;
  const estimatedCommissionsNgn = myDeliveredOrders.length * commissionRate;
  const fixedSalary = currentUser.fixedSalary || 0;
  const estimatedTotalEarningsNgn = fixedSalary + estimatedCommissionsNgn;

  // Simulator
  const simulatedExtraCommissionNgn = targetExtraDeliveries * commissionRate;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-slate-950">
      {/* Rep Left Sidebar */}
      <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col p-3 space-y-1 select-none">
        <div className="pb-3 border-b border-slate-800 mb-2">
          <p className="font-semibold text-white text-xs">{currentUser.name}</p>
          <p className="text-[10px] text-emerald-400 font-mono">Sales Representative</p>
        </div>

        {[
          { id: 'dashboard', label: 'My Dashboard', icon: TrendingUp },
          { id: 'orders', label: 'My Orders', icon: ShoppingCart, badge: myPendingOrders.length },
          { id: 'abandoned', label: 'My Abandoned Carts', icon: PhoneCall, badge: myCarts.filter(c => c.status === 'ASSIGNED').length },
          { id: 'agent-stock', label: 'Agent Inventory', icon: Package },
          { id: 'leaderboard', label: 'Rep Leaderboard', icon: Trophy },
          { id: 'chat', label: 'Team Chat', icon: MessageSquare },
          { id: 'settings', label: 'My Settings', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = repTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setRepTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="font-mono text-[10px] bg-emerald-950 text-emerald-400 px-1.5 rounded">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* Main Rep Content Area */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 max-w-6xl mx-auto">
        {repTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Header Greeting */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h1 className="text-xl font-bold text-white">
                  Welcome back, {currentUser.name.split(' ')[0]} 👋
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Here is your personal pipeline, conversion rate, and commission earnings.
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Create Order
              </button>
            </div>

            {/* 4 Core Rep Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <p className="text-xs text-slate-400">Delivered Revenue</p>
                <p className="text-2xl font-bold font-mono text-white tabular-nums">
                  {formatCurrency(convertAmount(myRevenueNgn, currency), currency)}
                </p>
                <p className="text-[11px] text-slate-500">Collected at doorsteps</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <p className="text-xs text-slate-400">Conversion Rate</p>
                <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{myConversion}%</p>
                <p className="text-[11px] text-slate-500">{myDeliveredOrders.length} / {myOrders.length} delivered</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <p className="text-xs text-slate-400">Pending Actions</p>
                <p className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  {myPendingOrders.length} orders
                </p>
                <p className="text-[11px] text-slate-500">Requires customer call</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <p className="text-xs text-slate-400">Estimated Earnings</p>
                <p className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                  {formatCurrency(convertAmount(estimatedTotalEarningsNgn, currency), currency)}
                </p>
                <p className="text-[11px] text-slate-500">Fixed + ₦{commissionRate}/delivery</p>
              </div>
            </div>

            {/* Commission Opportunity Simulator */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-white text-sm">Commission Opportunity Simulator</h3>
                </div>
                <span className="text-xs font-mono text-emerald-400">
                  +{targetExtraDeliveries} more delivered orders
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Slide to see how many extra orders you need to hit your monthly income goal:
              </p>

              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="2"
                  value={targetExtraDeliveries}
                  onChange={(e) => setTargetExtraDeliveries(Number(e.target.value))}
                  className="flex-1 accent-emerald-500 cursor-pointer"
                />
                <div className="rounded-lg bg-slate-950 border border-slate-800 p-2 text-right">
                  <span className="text-[10px] text-slate-500 block uppercase">Extra Commissions</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    +{formatCurrency(convertAmount(simulatedExtraCommissionNgn, currency), currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Orders Quick Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-sm">Assigned Orders Awaiting Follow-up</h3>
                <button
                  onClick={() => setRepTab('orders')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                >
                  View All Orders <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">City & State</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myOrders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono font-medium text-white">{o.orderNumber}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{o.customerName}</td>
                        <td className="py-2.5 px-3 text-slate-300">{o.deliveryCity}, {o.deliveryState}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-200">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                          {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders */}
        {repTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">My Assigned Orders ({myOrders.length})</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white"
              >
                + New Order
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Delivery City</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myOrders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono font-medium text-white">{o.orderNumber}</td>
                        <td className="py-3 px-4 font-semibold text-slate-200">{o.customerName}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{o.customerPhone}</td>
                        <td className="py-3 px-4 text-slate-300">{o.deliveryCity}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-emerald-400">{o.status}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Agent Inventory Lookup */}
        {repTab === 'agent-stock' && (
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Regional Agent Stock Lookup</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Check stock availability in your customer's state before confirming same-day dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map(ag => {
                const stocks = agentStock.filter(s => s.agentId === ag.id);
                return (
                  <div key={ag.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-semibold text-white">{ag.name}</span>
                      <span className="font-mono text-[10px] text-emerald-400">{ag.primaryZone.split(' ')[0]}</span>
                    </div>
                    <div className="space-y-1">
                      {stocks.map(s => {
                        const prod = products.find(p => p.id === s.productId);
                        return (
                          <div key={s.productId} className="flex justify-between py-1 border-b border-slate-800/40">
                            <span className="text-slate-300 truncate max-w-[150px]">{prod?.name}</span>
                            <span className="font-mono font-bold text-white">{s.unitsHeld} in hub</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Team Chat */}
        {repTab === 'chat' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Team Chat</h2>
            <div className="space-y-2 p-4 rounded-xl border border-slate-800 bg-slate-900/40 max-h-80 overflow-y-auto">
              {chatMessages.map(m => (
                <div key={m.id} className="p-2.5 rounded bg-slate-950/60 text-xs space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-emerald-400">{m.userName}</span>
                    <span className="text-slate-500 font-mono">{m.timestamp}</span>
                  </div>
                  <p className="text-slate-200">{m.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Message team..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
              />
              <button
                onClick={() => { if (chatInput) { sendChatMessage(chatInput); setChatInput(''); } }}
                className="px-4 py-2 bg-emerald-600 rounded text-xs font-semibold text-white"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </main>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {showCreateModal && (
        <CreateOrderModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};
