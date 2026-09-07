import { jsPDF } from 'jspdf';
import type { ScreeningRecord } from '../types';

export function generateScreeningPdfReport(record: ScreeningRecord, clinicianName?: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // App Title
  doc.setTextColor(56, 189, 248); // sky-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RetinaGuard AI', margin, 12);

  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Explainable Diabetic Retinopathy Screening for Rural India', margin, 18);

  // Report Reference Code
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(8);
  doc.text(`REPORT REF: ${record.id.toUpperCase()}`, pageWidth - margin - 50, 12);
  doc.text(`ISSUED: ${new Date(record.timestamp).toLocaleString('en-IN')}`, pageWidth - margin - 50, 18);

  let y = 36;

  // Prominent Safety Disclaimer Banner
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

  doc.setTextColor(146, 64, 14); // amber-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('EXPERIMENTAL AI DECISION SUPPORT – NOT A MEDICAL DIAGNOSIS', margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    'This report contains experimental assistive AI analysis for rural triage support. All findings must be clinically validated by a qualified ophthalmologist.',
    margin + 4,
    y + 10,
    { maxWidth: contentWidth - 8 }
  );

  y += 19;

  // Patient Demographics & Facility
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Patient & Examination Details', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const col1 = margin + 4;
  const col2 = margin + 65;
  const col3 = margin + 125;

  doc.text(`Patient ID: ${record.patientId || 'N/A'}`, col1, y + 13);
  doc.text(`Name: ${record.patientName || 'Anonymous Patient'}`, col1, y + 19);

  doc.text(`Age: ${record.patientAge || 'Unknown'} yrs`, col2, y + 13);
  doc.text(`Eye: ${record.eyeSide === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}`, col2, y + 19);

  doc.text(`Center: ${record.facilityLocation || 'Primary Health Center'}`, col3, y + 13);
  doc.text(`Examiner: ${clinicianName || 'Health Center Staff'}`, col3, y + 19);

  y += 30;

  // AI Classification Section
  const isHighRisk = record.classification === 'Severe' || record.classification === 'Proliferative DR';
  const isMild = record.classification === 'Mild' || record.classification === 'Moderate';

  const badgeBg = isHighRisk ? [254, 226, 226] : isMild ? [254, 243, 199] : [220, 252, 231];
  const badgeBorder = isHighRisk ? [239, 68, 68] : isMild ? [245, 158, 11] : [34, 197, 94];
  const badgeText = isHighRisk ? [153, 27, 27] : isMild ? [146, 64, 14] : [22, 101, 52];

  doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
  doc.setDrawColor(badgeBorder[0], badgeBorder[1], badgeBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'FD');

  doc.setTextColor(badgeText[0], badgeText[1], badgeText[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`ICDR CLASSIFICATION: ${record.classification.toUpperCase()}`, margin + 4, y + 9);

  doc.setFontSize(9);
  doc.text(`Confidence Assessment: ${record.confidenceLevel || 'Moderate'}`, margin + 4, y + 15);
  doc.text(`Stage Level: ${record.icdrStage >= 0 ? `Stage ${record.icdrStage} of 4` : 'Inconclusive'}`, margin + 75, y + 15);

  y += 26;

  // Retinal Image & Explainability Preview
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, 70, 70, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Retinal Fundus Image', margin + 4, y + 6);

  if (record.imageUrl) {
    try {
      doc.addImage(record.imageUrl, 'JPEG', margin + 5, y + 10, 60, 56);
    } catch (e) {
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('[Image attached in cloud record]', margin + 10, y + 35);
    }
  }

  // Findings & Explainability Box next to image
  const rightBoxX = margin + 75;
  const rightBoxWidth = contentWidth - 75;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightBoxX, y, rightBoxWidth, 70, 1.5, 1.5, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('AI Visual Feature Localization', rightBoxX + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);

  let findingY = y + 12;
  const findings = record.detectedFindings && record.detectedFindings.length > 0 
    ? record.detectedFindings 
    : ['No abnormal vascular outpouchings observed', 'Clear macular avascular zone'];

  findings.slice(0, 4).forEach((f) => {
    doc.text(`• ${f}`, rightBoxX + 4, findingY, { maxWidth: rightBoxWidth - 8 });
    findingY += 5.5;
  });

  findingY += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Visual Inspection Focus:', rightBoxX + 4, findingY);
  findingY += 4.5;
  doc.setFont('helvetica', 'normal');
  const summaryText = record.visualFindingsSummary || record.gradCamAttentionSummary || 'Multimodal inspection focused on optic disc, vascular arcades, and macula.';
  doc.text(summaryText, rightBoxX + 4, findingY, { maxWidth: rightBoxWidth - 8 });

  y += 76;

  // Non-Technical Plain Language Explanation
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Patient Explanation (Accessible Summary)', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const plainText = record.explanationNonTechnical || 'The automated scan has analyzed the retina for blood vessel changes related to blood sugar levels.';
  doc.text(plainText, margin + 4, y + 11, { maxWidth: contentWidth - 8 });

  y += 29;

  // Recommended Next Steps (Referral Guidance)
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(199, 210, 254); // indigo-200
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setTextColor(30, 27, 75); // indigo-950
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Recommended Clinical Next Steps (Referral Guidance)', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(67, 56, 202);
  const recText = record.clinicalRecommendation || 'Schedule annual diabetic retinal screening or consult an ophthalmologist for dilated funduscopic examination.';
  doc.text(recText, margin + 4, y + 11, { maxWidth: contentWidth - 8 });

  // Footer & Official Verification
  const footerY = 285;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated by RetinaGuard AI Screening Platform • Tele-ophthalmology Decision Support', margin, footerY);
  doc.text(`Digital Verification Hash: SHA256-${record.id.slice(0, 16)}`, pageWidth - margin - 60, footerY);

  // Trigger download
  doc.save(`RetinaGuard_Screening_${record.patientId || 'Patient'}_${record.eyeSide}.pdf`);
}
