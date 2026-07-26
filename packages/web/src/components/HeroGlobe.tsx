'use client';

import { useEffect, useRef } from 'react';

// Pulsyn Hero Globe — Pure particle sphere with data flow
// No decorative rings — just data points and flowing connections
export default function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const cx = () => W() / 2;
    const cy = () => H() / 2;
    const R = () => Math.min(W(), H()) * 0.28;

    // === PARTICLE SPHERE ===
    // 2000 particles — these are "data points" across the world
    interface Particle {
      theta: number;
      phi: number;
      size: number;
      brightness: number;
      pulsePhase: number;
      pulseSpeed: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 3000; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / 3000);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      particles.push({
        theta,
        phi,
        size: 0.3 + Math.random() * 1.4,
        brightness: 0.15 + Math.random() * 0.85,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.3 + Math.random() * 1.5,
      });
    }

    // === DATA FLOW ARCS ===
    // Data packets traveling between systems — this IS the product
    interface Flow {
      fromTheta: number;
      fromPhi: number;
      toTheta: number;
      toPhi: number;
      progress: number;
      speed: number;
      size: number;
    }

    const flows: Flow[] = [
      // Major data routes
      { fromTheta: -1.2, fromPhi: 0.5, toTheta: 2.5, toPhi: 0.8, progress: 0, speed: 0.004, size: 2.5 },
      { fromTheta: 2.1, fromPhi: 0.6, toTheta: 0.8, toPhi: 1.0, progress: 0.25, speed: 0.003, size: 2 },
      { fromTheta: 0.3, fromPhi: 1.2, toTheta: -0.5, toPhi: 0.4, progress: 0.5, speed: 0.005, size: 2.5 },
      { fromTheta: -0.8, fromPhi: 0.3, toTheta: 1.8, toPhi: 0.9, progress: 0.75, speed: 0.003, size: 2 },
      { fromTheta: 1.5, fromPhi: 1.1, toTheta: -1.0, toPhi: 0.5, progress: 0.1, speed: 0.004, size: 3 },
      // Secondary routes
      { fromTheta: 0.5, fromPhi: 0.2, toTheta: -0.3, toPhi: 1.3, progress: 0.4, speed: 0.0035, size: 1.5 },
      { fromTheta: -0.5, fromPhi: 1.0, toTheta: 1.2, toPhi: 0.1, progress: 0.6, speed: 0.0025, size: 1.5 },
      { fromTheta: 2.0, fromPhi: 0.4, toTheta: -0.8, toPhi: 1.1, progress: 0.85, speed: 0.003, size: 2 },
      { fromTheta: -1.5, fromPhi: 0.7, toTheta: 0.5, toPhi: 1.4, progress: 0.15, speed: 0.002, size: 1.5 },
      { fromTheta: 1.0, fromPhi: 0.3, toTheta: -1.3, toPhi: 0.9, progress: 0.35, speed: 0.004, size: 2 },
      { fromTheta: -0.2, fromPhi: 0.8, toTheta: 1.7, toPhi: 0.2, progress: 0.55, speed: 0.003, size: 1.5 },
      { fromTheta: 0.8, fromPhi: 1.1, toTheta: -0.6, toPhi: 0.3, progress: 0.9, speed: 0.0035, size: 2 },
    ];

    let time = 0;

    // Project 3D → 2D
    const project = (theta: number, phi: number, rotY: number, rotX: number) => {
      const x = Math.sin(phi) * Math.cos(theta + rotY);
      const y = Math.cos(phi) * Math.cos(rotX);
      const z = Math.sin(phi) * Math.sin(theta + rotY) * Math.cos(rotX) + Math.cos(phi) * Math.sin(rotX);
      return { x: cx() + R() * x, y: cy() - R() * y, z };
    };

    const draw = () => {
      time += 0.008;
      const w = W();
      const h = H();

      // Slow fade for motion blur
      ctx.fillStyle = 'rgba(8, 8, 12, 0.08)';
      ctx.fillRect(0, 0, w, h);

      const rotY = time * 0.25;
      const rotX = Math.sin(time * 0.1) * 0.15;

      // === OUTER GLOW ===
      const glow = ctx.createRadialGradient(cx(), cy(), R() * 0.5, cx(), cy(), R() * 1.3);
      glow.addColorStop(0, 'rgba(6, 182, 212, 0.04)');
      glow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx(), cy(), R() * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // === PARTICLES (sorted by depth) ===
      const projected: { x: number; y: number; z: number; size: number; alpha: number }[] = [];

      for (const p of particles) {
        const pos = project(p.theta, p.phi, rotY, rotX);
        const pulse = 0.7 + 0.3 * Math.sin(time * p.pulseSpeed + p.pulsePhase);
        const depthFactor = 0.3 + (pos.z / R()) * 0.7;
        projected.push({
          x: pos.x,
          y: pos.y,
          z: pos.z,
          size: p.size * (0.4 + depthFactor * 0.6),
          alpha: p.brightness * pulse * depthFactor * 0.85,
        });
      }

      projected.sort((a, b) => a.z - b.z);

      for (const p of projected) {
        if (p.z > -R() * 0.4) {
          ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Glow on bright particles
          if (p.alpha > 0.4) {
            ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha * 0.1})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // === DATA FLOW ARCS ===
      for (const flow of flows) {
        flow.progress = (flow.progress + flow.speed) % 1;

        const theta = flow.fromTheta + (flow.toTheta - flow.fromTheta) * flow.progress;
        const phi = flow.fromPhi + (flow.toPhi - flow.fromPhi) * flow.progress;
        const pos = project(theta, phi, rotY, rotX);

        if (pos.z > 0) {
          const depthAlpha = pos.z / R();

          // Main packet
          ctx.fillStyle = `rgba(6, 182, 212, ${0.9 * depthAlpha})`;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, flow.size, 0, Math.PI * 2);
          ctx.fill();

          // Glow
          ctx.fillStyle = `rgba(6, 182, 212, ${0.2 * depthAlpha})`;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, flow.size * 5, 0, Math.PI * 2);
          ctx.fill();

          // Trail
          for (let t = 0; t < 0.12; t += 0.02) {
            const tp = (flow.progress - t + 1) % 1;
            const tTheta = flow.fromTheta + (flow.toTheta - flow.fromTheta) * tp;
            const tPhi = flow.fromPhi + (flow.toPhi - flow.fromPhi) * tp;
            const tPos = project(tTheta, tPhi, rotY, rotX);
            if (tPos.z > 0) {
              const tAlpha = depthAlpha * (1 - t / 0.12) * 0.4;
              ctx.fillStyle = `rgba(6, 182, 212, ${tAlpha})`;
              ctx.beginPath();
              ctx.arc(tPos.x, tPos.y, flow.size * 0.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // === CENTER PULSE ===
      const breathe = 15 + Math.sin(time * 1.2) * 5;
      const cg = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), breathe);
      cg.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
      cg.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx(), cy(), breathe, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(cx(), cy(), 2, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
