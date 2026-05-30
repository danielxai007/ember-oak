import { useEffect } from 'react';

const SOUND_KEY = 'ember-oak-ambient-played';

export function useAmbientSound(enabled: boolean, isMobile: boolean, reducedMotion: boolean) {
  useEffect(() => {
    if (!enabled || isMobile || reducedMotion || typeof window === 'undefined') return;

    try {
      if (localStorage.getItem(SOUND_KEY) === '1') return;
      localStorage.setItem(SOUND_KEY, '1');
    } catch {
      return;
    }

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 220;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2.5);

    return () => {
      try {
        osc.stop();
        ctx.close();
      } catch {
        /* ignore */
      }
    };
  }, [enabled, isMobile, reducedMotion]);
}
