import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Copy, 
  Check, 
  RefreshCw 
} from 'lucide-react';

interface ForgotPasswordViewProps {
  initialEmail?: string;
  initialToken?: string;
  onBackToLogin: (prefilledEmail?: string) => void;
  onNavigateHome?: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  initialEmail = '',
  initialToken = '',
  onBackToLogin,
  onNavigateHome,
}) => {
  const { requestPasswordReset, verifyResetToken, resetPassword, backendStatus } = useAuth();
  const { themeMode, toggleThemeMode, setPersona } = useCrm();

  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState<string>(initialEmail);
  const [token, setToken] = useState<string>(initialToken);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);
  const [tokenVerified, setTokenVerified] = useState<boolean | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devTokenNotice, setDevTokenNotice] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  const isLight = themeMode === 'light';

  // Check URL params or hash query if token passed e.g. #reset-password?token=...
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const queryToken = url.searchParams.get('token');
      if (queryToken) {
        setToken(queryToken);
        setStep('reset');
      } else if (window.location.hash.includes('token=')) {
        const hashPart = window.location.hash.split('token=')[1];
        if (hashPart) {
          const cleanToken = hashPart.split('&')[0];
          setToken(cleanToken);
          setStep('reset');
        }
      } else if (initialToken) {
        setToken(initialToken);
        setStep('reset');
      }
    } catch {
      // Ignore parse error
    }
  }, [initialToken]);

  // Handle Token Request (Step 1)
  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setDevTokenNotice(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(email.trim().toLowerCase());
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.error || res.message || 'Unable to request password reset.');
        return;
      }

      setSuccessMessage(
        res.message || 'If an account exists, a password reset verification token has been generated.'
      );

      // In testing or self-hosted preview mode without SMTP relay, display the generated token
      if (res.resetToken) {
        setDevTokenNotice(res.resetToken);
        setToken(res.resetToken);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'A network error occurred.');
    }
  };

  // Verify Token when user enters or pastes it
  const handleVerifyTokenInput = async (tokenToVerify: string) => {
    if (!tokenToVerify || tokenToVerify.trim().length < 10) return;

    setIsVerifyingToken(true);
    setErrorMessage(null);

    const res = await verifyResetToken(tokenToVerify.trim());
    setIsVerifyingToken(false);

    if (res.valid) {
      setTokenVerified(true);
      if (res.email && !email) {
        setEmail(res.email);
      }
    } else {
      setTokenVerified(false);
      setErrorMessage(res.error || 'The entered verification token is invalid or has expired.');
    }
  };

  // Handle Password Reset Submission (Step 2)
  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token || token.trim().length === 0) {
      setErrorMessage('Please provide your verification token.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(token.trim(), newPassword);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.error || res.message || 'Failed to update password.');
        return;
      }

      setStep('success');
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Network error during password reset.');
    }
  };

  const handleCopyDevToken = () => {
    if (!devTokenNotice) return;
    navigator.clipboard.writeText(devTokenNotice);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleReturnHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      setPersona('marketing');
      window.location.hash = '#marketing';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-black text-slate-100'
    }`}>
      {/* Top Header */}
      <header className={`w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b ${
        isLight ? 'border-slate-200 bg-white/80' : 'border-neutral-800 bg-neutral-950/80'
      } backdrop-blur-md sticky top-0 z-30`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onBackToLogin(email)}
            className={`flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
              isLight 
                ? 'border-slate-200 hover:bg-slate-100 text-slate-700' 
                : 'border-neutral-800 hover:bg-neutral-900 text-slate-300'
            }`}
            title="Return to Login"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Sign In</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-sm text-white shadow-sm">
              B
            </div>
            <span className="font-bold tracking-tight text-sm sm:text-base">BettaTraka</span>
            <span className={`text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded border hidden sm:inline-block ${
              isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
            }`}>
              Password Recovery
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
            title={isLight ? 'Switch to Night Mode' : 'Switch to Day Mode'}
            aria-label="Toggle Theme"
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-lime-400" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-md min-w-0">
          {/* Step 1: Request Password Reset Link & Token */}
          {step === 'request' && (
            <div className={`p-4 sm:p-8 rounded-2xl border shadow-xl space-y-6 w-full max-w-full overflow-hidden ${
              isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-neutral-900/90 border-neutral-800 shadow-black'
            }`}>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Forgot Password?</h1>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} max-w-xs mx-auto leading-relaxed`}>
                  Enter the email address registered with your BettaTraka workspace to receive a verification token.
                </p>
              </div>

              {/* Status / Error Alerts */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2.5 animate-in fade-in break-words">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug break-words">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold leading-snug break-words">{successMessage}</p>
                    <p className="text-[11px] opacity-80">
                      Check your email, or proceed directly using the token input step below.
                    </p>
                  </div>
                </div>
              )}

              {/* Dev/Preview Token Helper (renders when token is generated for immediate testing) */}
              {devTokenNotice && (
                <div className={`p-3.5 rounded-xl border text-xs space-y-2.5 animate-in fade-in w-full max-w-full overflow-hidden ${
                  isLight ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Evaluation Token Generated</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20">
                      Expires in 1h
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    Because this environment is self-contained, your generated verification token is provided below for immediate testing:
                  </p>
                  <div className="flex items-center gap-2 min-w-0 w-full max-w-full">
                    <input
                      type="text"
                      readOnly
                      value={devTokenNotice}
                      className="flex-1 min-w-0 text-[11px] font-mono p-1.5 rounded border border-amber-300/60 dark:border-amber-700/60 bg-white/80 dark:bg-black/60 truncate select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyDevToken}
                      className="px-2 py-1.5 rounded border border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 transition text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('reset');
                      handleVerifyTokenInput(devTokenNotice);
                    }}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Proceed to Set New Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Request Form */}
              <form onSubmit={handleRequestToken} className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 absolute left-3.5 top-3 pointer-events-none ${
                      isLight ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <input
                      type="email"
                      required
                      placeholder="merchant@bettatraka.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs transition focus:outline-none focus:ring-2 ${
                        isLight 
                          ? 'border-slate-200 bg-white text-slate-900 focus:ring-emerald-500/20 focus:border-emerald-500' 
                          : 'border-neutral-800 bg-black/60 text-white focus:ring-emerald-500/30 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Verification Token...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Password Reset Token</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Navigation options */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onBackToLogin(email)}
                  className={`font-semibold transition cursor-pointer ${
                    isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ← Back to Sign In
                </button>

                <button
                  type="button"
                  onClick={() => setStep('reset')}
                  className="font-bold text-emerald-500 hover:text-emerald-400 transition cursor-pointer"
                >
                  I already have a token →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Verify Token & Enter New Password */}
          {step === 'reset' && (
            <div className={`p-4 sm:p-8 rounded-2xl border shadow-xl space-y-6 w-full max-w-full overflow-hidden ${
              isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-neutral-900/90 border-neutral-800 shadow-black'
            }`}>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Set New Password</h1>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} max-w-xs mx-auto leading-relaxed`}>
                  Enter the verification token from your email and select a strong replacement password.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2.5 animate-in fade-in break-words">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug break-words">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleExecuteReset} className="space-y-4">
                {/* Token Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Verification Token
                    </label>
                    {token && (
                      <button
                        type="button"
                        onClick={() => handleVerifyTokenInput(token)}
                        disabled={isVerifyingToken}
                        className="text-[10px] font-mono text-emerald-500 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${isVerifyingToken ? 'animate-spin' : ''}`} />
                        <span>Validate Token</span>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className={`w-4 h-4 absolute left-3.5 top-3 pointer-events-none ${
                      isLight ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <input
                      type="text"
                      required
                      placeholder="Paste your 64-character token"
                      value={token}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setToken(val);
                        if (val.length >= 64) {
                          handleVerifyTokenInput(val);
                        }
                      }}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-mono transition focus:outline-none focus:ring-2 ${
                        tokenVerified === true
                          ? 'border-emerald-500 focus:ring-emerald-500/20'
                          : tokenVerified === false
                          ? 'border-rose-500 focus:ring-rose-500/20'
                          : isLight
                          ? 'border-slate-200 bg-white text-slate-900 focus:ring-emerald-500/20 focus:border-emerald-500'
                          : 'border-neutral-800 bg-black/60 text-white focus:ring-emerald-500/30 focus:border-emerald-500'
                      }`}
                    />
                    {tokenVerified === true && (
                      <CheckCircle2 className="w-4 h-4 absolute right-3.5 top-3 text-emerald-500" />
                    )}
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className={`w-4 h-4 absolute left-3.5 top-3 pointer-events-none ${
                      isLight ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs transition focus:outline-none focus:ring-2 ${
                        isLight 
                          ? 'border-slate-200 bg-white text-slate-900 focus:ring-emerald-500/20 focus:border-emerald-500' 
                          : 'border-neutral-800 bg-black/60 text-white focus:ring-emerald-500/30 focus:border-emerald-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3.5 top-3 transition cursor-pointer ${
                        isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className={`w-4 h-4 absolute left-3.5 top-3 pointer-events-none ${
                      isLight ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs transition focus:outline-none focus:ring-2 ${
                        confirmPassword && confirmPassword !== newPassword
                          ? 'border-rose-500 focus:ring-rose-500/20'
                          : isLight 
                          ? 'border-slate-200 bg-white text-slate-900 focus:ring-emerald-500/20 focus:border-emerald-500' 
                          : 'border-neutral-800 bg-black/60 text-white focus:ring-emerald-500/30 focus:border-emerald-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3.5 top-3 transition cursor-pointer ${
                        isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Criteria Checklist */}
                <div className="p-3 rounded-xl border text-[11px] space-y-1.5 border-slate-200/60 dark:border-neutral-800/80 bg-slate-50/50 dark:bg-black/30">
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      newPassword.length >= 8 ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-neutral-800 text-transparent'
                    }`}>
                      ✓
                    </div>
                    <span className={newPassword.length >= 8 ? 'text-emerald-500 font-semibold' : 'opacity-70'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      newPassword && confirmPassword && newPassword === confirmPassword 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-300 dark:bg-neutral-800 text-transparent'
                    }`}>
                      ✓
                    </div>
                    <span className={newPassword && confirmPassword && newPassword === confirmPassword ? 'text-emerald-500 font-semibold' : 'opacity-70'}>
                      Passwords match
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || newPassword.length < 8 || newPassword !== confirmPassword}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Reset Password & Update Session</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-200/60 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className={`font-semibold transition cursor-pointer ${
                    isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ← Request a new token
                </button>

                <button
                  type="button"
                  onClick={() => onBackToLogin(email)}
                  className={`font-semibold transition cursor-pointer ${
                    isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cancel & Sign In
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success Screen */}
          {step === 'success' && (
            <div className={`p-4 sm:p-8 rounded-2xl border shadow-xl text-center space-y-6 animate-in fade-in w-full max-w-full overflow-hidden ${
              isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-neutral-900/90 border-neutral-800 shadow-black'
            }`}>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Password Reset Successfully!
                </h1>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} max-w-sm mx-auto leading-relaxed`}>
                  Your password has been securely updated in the database. All existing active sessions have been revoked for your safety.
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-center gap-2 ${
                isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
              }`}>
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">Security Update Complete</span>
              </div>

              <button
                type="button"
                onClick={() => onBackToLogin(email)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-[0.98] cursor-pointer"
              >
                <span>Sign In With New Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>
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
