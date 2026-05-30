import React, { useEffect, useRef, type RefObject } from 'react';

const EMBER_COLORS = ['255,180,50', '255,140,30', '255,100,20', '201,168,76'];

class Ember {
  canvas: HTMLCanvasElement;
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  size = 0;
  opacity = 0;
  maxOpacity = 0;
  currentOpacity = 0;
  life = 0;
  maxLife = 0;
  flicker = 0;
  color = EMBER_COLORS[0];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.x = w * 0.5 + (Math.random() - 0.5) * w * 0.4;
    this.y = h * 0.75 + Math.random() * h * 0.1;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = -(Math.random() * 1.2 + 0.4);
    this.size = Math.random() * 2.2 + 0.8;
    this.opacity = 0;
    this.maxOpacity = Math.random() * 0.7 + 0.3;
    this.life = 0;
    this.maxLife = Math.random() * 100 + 60;
    this.flicker = Math.random() * Math.PI * 2;
    this.color = EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)];
  }

  update(speed = 1) {
    this.life += 1;
    this.flicker += 0.15;
    this.x += (this.vx + Math.sin(this.life * 0.05) * 0.5) * speed;
    this.y += this.vy * speed;
    this.vy -= 0.008 * speed;
    this.vx *= 0.992;

    const progress = this.life / this.maxLife;
    if (progress < 0.15) {
      this.opacity = (progress / 0.15) * this.maxOpacity;
    } else {
      this.opacity = this.maxOpacity * (1 - progress);
    }
    this.currentOpacity = this.opacity * (0.7 + Math.sin(this.flicker) * 0.3);

    if (this.life >= this.maxLife) this.reset();
  }

  draw(ctx: CanvasRenderingContext2D) {
    const glow = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.size * 4
    );
    glow.addColorStop(0, `rgba(${this.color},${this.currentOpacity})`);
    glow.addColorStop(0.4, `rgba(${this.color},${this.currentOpacity * 0.3})`);
    glow.addColorStop(1, `rgba(${this.color},0)`);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,240,200,${this.currentOpacity})`;
    ctx.fill();
  }
}

type EmberCanvasProps = {
  active: boolean;
  particleCount?: number;
  intensity?: number;
  intensityRef?: RefObject<number>;
  speedMultiplier?: number;
  speedRef?: RefObject<number>;
  className?: string;
};

export default function EmberCanvas({
  active,
  particleCount = 22,
  intensity = 1,
  intensityRef: externalIntensityRef,
  speedMultiplier = 1,
  speedRef: externalSpeedRef,
  className = '',
}: EmberCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const intensityRef = useRef(intensity);
  const speedRef = useRef(speedMultiplier);
  const visibleRef = useRef(true);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

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

    const embers = Array.from({ length: particleCount }, () => new Ember(canvas));
    embers.forEach((e, i) => {
      e.life = Math.floor((i / particleCount) * e.maxLife);
    });

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!activeRef.current || document.hidden || !visibleRef.current) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      const mult = externalIntensityRef?.current ?? intensityRef.current;
      const spd = externalSpeedRef?.current ?? speedRef.current;
      embers.forEach((e) => {
        e.update(spd);
        ctx.save();
        ctx.globalAlpha = mult;
        e.draw(ctx);
        ctx.restore();
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
      className={`dish-ember-canvas ${className}`}
      aria-hidden
    />
  );
}
