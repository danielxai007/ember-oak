import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

export const LOADER_STORAGE_KEY = 'ember-oak-visited';
const BRAND = 'EMBER & OAK';
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

type CinematicLoaderProps = {
  onComplete: () => void;
  onFadeStart?: () => void;
  reducedMotion: boolean;
};

export default function CinematicLoader({
  onComplete,
  onFadeStart,
  reducedMotion,
}: CinematicLoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const letters = useMemo(() => BRAND.split(''), []);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(false);
      onComplete();
      return;
    }

    let skipFull = false;
    try {
      skipFull = localStorage.getItem(LOADER_STORAGE_KEY) === '1';
    } catch {
      skipFull = false;
    }

    document.body.style.overflow = 'hidden';
    document.body.style.cursor = 'none';

    const ctx = gsap.context(() => {
      if (skipFull) {
        gsap.set('.eo-loader-brand-wrap, .eo-loader-ember, .eo-loader-bloom', { opacity: 0 });
        gsap.fromTo(
          overlayRef.current,
          { opacity: 1 },
          {
            opacity: 0,
            duration: 1,
            ease: 'power2.inOut',
            onStart: () => {
              onFadeStart?.();
              onComplete();
            },
            onComplete: () => {
              setVisible(false);
              document.body.style.overflow = '';
              document.body.style.cursor = '';
            },
          }
        );
        return;
      }

      gsap.set('.eo-loader-letter', {
        opacity: 0,
        filter: 'blur(20px) brightness(3)',
        color: '#C9A84C',
      });
      gsap.set('.eo-loader-line', { scaleX: 0 });
      gsap.set('.eo-loader-tagline', { opacity: 0 });
      gsap.set('.eo-loader-bloom', { scale: 0, opacity: 0 });
      gsap.set('.eo-loader-ember', { scale: 1, opacity: 1, y: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          try {
            localStorage.setItem(LOADER_STORAGE_KEY, '1');
          } catch {
            /* ignore */
          }
          setVisible(false);
          document.body.style.overflow = '';
          document.body.style.cursor = '';
        },
      });

      tl.to('.eo-loader-ember', {
        scale: 2.5,
        duration: 0.3,
        ease: 'power2.out',
      }, 0.4)
        .to('.eo-loader-ember', {
          scale: 1,
          duration: 0.3,
          ease: 'power2.in',
        }, 0.7)
        .to(
          '.eo-loader-bloom',
          {
            scale: 800,
            opacity: 0.06,
            duration: 1.4,
            ease: EASE,
          },
          0.8
        )
        .to(
          '.eo-loader-ember',
          {
            y: -120,
            opacity: 0,
            duration: 2,
            ease: 'power1.inOut',
          },
          1.2
        );

      letters.forEach((_, i) => {
        tl.to(
          `.eo-loader-letter-${i}`,
          {
            opacity: 1,
            filter: 'blur(0px) brightness(1)',
            color: '#F5F0E8',
            duration: 0.5,
            ease: EASE,
          },
          1.6 + i * 0.055
        );
      });

      tl.to('.eo-loader-line', { scaleX: 1, duration: 0.8, ease: EASE }, 2.8)
        .to('.eo-loader-tagline', { opacity: 0.45, duration: 0.8, ease: 'power2.out' }, 3.2)
        .to(
          '.eo-loader-brand-wrap',
          { scale: 0.92, opacity: 0, duration: 0.7, ease: 'power3.in' },
          4.2
        )
        .to('.eo-loader-line', { scaleX: 0, duration: 0.4, ease: 'power2.in' }, 4.2)
        .to('.eo-loader-tagline', { opacity: 0, duration: 0.3 }, 4.2)
        .to(
          overlayRef.current,
          {
            opacity: 0,
            duration: 1,
            ease: 'power2.inOut',
            onStart: () => {
              onFadeStart?.();
              onComplete();
            },
          },
          4.8
        );
    }, overlayRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
      document.body.style.cursor = '';
    };
  }, [letters, onComplete, onFadeStart, reducedMotion]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="eo-cinematic-loader"
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: '#0A0703',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
      }}
    >
      <div
        className="eo-loader-bloom"
        aria-hidden
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.06) 40%, transparent 70%)',
          transformOrigin: 'center center',
        }}
      />
      <div
        className="eo-loader-ember"
        aria-hidden
        style={{
          position: 'absolute',
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: 'rgba(201,168,76,1)',
          boxShadow: '0 0 12px rgba(201,168,76,0.8)',
        }}
      />
      <div
        className="eo-loader-brand-wrap"
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '0 5%',
        }}
      >
        <h1
          style={{
            margin: 0,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(32px, 10vw, 110px)',
            letterSpacing: '0.02em',
            lineHeight: 1,
          }}
        >
          {letters.map((char, i) => (
            <span
              key={`${char}-${i}`}
              className={`eo-loader-letter eo-loader-letter-${i}`}
              style={{
                display: 'inline-block',
                minWidth: char === ' ' ? '0.35em' : undefined,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
        <div
          className="eo-loader-line"
          style={{
            width: 180,
            height: 0.5,
            background: 'rgba(201,168,76,0.5)',
            margin: '20px auto 16px',
            transformOrigin: 'center center',
          }}
        />
        <p
          className="eo-loader-tagline"
          style={{
            margin: 0,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 9,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.45)',
          }}
        >
          EST. 2019 · WEST VILLAGE, NEW YORK
        </p>
      </div>
    </div>
  );
}
