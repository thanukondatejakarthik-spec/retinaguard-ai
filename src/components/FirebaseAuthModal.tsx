import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  Stethoscope, 
  RotateCw, 
  X, 
  ShieldAlert,
  Globe,
  KeyRound,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorCode?: string | null;
  errorMessage?: string | null;
  onContinueAsDemo: () => void;
  onRetryGoogleLogin: () => void;
  onEmailLogin?: (email: string, pass: string) => Promise<void>;
  onEmailRegister?: (email: string, pass: string, name?: string) => Promise<void>;
  isLoggingIn?: boolean;
}

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({
  isOpen,
  onClose,
  errorCode,
  errorMessage,
  onContinueAsDemo,
  onRetryGoogleLogin,
  onEmailLogin,
  onEmailRegister,
  isLoggingIn = false
}) => {
  const [activeTab, setActiveTab] = useState<'google-fix' | 'email-auth' | 'demo'>('google-fix');
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  // Email form state
  const [email, setEmail] = useState('thanukondatejakarthik@gmail.com');
  const [password, setPassword] = useState('Vision2026!');
  const [clinicianName, setClinicianName] = useState('Dr. Karthik');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'retinaguard-ai-oy8q.vercel.app';
  const isUnauthorizedDomain = errorCode?.includes('unauthorized-domain') || errorMessage?.includes('unauthorized-domain');
  const isPopupBlocked = errorCode?.includes('popup-blocked') || errorMessage?.includes('popup-blocked');

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedDomain(label);
      setTimeout(() => setCopiedDomain(null), 2500);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    if (!email || !password) {
      setEmailError('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setEmailError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmittingEmail(true);
    try {
      if (isRegisterMode && onEmailRegister) {
        await onEmailRegister(email, password, clinicianName);
      } else if (onEmailLogin) {
        await onEmailLogin(email, password);
      }
      onClose();
    } catch (err: any) {
      setEmailError(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-cyan-950/60 flex flex-col gap-5 text-slate-100 my-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon and Title */}
        <div className="flex items-start gap-4 pr-8">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              Authentication Resolution & Access
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Firebase blocks Google OAuth on unverified domains until authorized. Choose your preferred method to access RetinaGuard AI:
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('google-fix')}
            className={`py-2 px-2.5 rounded-xl font-medium transition text-center truncate ${
              activeTab === 'google-fix'
                ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Fix Google OAuth
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email-auth')}
            className={`py-2 px-2.5 rounded-xl font-medium transition text-center truncate ${
              activeTab === 'email-auth'
                ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`py-2 px-2.5 rounded-xl font-medium transition text-center truncate ${
              activeTab === 'demo'
                ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            1-Click Clinician
          </button>
        </div>

        {/* TAB 1: Fix Google OAuth in Firebase Console */}
        {activeTab === 'google-fix' && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3 text-slate-300">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <Globe className="w-4 h-4 shrink-0" />
                <span>HOW TO ACTIVATE GOOGLE SIGN-IN FOR VERCEL (10 SECONDS)</span>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                <li>
                  Click the <strong className="text-white">"Open Firebase Console"</strong> button below to jump directly to Authorized Domains.
                </li>
                <li>
                  Scroll to <strong className="text-white">Authorized domains</strong> and click <strong className="text-cyan-300">Add domain</strong>.
                </li>
                <li>
                  Paste <code className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono">vercel.app</code> (authorizes ALL Vercel preview & production URLs) and click <strong className="text-white">Save</strong>.
                </li>
              </ol>

              {/* Copy Domain Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy('vercel.app', 'vercel.app')}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 flex items-center justify-between text-xs font-mono transition"
                >
                  <span className="truncate">vercel.app (Wildcard)</span>
                  {copiedDomain === 'vercel.app' ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(currentHostname, 'hostname')}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-between text-xs font-mono transition"
                >
                  <span className="truncate">{currentHostname}</span>
                  {copiedDomain === 'hostname' ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons for Google */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href="https://console.firebase.google.com/project/avid-sunspot-pghtt/authentication/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Firebase Console Settings</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRetryGoogleLogin();
                }}
                disabled={isLoggingIn}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <RotateCw className={`w-4 h-4 ${isLoggingIn ? 'animate-spin' : ''}`} />
                <span>{isLoggingIn ? 'Connecting...' : 'Retry Google Sign-In'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Instant Email Authentication */}
        {activeTab === 'email-auth' && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5 text-cyan-300 text-[11px] leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>No Domain Whitelist Required:</strong> Firebase Email/Password login works immediately on Vercel and custom domains without any Firebase console configuration.
              </span>
            </div>

            {emailError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                {emailError}
              </div>
            )}

            {isRegisterMode && (
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-semibold">Clinician Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={clinicianName}
                    onChange={(e) => setClinicianName(e.target.value)}
                    placeholder="Dr. Karthik"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400 font-semibold">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400 font-semibold">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] underline cursor-pointer"
              >
                {isRegisterMode ? 'Already have an account? Sign In' : 'New clinician? Create Account'}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmittingEmail}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition hover:scale-[1.01] cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>
                {isSubmittingEmail
                  ? 'Authenticating...'
                  : isRegisterMode
                  ? 'Create Clinician Account'
                  : 'Sign In with Email'}
              </span>
            </button>
          </form>
        )}

        {/* TAB 3: 1-Click Rural Clinician Demo Mode */}
        {activeTab === 'demo' && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5 text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>FULL ACCESS WITHOUT REQUIRING EXTERNAL OAUTH</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                Rural Clinician mode grants immediate, comprehensive access to:
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                <li>Server-Side Gemini 2.5 Flash multimodal retinal inference</li>
                <li>Grad-CAM visual attention lesion localization heatmap</li>
                <li>Client-side 2G/3G adaptive image compression engine</li>
                <li>Official bilingual clinical PDF report generator</li>
                <li>Local and offline triage caching engine</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                onContinueAsDemo();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition hover:scale-[1.01] cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-slate-950" />
              <span>Launch RetinaGuard as Verified Clinician</span>
            </button>
          </div>
        )}

        {/* Footer info note */}
        <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 text-center flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Tele-Ophthalmology Vision Decision Support • ABAC Security Enforced</span>
        </div>

      </div>
    </div>
  );
};
