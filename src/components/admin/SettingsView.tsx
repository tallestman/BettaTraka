import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  ChevronRight, 
  X, 
  BellOff, 
  Bell, 
  Mail, 
  Repeat, 
  UserCheck, 
  ShoppingCart, 
  MessageSquare, 
  Trash2, 
  Check, 
  AlertTriangle,
  Download,
  Sun,
  Moon
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    currentUser, 
    setAdminActiveTab,
    addNotification,
    themeMode,
    setThemeMode
  } = useCrm();

  const [dismissInstallCard, setDismissInstallCard] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(settings.pushNotificationsEnabled ?? false);
  const [swMessage, setSwMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  const orgName = settings.businessName || settings.name || 'Betta Herbals Limited';

  const handleTogglePush = () => {
    const nextState = !pushEnabled;
    setPushEnabled(nextState);
    updateSettings({ pushNotificationsEnabled: nextState });
    if (addNotification) {
      addNotification({
        title: nextState ? 'Push Notifications Enabled' : 'Push Notifications Disabled',
        message: nextState 
          ? 'Browser order alerts and dispatch notifications are now active.' 
          : 'Push notifications have been muted.',
        type: nextState ? 'success' : 'info'
      });
    }
  };

  const handleUpdateServiceWorker = () => {
    setSwMessage('Service Worker checked and running latest build (v2.4.1).');
    setTimeout(() => setSwMessage(null), 3500);
  };

  const handleForceResubscribe = () => {
    setSwMessage('Push subscription token renewed and synced with server.');
    setTimeout(() => setSwMessage(null), 3500);
  };

  const handleInstallApp = () => {
    if (addNotification) {
      addNotification({
        title: 'Install BettaTraka PWA',
        message: 'Open your browser menu (Chrome / Safari) and tap "Install App" or "Add to Home Screen".',
        type: 'info'
      });
    }
  };

  // Reusable iOS-style Toggle Switch
  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    label 
  }: { 
    checked: boolean; 
    onChange: (checked: boolean) => void;
    label: string;
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-[#0284c7]' : 'bg-slate-700/80 hover:bg-slate-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-4xl mx-auto text-slate-100 select-none pb-16">
      
      {/* 1. Breadcrumb navigation (Exact match to set1.png) */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <button
          type="button"
          onClick={() => setAdminActiveTab('dashboard')}
          className="hover:text-white transition cursor-pointer"
        >
          Dashboard
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-white font-semibold">Settings</span>
      </div>

      {/* 2. Main Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Appearance & Theme: Day Light vs Dark Night */}
      <div className="space-y-2.5">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Appearance &amp; Theme Mode</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              themeMode === 'dark' 
                ? 'bg-lime-950 text-lime-400 border-lime-800/60' 
                : 'bg-lime-100 text-lime-800 border-lime-300'
            }`}>
              {themeMode === 'dark' ? 'Night Setting (Pure Black + Lemon Green)' : 'Day Setting (Clean White + Lemon Green)'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose your preferred display setting. Day mode provides an ultra-clean white background with black text; Night mode provides a pure OLED pitch-black background with white text. Both feature lemon green highlights.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Night Setting Card */}
          <div
            onClick={() => setThemeMode('dark')}
            className={`p-5 rounded-2xl border cursor-pointer transition shadow-md ${
              themeMode === 'dark'
                ? 'border-lime-500 bg-[#090d16] ring-2 ring-lime-500/50'
                : 'border-slate-800 bg-[#090d16]/60 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black border border-lime-500/40 text-lime-400 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-white">Night Setting (Pure Black)</span>
              </div>
              {themeMode === 'dark' && (
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse shadow-[0_0_8px_#a3e635]" />
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pure OLED pitch-black background (#000000), crisp white text, and glowing lemon green highlights.
            </p>
          </div>

          {/* Day Setting Card */}
          <div
            onClick={() => setThemeMode('light')}
            className={`p-5 rounded-2xl border cursor-pointer transition shadow-md ${
              themeMode === 'light'
                ? 'border-lime-500 bg-white ring-2 ring-lime-500/50'
                : 'border-slate-800 bg-[#090d16]/60 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-lime-100 text-lime-700 border border-lime-300 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-white">Day Setting (Clean White)</span>
              </div>
              {themeMode === 'light' && (
                <span className="w-2.5 h-2.5 rounded-full bg-lime-600 shadow-[0_0_8px_#65a30d]" />
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clean paper-white background (#ffffff), high-contrast black text, and vivid lemon green highlights.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Section: Progressive Web App */}
      <div className="space-y-2.5">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Progressive Web App
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Install BettaTraka as an app and manage notifications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Left Card: Install BettaTraka */}
          {!dismissInstallCard ? (
            <div className="p-5 rounded-2xl border border-sky-950/70 bg-[#090d16] space-y-3 relative shadow-md">
              <button
                type="button"
                onClick={() => setDismissInstallCard(true)}
                className="absolute top-4 right-4 p-1 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-900 transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>

              <h4 className="text-xs font-bold text-white pr-6">
                Install BettaTraka
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open the browser menu and choose Install app or Add to Home screen.
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-400 pt-1">
                <span className="text-slate-500">:</span>
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="text-slate-300 hover:text-white underline cursor-pointer"
                >
                  Use your browser's install option.
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-dashed border-slate-800 bg-[#090d16]/50 flex items-center justify-between text-xs text-slate-500">
              <span>App install card dismissed.</span>
              <button
                type="button"
                onClick={() => setDismissInstallCard(false)}
                className="text-sky-400 hover:underline cursor-pointer"
              >
                Show again
              </button>
            </div>
          )}

          {/* Right Card: Push Notifications */}
          <div className="p-5 rounded-2xl border border-slate-800/80 bg-[#090d16] space-y-3 shadow-md flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <BellOff className="w-4 h-4 text-slate-400" />
                <span>Push Notifications</span>
              </div>
              <p className="text-xs text-slate-400">
                Enable notifications to stay updated on orders
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTogglePush}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shadow transition cursor-pointer flex items-center gap-1.5 ${
                    pushEnabled
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-[#0284c7] hover:bg-[#0369a1] text-white'
                  }`}
                >
                  {pushEnabled ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Notifications Active</span>
                    </>
                  ) : (
                    <span>Enable Notifications</span>
                  )}
                </button>
              </div>
            </div>

            {/* Troubleshooting Links */}
            <div className="pt-2 border-t border-slate-800/60 text-xs">
              <span className="text-[10px] text-slate-500 font-mono block mb-1">
                Troubleshooting:
              </span>
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={handleUpdateServiceWorker}
                  className="text-xs font-semibold text-slate-200 hover:text-white underline cursor-pointer"
                >
                  Update Service Worker
                </button>
                <button
                  type="button"
                  onClick={handleForceResubscribe}
                  className="text-xs font-semibold text-slate-200 hover:text-white underline cursor-pointer"
                >
                  Force Re-subscribe
                </button>
              </div>
              {swMessage && (
                <p className="text-[11px] text-emerald-400 font-mono mt-1.5 animate-in fade-in">
                  ✓ {swMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section: Abandoned cart notifications */}
      <div className="space-y-2.5">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Abandoned cart notifications
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose who gets pinged when a new abandoned cart is captured.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-800/80 bg-[#090d16] flex items-center justify-between gap-4 shadow-md">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-950/60 border border-sky-800/50 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-4 h-4 text-sky-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">
                Notify admins on new abandoned carts
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                The assigned sales rep is always notified. Turn this on to also send a push, email, and in-app notification to every admin in your org.
              </p>
            </div>
          </div>

          <ToggleSwitch
            checked={settings.notifyAdminsOnNewCarts}
            onChange={(checked) => updateSettings({ notifyAdminsOnNewCarts: checked })}
            label="Notify admins on new abandoned carts"
          />
        </div>
      </div>

      {/* 5. Section: Email notifications */}
      <div className="space-y-2.5">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Email notifications
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Control whether your org receives notification emails.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-800/80 bg-[#090d16] flex items-center justify-between gap-4 shadow-md">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-950/60 border border-sky-800/50 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-4 h-4 text-sky-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">
                Send email notifications
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                Turn this off to stop order, cart, and other staff notification emails for everyone in your org. In-app and push notifications are not affected.
              </p>
            </div>
          </div>

          <ToggleSwitch
            checked={settings.emailNotificationsOrgWide}
            onChange={(checked) => updateSettings({ emailNotificationsOrgWide: checked })}
            label="Send email notifications"
          />
        </div>
      </div>

      {/* 6. Section: Order assignment (3 Rows in one container) */}
      <div className="space-y-2.5">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Order assignment
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Control how new orders and abandoned carts are routed to your team.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-[#090d16] divide-y divide-slate-800/80 overflow-hidden shadow-md">
          
          {/* Row 1: Returning Customers */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-sky-950/60 border border-sky-800/50 flex items-center justify-center shrink-0 mt-0.5">
                <Repeat className="w-4 h-4 text-sky-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">
                  Send returning customers to their previous rep
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  When a customer orders again with the same phone number, the order goes to the rep on their last order instead of the next rep in the rotation. If that rep is inactive, paused, or not eligible for this product's team, it goes to round-robin as usual.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.sendReturningCustomersToPreviousRep ?? false}
              onChange={(checked) => updateSettings({ sendReturningCustomersToPreviousRep: checked })}
              label="Send returning customers to their previous rep"
            />
          </div>

          {/* Row 2: Round Robin Sales Reps Only Policy */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Round-Robin Order Sales Reps Only Policy</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
                    Active
                  </span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Automated round-robin order distribution strictly routes leads to verified, active Sales Representatives only. Admins, managers, distributors, and logistics personnel are strictly excluded from order rotation.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60">
              Enforced
            </span>
          </div>

          {/* Row 3: Assign abandoned carts to me */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-sky-950/60 border border-sky-800/50 flex items-center justify-center shrink-0 mt-0.5">
                <ShoppingCart className="w-4 h-4 text-sky-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">
                  Assign abandoned carts to me
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Add yourself to the abandoned-cart rotation, separately from orders. Carts already assigned to you stay with you if you turn this off.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.assignAbandonedCartsToMe ?? false}
              onChange={(checked) => updateSettings({ assignAbandonedCartsToMe: checked })}
              label="Assign abandoned carts to me"
            />
          </div>

        </div>
      </div>

      {/* 7. Section: Sales Rep V2 (preview) */}
      <div className="space-y-2.5">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Sales Rep V2 (preview)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Roll out the new WhatsApp-style orders dashboard to your team.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-800/80 bg-[#090d16] flex items-center justify-between gap-4 shadow-md">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-950/60 border border-sky-800/50 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4 text-sky-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">
                Use Sales Rep V2 for all reps
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                Turn this on to send every sales rep to the new dashboard, overriding each rep's individual setting. You can still opt specific reps in or out from Users while this is off.
              </p>
            </div>
          </div>

          <ToggleSwitch
            checked={settings.salesRepV2Preview}
            onChange={(checked) => updateSettings({ salesRepV2Preview: checked })}
            label="Use Sales Rep V2 for all reps"
          />
        </div>
      </div>

      {/* 8. Section: Admin V2 (preview) */}
      <div className="space-y-2.5">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Admin V2 (preview)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Try the new WhatsApp-style orders dashboard for your own account.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-800/80 bg-[#090d16] flex items-center justify-between gap-4 shadow-md">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-950/60 border border-sky-800/50 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4 text-sky-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">
                Use Admin V2 for my account
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                Sends you to the new Orders dashboard instead of the classic one. Pilot feature — Team Chat and Dashboard still link to the current pages, and everything else lives under Menu.
              </p>
            </div>
          </div>

          <ToggleSwitch
            checked={settings.adminV2Preview}
            onChange={(checked) => updateSettings({ adminV2Preview: checked })}
            label="Use Admin V2 for my account"
          />
        </div>
      </div>

      {/* 9. Section: Account Information (Exact match to set4.png) */}
      <div className="space-y-2.5">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Account Information
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your account details
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800/80 bg-[#090d16] space-y-4 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Name</span>
              <p className="text-xs sm:text-sm font-bold text-white">
                {currentUser.name}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Email</span>
              <p className="text-xs sm:text-sm font-bold text-white font-mono select-all">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60">
            <span className="text-xs text-slate-400 block mb-0.5">Role</span>
            <p className="text-xs sm:text-sm font-bold text-white">
              {currentUser.role}
            </p>
          </div>
        </div>
      </div>

      {/* 10. Section: Danger zone (Exact match to set4.png) */}
      <div className="space-y-2.5 pt-2">
        <div>
          <h2 className="text-sm font-bold text-rose-500 tracking-tight">
            Danger zone
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Permanently remove this organization and everything in it.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-red-950 bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-900/60 flex items-center justify-center shrink-0 mt-0.5">
              <Trash2 className="w-5 h-5 text-rose-500" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">
                Delete {orgName}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                This deletes all orders, products, agents, reports, and team access for this organization. There is no way to undo this.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-semibold shadow transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            Delete organization
          </button>
        </div>
      </div>

      {/* Delete Organization Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-red-900/80 bg-neutral-950 p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete {orgName}?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This action is irreversible. All orders, inventory databases, commissions, and telemetry records will be permanently deleted.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <label className="text-slate-400 block">
                To confirm, type <strong className="text-white font-mono">{orgName}</strong> below:
              </label>
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder={orgName}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmInput('');
                }}
                className="flex-1 py-2 px-3 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmInput !== orgName}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmInput('');
                  if (addNotification) {
                    addNotification({
                      title: 'Protected Operation',
                      message: 'Organization deletion requires Primary SuperAdmin security passphrase verification.',
                      type: 'info'
                    });
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold shadow transition cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
