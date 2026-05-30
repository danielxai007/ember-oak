import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Lenis from 'lenis';

export type LenisScrollUiRefs = {
  mainWrapper: RefObject<HTMLDivElement | null>;
  nav: RefObject<HTMLElement | null>;
  topProgress: RefObject<HTMLDivElement | null>;
  navProgress: RefObject<HTMLDivElement | null>;
  scrollY: MutableRefObject<number>;
};

type UseLenisScrollOptions = {
  enabled: boolean;
  reducedMotion: boolean;
  isMobile: boolean;
  ui: LenisScrollUiRefs;
};

function updateScrollUi(
  scroll: number,
  velocity: number,
  isMobile: boolean,
  reducedMotion: boolean,
  ui: LenisScrollUiRefs
) {
  ui.scrollY.current = scroll;

  const maxScroll = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    1
  );
  const pct = (scroll / maxScroll) * 100;

  if (ui.topProgress.current) {
    ui.topProgress.current.style.width = `${pct}%`;
  }
  if (ui.navProgress.current) {
    ui.navProgress.current.style.width = `${pct}%`;
  }

  if (ui.nav.current) {
    ui.nav.current.classList.toggle('eo-nav-scrolled', scroll > 80);
  }

  if (!isMobile && !reducedMotion && ui.mainWrapper.current) {
    const strength = Math.min(Math.abs(velocity) * 0.35, 2.5);
    ui.mainWrapper.current.style.filter =
      strength > 0.05
        ? `drop-shadow(${strength * 0.4}px 0 0 rgba(255,50,50,0.12)) drop-shadow(${-strength * 0.4}px 0 0 rgba(50,50,255,0.12))`
        : 'none';
  }
}

/**
 * Single scroll driver: Lenis + GSAP ticker + ScrollTrigger.
 * Do not add separate wheel listeners or RAF loops for scroll.
 */
export function useLenisScroll({
  enabled,
  reducedMotion,
  isMobile,
  ui,
}: UseLenisScrollOptions) {
  const uiRef = useRef(ui);
  uiRef.current = ui;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const getUi = () => uiRef.current;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ limitCallbacks: true });

    let lenis: Lenis | null = null;

    const onResize = () => {
      lenis?.resize();
      ScrollTrigger.refresh();
    };

    if (reducedMotion) {
      const onScroll = () => {
        ScrollTrigger.update();
        updateScrollUi(window.scrollY, 0, isMobile, reducedMotion, getUi());
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      onScroll();
      ScrollTrigger.refresh();

      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
      };
    }

    document.documentElement.classList.add('lenis', 'lenis-smooth');

    lenis = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: isMobile ? 1.5 : 1,
      syncTouch: isMobile,
    });

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value?: number) {
        if (arguments.length && value !== undefined) {
          lenis?.scrollTo(value, { immediate: true });
        }
        return lenis?.scroll ?? window.scrollY;
      },
      scrollLeft(value?: number) {
        if (arguments.length && value !== undefined) {
          lenis?.scrollTo(value, { immediate: true });
        }
        return lenis?.scroll ?? window.scrollY;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
    });

    const onLenisScroll = (instance: Lenis) => {
      ScrollTrigger.update();
      updateScrollUi(instance.scroll, instance.velocity, isMobile, reducedMotion, getUi());
    };

    lenis.on('scroll', onLenisScroll);

    gsap.ticker.lagSmoothing(0);
    const tickerUpdate = (time: number) => {
      lenis?.raf(time * 1000);
    };
    gsap.ticker.add(tickerUpdate);

    const onRefresh = () => {
      lenis?.resize();
    };

    window.addEventListener('resize', onResize);
    ScrollTrigger.addEventListener('refresh', onRefresh);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tickerUpdate);
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      lenis?.off('scroll', onLenisScroll);
      lenis?.destroy();
      ScrollTrigger.scrollerProxy(document.documentElement);
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      window.removeEventListener('resize', onResize);
    };
  }, [enabled, reducedMotion, isMobile]);
}
