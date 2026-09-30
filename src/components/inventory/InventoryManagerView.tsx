import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Product, AgentStockItem, DeliveryAgent } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Sliders, 
  Check, 
  X, 
  ArrowRight, 
  Boxes, 
  Warehouse, 
  RotateCcw, 
  Edit3, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  Layers, 
  LogOut,
  Clock,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  Grid,
  List,
  Save,
  Info,
  DollarSign,
  Send,
  CornerDownRight
} from 'lucide-react';

export const InventoryManagerView: React.FC = () => {
  const { 
    currentUser, 
    products, 
    addProduct,
    updateProduct,
    deleteProduct,
    agents, 
    agentStock, 
    stockMovements, 
    currency,
    assignStockToAgent,
    returnStockFromAgent,
    addWarehouseStock,
    setAgentStockLevel,
    transferStockAgentToAgent,
    orders,
    setPersona,
    addNotification
  } = useCrm();

  // Tab navigation
  const [invTab, setInvTab] = useState<'inventory' | 'agent-stock' | 'reorder-triggers' | 'movements'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Agent Hub Stock View Switcher
  const [agentViewMode, setAgentViewMode] = useState<'by_agent' | 'matrix' | 'by_product'>('by_agent');

  // Modals
  const [showAddStockModal, setShowAddStockModal] = useState<Product | null>(null);
  const [isGenericAddStockOpen, setIsGenericAddStockOpen] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showReorderConfigModal, setShowReorderConfigModal] = useState<Product | null>(null);
  const [showGlobalTriggerModal, setShowGlobalTriggerModal] = useState(false);
  const [showSetAgentStockModal, setShowSetAgentStockModal] = useState<{ agent?: DeliveryAgent; product?: Product } | null>(null);
  const [showQuickAllocateModal, setShowQuickAllocateModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Add Warehouse Stock Form State
  const [restockProductId, setRestockProductId] = useState<string>('');
  const [restockUnits, setRestockUnits] = useState<number>(100);
  const [restockSupplier, setRestockSupplier] = useState<string>('Guangzhou Apex Logistics');
  const [restockNote, setRestockNote] = useState<string>('');
  const [restockUnitCost, setRestockUnitCost] = useState<number>(0);
  const [updateProductCostCheck, setUpdateProductCostCheck] = useState<boolean>(false);
  const [restockLocation, setRestockLocation] = useState<string>('Central Warehouse - Ikeja Hub (Bay A-04)');
  const [restockWaybill, setRestockWaybill] = useState<string>('');

  // Add New Product Line Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Beauty & Skincare');
  const [newProdSellingPrice, setNewProdSellingPrice] = useState(18500);
  const [newProdUnitCost, setNewProdUnitCost] = useState(2500);
  const [newProdInitialStock, setNewProdInitialStock] = useState(100);
  const [newProdReorderThreshold, setNewProdReorderThreshold] = useState(150);
  const [newProdReorderQuantity, setNewProdReorderQuantity] = useState(500);
  const [newProdLeadTime, setNewProdLeadTime] = useState(14);
  const [newProdSafetyStock, setNewProdSafetyStock] = useState(50);
  const [newProdSupplier, setNewProdSupplier] = useState('Guangzhou Apex Cargo');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Reorder Trigger Configuration Form State
  const [configThreshold, setConfigThreshold] = useState<number>(150);
  const [configReorderQty, setConfigReorderQty] = useState<number>(500);
  const [configLeadTime, setConfigLeadTime] = useState<number>(14);
  const [configSafetyStock, setConfigSafetyStock] = useState<number>(50);
  const [configSupplier, setConfigSupplier] = useState<string>('');

  // Global Reorder Trigger Presets
  const [globalDefaultLeadTime, setGlobalDefaultLeadTime] = useState<number>(14);
  const [globalDefaultSafetyBuffer, setGlobalDefaultSafetyBuffer] = useState<number>(50);

  // Set Agent Stock Form State
  const [agentStockMode, setAgentStockMode] = useState<'set_exact' | 'dispatch_warehouse' | 'return_warehouse' | 'transfer_agent'>('set_exact');
  const [targetAgentId, setTargetAgentId] = useState<string>('');
  const [targetProductId, setTargetProductId] = useState<string>('');
  const [agentStockUnits, setAgentStockUnits] = useState<number>(20);
  const [fromAgentId, setFromAgentId] = useState<string>('');
  const [agentNote, setAgentNote] = useState<string>('');

  // Matrix inline editing cell
  const [matrixEditCell, setMatrixEditCell] = useState<{ agentId: string; productId: string } | null>(null);
  const [matrixInputValue, setMatrixInputValue] = useState<number>(0);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setPersona('marketing');
    if (addNotification) {
      addNotification({
        title: 'Signed Out',
        message: 'You have been logged out of your session.',
        type: 'info'
      });
    }
  };

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => { if (p.category) set.add(p.category); });
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Daily consumption velocity per product (calculated from last 30 days orders)
  const productVelocities = useMemo(() => {
    const velocities: Record<string, { dailyVelocity: number; unitsSold30d: number }> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    products.forEach(p => {
      let units = 0;
      orders.forEach(o => {
        if (o.status === 'DELIVERED' || o.status === 'CONFIRMED' || o.status === 'DISPATCHED') {
          const item = o.items.find(i => i.productId === p.id);
          if (item) units += item.quantity;
        }
      });
      const daily = Math.max(1, Math.round((units / 30) * 10) / 10);
      velocities[p.id] = { dailyVelocity: daily, unitsSold30d: units };
    });
    return velocities;
  }, [products, orders]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Low Stock / Reorder Triggered Products
  const reorderAlerts = useMemo(() => {
    return products.filter(p => {
      const threshold = p.reorderThreshold || 150;
      return p.stockWarehouse <= threshold;
    });
  }, [products]);

  // Total metrics
  const totalWarehouseUnits = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stockWarehouse, 0);
  }, [products]);

  const totalAgentUnits = useMemo(() => {
    return agentStock.reduce((sum, s) => sum + s.unitsHeld, 0);
  }, [agentStock]);

  const totalInventoryUnits = totalWarehouseUnits + totalAgentUnits;

  // Execute Add Stock (Warehouse Restock)
  const handleExecuteAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveProductId = showAddStockModal ? showAddStockModal.id : restockProductId;
    const targetProd = products.find(p => p.id === effectiveProductId);

    if (!targetProd || restockUnits <= 0) return;

    addWarehouseStock(
      targetProd.id, 
      Number(restockUnits), 
      restockSupplier || targetProd.supplierName || 'Factory Restock', 
      `${restockWaybill ? `[${restockWaybill}] ` : ''}${restockNote || 'Warehouse restock received'}`
    );

    if (updateProductCostCheck && restockUnitCost > 0 && restockUnitCost !== targetProd.unitCost) {
      updateProduct(targetProd.id, { unitCost: Number(restockUnitCost) });
    }

    if (addNotification) {
      addNotification({
        title: 'Stock Added to Warehouse',
        message: `+${restockUnits} units successfully received for ${targetProd.name}. New balance: ${(targetProd.stockWarehouse + Number(restockUnits)).toLocaleString()} units.`,
        type: 'success'
      });
    }

    setShowAddStockModal(null);
    setIsGenericAddStockOpen(false);
    setRestockUnits(100);
    setRestockNote('');
    setRestockWaybill('');
  };

  // Execute Add New Product Line
  const handleExecuteAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdSku.trim()) return;

    const newP = addProduct({
      name: newProdName.trim(),
      sku: newProdSku.trim().toUpperCase(),
      sellingPrice: Number(newProdSellingPrice),
      unitCost: Number(newProdUnitCost),
      stockWarehouse: Number(newProdInitialStock),
      reorderThreshold: Number(newProdReorderThreshold),
      reorderQuantity: Number(newProdReorderQuantity),
      leadTimeDays: Number(newProdLeadTime),
      safetyStock: Number(newProdSafetyStock),
      supplierName: newProdSupplier.trim() || 'Guangzhou Apex Cargo',
      category: newProdCategory,
      description: newProdDesc,
      pricing: [
        {
          currency: 'NGN',
          sellingPrice: Number(newProdSellingPrice),
          baseCost: Number(newProdUnitCost),
          landedCost: Number(newProdUnitCost),
          marginPercent: Math.round(((Number(newProdSellingPrice) - Number(newProdUnitCost)) / Number(newProdSellingPrice || 1)) * 100)
        }
      ],
      packages: []
    });

    if (addNotification) {
      addNotification({
        title: 'New Product Added to Inventory',
        message: `${newP.name} (${newP.sku}) added with ${newProdInitialStock} initial warehouse units.`,
        type: 'success'
      });
    }

    setShowAddProductModal(false);
    setNewProdName('');
    setNewProdSku('');
    setNewProdInitialStock(100);
    setNewProdDesc('');
  };

  // Execute Save Reorder Trigger Config
  const handleSaveReorderConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReorderConfigModal) return;

    updateProduct(showReorderConfigModal.id, {
      reorderThreshold: Number(configThreshold),
      reorderQuantity: Number(configReorderQty),
      leadTimeDays: Number(configLeadTime),
      safetyStock: Number(configSafetyStock),
      supplierName: configSupplier
    });

    if (addNotification) {
      addNotification({
        title: 'Reorder Trigger Configured',
        message: `Trigger set for ${showReorderConfigModal.name}: Alert at ≤ ${configThreshold} units (Reorder batch: +${configReorderQty} units).`,
        type: 'success'
      });
    }

    setShowReorderConfigModal(null);
  };

  // Execute Auto-Calibrate All SKU Reorder Triggers
  const handleAutoCalibrateAllTriggers = () => {
    products.forEach(p => {
      const vel = productVelocities[p.id]?.dailyVelocity || 5;
      const lead = p.leadTimeDays || globalDefaultLeadTime;
      const safety = p.safetyStock || globalDefaultSafetyBuffer;
      // Formula: Trigger Threshold = (Velocity * Lead Time) + Safety Stock
      const calculatedThreshold = Math.max(20, Math.round((vel * lead) + safety));
      // Suggested Batch: At least 2 full turnaround cycles
      const calculatedBatch = Math.max(100, Math.round(vel * lead * 2));

      updateProduct(p.id, {
        reorderThreshold: calculatedThreshold,
        reorderQuantity: calculatedBatch,
        leadTimeDays: lead,
        safetyStock: safety
      });
    });

    if (addNotification) {
      addNotification({
        title: 'Reorder Triggers Calibrated',
        message: `Successfully auto-calibrated automated triggers for all ${products.length} products based on 30-day velocity.`,
        type: 'success'
      });
    }

    setShowGlobalTriggerModal(false);
  };

  // Execute Set Agent Stock
  const handleExecuteSetAgentStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAgentId || !targetProductId) return;

    const agent = agents.find(a => a.id === targetAgentId);
    const prod = products.find(p => p.id === targetProductId);
    if (!agent || !prod) return;

    if (agentStockMode === 'set_exact') {
      setAgentStockLevel(
        targetAgentId, 
        targetProductId, 
        Number(agentStockUnits), 
        agentNote || 'Physical stock audit / manager calibration'
      );
      if (addNotification) {
        addNotification({
          title: 'Agent Stock Level Set',
          message: `${agent.name} holding calibrated to ${agentStockUnits} units of ${prod.name}`,
          type: 'success'
        });
      }
    } else if (agentStockMode === 'dispatch_warehouse') {
      if (prod.stockWarehouse < agentStockUnits) {
        alert(`Insufficient warehouse stock! Only ${prod.stockWarehouse} units available in warehouse.`);
        return;
      }
      assignStockToAgent(targetAgentId, targetProductId, Number(agentStockUnits));
      if (addNotification) {
        addNotification({
          title: 'Stock Dispatched to Agent',
          message: `${agentStockUnits} units of ${prod.name} dispatched from Warehouse to ${agent.name}`,
          type: 'success'
        });
      }
    } else if (agentStockMode === 'return_warehouse') {
      const currentEntry = agentStock.find(s => s.agentId === targetAgentId && s.productId === targetProductId);
      const held = currentEntry ? currentEntry.unitsHeld : 0;
      if (held < agentStockUnits) {
        alert(`Cannot return ${agentStockUnits} units. Agent only holds ${held} units.`);
        return;
      }
      returnStockFromAgent(targetAgentId, targetProductId, Number(agentStockUnits), agentNote || 'Returned to warehouse reserve');
      if (addNotification) {
        addNotification({
          title: 'Stock Returned from Agent',
          message: `${agentStockUnits} units of ${prod.name} returned from ${agent.name} back to Central Warehouse`,
          type: 'success'
        });
      }
    } else if (agentStockMode === 'transfer_agent') {
      if (!fromAgentId || fromAgentId === targetAgentId) {
        alert('Please choose a valid distinct source agent.');
        return;
      }
      const fromAgent = agents.find(a => a.id === fromAgentId);
      const fromStock = agentStock.find(s => s.agentId === fromAgentId && s.productId === targetProductId);
      const held = fromStock ? fromStock.unitsHeld : 0;
      if (held < agentStockUnits) {
        alert(`Source agent ${fromAgent?.name} only holds ${held} units.`);
        return;
      }
      transferStockAgentToAgent(fromAgentId, targetAgentId, targetProductId, Number(agentStockUnits));
      if (addNotification) {
        addNotification({
          title: 'Inter-Agent Stock Transfer',
          message: `${agentStockUnits} units of ${prod.name} transferred from ${fromAgent?.name} to ${agent.name}`,
          type: 'success'
        });
      }
    }

    setShowSetAgentStockModal(null);
    setShowQuickAllocateModal(false);
  };

  // Handle Quick Matrix Save
  const handleSaveMatrixCell = (agentId: string, productId: string, units: number) => {
    setAgentStockLevel(agentId, productId, Math.max(0, units), 'Matrix allocation edit');
    setMatrixEditCell(null);
    if (addNotification) {
      addNotification({
        title: 'Stock Assigned',
        message: `Updated allocation to ${units} units`,
        type: 'success'
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-100">
      {/* Inventory Left Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-3 select-none shrink-0">
        <div className="space-y-1">
          {/* Header Card */}
          <div className="pb-3 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <Warehouse className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white text-xs leading-none">{currentUser?.name || 'Inventory Manager'}</p>
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Stock & Logistics Hub</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons on Sidebar */}
          <div className="space-y-1.5 pb-3 border-b border-slate-800">
            <button
              onClick={() => {
                setRestockProductId(products[0]?.id || '');
                setRestockUnits(100);
                const first = products[0];
                setRestockSupplier(first?.supplierName || 'Guangzhou Apex Logistics');
                setRestockUnitCost(first?.unitCost || 0);
                setIsGenericAddStockOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Add Warehouse Stock</span>
            </button>

            <button
              onClick={() => {
                setTargetAgentId(agents[0]?.id || '');
                setTargetProductId(products[0]?.id || '');
                setAgentStockUnits(20);
                setAgentStockMode('set_exact');
                setShowSetAgentStockModal({});
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700/60 transition cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Set Stock with Agent</span>
            </button>
          </div>

          {/* Nav Links */}
          <div className="pt-2 space-y-1">
            {[
              { id: 'inventory', label: 'Central Warehouse Stock', icon: Warehouse, badge: products.length },
              { id: 'agent-stock', label: 'Agent Hub Stock', icon: Truck, badge: agents.length },
              { id: 'reorder-triggers', label: 'Reorder Triggers & Advisory', icon: AlertTriangle, alertBadge: reorderAlerts.length },
              { id: 'movements', label: 'Stock Movement Audit', icon: FileSpreadsheet, badge: stockMovements.length }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = invTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setInvTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.alertBadge && item.alertBadge > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold font-mono">
                      {item.alertBadge}
                    </span>
                  ) : item.badge !== undefined ? (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Inventory Metrics & Log Out */}
        <div className="pt-3 border-t border-slate-800 space-y-2 mt-4">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Warehouse Reserve:</span>
              <span className="font-mono text-white font-bold">{totalWarehouseUnits.toLocaleString()} units</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Agent Hub Custody:</span>
              <span className="font-mono text-cyan-400 font-bold">{totalAgentUnits.toLocaleString()} units</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80">
              <span>Total Inventory:</span>
              <span className="font-mono text-emerald-400 font-bold">{totalInventoryUnits.toLocaleString()} units</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* ==================================================================== */}
        {/* TAB 1: Central Warehouse Inventory */}
        {/* ==================================================================== */}
        {invTab === 'inventory' && (
          <div className="space-y-6">
            {/* Header with High-Visibility Add Stock & Configure Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Central Warehouse Inventory</span>
                  <span className="text-xs bg-emerald-950 text-emerald-400 font-mono px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                    Ikeja Main Facility
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Manage physical warehouse stock, receive shipments, and configure automated reorder thresholds.
                </p>
              </div>

              {/* Action Buttons: Add Stock, Add Product, Configure Triggers */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Add Stock (Restock) Button */}
                <button
                  onClick={() => {
                    setRestockProductId(products[0]?.id || '');
                    setRestockUnits(100);
                    const first = products[0];
                    setRestockSupplier(first?.supplierName || 'Guangzhou Apex Logistics');
                    setRestockUnitCost(first?.unitCost || 0);
                    setIsGenericAddStockOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Add Stock</span>
                </button>

                {/* 2. Add New Product Line */}
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+ New Product SKU</span>
                </button>

                {/* 3. Reorder Settings Shortcut */}
                <button
                  onClick={() => setInvTab('reorder-triggers')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Configure Triggers</span>
                </button>
              </div>
            </div>

            {/* Reorder Alerts Banner */}
            {reorderAlerts.length > 0 && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-2 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{reorderAlerts.length} Products Have Reached Automated Reorder Triggers</span>
                  </div>
                  <button
                    onClick={() => setInvTab('reorder-triggers')}
                    className="text-xs text-amber-300 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Reorder Recommendations</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {reorderAlerts.map(p => (
                    <span key={p.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
                      <span className="font-semibold">{p.name}:</span>
                      <strong>{p.stockWarehouse} units</strong>
                      <span className="text-slate-400">(Trigger at ≤ {p.reorderThreshold || 150})</span>
                      <button
                        onClick={() => {
                          setShowAddStockModal(p);
                          setRestockUnits(p.reorderQuantity || 500);
                          setRestockSupplier(p.supplierName || 'Guangzhou Supplier');
                          setRestockUnitCost(p.unitCost);
                        }}
                        className="ml-1 px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                      >
                        + Restock
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search products by title or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid with Clear Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(p => {
                const threshold = p.reorderThreshold || 150;
                const isLow = p.stockWarehouse <= threshold;
                const velocity = productVelocities[p.id]?.dailyVelocity || 5;
                const daysRemaining = Math.max(0, Math.round(p.stockWarehouse / velocity));
                const stockPercent = Math.min(100, Math.round((p.stockWarehouse / (threshold * 2)) * 100));

                return (
                  <div 
                    key={p.id} 
                    className={`rounded-2xl border p-4 space-y-3 text-xs transition shadow-sm ${
                      isLow 
                        ? 'border-amber-500/50 bg-amber-950/10' 
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-white text-sm block truncate" title={p.name}>
                          {p.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] text-slate-400">{p.category || 'General'}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                        isLow 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' 
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      }`}>
                        {isLow ? 'REORDER NEEDED' : 'HEALTHY'}
                      </span>
                    </div>

                    {/* Stock Reserve Progress Meter */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-400">Warehouse Stock:</span>
                        <div className="text-right">
                          <span className={`font-mono font-bold text-xl ${isLow ? 'text-amber-400' : 'text-white'}`}>
                            {p.stockWarehouse.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">units</span>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isLow ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${stockPercent}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                        <span className="text-amber-300">Trigger Alert: ≤ {threshold} units</span>
                        <span>Estimated Runout: ~{daysRemaining} days</span>
                      </div>
                    </div>

                    {/* Product Details & Specs */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Supplier:</span>
                        <span className="text-slate-200 truncate max-w-[170px]" title={p.supplierName}>
                          {p.supplierName || 'Guangzhou Apex Logistics'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Supplier Lead Time:</span>
                        <span className="font-mono text-slate-200">{p.leadTimeDays || 14} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Unit Landed Cost:</span>
                        <span className="font-mono text-slate-300">
                          {formatCurrency(p.unitCost, 'NGN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Recommended PO Batch:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          +{p.reorderQuantity || 500} units
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Add Stock + Configure Trigger */}
                    <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                      {/* Primary Button: Add Stock */}
                      <button
                        onClick={() => {
                          setShowAddStockModal(p);
                          setRestockUnits(p.reorderQuantity || 100);
                          setRestockSupplier(p.supplierName || 'Guangzhou Supplier');
                          setRestockUnitCost(p.unitCost);
                          setRestockLocation('Central Warehouse - Ikeja Hub');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add Stock</span>
                      </button>

                      {/* Secondary Button: Configure Trigger */}
                      <button
                        onClick={() => {
                          setShowReorderConfigModal(p);
                          setConfigThreshold(p.reorderThreshold || 150);
                          setConfigReorderQty(p.reorderQuantity || 500);
                          setConfigLeadTime(p.leadTimeDays || 14);
                          setConfigSafetyStock(p.safetyStock || 50);
                          setConfigSupplier(p.supplierName || 'Guangzhou Apex Logistics');
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700/60 cursor-pointer"
                        title="Configure Reorder Trigger"
                      >
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span>Trigger</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: Agent Hub Stock (Set Each Stock with Which Agent) */}
        {/* ==================================================================== */}
        {invTab === 'agent-stock' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Agent Regional Hub Stock</span>
                  <span className="text-xs bg-cyan-950 text-cyan-400 font-mono px-2.5 py-0.5 rounded-full border border-cyan-800/60">
                    Field Custody
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Set and manage physical inventory units held with each regional delivery agent across Nigeria.
                </p>
              </div>

              {/* Top Controls: View Switcher & + Set Stock Button */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* View Switcher: By Agent / Stock Allocation Matrix */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-medium">
                  <button
                    onClick={() => setAgentViewMode('by_agent')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      agentViewMode === 'by_agent' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>By Agent Cards</span>
                  </button>
                  <button
                    onClick={() => setAgentViewMode('matrix')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      agentViewMode === 'matrix' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Allocation Matrix</span>
                  </button>
                </div>

                {/* Primary Button: + Set Stock with Agent */}
                <button
                  onClick={() => {
                    setTargetAgentId(agents[0]?.id || '');
                    setTargetProductId(products[0]?.id || '');
                    setAgentStockUnits(20);
                    setAgentStockMode('set_exact');
                    setShowSetAgentStockModal({});
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Set Stock with Agent</span>
                </button>
              </div>
            </div>

            {/* Quick Helper Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Configure exact physical quantities held by delivery agents. You can calibrate exact balances, dispatch from the warehouse, or log inter-agent transfers.
                </span>
              </div>
              <div className="font-mono text-emerald-400 font-bold shrink-0 hidden md:block">
                Total in Field: {totalAgentUnits.toLocaleString()} units
              </div>
            </div>

            {/* VIEW MODE 1: BY AGENT CARDS */}
            {agentViewMode === 'by_agent' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map(ag => {
                  const stocks = agentStock.filter(s => s.agentId === ag.id);
                  const totalUnits = stocks.reduce((sum, s) => sum + s.unitsHeld, 0);

                  return (
                    <div key={ag.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3.5 text-xs shadow-sm">
                      {/* Agent Header */}
                      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{ag.name}</span>
                            <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                              {ag.primaryZone}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{ag.phone} • {ag.secondaryZones?.length ? ag.secondaryZones.join(', ') : ag.primaryZone}</p>
                        </div>

                        {/* Total Held Badge & Assign Button */}
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Total Custody:</span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            {totalUnits} units
                          </span>
                        </div>
                      </div>

                      {/* Product Stock List for this Agent */}
                      <div className="space-y-2">
                        {products.map(p => {
                          const stockEntry = stocks.find(s => s.productId === p.id);
                          const unitsHeld = stockEntry ? stockEntry.unitsHeld : 0;

                          return (
                            <div 
                              key={p.id} 
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/70 text-xs"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="font-semibold text-white block truncate">{p.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  SKU: {p.sku} • Warehouse: {p.stockWarehouse}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Current Units Badge */}
                                <span className="font-mono font-bold text-cyan-300 text-xs bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800/40">
                                  {unitsHeld} held
                                </span>

                                {/* Quick Step Counter: [-5] [+5] */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = Math.max(0, unitsHeld - 5);
                                    setAgentStockLevel(ag.id, p.id, next, `Reduced by 5 units`);
                                  }}
                                  disabled={unitsHeld <= 0}
                                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 text-[10px] font-bold flex items-center justify-center cursor-pointer"
                                  title="Quick decrease by 5 units"
                                >
                                  -5
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = unitsHeld + 5;
                                    setAgentStockLevel(ag.id, p.id, next, `Increased by 5 units`);
                                  }}
                                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center justify-center cursor-pointer"
                                  title="Quick increase by 5 units"
                                >
                                  +5
                                </button>

                                {/* Set Stock Button */}
                                <button
                                  onClick={() => {
                                    setShowSetAgentStockModal({ agent: ag, product: p });
                                    setTargetAgentId(ag.id);
                                    setTargetProductId(p.id);
                                    setAgentStockUnits(unitsHeld);
                                    setAgentStockMode('set_exact');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Set Stock</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Card Bottom Quick Dispatch */}
                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-[11px] text-slate-400">Agent Status: <strong className="text-emerald-400 font-normal">{ag.status}</strong></span>
                        <button
                          onClick={() => {
                            setTargetAgentId(ag.id);
                            setTargetProductId(products[0]?.id || '');
                            setAgentStockUnits(20);
                            setAgentStockMode('dispatch_warehouse');
                            setShowSetAgentStockModal({ agent: ag });
                          }}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch from Warehouse &rarr;</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW MODE 2: STOCK ALLOCATION MATRIX (Set Each Stock with Which Agent) */}
            {agentViewMode === 'matrix' && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
                <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-white">Stock Allocation Matrix</span>
                    <span className="text-slate-400 ml-2">Click any cell to directly set an agent's physical stock level.</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400 uppercase">
                        <th className="py-3 px-4 font-semibold sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                          Product SKU & Title
                        </th>
                        <th className="py-3 px-3 font-semibold text-center bg-slate-950/90 border-r border-slate-800 text-amber-400">
                          Warehouse Reserve
                        </th>
                        {agents.map(ag => (
                          <th key={ag.id} className="py-3 px-3 font-semibold text-center border-r border-slate-800/80 min-w-[120px]">
                            <div className="text-white font-bold truncate max-w-[110px] mx-auto">{ag.name}</div>
                            <div className="text-[10px] text-cyan-400 font-mono font-normal">{ag.primaryZone}</div>
                          </th>
                        ))}
                        <th className="py-3 px-4 font-semibold text-center text-emerald-400">
                          Total in Field
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {products.map(p => {
                        const totalInField = agentStock
                          .filter(s => s.productId === p.id)
                          .reduce((sum, s) => sum + s.unitsHeld, 0);

                        return (
                          <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                            {/* Product Info */}
                            <td className="py-3 px-4 sticky left-0 bg-slate-900 border-r border-slate-800 z-10">
                              <span className="font-semibold text-white block truncate max-w-[200px]" title={p.name}>
                                {p.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                            </td>

                            {/* Warehouse Stock */}
                            <td className="py-3 px-3 text-center font-mono font-bold text-amber-400 border-r border-slate-800 bg-slate-950/30">
                              {p.stockWarehouse} units
                            </td>

                            {/* Agent Stock Cells */}
                            {agents.map(ag => {
                              const entry = agentStock.find(s => s.agentId === ag.id && s.productId === p.id);
                              const units = entry ? entry.unitsHeld : 0;
                              const isEditing = matrixEditCell?.agentId === ag.id && matrixEditCell?.productId === p.id;

                              return (
                                <td key={ag.id} className="py-2 px-2 text-center border-r border-slate-800/60">
                                  {isEditing ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <input
                                        type="number"
                                        min="0"
                                        autoFocus
                                        value={matrixInputValue}
                                        onChange={(e) => setMatrixInputValue(Math.max(0, Number(e.target.value)))}
                                        className="w-16 bg-slate-950 border border-emerald-500 rounded px-1.5 py-1 text-center font-mono text-emerald-400 text-xs font-bold focus:outline-none"
                                      />
                                      <button
                                        onClick={() => handleSaveMatrixCell(ag.id, p.id, matrixInputValue)}
                                        className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                                        title="Save"
                                      >
                                        <Check className="w-3 h-3 stroke-[3]" />
                                      </button>
                                      <button
                                        onClick={() => setMatrixEditCell(null)}
                                        className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                                        title="Cancel"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div 
                                      onClick={() => {
                                        setMatrixEditCell({ agentId: ag.id, productId: p.id });
                                        setMatrixInputValue(units);
                                      }}
                                      className="group cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-800 flex items-center justify-center gap-1.5 transition"
                                      title="Click to edit stock level"
                                    >
                                      <span className={`font-mono font-bold ${units > 0 ? 'text-white' : 'text-slate-600'}`}>
                                        {units}
                                      </span>
                                      <Edit3 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                                    </div>
                                  )}
                                </td>
                              );
                            })}

                            {/* Total in Field */}
                            <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                              {totalInField} units
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: Reorder Recommendation Triggers & Advisory Settings */}
        {/* ==================================================================== */}
        {invTab === 'reorder-triggers' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Reorder Recommendation Trigger Settings</span>
                  <span className="text-xs bg-amber-950 text-amber-300 font-mono px-2.5 py-0.5 rounded-full border border-amber-800/60">
                    Automated Advisory Engine
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Configure automated threshold triggers, supplier transit lead times, and replenish batch recommendations per SKU.
                </p>
              </div>

              {/* Action: Auto-Calibrate All SKU Triggers Button */}
              <button
                onClick={() => setShowGlobalTriggerModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs transition shadow-lg shadow-amber-900/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Auto-Calibrate Triggers (Velocity)</span>
              </button>
            </div>

            {/* Explanation / Calculation Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>How the Automated Reorder Recommendation Trigger Works</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Dynamic 30-Day Sales Velocity Grounding</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-medium">1. Trigger Threshold Point</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Alert fires automatically when warehouse reserve falls to ≤ <strong className="text-amber-400">Trigger Units</strong>. 
                    Calculated as: <em>(Lead Time Days × Daily Velocity) + Safety Buffer</em>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-medium">2. Recommended Batch Size</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Suggests the optimal Purchase Order replenishment batch (e.g. 500 units) to minimize freight overhead and prevent stockouts.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-medium">3. Factory Lead Time</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Factory turnaround + customs clearance time (typically 10-18 days for Guangzhou air freight to Lagos).
                  </p>
                </div>
              </div>
            </div>

            {/* Reorder Triggers Configuration Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <span className="font-bold text-white text-xs">SKU Reorder Trigger Rules</span>
                <span className="text-[11px] text-slate-400">
                  {reorderAlerts.length} of {products.length} products currently below threshold
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400 uppercase">
                      <th className="py-3 px-4 font-semibold">Product SKU & Title</th>
                      <th className="py-3 px-4 font-semibold text-center">Warehouse Stock</th>
                      <th className="py-3 px-4 font-semibold text-center">30d Velocity</th>
                      <th className="py-3 px-4 font-semibold text-center text-amber-400">Trigger Threshold</th>
                      <th className="py-3 px-4 font-semibold text-center text-emerald-400">Recommended Batch</th>
                      <th className="py-3 px-4 font-semibold text-center">Lead Time</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {products.map(p => {
                      const threshold = p.reorderThreshold || 150;
                      const batch = p.reorderQuantity || 500;
                      const lead = p.leadTimeDays || 14;
                      const isTriggered = p.stockWarehouse <= threshold;
                      const velocity = productVelocities[p.id]?.dailyVelocity || 5;

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                          {/* Name & SKU */}
                          <td className="py-3 px-4">
                            <span className="font-semibold text-white block">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                          </td>

                          {/* Warehouse Stock */}
                          <td className="py-3 px-4 text-center font-mono font-bold">
                            <span className={isTriggered ? 'text-amber-400' : 'text-white'}>
                              {p.stockWarehouse} units
                            </span>
                          </td>

                          {/* Velocity */}
                          <td className="py-3 px-4 text-center font-mono text-slate-300">
                            ~{velocity} units/day
                          </td>

                          {/* Trigger Point */}
                          <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">
                            ≤ {threshold} units
                          </td>

                          {/* Suggested Batch */}
                          <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">
                            +{batch} units
                          </td>

                          {/* Lead Time */}
                          <td className="py-3 px-4 text-center font-mono text-slate-300">
                            {lead} days
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              isTriggered 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            }`}>
                              {isTriggered ? 'TRIGGER ACTIVE' : 'OPTIMAL'}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-3 px-4 text-right space-x-2">
                            {isTriggered && (
                              <button
                                onClick={() => {
                                  setShowAddStockModal(p);
                                  setRestockUnits(batch);
                                  setRestockSupplier(p.supplierName || 'Guangzhou Supplier');
                                  setRestockUnitCost(p.unitCost);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                              >
                                + Reorder Now
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setShowReorderConfigModal(p);
                                setConfigThreshold(threshold);
                                setConfigReorderQty(batch);
                                setConfigLeadTime(lead);
                                setConfigSafetyStock(p.safetyStock || 50);
                                setConfigSupplier(p.supplierName || 'Guangzhou Apex Logistics');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
                            >
                              Configure
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: Stock Movement Audit History */}
        {/* ==================================================================== */}
        {invTab === 'movements' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-800">
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Stock Movements & Audit History</span>
                <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                  Audit Ledger
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Full chronological ledger of factory restocks, courier dispatches, and agent stock adjustments.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400 uppercase">
                      <th className="py-3 px-4 font-semibold">Date & Time</th>
                      <th className="py-3 px-4 font-semibold">Product</th>
                      <th className="py-3 px-4 font-semibold">Movement Type</th>
                      <th className="py-3 px-4 font-semibold">From</th>
                      <th className="py-3 px-4 font-semibold">To</th>
                      <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                      <th className="py-3 px-4 font-semibold">Reference Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stockMovements.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No stock movements logged yet.
                        </td>
                      </tr>
                    ) : (
                      stockMovements.map(m => (
                        <tr key={m.id} className="hover:bg-slate-800/20">
                          <td className="py-2.5 px-4 font-mono text-slate-400">{m.date}</td>
                          <td className="py-2.5 px-4 font-semibold text-white">{m.productName}</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                              m.type === 'Restock' 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                : m.type.includes('Return')
                                ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                                : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                            }`}>
                              {m.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-300">{m.fromLocation}</td>
                          <td className="py-2.5 px-4 text-slate-300">{m.toLocation}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                            +{m.quantity}
                          </td>
                          <td className="py-2.5 px-4 text-slate-400 text-[11px]">{m.referenceOrderOrAgent || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==================================================================== */}
      {/* MODAL 1: ADD WAREHOUSE STOCK (RESTOCK INFLOW) */}
      {/* ==================================================================== */}
      {(showAddStockModal || isGenericAddStockOpen) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto text-xs">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Add Warehouse Stock</h2>
                  <p className="text-xs text-slate-400">Receive and credit shipment to Central Warehouse.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAddStockModal(null);
                  setIsGenericAddStockOpen(false);
                }} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAddStock} className="p-5 space-y-4">
              {/* Product Selector */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Product / SKU to Restock *
                </label>
                {showAddStockModal ? (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-white font-semibold">
                    <div>
                      <span>{showAddStockModal.name}</span>
                      <span className="text-slate-400 font-mono text-[10px] block">SKU: {showAddStockModal.sku}</span>
                    </div>
                    <span className="text-xs text-amber-400 font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                      Current: {showAddStockModal.stockWarehouse} units
                    </span>
                  </div>
                ) : (
                  <select
                    value={restockProductId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setRestockProductId(id);
                      const prod = products.find(p => p.id === id);
                      if (prod) {
                        setRestockSupplier(prod.supplierName || 'Guangzhou Apex Logistics');
                        setRestockUnitCost(prod.unitCost || 0);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Current WH Stock: {p.stockWarehouse} units
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Units to Add & Quick Pill Selectors */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-emerald-400">Units Received into Warehouse *</label>
                  <span className="text-[10px] text-slate-400">Quick increments:</span>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  {[25, 50, 100, 250, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRestockUnits(amt)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold border transition cursor-pointer ${
                        restockUnits === amt 
                          ? 'bg-emerald-600 text-white border-emerald-500' 
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockUnits}
                  onChange={(e) => setRestockUnits(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Supplier & Unit Landed Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Supplier / Factory Inflow</label>
                  <input
                    type="text"
                    value={restockSupplier}
                    onChange={(e) => setRestockSupplier(e.target.value)}
                    placeholder="e.g. Guangzhou Apex Cargo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Unit Cost (NGN)</label>
                  <input
                    type="number"
                    min="0"
                    value={restockUnitCost}
                    onChange={(e) => setRestockUnitCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Waybill / Manifest Ref & Facility Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Waybill / Batch Ref</label>
                  <input
                    type="text"
                    value={restockWaybill}
                    onChange={(e) => setRestockWaybill(e.target.value)}
                    placeholder="e.g. WB-LOS-8890"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Receiving Facility</label>
                  <input
                    type="text"
                    value={restockLocation}
                    onChange={(e) => setRestockLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Waybill / Note */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Receiving Audit Notes</label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder="e.g. Cleared Apapa port, sealed packaging verified by QA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              {/* Calculation Preview */}
              {(() => {
                const currentProd = showAddStockModal || products.find(p => p.id === restockProductId) || products[0];
                const currentStock = currentProd ? currentProd.stockWarehouse : 0;
                const newTotal = currentStock + Number(restockUnits);

                return (
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Warehouse Stock Impact:</span>
                      <span className="text-slate-300">{currentStock} current + <strong className="text-emerald-400">+{restockUnits} added</strong></span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">New Total:</span>
                      <span className="font-bold text-emerald-400 text-base">
                        {newTotal.toLocaleString()} units
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStockModal(null);
                    setIsGenericAddStockOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 cursor-pointer"
                >
                  Confirm & Credit Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: ADD NEW PRODUCT LINE (NEW SKU) */}
      {/* ==================================================================== */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto text-xs">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Add New Product Line</h2>
                  <p className="text-xs text-slate-400">Create new SKU in warehouse catalog.</p>
                </div>
              </div>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAddProduct} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24K Gold Collagen Skin Serum"
                  value={newProdName}
                  onChange={(e) => {
                    setNewProdName(e.target.value);
                    if (!newProdSku) {
                      const autoSku = e.target.value.split(' ').map(w => w[0]).join('').slice(0, 4).toUpperCase();
                      if (autoSku) setNewProdSku(`SKU-${autoSku}-01`);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SKU-GLD-01"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Beauty & Skincare">Beauty & Skincare</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Fitness & Body">Fitness & Body</option>
                    <option value="General Products">General Products</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Unit Landed Cost (NGN)</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdUnitCost}
                    onChange={(e) => setNewProdUnitCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-emerald-400 block mb-1">Selling Price (NGN)</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdSellingPrice}
                    onChange={(e) => setNewProdSellingPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-white block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdInitialStock}
                    onChange={(e) => setNewProdInitialStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-amber-400 block mb-1">Trigger Point</label>
                  <input
                    type="number"
                    min="1"
                    value={newProdReorderThreshold}
                    onChange={(e) => setNewProdReorderThreshold(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-emerald-400 block mb-1">PO Batch</label>
                  <input
                    type="number"
                    min="1"
                    value={newProdReorderQuantity}
                    onChange={(e) => setNewProdReorderQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Default Supplier</label>
                <input
                  type="text"
                  value={newProdSupplier}
                  onChange={(e) => setNewProdSupplier(e.target.value)}
                  placeholder="e.g. Guangzhou Apex Cargo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 cursor-pointer"
                >
                  Create Product & Catalog SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: CONFIGURE REORDER RECOMMENDATION TRIGGER */}
      {/* ==================================================================== */}
      {showReorderConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto text-xs">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Configure Reorder Trigger</h2>
                  <p className="text-xs text-slate-400">{showReorderConfigModal.name}</p>
                </div>
              </div>
              <button onClick={() => setShowReorderConfigModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReorderConfig} className="p-5 space-y-4">
              {/* Trigger Threshold & Suggested Reorder Batch */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <label className="text-[11px] font-semibold text-amber-400 block">
                    Reorder Trigger Threshold *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      required
                      value={configThreshold}
                      onChange={(e) => setConfigThreshold(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-slate-400 text-[11px]">units</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Alert triggers when stock ≤ this</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <label className="text-[11px] font-semibold text-emerald-400 block">
                    Suggested PO Batch Size *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      required
                      value={configReorderQty}
                      onChange={(e) => setConfigReorderQty(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-slate-400 text-[11px]">units</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Recommended order batch size</span>
                </div>
              </div>

              {/* Lead Time & Safety Buffer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Supplier Lead Time (Days)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      value={configLeadTime}
                      onChange={(e) => setConfigLeadTime(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs"
                    />
                    <span className="text-slate-400">days</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Safety Stock Buffer
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={configSafetyStock}
                      onChange={(e) => setConfigSafetyStock(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs"
                    />
                    <span className="text-slate-400">units</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Supplier Origin / Contact</label>
                <input
                  type="text"
                  value={configSupplier}
                  onChange={(e) => setConfigSupplier(e.target.value)}
                  placeholder="e.g. Guangzhou Apex Cargo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              {/* Smart Recommendation Assist Button */}
              {(() => {
                const vel = productVelocities[showReorderConfigModal.id]?.dailyVelocity || 5;
                const smartThreshold = Math.max(20, Math.round((vel * configLeadTime) + configSafetyStock));
                const smartBatch = Math.max(100, Math.round(vel * configLeadTime * 2));

                return (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Smart Velocity Calculation:</span>
                      <span className="text-slate-200 text-xs">
                        ~{vel} units/day velocity &rarr; <strong>{smartThreshold} units threshold</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setConfigThreshold(smartThreshold);
                        setConfigReorderQty(smartBatch);
                      }}
                      className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold hover:bg-amber-500/30 cursor-pointer"
                    >
                      Use Recommended
                    </button>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReorderConfigModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  Save Trigger Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: AUTO-CALIBRATE ALL SKU TRIGGERS */}
      {/* ==================================================================== */}
      {showGlobalTriggerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto text-xs">
            <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-base">Auto-Calibrate All Reorder Triggers</h3>
              </div>
              <button onClick={() => setShowGlobalTriggerModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                This will recalculate the reorder recommendation threshold for all <strong>{products.length} products</strong> using their real 30-day order velocity, supplier turnaround lead time, and safety buffer.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Default Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={globalDefaultLeadTime}
                    onChange={(e) => setGlobalDefaultLeadTime(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Safety Buffer (Units)</label>
                  <input
                    type="number"
                    min="0"
                    value={globalDefaultSafetyBuffer}
                    onChange={(e) => setGlobalDefaultSafetyBuffer(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-[11px]">
                Formula: <code>(Daily Sales Velocity × {globalDefaultLeadTime} days) + {globalDefaultSafetyBuffer} buffer units</code>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGlobalTriggerModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAutoCalibrateAllTriggers}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Apply to All {products.length} Products
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: SET STOCK WITH AGENT (ALLOCATE / TRANSFER / RECONCILE) */}
      {/* ==================================================================== */}
      {(showSetAgentStockModal || showQuickAllocateModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto text-xs">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Set Stock with Delivery Agent</h2>
                  <p className="text-xs text-slate-400">Assign, dispatch, or calibrate physical units held with regional agents.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowSetAgentStockModal(null);
                  setShowQuickAllocateModal(false);
                }} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteSetAgentStock} className="p-5 space-y-4">
              {/* Method Selection Tabs */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Stock Action Mode</label>
                <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setAgentStockMode('set_exact')}
                    className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                      agentStockMode === 'set_exact' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Set Exact
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgentStockMode('dispatch_warehouse')}
                    className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                      agentStockMode === 'dispatch_warehouse' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dispatch WH
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgentStockMode('return_warehouse')}
                    className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                      agentStockMode === 'return_warehouse' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Return WH
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgentStockMode('transfer_agent')}
                    className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                      agentStockMode === 'transfer_agent' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Transfer
                  </button>
                </div>
              </div>

              {/* Select Target Agent */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Target Delivery Agent *
                </label>
                <select
                  value={targetAgentId}
                  onChange={(e) => setTargetAgentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {agents.map(ag => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.primaryZone}) — Current Total Stock: {ag.totalStockHeld || 0} units
                    </option>
                  ))}
                </select>
              </div>

              {/* If Inter-Agent Transfer: From Agent */}
              {agentStockMode === 'transfer_agent' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Source Agent (From) *</label>
                  <select
                    value={fromAgentId}
                    onChange={(e) => setFromAgentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">-- Choose Source Agent --</option>
                    {agents.filter(a => a.id !== targetAgentId).map(ag => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name} ({ag.primaryZone})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Select Product */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Product SKU *</label>
                <select
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Available in Warehouse: {p.stockWarehouse} units
                    </option>
                  ))}
                </select>
              </div>

              {/* Units Input & Presets */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-emerald-400">
                    {agentStockMode === 'set_exact' && 'Set Exact Stock Quantity held with Agent *'}
                    {agentStockMode === 'dispatch_warehouse' && 'Units to Dispatch from Warehouse *'}
                    {agentStockMode === 'return_warehouse' && 'Units to Return to Warehouse *'}
                    {agentStockMode === 'transfer_agent' && 'Units to Transfer *'}
                  </label>
                  <span className="text-[10px] text-slate-400">Quick increments:</span>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  {[5, 10, 20, 50, 100].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAgentStockUnits(amt)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold border transition cursor-pointer ${
                        agentStockUnits === amt 
                          ? 'bg-emerald-600 text-white border-emerald-500' 
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="0"
                  required
                  value={agentStockUnits}
                  onChange={(e) => setAgentStockUnits(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Reference Note */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Audit / Waybill Note</label>
                <input
                  type="text"
                  value={agentNote}
                  onChange={(e) => setAgentNote(e.target.value)}
                  placeholder="e.g. Weekly physical inventory count calibration / courier manifest"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              {/* Live Preview Box */}
              {(() => {
                const targetAg = agents.find(a => a.id === targetAgentId);
                const currentStockItem = agentStock.find(s => s.agentId === targetAgentId && s.productId === targetProductId);
                const currentHeld = currentStockItem ? currentStockItem.unitsHeld : 0;
                const prod = products.find(p => p.id === targetProductId);

                let nextAgentHeld = currentHeld;
                let nextWarehouse = prod?.stockWarehouse || 0;

                if (agentStockMode === 'set_exact') {
                  nextAgentHeld = agentStockUnits;
                } else if (agentStockMode === 'dispatch_warehouse') {
                  nextAgentHeld = currentHeld + agentStockUnits;
                  nextWarehouse = Math.max(0, (prod?.stockWarehouse || 0) - agentStockUnits);
                } else if (agentStockMode === 'return_warehouse') {
                  nextAgentHeld = Math.max(0, currentHeld - agentStockUnits);
                  nextWarehouse = (prod?.stockWarehouse || 0) + agentStockUnits;
                }

                return (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{targetAg?.name || 'Agent'} Holding:</span>
                      <span className="text-cyan-400 font-bold">{currentHeld} &rarr; {nextAgentHeld} units</span>
                    </div>
                    {agentStockMode !== 'set_exact' && agentStockMode !== 'transfer_agent' && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Warehouse Balance:</span>
                        <span className="text-emerald-400 font-bold">{prod?.stockWarehouse || 0} &rarr; {nextWarehouse} units</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSetAgentStockModal(null);
                    setShowQuickAllocateModal(false);
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 cursor-pointer"
                >
                  Save Stock Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 6: LOG OUT CONFIRMATION */}
      {/* ==================================================================== */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Log Out of Inventory Portal?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You will be signed out of your inventory manager session.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
