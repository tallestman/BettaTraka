import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { MediaBuyer, MediaBuyerSpendLog, CurrencyCode } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Edit,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  Sparkles,
  ChevronRight,
  UserCheck,
  Target,
  BarChart3,
  Award,
  Link as LinkIcon,
  X
} from 'lucide-react';

export const MediaBuyersView: React.FC = () => {
  const {
    mediaBuyers,
    addMediaBuyer,
    updateMediaBuyer,
    deleteMediaBuyer,
    mediaBuyerSpendLogs,
    addMediaBuyerSpendLog,
    deleteMediaBuyerSpendLog,
    orders,
    products,
    salesTeams,
    users,
    currency,
    addNotification
  } = useCrm();

  // Active view tab: 'roster' | 'campaigns' | 'spend_tracker' | 'commissions'
  const [activeTab, setActiveTab] = useState<'roster' | 'campaigns' | 'spend_tracker' | 'commissions'>('roster');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Paused'>('All');
  const [teamFilter, setTeamFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('this_month');

  // Modals state
  const [showAddBuyerModal, setShowAddBuyerModal] = useState(false);
  const [showEditBuyerModal, setShowEditBuyerModal] = useState(false);
  const [selectedBuyerToEdit, setSelectedBuyerToEdit] = useState<MediaBuyer | null>(null);
  const [showLogSpendModal, setShowLogSpendModal] = useState(false);
  const [selectedBuyerForSpend, setSelectedBuyerForSpend] = useState<string>('');
  const [showLinkGenModal, setShowLinkGenModal] = useState(false);
  const [selectedBuyerForLink, setSelectedBuyerForLink] = useState<MediaBuyer | null>(null);

  // Link copy state
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states for Add/Edit Buyer
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerBudget, setBuyerBudget] = useState<number>(1000000);
  const [buyerTargetCpa, setBuyerTargetCpa] = useState<number>(3000);
  const [buyerTeamId, setBuyerTeamId] = useState<string>('');
  const [buyerPlatform, setBuyerPlatform] = useState<string>('Facebook & Instagram');
  const [buyerStatus, setBuyerStatus] = useState<'Active' | 'Paused'>('Active');
  const [buyerCommissionType, setBuyerCommissionType] = useState<'per_delivered_order' | 'percentage_revenue' | 'fixed_monthly'>('per_delivered_order');
  const [buyerCommissionRate, setBuyerCommissionRate] = useState<number>(1500);
  const [buyerCampaignTags, setBuyerCampaignTags] = useState<string>('');
  const [buyerNotes, setBuyerNotes] = useState<string>('');

  // Form states for Log Daily Spend
  const [spendBuyerId, setSpendBuyerId] = useState<string>('');
  const [spendDate, setSpendDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [spendPlatform, setSpendPlatform] = useState<'Facebook' | 'TikTok' | 'Google' | 'Instagram' | 'Snapchat'>('Facebook');
  const [spendCampaign, setSpendCampaign] = useState<string>('');
  const [spendProductId, setSpendProductId] = useState<string>('');
  const [spendAmount, setSpendAmount] = useState<number>(35000);
  const [spendImpressions, setSpendImpressions] = useState<number>(25000);
  const [spendClicks, setSpendClicks] = useState<number>(650);
  const [spendNotes, setSpendNotes] = useState<string>('');

  // Link Generator form state
  const [linkProductId, setLinkProductId] = useState<string>(products[0]?.id || 'prod-1');
  const [linkSource, setLinkSource] = useState<string>('facebook');
  const [linkCampaign, setLinkCampaign] = useState<string>('campaign_scale_v1');
  const [linkMedium, setLinkMedium] = useState<string>('cpc');

  // Compute performance metrics per media buyer
  const buyerMetrics = useMemo(() => {
    return mediaBuyers.map(buyer => {
      // Find orders matching this media buyer: either by mediaBuyerId or active campaigns or name
      const buyerOrders = orders.filter(o => {
        if (o.mediaBuyerId === buyer.id) return true;
        if (o.mediaBuyerName && o.mediaBuyerName.toLowerCase().includes(buyer.name.toLowerCase())) return true;
        if (o.utmCampaign && buyer.activeCampaigns?.some(c => c.toLowerCase() === o.utmCampaign?.toLowerCase())) return true;
        return false;
      });

      const totalOrders = buyerOrders.length;
      const deliveredOrders = buyerOrders.filter(o => o.status === 'DELIVERED');
      const deliveredCount = deliveredOrders.length;
      const dispatchedCount = buyerOrders.filter(o => o.status === 'DISPATCHED' || o.status === 'CONFIRMED').length;
      const cancelledCount = buyerOrders.filter(o => o.status === 'CANCELLED' || o.status === 'NOT_REACHABLE' || o.status === 'NOT_PICKING_CALLS').length;

      const deliveryRate = totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;

      // Delivered Revenue
      const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const grossRevenue = buyerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // Ad spend from recorded spend logs
      const spendLogs = mediaBuyerSpendLogs.filter(s => s.mediaBuyerId === buyer.id);
      const totalSpendFromLogs = spendLogs.reduce((sum, s) => sum + (s.amount || 0), 0);
      const totalSpend = totalSpendFromLogs > 0 ? totalSpendFromLogs : (buyer.totalSpendRecorded || 0);

      // Blended CPA calculation
      // Primary COD metric: Spend / Delivered Orders (True Cost Per Delivered Order)
      const costPerDelivered = deliveredCount > 0 ? Math.round(totalSpend / deliveredCount) : 0;
      // Secondary: Spend / Total Placed Orders
      const costPerOrder = totalOrders > 0 ? Math.round(totalSpend / totalOrders) : 0;

      // ROAS
      const roas = totalSpend > 0 ? Number((deliveredRevenue / totalSpend).toFixed(2)) : 0;

      // Commission calculation
      let commissionEarned = 0;
      if (buyer.commissionType === 'per_delivered_order') {
        commissionEarned = deliveredCount * (buyer.commissionRate || 1500);
      } else if (buyer.commissionType === 'percentage_revenue') {
        commissionEarned = Math.round(deliveredRevenue * ((buyer.commissionRate || 5) / 100));
      } else if (buyer.commissionType === 'fixed_monthly') {
        commissionEarned = buyer.commissionRate || 150000;
      }

      const team = salesTeams.find(t => t.id === buyer.teamId);

      return {
        ...buyer,
        teamName: team?.name || 'Unassigned Team',
        totalOrders,
        deliveredCount,
        dispatchedCount,
        cancelledCount,
        deliveryRate,
        deliveredRevenue,
        grossRevenue,
        totalSpend,
        costPerDelivered,
        costPerOrder,
        roas,
        commissionEarned
      };
    });
  }, [mediaBuyers, orders, mediaBuyerSpendLogs, salesTeams]);

  // Filtered buyers list
  const filteredBuyers = useMemo(() => {
    return buyerMetrics.filter(buyer => {
      if (statusFilter !== 'All' && buyer.status !== statusFilter) return false;
      if (teamFilter !== 'All' && buyer.teamId !== teamFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = buyer.name.toLowerCase().includes(q);
        const matchesEmail = buyer.email.toLowerCase().includes(q);
        const matchesCampaign = buyer.activeCampaigns?.some(c => c.toLowerCase().includes(q));
        const matchesPlatform = buyer.trafficPlatform?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesCampaign && !matchesPlatform) return false;
      }
      return true;
    });
  }, [buyerMetrics, statusFilter, teamFilter, searchQuery]);

  // Overall KPI Summary Totals
  const overallKPIs = useMemo(() => {
    const totalBuyers = mediaBuyers.length;
    const activeBuyers = mediaBuyers.filter(b => b.status === 'Active').length;

    const totalSpend = buyerMetrics.reduce((sum, b) => sum + b.totalSpend, 0);
    const totalOrders = buyerMetrics.reduce((sum, b) => sum + b.totalOrders, 0);
    const totalDelivered = buyerMetrics.reduce((sum, b) => sum + b.deliveredCount, 0);
    const totalRevenue = buyerMetrics.reduce((sum, b) => sum + b.deliveredRevenue, 0);
    const totalCommission = buyerMetrics.reduce((sum, b) => sum + b.commissionEarned, 0);

    const blendedCpa = totalDelivered > 0 ? Math.round(totalSpend / totalDelivered) : 0;
    const overallDeliveryRate = totalOrders > 0 ? Math.round((totalDelivered / totalOrders) * 100) : 0;
    const overallRoas = totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0;

    return {
      totalBuyers,
      activeBuyers,
      totalSpend,
      totalOrders,
      totalDelivered,
      totalRevenue,
      blendedCpa,
      overallDeliveryRate,
      overallRoas,
      totalCommission
    };
  }, [mediaBuyers, buyerMetrics]);

  // Handlers for Add/Edit Buyer
  const handleOpenAddModal = () => {
    setBuyerName('');
    setBuyerEmail('');
    setBuyerPhone('');
    setBuyerBudget(1000000);
    setBuyerTargetCpa(3000);
    setBuyerTeamId(salesTeams[0]?.id || '');
    setBuyerPlatform('Facebook & Instagram');
    setBuyerStatus('Active');
    setBuyerCommissionType('per_delivered_order');
    setBuyerCommissionRate(1500);
    setBuyerCampaignTags('');
    setBuyerNotes('');
    setShowAddBuyerModal(true);
  };

  const handleOpenEditModal = (buyer: MediaBuyer) => {
    setSelectedBuyerToEdit(buyer);
    setBuyerName(buyer.name);
    setBuyerEmail(buyer.email);
    setBuyerPhone(buyer.phone || '');
    setBuyerBudget(buyer.budgetMonthly || 1000000);
    setBuyerTargetCpa(buyer.targetCpa || 3000);
    setBuyerTeamId(buyer.teamId || '');
    setBuyerPlatform(buyer.trafficPlatform || 'Facebook & Instagram');
    setBuyerStatus(buyer.status === 'Paused' ? 'Paused' : 'Active');
    setBuyerCommissionType(buyer.commissionType || 'per_delivered_order');
    setBuyerCommissionRate(buyer.commissionRate || 1500);
    setBuyerCampaignTags(buyer.activeCampaigns?.join(', ') || '');
    setBuyerNotes(buyer.notes || '');
    setShowEditBuyerModal(true);
  };

  const handleSaveBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) return;

    const campaigns = buyerCampaignTags
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    if (showEditBuyerModal && selectedBuyerToEdit) {
      updateMediaBuyer(selectedBuyerToEdit.id, {
        name: buyerName.trim(),
        email: buyerEmail.trim(),
        phone: buyerPhone.trim(),
        budgetMonthly: Number(buyerBudget),
        targetCpa: Number(buyerTargetCpa),
        teamId: buyerTeamId || undefined,
        trafficPlatform: buyerPlatform,
        status: buyerStatus,
        commissionType: buyerCommissionType,
        commissionRate: Number(buyerCommissionRate),
        activeCampaigns: campaigns,
        notes: buyerNotes.trim()
      });
      setShowEditBuyerModal(false);
      addNotification({
        title: 'Media Buyer Updated',
        message: `${buyerName} profile and commission targets updated.`,
        type: 'success'
      });
    } else {
      addMediaBuyer({
        name: buyerName.trim(),
        email: buyerEmail.trim(),
        phone: buyerPhone.trim(),
        budgetMonthly: Number(buyerBudget),
        blendedCpa: Number(buyerTargetCpa),
        targetCpa: Number(buyerTargetCpa),
        teamId: buyerTeamId || undefined,
        trafficPlatform: buyerPlatform,
        status: buyerStatus,
        commissionType: buyerCommissionType,
        commissionRate: Number(buyerCommissionRate),
        activeCampaigns: campaigns,
        notes: buyerNotes.trim(),
        totalSpendRecorded: 0,
        joinedDate: new Date().toISOString().slice(0, 10)
      });
      setShowAddBuyerModal(false);
      addNotification({
        title: 'Media Buyer Added',
        message: `${buyerName} added to media buying team.`,
        type: 'success'
      });
    }
  };

  // Handlers for Log Spend
  const handleOpenLogSpendModal = (buyerId?: string) => {
    setSpendBuyerId(buyerId || mediaBuyers[0]?.id || '');
    setSpendDate(new Date().toISOString().slice(0, 10));
    setSpendPlatform('Facebook');
    const targetBuyer = mediaBuyers.find(b => b.id === (buyerId || mediaBuyers[0]?.id));
    setSpendCampaign(targetBuyer?.activeCampaigns?.[0] || 'campaign_traffic_scale');
    setSpendProductId(products[0]?.id || '');
    setSpendAmount(35000);
    setSpendImpressions(25000);
    setSpendClicks(650);
    setSpendNotes('');
    setShowLogSpendModal(true);
  };

  const handleSaveSpendLog = (e: React.FormEvent) => {
    e.preventDefault();
    const buyer = mediaBuyers.find(b => b.id === spendBuyerId);
    if (!buyer || spendAmount <= 0) return;

    addMediaBuyerSpendLog({
      mediaBuyerId: buyer.id,
      mediaBuyerName: buyer.name,
      date: spendDate,
      platform: spendPlatform,
      campaignName: spendCampaign.trim() || 'ad_campaign_default',
      productId: spendProductId || undefined,
      amount: Number(spendAmount),
      currency: 'NGN',
      impressions: Number(spendImpressions),
      clicks: Number(spendClicks),
      notes: spendNotes.trim()
    });

    setShowLogSpendModal(false);
    addNotification({
      title: 'Ad Spend Logged',
      message: `Recorded ${formatCurrency(spendAmount, 'NGN')} spend for ${buyer.name}.`,
      type: 'success'
    });
  };

  // Handlers for Link Generator
  const handleOpenLinkModal = (buyer: MediaBuyer) => {
    setSelectedBuyerForLink(buyer);
    setLinkProductId(products[0]?.id || 'prod-1');
    setLinkSource(buyer.trafficPlatform?.toLowerCase().includes('tiktok') ? 'tiktok' : 'facebook');
    setLinkCampaign(buyer.activeCampaigns?.[0] || 'campaign_lead_q3');
    setLinkMedium('cpc');
    setShowLinkGenModal(true);
  };

  const generatedTrackingUrl = useMemo(() => {
    if (!selectedBuyerForLink) return '';
    return `${window.location.origin}/order-form/embed?product=${linkProductId}&buyer=${selectedBuyerForLink.id}&utm_source=${linkSource}&utm_campaign=${linkCampaign}&utm_medium=${linkMedium}&currency=NGN`;
  }, [selectedBuyerForLink, linkProductId, linkSource, linkCampaign, linkMedium]);

  const handleCopyLink = () => {
    if (!generatedTrackingUrl) return;
    navigator.clipboard.writeText(generatedTrackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    addNotification({
      title: 'Campaign Link Copied',
      message: 'Media buyer UTM tracking URL copied to clipboard.',
      type: 'info'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 animate-in fade-in select-none">
      
      {/* 1. BREADCRUMB & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Dashboard</span>
            <span className="text-slate-600">&gt;</span>
            <span>Marketing & AI</span>
            <span className="text-slate-600">&gt;</span>
            <span className="text-white font-medium">Media Buyers</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Megaphone className="w-6 h-6 text-emerald-400" />
              <span>Media Buyers Management</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
              COD Attribution Active
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Track media buyer ad spend, delivered cash-on-delivery orders, blended CPA, ROAS, and calculate performance-based commission payouts.
          </p>
        </div>

        {/* Top Actions: Add Media Buyer & Log Daily Spend */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => handleOpenLogSpendModal()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Log Daily Spend</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Media Buyer</span>
          </button>
        </div>
      </div>

      {/* 2. TOP KPI SUMMARY METRICS (Matching Ordello CRM Performance Dashboard) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Active Buyers */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Media Buyers</span>
            <Megaphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {overallKPIs.activeBuyers} <span className="text-xs text-slate-400 font-normal">/ {overallKPIs.totalBuyers} Active</span>
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            100% Tracking Live
          </p>
        </div>

        {/* KPI 2: Total Ad Spend */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Total Ad Spend</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {formatCurrency(overallKPIs.totalSpend, currency)}
          </div>
          <p className="text-[11px] text-slate-400">
            Across Meta, TikTok & Google
          </p>
        </div>

        {/* KPI 3: Delivered Orders */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Delivered / Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {overallKPIs.totalDelivered} <span className="text-xs text-slate-400 font-normal">/ {overallKPIs.totalOrders}</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold">
            {overallKPIs.overallDeliveryRate}% Delivery Rate
          </p>
        </div>

        {/* KPI 4: Blended Delivered CPA */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Blended CPA</span>
            <Target className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {formatCurrency(overallKPIs.blendedCpa, currency)}
          </div>
          <p className="text-[11px] text-slate-400">
            Per Delivered Customer
          </p>
        </div>

        {/* KPI 5: Delivered Revenue & ROAS */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Revenue & ROAS</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {overallKPIs.overallRoas}x <span className="text-xs text-white font-normal">ROAS</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono truncate">
            {formatCurrency(overallKPIs.totalRevenue, currency)}
          </p>
        </div>

        {/* KPI 6: Commission Payable */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Commission Due</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400 font-mono">
            {formatCurrency(overallKPIs.totalCommission, currency)}
          </div>
          <p className="text-[11px] text-slate-400">
            Pending monthly payout
          </p>
        </div>
      </div>

      {/* 3. SUB-NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-slate-800 gap-4 flex-wrap pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Media Buyers Roster ({filteredBuyers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'campaigns'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Campaign Attribution</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spend_tracker')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'spend_tracker'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Daily Ad Spend Log ({mediaBuyerSpendLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('commissions')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'commissions'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Commission & Payout Ledger</span>
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex items-center gap-2.5 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search buyer, campaign, or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 w-56 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
          </select>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: MEDIA BUYERS ROSTER & PERFORMANCE TABLE */}
      {/* ===================================================================== */}
      {activeTab === 'roster' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                    <th className="p-4">Media Buyer</th>
                    <th className="p-4">Assigned Team</th>
                    <th className="p-4">Traffic Channels</th>
                    <th className="p-4">Monthly Budget</th>
                    <th className="p-4 text-center">Orders (Deliv / Total)</th>
                    <th className="p-4 text-center">Delivery Rate</th>
                    <th className="p-4 text-right">Ad Spend</th>
                    <th className="p-4 text-right">Actual CPA</th>
                    <th className="p-4 text-right">Revenue & ROAS</th>
                    <th className="p-4 text-right">Commission</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredBuyers.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-500">
                        No media buyers matching the criteria. Click &quot;+ Add Media Buyer&quot; to register your first media buyer.
                      </td>
                    </tr>
                  ) : (
                    filteredBuyers.map(buyer => {
                      const isOverCpa = buyer.targetCpa && buyer.costPerDelivered > buyer.targetCpa;

                      return (
                        <tr key={buyer.id} className="hover:bg-slate-800/30 transition">
                          {/* Buyer Name & Contact */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                                {buyer.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white truncate">{buyer.name}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    buyer.status === 'Active' 
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                                  }`}>
                                    {buyer.status || 'Active'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400">{buyer.email}</p>
                                {buyer.phone && (
                                  <p className="text-[10px] text-slate-500 font-mono">{buyer.phone}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Team */}
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium text-[11px]">
                              {buyer.teamName}
                            </span>
                          </td>

                          {/* Traffic Platforms & Campaigns */}
                          <td className="p-4 space-y-1">
                            <span className="font-semibold text-slate-200 block text-[11px]">
                              {buyer.trafficPlatform || 'Facebook & Instagram'}
                            </span>
                            <div className="flex items-center gap-1 flex-wrap">
                              {buyer.activeCampaigns?.slice(0, 2).map(camp => (
                                <span key={camp} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[9px] truncate max-w-[130px]">
                                  {camp}
                                </span>
                              ))}
                              {buyer.activeCampaigns && buyer.activeCampaigns.length > 2 && (
                                <span className="text-[10px] text-slate-500">
                                  +{buyer.activeCampaigns.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Monthly Budget */}
                          <td className="p-4 font-mono font-medium text-slate-300">
                            {formatCurrency(buyer.budgetMonthly || 0, currency)}
                          </td>

                          {/* Orders (Delivered / Total) */}
                          <td className="p-4 text-center">
                            <div className="font-mono">
                              <span className="text-emerald-400 font-bold">{buyer.deliveredCount}</span>
                              <span className="text-slate-500"> / {buyer.totalOrders}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {buyer.dispatchedCount} in transit
                            </span>
                          </td>

                          {/* Delivery Rate */}
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <span className={`font-bold font-mono ${
                                buyer.deliveryRate >= 80 ? 'text-emerald-400' : buyer.deliveryRate >= 65 ? 'text-amber-400' : 'text-rose-400'
                              }`}>
                                {buyer.deliveryRate}%
                              </span>
                            </div>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full mx-auto mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  buyer.deliveryRate >= 80 ? 'bg-emerald-500' : buyer.deliveryRate >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(buyer.deliveryRate, 100)}%` }}
                              />
                            </div>
                          </td>

                          {/* Ad Spend */}
                          <td className="p-4 text-right font-mono font-bold text-white">
                            {formatCurrency(buyer.totalSpend, currency)}
                          </td>

                          {/* CPA */}
                          <td className="p-4 text-right font-mono">
                            <div className="flex items-center justify-end gap-1">
                              <span className={`font-bold ${isOverCpa ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {formatCurrency(buyer.costPerDelivered, currency)}
                              </span>
                            </div>
                            {buyer.targetCpa ? (
                              <span className="text-[10px] text-slate-500 block">
                                Target: {formatCurrency(buyer.targetCpa, currency)}
                              </span>
                            ) : null}
                          </td>

                          {/* Revenue & ROAS */}
                          <td className="p-4 text-right">
                            <div className="font-mono font-bold text-emerald-400">
                              {buyer.roas > 0 ? `${buyer.roas}x` : '—'}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {formatCurrency(buyer.deliveredRevenue, currency)}
                            </span>
                          </td>

                          {/* Commission */}
                          <td className="p-4 text-right font-mono">
                            <span className="text-purple-400 font-bold block">
                              {formatCurrency(buyer.commissionEarned, currency)}
                            </span>
                            <span className="text-[9px] text-slate-500 block">
                              {buyer.commissionType === 'per_delivered_order' 
                                ? `@ ${formatCurrency(buyer.commissionRate || 1500, currency)}/order` 
                                : buyer.commissionType === 'percentage_revenue'
                                ? `${buyer.commissionRate || 5}% of revenue`
                                : 'Fixed Retainer'}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Link Generator */}
                              <button
                                type="button"
                                onClick={() => handleOpenLinkModal(buyer)}
                                title="Generate Campaign Tracking Link"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 hover:border-emerald-500/50 transition cursor-pointer"
                              >
                                <LinkIcon className="w-3.5 h-3.5" />
                              </button>

                              {/* Log Spend */}
                              <button
                                type="button"
                                onClick={() => handleOpenLogSpendModal(buyer.id)}
                                title="Log Daily Ad Spend"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 hover:border-amber-500/50 transition cursor-pointer"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Buyer */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(buyer)}
                                title="Edit Media Buyer Profile"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
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
      )}

      {/* ===================================================================== */}
      {/* TAB 2: CAMPAIGN ATTRIBUTION BREAKDOWN */}
      {/* ===================================================================== */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">UTM Ad Campaigns Attribution</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Orders tracked by UTM campaign tags matching media buyers and ad channels.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buyerMetrics.flatMap(b => (b.activeCampaigns || []).map(camp => {
                const campOrders = orders.filter(o => o.utmCampaign?.toLowerCase() === camp.toLowerCase());
                const delOrders = campOrders.filter(o => o.status === 'DELIVERED');
                const campRev = delOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                const campDelRate = campOrders.length > 0 ? Math.round((delOrders.length / campOrders.length) * 100) : 0;
                
                // Spend for this specific campaign from spend logs
                const campSpends = mediaBuyerSpendLogs.filter(s => s.campaignName.toLowerCase() === camp.toLowerCase());
                const campSpend = campSpends.reduce((sum, s) => sum + s.amount, 0);
                const campCpa = delOrders.length > 0 ? Math.round(campSpend / delOrders.length) : 0;
                const campRoas = campSpend > 0 ? (campRev / campSpend).toFixed(2) : '—';

                return (
                  <div key={camp} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-emerald-400 font-bold text-xs truncate block">{camp}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">By {b.name}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {b.trafficPlatform || 'Meta Ads'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-900 font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Orders</span>
                        <span className="text-white font-bold">{campOrders.length}</span> ({campDelRate}% deliv)
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px]">Delivered Rev</span>
                        <span className="text-emerald-400 font-bold">{formatCurrency(campRev, currency)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Ad Spend</span>
                        <span className="text-white font-bold">{formatCurrency(campSpend, currency)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px]">ROAS / CPA</span>
                        <span className="text-purple-400 font-bold">{campRoas}x</span> • {formatCurrency(campCpa, currency)}
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: DAILY AD SPEND LOG */}
      {/* ===================================================================== */}
      {activeTab === 'spend_tracker' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Daily Ad Spend & Metric Logs</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed spend ledger recorded per media buyer, ad platform, and campaign.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenLogSpendModal()}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Spend</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                    <th className="p-4">Date</th>
                    <th className="p-4">Media Buyer</th>
                    <th className="p-4">Platform</th>
                    <th className="p-4">Campaign Name</th>
                    <th className="p-4 text-right">Spend Amount</th>
                    <th className="p-4 text-right">Impressions / Clicks</th>
                    <th className="p-4 text-right">CPC</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {mediaBuyerSpendLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        No ad spend recorded yet. Click &quot;Record Spend&quot; to log daily campaign budgets.
                      </td>
                    </tr>
                  ) : (
                    mediaBuyerSpendLogs.map(log => {
                      const cpc = log.clicks && log.clicks > 0 ? Math.round(log.amount / log.clicks) : 0;

                      return (
                        <tr key={log.id} className="hover:bg-slate-800/30 transition">
                          <td className="p-4 font-mono text-slate-300">{log.date}</td>
                          <td className="p-4 font-bold text-white">{log.mediaBuyerName}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-200">
                              {log.platform}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-emerald-400 font-medium">{log.campaignName}</td>
                          <td className="p-4 text-right font-mono font-bold text-white">
                            {formatCurrency(log.amount, log.currency || currency)}
                          </td>
                          <td className="p-4 text-right font-mono text-slate-300">
                            {log.impressions?.toLocaleString() || '—'} / {log.clicks?.toLocaleString() || '—'}
                          </td>
                          <td className="p-4 text-right font-mono text-slate-400">
                            {cpc > 0 ? formatCurrency(cpc, currency) : '—'}
                          </td>
                          <td className="p-4 text-slate-400 text-[11px] max-w-xs truncate">{log.notes || '—'}</td>
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => deleteMediaBuyerSpendLog(log.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                              title="Delete spend entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      )}

      {/* ===================================================================== */}
      {/* TAB 4: COMMISSION & PAYOUT LEDGER */}
      {/* ===================================================================== */}
      {activeTab === 'commissions' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">Media Buyer Commission & Payout Ledger</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent commission calculated strictly on delivered orders and verified revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {buyerMetrics.map(buyer => (
              <div key={buyer.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 font-bold flex items-center justify-center text-xs">
                      {buyer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">{buyer.name}</h4>
                      <p className="text-[10px] text-slate-400">{buyer.teamName}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    {buyer.commissionType === 'per_delivered_order' ? 'Per Delivered' : buyer.commissionType === 'percentage_revenue' ? '% of Revenue' : 'Retainer'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Delivered Orders</span>
                    <span className="font-mono font-bold text-emerald-400">{buyer.deliveredCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Delivered Revenue</span>
                    <span className="font-mono text-slate-200">{formatCurrency(buyer.deliveredRevenue, currency)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-900">
                    <span className="text-slate-400 text-[11px]">Commission Rate</span>
                    <span className="font-mono font-semibold text-slate-300">
                      {buyer.commissionType === 'per_delivered_order' 
                        ? `${formatCurrency(buyer.commissionRate || 1500, currency)} / order`
                        : `${buyer.commissionRate || 5}%`}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-slate-400">Total Earned</span>
                  <span className="text-lg font-bold font-mono text-purple-400">
                    {formatCurrency(buyer.commissionEarned, currency)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addNotification({
                      title: 'Payout Processed',
                      message: `Commission of ${formatCurrency(buyer.commissionEarned, currency)} marked as paid for ${buyer.name}.`,
                      type: 'success'
                    });
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  <span>Mark Commission Paid</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: ADD / EDIT MEDIA BUYER */}
      {/* ===================================================================== */}
      {(showAddBuyerModal || showEditBuyerModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">
                {showEditBuyerModal ? 'Edit Media Buyer Profile' : 'Add New Media Buyer'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddBuyerModal(false);
                  setShowEditBuyerModal(false);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBuyer} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kayode Daniels"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="kayode@media.ng"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+234 802..."
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Assigned Sales Team</label>
                  <select
                    value={buyerTeamId}
                    onChange={(e) => setBuyerTeamId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {salesTeams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Status</label>
                  <select
                    value={buyerStatus}
                    onChange={(e) => setBuyerStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Monthly Ad Budget (NGN)</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={buyerBudget}
                    onChange={(e) => setBuyerBudget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target CPA (NGN)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={buyerTargetCpa}
                    onChange={(e) => setBuyerTargetCpa(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Primary Traffic Platforms</label>
                <select
                  value={buyerPlatform}
                  onChange={(e) => setBuyerPlatform(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Facebook & Instagram">Facebook & Instagram (Meta Ads)</option>
                  <option value="TikTok Ads">TikTok Ads (UGC / Spark)</option>
                  <option value="Google Search & YouTube">Google Search & YouTube PPC</option>
                  <option value="Multi-Channel (Meta + TikTok)">Multi-Channel (Meta + TikTok)</option>
                </select>
              </div>

              {/* Commission Structure */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-white block text-[11px]">Commission & Payout Model</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Model Type</label>
                    <select
                      value={buyerCommissionType}
                      onChange={(e) => setBuyerCommissionType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-[11px]"
                    >
                      <option value="per_delivered_order">Per Delivered Order</option>
                      <option value="percentage_revenue">% of Delivered Revenue</option>
                      <option value="fixed_monthly">Fixed Monthly Retainer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {buyerCommissionType === 'per_delivered_order' ? 'Amount (₦/delivered order)' : buyerCommissionType === 'percentage_revenue' ? 'Percentage (%)' : 'Monthly Fee (₦)'}
                    </label>
                    <input
                      type="number"
                      value={buyerCommissionRate}
                      onChange={(e) => setBuyerCommissionRate(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-[11px] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Active Campaign UTM Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. clarifying_glow_sept26, skincare_retargeting_v2"
                  value={buyerCampaignTags}
                  onChange={(e) => setBuyerCampaignTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions, target ROAS constraints, scaling caps..."
                  value={buyerNotes}
                  onChange={(e) => setBuyerNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBuyerModal(false);
                    setShowEditBuyerModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer"
                >
                  {showEditBuyerModal ? 'Save Changes' : 'Create Media Buyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: LOG DAILY AD SPEND */}
      {/* ===================================================================== */}
      {showLogSpendModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Log Daily Ad Spend</h3>
              <button
                type="button"
                onClick={() => setShowLogSpendModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSpendLog} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Media Buyer *</label>
                <select
                  value={spendBuyerId}
                  onChange={(e) => setSpendBuyerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {mediaBuyers.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={spendDate}
                    onChange={(e) => setSpendDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Platform</label>
                  <select
                    value={spendPlatform}
                    onChange={(e) => setSpendPlatform(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Facebook">Facebook (Meta)</option>
                    <option value="TikTok">TikTok Ads</option>
                    <option value="Google">Google Ads</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Snapchat">Snapchat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. clarifying_glow_sept26"
                  value={spendCampaign}
                  onChange={(e) => setSpendCampaign(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">Spend (NGN) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={spendAmount}
                    onChange={(e) => setSpendAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">Impressions</label>
                  <input
                    type="number"
                    min="0"
                    value={spendImpressions}
                    onChange={(e) => setSpendImpressions(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">Clicks</label>
                  <input
                    type="number"
                    min="0"
                    value={spendClicks}
                    onChange={(e) => setSpendClicks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Scaled winning video creative C2"
                  value={spendNotes}
                  onChange={(e) => setSpendNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogSpendModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer"
                >
                  Save Spend Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: CAMPAIGN ATTRIBUTION LINK GENERATOR */}
      {/* ===================================================================== */}
      {showLinkGenModal && selectedBuyerForLink && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-sm">Campaign Tracking Link Generator</h3>
                <p className="text-[11px] text-slate-400">Assigned Buyer: {selectedBuyerForLink.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkGenModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Product</label>
                <select
                  value={linkProductId}
                  onChange={(e) => setLinkProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">UTM Source</label>
                  <select
                    value={linkSource}
                    onChange={(e) => setLinkSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="facebook">Facebook Ads</option>
                    <option value="tiktok">TikTok Ads</option>
                    <option value="instagram">Instagram Ads</option>
                    <option value="google">Google PPC</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">UTM Campaign</label>
                  <input
                    type="text"
                    value={linkCampaign}
                    onChange={(e) => setLinkCampaign(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <span className="font-semibold text-emerald-400 block text-[11px]">Direct Order Form Embed URL:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedTrackingUrl}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-[10px] text-emerald-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Paste this link into your Facebook/TikTok Ad manager destination URL. Every customer checkout will automatically credit <strong>{selectedBuyerForLink.name}</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowLinkGenModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
