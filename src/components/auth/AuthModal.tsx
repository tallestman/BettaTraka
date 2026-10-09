import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, User, Building, X, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    showLoginModal,
    setShowLoginModal,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    backendStatus,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showLoginModal) return null;

  const isLogin = authModalMode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    if (isLogin) {
      const res = await login(email, password);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Login failed. Please check credentials.');
      }
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
        setErrorMsg(res.error || 'Registration failed. Please check details.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {isLogin ? 'Sign In to BettaTraka' : 'Create Merchant Workspace'}
          </h2>
          <p className="text-xs text-slate-400">
            {isLogin
              ? 'Enter your staff or owner credentials to access your CRM.'
              : 'Launch your self-hosted POD business workspace.'}
          </p>
        </div>

        {/* Database Warning if disconnected */}
        {backendStatus && !backendStatus.connected && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-1">
              <span className="font-bold block">PostgreSQL Notice</span>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                {backendStatus.message}
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!isLogin && (
            <>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Emeka Okafor"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Workspace / Store Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Apex Herbal Logistics Ltd"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@yourstore.ng"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold block">Password *</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    window.location.hash = '#forgot-password';
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 123 4567"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-950/40 transition active:scale-[0.98] cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Authenticating...' : isLogin ? 'Sign In to Workspace' : 'Create Owner Account'}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          {isLogin ? (
            <p>
              Need a new workspace?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setAuthModalMode('register');
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 cursor-pointer"
              >
                Create Workspace
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setAuthModalMode('login');
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
