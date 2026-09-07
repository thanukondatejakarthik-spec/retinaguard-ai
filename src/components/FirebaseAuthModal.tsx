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
  KeyRound
} from 'lucide-react';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorCode?: string | null;
  errorMessage?: string | null;
  onContinueAsDemo: () => void;
  onRetryGoogleLogin: () => void;
}

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({
  isOpen,
  onClose,
  errorCode,
  errorMessage,
  onContinueAsDemo,
  onRetryGoogleLogin
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const isUnauthorizedDomain = errorCode?.includes('unauthorized-domain') || errorMessage?.includes('unauthorized-domain');
  const isPopupBlocked = errorCode?.includes('popup-blocked') || errorMessage?.includes('popup-blocked');
  const isClosedByUser = errorCode?.includes('popup-closed-by-user') || errorMessage?.includes('popup-closed-by-user');

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-cyan-950/50 flex flex-col gap-5 text-slate-100">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon and Title */}
        <div className="flex items-start gap-4 pr-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-snug">
              {isUnauthorizedDomain
                ? 'Firebase Domain Authorization Required'
                : isPopupBlocked
                ? 'Browser Login Popup Blocked'
                : 'Google Sign-In Resolution'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isUnauthorizedDomain
                ? 'Google OAuth security requires adding this preview domain to Firebase Authorized Domains.'
                : isPopupBlocked
                ? 'Your browser or the preview iframe blocked the Google authentication popup window.'
                : 'A Firebase Authentication configuration event occurred during Google sign-in.'}
            </p>
          </div>
        </div>

        {/* Explanation Card */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold font-mono text-[11px]">
            <Globe className="w-3.5 h-3.5" />
            <span>CURRENT HOSTNAME FOR AUTHORIZATION:</span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs text-slate-200">
            <span className="truncate select-all">{currentHostname}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 shrink-0"
              title="Copy hostname to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {errorMessage && (
            <div className="text-[11px] text-slate-400 font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 max-h-20 overflow-y-auto">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Action Options */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* Primary Recommended Option: Continue as Clinician */}
          <button
            type="button"
            onClick={() => {
              onContinueAsDemo();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition hover:scale-[1.01] cursor-pointer"
          >
            <Stethoscope className="w-4 h-4 text-slate-950" />
            <span>Continue as Rural Clinician (Instant Demo Mode)</span>
          </button>

          {/* Secondary Option: Open in New Window */}
          <button
            type="button"
            onClick={handleOpenInNewTab}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open in Standalone New Tab (Bypasses Iframe)</span>
          </button>

          {/* Tertiary Option: Retry */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onRetryGoogleLogin();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry Google Sign-In</span>
            </button>

            <a
              href="https://console.firebase.google.com/project/avid-sunspot-pghtt/authentication/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Firebase Console</span>
            </a>
          </div>
        </div>

        {/* Footer info notice */}
        <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 text-center flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          <span>Demo Mode gives immediate access to all Gemini AI vision, compression & PDF features.</span>
        </div>

      </div>
    </div>
  );
};
