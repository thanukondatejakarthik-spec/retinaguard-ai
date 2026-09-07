import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { 
  UserProfile, 
  ScreeningRecord, 
  SupportedLanguage, 
  BandwidthMode,
  AppUser
} from './types';
import { 
  subscribeToAuth, 
  signInWithGoogle, 
  signInWithEmail,
  signUpWithEmail,
  logoutUser, 
  getUserProfile, 
  saveUserProfile, 
  subscribeToUserScreenings, 
  deleteScreeningRecord,
  createDemoClinician,
  getSavedDemoClinician,
  clearDemoClinician
} from './lib/firebase';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ScreeningWorkflow } from './components/ScreeningWorkflow';
import { ScreeningHistory } from './components/ScreeningHistory';
import { AdminTelemetry } from './components/AdminTelemetry';
import { ExplainableHeatmapViewer } from './components/ExplainableHeatmapViewer';
import { FirebaseAuthModal } from './components/FirebaseAuthModal';
import { AlertTriangle, Lock, Eye, LogIn, Heart, ShieldCheck, X, Stethoscope } from 'lucide-react';
import { translations } from './data/i18n';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'dashboard' | 'screening' | 'history' | 'telemetry'>('landing');
  const [user, setUser] = useState<AppUser | User | null>(() => getSavedDemoClinician());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const savedDemo = getSavedDemoClinician();
    if (savedDemo) {
      return {
        id: savedDemo.uid,
        email: savedDemo.email,
        displayName: savedDemo.displayName,
        photoURL: savedDemo.photoURL,
        role: 'clinician',
        facilityName: 'Primary Health Center (Rural Vision Hub)',
        createdAt: new Date().toISOString()
      };
    }
    return null;
  });
  const [screenings, setScreenings] = useState<ScreeningRecord[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Internationalization and Low-Bandwidth Mode
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [bandwidthMode, setBandwidthMode] = useState<BandwidthMode>('standard');

  // Modal for inspecting specific past screening from anywhere
  const [inspectRecord, setInspectRecord] = useState<ScreeningRecord | null>(null);

  const t = translations[language];

  // Subscribe to real Firebase Google Authentication State
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      setIsLoadingAuth(false);

      if (currentUser) {
        setUser(currentUser);
        // Load or create Firestore user profile
        try {
          let profile = await getUserProfile(currentUser.uid);
          if (!profile) {
            profile = {
              id: currentUser.uid,
              displayName: currentUser.displayName || 'Healthcare Specialist',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || undefined,
              role: 'clinician',
              facilityName: 'Primary Health Center (Rural Vision Hub)',
              createdAt: new Date().toISOString()
            };
            await saveUserProfile(profile);
          }
          setUserProfile(profile);
        } catch (e) {
          console.warn('[Firebase] Notice while loading user profile from Firestore:', e);
        }
      } else {
        // If not authenticated via Google, check if demo clinician is active
        const savedDemo = getSavedDemoClinician();
        if (savedDemo) {
          setUser(savedDemo);
          setUserProfile({
            id: savedDemo.uid,
            email: savedDemo.email,
            displayName: savedDemo.displayName,
            photoURL: savedDemo.photoURL,
            role: 'clinician',
            facilityName: 'Primary Health Center (Rural Vision Hub)',
            createdAt: new Date().toISOString()
          });
        } else {
          setUser(null);
          setUserProfile(null);
          setScreenings([]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time sync of screening records for authenticated or demo user
  useEffect(() => {
    if (!user) {
      setScreenings([]);
      return;
    }

    const unsubscribeScreenings = subscribeToUserScreenings(user.uid, (records) => {
      setScreenings(records);
    });

    return () => unsubscribeScreenings();
  }, [user]);

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    setAuthErrorCode(null);
    try {
      await signInWithGoogle();
      setShowAuthModal(false);
      setCurrentTab('dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      // Normal user dismissal / window close: do not alarm the user
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        console.info('Google Sign In popup was dismissed by user.');
        return;
      }
      if (code === 'auth/unauthorized-domain') {
        console.warn('Google Sign In requires domain authorization in Firebase Console:', window?.location?.hostname);
        setAuthErrorCode(code);
        setAuthError(`This domain (${window?.location?.hostname || 'preview'}) requires authorization in Firebase Console. Click "Continue as Clinician" below for immediate access.`);
        setShowAuthModal(true);
        return;
      }
      console.warn('Google Sign In notice:', err?.message || err);
      const msg = err?.message || 'Google authentication failed. Please try again.';
      setAuthErrorCode(code);
      setAuthError(msg);
      setShowAuthModal(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Email Login Handler (Works on all domains without OAuth whitelist)
  const handleEmailLogin = async (emailInput: string, passInput: string) => {
    setIsLoggingIn(true);
    setAuthError(null);
    setAuthErrorCode(null);
    try {
      await signInWithEmail(emailInput, passInput);
      setShowAuthModal(false);
      setCurrentTab('dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        // Fall back gracefully to active clinician session with this email
        console.warn('Firebase Email provider disabled in console, activating instant clinician session for:', emailInput);
        const demoUser = createDemoClinician(emailInput, 'Dr. Karthik');
        setUser(demoUser);
        setUserProfile({
          id: demoUser.uid,
          email: demoUser.email,
          displayName: demoUser.displayName,
          photoURL: demoUser.photoURL,
          role: 'clinician',
          facilityName: 'Primary Health Center (Rural Vision Hub)',
          createdAt: new Date().toISOString()
        });
        setShowAuthModal(false);
        setCurrentTab('dashboard');
        return;
      }
      console.warn('Email Sign In notice:', err?.message || err);
      const msg = err?.message || 'Email sign-in failed. Please verify email and password.';
      setAuthErrorCode(code);
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Email Register Handler
  const handleEmailRegister = async (emailInput: string, passInput: string, name?: string) => {
    setIsLoggingIn(true);
    setAuthError(null);
    setAuthErrorCode(null);
    try {
      await signUpWithEmail(emailInput, passInput, name);
      setShowAuthModal(false);
      setCurrentTab('dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        console.warn('Firebase Email provider disabled in console, activating instant clinician session for:', emailInput);
        const demoUser = createDemoClinician(emailInput, name || 'Dr. Karthik');
        setUser(demoUser);
        setUserProfile({
          id: demoUser.uid,
          email: demoUser.email,
          displayName: demoUser.displayName,
          photoURL: demoUser.photoURL,
          role: 'clinician',
          facilityName: 'Primary Health Center (Rural Vision Hub)',
          createdAt: new Date().toISOString()
        });
        setShowAuthModal(false);
        setCurrentTab('dashboard');
        return;
      }
      console.warn('Email Register notice:', err?.message || err);
      const msg = err?.message || 'Email registration failed.';
      setAuthErrorCode(code);
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Instant Clinician Demo Login (Bypasses Firebase Auth constraints in preview iframe)
  const handleLoginDemo = (customEmail?: string, customName?: string) => {
    const demoUser = createDemoClinician(customEmail, customName);
    setUser(demoUser);
    setUserProfile({
      id: demoUser.uid,
      email: demoUser.email,
      displayName: demoUser.displayName,
      photoURL: demoUser.photoURL,
      role: 'clinician',
      facilityName: 'Primary Health Center (Rural Vision Hub)',
      createdAt: new Date().toISOString()
    });
    setAuthError(null);
    setAuthErrorCode(null);
    setShowAuthModal(false);
    setCurrentTab('dashboard');
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      clearDemoClinician();
      await logoutUser();
      setUser(null);
      setUserProfile(null);
      setScreenings([]);
      setCurrentTab('landing');
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
      setCurrentTab('landing');
    }
  };

  // Delete screening from Firestore / Local cache
  const handleDeleteScreening = async (recordId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this screening record?')) {
      try {
        await deleteScreeningRecord(recordId);
      } catch (err) {
        console.error('Failed to delete record:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        userProfile={userProfile}
        language={language}
        setLanguage={setLanguage}
        bandwidthMode={bandwidthMode}
        setBandwidthMode={setBandwidthMode}
        onLogin={handleGoogleLogin}
        onLoginDemo={handleLoginDemo}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
      />

      {/* Auth Error Notification Banner */}
      {authError && (
        <div className="bg-rose-950/80 border-b border-rose-500/40 px-4 py-2.5 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">{authError}</span>
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="ml-2 px-2.5 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 font-semibold text-[11px] underline cursor-pointer shrink-0"
            >
              Resolve / Sign In Options
            </button>
          </div>
          <button 
            type="button"
            onClick={() => setAuthError(null)}
            className="text-rose-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {isLoadingAuth ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse">
              <Eye className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
            <p className="text-xs text-slate-400 font-mono">Initializing RetinaGuard Secure Environment...</p>
          </div>
        ) : (
          <>
            {/* Landing Page */}
            {currentTab === 'landing' && (
              <LandingPage
                language={language}
                onLogin={handleGoogleLogin}
                onLoginDemo={handleLoginDemo}
                onExploreWorkflow={() => {
                  const element = document.getElementById('workflow');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                isAuthenticated={!!user}
                onOpenScreening={() => setCurrentTab('screening')}
              />
            )}

            {/* Authenticated Dashboard */}
            {currentTab === 'dashboard' && (
              user ? (
                <Dashboard
                  user={user}
                  userProfile={userProfile}
                  screenings={screenings}
                  onStartScreening={() => setCurrentTab('screening')}
                  onSelectScreening={(record) => setInspectRecord(record)}
                  onDeleteScreening={handleDeleteScreening}
                  language={language}
                />
              ) : (
                <RequireAuthBanner 
                  onLogin={handleGoogleLogin} 
                  onLoginDemo={handleLoginDemo} 
                  onOpenAuthModal={() => setShowAuthModal(true)}
                  isLoggingIn={isLoggingIn} 
                />
              )
            )}

            {/* Screening Workflow */}
            {currentTab === 'screening' && (
              user ? (
                <ScreeningWorkflow
                  user={user}
                  onScreeningComplete={(newRecord) => {
                    // Switch to history or keep on screening results
                  }}
                  language={language}
                  bandwidthMode={bandwidthMode}
                />
              ) : (
                <RequireAuthBanner 
                  onLogin={handleGoogleLogin} 
                  onLoginDemo={handleLoginDemo} 
                  onOpenAuthModal={() => setShowAuthModal(true)}
                  isLoggingIn={isLoggingIn} 
                />
              )
            )}

            {/* Screening History */}
            {currentTab === 'history' && (
              user ? (
                <ScreeningHistory
                  user={user}
                  screenings={screenings}
                  onDeleteScreening={handleDeleteScreening}
                  language={language}
                />
              ) : (
                <RequireAuthBanner 
                  onLogin={handleGoogleLogin} 
                  onLoginDemo={handleLoginDemo} 
                  onOpenAuthModal={() => setShowAuthModal(true)}
                  isLoggingIn={isLoggingIn} 
                />
              )
            )}

            {/* Model & Architecture Telemetry */}
            {currentTab === 'telemetry' && (
              <AdminTelemetry language={language} />
            )}
          </>
        )}
      </main>

      {/* Floating Inspection Modal if triggered from Dashboard */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-cyan-500/40 p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Patient {inspectRecord.patientName || inspectRecord.patientId} ({inspectRecord.eyeSide})
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Ref: {inspectRecord.id} • {new Date(inspectRecord.timestamp).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectRecord(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7">
                <ExplainableHeatmapViewer
                  imageUrl={inspectRecord.imageUrl}
                  attentionRegions={inspectRecord.attentionRegions}
                  classification={inspectRecord.classification}
                  confidenceScore={inspectRecord.confidenceScore}
                />
              </div>
              <div className="md:col-span-5 flex flex-col gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase block mb-1">
                    ICDR Classification
                  </span>
                  <div className="text-base font-bold text-cyan-400">
                    {inspectRecord.classification}
                  </div>
                  <div className="text-slate-400 font-mono mt-0.5">
                    Confidence: {(inspectRecord.confidenceScore * 100).toFixed(1)}% (Stage {inspectRecord.icdrStage})
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
                  <span className="text-indigo-400 text-[10px] font-semibold uppercase block mb-1">
                    Referral Guidance
                  </span>
                  <p>{inspectRecord.clinicalRecommendation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Firebase Authentication Troubleshooting & Resolution Modal */}
      <FirebaseAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        errorCode={authErrorCode}
        errorMessage={authError}
        onContinueAsDemo={handleLoginDemo}
        onRetryGoogleLogin={handleGoogleLogin}
        onEmailLogin={handleEmailLogin}
        onEmailRegister={handleEmailRegister}
        isLoggingIn={isLoggingIn}
      />
    </div>
  );
}

// Protected Route Shield Banner for unauthenticated attempts
function RequireAuthBanner({ 
  onLogin, 
  onLoginDemo, 
  onOpenAuthModal,
  isLoggingIn 
}: { 
  onLogin: () => void; 
  onLoginDemo?: () => void; 
  onOpenAuthModal?: () => void;
  isLoggingIn: boolean; 
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center">
      <div className="max-w-md p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-2xl shadow-2xl flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Authentication Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Sign in with your Google account, use Email Login, or continue in Clinician Demo Mode for instant access to retinal screening and AI vision tools.
        </p>
        <div className="flex flex-col gap-2.5 w-full pt-2">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            {onLoginDemo && (
              <button
                type="button"
                onClick={onLoginDemo}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition hover:scale-[1.02] cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-slate-950" />
                <span>Clinician Demo Mode</span>
              </button>
            )}
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-slate-200" />
              <span>{isLoggingIn ? 'Connecting...' : 'Google Sign-In'}</span>
            </button>
          </div>

          {onOpenAuthModal && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="w-full py-2 text-center text-xs text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              Email Login or Firebase Domain Whitelist Guide
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
