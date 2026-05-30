import React, { useEffect, useRef } from 'react';

type CursorMode = 'default' | 'dish' | 'cta' | 'nav' | 'click';

type CustomCursorProps = {
  disabled: boolean;
  reducedMotion: boolean;
};

export default function CustomCursor({ disabled, reducedMotion }: CustomCursorProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const modeRef = useRef<CursorMode>('default');

  useEffect(() => {
    if (disabled || reducedMotion) return;

    document.body.style.cursor = 'none';

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let ringX = mx;
    let ringY = my;
    let glowX = mx;
    let glowY = my;
    let dotScale = 1;
    let ringScale = 1;
    let raf = 0;
    const magneticOffsets = new Map<HTMLElement, { x: number; y: number }>();

    const setMode = (m: CursorMode) => {
      modeRef.current = m;
      const label = labelRef.current;
      const ring = ringRef.current;
      const dot = dotRef.current;
      const glow = glowRef.current;
      if (!label || !ring || !dot || !glow) return;

      if (m === 'dish') {
        label.textContent = 'TASTE';
        label.style.opacity = '1';
        ring.style.width = '64px';
        ring.style.height = '64px';
        ring.style.border = '1px solid rgba(201,168,76,0.3)';
        ring.style.background = 'transparent';
        dot.style.opacity = '0';
        glow.style.width = '140px';
        glow.style.height = '140px';
        glow.style.opacity = '0.8';
      } else if (m === 'cta') {
        label.textContent = 'BOOK';
        label.style.opacity = '1';
        ring.style.width = '52px';
        ring.style.height = '52px';
        ring.style.border = '1.5px solid rgba(201,168,76,0.8)';
        ring.style.background = 'rgba(201,168,76,0.1)';
        dot.style.opacity = '0';
        glow.style.width = '80px';
        glow.style.height = '80px';
        glow.style.opacity = '0.5';
      } else if (m === 'nav') {
        label.style.opacity = '0';
        ring.style.width = '16px';
        ring.style.height = '16px';
        ring.style.border = '1px solid rgba(201,168,76,0.45)';
        ring.style.background = 'transparent';
        dot.style.opacity = '1';
        dot.style.width = '3px';
        dot.style.height = '3px';
        glow.style.opacity = '0';
      } else {
        label.style.opacity = '0';
        ring.style.width = '32px';
        ring.style.height = '32px';
        ring.style.border = '1px solid rgba(201,168,76,0.45)';
        ring.style.background = 'transparent';
        dot.style.opacity = '1';
        dot.style.width = '5px';
        dot.style.height = '5px';
        glow.style.width = '80px';
        glow.style.height = '80px';
        glow.style.opacity = '0.5';
      }
    };

    const resolveMode = (el: HTMLElement | null): CursorMode => {
      if (!el) return 'default';
      if (el.closest('.dish-stage, [data-cursor="view"], .dish-image-wrapper')) return 'dish';
      if (el.closest('button, [data-cursor="true"], [data-magnetic]')) return 'cta';
      if (el.closest('nav, nav span, nav a')) return 'nav';
      return 'default';
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      if (modeRef.current === 'click') return;
      setMode(resolveMode(e.target as HTMLElement));
    };

    const onDown = () => {
      modeRef.current = 'click';
      dotScale = 0;
      ringScale = 0.7;
      gsapBurst();
    };

    const gsapBurst = () => {
      dotScale = 3;
      window.setTimeout(() => {
        dotScale = 1;
        ringScale = 1.1;
        window.setTimeout(() => {
          ringScale = 1;
          modeRef.current = 'default';
        }, 200);
      }, 200);
    };

    const onUp = () => {
      modeRef.current = resolveMode(document.elementFromPoint(mx, my) as HTMLElement);
      setMode(modeRef.current);
    };

    const tick = () => {
      ringX += (mx - ringX) * 0.09;
      ringY += (my - ringY) * 0.09;
      glowX += (mx - glowX) * 0.05;
      glowY += (my - glowY) * 0.05;

      const dot = dotRef.current;
      const ring = ringRef.current;
      const glow = glowRef.current;

      if (dot) {
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%) scale(${dotScale})`;
      }
      if (ring) {
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%) scale(${ringScale})`;
      }
      if (glow) {
        glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
      }

      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(mx - cx, my - cy);
        const prev = magneticOffsets.get(btn) ?? { x: 0, y: 0 };
        let tx = prev.x;
        let ty = prev.y;

        if (dist < 100) {
          tx += ((mx - cx) * 0.3 - tx) * 0.18;
          ty += ((my - cy) * 0.3 - ty) * 0.18;
        } else {
          tx += (0 - tx) * 0.1;
          ty += (0 - ty) * 0.1;
        }

        magneticOffsets.set(btn, { x: tx, y: ty });
        if (Math.abs(tx) > 0.05 || Math.abs(ty) > 0.05) {
          btn.style.transform = `translate(${tx}px, ${ty}px)`;
        } else {
          btn.style.transform = '';
          magneticOffsets.delete(btn);
        }
      });

      raf = requestAnimationFrame(tick);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    setMode('default');
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
        btn.style.transform = '';
      });
    };
  }, [disabled, reducedMotion]);

  if (disabled || reducedMotion) return null;

  return (
    <>
      <div
        ref={glowRef}
        aria-hidden
        className="eo-cursor-glow"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9997,
          pointerEvents: 'none',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          willChange: 'transform',
        }}
      />
      <div
        ref={ringRef}
        aria-hidden
        className="eo-cursor-ring"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          willChange: 'transform',
        }}
      >
        <span
          ref={labelRef}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 8,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            opacity: 0,
            transition: 'opacity 0.25s ease',
          }}
        />
      </div>
      <div
        ref={dotRef}
        aria-hidden
        className="eo-cursor-dot"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 10000,
          pointerEvents: 'none',
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: '#C9A84C',
          willChange: 'transform',
        }}
      />
    </>
  );
}
