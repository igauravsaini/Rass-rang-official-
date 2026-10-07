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
  color = FESTIVE_COLORS[0];
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
    this.size = Math.random() * 2.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = -Math.random() * 0.5 - 0.1;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.fadeSpeed = Math.random() * 0.005 + 0.002;
    this.growing = Math.random() > 0.5;
    this.color = FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)];
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.x += Math.sin(Date.now() * 0.001 + this.y * 0.01) * 0.15;

    if (this.growing) {
      this.opacity += this.fadeSpeed;
      if (this.opacity >= 0.6) this.growing = false;
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
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
    // Only apply GPU-heavy shadowBlur on larger desktop viewports
    if (this.canvasWidth >= 768) {
      ctx.shadowBlur = this.size * 3;
      ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.4)`;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let particles: Particle[] = [];
    let resizeTimer: NodeJS.Timeout | null = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const isMobile = canvas.width < 768;
      const count = isMobile
        ? Math.min(Math.floor((canvas.width * canvas.height) / 25000), 35)
        : Math.min(Math.floor((canvas.width * canvas.height) / 15000), 75);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    resize();
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

    animate();

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameId);
      } else {
        animate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return <canvas id="particle-canvas" ref={canvasRef} aria-hidden="true" />;
};
