'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { CLIENT_DATA } from '@/lib/client-data';

export default function PublicationsPage() {
  const [publications, setPublications] = useState<any[]>(() => CLIENT_DATA.publications || []);
  const [selectedKind, setSelectedKind] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/publications', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.publications && Array.isArray(d.publications) && d.publications.length > 0) {
          setPublications(
            d.publications.map((p: any) => ({
              key: p.key || p.id,
              kind: p.kind || 'Annual report',
              title: p.title,
              year: p.year || 2026,
              meta: p.metaDetails || p.meta || 'PDF · English & Dzongkha',
              abstract: p.abstract || p.summary || p.description || '',
              file_url: p.fileUrl || p.file_url || '#',
              is_featured: Boolean(p.isFeatured || p.is_featured),
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const kinds = useMemo(() => {
    return Array.from(new Set(publications.map((p) => p.kind))).filter(Boolean).sort();
  }, [publications]);

  const years = useMemo(() => {
    return Array.from(new Set(publications.map((p) => String(p.year)))).filter(Boolean).sort().reverse();
  }, [publications]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publications.filter((p) => {
      const matchKind = !selectedKind || p.kind === selectedKind;
      const matchYear = !selectedYear || String(p.year) === selectedYear;
      const matchQ = !q || p.title.toLowerCase().includes(q) || (p.abstract && p.abstract.toLowerCase().includes(q));
      return matchKind && matchYear && matchQ;
    });
  }, [publications, selectedKind, selectedYear, searchQuery]);

  const leadReport = publications.find((p) => p.is_featured) || publications[0] || {
    kind: 'Annual report',
    title: 'Annual Report 2025',
    year: 2026,
    meta: 'PDF · 4.2 MB · English & Dzongkha',
    abstract: 'Programme outcomes, sector figures and audited accounts for the year, published in English and Dzongkha.',
    file_url: '#',
  };

  const secondaryReports = publications.filter((p) => p !== leadReport).slice(0, 3);

  const resetFilters = () => {
    setSelectedKind('');
    setSelectedYear('');
    setSearchQuery('');
  };

  return (
    <main id="main">
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / Publications
        </p>
        <div style={{ maxWidth: '74ch', marginBottom: 38 }}>
          <h1 className="display display--page">Publications</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Annual reports, audited accounts, sector research, guidelines and training material — published by HAB and free to download. {publications.length} publications listed.
          </p>
        </div>

        {/* Lead Featured Box */}
        <div className="publead">
          <div className="publead__main">
            <div className="publead__copy">
              <div className="publead__tags">
                <span className="badge badge--ink" style={{ margin: 0 }}>
                  Latest
                </span>
                <span className="eyebrow eyebrow--brass eyebrow--sm" id="pubLeadKind">
                  {leadReport.kind}
                </span>
              </div>
              <h2 className="display display--lead" id="pubLeadTitle">
                {leadReport.title}
              </h2>
              <p className="band__body">
                {leadReport.abstract || 'Programme outcomes, sector figures and audited accounts for the year, published in English and Dzongkha.'}
              </p>
              <div className="publead__foot">
                <a className="btn btn--accent" href={leadReport.file_url || '#pubList'} download>
                  Download ↓
                </a>
                <span className="publead__meta" id="pubLeadMeta">
                  {leadReport.meta}
                </span>
              </div>
            </div>
            <figure className="frame frame--dark publead__cover" data-cms-img>
              <figcaption className="frame__caption frame__caption--dark">
                cover — {leadReport.title.toLowerCase()}
              </figcaption>
            </figure>
          </div>

          <div className="publead__side">
            <p className="eyebrow eyebrow--muted eyebrow--sm">Also essential</p>
            <div id="pubSecondary">
              {secondaryReports.map((p) => (
                <div key={p.key || p.title} style={{ marginBottom: 16 }}>
                  <span className="tag" style={{ fontSize: 10, padding: '2px 6px' }}>{p.kind}</span>
                  <h4 style={{ fontFamily: 'var(--display)', fontSize: 16, margin: '4px 0 2px' }}>
                    <a href={p.file_url || '#'} download className="hover:underline">{p.title}</a>
                  </h4>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', margin: 0 }}>{p.year} · {p.meta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filterbar">
          <label className="visually-hidden" htmlFor="pubSearch">
            Search publications
          </label>
          <input
            className="input"
            id="pubSearch"
            type="search"
            placeholder="Search publications by title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <label className="visually-hidden" htmlFor="pubKind">
            Type
          </label>
          <select
            className="input"
            id="pubKind"
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value)}
          >
            <option value="">All types</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <label className="visually-hidden" htmlFor="pubYear">
            Year
          </label>
          <select
            className="input"
            id="pubYear"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button className="btn btn--text" type="button" id="pubReset" onClick={resetFilters}>
            Reset
          </button>
        </div>

        <p className="craft__count" id="pubCount" style={{ margin: '0 0 20px' }}>
          {filtered.length} {filtered.length === 1 ? 'publication' : 'publications'} listed
        </p>

        {/* Publications List */}
        {filtered.length > 0 ? (
          <div className="publist" id="pubList">
            {filtered.map((p) => (
              <article key={p.key || p.title} className="pubcard">
                <div className="pubcard__copy">
                  <span className="tag">{p.kind}</span>
                  <h3 className="pubcard__title">{p.title}</h3>
                  <p className="pubcard__abstract">{p.abstract}</p>
                </div>
                <div className="pubcard__side">
                  <span className="pubcard__year">{p.year}</span>
                  <span className="pubcard__meta">{p.meta}</span>
                  <a className="btn btn--accent btn--sm" href={p.file_url || '#'} download>
                    Download ↓
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="shopempty" id="pubEmpty">
            <h2 className="shopempty__title">No publications match these filters</h2>
            <p className="shopempty__body">Try a different type or year, or clear the filters.</p>
          </div>
        )}

        {/* CTA Band */}
        <div className="ctaband" style={{ marginTop: 34 }}>
          <div>
            <h2 className="display display--panel">Looking for something not listed here?</h2>
            <p className="ctaband__body">
              Board minutes, procurement notices and project evaluations are available from the secretariat on request. Members can also download training material from the members-only area.
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/contact">
              Contact the secretariat
            </Link>
            <Link className="btn btn--ghost" href="/membership#login">
              Member login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
