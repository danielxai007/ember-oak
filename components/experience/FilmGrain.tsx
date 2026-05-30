import React, { useEffect, useRef } from 'react';

function generateGrain(size: number, alpha: number): string {
  const gc = document.createElement('canvas');
  gc.width = size;
  gc.height = size;
  const gx = gc.getContext('2d');
  if (!gx) return '';
  const img = gx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = alpha;
  }
  gx.putImageData(img, 0, 0);
  return gc.toDataURL();
}

type FilmGrainProps = {
  isMobile: boolean;
  reducedMotion: boolean;
  dynamicIntensity?: number;
};

export default function FilmGrain({ isMobile, reducedMotion, dynamicIntensity = 1 }: FilmGrainProps) {
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const url1Ref = useRef('');
  const url2Ref = useRef('');

  useEffect(() => {
    if (reducedMotion) return;
    url1Ref.current = generateGrain(200, 14);
    url2Ref.current = generateGrain(400, 10);
    if (layer1Ref.current) layer1Ref.current.style.backgroundImage = `url(${url1Ref.current})`;
    if (layer2Ref.current) layer2Ref.current.style.backgroundImage = `url(${url2Ref.current})`;
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      frameRef.current += 1;
      if (frameRef.current % 2 !== 0) return;
      const u1 = generateGrain(200, 14);
      const u2 = generateGrain(400, 10);
      if (layer1Ref.current) layer1Ref.current.style.backgroundImage = `url(${u1})`;
      if (layer2Ref.current) layer2Ref.current.style.backgroundImage = `url(${u2})`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  if (reducedMotion) return null;

  const base1 = isMobile ? 0.022 : 0.032;
  const base2 = isMobile ? 0.012 : 0.018;

  return (
    <>
      <div
        ref={layer1Ref}
        className="eo-film-grain eo-film-grain-1"
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 8,
          pointerEvents: 'none',
          backgroundSize: '200px 200px',
          opacity: base1 * dynamicIntensity,
          mixBlendMode: 'soft-light',
        }}
      />
      <div
        ref={layer2Ref}
        className="eo-film-grain eo-film-grain-2"
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 8,
          pointerEvents: 'none',
          backgroundSize: '400px 400px',
          opacity: base2 * dynamicIntensity,
          mixBlendMode: 'overlay',
        }}
      />
    </>
  );
}
