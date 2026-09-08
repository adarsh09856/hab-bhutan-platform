'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Slide {
  id: string;
  imageUrl: string;
  caption: string;
  altText: string;
  linkUrl?: string | null;
}

const FALLBACK_SLIDES: Slide[] = [
  {
    id: 'fallback-1',
    imageUrl: '/images/hero_artisan.jpg',
    caption: 'Master artisan at the loom · Khoma, Lhuentse',
    altText: 'Master artisan weaving on backstrap loom in Khoma, Bhutan',
  },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch('/api/hero-slides')
      .then((r) => r.json())
      .then((data) => {
        if (data.slides && data.slides.length > 0) {
          setSlides(data.slides);
        }
      })
      .catch(() => {});
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next, slides.length]);

  const slide = slides[current];

  return (
    <div
      className="aspect-[4/3] sm:aspect-[4/3.2] rounded-[14px] bg-[#E8E1D4] border border-[#E4DDD1] overflow-hidden relative shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img
            src={s.imageUrl}
            alt={s.altText}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/hero_artisan.jpg'; }}
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none z-20" />

      {/* Prev / Next arrows — only show if multiple slides */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Bottom: caption + craft badge + dots */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-30 flex items-end justify-between gap-2">
        <div className="flex-1 min-w-0">
          {slide.linkUrl ? (
            <Link
              href={slide.linkUrl}
              className="font-mono text-[10px] sm:text-[11px] text-[#F4F0E7] bg-[#33261F]/85 backdrop-blur-sm px-[8px] sm:px-[10px] py-[4px] sm:py-[5px] rounded-[5px] border border-white/15 truncate block hover:bg-[#8B2E24]/85 transition-colors"
            >
              {slide.caption}
            </Link>
          ) : (
            <span className="font-mono text-[10px] sm:text-[11px] text-[#F4F0E7] bg-[#33261F]/85 backdrop-blur-sm px-[8px] sm:px-[10px] py-[4px] sm:py-[5px] rounded-[5px] border border-white/15 truncate block">
              {slide.caption}
            </span>
          )}
        </div>

        {/* Dot indicators */}
        {slides.length > 1 && (
          <div className="flex gap-1.5 items-center flex-none">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all ${i === current ? 'w-4 h-[6px] bg-white' : 'w-[6px] h-[6px] bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        )}

        <span className="font-mono text-[9.5px] sm:text-[10.5px] text-[#F4F0E7]/80 bg-black/40 backdrop-blur-sm px-[6px] sm:px-[8px] py-[3px] sm:py-[4px] rounded-[4px] flex-none">
          Zorig Chusum
        </span>
      </div>
    </div>
  );
}
