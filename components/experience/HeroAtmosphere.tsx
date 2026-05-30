import React, { useEffect, useMemo, useRef } from 'react';

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  sway: number;
};

type HeroAtmosphereProps = {
  isMobile: boolean;
  reducedMotion: boolean;
  active: boolean;
};

function buildParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1.5 + Math.random() * 1.5,
    opacity: 0.25 + Math.random() * 0.2,
    duration: 18 + Math.random() * 22,
    delay: Math.random() * -20,
    sway: 8 + Math.random() * 14,
  }));
}

export default function HeroAtmosphere({ isMobile, reducedMotion, active }: HeroAtmosphereProps) {
  const count = isMobile ? 15 : 35;
  const particles = useMemo(() => buildParticles(count), [count]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !active) return;
    const el = containerRef.current;
    if (!el) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const children = el.children;
      for (let i = 0; i < children.length; i++) {
        const node = children[i] as HTMLElement;
        const p = particles[i];
        if (!p) continue;
        const cycle = ((t + p.delay) % p.duration) / p.duration;
        const y = 100 - cycle * 120;
        const x = p.x + Math.sin(t * 0.4 + p.id) * (p.sway / window.innerWidth) * 100;
        node.style.transform = `translate3d(${x}vw, ${y}vh, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [particles, reducedMotion, active]);

  if (!active || reducedMotion) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        className="eo-hero-breath"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 55% 55% at 65% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)',
          animation: 'eoHeroBreath 7s ease-in-out infinite',
        }}
      />
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: `rgba(201,168,76,${p.opacity})`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}
