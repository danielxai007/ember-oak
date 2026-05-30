import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import SmokeCanvas from './SmokeCanvas';
import EmberCanvas from './EmberCanvas';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

type IngredientDef = {
  id: string;
  label: string;
  detail: string;
  src: string;
  x: number;
  y: number;
  rotation: number;
  delay: number;
  line1: string;
  line2: string;
  bgTint: string;
};

const ALL_INGREDIENTS: IngredientDef[] = [
  {
    id: 'wagyu',
    label: 'A5 Wagyu',
    detail: '01 / 06 · A5 WAGYU FROM MIYAZAKI PREFECTURE',
    src: '/images/ingredient-wagyu.jpg',
    x: 0,
    y: -220,
    rotation: -4,
    delay: 0,
    line1: 'Raised with',
    line2: 'patience.',
    bgTint: '#120A06',
  },
  {
    id: 'butter',
    label: 'Cultured Butter',
    detail: '02 / 06 · CULTURED OVER WEEKS',
    src: '/images/ingredient-butter.jpg.jpg',
    x: -260,
    y: -100,
    rotation: 5,
    delay: 0.04,
    line1: 'Cultured',
    line2: 'over weeks.',
    bgTint: '#0F0A06',
  },
  {
    id: 'rosemary',
    label: 'Wild Rosemary',
    detail: '03 / 06 · FORAGED AT DAWN',
    src: '/images/ingredient-rosemary.jpg',
    x: 260,
    y: -110,
    rotation: -6,
    delay: 0.08,
    line1: 'Foraged',
    line2: 'at dawn.',
    bgTint: '#080D08',
  },
  {
    id: 'salt',
    label: 'Maldon Sea Salt',
    detail: '04 / 06 · HARVESTED BY HAND',
    src: '/images/ingredient-salt.jpg',
    x: -220,
    y: 140,
    rotation: 7,
    delay: 0.12,
    line1: 'Harvested',
    line2: 'by hand.',
    bgTint: '#0A0806',
  },
  {
    id: 'pepper',
    label: 'Tellicherry Pepper',
    detail: '05 / 06 · SELECTED BY TOUCH',
    src: 'https://images.unsplash.com/photo-1596040033229-a0b617c6bb37?w=400&q=80',
    x: 220,
    y: 120,
    rotation: -5,
    delay: 0.16,
    line1: 'Selected',
    line2: 'by touch.',
    bgTint: '#0D0906',
  },
  {
    id: 'fire',
    label: 'Live Fire',
    detail: '06 / 06 · FINISHED BY FIRE',
    src: '/images/ingredient-fire.jpg',
    x: 0,
    y: 260,
    rotation: 3,
    delay: 0.2,
    line1: 'Finished',
    line2: 'by fire.',
    bgTint: '#150800',
  },
];

const MOBILE_IDS = new Set(['wagyu', 'rosemary', 'salt', 'fire']);
const RETURN_ORDER = ['fire', 'salt', 'rosemary', 'pepper', 'butter', 'wagyu'];
const ACTS = [
  { id: 1, label: 'I — The Approach' },
  { id: 2, label: 'II — The Separation' },
  { id: 3, label: 'III — The Obsession' },
  { id: 4, label: 'IV — The Return' },
  { id: 5, label: 'V — The Masterpiece' },
];
const MASTERPIECE_WORDS = ['Wagyu', 'Tenderloin', 'A5'];
const RETURN_WORDS = ['The', 'sum', 'of', 'every', 'obsession.'];

function fireHeartbeat() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 60;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    window.setTimeout(() => ctx.close(), 500);
  } catch {
    /* ignore */
  }
}

function ingredientBurst(container: HTMLElement) {
  const rect = container.getBoundingClientRect();
  const parent = container.offsetParent as HTMLElement | null;
  const base = parent ?? container.parentElement;
  if (!base) return;
  const pr = base.getBoundingClientRect();
  const cx = rect.left - pr.left + rect.width / 2;
  const cy = rect.top - pr.top + rect.height / 2;
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('span');
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 60;
    el.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:2px;height:2px;border-radius:50%;background:#C9A84C;pointer-events:none;z-index:20;`;
    base.appendChild(el);
    gsap.to(el, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      opacity: 0,
      duration: 1.2,
      ease: 'power2.out',
      onComplete: () => el.remove(),
    });
  }
}

function burstEmbers(container: HTMLElement) {
  const rect = container.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('span');
    const angle = Math.random() * Math.PI * 2;
    const dist = 100 + Math.random() * 300;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const colors = ['#C9A84C', '#FFB432', '#FF6414', '#E8C97A'];
    el.style.cssText = `
      position:absolute;left:${cx}px;top:${cy}px;width:${1.5 + Math.random() * 2}px;height:${1.5 + Math.random() * 2}px;
      border-radius:50%;background:${colors[Math.floor(Math.random() * colors.length)]};pointer-events:none;z-index:12;
    `;
    container.appendChild(el);
    gsap.to(el, {
      x: dx,
      y: dy,
      opacity: 0,
      duration: 2 + Math.random(),
      ease: 'power2.out',
      onComplete: () => el.remove(),
    });
  }
}

type DishHeroProps = {
  loaderComplete: boolean;
  reducedMotion: boolean;
  isMobile: boolean;
  heroCtaHover: boolean;
  onHeroCtaEnter: () => void;
  onHeroCtaLeave: () => void;
  onStoryProgress?: (progress: number, act: number) => void;
  onChromeVisibility?: (visible: boolean) => void;
  onVignetteIntensity?: (intensity: number) => void;
  onIntroChromeReady?: () => void;
};

export default function DishHero({
  loaderComplete,
  reducedMotion,
  isMobile,
  heroCtaHover,
  onHeroCtaEnter,
  onHeroCtaLeave,
  onStoryProgress,
  onChromeVisibility,
  onVignetteIntensity,
  onIntroChromeReady,
}: DishHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const burstFiredRef = useRef(false);
  const actOneSoundRef = useRef(false);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeActRef = useRef(1);
  const smokeIntensityRef = useRef(1);
  const emberIntensityRef = useRef(1);
  const emberSpeedRef = useRef(1);
  const featuredRef = useRef<string | null>(null);
  const bodyTintRef = useRef('#0A0703');
  const [introDone, setIntroDone] = useState(false);
  const [smokeActive, setSmokeActive] = useState(false);
  const [emberCount] = useState(isMobile ? 22 : 40);
  const prevFeaturedRef = useRef<string | null>(null);
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [bodyTint, setBodyTint] = useState('#0A0703');

  const ingredients = useMemo(() => {
    const list = isMobile
      ? ALL_INGREDIENTS.filter((i) => MOBILE_IDS.has(i.id))
      : ALL_INGREDIENTS;
    const scale = isMobile ? 0.5 : 1;
    return list.map((ing) => ({
      ...ing,
      x: ing.x * scale,
      y: ing.y * scale,
    }));
  }, [isMobile]);

  const runIntro = useCallback(() => {
    if (reducedMotion) {
      setIntroDone(true);
      setSmokeActive(true);
      onIntroChromeReady?.();
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set('.dish-main-image', {
        opacity: 0,
        scale: 1.15,
        filter: 'brightness(0.2) saturate(0) blur(12px)',
        clipPath: 'circle(8% at 50% 50%)',
      });

      const tl = gsap.timeline({
        onComplete: () => {
          setIntroDone(true);
        },
      });

      tl.to('.dish-main-image', {
        opacity: 1,
        scale: 1,
        filter: 'brightness(1) saturate(1.1) blur(0px)',
        clipPath: 'circle(80% at 50% 50%)',
        duration: 2.4,
        ease: EASE,
      })
        .call(() => setSmokeActive(true), [], 0.4)
        .to('.dish-candle-light', {
          scale: 1.4,
          opacity: 0.9,
          duration: 0.6,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut',
        }, 0.4)
        .fromTo(
          '.hero-eyebrow',
          { letterSpacing: '0.7em', opacity: 0 },
          { letterSpacing: '0.28em', opacity: 0.5, duration: 1.2, ease: 'power4.out' },
          1.8
        );

      ['.hero-headline-inner.line-1', '.hero-headline-inner.line-2', '.hero-headline-inner.line-3'].forEach(
        (sel, i) => {
          tl.fromTo(
            sel,
            { y: '105%', opacity: 0, filter: 'blur(4px)' },
            { y: '0%', opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: EASE },
            1.8 + i * 0.18
          );
        }
      );

      tl.fromTo('.hero-gold-rule', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: EASE, transformOrigin: 'left center' }, 2.6)
        .fromTo('.hero-cta', { opacity: 0, y: 8 }, { opacity: 0.7, y: 0, duration: 0.8, ease: EASE }, 2.8)
        .call(() => onIntroChromeReady?.(), [], 3.0);
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion, onIntroChromeReady]);

  useEffect(() => {
    if (!featuredId || featuredId === prevFeaturedRef.current || reducedMotion) return;
    prevFeaturedRef.current = featuredId;
    const el = document.getElementById(`ingredient-${featuredId}`);
    if (el) ingredientBurst(el);
  }, [featuredId, reducedMotion]);

  useEffect(() => {
    if (!loaderComplete) return;
    return runIntro();
  }, [loaderComplete, runIntro]);

  useEffect(() => {
    if (!introDone || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.to('.dish-image-wrapper', {
        y: -8,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.to('.dish-vignette', {
        opacity: 0.7,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 2,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [introDone, reducedMotion]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reducedMotion || isMobile) return;

    const onMove = (e: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to('.dish-image-wrapper', {
        rotateY: x * 8,
        rotateX: -y * 8,
        duration: 0.8,
        ease: 'power2.out',
        transformPerspective: 1000,
      });
    };
    const onLeave = () => {
      gsap.to('.dish-image-wrapper', {
        rotateX: 0,
        rotateY: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)',
      });
    };
    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onLeave);
    return () => {
      stage.removeEventListener('mousemove', onMove);
      stage.removeEventListener('mouseleave', onLeave);
    };
  }, [introDone, isMobile, reducedMotion]);

  useEffect(() => {
    if (!loaderComplete || !introDone || reducedMotion) return;
    if (!sectionRef.current || !pinRef.current) return;

    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    const scrollDistance = isMobile ? '+=350vh' : '+=500vh';
    const scrubVal = isMobile ? 1.2 : 1.8;
    const maxScale = isMobile ? 1.15 : 1.28;

    const ctx = gsap.context(() => {
      const master = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: scrollDistance,
          pin: pinRef.current,
          pinSpacing: true,
          scrub: scrubVal,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;

            if (progressFillRef.current) {
              progressFillRef.current.style.height = `${p * 100}%`;
            }

            let act = 1;
            if (p >= 0.88) act = 5;
            else if (p >= 0.7) act = 4;
            else if (p >= 0.4) act = 3;
            else if (p >= 0.15) act = 2;

            if (act !== activeActRef.current) {
              activeActRef.current = act;
              segmentRefs.current.forEach((el, idx) => {
                if (!el) return;
                const id = idx + 1;
                el.classList.toggle('is-active', id === act);
                el.classList.toggle('is-done', id < act);
              });
            }

            onStoryProgress?.(p, act);
            onChromeVisibility?.(p < 0.12);
            onVignetteIntensity?.(p < 0.15 ? 0.5 + (p / 0.15) * 0.5 : p > 0.88 ? 0.6 : 1);

            if (p > 0.01 && p < 0.02 && !actOneSoundRef.current && !isMobile) {
              actOneSoundRef.current = true;
              fireHeartbeat();
            }

            const approachT = Math.min(p / 0.15, 1);
            const smokeBase = 1 + approachT * 1.2;
            smokeIntensityRef.current = isMobile ? smokeBase * 0.6 : smokeBase;
            emberIntensityRef.current = 1 + approachT * 0.6;
            emberSpeedRef.current = 1 + approachT * 0.5;

            if (p >= 0.88 && !burstFiredRef.current && stageRef.current) {
              burstFiredRef.current = true;
              burstEmbers(stageRef.current);
            }

            const ingCount = ingredients.length;
            if (p >= 0.4 && p < 0.7) {
              const local = (p - 0.4) / 0.3;
              const idx = Math.min(Math.floor(local * ingCount), ingCount - 1);
              const id = ingredients[idx]?.id ?? null;
              if (id !== featuredRef.current) {
                featuredRef.current = id;
                setFeaturedId(id);
                const tint = id ? ingredients.find((i) => i.id === id)?.bgTint : '#0A0703';
                if (tint && tint !== bodyTintRef.current) {
                  bodyTintRef.current = tint;
                  setBodyTint(tint);
                }
              }
            } else if (p < 0.4) {
              if (featuredRef.current !== null) {
                featuredRef.current = null;
                setFeaturedId(null);
              }
              if (bodyTintRef.current !== '#0A0703') {
                bodyTintRef.current = '#0A0703';
                setBodyTint('#0A0703');
              }
            }
          },
        },
      });

      master.to('.dish-image-wrapper', { scale: maxScale, rotateZ: 1.5, ease: 'none', duration: 0.15 }, 0);
      master.to('.dish-vignette', { opacity: 0.92, ease: 'none', duration: 0.15 }, 0);
      master.to('.dish-story-pin', { backgroundColor: '#050302', ease: 'none', duration: 0.15 }, 0);
      master.to(
        '.hero-text-block',
        { scale: 0.94, opacity: 0, filter: 'blur(6px)', y: -20, ease: 'power3.in', duration: 0.15 },
        0
      );

      ingredients.forEach((ing) => {
        const t0 = 0.15 + ing.delay * 0.4;
        master.fromTo(
          `#ingredient-${ing.id}`,
          { x: 0, y: 0, scale: 0, opacity: 0, rotation: 0 },
          { x: ing.x * 1.08, y: ing.y * 1.08, scale: 1, opacity: 1, rotation: ing.rotation, ease: 'none', duration: 0.12 },
          t0
        );
        master.to(
          `#ingredient-${ing.id}`,
          { x: ing.x, y: ing.y, ease: 'none', duration: 0.08 },
          t0 + 0.12
        );
        master.to(`#ring-${ing.id}`, { scale: 2.5, opacity: 0, ease: 'power2.out', duration: 0.08 }, t0 + 0.18);
      });

      master.to('.dish-main-image', {
        clipPath: 'circle(0% at 50% 50%)',
        opacity: 0.12,
        filter: 'blur(4px) brightness(0.85)',
        ease: 'none',
        duration: 0.25,
      }, 0.15);
      master.to('.dish-constellation', { opacity: 1, ease: 'none', duration: 0.1 }, 0.2);
      master.to('.dish-constellation', { opacity: 0, ease: 'none', duration: 0.08 }, 0.32);
      master.to('.six-obsessions', { opacity: 0.35, ease: 'none', duration: 0.05 }, 0.28);
      master.to('.six-obsessions', { opacity: 0, ease: 'none', duration: 0.05 }, 0.38);

      ingredients.forEach((ing, i) => {
        const start = 0.4 + (i / ingredients.length) * 0.3;
        const slice = 0.3 / ingredients.length;
        master.to(`#ingredient-${ing.id}`, { scale: 1.08, ease: 'none', duration: slice * 0.35 }, start);
        master.to(`#ingredient-${ing.id}`, { scale: 1, ease: 'none', duration: slice * 0.25 }, start + slice * 0.35);
        master.to(`#obs-panel-${ing.id}`, { opacity: 1, ease: 'none', duration: slice * 0.3 }, start);
        master.fromTo(
          `#obs-panel-${ing.id} .obs-line-inner`,
          { y: '100%', scale: 1.4, filter: 'blur(8px)', opacity: 0 },
          { y: '0%', scale: 1, filter: 'blur(0px)', opacity: 1, ease: 'none', duration: slice * 0.35 },
          start
        );
        master.fromTo(
          `#obs-panel-${ing.id} .obs-label`,
          { letterSpacing: '0.5em', opacity: 0 },
          { letterSpacing: '0.22em', opacity: 0.55, ease: 'none', duration: slice * 0.3 },
          start + slice * 0.1
        );
        master.to(`#obs-panel-${ing.id}`, { opacity: 0, ease: 'none', duration: slice * 0.2 }, start + slice * 0.75);
        ingredients.forEach((other) => {
          if (other.id === ing.id) return;
          master.to(`#ingredient-${other.id}`, { opacity: 0.08, ease: 'none', duration: slice * 0.15 }, start);
          master.to(`#ingredient-${other.id}`, { opacity: 1, ease: 'none', duration: slice * 0.15 }, start + slice * 0.8);
        });
      });

      RETURN_ORDER.filter((id) => ingredients.some((i) => i.id === id)).forEach((id, ri) => {
        const ing = ingredients.find((i) => i.id === id)!;
        const start = 0.7 + ri * 0.025;
        master.to(`#obs-panel-return`, { opacity: 0, ease: 'none', duration: 0.02 }, 0.7);
        master.to(
          `#ingredient-${id}`,
          {
            motionPath: {
              path: [
                { x: ing.x * 0.45, y: ing.y * 0.45 - 40 },
                { x: 0, y: 0 },
              ],
              curviness: 2,
            },
            opacity: 0,
            scale: 0.75,
            rotation: 0,
            ease: 'power2.in',
            duration: 0.12,
          },
          start
        );
      });

      RETURN_WORDS.forEach((_, wi) => {
        master.fromTo(
          `.return-word-${wi}`,
          { y: '100%', opacity: 0 },
          { y: '0%', opacity: wi === RETURN_WORDS.length - 1 ? 1 : 0.85, ease: 'none', duration: 0.025 },
          0.72 + wi * 0.014
        );
      });
      master.to('.return-copy', { opacity: 0, ease: 'none', duration: 0.04 }, 0.86);

      master.to('.dish-main-image', {
        opacity: 0,
        ease: 'none',
        duration: 0.03,
      }, 0.86);
      master.fromTo(
        '.dish-main-image',
        { y: -60, scale: 1.1, filter: 'brightness(0.4) blur(2px)', clipPath: 'circle(80% at 50% 50%)' },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          filter: 'brightness(1.05) saturate(1.05) blur(0px)',
          ease: 'power4.out',
          duration: 0.12,
        },
        0.89
      );
      master.to('.dish-image-wrapper', { scale: 1, rotateZ: 0, ease: 'none', duration: 0.1 }, 0.89);
      master.to('.dish-vignette', { opacity: 0.55, ease: 'none', duration: 0.1 }, 0.89);
      master.to('.dish-story-pin', { backgroundColor: '#0A0703', ease: 'none', duration: 0.1 }, 0.89);

      master.to('.masterpiece-block', { opacity: 1, ease: 'none', duration: 0.04 }, 0.9);
      MASTERPIECE_WORDS.forEach((word, wi) => {
        master.fromTo(
          `.mp-word-${wi}`,
          { opacity: 0, filter: 'blur(15px)', color: '#C9A84C' },
          {
            opacity: 1,
            filter: 'blur(0px)',
            color: word === 'A5' ? '#C9A84C' : '#F5F0E8',
            ease: 'power3.out',
            duration: 0.08,
          },
          0.9 + wi * 0.025
        );
      });
      master.fromTo('.masterpiece-rule', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 0.1, transformOrigin: 'center center' }, 0.94);
      MASTERPIECE_WORDS.forEach((_, wi) => {
        master.fromTo(
          `.detail-word-${wi}`,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', ease: 'none', duration: 0.015 },
          0.95 + wi * 0.015
        );
      });
      master.to('.masterpiece-bridge', { opacity: 0.65, ease: 'none', duration: 0.04 }, 0.98);
    }, sectionRef);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [
    loaderComplete,
    introDone,
    reducedMotion,
    isMobile,
    ingredients,
    onStoryProgress,
    onChromeVisibility,
    onVignetteIntensity,
  ]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--eo-body-tint', bodyTint);
    document.body.style.backgroundColor = bodyTint;
    return () => {
      document.body.style.backgroundColor = '#0A0703';
    };
  }, [bodyTint]);

  const smokeCount = isMobile ? 10 : 18;
  const detailWords = ['Miyazaki Prefecture', 'Live Fire', '48 Hours'];

  return (
    <section id="dish-story" ref={sectionRef} className="dish-section">
      <div className="dish-story-pin" ref={pinRef}>
        <div className="dish-story-layout">
          <div className="hero-text-block">
            <span className="hero-eyebrow">
              EST.&nbsp;&nbsp;2019&nbsp;&nbsp;·&nbsp;&nbsp;WEST VILLAGE,&nbsp;&nbsp;NEW YORK CITY
            </span>
            <span className="hero-headline-line">
              <span className="hero-headline-inner line-1">Where fire</span>
            </span>
            <span className="hero-headline-line">
              <span className="hero-headline-inner line-2">becomes</span>
            </span>
            <span className="hero-headline-line">
              <span className="hero-headline-inner line-3">
                memory<span style={{ color: '#C9A84C' }}>.</span>
              </span>
            </span>
            <div className="hero-gold-rule" />
            <div
              className="hero-cta"
              data-cursor="true"
              data-magnetic="true"
              onMouseEnter={onHeroCtaEnter}
              onMouseLeave={onHeroCtaLeave}
              style={{ opacity: heroCtaHover ? 1 : undefined }}
            >
              Reserve your evening
              <span
                style={{
                  display: 'inline-block',
                  transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1)',
                  transform: heroCtaHover ? 'translateX(7px)' : 'translateX(0)',
                }}
              >
                &nbsp;&nbsp;⟶
              </span>
            </div>
          </div>

          <div className="dish-stage" ref={stageRef}>
            <div className="dish-light-1" aria-hidden />
            <div className="dish-light-2" aria-hidden />
            <div className="dish-warmth" aria-hidden />

            <svg className="dish-constellation" aria-hidden viewBox="-300 -300 600 600">
              {ingredients.flatMap((a, i) =>
                ingredients.slice(i + 1).map((b) => (
                  <line
                    key={`${a.id}-${b.id}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="rgba(201,168,76,0.08)"
                    strokeWidth="0.5"
                    pathLength={1}
                    className="constellation-line"
                  />
                ))
              )}
            </svg>

            <p className="six-obsessions">Six Obsessions</p>

            <div className="dish-image-wrapper">
              <div className="dish-candle-light" aria-hidden />
              <div className="dish-main-image">
                <Image
                  src="/images/wagyu.jpg"
                  alt="Wagyu Tenderloin A5"
                  fill
                  sizes="(max-width: 768px) 88vw, 55vw"
                  priority
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="dish-vignette" aria-hidden />
              <SmokeCanvas
                active={smokeActive}
                intensityRef={smokeIntensityRef}
                particleCount={smokeCount}
              />
              <EmberCanvas
                active={smokeActive}
                particleCount={emberCount}
                intensityRef={emberIntensityRef}
                speedRef={emberSpeedRef}
              />
            </div>

            <div className="ingredients-layer">
              {ingredients.map((ing) => (
                <div key={ing.id} className="ingredient-wrap">
                  <div
                    id={`ring-${ing.id}`}
                    className="ingredient-ring"
                    aria-hidden
                  />
                  <div
                    id={`ingredient-${ing.id}`}
                    className={`dish-ingredient${featuredId === ing.id ? ' is-featured' : ''}`}
                  >
                    <div className="dish-ingredient-glow" />
                    <Image src={ing.src} alt={ing.label} fill sizes="180px" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="obsession-copy">
          {ingredients.map((ing) => (
            <div key={ing.id} id={`obs-panel-${ing.id}`} className="obsession-panel">
              <span className="obs-line-1">
                <span className="obs-line-inner">{ing.line1}</span>
              </span>
              <span className="obs-line-2">
                <span className="obs-line-inner obs-line-gold">{ing.line2}</span>
              </span>
              <span className="obs-label">{ing.detail}</span>
            </div>
          ))}
        </div>

        <p className="return-copy" id="obs-panel-return">
          {RETURN_WORDS.map((word, wi) => (
            <span key={word} className={`return-word return-word-${wi}${word === 'obsession.' ? ' return-gold' : ''}`}>
              <span className="return-word-inner">{word}&nbsp;</span>
            </span>
          ))}
        </p>

        <div className="masterpiece-block">
          <h2 className="masterpiece-name">
            {MASTERPIECE_WORDS.map((word, wi) => (
              <span key={word} className={`mp-word mp-word-${wi}`}>
                {word}{wi < MASTERPIECE_WORDS.length - 1 ? '\u00A0' : ''}
              </span>
            ))}
          </h2>
          <div className="masterpiece-rule" />
          <p className="masterpiece-details">
            {detailWords.map((word, wi) => (
              <span key={word} className={`detail-word detail-word-${wi}`}>
                {word}
                {wi < detailWords.length - 1 ? '\u00A0 · \u00A0' : ''}
              </span>
            ))}
          </p>
        </div>

        <p className="masterpiece-bridge">
          Explore the full menu
          <span className="bridge-arrow"> ↓</span>
        </p>
      </div>

      {!isMobile && (
        <div className="dish-progress" aria-hidden>
          <div className="dish-progress-track">
            <div className="dish-progress-fill" ref={progressFillRef} />
          </div>
          <div className="dish-progress-segments">
            {ACTS.map((act) => (
              <div
                key={act.id}
                ref={(el) => {
                  segmentRefs.current[act.id - 1] = el;
                }}
                className={`dish-progress-segment${act.id === 1 ? ' is-active' : ''}`}
              >
                <span className="segment-label">{act.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
