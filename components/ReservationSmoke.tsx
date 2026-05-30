import React, { useEffect, useRef } from 'react';

class Wisp {
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

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.x = Math.random() * w;
    this.y = h + 10;
    this.vx = (Math.random() - 0.5) * 0.2;
    this.vy = -(Math.random() * 0.3 + 0.15);
    this.size = Math.random() * 20 + 16;
    this.maxOpacity = Math.random() * 0.008 + 0.004;
    this.life = 0;
    this.maxLife = Math.random() * 200 + 160;
    this.opacity = 0;
  }

  update() {
    this.life += 1;
    this.x += this.vx;
    this.y += this.vy;
    this.size += 0.08;
    const p = this.life / this.maxLife;
    if (p < 0.2) this.opacity = (p / 0.2) * this.maxOpacity;
    else if (p > 0.75) this.opacity = ((1 - p) / 0.25) * this.maxOpacity;
    else this.opacity = this.maxOpacity;
    if (this.life >= this.maxLife) this.reset();
  }

  draw(ctx: CanvasRenderingContext2D) {
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    g.addColorStop(0, `rgba(201,168,76,${this.opacity})`);
    g.addColorStop(1, 'rgba(201,168,76,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

type ReservationSmokeProps = {
  reducedMotion: boolean;
};

export default function ReservationSmoke({ reducedMotion }: ReservationSmokeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const wisps = Array.from({ length: 4 }, () => new Wisp(canvas));
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e?.isIntersecting ?? true;
    }, { threshold: 0 });
    io.observe(parent);

    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      ctx.clearRect(0, 0, parent.clientWidth, parent.clientHeight);
      wisps.forEach((w) => {
        w.update();
        w.draw(ctx);
      });
    };
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return <canvas ref={canvasRef} className="eo-reservation-smoke" aria-hidden />;
}
