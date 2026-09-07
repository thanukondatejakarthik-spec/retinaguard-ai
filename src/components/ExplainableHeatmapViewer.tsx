import React, { useRef, useState } from 'react';
import type { AttentionRegion, ICDRClassification } from '../types';
import { Layers, Eye, EyeOff, ZoomIn, Info, AlertTriangle, CheckCircle2, Crosshair, Tag } from 'lucide-react';

interface ExplainableHeatmapViewerProps {
  imageUrl: string;
  attentionRegions: AttentionRegion[];
  classification: ICDRClassification;
  confidenceLevel?: 'High' | 'Moderate' | 'Low' | 'Indeterminate';
  confidenceScore?: number;
  className?: string;
}

export const ExplainableHeatmapViewer: React.FC<ExplainableHeatmapViewerProps> = ({
  imageUrl,
  attentionRegions,
  classification,
  confidenceLevel = 'Moderate',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [highlightMode, setHighlightMode] = useState<'caliper' | 'spotlight'>('caliper');
  const [selectedRegion, setSelectedRegion] = useState<AttentionRegion | null>(null);

  const isIndeterminate = classification === 'Indeterminate / Inconclusive';

  return (
    <div className={`flex flex-col rounded-3xl bg-slate-900/85 border border-cyan-500/25 p-5 backdrop-blur-2xl shadow-2xl ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100">
                Visual Findings & Lesion Localization
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                Multimodal AI Inspection
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Annotated regions of interest identified on the retinal fundus photograph
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
              showAnnotations 
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {showAnnotations ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showAnnotations ? 'Annotations Active' : 'Raw View'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-square max-w-xl mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center select-none"
      >
        {/* Real Retinal Fundus Image */}
        <img
          src={imageUrl}
          alt="Retinal Fundus Scan"
          className="w-full h-full object-contain block"
        />

        {/* Indeterminate Watermark Overlay if unreadable */}
        {isIndeterminate && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center gap-2">
            <AlertTriangle className="w-8 h-8 text-amber-400 animate-bounce" />
            <span className="text-sm font-bold text-amber-300">
              Inconclusive Image Quality
            </span>
            <p className="text-xs text-slate-300 max-w-xs">
              Optical disc or macular structures could not be reliably resolved. Clinical re-capture recommended.
            </p>
          </div>
        )}

        {/* Interactive Lesion Pinpoint Markers (Truthful Multimodal ROI, NOT fake Grad-CAM) */}
        {showAnnotations && !isIndeterminate && attentionRegions.map((region, idx) => {
          const isSelected = selectedRegion?.id === region.id;
          const isMicro = region.findingType === 'microaneurysm';
          const isHemorrhage = region.findingType === 'hemorrhage';
          const isExudate = region.findingType === 'hard_exudate';
          const isNeovascular = region.findingType === 'neovascularization';

          const markerColor = isNeovascular || isHemorrhage
            ? 'border-rose-500 bg-rose-500/20 text-rose-300 shadow-rose-500/50'
            : isExudate
            ? 'border-amber-400 bg-amber-400/20 text-amber-300 shadow-amber-500/50'
            : isMicro
            ? 'border-orange-400 bg-orange-400/20 text-orange-300 shadow-orange-500/50'
            : 'border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-cyan-500/50';

          return (
            <div
              key={region.id || idx}
              style={{
                left: `${region.x * 100}%`,
                top: `${region.y * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: `${Math.max(region.radius * 200, 32)}px`,
                height: `${Math.max(region.radius * 200, 32)}px`,
              }}
              className="absolute z-20 pointer-events-auto"
            >
              {/* Inspection Caliper Ring */}
              <button
                type="button"
                onClick={() => setSelectedRegion(isSelected ? null : region)}
                className={`w-full h-full rounded-full border-2 transition-all flex items-center justify-center cursor-pointer shadow-lg ${markerColor} ${
                  isSelected ? 'scale-115 ring-2 ring-white' : 'hover:scale-110'
                }`}
                title={`${region.label}: ${region.clinicalNote}`}
              >
                <span className="text-[9px] font-mono font-black px-1 rounded bg-slate-950/80">
                  {idx + 1}
                </span>
              </button>
            </div>
          );
        })}

        {/* Selected Region Popover Detail */}
        {selectedRegion && showAnnotations && (
          <div className="absolute bottom-4 left-4 right-4 z-30 p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/50 backdrop-blur-xl shadow-2xl flex items-start justify-between gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">
                  {selectedRegion.label}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {selectedRegion.findingType.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {selectedRegion.clinicalNote}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRegion(null)}
              className="text-slate-400 hover:text-white text-xs font-mono p-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Explanatory Truthful Disclaimer & Legend */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col gap-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-orange-400 bg-orange-400/30" />
              <span>Microaneurysm</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-rose-500 bg-rose-500/30" />
              <span>Hemorrhage / Neovascular</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-amber-400 bg-amber-400/30" />
              <span>Lipid Exudate</span>
            </span>
          </div>

          <div className="font-mono text-[10px] text-cyan-400">
            Confidence Assessment: {confidenceLevel}
          </div>
        </div>

        {/* Notice of Experimental Feature Inspection */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[10.5px] text-slate-400 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-300">Methodology Notice: </strong>
            Visual features are annotated directly by multimodal AI inspection. This application does not generate synthetic Grad-CAM gradient maps. All findings are experimental triage observations and not a medical diagnosis.
          </span>
        </div>
      </div>
    </div>
  );
};
