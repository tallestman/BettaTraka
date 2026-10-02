import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Product, OrderBump, CurrencyCode } from '../../types/crm';
import { formatCurrency } from '../../utils/formatters';
import { 
  FormInput, 
  Layers, 
  ExternalLink, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Code, 
  Share2, 
  Eye, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Info, 
  Sliders, 
  ChevronDown, 
  Package, 
  CheckCircle,
  HelpCircle,
  Settings,
  UserCheck,
  Tag,
  Clock,
  ShieldCheck,
  AlertCircle,
  Flame,
  ShieldAlert,
  Award,
  AlertTriangle,
  Timer,
  Target,
  Link as LinkIcon
} from 'lucide-react';

const NIGERIAN_STATES = [
  'Abia', 'Abuja (FCT)', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
  'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export const EmbedFormGeneratorView: React.FC = () => {
  const { 
    products, 
    orderForms, 
    createOrderForm, 
    updateOrderForm, 
    selectedFormId, 
    setSelectedFormId,
    formConfig, 
    updateFormConfig,
    currency,
    users,
    addNotification
  } = useCrm();

  // Top navigation tabs: matching BettaTraka (Create Order Form, Generate, Media Buyer Forms)
  const [activeTab, setActiveTab] = useState<'create' | 'generate' | 'media-buyers'>('create');

  // Currently selected product for live preview & settings
  const [selectedPreviewProductId, setSelectedPreviewProductId] = useState<string>(
    products[0]?.id || 'prod-1'
  );

  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedPreviewProductId) || products[0];
  }, [products, selectedPreviewProductId]);

  // Order Form Settings State (grounded in formConfig, fully controllable)
  const [stateInputType, setStateInputType] = useState<'dropdown' | 'freetext'>(
    formConfig?.stateInputType || 'dropdown'
  );
  const [packagePosition, setPackagePosition] = useState<'before_questions' | 'after_questions'>(
    formConfig?.packagePosition || 'before_questions'
  );
  
  // Toggles
  const [showEmailField, setShowEmailField] = useState<boolean>(formConfig?.showEmailField ?? false);
  const [showWhatsAppField, setShowWhatsAppField] = useState<boolean>(formConfig?.showWhatsAppField ?? true);
  const [isWhatsAppRequired, setIsWhatsAppRequired] = useState<boolean>(formConfig?.isWhatsAppRequired ?? true);
  const [isAddressRequired, setIsAddressRequired] = useState<boolean>(formConfig?.isAddressRequired ?? true);
  const [isCityRequired, setIsCityRequired] = useState<boolean>(formConfig?.isCityRequired ?? true);
  const [showPackageName, setShowPackageName] = useState<boolean>(formConfig?.showPackageName ?? false);
  const [showDeliveryWindow, setShowDeliveryWindow] = useState<boolean>(formConfig?.showDeliveryWindowQuestion ?? false);
  const [requireConfirmationCheckbox, setRequireConfirmationCheckbox] = useState<boolean>(formConfig?.requireConfirmationCheckbox ?? false);
  const [showCommitmentFeeNotice, setShowCommitmentFeeNotice] = useState<boolean>(formConfig?.showCommitmentFeeNotice ?? false);
  const [commitmentFeeAmount, setCommitmentFeeAmount] = useState<number>(formConfig?.commitmentFeeAmount || 2000);

  // Button Customization
  const [buttonText, setButtonText] = useState<string>(formConfig?.buttonText || 'ORDER NOW');
  const [buttonColor, setButtonColor] = useState<string>(formConfig?.buttonColor || '#22c55e');
  const [buttonSubtext, setButtonSubtext] = useState<string>(
    formConfig?.buttonSubtext || '🔒 100% Risk Free • Pay On Delivery Nationwide'
  );

  // High-Utility Nigerian COD Features
  const [showAltPhoneField, setShowAltPhoneField] = useState<boolean>(formConfig?.showAltPhoneField ?? true);
  const [isAltPhoneRequired, setIsAltPhoneRequired] = useState<boolean>(formConfig?.isAltPhoneRequired ?? false);

  const [formHeadline, setFormHeadline] = useState<string>(
    formConfig?.formHeadline || 'COMPLETE YOUR ORDER BELOW (PAYMENT ON DELIVERY NATIONWIDE)'
  );
  const [formSubheadline, setFormSubheadline] = useState<string>(
    formConfig?.formSubheadline || 'Fill in your delivery address accurately. Our dispatch agent will deliver to your doorstep in 24 - 48 hours.'
  );

  const [showWarningNotice, setShowWarningNotice] = useState<boolean>(formConfig?.showWarningNotice ?? true);
  const [warningNotice, setWarningNotice] = useState<string>(
    formConfig?.warningNotice || '⚠️ IMPORTANT NOTICE: Please do NOT place an order if you will be travelling in the next 48 hours or will not have the complete cash/transfer ready at delivery.'
  );

  const [showTrustBadges, setShowTrustBadges] = useState<boolean>(formConfig?.showTrustBadges ?? true);
  const [showUrgencyTimer, setShowUrgencyTimer] = useState<boolean>(formConfig?.showUrgencyTimer ?? true);
  const [urgencyMinutes, setUrgencyMinutes] = useState<number>(formConfig?.urgencyMinutes ?? 15);
  const [showStockScarcity, setShowStockScarcity] = useState<boolean>(formConfig?.showStockScarcity ?? true);
  const [stockScarcityUnits, setStockScarcityUnits] = useState<number>(formConfig?.stockScarcityUnits ?? 7);
  const [packageDisplayStyle, setPackageDisplayStyle] = useState<'cards' | 'radio' | 'dropdown'>(
    formConfig?.packageDisplayStyle || 'cards'
  );

  // Ad Tracking Pixels (Meta, TikTok, Google)
  const [metaPixelId, setMetaPixelId] = useState<string>(formConfig?.metaPixelId || '109283746582910');
  const [tiktokPixelId, setTiktokPixelId] = useState<string>(formConfig?.tiktokPixelId || 'C7M89K01LL2');
  const [googleTagId, setGoogleTagId] = useState<string>(formConfig?.googleTagId || 'G-ORD98201');

  // Post-purchase redirect & Webhooks
  const [enableRedirect, setEnableRedirect] = useState<boolean>(formConfig?.enableRedirect ?? true);
  const [redirectUrl, setRedirectUrl] = useState<string>(formConfig?.redirectUrl || 'https://example.com/thank-you');
  const [redirectDelaySeconds, setRedirectDelaySeconds] = useState<number>(formConfig?.redirectDelaySeconds ?? 3);
  const [webhookUrl, setWebhookUrl] = useState<string>(formConfig?.webhookUrl || '');

  // Field Styling
  const [borderThicknessPx, setBorderThicknessPx] = useState<number>(1);
  const [placeholderDarknessPct, setPlaceholderDarknessPct] = useState<number>(0);

  // Additional Questions State
  const [questionProductScope, setQuestionProductScope] = useState<string>(products[0]?.id || 'prod-1');
  const [additionalQuestions, setAdditionalQuestions] = useState<Array<{
    id: string;
    productId?: string;
    question: string;
    type: 'text' | 'select';
    options?: string[];
    required: boolean;
  }>>(formConfig?.additionalQuestions || []);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'text' | 'select'>('text');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');
  const [newQuestionRequired, setNewQuestionRequired] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // Order Bumps / Upsells State
  const [bumpProductScope, setBumpProductScope] = useState<string>(products[0]?.id || 'prod-1');
  const [orderBumps, setOrderBumps] = useState<OrderBump[]>(formConfig?.orderBumps || []);
  const [showAddBumpModal, setShowAddBumpModal] = useState(false);
  const [bumpTargetProductId, setBumpTargetProductId] = useState<string>(products[1]?.id || products[0]?.id || '');
  const [bumpName, setBumpName] = useState('');
  const [bumpPrice, setBumpPrice] = useState<number>(3500);
  const [bumpOriginalPrice, setBumpOriginalPrice] = useState<number>(7000);
  const [bumpBadge, setBumpBadge] = useState('50% OFF SPECIAL');
  const [bumpDescription, setBumpDescription] = useState('Add to your order today for exclusive savings.');

  // Live Interactive Preview Form State
  const [previewSelectedPackageId, setPreviewSelectedPackageId] = useState<string>(
    activeProduct?.packages?.[0]?.id || ''
  );
  const [previewSelectedBumps, setPreviewSelectedBumps] = useState<Record<string, boolean>>({});
  const [previewDeliveryWindow, setPreviewDeliveryWindow] = useState('Tomorrow Morning (9AM - 12PM)');
  const [previewCommitmentResponse, setPreviewCommitmentResponse] = useState<'agree' | 'disagree'>('agree');
  const [previewConfirmationChecked, setPreviewConfirmationChecked] = useState(false);
  const [previewDeviceMode, setPreviewDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  // Copy tracking states for Generate tab
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Media Buyer Forms tab state
  const [selectedMediaBuyerId, setSelectedMediaBuyerId] = useState<string>(users[0]?.id || '');
  const [selectedMediaBuyerProduct, setSelectedMediaBuyerProduct] = useState<string>(products[0]?.id || '');
  const [utmSource, setUtmSource] = useState('facebook');
  const [utmCampaign, setUtmCampaign] = useState('celebrity_glow_q3_scale');
  const [utmMedium, setUtmMedium] = useState('cpc');

  // Generate Tab format sub-tab per product
  const [embedFormatTab, setEmbedFormatTab] = useState<Record<string, 'direct' | 'iframe' | 'elementor'>>({});

  // Update selected package whenever active product changes
  React.useEffect(() => {
    if (activeProduct?.packages?.length) {
      setPreviewSelectedPackageId(activeProduct.packages[0].id);
    }
  }, [activeProduct]);

  // Save changes handler
  const handleSaveChanges = () => {
    updateFormConfig({
      stateInputType,
      packagePosition,
      showEmailField,
      isEmailRequired: false,
      showWhatsAppField,
      isWhatsAppRequired,
      isAddressRequired,
      isCityRequired,
      showPackageName,
      showDeliveryWindowQuestion: showDeliveryWindow,
      requireConfirmationCheckbox,
      showCommitmentFeeNotice,
      commitmentFeeAmount,
      buttonText,
      buttonColor,
      buttonSubtext,
      additionalQuestions,
      orderBumps,
      showAltPhoneField,
      isAltPhoneRequired,
      formHeadline,
      formSubheadline,
      showWarningNotice,
      warningNotice,
      showTrustBadges,
      showUrgencyTimer,
      urgencyMinutes,
      showStockScarcity,
      stockScarcityUnits,
      packageDisplayStyle,
      metaPixelId,
      tiktokPixelId,
      googleTagId,
      enableRedirect,
      redirectUrl,
      redirectDelaySeconds,
      webhookUrl
    });

    if (addNotification) {
      addNotification({
        title: 'Order Form Settings Saved',
        message: 'Changes applied to all embed URLs and live forms.',
        type: 'success'
      });
    }
  };

  // Add Question Handler
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQ = {
      id: `q-${Date.now()}`,
      productId: questionProductScope,
      question: newQuestionText.trim(),
      type: newQuestionType,
      options: newQuestionType === 'select' ? newQuestionOptions.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      required: newQuestionRequired
    };

    setAdditionalQuestions(prev => [...prev, newQ]);
    setShowQuestionModal(false);
    setNewQuestionText('');
    setNewQuestionOptions('');
    setNewQuestionRequired(false);
  };

  const handleDeleteQuestion = (id: string) => {
    setAdditionalQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Add Order Bump Handler
  const handleAddOrderBump = (e: React.FormEvent) => {
    e.preventDefault();
    const companionProd = products.find(p => p.id === bumpTargetProductId);
    const finalName = bumpName.trim() || companionProd?.name || 'Companion Product Add-On';

    const newB: OrderBump = {
      id: `bump-${Date.now()}`,
      productId: bumpTargetProductId,
      name: finalName,
      price: Number(bumpPrice),
      originalPrice: Number(bumpOriginalPrice),
      description: bumpDescription.trim() || 'Exclusive discount when added with your order today.',
      badge: bumpBadge.trim() || 'SPECIAL OFFER'
    };

    setOrderBumps(prev => [...prev, newB]);
    setShowAddBumpModal(false);
    setBumpName('');
    setBumpPrice(3500);
    setBumpOriginalPrice(7000);
  };

  const handleDeleteOrderBump = (id: string) => {
    setOrderBumps(prev => prev.filter(b => b.id !== id));
  };

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
    if (addNotification) {
      addNotification({
        title: 'Copied to Clipboard',
        message: 'Embed link or code snippet copied successfully.',
        type: 'info'
      });
    }
  };

  // Calculate live preview total price
  const previewTotalPrice = useMemo(() => {
    let total = 0;
    const pkg = activeProduct?.packages?.find(p => p.id === previewSelectedPackageId);
    if (pkg) {
      total += pkg.price;
    } else if (activeProduct) {
      total += activeProduct.sellingPrice;
    }

    orderBumps.forEach(bump => {
      if (previewSelectedBumps[bump.id]) {
        total += bump.price;
      }
    });

    return total;
  }, [activeProduct, previewSelectedPackageId, orderBumps, previewSelectedBumps]);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 animate-in fade-in">
      {/* 1. BREADCRUMBS & MAIN TITLE (BettaTraka CRM Design) */}
      <div className="space-y-1.5">
        <p className="text-xs text-slate-400 font-medium">
          Dashboard <span className="text-slate-600">&gt;</span> <span className="text-white">Embed Form Generator</span>
        </p>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
          Embed Form Generator
        </h1>
        <p className="text-xs text-slate-400">
          Customize and embed your order form on any website
        </p>
      </div>

      {/* 2. TOP TAB BAR PILLS */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-lg transition cursor-pointer ${
            activeTab === 'create' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Create Order Form
        </button>

        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 rounded-lg transition cursor-pointer ${
            activeTab === 'generate' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Generate
        </button>

        <button
          onClick={() => setActiveTab('media-buyers')}
          className={`px-4 py-2 rounded-lg transition cursor-pointer ${
            activeTab === 'media-buyers' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Media Buyer Forms
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: CREATE ORDER FORM (Settings & Live Preview) */}
      {/* ===================================================================== */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: ORDER FORM SETTINGS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: Main Form Settings Container */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/40 p-5 lg:p-6 space-y-5 text-xs shadow-sm">
              <div className="border-b border-slate-800/80 pb-3">
                <h2 className="text-sm font-bold text-white">Order Form Settings</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Customize what fields show on your public order form. Changes apply to all embed URLs.
                </p>
              </div>

              {/* State Field Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">State field</label>
                <div className="relative">
                  <select
                    value={stateInputType}
                    onChange={(e) => setStateInputType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none"
                  >
                    <option value="dropdown">Dropdown (36 Nigerian states)</option>
                    <option value="freetext">Free-text input</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Dropdown only applies when the order form is set to NGN. Other currencies always use free-text.
                </p>
              </div>

              {/* Package Position Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Package Position</label>
                <div className="relative">
                  <select
                    value={packagePosition}
                    onChange={(e) => setPackagePosition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none"
                  >
                    <option value="before_questions">Before Customer Information</option>
                    <option value="after_questions">After Customer Information</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Controls whether the package selector is displayed first or last on the checkout form.
                </p>
              </div>

              {/* Toggle: Show Email Field */}
              <div className="flex items-center justify-between py-2 border-t border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="font-semibold text-white block">Show email field</span>
                  <span className="text-[11px] text-slate-400">Adds an email input to the form.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEmailField}
                    onChange={(e) => setShowEmailField(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Toggle: Show WhatsApp field */}
              <div className="flex items-center justify-between py-2 border-t border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="font-semibold text-white block">Show WhatsApp field</span>
                  <span className="text-[11px] text-slate-400">When off, the WhatsApp number input is hidden from the form.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showWhatsAppField}
                    onChange={(e) => setShowWhatsAppField(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Toggle: WhatsApp Required */}
              {showWhatsAppField && (
                <div className="flex items-center justify-between py-2 border-t border-slate-800/80 pl-4 border-l-2 border-l-emerald-500/50">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white block">Required (WhatsApp)</span>
                    <span className="text-[11px] text-slate-400">Off = customers can skip it. On = they must fill it in.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isWhatsAppRequired}
                      onChange={(e) => setIsWhatsAppRequired(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              )}

              {/* Toggle: Show Alternative Phone Field */}
              <div className="flex items-center justify-between py-2 border-t border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="font-semibold text-white block">Show Alternative Phone field</span>
                  <span className="text-[11px] text-slate-400">Gives dispatch riders a backup MTN/Airtel number if customer&apos;s primary phone is unreachable.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAltPhoneField}
                    onChange={(e) => setShowAltPhoneField(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Toggle: Alternative Phone Required */}
              {showAltPhoneField && (
                <div className="flex items-center justify-between py-2 border-t border-slate-800/80 pl-4 border-l-2 border-l-emerald-500/50">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white block">Required (Alternative Phone)</span>
                    <span className="text-[11px] text-slate-400">Customer must fill in a secondary contact phone number.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAltPhoneRequired}
                      onChange={(e) => setIsAltPhoneRequired(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              )}

              {/* Required fields Section */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="font-bold text-white block">Required fields</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Phone number is always required. These settings control the other customer details on the embed form.
                </p>
              </div>

              {/* Toggle: Address required */}
              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5">
                  <span className="font-semibold text-white block">Address required</span>
                  <span className="text-[11px] text-slate-400">Off = customers can submit without entering an address.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAddressRequired}
                    onChange={(e) => setIsAddressRequired(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Toggle: City required */}
              <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="font-semibold text-white block">City required</span>
                  <span className="text-[11px] text-slate-400">Off = customers can submit without entering a city.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCityRequired}
                    onChange={(e) => setIsCityRequired(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Toggle: Show package name */}
              <div className="flex items-center justify-between py-2 border-t border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="font-semibold text-white block">Show package name</span>
                  <span className="text-[11px] text-slate-400">Show the package name above the description in the package picker.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPackageName}
                    onChange={(e) => setShowPackageName(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Toggle: Ask When would you like it delivered */}
              <div className="flex items-center justify-between py-2 border-t border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="font-semibold text-white block">Ask &quot;When would you like it delivered?&quot;</span>
                  <span className="text-[11px] text-slate-400">Captures the customer&apos;s preferred delivery window on the order form.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDeliveryWindow}
                    onChange={(e) => setShowDeliveryWindow(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Toggle: Require confirmation checkbox */}
              <div className="flex items-center justify-between py-2 border-t border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="font-semibold text-white block">Require a confirmation checkbox</span>
                  <span className="text-[11px] text-slate-400">Customer must tick this before they can submit the form.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireConfirmationCheckbox}
                    onChange={(e) => setRequireConfirmationCheckbox(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Toggle: Show commitment fee notice */}
              <div className="flex items-center justify-between py-2 border-t border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="font-semibold text-white block">Show commitment fee notice</span>
                  <span className="text-[11px] text-slate-400">
                    Displays a notice above the submit button. Customer must respond before submitting, and you can optionally allow &quot;I disagree&quot; without blocking the order.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCommitmentFeeNotice}
                    onChange={(e) => setShowCommitmentFeeNotice(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Order Now button text */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <label className="text-xs font-semibold text-slate-300 block">Order Now button text</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  Label shown on the submit button of the public order form.
                </p>
              </div>

              {/* Order Now button color */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <label className="text-xs font-semibold text-slate-300 block">Order Now button color</label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl border border-slate-700 shrink-0 shadow-inner"
                    style={{ backgroundColor: buttonColor }}
                  />
                  <input
                    type="text"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="w-36 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 uppercase"
                  />
                  <div className="flex items-center gap-1.5">
                    {['#22c55e', '#059669', '#2563eb', '#38bdf8', '#e11d48', '#d97706'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setButtonColor(c)}
                        className={`w-6 h-6 rounded-full border transition cursor-pointer ${
                          buttonColor.toLowerCase() === c.toLowerCase() ? 'border-white scale-110 shadow' : 'border-slate-800 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Background color of the submit button on the public order form.
                </p>
              </div>

              {/* Field Styling Sliders */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <span className="font-bold text-white block">Field styling</span>
                <p className="text-[11px] text-slate-400">
                  Controls how input, select, and textarea fields look on the public order form.
                </p>

                {/* Input border thickness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">Input border thickness</span>
                    <span className="font-mono text-slate-400">{borderThicknessPx}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={borderThicknessPx}
                    onChange={(e) => setBorderThicknessPx(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Placeholder darkness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">Placeholder darkness</span>
                    <span className="font-mono text-slate-400">{placeholderDarknessPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={placeholderDarknessPct}
                    onChange={(e) => setPlaceholderDarknessPct(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Nigerian COD Anti-Fake-Order Disclaimer Banner */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>Anti-Fake-Order Warning Banner</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Warns non-serious buyers not to order if they are travelling or won&apos;t have cash ready. Drastically cuts returned packages!
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWarningNotice}
                      onChange={(e) => setShowWarningNotice(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {showWarningNotice && (
                  <div className="space-y-1.5 pl-3 border-l-2 border-l-amber-500">
                    <label className="text-[11px] font-semibold text-slate-300 block">Notice Text</label>
                    <textarea
                      rows={2}
                      value={warningNotice}
                      onChange={(e) => setWarningNotice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none font-sans"
                    />
                  </div>
                )}
              </div>

              {/* Form Headline & Subtitle */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <span className="font-bold text-white block">Form Header Copywriting</span>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Headline</label>
                    <input
                      type="text"
                      value={formHeadline}
                      onChange={(e) => setFormHeadline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Subheadline</label>
                    <input
                      type="text"
                      value={formSubheadline}
                      onChange={(e) => setFormSubheadline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Urgency & Social Proof Boosters */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <span className="font-bold text-white block flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Urgency & Conversion Boosters</span>
                </span>

                {/* Urgency Timer */}
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white block">Urgency Countdown Timer</span>
                    <span className="text-[11px] text-slate-400">Shows &quot;Special price reserved for 15:00&quot; countdown banner.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showUrgencyTimer}
                      onChange={(e) => setShowUrgencyTimer(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Live Stock Scarcity */}
                <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white block">Live Stock Scarcity Counter</span>
                    <span className="text-[11px] text-slate-400">Shows &quot;Only X units remaining in stock today&quot; banner.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showStockScarcity}
                      onChange={(e) => setShowStockScarcity(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white block">Payment On Delivery Trust Badges</span>
                    <span className="text-[11px] text-slate-400">Displays 4 trust icons (Pay On Delivery, Free Nationwide Shipping, 30-Day Guarantee, Genuine Product).</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTrustBadges}
                      onChange={(e) => setShowTrustBadges(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* Tracking Pixels Integration */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <span className="font-bold text-white block flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tracking Pixels & Analytics (Conversions)</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Automatically fires InitiateCheckout and Purchase conversion events on your ad platforms.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Meta (Facebook) Pixel ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 109283746582910"
                      value={metaPixelId}
                      onChange={(e) => setMetaPixelId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">TikTok Pixel ID</label>
                    <input
                      type="text"
                      placeholder="e.g. C7M89K01LL2"
                      value={tiktokPixelId}
                      onChange={(e) => setTiktokPixelId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Thank You Page Redirect Settings */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">Custom Thank You Page Redirect</span>
                    <span className="text-[11px] text-slate-400">Auto-redirect customers to your custom WhatsApp or thank-you page after ordering.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableRedirect}
                      onChange={(e) => setEnableRedirect(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {enableRedirect && (
                  <div className="space-y-2 pl-3 border-l-2 border-l-emerald-500">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Redirect Destination URL</label>
                      <input
                        type="url"
                        value={redirectUrl}
                        onChange={(e) => setRedirectUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono text-[11px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Save & Preview Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/20 transition cursor-pointer"
                >
                  Save changes
                </button>
                <a
                  href={`/order-form/embed?product=${activeProduct?.id || 'prod-1'}&currency=NGN`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview form</span>
                </a>
              </div>
            </div>

            {/* Section 2: Additional Questions */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/40 p-5 lg:p-6 space-y-4 text-xs shadow-sm">
              <div className="border-b border-slate-800/80 pb-3">
                <h2 className="text-sm font-bold text-white">Additional Questions</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Add custom questions that customers answer for a specific product — shown after they fill in their personal details.
                </p>
              </div>

              {/* Product Selector for Questions */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Product</label>
                <div className="relative">
                  <select
                    value={questionProductScope}
                    onChange={(e) => setQuestionProductScope(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* List of existing questions */}
              {additionalQuestions.length > 0 && (
                <div className="space-y-2 pt-1">
                  {additionalQuestions.map(q => (
                    <div key={q.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{q.question}</span>
                          {q.required && (
                            <span className="text-[10px] text-rose-400 font-mono">* Required</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono capitalize">Type: {q.type}</span>
                        {q.options && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Options: {q.options.join(', ')}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Question Button */}
              <button
                type="button"
                onClick={() => setShowQuestionModal(true)}
                className="w-full py-3 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add question</span>
              </button>
              {additionalQuestions.length === 0 && (
                <p className="text-center text-[11px] text-slate-500">
                  No questions yet. Click above to add your first one.
                </p>
              )}
            </div>

            {/* Section 3: Order Bumps / Upsells */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/40 p-5 lg:p-6 space-y-4 text-xs shadow-sm">
              <div className="border-b border-slate-800/80 pb-3">
                <h2 className="text-sm font-bold text-white">Order Bumps / Upsells</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Offer one or more different products as optional add-ons on a product&apos;s order form. Customers tick a box to add each one to their order.
                </p>
              </div>

              {/* Product Selector for Bumps */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Product</label>
                <div className="relative">
                  <select
                    value={bumpProductScope}
                    onChange={(e) => setBumpProductScope(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400">
                  This is the product whose order form will show the bumps below.
                </p>
              </div>

              {/* List of existing order bumps */}
              {orderBumps.length > 0 && (
                <div className="space-y-2 pt-1">
                  {orderBumps.map(b => (
                    <div key={b.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate">{b.name}</span>
                          {b.badge && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                              {b.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{b.description}</p>
                        <div className="flex items-baseline gap-2 font-mono">
                          <span className="text-emerald-400 font-bold">{formatCurrency(b.price, 'NGN')}</span>
                          {b.originalPrice && b.originalPrice > b.price && (
                            <span className="text-slate-500 line-through text-[10px]">{formatCurrency(b.originalPrice, 'NGN')}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteOrderBump(b.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer shrink-0"
                        title="Delete order bump"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Order Bump Button */}
              <button
                type="button"
                onClick={() => {
                  const comp = products.find(p => p.id !== bumpProductScope) || products[0];
                  if (comp) {
                    setBumpTargetProductId(comp.id);
                    setBumpName(`${comp.name} (Special Add-On)`);
                    setBumpPrice(Math.round(comp.sellingPrice * 0.5));
                    setBumpOriginalPrice(comp.sellingPrice);
                  }
                  setShowAddBumpModal(true);
                }}
                className="w-full py-3 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add order bump</span>
              </button>
              {orderBumps.length === 0 && (
                <p className="text-center text-[11px] text-slate-500">
                  No order bumps yet. Click above to add your first one.
                </p>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY LIVE PREVIEW */}
          <div className="lg:col-span-5 sticky top-20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Live Preview</h3>
              </div>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setPreviewDeviceMode('desktop')}
                  className={`p-1.5 rounded transition ${previewDeviceMode === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDeviceMode('mobile')}
                  className={`p-1.5 rounded transition ${previewDeviceMode === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Product Selector Dropdown for Preview */}
            <div className="relative">
              <select
                value={selectedPreviewProductId}
                onChange={(e) => setSelectedPreviewProductId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none shadow-sm"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* The Actual Rendered Form Container (White Card Matching fm1 - fm4) */}
            <div className={`bg-white text-slate-900 rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-300 max-h-[780px] overflow-y-auto space-y-4 text-xs transition-all ${
              previewDeviceMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
            }`}>
              
              {/* URGENCY & SCARCITY PROOF BAR */}
              {(showUrgencyTimer || showStockScarcity) && (
                <div className="space-y-1.5 pb-2">
                  {showUrgencyTimer && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 text-center flex items-center justify-center gap-1.5 text-rose-700 text-[11px] font-bold">
                      <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                      <span>Special Price Reserved For Next {urgencyMinutes || 15}:00 Mins</span>
                    </div>
                  )}
                  {showStockScarcity && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-center flex items-center justify-center gap-1.5 text-amber-800 text-[11px] font-semibold">
                      <Timer className="w-3.5 h-3.5 text-amber-600" />
                      <span>⚡ Only {stockScarcityUnits || 7} units left for today&apos;s courier dispatch!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Form Title & Subtitle */}
              <div className="text-center pb-2 border-b border-slate-100 space-y-1">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight uppercase">
                  {formHeadline || activeProduct?.name || 'Celebrity Glow'}
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {formSubheadline || 'Order Now • Doorstep Delivery • Payment on Delivery'}
                </p>
              </div>

              {/* ANTI-FAKE-ORDER NOTICE (Nigerian COD Essential) */}
              {showWarningNotice && (
                <div className="p-3 rounded-xl border border-amber-300 bg-amber-50/90 text-amber-950 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>PLEASE READ CAREFULLY BEFORE ORDERING:</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                    {warningNotice}
                  </p>
                </div>
              )}

              {/* PACKAGE SELECTION (If Before Customer Information) */}
              {packagePosition === 'before_questions' && (
                <div className="space-y-2 pt-1">
                  <span className="font-bold text-slate-900 text-xs tracking-wide uppercase block">
                    SELECT YOUR PACKAGE *
                  </span>
                  
                  <div className="space-y-2">
                    {activeProduct?.packages && activeProduct.packages.length > 0 ? (
                      activeProduct.packages.map((pkg) => (
                        <label
                          key={pkg.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                            previewSelectedPackageId === pkg.id 
                              ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600' 
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="preview-package"
                            checked={previewSelectedPackageId === pkg.id}
                            onChange={() => setPreviewSelectedPackageId(pkg.id)}
                            className="mt-0.5 accent-emerald-600 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">
                                {showPackageName ? pkg.name : `${pkg.quantity}x ${activeProduct.name}`}
                              </span>
                              <span className="font-bold text-slate-900 text-xs font-mono ml-2">
                                {formatCurrency(pkg.price, 'NGN')}
                              </span>
                            </div>
                            {pkg.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {pkg.description}
                              </p>
                            )}
                            {pkg.badge && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-center">
                        Standard Single Unit: {formatCurrency(activeProduct?.sellingPrice || 18500, 'NGN')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CUSTOMER INFORMATION FIELDS */}
              <div className="space-y-3 pt-1">
                {/* Full name */}
                <div>
                  <input
                    type="text"
                    disabled
                    placeholder="Full name *"
                    style={{ borderWidth: `${borderThicknessPx}px` }}
                    className="w-full bg-white border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* Phone Number */}
                <div className="flex rounded-xl overflow-hidden border border-slate-300" style={{ borderWidth: `${borderThicknessPx}px` }}>
                  <span className="bg-slate-100 px-3 py-2.5 text-xs font-medium text-slate-600 border-r border-slate-300 flex items-center gap-1 shrink-0">
                    +234
                  </span>
                  <input
                    type="text"
                    disabled
                    placeholder="Your Phone Number *"
                    className="w-full bg-white px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* WhatsApp Field (If Enabled) */}
                {showWhatsAppField && (
                  <div className="flex rounded-xl overflow-hidden border border-slate-300" style={{ borderWidth: `${borderThicknessPx}px` }}>
                    <span className="bg-slate-100 px-3 py-2.5 text-xs font-medium text-slate-600 border-r border-slate-300 flex items-center gap-1 shrink-0">
                      +234
                    </span>
                    <input
                      type="text"
                      disabled
                      placeholder={`Your WhatsApp Number ${isWhatsAppRequired ? '*' : '(Optional)'}`}
                      className="w-full bg-white px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                )}

                {/* Alternative Phone Field (If Enabled) */}
                {showAltPhoneField && (
                  <div className="flex rounded-xl overflow-hidden border border-slate-300" style={{ borderWidth: `${borderThicknessPx}px` }}>
                    <span className="bg-slate-100 px-3 py-2.5 text-xs font-medium text-slate-600 border-r border-slate-300 flex items-center gap-1 shrink-0">
                      +234
                    </span>
                    <input
                      type="text"
                      disabled
                      placeholder={`Alternative / Second Phone Number ${isAltPhoneRequired ? '*' : '(Optional)'}`}
                      className="w-full bg-white px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                )}

                {/* Email Field (If Enabled) */}
                {showEmailField && (
                  <div>
                    <input
                      type="email"
                      disabled
                      placeholder="Your Email Address (Optional)"
                      style={{ borderWidth: `${borderThicknessPx}px` }}
                      className="w-full bg-white border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                )}

                {/* Address */}
                <div>
                  <input
                    type="text"
                    disabled
                    placeholder={`Your Address ${isAddressRequired ? '*' : '(Optional)'}`}
                    style={{ borderWidth: `${borderThicknessPx}px` }}
                    className="w-full bg-white border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* City */}
                <div>
                  <input
                    type="text"
                    disabled
                    placeholder={`Your City ${isCityRequired ? '*' : '(Optional)'}`}
                    style={{ borderWidth: `${borderThicknessPx}px` }}
                    className="w-full bg-white border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* State (Dropdown or Free-text) */}
                <div>
                  {stateInputType === 'dropdown' ? (
                    <div className="relative">
                      <select
                        disabled
                        style={{ borderWidth: `${borderThicknessPx}px` }}
                        className="w-full bg-white border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-700 appearance-none"
                      >
                        <option>Select your state *</option>
                        {NIGERIAN_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type="text"
                      disabled
                      placeholder="Your State *"
                      style={{ borderWidth: `${borderThicknessPx}px` }}
                      className="w-full bg-white border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                    />
                  )}
                </div>
              </div>

              {/* PACKAGE SELECTION (If After Customer Information) */}
              {packagePosition === 'after_questions' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-900 text-xs tracking-wide uppercase block">
                    SELECT YOUR PACKAGE *
                  </span>
                  
                  <div className="space-y-2">
                    {activeProduct?.packages && activeProduct.packages.length > 0 ? (
                      activeProduct.packages.map((pkg) => (
                        <label
                          key={pkg.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                            previewSelectedPackageId === pkg.id 
                              ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600' 
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="preview-package"
                            checked={previewSelectedPackageId === pkg.id}
                            onChange={() => setPreviewSelectedPackageId(pkg.id)}
                            className="mt-0.5 accent-emerald-600 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">
                                {showPackageName ? pkg.name : `${pkg.quantity}x ${activeProduct.name}`}
                              </span>
                              <span className="font-bold text-slate-900 text-xs font-mono ml-2">
                                {formatCurrency(pkg.price, 'NGN')}
                              </span>
                            </div>
                            {pkg.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {pkg.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-center">
                        Standard Single Unit: {formatCurrency(activeProduct?.sellingPrice || 18500, 'NGN')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DYNAMIC ADDITIONAL QUESTIONS */}
              {additionalQuestions.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  {additionalQuestions.map(q => (
                    <div key={q.id} className="space-y-1">
                      <label className="text-xs font-semibold text-slate-800 block">
                        {q.question} {q.required && <span className="text-rose-500">*</span>}
                      </label>
                      {q.type === 'select' && q.options ? (
                        <div className="relative">
                          <select 
                            disabled 
                            style={{ borderWidth: `${borderThicknessPx}px` }}
                            className="w-full bg-white border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 appearance-none"
                          >
                            <option>-- Please select --</option>
                            {q.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                        </div>
                      ) : (
                        <input
                          type="text"
                          disabled
                          placeholder="Your answer"
                          style={{ borderWidth: `${borderThicknessPx}px` }}
                          className="w-full bg-white border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ORDER BUMPS / UPSELL OFFERS */}
              {orderBumps.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-900 text-xs tracking-wide uppercase block">
                    SPECIAL ADD-ON OFFERS
                  </span>

                  <div className="space-y-2">
                    {orderBumps.map(bump => (
                      <label
                        key={bump.id}
                        className={`block p-3 rounded-xl border-2 transition cursor-pointer ${
                          previewSelectedBumps[bump.id] 
                            ? 'border-emerald-600 bg-emerald-50/60 shadow-sm' 
                            : 'border-dashed border-emerald-400/80 bg-emerald-50/20 hover:bg-emerald-50/40'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={!!previewSelectedBumps[bump.id]}
                            onChange={(e) => {
                              setPreviewSelectedBumps(prev => ({
                                ...prev,
                                [bump.id]: e.target.checked
                              }));
                            }}
                            className="mt-0.5 accent-emerald-600 cursor-pointer w-4 h-4"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-900 text-xs">
                                YES! Add {bump.name}
                              </span>
                              <span className="font-bold text-emerald-700 font-mono text-xs whitespace-nowrap">
                                +{formatCurrency(bump.price, 'NGN')}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                              {bump.description}
                            </p>
                            {bump.badge && (
                              <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {bump.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* DELIVERY WINDOW SELECTOR (If Enabled) */}
              {showDeliveryWindow && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-semibold text-slate-800 block">
                    When would you like it delivered?
                  </label>
                  <div className="relative">
                    <select
                      value={previewDeliveryWindow}
                      onChange={(e) => setPreviewDeliveryWindow(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="Tomorrow Morning (9AM - 12PM)">Tomorrow Morning (9AM - 12PM)</option>
                      <option value="Tomorrow Afternoon (12PM - 4PM)">Tomorrow Afternoon (12PM - 4PM)</option>
                      <option value="Within 48 Hours">Within 48 Hours</option>
                      <option value="This Weekend (Saturday / Sunday)">This Weekend (Saturday / Sunday)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* CONFIRMATION CHECKBOX (If Enabled) */}
              {requireConfirmationCheckbox && (
                <label className="flex items-start gap-2.5 pt-2 border-t border-slate-100 cursor-pointer text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={previewConfirmationChecked}
                    onChange={(e) => setPreviewConfirmationChecked(e.target.checked)}
                    className="mt-0.5 accent-emerald-600 cursor-pointer w-4 h-4 shrink-0"
                  />
                  <span className="leading-snug">
                    I confirm that my details are accurate and I will be available with cash or transfer to receive my delivery.
                  </span>
                </label>
              )}

              {/* COMMITMENT FEE NOTICE (If Enabled) */}
              {showCommitmentFeeNotice && (
                <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 text-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <Info className="w-3.5 h-3.5 text-amber-700" />
                    <span>Commitment Fee Notice</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    In select transit corridors, a token commitment fee of <strong>{formatCurrency(commitmentFeeAmount, 'NGN')}</strong> may be requested to confirm dispatch seriousness. Fee is 100% credited against your final balance upon delivery.
                  </p>
                  <div className="flex items-center gap-4 text-xs pt-1 font-medium">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="preview-commit"
                        checked={previewCommitmentResponse === 'agree'}
                        onChange={() => setPreviewCommitmentResponse('agree')}
                        className="accent-emerald-600"
                      />
                      <span>I agree</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-500">
                      <input
                        type="radio"
                        name="preview-commit"
                        checked={previewCommitmentResponse === 'disagree'}
                        onChange={() => setPreviewCommitmentResponse('disagree')}
                        className="accent-emerald-600"
                      />
                      <span>I disagree (regular dispatch)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON WITH DYNAMIC COLOR & TEXT */}
              <div className="pt-2">
                <button
                  type="button"
                  style={{ backgroundColor: buttonColor }}
                  className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs shadow-lg uppercase tracking-wider transition hover:opacity-95 active:scale-95 cursor-pointer"
                >
                  {buttonText} • {formatCurrency(previewTotalPrice, 'NGN')}
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-1.5 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified 100% Doorstep Payment on Delivery Guarantee</span>
                </p>

                {buttonSubtext && (
                  <p className="text-[11px] text-center text-slate-600 font-semibold mt-1">
                    {buttonSubtext}
                  </p>
                )}

                {/* TRUST & GUARANTEE BADGES */}
                {showTrustBadges && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-base block">🚚</span>
                      <span className="font-bold text-[10px] text-slate-800 block">Nationwide Delivery</span>
                      <span className="text-[9px] text-slate-500 block">Fast courier dispatch</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-base block">💵</span>
                      <span className="font-bold text-[10px] text-slate-800 block">Pay On Delivery</span>
                      <span className="text-[9px] text-slate-500 block">Inspect before pay</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-base block">🛡️</span>
                      <span className="font-bold text-[10px] text-slate-800 block">100% Genuine</span>
                      <span className="text-[9px] text-slate-500 block">Authentic guarantee</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-base block">🔄</span>
                      <span className="font-bold text-[10px] text-slate-800 block">Easy Exchange</span>
                      <span className="text-[9px] text-slate-500 block">24/7 client care</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: GENERATE (Embed Code & Direct Links - Matching fm5.png) */}
      {/* ===================================================================== */}
      {activeTab === 'generate' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Blue Informative Banner matching fm5.png */}
          <div className="rounded-xl border border-blue-800/80 bg-blue-950/40 p-4 text-xs text-blue-200 flex items-center gap-3">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <p className="leading-relaxed">
              <strong>How it works:</strong> Only products with active packages can have embed forms. Create packages for your products in the <span className="font-semibold underline cursor-pointer">Inventory</span> section first.
            </p>
          </div>

          {/* Section Header */}
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Products Ready for Embed</span>
              <span className="text-xs text-slate-400 cursor-help" title="Products with configured pricing packages ready to accept public orders.">ⓘ</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              These products have packages and can generate embed forms
            </p>
          </div>

          {/* List of Products Ready for Embed */}
          <div className="space-y-4">
            {products.map(prod => {
              const currentFormat = embedFormatTab[prod.id] || 'direct';
              const directLink = `${window.location.origin}/order-form/embed?product=${prod.id}&currency=NGN`;
              const iframeSnippet = `<iframe src="${directLink}" width="100%" height="900" frameborder="0" style="border:none; max-width:650px; margin:0 auto; display:block;"></iframe>`;
              const elementorSnippet = `<div class="bettatraka-form-container" style="max-width:650px; margin:0 auto;">\n  <iframe src="${directLink}" width="100%" height="900" frameborder="0" style="border:none; width:100%;"></iframe>\n</div>`;

              return (
                <div key={prod.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 text-xs shadow-sm">
                  {/* Product Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{prod.name}</h3>
                        <p className="text-[11px] text-slate-400">{prod.description || 'No description'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{prod.packages?.length || 1} packages</span>
                      </span>

                      <button
                        onClick={() => {
                          if (addNotification) {
                            addNotification({
                              title: 'Product Packages',
                              message: `Viewing package tiers for ${prod.name}`,
                              type: 'info'
                            });
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition cursor-pointer"
                      >
                        Manage Packages
                      </button>
                    </div>
                  </div>

                  {/* Embed Sub-Tabs: Direct Link | HTML/Iframe | Elementor */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-1 flex items-center text-xs font-semibold w-fit">
                    <button
                      onClick={() => setEmbedFormatTab(prev => ({ ...prev, [prod.id]: 'direct' }))}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        currentFormat === 'direct' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Direct Link
                    </button>
                    <button
                      onClick={() => setEmbedFormatTab(prev => ({ ...prev, [prod.id]: 'iframe' }))}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        currentFormat === 'iframe' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      HTML/Iframe
                    </button>
                    <button
                      onClick={() => setEmbedFormatTab(prev => ({ ...prev, [prod.id]: 'elementor' }))}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        currentFormat === 'elementor' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Elementor
                    </button>
                  </div>

                  {/* Format Content */}
                  <div>
                    {currentFormat === 'direct' && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-slate-400">Share this direct link to your order form:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={directLink}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-[11px] text-slate-300 focus:outline-none"
                          />
                          <button
                            onClick={() => copyToClipboard(directLink, `direct-${prod.id}`)}
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition cursor-pointer"
                            title="Copy link"
                          >
                            {copiedKey === `direct-${prod.id}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <a
                            href={directLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
                            title="Open link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}

                    {currentFormat === 'iframe' && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-slate-400">Embed this responsive iframe code into any HTML or website builder:</span>
                        <div className="flex items-center gap-2">
                          <textarea
                            readOnly
                            rows={2}
                            value={iframeSnippet}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-slate-300 focus:outline-none resize-none"
                          />
                          <button
                            onClick={() => copyToClipboard(iframeSnippet, `iframe-${prod.id}`)}
                            className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer self-stretch flex items-center gap-1.5"
                          >
                            {copiedKey === `iframe-${prod.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>Copy Iframe</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {currentFormat === 'elementor' && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-slate-400">Add an HTML Code widget in Elementor and paste this code:</span>
                        <div className="flex items-center gap-2">
                          <textarea
                            readOnly
                            rows={3}
                            value={elementorSnippet}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-slate-300 focus:outline-none resize-none"
                          />
                          <button
                            onClick={() => copyToClipboard(elementorSnippet, `elementor-${prod.id}`)}
                            className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer self-stretch flex items-center gap-1.5"
                          >
                            {copiedKey === `elementor-${prod.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>Copy Elementor</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: MEDIA BUYER FORMS (UTM & Attribution Links) */}
      {/* ===================================================================== */}
      {activeTab === 'media-buyers' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Media Buyer Forms & Attribution Generator</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate dedicated tracking links for media buyers. Orders submitted will automatically be attributed with conversion metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Link Generator */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 text-xs">
              <span className="font-bold text-white block text-sm">Configure Media Buyer Campaign</span>

              {/* Media Buyer / Staff Selection */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Assigned Media Buyer / Sales Rep</label>
                <select
                  value={selectedMediaBuyerId}
                  onChange={(e) => setSelectedMediaBuyerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              {/* Product */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Product</label>
                <select
                  value={selectedMediaBuyerProduct}
                  onChange={(e) => setSelectedMediaBuyerProduct(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              {/* Traffic Channel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">UTM Traffic Source</label>
                  <select
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="facebook">Facebook Ads</option>
                    <option value="tiktok">TikTok Ads</option>
                    <option value="instagram">Instagram Direct</option>
                    <option value="google">Google Search/PPC</option>
                    <option value="influencer">Influencer Referral</option>
                    <option value="whatsapp">WhatsApp Broadcast</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Campaign Name</label>
                  <input
                    type="text"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Generated URL Box */}
              {(() => {
                const buyer = users.find(u => u.id === selectedMediaBuyerId);
                const generatedUrl = `${window.location.origin}/order-form/embed?product=${selectedMediaBuyerProduct}&rep=${selectedMediaBuyerId}&utm_source=${utmSource}&utm_campaign=${utmCampaign}&utm_medium=${utmMedium}&currency=NGN`;

                return (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="font-semibold text-slate-300 block">Personalized Media Buyer Link:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedUrl}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-[11px] text-emerald-400 focus:outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(generatedUrl, 'media-buyer-link')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedKey === 'media-buyer-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      When customers order via this link, <strong>{buyer?.name || 'Assigned Rep'}</strong> is automatically linked as the sales rep/media buyer.
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Media Buyer Overview Stats */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 text-xs">
              <span className="font-bold text-white block text-sm">Media Buyer Performance Attribution</span>
              
              <div className="space-y-2">
                {users.filter(u => u.role === 'Sales Representative' || u.role === 'Manager').slice(0, 4).map(staff => (
                  <div key={staff.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{staff.name}</p>
                      <p className="text-[11px] text-slate-400">{staff.role} • {staff.email}</p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Active Channel
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD ADDITIONAL QUESTION */}
      {/* ===================================================================== */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Add Additional Question</h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Question Prompt *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Do you have any known skin allergies or sensitivities?"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Input Field Type</label>
                <select
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="text">Short Text Input</option>
                  <option value="select">Dropdown Select (Choices)</option>
                </select>
              </div>

              {newQuestionType === 'select' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Dropdown Choices (Comma-separated) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sensitive Skin, Normal Skin, Dry Skin, Oily/Acne-prone"
                    value={newQuestionOptions}
                    onChange={(e) => setNewQuestionOptions(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newQuestionRequired}
                    onChange={(e) => setNewQuestionRequired(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span>Customer must answer this question to submit</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD ORDER BUMP / UPSELL */}
      {/* ===================================================================== */}
      {showAddBumpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Add Order Bump / Upsell Offer</h3>
              <button onClick={() => setShowAddBumpModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOrderBump} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Companion Product from Inventory *</label>
                <select
                  value={bumpTargetProductId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setBumpTargetProductId(id);
                    const p = products.find(prod => prod.id === id);
                    if (p) {
                      setBumpName(`${p.name} (Special Add-On)`);
                      setBumpPrice(Math.round(p.sellingPrice * 0.5));
                      setBumpOriginalPrice(p.sellingPrice);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Retail: {formatCurrency(p.sellingPrice, 'NGN')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={bumpName}
                  onChange={(e) => setBumpName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-emerald-400 block mb-1">Special Bump Price (₦) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={bumpPrice}
                    onChange={(e) => setBumpPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Regular Strike-Through (₦)</label>
                  <input
                    type="number"
                    min="0"
                    value={bumpOriginalPrice}
                    onChange={(e) => setBumpOriginalPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-amber-400 block mb-1">Discount Tag / Badge</label>
                <input
                  type="text"
                  value={bumpBadge}
                  onChange={(e) => setBumpBadge(e.target.value)}
                  placeholder="e.g. 50% OFF SPECIAL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Short Pitch Description</label>
                <textarea
                  rows={2}
                  value={bumpDescription}
                  onChange={(e) => setBumpDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBumpModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Add Order Bump
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
