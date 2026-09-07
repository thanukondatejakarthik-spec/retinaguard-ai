import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, Info, Layers, RefreshCw } from 'lucide-react';

interface ThreeRetinaSceneProps {
  interactive?: boolean;
  stageName?: string;
  className?: string;
}

export const ThreeRetinaScene: React.FC<ThreeRetinaSceneProps> = ({
  stageName = 'Normal Retinal Anatomy',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeZone, setActiveZone] = useState<string>('Macula & Fovea Centralis');
  const [zoneDetails, setZoneDetails] = useState<string>(
    'Highest concentration of cone photoreceptors responsible for sharp central vision. Monitored closely for diabetic macular edema (DME).'
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 320;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Group for entire eye structure
    const eyeGroup = new THREE.Group();
    scene.add(eyeGroup);

    // 1. Posterior Retinal Hemisphere (The fundus interior)
    const retinaGeo = new THREE.SphereGeometry(1.6, 64, 32, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55);
    // Canvas texture for retinal microvasculature inside 3D globe
    const cvs = document.createElement('canvas');
    cvs.width = 1024;
    cvs.height = 512;
    const ctx = cvs.getContext('2d');
    if (ctx) {
      // Retinal orange-red interior
      const gr = ctx.createLinearGradient(0, 0, 1024, 512);
      gr.addColorStop(0, '#991b1b');
      gr.addColorStop(0.5, '#7f1d1d');
      gr.addColorStop(1, '#450a0a');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, 1024, 512);

      // Optic disc simulation on texture
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(320, 256, 45, 0, Math.PI * 2);
      ctx.fill();

      // Fovea on texture
      ctx.fillStyle = '#310404';
      ctx.beginPath();
      ctx.arc(580, 256, 32, 0, Math.PI * 2);
      ctx.fill();

      // Vascular branches
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 4;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(320, 256);
        ctx.bezierCurveTo(
          320 + Math.cos(i) * 120, 256 + Math.sin(i) * 90,
          450 + Math.cos(i) * 220, 256 + Math.sin(i) * 180,
          600 + Math.cos(i) * 350, 256 + Math.sin(i) * 220
        );
        ctx.stroke();
      }
    }
    const retinaTex = new THREE.CanvasTexture(cvs);

    const retinaMat = new THREE.MeshStandardMaterial({
      map: retinaTex,
      side: THREE.BackSide,
      roughness: 0.4,
      metalness: 0.1,
    });
    const retinaMesh = new THREE.Mesh(retinaGeo, retinaMat);
    eyeGroup.add(retinaMesh);

    // 2. Anterior Outer Sclera / Cornea Ring (frosted medical glass effect)
    const scleraGeo = new THREE.SphereGeometry(1.65, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.42);
    const scleraMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.336, // optical index of aqueous humor
      side: THREE.DoubleSide,
    });
    const scleraMesh = new THREE.Mesh(scleraGeo, scleraMat);
    eyeGroup.add(scleraMesh);

    // 3. Lens & Pupil Aperture ring
    const pupilGeo = new THREE.RingGeometry(0.35, 0.85, 32);
    const pupilMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const pupilMesh = new THREE.Mesh(pupilGeo, pupilMat);
    pupilMesh.position.z = 1.35;
    eyeGroup.add(pupilMesh);

    // 4. Optic Nerve Stem (posterior exit)
    const nerveGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.8, 24);
    const nerveMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.5,
    });
    const nerveMesh = new THREE.Mesh(nerveGeo, nerveMat);
    nerveMesh.rotation.x = Math.PI / 2;
    nerveMesh.position.set(-0.4, 0, -1.8);
    eyeGroup.add(nerveMesh);

    // 5. High-Tech Laser Scanning Beam / Plane
    const scanPlaneGeo = new THREE.PlaneGeometry(3.2, 0.05);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    eyeGroup.add(scanPlane);

    // 6. Medical HUD Particles around globe
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.0 + Math.random() * 0.5;
      positions[p * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[p * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[p * 3 + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    eyeGroup.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const cyanSpot = new THREE.PointLight(0x06b6d4, 3, 10);
    cyanSpot.position.set(2, 3, 3);
    scene.add(cyanSpot);

    const warmInterior = new THREE.PointLight(0xf97316, 2.5, 6);
    warmInterior.position.set(0, 0, 0.2);
    scene.add(warmInterior);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0.2;
    let targetRotY = -0.3;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = mouseX * 0.8 - 0.3;
      targetRotX = -mouseY * 0.5 + 0.2;
    };

    container.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth damped rotation towards cursor
      eyeGroup.rotation.y += (targetRotY - eyeGroup.rotation.y) * 0.05;
      eyeGroup.rotation.x += (targetRotX - eyeGroup.rotation.x) * 0.05;

      // Laser scanning motion up and down
      scanPlane.position.y = Math.sin(elapsed * 1.8) * 1.1;
      scanPlane.rotation.z = Math.sin(elapsed * 0.5) * 0.1;

      // Gentle particles orbit
      particles.rotation.y = elapsed * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', onMouseMove);
      resizeObserver.disconnect();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      retinaTex.dispose();
      retinaGeo.dispose();
      scleraGeo.dispose();
      particleGeo.dispose();
    };
  }, []);

  const selectZone = (name: string, description: string) => {
    setActiveZone(name);
    setZoneDetails(description);
  };

  return (
    <div className={`relative flex flex-col rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-4 border border-cyan-500/20 backdrop-blur-xl shadow-2xl overflow-hidden ${className}`}>
      {/* 3D Header Bar */}
      <div className="flex items-center justify-between z-10 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Interactive 3D Fundus Anatomy
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Ray-Traced Ocular Cross-Section
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] text-cyan-300 font-medium font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          XAI Raycast
        </span>
      </div>

      {/* 3D Canvas Stage */}
      <div 
        ref={containerRef} 
        className="w-full h-64 sm:h-72 rounded-xl cursor-grab active:cursor-grabbing relative overflow-hidden bg-slate-950/40 border border-slate-800/60"
        title="Click & move cursor to inspect 3D fundus curvature"
      >
        <div className="absolute top-2 left-2 pointer-events-none text-[10px] text-cyan-400/70 bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
          Model: {stageName}
        </div>
        <div className="absolute bottom-2 right-2 pointer-events-none text-[9px] text-slate-500 bg-slate-950/70 px-2 py-0.5 rounded font-mono flex items-center gap-1">
          <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Interactive 3D Orbit
        </div>
      </div>

      {/* Anatomical Key Zones selector */}
      <div className="mt-3 grid grid-cols-3 gap-1.5 z-10">
        <button
          type="button"
          onClick={() => selectZone('Macula & Fovea Centralis', 'Highest concentration of cone photoreceptors responsible for sharp central vision. Monitored closely for diabetic macular edema (DME).')}
          className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition text-left border ${
            activeZone.includes('Macula')
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-sm'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Macula / Fovea
        </button>
        <button
          type="button"
          onClick={() => selectZone('Optic Disc & Cup', 'Convergence point of 1.2M retinal ganglion cells exiting to optic nerve. Assessed for neovascularization at the disc (NVD).')}
          className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition text-left border ${
            activeZone.includes('Optic')
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-sm'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Optic Disc
        </button>
        <button
          type="button"
          onClick={() => selectZone('Retinal Vascular Arcades', 'Superior and inferior vascular branches prone to microaneurysm outpouching, intraretinal blot hemorrhages, and venous caliber beading.')}
          className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition text-left border ${
            activeZone.includes('Arcades')
              ? 'bg-rose-500/20 border-rose-400/50 text-rose-200 shadow-sm'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Vascular Arcades
        </button>
      </div>

      {/* Active Zone Detail Card */}
      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-cyan-300">{activeZone}: </span>
          <span className="text-slate-300">{zoneDetails}</span>
        </div>
      </div>
    </div>
  );
};
