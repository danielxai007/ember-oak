import React, { useEffect, useRef } from 'react';

type Particle = { x: number; y: number; size: number; opacity: number; duration: number; delay: number };

function buildParticles(count: number, w: number, h: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: 1.5 + Math.random(),
    opacity: 0.15 + Math.random() * 0.1,
    duration: 35 + Math.random() * 20,
    delay: Math.random() * -30,
  }));
}

type FooterEmbersProps = {
  reducedMotion: boolean;
};

export default function FooterEmbers({ reducedMotion }: FooterEmbersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (reducedMotion) return;
    const el = containerRef.current;
    if (!el) return;

    const resize = () => {
      particlesRef.current = buildParticles(8, el.clientWidth, el.clientHeight);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      const t = (now - start) / 1000;
      const children = el.children;
      particlesRef.current.forEach((p, i) => {
        const node = children[i] as HTMLElement | undefined;
        if (!node) return;
        const cycle = ((t + p.delay) % p.duration) / p.duration;
        const y = cycle * (el.clientHeight + 40);
        node.style.transform = `translate3d(${p.x}px, ${y}px, 0)`;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div ref={containerRef} className="eo-footer-embers" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="eo-footer-ember" />
      ))}
    </div>
  );
}
