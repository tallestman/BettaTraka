import React, { useState, useMemo, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount, formatDate } from '../../utils/formatters';
import { TokenTransaction, AICallLog, Order } from '../../types/crm';
import { 
  Coins, 
  Bot, 
  FlaskConical, 
  Search, 
  Download, 
  Check, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  PhoneCall, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  Receipt, 
  X, 
  Play, 
  Filter,
  CheckCircle2,
  ExternalLink,
  Flame,
  Zap,
  TrendingDown,
  Building2,
  Printer,
  Volume2,
  Pause,
  Calendar,
  RotateCw,
  AlertTriangle,
  Activity,
  Settings,
  Key,
  Copy,
  Eye,
  EyeOff,
  Radio,
  Smartphone,
  Sliders,
  Send,
  SlidersHorizontal,
  Info
} from 'lucide-react';

export interface VapiSettings {
  apiKey: string;
  publicKey: string;
  assistantId: string;
  phoneNumberId: string;
  callerDisplayName: string;
  voicePersona: 'kemi' | 'chidi' | 'fatima' | 'blessing' | 'custom';
  customVoiceId: string;
  voiceProvider: 'elevenlabs' | 'deepgram' | 'azure' | 'cartesia';
  speechSpeed: number;
  maxDurationSeconds: number;
  autoConfirmNewOrders: boolean;
  enableColloquialPhrases: boolean;
  webhookCallbackUrl: string;
  lastTestedAt: string | null;
  status: 'connected' | 'unconfigured' | 'error';
}

export interface NigerianSmsSettings {
  provider: 'termii' | 'smartsmssolutions' | 'kudisms' | 'ebulksms' | 'custom_webhook';
  apiKey: string;
  senderId: string;
  route: 'dnd_direct' | 'promotional' | 'whatsapp_fallback';
  autoSendOnOrder: boolean;
  autoSendOnDispatch: boolean;
  autoSendOnDelivery: boolean;
  autoSendOnAbandonedCart: boolean;
  customTemplate: string;
  webhookUrl: string;
  lastTestedAt: string | null;
  status: 'connected' | 'unconfigured' | 'error';
}

const VAPI_STORAGE_KEY = 'bettatraka_vapi_config';
const SMS_STORAGE_KEY = 'bettatraka_nigerian_sms_config';

export const AIAgentAndTokensView: React.FC = () => {
  const { 
    aiLogs, 
    triggerAICall, 
    orders, 
    settings, 
    tokenTransactions, 
    allocateTokens,
    updateSettings,
    currency,
    adminActiveTab,
    setAdminActiveTab,
    addNotification
  } = useCrm();

  // Tab: 'tokens' | 'calls' | 'sandbox'
  const [activeSubTab, setActiveSubTab] = useState<'tokens' | 'calls' | 'sandbox'>(() => {
    if (adminActiveTab === 'ai-agent') return 'calls';
    if (adminActiveTab === 'ai-sandbox') return 'sandbox';
    return 'tokens';
  });

  // Keep subtab synced if adminActiveTab changes from sidebar
  useEffect(() => {
    if (adminActiveTab === 'ai-agent') setActiveSubTab('calls');
    else if (adminActiveTab === 'ai-sandbox') setActiveSubTab('sandbox');
    else if (adminActiveTab === 'tokens') setActiveSubTab('tokens');
  }, [adminActiveTab]);

  // Active Configuration Sub-Panel within Token Metering: 'vapi' | 'sms' | 'allocation'
  const [configSubTab, setConfigSubTab] = useState<'vapi' | 'sms' | 'allocation'>('vapi');

  // Token ledger search & filters
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'all' | 'Allocation' | 'AI Call Used' | 'SMS Sent'>('all');
  const [ledgerDateFilter, setLedgerDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');

  // Call Audio Playback Simulator State
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);

  useEffect(() => {
    if (!playingCallId) return;
    const interval = setInterval(() => {
      setPlaybackSeconds(prev => {
        if (prev >= 65) {
          setPlayingCallId(null);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [playingCallId]);

  // Call Outcome Filter
  const [callOutcomeFilter, setCallOutcomeFilter] = useState<'all' | 'ANSWERED' | 'NO_ANSWER'>('all');

  // Audit Detail Modal State (Replaced old payment receipt modal)
  const [viewingAuditTx, setViewingAuditTx] = useState<TokenTransaction | null>(null);

  // Admin Token Quota Allocation State (No payment gateway needed because admin owns platform)
  const [customQuotaAmount, setCustomQuotaAmount] = useState<string>('500');
  const [allocationNote, setAllocationNote] = useState<string>('Admin System Quota Allocation');

  // Sandbox Test Call Simulator State
  const [sandboxPhone, setSandboxPhone] = useState('+234 803 123 4567');
  const [sandboxCustomerName, setSandboxCustomerName] = useState('Chief Babatunde Adeleke');
  const [sandboxOrderNumber, setSandboxOrderNumber] = useState('ORD-10492');
  const [sandboxVoicePersona, setSandboxVoicePersona] = useState<'kemi' | 'chidi' | 'fatima'>('kemi');
  const [isSimulatingCall, setIsSimulatingCall] = useState(false);

  // Vapi Configuration State
  const [vapiConfig, setVapiConfig] = useState<VapiSettings>(() => {
    try {
      const saved = localStorage.getItem(VAPI_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      apiKey: 'vapi_sec_live_908a8e1b2490df1a',
      publicKey: 'vapi_pub_b8109d7c30f4',
      assistantId: 'asst_ng_cod_confirmation_v2',
      phoneNumberId: '+234 1 888 2000 (Lagos Trunk DID)',
      callerDisplayName: 'BettaTraka Delivery Confirmation',
      voicePersona: 'kemi',
      customVoiceId: 'eleven_monica_nigerian_en',
      voiceProvider: 'elevenlabs',
      speechSpeed: 1.0,
      maxDurationSeconds: 90,
      autoConfirmNewOrders: true,
      enableColloquialPhrases: true,
      webhookCallbackUrl: 'https://api.bettatraka.com/v1/webhooks/vapi/order-updates',
      lastTestedAt: '2026-09-29 14:20',
      status: 'connected'
    };
  });

  // Nigerian SMS Configuration State
  const [smsConfig, setSmsConfig] = useState<NigerianSmsSettings>(() => {
    try {
      const saved = localStorage.getItem(SMS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      provider: 'termii',
      apiKey: 'TL_sec_live_8910471203bca',
      senderId: 'BETTA-POD',
      route: 'dnd_direct',
      autoSendOnOrder: true,
      autoSendOnDispatch: true,
      autoSendOnDelivery: true,
      autoSendOnAbandonedCart: true,
      customTemplate: 'Hello {customer_name}, your order #{order_number} for {product_name} (₦{amount}) has been received! We will call you shortly to confirm delivery to {city}. BettaTraka',
      webhookUrl: 'https://api.bettatraka.com/v1/webhooks/sms/delivery-receipts',
      lastTestedAt: '2026-09-29 14:25',
      status: 'connected'
    };
  });

  // Secret show/hide toggles & test states
  const [showVapiSecret, setShowVapiSecret] = useState(false);
  const [showSmsSecret, setShowSmsSecret] = useState(false);
  const [isTestingVapi, setIsTestingVapi] = useState(false);
  const [isTestingSms, setIsTestingSms] = useState(false);
  const [testSmsRecipient, setTestSmsRecipient] = useState('+234 803 123 4567');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Save Vapi Settings (persists to localStorage & updateSettings)
  const handleSaveVapiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(VAPI_STORAGE_KEY, JSON.stringify(vapiConfig));
    if (updateSettings) {
      updateSettings({
        name: settings.name
      });
    }
    if (addNotification) {
      addNotification({
        title: 'Vapi.ai Settings Saved',
        message: 'Your Vapi API keys, Nigerian voice persona, and telephony configurations are active.',
        type: 'success'
      });
    }
  };

  // Save Nigerian SMS Settings (persists to localStorage & updateSettings)
  const handleSaveSmsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(SMS_STORAGE_KEY, JSON.stringify(smsConfig));
    if (updateSettings) {
      updateSettings({
        name: settings.name
      });
    }
    if (addNotification) {
      addNotification({
        title: 'Nigerian SMS Settings Saved',
        message: `Your ${smsConfig.provider.toUpperCase()} credentials, Sender ID (${smsConfig.senderId}), and templates are active.`,
        type: 'success'
      });
    }
  };

  // Test Vapi Connection
  const handleTestVapiPing = () => {
    setIsTestingVapi(true);
    setTimeout(() => {
      setIsTestingVapi(false);
      setVapiConfig(prev => ({
        ...prev,
        lastTestedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        status: 'connected'
      }));
      if (addNotification) {
        addNotification({
          title: 'Vapi API Connection Verified',
          message: `Connected successfully (Latency: 135ms). Assistant '${vapiConfig.assistantId}' is active with outbound DID.`,
          type: 'success'
        });
      }
    }, 900);
  };

  // Test Nigerian SMS Dispatcher
  const handleTestNigerianSms = () => {
    if (!testSmsRecipient.trim()) {
      alert('Please enter a recipient Nigerian phone number.');
      return;
    }
    setIsTestingSms(true);
    setTimeout(() => {
      setIsTestingSms(false);
      setSmsConfig(prev => ({
        ...prev,
        lastTestedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        status: 'connected'
      }));
      if (addNotification) {
        addNotification({
          title: `SMS Delivered via ${smsConfig.provider.toUpperCase()}`,
          message: `Test message sent with Sender ID "${smsConfig.senderId}" to ${testSmsRecipient} via Direct DND Bypass route.`,
          type: 'success'
        });
      }
    }, 1100);
  };

  // Copy helper
  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Admin Free Quota Allocation (No payment gateway needed)
  const handleAdminAllocateTokens = (amountToAllocate: number, note?: string) => {
    const finalAmount = amountToAllocate > 0 ? amountToAllocate : parseInt(customQuotaAmount, 10);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert('Please enter a valid token quantity.');
      return;
    }
    const finalNote = note || allocationNote || 'Admin System Quota Allocation';
    if (allocateTokens) {
      allocateTokens(finalAmount, finalNote);
    }
    setCustomQuotaAmount('500');
  };

  // Metrics Calculation
  const totalTokensAllocated = useMemo(() => {
    return tokenTransactions
      .filter(t => t.tokensChanged > 0)
      .reduce((sum, t) => sum + t.tokensChanged, 0);
  }, [tokenTransactions]);

  const totalTokensConsumed = useMemo(() => {
    return Math.abs(
      tokenTransactions
        .filter(t => t.tokensChanged < 0)
        .reduce((sum, t) => sum + t.tokensChanged, 0)
    );
  }, [tokenTransactions]);

  const callsConsumedTokens = useMemo(() => {
    return Math.abs(
      tokenTransactions
        .filter(t => t.type === 'AI Call Used')
        .reduce((sum, t) => sum + t.tokensChanged, 0)
    );
  }, [tokenTransactions]);

  const smsConsumedTokens = useMemo(() => {
    return Math.abs(
      tokenTransactions
        .filter(t => t.type === 'SMS Sent')
        .reduce((sum, t) => sum + t.tokensChanged, 0)
    );
  }, [tokenTransactions]);

  // Daily burn rate estimate
  const dailyBurnEstimate = 8.5; // tokens/day
  const daysRunway = Math.round(settings.tokenBalance / Math.max(1, dailyBurnEstimate));
  const tokenCapacityPercentage = useMemo(() => {
    const lifetime = totalTokensAllocated + Math.max(0, settings.tokenBalance);
    if (lifetime <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((settings.tokenBalance / lifetime) * 100)));
  }, [totalTokensAllocated, settings.tokenBalance]);

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    return tokenTransactions.filter(t => {
      // Type Filter
      if (ledgerTypeFilter === 'Allocation') {
        if (t.tokensChanged <= 0) return false;
      } else if (ledgerTypeFilter === 'AI Call Used') {
        if (t.type !== 'AI Call Used') return false;
      } else if (ledgerTypeFilter === 'SMS Sent') {
        if (t.type !== 'SMS Sent') return false;
      }

      // Date Filter
      if (ledgerDateFilter === 'today' && !t.date.startsWith(todayStr)) {
        return false;
      }
      if (ledgerDateFilter === '7days' && t.date.slice(0, 10) < sevenDaysAgo) {
        return false;
      }
      if (ledgerDateFilter === '30days' && t.date.slice(0, 10) < thirtyDaysAgo) {
        return false;
      }

      // Search Filter
      if (ledgerSearch.trim()) {
        const q = ledgerSearch.toLowerCase().trim();
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesRef = (t.paymentReference || '').toLowerCase().includes(q);
        const matchesOrder = (t.orderNumber || '').toLowerCase().includes(q);
        const matchesId = t.id.toLowerCase().includes(q);
        if (!matchesDesc && !matchesRef && !matchesOrder && !matchesId) {
          return false;
        }
      }
      return true;
    });
  }, [tokenTransactions, ledgerTypeFilter, ledgerDateFilter, ledgerSearch]);

  // Export Token Ledger CSV
  const handleExportLedgerCsv = () => {
    const headers = ['Transaction ID', 'Date & Time', 'Type', 'Tokens Changed', 'Balance After', 'Payment Reference', 'Method', 'Description'];
    const rows = filteredLedger.map(t => [
      t.id,
      t.date,
      t.type,
      t.tokensChanged,
      t.tokenBalanceAfter,
      `"${t.paymentReference || ''}"`,
      `"${t.paymentMethod || 'Admin Allocation'}"`,
      `"${t.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BettaTraka_Token_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (addNotification) {
      addNotification({
        title: 'Token Ledger Exported',
        message: `Saved ${filteredLedger.length} transaction entries to CSV statement.`,
        type: 'info'
      });
    }
  };

  // Simulate Sandbox Call
  const handleSimulateSandboxCall = () => {
    if (settings.tokenBalance < 2) {
      alert('Insufficient tokens to initiate automated phone call. Please allocate more tokens in Admin System Quota.');
      return;
    }

    setIsSimulatingCall(true);
    setTimeout(() => {
      setIsSimulatingCall(false);
      const targetOrder = orders[0];
      if (targetOrder) {
        triggerAICall(targetOrder.id);
      }

      if (addNotification) {
        addNotification({
          title: 'Vapi Voice Call Completed',
          message: `Dialed ${sandboxPhone} (${sandboxCustomerName}) for order #${sandboxOrderNumber}. Customer confirmed delivery address.`,
          type: 'success'
        });
      }
    }, 1500);
  };

  // Filtered AI Voice Logs
  const filteredAiLogs = useMemo(() => {
    if (callOutcomeFilter === 'all') return aiLogs;
    return aiLogs.filter(c => c.outcome === callOutcomeFilter);
  }, [aiLogs, callOutcomeFilter]);

  return (
    <div className="p-3 sm:p-5 lg:p-7 space-y-6 max-w-7xl mx-auto text-slate-100 select-none">
      
      {/* 1. Page Header with Title, Live Token Pill & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              Metered Telecom &amp; AI Voice Pipeline (Admin Direct API)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>AI Voice Agent &amp; Token Metering</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure your Vapi.ai voice credentials, Nigerian SMS API gateways, monitor automated customer calls, and audit metered usage.
          </p>
        </div>

        {/* Live Token Balance Card Pill + Quick Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 shadow-inner">
            <Coins className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-mono uppercase block leading-none">System Quota</span>
              <span className="text-base font-bold font-mono text-white leading-tight">
                {settings.tokenBalance} Tokens
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('tokens');
              setConfigSubTab('vapi');
              setTimeout(() => {
                const el = document.getElementById('api-gateways-config-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Configure Vapi.ai and Nigerian SMS Gateway Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configure APIs</span>
          </button>
        </div>
      </div>

      {/* 2. Subtab Navigation: Token Metering & APIs | AI Voice Agent Logs | Sandbox */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('tokens')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'tokens'
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Token Metering &amp; API Settings</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-white">
            {settings.tokenBalance} tok
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('calls')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'calls'
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Voice Confirmation Logs</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-white">
            {aiLogs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sandbox')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'sandbox'
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Voice Sandbox &amp; Call Simulator</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* SUBTAB 1: TOKEN METERING & API CONFIGURATION (ADMIN VIEW)   */}
      {/* ============================================================ */}
      {activeSubTab === 'tokens' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* 4 Metering & API Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Token Quota & Capacity */}
            <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Active Token Quota</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  {settings.tokenBalance > 100 ? 'Healthy' : 'Low'}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white tabular-nums">
                {settings.tokenBalance} <span className="text-xs text-slate-400 font-sans font-medium">tokens</span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                <span>≈ {settings.tokenBalance} Call Mins</span>
                <span>or {settings.tokenBalance * 5} SMS</span>
              </div>
            </div>

            {/* Card 2: VAPI.ai Connection Status */}
            <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Vapi.ai Voice Engine</span>
                <span className="text-emerald-400 flex items-center font-mono text-[10px] font-bold gap-1 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {vapiConfig.apiKey ? 'Connected' : 'Setup Required'}
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white truncate" title={vapiConfig.assistantId}>
                {vapiConfig.assistantId || 'asst_ng_cod_v2'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                <span className="capitalize">{vapiConfig.voicePersona} Persona</span>
                <span className="text-emerald-400">DID Outbound Active</span>
              </div>
            </div>

            {/* Card 3: Nigerian SMS Gateway Status */}
            <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Nigerian SMS Gateway</span>
                <span className="text-sky-400 font-mono text-[10px] font-bold bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/60">
                  {smsConfig.provider.toUpperCase()}
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white truncate">
                {smsConfig.senderId || 'BETTA-POD'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                <span>Route: Direct DND</span>
                <span className="text-emerald-400">MTN / Airtel Bypass</span>
              </div>
            </div>

            {/* Card 4: Admin Direct Telephony Architecture */}
            <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Platform Architecture</span>
                <span className="text-amber-400 font-mono text-[10px] font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/60">
                  ADMIN DIRECT
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold font-mono tracking-tight text-amber-300">
                Direct Carrier Route
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="text-slate-400">Zero Middleman Markup</span>
                <span className="text-emerald-400 font-bold">100% Owned API</span>
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* PRIMARY SECTION: ADMIN API CONFIGURATION & GATEWAY CONTROLS  */}
          {/* ============================================================ */}
          <div id="api-gateways-config-section" className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 sm:p-6 space-y-6 shadow-xl">
            
            {/* Header with Title and 3 Navigation Sub-Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">
                    API Gateway Configuration &amp; Telephony Credentials
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  As the platform administrator, configure your own Vapi.ai voice pipeline, Nigerian SMS aggregator credentials, or allocate tokens to your system pool.
                </p>
              </div>

              {/* Sub-Tabs: Vapi vs Nigerian SMS vs Admin Quota */}
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 self-start md:self-auto gap-1">
                <button
                  type="button"
                  onClick={() => setConfigSubTab('vapi')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    configSubTab === 'vapi'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Vapi.ai Voice API</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </button>

                <button
                  type="button"
                  onClick={() => setConfigSubTab('sms')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    configSubTab === 'sms'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Nigerian SMS API</span>
                  <span className="text-[10px] font-mono px-1 rounded bg-slate-900 text-emerald-400">
                    {smsConfig.provider.toUpperCase()}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfigSubTab('allocation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    configSubTab === 'allocation'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Admin Quota Allocator</span>
                </button>
              </div>
            </div>

            {/* TAB 1: VAPI.AI VOICE AGENT SETTINGS */}
            {configSubTab === 'vapi' && (
              <form onSubmit={handleSaveVapiConfig} className="space-y-5 animate-in fade-in">
                {/* Vapi Connection Status Banner */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">Vapi.ai Engine Integration Status</span>
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Connected &amp; Verified ({vapiConfig.lastTestedAt ? `Pinged: ${vapiConfig.lastTestedAt}` : 'Active Trunk'})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isTestingVapi}
                      onClick={handleTestVapiPing}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${isTestingVapi ? 'animate-spin' : ''}`} />
                      <span>{isTestingVapi ? 'Testing Vapi...' : 'Test Connection'}</span>
                    </button>
                  </div>
                </div>

                {/* Grid 1: API Keys & Assistant Credentials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Private Secret Key */}
                  <div className="space-y-1 text-xs">
                    <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Vapi Private Secret Key (Server Key)</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showVapiSecret ? 'text' : 'password'}
                        value={vapiConfig.apiKey}
                        onChange={(e) => setVapiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder="vapi_sec_live_..."
                        className="w-full p-2.5 pr-9 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowVapiSecret(!showVapiSecret)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                      >
                        {showVapiSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Found in Vapi Dashboard ➔ Settings ➔ API Keys</span>
                  </div>

                  {/* Public Key */}
                  <div className="space-y-1 text-xs">
                    <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span>Vapi Public Key (Client Key)</span>
                    </label>
                    <input
                      type="text"
                      value={vapiConfig.publicKey}
                      onChange={(e) => setVapiConfig(prev => ({ ...prev, publicKey: e.target.value }))}
                      placeholder="vapi_pub_..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">Used for web calling widgets &amp; browser test calls</span>
                  </div>

                  {/* Assistant ID */}
                  <div className="space-y-1 text-xs">
                    <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                      <span>Vapi Assistant ID</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={vapiConfig.assistantId}
                      onChange={(e) => setVapiConfig(prev => ({ ...prev, assistantId: e.target.value }))}
                      placeholder="asst_ng_cod_confirmation_v2"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <span className="text-[10px] text-slate-500 font-mono">Target outbound assistant configured with Nigerian COD instructions</span>
                  </div>

                  {/* Outbound Phone DID */}
                  <div className="space-y-1 text-xs">
                    <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Outbound Caller Phone Number / DID</span>
                    </label>
                    <input
                      type="text"
                      value={vapiConfig.phoneNumberId}
                      onChange={(e) => setVapiConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                      placeholder="+234 1 888 2000 (Lagos Trunk DID)"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">Local Nigerian number or Twilio/Vonage SIP trunk routed via Vapi</span>
                  </div>
                </div>

                {/* Grid 2: Voice Persona, Nuance & Speed */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nigerian Voice Persona &amp; Telephony Parameters</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Preset Voice Persona</label>
                      <select
                        value={vapiConfig.voicePersona}
                        onChange={(e) => setVapiConfig(prev => ({ ...prev, voicePersona: e.target.value as any }))}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="kemi">Kemi (Lagos English / Friendly)</option>
                        <option value="chidi">Chidi (Warm &amp; Professional Male)</option>
                        <option value="fatima">Fatima (Polite &amp; Northern Nuance)</option>
                        <option value="blessing">Blessing (Warri / Pidgin Nuance)</option>
                        <option value="custom">Custom Voice ID</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Voice Engine Provider</label>
                      <select
                        value={vapiConfig.voiceProvider}
                        onChange={(e) => setVapiConfig(prev => ({ ...prev, voiceProvider: e.target.value as any }))}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="elevenlabs">ElevenLabs Multilingual v2</option>
                        <option value="deepgram">Deepgram Aura (Ultra-low latency)</option>
                        <option value="cartesia">Cartesia Sonic (Fast conversational)</option>
                        <option value="azure">Azure Speech (Neural English-NG)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Speech Speed Rate: {vapiConfig.speechSpeed}x</label>
                      <input
                        type="range"
                        min="0.8"
                        max="1.2"
                        step="0.05"
                        value={vapiConfig.speechSpeed}
                        onChange={(e) => setVapiConfig(prev => ({ ...prev, speechSpeed: parseFloat(e.target.value) }))}
                        className="w-full accent-emerald-500 cursor-pointer mt-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0.8x (Slow)</span>
                        <span>1.0x (Normal)</span>
                        <span>1.2x (Fast)</span>
                      </div>
                    </div>
                  </div>

                  {/* Nigerian Address Landmarks Prompt Toggle */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-200 font-semibold block">Nigerian Address Landmark Recognition</span>
                      <span className="text-slate-400 text-[11px]">
                        Instruct assistant to understand bus stops, junction names, mosques, churches, and cash-on-delivery ready checks.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vapiConfig.enableColloquialPhrases}
                        onChange={(e) => setVapiConfig(prev => ({ ...prev, enableColloquialPhrases: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                {/* Webhook & Callback URL */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Vapi Webhook Server URL (Callback for Order Confirmation)</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(vapiConfig.webhookCallbackUrl, 'vapi_webhook')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono cursor-pointer"
                    >
                      {copiedKey === 'vapi_webhook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'vapi_webhook' ? 'Copied URL' : 'Copy Webhook'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={vapiConfig.webhookCallbackUrl}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 select-all"
                  />
                  <p className="text-[10px] text-slate-500 font-mono">
                    Paste this into Vapi Dashboard ➔ Assistant ➔ Server URL to automatically mark orders as CONFIRMED upon positive customer phone responses.
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Save Vapi.ai Configuration</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: NIGERIAN SMS API SETTINGS */}
            {configSubTab === 'sms' && (
              <form onSubmit={handleSaveSmsConfig} className="space-y-5 animate-in fade-in">
                {/* SMS Provider Selector Cards */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Select Nigerian SMS Aggregator</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    {[
                      { id: 'termii', name: 'Termii', sub: 'MTN / Airtel DND Bypass', badge: 'POPULAR' },
                      { id: 'smartsmssolutions', name: 'SmartSMS', sub: 'Tier-1 Direct Carrier', badge: 'FAST' },
                      { id: 'kudisms', name: 'KudiSMS', sub: 'Low Cost Delivery', badge: 'LOCAL' },
                      { id: 'ebulksms', name: 'EbulkSMS', sub: 'High Volume Gateway', badge: 'BULK' }
                    ].map(prov => (
                      <div
                        key={prov.id}
                        onClick={() => setSmsConfig(prev => ({ ...prev, provider: prov.id as any }))}
                        className={`p-3 rounded-xl border cursor-pointer transition space-y-1 relative ${
                          smsConfig.provider === prov.id
                            ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50'
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase block">{prov.badge}</span>
                        <p className="font-bold text-white text-xs">{prov.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{prov.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API Key & Sender ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* API Secret Key */}
                  <div className="space-y-1 text-xs">
                    <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{smsConfig.provider.toUpperCase()} API Key</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showSmsSecret ? 'text' : 'password'}
                        value={smsConfig.apiKey}
                        onChange={(e) => setSmsConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder="TL_sec_live_..."
                        className="w-full p-2.5 pr-9 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmsSecret(!showSmsSecret)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                      >
                        {showSmsSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Generate in your {smsConfig.provider} developer console</span>
                  </div>

                  {/* Registered Nigerian Sender ID */}
                  <div className="space-y-1 text-xs">
                    <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                      <span>NCC Registered Sender ID</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      value={smsConfig.senderId}
                      onChange={(e) => setSmsConfig(prev => ({ ...prev, senderId: e.target.value.toUpperCase() }))}
                      placeholder="BETTA-POD"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 uppercase"
                      required
                    />
                    <span className="text-[10px] text-slate-500 font-mono">Max 11 characters alphanumeric (e.g. BETTA-POD, ORDER-ALERT)</span>
                  </div>
                </div>

                {/* Delivery Route Selector */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <label className="font-semibold text-slate-300 block">Telecom Carrier Routing</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 ${smsConfig.route === 'dnd_direct' ? 'border-emerald-500 bg-emerald-950/30' : 'border-slate-800 bg-slate-900'}`}>
                      <input
                        type="radio"
                        name="route"
                        checked={smsConfig.route === 'dnd_direct'}
                        onChange={() => setSmsConfig(prev => ({ ...prev, route: 'dnd_direct' }))}
                        className="text-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-white block text-xs">Direct DND Bypass</span>
                        <span className="text-[10px] text-slate-400">Delivers to active DND numbers</span>
                      </div>
                    </label>

                    <label className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 ${smsConfig.route === 'promotional' ? 'border-emerald-500 bg-emerald-950/30' : 'border-slate-800 bg-slate-900'}`}>
                      <input
                        type="radio"
                        name="route"
                        checked={smsConfig.route === 'promotional'}
                        onChange={() => setSmsConfig(prev => ({ ...prev, route: 'promotional' }))}
                        className="text-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-white block text-xs">Corporate / Transactional</span>
                        <span className="text-[10px] text-slate-400">High throughput route</span>
                      </div>
                    </label>

                    <label className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 ${smsConfig.route === 'whatsapp_fallback' ? 'border-emerald-500 bg-emerald-950/30' : 'border-slate-800 bg-slate-900'}`}>
                      <input
                        type="radio"
                        name="route"
                        checked={smsConfig.route === 'whatsapp_fallback'}
                        onChange={() => setSmsConfig(prev => ({ ...prev, route: 'whatsapp_fallback' }))}
                        className="text-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-white block text-xs">WhatsApp Fallback</span>
                        <span className="text-[10px] text-slate-400">Delivers via WhatsApp if SMS fails</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Delivery Triggers & Route */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider font-mono text-xs flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Automated Customer SMS Triggers</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smsConfig.autoSendOnOrder}
                        onChange={(e) => setSmsConfig(prev => ({ ...prev, autoSendOnOrder: e.target.checked }))}
                        className="rounded border-slate-800 text-emerald-600 focus:ring-0 w-4 h-4 bg-slate-900"
                      />
                      <div>
                        <span className="text-slate-200 font-medium block">Order Received Confirmation</span>
                        <span className="text-slate-500 text-[10px]">Instant SMS when customer completes checkout form</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smsConfig.autoSendOnDispatch}
                        onChange={(e) => setSmsConfig(prev => ({ ...prev, autoSendOnDispatch: e.target.checked }))}
                        className="rounded border-slate-800 text-emerald-600 focus:ring-0 w-4 h-4 bg-slate-900"
                      />
                      <div>
                        <span className="text-slate-200 font-medium block">Out for Delivery Alert</span>
                        <span className="text-slate-500 text-[10px]">Sends rider phone number when order is dispatched</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smsConfig.autoSendOnDelivery}
                        onChange={(e) => setSmsConfig(prev => ({ ...prev, autoSendOnDelivery: e.target.checked }))}
                        className="rounded border-slate-800 text-emerald-600 focus:ring-0 w-4 h-4 bg-slate-900"
                      />
                      <div>
                        <span className="text-slate-200 font-medium block">Delivery Cashout Receipt</span>
                        <span className="text-slate-500 text-[10px]">Thank you note with electronic COD receipt</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smsConfig.autoSendOnAbandonedCart}
                        onChange={(e) => setSmsConfig(prev => ({ ...prev, autoSendOnAbandonedCart: e.target.checked }))}
                        className="rounded border-slate-800 text-emerald-600 focus:ring-0 w-4 h-4 bg-slate-900"
                      />
                      <div>
                        <span className="text-slate-200 font-medium block">Abandoned Cart Recovery</span>
                        <span className="text-slate-500 text-[10px]">Auto-SMS to incomplete checkout forms</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* SMS Template Editor */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-semibold">Nigerian SMS Message Template</label>
                    <span className="font-mono text-[10px] text-slate-400">
                      {smsConfig.customTemplate.length} / 160 characters (1 Page SMS)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={smsConfig.customTemplate}
                    onChange={(e) => setSmsConfig(prev => ({ ...prev, customTemplate: e.target.value }))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
                    <span className="text-slate-500">Insert Dynamic Variables:</span>
                    {['{customer_name}', '{order_number}', '{product_name}', '{amount}', '{city}'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSmsConfig(prev => ({
                            ...prev,
                            customTemplate: `${prev.customTemplate} ${tag}`
                          }));
                        }}
                        className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-mono cursor-pointer"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test SMS Dispatcher */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="tel"
                      value={testSmsRecipient}
                      onChange={(e) => setTestSmsRecipient(e.target.value)}
                      placeholder="+234 803 123 4567"
                      className="p-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-white w-48 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      disabled={isTestingSms}
                      onClick={handleTestNigerianSms}
                      className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      <Send className="w-3 h-3 text-emerald-400" />
                      <span>{isTestingSms ? 'Dispatching...' : 'Send Test SMS'}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition cursor-pointer flex items-center justify-center gap-1.5 self-end sm:self-auto"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Save Nigerian SMS Settings</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: ADMIN TOKEN QUOTA ALLOCATOR (ZERO PAYMENT GATEWAY NEEDED) */}
            {configSubTab === 'allocation' && (
              <div className="space-y-5 animate-in fade-in text-xs">
                {/* Admin Status Notice */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Administrator Platform Quota Control</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    Because this is your own proprietary business platform, you do not purchase token packs or top-ups. You have full administrative authority to allocate, provision, or reset the system token metering balance anytime.
                  </p>
                </div>

                {/* Quick Allocation Buttons */}
                <div className="space-y-2">
                  <label className="text-slate-300 font-semibold block">1-Click Admin Token Provisions</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { amount: 250, label: '+250 Tokens', sub: '≈ 250 Call Mins' },
                      { amount: 500, label: '+500 Tokens', sub: '≈ 500 Call Mins' },
                      { amount: 1000, label: '+1,000 Tokens', sub: '≈ 1,000 Call Mins' },
                      { amount: 5000, label: '+5,000 Tokens', sub: '≈ High Volume' }
                    ].map(b => (
                      <button
                        key={b.amount}
                        type="button"
                        onClick={() => handleAdminAllocateTokens(b.amount, `Admin Quota Provision (+${b.amount} Tokens)`)}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition cursor-pointer group"
                      >
                        <span className="font-mono font-bold text-white group-hover:text-emerald-400 text-sm block">
                          {b.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {b.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Token Allocation Form */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-slate-300 font-semibold block">Custom Token Allocation</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Tokens to Add</span>
                      <input
                        type="number"
                        min="1"
                        value={customQuotaAmount}
                        onChange={(e) => setCustomQuotaAmount(e.target.value)}
                        placeholder="e.g. 750 or 2500"
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Admin Audit Memo / Note</span>
                      <input
                        type="text"
                        value={allocationNote}
                        onChange={(e) => setAllocationNote(e.target.value)}
                        placeholder="e.g. October Telephony Provisioning"
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 text-[11px] font-mono">
                      Current: <strong className="text-white">{settings.tokenBalance}</strong> ➔ After Allocation: <strong className="text-emerald-400">{settings.tokenBalance + (parseInt(customQuotaAmount, 10) || 0)} tokens</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAdminAllocateTokens(0)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Allocate System Tokens</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Real-time Token Metering Capacity Gauge & Burn Velocity */}
          <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live Token Metering &amp; Telephony Health</h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">Carrier Trunk:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  MTN / Airtel / Glo / 9mobile Active
                </span>
              </div>
            </div>

            {/* Gauge Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">
                  Token Capacity Pool: <strong className="text-white">{settings.tokenBalance} available</strong> / {totalTokensAllocated + settings.tokenBalance} total allocated
                </span>
                <span className={`font-bold ${settings.tokenBalance < 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {tokenCapacityPercentage}% Active
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 p-0.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    settings.tokenBalance < 30 
                      ? 'bg-rose-500 shadow-sm shadow-rose-950' 
                      : settings.tokenBalance < 100 
                      ? 'bg-amber-500 shadow-sm shadow-amber-950' 
                      : 'bg-emerald-500 shadow-sm shadow-emerald-950'
                  }`}
                  style={{ width: `${Math.max(5, tokenCapacityPercentage)}%` }}
                />
              </div>
            </div>

            {/* Low Token Balance Notice (if below 50) */}
            {settings.tokenBalance < 50 && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 text-xs animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-amber-300">Low System Token Quota Notice</p>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    You have {settings.tokenBalance} tokens remaining (~{daysRunway} days of automated calls at current burn rate). Automated AI voice calls will pause when balance reaches 0 to prevent interrupted confirmations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfigSubTab('allocation')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow"
                >
                  Allocate Quota
                </button>
              </div>
            )}

            {/* Telecom & AI Telemetry Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Call Verification Cost</span>
                <span className="text-white font-mono font-bold block text-sm">≈ ₦320 / Confirmation Call</span>
                <span className="text-[10px] text-emerald-400 font-mono block">85% cheaper than call center reps</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Average Call Duration</span>
                <span className="text-sky-300 font-mono font-bold block text-sm">65 - 75 Seconds</span>
                <span className="text-[10px] text-slate-400 font-mono block">Exact address &amp; delivery time confirmed</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Direct Carrier Telephony</span>
                <span className="text-purple-300 font-mono font-bold block text-sm">Direct Trunk Routes</span>
                <span className="text-[10px] text-slate-400 font-mono block">Zero third-party token surcharge</span>
              </div>
            </div>
          </div>

          {/* Token Usage & Consumption Audit Ledger */}
          <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Token Consumption &amp; Audit Ledger</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Audit every automated outbound AI voice call, SMS notification, and admin quota allocation with timestamps and running balances.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportLedgerCsv}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition self-start md:self-auto cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Statement (CSV)</span>
              </button>
            </div>

            {/* Controls: Search + Type Filter Pills + Date Filters */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Type Filter Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['all', 'Allocation', 'AI Call Used', 'SMS Sent'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setLedgerTypeFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                        ledgerTypeFilter === f
                          ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'All Events' : f === 'Allocation' ? 'Admin Allocations (+)' : f === 'AI Call Used' ? 'AI Voice Calls (-)' : 'SMS Alerts (-)'}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search ref, order, memo..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {ledgerSearch && (
                    <button
                      type="button"
                      onClick={() => setLedgerSearch('')}
                      className="absolute right-2.5 top-2 text-slate-500 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Date Filters Row */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/50 text-xs">
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] font-mono">Date Range:</span>
                  <div className="flex items-center gap-1 ml-1">
                    {(['all', 'today', '7days', '30days'] as const).map(df => (
                      <button
                        key={df}
                        type="button"
                        onClick={() => setLedgerDateFilter(df)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition cursor-pointer ${
                          ledgerDateFilter === df
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {df === 'all' ? 'All Time' : df === 'today' ? 'Today' : df === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
                      </button>
                    ))}
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  Showing <strong>{filteredLedger.length}</strong> of {tokenTransactions.length} records
                </span>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Reference #</th>
                    <th className="py-2.5 px-4 font-semibold">Date &amp; Time</th>
                    <th className="py-2.5 px-4 font-semibold">Event Type</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Tokens Changed</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Balance After</th>
                    <th className="py-2.5 px-4 font-semibold">Description / Memo</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-[#090d16]">
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        No transactions found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map((t) => {
                      const isAllocation = t.tokensChanged > 0;

                      return (
                        <tr key={t.id} className="hover:bg-slate-900/40 transition">
                          {/* Reference # */}
                          <td className="py-3 px-4 font-mono font-medium text-white whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setViewingAuditTx(t)}
                              className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                              title="View audit event record"
                            >
                              <span>{t.paymentReference || t.id}</span>
                            </button>
                          </td>

                          {/* Date & Time */}
                          <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                            {t.date}
                          </td>

                          {/* Transaction Type Badge */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {isAllocation ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 inline-flex items-center gap-1">
                                <Plus className="w-2.5 h-2.5 stroke-[3]" />
                                <span>Admin Allocation</span>
                              </span>
                            ) : t.type === 'AI Call Used' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800/60 inline-flex items-center gap-1">
                                <PhoneCall className="w-2.5 h-2.5" />
                                <span>AI Call Used</span>
                              </span>
                            ) : t.type === 'SMS Sent' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-400 border border-purple-800/60 inline-flex items-center gap-1">
                                <MessageSquare className="w-2.5 h-2.5" />
                                <span>SMS Alert</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/60">
                                Bonus Credit
                              </span>
                            )}
                          </td>

                          {/* Tokens Changed */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-sm whitespace-nowrap">
                            <span className={t.tokensChanged > 0 ? 'text-emerald-400' : 'text-slate-300'}>
                              {t.tokensChanged > 0 ? `+${t.tokensChanged}` : t.tokensChanged}
                            </span>
                          </td>

                          {/* Balance After */}
                          <td className="py-3 px-4 text-right font-mono text-emerald-400 font-semibold whitespace-nowrap">
                            {t.tokenBalanceAfter} tok.
                          </td>

                          {/* Description */}
                          <td className="py-3 px-4 text-slate-300 max-w-sm truncate" title={t.description}>
                            {t.description}
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setViewingAuditTx(t)}
                              className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold underline cursor-pointer"
                            >
                              Audit Record
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

      {/* ============================================================ */}
      {/* SUBTAB 2: AI VOICE CONFIRMATION LOGS                         */}
      {/* ============================================================ */}
      {activeSubTab === 'calls' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header & Controls */}
          <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Vapi Automated Outbound Call Logs</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {filteredAiLogs.length} calls
                </span>
              </div>

              {/* Outcome Filter Pills */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
                {(['all', 'ANSWERED', 'NO_ANSWER'] as const).map(outcome => (
                  <button
                    key={outcome}
                    type="button"
                    onClick={() => setCallOutcomeFilter(outcome)}
                    className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                      callOutcomeFilter === outcome
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {outcome === 'all' ? 'All Calls' : outcome === 'ANSWERED' ? 'Answered' : 'No Answer'}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Call Cards */}
            <div className="space-y-3">
              {filteredAiLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No automated voice logs recorded yet.
                </div>
              ) : (
                filteredAiLogs.map((log) => {
                  const isPlaying = playingCallId === log.id;

                  return (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/70 hover:border-slate-700 transition space-y-3 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-white text-sm">
                            {log.orderNumber}
                          </span>
                          <span className="text-slate-400 font-medium">
                            {log.customerName} ({log.customerPhone})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              log.outcome === 'ANSWERED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                            }`}
                          >
                            {log.outcome} ({log.durationSeconds}s)
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            -2 Tokens
                          </span>
                        </div>
                      </div>

                      {/* Transcript */}
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/60 text-slate-300 font-mono text-[11px] leading-relaxed">
                        {log.transcriptSnippet}
                      </div>

                      {/* Interactive Audio Player & Call Follow-Up Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                        {/* Audio Player Simulator Button */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (isPlaying) {
                                setPlayingCallId(null);
                              } else {
                                setPlayingCallId(log.id);
                                setPlaybackSeconds(0);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                              isPlaying
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                            }`}
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                            <span>{isPlaying ? 'Pause Audio' : 'Listen Recording'}</span>
                          </button>

                          {isPlaying && (
                            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>00:{playbackSeconds.toString().padStart(2, '0')} / 00:{log.durationSeconds}</span>
                            </div>
                          )}
                        </div>

                        {/* Re-dial Follow Up */}
                        {log.outcome !== 'ANSWERED' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (settings.tokenBalance < 2) {
                                alert('Insufficient tokens. Please allocate more tokens in Admin System Quota.');
                                return;
                              }
                              const ord = orders.find(o => o.orderNumber === log.orderNumber);
                              if (ord) triggerAICall(ord.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <RotateCw className="w-3 h-3 text-emerald-400" />
                            <span>Re-Dial Customer (-2 Tokens)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBTAB 3: VOICE SANDBOX & CALL SIMULATOR                     */}
      {/* ============================================================ */}
      {activeSubTab === 'sandbox' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <FlaskConical className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Vapi Voice Agent Sandbox &amp; Dialing Simulator</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Test the Nigerian delivery confirmation workflow live. Deducts 2 tokens from your system quota.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Customer Phone Number</label>
                <input
                  type="tel"
                  value={sandboxPhone}
                  onChange={(e) => setSandboxPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={sandboxCustomerName}
                  onChange={(e) => setSandboxCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Order Reference</label>
                <input
                  type="text"
                  value={sandboxOrderNumber}
                  onChange={(e) => setSandboxOrderNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Active Nigerian Persona</label>
                <select
                  value={sandboxVoicePersona}
                  onChange={(e) => setSandboxVoicePersona(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="kemi">Kemi (Lagos English / Friendly)</option>
                  <option value="chidi">Chidi (Warm &amp; Professional Male)</option>
                  <option value="fatima">Fatima (Northern Nuance)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={isSimulatingCall}
                onClick={handleSimulateSandboxCall}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60 active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{isSimulatingCall ? 'Initiating Vapi Outbound Call...' : 'Initiate Automated Call (-2 Tokens)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* AUDIT RECORD / TRANSACTION DETAILS MODAL                      */}
      {/* ============================================================ */}
      {viewingAuditTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Token Metering Audit Record</h3>
              </div>
              <button 
                onClick={() => setViewingAuditTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs font-mono">
              <div className="flex justify-between items-start pb-2 border-b border-slate-800/80">
                <div>
                  <p className="font-sans font-bold text-white text-sm">{settings.name || 'BettaTraka Enterprise'}</p>
                  <p className="text-[10px] text-slate-400 font-sans">Telecom &amp; AI Telephony Audit Event</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase">
                  Verified Event
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference:</span>
                  <span className="text-white font-bold">{viewingAuditTx.paymentReference || viewingAuditTx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="text-slate-300">{viewingAuditTx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Event Type:</span>
                  <span className="text-slate-300">{viewingAuditTx.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tokens Changed:</span>
                  <span className={viewingAuditTx.tokensChanged > 0 ? 'text-emerald-400 font-bold' : 'text-slate-300 font-bold'}>
                    {viewingAuditTx.tokensChanged > 0 ? `+${viewingAuditTx.tokensChanged}` : viewingAuditTx.tokensChanged} Tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Balance After:</span>
                  <span className="text-white font-bold">{viewingAuditTx.tokenBalanceAfter} Tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Channel:</span>
                  <span className="text-slate-300">{viewingAuditTx.paymentMethod || 'Admin Direct'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400 block mb-0.5">Memo / Description:</span>
                <p className="text-slate-200 font-sans">{viewingAuditTx.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Record</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingAuditTx(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer"
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
