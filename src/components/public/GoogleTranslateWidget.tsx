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
              includedLanguages: 'dz,hi,ja,zh-CN,zh-TW,fr,de,es,th,ko,ne',
              layout: window.google.translate.TranslateElement.InlineLayout?.SIMPLE || 0,
              autoDisplay: false,
            },
            'google_translate_element'
          );
        } catch (e) {
          console.warn('Google translate init warning:', e);
        }
      }
    };
  }, []);

  return (
    <div className="google-translate-wrapper inline-flex items-center" style={{ position: 'relative', flexShrink: 0 }}>
      <div id="google_translate_element" style={{ display: 'inline-block' }}></div>
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <style jsx global>{`
        #google_translate_element .goog-te-gadget-simple {
          background-color: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          padding: 1px 6px !important;
          border-radius: 4px !important;
          font-size: 11px !important;
          line-height: 1.4 !important;
          display: inline-flex !important;
          align-items: center !important;
          color: #fff !important;
          cursor: pointer !important;
        }
        #google_translate_element .goog-te-gadget-simple span {
          color: #fff !important;
          font-size: 11px !important;
        }
        #google_translate_element .goog-te-gadget-simple .goog-te-menu-value span {
          color: rgba(255, 255, 255, 0.9) !important;
        }
        #google_translate_element .goog-te-gadget-simple img {
          display: none !important;
        }
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
      `}</style>
    </div>
  );
}
