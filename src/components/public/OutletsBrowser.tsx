'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Search, ChevronDown, ChevronUp, Sparkles, Filter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import OutletGallery from '@/components/public/OutletGallery';

const NO_IMAGE = '/assets/photos/image-unavailable.svg';


interface OutletsBrowserProps {
  initialOutlets: any[];
  clusters: any[];
  unavailable?: boolean;
}

export default function OutletsBrowser({ initialOutlets, clusters, unavailable = false }: OutletsBrowserProps) {
  const { language, t } = useLanguage();
  const isDz = language === 'dz';

  // Auto-shuffle outlets on mount so order is dynamic (Item 10)
  const [shuffledOutlets, setShuffledOutlets] = useState<any[]>(initialOutlets);
  const [showAllOutlets, setShowAllOutlets] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const rotateOutlets = () => {
      const featured = initialOutlets.filter((o) => o.is_featured || o.isFeatured);
      const nonFeatured = initialOutlets.filter((o) => !o.is_featured && !o.isFeatured);
      if (nonFeatured.length <= 1) return;
      const shuffledNonFeatured = [...nonFeatured];
      for (let i = shuffledNonFeatured.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledNonFeatured[i], shuffledNonFeatured[j]] = [shuffledNonFeatured[j], shuffledNonFeatured[i]];
      }
      setShuffledOutlets([...featured, ...shuffledNonFeatured]);
    };

    // Initial shuffle on mount
    rotateOutlets();

    // 5-second continuous rotation
    const timer = setInterval(rotateOutlets, 5000);
    return () => clearInterval(timer);
  }, [initialOutlets]);

  // Featured outlet
  const featured = shuffledOutlets.find((o) => o.is_featured || o.isFeatured) || shuffledOutlets[0];
  const primaryOutlets = shuffledOutlets.filter((o) => o.key !== featured?.key);

  // Filtered outlets based on type and search query
  const filteredOutlets = useMemo(() => {
    return primaryOutlets.filter((o) => {
      if (filterType !== 'ALL' && o.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (o.name || '').toLowerCase().includes(q);
        const matchesPlace = (o.place || '').toLowerCase().includes(q);
        const matchesCrafts = (o.crafts_on_site || o.craftsOnSite || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPlace && !matchesCrafts) return false;
      }
      return true;
    });
  }, [primaryOutlets, filterType, searchQuery]);

  // How many outlets to show initially before clicking "View More"
  const visibleOutlets = showAllOutlets ? filteredOutlets : filteredOutlets.slice(0, 3);

  return (
    <main id="main">
      {/* Featured Market Hero */}
      <section className="section relative" data-hab-section="outlets">
        <p className="crumbs">
          <Link href="/">{t('nav.home', 'Home')}</Link> / {isDz ? 'ཚོང་ཁང་དང་ལག་བཟོའི་གླིང་' : 'Outlets & clusters'}
        </p>

        {unavailable && <p role="alert">The outlet directory is temporarily unavailable. Please try again shortly.</p>}
        {!unavailable && !featured && <p>No outlets have been listed yet.</p>}
        {featured && (
          <>
            <div className="detailhero">
              <p className="eyebrow eyebrow--accent">
                {featured.type} · {isDz ? 'ལག་བཟོ་ཚོགས་པས་བདེན་དཔྱད་ཅན' : 'HAB validated'}
              </p>
              <h1 className="display display--page">{featured.name}</h1>
              <p className="lede lede--wide">{featured.description || featured.note}</p>
              <div className="actions">
                <Link className="btn btn--accent" href={`/outlets/${featured.key}`}>
                  {isDz ? 'ཚོང་ཁང་འདིའི་སྐོར་ལྷག་པར་གཟིགས →' : 'Learn more about this market →'}
                </Link>
                <Link className="btn btn--outline" href="/contact?topic=visit">
                  {isDz ? 'ལྟ་བསྐོར་འཆར་གཞི་བཟོ' : 'Plan a group visit'}
                </Link>
              </div>
            </div>

            <div style={{ height: 440, marginTop: 24 }}><OutletGallery image={featured.imageUrl} name={featured.name} /></div>
          </>
        )}
      </section>

      {/* Featured Market Facts */}
      {featured && (
        <section className="section section--tight">
          <div className="craftfacts">
            <div className="craftfacts__cell">
              <span className="craftfacts__key">{isDz ? 'གནས་ས' : 'Where'}</span>
              <span className="craftfacts__val">{featured.place}</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">{isDz ? 'སྒོ་ཕྱེའི་དུས་ཚོད' : 'Open'}</span>
              <span className="craftfacts__val">{featured.hours}</span>
            </div>
            {featured.stalls && <div className="craftfacts__cell">
              <span className="craftfacts__key">{isDz ? 'ཚོང་ཁྲོམ་རྒྱ་ཁྱོན' : 'Scale'}</span>
              <span className="craftfacts__val">{featured.stalls}</span>
            </div>}
            {featured.payment && <div className="craftfacts__cell">
              <span className="craftfacts__key">{isDz ? 'དངུལ་སྤྲོད' : 'Payment'}</span>
              <span className="craftfacts__val">{featured.payment}</span>
            </div>}
          </div>
        </section>
      )}

      {/* Outlets List with Auto-Shuffle and "View More Outlets" */}
      <section className="section">
        <div className="section__head flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="eyebrow eyebrow--accent flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              {isDz ? 'ཚོང་ཉོ་སའི་ས་གནས་གཞན' : 'Where else to buy'}
            </p>
            <h2 className="display display--sub">
              {isDz ? 'ལག་བཟོའི་ཚོང་ཁང་དང་ལས་ཁུངས' : 'Outlets & counters'}
            </h2>
            <p className="section__lede">
              {isDz
                ? 'འདི་ནང་ HAB གིས་ཐོ་བཀོད་ཡོད་པའི་ཚོང་ཁང་དང་ཚོང་ཁྲོམ་ཚུ་བཀོད་ཡོད།'
                : 'Explore the outlets and counters currently listed by HAB.'}
            </p>
          </div>
          <Link className="btn btn--ink btn--sm self-start md:self-auto" href="/shop">
            {isDz ? 'ཡང་ན་ གློག་རྡུལ་ཚོང་ཁང་ནང་གཟིགས →' : 'Or shop online →'}
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="my-6 p-4 bg-[#F8F5EE] border border-[#E4DDD1] rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#6B5A4C] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              {isDz ? 'དབྱེ་ཁག:' : 'Type:'}
            </span>
            {['ALL', 'OUTLET', 'MARKET', 'COUNTER'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  filterType === type
                    ? 'bg-[#8B2E24] text-white border-[#8B2E24] font-semibold shadow-xs'
                    : 'bg-white text-[#523D35] border-[#D8CEBF] hover:bg-[#EFE9DD]'
                }`}
              >
                {type === 'ALL'
                  ? isDz ? 'ཆ་མཉམ' : 'All Types'
                  : type === 'OUTLET'
                  ? isDz ? 'ཚོང་ཁང' : 'Retail Outlets'
                  : type === 'MARKET'
                  ? isDz ? 'ཁྲོམ་ར' : 'Craft Markets'
                  : isDz ? 'གནམ་ཐང་ལས་ཁུངས' : 'Airport Counters'}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={isDz ? 'རྫོང་ཁག་ ཡང་ན་ ཚོང་ཁང་འཚོལ...' : 'Search outlet or Dzongkhag...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D8CEBF] rounded-lg outline-none focus:border-[#8B2E24]"
            />
          </div>
        </div>

        {/* Outlets Grid */}
        <div className="grid grid--3">
          {visibleOutlets.map((o: any) => (
            <article key={o.key} className="card outlet hover:shadow-md transition-shadow">
              <Link href={`/outlets/${o.key}`}>
                <div className="frame frame--wide16" style={{ position: 'relative', overflow: 'hidden' }}>
                  <Image
                    src={o.imageUrl || NO_IMAGE}
                    alt={o.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </Link>
              <div className="card__body">
                <span className="tag">{o.type}</span>
                <h3 className="card__title clamp-2">
                  <Link href={`/outlets/${o.key}`}>{o.name}</Link>
                </h3>
                <p className="card__meta clamp-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#8B2E24] flex-shrink-0" />
                  {o.place}
                </p>
                <p className="card__text clamp-3">{o.note || o.description}</p>
                {o.hours && (
                  <p className="outlet__hours flex items-center gap-1 text-xs text-[#6B5A4C] mt-2">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {o.hours}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        {!unavailable && filteredOutlets.length === 0 && <p>No outlets match the current search or filter.</p>}

        {/* Feedback Item 10: "View More Outlets" Button */}
        {filteredOutlets.length > 3 && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setShowAllOutlets(!showAllOutlets)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B2E24] hover:bg-[#73241C] text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
            >
              {showAllOutlets ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  {isDz ? 'ཚོང་ཁང་ཉུང་སུ་སྟོན' : 'Show Fewer Outlets'}
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  {isDz
                    ? `ཚོང་ཁང་མངམ་གཟིགས (${filteredOutlets.length})`
                    : `View More Outlets (${filteredOutlets.length} listed)`}
                </>
              )}
            </button>
          </div>
        )}

        {!unavailable && <p className="footnote" style={{ marginTop: 24, textAlign: 'center' }}>
          {initialOutlets.length} {isDz ? 'ཐོ་བཀོད་ཡོད་པའི་ཚོང་ཁང་།' : 'outlets currently listed by HAB.'}
        </p>}
      </section>

      {/* Clusters Section */}
      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">{isDz ? 'ལག་བཟོའི་གླིང་ཚུ' : 'Artisan clusters'}</p>
            <h2 className="display display--sub">{isDz ? 'ལག་བཟོ་ཐོན་སའི་ས་གནས' : 'Where the crafts are made'}</h2>
            <p className="section__lede">
              {isDz
                ? 'ལག་བཟོའི་གླིང་ཟེར་མི་འདི་ གཡུས་ཁ་དང་ལུང་གཤོང་ནང་ ལག་ཤེས་དབྱེ་བ་གཅིག་ལུ་ དམིགས་བསལ་འཐུས་མི་ཚུ་ མཉམ་རུབ་ཐོག་ལས་བཟོ་སའི་ས་གནས་ཨིན།'
                : 'A cluster is a village or valley where one craft is concentrated, and where members hold a common price, buy materials together and receive visitors.'}
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/clusters">
            {isDz ? 'ལག་བཟོའི་གླིང་ཆ་མཉམ →' : 'All clusters →'}
          </Link>
        </div>

        <div className="grid grid--3">
          {clusters.slice(0, 3).map((c: any) => (
            <article key={c.key} className="card cluster">
              <Link href={`/clusters/${c.key}`}>
                <div className="frame frame--wide16" style={{ position: 'relative', overflow: 'hidden' }}>
                  <Image
                    src={c.imageUrl || NO_IMAGE}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </Link>
              <div className="card__body">
                <p className="eyebrow eyebrow--accent eyebrow--sm">{c.craft_key || c.craftKey}</p>
                <h3 className="card__title clamp-2">
                  <Link href={`/clusters/${c.key}`}>{c.name}</Link>
                </h3>
                <p className="card__meta clamp-1">
                  {c.dzongkhag} · {c.members} {isDz ? 'འཐུས་མི' : 'members'} · {isDz ? 'གཞི་བཙུགས' : 'est.'} {c.established}
                </p>
                <p className="card__text clamp-3">{c.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
