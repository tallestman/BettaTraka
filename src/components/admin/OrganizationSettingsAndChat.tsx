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

export const UserManagementView: React.FC = () => {
  const { users, addUser, updateUser } = useCrm();
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<User | null>(null);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            User Management & Opt-In Permissions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Role-based access control. Managers see nothing by default until opted-in per operational category.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 font-medium">User Profile</th>
                <th className="py-3 px-4 font-medium">Assigned Role</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Joined Date</th>
                <th className="py-3 px-4 font-medium text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{u.name}</p>
                    <p className="text-[10px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{u.role}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{u.createdAt}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedUserForPerms(u)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium"
                    >
                      Permissions ({u.role === 'Manager' ? 'Opt-In Matrix' : 'Standard'})
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Modal */}
      {selectedUserForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100 max-h-[85vh] overflow-y-auto">
            <h3 className="font-semibold text-white text-base mb-1">
              Permission Scopes: {selectedUserForPerms.name} ({selectedUserForPerms.role})
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Toggle specific category modules permitted for this staff member.
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono uppercase text-emerald-400 font-bold text-[10px]">1. SALES MODULES</span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-emerald-500" /> Orders Access</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-emerald-500" /> Sales Reps Dashboard</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-emerald-500" /> Customers CRM</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-emerald-500" /> Deliveries Queue</label>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono uppercase text-cyan-400 font-bold text-[10px]">2. OPERATIONS & STOCK</span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-emerald-500" /> Delivery Agents Hub</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-emerald-500" /> Global Inventory</label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="accent-emerald-500" /> Round Robin Config</label>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono uppercase text-amber-400 font-bold text-[10px]">3. FINANCE & ACCOUNTING</span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <label className="flex items-center gap-2"><input type="checkbox" className="accent-emerald-500" /> Financial Reports & P&L</label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="accent-emerald-500" /> Expenses Recording</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-emerald-500" /> Agent Remittances</label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="accent-emerald-500" /> Payroll Run & Bonus</label>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedUserForPerms(null)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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

export const IntegrationsView: React.FC = () => {
  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Store & Marketing Integrations
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Connect your WooCommerce store, Shopify, Meta CAPI Pixel, and WhatsApp Business API.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WooCommerce */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">WooCommerce Webhook</h3>
            <span className="text-emerald-400 font-mono text-[10px]">CONNECTED</span>
          </div>
          <p className="text-slate-400">
            Automatically ingests orders into BettaTraka upon customer submission.
          </p>
          <div className="space-y-1 font-mono text-[11px]">
            <span className="text-slate-500 block">Webhook URL:</span>
            <input readOnly value="https://api.bettatraka.com/v1/webhooks/woocommerce/ord_live_891" className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 text-[11px]" />
          </div>
        </div>

        {/* WhatsApp Business Meta Cloud API */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">WhatsApp Business Cloud API</h3>
            <span className="text-emerald-400 font-mono text-[10px]">ACTIVE</span>
          </div>
          <p className="text-slate-400">
            Official Meta Cloud API connection for automated dispatch tracking messages and rep notifications.
          </p>
          <button className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">
            Send Test Customer Message
          </button>
        </div>

        {/* Meta Conversions API (CAPI) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Meta Conversions API (CAPI)</h3>
            <span className="text-emerald-400 font-mono text-[10px]">ACTIVE</span>
          </div>
          <p className="text-slate-400">
            Sends server-side Lead and Purchase events to your Meta Pixel ID to optimize ad conversion delivery.
          </p>
          <div className="space-y-1 font-mono text-[11px]">
            <span className="text-slate-500 block">Pixel ID:</span>
            <input readOnly value="908124981729012" className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 text-[11px]" />
          </div>
        </div>

        {/* Shopify Store */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Shopify Store App</h3>
            <span className="text-slate-400 font-mono text-[10px]">READY</span>
          </div>
          <p className="text-slate-400">
            Sync inventory and orders directly from your Shopify store into BettaTraka.
          </p>
          <button className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium">
            Connect Shopify Store
          </button>
        </div>
      </div>
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
          <input readOnly value={`https://ordello.ng/join?ref=${settings.referralCode}`} className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
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
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <span>Appearance & Theme Settings</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              {themeMode === 'dark' ? 'Night Setting Active' : 'Day Setting Active'}
            </span>
          </h3>
          <p className="text-slate-400 mt-1">
            Choose between an ultra-clean high-contrast Day setting or a refined dark Night setting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div
            onClick={() => setThemeMode('dark')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              themeMode === 'dark' 
                ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/50' 
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                  <Moon className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-xs">Night Mode (Dark)</span>
              </div>
              {themeMode === 'dark' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Refined deep titanium & obsidian palette. Reduces eye fatigue during long shifts and evening dispatch monitoring.
            </p>
          </div>

          <div
            onClick={() => setThemeMode('light')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              themeMode === 'light' 
                ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/50' 
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Sun className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-xs">Day Mode (Light)</span>
              </div>
              {themeMode === 'light' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
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
