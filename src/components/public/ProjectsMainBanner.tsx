'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

export type ProjectsBannerSlide = {
  id: string;
  imageUrl: string;
  altText: string;
  caption?: string;
  linkUrl?: string | null;
  source: 'project-banner' | 'project';
};

export default function ProjectsMainBanner({ slides }: { slides: ProjectsBannerSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slideCount = slides.length;

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(0, slideCount - 1)));
  }, [slideCount]);

  useEffect(() => {
    if (slideCount < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % slideCount), 6000);
    return () => window.clearInterval(timer);
  }, [slideCount, paused]);

  if (!slideCount) return null;
  const slide = slides[activeIndex];
  const image = <img
    src={slide.imageUrl}
    alt={slide.altText}
    data-hab-gallery={slide.source}
    data-hab-gallery-id={slide.id}
    className="projects-banner__image"
    loading={activeIndex === 0 ? 'eager' : 'lazy'}
    fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
  />;

  return (
    <section className="projects-banner" aria-label="Featured projects" aria-roledescription="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}>
      {slide.linkUrl ? <a className="projects-banner__media" href={slide.linkUrl}>{image}</a> : <div className="projects-banner__media">{image}</div>}
      {(slide.caption || slideCount > 1) && <div className="projects-banner__footer">
        <p className="projects-banner__caption" aria-live="polite">{slide.caption || slide.altText}</p>
        {slideCount > 1 && <div className="projects-banner__controls" aria-label="Project banner slides">
          <button type="button" onClick={() => setActiveIndex((activeIndex - 1 + slideCount) % slideCount)} aria-label="Previous project banner image"><ChevronLeft aria-hidden="true" /></button>
          <span aria-live="polite">{activeIndex + 1} / {slideCount}</span>
          <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % slideCount)} aria-label="Next project banner image"><ChevronRight aria-hidden="true" /></button>
          <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Play project banner' : 'Pause project banner'}>{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</button>
        </div>}
      </div>}
    </section>
  );
}
