'use client';

import { useEffect, useRef } from 'react';

// Pulsyn Hero Globe — Apple-style minimal with concentric rings and data flow
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
    const R = () => Math.min(W(), H()) * 0.35;

    // Mouse tracking for parallax
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left - W() / 2) / W(),
        y: (e.clientY - rect.top - H() / 2) / H(),
      };
    });

    // Concentric rings configuration
    const rings = [
      { radius: 0.3, speed: 0.008, tilt: 0.3, opacity: 0.15 },
      { radius: 0.5, speed: -0.006, tilt: -0.2, opacity: 0.12 },
      { radius: 0.7, speed: 0.004, tilt: 0.5, opacity: 0.10 },
      { radius: 0.85, speed: -0.003, tilt: -0.4, opacity: 0.08 },
      { radius: 1.0, speed: 0.002, tilt: 0.1, opacity: 0.06 },
    ];

    // Data flow particles
    interface Particle {
      ring: number;
      angle: number;
      speed: number;
      size: number;
      opacity: number;
      hue: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        ring: Math.floor(Math.random() * rings.length),
        angle: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.008,
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7,
        hue: 180 + Math.random() * 40, // Cyan to blue
      });
    }

    // Connection lines between particles
    const connections: { from: number; to: number; opacity: number }[] = [];
    for (let i = 0; i < 15; i++) {
      connections.push({
        from: Math.floor(Math.random() * particles.length),
        to: Math.floor(Math.random() * particles.length),
        opacity: 0.05 + Math.random() * 0.1,
      });
    }

    // Orbiting data points (representing connectors)
    const orbitPoints: { angle: number; radius: number; speed: number; size: number; label: string; color: string }[] = [
      { angle: 0, radius: 1.15, speed: 0.003, size: 4, label: 'PG', color: '#336791' },
      { angle: Math.PI * 0.4, radius: 1.2, speed: -0.002, size: 3, label: 'SF', color: '#00A1E0' },
      { angle: Math.PI * 0.8, radius: 1.1, speed: 0.004, size: 3.5, label: 'SN', color: '#29B5E8' },
      { angle: Math.PI * 1.2, radius: 1.25, speed: -0.003, size: 3, label: 'ST', color: '#635BFF' },
      { angle: Math.PI * 1.6, radius: 1.15, speed: 0.002, size: 4, label: 'MY', color: '#47A248' },
      { angle: Math.PI * 2.0, radius: 1.2, speed: -0.004, size: 3, label: 'RD', color: '#DC382D' },
    ];

    // Glow pulse
    let glowPhase = 0;
    let time = 0;

    const draw = () => {
      time += 0.016;
      glowPhase += 0.02;
      const w = W();
      const h = H();

      // Clear with fade (creates motion blur)
      ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
      ctx.fillRect(0, 0, w, h);

      // Mouse parallax offset
      const mx = mouseRef.current.x * 20;
      const my = mouseRef.current.y * 20;

      // Draw outer sphere outline (subtle)
      const gradient = ctx.createRadialGradient(
        cx() + mx * 0.5, cy() + my * 0.5, R() * 0.8,
        cx() + mx * 0.5, cy() + my * 0.5, R() * 1.1
      );
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.02)');
      gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.05)');
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx() + mx * 0.5, cy() + my * 0.5, R() * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Draw concentric rings
      for (const ring of rings) {
        const r = R() * ring.radius;
        const tilt = ring.tilt + Math.sin(time * 0.5) * 0.1;
        const rot = time * ring.speed;

        ctx.save();
        ctx.translate(cx() + mx * 0.3, cy() + my * 0.3);
        ctx.rotate(rot);

        // Ring ellipse
        ctx.strokeStyle = `rgba(6, 182, 212, ${ring.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * Math.abs(Math.cos(tilt)), tilt, 0, Math.PI * 2);
        ctx.stroke();

        // Ring glow
        ctx.strokeStyle = `rgba(6, 182, 212, ${ring.opacity * 0.3})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * Math.abs(Math.cos(tilt)), tilt, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // Draw particles on rings
      for (const p of particles) {
        p.angle += p.speed;
        const ring = rings[p.ring];
        const r = R() * ring.radius;
        const tilt = ring.tilt + Math.sin(time * 0.5) * 0.1;
        const rot = time * ring.speed;

        // Position on ring
        const x = cx() + mx * 0.3 + r * Math.cos(p.angle + rot) * Math.cos(tilt);
        const y = cy() + my * 0.3 + r * Math.sin(p.angle + rot);

        // Only draw if "facing" us (simple depth simulation)
        const depth = Math.sin(p.angle + rot) * Math.sin(tilt);
        if (depth > -0.3) {
          const alpha = p.opacity * (0.5 + depth * 0.5);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Glow
          ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha * 0.2})`;
          ctx.beginPath();
          ctx.arc(x, y, p.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw connection lines
      for (const conn of connections) {
        const p1 = particles[conn.from];
        const p2 = particles[conn.to];
        const r1 = R() * rings[p1.ring].radius;
        const r2 = R() * rings[p2.ring].radius;
        const t1 = rings[p1.ring].tilt + Math.sin(time * 0.5) * 0.1;
        const t2 = rings[p2.ring].tilt + Math.sin(time * 0.5) * 0.1;
        const rot1 = time * rings[p1.ring].speed;
        const rot2 = time * rings[p2.ring].speed;

        const x1 = cx() + mx * 0.3 + r1 * Math.cos(p1.angle + rot1) * Math.cos(t1);
        const y1 = cy() + my * 0.3 + r1 * Math.sin(p1.angle + rot1);
        const x2 = cx() + mx * 0.3 + r2 * Math.cos(p2.angle + rot2) * Math.cos(t2);
        const y2 = cy() + my * 0.3 + r2 * Math.sin(p2.angle + rot2);

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(6, 182, 212, ${conn.opacity})`);
        grad.addColorStop(0.5, `rgba(99, 102, 241, ${conn.opacity * 1.5})`);
        grad.addColorStop(1, `rgba(6, 182, 212, ${conn.opacity})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw orbiting connector points
      for (const point of orbitPoints) {
        point.angle += point.speed;
        const r = R() * point.radius;
        const x = cx() + mx * 0.5 + r * Math.cos(point.angle);
        const y = cy() + my * 0.5 + r * Math.sin(point.angle);

        // Connection line to globe center
        ctx.strokeStyle = `${point.color}20`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx() + mx * 0.5, cy() + my * 0.5);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Point glow
        const glowSize = point.size * 6 + Math.sin(time * 3 + point.angle) * 2;
        const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        glowGrad.addColorStop(0, `${point.color}40`);
        glowGrad.addColorStop(1, `${point.color}00`);
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Point dot
        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(x, y, point.size, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = `${point.color}cc`;
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(point.label, x, y - point.size - 4);
      }

      // Center glow pulse
      const centerGlow = 20 + Math.sin(glowPhase) * 5;
      const centerGrad = ctx.createRadialGradient(
        cx() + mx * 0.5, cy() + my * 0.5, 0,
        cx() + mx * 0.5, cy() + my * 0.5, centerGlow
      );
      centerGrad.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
      centerGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.1)');
      centerGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(cx() + mx * 0.5, cy() + my * 0.5, centerGlow, 0, Math.PI * 2);
      ctx.fill();

      // Center dot
      ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.beginPath();
      ctx.arc(cx() + mx * 0.5, cy() + my * 0.5, 3, 0, Math.PI * 2);
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
