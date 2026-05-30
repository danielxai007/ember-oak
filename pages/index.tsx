import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import Head from 'next/head';
import CinematicLoader from '../components/experience/CinematicLoader';
import CustomCursor from '../components/experience/CustomCursor';
import FilmGrain from '../components/experience/FilmGrain';
import SubmitButton from '../components/experience/SubmitButton';
import DishHero from '../components/DishHero';
import FooterEmbers from '../components/FooterEmbers';
import ReservationSmoke from '../components/ReservationSmoke';
import { useAmbientSound } from '../hooks/useAmbientSound';
import { useCinematicScroll } from '../hooks/useCinematicScroll';
import { useLenisScroll } from '../hooks/useLenisScroll';
import { useReducedMotion } from '../hooks/useReducedMotion';

const COLORS = {
  ink: '#0A0703',
  ink2: '#0F0B07',
  ink3: '#141009',
  inkDeep: '#060402',
  inkRoom: '#0D0A06',
  inkPress: '#070503',
  cream: '#F5F0E8',
  creamGhost: 'rgba(245,240,232,0.55)',
  creamMuted: 'rgba(245,240,232,0.38)',
  creamFaint: 'rgba(245,240,232,0.24)',
  gold: '#C9A84C',
  goldBright: '#E8C97A',
  goldDim: 'rgba(201,168,76,0.15)',
  goldBorder: 'rgba(201,168,76,0.25)',
  goldFaint: 'rgba(201,168,76,0.08)',
};

const PHILOSOPHY = [
  {
    num: '01',
    heading: 'The fire',
    body: 'Wood-fired at 900°F. Every dish carries the irreplaceable mark of live flame. No substitutes.',
  },
  {
    num: '02',
    heading: 'The craft',
    body: 'Ingredients sourced from eleven farm partners within 150 miles. We know every farmer by name.',
  },
  {
    num: '03',
    heading: 'The ritual',
    body: 'Every reservation is a ceremony. We begin preparing your table four hours before you arrive.',
  },
];

const DISHES = [
  {
    roman: 'I',
    category: 'MEAT',
    name: 'Wagyu Tenderloin',
    image:
      '/images/wagyu.jpg',
    notes:
      'A5 grade, 180-day grain fed. Bone marrow butter, charred leek ash, 24-month aged sherry reduction, micro watercress.',
    price: 'FROM $185',
  },
  {
    roman: 'II',
    category: 'PASTA',
    name: 'Black Truffle Risotto',
    image:
     '/images/risotto.jpg' ,
    notes:
      'Carnaroli rice, 36-month Parmigiano Reggiano, fresh Périgord truffle shaved tableside, white wine, truffle oil.',
    price: 'FROM $145',
  },
  {
    roman: 'III',
    category: 'ENTRÉE',
    name: 'Seared Foie Gras',
    image:
     '/images/foiegras.jpg' ,
    notes:
      'Landes duck liver, pan-seared to order. Sauternes gelée, toasted brioche soldiers, candied kumquat, micro herbs.',
    price: 'FROM $125',
  },
  {
    roman: 'IV',
    category: 'VOLAILLE',
    name: 'Aged Duck Breast',
    image:
     '/images/duck.jpg' ,
    notes:
      '42-day dry-aged Muscovy duck. Morello cherry gastrique, roasted Belgian endive, duck fat confit fondant potato.',
    price: 'FROM $135',
  },
  {
    roman: 'V',
    category: 'DESSERT',
    name: 'Valrhona Chocolate',
    image:
     '/images/dessert.jpg' ,
    notes:
      'Guanaja 70% warm molten core. Brittany salted caramel, cocoa tuile, tahitian vanilla bean ice cream.',
    price: 'DESSERT $45',
  },
];

const PRESS_ROW_1 = [
  { pub: 'The New York Times', quote: 'A singular experience in American fine dining.' },
  { pub: 'Michelin Guide', quote: 'Extraordinary. A kitchen at its absolute peak.' },
  { pub: 'Vogue', quote: 'Dinner here is theatre. Arrive hungry for both.' },
  { pub: 'Bon Appétit', quote: 'The fire is real. So is everything else.' },
];

const PRESS_ROW_2 = [
  { pub: 'Eater New York', quote: 'The most anticipated table of the decade.' },
  { pub: 'Forbes Travel', quote: 'Redefines what a restaurant can be.' },
  { pub: 'The Observer', quote: 'A once-in-a-generation dining experience.' },
  { pub: 'Food & Wine', quote: 'Simply unmissable. Book months ahead.' },
];

type SubmitState = 'idle' | 'loading' | 'success';

export default function Home() {
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [loaderComplete, setLoaderComplete] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [logoHover, setLogoHover] = useState(false);
  const [reserveHover, setReserveHover] = useState(false);
  const [heroCtaHover, setHeroCtaHover] = useState(false);
  const [privateCtaHover, setPrivateCtaHover] = useState(false);
  const [submitHover, setSubmitHover] = useState(false);
  const [marqueePaused1, setMarqueePaused1] = useState(false);
  const [marqueePaused2, setMarqueePaused2] = useState(false);
  const [hoveredPress, setHoveredPress] = useState<string | null>(null);
  const [dishImageHover, setDishImageHover] = useState<number | null>(null);
  const [footerLinkHover, setFooterLinkHover] = useState<string | null>(null);
  const [showHeroChrome, setShowHeroChrome] = useState(false);
  const [introChromeReady, setIntroChromeReady] = useState(false);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const topProgressRef = useRef<HTMLDivElement>(null);
  const navProgressRef = useRef<HTMLDivElement>(null);
  const vignetteRadialRef = useRef<HTMLDivElement>(null);
  const vignetteDynamicRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const handleLoaderComplete = useCallback(() => {
    setLoaderComplete(true);
    setPageVisible(true);
  }, []);

  const handleLoaderFadeStart = useCallback(() => {
    setLoaderComplete(true);
    setPageVisible(true);
  }, []);
  const quoteSectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const philosophyRef = useRef<HTMLElement>(null);
  const philosophyColsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dishSectionRefs = useRef<(HTMLElement | null)[]>([]);
  const dishImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dishImageInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dishTextRefs = useRef<(HTMLDivElement | null)[]>([]);
  const privateDiningRef = useRef<HTMLElement>(null);
  const privateContentRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const reservationRef = useRef<HTMLElement>(null);
  const reservationLeftRef = useRef<HTMLDivElement>(null);
  const reservationRightRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);

  const padH = isMobile ? '1.4rem' : '4rem';

  const handleChromeVisibility = useCallback((visible: boolean) => {
    setShowHeroChrome(visible);
  }, []);

  const handleIntroChromeReady = useCallback(() => {
    setIntroChromeReady(true);
  }, []);

  const footerLogoBurst = useCallback((el: HTMLElement) => {
    if (reducedMotion) return;
    const rect = el.getBoundingClientRect();
    const parent = el.offsetParent as HTMLElement | null;
    const base = parent ?? el.parentElement;
    if (!base) return;
    const pr = base.getBoundingClientRect();
    const cx = rect.left - pr.left + rect.width / 2;
    const cy = rect.top - pr.top + rect.height / 2;
    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('span');
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;
      spark.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:2px;height:2px;border-radius:50%;background:#C9A84C;pointer-events:none;z-index:5;`;
      base.style.position = 'relative';
      base.appendChild(spark);
      gsap.to(spark, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 12,
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        onComplete: () => spark.remove(),
      });
    }
  }, [reducedMotion]);

  const handleVignetteIntensity = useCallback((intensity: number) => {
    if (vignetteRadialRef.current) {
      vignetteRadialRef.current.style.opacity = String(intensity);
    }
    if (vignetteDynamicRef.current) {
      vignetteDynamicRef.current.style.opacity = String(intensity > 0.8 ? 1 : 0.65);
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setLoaderComplete(true);
      setPageVisible(true);
      setShowHeroChrome(true);
      setIntroChromeReady(true);
    }
  }, [reducedMotion]);

  useAmbientSound(loaderComplete, isMobile, reducedMotion);

  useCinematicScroll({
    enabled: loaderComplete,
    reducedMotion,
    dishRefs: {
      sections: dishSectionRefs,
      imageOuters: dishImageRefs,
      imageInners: dishImageInnerRefs,
      textEls: dishTextRefs,
    },
    quoteRef,
    quoteSectionRef,
    philosophyRef,
    philosophyColsRef,
    privateDiningRef,
    privateContentRef,
    watermarkRef,
    reservationRef,
    reservationLeftRef,
    reservationRightRef,
  });

  useLenisScroll({
    enabled: loaderComplete,
    reducedMotion,
    isMobile,
    ui: {
      mainWrapper: mainWrapperRef,
      nav: navRef,
      topProgress: topProgressRef,
      navProgress: navProgressRef,
      scrollY: scrollYRef,
    },
  });

  useEffect(() => {
    if (!isMobile && !reducedMotion) {
      document.body.style.cursor = 'none';
      return () => {
        document.body.style.cursor = '';
      };
    }
  }, [isMobile, reducedMotion]);

  useEffect(() => {
    if (!loaderComplete || reducedMotion || !footerRef.current) return;
    const el = footerRef.current;
    gsap.fromTo(
      el.querySelector('.eo-footer-logo'),
      { scale: 0.88, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
      }
    );
    gsap.fromTo(
      el.querySelectorAll('.eo-footer-link'),
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' },
      }
    );
    gsap.fromTo(
      el.querySelector('.eo-footer-rule'),
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 2,
        ease: 'power2.inOut',
        transformOrigin: 'left center',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' },
      }
    );
  }, [loaderComplete, reducedMotion]);

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '9px',
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: COLORS.gold,
  };

  return (
    <>
      <Head>
        <title>Ember &amp; Oak — Fine Dining</title>
        <meta name="description" content="Where fire becomes memory. West Village, New York City." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preload" as="image" href="/images/wagyu.jpg" />
      </Head>

      <style>{`
        html.lenis, html.lenis body { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto !important; }
        html { cursor: none; overflow-x: hidden; }
        body { margin: 0; padding: 0; overflow-x: hidden; background: #0A0703; }
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus, button:focus { outline: none; }
        input::placeholder, textarea::placeholder { color: rgba(245,240,232,0.18); }
        input:focus, select:focus, textarea:focus { border-bottom: 1px solid rgba(201,168,76,0.65) !important; }
        @keyframes grainShift {
          0% { background-position: 0px 0px; }
          10% { background-position: 128px 64px; }
          20% { background-position: -64px 128px; }
          30% { background-position: 96px -32px; }
          40% { background-position: -128px 96px; }
          50% { background-position: 64px -96px; }
          60% { background-position: -96px 32px; }
          70% { background-position: 32px 128px; }
          80% { background-position: -32px -64px; }
          90% { background-position: 160px 48px; }
          100% { background-position: 0px 0px; }
        }
        @keyframes drawLine {
          from { clip-path: inset(0 100% 0 0); }
          to { clip-path: inset(0 0% 0 0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes inscriptionFade {
          from { opacity: 0; }
          to { opacity: 0.38; }
        }
        @keyframes scrollPulse {
          0% { height: 0px; transform: translateX(-50%) translateY(0); }
          50% { height: 52px; transform: translateX(-50%) translateY(0); }
          100% { height: 0px; transform: translateX(-50%) translateY(52px); }
        }
        @keyframes textReveal {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 0.52; transform: translateY(0); }
        }
        @keyframes heroLine {
          from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0px); }
        }
        @keyframes marqueeLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        @keyframes shimmer {
          from { background-position: 0% 50%; }
          to { background-position: 200% 50%; }
        }
        @keyframes ctaFade {
          from { opacity: 0; }
          to { opacity: 0.65; }
        }
        @keyframes subtitleFade {
          from { opacity: 0; }
          to { opacity: 0.55; }
        }
      `}</style>

      <div
        ref={mainWrapperRef}
        style={{
          opacity: pageVisible ? 1 : 0,
          transition: 'opacity 1.2s ease',
          background: COLORS.ink,
          position: 'relative',
          zIndex: 2,
          isolation: 'isolate',
          overflow: 'hidden',
        }}
      >
        {/* Scroll progress bar */}
        <div
          ref={topProgressRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '1px',
            width: '0%',
            background: COLORS.gold,
            opacity: 0.55,
            zIndex: 100,
            pointerEvents: 'none',
          }}
        />

        {/* Vignette layers */}
        <div
          ref={vignetteRadialRef}
          className="eo-vignette eo-vignette-radial"
          style={{ opacity: 1 }}
          aria-hidden
        />
        <div className="eo-vignette eo-vignette-top" aria-hidden />
        <div
          ref={vignetteDynamicRef}
          className="eo-vignette eo-vignette-dynamic"
          style={{ opacity: 0.65 }}
          aria-hidden
        />

        <CinematicLoader
          onComplete={handleLoaderComplete}
          onFadeStart={handleLoaderFadeStart}
          reducedMotion={reducedMotion}
        />
        <FilmGrain isMobile={isMobile} reducedMotion={reducedMotion} />
        <CustomCursor disabled={isMobile} reducedMotion={reducedMotion} />

        {/* Top rule */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: COLORS.gold,
            opacity: 0.07,
            zIndex: 50,
            animation: pageVisible ? 'drawLine 2.5s ease forwards 5.5s' : 'none',
            clipPath: 'inset(0 100% 0 0)',
          }}
        />

        {/* Navigation */}
        <nav
          ref={navRef}
          className="eo-main-nav"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: isMobile ? '16px 1.4rem' : '24px 4rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 'none',
            animation: pageVisible ? 'fadeIn 1.4s ease both 5s' : 'none',
            opacity: pageVisible ? 1 : 0,
          }}
        >
          <span
            className="eo-nav-link"
            data-cursor="true"
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: '17px',
              color: COLORS.cream,
              letterSpacing: logoHover ? '0.18em' : '0.14em',
              cursor: 'none',
              transition: 'color 0.4s, letter-spacing 0.5s ease, transform 0.4s ease',
              transform: logoHover ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            E<span style={{ color: logoHover ? COLORS.gold : 'inherit' }}>&amp;</span>O
          </span>
          <span
            className="eo-nav-reserve"
            data-cursor="true"
            data-magnetic="true"
            onMouseEnter={() => setReserveHover(true)}
            onMouseLeave={() => setReserveHover(false)}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '10px',
              letterSpacing: reserveHover ? '0.30em' : '0.26em',
              textTransform: 'uppercase',
              color: COLORS.gold,
              opacity: reserveHover ? 1 : 0.7,
              cursor: 'none',
              transition: 'opacity 0.4s, letter-spacing 0.5s ease',
            }}
          >
            RESERVE
          </span>
          <div
            ref={navProgressRef}
            className="eo-nav-scroll-progress"
            style={{ width: '0%' }}
            aria-hidden
          />
        </nav>

        {/* Side label */}
        {!isMobile && introChromeReady && showHeroChrome && (
          <div
            style={{
              position: 'fixed',
              left: '1.6rem',
              top: '50%',
              transform: 'translateX(-50%) rotate(-90deg)',
              transformOrigin: 'center center',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '9px',
              letterSpacing: '0.30em',
              textTransform: 'uppercase',
              color: COLORS.cream,
              opacity: 0.12,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            WEST VILLAGE
          </div>
        )}

        {/* Bottom inscription */}
        {!isMobile && introChromeReady && showHeroChrome && (
          <div
            style={{
              position: 'fixed',
              bottom: '2.8rem',
              left: padH,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: COLORS.gold,
              animation: pageVisible ? 'inscriptionFade 1.5s ease both 4.2s' : 'none',
              opacity: 0,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            &ldquo;The fire has been burning since 2019.&rdquo;
          </div>
        )}

        {/* Scroll indicator */}
        {!isMobile && introChromeReady && showHeroChrome && (
          <div
            style={{
              position: 'fixed',
              bottom: '2.2rem',
              left: '50%',
              width: '1px',
              background: COLORS.gold,
              opacity: 0.45,
              animation: pageVisible ? 'scrollPulse 2.2s ease-in-out infinite 5s' : 'none',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
        )}

        <main style={{ position: 'relative', zIndex: 3, isolation: 'isolate' }}>
          <DishHero
            loaderComplete={loaderComplete}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
            heroCtaHover={heroCtaHover}
            onHeroCtaEnter={() => setHeroCtaHover(true)}
            onHeroCtaLeave={() => setHeroCtaHover(false)}
            onChromeVisibility={handleChromeVisibility}
            onVignetteIntensity={handleVignetteIntensity}
            onIntroChromeReady={handleIntroChromeReady}
          />

          {/* PART 6 — Quote */}
          <section
            ref={quoteSectionRef}
            style={{
              minHeight: '100vh',
              background: COLORS.ink,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              padding: `${isMobile ? '80px' : '120px'} 0`,
            }}
          >
            <div
              ref={quoteRef}
              style={{
                maxWidth: '720px',
                textAlign: 'center',
                padding: `0 ${padH}`,
                opacity: 0,
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 'clamp(26px, 3.2vw, 50px)',
                  color: COLORS.cream,
                  opacity: 0.82,
                  lineHeight: 1.35,
                }}
              >
                A table is just wood and candlelight.
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 'clamp(26px, 3.2vw, 50px)',
                  color: COLORS.cream,
                  opacity: 0.82,
                  lineHeight: 1.35,
                }}
              >
                What happens at ours is something else.
              </span>
            </div>
          </section>

          {/* PART 7 — Philosophy */}
          <section
            ref={philosophyRef}
            style={{
              background: COLORS.ink,
              padding: isMobile ? '120px 1.4rem' : '150px 4rem',
            }}
          >
            <p
              className="eo-eyebrow"
              style={{
                ...labelStyle,
                textAlign: 'center',
                opacity: 0.45,
                letterSpacing: '0.32em',
                marginBottom: '80px',
              }}
            >
              THE PHILOSOPHY
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                gap: isMobile ? '48px' : '80px',
                justifyContent: 'center',
                maxWidth: '1200px',
                margin: '0 auto',
              }}
            >
              {PHILOSOPHY.map((col, i) => (
                <div
                  key={col.num}
                  ref={(el) => {
                    philosophyColsRef.current[i] = el;
                  }}
                  style={{
                    maxWidth: '320px',
                    margin: isMobile ? '0 auto' : undefined,
                    opacity: 0,
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '1px',
                      background: COLORS.gold,
                      opacity: 0.6,
                      marginBottom: '24px',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic',
                      fontSize: '11px',
                      color: COLORS.gold,
                      opacity: 0.22,
                      letterSpacing: '0.18em',
                      display: 'block',
                      marginBottom: '16px',
                    }}
                  >
                    {col.num}
                  </span>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic',
                      fontWeight: 300,
                      fontSize: '34px',
                      color: COLORS.cream,
                      lineHeight: 1.1,
                      marginBottom: '24px',
                      marginTop: 0,
                    }}
                  >
                    {col.heading}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      fontWeight: 300,
                      color: COLORS.creamGhost,
                      lineHeight: 1.95,
                      letterSpacing: '0.02em',
                      margin: 0,
                    }}
                  >
                    {col.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* PART 8 — Signature Dishes */}
          {DISHES.map((dish, i) => {
            const isOdd = i % 2 === 0;
            const imageSide = (
              <div
                key={`img-${i}`}
                ref={(el) => {
                  dishImageRefs.current[i] = el;
                }}
                className="eo-menu-card"
                data-cursor="view"
                onMouseEnter={() => setDishImageHover(i)}
                onMouseLeave={() => setDishImageHover(null)}
                style={{
                  width: isMobile ? '100%' : '55%',
                  position: 'relative',
                  overflow: 'hidden',
                  background: COLORS.ink2,
                  minHeight: isMobile ? '56vw' : '88vh',
                  flexShrink: 0,
                  isolation: 'isolate',
                }}
              >
                <div
                  ref={(el) => {
                    dishImageInnerRefs.current[i] = el;
                  }}
                  className="eo-dish-image-inner"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '130%',
                    top: '-15%',
                    filter: dishImageHover === i ? 'brightness(1.08)' : 'brightness(1)',
                    transition: 'filter 0.6s ease',
                    willChange: 'transform',
                    opacity: 0,
                  }}
                >
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    sizes={isMobile ? '100vw' : '55vw'}
                    style={{ objectFit: 'cover' }}
                    priority={i < 2}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(135deg, rgba(20,16,9,0.55) 0%, rgba(15,11,7,0.45) 50%, rgba(10,7,3,0.65) 100%)`,
                    }}
                  />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontSize: '11px',
                    color: COLORS.gold,
                    opacity: 0.15,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                >
                  {dish.name}
                </div>
              </div>
            );

            const textSide = (
              <div
                key={`txt-${i}`}
                ref={(el) => {
                  dishTextRefs.current[i] = el;
                }}
                style={{
                  width: isMobile ? '100%' : '45%',
                  padding: isMobile ? '48px 1.4rem' : '80px 5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: isOdd ? COLORS.ink : COLORS.ink2,
                  flexShrink: 0,
                  opacity: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontSize: '14px',
                    color: COLORS.gold,
                    opacity: 0.38,
                    letterSpacing: '0.14em',
                    marginBottom: '24px',
                  }}
                >
                  {dish.roman}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '10px',
                    color: COLORS.gold,
                    opacity: 0.58,
                    letterSpacing: '0.30em',
                    textTransform: 'uppercase',
                    marginBottom: '24px',
                  }}
                >
                  {dish.category}
                </span>
                <h2
                  className="dish-name"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 'clamp(40px, 4.8vw, 66px)',
                    color: COLORS.cream,
                    lineHeight: 0.93,
                    letterSpacing: '-0.01em',
                    marginBottom: '32px',
                    marginTop: 0,
                  }}
                >
                  {dish.name}
                </h2>
                <div
                  style={{
                    width: '36px',
                    height: '1px',
                    background: COLORS.gold,
                    opacity: 0.55,
                    marginBottom: '24px',
                  }}
                />
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    fontWeight: 300,
                    color: COLORS.creamGhost,
                    lineHeight: 1.92,
                    maxWidth: '360px',
                    letterSpacing: '0.015em',
                    marginBottom: '48px',
                  }}
                >
                  {dish.notes}
                </p>
                <span
                  className="eo-dish-price"
                  data-value={dish.price.replace(/[^\d]/g, '')}
                  data-prefix={dish.price.replace(/\d+/, '')}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    fontWeight: 400,
                    color: COLORS.gold,
                    opacity: 0.68,
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                  }}
                >
                  {dish.price}
                </span>
              </div>
            );

            return (
              <section
                key={dish.name}
                ref={(el) => {
                  dishSectionRefs.current[i] = el;
                }}
                className="eo-menu-row"
                style={{
                  minHeight: isMobile ? 'auto' : '88vh',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  overflow: 'hidden',
                  position: 'relative',
                  isolation: 'isolate',
                  background: COLORS.ink,
                }}
              >
                {isOdd ? (
                  <>
                    {imageSide}
                    {textSide}
                  </>
                ) : (
                  <>
                    {textSide}
                    {imageSide}
                  </>
                )}
              </section>
            );
          })}

          {/* PART 9 — Private Dining */}
          <section
            ref={privateDiningRef}
            style={{
              minHeight: '92vh',
              background: COLORS.inkRoom,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: isMobile ? '80px 1.4rem' : `120px ${padH}`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                background: `linear-gradient(135deg, rgba(20,16,9,1) 0%, rgba(15,11,7,0.85) 50%, rgba(10,7,3,0.95) 100%)`,
              }}
            />
            <div
              ref={watermarkRef}
              style={{
                position: 'absolute',
                bottom: '-3vw',
                right: '-1vw',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '21vw',
                color: COLORS.gold,
                opacity: 0.022,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              PRIVATE
            </div>
            <div
              ref={privateContentRef}
              style={{
                position: 'relative',
                zIndex: 5,
                maxWidth: '480px',
                width: '100%',
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10px',
                  color: COLORS.gold,
                  opacity: 0.48,
                  letterSpacing: '0.30em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '24px',
                }}
              >
                FOR PRIVATE EVENTS
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 'clamp(42px, 5.8vw, 80px)',
                  color: COLORS.cream,
                  lineHeight: 0.93,
                  letterSpacing: '-0.01em',
                  marginBottom: '48px',
                }}
              >
                The Private
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 'clamp(42px, 5.8vw, 80px)',
                  color: COLORS.cream,
                  lineHeight: 0.93,
                  letterSpacing: '-0.01em',
                  marginBottom: '48px',
                }}
              >
                Room<span style={{ color: COLORS.gold }}>.</span>
              </span>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: COLORS.creamGhost,
                  lineHeight: 1.95,
                  marginBottom: '48px',
                }}
              >
                An intimate space for eight to twenty guests.
                <br />
                Bespoke menus written for the occasion alone.
                <br />
                Complete privacy. The kitchen comes to you.
              </p>
              <div
                data-cursor="true"
                onMouseEnter={() => setPrivateCtaHover(true)}
                onMouseLeave={() => setPrivateCtaHover(false)}
                style={{
                  display: 'inline-block',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  color: COLORS.gold,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  cursor: 'none',
                  opacity: privateCtaHover ? 1 : 0.65,
                  transition: 'opacity 0.4s',
                }}
              >
                Enquire about the room
                <span
                  style={{
                    display: 'inline-block',
                    transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1)',
                    transform: privateCtaHover ? 'translateX(7px)' : 'translateX(0)',
                  }}
                >
                  &nbsp;&nbsp;⟶
                </span>
              </div>
            </div>
          </section>

          {/* PART 10 — Press Marquee */}
          <section
            style={{
              background: COLORS.inkPress,
              padding: '110px 0',
              overflow: 'hidden',
            }}
          >
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '10px',
                color: COLORS.gold,
                opacity: 0.3,
                letterSpacing: '0.30em',
                textTransform: 'uppercase',
                textAlign: 'center',
                marginBottom: '56px',
              }}
            >
              CRITICAL RECEPTION
            </p>

            <div
              onMouseEnter={() => setMarqueePaused1(true)}
              onMouseLeave={() => {
                setMarqueePaused1(false);
                setHoveredPress(null);
              }}
              style={{
                display: 'flex',
                whiteSpace: 'nowrap',
                animation: 'marqueeLeft 35s linear infinite',
                animationPlayState: marqueePaused1 ? 'paused' : 'running',
                marginBottom: '32px',
              }}
            >
              {[...PRESS_ROW_1, ...PRESS_ROW_1].map((item, idx) => {
                const key = `r1-${idx}`;
                return (
                  <div
                    key={key}
                    className="eo-press-item"
                    onMouseEnter={() => setHoveredPress(key)}
                    onMouseLeave={() => setHoveredPress(null)}
                    style={{
                      paddingRight: '100px',
                      flexShrink: 0,
                      cursor: 'default',
                      transition: 'opacity 0.3s',
                      opacity: hoveredPress === key ? 1 : 0.55,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        color: COLORS.gold,
                        opacity: 0.38,
                        letterSpacing: '0.22em',
                      }}
                    >
                      {item.pub}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        color: COLORS.gold,
                        opacity: 0.38,
                        letterSpacing: '0.22em',
                      }}
                    >
                      {' '}
                      —{' '}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic',
                        fontSize: '22px',
                        color: COLORS.cream,
                        opacity: hoveredPress === key ? 1 : 0.68,
                        transition: 'opacity 0.3s',
                      }}
                    >
                      {item.quote}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              onMouseEnter={() => setMarqueePaused2(true)}
              onMouseLeave={() => {
                setMarqueePaused2(false);
                setHoveredPress(null);
              }}
              style={{
                display: 'flex',
                whiteSpace: 'nowrap',
                animation: 'marqueeRight 45s linear infinite',
                animationPlayState: marqueePaused2 ? 'paused' : 'running',
              }}
            >
              {[...PRESS_ROW_2, ...PRESS_ROW_2].map((item, idx) => {
                const key = `r2-${idx}`;
                return (
                  <div
                    key={key}
                    className="eo-press-item"
                    onMouseEnter={() => setHoveredPress(key)}
                    onMouseLeave={() => setHoveredPress(null)}
                    style={{
                      paddingRight: '100px',
                      flexShrink: 0,
                      cursor: 'default',
                      transition: 'opacity 0.3s',
                      opacity: hoveredPress === key ? 1 : 0.55,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        color: COLORS.gold,
                        opacity: 0.38,
                        letterSpacing: '0.22em',
                      }}
                    >
                      {item.pub}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        color: COLORS.gold,
                        opacity: 0.38,
                        letterSpacing: '0.22em',
                      }}
                    >
                      {' '}
                      —{' '}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic',
                        fontSize: '22px',
                        color: COLORS.cream,
                        opacity: hoveredPress === key ? 1 : 0.68,
                        transition: 'opacity 0.3s',
                      }}
                    >
                      {item.quote}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* PART 11 — Reservation */}
          <section
            ref={reservationRef}
            className={`eo-reservation-section${submitState === 'success' ? ' eo-reservation-success' : ''}`}
            style={{
              background: COLORS.ink,
              padding: isMobile ? '120px 1.4rem' : '160px 4rem',
              position: 'relative',
            }}
          >
            <ReservationSmoke reducedMotion={reducedMotion} />
            <div
              className="eo-reservation-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '64px' : '100px',
                alignItems: 'start',
              }}
            >
              <div ref={reservationLeftRef} style={{ opacity: 0 }}>
                <span
                  style={{
                    ...labelStyle,
                    opacity: 0.45,
                    letterSpacing: '0.30em',
                    display: 'block',
                    marginBottom: '24px',
                  }}
                >
                  AN INVITATION
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 'clamp(38px, 4.8vw, 70px)',
                    color: COLORS.cream,
                    lineHeight: 0.93,
                    marginBottom: '48px',
                  }}
                >
                  Reserve your
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 'clamp(38px, 4.8vw, 70px)',
                    color: COLORS.cream,
                    lineHeight: 0.93,
                    marginBottom: '48px',
                  }}
                >
                  evening<span style={{ color: COLORS.gold }}>.</span>
                </span>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    color: COLORS.creamGhost,
                    lineHeight: 1.95,
                    maxWidth: '380px',
                    marginBottom: '48px',
                  }}
                >
                  We seat two sittings nightly,
                  <br />
                  at six-thirty and nine o&apos;clock.
                  <br />
                  The kitchen closes at eleven.
                  <br />
                  We look forward to welcoming you.
                </p>
                <div
                  style={{
                    height: '1px',
                    background: COLORS.goldDim,
                    marginBottom: '48px',
                  }}
                />
                <span
                  style={{
                    ...labelStyle,
                    opacity: 0.35,
                    letterSpacing: '0.28em',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  RESERVATIONS
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                    color: COLORS.gold,
                    opacity: 0.65,
                    letterSpacing: '0.18em',
                  }}
                >
                  +1 212 555 0182
                </span>
              </div>

              <div ref={reservationRightRef} style={{ opacity: 0 }}>
                <div className="eo-form-field">
                  <input type="text" name="name" placeholder=" " autoComplete="name" />
                  <label>Full name</label>
                </div>
                <div className="eo-form-field eo-form-field-date">
                  <input type="date" name="date" placeholder=" " />
                  <label>Date</label>
                  <span className="eo-date-constellation" aria-hidden />
                </div>
                <div className="eo-form-field">
                  <select name="time" defaultValue="6:30 PM" style={{ appearance: 'none' as React.CSSProperties['appearance'] }}>
                    <option value="6:30 PM">6:30 PM</option>
                    <option value="9:00 PM">9:00 PM</option>
                  </select>
                  <label>Time</label>
                </div>
                <div className="eo-form-field">
                  <select name="party" defaultValue="1-2" style={{ appearance: 'none' as React.CSSProperties['appearance'] }}>
                    <option>1-2</option>
                    <option>3-4</option>
                    <option>5-6</option>
                    <option>7-8</option>
                    <option>9+</option>
                  </select>
                  <label>Party size</label>
                </div>
                <div className="eo-form-field">
                  <textarea name="requests" rows={3} placeholder=" " />
                  <label>Special requests</label>
                </div>
                <SubmitButton
                  state={submitState}
                  hover={submitHover}
                  onEnter={() => setSubmitHover(true)}
                  onLeave={() => setSubmitHover(false)}
                  onClick={() => {
                    if (submitState !== 'idle') return;
                    setSubmitState('loading');
                    window.setTimeout(() => setSubmitState('success'), 1400);
                  }}
                />
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    color: COLORS.creamFaint,
                    letterSpacing: '0.08em',
                    marginTop: '16px',
                  }}
                >
                  For same-day reservations,
                  <br />
                  please call +1 212 555 0182
                </p>
              </div>
            </div>
          </section>

          {/* PART 12 — Footer */}
          <footer
            ref={footerRef}
            className="eo-footer"
            style={{
              background: COLORS.inkDeep,
              padding: isMobile ? '72px 1.4rem 40px' : '90px 4rem 50px',
              position: 'relative',
            }}
          >
            <FooterEmbers reducedMotion={reducedMotion} />
            <div
              className="eo-footer-rule"
              style={{
                height: '1px',
                background: 'rgba(201,168,76,0.10)',
                marginBottom: '72px',
                transform: 'scaleX(0)',
                transformOrigin: 'left center',
              }}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                gap: '60px',
                marginBottom: '72px',
                textAlign: isMobile ? 'center' : 'left',
              }}
            >
              <div>
                <span
                  style={{
                    ...labelStyle,
                    opacity: 0.38,
                    letterSpacing: '0.28em',
                    display: 'block',
                    marginBottom: '24px',
                  }}
                >
                  LOCATION
                </span>
                <span
                  className="eo-footer-logo"
                  onMouseEnter={(e) => footerLogoBurst(e.currentTarget)}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontSize: '18px',
                    color: COLORS.cream,
                    opacity: 0.75,
                    letterSpacing: '0.14em',
                    display: 'block',
                    marginBottom: '16px',
                  }}
                >
                  E&amp;O
                </span>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                    color: COLORS.creamFaint,
                    lineHeight: 2.1,
                    letterSpacing: '0.04em',
                    margin: 0,
                  }}
                >
                  47 West 13th Street
                  <br />
                  New York, NY&nbsp;&nbsp;10011
                  <br />
                  Reservations: +1 212 555 0182
                </p>
              </div>
              <div style={{ textAlign: isMobile ? 'center' : 'center' }}>
                <span
                  style={{
                    ...labelStyle,
                    opacity: 0.38,
                    letterSpacing: '0.28em',
                    display: 'block',
                    marginBottom: '24px',
                  }}
                >
                  HOURS
                </span>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                    color: COLORS.creamFaint,
                    lineHeight: 2.2,
                    margin: 0,
                  }}
                >
                  Monday – Thursday&nbsp;&nbsp;&nbsp;6pm – 11pm
                  <br />
                  Friday – Saturday&nbsp;&nbsp;&nbsp;5:30pm – Midnight
                  <br />
                  Sunday&nbsp;&nbsp;&nbsp;5pm – 10pm
                  <br />
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>
                    Kitchen closes 30 min before last seating.
                  </span>
                </p>
              </div>
              <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
                <span
                  style={{
                    ...labelStyle,
                    opacity: 0.38,
                    letterSpacing: '0.28em',
                    display: 'block',
                    marginBottom: '24px',
                  }}
                >
                  FOLLOW
                </span>
                {['Instagram', 'Facebook', 'OpenTable', 'TripAdvisor'].map((link) => (
                  <div
                    key={link}
                    className="eo-footer-link"
                    data-cursor="true"
                    onMouseEnter={() => setFooterLinkHover(link)}
                    onMouseLeave={() => setFooterLinkHover(null)}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px',
                      lineHeight: 2.4,
                      color: footerLinkHover === link ? COLORS.gold : COLORS.creamFaint,
                      opacity: footerLinkHover === link ? 0.85 : 0.28,
                      cursor: 'none',
                      transition: 'color 0.3s, opacity 0.3s',
                    }}
                  >
                    {link}
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                height: '1px',
                background: 'rgba(201,168,76,0.07)',
                marginBottom: '32px',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '16px',
                textAlign: isMobile ? 'center' : 'left',
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10px',
                  color: COLORS.creamFaint,
                  letterSpacing: '0.10em',
                  opacity: 0.9,
                }}
              >
                © 2026 Ember &amp; Oak. All rights reserved.
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10px',
                  color: COLORS.creamFaint,
                  letterSpacing: '0.10em',
                  opacity: 0.9,
                }}
              >
                New York City
              </span>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
