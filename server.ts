import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// High-capacity JSON parser for high-resolution retinal fundus uploads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'RetinaGuard AI Backend',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Model & System Telemetry Status (Server-side only Gemini API)
let totalInferences = 0;
const serverStartTime = Date.now();

app.get('/api/model/status', (req: Request, res: Response) => {
  const isKeyPresent = !!process.env.GEMINI_API_KEY;
  res.json({
    status: isKeyPresent ? 'online' : 'unconfigured',
    provider: 'Google Gemini Multimodal Vision API (Official Server-Side)',
    modelName: 'gemini-2.5-flash',
    version: 'RetinaGuard-Gemini-v2.5',
    apiKeyConfigured: isKeyPresent,
    uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
    icdrClassesSupported: [
      'No apparent DR (Stage 0)',
      'Mild Non-Proliferative DR (Stage 1)',
      'Moderate Non-Proliferative DR (Stage 2)',
      'Severe Non-Proliferative DR (Stage 3)',
      'Proliferative DR (Stage 4)',
      'Indeterminate / Inconclusive'
    ],
    analysisMethod: 'Multimodal Retinal Feature Inspection & Region-of-Interest Localization',
    totalInferencesServed: totalInferences,
    experimentalNotice: 'EXPERIMENTAL AI DECISION-SUPPORT TOOL – NOT A CERTIFIED MEDICAL DIAGNOSIS'
  });
});

// Real Server-Side Retinal AI Inference Endpoint via Gemini API
app.post('/api/analyze-retina', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  try {
    const { imageBase64, patientId, eyeSide, facilityName } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ error: 'A valid base64 retinal fundus image is required.' });
      return;
    }

    // Clean data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const mimeMatch = imageBase64.match(/^data:(image\/[a-z]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    // Server-Side Gemini API Key Check
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY in the Settings or environment variables.',
        code: 'MISSING_GEMINI_API_KEY'
      });
      return;
    }

    // Initialize the official Gemini SDK strictly on the server
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are an expert AI assistant specializing in ophthalmic image feature inspection and preliminary diabetic retinopathy screening support for rural healthcare workers in India.

CRITICAL CLINICAL & ETHICAL PRINCIPLES:
1. EXPERIMENTAL NATURE: You provide EXPERIMENTAL AI decision support, NOT a clinical medical diagnosis.
2. NO RANDOM SCORES: Do not invent arbitrary statistical confidence percentages (like 97.4%). Instead, assign a qualitative confidence level ('High', 'Moderate', 'Low', or 'Indeterminate') strictly based on image quality, illumination, focus, and anatomical visibility.
3. NO FAKE GRAD-CAM: Pinpoint real, observed visual regions of interest (ROI) where specific anatomical features or lesions (microaneurysms, hemorrhages, hard lipid exudates, cotton wool spots, neovascular fronds, or normal disc/macular structures) are actually visible.
4. VALIDATION OF RETINAL IMAGE: If the image is not a retinal fundus photo (or is completely blurred, overexposed, or unreadable), classify it as 'Indeterminate / Inconclusive' and state why.
5. ICDR CLASSIFICATION CRITERIA (International Clinical Diabetic Retinopathy Disease Severity Scale):
   - 'No apparent DR' (Stage 0): Clear retina, normal vessels, no microaneurysms or hemorrhages.
   - 'Mild' (Stage 1): Microaneurysms only.
   - 'Moderate' (Stage 2): More than microaneurysms but less than severe (scattered blot hemorrhages, hard lipid exudates).
   - 'Severe' (Stage 3): >20 intraretinal hemorrhages in each of 4 quadrants, definite venous beading in 2+ quadrants, or prominent IRMA in 1+ quadrant, without neovascularization.
   - 'Proliferative DR' (Stage 4): Neovascularization (NVD or NVE) or vitreous/preretinal hemorrhage.
   - 'Indeterminate / Inconclusive': Non-diagnostic image quality or non-retinal image.

COUNSELING & LANGUAGE:
- Provide accessible patient counseling summaries in English, Telugu (తెలుగు), and Hindi (हिन्दी) so village healthcare workers (ASHA/ANM) can explain findings empathetically without medical jargon.
- Emphasize that all results must be validated by an eye-care professional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            {
              text: `Perform experimental AI feature analysis on this fundus image for Patient: ${patientId || 'Patient'}, Eye: ${eyeSide || 'OD'}, Health Facility: ${facilityName || 'Rural PHC'}. Return valid JSON.`
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isRetinalImage: { 
              type: Type.BOOLEAN, 
              description: 'True if the image appears to be a human retinal fundus photograph' 
            },
            classification: {
              type: Type.STRING,
              enum: ['No apparent DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR', 'Indeterminate / Inconclusive'],
              description: 'Preliminary ICDR Classification'
            },
            icdrStage: {
              type: Type.INTEGER,
              description: 'Numeric stage: 0 for No DR, 1 for Mild, 2 for Moderate, 3 for Severe, 4 for PDR, -1 for Indeterminate'
            },
            confidenceLevel: {
              type: Type.STRING,
              enum: ['High', 'Moderate', 'Low', 'Indeterminate'],
              description: 'Qualitative confidence based on image clarity and lesion distinctness'
            },
            confidenceRationale: {
              type: Type.STRING,
              description: 'Explanation for the assigned confidence level based on image focus and observable pathology'
            },
            detectedFindings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of observed clinical features (e.g., sharp optic disc margins, focal microaneurysms, blot hemorrhages)'
            },
            visualFindingsSummary: {
              type: Type.STRING,
              description: 'Summary of the visual features and regions of interest identified'
            },
            attentionRegions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  x: { type: Type.NUMBER, description: 'Normalized horizontal coordinate 0.0 to 1.0' },
                  y: { type: Type.NUMBER, description: 'Normalized vertical coordinate 0.0 to 1.0' },
                  radius: { type: Type.NUMBER, description: 'Normalized inspection radius 0.03 to 0.15' },
                  findingType: {
                    type: Type.STRING,
                    enum: [
                      'microaneurysm',
                      'hemorrhage',
                      'hard_exudate',
                      'cotton_wool_spot',
                      'neovascularization',
                      'venous_beading',
                      'normal_vasculature',
                      'artifact_or_obscuration'
                    ]
                  },
                  label: { type: Type.STRING },
                  clinicalNote: { type: Type.STRING }
                },
                required: ['id', 'x', 'y', 'radius', 'findingType', 'label', 'clinicalNote']
              },
              description: 'Visual regions of interest with observed anatomical or pathological features'
            },
            explanationNonTechnical: {
              type: Type.STRING,
              description: 'Plain English counseling explanation for the patient'
            },
            explanationTelugu: {
              type: Type.STRING,
              description: 'Plain Telugu (తెలుగు) counseling explanation for the patient'
            },
            explanationHindi: {
              type: Type.STRING,
              description: 'Plain Hindi (हिन्दी) counseling explanation for the patient'
            },
            clinicalRecommendation: {
              type: Type.STRING,
              description: 'Recommended follow-up timeframe and guidance to consult a certified ophthalmologist'
            }
          },
          required: [
            'isRetinalImage',
            'classification',
            'icdrStage',
            'confidenceLevel',
            'confidenceRationale',
            'detectedFindings',
            'visualFindingsSummary',
            'attentionRegions',
            'explanationNonTechnical',
            'clinicalRecommendation'
          ]
        }
      }
    });

    const parsedResult = JSON.parse(response.text || '{}');
    totalInferences++;

    const latencyMs = Date.now() - startTime;
    console.log(`[RetinaGuard] Gemini inference completed in ${latencyMs}ms with classification: ${parsedResult.classification}`);

    res.json({
      ...parsedResult,
      latencyMs,
      isExperimental: true,
      safetyDisclaimer: 'EXPERIMENTAL AI SCREENING ANALYSIS – NOT A MEDICAL DIAGNOSIS. Please consult a qualified eye-care professional for comprehensive dilated clinical examination.',
      analyzedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[RetinaGuard API Error]:', error);
    res.status(500).json({
      error: 'Failed to complete retinal AI analysis.',
      details: error?.message || 'Gemini Vision API encountered an error processing the image.'
    });
  }
});

// Vite Middleware for Development / Static serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RetinaGuard AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

// Start server if not running on Vercel Serverless
if (!process.env.VERCEL) {
  startServer();
}

export default app;
