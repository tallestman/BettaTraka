import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Product, ProductPricing, ProductPackage, CurrencyCode } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  Box, 
  Plus, 
  RotateCcw, 
  RefreshCw, 
  Search, 
  Download, 
  DollarSign, 
  Layers, 
  Trash2, 
  Edit3, 
  Eye, 
  Check, 
  X, 
  ChevronDown, 
  Users, 
  MapPin, 
  Warehouse, 
  Package, 
  Gift, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Truck,
  Sliders,
  Grid,
  List
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    updateProductPricing, 
    addPackageToProduct,
    updatePackage,
    deletePackageFromProduct,
    agents, 
    agentStock, 
    stockMovements, 
    assignStockToAgent,
    addWarehouseStock,
    setAgentStockLevel,
    distributors,
    distributorStock,
    assignStockToDistributor,
    currency,
    setCurrency,
    orders,
    createOrderForm,
    setSelectedFormId,
    themeMode
  } = useCrm();

  const isLight = themeMode === 'light';

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showStockHistoryModal, setShowStockHistoryModal] = useState(false);
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);
  const [showAssignDistributorModal, setShowAssignDistributorModal] = useState(false);
  const [distributorAssignId, setDistributorAssignId] = useState('');
  const [distributorProductId, setDistributorProductId] = useState('');
  const [distributorUnits, setDistributorUnits] = useState<number>(50);
  const [distributorNote, setDistributorNote] = useState<string>('');
  const [selectedProductForPricing, setSelectedProductForPricing] = useState<Product | null>(null);
  const [selectedProductForPackages, setSelectedProductForPackages] = useState<Product | null>(null);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  
  // Assign Stock Modal State
  const [showAssignModal, setShowAssignModal] = useState<{ agentId?: string; productId?: string } | null>(null);
  const [assignTargetAgentId, setAssignTargetAgentId] = useState(agents[0]?.id || '');
  const [assignTargetProductId, setAssignTargetProductId] = useState(products[0]?.id || '');
  const [assignUnits, setAssignUnits] = useState<number>(20);

  // Warehouse Restock State (inside Update Stock Modal)
  const [restockProductId, setRestockProductId] = useState(products[0]?.id || '');
  const [restockUnits, setRestockUnits] = useState<number>(50);
  const [updateStockTab, setUpdateStockTab] = useState<'warehouse' | 'agent'>('warehouse');

  // Reorder Trigger Modal State
  const [selectedProductForTrigger, setSelectedProductForTrigger] = useState<Product | null>(null);
  const [triggerThreshold, setTriggerThreshold] = useState<number>(150);
  const [triggerReorderQty, setTriggerReorderQty] = useState<number>(500);
  const [triggerLeadTime, setTriggerLeadTime] = useState<number>(14);
  const [triggerSafetyStock, setTriggerSafetyStock] = useState<number>(50);

  // Agent Stock Matrix State
  const [agentStockViewMode, setAgentStockViewMode] = useState<'cards' | 'matrix'>('cards');
  const [matrixEditCell, setMatrixEditCell] = useState<{ agentId: string; productId: string } | null>(null);
  const [matrixInputValue, setMatrixInputValue] = useState<number>(0);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCost, setNewProdCost] = useState(2500);
  const [newProdPrice, setNewProdPrice] = useState(18500);
  const [newProdStock, setNewProdStock] = useState(100);
  const [newProdCategory, setNewProdCategory] = useState('Beauty & Skincare');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Edit Product Form State
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editCost, setEditCost] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editStock, setEditStock] = useState(0);
  const [editCategory, setEditCategory] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // New Package Builder State
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgQty, setNewPkgQty] = useState(2);
  const [newPkgPrice, setNewPkgPrice] = useState(32000);
  const [newPkgDesc, setNewPkgDesc] = useState('');
  const [newPkgBadge, setNewPkgBadge] = useState('Most Popular');
  const [newPkgHasGift, setNewPkgHasGift] = useState(false);
  const [newPkgGiftProductId, setNewPkgGiftProductId] = useState('');
  const [newPkgGiftName, setNewPkgGiftName] = useState('');
  const [newPkgGiftQty, setNewPkgGiftQty] = useState(1);
  const [newPkgGiftValue, setNewPkgGiftValue] = useState(3500);
  const [packageSuccessMsg, setPackageSuccessMsg] = useState<string | null>(null);

  // Currency options matching BettaTraka format
  const currencyOptions: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
    { code: 'USD', label: 'US Dollar', symbol: '$' },
    { code: 'GHS', label: 'Ghanaian Cedi', symbol: 'GH₵' },
    { code: 'KES', label: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'GBP', label: 'British Pound', symbol: '£' },
    { code: 'EUR', label: 'Euro', symbol: '€' }
  ];

  const currentCurrencyOpt = currencyOptions.find(c => c.code === currency) || currencyOptions[0];

  // Global metric calculations
  const totalWarehouseUnits = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stockWarehouse, 0);
  }, [products]);

  const totalAgentUnits = useMemo(() => {
    return agentStock.reduce((sum, s) => sum + s.unitsHeld, 0);
  }, [agentStock]);

  const totalUnits = totalWarehouseUnits + totalAgentUnits;

  const totalInventoryValueNgn = useMemo(() => {
    return products.reduce((sum, p) => {
      const agentUnitsForProd = agentStock
        .filter(s => s.productId === p.id)
        .reduce((aSum, s) => aSum + s.unitsHeld, 0);
      return sum + ((p.stockWarehouse + agentUnitsForProd) * p.unitCost);
    }, 0);
  }, [products, agentStock]);

  const totalInventoryValueConverted = convertAmount(totalInventoryValueNgn, currency);

  const activeAgentsCount = useMemo(() => {
    return agents.filter(a => a.status !== 'Off Duty').length;
  }, [agents]);

  const distributionRate = totalUnits > 0 
    ? Math.round((totalAgentUnits / totalUnits) * 100) 
    : 0;

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Handlers
  const handleOpenAddModal = () => {
    setNewProdName('');
    setNewProdSku(`SKU-${Date.now().toString().slice(-4)}`);
    setNewProdCost(2500);
    setNewProdPrice(18500);
    setNewProdStock(100);
    setNewProdCategory('Beauty & Skincare');
    setNewProdDesc('');
    setShowAddProductModal(true);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdSku.trim()) return;

    addProduct({
      name: newProdName.trim(),
      description: newProdDesc.trim() || 'Imported Payment-on-Delivery product line.',
      sku: newProdSku.trim().toUpperCase(),
      unitCost: Number(newProdCost) || 0,
      sellingPrice: Number(newProdPrice) || 0,
      stockWarehouse: Number(newProdStock) || 0,
      category: newProdCategory,
      pricing: [
        { 
          currency: 'NGN', 
          sellingPrice: Number(newProdPrice), 
          baseCost: Number(newProdCost), 
          landedCost: Math.round(Number(newProdCost) * 1.3), 
          marginPercent: Math.round(((Number(newProdPrice) - Number(newProdCost)) / Number(newProdPrice)) * 100) 
        }
      ],
      packages: [
        {
          id: `pkg-${Date.now()}-1`,
          productId: '',
          name: '1 Unit Starter Pack',
          description: 'Standard retail package',
          quantity: 1,
          price: Number(newProdPrice),
          currency: 'NGN',
          status: 'Active'
        }
      ]
    });

    setShowAddProductModal(false);
  };

  const handleOpenEdit = (p: Product) => {
    setSelectedProductForEdit(p);
    setEditName(p.name);
    setEditSku(p.sku);
    setEditCost(p.unitCost);
    setEditPrice(p.sellingPrice);
    setEditStock(p.stockWarehouse);
    setEditCategory(p.category);
    setEditDesc(p.description || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForEdit) return;

    updateProduct(selectedProductForEdit.id, {
      name: editName.trim(),
      sku: editSku.trim().toUpperCase(),
      unitCost: Number(editCost),
      sellingPrice: Number(editPrice),
      stockWarehouse: Number(editStock),
      category: editCategory,
      description: editDesc.trim()
    });

    setSelectedProductForEdit(null);
  };

  const handleDeleteProduct = (p: Product) => {
    if (confirm(`Are you sure you want to delete "${p.name}"? This action cannot be undone.`)) {
      if (deleteProduct) {
        deleteProduct(p.id);
      } else {
        alert("Product deleted from view.");
      }
    }
  };

  const openPackageModal = (p: Product) => {
    setSelectedProductForPackages(p);
    setNewPkgName(`Buy 2 Units (${p.name.split(' ')[0]} Duo Pack)`);
    setNewPkgQty(2);
    setNewPkgPrice(Math.round(p.sellingPrice * 2 * 0.85));
    setNewPkgDesc(`Includes 2x units of ${p.name} with fast priority doorstep delivery.`);
    setNewPkgBadge('Most Popular');
    setNewPkgHasGift(false);
    
    const otherProd = products.find(op => op.id !== p.id) || products[0];
    if (otherProd) {
      setNewPkgGiftProductId(otherProd.id);
      setNewPkgGiftName(otherProd.name);
      setNewPkgGiftValue(otherProd.sellingPrice);
    }
    setPackageSuccessMsg(null);
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForPackages || !newPkgName.trim() || newPkgPrice <= 0) return;

    const giftProduct = newPkgHasGift ? products.find(p => p.id === newPkgGiftProductId) : null;
    const finalGiftName = giftProduct ? giftProduct.name : newPkgGiftName;

    addPackageToProduct(selectedProductForPackages.id, {
      name: newPkgName.trim(),
      description: newPkgDesc.trim() || `${newPkgQty}x units of ${selectedProductForPackages.name}`,
      quantity: Number(newPkgQty) || 1,
      price: Number(newPkgPrice),
      currency: 'NGN',
      status: 'Active',
      badge: newPkgBadge.trim() || undefined,
      hasFreeGift: newPkgHasGift,
      freeGiftProductId: giftProduct ? giftProduct.id : undefined,
      freeGiftName: newPkgHasGift ? finalGiftName : undefined,
      freeGiftQuantity: newPkgHasGift ? (Number(newPkgGiftQty) || 1) : undefined,
      freeGiftPerceivedValue: newPkgHasGift ? Number(newPkgGiftValue) : undefined
    });

    setPackageSuccessMsg(`Package "${newPkgName}" added successfully!`);
    setTimeout(() => setPackageSuccessMsg(null), 3000);
  };

  const handleAssignStockSubmit = () => {
    if (!assignTargetAgentId || !assignTargetProductId || assignUnits <= 0) return;
    assignStockToAgent(assignTargetAgentId, assignTargetProductId, Number(assignUnits));
    setShowAssignModal(null);
    setShowUpdateStockModal(false);
    alert(`Successfully transferred ${assignUnits} units to agent!`);
  };

  const handleRestockWarehouse = () => {
    const prod = products.find(p => p.id === restockProductId);
    if (!prod || restockUnits <= 0) return;
    addWarehouseStock(prod.id, Number(restockUnits), 'Factory Restock', 'Added to warehouse stock');
    setShowUpdateStockModal(false);
    alert(`Successfully added ${restockUnits} units to warehouse stock for ${prod.name}!`);
  };

  const handleSaveReorderTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForTrigger) return;
    updateProduct(selectedProductForTrigger.id, {
      reorderThreshold: Number(triggerThreshold),
      reorderQuantity: Number(triggerReorderQty),
      leadTimeDays: Number(triggerLeadTime),
      safetyStock: Number(triggerSafetyStock)
    });
    alert(`Reorder trigger configured for ${selectedProductForTrigger.name}: Alert at ≤ ${triggerThreshold} units!`);
    setSelectedProductForTrigger(null);
  };

  // Export inventory as CSV
  const handleExportCsv = () => {
    const headers = [
      'Product Name',
      'SKU',
      'Category',
      'Unit Cost (NGN)',
      'Selling Price (NGN)',
      'Global Balance',
      'Warehouse Stock',
      'Agent Stock',
      'Units Sold'
    ];

    const rows = products.map(p => {
      const agentUnits = agentStock
        .filter(s => s.productId === p.id)
        .reduce((sum, s) => sum + s.unitsHeld, 0);
      const globalBal = p.stockWarehouse + agentUnits;
      const sold = orders
        .filter(o => o.status === 'DELIVERED')
        .reduce((sum, o) => {
          const item = o.items.find(i => i.productId === p.id);
          return sum + (item ? item.quantity : 0);
        }, 0);

      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.sku}"`,
        `"${p.category}"`,
        `"${p.unitCost}"`,
        `"${p.sellingPrice}"`,
        `"${globalBal}"`,
        `"${p.stockWarehouse}"`,
        `"${agentUnits}"`,
        `"${sold}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bettatraka_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`p-3 sm:p-5 lg:p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in ${
      isLight ? 'text-slate-900' : 'text-slate-100'
    }`}>
      {/* 1. HEADER (BettaTraka Style: Title + Description) */}
      <div className="space-y-1 pb-1">
        <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          Inventory Dashboard
        </h1>
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Centralized management for global balance and localized agent distribution.
        </p>
      </div>

      {/* 2. TOP ACTION & CONTROL BAR (Unified, non-overlapping toolbar) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        {/* Left Side: Currency Selector + Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 max-w-xl">
          {/* Currency Selector */}
          <div className="relative flex-shrink-0">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className={`w-full sm:w-auto text-xs font-medium rounded-xl pl-3 pr-8 py-2 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs border ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50' 
                  : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              {currencyOptions.map((opt) => (
                <option key={opt.code} value={opt.code} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'}>
                  {opt.symbol} {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3.5 h-3.5 absolute right-2.5 top-3 pointer-events-none ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`} />
          </div>

          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 pointer-events-none ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              placeholder="Search SKU or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl pl-8 pr-7 py-2 text-xs focus:outline-none transition border ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500' 
                  : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-2.5 top-2.5 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-white'}`}
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: + Add Stock, + Assign to Distributor, + Add Product, Triggers, Stock History, Update Stock */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* + Add Stock (Emerald) */}
          <button
            onClick={() => {
              setUpdateStockTab('warehouse');
              setShowUpdateStockModal(true);
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition active:scale-95 cursor-pointer whitespace-nowrap flex-1 sm:flex-initial"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Stock</span>
          </button>

          {/* + Assign to Distributor (Lime Green) */}
          <button
            onClick={() => {
              setDistributorAssignId(distributors[0]?.id || '');
              setDistributorProductId(products[0]?.id || '');
              setDistributorUnits(50);
              setShowAssignDistributorModal(true);
            }}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap flex-1 sm:flex-initial border ${
              isLight 
                ? 'bg-lime-50 hover:bg-lime-100 text-lime-900 border-lime-300' 
                : 'bg-lime-600 hover:bg-lime-500 text-black border-lime-500'
            }`}
            title="Allocate Central Warehouse stock to Regional Distributor Hub"
          >
            <Warehouse className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Assign to Distributor</span>
          </button>

          {/* + Add Product */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap flex-1 sm:flex-initial"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>

          {/* Reorder Triggers */}
          <button
            onClick={() => {
              const target = products[0];
              if (target) {
                setSelectedProductForTrigger(target);
                setTriggerThreshold(target.reorderThreshold || 150);
                setTriggerReorderQty(target.reorderQuantity || 500);
                setTriggerLeadTime(target.leadTimeDays || 14);
                setTriggerSafetyStock(target.safetyStock || 50);
              }
            }}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap flex-1 sm:flex-initial border ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-300 text-amber-800' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-300 hover:text-amber-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span>Reorder Triggers</span>
          </button>

          {/* Stock History */}
          <button
            onClick={() => setShowStockHistoryModal(true)}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap flex-1 sm:flex-initial border ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Stock History</span>
          </button>

          {/* Update Stock / Allocation */}
          <button
            onClick={() => setShowUpdateStockModal(true)}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap flex-1 sm:flex-initial border ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Update Stock</span>
          </button>
        </div>
      </div>

      {/* 3. FOUR STATS CARDS (BettaTraka KPI Cards - Zero Overlap & Responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Inventory Value */}
        <div className={`rounded-2xl border p-4 sm:p-5 space-y-2 transition min-w-0 overflow-hidden shadow-xs ${
          isLight 
            ? 'bg-white border-slate-200 text-slate-900' 
            : 'border-slate-800 bg-[#090d16] text-white hover:border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total Inventory Value</p>
            <DollarSign className="w-4 h-4 text-emerald-500 opacity-80 flex-shrink-0" />
          </div>
          <p 
            className={`text-xl sm:text-2xl font-bold font-mono tracking-tight truncate ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
            title={`${currentCurrencyOpt.symbol}${totalInventoryValueConverted.toLocaleString()}`}
          >
            {currentCurrencyOpt.symbol}{totalInventoryValueConverted.toLocaleString()}
          </p>
          <p className={`text-[11px] truncate ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Warehouse + Agent stock</p>
        </div>

        {/* Card 2: Total Units in Stock */}
        <div className={`rounded-2xl border p-4 sm:p-5 space-y-2 transition min-w-0 overflow-hidden shadow-xs ${
          isLight 
            ? 'bg-white border-slate-200 text-slate-900' 
            : 'border-slate-800 bg-[#090d16] text-white hover:border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total Units in Stock</p>
            <Box className="w-4 h-4 text-sky-500 opacity-80 flex-shrink-0" />
          </div>
          <p className={`text-xl sm:text-2xl font-bold font-mono tracking-tight truncate ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {totalUnits.toLocaleString()}
          </p>
          <p className={`text-[11px] truncate ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Warehouse + Agent stock</p>
        </div>

        {/* Card 3: Active Agents */}
        <div className={`rounded-2xl border p-4 sm:p-5 space-y-2 transition min-w-0 overflow-hidden shadow-xs ${
          isLight 
            ? 'bg-white border-slate-200 text-slate-900' 
            : 'border-slate-800 bg-[#090d16] text-white hover:border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Active Agents</p>
            <Users className="w-4 h-4 text-cyan-500 opacity-80 flex-shrink-0" />
          </div>
          <p className={`text-xl sm:text-2xl font-bold font-mono tracking-tight truncate ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {activeAgentsCount}
          </p>
          <p className={`text-[11px] truncate ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Currently active</p>
        </div>

        {/* Card 4: Distribution Rate */}
        <div className={`rounded-2xl border p-4 sm:p-5 space-y-2 transition min-w-0 overflow-hidden shadow-xs ${
          isLight 
            ? 'bg-white border-slate-200 text-slate-900' 
            : 'border-slate-800 bg-[#090d16] text-white hover:border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Distribution Rate</p>
            <TrendingUp className="w-4 h-4 text-amber-500 opacity-80 flex-shrink-0" />
          </div>
          <p className={`text-xl sm:text-2xl font-bold font-mono tracking-tight truncate ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {distributionRate}%
          </p>
          <p className={`text-[11px] truncate ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Of inventory with agents</p>
        </div>
      </div>

      {/* 4. SECTION 1: GLOBAL INVENTORY TABLE */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className={`w-4 h-4 flex-shrink-0 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
            <h2 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Global Inventory</h2>
          </div>
          <button
            onClick={handleExportCsv}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition cursor-pointer shadow-xs ${
              isLight 
                ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700' 
                : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

        <div className={`rounded-2xl border overflow-hidden shadow-xs ${
          isLight ? 'bg-white border-slate-200' : 'border-slate-800 bg-[#090d16]'
        }`}>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[1100px] text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-semibold ${
                  isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-slate-800 bg-slate-950/80 text-slate-300'
                }`}>
                  <th className="py-3.5 px-4 w-[260px] min-w-[240px]">Product Details</th>
                  <th className="py-3.5 px-4 w-[120px] min-w-[100px] whitespace-nowrap">SKU</th>
                  <th className="py-3.5 px-4 w-[110px] min-w-[100px] whitespace-nowrap">Unit Cost</th>
                  <th className="py-3.5 px-4 w-[120px] min-w-[110px] whitespace-nowrap">Selling Price</th>
                  <th className="py-3.5 px-4 w-[100px] min-w-[90px] text-center whitespace-nowrap">Global Balance</th>
                  <th className="py-3.5 px-4 w-[100px] min-w-[90px] text-center whitespace-nowrap">Agent Balance</th>
                  <th className="py-3.5 px-4 w-[90px] min-w-[80px] text-center whitespace-nowrap">Units Sold</th>
                  <th className="py-3.5 px-4 w-[320px] min-w-[310px] text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                      No products found. Click "+ Add Product" to add your first inventory line.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const agentUnitsForProd = agentStock
                      .filter(s => s.productId === p.id)
                      .reduce((sum, s) => sum + s.unitsHeld, 0);
                    const globalBal = p.stockWarehouse + agentUnitsForProd;
                    
                    const soldCount = orders
                      .filter(o => o.status === 'DELIVERED')
                      .reduce((sum, o) => {
                        const item = o.items.find(i => i.productId === p.id);
                        return sum + (item ? item.quantity : 0);
                      }, 0);

                    const unitCostConverted = convertAmount(p.unitCost, currency);
                    const sellingPriceConverted = convertAmount(p.sellingPrice, currency);

                    return (
                      <tr key={p.id} className={`transition-colors group ${
                        isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-900/50'
                      }`}>
                        {/* Product Details */}
                        <td className="py-3.5 px-4 w-[260px] min-w-[240px]">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                              isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}>
                              <Box className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`font-bold text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`} title={p.name}>
                                {p.name}
                              </p>
                              <p className={`text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`} title={p.description || p.category}>
                                {p.description || p.category}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className={`py-3.5 px-4 font-mono text-xs whitespace-nowrap ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          {p.sku}
                        </td>

                        {/* Unit Cost */}
                        <td className={`py-3.5 px-4 font-mono font-medium text-xs whitespace-nowrap ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {currentCurrencyOpt.symbol}{unitCostConverted.toLocaleString()}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-500 text-xs whitespace-nowrap">
                          {currentCurrencyOpt.symbol}{sellingPriceConverted.toLocaleString()}
                        </td>

                        {/* Global Balance */}
                        <td className={`py-3.5 px-4 font-mono font-bold text-center text-xs whitespace-nowrap ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {globalBal}
                        </td>

                        {/* Agent Balance */}
                        <td className={`py-3.5 px-4 font-mono text-center text-xs whitespace-nowrap ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          {agentUnitsForProd}
                        </td>

                        {/* Units Sold */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <p className={`font-mono font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{soldCount}</p>
                          <p className="text-[10px] text-slate-500">units</p>
                        </td>

                        {/* Actions: Details, Edit, $ Pricing, Packages, Delete */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                            {/* + Stock Button */}
                            <button
                              onClick={() => {
                                setRestockProductId(p.id);
                                setUpdateStockTab('warehouse');
                                setShowUpdateStockModal(true);
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                              title="Add Stock to Warehouse"
                            >
                              + Stock
                            </button>

                            {/* Trigger Button */}
                            <button
                              onClick={() => {
                                setSelectedProductForTrigger(p);
                                setTriggerThreshold(p.reorderThreshold || 150);
                                setTriggerReorderQty(p.reorderQuantity || 500);
                                setTriggerLeadTime(p.leadTimeDays || 14);
                                setTriggerSafetyStock(p.safetyStock || 50);
                              }}
                              className={`p-1.5 rounded border transition cursor-pointer ${
                                isLight 
                                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-amber-600' 
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-amber-400 hover:text-amber-300'
                              }`}
                              title="Configure Reorder Trigger"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>

                            {/* Details Button */}
                            <button
                              onClick={() => setSelectedProductForDetails(p)}
                              className={`px-2.5 py-1 rounded border text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                                isLight 
                                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-white'
                              }`}
                            >
                              Details
                            </button>

                            {/* Edit Pencil Button */}
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className={`p-1.5 rounded border transition cursor-pointer ${
                                isLight 
                                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900' 
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
                              }`}
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* $ Pricing Button */}
                            <button
                              onClick={() => setSelectedProductForPricing(p)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                                isLight 
                                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-white'
                              }`}
                            >
                              <DollarSign className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span>Pricing</span>
                            </button>

                            {/* Packages Button */}
                            <button
                              onClick={() => openPackageModal(p)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                                isLight 
                                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-white'
                              }`}
                            >
                              <Layers className="w-3 h-3 text-sky-400 flex-shrink-0" />
                              <span>Packages</span>
                            </button>

                            {/* Delete Trash Button */}
                            <button
                              onClick={() => handleDeleteProduct(p)}
                              className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-400 hover:text-red-300 transition cursor-pointer"
                              title="Delete Product"
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
      </div>

      {/* 5. SECTION 2: AGENT INVENTORY BREAKDOWN (Cards or Allocation Matrix) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 flex-shrink-0 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
            <h2 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Agent Regional Stock & Allocation</h2>
          </div>

          <div className={`flex items-center border rounded-xl p-1 text-xs ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              onClick={() => setAgentStockViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer font-medium ${
                agentStockViewMode === 'cards' 
                  ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setAgentStockViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer font-medium ${
                agentStockViewMode === 'matrix' 
                  ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Allocation Matrix</span>
            </button>
          </div>
        </div>

        {agentStockViewMode === 'matrix' ? (
          <div className={`rounded-2xl border overflow-hidden shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'border-slate-800 bg-[#090d16]'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[11px] font-mono uppercase ${
                    isLight 
                      ? 'border-slate-200 bg-slate-50 text-slate-600' 
                      : 'border-slate-800 bg-slate-950/80 text-slate-400'
                  }`}>
                    <th className={`py-3 px-4 font-semibold border-r ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>Product SKU & Title</th>
                    <th className={`py-3 px-3 font-semibold text-center border-r text-amber-500 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>Warehouse Stock</th>
                    {agents.map(ag => (
                      <th key={ag.id} className={`py-3 px-3 font-semibold text-center border-r min-w-[110px] ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                        <div className={`font-bold truncate max-w-[100px] mx-auto ${isLight ? 'text-slate-900' : 'text-white'}`}>{ag.name}</div>
                        <div className={`text-[10px] font-mono font-normal ${isLight ? 'text-sky-700' : 'text-cyan-400'}`}>{ag.primaryZone}</div>
                      </th>
                    ))}
                    <th className="py-3 px-4 font-semibold text-center text-emerald-500">Total in Field</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800'}`}>
                  {products.map(p => {
                    const totalInField = agentStock
                      .filter(s => s.productId === p.id)
                      .reduce((sum, s) => sum + s.unitsHeld, 0);

                    return (
                      <tr key={p.id} className={isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-900/40'}>
                        <td className={`py-3 px-4 border-r ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                          <span className={`font-semibold block truncate max-w-[180px] ${isLight ? 'text-slate-900' : 'text-white'}`}>{p.name}</span>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{p.sku}</span>
                        </td>
                        <td className={`py-3 px-3 text-center font-mono font-bold text-amber-500 border-r ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                          {p.stockWarehouse} units
                        </td>
                        {agents.map(ag => {
                          const entry = agentStock.find(s => s.agentId === ag.id && s.productId === p.id);
                          const units = entry ? entry.unitsHeld : 0;
                          const isEditing = matrixEditCell?.agentId === ag.id && matrixEditCell?.productId === p.id;

                          return (
                            <td key={ag.id} className={`py-2 px-2 text-center border-r ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    autoFocus
                                    value={matrixInputValue}
                                    onChange={(e) => setMatrixInputValue(Math.max(0, Number(e.target.value)))}
                                    className={`w-14 border rounded px-1.5 py-1 text-center font-mono text-xs font-bold focus:outline-none ${
                                      isLight 
                                        ? 'bg-white border-emerald-500 text-emerald-800' 
                                        : 'bg-slate-950 border-emerald-500 text-emerald-400'
                                    }`}
                                  />
                                  <button
                                    onClick={() => {
                                      setAgentStockLevel(ag.id, p.id, matrixInputValue, 'Matrix edit');
                                      setMatrixEditCell(null);
                                    }}
                                    className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                                  >
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </button>
                                  <button
                                    onClick={() => setMatrixEditCell(null)}
                                    className={`p-1 rounded ${
                                      isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
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
                                  className={`group cursor-pointer py-1 px-2 rounded flex items-center justify-center gap-1 transition ${
                                    isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                                  }`}
                                  title="Click to edit stock level"
                                >
                                  <span className={`font-mono font-bold ${units > 0 ? (isLight ? 'text-slate-900' : 'text-white') : 'text-slate-400'}`}>
                                    {units}
                                  </span>
                                  <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-3 px-4 text-center font-mono font-bold text-emerald-500">
                          {totalInField} units
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Company Main Warehouse Card */}
          <div className={`rounded-2xl border p-5 space-y-4 shadow-xs min-w-0 ${
            isLight ? 'bg-white border-slate-200' : 'border-slate-800 bg-[#090d16]'
          }`}>
            {/* Header: Name, Zone and Status Badge */}
            <div className="flex items-start justify-between gap-2.5 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-10 h-10 rounded-full border font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                  isLight ? 'bg-sky-100 border-sky-300 text-sky-800' : 'bg-cyan-950/80 border-cyan-800/80 text-cyan-400'
                }`}>
                  CW
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`font-bold text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`} title="Company Warehouse">
                    Company Warehouse
                  </h3>
                  <p className={`text-[11px] flex items-center gap-1 mt-0.5 truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">Warehouse (Central Storage)</span>
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 whitespace-nowrap ${
                isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
              }`}>
                Active
              </span>
            </div>

            {/* Stock Capacity Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] gap-2">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Stock Capacity</span>
                <span className={`font-mono font-medium flex-shrink-0 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {totalWarehouseUnits} / 2500 units ({Math.min(100, Math.round((totalWarehouseUnits / 2500) * 100))}%)
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((totalWarehouseUnits / 2500) * 100))}%` }}
                />
              </div>
            </div>

            {/* Assigned Stock / Breakdown */}
            <div className={`py-2 border-t min-h-[50px] flex items-center justify-center ${
              isLight ? 'border-slate-200' : 'border-slate-800/60'
            }`}>
              {totalWarehouseUnits === 0 ? (
                <span className="text-xs text-slate-400">No stock assigned</span>
              ) : (
                <div className="w-full space-y-1">
                  {products.slice(0, 3).map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-2 text-[11px] py-0.5">
                      <span className={`truncate flex-1 min-w-0 ${isLight ? 'text-slate-700' : 'text-slate-300'}`} title={p.name}>
                        {p.name}
                      </span>
                      <span className="font-mono font-bold text-emerald-500 flex-shrink-0">
                        {p.stockWarehouse} units
                      </span>
                    </div>
                  ))}
                  {products.length > 3 && (
                    <p className={`text-[10px] text-center pt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      + {products.length - 3} more product lines in storage
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setShowUpdateStockModal(true);
                  setUpdateStockTab('warehouse');
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition active:scale-95 text-center cursor-pointer whitespace-nowrap"
              >
                Restock Warehouse
              </button>
              <button
                onClick={() => setShowStockHistoryModal(true)}
                className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition text-center cursor-pointer whitespace-nowrap ${
                  isLight 
                    ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800' 
                    : 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200'
                }`}
              >
                View Details
              </button>
            </div>
          </div>

          {/* Regional Delivery Agents Cards */}
          {agents.map((agent) => {
            const agentStockItems = agentStock.filter(s => s.agentId === agent.id);
            const totalUnitsHeld = agentStockItems.reduce((sum, s) => sum + s.unitsHeld, 0);
            const maxCapacity = agent.capacityLimit || 500;
            const capacityPct = Math.min(100, Math.round((totalUnitsHeld / maxCapacity) * 100));
            const initials = agent.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

            return (
              <div key={agent.id} className={`rounded-2xl border p-5 space-y-4 shadow-xs min-w-0 ${
                isLight ? 'bg-white border-slate-200' : 'border-slate-800 bg-[#090d16]'
              }`}>
                {/* Header: Agent Name, Zone and Status Badge */}
                <div className="flex items-start justify-between gap-2.5 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-full border font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                      isLight ? 'bg-sky-100 border-sky-300 text-sky-800' : 'bg-cyan-950/80 border-cyan-800/80 text-cyan-400'
                    }`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-bold text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`} title={agent.name}>
                        {agent.name}
                      </h3>
                      <p className={`text-[11px] flex items-center gap-1 mt-0.5 truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{agent.primaryZone || 'Regional Hub'}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 whitespace-nowrap ${
                    agent.status !== 'Off Duty' 
                      ? isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : isLight ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                {/* Stock Capacity Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] gap-2">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Stock Capacity</span>
                    <span className={`font-mono font-medium flex-shrink-0 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {totalUnitsHeld} / {maxCapacity} units ({capacityPct}%)
                    </span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${capacityPct}%` }}
                    />
                  </div>
                </div>

                {/* Assigned Stock / Breakdown */}
                <div className={`py-2 border-t min-h-[50px] flex items-center justify-center ${
                  isLight ? 'border-slate-200' : 'border-slate-800/60'
                }`}>
                  {agentStockItems.length === 0 || totalUnitsHeld === 0 ? (
                    <span className="text-xs text-slate-400">No stock assigned</span>
                  ) : (
                    <div className="w-full space-y-1">
                      {agentStockItems.map(item => {
                        const prod = products.find(p => p.id === item.productId);
                        return (
                          <div key={`${item.agentId}-${item.productId}`} className="flex items-center justify-between gap-2 text-[11px] py-0.5">
                            <span className={`truncate flex-1 min-w-0 ${isLight ? 'text-slate-700' : 'text-slate-300'}`} title={prod?.name || 'Product'}>
                              {prod?.name || 'Product'}
                            </span>
                            <span className="font-mono font-bold text-emerald-500 flex-shrink-0">
                              {item.unitsHeld} units
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bottom Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setAssignTargetAgentId(agent.id);
                      setShowAssignModal({ agentId: agent.id });
                    }}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition active:scale-95 text-center cursor-pointer whitespace-nowrap"
                  >
                    Assign Stock
                  </button>
                  <button
                    onClick={() => {
                      alert(`Agent: ${agent.name}\nPhone: ${agent.phone}\nZone: ${agent.primaryZone}\nDelivery Success Rate: ${agent.successRate}%\nTotal Units Held: ${totalUnitsHeld}`);
                    }}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition text-center cursor-pointer whitespace-nowrap ${
                      isLight 
                        ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800' 
                        : 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* ========================================================
          MODALS SECTION (High-fidelity modals)
          ======================================================== */}

      {/* 1. ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Box className="w-4 h-4 text-sky-400" />
                Add New Inventory Product
              </h3>
              <button 
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Celebrity Glow Clarifying Serum"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">SKU Identifier *</label>
                  <input
                    type="text"
                    required
                    placeholder="CEL-GLO-527"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="Beauty & Skincare">Beauty & Skincare</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Gadgets & Electronics">Gadgets & Electronics</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Automotive">Automotive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Unit Cost (₦)</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Selling Price (₦)</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. 100% organic spot treatment oil"
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT PRODUCT MODAL */}
      {selectedProductForEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-400" />
                Edit Product: {selectedProductForEdit.name}
              </h3>
              <button 
                onClick={() => setSelectedProductForEdit(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Unit Cost (₦)</label>
                  <input
                    type="number"
                    min="0"
                    value={editCost}
                    onChange={(e) => setEditCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Selling Price (₦)</label>
                  <input
                    type="number"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Warehouse Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductForEdit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. STOCK HISTORY MODAL */}
      {showStockHistoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-sky-400" />
                Stock Movement & Audit Log
              </h3>
              <button 
                onClick={() => setShowStockHistoryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {stockMovements.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No stock movements recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {stockMovements.map((m) => {
                    const isPositive = m.type === 'Restock' || m.type === 'Warehouse to Agent';
                    return (
                      <div key={m.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-white">
                            {m.productName} • <span className="font-mono text-slate-400">{m.type}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {m.fromLocation} → {m.toLocation} {m.referenceOrderOrAgent ? `(${m.referenceOrderOrAgent})` : ''}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {new Date(m.date).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`font-mono font-bold text-sm ${isPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {isPositive ? `+${m.quantity}` : `-${m.quantity}`} units
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowStockHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. UPDATE STOCK / ASSIGN STOCK MODAL */}
      {(showUpdateStockModal || showAssignModal) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-sky-400" />
                Update Stock & Allocation
              </h3>
              <button 
                onClick={() => {
                  setShowUpdateStockModal(false);
                  setShowAssignModal(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle Tabs: Restock Warehouse vs Transfer to Agent */}
            <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                onClick={() => setUpdateStockTab('warehouse')}
                className={`flex-1 py-1.5 font-semibold rounded-lg transition ${
                  updateStockTab === 'warehouse' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Restock Warehouse
              </button>
              <button
                onClick={() => setUpdateStockTab('agent')}
                className={`flex-1 py-1.5 font-semibold rounded-lg transition ${
                  updateStockTab === 'agent' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Transfer to Agent
              </button>
            </div>

            {updateStockTab === 'warehouse' ? (
              <div className="space-y-3.5 text-xs pt-1">
                <div>
                  <label className="text-slate-400 block mb-1">Select Product</label>
                  <select
                    value={restockProductId}
                    onChange={(e) => setRestockProductId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Current: {p.stockWarehouse} units)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Units to Add to Warehouse</label>
                  <input
                    type="number"
                    min="1"
                    value={restockUnits}
                    onChange={(e) => setRestockUnits(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-emerald-400 font-bold"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleRestockWarehouse}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95 cursor-pointer"
                  >
                    Confirm Warehouse Restock
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs pt-1">
                <div>
                  <label className="text-slate-400 block mb-1">Select Delivery Agent</label>
                  <select
                    value={assignTargetAgentId}
                    onChange={(e) => setAssignTargetAgentId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} — {a.primaryZone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Select Product</label>
                  <select
                    value={assignTargetProductId}
                    onChange={(e) => setAssignTargetProductId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Warehouse Available: {p.stockWarehouse} units)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Units to Transfer</label>
                  <input
                    type="number"
                    min="1"
                    value={assignUnits}
                    onChange={(e) => setAssignUnits(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-sky-400 font-bold"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleAssignStockSubmit}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95 cursor-pointer"
                  >
                    Transfer Units to Agent
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. PRODUCT DETAILS MODAL */}
      {selectedProductForDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Box className="w-4 h-4 text-sky-400" />
                Product Details: {selectedProductForDetails.name}
              </h3>
              <button 
                onClick={() => setSelectedProductForDetails(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <p className="text-slate-400">SKU</p>
                  <p className="font-mono font-bold text-white text-sm">{selectedProductForDetails.sku}</p>
                </div>
                <div>
                  <p className="text-slate-400">Category</p>
                  <p className="font-semibold text-white">{selectedProductForDetails.category}</p>
                </div>
                <div>
                  <p className="text-slate-400">Unit Cost</p>
                  <p className="font-mono font-bold text-white">
                    {formatCurrency(selectedProductForDetails.unitCost, 'NGN')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Selling Price</p>
                  <p className="font-mono font-bold text-emerald-400">
                    {formatCurrency(selectedProductForDetails.sellingPrice, 'NGN')}
                  </p>
                </div>
              </div>

              {/* Stock Distribution Breakdown */}
              <div className="space-y-2">
                <span className="font-semibold text-white">Stock Allocation Breakdown</span>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Company Warehouse</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {selectedProductForDetails.stockWarehouse} units
                    </span>
                  </div>
                  {agents.map(a => {
                    const holding = agentStock.find(s => s.agentId === a.id && s.productId === selectedProductForDetails.id);
                    if (!holding || holding.unitsHeld === 0) return null;
                    return (
                      <div key={a.id} className="flex items-center justify-between text-slate-300">
                        <span>{a.name} ({a.primaryZone})</span>
                        <span className="font-mono text-sky-400 font-bold">{holding.unitsHeld} units</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Available Packages */}
              <div className="space-y-2">
                <span className="font-semibold text-white">Configured Package Tiers ({selectedProductForDetails.packages.length})</span>
                <div className="space-y-1.5">
                  {selectedProductForDetails.packages.map(pkg => (
                    <div key={pkg.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{pkg.name}</p>
                        <p className="text-[10px] text-slate-400">{pkg.description}</p>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCurrency(pkg.price, 'NGN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedProductForDetails(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. PRICING MODAL */}
      {selectedProductForPricing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Multi-Currency Landed Pricing: {selectedProductForPricing.name}
              </h3>
              <button 
                onClick={() => setSelectedProductForPricing(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Adjust base retail prices and review gross margin percentages across West and East Africa corridors.
              </p>

              <div className="space-y-2">
                {selectedProductForPricing.pricing.map((pTier) => (
                  <div key={pTier.currency} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{pTier.currency} Corridor</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Base: {pTier.currency} {pTier.baseCost.toLocaleString()} • Landed: {pTier.currency} {pTier.landedCost.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-emerald-400 text-sm">
                        {pTier.currency} {pTier.sellingPrice.toLocaleString()}
                      </p>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                        {pTier.marginPercent}% Margin
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedProductForPricing(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. PACKAGES MODAL */}
      {selectedProductForPackages && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Package Bundles & Free Gifts: {selectedProductForPackages.name}
              </h3>
              <button 
                onClick={() => setSelectedProductForPackages(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Packages List */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-white">Active Checkout Packages ({selectedProductForPackages.packages.length})</span>
              <div className="space-y-2">
                {selectedProductForPackages.packages.map(pkg => (
                  <div key={pkg.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-white">{pkg.name}</p>
                        {pkg.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{pkg.description}</p>
                      {pkg.hasFreeGift && (
                        <p className="text-[10px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          <span>Bonus Gift: {pkg.freeGiftName} (Valued at ₦{pkg.freeGiftPerceivedValue?.toLocaleString()})</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono font-bold text-emerald-400 text-sm">
                        {formatCurrency(pkg.price, 'NGN')}
                      </p>
                      <button
                        onClick={() => deletePackageFromProduct(selectedProductForPackages.id, pkg.id)}
                        className="text-[10px] text-red-400 hover:text-red-300 underline mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Package Builder */}
            <form onSubmit={handleCreatePackage} className="p-4 rounded-xl bg-black border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5 text-sky-400" />
                Add New Package Deal
              </span>

              {packageSuccessMsg && (
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-[11px]">
                  {packageSuccessMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={newPkgName}
                    onChange={(e) => setNewPkgName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Quantity of Units</label>
                  <input
                    type="number"
                    min="1"
                    value={newPkgQty}
                    onChange={(e) => setNewPkgQty(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1">Package Price (₦)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPkgPrice}
                    onChange={(e) => setNewPkgPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={newPkgBadge}
                    onChange={(e) => setNewPkgBadge(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Package Description</label>
                <input
                  type="text"
                  value={newPkgDesc}
                  onChange={(e) => setNewPkgDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPkgHasGift}
                    onChange={(e) => setNewPkgHasGift(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span>Attach Free Bonus Gift from Inventory</span>
                </label>
              </div>

              {newPkgHasGift && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Bonus Product from Inventory</label>
                    <select
                      value={newPkgGiftProductId}
                      onChange={(e) => {
                        setNewPkgGiftProductId(e.target.value);
                        const p = products.find(prod => prod.id === e.target.value);
                        if (p) {
                          setNewPkgGiftName(p.name);
                          setNewPkgGiftValue(p.sellingPrice);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₦{p.sellingPrice.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition shadow"
              >
                + Add Package to Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. REORDER TRIGGER CONFIGURATION MODAL */}
      {selectedProductForTrigger && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-base">Configure Reorder Trigger: {selectedProductForTrigger.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedProductForTrigger(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReorderTrigger} className="space-y-4">
              <p className="text-slate-400 leading-relaxed">
                Configure automated threshold triggers, supplier transit lead times, and replenish batch recommendations.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <label className="text-amber-400 font-semibold block">Reorder Trigger Threshold *</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      required
                      value={triggerThreshold}
                      onChange={(e) => setTriggerThreshold(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white text-xs"
                    />
                    <span className="text-slate-400">units</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Alert triggers when stock ≤ this</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <label className="text-emerald-400 font-semibold block">Recommended PO Batch *</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      required
                      value={triggerReorderQty}
                      onChange={(e) => setTriggerReorderQty(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white text-xs"
                    />
                    <span className="text-slate-400">units</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Suggested order batch size</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Supplier Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={triggerLeadTime}
                    onChange={(e) => setTriggerLeadTime(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Safety Stock Buffer</label>
                  <input
                    type="number"
                    min="0"
                    value={triggerSafetyStock}
                    onChange={(e) => setTriggerSafetyStock(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductForTrigger(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow"
                >
                  Save Trigger Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Stock to Distributor Modal */}
      {showAssignDistributorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-lime-400" />
                <span>Assign Stock to Distributor</span>
              </h3>
              <button 
                onClick={() => setShowAssignDistributorModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!distributorAssignId || !distributorProductId || distributorUnits <= 0) return;
                const prod = products.find(p => p.id === distributorProductId);
                if (prod && prod.stockWarehouse < distributorUnits) {
                  alert(`Insufficient central warehouse stock! Only ${prod.stockWarehouse} units available.`);
                  return;
                }
                assignStockToDistributor(distributorAssignId, distributorProductId, Number(distributorUnits), distributorNote);
                setShowAssignDistributorModal(false);
                setDistributorNote('');
              }} 
              className="space-y-4 text-xs"
            >
              <div>
                <label className="text-slate-300 font-medium block mb-1">Target Regional Distributor</label>
                <select
                  value={distributorAssignId}
                  onChange={(e) => setDistributorAssignId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-lime-500"
                >
                  {distributors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Select Product</label>
                <select
                  value={distributorProductId}
                  onChange={(e) => setDistributorProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-lime-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) • {p.stockWarehouse} units in Central Warehouse
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Units to Allocate from Warehouse</label>
                <input
                  type="number"
                  min="1"
                  value={distributorUnits}
                  onChange={(e) => setDistributorUnits(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-lime-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Waybill Reference / Dispatch Notes</label>
                <textarea
                  rows={2}
                  value={distributorNote}
                  onChange={(e) => setDistributorNote(e.target.value)}
                  placeholder="e.g. Dispatched via interstate logistics transit batch #WB-9901..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-lime-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignDistributorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-extrabold shadow"
                >
                  Allocate to Distributor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
