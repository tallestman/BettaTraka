import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency } from '../../utils/formatters';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Bot, 
  Truck, 
  PhoneCall, 
  RotateCcw, 
  BarChart3, 
  Smartphone, 
  Lock, 
  DollarSign, 
  ShoppingBag, 
  Zap, 
  Users,
  ChevronRight,
  X
} from 'lucide-react';

export const MarketingSite: React.FC = () => {
  const { setPersona, setAdminActiveTab, settings, updateSettings } = useCrm();

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly' | 'biannual' | 'yearly'>('monthly');
  const [activeWalkthrough, setActiveWalkthrough] = useState<string>('profit');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

  // Auth form
  const [fullName, setFullName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Discount multipliers
  const discountMultiplier = billingPeriod === 'quarterly' ? 0.95 : billingPeriod === 'biannual' ? 0.90 : billingPeriod === 'yearly' ? 0.833 : 1.0;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    updateSettings({ name: fullName ? `${fullName}'s Store` : 'Apex E-Commerce Ltd' });
    setShowAuthModal(false);
    setPersona('admin');
    setAdminActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="space-y-4 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Built Specifically for Nigerian Payment-on-Delivery (POD) Merchants
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Every naira tracked. <br />
            <span className="text-emerald-400">Every process automated.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Replace WhatsApp chaos and fragile Excel sheets. Manage orders, sales reps, delivery riders, inventory, expenses, and net profit in one high-velocity operating system.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-xl shadow-emerald-900/30 transition flex items-center justify-center gap-2"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setPersona('admin');
                setAdminActiveTab('dashboard');
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 font-semibold text-sm text-slate-200 transition"
            >
              Explore Live Interactive Demo
            </button>
          </div>

          <p className="text-xs text-slate-500 font-mono pt-1">
            No credit card required · Instant PWA setup on your phone
          </p>
        </div>

        {/* Live Animated Stat Cards */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto relative z-10">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur">
            <p className="text-2xl lg:text-3xl font-bold font-mono text-emerald-400">₦17.4M+</p>
            <p className="text-xs text-slate-400 mt-1">Doorstep Revenue Tracked</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur">
            <p className="text-2xl lg:text-3xl font-bold font-mono text-white">94.2%</p>
            <p className="text-xs text-slate-400 mt-1">Average Delivery Rate</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur">
            <p className="text-2xl lg:text-3xl font-bold font-mono text-cyan-400">120+</p>
            <p className="text-xs text-slate-400 mt-1">Couriers & Riders Supported</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur">
            <p className="text-2xl lg:text-3xl font-bold font-mono text-white">99.98%</p>
            <p className="text-xs text-slate-400 mt-1">System Uptime Reliability</p>
          </div>
        </div>
      </section>

      {/* "Works With" Logos Bar */}
      <section className="border-y border-slate-800/80 bg-slate-900/40 py-6 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <p className="text-[11px] uppercase font-mono tracking-wider text-slate-500">
            Works effortlessly with your existing African e-commerce stack:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-400">
            <span className="hover:text-white transition">WordPress / Elementor</span>
            <span className="hover:text-white transition">WhatsApp Business API</span>
            <span className="hover:text-white transition">WooCommerce</span>
            <span className="hover:text-white transition">Shopify</span>
            <span className="hover:text-white transition">Meta Conversions (CAPI)</span>
            <span className="hover:text-white transition">TikTok Ads</span>
            <span className="hover:text-white transition">Google Sheets</span>
          </div>
        </div>
      </section>

      {/* 8 Core Feature Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered For The Realities Of African POD
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Built from scratch to overcome non-picking calls, rogue dispatch riders, and lost inventory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Weighted Round-Robin</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Distribute leads automatically with custom weights (1×, 2× turns). Returning customers route automatically to their previous rep.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Delivery Agent Control</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track stock held by riders in Lagos, Abuja, Kano, and Port Harcourt. Instant defective and missing stock reconciliation.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Abandoned Cart Recovery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Capture partial leads when shoppers type their phone number. Dedicated recovery pool ensures reps close dropped orders fast.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3 relative overflow-hidden">
            <span className="absolute top-3 right-3 text-[10px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-800 px-1.5 py-0.5 rounded">
              COMING SOON
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">AI Voice Calling</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated Vapi voice phone calls that dial customers, verify delivery addresses, and flag readiness without human labor.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Real Profit Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Know your true bottom line: Delivered Revenue − Landed COGS − Facebook Ads − Rider Allowances = Net Realized Profit.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Payroll & Commissions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculate fixed salaries, per-delivery rep commissions, and automated ₦50,000 top converter winner bonuses in one click.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Installable Mobile PWA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero App Store friction. Works like a native iOS and Android app with real-time push notifications for sales reps and admins.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Customer Blacklisting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatically flag and block serial fake buyers who refuse deliveries to safeguard your marketing ad spend.
            </p>
          </div>
        </div>
      </section>

      {/* System Walkthrough Interactive Section */}
      <section className="py-16 px-4 bg-slate-900/30 border-y border-slate-800">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Interactive System Walkthrough</h2>
            <p className="text-xs text-slate-400">See how BettaTraka structures your day-to-day operations.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            {[
              { id: 'profit', label: 'Profit Clarity' },
              { id: 'orders', label: 'Order Control' },
              { id: 'deliveries', label: 'Delivery Agents' },
              { id: 'rep', label: 'Sales Rep Dashboard' },
              { id: 'inv', label: 'Inventory Manager' },
              { id: 'pwa', label: 'Push Notifications' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveWalkthrough(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeWalkthrough === tab.id
                    ? 'bg-emerald-600 text-white font-semibold shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Preview Container */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 lg:p-8 space-y-4 shadow-2xl max-w-4xl mx-auto text-xs">
            {activeWalkthrough === 'profit' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Real-Time Net Profit Engine</h3>
                <p className="text-slate-300 leading-relaxed">
                  Never guess your margins again. BettaTraka deducts landed clearing costs, rider allowances, and ad spend automatically.
                </p>
                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-center">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Delivered Revenue</span>
                    <span className="text-white font-bold text-base">₦17,450,000</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">COGS + Expenses</span>
                    <span className="text-red-400 font-bold text-base">−₦9,210,000</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">True Net Profit</span>
                    <span className="text-emerald-400 font-bold text-base">₦8,240,000</span>
                  </div>
                </div>
              </div>
            )}

            {activeWalkthrough === 'orders' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Full Order Lifecycle Tracking</h3>
                <p className="text-slate-300 leading-relaxed">
                  Track every order from initial form submit to WhatsApp confirmation, dispatch, and doorstep cash remittance.
                </p>
                <div className="p-3 rounded-lg bg-slate-900 font-mono text-emerald-400 flex items-center justify-between">
                  <span>NEW ➔ CONFIRMED ➔ DISPATCHED ➔ DELIVERED</span>
                  <span className="text-slate-400 text-xs">1.2 days avg</span>
                </div>
              </div>
            )}

            {activeWalkthrough === 'deliveries' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Courier & Hub Reconciliation</h3>
                <p className="text-slate-300 leading-relaxed">
                  Audit rider inventory stock across Mainland, Island, Abuja, and Port Harcourt. Flag defective or missing units instantly.
                </p>
              </div>
            )}

            {activeWalkthrough === 'rep' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Dedicated Sales Rep View</h3>
                <p className="text-slate-300 leading-relaxed">
                  Sales reps get their own isolated portal with WhatsApp-ready customer links, follow-up queues, and live commission earnings.
                </p>
              </div>
            )}

            {activeWalkthrough === 'inv' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Inventory Manager Portal</h3>
                <p className="text-slate-300 leading-relaxed">
                  Warehouse staff view stock reorder advisories and waybill movements without seeing financial revenue details.
                </p>
              </div>
            )}

            {activeWalkthrough === 'pwa' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Instant Push Notifications</h3>
                <p className="text-slate-300 leading-relaxed">
                  Sales reps get immediate notification ping the moment a new order form or abandoned cart is submitted.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Case Study Testimonial */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="p-8 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 space-y-4 text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Merchant Case Study
          </span>
          <h3 className="text-2xl lg:text-3xl font-bold text-white">
            "We tracked ₦17M in delivered cash-on-delivery orders in our first 90 days on BettaTraka."
          </h3>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
            "Before BettaTraka, our sales reps and dispatch riders kept losing orders in WhatsApp chats and Excel spreadsheets. With automated round-robin and agent reconciliation, our fulfillment jumped from 68% to 94%."
          </p>
          <div className="pt-2">
            <p className="font-bold text-white text-sm">Chioma & Kenneth</p>
            <p className="text-xs text-slate-400">Co-Founders, Bella Organics Skincare (Lagos & Abuja)</p>
          </div>
        </div>
      </section>

      {/* 4 Pricing Tiers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Transparent Pricing For Growing POD Businesses
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Choose your plan. Ad tracking is always 100% free forever.
          </p>

          {/* Billing Cycle Selector */}
          <div className="flex items-center justify-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs w-fit mx-auto mt-4">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                billingPeriod === 'monthly' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('quarterly')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                billingPeriod === 'quarterly' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Quarterly (−5%)
            </button>
            <button
              onClick={() => setBillingPeriod('biannual')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                billingPeriod === 'biannual' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Biannual (−10%)
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                billingPeriod === 'yearly' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly (2 Months Free)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Starter */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">Starter</h3>
                <p className="text-xs text-slate-400 mt-1">For new POD businesses starting out</p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-3xl font-extrabold text-white">
                  ₦{Math.round(8000 * discountMultiplier).toLocaleString()}
                </span>
                <span className="text-slate-400 text-xs">/month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 3 Staff Members</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 3 Products</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 300 Orders / Month</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1 Admin Account</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Round-Robin & Abandoned Carts</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Agent Inventory & P&L</li>
              </ul>
            </div>

            <button
              onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
              className="w-full py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition mt-4"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Growth */}
          <div className="rounded-2xl border border-emerald-500/60 bg-emerald-950/15 p-6 space-y-5 flex flex-col justify-between relative shadow-xl shadow-emerald-950/20">
            <span className="absolute -top-3 right-6 bg-emerald-600 text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              MOST POPULAR
            </span>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">Growth</h3>
                <p className="text-xs text-slate-400 mt-1">For scaling brands doing daily dispatches</p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-3xl font-extrabold text-emerald-400">
                  ₦{Math.round(15000 * discountMultiplier).toLocaleString()}
                </span>
                <span className="text-slate-400 text-xs">/month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2 font-semibold text-white"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 10 Staff Members</li>
                <li className="flex items-center gap-2 font-semibold text-white"><Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited Products & Orders</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> AI Order Confirmation Calling</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Payroll & Commission Engine</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> WooCommerce & Shopify Webhooks</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Multi-Currency Landed Pricing</li>
              </ul>
            </div>

            <button
              onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-md mt-4"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Business */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">Business</h3>
                <p className="text-xs text-slate-400 mt-1">For large volume operations & teams</p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-3xl font-extrabold text-white">
                  ₦{Math.round(25000 * discountMultiplier).toLocaleString()}
                </span>
                <span className="text-slate-400 text-xs">/month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 25 Staff Members</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Multi-Admin Access Controls</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Priority WhatsApp & Call Support</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Dedicated Onboarding Concierge</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Advanced Media Buyer Tracking</li>
              </ul>
            </div>

            <button
              onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
              className="w-full py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition mt-4"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Enterprise */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">Enterprise</h3>
                <p className="text-xs text-slate-400 mt-1">Done-for-you migration & custom retainers</p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-3xl font-extrabold text-white">
                  ₦50,000+
                </span>
                <span className="text-slate-400 text-xs">/month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Done-For-You Database Setup</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Custom Logistics Integrations</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Staff Hands-on Training Workshops</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Enterprise Retainers from ₦500k</li>
              </ul>
            </div>

            <button
              onClick={() => alert("Please contact founder Emmanuel Oamen on WhatsApp for Enterprise Setup.")}
              className="w-full py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition mt-4"
            >
              Contact Founder
            </button>
          </div>
        </div>
      </section>

      {/* PWA Install Instructions Per Platform */}
      <section className="py-16 px-4 bg-slate-900/30 border-t border-slate-800">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <h3 className="text-xl font-bold text-white">How To Install BettaTraka PWA On Your Device</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-left">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-1">
              <p className="font-semibold text-white">iOS (iPhone/iPad)</p>
              <p className="text-slate-400 leading-relaxed">
                Open Safari, tap the <strong>Share</strong> button, scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-1">
              <p className="font-semibold text-white">Android</p>
              <p className="text-slate-400 leading-relaxed">
                Open Chrome, tap the 3-dot menu and select <strong>Install App</strong> or <strong>Add to Home Screen</strong>.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-1">
              <p className="font-semibold text-white">macOS</p>
              <p className="text-slate-400 leading-relaxed">
                In Safari or Chrome, click <strong>File ➔ Add to Dock</strong> or the address bar install icon.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-1">
              <p className="font-semibold text-white">Windows</p>
              <p className="text-slate-400 leading-relaxed">
                In Chrome or Edge, click the <strong>Install BettaTraka</strong> prompt in the top URL bar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 px-4 text-xs text-slate-500 text-center space-y-2">
        <p className="text-slate-400 font-semibold">BettaTraka CRM — Built with pride for African Payment-on-Delivery merchants.</p>
        <p>© 2026 BettaTraka Technologies Ltd. All rights reserved.</p>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {authMode === 'signup' ? 'Create Your Workspace' : 'Sign In to BettaTraka'}
              </h3>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
              {authMode === 'signup' && (
                <div>
                  <label className="text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emmanuel Oamen"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              {authMode === 'signup' && (
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span>I accept terms of service & 14-day free trial</span>
                </label>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs transition shadow-md mt-2"
              >
                {authMode === 'signup' ? 'Create Free Workspace (14 Days)' : 'Sign In'}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-400">
              {authMode === 'signup' ? (
                <span>Already have an account? <button onClick={() => setAuthMode('login')} className="text-emerald-400 font-medium">Log in</button></span>
              ) : (
                <span>New to BettaTraka? <button onClick={() => setAuthMode('signup')} className="text-emerald-400 font-medium">Sign up</button></span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
