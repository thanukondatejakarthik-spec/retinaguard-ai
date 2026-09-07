import React from 'react';
import { Eye, Shield, Globe, Wifi, WifiOff, LogIn, LogOut, Activity, FileText, User as UserIcon, Stethoscope } from 'lucide-react';
import type { SupportedLanguage, BandwidthMode, UserProfile, AppUser } from '../types';
import type { User } from 'firebase/auth';
import { translations } from '../data/i18n';

interface NavbarProps {
  currentTab: 'landing' | 'dashboard' | 'screening' | 'history' | 'telemetry';
  setCurrentTab: (tab: 'landing' | 'dashboard' | 'screening' | 'history' | 'telemetry') => void;
  user: AppUser | User | null;
  userProfile: UserProfile | null;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  bandwidthMode: BandwidthMode;
  setBandwidthMode: (mode: BandwidthMode) => void;
  onLogin: () => void;
  onLoginDemo?: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  userProfile,
  language,
  setLanguage,
  bandwidthMode,
  setBandwidthMode,
  onLogin,
  onLoginDemo,
  onLogout,
  isLoggingIn
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div 
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Eye className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white group-hover:text-cyan-300 transition">
                RetinaGuard <span className="text-cyan-400 font-mono">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950/90 text-cyan-300 border border-cyan-500/30">
                ICDR Scaled
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setCurrentTab('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              currentTab === 'landing'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.nav.home}
          </button>

          {user && (
            <>
              <button
                type="button"
                onClick={() => setCurrentTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentTab === 'dashboard'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.nav.dashboard}
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('screening')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentTab === 'screening'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.nav.screening}
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentTab === 'history'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.nav.history}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setCurrentTab('telemetry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              currentTab === 'telemetry'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            {t.nav.telemetry}
          </button>
        </nav>

        {/* Right Utility Controls: Language, Rural Bandwidth Mode, Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Rural Bandwidth Toggle */}
          <button
            type="button"
            onClick={() => setBandwidthMode(bandwidthMode === 'rural-2g' ? 'standard' : 'rural-2g')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition ${
              bandwidthMode === 'rural-2g'
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle client-side compression for rural 2G/3G connectivity"
          >
            {bandwidthMode === 'rural-2g' ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Rural 2G Mode</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Standard</span>
              </>
            )}
          </button>

          {/* Multilingual Selector */}
          <div className="flex items-center bg-slate-900/80 rounded-xl border border-slate-800 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg transition font-medium ${
                language === 'en' ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('te')}
              className={`px-2 py-1 rounded-lg transition font-medium ${
                language === 'te' ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              తెలుగు
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded-lg transition font-medium ${
                language === 'hi' ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Real Google Account Auth or Clinician Mode */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end text-right">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                    {user.displayName || 'Healthcare Specialist'}
                  </span>
                  {user.isDemo && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      DEMO
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {userProfile?.facilityName || 'Rural PHC'}
                </span>
              </div>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-cyan-500/40 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-xs font-bold">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {onLoginDemo && (
                <button
                  type="button"
                  onClick={onLoginDemo}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/60 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="Instant access as rural medical officer without Google sign-in"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Clinician Demo</span>
                </button>
              )}

              <button
                type="button"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 font-semibold text-xs flex items-center gap-1.5 hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-950" />
                <span>{isLoggingIn ? 'Connecting...' : t.nav.signIn}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile secondary tab bar */}
      <div className="lg:hidden border-t border-slate-800/80 px-4 py-1.5 flex items-center justify-around bg-slate-950/90 text-xs">
        <button
          type="button"
          onClick={() => setCurrentTab('landing')}
          className={`py-1 px-2 rounded font-medium ${currentTab === 'landing' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          {t.nav.home}
        </button>
        {user && (
          <>
            <button
              type="button"
              onClick={() => setCurrentTab('dashboard')}
              className={`py-1 px-2 rounded font-medium ${currentTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400'}`}
            >
              {t.nav.dashboard}
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('screening')}
              className={`py-1 px-2 rounded font-medium ${currentTab === 'screening' ? 'text-cyan-400' : 'text-slate-400'}`}
            >
              {t.nav.screening}
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('history')}
              className={`py-1 px-2 rounded font-medium ${currentTab === 'history' ? 'text-cyan-400' : 'text-slate-400'}`}
            >
              {t.nav.history}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setCurrentTab('telemetry')}
          className={`py-1 px-2 rounded font-medium ${currentTab === 'telemetry' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          {t.nav.telemetry}
        </button>
      </div>
    </header>
  );
};
