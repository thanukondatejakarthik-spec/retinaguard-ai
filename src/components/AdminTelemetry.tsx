import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Database, 
  ShieldCheck, 
  Layers, 
  RefreshCw,
  Terminal,
  Zap,
  Key,
  Info
} from 'lucide-react';
import type { ModelTelemetryStatus, SupportedLanguage } from '../types';
import { translations } from '../data/i18n';

interface AdminTelemetryProps {
  language: SupportedLanguage;
}

export const AdminTelemetry: React.FC<AdminTelemetryProps> = ({ language }) => {
  const t = translations[language];
  const [telemetry, setTelemetry] = useState<ModelTelemetryStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/model/status');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error('Failed to fetch model status:', err);
    } finally {
      setIsLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // 15s polling
    return () => clearInterval(interval);
  }, []);

  const isConfigured = telemetry?.apiKeyConfigured;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 text-slate-100 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold">
            <span>SYSTEM HEALTH & INFERENCE MONITOR</span>
            <span>•</span>
            <span>OFFICIAL GEMINI SERVER INTEGRATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Model & Architecture Status
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of the server-side Gemini Vision API, Firebase Firestore database, and low-bandwidth processing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            Updated {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            type="button"
            onClick={fetchStatus}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* API Key Status Notice */}
      {!isConfigured && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-amber-300">GEMINI_API_KEY Not Configured</span>
            <p className="text-amber-200/90 leading-relaxed">
              The backend server requires a valid <code className="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-cyan-300">GEMINI_API_KEY</code> environment variable. Please add your key in the AI Studio Settings / Secrets panel to activate live image analysis.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Model Status */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Service Status</span>
            <span className={`w-2.5 h-2.5 rounded-full ${isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </div>
          <div className="mt-3">
            <div className={`text-xl font-bold flex items-center gap-2 ${isConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isConfigured ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span>{isConfigured ? 'ONLINE' : 'NEEDS KEY'}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Uptime: {telemetry?.uptimeSeconds ? `${Math.floor(telemetry.uptimeSeconds / 60)} min` : 'Active'}
            </div>
          </div>
        </div>

        {/* Active Provider */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Inference Provider</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-white truncate">
              {telemetry?.provider || 'Google Gemini Multimodal API'}
            </div>
            <div className="text-[11px] text-cyan-400 mt-1 font-mono">
              Model: {telemetry?.modelName || 'gemini-2.5-flash'}
            </div>
          </div>
        </div>

        {/* Server Security */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Key Protection</span>
            <Key className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-emerald-400 font-mono">
              Server-Side Only
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Zero client exposure of GEMINI_API_KEY
            </div>
          </div>
        </div>

        {/* Total Inferences */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Inferences Processed</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-sky-400 font-mono">
              {telemetry?.totalInferencesServed || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Total requests handled
            </div>
          </div>
        </div>
      </div>

      {/* Model Specifications & Endpoints Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: ICDR Specifications & XAI Protocol */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">ICDR Diagnostic Classification Scope</h3>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            {telemetry?.icdrClassesSupported?.map((cls, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <span className="text-slate-300">{cls}</span>
                <span className="font-mono text-[10px] text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
                  Supported
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <span className="text-[11px] text-slate-400 block mb-1">Explainability & Feature Extraction:</span>
            <div className="p-2.5 rounded-xl bg-slate-950 text-xs text-slate-300 font-mono border border-slate-800">
              {telemetry?.analysisMethod || 'Multimodal Retinal Feature Inspection & Region-of-Interest Localization'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
            <span>
              {telemetry?.experimentalNotice || 'EXPERIMENTAL AI DECISION-SUPPORT TOOL – NOT A CERTIFIED MEDICAL DIAGNOSIS'}
            </span>
          </div>
        </div>

        {/* Right: API Endpoints & Verification */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Production API Endpoints (Express Server)</h3>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-emerald-400 font-bold">GET /api/health</span>
                <span className="text-slate-500 text-[10px]">200 OK</span>
              </div>
              <span className="text-slate-400 text-[11px]">Backend heartbeat and Gemini configuration check.</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-cyan-400 font-bold">POST /api/analyze-retina</span>
                <span className="text-slate-500 text-[10px]">Server-Side Gemini API</span>
              </div>
              <span className="text-slate-400 text-[11px]">
                Validates base64 fundus image, executes Gemini 2.5 Flash multimodal vision, and returns structured ICDR assessment with localized lesion findings.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-sky-400 font-bold">GET /api/model/status</span>
                <span className="text-slate-500 text-[10px]">Active</span>
              </div>
              <span className="text-slate-400 text-[11px]">
                Returns runtime telemetry, API key presence, uptime, and supported ICDR categories.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Authenticated with Firebase Google OAuth & isolated Firestore security rules.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
