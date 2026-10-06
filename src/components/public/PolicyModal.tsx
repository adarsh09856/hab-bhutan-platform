'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X, FileText, ArrowRight } from 'lucide-react';

export default function PolicyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(true);
  const [policyText, setPolicyText] = useState(
    'Welcome to the Handicrafts Association of Bhutan. Please review our official policies on verified artisan standards, shipping, terms, and returns.'
  );
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // 1. Check if user already dismissed/acknowledged the modal
    const dismissed = localStorage.getItem('hab_policy_notice_seen');
    if (!dismissed) {
      // Show notice after a brief delay so page loads smoothly
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      setHasInteracted(false);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // 2. Fetch site settings to check if policy popup is enabled by admin
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((d) => {
        if (d?.setting) {
          if (d.setting.policyPopupEnabled !== undefined) {
            setIsEnabled(Boolean(d.setting.policyPopupEnabled));
          }
          if (d.setting.policyPopupText) {
            setPolicyText(d.setting.policyPopupText);
          }
        }
      })
      .catch(() => {});

    // Listen for manual open event from footer or menu
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('hab:open-policy-modal', handleOpen);
    return () => window.removeEventListener('hab:open-policy-modal', handleOpen);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('hab_policy_notice_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen || !isEnabled) return null;

  return (
    <aside
      className="policy-modal-overlay"
      role="region"
      aria-label="Website Policies & Artisan Standards"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        right: '24px',
        maxWidth: '480px',
        zIndex: 9999,
        background: '#1b1410',
        color: '#fdfbf7',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '12px',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        padding: '20px 22px',
        animation: 'fadeInUp 0.35s ease-out forwards',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(212, 175, 55, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brass, #e6ca65)',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '0.01em',
            }}
          >
            Website &amp; Artisan Policies
          </h3>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close policy notification"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)')}
        >
          <X size={18} />
        </button>
      </div>

      <p
        style={{
          margin: '12px 0 16px',
          fontSize: '13px',
          lineHeight: 1.55,
          color: 'rgba(255, 255, 255, 0.85)',
        }}
      >
        {policyText}
      </p>

      {/* Policy Links Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <Link
          href="/policies/terms"
          onClick={() => setIsOpen(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--brass, #e6ca65)',
            textDecoration: 'none',
            padding: '7px 10px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'background 0.2s',
          }}
        >
          <FileText size={13} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Terms of Service</span>
        </Link>

        <Link
          href="/policies/privacy"
          onClick={() => setIsOpen(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--brass, #e6ca65)',
            textDecoration: 'none',
            padding: '7px 10px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'background 0.2s',
          }}
        >
          <FileText size={13} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Privacy Policy</span>
        </Link>

        <Link
          href="/policies/shipping-policy"
          onClick={() => setIsOpen(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--brass, #e6ca65)',
            textDecoration: 'none',
            padding: '7px 10px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'background 0.2s',
          }}
        >
          <FileText size={13} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Returns &amp; Refunds</span>
        </Link>

        <Link
          href="/policies/conduct"
          onClick={() => setIsOpen(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--brass, #e6ca65)',
            textDecoration: 'none',
            padding: '7px 10px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'background 0.2s',
          }}
        >
          <FileText size={13} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Member Charter</span>
        </Link>
      </div>

      {/* Modal Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <Link
          href="/policies"
          onClick={() => setIsOpen(false)}
          style={{
            fontSize: '11.5px',
            color: 'rgba(255, 255, 255, 0.7)',
            textDecoration: 'underline',
          }}
        >
          All statutory policies →
        </Link>

        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'var(--brass, #e6ca65)',
            color: '#1b1410',
            border: 'none',
            borderRadius: '6px',
            padding: '7px 16px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Acknowledge &amp; Close
        </button>
      </div>
    </aside>
  );
}
