import React, { useEffect, useRef, type RefObject } from 'react';

class SmokeParticle {
  canvas: HTMLCanvasElement;
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  size = 0;
  opacity = 0;
  maxOpacity = 0;
  life = 0;
  maxLife = 0;
  rotation = 0;
  rotationSpeed = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.x = w * 0.5 + (Math.random() - 0.5) * w * 0.3;
    this.y = h * 0.72;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.6 + 0.3);
    this.size = Math.random() * 28 + 12;
    this.opacity = 0;
    this.maxOpacity = Math.random() * 0.06 + 0.02;
    this.life = 0;
    this.maxLife = Math.random() * 180 + 120;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.008;
  }

  update() {
    this.life += 1;
    this.x += this.vx + Math.sin(this.life * 0.02) * 0.3;
    this.y += this.vy;
    this.vx *= 0.995;
    this.vy *= 0.998;
    this.size += 0.15;
    this.rotation += this.rotationSpeed;

    const progress = this.life / this.maxLife;
    if (progress < 0.2) {
      this.opacity = (progress / 0.2) * this.maxOpacity;
    } else if (progress > 0.7) {
      this.opacity = ((1 - progress) / 0.3) * this.maxOpacity;
    } else {
      this.opacity = this.maxOpacity;
    }

    if (this.life >= this.maxLife) this.reset();
  }

  draw(ctx: CanvasRenderingContext2D, intensity: number) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    const o = this.opacity * intensity;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
    gradient.addColorStop(0, `rgba(220,200,170,${o})`);
    gradient.addColorStop(0.5, `rgba(180,160,130,${o * 0.5})`);
    gradient.addColorStop(1, 'rgba(150,130,100,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

type SmokeCanvasProps = {
  active: boolean;
  intensity?: number;
  intensityRef?: RefObject<number>;
  particleCount?: number;
  className?: string;
};

export default function SmokeCanvas({
  active,
  intensity = 1,
  intensityRef: externalIntensityRef,
  particleCount = 18,
  className = '',
}: SmokeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intensityRef = useRef(intensity);
  const activeRef = useRef(active);
  const visibleRef = useRef(true);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    io.observe(canvas.parentElement!);

    const particles = Array.from({ length: particleCount }, () => new SmokeParticle(canvas));
    particles.forEach((p, i) => {
      p.life = Math.floor((i / particleCount) * p.maxLife);
    });

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!activeRef.current || document.hidden || !visibleRef.current) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx, externalIntensityRef?.current ?? intensityRef.current);
      });
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`dish-smoke-canvas ${className}`}
      aria-hidden
    />
  );
}
