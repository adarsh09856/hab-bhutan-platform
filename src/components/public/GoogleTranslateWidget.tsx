'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export default function GoogleTranslateWidget() {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'dz,en',
              autoDisplay: false,
            },
            'google_translate_hidden_element'
          );
        } catch (e) {
          console.warn('Google translate init error:', e);
        }
      }
    };

    const applyTranslation = (lang: string) => {
      const googleLang = lang === 'dz' ? 'dz' : 'en';
      const host = window.location.hostname;
      
      // Set Google Translate cookies for instant seamless translation
      document.cookie = `googtrans=/en/${googleLang}; path=/;`;
      document.cookie = `googtrans=/auto/${googleLang}; path=/;`;
      if (host) {
        document.cookie = `googtrans=/en/${googleLang}; path=/; domain=.${host};`;
        document.cookie = `googtrans=/auto/${googleLang}; path=/; domain=.${host};`;
      }

      // Also programmatically trigger the combo box if loaded
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo) {
        combo.value = googleLang;
        combo.dispatchEvent(new Event('change'));
      }
    };

    const handleLanguageChanged = (e: any) => {
      const lang = e?.detail?.language;
      if (lang) {
        applyTranslation(lang);
      }
    };

    window.addEventListener('hab:language-changed', handleLanguageChanged);

    // Check stored language on mount
    try {
      const saved = localStorage.getItem('hab_language');
      if (saved === 'dz') {
        setTimeout(() => applyTranslation('dz'), 800);
      }
    } catch {
      // Ignore
    }

    return () => {
      window.removeEventListener('hab:language-changed', handleLanguageChanged);
    };
  }, []);

  return (
    <>
      <div id="google_translate_hidden_element" style={{ display: 'none' }} aria-hidden="true" />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate,
        .goog-te-banner-frame,
        #goog-gt-tt,
        .goog-te-balloon-frame {
          display: none !important;
          visibility: hidden !important;
        }
        body {
          top: 0px !important;
        }
        .goog-text-highlight {
          background: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
}
