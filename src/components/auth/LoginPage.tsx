import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Server, 
  ArrowLeft, 
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  KeyRound
} from 'lucide-react';
import { ForgotPasswordView } from './ForgotPasswordView';

interface LoginPageProps {
  initialMode?: 'login' | 'register' | 'forgot_password';
  onSuccess?: () => void;
  onNavigateHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialMode = 'login',
  onSuccess,
  onNavigateHome,
}) => {
  const { login, register, backendStatus, isAuthenticated, role: authRole } = useAuth();
  const { themeMode, toggleThemeMode, setPersona, setAdminActiveTab } = useCrm();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isLight = themeMode === 'light';

  // Listen to hash changes (e.g. #register vs #login vs #forgot-password)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#register') {
        setMode('register');
      } else if (hash === '#login') {
        setMode('login');
      } else if (hash === '#forgot-password' || hash.startsWith('#reset-password')) {
        setMode('forgot_password');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && authRole) {
      redirectUser(authRole);
    }
  }, [isAuthenticated, authRole]);

  const redirectUser = (role?: string | null) => {
    if (onSuccess) {
      onSuccess();
      return;
    }
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
      setAdminActiveTab('dashboard');
      window.location.hash = '#dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        setIsSubmitting(false);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to authenticate. Please check your credentials.');
          return;
        }
        setSuccessMessage('Authentication verified! Redirecting to workspace...');
        setTimeout(() => redirectUser(authRole), 350);
      } else {
        const res = await register({
          email,
          password,
          fullName,
          phone,
          organizationName,
        });
        setIsSubmitting(false);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to create workspace. Please check your inputs.');
          return;
        }
        setSuccessMessage('Workspace created successfully! Redirecting...');
        setTimeout(() => redirectUser('Owner'), 350);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Network error occurred. Please try again.');
    }
  };

  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      setPersona('marketing');
      window.location.hash = '#marketing';
    }
  };

  if (mode === 'forgot_password') {
    return (
      <ForgotPasswordView
        initialEmail={email}
        onBackToLogin={(prefilledEmail) => {
          if (prefilledEmail) setEmail(prefilledEmail);
          setMode('login');
          window.location.hash = '#login';
        }}
        onNavigateHome={handleGoHome}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-black text-slate-100'
    }`}>
      {/* Top bar for Login Page */}
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
          {/* Day/Night appearance toggle */}
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

          <button
            type="button"
            onClick={() => {
              setPersona('public_form');
              window.location.hash = '#order-form';
            }}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition hidden sm:flex items-center gap-1.5 cursor-pointer ${
              isLight 
                ? 'border-slate-200 hover:bg-slate-100 text-slate-700' 
                : 'border-neutral-800 hover:bg-neutral-900 text-slate-300'
            }`}
          >
            <span>Public Order Form</span>
          </button>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-md space-y-6 min-w-0">
          {/* Brand header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              {mode === 'login' ? 'Sign In to BettaTraka' : 'Create Merchant Workspace'}
            </h1>
            <p className={`text-xs sm:text-sm max-w-sm mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {mode === 'login'
                ? 'Enter your verified staff or owner credentials to access your CRM.'
                : 'Deploy your self-hosted POD workspace with real multi-tenant isolation.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className={`p-1 rounded-xl border flex gap-1 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setMode('login');
                window.location.hash = '#login';
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? (isLight ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'bg-emerald-600 text-white shadow-sm')
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200')
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setMode('register');
                window.location.hash = '#register';
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? (isLight ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'bg-emerald-600 text-white shadow-sm')
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200')
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Workspace</span>
            </button>
          </div>

          {/* Database Setup Notice if disconnected */}
          {backendStatus && !backendStatus.connected && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              isLight 
                ? 'bg-amber-50 border-amber-200 text-amber-900' 
                : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
            }`}>
              <Server className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <div className="space-y-1">
                <span className="font-bold block">PostgreSQL Notice</span>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {backendStatus.message}
                </p>
                <p className="text-[10px] font-mono opacity-80 pt-1">
                  Configure DATABASE_URL in .env on your VPS to enable database persistence.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Main Form */}
          <div className={`p-6 sm:p-8 rounded-2xl border shadow-xl ${
            isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-neutral-900/90 border-neutral-800 shadow-black'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 opacity-90">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Emeka Okafor"
                        className={`w-full text-xs rounded-xl pl-9 pr-3 py-2.5 border transition focus:outline-none ${
                          isLight 
                            ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500 focus:bg-white' 
                            : 'bg-black border-neutral-700 text-white focus:border-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 opacity-90">Store / Workspace Name</label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="Apex Herbal Logistics Ltd"
                        className={`w-full text-xs rounded-xl pl-9 pr-3 py-2.5 border transition focus:outline-none ${
                          isLight 
                            ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500 focus:bg-white' 
                            : 'bg-black border-neutral-700 text-white focus:border-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5 opacity-90">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="merchant@yourstore.ng"
                    className={`w-full text-xs rounded-xl pl-9 pr-3 py-2.5 border transition focus:outline-none ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500 focus:bg-white' 
                        : 'bg-black border-neutral-700 text-white focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold opacity-90">Password *</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setSuccessMessage(null);
                        setMode('forgot_password');
                        window.location.hash = '#forgot-password';
                      }}
                      className="text-[11px] font-semibold text-emerald-500 hover:text-emerald-400 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={`w-full text-xs rounded-xl pl-9 pr-10 py-2.5 border transition focus:outline-none ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500 focus:bg-white' 
                        : 'bg-black border-neutral-700 text-white focus:border-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'register' && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Must be at least 8 characters with letters, numbers, or symbols.
                  </p>
                )}
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-90">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 803 123 4567"
                      className={`w-full text-xs rounded-xl pl-9 pr-3 py-2.5 border transition focus:outline-none ${
                        isLight 
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500 focus:bg-white' 
                          : 'bg-black border-neutral-700 text-white focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-600 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Remember session</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      window.location.hash = '#register';
                    }}
                    className="text-emerald-500 hover:text-emerald-400 font-semibold cursor-pointer"
                  >
                    New business?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-[0.98] cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{mode === 'login' ? 'Authenticating...' : 'Creating Workspace...'}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Owner Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className={`mt-6 pt-4 border-t text-center text-xs ${
              isLight ? 'border-slate-100 text-slate-600' : 'border-neutral-800 text-slate-400'
            }`}>
              {mode === 'login' ? (
                <p>
                  Don't have a workspace account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('register');
                      window.location.hash = '#register';
                    }}
                    className="text-emerald-500 hover:text-emerald-400 font-bold ml-1 cursor-pointer"
                  >
                    Create Workspace
                  </button>
                </p>
              ) : (
                <p>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('login');
                      window.location.hash = '#login';
                    }}
                    className="text-emerald-500 hover:text-emerald-400 font-bold ml-1 cursor-pointer"
                  >
                    Sign In Here
                  </button>
                </p>
              )}
            </div>
          </div>
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
