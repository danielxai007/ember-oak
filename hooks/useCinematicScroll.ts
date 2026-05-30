import { useEffect, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

type DishRefs = {
  sections: RefObject<(HTMLElement | null)[]>;
  imageOuters: RefObject<(HTMLDivElement | null)[]>;
  imageInners: RefObject<(HTMLDivElement | null)[]>;
  textEls: RefObject<(HTMLDivElement | null)[]>;
};

type CinematicScrollOptions = {
  enabled: boolean;
  reducedMotion: boolean;
  dishRefs: DishRefs;
  quoteRef: RefObject<HTMLDivElement | null>;
  quoteSectionRef: RefObject<HTMLElement | null>;
  philosophyRef: RefObject<HTMLElement | null>;
  philosophyColsRef: RefObject<(HTMLDivElement | null)[]>;
  privateDiningRef: RefObject<HTMLElement | null>;
  privateContentRef: RefObject<HTMLDivElement | null>;
  watermarkRef: RefObject<HTMLDivElement | null>;
  reservationRef: RefObject<HTMLElement | null>;
  reservationLeftRef: RefObject<HTMLDivElement | null>;
  reservationRightRef: RefObject<HTMLDivElement | null>;
};

function wrapHeadingCurtain(el: HTMLElement) {
  if (el.closest('.eo-reveal-clip')) return;
  const clip = document.createElement('div');
  clip.className = 'eo-reveal-clip';
  clip.style.cssText = 'overflow:hidden;display:block;';
  const inner = document.createElement('div');
  inner.className = 'eo-reveal-inner';
  el.parentNode?.insertBefore(clip, el);
  clip.appendChild(inner);
  inner.appendChild(el);
}

export function useCinematicScroll(options: CinematicScrollOptions) {
  const { enabled, reducedMotion } = options;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const triggers: ScrollTrigger[] = [];
    const cleanups: (() => void)[] = [];

    const addTrigger = (st: ScrollTrigger) => {
      triggers.push(st);
    };

    document.querySelectorAll('main h1, main h2, main h3').forEach((node) => {
      wrapHeadingCurtain(node as HTMLElement);
    });

    if (!reducedMotion) {
      document.querySelectorAll('.eo-reveal-inner').forEach((inner) => {
        const tween = gsap.fromTo(
          inner,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1,
            ease: EASE,
            scrollTrigger: {
              trigger: inner.closest('.eo-reveal-clip') || inner,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
        if (tween.scrollTrigger) addTrigger(tween.scrollTrigger);
      });

      document.querySelectorAll('.eo-eyebrow').forEach((el) => {
        const tween = gsap.fromTo(
          el,
          { letterSpacing: '0.6em', opacity: 0 },
          {
            letterSpacing: '0.28em',
            opacity: 1,
            duration: 1.4,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
        if (tween.scrollTrigger) addTrigger(tween.scrollTrigger);
      });
    }

    const quoteEl = options.quoteRef.current;
    const quoteSection = options.quoteSectionRef.current;
    if (quoteEl && quoteSection) {
      const tween = gsap.fromTo(
        quoteEl,
        reducedMotion ? { opacity: 0 } : { opacity: 0, y: 44, filter: 'blur(10px)' },
        {
          opacity: 0.82,
          y: 0,
          filter: 'blur(0px)',
          duration: reducedMotion ? 0.3 : 1.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: quoteSection,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
      if (tween.scrollTrigger) addTrigger(tween.scrollTrigger);
    }

    const philCols = (options.philosophyColsRef.current ?? []).filter(Boolean) as HTMLDivElement[];
    if (philCols.length && options.philosophyRef.current) {
      const tween = gsap.fromTo(
        philCols,
        { opacity: 0, y: reducedMotion ? 0 : 52 },
        {
          opacity: 1,
          y: 0,
          duration: reducedMotion ? 0.3 : 1.3,
          stagger: 0.18,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: options.philosophyRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
      if (tween.scrollTrigger) addTrigger(tween.scrollTrigger);
    }

    const dishSections = options.dishRefs.sections.current ?? [];
    const dishOuters = options.dishRefs.imageOuters.current ?? [];
    const dishInners = options.dishRefs.imageInners.current ?? [];
    const dishTexts = options.dishRefs.textEls.current ?? [];

    dishSections.forEach((section, i) => {
      const imgOuter = dishOuters[i];
      const imgInner = dishInners[i];
      const textEl = dishTexts[i];
      if (!section || !imgOuter || !imgInner || !textEl) return;

      let shimmer = imgOuter.querySelector('.eo-dish-shimmer') as HTMLDivElement | null;
      if (!shimmer && !reducedMotion) {
        shimmer = document.createElement('div');
        shimmer.className = 'eo-dish-shimmer';
        imgOuter.appendChild(shimmer);
      }

      imgInner.classList.add('eo-dish-image-inner');

      if (reducedMotion) {
        gsap.set(imgInner, { opacity: 1, scale: 1, filter: 'none' });
        gsap.set(textEl, { opacity: 1, y: 0 });
        return;
      }

      const imgTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
      if (imgTl.scrollTrigger) addTrigger(imgTl.scrollTrigger);

      imgTl.fromTo(
        imgInner,
        { scale: 1.08, opacity: 0, filter: 'grayscale(20%) brightness(0.92)' },
        {
          scale: 1,
          opacity: 1,
          filter: 'grayscale(0%) brightness(1)',
          duration: 1.4,
          ease: EASE,
        }
      );

      if (shimmer) {
        imgTl.fromTo(
          shimmer,
          { xPercent: -100, opacity: 0.4 },
          {
            xPercent: 100,
            opacity: 0,
            duration: 0.9,
            ease: 'power2.in',
            onComplete: () => shimmer?.remove(),
          },
          '-=0.6'
        );
      }

      const textTween = gsap.fromTo(
        textEl,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: EASE,
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
      if (textTween.scrollTrigger) addTrigger(textTween.scrollTrigger);

      const parallaxTween = gsap.to(imgInner, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
      if (parallaxTween.scrollTrigger) addTrigger(parallaxTween.scrollTrigger);
    });

    document.querySelectorAll('.eo-press-item').forEach((card, index) => {
      const tween = gsap.fromTo(
        card,
        { opacity: 0, y: reducedMotion ? 0 : 32 },
        {
          opacity: 1,
          y: 0,
          duration: reducedMotion ? 0.3 : 0.8,
          delay: reducedMotion ? 0 : index * 0.08,
          ease: EASE,
          scrollTrigger: {
            trigger: card,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
      if (tween.scrollTrigger) addTrigger(tween.scrollTrigger);
    });

    if (options.privateContentRef.current && options.privateDiningRef.current) {
      const tween = gsap.fromTo(
        options.privateContentRef.current,
        { opacity: 0, y: reducedMotion ? 0 : 65 },
        {
          opacity: 1,
          y: 0,
          duration: reducedMotion ? 0.3 : 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: options.privateDiningRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
      if (tween.scrollTrigger) addTrigger(tween.scrollTrigger);
    }

    if (options.watermarkRef.current && options.privateDiningRef.current && !reducedMotion) {
      const tween = gsap.to(options.watermarkRef.current, {
        x: '-8vw',
        ease: 'none',
        scrollTrigger: {
          trigger: options.privateDiningRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
      if (tween.scrollTrigger) addTrigger(tween.scrollTrigger);
    }

    const resLeft = options.reservationLeftRef.current;
    const resRight = options.reservationRightRef.current;
    if (resLeft && resRight && options.reservationRef.current) {
      const tween = gsap.fromTo(
        [resLeft, resRight],
        { opacity: 0, y: reducedMotion ? 0 : 40 },
        {
          opacity: 1,
          y: 0,
          duration: reducedMotion ? 0.3 : 1.2,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: options.reservationRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
      if (tween.scrollTrigger) addTrigger(tween.scrollTrigger);
    }

    document.querySelectorAll('.eo-dish-price').forEach((node) => {
      const el = node as HTMLElement;
      const target = parseInt(el.getAttribute('data-value') || '0', 10);
      const prefix = el.getAttribute('data-prefix') || '';
      if (!target || reducedMotion) return;

      const obj = { val: 0 };
      const tween = gsap.to(obj, {
        val: target,
        duration: 1.4,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el.closest('section') || el,
          start: 'top 68%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(obj.val)}`;
        },
      });
      if (tween.scrollTrigger) addTrigger(tween.scrollTrigger);
    });

    ScrollTrigger.refresh();

    return () => {
      triggers.forEach((t) => t.kill());
      cleanups.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable; re-init when experience mounts
  }, [enabled, reducedMotion]);
}
