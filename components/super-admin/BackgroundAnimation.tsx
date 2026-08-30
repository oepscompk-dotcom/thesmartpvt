"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface NetworkLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
}

export default function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let networkLines: NetworkLine[] = [];
    let glowCircles = [
      { x: 0, y: 0, radius: 300, color: "rgba(45, 40, 205, 0.08)" },
      { x: 0, y: 0, radius: 200, color: "rgba(14, 165, 233, 0.06)" },
      { x: 0, y: 0, radius: 250, color: "rgba(30, 58, 138, 0.07)" },
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
      initNetworkLines();
    };

    const initParticles = () => {
      particles = [];
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          color:
            Math.random() > 0.5
              ? "rgba(200, 169, 81,"
              : "rgba(77, 168, 218,",
        });
      }
    };

    const initNetworkLines = () => {
      networkLines = [];
      const count = Math.min(20, Math.floor(particles.length / 4));
      for (let i = 0; i < count; i++) {
        const a = particles[Math.floor(Math.random() * particles.length)];
        const b = particles[Math.floor(Math.random() * particles.length)];
        if (a !== b) {
          networkLines.push({
            x1: a.x,
            y1: a.y,
            x2: b.x,
            y2: b.y,
            opacity: Math.random() * 0.15 + 0.05,
          });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Glow circles
      glowCircles[0].x = canvas.width * 0.2;
      glowCircles[0].y = canvas.height * 0.3;
      glowCircles[1].x = canvas.width * 0.8;
      glowCircles[1].y = canvas.height * 0.7;
      glowCircles[2].x = canvas.width * 0.5;
      glowCircles[2].y = canvas.height * 0.5;

      glowCircles.forEach((circle) => {
        const gradient = ctx.createRadialGradient(
          circle.x,
          circle.y,
          0,
          circle.x,
          circle.y,
          circle.radius
        );
        gradient.addColorStop(0, circle.color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Network lines
      networkLines.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.strokeStyle = `rgba(200, 169, 81, ${line.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.opacity})`;
        ctx.fill();
      });

      // Update network lines periodically
      if (Math.random() > 0.98) {
        initNetworkLines();
      }

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#0F172A]" />

      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise" />

      {/* Canvas for particles */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Animated grid lines */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,251,99,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,251,99,0.35) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Floating glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2D28CD]/10 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00C8FF]/8 rounded-full blur-[128px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1E3A8A]/5 rounded-full blur-[150px]" />
    </div>
  );
}
