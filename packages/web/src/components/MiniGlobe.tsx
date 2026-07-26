'use client';

import { useEffect, useRef } from 'react';

// Mini Globe Logo — animated particle sphere for header
export default function MiniGlobe({ size = 32 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.4;

    // 100 particles
    const particles: { theta: number; phi: number; size: number; brightness: number }[] = [];
    for (let i = 0; i < 100; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / 100);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      particles.push({
        theta,
        phi,
        size: 0.3 + Math.random() * 0.8,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }

    // 3 data flows
    const flows = [
      { fromTheta: 0, fromPhi: 0.5, toTheta: 2.5, toPhi: 0.8, progress: 0, speed: 0.01 },
      { fromTheta: 1.5, fromPhi: 0.3, toTheta: -0.5, toPhi: 1.0, progress: 0.3, speed: 0.008 },
      { fromTheta: -1.0, fromPhi: 0.8, toTheta: 1.0, toPhi: 0.2, progress: 0.6, speed: 0.012 },
    ];

    let time = 0;

    const draw = () => {
      time += 0.02;
      ctx.clearRect(0, 0, size, size);

      const rotY = time * 0.5;
      const rotX = Math.sin(time * 0.3) * 0.2;

      // Outer glow
      const glow = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 1.2);
      glow.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      glow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Particles
      for (const p of particles) {
        const x = Math.sin(p.phi) * Math.cos(p.theta + rotY);
        const y = Math.cos(p.phi) * Math.cos(rotX);
        const z = Math.sin(p.phi) * Math.sin(p.theta + rotY) * Math.cos(rotX) + Math.cos(p.phi) * Math.sin(rotX);

        if (z > -0.2) {
          const px = cx + R * x;
          const py = cy - R * y;
          const alpha = p.brightness * (0.4 + z * 0.6);
          ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * (0.5 + z * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Data flows
      for (const flow of flows) {
        flow.progress = (flow.progress + flow.speed) % 1;
        const theta = flow.fromTheta + (flow.toTheta - flow.fromTheta) * flow.progress;
        const phi = flow.fromPhi + (flow.toPhi - flow.fromPhi) * flow.progress;
        const x = Math.sin(phi) * Math.cos(theta + rotY);
        const y = Math.cos(phi) * Math.cos(rotX);
        const z = Math.sin(phi) * Math.sin(theta + rotY) * Math.cos(rotX) + Math.cos(phi) * Math.sin(rotX);

        if (z > 0) {
          const px = cx + R * x;
          const py = cy - R * y;
          ctx.fillStyle = `rgba(34, 211, 238, ${0.8 * z})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 4);
      cg.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
      cg.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
}
