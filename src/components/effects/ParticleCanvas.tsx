import React, { useEffect, useRef } from 'react';

interface ParticleColor {
  r: number;
  g: number;
  b: number;
}

const FESTIVE_COLORS: ParticleColor[] = [
  { r: 255, g: 45, b: 120 }, // Hot Pink
  { r: 240, g: 180, b: 41 }, // Gold
  { r: 255, g: 107, b: 0 },  // Saffron
  { r: 233, g: 30, b: 156 }, // Magenta
  { r: 255, g: 213, b: 79 }, // Gold Light
  { r: 156, g: 39, b: 176 }, // Purple
  { r: 0, g: 191, b: 165 },  // Teal
];

class Particle {
  x = 0;
  y = 0;
  size = 0;
  speedX = 0;
  speedY = 0;
  opacity = 0;
  fadeSpeed = 0;
  growing = false;
  colorStr = '';
  canvasWidth: number;
  canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvasWidth;
    this.y = Math.random() * this.canvasHeight;
    this.size = Math.random() * 2.2 + 0.6;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = -Math.random() * 0.45 - 0.1;
    this.opacity = Math.random() * 0.45 + 0.1;
    this.fadeSpeed = Math.random() * 0.005 + 0.002;
    this.growing = Math.random() > 0.5;
    const c = FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)];
    this.colorStr = `rgb(${c.r},${c.g},${c.b})`;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.x += Math.sin(Date.now() * 0.001 + this.y * 0.01) * 0.15;

    if (this.growing) {
      this.opacity += this.fadeSpeed;
      if (this.opacity >= 0.55) this.growing = false;
    } else {
      this.opacity -= this.fadeSpeed;
      if (this.opacity <= 0) this.reset();
    }

    if (this.y < -10 || this.x < -10 || this.x > this.canvasWidth + 10) {
      this.reset();
      this.y = this.canvasHeight + 10;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.colorStr;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animFrameId: number;
    let particles: Particle[] = [];
    let resizeTimer: NodeJS.Timeout | null = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const isMobile = canvas.width < 768;
      const count = isMobile
        ? Math.min(Math.floor((canvas.width * canvas.height) / 28000), 24)
        : Math.min(Math.floor((canvas.width * canvas.height) / 18000), 48);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const initTimer = setTimeout(() => {
      resize();
      animate();
    }, 60);

    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
      }
      animFrameId = requestAnimationFrame(animate);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameId);
      } else {
        animate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return <canvas id="particle-canvas" ref={canvasRef} aria-hidden="true" />;
};
