import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { CurrencyCode } from '../../types/crm';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  BookOpen, 
  Tag, 
  ArrowLeft, 
  Copy, 
  Check, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  X
} from 'lucide-react';

export const AdTrackingView: React.FC = () => {
  const { orders, currency, addNotification } = useCrm();

  // Mode: 'tracker' (default dashboard) or 'guide' (the full step-by-step documentation)
  const [currentMode, setCurrentMode] = useState<'tracker' | 'guide'>('tracker');

  // Copy states for guide code snippets
  const [copiedMeta, setCopiedMeta] = useState(false);
  const [copiedTiktok, setCopiedTiktok] = useState(false);

  // Tracker dashboard states
  const [toggleView, setToggleView] = useState<'campaigns' | 'creatives' | 'sources'>('campaigns');
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string | null>(null);

  // Orders that carry UTM attribution tags
  const trackedOrders = useMemo(() => {
    return orders.filter(o => Boolean(o.utmSource || o.utmCampaign || o.utmCreative));
  }, [orders]);

  const deliveredTrackedOrders = useMemo(() => {
    return trackedOrders.filter(o => o.status === 'DELIVERED');
  }, [trackedOrders]);

  const trackedRevenueNgn = useMemo(() => {
    return deliveredTrackedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [deliveredTrackedOrders]);

  const trackedConvRate = trackedOrders.length > 0 
    ? Math.round((deliveredTrackedOrders.length / trackedOrders.length) * 100) 
    : 0;

  // Campaigns aggregation
  const campaignsList = useMemo(() => {
    const map = new Map<string, { name: string; orders: number; delivered: number; revenue: number }>();
    trackedOrders.forEach(o => {
      const campName = o.utmCampaign || 'Uncategorized Campaign';
      const cur = map.get(campName) || { name: campName, orders: 0, delivered: 0, revenue: 0 };
      cur.orders += 1;
      if (o.status === 'DELIVERED') {
        cur.delivered += 1;
        cur.revenue += o.totalAmount;
      }
      map.set(campName, cur);
    });

    return Array.from(map.values()).map(c => ({
      ...c,
      convRate: c.orders > 0 ? Math.round((c.delivered / c.orders) * 100) : 0,
      isLowData: c.orders < 5
    })).sort((a, b) => b.orders - a.orders);
  }, [trackedOrders]);

  // Creatives aggregation
  const creativesList = useMemo(() => {
    const map = new Map<string, { name: string; orders: number; delivered: number; revenue: number }>();
    trackedOrders.forEach(o => {
      const creativeName = o.utmCreative || 'Default Video Creative';
      const cur = map.get(creativeName) || { name: creativeName, orders: 0, delivered: 0, revenue: 0 };
      cur.orders += 1;
      if (o.status === 'DELIVERED') {
        cur.delivered += 1;
        cur.revenue += o.totalAmount;
      }
      map.set(creativeName, cur);
    });

    return Array.from(map.values()).map(c => ({
      ...c,
      convRate: c.orders > 0 ? Math.round((c.delivered / c.orders) * 100) : 0,
      isLowData: c.orders < 5
    })).sort((a, b) => b.orders - a.orders);
  }, [trackedOrders]);

  // Sources aggregation
  const sourcesList = useMemo(() => {
    const map = new Map<string, { name: string; orders: number; delivered: number; revenue: number }>();
    trackedOrders.forEach(o => {
      const srcName = o.utmSource || o.source || 'Direct Meta';
      const cur = map.get(srcName) || { name: srcName, orders: 0, delivered: 0, revenue: 0 };
      cur.orders += 1;
      if (o.status === 'DELIVERED') {
        cur.delivered += 1;
        cur.revenue += o.totalAmount;
      }
      map.set(srcName, cur);
    });

    return Array.from(map.values()).map(c => ({
      ...c,
      convRate: c.orders > 0 ? Math.round((c.delivered / c.orders) * 100) : 0,
      isLowData: c.orders < 5
    })).sort((a, b) => b.orders - a.orders);
  }, [trackedOrders]);

  // Copy to clipboard helper
  const handleCopy = (text: string, type: 'meta' | 'tiktok') => {
    navigator.clipboard.writeText(text);
    if (type === 'meta') {
      setCopiedMeta(true);
      setTimeout(() => setCopiedMeta(false), 2500);
    } else {
      setCopiedTiktok(true);
      setTimeout(() => setCopiedTiktok(false), 2500);
    }
    if (addNotification) {
      addNotification({
        title: 'Copied to Clipboard',
        message: 'UTM Tracking template copied successfully.',
        type: 'success'
      });
    }
  };

  // =========================================================
  // VIEW 2: GUIDE VIEW ("How to Use the Ad Tracker")
  // Matching screenshots adt2.png, adt3.png, adt4.png, adt5.png
  // =========================================================
  if (currentMode === 'guide') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto text-slate-100 animate-in fade-in select-none">
        {/* Breadcrumb (adt2.png) */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => setCurrentMode('tracker')}
            className="hover:text-white transition cursor-pointer"
          >
            Ad Tracking
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-white font-medium">How to Use the Ad Tracker</span>
        </div>

        {/* Title & Subtitle (adt2.png) */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            How to Use the Ad Tracker
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            Connect every paid ad you run to the orders it produces — so you can see exactly which campaigns and creatives are working.
          </p>
        </div>

        {/* Section 1: Why use it (adt2.png) */}
        <div className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-white">
            1. Why use it
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Without tracking, every order looks the same — someone showed up and bought. With it, you can answer: <em className="text-white font-semibold not-italic">which</em> Facebook ad set is producing the most orders, <em className="text-white font-semibold not-italic">what</em> conversion rate each video creative has, and <em className="text-white font-semibold not-italic">which</em> campaigns have the highest delivered-vs-cancelled rate. The difference between guessing and knowing.
          </p>
        </div>

        {/* Section 2: Set it up in Meta Ads Manager (adt2.png) */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-bold text-white">
            2. Set it up in Meta Ads Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            This is a one-time paste per ad. Meta fills in the campaign and ad names automatically at click time, so you never have to type them yourself or keep a spreadsheet of which ad is which.
          </p>

          <div className="space-y-2 text-xs sm:text-sm text-slate-300">
            <p>1. Open your ad in Ads Manager and click <strong className="text-white font-semibold">Edit</strong>. Make sure you&apos;re on the <strong className="text-white font-semibold">ad</strong> level — not the campaign or ad set.</p>
            <p>2. Scroll to <strong className="text-white font-semibold">Tracking</strong> at the very bottom, and find the <strong className="text-white font-semibold">URL parameters</strong> field.</p>
            <p>3. Paste this in:</p>
          </div>

          {/* Code Box with Copy Button (adt2.png) */}
          <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs overflow-x-auto text-slate-300">
            <div className="pr-12">
              utm_source=fb&utm_medium=paid&utm_campaign=<span className="text-sky-400">{'{{campaign.name}}'}</span>&utm_content=<span className="text-sky-400">{'{{ad.name}}'}</span>&utm_term=<span className="text-sky-400">{'{{ad.id}}'}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('utm_source=fb&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{ad.id}}', 'meta')}
              className="absolute right-3 top-3 p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-slate-300 hover:text-white transition cursor-pointer"
              title="Copy Meta Parameters"
            >
              {copiedMeta ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Warning Box (adt2.png) */}
          <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-amber-200">
                Paste the parameters only — no question mark.
              </p>
              <p className="text-slate-400 leading-relaxed">
                The URL parameters field takes just the tracking part. Meta joins it onto your destination URL for you, with the right ? or &amp;. Adding your own will break the link.
              </p>
            </div>
          </div>

          {/* Tip Box (adt2.png) */}
          <div className="rounded-xl border border-sky-900/60 bg-sky-950/20 p-4 flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sky-200">
                Name your ads properly in Meta
              </p>
              <p className="text-slate-400 leading-relaxed">
                Whatever the ad is called in Ads Manager is what shows up on your dashboard. So Ramadan — UGC Hook A is worth the extra ten seconds; Ad copy 3 — Copy is not.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: What each parameter means (adt3.png) */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-bold text-white">
            3. What each parameter means
          </h2>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 divide-y divide-neutral-800 overflow-hidden shadow-sm">
            <div className="p-4 space-y-1 text-xs">
              <p className="font-mono font-bold text-white">utm_source</p>
              <p className="text-slate-400">
                Where the ad ran. Keep this as fb for Meta ads (it covers Instagram placements too). For other platforms use tiktok, google, whatsapp.
              </p>
            </div>

            <div className="p-4 space-y-1 text-xs">
              <p className="font-mono font-bold text-white">utm_medium</p>
              <p className="text-slate-400">
                The traffic type. paid for ads you&apos;re paying for, organic for posts you&apos;re not.
              </p>
            </div>

            <div className="p-4 space-y-1 text-xs">
              <p className="font-mono font-bold text-white">
                utm_campaign = <span className="text-sky-400">{'{{campaign.name}}'}</span>
              </p>
              <p className="text-slate-400">
                Meta swaps this for your campaign&apos;s real name at click time. Shows up under Campaigns on the dashboard.
              </p>
            </div>

            <div className="p-4 space-y-1 text-xs">
              <p className="font-mono font-bold text-white">
                utm_content = <span className="text-sky-400">{'{{ad.name}}'}</span>
              </p>
              <p className="text-slate-400">
                The individual ad&apos;s real name — your creative. This is the one that used to come through as a long number. Shows up under Creatives.
              </p>
            </div>

            <div className="p-4 space-y-1 text-xs">
              <p className="font-mono font-bold text-white">
                utm_term = <span className="text-sky-400">{'{{ad.id}}'}</span>
              </p>
              <p className="text-slate-400">
                Meta&apos;s permanent ID for the ad. You never look at it, but it&apos;s what keeps a creative&apos;s history together: rename an ad in Ads Manager and the dashboard follows the new name instead of splitting it into two rows.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: TikTok, Google and plain links (adt3.png & adt4.png) */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-bold text-white">
            4. TikTok, Google and plain links
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Other platforms have their own dynamic tokens, and some places (a WhatsApp broadcast, an influencer&apos;s bio link) have none at all. There you tag the full URL yourself, typing the names in by hand:
          </p>

          <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs overflow-x-auto text-slate-300">
            <div className="pr-12">
              https://bettatrakacrm.vercel.app/order-form/cmuih7e3d000agm0a7ba28e5k<span className="text-sky-400">?utm_source=tiktok&utm_medium=paid&utm_campaign=ramadan_2026&utm_content=ugc_hook_a</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('https://bettatrakacrm.vercel.app/order-form/cmuih7e3d000agm0a7ba28e5k?utm_source=tiktok&utm_medium=paid&utm_campaign=ramadan_2026&utm_content=ugc_hook_a', 'tiktok')}
              className="absolute right-3 top-3 p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-slate-300 hover:text-white transition cursor-pointer"
              title="Copy TikTok Link"
            >
              {copiedTiktok ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs text-slate-400">
            That&apos;s your live order-form link for <strong className="text-white">Celebrity Glow</strong>. Links for your other products are in the embed builder.
          </p>

          <p className="text-xs text-slate-400">
            <strong className="text-slate-200">When you type values by hand, use lowercase and underscores</strong>, and keep them consistent — ramadan_2026 and Ramadan 2026 show up as two separate campaigns.
          </p>
        </div>

        {/* Section 5: Reading the dashboard (adt4.png) */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-bold text-white">
            5. Reading the dashboard
          </h2>

          <ul className="space-y-3 text-xs sm:text-sm text-slate-300 list-disc pl-5 leading-relaxed">
            <li>
              <strong className="text-white">Pick your window first.</strong> The dashboard shows the last 30 days by default. Switch to 7 days while a new creative is being tested, or All time to compare across seasons.
            </li>
            <li>
              <strong className="text-white">The four tiles</strong> are tracked orders, how many were delivered, the revenue those delivered orders brought in, and your conversion rate.
            </li>
            <li>
              <strong className="text-white">Campaigns, Creatives and Sources</strong> are three views of the same orders. Sort each by orders, revenue or conversion rate to find what&apos;s actually carrying the account.
            </li>
            <li>
              <strong className="text-white">Conversion rate is the one to watch.</strong> A creative with 40 orders at 30% delivered is burning money next to one with 25 orders at 70% — same ad spend, very different outcome.
            </li>
            <li>
              <strong className="text-white">&quot;Low data&quot; means don&apos;t trust it yet.</strong> Rates from fewer than five orders are greyed out, because one delivered order out of one isn&apos;t a 100% conversion rate.
            </li>
            <li>
              <strong className="text-white">Renamed an ad?</strong> The row follows the new name and notes what it used to be called, so you don&apos;t lose its history.
            </li>
            <li>
              <strong className="text-white">Click &quot;View orders&quot;</strong> on any row to see just that campaign or creative&apos;s orders in the table below.
            </li>
          </ul>
        </div>

        {/* Section 6: If you see long number IDs (adt4.png & adt5.png) */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-bold text-white">
            6. If you see long number IDs
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Older setups used {'{{ad.id}}'} in utm_content, which is why some rows look like this:
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs text-slate-400">
            120203847562730492
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Switching to the template in step 2 fixes this for every new click. Orders already recorded keep their IDs, so for those, click the row name on the dashboard and type a friendly name — the mapping sticks and applies everywhere that ID appears.
          </p>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Need to work out which ad an old ID belongs to? In Ads Manager, open <strong className="text-white">Columns → Customise Columns</strong>, then the <strong className="text-white">Settings</strong> section on the left — the ID tick-boxes are filed there, not with the performance metrics, which is where most people go looking. Ticking them only changes your own table view; it doesn&apos;t touch how the ads run.
          </p>
        </div>

        {/* Section 7: Quick checklist (adt5.png) */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-bold text-white">
            7. Quick checklist
          </h2>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 list-disc pl-5 leading-relaxed">
            <li>Template pasted into URL parameters, at the ad level, before launching</li>
            <li>Ads named in Meta the way you want to read them here</li>
            <li>No ? at the start of the template</li>
            <li>Order placed through the live link once, to confirm it lands on the dashboard</li>
            <li>Checked back 24–48 hours after launch for initial conversion</li>
          </ul>
        </div>

        {/* Back Button (adt5.png) */}
        <div className="pt-6 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => setCurrentMode('tracker')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-white transition cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Ad Tracking</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // VIEW 1: MAIN AD TRACKING VIEW
  // Matching screenshot adt1.png (and dashboard view when orders are tracked)
  // =========================================================
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 animate-in fade-in select-none">
      {/* Title & Subtitle (adt1.png) */}
      <div className="pb-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-400">
          Ad Tracking
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          See which ads actually bring in orders
        </p>
      </div>

      {/* Top Guide Banner (Exact match to Screenshot adt1.png) */}
      <div className="rounded-2xl border border-sky-900/40 bg-sky-950/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400 flex-shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white">
              New to ad tracking?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Learn how to tag your ad links so every order gets attributed to the right campaign and creative.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentMode('guide')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer active:scale-95 whitespace-nowrap"
        >
          Read the guide
        </button>
      </div>

      {/* Main Content:
          If trackedOrders.length === 0, render the exact empty state from adt1.png!
          If there ARE tracked orders, render the analytics dashboard + table!
      */}
      {trackedOrders.length === 0 ? (
        /* Empty State (Exact match to Screenshot adt1.png) */
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/40 p-12 sm:p-16 text-center flex flex-col items-center justify-center min-h-[340px] shadow-sm">
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
            <Tag className="w-5 h-5 rotate-45" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mb-1.5">
            No tracked orders yet
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
            Orders show up here once customers arrive through a link carrying UTM tags. It takes about two minutes to set up.
          </p>
          <button
            type="button"
            onClick={() => setCurrentMode('guide')}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm shadow transition cursor-pointer active:scale-95"
          >
            Show me how
          </button>
        </div>
      ) : (
        /* Active Dashboard with 4 KPI Tiles & Attribution Views */
        <div className="space-y-6">
          {/* 4 Stats Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-1 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Tracked Orders
              </span>
              <p className="text-3xl font-bold font-mono text-white tabular-nums">
                {trackedOrders.length}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-1 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Delivered
              </span>
              <p className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                {deliveredTrackedOrders.length}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-1 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Attributed Revenue
              </span>
              <p className="text-3xl font-bold font-mono text-white tabular-nums truncate">
                {formatCurrency(convertAmount(trackedRevenueNgn, currency), currency)}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-1 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Conversion Rate
              </span>
              <p className="text-3xl font-bold font-mono text-sky-400 tabular-nums">
                {trackedConvRate}%
              </p>
            </div>
          </div>

          {/* Toggle Views: Campaigns | Creatives | Sources */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center bg-black/80 p-0.5 rounded-xl border border-neutral-800">
              {(
                [
                  { key: 'campaigns', label: 'Campaigns' },
                  { key: 'creatives', label: 'Creatives' },
                  { key: 'sources', label: 'Sources' }
                ] as const
              ).map((tab) => {
                const isActive = toggleView === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setToggleView(tab.key);
                      setSelectedCampaignFilter(null);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-white text-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Performance Table */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/60 text-slate-300 font-semibold text-xs">
                    <th className="py-3.5 px-4">
                      {toggleView === 'campaigns' ? 'Campaign Name' : toggleView === 'creatives' ? 'Creative Name' : 'Traffic Source'}
                    </th>
                    <th className="py-3.5 px-4 text-center">Orders</th>
                    <th className="py-3.5 px-4 text-center">Delivered</th>
                    <th className="py-3.5 px-4 text-center">Conversion Rate</th>
                    <th className="py-3.5 px-4 text-right">Revenue</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {(toggleView === 'campaigns' ? campaignsList : toggleView === 'creatives' ? creativesList : sourcesList).map((item) => (
                    <tr key={item.name} className="hover:bg-neutral-900/40 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-white">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {item.orders}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                        {item.delivered}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          item.isLowData
                            ? 'bg-neutral-900 text-slate-500'
                            : item.convRate >= 70
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        }`}>
                          {item.convRate}% {item.isLowData && '(Low data)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums">
                        {formatCurrency(convertAmount(item.revenue, currency), currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCampaignFilter(selectedCampaignFilter === item.name ? null : item.name)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-sky-400 hover:text-sky-300 text-[11px] font-semibold transition cursor-pointer"
                        >
                          {selectedCampaignFilter === item.name ? 'Hide Orders' : 'View Orders'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders Filtered by Campaign / Creative if clicked */}
          {selectedCampaignFilter && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Attributed Orders for: <strong className="text-sky-400 font-mono">{selectedCampaignFilter}</strong></span>
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedCampaignFilter(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-[11px] font-mono text-slate-400">
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono">
                    {trackedOrders
                      .filter(o => o.utmCampaign === selectedCampaignFilter || o.utmCreative === selectedCampaignFilter || o.utmSource === selectedCampaignFilter)
                      .map(o => (
                        <tr key={o.id}>
                          <td className="py-2.5 px-3 text-white font-bold">{o.orderNumber}</td>
                          <td className="py-2.5 px-3 text-slate-300">{o.customerName} ({o.customerPhone})</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.status === 'DELIVERED' ? 'text-emerald-400 bg-emerald-950/60' :
                              o.status === 'CANCELLED' ? 'text-rose-400 bg-rose-950/60' : 'text-amber-400 bg-amber-950/60'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-white font-bold">
                            {formatCurrency(convertAmount(o.totalAmount, currency), currency)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
