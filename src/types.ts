export type ICDRClassification = 
  | 'No apparent DR'
  | 'Mild'
  | 'Moderate'
  | 'Severe'
  | 'Proliferative DR'
  | 'Indeterminate / Inconclusive';

export type EyeSide = 'OD' | 'OS'; // OD = Right Eye (Oculus Dexter), OS = Left Eye (Oculus Sinister)

export type FindingType = 
  | 'microaneurysm'
  | 'hemorrhage'
  | 'hard_exudate'
  | 'cotton_wool_spot'
  | 'neovascularization'
  | 'venous_beading'
  | 'normal_vasculature'
  | 'artifact_or_obscuration';

export interface AttentionRegion {
  id: string;
  x: number; // 0 to 1 relative coordinate
  y: number; // 0 to 1 relative coordinate
  radius: number; // relative size
  intensity?: number; // 0 to 1 relative salience
  findingType: FindingType;
  label: string;
  clinicalNote: string;
}

export type VisualRegionOfInterest = AttentionRegion;

export interface ScreeningRecord {
  id: string;
  userId: string;
  userEmail?: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  eyeSide: EyeSide;
  imageUrl: string;
  imageStorageUrl?: string; // Firebase Storage URL
  classification: ICDRClassification;
  confidenceLevel: 'High' | 'Moderate' | 'Low' | 'Indeterminate';
  confidenceScore?: number; // Optional reference score if provided by model
  icdrStage: number; // 0 to 4, or -1 for indeterminate
  detectedFindings: string[];
  explanationNonTechnical: string;
  explanationTelugu?: string;
  explanationHindi?: string;
  visualFindingsSummary: string;
  gradCamAttentionSummary?: string; // Legacy alias
  attentionRegions: AttentionRegion[];
  clinicalRecommendation: string;
  timestamp: string;
  bandwidthMode: 'standard' | 'rural-2g' | 'offline';
  facilityLocation: string;
  compressedSizeKb?: number;
  originalSizeKb?: number;
  isExperimental: boolean; // Must always be true - experimental AI analysis
  safetyDisclaimer: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'clinician' | 'technician' | 'ophthalmologist' | 'admin';
  facilityName: string;
  createdAt: string;
}

export type SupportedLanguage = 'en' | 'te' | 'hi';

export type BandwidthMode = 'standard' | 'rural-2g' | 'offline';

export interface ModelStatusResponse {
  status: 'online' | 'unconfigured' | 'error';
  provider: string;
  modelName: string;
  version: string;
  apiKeyConfigured: boolean;
  uptimeSeconds: number;
  icdrClassesSupported: string[];
  analysisMethod: string;
  totalInferencesServed: number;
  experimentalNotice: string;
}

export type ModelTelemetryStatus = ModelStatusResponse;
