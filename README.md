# RetinaGuard AI – Explainable Diabetic Retinopathy Screening for Rural India

A full-stack, clinical-grade medical decision support system designed to bring accessible, explainable diabetic retinopathy (DR) screening to Primary Health Centers (PHCs) and rural clinics across India.

---

## 🌟 Key Capabilities

1. **Google Account Authentication (Firebase Auth)**:
   - Secure sign-in with Google OAuth.
   - User profile auto-synchronization with Firestore.
   - Strict Attribute-Based Access Control (ABAC) ensuring complete patient record isolation.

2. **International Clinical Diabetic Retinopathy (ICDR) Staging**:
   - Stage 0: No apparent DR (Healthy retinal microvasculature).
   - Stage 1: Mild NPDR (Isolated capillary microaneurysms).
   - Stage 2: Moderate NPDR (Scattered blot hemorrhages, hard lipid exudates).
   - Stage 3: Severe NPDR (4-2-1 rule criteria, extensive intraretinal hemorrhages).
   - Stage 4: Proliferative DR (Neovascularization on disc NVD or elsewhere NVE, vitreous bleeding).

3. **Explainable AI (XAI) & Grad-CAM Visual Attribution**:
   - Interactive Grad-CAM heatmap overlay with turbo/jet saliency colormaps.
   - Anatomical lesion bounding tags (Microaneurysms, Blot Hemorrhages, Hard Exudates, Neovascular Fronds).
   - Dual-view slider allowing doctors to transition between original raw fundus and saliency attention.

4. **Rural Healthcare & Low-Bandwidth Optimization**:
   - In-browser client-side edge compression before upload (reducing 15MB camera files to <200KB).
   - Multilingual patient counseling summaries in **English**, **Telugu (తెలుగు)**, and **Hindi (हिन्दी)** for ASHA and ANM healthcare workers.

5. **Downloadable Clinical PDF Reports (`jspdf`)**:
   - Official diagnostic report with embedded retinal image, Grad-CAM findings, patient demographics, and digital verification hash.
   - Clear clinical triage recommendations and referral urgency timelines.

6. **Medical Safety Notice**:
   - Clear banner stating: *"AI screening result — not a definitive medical diagnosis. Please consult a qualified eye-care professional."*

7. **Backend Inference Pipeline**:
   - Express backend with `/api/analyze-retina`, `/api/health`, and `/api/model/status`.
   - Native multimodal vision inference via `@google/genai` (Gemini 2.5 Flash).
   - Complete standalone Python FastAPI + PyTorch + Grad-CAM microservice reference in `/backend/`.
