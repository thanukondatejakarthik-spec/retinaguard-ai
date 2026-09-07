import React from 'react';
import { 
  Eye, 
  Shield, 
  Activity, 
  Cpu, 
  Layers, 
  Wifi, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  HeartHandshake, 
  Users, 
  FileCheck,
  Building2,
  Stethoscope
} from 'lucide-react';
import { ThreeRetinaScene } from './ThreeRetinaScene';
import type { SupportedLanguage } from '../types';
import { translations } from '../data/i18n';

interface LandingPageProps {
  language: SupportedLanguage;
  onLogin: () => void;
  onLoginDemo?: () => void;
  onExploreWorkflow: () => void;
  isAuthenticated: boolean;
  onOpenScreening: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onLogin,
  onLoginDemo,
  onExploreWorkflow,
  isAuthenticated,
  onOpenScreening
}) => {
  const t = translations[language];

  return (
    <div className="w-full text-slate-100 flex flex-col gap-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-8 overflow-hidden">
        {/* Futuristic Medical Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-500/15 via-sky-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column: Mission & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start gap-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-cyan-950/50">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.hero.trustedBy}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t.hero.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={onOpenScreening}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition hover:scale-[1.02] cursor-pointer"
                >
                  <Eye className="w-5 h-5 text-slate-950" />
                  <span>{t.hero.startScreening}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={onLogin}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition hover:scale-[1.02] cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{t.hero.continueGoogle}</span>
                  </button>

                  {onLoginDemo && (
                    <button
                      type="button"
                      onClick={onLoginDemo}
                      className="px-5 py-3 rounded-xl bg-slate-900 border border-cyan-500/40 hover:bg-cyan-950/60 text-cyan-300 font-semibold text-sm flex items-center gap-2 transition hover:scale-[1.02] cursor-pointer"
                      title="Instant access without Google OAuth setup"
                    >
                      <Stethoscope className="w-4 h-4 text-cyan-400" />
                      <span>Clinician Demo Mode</span>
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={onExploreWorkflow}
                className="px-5 py-3 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-semibold text-sm transition hover:bg-slate-800 cursor-pointer"
              >
                {t.hero.learnHow}
              </button>
            </div>

            {/* Quality Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 w-full max-w-lg">
              <div>
                <div className="text-2xl font-black text-cyan-400 font-mono">ICDR</div>
                <div className="text-xs text-slate-400">Clinical Gold Standard</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400 font-mono">&lt;2 sec</div>
                <div className="text-xs text-slate-400">Edge Analysis Time</div>
              </div>
              <div>
                <div className="text-2xl font-black text-sky-400 font-mono">XAI</div>
                <div className="text-xs text-slate-400">Grad-CAM Attribution</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Eyeball and Retinal Fundus Cross-Section */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <ThreeRetinaScene className="w-full" stageName="Fundus Optic Globe 3D" />
          </div>
        </div>
      </section>

      {/* Mandatory Safety Notice Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 uppercase tracking-wide">
              {t.disclaimer.bannerTitle}:{' '}
            </span>
            <span className="text-amber-200/90">{t.disclaimer.bannerText}</span>
            <p className="text-amber-300/80 font-medium mt-1">
              "{t.disclaimer.nonDiagnosisNotice}"
            </p>
          </div>
        </div>
      </section>

      {/* Why Diabetic Retinopathy Screening Matters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            {t.whyMatters.badge}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
            {t.whyMatters.title}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t.whyMatters.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl hover:border-cyan-500/40 transition">
            <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono mb-2">
              {t.whyMatters.stat1Number}
            </div>
            <div className="text-sm font-semibold text-slate-200 mb-1">
              {t.whyMatters.stat1Label}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India has one of the largest diabetic populations globally. Microvascular retinal damage begins silently before symptoms appear.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl hover:border-emerald-500/40 transition">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mb-2">
              {t.whyMatters.stat2Number}
            </div>
            <div className="text-sm font-semibold text-slate-200 mb-1">
              {t.whyMatters.stat2Label}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detecting microaneurysms and early lipid exudates allows timely laser photocoagulation or anti-VEGF intervention.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl hover:border-amber-500/40 transition">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono mb-2">
              {t.whyMatters.stat3Number}
            </div>
            <div className="text-sm font-semibold text-slate-200 mb-1">
              {t.whyMatters.stat3Label}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Severe doctor shortages in rural taluks mean telemedicine and AI triage are essential to bridge the clinical divide.
            </p>
          </div>
        </div>
      </section>

      {/* Explainable AI (XAI) Deep Dive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 flex flex-col gap-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono border border-cyan-500/30 w-fit">
                <Layers className="w-3.5 h-3.5" />
                <span>Zero Black-Box Architecture</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
                {t.xaiSection.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.xaiSection.description}
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">{t.xaiSection.feature1Title}</div>
                    <div className="text-[11px] text-slate-400">{t.xaiSection.feature1Desc}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">{t.xaiSection.feature2Title}</div>
                    <div className="text-[11px] text-slate-400">{t.xaiSection.feature2Desc}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">{t.xaiSection.feature3Title}</div>
                    <div className="text-[11px] text-slate-400">{t.xaiSection.feature3Desc}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual preview of XAI Saliency Colormap */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 p-3 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-300 pb-2 border-b border-slate-800">
                  <span>Grad-CAM Activation Tensor</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    Target: Moderate NPDR
                  </span>
                </div>

                <div className="relative flex-1 my-2 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                  <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/40 via-red-900/60 to-slate-950 flex items-center justify-center relative">
                    <div className="w-32 h-32 rounded-full border border-cyan-400/40 animate-pulse flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-red-600/60 blur-md" />
                    </div>
                    <div className="absolute top-4 left-4 text-[10px] text-slate-400 font-mono bg-slate-950/80 px-2 py-1 rounded">
                      Peak Gradient: λ = 0.942
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>Jet/Turbo Saliency Scale</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px]">0.0</span>
                    <div className="w-24 h-2 rounded bg-gradient-to-r from-blue-600 via-emerald-400 via-yellow-400 to-red-600" />
                    <span className="text-[9px]">1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Screening Workflow */}
      <section id="workflow" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Pipeline Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
            {t.howItWorks.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-100">{t.howItWorks.step1Title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{t.howItWorks.step1Desc}</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-100">{t.howItWorks.step2Title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{t.howItWorks.step2Desc}</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-100">{t.howItWorks.step3Title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{t.howItWorks.step3Desc}</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
              4
            </div>
            <h4 className="text-sm font-bold text-slate-100">{t.howItWorks.step4Title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{t.howItWorks.step4Desc}</p>
          </div>
        </div>
      </section>

      {/* Rural Healthcare Impact Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Edge Compression (2G/3G)</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Compresses 15MB fundus RAW camera captures down to &lt;200KB in-browser before upload, saving cellular bandwidth in rural clinics.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Multilingual Telugu & Hindi</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Provides plain-language clinical counseling summaries in regional Indian languages directly for ASHA health workers.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Official Clinical PDF Reports</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Generates instant printable diagnostic summaries with verification hashes, image previews, and referral guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 pt-10 text-xs text-slate-400 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">RetinaGuard AI</span>
          <span>• Dedicated to Preventable Blindness Eradication in Rural India</span>
        </div>
        <div>
          <span>ICDR Classification Standard • Grad-CAM XAI • Firebase ABAC Security</span>
        </div>
      </footer>
    </div>
  );
};
