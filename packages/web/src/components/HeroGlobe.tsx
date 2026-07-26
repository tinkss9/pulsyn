'use client';

import { useEffect, useRef } from 'react';

// Pulsyn Hero Globe — Subtle particle sphere with catalyst particle
// One dark dot bounces slowly, then accelerates, energizing other particles on contact
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

    // === PARTICLES (subtle, calm) ===
    interface Particle {
      theta: number;
      phi: number;
      baseSize: number;
      size: number;
      baseBrightness: number;
      brightness: number;
      pulsePhase: number;
      pulseSpeed: number;
      // Energy from catalyst hit
      energy: number;
      energyDecay: number;
      // Bounce velocity (from catalyst)
      vx: number;
      vy: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 2500; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / 2500);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const baseSize = 0.3 + Math.random() * 0.8;
      const baseBrightness = 0.15 + Math.random() * 0.5;
      particles.push({
        theta,
        phi,
        baseSize,
        size: baseSize,
        baseBrightness,
        brightness: baseBrightness,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.2 + Math.random() * 0.8,
        energy: 0,
        energyDecay: 0.97,
        vx: 0,
        vy: 0,
      });
    }

    // === CATALYST PARTICLE ===
    // Dark dot that bounces around, energizing particles it passes near
    const catalyst = {
      theta: 0,
      phi: Math.PI / 2,
      speed: 0.002,        // Starts slow
      baseSpeed: 0.002,
      maxSpeed: 0.015,      // Gets fast
      direction: 1,         // 1 or -1
      size: 4,              // Bigger than other particles
      bouncePhase: 0,       // For bounce animation
      hitRadius: 0.3,       // How close to energize particles
      energizeAmount: 1.0,  // How much energy to transfer
      // Bounce path — sine wave on phi
      bounceAmplitude: 0.8,
      bounceFrequency: 0.3,
    };

    // === DATA FLOW ARCS (subtle) ===
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
      { fromTheta: -1.2, fromPhi: 0.5, toTheta: 2.5, toPhi: 0.8, progress: 0, speed: 0.002, size: 1.5 },
      { fromTheta: 2.1, fromPhi: 0.6, toTheta: 0.8, toPhi: 1.0, progress: 0.3, speed: 0.0015, size: 1.2 },
      { fromTheta: 0.3, fromPhi: 1.2, toTheta: -0.5, toPhi: 0.4, progress: 0.6, speed: 0.0025, size: 1.5 },
      { fromTheta: -0.8, fromPhi: 0.3, toTheta: 1.8, toPhi: 0.9, progress: 0.1, speed: 0.002, size: 1.2 },
      { fromTheta: 1.5, fromPhi: 1.1, toTheta: -1.0, toPhi: 0.5, progress: 0.8, speed: 0.0018, size: 1.8 },
      { fromTheta: 0.5, fromPhi: 0.2, toTheta: -0.3, toPhi: 1.3, progress: 0.4, speed: 0.002, size: 1.0 },
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
      time += 0.006; // Slower overall
      const w = W();
      const h = H();

      // Very slow fade
      ctx.fillStyle = 'rgba(8, 8, 12, 0.06)';
      ctx.fillRect(0, 0, w, h);

      const rotY = time * 0.2;
      const rotX = Math.sin(time * 0.08) * 0.12;

      // === UPDATE CATALYST ===
      catalyst.bouncePhase += 0.02;
      catalyst.speed = catalyst.baseSpeed + (catalyst.maxSpeed - catalyst.baseSpeed) * 
        (0.5 + 0.5 * Math.sin(catalyst.bouncePhase * 0.5)); // Slow → fast → slow cycle

      catalyst.theta += catalyst.speed * catalyst.direction;
      catalyst.phi = Math.PI / 2 + Math.sin(catalyst.theta * catalyst.bounceFrequency) * catalyst.bounceAmplitude;

      // Bounce off poles
      if (catalyst.phi < 0.3 || catalyst.phi > Math.PI - 0.3) {
        catalyst.direction *= -1;
      }

      // Catalyst position in 3D
      const catalystPos = project(catalyst.theta, catalyst.phi, rotY, rotX);

      // === ENERGIZE NEARBY PARTICLES ===
      for (const p of particles) {
        // Distance on sphere surface (approximate)
        const dTheta = Math.abs(p.theta - catalyst.theta);
        const dPhi = Math.abs(p.phi - catalyst.phi);
        const dist = Math.sqrt(dTheta * dTheta + dPhi * dPhi);

        if (dist < catalyst.hitRadius) {
          // Hit! Transfer energy
          const hitStrength = 1 - dist / catalyst.hitRadius;
          p.energy = Math.min(1, p.energy + catalyst.energizeAmount * hitStrength);
          
          // Push particle away from catalyst
          const pushAngle = Math.atan2(p.phi - catalyst.phi, p.theta - catalyst.theta);
          p.vx += Math.cos(pushAngle) * hitStrength * 0.02;
          p.vy += Math.sin(pushAngle) * hitStrength * 0.02;
        }

        // Decay energy
        p.energy *= p.energyDecay;
        p.vx *= 0.95;
        p.vy *= 0.95;

        // Apply energy to size and brightness
        p.size = p.baseSize + p.energy * 2;
        p.brightness = p.baseBrightness + p.energy * 0.6;

        // Apply bounce velocity to position
        p.theta += p.vx;
        p.phi += p.vy;
      }

      // === OUTER GLOW (very subtle) ===
      const glow = ctx.createRadialGradient(cx(), cy(), R() * 0.5, cx(), cy(), R() * 1.2);
      glow.addColorStop(0, 'rgba(6, 182, 212, 0.03)');
      glow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx(), cy(), R() * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // === DRAW PARTICLES ===
      const projected: { x: number; y: number; z: number; size: number; alpha: number; energy: number }[] = [];

      for (const p of particles) {
        const pos = project(p.theta, p.phi, rotY, rotX);
        const pulse = 0.8 + 0.2 * Math.sin(time * p.pulseSpeed + p.pulsePhase);
        const depthFactor = 0.3 + (pos.z / R()) * 0.7;
        projected.push({
          x: pos.x,
          y: pos.y,
          z: pos.z,
          size: p.size * (0.4 + depthFactor * 0.6),
          alpha: p.brightness * pulse * depthFactor * 0.7,
          energy: p.energy,
        });
      }

      projected.sort((a, b) => a.z - b.z);

      for (const p of projected) {
        if (p.z > -R() * 0.3) {
          // Base particle
          ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Energy glow (only when energized)
          if (p.energy > 0.1) {
            ctx.fillStyle = `rgba(34, 211, 238, ${p.energy * 0.3})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // === DRAW CATALYST (dark dot with glow) ===
      if (catalystPos.z > -R() * 0.2) {
        // Catalyst glow (energy aura)
        const catalystGlow = ctx.createRadialGradient(
          catalystPos.x, catalystPos.y, 0,
          catalystPos.x, catalystPos.y, 20
        );
        catalystGlow.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        catalystGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
        catalystGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = catalystGlow;
        ctx.beginPath();
        ctx.arc(catalystPos.x, catalystPos.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Catalyst core (dark)
        ctx.fillStyle = 'rgba(20, 20, 30, 0.95)';
        ctx.beginPath();
        ctx.arc(catalystPos.x, catalystPos.y, catalyst.size, 0, Math.PI * 2);
        ctx.fill();

        // Catalyst rim (bright)
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(catalystPos.x, catalystPos.y, catalyst.size, 0, Math.PI * 2);
        ctx.stroke();
      }

      // === DATA FLOWS (subtle) ===
      for (const flow of flows) {
        flow.progress = (flow.progress + flow.speed) % 1;
        const theta = flow.fromTheta + (flow.toTheta - flow.fromTheta) * flow.progress;
        const phi = flow.fromPhi + (flow.toPhi - flow.fromPhi) * flow.progress;
        const pos = project(theta, phi, rotY, rotX);

        if (pos.z > 0) {
          const depthAlpha = pos.z / R();
          ctx.fillStyle = `rgba(6, 182, 212, ${0.5 * depthAlpha})`;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, flow.size, 0, Math.PI * 2);
          ctx.fill();

          // Trail
          for (let t = 0; t < 0.08; t += 0.02) {
            const tp = (flow.progress - t + 1) % 1;
            const tTheta = flow.fromTheta + (flow.toTheta - flow.fromTheta) * tp;
            const tPhi = flow.fromPhi + (flow.toPhi - flow.fromPhi) * tp;
            const tPos = project(tTheta, tPhi, rotY, rotX);
            if (tPos.z > 0) {
              ctx.fillStyle = `rgba(6, 182, 212, ${depthAlpha * (1 - t / 0.08) * 0.2})`;
              ctx.beginPath();
              ctx.arc(tPos.x, tPos.y, flow.size * 0.4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // === CENTER PULSE (very subtle) ===
      const breathe = 10 + Math.sin(time * 0.8) * 3;
      const cg = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), breathe);
      cg.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      cg.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx(), cy(), breathe, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(cx(), cy(), 1.5, 0, Math.PI * 2);
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
