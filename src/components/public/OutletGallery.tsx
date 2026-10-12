'use client';

import { useEffect, useState } from 'react';

export default function OutletGallery({ image, galleryImages = [], name, outletKey }: { image?: string; galleryImages?: string[]; name: string; outletKey?: string }) {
  const slides = Array.from(new Set([image, ...galleryImages]
    .filter((src): src is string => Boolean(src) && !src!.includes('image-unavailable'))));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visualEditing, setVisualEditing] = useState(false);
  useEffect(() => {
    const syncVisualEdit = (event?: Event) => {
      const active = (event as CustomEvent<{ active?: boolean }> | undefined)?.detail?.active;
      setVisualEditing(typeof active === 'boolean' ? active : document.body.classList.contains('hab-visual-edit-on'));
    };
    syncVisualEdit();
    window.addEventListener('hab:visual-edit-toggled', syncVisualEdit);
    return () => window.removeEventListener('hab:visual-edit-toggled', syncVisualEdit);
  }, []);
  useEffect(() => {
    if (paused || visualEditing || slides.length < 2) return;
    const timer = setInterval(() => setIndex(value => (value + 1) % slides.length), 5500);
    return () => clearInterval(timer);
  }, [paused, visualEditing, slides.length]);

  return <div className="carousel carousel--outlet" role="region" aria-label={`${name} photographs`} data-hab-gallery="outlet" data-hab-gallery-id={outletKey || ''}
    style={{ minHeight: 280 }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
    onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
    <div className="carousel__track">
      {slides.map((src, i) => <div key={src} className={`carousel__slide ${i === index % slides.length ? 'is-on' : ''}`} aria-hidden={i !== index % slides.length} style={{ pointerEvents: i === index % slides.length ? 'auto' : 'none' }}>
        <img src={src} alt={`${name} — photograph ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>)}
    </div>
    {slides.length > 1 && <>
      <button type="button" className="carousel__nav carousel__nav--prev" aria-label="Previous outlet photograph" onClick={() => setIndex(value => (value - 1 + slides.length) % slides.length)}>‹</button>
      <button type="button" className="carousel__nav carousel__nav--next" aria-label="Next outlet photograph" onClick={() => setIndex(value => (value + 1) % slides.length)}>›</button>
      <div className="carousel__dots">{slides.map((src, i) => <button key={src} type="button" className={`carousel__dot ${i === index % slides.length ? 'is-on' : ''}`} aria-label={`Outlet photograph ${i + 1}`} aria-pressed={i === index % slides.length} onClick={() => setIndex(i)} />)}</div>
    </>}
  </div>;
}
