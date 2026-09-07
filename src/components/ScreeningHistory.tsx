import React, { useState } from 'react';
import type { ScreeningRecord, ICDRClassification, SupportedLanguage, AppUser } from '../types';
import type { User } from 'firebase/auth';
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Download, 
  Trash2, 
  X, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Building2,
  FileText
} from 'lucide-react';
import { ExplainableHeatmapViewer } from './ExplainableHeatmapViewer';
import { generateScreeningPdfReport } from '../lib/pdfReport';
import { translations } from '../data/i18n';

interface ScreeningHistoryProps {
  user: User | AppUser;
  screenings: ScreeningRecord[];
  onDeleteScreening: (recordId: string) => void;
  language: SupportedLanguage;
}

export const ScreeningHistory: React.FC<ScreeningHistoryProps> = ({
  user,
  screenings,
  onDeleteScreening,
  language
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [activeModalRecord, setActiveModalRecord] = useState<ScreeningRecord | null>(null);

  const filtered = screenings.filter((item) => {
    const matchesSearch =
      item.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.facilityLocation?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === 'ALL') return true;
    return item.classification === selectedFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 text-slate-100 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold">
            <span>FIRESTORE CLOUD REPOSITORY</span>
            <span>•</span>
            <span>SECURE USER PARTITION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Patient Screening History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access, inspect Grad-CAM activations, and export official reports for all prior screenings.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 w-fit">
          Showing {filtered.length} of {screenings.length} records
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Patient ID, Name, or Facility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {['ALL', 'No apparent DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR'].map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setSelectedFilter(stage)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
                selectedFilter === stage
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/40'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-300">No matching screening records found</h3>
          <p className="text-xs text-slate-500">
            {screenings.length === 0
              ? 'Complete a new patient screening to populate your clinical registry.'
              : 'Try clearing your search query or severity filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((record) => {
            const isHigh = record.classification === 'Severe' || record.classification === 'Proliferative DR';
            const isMild = record.classification === 'Mild' || record.classification === 'Moderate';

            return (
              <div
                key={record.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition backdrop-blur-xl flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {record.patientName || record.patientId}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        ID: {record.patientId} • Age: {record.patientAge || 'N/A'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-300">
                      {record.eyeSide === 'OD' ? 'OD (Right)' : 'OS (Left)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 my-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    {record.imageUrl ? (
                      <img
                        src={record.imageUrl}
                        alt="Fundus scan"
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
                        {record.classification}
                      </span>
                      <span className="text-[10px] text-cyan-300 font-mono">
                        {record.confidenceLevel ? `Confidence: ${record.confidenceLevel}` : 'Experimental AI'}
                      </span>
                      <span className="text-[9px] text-slate-500 truncate">
                        {record.facilityLocation}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(record.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setActiveModalRecord(record)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Examine Findings</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => generateScreeningPdfReport(record, user.displayName || 'Doctor')}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 transition"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteScreening(record.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                      title="Delete record"
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

      {/* Detailed Modal for Inspecting Past Screening */}
      {activeModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-cyan-500/40 p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Patient {activeModalRecord.patientName || activeModalRecord.patientId} ({activeModalRecord.eyeSide})
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Ref ID: {activeModalRecord.id} • {new Date(activeModalRecord.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => generateScreeningPdfReport(activeModalRecord, user.displayName || 'Doctor')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition hover:bg-cyan-400"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalRecord(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Visual ROI Inspector & Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7">
                <ExplainableHeatmapViewer
                  imageUrl={activeModalRecord.imageUrl}
                  attentionRegions={activeModalRecord.attentionRegions}
                  classification={activeModalRecord.classification}
                  confidenceLevel={activeModalRecord.confidenceLevel}
                />
              </div>

              <div className="md:col-span-5 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">
                      ICDR Assessment
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono">
                      Experimental AI
                    </span>
                  </div>
                  <div className="text-base font-black text-cyan-400">
                    {activeModalRecord.classification}
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                    Confidence: {activeModalRecord.confidenceLevel || 'Moderate'} • {activeModalRecord.icdrStage >= 0 ? `Stage ${activeModalRecord.icdrStage}` : 'Inconclusive'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block mb-1">
                    Pathological Findings
                  </span>
                  <ul className="flex flex-col gap-1 text-slate-300">
                    {activeModalRecord.detectedFindings?.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
                  <span className="text-indigo-400 uppercase font-semibold text-[10px] block mb-1">
                    Referral Guidance
                  </span>
                  <p>{activeModalRecord.clinicalRecommendation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
