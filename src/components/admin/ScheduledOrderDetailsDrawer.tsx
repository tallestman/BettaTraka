import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Order, OrderStatus } from '../../types/crm';
import { ScheduleDeliveryModal } from '../common/ScheduleDeliveryModal';
import { 
  X, 
  RefreshCw, 
  Glasses, 
  UserPlus, 
  MessageCircle, 
  Check, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle,
  Globe,
  Calendar
} from 'lucide-react';

interface ScheduledOrderDetailsDrawerProps {
  order: Order;
  onClose: () => void;
}

export const ScheduledOrderDetailsDrawer: React.FC<ScheduledOrderDetailsDrawerProps> = ({ order, onClose }) => {
  const { 
    orders,
    updateOrderStatus, 
    assignOrderAgent, 
    assignOrderRep, 
    agents, 
    users, 
    themeMode,
    addNotification 
  } = useCrm();

  const isLight = themeMode === 'light';

  // Always bind to the live order in CRM context so any status/agent/rep update renders immediately
  const liveOrder = orders.find(o => o.id === order.id || o.orderNumber === order.orderNumber) || order;

  const [copied, setCopied] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showRepMenu, setShowRepMenu] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const salesReps = users.filter(u => u.role === 'Sales Representative' || u.id.startsWith('user-rep') || u.role === 'Admin');

  // Copy order summary formatted for WhatsApp (matching schd2.png "Copy Order")
  const handleCopyOrder = () => {
    const itemsText = liveOrder.items.map(i => `- ${i.productName} ×${i.quantity} (₦${((i.unitPrice || 0) * i.quantity).toLocaleString()})`).join('\n');
    const text = `Order #${liveOrder.orderNumber.replace(/^ORD-/, '').replace(/^#/, '')}
Customer: ${liveOrder.customerName} (${liveOrder.customerPhone})
WhatsApp: ${liveOrder.customerWhatsApp || liveOrder.customerPhone}
Address: ${liveOrder.deliveryAddress}, ${liveOrder.deliveryCity}, ${liveOrder.deliveryState}
Items:
${itemsText}
Grand Total: ₦${liveOrder.totalAmount.toLocaleString()}
Scheduled Delivery: ${liveOrder.scheduledDate || 'Oct 01, 2026'} (${liveOrder.preferredDeliveryTime || 'morning'})
Status: ${liveOrder.status}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    if (addNotification) {
      addNotification({
        title: 'Order Copied',
        message: `Order #${liveOrder.orderNumber.replace(/^ORD-/, '').replace(/^#/, '')} copied to clipboard`,
        type: 'info'
      });
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return isLight
          ? 'border border-purple-300 bg-purple-50 text-purple-700'
          : 'border border-[#7e22ce]/70 bg-[#1e1035] text-[#c084fc]';
      case 'DISPATCHED':
        return isLight
          ? 'border border-blue-300 bg-blue-50 text-blue-700'
          : 'border border-[#2563eb]/70 bg-[#0c1a36] text-[#60a5fa]';
      case 'DELIVERED':
        return isLight
          ? 'border border-emerald-300 bg-emerald-50 text-emerald-700'
          : 'border border-[#16a34a]/70 bg-[#052416] text-[#4ade80]';
      case 'CANCELLED':
        return isLight
          ? 'border border-rose-300 bg-rose-50 text-rose-700'
          : 'border border-[#dc2626]/70 bg-[#3b1219] text-[#f87171]';
      case 'NEW':
        return isLight
          ? 'border border-amber-300 bg-amber-50 text-amber-700'
          : 'border border-slate-700 bg-slate-800 text-slate-300';
      default:
        return isLight
          ? 'border border-slate-300 bg-slate-100 text-slate-800'
          : 'border border-slate-700 bg-slate-800 text-slate-300';
    }
  };

  // Source icon
  const getSourceIcon = (source?: string) => {
    const s = (source || liveOrder.utmSource || 'facebook').toLowerCase();
    if (s.includes('facebook') || s.includes('fb')) {
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <span className="w-4 h-4 rounded-full bg-[#1877f2] flex items-center justify-center text-white text-[11px] font-black shrink-0">f</span>
          <span>Facebook</span>
        </span>
      );
    }
    if (s.includes('tiktok')) {
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <span className="w-4 h-4 rounded-full bg-black border border-slate-700 flex items-center justify-center text-white text-[10px] font-black shrink-0">d</span>
          <span>TikTok</span>
        </span>
      );
    }
    if (s.includes('instagram') || s.includes('ig')) {
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">IG</span>
          <span>Instagram</span>
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
        <Globe className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
        <span>{source || 'Order Form'}</span>
      </span>
    );
  };

  const cleanOrderNum = liveOrder.orderNumber.replace(/^ORD-/, '').replace(/^#/, '');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className={`relative w-full max-w-md sm:max-w-lg shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-right duration-250 ${
        isLight 
          ? 'bg-white text-slate-900 border-l border-slate-200' 
          : 'bg-[#030712] text-slate-100 border-l border-[#1e293b]'
      }`}>
        
        {/* Top Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b shrink-0 ${
          isLight ? 'border-slate-200 bg-white' : 'border-[#1e293b]/70 bg-[#030712]'
        }`}>
          <h2 className={`text-base sm:text-lg font-bold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            Order Details — {cleanOrderNum}
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          
          {/* Action Buttons Bar */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {/* 1. Change Status */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusMenu(!showStatusMenu);
                    setShowAgentMenu(false);
                    setShowRepMenu(false);
                  }}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' 
                      : 'bg-[#060b14] hover:bg-[#0c1526] text-white border-slate-700/80'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`} />
                  <span>Change Status</span>
                </button>

                {showStatusMenu && (
                  <div className={`absolute top-full left-0 mt-1 w-44 rounded-xl border shadow-2xl py-1 z-30 animate-in fade-in ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#030712] border-slate-700 text-white'
                  }`}>
                    {(['NEW', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'SCHEDULED', 'NOT_REACHABLE', 'CANCELLED'] as OrderStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          updateOrderStatus(liveOrder.id, st);
                          setShowStatusMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-mono font-bold transition flex items-center justify-between ${
                          liveOrder.status === st 
                            ? (isLight ? 'text-blue-600 bg-blue-50' : 'text-[#00a3ff] bg-slate-800/60') 
                            : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800')
                        }`}
                      >
                        <span>{st}</span>
                        {liveOrder.status === st && <Check className={`w-3 h-3 ${isLight ? 'text-blue-600' : 'text-[#00a3ff]'}`} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Assign Agent */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowAgentMenu(!showAgentMenu);
                    setShowStatusMenu(false);
                    setShowRepMenu(false);
                  }}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' 
                      : 'bg-[#060b14] hover:bg-[#0c1526] text-white border-slate-700/80'
                  }`}
                >
                  <Glasses className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`} />
                  <span>Assign Agent</span>
                </button>

                {showAgentMenu && (
                  <div className={`absolute top-full right-0 sm:left-0 mt-1 w-56 rounded-xl border shadow-2xl py-1 z-30 max-h-56 overflow-y-auto animate-in fade-in ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#030712] border-slate-700 text-white'
                  }`}>
                    <button
                      type="button"
                      onClick={() => {
                        assignOrderAgent(liveOrder.id, '');
                        setShowAgentMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs text-rose-500 font-semibold ${
                        isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                      }`}
                    >
                      Unassigned
                    </button>
                    {agents.map((ag) => (
                      <button
                        key={ag.id}
                        type="button"
                        onClick={() => {
                          assignOrderAgent(liveOrder.id, ag.id);
                          setShowAgentMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition flex items-center justify-between ${
                          liveOrder.agentId === ag.id 
                            ? (isLight ? 'text-blue-600 bg-blue-50 font-bold' : 'text-[#00a3ff] bg-slate-800/60 font-bold') 
                            : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800')
                        }`}
                      >
                        <span className="truncate">{ag.name}</span>
                        {liveOrder.agentId === ag.id && <Check className={`w-3 h-3 ${isLight ? 'text-blue-600' : 'text-[#00a3ff]'}`} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Reassign Sales Rep */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowRepMenu(!showRepMenu);
                    setShowStatusMenu(false);
                    setShowAgentMenu(false);
                  }}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' 
                      : 'bg-[#060b14] hover:bg-[#0c1526] text-white border-slate-700/80'
                  }`}
                >
                  <UserPlus className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`} />
                  <span>Reassign Sales Rep</span>
                </button>

                {showRepMenu && (
                  <div className={`absolute top-full left-0 mt-1 w-52 rounded-xl border shadow-2xl py-1 z-30 max-h-56 overflow-y-auto animate-in fade-in ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#030712] border-slate-700 text-white'
                  }`}>
                    {salesReps.map((rep) => (
                      <button
                        key={rep.id}
                        type="button"
                        onClick={() => {
                          assignOrderRep(liveOrder.id, rep.id);
                          setShowRepMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition flex items-center justify-between ${
                          liveOrder.salesRepId === rep.id 
                            ? (isLight ? 'text-blue-600 bg-blue-50 font-bold' : 'text-[#00a3ff] bg-slate-800/60 font-bold') 
                            : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800')
                        }`}
                      >
                        <span className="truncate">{rep.name}</span>
                        {liveOrder.salesRepId === rep.id && <Check className={`w-3 h-3 ${isLight ? 'text-blue-600' : 'text-[#00a3ff]'}`} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Copy Order */}
              <button
                type="button"
                onClick={handleCopyOrder}
                className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm ${
                  isLight 
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300' 
                    : 'bg-[#041d11] hover:bg-[#072a19] text-[#22c55e] border border-[#166534]'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Order'}</span>
              </button>
            </div>
          </div>

          <div className={`border-b ${isLight ? 'border-slate-200' : 'border-[#1e293b]/70'}`} />

          {/* Section 1: Customer Information */}
          <div className="space-y-3">
            <h3 className={`text-sm sm:text-base font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Customer Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  NAME
                </span>
                <span className={`text-sm font-bold block mt-0.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {liveOrder.customerName}
                </span>
              </div>

              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  PHONE
                </span>
                <span className={`text-sm font-bold font-mono block mt-0.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {liveOrder.customerPhone}
                </span>
              </div>

              <div className="col-span-2">
                <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  WHATSAPP
                </span>
                <span className={`text-sm font-bold font-mono block mt-0.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {liveOrder.customerWhatsApp || liveOrder.customerPhone}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Order Information */}
          <div className="space-y-3">
            <h3 className={`text-sm sm:text-base font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Order Information
            </h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  STATUS
                </span>
                <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-mono font-bold ${getStatusBadge(liveOrder.status)}`}>
                  {liveOrder.status}
                </span>
              </div>

              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  SOURCE
                </span>
                <div>
                  {getSourceIcon(liveOrder.source)}
                </div>
              </div>

              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-0.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  LOCATION
                </span>
                <span className={`font-bold text-xs block ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {liveOrder.deliveryCity}, {liveOrder.deliveryState}
                </span>
              </div>

              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-0.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  ORDER DATE
                </span>
                <span className={`font-bold text-xs font-mono block ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {liveOrder.createdAt ? new Date(liveOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' ' + new Date(liveOrder.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'Aug 07, 2026 15:46'}
                </span>
              </div>

              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-0.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  ASSIGNED TO
                </span>
                <span className={`font-bold text-xs block ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {liveOrder.salesRepName || 'Chidi Okeke'}
                </span>
              </div>

              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-0.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  AGENT
                </span>
                <span className={`text-xs block ${
                  liveOrder.agentName 
                    ? (isLight ? 'font-bold text-slate-900' : 'font-bold text-white') 
                    : (isLight ? 'italic text-slate-500' : 'italic text-slate-400')
                }`}>
                  {liveOrder.agentName || 'Unassigned'}
                </span>
              </div>

              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-0.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  SCHEDULED DELIVERY
                </span>
                <span className={`font-bold text-xs font-mono block ${
                  isLight ? 'text-blue-600' : 'text-[#00a3ff]'
                }`}>
                  {liveOrder.scheduledDate ? (liveOrder.scheduledDate.includes('2026-10-01') ? 'Oct 01, 2026' : liveOrder.scheduledDate.includes('2026-10-02') ? 'Oct 02, 2026' : liveOrder.scheduledDate.includes('2026-10-03') ? 'Oct 03, 2026' : liveOrder.scheduledDate) : 'Oct 01, 2026'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(true)}
                  className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer ${
                    isLight 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                      : 'bg-blue-950/70 border-blue-800 text-blue-300 hover:bg-blue-900/80'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>Change Date</span>
                </button>
              </div>

              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-0.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  PREFERRED DELIVERY
                </span>
                <span className={`font-bold text-xs block ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {liveOrder.preferredDeliveryTime || 'morning'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Form Submission Details */}
          <div className={`space-y-2 pt-1 border-t ${
            isLight ? 'border-slate-200' : 'border-[#1e293b]/70'
          }`}>
            <h3 className={`text-sm sm:text-base font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Form Submission Details
            </h3>

            <div className="space-y-1">
              <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                ATTRIBUTION
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} font-medium`}>Source: </span>
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{liveOrder.utmSource || 'tiktok'}</span>
                </div>
                <div>
                  <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} font-medium`}>Campaign: </span>
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{liveOrder.utmCampaign || 'tiktok_creators'}</span>
                </div>
                <div>
                  <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} font-medium`}>Medium: </span>
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{liveOrder.utmMedium || 'video'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Delivery Address */}
          <div className="space-y-2">
            <h3 className={`text-sm sm:text-base font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Delivery Address
            </h3>
            <div className={`p-3.5 rounded-lg border text-xs sm:text-sm font-medium ${
              isLight 
                ? 'bg-slate-50 border-slate-200 text-slate-900' 
                : 'bg-[#060b14] border-[#1e293b] text-white'
            }`}>
              {liveOrder.deliveryAddress || '30 Aba Road'}
            </div>
          </div>

          {/* Section 5: Order Items */}
          <div className="space-y-2.5">
            <h3 className={`text-sm sm:text-base font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Order Items
            </h3>

            <div className={`rounded-lg border overflow-x-auto text-xs ${
              isLight 
                ? 'bg-white border-slate-200' 
                : 'bg-[#060b14] border-[#1e293b]/80'
            }`}>
              <table className="w-full text-left">
                <thead>
                  <tr className={`border-b text-[11px] font-semibold ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-700' 
                      : 'bg-[#030712] border-[#1e293b] text-slate-300'
                  }`}>
                    <th className="py-2.5 px-3 font-semibold">Product</th>
                    <th className="py-2.5 px-3 text-center font-semibold">Qty</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Price</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isLight ? 'divide-slate-100' : 'divide-[#1e293b]/50'
                }`}>
                  {liveOrder.items.map((item, idx) => {
                    const price = item.unitPrice || (liveOrder.totalAmount / (item.quantity || 1));
                    const total = price * item.quantity;
                    return (
                      <tr key={idx} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/40'}>
                        <td className={`py-2.5 px-3 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {item.productName}
                        </td>
                        <td className={`py-2.5 px-3 text-center font-mono ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                          {item.quantity}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                          ₦{price.toLocaleString()}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                          ₦{total.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className={`border-t ${
                    isLight ? 'border-slate-200 bg-slate-50' : 'border-[#1e293b] bg-[#030712]'
                  }`}>
                    <td colSpan={3} className={`py-3 px-3 text-right font-bold ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      Grand Total
                    </td>
                    <td className={`py-3 px-3 text-right font-mono font-bold text-sm ${
                      isLight ? 'text-blue-600' : 'text-[#00a3ff]'
                    }`}>
                      ₦{liveOrder.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section 6: Order Timeline */}
          <div className="space-y-3 pt-2">
            <h3 className={`text-sm sm:text-base font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Order Timeline
            </h3>

            <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#0070f3]">
              
              {/* Step 1: Order Placed */}
              <div className="relative flex items-start justify-between gap-4">
                <div className="absolute -left-7 top-0.5 w-6 h-6 rounded-full bg-[#0070f3] flex items-center justify-center text-white shadow-md">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>Order Placed</h4>
                </div>
                <span className={`text-[11px] font-mono shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {liveOrder.createdAt ? new Date(liveOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' ' + new Date(liveOrder.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'Aug 07, 2026 15:46'}
                </span>
              </div>

              {/* Step 2: Confirmed */}
              <div className="relative flex items-start justify-between gap-4">
                <div className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md ${
                  liveOrder.status !== 'NEW' ? 'bg-[#0070f3]' : (isLight ? 'bg-slate-200 border border-slate-300 text-slate-500' : 'bg-[#060b14] border border-slate-700 text-slate-500')
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>Confirmed</h4>
                  {liveOrder.status === 'CONFIRMED' && (
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                      isLight ? 'bg-slate-100 border border-slate-300 text-slate-700' : 'bg-[#0a1220] border border-slate-700 text-white'
                    }`}>
                      Current Status
                    </span>
                  )}
                </div>
                <span className={`text-[11px] font-mono shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Aug 07, 2026 19:46
                </span>
              </div>

              {/* Step 3: Dispatched */}
              <div className="relative flex items-start justify-between gap-4">
                <div className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                  liveOrder.status === 'DISPATCHED' || liveOrder.status === 'DELIVERED' 
                    ? 'bg-[#0070f3] text-white' 
                    : (isLight ? 'bg-slate-200 border border-slate-300 text-slate-500' : 'bg-[#060b14] border border-slate-700 text-slate-500')
                }`}>
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className={`text-xs ${
                    liveOrder.status === 'DISPATCHED' || liveOrder.status === 'DELIVERED' 
                      ? (isLight ? 'font-bold text-slate-900' : 'font-bold text-white') 
                      : (isLight ? 'font-medium text-slate-500' : 'font-medium text-slate-400')
                  }`}>
                    Dispatched
                  </h4>
                  {liveOrder.status === 'DISPATCHED' && (
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                      isLight ? 'bg-slate-100 border border-slate-300 text-slate-700' : 'bg-[#0a1220] border border-slate-700 text-white'
                    }`}>
                      Current Status
                    </span>
                  )}
                </div>
              </div>

              {/* Step 4: Delivered */}
              <div className="relative flex items-start justify-between gap-4">
                <div className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                  liveOrder.status === 'DELIVERED' 
                    ? 'bg-[#0070f3] text-white' 
                    : (isLight ? 'bg-slate-200 border border-slate-300 text-slate-500' : 'bg-[#060b14] border border-slate-700 text-slate-500')
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className={`text-xs ${
                    liveOrder.status === 'DELIVERED' 
                      ? (isLight ? 'font-bold text-slate-900' : 'font-bold text-white') 
                      : (isLight ? 'font-medium text-slate-500' : 'font-medium text-slate-400')
                  }`}>
                    Delivered
                  </h4>
                  {liveOrder.status === 'DELIVERED' && (
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                      isLight ? 'bg-slate-100 border border-slate-300 text-slate-700' : 'bg-[#0a1220] border border-slate-700 text-white'
                    }`}>
                      Current Status
                    </span>
                  )}
                </div>
              </div>

              {/* Step 5: Cancelled */}
              <div className="relative flex items-start justify-between gap-4">
                <div className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                  liveOrder.status === 'CANCELLED' 
                    ? 'bg-rose-600 text-white' 
                    : (isLight ? 'bg-slate-200 border border-slate-300 text-slate-500' : 'bg-[#060b14] border border-slate-700 text-slate-500')
                }`}>
                  <XCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className={`text-xs ${
                    liveOrder.status === 'CANCELLED' 
                      ? 'font-bold text-rose-600' 
                      : (isLight ? 'font-medium text-slate-500' : 'font-medium text-slate-400')
                  }`}>
                    Cancelled
                  </h4>
                  {liveOrder.status === 'CANCELLED' && (
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                      isLight ? 'bg-rose-50 border border-rose-300 text-rose-700' : 'bg-[#3b1219] border border-rose-700 text-rose-300'
                    }`}>
                      Current Status
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {showRescheduleModal && (
        <ScheduleDeliveryModal
          order={liveOrder}
          onClose={() => setShowRescheduleModal(false)}
        />
      )}
    </div>
  );
};
