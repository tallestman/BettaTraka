import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount, formatDate, createWhatsAppLink } from '../../utils/formatters';
import { Remittance, Order } from '../../types/crm';
import { OrderDetailsModal } from './OrderDetailsModal';
import { 
  Search, 
  Calendar, 
  Check, 
  Download, 
  Banknote, 
  Truck, 
  Phone, 
  MessageSquare, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Filter, 
  AlertCircle,
  Copy,
  ChevronDown,
  X,
  ArrowRight
} from 'lucide-react';

export const RemittancesView: React.FC = () => {
  const { 
    remittances, 
    markRemittanceAsPaid, 
    orders, 
    agents, 
    currency, 
    addNotification,
    setAdminActiveTab
  } = useCrm();

  // Primary tab: 'pending' or 'remitted' matching screenshot
  const [tab, setTab] = useState<'pending' | 'remitted'>('pending');

  // Search input matching screenshot placeholder: "Search order #, customer, or phone"
  const [searchQuery, setSearchQuery] = useState('');

  // Date filter: Today | This Week | This Month | This Year | Date Range
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);

  // Agent filter dropdown
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [settlingRemittance, setSettlingRemittance] = useState<Remittance | null>(null);
  const [paymentRefInput, setPaymentRefInput] = useState('');
  const [settlementNoteInput, setSettlementNoteInput] = useState('');

  // Metrics
  const pendingList = useMemo(() => remittances.filter(r => r.status === 'Pending'), [remittances]);
  const remittedList = useMemo(() => remittances.filter(r => r.status === 'Remitted'), [remittances]);

  const totalPendingAmountNgn = useMemo(() => {
    return pendingList.reduce((sum, r) => sum + r.amountToRemit, 0);
  }, [pendingList]);

  const totalRemittedAmountNgn = useMemo(() => {
    return remittedList.reduce((sum, r) => sum + r.amountToRemit, 0);
  }, [remittedList]);

  // Distinct agent list from remittances
  const distinctAgents = useMemo(() => {
    const map = new Map<string, string>();
    remittances.forEach(r => {
      if (r.agentId && r.agentName) {
        map.set(r.agentId, r.agentName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [remittances]);

  // Date comparison helper
  const isDateInFilter = (dateStr: string) => {
    if (!dateStr) return true;
    const itemDate = new Date(dateStr);
    const now = new Date();

    if (dateFilter === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      return dateStr.startsWith(todayStr);
    }

    if (dateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return itemDate >= oneWeekAgo && itemDate <= now;
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

    return true;
  };

  // Filtered remittances based on tab, search query, date filter, and agent filter
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

        if (!matchesOrder && !matchesCustomer && !matchesPhone && !matchesAgent && !matchesZone) {
          return false;
        }
      }

      // 2. Agent Filter
      if (selectedAgentId !== 'all' && r.agentId !== selectedAgentId) {
        return false;
      }

      // 3. Date Filter (by delivery date)
      if (!isDateInFilter(r.deliveredDate)) {
        return false;
      }

      return true;
    });
  }, [tab, pendingList, remittedList, searchQuery, selectedAgentId, dateFilter, customStartDate, customEndDate]);

  // Bulk selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredRemittances.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Confirm Single Remittance
  const handleConfirmSingleSettlement = (remittance: Remittance) => {
    markRemittanceAsPaid(remittance.id);
    if (addNotification) {
      addNotification({
        title: 'Remittance Confirmed',
        message: `Settled ₦${remittance.amountToRemit.toLocaleString()} for order ${remittance.orderNumber} from ${remittance.agentName}.`,
        type: 'success'
      });
    }
    setSettlingRemittance(null);
    setPaymentRefInput('');
    setSettlementNoteInput('');
  };

  // Bulk Settlement
  const handleBulkSettle = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    selectedIds.forEach(id => {
      markRemittanceAsPaid(id);
    });

    if (addNotification) {
      addNotification({
        title: 'Bulk Settlement Complete',
        message: `Successfully marked ${count} remittances as settled.`,
        type: 'success'
      });
    }

    setSelectedIds([]);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Order Number', 'Delivered Date', 'Customer Name', 'Customer Phone', 'Agent Name', 'Agent Zone', 'Gross Order Total', 'Delivery Fee Deducted', 'Net Amount Remitted', 'Currency', 'Status', 'Payment Reference'];
    const rows = filteredRemittances.map(r => [
      r.orderNumber,
      r.deliveredDate,
      `"${r.customerName.replace(/"/g, '""')}"`,
      r.customerPhone,
      `"${r.agentName.replace(/"/g, '""')}"`,
      `"${r.agentZone.replace(/"/g, '""')}"`,
      r.orderTotal || (r.amountToRemit + (r.deliveryFeeDeducted || 2500)),
      r.deliveryFeeDeducted || 2500,
      r.amountToRemit,
      r.currency,
      r.status,
      `"${r.paymentReference || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BettaTraka_Remittances_${tab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (addNotification) {
      addNotification({
        title: 'Remittances Exported',
        message: `Exported ${filteredRemittances.length} remittance records to CSV.`,
        type: 'info'
      });
    }
  };

  // Open Order Details Modal
  const handleViewOrder = (orderNumber: string) => {
    const ord = orders.find(o => o.orderNumber === orderNumber);
    if (ord) {
      setSelectedOrderForModal(ord);
    } else {
      setAdminActiveTab('orders');
    }
  };

  // Send WhatsApp Reminder to Agent
  const handleSendAgentWhatsApp = (r: Remittance) => {
    const text = `Hello ${r.agentName}, kindly confirm payment remittance for Order #${r.orderNumber} (Customer: ${r.customerName}).\nNet amount to remit: ₦${r.amountToRemit.toLocaleString()}.\nPlease share bank transfer receipt once sent. Thank you!`;
    const url = createWhatsAppLink(r.customerPhone, text);
    window.open(url, '_blank');
  };

  return (
    <div className="p-3 sm:p-5 lg:p-7 space-y-5 max-w-7xl mx-auto text-slate-100 select-none">
      
      {/* 1. Header Section (Matching Ordello CRM Screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Remittances</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold">
              COD Settled Cash
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Delivered orders awaiting delivery-fee remittance from your agents
          </p>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-slate-400">Pending:</span>
            <span className="font-mono font-bold text-amber-400">
              {formatCurrency(convertAmount(totalPendingAmountNgn, currency), currency)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">({pendingList.length})</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-slate-400">Settled:</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatCurrency(convertAmount(totalRemittedAmountNgn, currency), currency)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">({remittedList.length})</span>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700/80 flex items-center gap-1.5 transition cursor-pointer"
            title="Download CSV Statement"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Controls Row: [ Pending | Remitted ] Pill Switcher + Search Bar (Matching Ordello CRM Screenshot) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Pill Tab Switcher: Pending | Remitted */}
        <div className="inline-flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner self-start">
          <button
            type="button"
            onClick={() => { setTab('pending'); setSelectedIds([]); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              tab === 'pending'
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending {pendingList.length > 0 && <span className="ml-1 text-[10px] font-mono text-amber-400 font-bold">({pendingList.length})</span>}
          </button>
          <button
            type="button"
            onClick={() => { setTab('remitted'); setSelectedIds([]); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              tab === 'remitted'
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Remitted {remittedList.length > 0 && <span className="ml-1 text-[10px] font-mono text-emerald-400 font-bold">({remittedList.length})</span>}
          </button>
        </div>

        {/* Search Bar matching screenshot placeholder: "Search order #, customer, or phone" */}
        <div className="relative flex-1 max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer, or phone"
            className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Date Filters & Subtext Row (Matching Ordello CRM Screenshot) */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Text/Pill Buttons: Today | This Week | This Month | This Year | Date Range */}
          {(['today', 'week', 'month', 'year'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDateFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                dateFilter === d
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {d === 'today' ? 'Today' : d === 'week' ? 'This Week' : d === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}

          {/* Date Range Button */}
          <button
            type="button"
            onClick={() => setShowCustomDateModal(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border ${
              dateFilter === 'custom'
                ? 'bg-emerald-600 text-white border-emerald-500 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-slate-800 bg-slate-900/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {dateFilter === 'custom' && customStartDate && customEndDate
                ? `${customStartDate} → ${customEndDate}`
                : 'Date Range'}
            </span>
          </button>

          {/* Optional Delivery Agent Filter Dropdown */}
          {distinctAgents.length > 0 && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] text-slate-500 hidden sm:inline">Agent:</span>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Agents ({distinctAgents.length})</option>
                {distinctAgents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Subtext: "Filters by delivery date." (matching screenshot) */}
        <p className="text-[11px] text-slate-500 font-normal">
          Filters by delivery date.
        </p>
      </div>

      {/* 4. Bulk Action Floating Bar (When rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/60 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">
              {selectedIds.length} {selectedIds.length === 1 ? 'order' : 'orders'} selected
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-300 font-mono font-bold">
              Total Due: {formatCurrency(convertAmount(
                filteredRemittances
                  .filter(r => selectedIds.includes(r.id))
                  .reduce((sum, r) => sum + r.amountToRemit, 0),
                currency
              ), currency)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {tab === 'pending' && (
              <button
                type="button"
                onClick={handleBulkSettle}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Bulk Confirm Received</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs transition cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Content Container (Matching screenshot card styling) */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#090d16] overflow-hidden shadow-xl min-h-[300px] flex flex-col justify-center">
        
        {/* State A: EMPTY STATE (Matching screenshot: "No delivered orders waiting on remittance right now.") */}
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

            {(searchQuery || selectedAgentId !== 'all' || dateFilter !== 'month') && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedAgentId('all');
                    setDateFilter('month');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-400 hover:text-white transition"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          /* State B: POPULATED TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-mono text-slate-400">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredRemittances.length && filteredRemittances.length > 0}
                      onChange={handleSelectAll}
                      className="accent-emerald-500 rounded cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 font-medium">Order #</th>
                  <th className="py-3 px-4 font-medium">Customer Details</th>
                  <th className="py-3 px-4 font-medium">Delivery Agent & Zone</th>
                  <th className="py-3 px-4 font-medium">Delivered Date</th>
                  <th className="py-3 px-4 font-medium text-right">Order Gross</th>
                  <th className="py-3 px-4 font-medium text-right">Agent Fee</th>
                  <th className="py-3 px-4 font-medium text-right text-emerald-400">Net Remittance Due</th>
                  <th className="py-3 px-4 font-medium text-center">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRemittances.map((r) => {
                  const isChecked = selectedIds.includes(r.id);
                  const grossAmount = r.orderTotal || (r.amountToRemit + (r.deliveryFeeDeducted || 2500));
                  const feeDeducted = r.deliveryFeeDeducted || 2500;

                  return (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isChecked ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(r.id)}
                          className="accent-emerald-500 rounded cursor-pointer"
                        />
                      </td>

                      {/* Order # */}
                      <td className="py-3 px-4 font-mono font-medium text-white whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleViewOrder(r.orderNumber)}
                          className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-bold"
                          title="View order details"
                        >
                          <span>{r.orderNumber}</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </button>
                        <p className="text-[10px] text-slate-500 truncate max-w-[140px]" title={r.productSummary}>
                          {r.productSummary}
                        </p>
                      </td>

                      {/* Customer Details */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white">{r.customerName}</p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>{r.customerPhone}</span>
                        </div>
                      </td>

                      {/* Delivery Agent & Zone */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-200">{r.agentName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block ml-5">
                          Zone: {r.agentZone}
                        </span>
                      </td>

                      {/* Delivered Date */}
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{r.deliveredDate}</span>
                        </div>
                        {r.remittedAt && (
                          <span className="text-[10px] text-emerald-500 block">
                            Settled: {r.remittedAt.split('T')[0] || r.remittedAt}
                          </span>
                        )}
                      </td>

                      {/* Order Gross */}
                      <td className="py-3 px-4 text-right font-mono text-slate-300 whitespace-nowrap">
                        {formatCurrency(convertAmount(grossAmount, currency), currency)}
                      </td>

                      {/* Agent Fee */}
                      <td className="py-3 px-4 text-right font-mono text-slate-400 whitespace-nowrap">
                        -{formatCurrency(convertAmount(feeDeducted, currency), currency)}
                      </td>

                      {/* Net Remittance Due */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap text-sm">
                        {formatCurrency(convertAmount(r.amountToRemit, currency), currency)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {r.status === 'Pending' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Awaiting Settlement</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Settled</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === 'Pending' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setSettlingRemittance(r)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition cursor-pointer flex items-center gap-1"
                                title="Confirm agent has sent payment"
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Confirm Received</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSendAgentWhatsApp(r)}
                                className="p-1 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 hover:text-white transition cursor-pointer"
                                title="Send WhatsApp Remittance Reminder"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Reconciled</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL 1: Confirm Remittance Settlement Dialog */}
      {settlingRemittance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl text-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Confirm Remittance Received</h3>
              </div>
              <button 
                onClick={() => setSettlingRemittance(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Order Number:</span>
                <span className="font-mono font-bold text-white">{settlingRemittance.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Agent:</span>
                <span className="font-medium text-white">{settlingRemittance.agentName} ({settlingRemittance.agentZone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="text-white">{settlingRemittance.customerName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800/80 text-sm font-bold">
                <span className="text-slate-300">Net Remittance Due:</span>
                <span className="font-mono text-emerald-400">
                  {formatCurrency(convertAmount(settlingRemittance.amountToRemit, currency), currency)}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Payment Reference / Transfer Session ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. GTB-TRF-982144 or Zenith NIP"
                  value={paymentRefInput}
                  onChange={(e) => setPaymentRefInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Settlement Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Deposited into main corporate account"
                  value={settlementNoteInput}
                  onChange={(e) => setSettlementNoteInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSettlingRemittance(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold text-xs cursor-pointer hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmSingleSettlement(settlingRemittance)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Mark as Settled
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Custom Date Range Picker */}
      {showCustomDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Select Delivery Date Range</h3>
              </div>
              <button 
                onClick={() => setShowCustomDateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                  setDateFilter('month');
                  setShowCustomDateModal(false);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    setDateFilter('custom');
                  }
                  setShowCustomDateModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Order Details Modal */}
      {selectedOrderForModal && (
        <OrderDetailsModal
          order={selectedOrderForModal}
          onClose={() => setSelectedOrderForModal(null)}
        />
      )}

    </div>
  );
};
