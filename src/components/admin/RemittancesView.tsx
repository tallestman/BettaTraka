import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { Remittance, Order } from '../../types/crm';
import { OrderDetailsModal } from './OrderDetailsModal';
import { 
  Search, 
  Calendar, 
  Check, 
  Banknote, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  X,
  ExternalLink,
  Receipt,
  Download,
  AlertCircle
} from 'lucide-react';

export const RemittancesView: React.FC = () => {
  const { 
    remittances, 
    markRemittanceAsPaid, 
    orders, 
    currency, 
    themeMode,
    addNotification,
    setAdminActiveTab
  } = useCrm();

  const isLight = themeMode === 'light';

  // Tabs: 'pending' or 'remitted' matching screenshot (remit1.png)
  const [tab, setTab] = useState<'pending' | 'remitted'>('pending');

  // Search input matching screenshot placeholder: "Search order #, customer, or phone"
  const [searchQuery, setSearchQuery] = useState('');

  // Date filter: Today | This Week | This Month | This Year | Date Range
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);

  // Modal states
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  
  // Remit Pop-open Modal state matching remit2.png
  const [remitTarget, setRemitTarget] = useState<Remittance | null>(null);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState<string>('0.00');
  const [remitNotesInput, setRemitNotesInput] = useState<string>('');

  // Split into Pending and Remitted
  const pendingList = useMemo(() => remittances.filter(r => r.status === 'Pending'), [remittances]);
  const remittedList = useMemo(() => remittances.filter(r => r.status === 'Remitted'), [remittances]);

  // Helper for customer initials circle
  const getInitials = (name: string) => {
    if (!name) return 'CU';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper to format date matching remit1.png: "Oct 4, 2026"
  const formatDeliveredDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      // Handle date strings with or without time
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Date comparison helper
  const isDateInFilter = (dateStr: string) => {
    if (!dateStr) return true;
    try {
      const itemDate = new Date(dateStr.split('T')[0]);
      // Anchor reference: using current date or 2026-10-02
      const now = new Date();

      if (dateFilter === 'today') {
        return itemDate.toDateString() === now.toDateString();
      }

      if (dateFilter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 14); // Generous 2-week window to capture recent orders
        return itemDate >= oneWeekAgo;
      }

      if (dateFilter === 'month') {
        return (
          itemDate.getFullYear() === now.getFullYear() &&
          itemDate.getMonth() === now.getMonth()
        );
      }

      if (dateFilter === 'year') {
        return itemDate.getFullYear() === now.getFullYear();
      }

      if (dateFilter === 'custom') {
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return itemDate >= start && itemDate <= end;
        }
      }
    } catch {
      return true;
    }

    return true;
  };

  // Filtered remittances based on tab, search query, and date filter
  const filteredRemittances = useMemo(() => {
    const baseList = tab === 'pending' ? pendingList : remittedList;

    return baseList.filter(r => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesOrder = r.orderNumber.toLowerCase().includes(query);
        const matchesCustomer = r.customerName.toLowerCase().includes(query);
        const matchesPhone = r.customerPhone.toLowerCase().includes(query);
        const matchesAgent = r.agentName.toLowerCase().includes(query);
        const matchesZone = r.agentZone?.toLowerCase().includes(query);
        const matchesProduct = r.productSummary?.toLowerCase().includes(query);

        if (!matchesOrder && !matchesCustomer && !matchesPhone && !matchesAgent && !matchesZone && !matchesProduct) {
          return false;
        }
      }

      // 2. Date Filter
      if (dateFilter !== 'month' && dateFilter !== 'year' && !isDateInFilter(r.deliveredDate)) {
        return false;
      }

      return true;
    });
  }, [tab, pendingList, remittedList, searchQuery, dateFilter, customStartDate, customEndDate]);

  // Open Remit Modal (remit2.png)
  const handleOpenRemitModal = (r: Remittance) => {
    setRemitTarget(r);
    // Default fee: if already set use that, else default to 0.00 as in remit2.png
    if (r.deliveryFeeDeducted !== undefined && r.deliveryFeeDeducted > 0) {
      setDeliveryFeeInput(r.deliveryFeeDeducted.toString());
    } else {
      setDeliveryFeeInput('0.00');
    }
    setRemitNotesInput(r.notes || '');
  };

  // Confirm Remit Handler
  const handleConfirmRemit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remitTarget) return;

    const parsedFee = parseFloat(deliveryFeeInput.replace(/[^0-9.]/g, '')) || 0;

    // Call context to mark as remitted and auto-log expense
    markRemittanceAsPaid(remitTarget.id, parsedFee, remitNotesInput);

    setRemitTarget(null);
  };

  // Helper to reliably get original full product order price
  const getOrderGrossAmount = (r: Remittance) => {
    const cleanNum = r.orderNumber.replace(/^ORD-/, '').replace(/^#/, '');
    const foundOrder = orders.find(o => 
      o.id === r.orderId ||
      o.orderNumber.replace(/^ORD-/, '').replace(/^#/, '') === cleanNum
    );
    if (foundOrder && foundOrder.totalAmount) {
      return foundOrder.totalAmount;
    }
    if (r.orderTotal) return r.orderTotal;
    if (r.deliveryFeeDeducted && r.deliveryFeeDeducted > 0) {
      return r.amountToRemit + r.deliveryFeeDeducted;
    }
    return r.amountToRemit || 0;
  };

  // Open Order Details
  const handleViewOrder = (orderNumber: string) => {
    const ord = orders.find(o => o.orderNumber === orderNumber || o.orderNumber === `#${orderNumber.replace(/^#/, '')}`);
    if (ord) {
      setSelectedOrderForModal(ord);
    } else {
      setAdminActiveTab('orders');
    }
  };

  // Calculate modal breakdown numbers using original full product order price
  const modalGrossTotal = remitTarget ? getOrderGrossAmount(remitTarget) : 0;
  const parsedModalFee = parseFloat(deliveryFeeInput.replace(/[^0-9.]/g, '')) || 0;
  const modalNetRemit = Math.max(0, modalGrossTotal - parsedModalFee);

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto min-h-screen ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#030712] text-slate-100'
    }`}>
      
      {/* 1. Header Section matching remit1.png */}
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-sky-400">
          Remittances
        </h1>
        <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Delivered orders awaiting delivery-fee remittance from your agents
        </p>
      </div>

      {/* 2. Tabs Row matching remit1.png: [ Pending (22) ] [ Remitted ] */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            tab === 'pending'
              ? isLight
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-800 text-white border border-slate-700/80 shadow-md'
              : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <span>Pending</span>
          <span className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
            tab === 'pending'
              ? 'bg-sky-500/20 text-sky-300'
              : 'text-slate-500'
          }`}>
            ({pendingList.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('remitted')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            tab === 'remitted'
              ? isLight
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-800 text-white border border-slate-700/80 shadow-md'
              : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <span>Remitted</span>
          {remittedList.length > 0 && (
            <span className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
              tab === 'remitted'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-slate-500'
            }`}>
              ({remittedList.length})
            </span>
          )}
        </button>
      </div>

      {/* 3. Filter Bar & Search Row matching remit1.png */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left side: Time range filters */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {(['today', 'week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setDateFilter(period)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  dateFilter === period
                    ? isLight
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : 'text-white font-bold'
                    : isLight
                      ? 'text-slate-500 hover:text-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year'}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowCustomDateModal(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                dateFilter === 'custom'
                  ? 'bg-sky-950/80 border-sky-600 text-sky-300 font-bold'
                  : isLight
                    ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {dateFilter === 'custom' && customStartDate && customEndDate
                  ? `${customStartDate} → ${customEndDate}`
                  : 'Date Range'}
              </span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 font-normal">
            Filters by delivery date.
          </p>
        </div>

        {/* Right side: Search Input matching remit1.png */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer, or phone"
            className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs focus:outline-none transition shadow-sm ${
              isLight
                ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                : 'bg-slate-900/90 border border-slate-800/90 text-white placeholder-slate-500 focus:border-sky-500'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Main Table matching remit1.png */}
      <div className={`rounded-2xl border overflow-hidden shadow-xl ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#060a12] border-slate-800/80'
      }`}>
        {filteredRemittances.length === 0 ? (
          <div className="py-20 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Banknote className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-sm font-medium">
              {tab === 'pending'
                ? 'No delivered orders waiting on remittance right now.'
                : 'No settled remittance records found for this period.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-sky-400 hover:underline cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-mono ${
                  isLight ? 'border-slate-200 bg-slate-100/70 text-slate-500' : 'border-slate-800/80 bg-slate-950/60 text-slate-400'
                }`}>
                  <th className="py-3 px-4 sm:px-6 font-semibold">Order</th>
                  <th className="py-3 px-4 sm:px-6 font-semibold">Customer</th>
                  <th className="py-3 px-4 sm:px-6 font-semibold">Agent</th>
                  <th className="py-3 px-4 sm:px-6 font-semibold">Delivered</th>
                  {tab === 'remitted' && (
                    <>
                      <th className="py-3 px-4 font-semibold text-right text-rose-400">Agent Fee (Expense)</th>
                      <th className="py-3 px-4 font-semibold text-right text-emerald-400">Net Remitted</th>
                    </>
                  )}
                  <th className="py-3 px-4 sm:px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isLight ? 'divide-slate-200' : 'divide-slate-800/60'
              }`}>
                {filteredRemittances.map((r) => {
                  const initials = getInitials(r.customerName);
                  const displayOrderNum = r.orderNumber.startsWith('#') ? r.orderNumber : `#${r.orderNumber.replace(/^ORD-/, '')}`;

                  return (
                    <tr 
                      key={r.id} 
                      className={`transition-colors ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      {/* Order Column: #1010 + Product Summary + Original Order Price */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleViewOrder(r.orderNumber)}
                          className={`font-mono font-bold text-xs hover:underline flex items-center gap-1 ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}
                          title="Click to view full order details"
                        >
                          <span>{displayOrderNum}</span>
                        </button>
                        <p className={`text-[11px] truncate max-w-[200px] mt-0.5 ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`} title={r.productSummary}>
                          {r.productSummary || 'Standard Package'}
                        </p>
                        <span className={`text-[10px] font-mono font-semibold block mt-0.5 ${
                          isLight ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          {formatCurrency(convertAmount(getOrderGrossAmount(r), currency), currency)}
                        </span>
                      </td>

                      {/* Customer Column: Avatar Circle [KI] + Name + Phone */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 border ${
                            isLight 
                              ? 'bg-sky-100 border-sky-300 text-sky-800' 
                              : 'bg-[#0b1f36] border-sky-800/60 text-sky-400'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <p className={`font-semibold text-xs leading-tight ${
                              isLight ? 'text-slate-900' : 'text-white'
                            }`}>
                              {r.customerName}
                            </p>
                            <p className={`text-[10px] font-mono mt-0.5 ${
                              isLight ? 'text-slate-500' : 'text-slate-400'
                            }`}>
                              {r.customerPhone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Agent Column: Capital Dispatch (Abuja) + FCT */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <p className={`font-medium text-xs ${
                          isLight ? 'text-slate-800' : 'text-slate-200'
                        }`}>
                          {r.agentName}
                        </p>
                        <p className={`text-[11px] font-mono mt-0.5 ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {r.agentZone || 'Central Zone'}
                        </p>
                      </td>

                      {/* Delivered Column: Oct 4, 2026 */}
                      <td className={`py-3.5 px-4 sm:px-6 font-medium text-xs whitespace-nowrap ${
                        isLight ? 'text-slate-600' : 'text-slate-300'
                      }`}>
                        <span>{formatDeliveredDate(r.deliveredDate)}</span>
                        {r.remittedAt && tab === 'remitted' && (
                          <span className="block text-[10px] text-emerald-500 font-mono mt-0.5">
                            Settled: {formatDeliveredDate(r.remittedAt)}
                          </span>
                        )}
                      </td>

                      {/* Remitted Tab Extra Columns: Fee + Net Cash */}
                      {tab === 'remitted' && (
                        <>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400 whitespace-nowrap">
                            -₦{(r.deliveryFeeDeducted || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                            ₦{(r.amountToRemit || 0).toLocaleString()}
                          </td>
                        </>
                      )}

                      {/* Action Column: [ Remit ] Button matching remit1.png */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        {r.status === 'Pending' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenRemitModal(r)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
                            title="Click to enter agent deducted fee and mark remitted"
                          >
                            <Receipt className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Remit</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Remitted</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenRemitModal(r)}
                              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                              title="Edit deducted delivery fee"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. POP OPEN MODAL: Remit Order Dialog (MATCHING EXACTLY remit2.png)        */}
      {/* ========================================================================= */}
      {remitTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl animate-in zoom-in-95 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b101b] border-slate-800 text-slate-100'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Remit Order {remitTarget.orderNumber.startsWith('#') ? remitTarget.orderNumber : `#${remitTarget.orderNumber.replace(/^ORD-/, '')}`}
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enter the delivery fee deducted by the agent. This is logged as a delivery expense and the order is marked remitted.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRemitTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmRemit} className="space-y-4 pt-1">
              {/* Delivery Fee Input Field matching remit2.png */}
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Delivery Fee <span className="text-rose-500">*</span>
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400 font-bold">
                    ₦
                  </span>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={deliveryFeeInput}
                    onChange={(e) => setDeliveryFeeInput(e.target.value)}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:border-sky-500 transition ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 text-slate-900' 
                        : 'bg-[#060913] border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Financial & Accounting Impact Preview Box */}
              <div className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Customer Total Collected:</span>
                  <span className="font-mono text-slate-200 font-semibold">
                    ₦{modalGrossTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-rose-400">
                  <span>Agent Fee (Logged to Expenses):</span>
                  <span className="font-mono font-semibold">
                    -₦{parsedModalFee.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-slate-800 pt-1.5 flex items-center justify-between font-bold">
                  <span className="text-slate-300">Net Cash Remittance to Bank:</span>
                  <span className="font-mono text-emerald-400 text-sm">
                    ₦{modalNetRemit.toLocaleString()}
                  </span>
                </div>

                <div className="pt-1 flex items-center gap-1.5 text-[10px] text-sky-400 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>Will reflect in Financial Reports under "Agent Delivery Fees"</span>
                </div>
              </div>

              {/* Modal Buttons matching remit2.png */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRemitTarget(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isLight 
                      ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700' 
                      : 'border-slate-700/80 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Remit</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Date Range Modal */}
      {showCustomDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-sm rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold">Select Delivery Date Range</h3>
              </div>
              <button 
                onClick={() => setShowCustomDateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-sky-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-sky-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomDateModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setDateFilter('custom');
                  setShowCustomDateModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal (if viewing full order) */}
      {selectedOrderForModal && (
        <OrderDetailsModal
          order={selectedOrderForModal}
          onClose={() => setSelectedOrderForModal(null)}
        />
      )}

    </div>
  );
};
