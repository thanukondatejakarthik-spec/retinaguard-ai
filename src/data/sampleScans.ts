import type { ICDRClassification, EyeSide } from '../types';

export interface SampleFundusScan {
  id: string;
  name: string;
  eyeSide: EyeSide;
  groundTruthStage: ICDRClassification;
  icdrNumber: number;
  description: string;
  clinicalFindingsSummary: string;
  imageDataUrl: string;
}

// Function to generate authentic retinal fundus imagery onto canvas
function createFundusImage(options: {
  stage: number;
  eyeSide: 'OD' | 'OS';
  width?: number;
  height?: number;
}): string {
  const width = options.width || 600;
  const height = options.height || 600;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  // Background black camera mask
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, width, height);

  // Retinal Circular Field
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  // Retinal orange-red gradient background
  const bgGrad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
  bgGrad.addColorStop(0, '#c2410c'); // warm inner orange
  bgGrad.addColorStop(0.5, '#991b1b'); // deep retinal red
  bgGrad.addColorStop(0.85, '#7f1d1d'); // darker peripheral red
  bgGrad.addColorStop(1.0, '#450a0a'); // dark choroid border
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Subtle choroidal texture
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  for (let i = 0; i < 400; i++) {
    const rx = cx + (Math.random() - 0.5) * radius * 1.8;
    const ry = cy + (Math.random() - 0.5) * radius * 1.8;
    ctx.beginPath();
    ctx.arc(rx, ry, Math.random() * 8 + 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Optic Disc position: Nasal side (OD = left in image, OS = right in image)
  const isOD = options.eyeSide === 'OD';
  const discX = isOD ? cx - radius * 0.46 : cx + radius * 0.46;
  const discY = cy - radius * 0.05;
  const discRadius = radius * 0.16;

  // Fovea/Macula position: Temporal side
  const foveaX = isOD ? cx + radius * 0.22 : cx - radius * 0.22;
  const foveaY = cy;

  // Render Macula / Fovea centralis (darker avascular center)
  const maculaGrad = ctx.createRadialGradient(foveaX, foveaY, 2, foveaX, foveaY, radius * 0.22);
  maculaGrad.addColorStop(0, '#450a0a');
  maculaGrad.addColorStop(0.4, '#7f1d1d');
  maculaGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = maculaGrad;
  ctx.beginPath();
  ctx.arc(foveaX, foveaY, radius * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Foveal light reflex
  ctx.fillStyle = 'rgba(254, 243, 199, 0.3)';
  ctx.beginPath();
  ctx.arc(foveaX, foveaY, 2, 0, Math.PI * 2);
  ctx.fill();

  // Render Optic Disc (yellowish-orange oval with physiological cup)
  const discGrad = ctx.createRadialGradient(discX, discY, discRadius * 0.2, discX, discY, discRadius);
  discGrad.addColorStop(0, '#fef08a'); // bright cup
  discGrad.addColorStop(0.5, '#fde047'); // disc body
  discGrad.addColorStop(0.9, '#f59e0b'); // disc margin
  discGrad.addColorStop(1.0, '#b45309'); // crescent border
  ctx.fillStyle = discGrad;
  ctx.beginPath();
  ctx.ellipse(discX, discY, discRadius, discRadius * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Physiological cup
  ctx.fillStyle = '#fffbeb';
  ctx.beginPath();
  ctx.ellipse(discX, discY, discRadius * 0.4, discRadius * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Retinal Vasculature (Arcades: Superior & Inferior Temporal and Nasal)
  const drawVesselTree = (startX: number, startY: number, angle: number, length: number, thickness: number, isArtery: boolean, depth = 0) => {
    if (depth > 4 || length < 8) return;
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      (startX + endX) / 2 + (Math.sin(angle) * 12 * (depth % 2 === 0 ? 1 : -1)),
      (startY + endY) / 2 + (Math.cos(angle) * 12 * (depth % 2 === 0 ? 1 : -1)),
      endX,
      endY
    );
    ctx.strokeStyle = isArtery ? 'rgba(239, 68, 68, 0.85)' : 'rgba(127, 29, 29, 0.95)';
    ctx.lineWidth = Math.max(thickness, 1);
    ctx.lineCap = 'round';
    ctx.stroke();

    // Branching
    const branchCount = depth === 0 ? 2 : (Math.random() > 0.3 ? 2 : 1);
    for (let b = 0; b < branchCount; b++) {
      const spread = (Math.random() * 0.5 - 0.25) + (b === 0 ? -0.3 : 0.3);
      drawVesselTree(endX, endY, angle + spread, length * 0.72, thickness * 0.7, isArtery, depth + 1);
    }
  };

  // Superior & Inferior arcades curving toward macula
  const temporalDir = isOD ? 1 : -1;
  // Superior temporal arcade
  drawVesselTree(discX, discY - 10, -Math.PI / 2 + (0.45 * temporalDir), radius * 0.4, 4.5, false);
  drawVesselTree(discX + (5 * temporalDir), discY - 8, -Math.PI / 2 + (0.5 * temporalDir), radius * 0.38, 3.2, true);

  // Inferior temporal arcade
  drawVesselTree(discX, discY + 10, Math.PI / 2 - (0.45 * temporalDir), radius * 0.4, 4.5, false);
  drawVesselTree(discX + (5 * temporalDir), discY + 8, Math.PI / 2 - (0.5 * temporalDir), radius * 0.38, 3.2, true);

  // Nasal vessels
  drawVesselTree(discX, discY - 5, -Math.PI / 2 - (0.6 * temporalDir), radius * 0.3, 3.5, false);
  drawVesselTree(discX, discY + 5, Math.PI / 2 + (0.6 * temporalDir), radius * 0.3, 3.5, false);

  // Pathological Lesions Based on ICDR Stage (0 = Normal, 1 = Mild, 2 = Moderate, 3 = Severe, 4 = Proliferative)
  if (options.stage >= 1) {
    // Stage 1: Microaneurysms (isolated dark red pinpoint dots)
    const countMA = options.stage === 1 ? 7 : (options.stage === 2 ? 18 : 35);
    ctx.fillStyle = 'rgba(153, 27, 27, 0.95)';
    for (let i = 0; i < countMA; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = radius * (0.15 + Math.random() * 0.45);
      const mx = foveaX + Math.cos(angle) * dist;
      const my = foveaY + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(mx, my, 1.8 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (options.stage >= 2) {
    // Stage 2: Blot hemorrhages and hard lipid exudates (creamy yellow clusters)
    const countHeme = options.stage === 2 ? 8 : (options.stage === 3 ? 24 : 32);
    // Blot hemorrhages (dark red irregular spots)
    ctx.fillStyle = 'rgba(127, 29, 29, 0.92)';
    for (let i = 0; i < countHeme; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = radius * (0.2 + Math.random() * 0.5);
      const hx = cx + Math.cos(angle) * dist;
      const hy = cy + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.ellipse(hx, hy, 4 + Math.random() * 4, 3 + Math.random() * 3, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hard exudates (lipid deposits: bright yellowish clusters around macula)
    ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
    for (let cluster = 0; cluster < (options.stage === 2 ? 3 : 6); cluster++) {
      const baseAngle = Math.random() * Math.PI * 2;
      const baseDist = radius * (0.25 + Math.random() * 0.25);
      const clX = foveaX + Math.cos(baseAngle) * baseDist;
      const clY = foveaY + Math.sin(baseAngle) * baseDist;
      for (let dot = 0; dot < 8; dot++) {
        const dx = clX + (Math.random() - 0.5) * 22;
        const dy = clY + (Math.random() - 0.5) * 22;
        ctx.beginPath();
        ctx.arc(dx, dy, 1.2 + Math.random() * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (options.stage >= 3) {
    // Stage 3: Severe NPDR - Cotton wool spots (soft white-gray micro-infarcts) & Extensive hemorrhages
    ctx.fillStyle = 'rgba(241, 245, 249, 0.75)';
    for (let cws = 0; cws < 4; cws++) {
      const angle = (cws / 4) * Math.PI * 2 + 0.4;
      const dist = radius * 0.38;
      const wx = cx + Math.cos(angle) * dist;
      const wy = cy + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.ellipse(wx, wy, 8 + Math.random() * 4, 6 + Math.random() * 3, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (options.stage >= 4) {
    // Stage 4: Proliferative DR - Neovascularization (fine looping fragile fronds at disc / retina)
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.9)';
    ctx.lineWidth = 1.2;
    // Neovascularization at the disc (NVD)
    for (let loop = 0; loop < 12; loop++) {
      ctx.beginPath();
      ctx.moveTo(discX, discY);
      const lx1 = discX + (Math.random() - 0.5) * 45;
      const ly1 = discY + (Math.random() - 0.5) * 45;
      const lx2 = discX + (Math.random() - 0.5) * 55;
      const ly2 = discY + (Math.random() - 0.5) * 55;
      ctx.bezierCurveTo(lx1, ly1, lx2, ly2, discX + 5, discY + 5);
      ctx.stroke();
    }
  }

  ctx.restore();

  // Subtle circular aperture vignette & rim
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  return canvas.toDataURL('image/jpeg', 0.92);
}

// Lazy-generated sample scans available for clinical verification
let cachedSamples: SampleFundusScan[] | null = null;

export function getClinicalSampleScans(): SampleFundusScan[] {
  if (cachedSamples) return cachedSamples;

  if (typeof window === 'undefined') {
    return [];
  }

  cachedSamples = [
    {
      id: 'sample-dr0-normal',
      name: 'Patient RG-001 (OD) - Healthy Control',
      eyeSide: 'OD',
      groundTruthStage: 'No apparent DR',
      icdrNumber: 0,
      description: 'Normal fundus with crisp optic disc margins, distinct foveal reflex, and intact retinal microvasculature.',
      clinicalFindingsSummary: 'No microaneurysms, hemorrhages, or exudates observed. Normal vascular caliber.',
      imageDataUrl: createFundusImage({ stage: 0, eyeSide: 'OD' })
    },
    {
      id: 'sample-dr1-mild',
      name: 'Patient RG-002 (OS) - Mild NPDR',
      eyeSide: 'OS',
      groundTruthStage: 'Mild',
      icdrNumber: 1,
      description: 'Presence of isolated microaneurysms in the paramacular retina with otherwise clear parenchyma.',
      clinicalFindingsSummary: '7 isolated microaneurysms detected in superior/temporal paramacular fields.',
      imageDataUrl: createFundusImage({ stage: 1, eyeSide: 'OS' })
    },
    {
      id: 'sample-dr2-moderate',
      name: 'Patient RG-003 (OD) - Moderate NPDR',
      eyeSide: 'OD',
      groundTruthStage: 'Moderate',
      icdrNumber: 2,
      description: 'Multiple blot hemorrhages and distinct circinate clusters of hard lipid exudates encroaching toward the fovea.',
      clinicalFindingsSummary: '18 microaneurysms, 8 intraretinal blot hemorrhages, and lipid exudate rings.',
      imageDataUrl: createFundusImage({ stage: 2, eyeSide: 'OD' })
    },
    {
      id: 'sample-dr3-severe',
      name: 'Patient RG-004 (OS) - Severe NPDR',
      eyeSide: 'OS',
      groundTruthStage: 'Severe',
      icdrNumber: 3,
      description: 'Widespread intraretinal hemorrhages in all four quadrants, cotton wool spots (focal nerve fiber infarcts).',
      clinicalFindingsSummary: 'Extensive 4-quadrant hemorrhages, venous caliber dilation, multiple cotton wool spots.',
      imageDataUrl: createFundusImage({ stage: 3, eyeSide: 'OS' })
    },
    {
      id: 'sample-dr4-pdr',
      name: 'Patient RG-005 (OD) - Proliferative DR',
      eyeSide: 'OD',
      groundTruthStage: 'Proliferative DR',
      icdrNumber: 4,
      description: 'Neovascularization at the optic disc (NVD) with tortuous vascular loops risking vitreous hemorrhage.',
      clinicalFindingsSummary: 'Fronds of neovascular vessels at the optic nerve head, extensive pre-retinal risk markers.',
      imageDataUrl: createFundusImage({ stage: 4, eyeSide: 'OD' })
    }
  ];

  return cachedSamples;
}
