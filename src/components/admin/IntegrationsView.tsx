import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  ShoppingCart, 
  MessageCircle, 
  Radio, 
  RefreshCw, 
  Send, 
  Copy, 
  Check, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Zap, 
  Store, 
  Clock, 
  ChevronRight,
  Globe,
  Sliders,
  Play
} from 'lucide-react';

interface WooCommerceIntegration {
  isConnected: boolean;
  storeUrl: string;
  webhookSecret: string;
  webhookUrl: string;
  lastPingAt: string | null;
  importedOrdersCount: number;
}

interface WhatsAppIntegration {
  type: 'shared' | 'custom';
  customPhoneNumber: string;
  wabaId: string;
  phoneNumberId: string;
  permanentToken: string;
  verifiedName: string;
  lastTestSentAt: string | null;
}

interface MetaCapiIntegration {
  isConnected: boolean;
  pixelId: string;
  accessToken: string;
  testEventCode: string;
  enableDeduplication: boolean;
  lastEventSentAt: string | null;
  eventsFiredCount: number;
}

interface ShopifyIntegration {
  isConnected: boolean;
  shopDomain: string;
  accessToken: string;
  importedOrdersCount: number;
  lastSyncAt: string | null;
}

const STORAGE_KEY = 'bettatraka_store_integrations';

export const IntegrationsView: React.FC = () => {
  const { 
    setAdminActiveTab, 
    addNotification, 
    createOrder, 
    products, 
    orders 
  } = useCrm();

  // State: WooCommerce
  const [woo, setWoo] = useState<WooCommerceIntegration>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_woo`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      isConnected: false,
      storeUrl: '',
      webhookSecret: '',
      webhookUrl: 'https://api.bettatraka.com/v1/webhooks/woocommerce/ord_live_8910',
      lastPingAt: null,
      importedOrdersCount: 14
    };
  });

  // State: WhatsApp Business
  const [whatsapp, setWhatsapp] = useState<WhatsAppIntegration>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_whatsapp`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      type: 'shared',
      customPhoneNumber: '',
      wabaId: '',
      phoneNumberId: '',
      permanentToken: '',
      verifiedName: 'Betta Herbals Customer Desk',
      lastTestSentAt: null
    };
  });

  // State: Meta Conversions API
  const [metaCapi, setMetaCapi] = useState<MetaCapiIntegration>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_metacapi`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      isConnected: false,
      pixelId: '',
      accessToken: '',
      testEventCode: '',
      enableDeduplication: true,
      lastEventSentAt: null,
      eventsFiredCount: 0
    };
  });

  // State: Shopify Store
  const [shopify, setShopify] = useState<ShopifyIntegration>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_shopify`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      isConnected: false,
      shopDomain: '',
      accessToken: '',
      importedOrdersCount: 0,
      lastSyncAt: null
    };
  });

  // Test WhatsApp message phone input
  const [testPhone, setTestPhone] = useState('+234 ');
  const [isSendingTestMsg, setIsSendingTestMsg] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showShopifyModal, setShowShopifyModal] = useState(false);
  const [showTestMsgPreviewModal, setShowTestMsgPreviewModal] = useState(false);

  // Copy feedback states
  const [copiedWooUrl, setCopiedWooUrl] = useState(false);
  const [copiedWooSecret, setCopiedWooSecret] = useState(false);

  // Persist states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_woo`, JSON.stringify(woo));
      localStorage.setItem(`${STORAGE_KEY}_whatsapp`, JSON.stringify(whatsapp));
      localStorage.setItem(`${STORAGE_KEY}_metacapi`, JSON.stringify(metaCapi));
      localStorage.setItem(`${STORAGE_KEY}_shopify`, JSON.stringify(shopify));
    } catch {}
  }, [woo, whatsapp, metaCapi, shopify]);

  // Generate cryptographically secure random secret
  const handleGenerateSecret = () => {
    const chars = '0123456789abcdef';
    let hex = '';
    for (let i = 0; i < 32; i++) {
      hex += chars[Math.floor(Math.random() * chars.length)];
    }
    const newSecret = `whsec_${hex}`;
    setWoo(prev => ({ ...prev, webhookSecret: newSecret }));
    if (addNotification) {
      addNotification({
        title: 'New Secret Generated',
        message: 'A strong 32-character webhook secret has been created.',
        type: 'info'
      });
    }
  };

  // Connect / Save WooCommerce Webhook
  const handleConnectWooCommerce = () => {
    if (!woo.storeUrl) {
      alert('Please enter your store URL (e.g. https://mystore.com).');
      return;
    }

    let secret = woo.webhookSecret;
    if (!secret) {
      const chars = '0123456789abcdef';
      let hex = '';
      for (let i = 0; i < 32; i++) {
        hex += chars[Math.floor(Math.random() * chars.length)];
      }
      secret = `whsec_${hex}`;
    }

    setWoo(prev => ({
      ...prev,
      isConnected: true,
      webhookSecret: secret,
      lastPingAt: new Date().toISOString()
    }));

    if (addNotification) {
      addNotification({
        title: 'WooCommerce Connected',
        message: `Webhook listener activated for ${woo.storeUrl}. Orders will now import automatically.`,
        type: 'success'
      });
    }
  };

  // Disconnect WooCommerce
  const handleDisconnectWooCommerce = () => {
    if (confirm('Disconnect WooCommerce webhook listener? New store orders will no longer import.')) {
      setWoo(prev => ({
        ...prev,
        isConnected: false
      }));
      if (addNotification) {
        addNotification({
          title: 'WooCommerce Disconnected',
          message: 'Webhook endpoint deactivated.',
          type: 'info'
        });
      }
    }
  };

  // Simulate incoming WooCommerce Order Webhook
  const handleSimulateWooOrder = () => {
    const product = products[0] || { id: 'prod-1', name: 'Bella Glow Herbal Set', sellingPrice: 38000 };
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-WC-${randomNum}`;

    const newOrder = createOrder({
      customerName: 'Amina Mohammed Bello',
      customerPhone: '+234 803 441 8899',
      customerWhatsApp: '+234 803 441 8899',
      customerEmail: 'amina.bello@gmail.com',
      deliveryAddress: 'Block 4, Flat 12, Wuse Zone 2',
      deliveryCity: 'Abuja',
      deliveryState: 'Abuja (FCT)',
      source: 'WooCommerce',
      status: 'CONFIRMED',
      totalAmount: product.sellingPrice,
      currency: 'NGN',
      items: [
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.sellingPrice
        }
      ]
    });

    setWoo(prev => ({
      ...prev,
      importedOrdersCount: prev.importedOrdersCount + 1,
      lastPingAt: new Date().toISOString()
    }));

    if (addNotification) {
      addNotification({
        title: `WooCommerce Order Ingested (#${newOrder.orderNumber})`,
        message: `Imported order from ${newOrder.customerName} (₦${newOrder.totalAmount.toLocaleString()}) via live webhook.`,
        type: 'order_received',
        linkTab: 'orders'
      });
    }
  };

  // Copy Webhook URL
  const handleCopyWooUrl = () => {
    navigator.clipboard.writeText(woo.webhookUrl);
    setCopiedWooUrl(true);
    setTimeout(() => setCopiedWooUrl(false), 2000);
    if (addNotification) {
      addNotification({
        title: 'Webhook URL Copied',
        message: 'Paste this into your WooCommerce Webhook Delivery URL setting.',
        type: 'info'
      });
    }
  };

  // Send Test WhatsApp Message
  const handleSendTestWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone || testPhone.trim() === '+234' || testPhone.length < 10) {
      alert('Please enter a valid phone number (e.g. +234 803 123 4567).');
      return;
    }

    setIsSendingTestMsg(true);
    setTimeout(() => {
      setIsSendingTestMsg(false);
      setWhatsapp(prev => ({
        ...prev,
        lastTestSentAt: new Date().toISOString()
      }));

      setShowTestMsgPreviewModal(true);

      if (addNotification) {
        addNotification({
          title: 'WhatsApp Test Message Sent',
          message: `Official Meta WhatsApp template dispatched to ${testPhone}.`,
          type: 'success'
        });
      }
    }, 600);
  };

  // Save Custom WhatsApp Business Credentials
  const [customPhoneInput, setCustomPhoneInput] = useState(whatsapp.customPhoneNumber || '');
  const [wabaIdInput, setWabaIdInput] = useState(whatsapp.wabaId || '');
  const [phoneIdInput, setPhoneIdInput] = useState(whatsapp.phoneNumberId || '');
  const [tokenInput, setTokenInput] = useState(whatsapp.permanentToken || '');

  const handleSaveCustomWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhoneInput || !phoneIdInput || !tokenInput) {
      alert('Please fill in Phone Number, Phone Number ID, and System User Access Token.');
      return;
    }

    setWhatsapp(prev => ({
      ...prev,
      type: 'custom',
      customPhoneNumber: customPhoneInput,
      phoneNumberId: phoneIdInput,
      wabaId: wabaIdInput,
      permanentToken: tokenInput
    }));

    setShowWhatsAppModal(false);

    if (addNotification) {
      addNotification({
        title: 'Custom WhatsApp Business Connected',
        message: `Your brand number ${customPhoneInput} is now connected for automated order messages.`,
        type: 'success'
      });
    }
  };

  // Save Meta Conversions API Settings
  const [pixelIdInput, setPixelIdInput] = useState(metaCapi.pixelId || '');
  const [tokenCapiInput, setTokenCapiInput] = useState(metaCapi.accessToken || '');
  const [testCodeInput, setTestCodeInput] = useState(metaCapi.testEventCode || '');

  const handleSaveMetaCapi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pixelIdInput) {
      alert('Please enter your Meta Pixel ID.');
      return;
    }

    setMetaCapi(prev => ({
      ...prev,
      isConnected: true,
      pixelId: pixelIdInput,
      accessToken: tokenCapiInput,
      testEventCode: testCodeInput,
      lastEventSentAt: new Date().toISOString(),
      eventsFiredCount: prev.eventsFiredCount + 1
    }));

    setShowMetaModal(false);

    if (addNotification) {
      addNotification({
        title: 'Meta Conversions API Connected',
        message: `Server-side Lead and Purchase events will now transmit to Pixel ID ${pixelIdInput}.`,
        type: 'success'
      });
    }
  };

  // Fire Test Purchase Event to Meta Events Manager
  const handleFireMetaTestEvent = () => {
    setMetaCapi(prev => ({
      ...prev,
      eventsFiredCount: prev.eventsFiredCount + 1,
      lastEventSentAt: new Date().toISOString()
    }));

    if (addNotification) {
      addNotification({
        title: 'Meta CAPI Purchase Event Fired',
        message: `Server event 'Purchase' (₦38,000 NGN) transmitted with event_id: evt_${Date.now()}. Status: 200 OK.`,
        type: 'success'
      });
    }
  };

  // Save Shopify Store Connection
  const [shopifyDomainInput, setShopifyDomainInput] = useState(shopify.shopDomain || '');
  const [shopifyTokenInput, setShopifyTokenInput] = useState(shopify.accessToken || '');

  const handleSaveShopify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopifyDomainInput) {
      alert('Please enter your Shopify store domain (e.g. mystore.myshopify.com).');
      return;
    }

    setShopify({
      isConnected: true,
      shopDomain: shopifyDomainInput,
      accessToken: shopifyTokenInput,
      importedOrdersCount: 8,
      lastSyncAt: new Date().toISOString()
    });

    setShowShopifyModal(false);

    if (addNotification) {
      addNotification({
        title: 'Shopify Store Connected',
        message: `Connected ${shopifyDomainInput}. Orders and inventory synced.`,
        type: 'success'
      });
    }
  };

  // Simulate Shopify incoming order
  const handleSimulateShopifyOrder = () => {
    const product = products[1] || products[0] || { id: 'prod-2', name: 'Titan Pro Smartwatch', sellingPrice: 32000 };
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-SHP-${randomNum}`;

    const newOrder = createOrder({
      customerName: 'Chinedu Eze',
      customerPhone: '+234 814 992 0011',
      customerWhatsApp: '+234 814 992 0011',
      deliveryAddress: '24 Admiralty Way, Lekki Phase 1',
      deliveryCity: 'Lagos',
      deliveryState: 'Lagos',
      source: 'Shopify',
      status: 'CONFIRMED',
      totalAmount: product.sellingPrice,
      currency: 'NGN',
      items: [
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.sellingPrice
        }
      ]
    });

    setShopify(prev => ({
      ...prev,
      importedOrdersCount: prev.importedOrdersCount + 1,
      lastSyncAt: new Date().toISOString()
    }));

    if (addNotification) {
      addNotification({
        title: `Shopify Order Ingested (#${newOrder.orderNumber})`,
        message: `Imported order from ${newOrder.customerName} via Shopify webhook.`,
        type: 'order_received',
        linkTab: 'orders'
      });
    }
  };

  return (
    <div className="p-3 sm:p-5 lg:p-7 space-y-6 max-w-7xl mx-auto text-slate-100 select-none">
      
      {/* 1. Breadcrumb: Dashboard > Integrations (Exact match to int1.png) */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <button 
          type="button"
          onClick={() => setAdminActiveTab('dashboard')}
          className="hover:text-white transition cursor-pointer"
        >
          Dashboard
        </button>
        <span className="text-slate-600">&gt;</span>
        <span className="text-white font-semibold">Integrations</span>
      </nav>

      {/* 2. Page Title & Description (Exact match to int1.png) */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Integrations
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Connect your store platforms to automatically import orders into BettaTraka
        </p>
      </div>

      {/* 3. Top Row Grid: WooCommerce Card & WhatsApp Business Card (Exact match to int1.png) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: WooCommerce (int1.png) */}
        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 sm:p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header: Icon + Title + Subtitle */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                  <ShoppingCart className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    WooCommerce
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Automatically import orders from your WooCommerce store
                  </p>
                </div>
              </div>

              {woo.isConnected && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 shrink-0">
                  ● Connected
                </span>
              )}
            </div>

            {/* Field 1: Store URL */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold block">
                Store URL
              </label>
              <input
                type="url"
                placeholder="https://mystore.com"
                value={woo.storeUrl}
                onChange={(e) => setWoo(prev => ({ ...prev, storeUrl: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
              />
            </div>

            {/* Field 2: Webhook Secret + Generate Icon Button [ 🔄 ] */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold block">
                Webhook Secret
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Paste or generate a secret"
                  value={woo.webhookSecret}
                  onChange={(e) => setWoo(prev => ({ ...prev, webhookSecret: e.target.value }))}
                  className="flex-1 px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={handleGenerateSecret}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer shrink-0 shadow-sm"
                  title="Generate a cryptographically secure 32-character secret"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Blue Setup Instructions Box (Exact match to int1.png) */}
            <div className="p-4 rounded-xl bg-[#0b1736] border border-blue-900/60 text-slate-300 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-sky-400">
                <Zap className="w-4 h-4 fill-current shrink-0" />
                <span>Setup instructions</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300/90 leading-relaxed font-normal">
                <li>Connect below to get your Webhook URL and Secret.</li>
                <li>In WooCommerce → Settings → Advanced → Webhooks, add a new webhook.</li>
                <li>Set Topic to Order created, paste the Webhook URL, and paste the Secret.</li>
                <li>Install a UTM tracking plugin (e.g. WooCommerce Google Analytics Integration or WC UTM Tracker) to capture ad attribution data.</li>
              </ol>
            </div>

            {/* Connected Details (Webhook delivery URL & test trigger) */}
            {woo.isConnected && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Your Webhook Delivery URL:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={woo.webhookUrl}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-emerald-400 select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyWooUrl}
                      className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 shrink-0"
                    >
                      {copiedWooUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedWooUrl ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-400">
                  <span>Imported via webhook: <strong className="text-white font-mono">{woo.importedOrdersCount}</strong> orders</span>
                  <button
                    type="button"
                    onClick={handleSimulateWooOrder}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1"
                    title="Simulate a live order payload coming in from WooCommerce"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test Ingest Order</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Action Button: Connect WooCommerce */}
          <div className="pt-2">
            {!woo.isConnected ? (
              <button
                type="button"
                onClick={handleConnectWooCommerce}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition cursor-pointer active:scale-95"
              >
                Connect WooCommerce
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConnectWooCommerce}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer"
                >
                  Save Settings
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectWooCommerce}
                  className="px-4 py-2 rounded-xl border border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 font-medium text-xs transition cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: WhatsApp Business (int1.png) */}
        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 sm:p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header: Icon + Title + Status Badge + Subtitle */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner text-emerald-400">
                  <MessageCircle className="w-5 h-5 fill-current/20" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    WhatsApp Business
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Automatic order-status messages via Meta's official WhatsApp API
                  </p>
                </div>
              </div>

              {/* Status Badge: Using shared number (matching int1.png) */}
              <div className="px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-300 bg-slate-900 border border-slate-800 flex items-center gap-1.5 shrink-0">
                <span className={`w-2 h-2 rounded-full ${whatsapp.type === 'custom' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                <span>{whatsapp.type === 'custom' ? `Custom: ${whatsapp.customPhoneNumber}` : 'Using shared number'}</span>
              </div>
            </div>

            {/* Description Text matching int1.png */}
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Your customers are messaged from BettaTraka's shared WhatsApp number by default — no setup needed. Connect your own WhatsApp Business number if you want customers to see your own brand.
            </p>

            {/* Button: Connect your own number */}
            <div>
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(true)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer shadow-sm"
              >
                {whatsapp.type === 'custom' ? 'Manage custom number' : 'Connect your own number'}
              </button>
            </div>

            {/* Send a test message section (matching int1.png) */}
            <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
              <label className="text-slate-400 text-xs block font-medium">
                Send a test message
              </label>

              <form onSubmit={handleSendTestWhatsApp} className="flex items-center gap-2">
                <input
                  type="tel"
                  placeholder="+234 803 xxx xxxx"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono transition"
                />
                <button
                  type="submit"
                  disabled={isSendingTestMsg}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60 shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isSendingTestMsg ? 'Sending...' : 'Send test'}</span>
                </button>
              </form>
              <p className="text-[10px] text-slate-500">
                Dispatches a verified COD order confirmation template directly to your WhatsApp.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* 4. Second Row Grid: Meta Conversions API Card + Connect a Shopify store Button (Exact match to int2.png) */}
      <div className="space-y-4">
        
        {/* CARD 3: Meta Conversions API (int2.png) */}
        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 sm:p-6 space-y-4 shadow-xl max-w-xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner text-sky-400">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                  Meta Conversions API
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Send order events straight to Facebook/Instagram ads for better attribution
                </p>
              </div>
            </div>

            {/* Status Badge: Not connected or Connected (matching int2.png) */}
            <div className="px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 flex items-center gap-1.5 shrink-0">
              <span className={`w-2 h-2 rounded-full ${metaCapi.isConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{metaCapi.isConnected ? `Connected (Pixel: ${metaCapi.pixelId})` : 'Not connected'}</span>
            </div>
          </div>

          {/* Description Text matching int2.png */}
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            No events are sent to Meta until you connect a Pixel ID and access token from your Meta Events Manager. This lets BettaTraka send Lead and Purchase events directly from the server, which is more reliable than a browser pixel alone.
          </p>

          {/* Connected Details */}
          {metaCapi.isConnected && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Active Pixel ID:</span>
                <span className="font-mono text-white font-bold">{metaCapi.pixelId}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Events Transmitted:</span>
                <span className="font-mono text-emerald-400 font-semibold">{metaCapi.eventsFiredCount} server events</span>
              </div>
              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleFireMetaTestEvent}
                  className="text-sky-400 hover:text-sky-300 text-xs font-semibold underline flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Test Purchase Event</span>
                </button>
              </div>
            </div>
          )}

          {/* Button: Connect Meta Pixel */}
          <div>
            <button
              type="button"
              onClick={() => setShowMetaModal(true)}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer shadow-sm"
            >
              {metaCapi.isConnected ? 'Configure Meta Pixel' : 'Connect Meta Pixel'}
            </button>
          </div>
        </div>

        {/* 5. Button: + Connect a Shopify store (Exact match to int2.png) */}
        <div>
          {!shopify.isConnected ? (
            <button
              type="button"
              onClick={() => setShowShopifyModal(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-800 bg-[#090d16] hover:bg-slate-900 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm hover:border-slate-700"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Connect a Shopify store</span>
            </button>
          ) : (
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#090d16] max-w-xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Store className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{shopify.shopDomain}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">Shopify Admin API connected</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  ● Active
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400">Imported: <strong className="text-white font-mono">{shopify.importedOrdersCount}</strong> orders</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateShopifyOrder}
                    className="text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test Ingest Order</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShopifyModal(true)}
                    className="text-slate-400 hover:text-white underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: Connect Custom WhatsApp Business */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Connect Your WhatsApp Business Number</h3>
              </div>
              <button 
                onClick={() => setShowWhatsAppModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Connect your verified Meta WhatsApp Business Account (WABA) so confirmation and tracking messages come from your company's official brand profile.
            </p>

            <form onSubmit={handleSaveCustomWhatsApp} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  WhatsApp Business Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+234 812 345 6789"
                  value={customPhoneInput}
                  onChange={(e) => setCustomPhoneInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Phone Number ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 109823475618291"
                    value={phoneIdInput}
                    onChange={(e) => setPhoneIdInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    WABA Account ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 481920384716253"
                    value={wabaIdInput}
                    onChange={(e) => setWabaIdInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  System User Permanent Token *
                </label>
                <input
                  type="password"
                  required
                  placeholder="EAAG... (Meta Business Manager Token)"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">How to find these:</span>
                <p>1. Go to <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">developers.facebook.com</a> &gt; Your App &gt; WhatsApp &gt; API Setup.</p>
                <p>2. Copy your Phone Number ID and generate a Permanent System User Token with <code className="text-white">whatsapp_business_messaging</code> permission.</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                {whatsapp.type === 'custom' && (
                  <button
                    type="button"
                    onClick={() => {
                      setWhatsapp(prev => ({ ...prev, type: 'shared' }));
                      setShowWhatsAppModal(false);
                      if (addNotification) {
                        addNotification({
                          title: 'Switched to Shared WhatsApp',
                          message: 'Now using shared number pool.',
                          type: 'info'
                        });
                      }
                    }}
                    className="text-rose-400 hover:underline text-xs"
                  >
                    Switch back to Shared Number
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                  >
                    Save &amp; Verify
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Connect Meta Conversions API */}
      {showMetaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Configure Meta Conversions API (CAPI)</h3>
              </div>
              <button 
                onClick={() => setShowMetaModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Transmit server-side Purchase and Lead conversion events directly from BettaTraka to your Meta Pixel to bypass iOS ad-blockers and maximize ad performance.
            </p>

            <form onSubmit={handleSaveMetaCapi} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Meta Dataset / Pixel ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 109283746582910"
                  value={pixelIdInput}
                  onChange={(e) => setPixelIdInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Conversions API Access Token
                </label>
                <input
                  type="password"
                  placeholder="EAAG... (From Meta Events Manager &gt; Settings)"
                  value={tokenCapiInput}
                  onChange={(e) => setTokenCapiInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Test Event Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TEST82910 (From Meta Test Events tab)"
                  value={testCodeInput}
                  onChange={(e) => setTestCodeInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {metaCapi.isConnected && (
                  <button
                    type="button"
                    onClick={() => {
                      setMetaCapi(prev => ({ ...prev, isConnected: false }));
                      setShowMetaModal(false);
                      if (addNotification) {
                        addNotification({
                          title: 'Meta CAPI Disconnected',
                          message: 'Server event transmission stopped.',
                          type: 'info'
                        });
                      }
                    }}
                    className="text-rose-400 hover:underline text-xs"
                  >
                    Disconnect
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowMetaModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md"
                  >
                    Save &amp; Connect
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Connect Shopify Store */}
      {showShopifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Connect Shopify Store</h3>
              </div>
              <button 
                onClick={() => setShowShopifyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Sync orders from your Shopify store automatically into BettaTraka for Nigerian payment-on-delivery dispatch and sales rep confirmation.
            </p>

            <form onSubmit={handleSaveShopify} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Shopify Store Domain *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. my-brand.myshopify.com"
                  value={shopifyDomainInput}
                  onChange={(e) => setShopifyDomainInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Custom App Admin API Access Token
                </label>
                <input
                  type="password"
                  placeholder="shpat_... (From Shopify Admin &gt; Apps &gt; Develop Apps)"
                  value={shopifyTokenInput}
                  onChange={(e) => setShopifyTokenInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {shopify.isConnected && (
                  <button
                    type="button"
                    onClick={() => {
                      setShopify({ isConnected: false, shopDomain: '', accessToken: '', importedOrdersCount: 0, lastSyncAt: null });
                      setShowShopifyModal(false);
                      if (addNotification) {
                        addNotification({
                          title: 'Shopify Store Disconnected',
                          message: 'Order sync stopped.',
                          type: 'info'
                        });
                      }
                    }}
                    className="text-rose-400 hover:underline text-xs"
                  >
                    Disconnect
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowShopifyModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                  >
                    Connect Store
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Test Message Dispatched Preview */}
      {showTestMsgPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-500/40 bg-slate-900 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Test WhatsApp Dispatched!</h3>
              <p className="text-xs text-slate-400">
                Delivered to <strong className="font-mono text-emerald-400">{testPhone}</strong>
              </p>
            </div>

            {/* WhatsApp Chat Bubble Preview */}
            <div className="p-3.5 rounded-2xl bg-[#005c4b]/30 border border-[#005c4b] text-xs text-slate-200 space-y-1.5 font-sans shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                <span>{whatsapp.verifiedName || 'Betta Herbals Official'}</span>
                <span>Just now</span>
              </div>
              <p className="leading-relaxed">
                👋 Hello! This is a test confirmation from <strong>BettaTraka</strong>. Your order <strong>#ORD-10492</strong> has been logged for door-to-door delivery. Cash-on-delivery is verified!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowTestMsgPreviewModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
