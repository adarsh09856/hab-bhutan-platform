'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  links?: Array<{ text: string; href: string }>;
}

export default function AskHabAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isCompact, setIsCompact] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greet',
      sender: 'bot',
      text: 'Welcome. I can tell you about the heritage behind the thirteen crafts, how each one is made, the artisans and clusters who make them, how the association is run, and how to buy — retail or trade. Where would you like to start?',
    },
  ]);

  const logRef = useRef<HTMLDivElement>(null);

  // Starter chips
  const starters = [
    'Tell me about Thagzo weaving',
    'Buying wholesale & trade terms',
    'Visiting Punakha Crafts Market',
    'Membership categories & fees',
    'How do I track my order?',
  ];

  // Scroll effect to compact button
  useEffect(() => {
    const onScroll = () => {
      setIsCompact(window.scrollY > 240);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  const respondToQuestion = (q: string) => {
    const lower = q.toLowerCase();
    let reply = '';
    let links: Array<{ text: string; href: string }> = [];

    if (lower.includes('weave') || lower.includes('thagzo') || lower.includes('textile') || lower.includes('kira')) {
      reply = 'Thagzo (weaving) is Bhutan’s most celebrated living textile tradition, practiced on backstrap looms and pedal looms. Masters produce intricate Kishuthara silk kiras in Khoma, Lhuentse, and heavy woolen yathra cloths in Bumthang.';
      links = [
        { text: 'Explore Thagzo Craft', href: '/craft/thagzo' },
        { text: 'Shop Woven Textiles', href: '/shop?craft=thagzo' },
      ];
    } else if (lower.includes('wholesale') || lower.includes('trade') || lower.includes('bulk') || lower.includes('moq') || lower.includes('b2b')) {
      reply = 'HAB provides verified trade buyers with volume tier pricing, MOQs, customized made-to-order production, and export documentation directly from member artisan clusters. Registration takes about 5 minutes, with verification within 3 business days.';
      links = [
        { text: 'Wholesale Sourcing Guide', href: '/wholesale' },
        { text: 'Browse Wholesale Catalogue', href: '/wholesale/shop' },
        { text: 'Register as Trade Buyer', href: '/wholesale/register' },
      ];
    } else if (lower.includes('punakha') || lower.includes('market') || lower.includes('outlet') || lower.includes('shop') || lower.includes('showroom')) {
      reply = 'The Punakha Crafts Market is Bhutan’s premier authentic craft destination, managed directly by HAB. Located opposite the historic Punakha Dzong across the Mochhu river, it features 32 verified artisan stalls open daily from 09:00 to 18:00.';
      links = [
        { text: 'Punakha Market Profile', href: '/outlets/punakha-market' },
        { text: 'All Member Outlets', href: '/outlets' },
      ];
    } else if (lower.includes('member') || lower.includes('register') || lower.includes('join') || lower.includes('fee') || lower.includes('dues')) {
      reply = 'HAB membership is open to traditional artisans, craft micro-enterprises, village clusters, and civil society bodies across 5 tiers: Individual Artisan (Nu. 500/yr), Craft Enterprise (Nu. 2,000/yr), Artisan Cluster (Nu. 3,000/yr), Affiliated Member (Nu. 5,000/yr), and Honorary.';
      links = [
        { text: 'Membership Overview', href: '/membership' },
        { text: 'Apply for Membership', href: '/register' },
      ];
    } else if (lower.includes('track') || lower.includes('delivery') || lower.includes('shipping') || lower.includes('where is my order')) {
      reply = 'Every retail order is hand-checked and packed in Kawajangsa, Thimphu, and shipped via tracked Bhutan Post International Express (EMS) or DHL Express. You can track your consignment in real time using your HAB order number.';
      links = [
        { text: 'Track Your Order', href: '/track-order' },
        { text: 'Shipping & Delivery Policy', href: '/shipping-policy' },
      ];
    } else if (lower.includes('thangka') || lower.includes('lhazo') || lower.includes('paint')) {
      reply = 'Lhazo covers sacred Buddhist thangka painting, wall murals in dzongs, and pigment decoration. Master painters work with ground mineral pigments on prepared cotton or linen canvas according to the classical proportions of Buddhist iconography.';
      links = [
        { text: 'Lhazo Craft Guide', href: '/craft/lhazo' },
        { text: 'Shop Mineral Thangkas', href: '/shop?craft=lhazo' },
      ];
    } else if (lower.includes('cluster') || lower.includes('village')) {
      reply = 'Artisan clusters bring together rural craftspeople in specialized geographic valleys, from Khoma silk weavers in Lhuentse to Zhemgang cane and bamboo weavers and Trashiyangtse woodturners.';
      links = [
        { text: 'Explore All Clusters', href: '/clusters' },
      ];
    } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('address')) {
      reply = 'The HAB Secretariat is located on Metog Lam in Kawajangsa, Thimphu (opposite the National Library). Contact us at officehab@gmail.com or +975-2-338089.';
      links = [
        { text: 'Contact Secretariat', href: '/contact' },
      ];
    } else {
      reply = `Thank you for your question about "${q}". I answer from HAB’s published records covering the 13 traditional crafts of Zorig Chusum, artisan membership, ethical procurement, and our certified shop catalog.`;
      links = [
        { text: 'Browse The Shop', href: '/shop' },
        { text: 'About The Association', href: '/about' },
        { text: 'Contact Desk', href: '/contact' },
      ];
    }

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'bot',
        text: reply,
        links,
      },
    ]);
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'user',
        text: text.trim(),
      },
    ]);
    setInputVal('');
    setTimeout(() => {
      respondToQuestion(text.trim());
    }, 300);
  };

  return (
    <>
      {/* Floating launcher button — always anchored bottom-right */}
      <button
        type="button"
        className={`ai-launch ${isCompact ? 'is-compact' : ''} ${isOpen ? 'is-open' : ''}`}
        aria-expanded={isOpen}
        aria-controls="aiPanel"
        onClick={() => setIsOpen(!isOpen)}
        title="Ask HAB site guide assistant"
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          zIndex: 9999,
          cursor: 'pointer',
        }}
      >
        <span className="ai-launch__dot" aria-hidden="true" />
        <span className="ai-launch__label">Ask HAB</span>
      </button>

      {/* Assistant dialog panel */}
      <section
        className="ai"
        id="aiPanel"
        aria-hidden={!isOpen}
        aria-label="Ask HAB — site assistant"
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '78px',
          zIndex: 9999,
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
        }}
      >
        <header className="ai__head">
          <div>
            <p className="ai__kicker">Site assistant</p>
            <p className="ai__title">Ask HAB</p>
          </div>
          <button
            type="button"
            className="ai__close"
            aria-label="Close the assistant"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </header>

        <div className="ai__log" ref={logRef} role="log" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`ai__msg ai__msg--${m.sender === 'user' ? 'you' : 'bot'}`}>
              <p className="ai__text">{m.text}</p>
              {m.links && m.links.length > 0 && (
                <div className="ai__links">
                  {m.links.map((l) => (
                    <Link
                      key={l.text}
                      href={l.href}
                      className="ai__link"
                      onClick={() => setIsOpen(false)}
                    >
                      {l.text} →
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Starter chips */}
          {messages.length === 1 && (
            <div className="ai__chips">
              {starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="ai__chip"
                  onClick={() => handleSend(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          className="ai__form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputVal);
          }}
        >
          <input
            type="text"
            className="ai__input"
            placeholder="Ask about the shop, membership, crafts…"
            aria-label="Your question"
            autoComplete="off"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button type="submit" className="ai__send" aria-label="Send">
            →
          </button>
        </form>

        <p className="ai__note">
          I answer only from HAB’s published material — I do not estimate or guess. Trade pricing and unpublished figures need a verified partner login.
        </p>
      </section>
    </>
  );
}
