import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { NIGERIAN_STATES } from '../../data/initialData';
import { ProductPackage, OrderBump } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Sparkles, 
  Gift, 
  Clock, 
  Lock,
  ArrowRight,
  PhoneCall,
  Check,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PublicOrderForm: React.FC = () => {
  const { 
    products, 
    orderForms,
    selectedFormId,
    setSelectedFormId,
    updateOrderForm,
    formConfig, 
    createOrder, 
    createAbandonedCart, 
    currency,
    setPersona,
    setAdminActiveTab
  } = useCrm();

  const activeForm = orderForms.find(f => f.id === selectedFormId) || orderForms[0];
  const activeConfig = activeForm?.config || formConfig;
  const selectedProduct = products.find(p => p.id === (activeForm?.productId || activeConfig.productId)) || products[0];
  const packages = selectedProduct.packages;

  const [selectedPkgId, setSelectedPkgId] = useState<string>(packages[0]?.id || '');
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  
  // Keep packages updated when form/product changes
  useEffect(() => {
    if (packages.length > 0) {
      setSelectedPkgId(packages[0].id);
    }
    setSelectedBumps([]);
  }, [selectedProduct.id, selectedFormId]);

  // Customer info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Lagos');
  const [deliveryWindow, setDeliveryWindow] = useState('Tomorrow (Urgent Delivery)');
  const [confirmedCommitment, setConfirmedCommitment] = useState(true);
  const [isSandbox, setIsSandbox] = useState(false);

  const [submittedOrder, setSubmittedOrder] = useState<any>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Automatic post-submission redirect countdown & execution
  useEffect(() => {
    if (!submittedOrder) {
      setRedirectCountdown(null);
      return;
    }

    if (activeConfig.enableRedirect && activeConfig.redirectUrl) {
      const delay = activeConfig.redirectDelaySeconds ?? 3;
      if (delay === 0) {
        // Immediate redirect
        try {
          window.location.assign(activeConfig.redirectUrl);
        } catch {
          window.open(activeConfig.redirectUrl, '_top');
        }
        return;
      }

      setRedirectCountdown(delay);
      const interval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            try {
              window.location.assign(activeConfig.redirectUrl!);
            } catch {
              window.open(activeConfig.redirectUrl!, '_top');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [submittedOrder, activeConfig]);

  const activePackage = packages.find(p => p.id === selectedPkgId) || packages[0];
  const pkgPrice = activePackage ? activePackage.price : selectedProduct.sellingPrice;

  const bumpsPrice = selectedBumps.reduce((acc, bumpId) => {
    const bump = activeConfig.orderBumps.find(b => b.id === bumpId);
    return acc + (bump ? bump.price : 0);
  }, 0);

  const grandTotalNgn = pkgPrice + bumpsPrice;

  // Abandoned cart trigger on partial exit or simulator
  const simulateCartAbandonment = () => {
    if (!name && !phone) {
      alert("Please type a customer name or phone first to simulate an abandoned cart!");
      return;
    }
    const cart = createAbandonedCart({
      customerName: name || 'Interested Shopper',
      customerPhone: phone || '+234 812 000 1122',
      customerWhatsApp: whatsapp || phone,
      deliveryCity: city || 'Lagos',
      deliveryState: state,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      packageId: activePackage?.id,
      packageName: activePackage?.name,
      amount: grandTotalNgn,
      currency: 'NGN'
    });
    alert(`Abandoned cart #${cart.cartNumber} recorded! Check the Admin > Abandoned Carts recovery pipeline.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert("Please fill in Name, Phone, and Delivery Address.");
      return;
    }

    const orderItems: any[] = [
      {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: activePackage ? activePackage.quantity : 1,
        unitPrice: pkgPrice,
        packageId: activePackage?.id,
        packageName: activePackage?.name
      }
    ];

    // If active package has a free gift / bonus attached from inventory, include it as a line item!
    if (activePackage?.hasFreeGift && activePackage?.freeGiftName) {
      orderItems.push({
        productId: activePackage.freeGiftProductId || `gift-${selectedProduct.id}`,
        productName: `🎁 FREE BONUS: ${activePackage.freeGiftName}`,
        quantity: activePackage.freeGiftQuantity || 1,
        unitPrice: 0,
        packageName: `Bonus with ${activePackage.name}`
      });
    }

    const newOrder = createOrder({
      customerName: name,
      customerPhone: phone,
      customerWhatsApp: whatsapp || phone,
      customerEmail: email,
      deliveryAddress: address,
      deliveryCity: city || 'City Center',
      deliveryState: state,
      source: 'Order Form',
      utmSource: 'facebook_ad_campaign',
      utmCampaign: activeForm?.slug || 'direct_form',
      totalAmount: grandTotalNgn,
      currency: 'NGN',
      isSandbox: isSandbox,
      deliveryWindowPreference: deliveryWindow,
      items: orderItems
    });

    if (activeForm) {
      updateOrderForm(activeForm.id, {
        ordersCount: activeForm.ordersCount + 1,
        conversionRate: Math.min(100, Math.round(((activeForm.ordersCount + 1) / Math.max(1, activeForm.viewsCount)) * 100))
      });
    }

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    setSubmittedOrder(newOrder);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 text-slate-100 flex flex-col justify-between">
      {/* Top Demo Context Bar with Product Form Switcher */}
      <div className="max-w-2xl mx-auto w-full mb-6 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-white">Live Customer Order Form</span>
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-800/60 px-1.5 py-0.5 rounded">
              /{activeForm?.slug || 'checkout'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={isSandbox}
                onChange={(e) => setIsSandbox(e.target.checked)}
                className="accent-purple-500"
              />
              <span className="text-[11px] font-mono">Sandbox Mode</span>
            </label>
            <button
              onClick={simulateCartAbandonment}
              className="px-2 py-1 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300 hover:text-white font-mono text-[10px]"
              title="Simulate partial fill and customer dropping off"
            >
              Simulate Drop-off
            </button>
          </div>
        </div>

        {/* Multi-Product Form Switcher */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-400 text-[11px] whitespace-nowrap">Switch Product Form:</span>
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg p-1.5 font-medium text-emerald-400 text-xs focus:outline-none"
            >
              {orderForms.map(f => {
                const prod = products.find(p => p.id === f.productId);
                return (
                  <option key={f.id} value={f.id}>
                    {f.title} — [{prod?.name || 'Product'}]
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={() => {
              setPersona('admin');
              setAdminActiveTab('embed-forms');
            }}
            className="text-[11px] text-slate-400 hover:text-emerald-400 underline whitespace-nowrap"
          >
            Customize in Builder ➔
          </button>
        </div>
      </div>

      {/* Main Order Form Card */}
      <div className="max-w-xl mx-auto w-full rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 lg:p-8 space-y-6">
        {/* Product Brand Header */}
        <div className="text-center space-y-2 pb-4 border-b border-slate-800">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80 inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Cash On Delivery (POD)
          </span>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
            {selectedProduct.name}
          </h1>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            {selectedProduct.description}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* 1. SELECT PACKAGE BUNDLE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
                Step 1: Select Your Package Bundle
              </label>
              <span className="text-[10px] text-slate-400">Save up to 40%</span>
            </div>

            <div className="space-y-2.5">
              {packages.map((pkg) => {
                const isSelected = selectedPkgId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/50'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-500 bg-emerald-600' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white text-xs">{pkg.name}</p>
                            {pkg.badge && (
                              <span className="px-2 py-0.5 rounded-full font-mono text-[9px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{pkg.description}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white text-sm">
                        {formatCurrency(pkg.price, 'NGN')}
                      </span>
                    </div>

                    {pkg.hasFreeGift && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40 text-emerald-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Gift className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            <strong>FREE BONUS:</strong> {pkg.freeGiftQuantity || 1}x {pkg.freeGiftName}
                            {pkg.freeGiftPerceivedValue ? ` (Worth ₦${pkg.freeGiftPerceivedValue.toLocaleString()} FREE)` : ' (FREE)'}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-white uppercase tracking-wider">
                          100% FREE
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. ORDER BUMPS */}
          {activeConfig.orderBumps.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <label className="font-mono text-[11px] uppercase tracking-wider text-amber-400 font-bold">
                Special One-Time Add-on Deals
              </label>
              {activeConfig.orderBumps.map((bump) => {
                const isChecked = selectedBumps.includes(bump.id);
                return (
                  <div
                    key={bump.id}
                    onClick={() => {
                      setSelectedBumps(prev => 
                        isChecked ? prev.filter(id => id !== bump.id) : [...prev, bump.id]
                      );
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      isChecked ? 'border-amber-500/80 bg-amber-950/20' : 'border-slate-800 bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="mt-0.5 accent-amber-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-white text-xs">{bump.name}</p>
                          <span className="font-mono font-bold text-amber-400">
                            +{formatCurrency(bump.price, 'NGN')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{bump.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. CUSTOMER DETAILS */}
          <div className="space-y-3 pt-2">
            <label className="font-mono text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
              Step 2: Where Should We Deliver Your Package?
            </label>

            <div className="space-y-2.5">
              <div>
                <label className="text-slate-400 block mb-1">Your Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Babatunde Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1">Active Phone Number <span className="text-red-400">*</span></label>
                  <input
                    type="tel"
                    required
                    placeholder="+234 800 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-white focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="+234 800..."
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-white focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Street Address for Doorstep Delivery <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House 14, Opebi Road, Salvation Bus Stop"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1">City / Town</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ikeja"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Delivery State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {activeConfig.showDeliveryWindowQuestion && (
                <div>
                  <label className="text-slate-400 block mb-1">Preferred Delivery Day</label>
                  <select
                    value={deliveryWindow}
                    onChange={(e) => setDeliveryWindow(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs"
                  >
                    <option value="Tomorrow (Urgent Delivery)">Tomorrow (Urgent Delivery)</option>
                    <option value="In 2 to 3 days">In 2 to 3 Days</option>
                    <option value="Weekend Delivery (Saturday/Sunday)">Weekend Delivery (Saturday / Sunday)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Commitment Warning Notice */}
          {activeConfig.showCommitmentFeeNotice && (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-300 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" /> Payment On Delivery Notice:
              </p>
              <p className="leading-relaxed text-slate-300">
                Please only order if you have the cash/transfer ready and will be available to collect when our rider arrives. Delivery couriers are paid per trip.
              </p>
              <label className="flex items-center gap-2 pt-1 text-white font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedCommitment}
                  onChange={(e) => setConfirmedCommitment(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span>I confirm I will be available with cash when package arrives</span>
              </label>
            </div>
          )}

          {/* Price Summary & Submit CTA */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-base font-bold">
              <span className="text-slate-300">Total Payable on Delivery:</span>
              <span className="font-mono text-xl text-emerald-400">
                {formatCurrency(grandTotalNgn, 'NGN')}
              </span>
            </div>

            <button
              type="submit"
              disabled={!confirmedCommitment}
              style={{ backgroundColor: activeConfig.buttonColor }}
              className="w-full py-3.5 rounded-xl font-bold text-white text-xs shadow-lg uppercase tracking-wide transition hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{activeConfig.buttonText}</span>
            </button>

            <p className="text-center text-[10px] text-slate-500">
              🔒 Encrypted 256-bit checkout · Verified Nigerian POD courier dispatch
            </p>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {submittedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/50 bg-slate-900 shadow-2xl p-6 text-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-600/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
              <Check className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Order Confirmed Successfully!</h3>
              <p className="font-mono text-emerald-400 text-sm mt-0.5">{submittedOrder.orderNumber}</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Thank you, <strong>{submittedOrder.customerName}</strong>! Your order for <strong>{submittedOrder.items[0]?.productName}</strong> has been logged into the BettaTraka CRM dispatch queue.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Assigned Rep:</span>
                <span className="text-white font-medium">{submittedOrder.salesRepName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Hub Agent:</span>
                <span className="text-white font-medium">{submittedOrder.agentName}</span>
              </div>
              {submittedOrder.items.filter((i: any) => i.unitPrice === 0).map((g: any, idx: number) => (
                <div key={idx} className="flex justify-between text-emerald-400 font-medium pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Included Free Gift:</span>
                  <span className="truncate max-w-[200px]">{g.productName.replace('🎁 FREE BONUS: ', '')}</span>
                </div>
              ))}
              <div className="flex justify-between text-slate-400 pt-1">
                <span>Total Due on Delivery:</span>
                <span className="font-mono text-emerald-400 font-bold">₦{submittedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Post-Order Redirect Countdown Banner */}
            {activeConfig.enableRedirect && activeConfig.redirectUrl && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-left space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Redirecting to Order Confirmation...</span>
                  </span>
                  <span className="font-mono font-bold text-white bg-emerald-900/80 px-2 py-0.5 rounded text-[11px]">
                    {redirectCountdown !== null ? `${redirectCountdown}s` : 'Redirecting...'}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-1000 ease-linear rounded-full"
                    style={{ 
                      width: redirectCountdown !== null && (activeConfig.redirectDelaySeconds ?? 3) > 0
                        ? `${Math.max(5, 100 - (redirectCountdown / (activeConfig.redirectDelaySeconds ?? 3)) * 100)}%` 
                        : '100%' 
                    }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                  <span className="text-slate-400 font-mono truncate max-w-[210px]" title={activeConfig.redirectUrl}>
                    {activeConfig.redirectUrl}
                  </span>
                  <a
                    href={activeConfig.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 transition shadow-sm whitespace-nowrap"
                  >
                    <span>Proceed Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setSubmittedOrder(null);
                  setPersona('admin');
                  setAdminActiveTab('orders');
                }}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition"
              >
                View Order in Admin Dashboard
              </button>
              <button
                onClick={() => setSubmittedOrder(null)}
                className="text-xs text-slate-400 hover:text-white py-1"
              >
                Place Another Test Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
