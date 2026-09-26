import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Product, ProductPricing, ProductPackage, CurrencyCode } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  Package, 
  Plus, 
  History, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  Truck, 
  X, 
  Check, 
  ArrowRight,
  Gift,
  FormInput,
  ExternalLink,
  Copy,
  Trash2,
  Sparkles,
  Tag
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    updateProductPricing, 
    addPackageToProduct,
    updatePackage,
    deletePackageFromProduct,
    agents, 
    agentStock, 
    stockMovements, 
    assignStockToAgent,
    currency,
    orderForms,
    createOrderForm,
    setSelectedFormId,
    setAdminActiveTab,
    setPersona
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'global' | 'agents' | 'movements'>('global');
  const [selectedProductForPricing, setSelectedProductForPricing] = useState<Product | null>(null);
  const [selectedProductForPackages, setSelectedProductForPackages] = useState<Product | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<{ agentId: string; productId: string } | null>(null);
  const [assignUnits, setAssignUnits] = useState<number>(20);

  // Quick form creation state from product row
  const [quickFormProduct, setQuickFormProduct] = useState<Product | null>(null);
  const [quickFormTitle, setQuickFormTitle] = useState('');
  const [quickFormSlug, setQuickFormSlug] = useState('');
  const [quickFormBtnColor, setQuickFormBtnColor] = useState('#059669');
  const [quickFormCreatedNotice, setQuickFormCreatedNotice] = useState<string | null>(null);

  // New Package Builder State inside Package Modal
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgQty, setNewPkgQty] = useState(2);
  const [newPkgPrice, setNewPkgPrice] = useState(40000);
  const [newPkgDesc, setNewPkgDesc] = useState('');
  const [newPkgBadge, setNewPkgBadge] = useState('Most Popular');
  const [newPkgHasGift, setNewPkgHasGift] = useState(false);
  const [newPkgGiftProductId, setNewPkgGiftProductId] = useState('');
  const [newPkgGiftName, setNewPkgGiftName] = useState('');
  const [newPkgGiftQty, setNewPkgGiftQty] = useState(1);
  const [newPkgGiftValue, setNewPkgGiftValue] = useState(3500);
  const [packageSuccessMsg, setPackageSuccessMsg] = useState<string | null>(null);

  const openPackageModal = (p: Product) => {
    setSelectedProductForPackages(p);
    setNewPkgName(`Buy 2 Units (${p.name.split(' ')[0]} Duo Pack)`);
    setNewPkgQty(2);
    setNewPkgPrice(Math.round(p.sellingPrice * 2 * 0.85)); // 15% bundle discount
    setNewPkgDesc(`Includes 2x units of ${p.name} with fast priority doorstep delivery.`);
    setNewPkgBadge('Most Popular');
    setNewPkgHasGift(false);
    
    // Choose other product as default free gift suggestion
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

    setPackageSuccessMsg(`Package "${newPkgName}" ${newPkgHasGift ? `with free bonus gift "${finalGiftName}"` : ''} added successfully!`);
    setTimeout(() => setPackageSuccessMsg(null), 3500);

    // Setup next suggested tier
    setNewPkgName(`Buy 3 Units (Family Value Pack)`);
    setNewPkgQty(3);
    setNewPkgPrice(Math.round(selectedProductForPackages.sellingPrice * 3 * 0.75));
    setNewPkgDesc(`Includes 3x units of ${selectedProductForPackages.name} + VIP delivery.`);
    setNewPkgBadge('Best Value');
  };

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCost, setNewProdCost] = useState(4000);
  const [newProdPrice, setNewProdPrice] = useState(25000);
  const [newProdStock, setNewProdStock] = useState(200);
  const [newProdCategory, setNewProdCategory] = useState('Beauty & Skincare');
  const [autoCreateOrderForm, setAutoCreateOrderForm] = useState(true);

  // Stats
  const totalWarehouseUnits = products.reduce((sum, p) => sum + p.stockWarehouse, 0);
  const totalAgentUnits = agentStock.reduce((sum, s) => sum + s.unitsHeld, 0);
  const totalUnits = totalWarehouseUnits + totalAgentUnits;
  
  const totalInventoryValueNgn = products.reduce((sum, p) => {
    const agentUnitsForProd = agentStock
      .filter(s => s.productId === p.id)
      .reduce((aSum, s) => aSum + s.unitsHeld, 0);
    return sum + ((p.stockWarehouse + agentUnitsForProd) * p.unitCost);
  }, 0);

  const distributionRate = totalUnits > 0 ? Math.round((totalAgentUnits / totalUnits) * 100) : 0;
  const activeAgentsCount = agents.filter(a => a.status !== 'Off Duty').length;

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdSku) return;

    const newProd = addProduct({
      name: newProdName,
      description: 'Imported Payment-on-Delivery product line.',
      sku: newProdSku,
      unitCost: newProdCost,
      sellingPrice: newProdPrice,
      stockWarehouse: newProdStock,
      category: newProdCategory,
      pricing: [
        { currency: 'NGN', sellingPrice: newProdPrice, baseCost: newProdCost, landedCost: newProdCost * 1.3, marginPercent: 72 },
        { currency: 'USD', sellingPrice: Math.round(newProdPrice / 1500), baseCost: Math.round(newProdCost / 1500), landedCost: Math.round((newProdCost * 1.3) / 1500), marginPercent: 72 }
      ],
      packages: [
        {
          id: `pkg-${Date.now()}-1`,
          productId: '',
          name: '1 Unit Starter Pack',
          description: 'Standard retail pack',
          quantity: 1,
          price: newProdPrice,
          currency: 'NGN',
          status: 'Active'
        }
      ]
    });

    if (autoCreateOrderForm && newProd) {
      const prodSlug = newProdName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const form = createOrderForm({
        title: `${newProdName} Order Form`,
        slug: `${prodSlug}-${Date.now().toString().slice(-4)}`,
        productId: newProd.id,
        status: 'Active',
        config: {
          productId: newProd.id,
          formTitle: newProdName,
          stateInputType: 'dropdown',
          packagePosition: 'before_questions',
          showEmailField: true,
          isEmailRequired: false,
          showWhatsAppField: true,
          isWhatsAppRequired: true,
          isAddressRequired: true,
          isCityRequired: true,
          showPackageName: true,
          showDeliveryWindowQuestion: true,
          requireConfirmationCheckbox: true,
          showCommitmentFeeNotice: true,
          commitmentFeeAmount: 2000,
          buttonText: `ORDER ${newProdName.split(' ')[0].toUpperCase()} (PAY ON DELIVERY)`,
          buttonColor: '#059669',
          borderThickness: 'medium',
          placeholderDarkness: 'medium',
          additionalQuestions: [],
          orderBumps: [
            {
              id: `bump-${Date.now()}`,
              name: 'Priority VIP Express Dispatch',
              price: 2000,
              description: 'Order prioritized for early morning courier delivery'
            }
          ]
        }
      });
      setSelectedFormId(form.id);
    }

    setShowAddProductModal(false);
    setNewProdName('');
    setNewProdSku('');
  };

  const handleQuickCreateForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickFormProduct) return;

    const slug = quickFormSlug.trim()
      ? quickFormSlug.toLowerCase().replace(/[^a-z0-9]/g, '-')
      : `${quickFormProduct.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newForm = createOrderForm({
      title: quickFormTitle || `${quickFormProduct.name} Checkout Form`,
      slug,
      productId: quickFormProduct.id,
      status: 'Active',
      config: {
        productId: quickFormProduct.id,
        formTitle: quickFormProduct.name,
        stateInputType: 'dropdown',
        packagePosition: 'before_questions',
        showEmailField: true,
        isEmailRequired: false,
        showWhatsAppField: true,
        isWhatsAppRequired: true,
        isAddressRequired: true,
        isCityRequired: true,
        showPackageName: true,
        showDeliveryWindowQuestion: true,
        requireConfirmationCheckbox: true,
        showCommitmentFeeNotice: true,
        commitmentFeeAmount: 2000,
        buttonText: `ORDER ${quickFormProduct.name.split(' ')[0].toUpperCase()} (PAY ON DELIVERY)`,
        buttonColor: quickFormBtnColor,
        borderThickness: 'medium',
        placeholderDarkness: 'medium',
        additionalQuestions: [],
        orderBumps: [
          {
            id: `bump-${Date.now()}`,
            name: 'VIP Priority Delivery',
            price: 2000,
            description: 'Fast-tracked dispatch'
          }
        ]
      }
    });

    setQuickFormCreatedNotice(`Order form "${newForm.title}" created successfully! Slug: /${newForm.slug}`);
    setSelectedFormId(newForm.id);
  };

  const handleAssignStock = () => {
    if (!showAssignModal || assignUnits <= 0) return;
    assignStockToAgent(showAssignModal.agentId, showAssignModal.productId, assignUnits);
    setShowAssignModal(null);
    alert(`Successfully assigned ${assignUnits} units to agent!`);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Inventory & Agent Stock
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global warehouse stock, multi-currency landed pricing, package bundles, and regional agent breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 4 Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Inventory Cost</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(convertAmount(totalInventoryValueNgn, currency), currency)}
          </p>
          <p className="text-[11px] text-slate-500">Warehouse + agents at unit cost</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Units in Stock</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {totalUnits.toLocaleString()} units
          </p>
          <p className="text-[11px] text-slate-500">
            {totalWarehouseUnits} warehouse · {totalAgentUnits} agents
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Active Agents</p>
          <p className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {activeAgentsCount} agents
          </p>
          <p className="text-[11px] text-slate-500">Holding live stock across hubs</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Distribution Rate</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">
            {distributionRate}%
          </p>
          <p className="text-[11px] text-slate-500">% of inventory with dispatch agents</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-3 py-1.5 font-medium rounded-lg transition ${
            activeTab === 'global' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Global Inventory ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-3 py-1.5 font-medium rounded-lg transition ${
            activeTab === 'agents' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Agent Stock Breakdown ({agents.length} Agents)
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-3 py-1.5 font-medium rounded-lg transition ${
            activeTab === 'movements' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Stock Movement Log ({stockMovements.length})
        </button>
      </div>

      {/* Tab 1: Global Inventory */}
      {activeTab === 'global' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                  <th className="py-3 px-4 font-medium">Product Details</th>
                  <th className="py-3 px-4 font-medium">SKU</th>
                  <th className="py-3 px-4 font-medium text-right">Unit Cost</th>
                  <th className="py-3 px-4 font-medium text-right">Selling Price</th>
                  <th className="py-3 px-4 font-medium text-center">Warehouse</th>
                  <th className="py-3 px-4 font-medium text-center">Agent Stock</th>
                  <th className="py-3 px-4 font-medium text-center">Total Balance</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((p) => {
                  const agentUnits = agentStock
                    .filter(s => s.productId === p.id)
                    .reduce((sum, s) => sum + s.unitsHeld, 0);
                  const agentsHoldingCount = agentStock
                    .filter(s => s.productId === p.id && s.unitsHeld > 0).length;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white">{p.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{p.sku}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {formatCurrency(convertAmount(p.unitCost, currency), currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(convertAmount(p.sellingPrice, currency), currency)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-white">
                        {p.stockWarehouse}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-cyan-400">
                        {agentUnits} ({agentsHoldingCount} hubs)
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-white">
                        {p.stockWarehouse + agentUnits}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {(() => {
                            const prodForms = orderForms.filter(f => f.productId === p.id);
                            return (
                              <button
                                onClick={() => {
                                  if (prodForms.length > 0) {
                                    setSelectedFormId(prodForms[0].id);
                                  } else {
                                    setQuickFormProduct(p);
                                    setQuickFormTitle(`${p.name} Order Form`);
                                    setQuickFormSlug(`${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`);
                                    setQuickFormCreatedNotice(null);
                                    return;
                                  }
                                  setAdminActiveTab('embed-forms');
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-center gap-1"
                                title="View or edit order forms for this product"
                              >
                                <FormInput className="w-3 h-3 text-emerald-400" />
                                <span>Forms ({prodForms.length})</span>
                              </button>
                            );
                          })()}

                          <button
                            onClick={() => {
                              setQuickFormProduct(p);
                              setQuickFormTitle(`${p.name} Order Form`);
                              setQuickFormSlug(`${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`);
                              setQuickFormCreatedNotice(null);
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-medium"
                            title="Create a new checkout order form for this product"
                          >
                            + Form
                          </button>

                          <button
                            onClick={() => setSelectedProductForPricing(p)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                            title="Manage multi-currency pricing & margins"
                          >
                            Pricing
                          </button>
                          <button
                            onClick={() => openPackageModal(p)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
                            title="Manage checkout bundle packages & bonus gifts"
                          >
                            <Package className="w-3 h-3 text-emerald-400" />
                            <span>Packages ({p.packages.length})</span>
                            {p.packages.some(pkg => pkg.hasFreeGift) && (
                              <span className="flex items-center text-emerald-400" title="Has free bonus gifts">
                                <Gift className="w-3 h-3" />
                              </span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Agent Stock Breakdown */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((ag) => {
            const stocks = agentStock.filter(s => s.agentId === ag.id);
            const totalHeld = stocks.reduce((sum, s) => sum + s.unitsHeld, 0);
            const defectiveCount = stocks.reduce((sum, s) => sum + s.defectiveUnits, 0);
            const missingCount = stocks.reduce((sum, s) => sum + s.missingUnits, 0);

            return (
              <div key={ag.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="font-semibold text-white text-xs">{ag.name}</h3>
                    <p className="text-[11px] text-slate-400">{ag.primaryZone}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    ag.status === 'Active on Duty' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {ag.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Stock Capacity ({totalHeld} / {ag.capacityLimit} units):</span>
                    <span className="font-mono text-white font-medium">{Math.round((totalHeld / ag.capacityLimit) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all" 
                      style={{ width: `${Math.min(100, (totalHeld / ag.capacityLimit) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Per Product Units */}
                <div className="space-y-1 pt-1">
                  <p className="text-[10px] font-mono uppercase text-slate-500">Stock Held by Product</p>
                  {stocks.map(s => {
                    const prod = products.find(p => p.id === s.productId);
                    return (
                      <div key={s.productId} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                        <span className="text-slate-300 truncate pr-2">{prod?.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{s.unitsHeld} units</span>
                          <button
                            onClick={() => setShowAssignModal({ agentId: ag.id, productId: s.productId })}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50"
                          >
                            + Assign
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Issues Detected */}
                {(defectiveCount > 0 || missingCount > 0) && (
                  <div className="p-2 rounded bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 space-y-0.5">
                    <div className="flex items-center gap-1 font-semibold">
                      <AlertTriangle className="w-3 h-3 text-amber-400" /> Reconciled Issues:
                    </div>
                    {defectiveCount > 0 && <p>· {defectiveCount} defective unit(s) flagged</p>}
                    {missingCount > 0 && <p>· {missingCount} missing unit(s) flagged</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Stock Movement Log */}
      {activeTab === 'movements' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                  <th className="py-3 px-4 font-medium">Timestamp</th>
                  <th className="py-3 px-4 font-medium">Product</th>
                  <th className="py-3 px-4 font-medium">Movement Type</th>
                  <th className="py-3 px-4 font-medium">Origin Location</th>
                  <th className="py-3 px-4 font-medium">Destination</th>
                  <th className="py-3 px-4 font-medium text-center">Quantity</th>
                  <th className="py-3 px-4 font-medium">Reference / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stockMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{m.date}</td>
                    <td className="py-3 px-4 font-semibold text-white">{m.productName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        m.type === 'Agent to Customer' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                        m.type === 'Warehouse to Agent' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60' :
                        'bg-amber-950 text-amber-400 border border-amber-800/60'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{m.fromLocation}</td>
                    <td className="py-3 px-4 text-slate-300">{m.toLocation}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-white">
                      {m.quantity}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{m.referenceOrderOrAgent || 'System transfer'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Multi-Currency Pricing Modal */}
      {selectedProductForPricing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-white text-sm">Multi-Currency Pricing: {selectedProductForPricing.name}</h3>
                <p className="text-[11px] text-slate-400">Configure landed cost and target margin % per regional currency.</p>
              </div>
              <button onClick={() => setSelectedProductForPricing(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-800 mt-4 space-y-3">
              {selectedProductForPricing.pricing.map((pr, idx) => (
                <div key={pr.currency} className="pt-3 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Currency</span>
                    <p className="font-bold text-white text-sm">{pr.currency}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Selling Price</span>
                    <input
                      type="number"
                      value={pr.sellingPrice}
                      onChange={(e) => {
                        const updated = [...selectedProductForPricing.pricing];
                        updated[idx].sellingPrice = Number(e.target.value);
                        updateProductPricing(selectedProductForPricing.id, updated);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 font-mono text-white text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Base Cost</span>
                    <input
                      type="number"
                      value={pr.baseCost}
                      onChange={(e) => {
                        const updated = [...selectedProductForPricing.pricing];
                        updated[idx].baseCost = Number(e.target.value);
                        updateProductPricing(selectedProductForPricing.id, updated);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 font-mono text-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Landed Cost</span>
                    <input
                      type="number"
                      value={pr.landedCost}
                      onChange={(e) => {
                        const updated = [...selectedProductForPricing.pricing];
                        updated[idx].landedCost = Number(e.target.value);
                        updateProductPricing(selectedProductForPricing.id, updated);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 font-mono text-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Margin</span>
                    <p className="font-mono font-bold text-emerald-400 mt-1">{pr.marginPercent}%</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedProductForPricing(null)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
              >
                Save Pricing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packages & Bonus Gift Builder Modal */}
      {selectedProductForPackages && (() => {
        const liveProd = products.find(p => p.id === selectedProductForPackages.id) || selectedProductForPackages;
        const otherInventoryProducts = products.filter(p => p.id !== liveProd.id);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-400" />
                    <span>Package Bundles & Free Gifts: {liveProd.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure multi-pack offers (1-unit, 2-pack, 3-pack) and attach bonus products from your inventory that automatically show on checkout order forms.
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedProductForPackages(null)} 
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Success Alert */}
              {packageSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{packageSuccessMsg}</span>
                  </div>
                  <button onClick={() => setPackageSuccessMsg(null)} className="text-emerald-400 hover:text-white text-xs">
                    ✕
                  </button>
                </div>
              )}

              {/* Current Active Packages */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span>1. Configured Packages for Checkout</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-mono">
                      {liveProd.packages.length} active
                    </span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Regular single unit price: ₦{liveProd.sellingPrice.toLocaleString()}</span>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {liveProd.packages.map((pkg) => (
                    <div 
                      key={pkg.id} 
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-xs">{pkg.name}</span>
                            {pkg.badge && (
                              <span className="px-2 py-0.5 rounded-full font-mono text-[9px] font-bold bg-amber-500 text-slate-950 uppercase">
                                {pkg.badge}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                              {pkg.quantity} unit{pkg.quantity > 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{pkg.description}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-mono font-bold text-emerald-400 text-sm">
                              {formatCurrency(pkg.price, 'NGN')}
                            </span>
                            {pkg.quantity > 1 && (
                              <p className="text-[10px] text-slate-500 font-mono">
                                ₦{Math.round(pkg.price / pkg.quantity).toLocaleString()}/unit
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (liveProd.packages.length <= 1) {
                                alert("A product must keep at least 1 package for checkout forms.");
                                return;
                              }
                              deletePackageFromProduct(liveProd.id, pkg.id);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-800 transition"
                            title="Delete this package"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Attached Free Gift Callout */}
                      {pkg.hasFreeGift && (
                        <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-[11px] text-emerald-300">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Gift className="w-3.5 h-3.5 text-emerald-400" />
                            <span>
                              Included Free Bonus: <strong>{pkg.freeGiftQuantity || 1}x {pkg.freeGiftName}</strong>
                              {pkg.freeGiftPerceivedValue ? ` (Worth ₦${pkg.freeGiftPerceivedValue.toLocaleString()} FREE)` : ' (FREE)'}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono uppercase bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">
                            Attached Bonus
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Create New Package Bundle Form */}
              <div className="pt-3 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>2. Create New Package / Offer Tier</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Add to checkout form</span>
                </div>

                <form onSubmit={handleCreatePackage} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Package Display Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Buy 2 Packs (Most Popular Duo)"
                        value={newPkgName}
                        onChange={(e) => setNewPkgName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Badge / Tag (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Most Popular, Save 20%, Best Seller"
                        value={newPkgBadge}
                        onChange={(e) => setNewPkgBadge(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Units of Main Product <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={newPkgQty}
                        onChange={(e) => {
                          const q = Number(e.target.value);
                          setNewPkgQty(q);
                          // Auto calculate suggested discount
                          const disc = q === 2 ? 0.85 : q >= 3 ? 0.75 : 1;
                          setNewPkgPrice(Math.round(liveProd.sellingPrice * q * disc));
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Package Selling Price (₦) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="100"
                        step="500"
                        required
                        value={newPkgPrice}
                        onChange={(e) => setNewPkgPrice(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none font-bold"
                      />
                    </div>

                    <div className="flex flex-col justify-end">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                        <span>Savings vs Single: </span>
                        <strong className="text-emerald-400 font-mono">
                          {newPkgQty > 1 ? `₦${Math.max(0, (liveProd.sellingPrice * newPkgQty) - newPkgPrice).toLocaleString()} off` : 'Standard'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 font-medium block mb-1">
                      Package Short Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2x bottles + free priority doorstep delivery"
                      value={newPkgDesc}
                      onChange={(e) => setNewPkgDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* FREE BONUS GIFT FROM INVENTORY SECTION */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="font-semibold text-white text-xs">Attach Free Gift / Bonus from Inventory</span>
                          <p className="text-[10px] text-slate-400">
                            Select any product from your warehouse to give away free with this bundle package.
                          </p>
                        </div>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-xs">
                        <input
                          type="checkbox"
                          checked={newPkgHasGift}
                          onChange={(e) => {
                            setNewPkgHasGift(e.target.checked);
                            if (e.target.checked && otherInventoryProducts.length > 0 && !newPkgGiftProductId) {
                              setNewPkgGiftProductId(otherInventoryProducts[0].id);
                              setNewPkgGiftName(otherInventoryProducts[0].name);
                              setNewPkgGiftValue(otherInventoryProducts[0].sellingPrice);
                            }
                          }}
                          className="accent-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-medium text-emerald-400">Add Bonus Gift</span>
                      </label>
                    </div>

                    {newPkgHasGift && (
                      <div className="space-y-3 pt-2 border-t border-slate-800 animate-in fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-6">
                            <label className="text-[11px] text-slate-300 font-medium block mb-1">
                              Select Inventory Product as Gift <span className="text-red-400">*</span>
                            </label>
                            <select
                              value={newPkgGiftProductId}
                              onChange={(e) => {
                                setNewPkgGiftProductId(e.target.value);
                                const selectedGift = products.find(p => p.id === e.target.value);
                                if (selectedGift) {
                                  setNewPkgGiftName(selectedGift.name);
                                  setNewPkgGiftValue(selectedGift.sellingPrice);
                                }
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                            >
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (Stock: {p.stockWarehouse} · Value: ₦{p.sellingPrice.toLocaleString()})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-[11px] text-slate-300 font-medium block mb-1">
                              Gift Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={newPkgGiftQty}
                              onChange={(e) => setNewPkgGiftQty(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-[11px] text-slate-300 font-medium block mb-1">
                              Perceived Value (₦)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="500"
                              value={newPkgGiftValue}
                              onChange={(e) => setNewPkgGiftValue(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Live Callout Preview */}
                        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-[11px] space-y-1">
                          <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Customer Checkout Form Preview:
                          </p>
                          <p className="text-slate-200">
                            🎁 <strong>FREE BONUS INCLUDED:</strong> {newPkgGiftQty}x {newPkgGiftName || 'Selected Gift Product'}{' '}
                            <span className="text-emerald-400 font-mono">(Worth ₦{newPkgGiftValue.toLocaleString()} FREE)</span> added to delivery slip at ₦0!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save & Add Package to Product</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Modal Bottom Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  ⚡ All packages and bonus gifts sync immediately to live order forms.
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedProductForPackages(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Assign Stock Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-5 text-slate-100 space-y-4">
            <h3 className="font-semibold text-white text-sm">Assign Stock to Agent Hub</h3>
            <p className="text-xs text-slate-400">
              Transfer units from Central Warehouse to regional delivery rider inventory.
            </p>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Units to Dispatch</label>
              <input
                type="number"
                min="1"
                max="500"
                value={assignUnits}
                onChange={(e) => setAssignUnits(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAssignModal(null)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStock}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm">Add New Product Line</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Gold Serum Set"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">SKU Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PG-SERUM-SET"
                  value={newProdSku}
                  onChange={(e) => setNewProdSku(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 font-mono text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Unit Cost (₦ NGN)</label>
                  <input
                    type="number"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Selling Price (₦ NGN)</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Initial Warehouse Stock Units</label>
                <input
                  type="number"
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 font-mono text-white"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCreateOrderForm}
                    onChange={(e) => setAutoCreateOrderForm(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                  <span className="text-[11px] font-medium text-emerald-300">
                    Automatically generate an embeddable checkout order form for this product
                  </span>
                </label>
                <p className="text-[10px] text-slate-400 mt-1 pl-6">
                  Creates an active high-converting POD checkout form ready to be shared with customers or embedded on WordPress/Shopify.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-semibold text-white"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Create Order Form for Specific Product Modal */}
      {quickFormProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FormInput className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-white text-sm">Create New Order Form</h3>
              </div>
              <button 
                onClick={() => {
                  setQuickFormProduct(null);
                  setQuickFormCreatedNotice(null);
                }} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
              <div>
                <p className="font-medium text-white">{quickFormProduct.name}</p>
                <p className="text-[10px] text-slate-400">SKU: {quickFormProduct.sku}</p>
              </div>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(quickFormProduct.sellingPrice, 'NGN')}
              </span>
            </div>

            {quickFormCreatedNotice ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Check className="w-4 h-4" /> Form Created Successfully!
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Your new product form is live and connected to {quickFormProduct.name}.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      setQuickFormProduct(null);
                      setQuickFormCreatedNotice(null);
                      setPersona('public_form');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Live Form</span>
                  </button>

                  <button
                    onClick={() => {
                      setQuickFormProduct(null);
                      setQuickFormCreatedNotice(null);
                      setAdminActiveTab('embed-forms');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold text-slate-200 transition"
                  >
                    <FormInput className="w-3.5 h-3.5" />
                    <span>Customize in Builder</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickCreateForm} className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Form Title</label>
                  <input
                    type="text"
                    required
                    value={quickFormTitle}
                    onChange={(e) => setQuickFormTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Custom URL Slug</label>
                  <div className="flex items-center gap-1 font-mono text-[11px] bg-slate-950 border border-slate-700 rounded p-1.5">
                    <span className="text-slate-500">/order-form/</span>
                    <input
                      type="text"
                      value={quickFormSlug}
                      onChange={(e) => setQuickFormSlug(e.target.value)}
                      className="flex-1 bg-transparent text-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">CTA Button Color</label>
                  <div className="flex items-center gap-2">
                    {['#059669', '#2563eb', '#7c3aed', '#dc2626', '#d97706'].map(col => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setQuickFormBtnColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-6 h-6 rounded-full border ${quickFormBtnColor === col ? 'ring-2 ring-white border-transparent' : 'border-transparent'}`}
                      />
                    ))}
                    <input
                      type="color"
                      value={quickFormBtnColor}
                      onChange={(e) => setQuickFormBtnColor(e.target.value)}
                      className="w-6 h-6 rounded border-none bg-transparent cursor-pointer ml-1"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickFormProduct(null)}
                    className="px-4 py-1.5 rounded bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-semibold text-white"
                  >
                    Generate Form
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
