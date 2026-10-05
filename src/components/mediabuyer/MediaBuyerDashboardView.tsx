import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  Order, 
  AbandonedCart, 
  MediaBuyerSpendLog, 
  CurrencyCode 
} from '../../types/crm';
import { formatCurrency, convertAmount, formatDate } from '../../utils/formatters';
import {
  Megaphone,
  TrendingUp,
  BarChart3,
  Target,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Calendar,
  CalendarClock,
  Settings,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Filter,
  Search,
  Lock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  Eye,
  Globe,
  RefreshCw,
  FileText,
  Layers,
  Sliders,
  X,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  UserCheck,
  Sparkles,
  Share2,
  Send,
  Zap,
  Tag,
  Download,
  FileSpreadsheet,
  LogOut
} from 'lucide-react';

interface SavedUtmLink {
  id: string;
  name: string;
  url: string;
  platform: string;
  campaign: string;
  source: string;
  medium: string;
  content: string;
  createdAt: string;
}

export const MediaBuyerDashboardView: React.FC = () => {
  const {
    currentUser,
    updateUser,
    orders,
    abandonedCarts,
    products,
    currency,
    themeMode,
    addNotification,
    setPersona,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    mediaBuyerActiveTab,
    setMediaBuyerActiveTab,
    mediaBuyerSpendLogs,
    addMediaBuyerSpendLog,
    deleteMediaBuyerSpendLog
  } = useCrm();

  const isLight = themeMode === 'light';

  // Navigation tab state (default to 'overview')
  const activeTab = mediaBuyerActiveTab || 'overview';
  const setActiveTab = (tab: string) => setMediaBuyerActiveTab(tab);

  // Sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Permission check: only Admins/Owners can delete ad spend records
  const isAdmin = currentUser.role === 'Owner' || currentUser.role === 'Admin';

  // Modals state
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);
  const [selectedCartForView, setSelectedCartForView] = useState<AbandonedCart | null>(null);

  // =========================================================================
  // 1. DATA FILTERING: STRICTLY ORDERS & CARTS GENERATED FROM UTM AD TRACKING
  // =========================================================================
  // All orders carrying UTM tags from ad campaigns
  const utmOrders = useMemo(() => {
    return orders.filter(o => 
      Boolean(o.utmCampaign || o.utmSource || o.utmMedium || o.utmCreative || o.mediaBuyerId)
    );
  }, [orders]);

  const deliveredUtmOrders = useMemo(() => {
    return utmOrders.filter(o => o.status === 'DELIVERED');
  }, [utmOrders]);

  const deliveredUtmRevenueNgn = useMemo(() => {
    return deliveredUtmOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [deliveredUtmOrders]);

  // Abandoned carts carrying UTM tags from ad campaigns
  const utmAbandonedCarts = useMemo(() => {
    return abandonedCarts.filter(c => Boolean(c.utmCampaign || c.utmSource));
  }, [abandonedCarts]);

  // Scheduled delivery orders from UTM ad campaigns
  const scheduledUtmOrders = useMemo(() => {
    return utmOrders.filter(o => o.status === 'SCHEDULED' || Boolean(o.scheduledDate));
  }, [utmOrders]);

  // Deliveries strictly from UTM ad campaigns
  const deliveryFulfillmentUtmOrders = useMemo(() => {
    return utmOrders.filter(o => 
      o.status === 'DELIVERED' || o.status === 'DISPATCHED' || o.status === 'CANCELLED'
    );
  }, [utmOrders]);

  // Ad Spend computation
  const totalRecordedSpendNgn = useMemo(() => {
    if (mediaBuyerSpendLogs && mediaBuyerSpendLogs.length > 0) {
      return mediaBuyerSpendLogs.reduce((sum, log) => sum + log.amount, 0);
    }
    return 175000;
  }, [mediaBuyerSpendLogs]);

  const blendedRoas = totalRecordedSpendNgn > 0 
    ? (deliveredUtmRevenueNgn / totalRecordedSpendNgn).toFixed(2) 
    : '0.00';

  const blendedCpa = deliveredUtmOrders.length > 0 
    ? Math.round(totalRecordedSpendNgn / deliveredUtmOrders.length) 
    : (utmOrders.length > 0 ? Math.round(totalRecordedSpendNgn / utmOrders.length) : 2850);

  const fulfillmentRate = utmOrders.length > 0 
    ? Math.round((deliveredUtmOrders.length / utmOrders.length) * 100) 
    : 0;

  // Search & filter state for UTM orders
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderCampaignFilter, setOrderCampaignFilter] = useState('ALL');

  // Unique campaigns for filtering
  const availableCampaigns = useMemo(() => {
    const set = new Set<string>();
    utmOrders.forEach(o => {
      if (o.utmCampaign) set.add(o.utmCampaign);
    });
    return Array.from(set);
  }, [utmOrders]);

  const filteredOrders = useMemo(() => {
    return utmOrders.filter(o => {
      if (orderStatusFilter !== 'ALL' && o.status !== orderStatusFilter) return false;
      if (orderCampaignFilter !== 'ALL' && o.utmCampaign !== orderCampaignFilter) return false;
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase().trim();
        const matchesNum = o.orderNumber.toLowerCase().includes(q);
        const matchesCust = o.customerName.toLowerCase().includes(q);
        const matchesPhone = o.customerPhone.toLowerCase().includes(q);
        const matchesCamp = (o.utmCampaign || '').toLowerCase().includes(q);
        const matchesSrc = (o.utmSource || '').toLowerCase().includes(q);
        if (!matchesNum && !matchesCust && !matchesPhone && !matchesCamp && !matchesSrc) {
          return false;
        }
      }
      return true;
    });
  }, [utmOrders, orderStatusFilter, orderCampaignFilter, orderSearchQuery]);

  // Carts search & filter
  const [cartSearchQuery, setCartSearchQuery] = useState('');
  const [cartStatusFilter, setCartStatusFilter] = useState('ALL');

  const filteredCarts = useMemo(() => {
    return utmAbandonedCarts.filter(c => {
      if (cartStatusFilter !== 'ALL' && c.status !== cartStatusFilter) return false;
      if (cartSearchQuery.trim()) {
        const q = cartSearchQuery.toLowerCase().trim();
        const matchesCust = c.customerName.toLowerCase().includes(q);
        const matchesPhone = c.customerPhone.toLowerCase().includes(q);
        const matchesProd = c.productName.toLowerCase().includes(q);
        const matchesCamp = (c.utmCampaign || '').toLowerCase().includes(q);
        if (!matchesCust && !matchesPhone && !matchesProd && !matchesCamp) return false;
      }
      return true;
    });
  }, [utmAbandonedCarts, cartStatusFilter, cartSearchQuery]);

  // =========================================================================
  // CSV EXPORT FUNCTIONALITY FOR ATTRIBUTED ORDERS
  // =========================================================================
  const handleDownloadCsv = () => {
    const listToExport = filteredOrders.length > 0 ? filteredOrders : utmOrders;
    if (listToExport.length === 0) {
      if (addNotification) {
        addNotification({
          title: 'Export Notice',
          message: 'No attributed orders available to export.',
          type: 'info'
        });
      }
      return;
    }

    const headers = [
      'Order Number',
      'Order Date',
      'Customer Name',
      'Customer Phone',
      'Customer WhatsApp',
      'Customer Email',
      'Delivery Address',
      'Delivery City',
      'Delivery State',
      'UTM Source',
      'UTM Campaign',
      'UTM Medium',
      'UTM Content / Creative',
      'Items Purchased',
      'Total Amount (NGN)',
      'Order Status',
      'Scheduled Delivery Date',
      'Delivered Date'
    ];

    const rows = listToExport.map(o => [
      o.orderNumber,
      o.createdAt ? o.createdAt.split('T')[0] : '',
      o.customerName,
      o.customerPhone,
      o.customerWhatsApp || '',
      o.customerEmail || '',
      o.deliveryAddress || '',
      o.deliveryCity || '',
      o.deliveryState || '',
      o.utmSource || '',
      o.utmCampaign || '',
      o.utmMedium || '',
      o.utmCreative || '',
      o.items.map(i => `${i.quantity}x ${i.productName}`).join('; '),
      o.totalAmount,
      o.status,
      o.scheduledDate || '',
      o.deliveredDate ? o.deliveredDate.split('T')[0] : ''
    ]);

    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().split('T')[0];
    const campaignSuffix = orderCampaignFilter !== 'ALL' ? `_${orderCampaignFilter}` : '';
    link.setAttribute('download', `media_buyer_attributed_orders${campaignSuffix}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (addNotification) {
      addNotification({
        title: 'CSV Export Downloaded',
        message: `Successfully exported ${listToExport.length} attributed orders for external reporting.`,
        type: 'success'
      });
    }
  };

  // =========================================================================
  // 2. UTM BUILDER & TEMPLATES (EDITABLE)
  // =========================================================================
  const [utmBaseUrl, setUtmBaseUrl] = useState('https://apexbrands.ng/order');
  const [utmPlatform, setUtmPlatform] = useState('Facebook');
  const [utmSource, setUtmSource] = useState('facebook_ads');
  const [utmMedium, setUtmMedium] = useState('cpc');
  const [utmCampaign, setUtmCampaign] = useState('clarifying_glow_sept26');
  const [utmContent, setUtmContent] = useState('video_hook_ugc1');
  const [utmTerm, setUtmTerm] = useState('skincare_abuja');
  const [copiedLink, setCopiedLink] = useState(false);
  const [campaignTemplateName, setCampaignTemplateName] = useState('');

  const [savedLinks, setSavedLinks] = useState<SavedUtmLink[]>(() => {
    try {
      const saved = localStorage.getItem('bettatraka_saved_utm_links');
      return saved ? JSON.parse(saved) : [
        {
          id: 'utm-1',
          name: 'Clarifying Glow - Meta Video Ad',
          url: 'https://apexbrands.ng/order?utm_source=facebook_ads&utm_medium=cpc&utm_campaign=clarifying_glow_sept26&utm_content=before_after_video_v3',
          platform: 'Facebook',
          campaign: 'clarifying_glow_sept26',
          source: 'facebook_ads',
          medium: 'cpc',
          content: 'before_after_video_v3',
          createdAt: '2026-09-20'
        },
        {
          id: 'utm-2',
          name: 'Titan Smartwatch - TikTok UGC Unboxing',
          url: 'https://apexbrands.ng/order?utm_source=tiktok_ads&utm_medium=video&utm_campaign=smartwatch_gadget_review&utm_content=ugc_unboxing_clip_02',
          platform: 'TikTok',
          campaign: 'smartwatch_gadget_review',
          source: 'tiktok_ads',
          medium: 'video',
          content: 'ugc_unboxing_clip_02',
          createdAt: '2026-09-25'
        }
      ];
    } catch {
      return [];
    }
  });

  const generatedUtmUrl = useMemo(() => {
    try {
      const cleanBase = utmBaseUrl.trim() || 'https://apexbrands.ng/order';
      const url = new URL(cleanBase);
      if (utmSource) url.searchParams.set('utm_source', utmSource.trim());
      if (utmMedium) url.searchParams.set('utm_medium', utmMedium.trim());
      if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign.trim());
      if (utmContent) url.searchParams.set('utm_content', utmContent.trim());
      if (utmTerm) url.searchParams.set('utm_term', utmTerm.trim());
      return url.toString();
    } catch {
      const params = new URLSearchParams();
      if (utmSource) params.set('utm_source', utmSource.trim());
      if (utmMedium) params.set('utm_medium', utmMedium.trim());
      if (utmCampaign) params.set('utm_campaign', utmCampaign.trim());
      if (utmContent) params.set('utm_content', utmContent.trim());
      if (utmTerm) params.set('utm_term', utmTerm.trim());
      return `${utmBaseUrl}?${params.toString()}`;
    }
  }, [utmBaseUrl, utmSource, utmMedium, utmCampaign, utmContent, utmTerm]);

  const handleCopyGeneratedLink = () => {
    navigator.clipboard.writeText(generatedUtmUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    if (addNotification) {
      addNotification({
        title: 'UTM Tracking Link Copied',
        message: 'Tracking URL copied. Paste directly in Meta Ads Manager or TikTok Ads.',
        type: 'info'
      });
    }
  };

  const handleSaveUtmLink = (e: React.FormEvent) => {
    e.preventDefault();
    const newLink: SavedUtmLink = {
      id: `utm-${Date.now()}`,
      name: campaignTemplateName.trim() || `${utmPlatform} - ${utmCampaign}`,
      url: generatedUtmUrl,
      platform: utmPlatform,
      campaign: utmCampaign,
      source: utmSource,
      medium: utmMedium,
      content: utmContent,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newLink, ...savedLinks];
    setSavedLinks(updated);
    try {
      localStorage.setItem('bettatraka_saved_utm_links', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setCampaignTemplateName('');
    if (addNotification) {
      addNotification({
        title: 'Campaign Preset Saved',
        message: `Saved "${newLink.name}" to UTM presets.`,
        type: 'success'
      });
    }
  };

  const handleDeleteSavedLink = (id: string) => {
    const updated = savedLinks.filter(l => l.id !== id);
    setSavedLinks(updated);
    try {
      localStorage.setItem('bettatraka_saved_utm_links', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Platform selector helper
  const platformPresets: Record<string, { source: string; medium: string }> = {
    'Facebook': { source: 'facebook_ads', medium: 'cpc' },
    'TikTok': { source: 'tiktok_ads', medium: 'video' },
    'Google': { source: 'google_search', medium: 'cpc' },
    'Instagram': { source: 'instagram_reels', medium: 'reel' },
    'Snapchat': { source: 'snapchat_ads', medium: 'snap_ad' },
    'Influencer': { source: 'influencer_bio', medium: 'bio_link' }
  };

  const handleSelectPlatform = (plat: string) => {
    setUtmPlatform(plat);
    if (platformPresets[plat]) {
      setUtmSource(platformPresets[plat].source);
      setUtmMedium(platformPresets[plat].medium);
    }
  };

  // =========================================================================
  // 3. AD SPEND LOGGING (EDITABLE)
  // =========================================================================
  const [showLogSpendModal, setShowLogSpendModal] = useState(false);
  const [spendDate, setSpendDate] = useState(new Date().toISOString().split('T')[0]);
  const [spendPlatform, setSpendPlatform] = useState<'Facebook' | 'TikTok' | 'Google' | 'Instagram' | 'Snapchat'>('Facebook');
  const [spendCampaign, setSpendCampaign] = useState('');
  const [spendProductId, setSpendProductId] = useState('');
  const [spendAmountInput, setSpendAmountInput] = useState('');
  const [spendNotes, setSpendNotes] = useState('');

  const handleAddSpendLog = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(spendAmountInput.replace(/[^0-9.]/g, '')) || 0;
    if (parsedAmount <= 0) return;

    if (addMediaBuyerSpendLog) {
      addMediaBuyerSpendLog({
        mediaBuyerId: currentUser.id,
        mediaBuyerName: currentUser.name,
        date: spendDate,
        platform: spendPlatform,
        campaignName: spendCampaign.trim() || `${spendPlatform} Promo`,
        productId: spendProductId || undefined,
        amount: parsedAmount,
        currency: 'NGN',
        notes: spendNotes.trim() || undefined
      });
    }

    setShowLogSpendModal(false);
    setSpendAmountInput('');
    setSpendCampaign('');
    setSpendNotes('');
    if (addNotification) {
      addNotification({
        title: 'Ad Spend Recorded',
        message: `Logged ₦${parsedAmount.toLocaleString()} ad spend on ${spendPlatform}.`,
        type: 'success'
      });
    }
  };

  // =========================================================================
  // 4. SETTINGS (EDITABLE)
  // =========================================================================
  const [settingsName, setSettingsName] = useState(currentUser.name || 'Kayode Daniels');
  const [settingsEmail, setSettingsEmail] = useState(currentUser.email || 'kayode.ads@growthpilot.ng');
  const [settingsPhone, setSettingsPhone] = useState(currentUser.phone || '+234 802 881 9922');
  const [targetCpa, setTargetCpa] = useState('3200');
  const [monthlyBudget, setMonthlyBudget] = useState('1500000');
  const [metaPixelId, setMetaPixelId] = useState('98124018239014');
  const [tiktokPixelId, setTiktokPixelId] = useState('C789230489214');
  const [googleAdsTag, setGoogleAdsTag] = useState('AW-1092834190');
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, {
      name: settingsName,
      email: settingsEmail,
      phone: settingsPhone
    });
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 3000);
    if (addNotification) {
      addNotification({
        title: 'Settings Saved',
        message: 'Media buyer profile and tracking pixels updated.',
        type: 'success'
      });
    }
  };

  // Nav items configuration with accurate UTM badges
  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, isEditable: false },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, isEditable: false, badge: utmOrders.length },
    { id: 'abandoned-carts', label: 'Abandoned Carts', icon: ShoppingCart, isEditable: false, badge: utmAbandonedCarts.length },
    { id: 'scheduled', label: 'Scheduled Delivery', icon: CalendarClock, isEditable: false, badge: scheduledUtmOrders.length },
    { id: 'deliveries', label: 'Deliveries', icon: Truck, isEditable: false, badge: deliveryFulfillmentUtmOrders.length },
    { id: 'ad-tracking', label: 'Ad Tracking (UTM)', icon: Target, isEditable: true, badge: 'Edit' },
    { id: 'settings', label: 'Settings', icon: Settings, isEditable: true, badge: 'Edit' },
    { id: 'log-out', label: 'Log Out', icon: LogOut, isEditable: false, isLogOut: true }
  ];

  // Theme-aware design tokens (Lemon Green + Clean White in Day / Pure Pitch Black in Night)
  const theme = {
    bg: isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-black text-white',
    sidebar: isLight ? 'bg-white border-slate-200' : 'bg-[#0a0a0a] border-neutral-800',
    topHeader: isLight ? 'bg-white border-slate-200' : 'bg-[#0a0a0a] border-neutral-800',
    card: isLight ? 'bg-white border-slate-200 shadow-xs text-slate-900' : 'bg-[#111111] border-neutral-800 text-white',
    subCard: isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800',
    input: isLight 
      ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-lime-500 focus:ring-1 focus:ring-lime-500' 
      : 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-lime-500',
    tableHeader: isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-neutral-950 border-neutral-800 text-slate-400',
    tableRow: isLight ? 'hover:bg-slate-50/80 border-slate-200' : 'hover:bg-neutral-900/40 border-neutral-800/60',
    tableTextPrimary: isLight ? 'text-slate-900' : 'text-white',
    tableTextSecondary: isLight ? 'text-slate-500' : 'text-slate-400',
    bannerNotice: isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/40 border-amber-800/60 text-amber-300',
    bannerMarketing: isLight ? 'bg-lime-50 border-lime-300 text-lime-950' : 'bg-[#141d11] border-lime-500/30 text-lime-300',
    modal: isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#111111] border-neutral-800 text-white',
    primaryBtn: 'bg-lime-500 hover:bg-lime-400 text-black font-extrabold shadow-sm transition cursor-pointer',
    secondaryBtn: isLight 
      ? 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-semibold' 
      : 'bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-slate-200 font-semibold'
  };

  return (
    <div className={`min-h-screen flex ${theme.bg}`}>
      
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in">
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <aside className={`relative z-10 w-72 max-w-[85vw] h-full shadow-2xl flex flex-col ${theme.sidebar}`}>
            {/* User Identity Card */}
            <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center font-bold text-lime-500 text-sm shrink-0">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className={`font-bold text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {currentUser.name || 'Kayode Daniels'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-lime-500 uppercase tracking-wider font-semibold">
                      Media Buyer
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                title="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.isLogOut) {
                        setShowLogoutConfirm(true);
                      } else {
                        setActiveTab(item.id);
                      }
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      item.isLogOut
                        ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 mt-2 border border-rose-500/20'
                        : isActive
                        ? 'bg-lime-500 text-black font-extrabold shadow-sm'
                        : isLight
                          ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          : 'text-slate-400 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isActive 
                          ? 'bg-black text-lime-400' 
                          : item.isEditable
                          ? isLight ? 'bg-lime-100 text-lime-800 border border-lime-300' : 'bg-lime-950 text-lime-400 border border-lime-800/60'
                          : isLight ? 'bg-slate-100 text-slate-700' : 'bg-neutral-800 text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SIDEBAR NAVIGATION                                                    */}
      {/* ===================================================================== */}
      <aside className={`transition-all duration-300 border-r flex flex-col z-30 shrink-0 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      } ${theme.sidebar} hidden md:flex`}>
        
        {/* User Identity Card */}
        <div className={`p-4 border-b ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center font-bold text-lime-500 text-sm shrink-0">
                <Megaphone className="w-4 h-4" />
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <p className={`font-bold text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {currentUser.name || 'Kayode Daniels'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-lime-500 uppercase tracking-wider font-semibold">
                      Media Buyer
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition cursor-pointer"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.isLogOut) {
                    setShowLogoutConfirm(true);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  item.isLogOut
                    ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 mt-2 border border-rose-500/20'
                    : isActive
                    ? 'bg-lime-500 text-black font-extrabold shadow-sm'
                    : isLight
                      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isSidebarCollapsed && item.badge !== undefined && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive 
                      ? 'bg-black text-lime-400' 
                      : item.isEditable
                      ? isLight ? 'bg-lime-100 text-lime-800 border border-lime-300' : 'bg-lime-950 text-lime-400 border border-lime-800/60'
                      : isLight ? 'bg-slate-100 text-slate-700' : 'bg-neutral-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Permissions Legend */}
        {!isSidebarCollapsed && (
          <div className={`p-3.5 m-3 rounded-xl border text-[11px] space-y-1.5 ${theme.subCard}`}>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Read-Only: Orders, Carts, Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 text-lime-500 font-semibold">
              <Edit3 className="w-3 h-3 text-lime-500" />
              <span>Editable: Ad Tracking & Settings</span>
            </div>
          </div>
        )}
      </aside>

      {/* ===================================================================== */}
      {/* MAIN CONTENT AREA                                                     */}
      {/* ===================================================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Banner */}
        <div className={`p-4 sm:p-6 border-b flex flex-wrap items-center justify-between gap-4 ${theme.topHeader}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider ${
                isLight ? 'bg-lime-100 text-lime-800 border border-lime-300' : 'bg-lime-950/80 text-lime-400 border border-lime-800/50'
              }`}>
                Media Buyer Workspace
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">·</span>
              <span className="text-xs text-slate-400 hidden sm:inline">Campaign UTM Attribution</span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight mt-1 flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <span>{navItems.find(i => i.id === activeTab)?.label}</span>
              {navItems.find(i => i.id === activeTab)?.isEditable ? (
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  isLight ? 'bg-lime-100 text-lime-800 border border-lime-300' : 'bg-lime-950 text-lime-400 border border-lime-800/50'
                }`}>
                  Full Edit Access
                </span>
              ) : (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Read Only</span>
                </span>
              )}
            </h1>
          </div>

          {/* Quick Actions in Top Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'orders' && (
              <button
                type="button"
                onClick={handleDownloadCsv}
                className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer ${theme.secondaryBtn}`}
                title="Download CSV report of attributed orders"
              >
                <Download className="w-3.5 h-3.5 text-lime-500" />
                <span>Export CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('ad-tracking')}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 ${theme.primaryBtn}`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>UTM Link Generator</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLogSpendModal(true)}
              className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer ${theme.secondaryBtn}`}
            >
              <Plus className="w-3.5 h-3.5 text-lime-500" />
              <span>Log Ad Spend</span>
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
          
          {/* ================================================================= */}
          {/* TAB 1: OVERVIEW & PERFORMANCE                                     */}
          {/* ================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Primary KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className={`p-4 sm:p-5 rounded-2xl border ${theme.card}`}>
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Total Logged Spend</span>
                    <DollarSign className="w-4 h-4 text-rose-500" />
                  </div>
                  <p className={`text-xl sm:text-2xl font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {formatCurrency(convertAmount(totalRecordedSpendNgn, currency), currency)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Across active Meta & TikTok ads</p>
                </div>

                <div className={`p-4 sm:p-5 rounded-2xl border ${theme.card}`}>
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Delivered Revenue</span>
                    <TrendingUp className="w-4 h-4 text-lime-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-lime-500">
                    {formatCurrency(convertAmount(deliveredUtmRevenueNgn, currency), currency)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{deliveredUtmOrders.length} delivered COD orders</p>
                </div>

                <div className={`p-4 sm:p-5 rounded-2xl border ${theme.card}`}>
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Blended ROAS</span>
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-lime-500">
                    {blendedRoas}x
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Delivered cash / Ad cost</p>
                </div>

                <div className={`p-4 sm:p-5 rounded-2xl border ${theme.card}`}>
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Blended CPA</span>
                    <Target className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className={`text-xl sm:text-2xl font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {formatCurrency(convertAmount(blendedCpa, currency), currency)}
                  </p>
                  <p className="text-[11px] text-lime-600 font-semibold mt-1">Target: ₦{targetCpa}</p>
                </div>
              </div>

              {/* Operational Status Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border ${theme.card} space-y-3`}>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Audited Ad Pipeline (Read-Only)
                    </h3>
                  </div>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Orders, abandoned carts, and deliveries shown here are filtered strictly to the traffic campaigns you ran using UTM tracking.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${theme.subCard} ${isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-neutral-900 text-slate-200'}`}
                    >
                      <span>UTM Orders</span>
                      <span className="font-mono text-lime-500 font-bold">{utmOrders.length}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('abandoned-carts')}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${theme.subCard} ${isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-neutral-900 text-slate-200'}`}
                    >
                      <span>UTM Drop-offs</span>
                      <span className="font-mono text-lime-500 font-bold">{utmAbandonedCarts.length}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('scheduled')}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${theme.subCard} ${isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-neutral-900 text-slate-200'}`}
                    >
                      <span>Scheduled Slots</span>
                      <span className="font-mono text-lime-500 font-bold">{scheduledUtmOrders.length}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('deliveries')}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${theme.subCard} ${isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-neutral-900 text-slate-200'}`}
                    >
                      <span>Delivery Pipeline</span>
                      <span className="font-mono text-lime-500 font-bold">{deliveryFulfillmentUtmOrders.length}</span>
                    </button>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border ${theme.card} space-y-3`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-lime-500" />
                    <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Performance Marketing Suite (Editable)
                    </h3>
                  </div>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Generate UTM tracking links with automatic campaign tagging, log daily ad spend per platform, and configure Meta/TikTok tracking pixels.
                  </p>
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('ad-tracking')}
                      className={`w-full p-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between ${theme.primaryBtn}`}
                    >
                      <span>Open UTM Campaign Link Builder</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('settings')}
                      className={`w-full p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer ${theme.secondaryBtn}`}
                    >
                      <span>Configure Pixels & Target CPA</span>
                      <Settings className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent UTM Orders Preview */}
              <div className={`rounded-2xl border ${theme.card} p-5 space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Recent Orders Attributed to Your Ad Campaigns
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-lime-500 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <span>View All {utmOrders.length} Ad Orders</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b text-[11px] font-mono ${theme.tableHeader}`}>
                        <th className="py-2.5 px-3">Order #</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">UTM Campaign</th>
                        <th className="py-2.5 px-3">Traffic Source</th>
                        <th className="py-2.5 px-3 text-right">Value</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                      {utmOrders.slice(0, 5).map(o => (
                        <tr key={o.id} className={theme.tableRow}>
                          <td className={`py-2.5 px-3 font-mono font-bold ${theme.tableTextPrimary}`}>{o.orderNumber}</td>
                          <td className={`py-2.5 px-3 ${theme.tableTextSecondary}`}>{o.customerName}</td>
                          <td className="py-2.5 px-3">
                            <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                              isLight ? 'bg-lime-100 text-lime-800 border border-lime-300' : 'bg-lime-950 text-lime-400 border border-lime-800/40'
                            }`}>
                              {o.utmCampaign || 'Campaign Lead'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{o.utmSource || 'meta_ads'}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-lime-500">
                            {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              o.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' :
                              o.status === 'DISPATCHED' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' :
                              'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: ORDERS (READ-ONLY) - STRICTLY UTM AD TRACKED               */}
          {/* ================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-in fade-in">
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${theme.bannerNotice}`}>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    <strong>View-Only Ad Orders:</strong> Showing only customer orders acquired via your UTM ad tracking campaigns ({utmOrders.length} orders). Editing addresses, customer notes, and statuses is locked.
                  </span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by order #, customer, or UTM campaign..."
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs ${theme.input}`}
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className={`rounded-xl px-3 py-2 text-xs focus:outline-none ${theme.input}`}
                  >
                    <option value="ALL">All Statuses ({utmOrders.length})</option>
                    <option value="NEW">NEW</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  <select
                    value={orderCampaignFilter}
                    onChange={(e) => setOrderCampaignFilter(e.target.value)}
                    className={`rounded-xl px-3 py-2 text-xs focus:outline-none ${theme.input}`}
                  >
                    <option value="ALL">All Ad Campaigns</option>
                    {availableCampaigns.map(camp => (
                      <option key={camp} value={camp}>{camp}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${theme.secondaryBtn}`}
                    title="Export attributed orders to CSV for external reporting"
                  >
                    <Download className="w-3.5 h-3.5 text-lime-500" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Orders Table */}
              <div className={`rounded-2xl border ${theme.card} overflow-hidden shadow-xs`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b text-[11px] font-mono ${theme.tableHeader}`}>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Customer & City</th>
                        <th className="py-3 px-4">Campaign & Creative</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4 text-right">Total Amount</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            No ad-tracked orders matching filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map(o => (
                          <tr key={o.id} className={theme.tableRow}>
                            <td className={`py-3 px-4 font-mono font-bold ${theme.tableTextPrimary}`}>
                              {o.orderNumber}
                            </td>
                            <td className="py-3 px-4">
                              <p className={`font-semibold ${theme.tableTextPrimary}`}>{o.customerName}</p>
                              <p className="text-[11px] text-slate-400">{o.deliveryCity}, {o.deliveryState}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold inline-block max-w-[170px] truncate ${
                                isLight ? 'bg-lime-100 text-lime-800 border border-lime-300' : 'bg-lime-950 text-lime-400 border border-lime-800/40'
                              }`} title={o.utmCampaign}>
                                {o.utmCampaign || 'Ad Traffic'}
                              </span>
                              {o.utmSource && (
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{o.utmSource}</p>
                              )}
                            </td>
                            <td className={`py-3 px-4 ${theme.tableTextSecondary}`}>
                              {o.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-lime-500 whitespace-nowrap">
                              {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                o.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' :
                                o.status === 'DISPATCHED' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' :
                                o.status === 'SCHEDULED' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/30' :
                                o.status === 'CONFIRMED' ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30' :
                                'bg-neutral-500/10 text-neutral-400 border border-neutral-500/30'
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderForView(o)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ml-auto ${theme.secondaryBtn}`}
                              >
                                <Eye className="w-3 h-3 text-lime-500" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: ABANDONED CARTS (READ-ONLY) - STRICTLY UTM TRACKED         */}
          {/* ================================================================= */}
          {activeTab === 'abandoned-carts' && (
            <div className="space-y-4 animate-in fade-in">
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${theme.bannerNotice}`}>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    <strong>View-Only Ad Checkout Drop-offs:</strong> Showing checkout drop-offs tagged with your ad UTM parameters ({utmAbandonedCarts.length} leads). Customer call recovery is assigned to Telesales Reps.
                  </span>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={cartSearchQuery}
                    onChange={(e) => setCartSearchQuery(e.target.value)}
                    placeholder="Search by customer, phone, or product..."
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs ${theme.input}`}
                  />
                </div>

                <select
                  value={cartStatusFilter}
                  onChange={(e) => setCartStatusFilter(e.target.value)}
                  className={`rounded-xl px-3 py-2 text-xs focus:outline-none ${theme.input}`}
                >
                  <option value="ALL">All Statuses ({utmAbandonedCarts.length})</option>
                  <option value="ABANDONED">ABANDONED</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="CONVERTED">CONVERTED</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>

              {/* Table */}
              <div className={`rounded-2xl border ${theme.card} overflow-hidden shadow-xs`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b text-[11px] font-mono ${theme.tableHeader}`}>
                        <th className="py-3 px-4">Cart ID</th>
                        <th className="py-3 px-4">Customer Details</th>
                        <th className="py-3 px-4">Campaign & Source</th>
                        <th className="py-3 px-4">Product Selected</th>
                        <th className="py-3 px-4 text-right">Cart Total</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                      {filteredCarts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            No abandoned checkout leads from your ad campaigns.
                          </td>
                        </tr>
                      ) : (
                        filteredCarts.map(c => (
                          <tr key={c.id} className={theme.tableRow}>
                            <td className={`py-3 px-4 font-mono font-bold ${theme.tableTextPrimary}`}>
                              {c.cartNumber || c.id}
                            </td>
                            <td className="py-3 px-4">
                              <p className={`font-semibold ${theme.tableTextPrimary}`}>{c.customerName}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{c.customerPhone}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                                isLight ? 'bg-lime-100 text-lime-800 border border-lime-300' : 'bg-lime-950 text-lime-400 border border-lime-800/40'
                              }`}>
                                {c.utmCampaign || c.utmSource || 'Meta Traffic'}
                              </span>
                            </td>
                            <td className={`py-3 px-4 ${theme.tableTextSecondary}`}>
                              {c.productName}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-amber-500">
                              {formatCurrency(convertAmount(c.amount, currency), currency)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                c.status === 'CONVERTED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' :
                                c.status === 'CONTACTED' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' :
                                'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedCartForView(c)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ml-auto ${theme.secondaryBtn}`}
                              >
                                <Eye className="w-3 h-3 text-lime-500" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: SCHEDULED DELIVERY (READ-ONLY) - STRICTLY UTM TRACKED       */}
          {/* ================================================================= */}
          {activeTab === 'scheduled' && (
            <div className="space-y-4 animate-in fade-in">
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${theme.bannerNotice}`}>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    <strong>View-Only Scheduled Deliveries:</strong> Committed delivery appointments for customer orders acquired through your ad campaigns ({scheduledUtmOrders.length} bookings). Rescheduling is handled by local delivery hubs.
                  </span>
                </div>
              </div>

              <div className={`rounded-2xl border ${theme.card} overflow-hidden shadow-xs`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b text-[11px] font-mono ${theme.tableHeader}`}>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Delivery Area</th>
                        <th className="py-3 px-4">Campaign</th>
                        <th className="py-3 px-4">Scheduled Date</th>
                        <th className="py-3 px-4 text-right">Order Value</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                      {scheduledUtmOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            No scheduled delivery orders from your campaigns currently.
                          </td>
                        </tr>
                      ) : (
                        scheduledUtmOrders.map(o => (
                          <tr key={o.id} className={theme.tableRow}>
                            <td className={`py-3 px-4 font-mono font-bold ${theme.tableTextPrimary}`}>
                              {o.orderNumber}
                            </td>
                            <td className="py-3 px-4">
                              <p className={`font-semibold ${theme.tableTextPrimary}`}>{o.customerName}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{o.customerPhone}</p>
                            </td>
                            <td className={`py-3 px-4 ${theme.tableTextSecondary}`}>
                              {o.deliveryCity}, {o.deliveryState}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                                isLight ? 'bg-lime-100 text-lime-800 border border-lime-300' : 'bg-lime-950 text-lime-400 border border-lime-800/40'
                              }`}>
                                {o.utmCampaign || 'Ad Traffic'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-lime-600">
                              {o.scheduledDate || 'Today'}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-lime-500">
                              {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/30">
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: DELIVERIES (READ-ONLY) - STRICTLY UTM TRACKED               */}
          {/* ================================================================= */}
          {activeTab === 'deliveries' && (
            <div className="space-y-4 animate-in fade-in">
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${theme.bannerNotice}`}>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    <strong>View-Only Fulfillment Pipeline:</strong> Doorstep delivery completion for orders generated by your ad tracking ({deliveryFulfillmentUtmOrders.length} deliveries).
                  </span>
                </div>
              </div>

              {/* Delivery Stats Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-xl border ${theme.card}`}>
                  <p className="text-[11px] text-slate-400">Ad Fulfillment Rate</p>
                  <p className="text-xl font-bold font-mono text-lime-500 mt-1">{fulfillmentRate}%</p>
                </div>
                <div className={`p-3.5 rounded-xl border ${theme.card}`}>
                  <p className="text-[11px] text-slate-400">Delivered Orders</p>
                  <p className={`text-xl font-bold font-mono mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {deliveredUtmOrders.length}
                  </p>
                </div>
                <div className={`p-3.5 rounded-xl border ${theme.card}`}>
                  <p className="text-[11px] text-slate-400">In Transit / Dispatch</p>
                  <p className="text-xl font-bold font-mono text-blue-500 mt-1">
                    {deliveryFulfillmentUtmOrders.filter(o => o.status === 'DISPATCHED').length}
                  </p>
                </div>
                <div className={`p-3.5 rounded-xl border ${theme.card}`}>
                  <p className="text-[11px] text-slate-400">Cancelled / Refused</p>
                  <p className="text-xl font-bold font-mono text-rose-500 mt-1">
                    {deliveryFulfillmentUtmOrders.filter(o => o.status === 'CANCELLED').length}
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className={`rounded-2xl border ${theme.card} overflow-hidden shadow-xs`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b text-[11px] font-mono ${theme.tableHeader}`}>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Campaign</th>
                        <th className="py-3 px-4">Delivery Zone</th>
                        <th className="py-3 px-4">Fulfillment Status</th>
                        <th className="py-3 px-4">Delivered Date</th>
                        <th className="py-3 px-4 text-right">Cash Collected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                      {deliveryFulfillmentUtmOrders.map(o => (
                        <tr key={o.id} className={theme.tableRow}>
                          <td className={`py-3 px-4 font-mono font-bold ${theme.tableTextPrimary}`}>{o.orderNumber}</td>
                          <td className="py-3 px-4">
                            <p className={`font-semibold ${theme.tableTextPrimary}`}>{o.customerName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{o.customerPhone}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                              isLight ? 'bg-lime-100 text-lime-800 border border-lime-300' : 'bg-lime-950 text-lime-400 border border-lime-800/40'
                            }`}>
                              {o.utmCampaign || 'Ad Traffic'}
                            </span>
                          </td>
                          <td className={`py-3 px-4 ${theme.tableTextSecondary}`}>
                            {o.deliveryState}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              o.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' :
                              o.status === 'DISPATCHED' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' :
                              'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {o.deliveredDate ? o.deliveredDate.split('T')[0] : 'In Transit'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-lime-500">
                            {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: AD TRACKING (UTM) - FULL EDIT ACCESS                       */}
          {/* ================================================================= */}
          {activeTab === 'ad-tracking' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header Box */}
              <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${theme.bannerMarketing}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-lime-500 text-black font-mono text-[10px] font-extrabold uppercase">
                      Editable Marketing Tool
                    </span>
                    <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      UTM Link Generator & Campaign Tracker
                    </h2>
                  </div>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Generate tracking links for Meta, TikTok, and Google Ads. Track revenue, CPA, and ROAS automatically.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLogSpendModal(true)}
                  className={`px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto ${theme.primaryBtn}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Ad Spend</span>
                </button>
              </div>

              {/* UTM Builder Form */}
              <div className={`rounded-2xl border ${theme.card} p-5 space-y-4`}>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Tag className="w-4 h-4 text-lime-500" />
                  <span>Create New Tracking Link</span>
                </h3>

                {/* Platform Pill Selector */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Traffic Source Platform
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(platformPresets).map(plat => (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => handleSelectPlatform(plat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          utmPlatform === plat
                            ? 'bg-lime-500 text-black font-extrabold shadow-xs'
                            : isLight
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-neutral-900 hover:bg-neutral-800 text-slate-300'
                        }`}
                      >
                        {plat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Landing Page URL</label>
                    <input
                      type="url"
                      value={utmBaseUrl}
                      onChange={(e) => setUtmBaseUrl(e.target.value)}
                      placeholder="https://apexbrands.ng/order"
                      className={`w-full p-2.5 rounded-xl text-xs font-mono ${theme.input}`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Campaign Name (utm_campaign)</label>
                    <input
                      type="text"
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      placeholder="e.g. clarifying_glow_sept26"
                      className={`w-full p-2.5 rounded-xl text-xs font-mono ${theme.input}`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Traffic Medium (utm_medium)</label>
                    <input
                      type="text"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      placeholder="e.g. cpc, video, reel"
                      className={`w-full p-2.5 rounded-xl text-xs font-mono ${theme.input}`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Creative / Angle (utm_content)</label>
                    <input
                      type="text"
                      value={utmContent}
                      onChange={(e) => setUtmContent(e.target.value)}
                      placeholder="e.g. ugc_doctor_review"
                      className={`w-full p-2.5 rounded-xl text-xs font-mono ${theme.input}`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Audience (utm_term)</label>
                    <input
                      type="text"
                      value={utmTerm}
                      onChange={(e) => setUtmTerm(e.target.value)}
                      placeholder="e.g. skincare_abuja"
                      className={`w-full p-2.5 rounded-xl text-xs font-mono ${theme.input}`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Preset Template Name (Optional)</label>
                    <input
                      type="text"
                      value={campaignTemplateName}
                      onChange={(e) => setCampaignTemplateName(e.target.value)}
                      placeholder="e.g. Meta Doctor UGC Angle"
                      className={`w-full p-2.5 rounded-xl text-xs ${theme.input}`}
                    />
                  </div>
                </div>

                {/* Generated URL Box */}
                <div className={`p-3.5 rounded-xl border space-y-2 ${theme.subCard}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">Generated UTM Tracking Link:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyGeneratedLink}
                        className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1 ${theme.primaryBtn}`}
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveUtmLink}
                        className={`px-3 py-1 rounded-lg text-xs cursor-pointer ${theme.secondaryBtn}`}
                      >
                        Save Preset
                      </button>
                    </div>
                  </div>

                  <p className={`font-mono text-xs break-all select-all p-2 rounded-lg border font-semibold ${
                    isLight ? 'bg-white border-slate-300 text-lime-700' : 'bg-black/60 border-neutral-800 text-lime-400'
                  }`}>
                    {generatedUtmUrl}
                  </p>
                </div>
              </div>

              {/* Saved UTM Links */}
              <div className={`rounded-2xl border ${theme.card} p-5 space-y-4`}>
                <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Saved Campaign Link Presets ({savedLinks.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b text-[11px] font-mono ${theme.tableHeader}`}>
                        <th className="py-2.5 px-3">Template Name</th>
                        <th className="py-2.5 px-3">Platform</th>
                        <th className="py-2.5 px-3">Campaign</th>
                        <th className="py-2.5 px-3">Creative</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                      {savedLinks.map(l => (
                        <tr key={l.id} className={theme.tableRow}>
                          <td className={`py-3 px-3 font-semibold ${theme.tableTextPrimary}`}>{l.name}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                              isLight ? 'bg-slate-100 text-slate-700' : 'bg-neutral-800 text-slate-300'
                            }`}>
                              {l.platform}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-lime-600 font-semibold">{l.campaign}</td>
                          <td className="py-3 px-3 text-slate-400">{l.content}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(l.url);
                                  if (addNotification) {
                                    addNotification({
                                      title: 'Copied Link',
                                      message: `Copied ${l.name} to clipboard.`,
                                      type: 'info'
                                    });
                                  }
                                }}
                                className="p-1 rounded text-slate-400 hover:text-lime-500 transition cursor-pointer"
                                title="Copy URL"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSavedLink(l.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                title="Delete preset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Logged Ad Spend Records */}
              <div className={`rounded-2xl border ${theme.card} p-5 space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Logged Ad Spend Records
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowLogSpendModal(true)}
                    className="text-xs text-lime-500 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Log New Spend</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b text-[11px] font-mono ${theme.tableHeader}`}>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Platform</th>
                        <th className="py-2.5 px-3">Campaign Name</th>
                        <th className="py-2.5 px-3 text-right">Spend Amount</th>
                        <th className="py-2.5 px-3">Notes</th>
                        <th className="py-2.5 px-3 text-right">{isAdmin ? 'Action' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                      {mediaBuyerSpendLogs && mediaBuyerSpendLogs.length > 0 ? (
                        mediaBuyerSpendLogs.map(log => (
                          <tr key={log.id} className={theme.tableRow}>
                            <td className="py-3 px-3 font-mono text-slate-400">{log.date}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                isLight ? 'bg-slate-100 text-slate-700' : 'bg-neutral-800 text-slate-300'
                              }`}>
                                {log.platform}
                              </span>
                            </td>
                            <td className={`py-3 px-3 font-semibold ${theme.tableTextPrimary}`}>{log.campaignName}</td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-rose-500">
                              {formatCurrency(convertAmount(log.amount, currency), currency)}
                            </td>
                            <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-[180px]">
                              {log.notes || '—'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {isAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => deleteMediaBuyerSpendLog && deleteMediaBuyerSpendLog(log.id)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                  title="Delete log (Admin only)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span 
                                  className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20 inline-flex items-center gap-1 cursor-default select-none"
                                  title="Logged ad spend records are locked. Deletion can only be performed by an Administrator."
                                >
                                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                                  <span>Locked</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            No ad spend records logged yet. Click "Log Ad Spend" above to record daily marketing budget.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 7: SETTINGS - FULL EDIT ACCESS                                */}
          {/* ================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in max-w-4xl">
              <div className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between ${theme.bannerMarketing}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-lime-500 text-black font-mono text-[10px] font-extrabold uppercase">
                      Editable Section
                    </span>
                    <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Media Buyer Configuration & Ad Pixels
                    </h2>
                  </div>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Manage your marketer profile, pixel tokens, and campaign performance threshold alerts.
                  </p>
                </div>
                {isSettingsSaved && (
                  <span className="px-3 py-1 rounded-xl bg-lime-500 text-black font-extrabold text-xs flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-5">
                {/* 1. Profile Information */}
                <div className={`p-5 rounded-2xl border ${theme.card} space-y-4`}>
                  <h3 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <UserCheck className="w-4 h-4 text-lime-500" />
                    <span>Media Buyer Profile Information</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={settingsName}
                        onChange={(e) => setSettingsName(e.target.value)}
                        className={`w-full p-2.5 rounded-xl font-medium ${theme.input}`}
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={settingsEmail}
                        onChange={(e) => setSettingsEmail(e.target.value)}
                        className={`w-full p-2.5 rounded-xl font-medium ${theme.input}`}
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        value={settingsPhone}
                        onChange={(e) => setSettingsPhone(e.target.value)}
                        className={`w-full p-2.5 rounded-xl font-mono ${theme.input}`}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Tracking Pixels */}
                <div className={`p-5 rounded-2xl border ${theme.card} space-y-4`}>
                  <h3 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <Target className="w-4 h-4 text-indigo-500" />
                    <span>Ad Account Pixel IDs & Conversion APIs</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Meta (Facebook) Pixel ID</label>
                      <input
                        type="text"
                        value={metaPixelId}
                        onChange={(e) => setMetaPixelId(e.target.value)}
                        placeholder="e.g. 98124018239014"
                        className={`w-full p-2.5 rounded-xl font-mono ${theme.input}`}
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">TikTok Pixel ID</label>
                      <input
                        type="text"
                        value={tiktokPixelId}
                        onChange={(e) => setTiktokPixelId(e.target.value)}
                        placeholder="e.g. C789230489214"
                        className={`w-full p-2.5 rounded-xl font-mono ${theme.input}`}
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Google Ads Conversion ID</label>
                      <input
                        type="text"
                        value={googleAdsTag}
                        onChange={(e) => setGoogleAdsTag(e.target.value)}
                        placeholder="e.g. AW-1092834190"
                        className={`w-full p-2.5 rounded-xl font-mono ${theme.input}`}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Budget Goals & Alert Thresholds */}
                <div className={`p-5 rounded-2xl border ${theme.card} space-y-4`}>
                  <h3 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <BarChart3 className="w-4 h-4 text-amber-500" />
                    <span>Campaign Targets & CPA Thresholds</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Target CPA Goal (₦)</label>
                      <input
                        type="number"
                        value={targetCpa}
                        onChange={(e) => setTargetCpa(e.target.value)}
                        className={`w-full p-2.5 rounded-xl font-mono ${theme.input}`}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Receive warning alert if delivered CPA exceeds this value.</p>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Monthly Ad Spend Cap (₦)</label>
                      <input
                        type="number"
                        value={monthlyBudget}
                        onChange={(e) => setMonthlyBudget(e.target.value)}
                        className={`w-full p-2.5 rounded-xl font-mono ${theme.input}`}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Allocated performance ad spend for current month.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className={`px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 ${theme.primaryBtn}`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Settings & Preferences</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* ===================================================================== */}
      {/* MODAL 1: LOG AD SPEND (EDITABLE FEATURE)                              */}
      {/* ===================================================================== */}
      {showLogSpendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl animate-in zoom-in-95 ${theme.modal}`}>
            <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-lime-500" />
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Log Daily Ad Spend</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogSpendModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSpendLog} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Spend Date</label>
                <input
                  type="date"
                  required
                  value={spendDate}
                  onChange={(e) => setSpendDate(e.target.value)}
                  className={`w-full p-2.5 rounded-xl ${theme.input}`}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Platform</label>
                <select
                  value={spendPlatform}
                  onChange={(e) => setSpendPlatform(e.target.value as any)}
                  className={`w-full p-2.5 rounded-xl ${theme.input}`}
                >
                  <option value="Facebook">Facebook / Meta Ads</option>
                  <option value="TikTok">TikTok Ads</option>
                  <option value="Google">Google Ads</option>
                  <option value="Instagram">Instagram Direct</option>
                  <option value="Snapchat">Snapchat Ads</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={spendCampaign}
                  onChange={(e) => setSpendCampaign(e.target.value)}
                  placeholder="e.g. clarifying_glow_sept26"
                  className={`w-full p-2.5 rounded-xl font-mono ${theme.input}`}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Associated Product (Optional)</label>
                <select
                  value={spendProductId}
                  onChange={(e) => setSpendProductId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl ${theme.input}`}
                >
                  <option value="">General Brand / All Products</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Amount Spent (₦) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45000"
                  value={spendAmountInput}
                  onChange={(e) => setSpendAmountInput(e.target.value)}
                  className={`w-full p-2.5 rounded-xl font-mono text-sm font-bold ${theme.input}`}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Notes / Creative Variant</label>
                <input
                  type="text"
                  placeholder="e.g. Tested UGC hook 1 vs hook 2"
                  value={spendNotes}
                  onChange={(e) => setSpendNotes(e.target.value)}
                  className={`w-full p-2.5 rounded-xl ${theme.input}`}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogSpendModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs cursor-pointer ${theme.secondaryBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs ${theme.primaryBtn}`}
                >
                  Record Spend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: INSPECT ORDER DETAILS (READ-ONLY)                           */}
      {/* ===================================================================== */}
      {selectedOrderForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl animate-in zoom-in-95 ${theme.modal}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedOrderForView.orderNumber}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-mono text-[10px] flex items-center gap-1 font-semibold">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Read Only</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForView(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-xl border space-y-1.5 ${theme.subCard}`}>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedOrderForView.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono text-slate-300">{selectedOrderForView.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Address:</span>
                  <span className="text-slate-300 text-right">{selectedOrderForView.deliveryAddress}, {selectedOrderForView.deliveryCity} ({selectedOrderForView.deliveryState})</span>
                </div>
              </div>

              {/* Attribution Box */}
              <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                isLight ? 'bg-lime-50 border-lime-200' : 'bg-lime-950/20 border-lime-800/40'
              }`}>
                <p className="font-semibold text-lime-600 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Ad Campaign Attribution</span>
                </p>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400">utm_source:</span>
                  <span className="text-slate-300">{selectedOrderForView.utmSource || selectedOrderForView.source || 'meta_ads'}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400">utm_campaign:</span>
                  <span className="text-lime-600 font-bold">{selectedOrderForView.utmCampaign || 'Default Campaign'}</span>
                </div>
                {selectedOrderForView.utmMedium && (
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-400">utm_medium:</span>
                    <span className="text-slate-300">{selectedOrderForView.utmMedium}</span>
                  </div>
                )}
                {selectedOrderForView.utmCreative && (
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-400">utm_content / creative:</span>
                    <span className="text-slate-300">{selectedOrderForView.utmCreative}</span>
                  </div>
                )}
              </div>

              {/* Items & Status */}
              <div className={`p-3 rounded-xl border space-y-1.5 ${theme.subCard}`}>
                <div className="flex justify-between">
                  <span className="text-slate-400">Order Items:</span>
                  <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedOrderForView.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</span>
                </div>
                <div className={`flex justify-between font-bold pt-1 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                  <span className="text-slate-400">Order Total:</span>
                  <span className="font-mono text-lime-500 text-sm">
                    {formatCurrency(convertAmount(selectedOrderForView.totalAmount, currency), currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">Current Order Status:</span>
                  <span className="font-mono px-2 py-0.5 rounded font-bold text-[10px] bg-neutral-800 text-white">
                    {selectedOrderForView.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForView(null)}
                className={`px-4 py-2 rounded-xl text-xs ${theme.secondaryBtn}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: INSPECT CART DETAILS (READ-ONLY)                             */}
      {/* ===================================================================== */}
      {selectedCartForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl animate-in zoom-in-95 ${theme.modal}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedCartForView.cartNumber || selectedCartForView.id}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-mono text-[10px] flex items-center gap-1 font-semibold">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Read Only</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCartForView(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-xl border space-y-1.5 ${theme.subCard}`}>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedCartForView.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono text-slate-300">{selectedCartForView.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Abandoned At:</span>
                  <span className="text-slate-400 font-mono">{selectedCartForView.createdAt || 'Recent checkout'}</span>
                </div>
              </div>

              {/* Attribution */}
              <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                isLight ? 'bg-lime-50 border-lime-200' : 'bg-lime-950/20 border-lime-800/40'
              }`}>
                <p className="font-semibold text-lime-600">Ad Funnel Attribution</p>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400">Campaign:</span>
                  <span className="text-lime-600 font-bold">{selectedCartForView.utmCampaign || 'Meta Scale'}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400">Source:</span>
                  <span className="text-slate-300">{selectedCartForView.utmSource || 'facebook_ads'}</span>
                </div>
              </div>

              <div className={`p-3 rounded-xl border space-y-1.5 ${theme.subCard}`}>
                <div className="flex justify-between">
                  <span className="text-slate-400">Product Attempted:</span>
                  <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedCartForView.productName}</span>
                </div>
                <div className={`flex justify-between font-bold pt-1 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                  <span className="text-slate-400">Cart Value:</span>
                  <span className="font-mono text-amber-500">
                    {formatCurrency(convertAmount(selectedCartForView.amount, currency), currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">Telesales Status:</span>
                  <span className="font-mono px-2 py-0.5 rounded font-bold text-[10px] bg-neutral-800 text-white">
                    {selectedCartForView.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCartForView(null)}
                className={`px-4 py-2 rounded-xl text-xs ${theme.secondaryBtn}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Log Out of Media Buyer Workspace?</h3>
              <p className="text-xs text-slate-400 mt-1">
                You will be redirected back to the login portal. All UTM links and logs are saved automatically.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  setPersona('marketing');
                  if (addNotification) {
                    addNotification({
                      title: 'Signed Out',
                      message: 'You have been logged out of your session.',
                      type: 'info'
                    });
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
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
