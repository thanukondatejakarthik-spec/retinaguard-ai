import React from 'react';
import type { ScreeningRecord, UserProfile, SupportedLanguage, AppUser } from '../types';
import type { User } from 'firebase/auth';
import { 
  Eye, 
  PlusCircle, 
  FileText, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Download, 
  Trash2, 
  ExternalLink,
  Info,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { generateScreeningPdfReport } from '../lib/pdfReport';
import { translations } from '../data/i18n';

interface DashboardProps {
  user: User | AppUser;
  userProfile: UserProfile | null;
  screenings: ScreeningRecord[];
  onStartScreening: () => void;
  onSelectScreening: (record: ScreeningRecord) => void;
  onDeleteScreening: (recordId: string) => void;
  language: SupportedLanguage;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  userProfile,
  screenings,
  onStartScreening,
  onSelectScreening,
  onDeleteScreening,
  language
}) => {
  const t = translations[language];

  // Compute Real Telemetry Statistics from Firestore records
  const totalCount = screenings.length;
  const noDrCount = screenings.filter(s => s.classification === 'No apparent DR').length;
  const mildModCount = screenings.filter(s => s.classification === 'Mild' || s.classification === 'Moderate').length;
  const urgentCount = screenings.filter(s => s.classification === 'Severe' || s.classification === 'Proliferative DR').length;
  
  const highConfidenceCount = screenings.filter(s => s.confidenceLevel === 'High').length;

  const totalBandwidthSavedMb = screenings.reduce((acc, s) => {
    const diff = (s.originalSizeKb || 3500) - (s.compressedSizeKb || 180);
    return acc + Math.max(0, diff);
  }, 0) / 1024;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 text-slate-100 text-left">
      {/* Welcome Banner Card with Glass Aesthetics */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-cyan-950/40 border border-cyan-500/20 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Subtle glowing orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Doctor'}
                className="w-16 h-16 rounded-2xl border-2 border-cyan-400 shadow-xl object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 text-xl font-bold">
                {user.displayName?.[0] || 'D'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Welcome, {user.displayName || 'Healthcare Specialist'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-medium">
                  Verified Google Auth
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1 text-cyan-300">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  {userProfile?.facilityName || 'Primary Health Center (Rural Vision Hub)'}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-400">{user.email}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartScreening}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>New Retinal Screening</span>
          </button>
        </div>
      </div>

      {/* Real Clinical Statistics & Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Screenings */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Screened
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono">{totalCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Retinal fundus examinations</div>
          </div>
        </div>

        {/* Normal Screenings (Stage 0) */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Healthy Controls (No DR)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-400 font-mono">{noDrCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {totalCount > 0 ? Math.round((noDrCount / totalCount) * 100) : 0}% of screened population
            </div>
          </div>
        </div>

        {/* Urgent Referrals (Severe & PDR) */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Urgent Triage Referrals
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-rose-400 font-mono">{urgentCount}</div>
            <div className="text-[11px] text-rose-300/80 mt-0.5">
              Referred for urgent laser / anti-VEGF
            </div>
          </div>
        </div>

        {/* Rural Data Conserved via Edge Compression */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Rural Data Conserved
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-sky-400 font-mono">
              {totalBandwidthSavedMb.toFixed(1)} <span className="text-base font-normal text-slate-400">MB</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {highConfidenceCount} scans with high optical clarity
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Education Card */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-cyan-300">Clinical Protocol: </span>
          <span>
            Every patient with Mild or Moderate Diabetic Retinopathy must receive lifestyle glycemic counseling and a scheduled ophthalmological review within 1 to 3 months. Patients classified with Severe NPDR or Proliferative DR require urgent referral to district hospital eye centers within 1 to 2 weeks.
          </span>
        </div>
      </div>

      {/* Recent Screenings Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Recent Patient Screenings (Firestore DB)</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {screenings.length} records in cloud storage
          </span>
        </div>

        {screenings.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No screening records yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Start your first retinal fundus screening to generate ICDR classifications, multimodal AI visual feature inspections, and downloadable clinical PDF reports.
              </p>
            </div>
            <button
              type="button"
              onClick={onStartScreening}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-xs transition hover:bg-cyan-400 cursor-pointer"
            >
              Start First Screening
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenings.map((rec) => {
              const isHigh = rec.classification === 'Severe' || rec.classification === 'Proliferative DR';
              const isMild = rec.classification === 'Mild' || rec.classification === 'Moderate';

              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition backdrop-blur-xl flex flex-col justify-between gap-4 group"
                >
                  <div>
                    {/* Header: ID, Date, Eye Side */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">
                        {rec.patientName || rec.patientId || 'Patient'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-300">
                        {rec.eyeSide === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono mb-3 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(rec.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>

                    {/* Retinal fundus thumbnail & Classification Badge */}
                    <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      {rec.imageUrl ? (
                        <img
                          src={rec.imageUrl}
                          alt="Retinal Fundus"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                          <Eye className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className={`inline-block w-fit px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                          isHigh
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                            : isMild
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {rec.classification}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Confidence: {(rec.confidenceScore * 100).toFixed(1)}%
                        </span>
                        <span className="text-[9px] text-slate-500 truncate">
                          {rec.facilityLocation || 'PHC Center'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View XAI, Download PDF, Delete */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => onSelectScreening(rec)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect XAI</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => generateScreeningPdfReport(rec, user.displayName || 'Doctor')}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 transition"
                        title="Download Clinical PDF Report"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteScreening(rec.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                        title="Delete screening record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
