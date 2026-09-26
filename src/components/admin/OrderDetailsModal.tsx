import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Order, OrderStatus } from '../../types/crm';
import { formatCurrency, convertAmount, createWhatsAppLink, formatDate } from '../../utils/formatters';
import { 
  X, 
  MessageSquare, 
  Copy, 
  Check, 
  UserCheck, 
  Truck, 
  Calendar, 
  MapPin, 
  Tag, 
  Clock,
  Sparkles
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  const { 
    updateOrderStatus, 
    assignOrderRep, 
    assignOrderAgent, 
    users, 
    agents, 
    currency,
    triggerAICall
  } = useCrm();

  const [copied, setCopied] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [selectedRep, setSelectedRep] = useState<string>(order.salesRepId || '');
  const [selectedAgent, setSelectedAgent] = useState<string>(order.agentId || '');

  const handleStatusChange = (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus);
    updateOrderStatus(order.id, newStatus);
  };

  const handleRepChange = (repId: string) => {
    setSelectedRep(repId);
    assignOrderRep(order.id, repId);
  };

  const handleAgentChange = (agentId: string) => {
    setSelectedAgent(agentId);
    assignOrderAgent(order.id, agentId);
  };

  const copyOrderSummary = () => {
    const text = `Order #${order.orderNumber}\nCustomer: ${order.customerName} (${order.customerPhone})\nAddress: ${order.deliveryAddress}, ${order.deliveryCity}, ${order.deliveryState}\nItems: ${order.items.map(i => `${i.quantity}x ${i.productName} (${i.packageName || ''})`).join(', ')}\nTotal: ${order.currency} ${order.totalAmount}\nStatus: ${order.status}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waMessage = `Hello ${order.customerName}, this is ${order.salesRepName || 'BettaTraka Fulfillment'} regarding your order #${order.orderNumber} for ${order.items[0]?.productName}. We are preparing to dispatch to ${order.deliveryCity}, ${order.deliveryState}. Are you available today to receive and pay on delivery?`;

  const salesReps = users.filter(u => u.role === 'Sales Representative' || u.role === 'Owner' || u.role === 'Admin');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-white">{order.orderNumber}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
              order.status === 'DELIVERED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
              order.status === 'DISPATCHED' ? 'bg-blue-950 text-blue-400 border border-blue-800/60' :
              order.status === 'CONFIRMED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60' :
              order.status === 'NEW' ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
              'bg-red-950 text-red-400 border border-red-800/60'
            }`}>
              {order.status}
            </span>
            {order.isSandbox && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-400 border border-purple-800">
                SANDBOX TEST
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-800">
            <a
              href={createWhatsAppLink(order.customerPhone, waMessage)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-white transition shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Customer</span>
            </a>

            <button
              onClick={() => triggerAICall(order.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/50 hover:bg-indigo-600/50 font-medium text-indigo-300 transition"
              title="Trigger automated AI phone call to customer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Trigger AI Call</span>
            </button>

            <button
              onClick={copyOrderSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 font-medium text-slate-300 hover:text-white transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Details' : 'Copy Order'}</span>
            </button>
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Customer Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-slate-500 text-[11px]">Full Name</span>
                <p className="font-semibold text-white mt-0.5">{order.customerName}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Primary Phone</span>
                <p className="font-mono text-slate-200 mt-0.5">{order.customerPhone}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">WhatsApp</span>
                <p className="font-mono text-slate-200 mt-0.5">{order.customerWhatsApp || order.customerPhone}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Email Address</span>
                <p className="text-slate-300 mt-0.5">{order.customerEmail || 'Not provided'}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 text-[11px]">Delivery Address</span>
                <p className="text-slate-200 mt-0.5 font-medium">
                  {order.deliveryAddress}, {order.deliveryCity}, <span className="text-emerald-400">{order.deliveryState}</span>
                </p>
              </div>
              {order.deliveryWindowPreference && (
                <div className="sm:col-span-2 text-emerald-400 text-[11px]">
                  Preferred Delivery Window: {order.deliveryWindowPreference}
                </div>
              )}
            </div>
          </div>

          {/* Order Items & Total */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" /> Ordered Package & Items
            </h4>
            <div className="divide-y divide-slate-800/80 rounded-lg bg-slate-950/60 border border-slate-800">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{item.productName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.packageName || 'Standard Unit'}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-white text-sm">
                      {formatCurrency(convertAmount(item.unitPrice, currency), currency)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="p-3.5 bg-slate-900/60 flex items-center justify-between font-bold text-sm">
                <span>Total Amount (Pay On Delivery):</span>
                <span className="font-mono text-emerald-400">
                  {formatCurrency(convertAmount(order.totalAmount, currency), currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Workflow & Assignment Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Order Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="NEW">NEW</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="DISPATCHED">DISPATCHED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="NOT_REACHABLE">NOT_REACHABLE</option>
                <option value="NOT_PICKING_CALLS">NOT_PICKING_CALLS</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Assigned Sales Rep
              </label>
              <select
                value={selectedRep}
                onChange={(e) => handleRepChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Unassigned</option>
                {salesReps.map(rep => (
                  <option key={rep.id} value={rep.id}>{rep.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Assigned Delivery Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => handleAgentChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Agent</option>
                {agents.map(ag => (
                  <option key={ag.id} value={ag.id}>{ag.name} ({ag.primaryZone.split(' ')[0]})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Attribution & UTM Details */}
          <div className="space-y-2 p-3.5 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px]">
            <p className="font-semibold text-slate-300">Attribution & Source Metadata</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
              <div>
                <span className="text-slate-500 block">Source:</span>
                <span className="font-mono text-slate-200">{order.source}</span>
              </div>
              <div>
                <span className="text-slate-500 block">UTM Source:</span>
                <span className="font-mono text-slate-200">{order.utmSource || 'direct'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">UTM Campaign:</span>
                <span className="font-mono text-slate-200">{order.utmCampaign || 'none'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Ordered At:</span>
                <span className="font-mono text-slate-200">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Fulfillment Time: {order.fulfillmentDays ? `${order.fulfillmentDays} day(s)` : 'Pending delivery'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
