'use client';

import React, { useState, useEffect } from 'react';

export default function DesignTweaks() {
  const [isOpen, setIsOpen] = useState(false);
  const [voice, setVoice] = useState<'heritage' | 'institutional' | 'editorial'>('heritage');
  const [presence, setPresence] = useState<'reserved' | 'balanced' | 'assertive'>('balanced');
  const [rhythm, setRhythm] = useState<'gallery' | 'standard' | 'catalogue'>('standard');

  useEffect(() => {
    try {
      const savedScale = localStorage.getItem('hab_font_scale');
      if (savedScale) {
        document.documentElement.style.setProperty('--hab-font-scale', savedScale);
      }
      const savedVoice = localStorage.getItem('hab.tweaks.voice') as any;
      const savedPresence = localStorage.getItem('hab.tweaks.presence') as any;
      const savedRhythm = localStorage.getItem('hab.tweaks.rhythm') as any;

      if (savedVoice) {
        setVoice(savedVoice);
        document.documentElement.setAttribute('data-voice', savedVoice);
      }
      if (savedPresence) {
        setPresence(savedPresence);
        document.documentElement.setAttribute('data-presence', savedPresence);
      }
      if (savedRhythm) {
        setRhythm(savedRhythm);
        document.documentElement.setAttribute('data-rhythm', savedRhythm);
      }

      // Sync server-persisted styling from site-settings for first-time visitors
      fetch('/api/site-settings', { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => {
          const styling = data?.setting?.paymentGateways?.styling;
          if (styling?.globalScale && !savedScale) {
            document.documentElement.style.setProperty('--hab-font-scale', String(styling.globalScale));
          }
          if (styling?.voice && !savedVoice) {
            setVoice(styling.voice);
            document.documentElement.setAttribute('data-voice', styling.voice);
          }
        })
        .catch(() => {});
    } catch {}
  }, []);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const updateVoice = (val: 'heritage' | 'institutional' | 'editorial') => {
    setVoice(val);
    document.documentElement.setAttribute('data-voice', val);
    try {
      localStorage.setItem('hab.tweaks.voice', val);
    } catch {}
  };

  const updatePresence = (val: 'reserved' | 'balanced' | 'assertive') => {
    setPresence(val);
    document.documentElement.setAttribute('data-presence', val);
    try {
      localStorage.setItem('hab.tweaks.presence', val);
    } catch {}
  };

  const updateRhythm = (val: 'gallery' | 'standard' | 'catalogue') => {
    setRhythm(val);
    document.documentElement.setAttribute('data-rhythm', val);
    try {
      localStorage.setItem('hab.tweaks.rhythm', val);
    } catch {}
  };

  const handleReset = () => {
    setVoice('heritage');
    setPresence('balanced');
    setRhythm('standard');
    document.documentElement.removeAttribute('data-voice');
    document.documentElement.removeAttribute('data-presence');
    document.documentElement.removeAttribute('data-rhythm');
    document.documentElement.style.removeProperty('--hab-font-scale');
    try {
      localStorage.removeItem('hab.tweaks.voice');
      localStorage.removeItem('hab.tweaks.presence');
      localStorage.removeItem('hab.tweaks.rhythm');
      localStorage.removeItem('hab_font_scale');
    } catch {}
  };


  return (
    <>
      <button
        className="tweaks-launch"
        id="tweaksLaunch"
        aria-expanded={isOpen}
        aria-controls="tweaks"
        title="Design tweaks (Ctrl+Shift+T)"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '76px',
          zIndex: 130,
          cursor: 'pointer',
        }}
      >
        ⚙
      </button>

      <aside
        className="tweaks"
        id="tweaks"
        aria-hidden={!isOpen}
        aria-label="Design tweaks"
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '132px',
          zIndex: 130,
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
        }}
      >
        <header className="tweaks__head">
          <div>
            <p className="tweaks__kicker">Design review</p>
            <h2 className="tweaks__title">Tweaks</h2>
          </div>
          <button
            className="tweaks__close"
            id="tweaksClose"
            aria-label="Close tweaks"
            type="button"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </header>

        <div className="tweaks__body">
          <section className="tweaks__group" data-tweak="voice">
            <h3 className="tweaks__label">Typographic voice</h3>
            <p className="tweaks__note">Which institution the page sounds like.</p>
            <div className="tweaks__options" role="radiogroup" aria-label="Typographic voice">
              <button
                className={`tweaks__opt ${voice === 'heritage' ? 'is-active' : ''}`}
                role="radio"
                aria-checked={voice === 'heritage'}
                type="button"
                onClick={() => updateVoice('heritage')}
              >
                <span className="tweaks__optname">Heritage</span>
                <span className="tweaks__optdesc">Marcellus display, Lora body. Classical, cultural custodian.</span>
              </button>
              <button
                className={`tweaks__opt ${voice === 'institutional' ? 'is-active' : ''}`}
                role="radio"
                aria-checked={voice === 'institutional'}
                type="button"
                onClick={() => updateVoice('institutional')}
              >
                <span className="tweaks__optname">Institutional</span>
                <span className="tweaks__optdesc">All Figtree, tighter tracking. Reads like a development agency.</span>
              </button>
              <button
                className={`tweaks__opt ${voice === 'editorial' ? 'is-active' : ''}`}
                role="radio"
                aria-checked={voice === 'editorial'}
                type="button"
                onClick={() => updateVoice('editorial')}
              >
                <span className="tweaks__optname">Editorial</span>
                <span className="tweaks__optdesc">Serif display and serif body at magazine scale.</span>
              </button>
            </div>
          </section>

          <section className="tweaks__group" data-tweak="presence">
            <h3 className="tweaks__label">Colour presence</h3>
            <p className="tweaks__note">How loudly the madder red and dark bands speak.</p>
            <div className="tweaks__options" role="radiogroup" aria-label="Colour presence">
              <button
                className={`tweaks__opt ${presence === 'reserved' ? 'is-active' : ''}`}
                role="radio"
                aria-checked={presence === 'reserved'}
                type="button"
                onClick={() => updatePresence('reserved')}
              >
                <span className="tweaks__optname">Reserved</span>
                <span className="tweaks__optdesc">Red on actions only. Bands go to warm paper with rules.</span>
              </button>
              <button
                className={`tweaks__opt ${presence === 'balanced' ? 'is-active' : ''}`}
                role="radio"
                aria-checked={presence === 'balanced'}
                type="button"
                onClick={() => updatePresence('balanced')}
              >
                <span className="tweaks__optname">Balanced</span>
                <span className="tweaks__optdesc">As approved: dark bands, red actions, brass labels.</span>
              </button>
              <button
                className={`tweaks__opt ${presence === 'assertive' ? 'is-active' : ''}`}
                role="radio"
                aria-checked={presence === 'assertive'}
                type="button"
                onClick={() => updatePresence('assertive')}
              >
                <span className="tweaks__optname">Assertive</span>
                <span className="tweaks__optdesc">Red claims the bands and panels; brass turns to gold.</span>
              </button>
            </div>
          </section>

          <section className="tweaks__group" data-tweak="rhythm">
            <h3 className="tweaks__label">Page rhythm</h3>
            <p className="tweaks__note">Air between sections, card padding, and how big the crafts read.</p>
            <div className="tweaks__options" role="radiogroup" aria-label="Page rhythm">
              <button
                className={`tweaks__opt ${rhythm === 'gallery' ? 'is-active' : ''}`}
                role="radio"
                aria-checked={rhythm === 'gallery'}
                type="button"
                onClick={() => updateRhythm('gallery')}
              >
                <span className="tweaks__optname">Gallery</span>
                <span className="tweaks__optdesc">Generous air, fewer cards per row, objects given space.</span>
              </button>
              <button
                className={`tweaks__opt ${rhythm === 'standard' ? 'is-active' : ''}`}
                role="radio"
                aria-checked={rhythm === 'standard'}
                type="button"
                onClick={() => updateRhythm('standard')}
              >
                <span className="tweaks__optname">Standard</span>
                <span className="tweaks__optdesc">As approved.</span>
              </button>
              <button
                className={`tweaks__opt ${rhythm === 'catalogue' ? 'is-active' : ''}`}
                role="radio"
                aria-checked={rhythm === 'catalogue'}
                type="button"
                onClick={() => updateRhythm('catalogue')}
              >
                <span className="tweaks__optname">Catalogue</span>
                <span className="tweaks__optdesc">Dense retail grid — more products above the fold.</span>
              </button>
            </div>
          </section>

          <button className="tweaks__reset" id="tweaksReset" type="button" onClick={handleReset}>
            Reset to the approved design
          </button>
        </div>
      </aside>
    </>
  );
}
