import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import { 
  LogOut, 
  CheckCircle2, 
  ArrowLeft, 
  LogIn, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Home, 
  User, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';

interface LogoutPageProps {
  onNavigateHome?: () => void;
  onNavigateLogin?: () => void;
}

export const LogoutPage: React.FC<LogoutPageProps> = ({
  onNavigateHome,
  onNavigateLogin,
}) => {
  const { user, activeOrganization, role, logout, isAuthenticated } = useAuth();
  const { themeMode, toggleThemeMode, setPersona, logout: crmLogout } = useCrm();

  const [hasLoggedOut, setHasLoggedOut] = useState<boolean>(!isAuthenticated);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [isCountdownPaused, setIsCountdownPaused] = useState<boolean>(false);

  const isLight = themeMode === 'light';

  // Handle logout execution
  const handlePerformLogout = async () => {
    setIsProcessing(true);
    try {
      await logout();
      crmLogout();
    } catch (err) {
      console.warn('Logout notice:', err);
    } finally {
      setIsProcessing(false);
      setHasLoggedOut(true);
    }
  };

  // Auto-redirect countdown once logged out
  useEffect(() => {
    if (!hasLoggedOut || isCountdownPaused) return;

    if (countdown <= 0) {
      handleGoLogin();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [hasLoggedOut, countdown, isCountdownPaused]);

  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      setPersona('marketing');
      window.location.hash = '#marketing';
    }
  };

  const handleGoLogin = () => {
    if (onNavigateLogin) {
      onNavigateLogin();
    } else {
      setPersona('login');
      window.location.hash = '#login';
    }
  };

  const handleCancel = () => {
    if (role === 'Sales Representative') {
      setPersona('rep');
      window.location.hash = '#rep';
    } else if (role === 'Distributor') {
      setPersona('distributor');
      window.location.hash = '#distributor';
    } else if (role === 'Inventory Manager') {
      setPersona('inventory');
      window.location.hash = '#inventory';
    } else if (role === 'Accountant') {
      setPersona('accountant');
      window.location.hash = '#accountant';
    } else if (role === 'Manager') {
      setPersona('manager');
      window.location.hash = '#manager';
    } else if (role === 'Media Buyer') {
      setPersona('media_buyer');
      window.location.hash = '#media-buyer';
    } else {
      setPersona('admin');
      window.location.hash = '#dashboard';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-black text-slate-100'
    }`}>
      {/* Header */}
      <header className={`w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b ${
        isLight ? 'border-slate-200 bg-white/80' : 'border-neutral-800 bg-neutral-950/80'
      } backdrop-blur-md sticky top-0 z-30`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoHome}
            className={`flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
              isLight 
                ? 'border-slate-200 hover:bg-slate-100 text-slate-700' 
                : 'border-neutral-800 hover:bg-neutral-900 text-slate-300'
            }`}
            title="Return to Marketing Homepage"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-sm text-white shadow-sm">
              B
            </div>
            <span className="font-bold tracking-tight text-sm sm:text-base">BettaTraka</span>
            <span className={`text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded border hidden sm:inline-block ${
              isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
            }`}>
              POD CRM
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleThemeMode}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              isLight 
                ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800' 
                : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-lime-400'
            }`}
            title={isLight ? "Switch to Night Mode" : "Switch to Day Mode"}
            aria-label="Toggle Night/Day Mode"
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-lime-400" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-md min-w-0">
          {!hasLoggedOut && isAuthenticated ? (
            /* Confirmation Card */
            <div className={`p-4 sm:p-8 rounded-2xl border shadow-xl text-center space-y-6 w-full max-w-full overflow-hidden ${
              isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-neutral-900/90 border-neutral-800 shadow-black'
            }`}>
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center shadow-inner">
                <LogOut className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Sign Out of BettaTraka?
                </h1>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} max-w-sm mx-auto leading-relaxed`}>
                  You are currently signed into your merchant workspace. Confirming will revoke your session token on the server.
                </p>
              </div>

              {/* Active Profile Snapshot */}
              <div className={`p-4 rounded-xl border text-left space-y-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/60 border-neutral-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm text-white shrink-0">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{user?.fullName || 'Active Staff Member'}</p>
                    <p className="text-[11px] opacity-70 truncate">{user?.email}</p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border shrink-0 ${
                    isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}>
                    {role || 'Staff'}
                  </span>
                </div>

                {activeOrganization && (
                  <div className="pt-2 border-t border-slate-200/40 dark:border-neutral-800/80 flex items-center gap-2 text-xs opacity-80 min-w-0">
                    <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{activeOrganization.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handlePerformLogout}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Terminating Session...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Confirm & Sign Out</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className={`w-full py-2.5 rounded-xl border font-semibold text-xs transition cursor-pointer ${
                    isLight 
                      ? 'border-slate-200 hover:bg-slate-100 text-slate-700' 
                      : 'border-neutral-800 hover:bg-neutral-800 text-slate-300'
                  }`}
                >
                  Stay Signed In & Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* Logged Out Success View */
            <div className={`p-4 sm:p-8 rounded-2xl border shadow-xl text-center space-y-6 animate-in fade-in w-full max-w-full overflow-hidden ${
              isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-neutral-900/90 border-neutral-800 shadow-black'
            }`}>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-black tracking-tight">
                  Successfully Signed Out
                </h1>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} max-w-sm mx-auto leading-relaxed`}>
                  Your session token has been invalidated on the server and security cookies have been cleared from this device.
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
              }`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Session Terminated Safely</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCountdownPaused(!isCountdownPaused)}
                  className="text-[11px] font-mono underline hover:no-underline cursor-pointer opacity-80"
                >
                  {isCountdownPaused ? 'Resume countdown' : `Auto-redirect in ${countdown}s`}
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleGoLogin}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-[0.98] cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In Again</span>
                </button>

                <button
                  type="button"
                  onClick={handleGoHome}
                  className={`w-full py-2.5 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                    isLight 
                      ? 'border-slate-200 hover:bg-slate-100 text-slate-700' 
                      : 'border-neutral-800 hover:bg-neutral-800 text-slate-300'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Return to Homepage</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={`w-full py-4 px-4 text-center text-xs border-t ${
        isLight ? 'border-slate-200 text-slate-500' : 'border-neutral-900 text-slate-500'
      }`}>
        <p>© 2026 BettaTraka. Self-Hosted Multi-Tenant POD CRM.</p>
      </footer>
    </div>
  );
};
