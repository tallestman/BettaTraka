import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { DeliveryAgent, Product } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { CurrencyCode } from '../../types/crm';
import { 
  Users, 
  Package, 
  Truck, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Plus, 
  Download, 
  ChevronDown, 
  MapPin, 
  Edit3, 
  Trash2, 
  ArrowRightLeft, 
  RotateCcw, 
  X, 
  Check, 
  Phone, 
  CheckCircle2,
  Boxes
} from 'lucide-react';

export const DeliveryAgentsView: React.FC = () => {
  const { 
    agents, 
    agentStock, 
    products, 
    orders, 
    currency, 
    setCurrency,
    addAgent,
    updateAgent,
    deleteAgent,
    assignStockToAgent,
    transferStockAgentToAgent,
    reconcileAgentStock,
    addNotification
  } = useCrm();

  // Search & Filter States (Matching Ordello Screenshot 2)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<DeliveryAgent | null>(null);
  const [managingStockAgent, setManagingStockAgent] = useState<DeliveryAgent | null>(null);
  const [reconcilingAgent, setReconcilingAgent] = useState<DeliveryAgent | null>(null);
  const [transferringAgent, setTransferringAgent] = useState<DeliveryAgent | null>(null);

  // Form states for Add / Edit Agent
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formZone, setFormZone] = useState('');
  const [formSecondaryZones, setFormSecondaryZones] = useState('');
  const [formStatus, setFormStatus] = useState<'Active on Duty' | 'Order in Progress' | 'Off Duty'>('Active on Duty');
  const [formSuccessRate, setFormSuccessRate] = useState<number>(95);
  const [formCapacity, setFormCapacity] = useState<number>(1000);

  // Assign Stock state
  const [assignProductId, setAssignProductId] = useState<string>(products[0]?.id || '');
  const [assignUnits, setAssignUnits] = useState<number>(20);

  // Reconcile state
  const [reconcileProductId, setReconcileProductId] = useState<string>(products[0]?.id || '');
  const [defectiveUnits, setDefectiveUnits] = useState<number>(0);
  const [missingUnits, setMissingUnits] = useState<number>(0);

  // Transfer state
  const [transferProductId, setTransferProductId] = useState<string>(products[0]?.id || '');
  const [toAgentId, setToAgentId] = useState<string>('');
  const [transferUnits, setTransferUnits] = useState<number>(10);

  // Currency options matching Ordello format
  const currencyOptions: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
    { code: 'USD', label: 'US Dollar', symbol: '$' },
    { code: 'GHS', label: 'Ghana Cedi', symbol: 'GH₵' },
    { code: 'KES', label: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'ZAR', label: 'South African Rand', symbol: 'R' },
    { code: 'GBP', label: 'British Pound', symbol: '£' },
    { code: 'EUR', label: 'Euro', symbol: '€' }
  ];

  const currentCurrencyInfo = currencyOptions.find(c => c.code === currency) || currencyOptions[0];

  // Distinct zones for filter dropdown
  const allZones = useMemo(() => {
    const zonesSet = new Set<string>();
    agents.forEach(a => {
      if (a.primaryZone) {
        // Extract simple region/city (e.g. Lagos Mainland, FCT Abuja)
        const simpleName = a.primaryZone.split('(')[0].trim();
        zonesSet.add(simpleName);
      }
    });
    return Array.from(zonesSet);
  }, [agents]);

  // Filtered Agents List (Matching Screenshot 2 toolbar)
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      // Name or phone search
      const matchesSearch = !searchQuery.trim() || 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.phone.includes(searchQuery);

      // Zone filter
      const matchesZone = selectedZoneFilter === 'All' || 
        agent.primaryZone.toLowerCase().includes(selectedZoneFilter.toLowerCase());

      // Status filter
      const matchesStatus = selectedStatusFilter === 'All' || 
        agent.status === selectedStatusFilter;

      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [agents, searchQuery, selectedZoneFilter, selectedStatusFilter]);

  // =========================================================
  // 6 STATS CALCULATIONS (Matching Screenshot 1: agents.png)
  // =========================================================
  const totalAgents = agents.length;
  const onDutyCount = agents.filter(a => a.status === 'Active on Duty').length;

  // Stock with agents monetary value in NGN
  const totalStockWithAgentsNgn = useMemo(() => {
    return agentStock.reduce((sum, s) => {
      const prod = products.find(p => p.id === s.productId);
      const unitValue = prod?.unitCost || prod?.sellingPrice || 4500;
      return sum + (s.unitsHeld * unitValue);
    }, 0);
  }, [agentStock, products]);

  // Pending deliveries count
  const pendingDeliveriesCount = useMemo(() => {
    return orders.filter(o => 
      o.status === 'DISPATCHED' || 
      o.status === 'SCHEDULED' || 
      o.status === 'CONFIRMED'
    ).length;
  }, [orders]);

  // Defective stock total value in NGN
  const totalDefectiveValueNgn = useMemo(() => {
    return agentStock.reduce((sum, s) => {
      const prod = products.find(p => p.id === s.productId);
      const unitVal = prod?.sellingPrice || 24500;
      return sum + (s.defectiveUnits * unitVal);
    }, 0);
  }, [agentStock, products]);

  // Missing stock total value in NGN
  const totalMissingValueNgn = useMemo(() => {
    return agentStock.reduce((sum, s) => {
      const prod = products.find(p => p.id === s.productId);
      const unitVal = prod?.sellingPrice || 24500;
      return sum + (s.missingUnits * unitVal);
    }, 0);
  }, [agentStock, products]);

  // Helper to compute an agent's individual stock value
  const getAgentStockValueNgn = (agentId: string) => {
    const stocks = agentStock.filter(s => s.agentId === agentId);
    return stocks.reduce((sum, s) => {
      const prod = products.find(p => p.id === s.productId);
      const val = prod?.unitCost || 4500;
      return sum + (s.unitsHeld * val);
    }, 0);
  };

  const getAgentUnitsCount = (agentId: string) => {
    return agentStock
      .filter(s => s.agentId === agentId)
      .reduce((sum, s) => sum + s.unitsHeld, 0);
  };

  // Export CSV Handler matching Ordello format
  const handleExportCsv = () => {
    const filename = `ordello_delivery_agents_${new Date().toISOString().slice(0, 10)}.csv`;
    let csv = "Agent Name,Phone,Primary Zone,Status,Success Rate,Units Held,Stock Value (NGN),Defective Stock Value (NGN),Missing Stock Value (NGN)\n";
    
    agents.forEach(a => {
      const val = getAgentStockValueNgn(a.id);
      const units = getAgentUnitsCount(a.id);
      csv += `"${a.name}","${a.phone}","${a.primaryZone}","${a.status}","${a.successRate}%",${units},${val},${a.defectiveStockValue || 0},${a.missingStockValue || 0}\n`;
    });

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (addNotification) {
      addNotification({
        title: 'Export Generated',
        message: 'Delivery agents roster exported as CSV.',
        type: 'success'
      });
    }
  };

  // Open Create Agent Modal
  const handleOpenAddAgent = () => {
    setFormName('');
    setFormPhone('+234 ');
    setFormZone('Lagos Mainland (Ikeja / Surulere)');
    setFormSecondaryZones('Yaba, Maryland');
    setFormStatus('Active on Duty');
    setFormSuccessRate(95);
    setFormCapacity(1000);
    setShowAddModal(true);
  };

  // Submit Create Agent
  const handleCreateAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formZone.trim()) return;

    const secondary = formSecondaryZones.split(',').map(s => s.trim()).filter(Boolean);

    addAgent({
      name: formName.trim(),
      phone: formPhone.trim(),
      primaryZone: formZone.trim(),
      secondaryZones: secondary,
      status: formStatus,
      successRate: Number(formSuccessRate) || 95,
      capacityLimit: Number(formCapacity) || 1000,
      totalStockHeld: 0,
      defectiveStockValue: 0,
      missingStockValue: 0
    });

    if (addNotification) {
      addNotification({
        title: 'Delivery Agent Added',
        message: `${formName.trim()} was registered successfully.`,
        type: 'success'
      });
    }

    setShowAddModal(false);
  };

  // Open Edit Agent Modal
  const handleOpenEdit = (ag: DeliveryAgent) => {
    setEditingAgent(ag);
    setFormName(ag.name);
    setFormPhone(ag.phone);
    setFormZone(ag.primaryZone);
    setFormSecondaryZones(ag.secondaryZones.join(', '));
    setFormStatus(ag.status);
    setFormSuccessRate(ag.successRate);
    setFormCapacity(ag.capacityLimit);
  };

  // Submit Edit Agent
  const handleEditAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent || !formName.trim()) return;

    const secondary = formSecondaryZones.split(',').map(s => s.trim()).filter(Boolean);

    updateAgent(editingAgent.id, {
      name: formName.trim(),
      phone: formPhone.trim(),
      primaryZone: formZone.trim(),
      secondaryZones: secondary,
      status: formStatus,
      successRate: Number(formSuccessRate) || 95,
      capacityLimit: Number(formCapacity) || 1000
    });

    if (addNotification) {
      addNotification({
        title: 'Agent Updated',
        message: `${formName.trim()} profile details updated.`,
        type: 'info'
      });
    }

    setEditingAgent(null);
  };

  // Handle Delete Agent
  const handleDeleteAgent = (ag: DeliveryAgent) => {
    if (confirm(`Are you sure you want to remove delivery agent "${ag.name}"? Active stock allocations will be archived.`)) {
      deleteAgent(ag.id);
      if (addNotification) {
        addNotification({
          title: 'Agent Removed',
          message: `${ag.name} was removed from the roster.`,
          type: 'info'
        });
      }
    }
  };

  // Handle Stock Assignment (Warehouse to Agent)
  const handleAssignStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingStockAgent || !assignProductId || assignUnits <= 0) return;
    
    assignStockToAgent(managingStockAgent.id, assignProductId, Number(assignUnits));
    
    if (addNotification) {
      const prod = products.find(p => p.id === assignProductId);
      addNotification({
        title: 'Stock Dispatched to Agent',
        message: `Dispatched ${assignUnits} units of ${prod?.name || 'Product'} to ${managingStockAgent.name}.`,
        type: 'success'
      });
    }

    setManagingStockAgent(null);
  };

  // Handle Stock Reconciliation
  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcilingAgent || !reconcileProductId) return;

    reconcileAgentStock(reconcilingAgent.id, reconcileProductId, defectiveUnits, missingUnits);

    if (addNotification) {
      addNotification({
        title: 'Stock Reconciled',
        message: `Reconciliation logged for ${reconcilingAgent.name}.`,
        type: 'success'
      });
    }

    setReconcilingAgent(null);
    setDefectiveUnits(0);
    setMissingUnits(0);
  };

  // Handle Agent to Agent Transfer
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringAgent || !toAgentId || transferUnits <= 0) return;

    transferStockAgentToAgent(transferringAgent.id, toAgentId, transferProductId, transferUnits);

    if (addNotification) {
      const targetAgent = agents.find(a => a.id === toAgentId);
      addNotification({
        title: 'Waybill Transfer Complete',
        message: `Transferred ${transferUnits} units from ${transferringAgent.name} to ${targetAgent?.name || 'target hub'}.`,
        type: 'success'
      });
    }

    setTransferringAgent(null);
    setTransferUnits(10);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 animate-in fade-in select-none">
      {/* =========================================================
          1. HEADER (Ordello Style: Sky Blue Title + Description)
          Matching Screenshot 1: agents.png
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-400">
            Agent Logistics & Performance Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage and monitor external delivery agents and their performance metrics across regions
          </p>
        </div>

        {/* Export CSV Button (Ordello Sky Button) */}
        <button
          type="button"
          onClick={handleExportCsv}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs sm:text-sm shadow-sm transition cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4 stroke-[2.2]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Currency Selector & Display Tag (Matching agents.png) */}
      <div className="space-y-2">
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/90 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold text-white transition cursor-pointer shadow-sm"
          >
            <span>{currentCurrencyInfo.symbol} {currentCurrencyInfo.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showCurrencyDropdown && (
            <div className="absolute left-0 mt-1.5 w-52 rounded-xl bg-neutral-950 border border-neutral-800 shadow-2xl z-30 p-1 space-y-0.5 animate-in fade-in">
              {currencyOptions.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setCurrency(opt.code);
                    setShowCurrencyDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition text-left ${
                    currency === opt.code 
                      ? 'bg-sky-600 text-white font-semibold' 
                      : 'text-slate-300 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <span>{opt.symbol} {opt.label}</span>
                  {currency === opt.code && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Currency Tag info banner */}
        <div className="flex items-center text-xs">
          <span className="font-semibold text-white px-2.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800">
            Currency: {currentCurrencyInfo.label}
          </span>
          <span className="text-slate-500 ml-2.5">
            All amounts shown in this currency only
          </span>
        </div>
      </div>

      {/* =========================================================
          2. SIX KPI STATS CARDS (Exact match to Screenshot 1: agents.png)
          Row 1: Total Agents | Active on Duty | Stock with Agents
          Row 2: Pending Deliveries | Defective Stock Value | Missing Stock Value
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Total Agents */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Agents</span>
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <div className="pt-4">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {totalAgents}
            </p>
          </div>
        </div>

        {/* Card 2: Active on Duty (Green dot badge) */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active on Duty</span>
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          </div>
          <div className="pt-4">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {onDutyCount}
            </p>
          </div>
        </div>

        {/* Card 3: Stock with Agents (Orange Box icon) */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Stock with Agents</span>
            <Package className="w-5 h-5 text-amber-500" />
          </div>
          <div className="pt-4">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight truncate">
              {formatCurrency(convertAmount(totalStockWithAgentsNgn, currency), currency)}
            </p>
          </div>
        </div>

        {/* Card 4: Pending Deliveries (Purple Truck icon) */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Deliveries</span>
            <Truck className="w-5 h-5 text-purple-400" />
          </div>
          <div className="pt-4">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {pendingDeliveriesCount}
            </p>
          </div>
        </div>

        {/* Card 5: Defective Stock Value (Red XCircle icon + Red Value) */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Defective Stock Value</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="pt-4">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-red-500 tracking-tight truncate">
              {formatCurrency(convertAmount(totalDefectiveValueNgn, currency), currency)}
            </p>
          </div>
        </div>

        {/* Card 6: Missing Stock Value (Orange AlertTriangle icon + Orange Value) */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Missing Stock Value</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="pt-4">
            <p className="text-3xl sm:text-4xl font-bold font-mono text-amber-500 tracking-tight truncate">
              {formatCurrency(convertAmount(totalMissingValueNgn, currency), currency)}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. SEARCH, ZONE & STATUS FILTERS + "+ Add Agent" BUTTON
          Exact match to Screenshot 2: agents2.png
          ========================================================= */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Search input & 2 Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search by name or phone */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-7 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Zone: All dropdown */}
          <div className="relative">
            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white appearance-none pr-8 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="All">Zone: All</option>
              {allZones.map(zone => (
                <option key={zone} value={zone}>Zone: {zone}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Status: All dropdown */}
          <div className="relative">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white appearance-none pr-8 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="Active on Duty">Status: Active on Duty</option>
              <option value="Order in Progress">Status: Order in Progress</option>
              <option value="Off Duty">Status: Off Duty</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Right Side: + Add Agent Button (Ordello Solid Sky Blue) */}
        <button
          type="button"
          onClick={handleOpenAddAgent}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Agent</span>
        </button>
      </div>

      {/* =========================================================
          4. AGENTS TABLE (Exact match to Screenshot 2: agents2.png)
          Columns: Agent Details | Primary Zone | Status | Success Rate | Stock Value | Actions
          ========================================================= */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/60 text-slate-300 font-semibold text-xs">
                <th className="py-3.5 px-4">Agent Details</th>
                <th className="py-3.5 px-4">Primary Zone</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Success Rate</th>
                <th className="py-3.5 px-4 text-right">Stock Value</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredAgents.length === 0 ? (
                /* Empty state matching Screenshot 2: agents2.png */
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 text-sm font-medium">
                    No agents found
                  </td>
                </tr>
              ) : (
                filteredAgents.map((ag) => {
                  const stockValueNgn = getAgentStockValueNgn(ag.id);
                  const unitsCount = getAgentUnitsCount(ag.id);

                  return (
                    <tr 
                      key={ag.id} 
                      className="hover:bg-neutral-900/40 transition group"
                    >
                      {/* 1. Agent Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {ag.name.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-xs">{ag.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{ag.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Primary Zone */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="font-medium text-xs">{ag.primaryZone}</span>
                        </div>
                        {ag.secondaryZones && ag.secondaryZones.length > 0 && (
                          <p className="text-[10px] text-slate-500 mt-0.5 ml-5">
                            Also: {ag.secondaryZones.join(', ')}
                          </p>
                        )}
                      </td>

                      {/* 3. Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          ag.status === 'Active on Duty'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : ag.status === 'Order in Progress'
                            ? 'bg-sky-950 text-sky-400 border border-sky-800/60'
                            : 'bg-neutral-800 text-slate-300 border border-neutral-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            ag.status === 'Active on Duty' ? 'bg-emerald-400 animate-pulse' :
                            ag.status === 'Order in Progress' ? 'bg-sky-400' : 'bg-slate-400'
                          }`} />
                          <span>{ag.status}</span>
                        </span>
                      </td>

                      {/* 4. Success Rate */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`font-bold ${
                            ag.successRate >= 90 ? 'text-emerald-400' : 
                            ag.successRate >= 80 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {ag.successRate}%
                          </span>
                          <div className="w-12 h-1.5 rounded-full bg-neutral-800 overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full ${
                                ag.successRate >= 90 ? 'bg-emerald-500' : 
                                ag.successRate >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(ag.successRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 5. Stock Value */}
                      <td className="py-3.5 px-4 text-right">
                        <p className="font-mono font-bold text-white tabular-nums text-xs">
                          {formatCurrency(convertAmount(stockValueNgn, currency), currency)}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {unitsCount} / {ag.capacityLimit} units
                        </p>
                      </td>

                      {/* 6. Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manage / Assign Stock */}
                          <button
                            type="button"
                            onClick={() => {
                              setManagingStockAgent(ag);
                              setAssignProductId(products[0]?.id || '');
                              setAssignUnits(20);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-sky-400 hover:text-sky-300 text-[11px] font-semibold transition cursor-pointer"
                            title="Dispatch stock from warehouse to agent"
                          >
                            Stock
                          </button>

                          {/* Reconcile */}
                          <button
                            type="button"
                            onClick={() => {
                              setReconcilingAgent(ag);
                              setReconcileProductId(products[0]?.id || '');
                              setDefectiveUnits(0);
                              setMissingUnits(0);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-amber-400 hover:text-amber-300 text-[11px] font-semibold transition cursor-pointer"
                            title="Audit defective or missing units"
                          >
                            Reconcile
                          </button>

                          {/* Transfer */}
                          <button
                            type="button"
                            onClick={() => {
                              setTransferringAgent(ag);
                              const other = agents.find(a => a.id !== ag.id);
                              setToAgentId(other?.id || '');
                              setTransferProductId(products[0]?.id || '');
                              setTransferUnits(10);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-purple-400 hover:text-purple-300 text-[11px] font-semibold transition cursor-pointer"
                            title="Waybill stock to another hub"
                          >
                            Transfer
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ag)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                            title="Edit Agent Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAgent(ag)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                            title="Remove Agent"
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

      {/* =========================================================
          MODAL 1: ADD NEW DELIVERY AGENT
          ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl text-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-950 text-sky-400 border border-sky-800/60 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Delivery Agent / Rider Fleet</h3>
                  <p className="text-xs text-slate-400">Register a new courier or 3PL partner</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Agent / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Musa Garba Express"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="+234 803 555 4321"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Primary Coverage Zone *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lagos Mainland (Ikeja / Surulere / Yaba)"
                  value={formZone}
                  onChange={(e) => setFormZone(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Secondary Zones (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Ikorodu, Alimosho, Maryland"
                  value={formSecondaryZones}
                  onChange={(e) => setFormSecondaryZones(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Initial Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Active on Duty">Active on Duty</option>
                    <option value="Order in Progress">Order in Progress</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Capacity Limit (units)</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Success Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formSuccessRate}
                    onChange={(e) => setFormSuccessRate(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  Save Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: EDIT DELIVERY AGENT
          ========================================================= */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl text-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 text-sky-400 border border-neutral-800 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Agent Profile</h3>
                  <p className="text-xs text-slate-400">{editingAgent.name}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingAgent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditAgentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Agent / Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Primary Coverage Zone *</label>
                <input
                  type="text"
                  required
                  value={formZone}
                  onChange={(e) => setFormZone(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Secondary Zones</label>
                <input
                  type="text"
                  value={formSecondaryZones}
                  onChange={(e) => setFormSecondaryZones(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Duty Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Active on Duty">Active on Duty</option>
                    <option value="Order in Progress">Order in Progress</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Capacity Limit</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Success Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formSuccessRate}
                    onChange={(e) => setFormSuccessRate(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAgent(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: DISPATCH / ASSIGN STOCK (Warehouse to Agent)
          ========================================================= */}
      {managingStockAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-950 text-sky-400 border border-sky-800/60 flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Dispatch Stock to Agent</h3>
                  <p className="text-xs text-slate-400">{managingStockAgent.name}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setManagingStockAgent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignStockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Select Product</label>
                <select
                  value={assignProductId}
                  onChange={(e) => setAssignProductId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.stockWarehouse} units in Central Warehouse)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Units to Dispatch</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={assignUnits}
                  onChange={(e) => setAssignUnits(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-slate-400 space-y-1">
                <p>• Deducts units from Ikeja Central Warehouse balance.</p>
                <p>• Credits agent's active doorstep inventory.</p>
                <p>• Automatically records an audit movement entry in the ledger.</p>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManagingStockAgent(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  Dispatch Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: RECONCILE DEFECTIVE OR MISSING STOCK
          ========================================================= */}
      {reconcilingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reconcile Stock</h3>
                  <p className="text-xs text-slate-400">{reconcilingAgent.name}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setReconcilingAgent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReconcileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Select Product</label>
                <select
                  value={reconcileProductId}
                  onChange={(e) => setReconcileProductId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Defective Units to Log</label>
                  <input
                    type="number"
                    min="0"
                    value={defectiveUnits}
                    onChange={(e) => setDefectiveUnits(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Missing Units to Log</label>
                  <input
                    type="number"
                    min="0"
                    value={missingUnits}
                    onChange={(e) => setMissingUnits(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Note: Flagged units will be deducted from the agent's available delivery balance and reflected on the financial loss indicators.
              </p>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReconcilingAgent(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  Update Reconciliation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: AGENT-TO-AGENT WAYBILL TRANSFER
          ========================================================= */}
      {transferringAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/60 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Transfer Stock to Another Hub</h3>
                  <p className="text-xs text-slate-400">From: {transferringAgent.name}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setTransferringAgent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Destination Agent / Hub</label>
                <select
                  value={toAgentId}
                  onChange={(e) => setToAgentId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  {agents.filter(a => a.id !== transferringAgent.id).map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.primaryZone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Product</label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Units to Transfer</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={transferUnits}
                  onChange={(e) => setTransferUnits(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransferringAgent(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  Execute Waybill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
