import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CLIENT_DATA, getOutletByKey } from '@/lib/client-data';

interface OutletPageProps {
  params: Promise<{ key: string }>;
}

export async function generateStaticParams() {
  return CLIENT_DATA.outlets.map((o) => ({
    key: o.key,
  }));
}

export async function generateMetadata({ params }: OutletPageProps): Promise<Metadata> {
  const { key } = await params;
  const outlet = getOutletByKey(key);
  if (!outlet) return { title: 'Outlet Not Found' };

  return {
    title: `${outlet.name} · Outlets & Markets · HAB`,
    description: outlet.description || outlet.note,
  };
}

export default async function OutletDetailPage({ params }: OutletPageProps) {
  const { key } = await params;
  const outlet = getOutletByKey(key);

  if (!outlet) {
    notFound();
  }

  const others = CLIENT_DATA.outlets.filter((o) => o.key !== outlet.key);

  return (
    <main id="main">
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/outlets">Outlets &amp; clusters</Link> / {outlet.name}
        </p>

        <div className="detailhero">
          <p className="eyebrow eyebrow--accent">
            {outlet.type} · HAB validated
          </p>
          <h1 className="display display--page">{outlet.name}</h1>
          <p className="lede lede--wide">{outlet.description || outlet.note}</p>
        </div>

        <figure className="frame frame--banner" style={{ position: 'relative', height: 440, overflow: 'hidden', marginTop: 24 }}>
          <Image
            src="/assets/photos/hero-2-punakha.jpg"
            alt={outlet.name}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
          <figcaption className="frame__caption">
            {outlet.name} — authentic Bhutanese crafts validated by HAB
          </figcaption>
        </figure>
      </section>

      {/* Facts */}
      <section className="section section--tight">
        <div className="craftfacts">
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Where</span>
            <span className="craftfacts__val">{outlet.place || '—'}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Open</span>
            <span className="craftfacts__val">{outlet.hours || '—'}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Scale</span>
            <span className="craftfacts__val">{outlet.stalls || 'HAB outlet'}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Payment</span>
            <span className="craftfacts__val">{outlet.payment || 'Cash, mBoB, cards'}</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="longread">
          <div>
            <p className="eyebrow eyebrow--accent">How it works</p>
          </div>
          <div>
            <p className="longread__body">
              {outlet.long_description || outlet.description || outlet.note}
            </p>
          </div>
        </div>
      </section>

      {/* Practical Detail */}
      {(outlet.getting_there || outlet.facilities || outlet.crafts_on_site) && (
        <section className="section">
          <p className="eyebrow eyebrow--accent">Practical detail</p>
          <h2 className="display display--sub">Before you go</h2>
          <dl className="deeplist" style={{ marginTop: 22 }}>
            {outlet.getting_there && (
              <div className="deeplist__row">
                <dt className="deeplist__key">Getting there</dt>
                <dd className="deeplist__val">{outlet.getting_there}</dd>
              </div>
            )}
            {outlet.facilities && (
              <div className="deeplist__row">
                <dt className="deeplist__key">Facilities</dt>
                <dd className="deeplist__val">{outlet.facilities}</dd>
              </div>
            )}
            {outlet.crafts_on_site && (
              <div className="deeplist__row">
                <dt className="deeplist__key">What you will find</dt>
                <dd className="deeplist__val">{outlet.crafts_on_site}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Other Outlets */}
      {others.length > 0 && (
        <section className="section section--last">
          <p className="eyebrow eyebrow--accent">Also</p>
          <h2 className="display display--sub">Other outlets &amp; markets</h2>
          <div className="grid grid--3" style={{ marginTop: 22 }}>
            {others.map((row) => (
              <article key={row.key} className="card outlet">
                <Link href={`/outlets/${row.key}`}>
                  <div className="frame frame--wide16" style={{ position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src="/assets/photos/hero-4-textiles.jpg"
                      alt={row.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </Link>
                <div className="card__body">
                  <span className="tag">{row.type}</span>
                  <h3 className="card__title clamp-2">
                    <Link href={`/outlets/${row.key}`}>{row.name}</Link>
                  </h3>
                  <p className="card__meta clamp-1">{row.place}</p>
                  <p className="card__text clamp-3">{row.note}</p>
                  {row.hours && <p className="outlet__hours">{row.hours}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
