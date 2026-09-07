import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { 
  UserProfile, 
  ScreeningRecord, 
  SupportedLanguage, 
  BandwidthMode 
} from './types';
import { 
  subscribeToAuth, 
  signInWithGoogle, 
  logoutUser, 
  getUserProfile, 
  saveUserProfile, 
  subscribeToUserScreenings, 
  deleteScreeningRecord 
} from './lib/firebase';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ScreeningWorkflow } from './components/ScreeningWorkflow';
import { ScreeningHistory } from './components/ScreeningHistory';
import { AdminTelemetry } from './components/AdminTelemetry';
import { ExplainableHeatmapViewer } from './components/ExplainableHeatmapViewer';
import { AlertTriangle, Lock, Eye, LogIn, Heart, ShieldCheck, X } from 'lucide-react';
import { translations } from './data/i18n';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'dashboard' | 'screening' | 'history' | 'telemetry'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [screenings, setScreenings] = useState<ScreeningRecord[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Internationalization and Low-Bandwidth Mode
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [bandwidthMode, setBandwidthMode] = useState<BandwidthMode>('standard');

  // Modal for inspecting specific past screening from anywhere
  const [inspectRecord, setInspectRecord] = useState<ScreeningRecord | null>(null);

  const t = translations[language];

  // Subscribe to real Firebase Google Authentication State
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);

      if (currentUser) {
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
          console.error('Error loading user profile from Firestore:', e);
        }
      } else {
        setUserProfile(null);
        setScreenings([]);
        if (currentTab === 'dashboard' || currentTab === 'screening' || currentTab === 'history') {
          setCurrentTab('landing');
        }
      }
    });

    return () => unsubscribe();
  }, [currentTab]);

  // Real-time Firestore sync of screening records for authenticated user
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
    try {
      await signInWithGoogle();
      setCurrentTab('dashboard');
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setAuthError(err?.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentTab('landing');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Delete screening from Firestore
  const handleDeleteScreening = async (recordId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this screening record from Firestore?')) {
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
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
      />

      {/* Auth Error Notification Banner */}
      {authError && (
        <div className="bg-rose-950/80 border-b border-rose-500/40 px-4 py-2 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{authError}</span>
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
                <RequireAuthBanner onLogin={handleGoogleLogin} isLoggingIn={isLoggingIn} />
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
                <RequireAuthBanner onLogin={handleGoogleLogin} isLoggingIn={isLoggingIn} />
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
                <RequireAuthBanner onLogin={handleGoogleLogin} isLoggingIn={isLoggingIn} />
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
    </div>
  );
}

// Protected Route Shield Banner for unauthenticated attempts
function RequireAuthBanner({ onLogin, isLoggingIn }: { onLogin: () => void; isLoggingIn: boolean }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center">
      <div className="max-w-md p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-2xl shadow-2xl flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Authentication Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Please sign in with your verified Google account to access clinical patient screening, Firestore records, and tele-ophthalmology triage tools.
        </p>
        <button
          type="button"
          onClick={onLogin}
          disabled={isLoggingIn}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition hover:scale-[1.02] cursor-pointer"
        >
          <LogIn className="w-4 h-4 text-slate-950" />
          <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
        </button>
      </div>
    </div>
  );
}
