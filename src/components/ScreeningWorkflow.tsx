import React, { useState, useEffect, useRef } from 'react';
import type { 
  ScreeningRecord, 
  EyeSide, 
  ICDRClassification, 
  SupportedLanguage, 
  BandwidthMode,
  AppUser
} from '../types';
import type { User } from 'firebase/auth';
import { 
  Upload, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Sparkles, 
  FileText, 
  Download, 
  RotateCcw, 
  Wifi, 
  ShieldAlert, 
  User as UserIcon, 
  Building2, 
  Layers, 
  ChevronRight, 
  Share2, 
  Heart,
  Save
} from 'lucide-react';
import { compressRetinalImage, type CompressionResult } from '../lib/compression';
import { getClinicalSampleScans, type SampleFundusScan } from '../data/sampleScans';
import { ExplainableHeatmapViewer } from './ExplainableHeatmapViewer';
import { generateScreeningPdfReport } from '../lib/pdfReport';
import { saveScreeningToFirestore, uploadRetinalImageToStorage } from '../lib/firebase';
import { translations } from '../data/i18n';

interface ScreeningWorkflowProps {
  user: User | AppUser;
  onScreeningComplete: (record: ScreeningRecord) => void;
  language: SupportedLanguage;
  bandwidthMode: BandwidthMode;
}

export const ScreeningWorkflow: React.FC<ScreeningWorkflowProps> = ({
  user,
  onScreeningComplete,
  language,
  bandwidthMode
}) => {
  const t = translations[language];

  // Patient & Clinical Center State
  const [patientId, setPatientId] = useState<string>(`PT-${Math.floor(100000 + Math.random() * 900000)}`);
  const [patientName, setPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<number>(54);
  const [eyeSide, setEyeSide] = useState<EyeSide>('OD');
  const [facilityLocation, setFacilityLocation] = useState<string>('PHC Chittoor (Andhra Pradesh)');

  // Upload & Image State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Sample Scans selector
  const [sampleScans, setSampleScans] = useState<SampleFundusScan[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  // Analysis / Pipeline State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<number>(1);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<ScreeningRecord | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSampleScans(getClinicalSampleScans());
  }, []);

  // Handle file selection and client-side edge compression
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setAnalysisError('Please upload a valid image file (JPEG or PNG retinal fundus photo).');
      return;
    }

    setSelectedFile(file);
    setSelectedSampleId(null);
    setAnalysisError(null);
    setIsCompressing(true);

    try {
      const result = await compressRetinalImage(file, bandwidthMode === 'rural-2g');
      setCompressionInfo(result);
      setPreviewUrl(result.compressedDataUrl);
    } catch (err: any) {
      console.error('Image compression failed:', err);
      setAnalysisError('Failed to process and compress retinal image.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle clicking a clinical sample scan
  const handleSelectSample = async (sample: SampleFundusScan) => {
    setSelectedSampleId(sample.id);
    setSelectedFile(null);
    setAnalysisError(null);
    setEyeSide(sample.eyeSide);
    setIsCompressing(true);

    try {
      const result = await compressRetinalImage(sample.imageDataUrl, bandwidthMode === 'rural-2g');
      setCompressionInfo(result);
      setPreviewUrl(result.compressedDataUrl);
    } catch (err) {
      console.error('Sample processing failed:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  // Trigger Real Backend AI Inference
  const handleAnalyze = async () => {
    if (!previewUrl) {
      setAnalysisError('Please upload or select a retinal fundus photograph first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStage(1);

    // Multi-stage progress indicator animation
    const stageTimer1 = setTimeout(() => setAnalysisStage(2), 700);
    const stageTimer2 = setTimeout(() => setAnalysisStage(3), 1500);
    const stageTimer3 = setTimeout(() => setAnalysisStage(4), 2200);

    try {
      const response = await fetch('/api/analyze-retina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: previewUrl,
          patientId: patientId || 'Anonymous',
          eyeSide: eyeSide,
          facilityName: facilityLocation
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        if (response.status === 503 || errJson.code === 'MISSING_GEMINI_API_KEY') {
          throw new Error('GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY in the Settings or environment variables to enable retinal analysis.');
        }
        throw new Error(errJson.error || `Server responded with HTTP ${response.status}: ${errJson.details || ''}`);
      }

      const data = await response.json();
      const recordId = `scr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Upload image to Firebase Storage
      let storageUrl = previewUrl;
      try {
        storageUrl = await uploadRetinalImageToStorage(user.uid, recordId, previewUrl);
      } catch (storageErr) {
        console.warn('[Firebase Storage] Image storage fallback applied:', storageErr);
      }

      const newRecord: ScreeningRecord = {
        id: recordId,
        userId: user.uid,
        userEmail: user.email || '',
        patientId: patientId || 'PT-1001',
        patientName: patientName || 'Anonymous Patient',
        patientAge: Number(patientAge) || 50,
        eyeSide: eyeSide,
        imageUrl: storageUrl,
        imageStorageUrl: storageUrl !== previewUrl ? storageUrl : undefined,
        classification: data.classification as ICDRClassification,
        confidenceLevel: data.confidenceLevel || 'Moderate',
        confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : undefined,
        icdrStage: typeof data.icdrStage === 'number' ? data.icdrStage : 0,
        detectedFindings: data.detectedFindings || [],
        explanationNonTechnical: data.explanationNonTechnical || '',
        explanationTelugu: data.explanationTelugu,
        explanationHindi: data.explanationHindi,
        visualFindingsSummary: data.visualFindingsSummary || data.gradCamAttentionSummary || '',
        gradCamAttentionSummary: data.visualFindingsSummary || data.gradCamAttentionSummary || '',
        attentionRegions: data.attentionRegions || [],
        clinicalRecommendation: data.clinicalRecommendation || '',
        timestamp: new Date().toISOString(),
        bandwidthMode: bandwidthMode,
        facilityLocation: facilityLocation,
        compressedSizeKb: compressionInfo?.compressedSizeKb,
        originalSizeKb: compressionInfo?.originalSizeKb,
        isExperimental: true,
        safetyDisclaimer: data.safetyDisclaimer || 'EXPERIMENTAL AI SCREENING ANALYSIS – NOT A MEDICAL DIAGNOSIS. Please consult a qualified eye-care professional.'
      };

      // Persist to Firestore cloud database
      await saveScreeningToFirestore(newRecord);
      setIsSaved(true);
      setActiveResult(newRecord);
      onScreeningComplete(newRecord);

    } catch (err: any) {
      console.error('Inference error:', err);
      setAnalysisError(err?.message || 'Failed to complete AI screening inference.');
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setActiveResult(null);
    setPreviewUrl(null);
    setSelectedFile(null);
    setSelectedSampleId(null);
    setCompressionInfo(null);
    setAnalysisError(null);
    setIsSaved(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 text-slate-100 text-left">
      {/* Header & Step Indicator */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold">
          <span>CLINICAL SCREENING PIPELINE</span>
          <span>•</span>
          <span>ICDR PROTOCOL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t.screening.title}
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          {t.screening.subtitle}
        </p>
      </div>

      {/* Mandatory Safety Notice */}
      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">CLINICAL NOTICE: </span>
          <span>{t.disclaimer.nonDiagnosisNotice}</span>
        </div>
      </div>

      {/* Main Workflow: Step 1 Upload / Details vs Step 2 Results */}
      {!activeResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Patient Demographics & Facility Form */}
          <div className="lg:col-span-4 flex flex-col gap-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <UserIcon className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">{t.screening.patientDetails}</h3>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-medium mb-1 block">
                  {t.screening.patientId}
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g. PT-849201"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium mb-1 block">
                  {t.screening.patientName}
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  placeholder="Optional or Anonymous"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium mb-1 block">
                    {t.screening.patientAge}
                  </label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium mb-1 block">
                    {t.screening.eyeSide}
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEyeSide('OD')}
                      className={`py-1 rounded-lg text-xs font-semibold transition ${
                        eyeSide === 'OD' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      OD (Right)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEyeSide('OS')}
                      className={`py-1 rounded-lg text-xs font-semibold transition ${
                        eyeSide === 'OS' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      OS (Left)
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium mb-1 block">
                  {t.screening.facility}
                </label>
                <input
                  type="text"
                  value={facilityLocation}
                  onChange={(e) => setFacilityLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-cyan-500 focus:outline-none text-xs"
                />
              </div>

              {/* Bandwidth mode status */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  Mode: {bandwidthMode === 'rural-2g' ? 'Rural 2G/3G' : 'Standard'}
                </span>
                <span className="font-mono text-emerald-400">Edge Compression Active</span>
              </div>
            </div>
          </div>

          {/* Right: Upload Dropzone & Sample Scans */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Retinal Fundus Upload Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              className={`p-6 sm:p-8 rounded-3xl border-2 border-dashed transition flex flex-col items-center justify-center text-center gap-4 ${
                previewUrl 
                  ? 'bg-slate-900/90 border-cyan-500/50' 
                  : 'bg-slate-900/50 border-slate-700 hover:border-cyan-500/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {previewUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-xl">
                  {/* Fundus Preview Thumbnail */}
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-slate-950 border-2 border-cyan-400/60 shadow-2xl shrink-0">
                    <img
                      src={previewUrl}
                      alt="Fundus scan preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-cyan-300">
                      {eyeSide}
                    </div>
                  </div>

                  <div className="flex flex-col items-start text-left gap-2 w-full">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                      Scan Loaded & Preprocessed
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {selectedFile?.name || 'Selected Fundus Scan'}
                    </h4>

                    {/* Bandwidth Savings Badge */}
                    {compressionInfo && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 w-full flex flex-col gap-1">
                        <div className="flex justify-between font-mono">
                          <span className="text-slate-400">Original Size:</span>
                          <span>{compressionInfo.originalSizeKb} KB</span>
                        </div>
                        <div className="flex justify-between font-mono text-emerald-400 font-semibold">
                          <span>Compressed (Edge):</span>
                          <span>{compressionInfo.compressedSizeKb} KB</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>{compressionInfo.compressionRatioPercent}% bandwidth saved for rural connectivity</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs hover:bg-slate-700 transition"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-rose-400 text-xs hover:bg-slate-700 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {t.screening.uploadTitle}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      {t.screening.uploadInstructions}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 transition cursor-pointer"
                  >
                    Select Fundus Image
                  </button>
                </>
              )}
            </div>

            {/* Clinically Validated Sample Scans Selector */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {t.screening.orChooseSample}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  5 ICDR Reference Stages
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {sampleScans.map((sample) => {
                  const isSelected = selectedSampleId === sample.id;
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className={`p-2.5 rounded-2xl border text-left transition flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-400 shadow-lg shadow-cyan-950'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                        <img
                          src={sample.imageDataUrl}
                          alt={sample.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono text-cyan-300">
                          {sample.eyeSide}
                        </span>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-200 truncate">
                          {sample.groundTruthStage}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono">
                          ICDR Stage {sample.icdrNumber}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {analysisError && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Execution CTA & Animated Pipeline indicator */}
            <div className="flex flex-col gap-3 pt-2">
              {isAnalyzing ? (
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-300 flex items-center gap-2">
                      <Activity className="w-4 h-4 animate-spin text-cyan-400" />
                      {t.screening.analyzing}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      Stage {analysisStage} of 4
                    </span>
                  </div>

                  {/* Visual Step Timeline */}
                  <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono">
                    {analysisStage === 1 && t.screening.stage1}
                    {analysisStage === 2 && t.screening.stage2}
                    {analysisStage === 3 && t.screening.stage3}
                    {analysisStage === 4 && t.screening.stage4}
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 transition-all duration-500 rounded-full"
                      style={{ width: `${(analysisStage / 4) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!previewUrl || isCompressing}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition hover:scale-[1.01] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <Eye className="w-5 h-5 text-slate-950" />
                  <span>{t.screening.runInference}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Results View & Explainability Assessment */
        <div className="flex flex-col gap-8">
          {/* Result Banner: ICDR Badge, Confidence, Action Buttons */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl border ${
                activeResult.classification === 'No apparent DR'
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                  : activeResult.classification === 'Mild' || activeResult.classification === 'Moderate'
                  ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                  : 'bg-rose-950/80 text-rose-400 border-rose-500/40'
              }`}>
                <Eye className="w-8 h-8" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 font-semibold">
                    {t.results.badge} • Patient {activeResult.patientId} ({activeResult.eyeSide})
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                    Experimental AI
                  </span>
                  {isSaved && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                      Synced to Firestore
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                  {activeResult.classification}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="font-mono text-cyan-300 font-semibold">
                    Confidence Assessment: {activeResult.confidenceLevel}
                  </span>
                  <span>•</span>
                  <span>{activeResult.icdrStage >= 0 ? `ICDR Stage ${activeResult.icdrStage} of 4` : 'Inconclusive Stage'}</span>
                  <span>•</span>
                  <span>{activeResult.facilityLocation}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => generateScreeningPdfReport(activeResult, user.displayName || 'Clinician')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>{t.results.downloadReport}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Patient Screening</span>
              </button>
            </div>
          </div>

          {/* Explainable AI Visualizer & Clinical Finding Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Saliency / Heatmap Canvas */}
            <div className="lg:col-span-7">
              <ExplainableHeatmapViewer
                imageUrl={activeResult.imageUrl}
                attentionRegions={activeResult.attentionRegions}
                classification={activeResult.classification}
                confidenceLevel={activeResult.confidenceLevel}
              />
            </div>

            {/* Right: Pathological Findings & Non-Technical Explanations */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Detected Pathological Findings */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {t.results.detectedLesions}
                  </h3>
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  {activeResult.detectedFindings && activeResult.detectedFindings.length > 0 ? (
                    activeResult.detectedFindings.map((finding, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                        <span>{finding}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">
                      No pathological lesions or microvascular abnormalities observed.
                    </div>
                  )}
                </div>

                {/* Visual findings summary */}
                <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200">
                  <span className="font-semibold text-cyan-300">Visual Inspection Focus: </span>
                  {activeResult.visualFindingsSummary || activeResult.gradCamAttentionSummary}
                </div>
              </div>

              {/* Accessible Non-Technical Explanation (English, Telugu, Hindi) */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Patient Counseling Summary
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                    Multi-lingual XAI
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {language === 'te' && activeResult.explanationTelugu
                    ? activeResult.explanationTelugu
                    : language === 'hi' && activeResult.explanationHindi
                    ? activeResult.explanationHindi
                    : activeResult.explanationNonTechnical}
                </p>

                {/* Quick language toggle buttons for doctor/ASHA worker counseling */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">Counseling Language:</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-cyan-300">
                    {language === 'te' ? 'తెలుగు (Telugu)' : language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
                  </span>
                </div>
              </div>

              {/* Clinical Next Steps & Referral Guidance */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {t.results.nextSteps}
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed font-medium">
                  {activeResult.clinicalRecommendation}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
