import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { User, Order } from '../../types/crm';
import { formatCurrency, convertAmount, createWhatsAppLink } from '../../utils/formatters';
import { OrderDetailsModal } from './OrderDetailsModal';
import { 
  Truck, 
  Warehouse, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Boxes, 
  Edit3, 
  Eye, 
  ExternalLink, 
  Check, 
  X, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Building,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

export const DistributorsView: React.FC = () => {
  const { 
    distributors, 
    distributorStock, 
    orders, 
    products, 
    currency, 
    addUser, 
    updateUser, 
    assignStockToDistributor, 
    returnStockFromDistributor,
    setPersona, 
    setCurrentUser, 
    addNotification 
  } = useCrm();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerritory, setSelectedTerritory] = useState('ALL');

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState<User | null>(null);
  const [showAllocateModal, setShowAllocateModal] = useState<User | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Add Distributor Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+234 ');
  const [newTerritory, setNewTerritory] = useState('Northern Region (Kano, Kaduna, Jos)');
  const [newBankName, setNewBankName] = useState('First Bank of Nigeria');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newCommissionRate, setNewCommissionRate] = useState<number>(2500);

  // Allocate Stock State
  const [allocateProductId, setAllocateProductId] = useState(products[0]?.id || '');
  const [allocateUnits, setAllocateUnits] = useState<number>(50);
  const [allocateNote, setAllocateNote] = useState('');

  // Computations
  const totalStockUnits = useMemo(() => {
    return distributorStock.reduce((sum, s) => sum + s.unitsHeld, 0);
  }, [distributorStock]);

  const totalStockValueNgn = useMemo(() => {
    return distributorStock.reduce((sum, s) => {
      const prod = products.find(p => p.id === s.productId);
      return sum + (s.unitsHeld * (prod?.sellingPrice || 25000));
    }, 0);
  }, [distributorStock, products]);

  const distributorOrders = useMemo(() => {
    return orders.filter(o => Boolean(o.distributorId));
  }, [orders]);

  const deliveredDistributorOrders = useMemo(() => {
    return distributorOrders.filter(o => o.status === 'DELIVERED');
  }, [distributorOrders]);

  const totalDeliveredRevenueNgn = useMemo(() => {
    return deliveredDistributorOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [deliveredDistributorOrders]);

  // Filtered distributors
  const filteredDistributors = useMemo(() => {
    return distributors.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        d.name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.phone.includes(q);
      return matchesSearch;
    });
  }, [distributors, searchQuery]);

  // Handle Create Distributor
  const handleCreateDistributor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const created = addUser({
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      role: 'Distributor',
      status: 'Active',
      payStructure: 'Commission',
      payCurrency: 'NGN',
      bankName: newBankName.trim(),
      accountNumber: newAccountNumber.trim(),
      accountName: newAccountName.trim() || newName.trim(),
      commissionPerOrder: Number(newCommissionRate) || 2500
    });

    addNotification({
      title: 'Distributor Created',
      message: `${created.name} registered as authorized regional distributor.`,
      type: 'success'
    });

    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setNewAccountNumber('');
    setNewAccountName('');
  };

  // Handle Edit Save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDistributor) return;

    updateUser(editingDistributor.id, {
      name: editingDistributor.name,
      phone: editingDistributor.phone,
      bankName: editingDistributor.bankName,
      accountNumber: editingDistributor.accountNumber,
      accountName: editingDistributor.accountName,
      commissionPerOrder: editingDistributor.commissionPerOrder,
      status: editingDistributor.status
    });

    addNotification({
      title: 'Distributor Updated',
      message: `Profile and remittance details updated for ${editingDistributor.name}`,
      type: 'info'
    });

    setEditingDistributor(null);
  };

  // Handle Allocate Submit
  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAllocateModal || !allocateProductId || allocateUnits <= 0) return;

    const prod = products.find(p => p.id === allocateProductId);
    if (prod && prod.stockWarehouse < allocateUnits) {
      alert(`Insufficient Central Warehouse stock! Only ${prod.stockWarehouse} units available.`);
      return;
    }

    assignStockToDistributor(showAllocateModal.id, allocateProductId, Number(allocateUnits), allocateNote);
    setShowAllocateModal(null);
    setAllocateNote('');
  };

  return (
    <div className="p-3 sm:p-5 lg:p-8 space-y-6 max-w-[1440px] mx-auto text-slate-100 animate-in fade-in">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lime-950 border border-lime-500/40 flex items-center justify-center text-lime-400">
              <Truck className="w-4 h-4" />
            </div>
            <span>Regional Distributors & Consignment Hubs</span>
          </h1>
          <p className="text-xs text-slate-400">
            Manage regional distributor partners, field inventory custody, consignment fulfillment, and COD remittances.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-extrabold text-xs shadow-md transition cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Add Distributor</span>
          </button>
        </div>
      </div>

      {/* 2. Key KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
          <p className="text-xs text-slate-400">Active Distributors</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">
            {distributors.length} <span className="text-sm font-normal text-slate-400">Hubs</span>
          </p>
          <p className="text-[11px] text-lime-400">Northern & Eastern Territories</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Stock in Custody</p>
          <p className="text-2xl font-bold font-mono text-lime-400 tabular-nums">
            {totalStockUnits.toLocaleString()} <span className="text-sm font-normal text-slate-400">units</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Across {distributorStock.length} allocated batches
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Inventory Value</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(convertAmount(totalStockValueNgn, currency), currency)}
          </p>
          <p className="text-[11px] text-slate-400">Retail selling consignment</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-1">
          <p className="text-xs text-slate-400">Consignment Orders Delivered</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">
            {deliveredDistributorOrders.length} / {distributorOrders.length}
          </p>
          <p className="text-[11px] text-emerald-400 font-mono">
            {formatCurrency(convertAmount(totalDeliveredRevenueNgn, currency), currency)} collected
          </p>
        </div>
      </div>

      {/* 3. Search & Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search distributor name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>{filteredDistributors.length} Registered Regional Hubs</span>
        </div>
      </div>

      {/* 4. Distributors Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDistributors.map(dist => {
          const stocks = distributorStock.filter(s => s.distributorId === dist.id);
          const unitsHeld = stocks.reduce((sum, s) => sum + s.unitsHeld, 0);
          const stockValue = stocks.reduce((sum, s) => {
            const p = products.find(prod => prod.id === s.productId);
            return sum + (s.unitsHeld * (p?.sellingPrice || 25000));
          }, 0);

          const myOrders = orders.filter(o => o.distributorId === dist.id);
          const pending = myOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
          const delivered = myOrders.filter(o => o.status === 'DELIVERED');
          const fee = dist.commissionPerOrder || 2500;

          return (
            <div key={dist.id} className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 space-y-4 shadow-lg hover:border-slate-700 transition">
              {/* Header: Name, Contact & Status */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-lime-950 border border-lime-500/40 flex items-center justify-center font-black text-sm text-lime-400">
                    {dist.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <span>{dist.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        dist.status === 'Active' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {dist.status || 'Active'}
                      </span>
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {dist.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {dist.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-400 block">Rate / Order</span>
                  <span className="text-sm font-bold font-mono text-lime-400">₦{fee.toLocaleString()}</span>
                </div>
              </div>

              {/* Territory & Remittance Banking Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-lime-400" />
                    <span>Coverage Territory</span>
                  </p>
                  <p className="text-slate-200 font-medium truncate">
                    {dist.id === 'user-distributor-1' ? 'Kano, Kaduna, Jos & Northern Hub' : 'Onitsha, Aba, Enugu & South-East Hub'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-lime-400" />
                    <span>COD Remittance Account</span>
                  </p>
                  <p className="text-slate-200 font-mono text-[11px] truncate">
                    {dist.bankName || 'Access Bank'} • {dist.accountNumber || '0129849201'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{dist.accountName || dist.name}</p>
                </div>
              </div>

              {/* Stock in Custody & Pipeline Stats */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Stock Held</p>
                  <p className="text-base font-bold font-mono text-white">{unitsHeld} units</p>
                  <p className="text-[10px] text-lime-400 font-mono">
                    {formatCurrency(convertAmount(stockValue, currency), currency)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Pending Orders</p>
                  <p className="text-base font-bold font-mono text-amber-400">{pending.length}</p>
                  <p className="text-[10px] text-slate-400">In dispatch</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Delivered</p>
                  <p className="text-base font-bold font-mono text-emerald-400">{delivered.length}</p>
                  <p className="text-[10px] text-slate-400">Fee: ₦{(delivered.length * fee).toLocaleString()}</p>
                </div>
              </div>

              {/* Allocated SKUs Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Inventory in Hub Custody</span>
                  <span className="text-[11px] font-mono text-slate-400">{stocks.length} Products</span>
                </div>
                {stocks.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2 text-center">No inventory allocated yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {stocks.map(s => {
                      const prod = products.find(p => p.id === s.productId);
                      return (
                        <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800 text-xs">
                          <span className="text-slate-200 font-medium truncate pr-2">{prod?.name || s.productName}</span>
                          <span className="font-mono text-lime-400 font-bold px-2 py-0.5 rounded bg-lime-950 border border-lime-800/40 text-[11px]">
                            {s.unitsHeld} units
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <a
                    href={createWhatsAppLink(dist.phone, `Hello ${dist.name}, this is BettaTraka Central Operations regarding your regional distribution center.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/80 transition"
                    title="Chat on WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => {
                      setCurrentUser(dist);
                      setPersona('distributor');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition"
                    title="Open distributor portal as this user"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Portal</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingDistributor(dist)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Edit Distributor"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setShowAllocateModal(dist);
                      setAllocateProductId(products[0]?.id || '');
                      setAllocateUnits(50);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-extrabold text-xs shadow transition cursor-pointer"
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>+ Allocate Stock</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODALS                                                        */}
      {/* ------------------------------------------------------------- */}

      {/* Add Distributor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-lime-400" />
                <span>Add Regional Distributor</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDistributor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Distributor Full Name / Entity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alhaji Sani Distribution Ltd"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-lime-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Official Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="distributor@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-lime-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-lime-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Fee per Delivered Order (₦)</label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={newCommissionRate}
                    onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-lime-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">Territory / Operating Coverage</label>
                  <input
                    type="text"
                    required
                    value={newTerritory}
                    onChange={(e) => setNewTerritory(e.target.value)}
                    placeholder="e.g. Northern Zone (Kano, Kaduna, Katsina, Jos)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              {/* Banking Details */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-lime-400 uppercase font-mono block">
                  Remittance Bank Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-0.5">Bank Name</label>
                    <input
                      type="text"
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Account Number</label>
                    <input
                      type="text"
                      value={newAccountNumber}
                      onChange={(e) => setNewAccountNumber(e.target.value)}
                      placeholder="0123456789"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 block mb-0.5">Account Name</label>
                    <input
                      type="text"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                      placeholder="Account holder name"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-extrabold shadow"
                >
                  Create Distributor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Distributor Modal */}
      {editingDistributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-lime-400" />
                <span>Edit Distributor Profile</span>
              </h3>
              <button onClick={() => setEditingDistributor(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingDistributor.name}
                  onChange={(e) => setEditingDistributor({ ...editingDistributor, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingDistributor.phone}
                    onChange={(e) => setEditingDistributor({ ...editingDistributor, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Fee / Order (₦)</label>
                  <input
                    type="number"
                    value={editingDistributor.commissionPerOrder || 2500}
                    onChange={(e) => setEditingDistributor({ ...editingDistributor, commissionPerOrder: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={editingDistributor.bankName || ''}
                  onChange={(e) => setEditingDistributor({ ...editingDistributor, bankName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Account Number</label>
                <input
                  type="text"
                  value={editingDistributor.accountNumber || ''}
                  onChange={(e) => setEditingDistributor({ ...editingDistributor, accountNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Account Name</label>
                <input
                  type="text"
                  value={editingDistributor.accountName || ''}
                  onChange={(e) => setEditingDistributor({ ...editingDistributor, accountName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDistributor(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-extrabold shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Stock Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-lime-400" />
                <span>Allocate Stock to {showAllocateModal.name}</span>
              </h3>
              <button onClick={() => setShowAllocateModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAllocateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Product SKU</label>
                <select
                  value={allocateProductId}
                  onChange={(e) => setAllocateProductId(e.target.value)}
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
                <label className="text-slate-300 font-semibold block mb-1">Units to Allocate</label>
                <input
                  type="number"
                  min="1"
                  value={allocateUnits}
                  onChange={(e) => setAllocateUnits(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-lime-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Waybill Dispatch Note</label>
                <textarea
                  rows={2}
                  value={allocateNote}
                  onChange={(e) => setAllocateNote(e.target.value)}
                  placeholder="e.g. Sent via regional haulage carrier, Waybill #WH-DIST-209..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-lime-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-extrabold shadow"
                >
                  Allocate Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
