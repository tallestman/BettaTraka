import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { NIGERIAN_STATES } from '../../data/initialData';
import { ProductPackage } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { X, Plus, ShoppingBag } from 'lucide-react';

interface CreateOrderModalProps {
  onClose: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ onClose }) => {
  const { products, users, createOrder, currency, currentUser } = useCrm();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('Lagos');
  
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [assignedRepId, setAssignedRepId] = useState<string>(currentUser.id);
  const [source, setSource] = useState<'Order Form' | 'Manual Rep' | 'WhatsApp'>('Manual Rep');

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const activePackages = selectedProduct?.packages || [];
  const selectedPackage = activePackages.find(pkg => pkg.id === selectedPackageId) || activePackages[0];

  const currentPriceNgn = selectedPackage ? selectedPackage.price : selectedProduct?.sellingPrice || 24500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryAddress) {
      alert("Please fill in Customer Name, Phone, and Delivery Address.");
      return;
    }

    createOrder({
      customerName,
      customerPhone,
      customerWhatsApp: customerWhatsApp || customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryCity: deliveryCity || 'City Center',
      deliveryState,
      source,
      salesRepId: assignedRepId === 'me' ? undefined : assignedRepId,
      status: 'CONFIRMED',
      totalAmount: currentPriceNgn,
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: selectedPackage ? selectedPackage.quantity : 1,
          unitPrice: currentPriceNgn,
          packageId: selectedPackage?.id,
          packageName: selectedPackage?.name
        }
      ]
    });

    onClose();
  };

  const salesReps = users.filter(u => u.role === 'Sales Representative' || u.role === 'Owner');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white text-sm">Create New POD Order</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Customer Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alhaja Kemi Balogun"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Customer Phone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+234 800 000 0000"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                WhatsApp Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+234..."
                value={customerWhatsApp}
                onChange={(e) => setCustomerWhatsApp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="customer@gmail.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Delivery Details */}
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">
              Delivery Street Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                City / Landmark
              </label>
              <input
                type="text"
                placeholder="e.g. Lekki / Ikeja"
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                State (Nigeria)
              </label>
              <select
                value={deliveryState}
                onChange={(e) => setDeliveryState(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product & Package */}
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-white">Select Product & Bundle Package</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod?.packages[0]) setSelectedPackageId(prod.packages[0].id);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Package Bundle</label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  {activePackages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({formatCurrency(pkg.price, 'NGN')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-slate-400 text-[11px]">Total POD Collectible:</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                {formatCurrency(convertAmount(currentPriceNgn, currency), currency)}
              </span>
            </div>
          </div>

          {/* Sales Rep Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Assign Order To
              </label>
              <select
                value={assignedRepId}
                onChange={(e) => setAssignedRepId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="me">Me (no sales rep)</option>
                {salesReps.map(rep => (
                  <option key={rep.id} value={rep.id}>{rep.name} ({rep.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Order Origin Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Manual Rep">Manual Rep Entry</option>
                <option value="WhatsApp">WhatsApp Inbound Direct</option>
                <option value="Order Form">Order Form</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white transition shadow-sm"
            >
              Save & Confirm Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
