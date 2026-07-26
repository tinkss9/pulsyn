'use client';

import { useEffect, useRef } from 'react';

// Pulsyn Hero Globe — Particle sphere with data flow, concentric rings, and depth
// Inspired by TikTok "Mathematic Poetry" sphere but elevated for a data platform
export default function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;
    const cx = () => W() / 2;
    const cy = () => H() / 2;
    const R = () => Math.min(W(), H()) * 0.32;

    // Mouse parallax
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left - W() / 2) / W(),
        y: (e.clientY - rect.top - H() / 2) / H(),
      };
    });

    // === PARTICLE SPHERE ===
    // 1500 particles on sphere surface (like TikTok video but more)
    interface SphereParticle {
      theta: number; // longitude
      phi: number;   // latitude
      size: number;
      brightness: number;
      pulsePhase: number;
      pulseSpeed: number;
    }

    const sphereParticles: SphereParticle[] = [];
    for (let i = 0; i < 1500; i++) {
      // Fibonacci sphere distribution for even coverage
      const phi = Math.acos(1 - 2 * (i + 0.5) / 1500);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      sphereParticles.push({
        theta,
        phi,
        size: 0.5 + Math.random() * 1.5,
        brightness: 0.3 + Math.random() * 0.7,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.5 + Math.random() * 2,
      });
    }

    // === CONCENTRIC RINGS (inside the sphere) ===
    const rings = [
      { radius: 0.25, speed: 0.012, tilt: 0.4, opacity: 0.25, width: 1.5 },
      { radius: 0.45, speed: -0.008, tilt: -0.3, opacity: 0.20, width: 1.2 },
      { radius: 0.65, speed: 0.006, tilt: 0.6, opacity: 0.15, width: 1.0 },
      { radius: 0.85, speed: -0.004, tilt: -0.5, opacity: 0.12, width: 0.8 },
      { radius: 1.0, speed: 0.003, tilt: 0.2, opacity: 0.08, width: 0.6 },
    ];

    // === DATA FLOW ARCS ===
    // These are the "wow" factor — data packets traveling along curved paths
    interface DataFlow {
      startTheta: number;
      startPhi: number;
      endTheta: number;
      endPhi: number;
      progress: number;
      speed: number;
      color: string;
      size: number;
    }

    const dataFlows: DataFlow[] = [
      // US → Europe
      { startTheta: -1.2, startPhi: 0.5, endTheta: 2.5, endPhi: 0.8, progress: 0, speed: 0.003, color: '#22D3EE', size: 3 },
      // Europe → Asia
      { startTheta: 2.1, startPhi: 0.6, endTheta: 0.8, endPhi: 1.0, progress: 0.3, speed: 0.002, color: '#06B6D4', size: 2.5 },
      // Asia → South America
      { startTheta: 0.3, startPhi: 1.2, endTheta: -0.5, endPhi: 0.4, progress: 0.6, speed: 0.004, color: '#0891B2', size: 2 },
      // South America → Africa
      { startTheta: -0.8, startPhi: 0.3, endTheta: 1.8, endPhi: 0.9, progress: 0.1, speed: 0.0025, color: '#22D3EE', size: 2.5 },
      // Africa → US (completing the circle)
      { startTheta: 1.5, startPhi: 1.1, endTheta: -1.0, endPhi: 0.5, progress: 0.8, speed: 0.003, color: '#06B6D4', size: 3 },
      // Extra flows for density
      { startTheta: 0.5, startPhi: 0.2, endTheta: -0.3, endPhi: 1.3, progress: 0.4, speed: 0.0035, color: '#0E7490', size: 2 },
      { startTheta: -0.5, startPhi: 1.0, endTheta: 1.2, endPhi: 0.1, progress: 0.7, speed: 0.002, color: '#155E75', size: 1.5 },
      { startTheta: 2.0, startPhi: 0.4, endTheta: -0.8, endPhi: 1.1, progress: 0.2, speed: 0.003, color: '#22D3EE', size: 2 },
    ];

    // === ORBITING CONNECTOR DOTS ===
    interface OrbitDot {
      theta: number;
      phi: number;
      orbitRadius: number;
      orbitSpeed: number;
      size: number;
      color: string;
      label: string;
    }

    const orbitDots: OrbitDot[] = [
      { theta: 0, phi: 0.5, orbitRadius: 1.15, orbitSpeed: 0.004, size: 5, color: '#336791', label: 'PG' },
      { theta: Math.PI * 0.4, phi: 0.8, orbitRadius: 1.2, orbitSpeed: -0.003, size: 4, color: '#00A1E0', label: 'SF' },
      { theta: Math.PI * 0.8, phi: 1.0, orbitRadius: 1.1, orbitSpeed: 0.005, size: 4.5, color: '#29B5E8', label: 'SN' },
      { theta: Math.PI * 1.2, phi: 0.4, orbitRadius: 1.25, orbitSpeed: -0.004, size: 4, color: '#635BFF', label: 'ST' },
      { theta: Math.PI * 1.6, phi: 0.6, orbitRadius: 1.15, orbitSpeed: 0.003, size: 5, color: '#47A248', label: 'MY' },
      { theta: Math.PI * 2.0, phi: 0.9, orbitRadius: 1.2, orbitSpeed: -0.005, size: 4, color: '#DC382D', label: 'RD' },
    ];

    let time = 0;

    // Project 3D point to 2D
    const project = (theta: number, phi: number, rotY: number, rotX: number) => {
      const x = Math.sin(phi) * Math.cos(theta + rotY);
      const y = Math.cos(phi) * Math.cos(rotX);
      const z = Math.sin(phi) * Math.sin(theta + rotY) * Math.cos(rotX) + Math.cos(phi) * Math.sin(rotX);
      return { x: cx() + R() * x, y: cy() - R() * y, z };
    };

    const draw = () => {
      time += 0.012;
      const w = W();
      const h = H();

      // Clear with subtle fade (motion blur)
      ctx.fillStyle = 'rgba(8, 8, 12, 0.12)';
      ctx.fillRect(0, 0, w, h);

      const mx = mouseRef.current.x * 15;
      const my = mouseRef.current.y * 15;
      const rotY = time * 0.3;
      const rotX = Math.sin(time * 0.15) * 0.2 + my * 0.01;

      // === 1. DRAW OUTER GLOW (volumetric) ===
      const outerGlow = ctx.createRadialGradient(
        cx() + mx, cy() + my, R() * 0.6,
        cx() + mx, cy() + my, R() * 1.4
      );
      outerGlow.addColorStop(0, 'rgba(6, 182, 212, 0.06)');
      outerGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)');
      outerGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx() + mx, cy() + my, R() * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // === 2. DRAW SPHERE PARTICLES ===
      // Sort by depth for proper layering
      const projected: { x: number; y: number; z: number; size: number; brightness: number; pulse: number }[] = [];

      for (const p of sphereParticles) {
        const pos = project(p.theta, p.phi, rotY, rotX);
        const pulse = 0.7 + 0.3 * Math.sin(time * p.pulseSpeed + p.pulsePhase);
        projected.push({
          x: pos.x + mx * 0.5,
          y: pos.y + my * 0.5,
          z: pos.z,
          size: p.size * (0.5 + pos.z / R() * 0.5),
          brightness: p.brightness * pulse * (0.4 + pos.z / R() * 0.6),
          pulse,
        });
      }

      // Sort back-to-front
      projected.sort((a, b) => a.z - b.z);

      // Draw particles
      for (const p of projected) {
        if (p.z > -R() * 0.3) {
          const alpha = p.brightness * 0.9;
          // Core particle
          ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Glow around brighter particles
          if (p.brightness > 0.6) {
            ctx.fillStyle = `rgba(6, 182, 212, ${alpha * 0.15})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // === 3. DRAW CONCENTRIC RINGS (inside sphere) ===
      for (const ring of rings) {
        const r = R() * ring.radius;
        const tilt = ring.tilt + Math.sin(time * 0.4) * 0.08;
        const rot = time * ring.speed;

        ctx.save();
        ctx.translate(cx() + mx * 0.3, cy() + my * 0.3);
        ctx.rotate(rot);

        // Ring glow
        ctx.strokeStyle = `rgba(6, 182, 212, ${ring.opacity * 0.4})`;
        ctx.lineWidth = ring.width * 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * Math.abs(Math.cos(tilt)), tilt, 0, Math.PI * 2);
        ctx.stroke();

        // Ring line
        ctx.strokeStyle = `rgba(6, 182, 212, ${ring.opacity})`;
        ctx.lineWidth = ring.width;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * Math.abs(Math.cos(tilt)), tilt, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // === 4. DRAW DATA FLOW ARCS ===
      for (const flow of dataFlows) {
        flow.progress = (flow.progress + flow.speed) % 1;

        // Interpolate position on sphere
        const theta = flow.startTheta + (flow.endTheta - flow.startTheta) * flow.progress;
        const phi = flow.startPhi + (flow.endPhi - flow.startPhi) * flow.progress;
        const pos = project(theta, phi, rotY, rotX);

        if (pos.z > 0) {
          // Data packet
          const alpha = 0.8 * (pos.z / R());
          ctx.fillStyle = flow.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx.beginPath();
          ctx.arc(pos.x + mx * 0.5, pos.y + my * 0.5, flow.size, 0, Math.PI * 2);
          ctx.fill();

          // Trail
          ctx.fillStyle = flow.color + '20';
          ctx.beginPath();
          ctx.arc(pos.x + mx * 0.5, pos.y + my * 0.5, flow.size * 6, 0, Math.PI * 2);
          ctx.fill();

          // Arc trail (showing path)
          const trailLength = 0.15;
          for (let t = 0; t < trailLength; t += 0.02) {
            const trailProg = (flow.progress - t + 1) % 1;
            const trailTheta = flow.startTheta + (flow.endTheta - flow.startTheta) * trailProg;
            const trailPhi = flow.startPhi + (flow.endPhi - flow.startPhi) * trailProg;
            const trailPos = project(trailTheta, trailPhi, rotY, rotX);
            if (trailPos.z > 0) {
              const trailAlpha = alpha * (1 - t / trailLength) * 0.5;
              ctx.fillStyle = flow.color + Math.round(trailAlpha * 255).toString(16).padStart(2, '0');
              ctx.beginPath();
              ctx.arc(trailPos.x + mx * 0.5, trailPos.y + my * 0.5, flow.size * 0.6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // === 5. DRAW ORBITING CONNECTOR DOTS ===
      for (const dot of orbitDots) {
        dot.theta += dot.orbitSpeed;
        const r = R() * dot.orbitRadius;
        const pos = project(dot.theta, dot.phi, rotY, rotX);

        if (pos.z > -R() * 0.2) {
          // Connection line to sphere center
          ctx.strokeStyle = dot.color + '15';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(cx() + mx * 0.5, cy() + my * 0.5);
          ctx.lineTo(pos.x + mx * 0.5, pos.y + my * 0.5);
          ctx.stroke();

          // Dot glow
          const glowSize = dot.size * 8 + Math.sin(time * 2) * 2;
          const glow = ctx.createRadialGradient(
            pos.x + mx * 0.5, pos.y + my * 0.5, 0,
            pos.x + mx * 0.5, pos.y + my * 0.5, glowSize
          );
          glow.addColorStop(0, dot.color + '40');
          glow.addColorStop(1, dot.color + '00');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(pos.x + mx * 0.5, pos.y + my * 0.5, glowSize, 0, Math.PI * 2);
          ctx.fill();

          // Dot
          ctx.fillStyle = dot.color;
          ctx.beginPath();
          ctx.arc(pos.x + mx * 0.5, pos.y + my * 0.5, dot.size, 0, Math.PI * 2);
          ctx.fill();

          // Label
          ctx.fillStyle = dot.color + 'cc';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(dot.label, pos.x + mx * 0.5, pos.y + my * 0.5 - dot.size - 5);
        }
      }

      // === 6. CENTER GLOW (breathing) ===
      const breathe = 25 + Math.sin(time * 1.5) * 8;
      const centerGlow = ctx.createRadialGradient(
        cx() + mx * 0.5, cy() + my * 0.5, 0,
        cx() + mx * 0.5, cy() + my * 0.5, breathe
      );
      centerGlow.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
      centerGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.15)');
      centerGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(cx() + mx * 0.5, cy() + my * 0.5, breathe, 0, Math.PI * 2);
      ctx.fill();

      // Center dot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(cx() + mx * 0.5, cy() + my * 0.5, 2.5, 0, Math.PI * 2);
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
      className="w-full h-full"
      style={{ cursor: 'crosshair' }}
    />
  );
}
