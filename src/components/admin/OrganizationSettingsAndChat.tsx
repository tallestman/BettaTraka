import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { User, UserRole, ManagerPermissions } from '../../types/crm';
import { 
  ShieldCheck, 
  MessageSquare, 
  Send, 
  Blocks, 
  CreditCard, 
  Mail, 
  Gift, 
  Settings, 
  Headphones, 
  GraduationCap, 
  Plus, 
  Check, 
  Copy,
  ExternalLink,
  Smartphone,
  Sun,
  Moon
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

export { UserManagementView } from './UserManagementView';
export { IntegrationsView } from './IntegrationsView';

export const TeamChatView: React.FC = () => {
  const { chatMessages, sendChatMessage, currentUser } = useCrm();
  const [text, setText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendChatMessage(text.trim());
    setText('');
  };

  return (
    <div className="p-4 lg:p-8 space-y-4 max-w-4xl mx-auto h-[calc(100vh-5rem)] flex flex-col">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" /> Organization Team Chat
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Shared communication channel for admins, sales reps, and warehouse managers.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
        {chatMessages.map((m) => (
          <div key={m.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-emerald-400">{m.userName} ({m.userRole})</span>
              <span className="text-slate-500 font-mono">{m.timestamp}</span>
            </div>
            <p className="text-slate-200 leading-relaxed">{m.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a team message or tag someone (@Babajide Cole)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition"
        >
          <Send className="w-3.5 h-3.5" /> Send
        </button>
      </form>
    </div>
  );
};

export const ReferralsView: React.FC = () => {
  const { settings, referrals, requestReferralPayout } = useCrm();

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Referrals & Partner Earnings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Earn 50% of month 1, then 20–30% of every recurring payment for referred e-commerce businesses.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-xs">
        <p className="text-white font-semibold">Your Unique Partner Link & Code:</p>
        <div className="flex items-center gap-2 font-mono">
          <input readOnly value={`https://bettatraka.ng/join?ref=${settings.referralCode}`} className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
          <button onClick={() => alert("Copied partner link!")} className="px-3 py-2 rounded bg-emerald-600 font-semibold text-white">Copy Link</button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
        <h3 className="text-xs font-semibold text-white">Referred Businesses</h3>
        <div className="divide-y divide-slate-800/60 text-xs">
          {referrals.map(r => (
            <div key={r.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{r.businessName} ({r.ownerName})</p>
                <p className="text-[11px] text-slate-400">{r.plan} Plan · Joined {r.signedUpDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-emerald-400 text-sm">₦{r.earnedAmount.toLocaleString()}</span>
                {r.status === 'Available' ? (
                  <button onClick={() => requestReferralPayout(r.id)} className="px-2.5 py-1 rounded bg-emerald-600 text-white font-medium text-[11px]">
                    Request Payout
                  </button>
                ) : (
                  <span className="font-mono text-slate-400 text-[11px]">{r.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SettingsAndSupportView: React.FC = () => {
  const { settings, updateSettings, themeMode, setThemeMode } = useCrm();

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto text-xs">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
          Workspace Settings & Display
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure business profile, order assignment logic, display appearance, and PWA settings.
        </p>
      </div>

      {/* Theme: Night & Day Settings */}
      <div className={`rounded-xl border p-5 space-y-4 transition ${
        themeMode === 'light' 
          ? 'bg-white border-slate-200 shadow-sm text-slate-900' 
          : 'bg-neutral-950 border-neutral-800 text-white'
      }`}>
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <span>Appearance & Theme Settings</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              themeMode === 'dark'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {themeMode === 'dark' ? 'Night Setting Active (Pure Black)' : 'Day Setting Active (Clean White)'}
            </span>
          </h3>
          <p className={`mt-1 text-xs ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Choose between an ultra-clean high-contrast Day setting or a pure OLED pitch-black Night setting with zero blue hue.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Night Setting Card */}
          <div
            onClick={() => setThemeMode('dark')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              themeMode === 'dark' 
                ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/50' 
                : themeMode === 'light'
                ? 'border-slate-200 bg-slate-50/80 hover:border-slate-300 text-slate-800'
                : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  themeMode === 'light' ? 'bg-slate-200 text-slate-700' : 'bg-neutral-900 text-emerald-400'
                }`}>
                  <Moon className="w-4 h-4" />
                </div>
                <span className={`font-bold text-xs ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Night Setting (Pure Black)
                </span>
              </div>
              {themeMode === 'dark' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
            </div>
            <p className={`text-[11px] leading-relaxed ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Pure OLED obsidian black background (#000000) with zero blue tint. Maximizes battery life, reduces glare, and provides extreme contrast.
            </p>
          </div>

          {/* Day Setting Card */}
          <div
            onClick={() => setThemeMode('light')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              themeMode === 'light' 
                ? 'border-amber-500 bg-amber-50/90 ring-1 ring-amber-500/40 text-slate-900 shadow-sm' 
                : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  themeMode === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  <Sun className="w-4 h-4" />
                </div>
                <span className={`font-bold text-xs ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Day Setting (Clean White)
                </span>
              </div>
              {themeMode === 'light' && <span className="w-2 h-2 rounded-full bg-amber-500" />}
            </div>
            <p className={`text-[11px] leading-relaxed ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Paper-white gallery setting with crisp slate text and high contrast. Ideal for bright offices and daylight viewing.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="font-semibold text-white text-sm">Order Routing Preferences</h3>
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={true}
            readOnly
            className="accent-emerald-500 w-4 h-4"
          />
          <span>Route Returning Customers to their Previous Sales Rep (Fallback to Round-Robin)</span>
        </label>
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notifyAdminsOnNewCarts}
            onChange={(e) => updateSettings({ notifyAdminsOnNewCarts: e.target.checked })}
            className="accent-emerald-500 w-4 h-4"
          />
          <span>Notify Admins on New Incomplete Abandoned Carts</span>
        </label>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <h3 className="font-semibold text-white text-sm">Progressive Web App (PWA)</h3>
        <p className="text-slate-400">
          Install BettaTraka as a standalone app on your iPhone, Android, or Mac with offline caching and instantaneous push alerts.
        </p>
        <PWAInstallButton />
      </div>

      {/* Customer Support Founder Note */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-2">
        <h3 className="font-semibold text-emerald-400 text-sm">Customer Support & Founder Concierge</h3>
        <p className="text-slate-300 leading-relaxed">
          "Hello, I am Emmanuel Oamen, founder of BettaTraka. Our mission is to eliminate WhatsApp chaos, Excel inventory leaks, and delivery agent losses for African payment-on-delivery merchants. If you need custom courier integrations or onboarding training, chat me directly."
        </p>
        <a
          href="https://wa.me/2348000000000?text=Hello%20Emmanuel,%20I%20am%20using%20BettaTraka%20CRM%20and%20need%20support."
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs mt-2"
        >
          <Headphones className="w-3.5 h-3.5" /> WhatsApp Founder Direct
        </a>
      </div>
    </div>
  );
};
