import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  RotateCcw, 
  Bot, 
  Coins, 
  FormInput, 
  Sliders, 
  Check, 
  Copy, 
  Play, 
  PhoneCall, 
  FlaskConical, 
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Link,
  ArrowUpRight,
  Tag,
  Package,
  Gift
} from 'lucide-react';

export const RoundRobinView: React.FC = () => {
  const { 
    roundRobin, 
    updateRoundRobinPool, 
    skipRoundRobinRep, 
    resetRoundRobinSequence, 
    updateSettings, 
    settings 
  } = useCrm();

  const [poolType, setPoolType] = useState<'order' | 'cart'>('order');
  const pool = poolType === 'order' ? roundRobin.orderPool : roundRobin.cartPool;
  const nextIndex = poolType === 'order' ? roundRobin.nextRepIndexOrder : roundRobin.nextRepIndexCart;
  const nextRep = pool[nextIndex % pool.length];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Automated Round-Robin Rotation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fair weighted lead distribution with separate pools for incoming orders and abandoned cart recoveries.
          </p>
        </div>

        {/* Pool Selector */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setPoolType('order')}
            className={`px-3 py-1 font-medium rounded-md ${
              poolType === 'order' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Order Assignment Pool
          </button>
          <button
            onClick={() => setPoolType('cart')}
            className={`px-3 py-1 font-medium rounded-md ${
              poolType === 'cart' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Abandoned Cart Pool
          </button>
        </div>
      </div>

      {/* Next in Line Banner */}
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Next In Line For Next Lead
          </div>
          <p className="text-xl font-bold text-white mt-1">
            {nextRep ? nextRep.repName : 'No rep available'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Will automatically receive the next submission from this pool.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => skipRoundRobinRep(poolType)}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
          >
            Skip to Next Rep
          </button>
          <button
            onClick={() => resetRoundRobinSequence(poolType)}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Top
          </button>
        </div>
      </div>

      {/* Rep Rotation Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 font-medium">Rep Name</th>
                <th className="py-3 px-4 font-medium text-center">Duty Availability</th>
                <th className="py-3 px-4 font-medium text-center">Rotation Weight</th>
                <th className="py-3 px-4 font-medium text-center">Total Assigned Leads</th>
                <th className="py-3 px-4 font-medium text-center">Include in Rotation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pool.map((rep, idx) => {
                const isNext = idx === nextIndex % pool.length;
                return (
                  <tr key={rep.repId} className={`hover:bg-slate-800/30 transition-colors ${isNext ? 'bg-emerald-950/15' : ''}`}>
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      {isNext && <span className="text-emerald-400 font-mono text-[10px]">▶ NEXT</span>}
                      <span>{rep.repName}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => updateRoundRobinPool(poolType, rep.repId, { isAvailable: !rep.isAvailable })}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          rep.isAvailable ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {rep.isAvailable ? 'Available' : 'Paused'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <select
                        value={rep.weight}
                        onChange={(e) => updateRoundRobinPool(poolType, rep.repId, { weight: Number(e.target.value) })}
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-xs text-white"
                      >
                        <option value={1}>1× (Normal)</option>
                        <option value={2}>2× (Double turns)</option>
                        <option value={3}>3× (Triple turns)</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-white">
                      {rep.assignedOrderCount}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={rep.isIncluded}
                        onChange={(e) => updateRoundRobinPool(poolType, rep.repId, { isIncluded: e.target.checked })}
                        className="accent-emerald-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const EmbedFormGeneratorView: React.FC = () => {
  const { 
    orderForms, 
    selectedFormId, 
    setSelectedFormId, 
    createOrderForm, 
    updateOrderForm, 
    deleteOrderForm, 
    duplicateOrderForm,
    products, 
    currency, 
    setPersona 
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'forms-list' | 'editor' | 'traffic-links'>('forms-list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newProductId, setNewProductId] = useState(products[0]?.id || '');
  const [newButtonText, setNewButtonText] = useState('CONFIRM ORDER (PAY ON DELIVERY)');
  const [newButtonColor, setNewButtonColor] = useState('#059669');
  const [newCommitmentFee, setNewCommitmentFee] = useState(2000);
  const [newShowWhatsApp, setNewShowWhatsApp] = useState(true);
  const [newShowDeliveryWindow, setNewShowDeliveryWindow] = useState(true);
  const [newEnableRedirect, setNewEnableRedirect] = useState(true);
  const [newRedirectUrl, setNewRedirectUrl] = useState('https://example.com/thank-you');
  const [newRedirectDelaySeconds, setNewRedirectDelaySeconds] = useState(3);
  
  // Custom Bumps
  const [bumpName, setBumpName] = useState('');
  const [bumpPrice, setBumpPrice] = useState(2500);
  const [customBumps, setCustomBumps] = useState<any[]>([]);

  // Active form being edited or viewed
  const currentForm = orderForms.find(f => f.id === selectedFormId) || orderForms[0];
  const currentProduct = products.find(p => p.id === currentForm?.productId) || products[0];
  const formConfig = currentForm?.config || {
    productId: currentProduct?.id || 'prod-1',
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
    buttonText: 'CONFIRM MY ORDER (PAY ON DELIVERY)',
    buttonColor: '#059669',
    borderThickness: 'medium',
    placeholderDarkness: 'medium',
    additionalQuestions: [],
    orderBumps: []
  };

  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedIframe, setCopiedIframe] = useState<string | null>(null);

  const getShareableUrl = (slug: string) => `${window.location.origin}/order-form/${slug}`;
  const getIframeCode = (slug: string) => 
    `<iframe src="${getShareableUrl(slug)}" width="100%" height="880" frameborder="0" style="border:none; max-width:650px; margin:0 auto; display:block;"></iframe>`;

  const copyLink = (slug: string, id: string) => {
    navigator.clipboard.writeText(getShareableUrl(slug));
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const copyIframe = (slug: string, id: string) => {
    navigator.clipboard.writeText(getIframeCode(slug));
    setCopiedIframe(id);
    setTimeout(() => setCopiedIframe(null), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === newProductId) || products[0];
    const generatedSlug = newSlug.trim() 
      ? newSlug.toLowerCase().replace(/[^a-z0-9]/g, '-') 
      : `${prod.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const created = createOrderForm({
      title: newTitle || `${prod.name} Checkout Form`,
      slug: generatedSlug,
      productId: prod.id,
      status: 'Active',
      config: {
        productId: prod.id,
        formTitle: prod.name,
        stateInputType: 'dropdown',
        packagePosition: 'before_questions',
        showEmailField: true,
        isEmailRequired: false,
        showWhatsAppField: newShowWhatsApp,
        isWhatsAppRequired: true,
        isAddressRequired: true,
        isCityRequired: true,
        showPackageName: true,
        showDeliveryWindowQuestion: newShowDeliveryWindow,
        requireConfirmationCheckbox: true,
        showCommitmentFeeNotice: true,
        commitmentFeeAmount: newCommitmentFee,
        buttonText: newButtonText,
        buttonColor: newButtonColor,
        borderThickness: 'medium',
        placeholderDarkness: 'medium',
        enableRedirect: newEnableRedirect,
        redirectUrl: newRedirectUrl,
        redirectDelaySeconds: newRedirectDelaySeconds,
        additionalQuestions: [],
        orderBumps: customBumps.length > 0 ? customBumps : [
          {
            id: `bump-${Date.now()}`,
            name: 'Express VIP Priority Courier Dispatch',
            price: 2000,
            description: 'Order prioritized for early morning rider dispatch.'
          }
        ]
      }
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewSlug('');
    setCustomBumps([]);
    setActiveTab('editor');
  };

  const handleUpdateActiveConfig = (updates: any) => {
    if (!currentForm) return;
    updateOrderForm(currentForm.id, {
      config: { ...currentForm.config, ...updates }
    });
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Order Form Builder & Product Forms
            <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
              {orderForms.length} active forms
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create high-converting Payment-on-Delivery checkout forms for any existing or new products, generate embeds, and track conversion rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Form</span>
          </button>

          <button
            onClick={() => setPersona('public_form')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-200 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Live Checkout View</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs w-fit">
        <button
          onClick={() => setActiveTab('forms-list')}
          className={`px-3 py-1 font-medium rounded-md transition ${
            activeTab === 'forms-list' ? 'bg-emerald-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Product Forms ({orderForms.length})
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-3 py-1 font-medium rounded-md transition ${
            activeTab === 'editor' ? 'bg-emerald-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Form Customizer & Live Preview
        </button>
        <button
          onClick={() => setActiveTab('traffic-links')}
          className={`px-3 py-1 font-medium rounded-md transition ${
            activeTab === 'traffic-links' ? 'bg-emerald-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Media Buyer & UTM Links
        </button>
      </div>

      {/* Tab 1: All Product Forms Table & Management */}
      {activeTab === 'forms-list' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                    <th className="py-3 px-4 font-medium">Form Title & Slug</th>
                    <th className="py-3 px-4 font-medium">Linked Product</th>
                    <th className="py-3 px-4 font-medium text-center">Status</th>
                    <th className="py-3 px-4 font-medium text-center">Views</th>
                    <th className="py-3 px-4 font-medium text-center">Orders</th>
                    <th className="py-3 px-4 font-medium text-center">Conversion %</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orderForms.map((form) => {
                    const prod = products.find(p => p.id === form.productId);
                    const isSelected = form.id === selectedFormId;

                    return (
                      <tr 
                        key={form.id} 
                        className={`hover:bg-slate-800/30 transition-colors ${isSelected ? 'bg-emerald-950/15' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <p className="font-semibold text-white">{form.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            slug: <span className="text-emerald-400">/{form.slug}</span>
                          </p>
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          <p className="font-medium text-white">{prod?.name || 'Product'}</p>
                          <p className="text-[10px] text-slate-500 font-mono">SKU: {prod?.sku}</p>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                            {form.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-slate-300">
                          {form.viewsCount.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-white">
                          {form.ordersCount}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                          {form.conversionRate}%
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => {
                                setSelectedFormId(form.id);
                                setPersona('public_form');
                              }}
                              className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-center gap-1"
                              title="Preview in public store"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Preview</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedFormId(form.id);
                                setActiveTab('editor');
                              }}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                              title="Customize form styling & fields"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => copyLink(form.slug, form.id)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-medium"
                              title="Copy Direct Checkout Link"
                            >
                              {copiedLink === form.id ? 'Copied!' : 'Copy Link'}
                            </button>

                            <button
                              onClick={() => duplicateOrderForm(form.id)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                              title="Duplicate Form"
                            >
                              Clone
                            </button>

                            <button
                              onClick={() => deleteOrderForm(form.id)}
                              className="p-1 rounded bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 text-xs"
                              title="Delete Form"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* Tab 2: Form Customizer & Live Preview */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          {/* Active Form Selector Dropdown */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Currently Editing Form:</span>
              <select
                value={selectedFormId}
                onChange={(e) => setSelectedFormId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg p-1.5 font-semibold text-white focus:outline-none"
              >
                {orderForms.map(f => (
                  <option key={f.id} value={f.id}>{f.title} ({f.slug})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyLink(currentForm.slug, currentForm.id)}
                className="px-2.5 py-1 rounded bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-medium hover:bg-emerald-600/50"
              >
                {copiedLink === currentForm.id ? 'Link Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={() => copyIframe(currentForm.slug, currentForm.id)}
                className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 font-medium hover:bg-slate-700"
              >
                {copiedIframe === currentForm.id ? 'Iframe Copied!' : 'Copy Iframe Code'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Controls Sidebar */}
            <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 text-xs">
              <h3 className="font-semibold text-white text-sm">Form Customization & Styling</h3>

              <div>
                <label className="text-slate-400 block mb-1">Form Title</label>
                <input
                  type="text"
                  value={currentForm.title}
                  onChange={(e) => updateOrderForm(currentForm.id, { title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Product</label>
                <select
                  value={currentForm.productId}
                  onChange={(e) => {
                    updateOrderForm(currentForm.id, { productId: e.target.value });
                    handleUpdateActiveConfig({ productId: e.target.value });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.sellingPrice, 'NGN')})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formConfig.showEmailField}
                    onChange={(e) => handleUpdateActiveConfig({ showEmailField: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  <span>Show Email Address Field</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formConfig.showWhatsAppField}
                    onChange={(e) => handleUpdateActiveConfig({ showWhatsAppField: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  <span>Show WhatsApp Phone Field</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formConfig.showDeliveryWindowQuestion}
                    onChange={(e) => handleUpdateActiveConfig({ showDeliveryWindowQuestion: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  <span>Show "When would you like it delivered?" Question</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formConfig.showCommitmentFeeNotice}
                    onChange={(e) => handleUpdateActiveConfig({ showCommitmentFeeNotice: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  <span>Show POD Commitment Notice / Warning</span>
                </label>
              </div>

              {/* Button Text & Color */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-slate-400 block mb-1">Submit Button Text</label>
                  <input
                    type="text"
                    value={formConfig.buttonText}
                    onChange={(e) => handleUpdateActiveConfig({ buttonText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Button Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formConfig.buttonColor}
                      onChange={(e) => handleUpdateActiveConfig({ buttonColor: e.target.value })}
                      className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-slate-300">{formConfig.buttonColor}</span>
                  </div>
                </div>
              </div>

              {/* Order Bumps in this form */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Order Bumps & Upsells</span>
                  <span className="text-slate-400 font-mono text-[10px]">{formConfig.orderBumps.length} active</span>
                </div>
                {formConfig.orderBumps.map(b => (
                  <div key={b.id} className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-[11px]">
                    <span className="text-slate-200 truncate max-w-[170px]">{b.name}</span>
                    <span className="font-mono font-bold text-emerald-400">+{formatCurrency(b.price, 'NGN')}</span>
                  </div>
                ))}
              </div>

              {/* Post-Order Redirect Settings */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-white">Post-Order Redirect URL</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formConfig.enableRedirect ?? false}
                      onChange={(e) => handleUpdateActiveConfig({ enableRedirect: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Automatically forward buyers to your custom Thank You page, WhatsApp VIP group, payment link, or conversion event landing page after order completion.
                </p>

                {formConfig.enableRedirect && (
                  <div className="space-y-3 p-3 rounded-lg bg-slate-950 border border-slate-800 animate-in fade-in">
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Destination Redirect URL
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="url"
                          placeholder="https://yoursite.com/thank-you"
                          value={formConfig.redirectUrl || ''}
                          onChange={(e) => handleUpdateActiveConfig({ redirectUrl: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                        />
                        {formConfig.redirectUrl && (
                          <a
                            href={formConfig.redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                            title="Test open URL in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Redirect Timing
                      </label>
                      <select
                        value={formConfig.redirectDelaySeconds ?? 3}
                        onChange={(e) => handleUpdateActiveConfig({ redirectDelaySeconds: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                      >
                        <option value={0}>Instant (0s) — Immediate Redirect</option>
                        <option value={2}>2 Seconds — Fast Confirmation Countdown</option>
                        <option value={3}>3 Seconds — Standard Celebration Countdown (Recommended)</option>
                        <option value={5}>5 Seconds — Extended Review Before Redirect</option>
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {(formConfig.redirectDelaySeconds ?? 3) === 0 
                          ? 'Redirects immediately when buyer submits order.' 
                          : `Displays order summary and counts down ${formConfig.redirectDelaySeconds ?? 3} seconds before redirecting.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Preview Panel */}
            <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                  ● Live Preview: {currentForm.title}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">/{currentForm.slug}</span>
              </div>

              <div className="max-w-md mx-auto rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4 text-xs text-slate-200">
                <div className="text-center pb-2 border-b border-slate-800">
                  <h4 className="font-bold text-base text-white">{currentProduct.name}</h4>
                  <p className="text-emerald-400 font-semibold text-xs mt-1">Payment On Delivery Available Nationwide</p>
                </div>

                {/* Packages */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    1. Select Your Package:
                  </label>
                  <div className="space-y-2">
                    {currentProduct.packages.map((pkg) => (
                      <div key={pkg.id} className="p-2.5 rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{pkg.name}</p>
                          <p className="text-[10px] text-slate-400">{pkg.description}</p>
                          {pkg.hasFreeGift && (
                            <p className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                              🎁 Free Gift: {pkg.freeGiftName}
                            </p>
                          )}
                        </div>
                        <span className="font-mono font-bold text-emerald-400">
                          {formatCurrency(pkg.price, 'NGN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inputs Sample */}
                <div className="space-y-2">
                  <input
                    type="text"
                    disabled
                    placeholder="Full Name *"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-400"
                  />
                  <input
                    type="tel"
                    disabled
                    placeholder="Phone Number (+234) *"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-400 font-mono"
                  />
                  <input
                    type="text"
                    disabled
                    placeholder="Delivery Address *"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-400"
                  />
                </div>

                <button
                  disabled
                  style={{ backgroundColor: formConfig.buttonColor }}
                  className="w-full py-3 rounded-lg font-bold text-white text-xs shadow-lg uppercase tracking-wide opacity-90"
                >
                  {formConfig.buttonText}
                </button>

                {/* Redirect Preview Badge */}
                {formConfig.enableRedirect && formConfig.redirectUrl && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-[11px] text-emerald-300">
                    <span className="flex items-center gap-1.5 truncate max-w-[240px]">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">Redirects to: <strong className="font-mono text-white">{formConfig.redirectUrl}</strong></span>
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-900/60 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                      {(formConfig.redirectDelaySeconds ?? 3) === 0 ? 'Instant' : `${formConfig.redirectDelaySeconds ?? 3}s delay`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Media Buyer & Traffic Attribution Links */}
      {activeTab === 'traffic-links' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 text-xs">
          <h3 className="font-semibold text-white text-sm">Media Buyer Tracking Variants</h3>
          <p className="text-slate-400">
            Generate pre-tagged UTM campaign links for TikTok, Facebook, and Instagram to track doorstep delivery conversions automatically.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { source: 'tiktok', name: 'TikTok Ads Campaign', campaign: 'tiktok_viral_feed' },
              { source: 'facebook', name: 'Meta / Facebook Ads', campaign: 'fb_feed_lookalike' },
              { source: 'instagram', name: 'Instagram Influencer Swipe-Up', campaign: 'ig_influencer_collab' },
              { source: 'whatsapp', name: 'WhatsApp Direct Retargeting', campaign: 'wa_broadcast_vip' }
            ].map(v => {
              const taggedUrl = `${getShareableUrl(currentForm.slug)}?utm_source=${v.source}&utm_campaign=${v.campaign}`;
              return (
                <div key={v.source} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{v.name}</p>
                    <p className="font-mono text-slate-400 text-[11px] truncate">{taggedUrl}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(taggedUrl);
                      alert(`Copied ${v.name} UTM Link!`);
                    }}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-medium text-white whitespace-nowrap"
                  >
                    Copy Link
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create New Order Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Create Order Form for Product
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Target Product for this Form <span className="text-red-400">*</span>
                </label>
                <select
                  value={newProductId}
                  onChange={(e) => {
                    setNewProductId(e.target.value);
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) setNewTitle(`${p.name} Checkout Form`);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Form Name / Campaign Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bella Glow - Black Friday Special"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Custom URL Slug
                </label>
                <div className="flex items-center gap-1 font-mono text-[11px] bg-slate-950 border border-slate-700 rounded-lg p-2">
                  <span className="text-slate-500">/order-form/</span>
                  <input
                    type="text"
                    placeholder="my-special-offer"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    className="flex-1 bg-transparent text-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={newButtonText}
                    onChange={(e) => setNewButtonText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Button Accent Color</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['#059669', '#2563eb', '#7c3aed', '#dc2626', '#d97706', '#0f172a'].map(col => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setNewButtonColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-6 h-6 rounded-full border ${newButtonColor === col ? 'ring-2 ring-white border-transparent' : 'border-transparent'}`}
                      />
                    ))}
                    <input
                      type="color"
                      value={newButtonColor}
                      onChange={(e) => setNewButtonColor(e.target.value)}
                      className="w-6 h-6 rounded border-none bg-transparent cursor-pointer ml-1"
                    />
                  </div>
                </div>
              </div>

              {/* Add Order Bump */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-semibold text-white text-[11px]">Optional Add-on / Order Bump:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="e.g. VIP Priority Courier Dispatch"
                    value={bumpName}
                    onChange={(e) => setBumpName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Price (₦)"
                    value={bumpPrice}
                    onChange={(e) => setBumpPrice(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (bumpName) {
                      setCustomBumps(prev => [...prev, {
                        id: `bump-${Date.now()}`,
                        name: bumpName,
                        price: bumpPrice,
                        description: 'Added to package upon checkout'
                      }]);
                      setBumpName('');
                    }
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:text-white"
                >
                  + Add Bump to Form
                </button>
                {customBumps.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {customBumps.map((b, idx) => (
                      <div key={b.id || idx} className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                        <span className="text-white truncate max-w-[200px]">{b.name} (₦{b.price.toLocaleString()})</span>
                        <button
                          type="button"
                          onClick={() => setCustomBumps(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300 text-xs px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Post-Order Redirect URL */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-[11px] flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-emerald-400" /> Post-Order Redirect URL
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px]">
                    <input
                      type="checkbox"
                      checked={newEnableRedirect}
                      onChange={(e) => setNewEnableRedirect(e.target.checked)}
                      className="accent-emerald-500"
                    />
                    <span>Enable</span>
                  </label>
                </div>

                {newEnableRedirect && (
                  <div className="space-y-2 pt-1">
                    <input
                      type="url"
                      placeholder="https://yoursite.com/thank-you"
                      value={newRedirectUrl}
                      onChange={(e) => setNewRedirectUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Timing:</span>
                      <select
                        value={newRedirectDelaySeconds}
                        onChange={(e) => setNewRedirectDelaySeconds(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-[11px]"
                      >
                        <option value={0}>Instant (0s)</option>
                        <option value={2}>2s delay</option>
                        <option value={3}>3s delay (Recommended)</option>
                        <option value={5}>5s delay</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition shadow-sm"
                >
                  Create & Publish Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const AIAgentAndTokensView: React.FC = () => {
  const { 
    aiLogs, 
    triggerAICall, 
    orders, 
    settings, 
    tokenTransactions, 
    buyTokens,
    setPersona 
  } = useCrm();

  const answeredCount = aiLogs.filter(l => l.outcome === 'ANSWERED').length;
  const answerRate = aiLogs.length > 0 ? Math.round((answeredCount / aiLogs.length) * 100) : 0;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            AI Voice Agent & Token Metering
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Vapi.ai automated phone call confirmation pipeline, voice outcomes, and prepaid token ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-950/60 border border-indigo-800/60 px-3 py-1.5 text-xs text-indigo-300 font-mono flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-indigo-400" />
            <span>Balance: <strong>{settings.tokenBalance} Tokens</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Calls Triggered</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">{aiLogs.length}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Answer Rate</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{answerRate}%</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Avg Duration</p>
          <p className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">58s</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Remaining Balance</p>
          <p className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">{settings.tokenBalance} tok.</p>
        </div>
      </div>

      {/* Token Packs Purchase Grid */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-indigo-400" /> Top Up AI & SMS Token Packs
          </h2>
          <span className="text-[11px] text-slate-400">1 Token = 1 Call Minute or 5 SMS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
            <p className="font-semibold text-white text-xs">Starter Token Pack</p>
            <p className="text-xl font-bold font-mono text-white">50 Tokens</p>
            <p className="text-xs text-emerald-400 font-mono font-medium">₦9,000</p>
            <p className="text-[10px] text-slate-400">₦180/min or 250 SMS</p>
            <button
              onClick={() => buyTokens(50, 9000)}
              className="w-full mt-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
            >
              Purchase Pack
            </button>
          </div>

          <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-4 space-y-2 relative">
            <span className="absolute top-2 right-2 text-[10px] font-mono font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
              POPULAR
            </span>
            <p className="font-semibold text-white text-xs">Standard Token Pack</p>
            <p className="text-xl font-bold font-mono text-white">150 Tokens</p>
            <p className="text-xs text-emerald-400 font-mono font-medium">₦25,000</p>
            <p className="text-[10px] text-slate-400">₦166/min or 750 SMS</p>
            <button
              onClick={() => buyTokens(150, 25000)}
              className="w-full mt-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm"
            >
              Purchase Pack
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
            <p className="font-semibold text-white text-xs">Pro High-Volume Pack</p>
            <p className="text-xl font-bold font-mono text-white">500 Tokens</p>
            <p className="text-xs text-emerald-400 font-mono font-medium">₦75,000</p>
            <p className="text-[10px] text-slate-400">₦150/min or 2,500 SMS</p>
            <button
              onClick={() => buyTokens(500, 75000)}
              className="w-full mt-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
            >
              Purchase Pack
            </button>
          </div>
        </div>
      </div>

      {/* AI Call Logs */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Vapi Voice Confirmation Logs</h3>
        <div className="space-y-3">
          {aiLogs.map((log) => (
            <div key={log.id} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white">{log.orderNumber}</span>
                  <span className="text-slate-400">· {log.customerName} ({log.customerPhone})</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  log.outcome === 'ANSWERED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                }`}>
                  {log.outcome} ({log.durationSeconds}s)
                </span>
              </div>
              {log.transcriptSnippet && (
                <p className="p-2.5 rounded bg-slate-900/80 text-[11px] text-slate-300 font-mono leading-relaxed border-l-2 border-indigo-500">
                  {log.transcriptSnippet}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
