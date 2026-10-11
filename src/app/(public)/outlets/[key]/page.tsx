import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import prisma from '@/lib/prisma';
import { outletImages } from '@/lib/reference-images';
import { cleanOutletGalleryMarker, readOutletGallery } from '@/lib/outlet-gallery';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import OutletGallery from '@/components/public/OutletGallery';
import LocalizedRecordField from '@/components/public/LocalizedRecordField';

export const dynamic = 'force-dynamic';

interface OutletPageProps {
  params: Promise<{ key: string }>;
}

async function resolveOutlet(key: string) {
    const o = await prisma.outletRecord.findUnique({ where: { key } });
    if (o) {
      let note = o.note || '';
      let imageUrl: string | undefined = undefined;
      if (note.includes('<!-- HAB_IMAGE:')) {
        const match = note.match(/<!--\s*HAB_IMAGE:\s*(.*?)\s*-->/);
        if (match) {
          imageUrl = match[1].trim();
          note = note.replace(/<!--\s*HAB_IMAGE:\s*[\s\S]*?-->/g, '').trim();
        }
      }
      return {
        key: o.key,
        type: o.type,
        name: o.name,
        name_dz: o.nameDz,
        sort_order: o.sortOrder,
        is_featured: o.isFeatured,
        place: o.place,
        place_dz: o.placeDz,
        note: cleanOutletGalleryMarker(note),
        note_dz: o.noteDz,
        description: o.description,
        description_dz: o.descriptionDz,
        long_description: o.longDescription,
        long_description_dz: o.longDescriptionDz,
        hours: o.hours,
        hours_dz: o.hoursDz,
        stalls: o.stalls || '',
        stalls_dz: o.stallsDz || '',
        crafts_on_site: o.craftsOnSite || '',
        crafts_on_site_dz: o.craftsOnSiteDz || '',
        payment: o.payment || '',
        payment_dz: o.paymentDz || '',
        getting_there: o.gettingThere || '',
        getting_there_dz: o.gettingThereDz || '',
        facilities: o.facilities || '',
        facilities_dz: o.facilitiesDz || '',
        imageUrl: imageUrl || outletImages[o.key],
        galleryImages: readOutletGallery(o.note),
      };
    }
  return null;
}

export async function generateMetadata({ params }: OutletPageProps): Promise<Metadata> {
  const { key } = await params;
  const outlet = await resolveOutlet(key);
  if (!outlet) return { title: 'Outlet Not Found' };

  return {
    title: `${outlet.name} · Outlets & Markets · HAB`,
    description: outlet.description || outlet.note,
  };
}

export default async function OutletDetailPage({ params }: OutletPageProps) {
  const { key } = await params;
  const outlet = await resolveOutlet(key);

  if (!outlet) {
    notFound();
  }

  let others: any[] = [];
  try {
    const dbAll = await prisma.outletRecord.findMany({ where: { NOT: { key: outlet.key } }, orderBy: { sortOrder: 'asc' } });
    others = dbAll.map(o => {
        let note = o.note || '';
        let imageUrl: string | undefined = undefined;
        if (note.includes('<!-- HAB_IMAGE:')) {
          const match = note.match(/<!--\s*HAB_IMAGE:\s*(.*?)\s*-->/);
          if (match) {
            imageUrl = match[1].trim();
            note = note.replace(/<!--\s*HAB_IMAGE:\s*[\s\S]*?-->/g, '').trim();
          }
        }
        return {
          key: o.key,
          type: o.type,
          name: o.name,
          name_dz: o.nameDz,
          place: o.place,
          place_dz: o.placeDz,
          note: cleanOutletGalleryMarker(note),
          note_dz: o.noteDz,
          description: o.description,
          description_dz: o.descriptionDz,
          long_description: o.longDescription,
          long_description_dz: o.longDescriptionDz,
          hours: o.hours,
          hours_dz: o.hoursDz,
          stalls: o.stalls || '',
          stalls_dz: o.stallsDz || '',
          crafts_on_site: o.craftsOnSite || '',
          crafts_on_site_dz: o.craftsOnSiteDz || '',
          payment: o.payment || '',
          payment_dz: o.paymentDz || '',
          getting_there: o.gettingThere || '',
          getting_there_dz: o.gettingThereDz || '',
          facilities: o.facilities || '',
          facilities_dz: o.facilitiesDz || '',
          imageUrl: imageUrl || outletImages[o.key],
          galleryImages: readOutletGallery(o.note),
        };
      });
  } catch {}

  const bannerImg = outlet.imageUrl || '/assets/photos/image-unavailable.svg';

  return (
    <main id="main">
      <section className="section relative" data-hab-section="outlet-detail">
        <SectionEditBadge label="Outlets Studio" studioHref="/admin/clusters-outlets" sectionType="outlets" />
        
        {/* Blueprint Backbar */}
        <div className="backbar">
          <Link className="backbar__link" href="/outlets">
            <span aria-hidden="true">←</span> <LocalizedRecordField english="Back to Outlets & clusters" dzongkha="ཚོང་ཁང་དང་ལག་བཟོའི་གླིང་ཚུ་ལུ་ལོག་འགྱོ" />
          </Link>
        </div>

        <p className="crumbs">
          <Link href="/"><LocalizedRecordField english="Home" dzongkha="ཁྱིམ" /></Link> / <Link href="/outlets"><LocalizedRecordField english="Outlets & clusters" dzongkha="ཚོང་ཁང་དང་ལག་བཟོའི་གླིང" /></Link> / <LocalizedRecordField english={outlet.name} dzongkha={outlet.name_dz} />
        </p>

        <div className="detailhero">
          <p className="eyebrow eyebrow--accent">
            {outlet.type} · HAB validated
          </p>
          <h1 className="display display--page"><LocalizedRecordField english={outlet.name} dzongkha={outlet.name_dz} /></h1>
          <p className="lede lede--wide"><LocalizedRecordField english={outlet.description || outlet.note} dzongkha={outlet.description_dz || outlet.note_dz} /></p>
        </div>

        <div style={{ height: 440 }}><OutletGallery image={bannerImg} galleryImages={outlet.galleryImages} name={outlet.name} outletKey={outlet.key} /></div>
      </section>

      {/* Facts */}
      <section className="section section--tight">
        <div className="craftfacts">
          <div className="craftfacts__cell">
            <span className="craftfacts__key"><LocalizedRecordField english="Where" dzongkha="ག་ཏེ" /></span>
            <span className="craftfacts__val"><LocalizedRecordField english={outlet.place || '—'} dzongkha={outlet.place_dz} /></span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key"><LocalizedRecordField english="Open" dzongkha="སྒོ་ཕྱེ" /></span>
            <span className="craftfacts__val"><LocalizedRecordField english={outlet.hours || '—'} dzongkha={outlet.hours_dz} /></span>
          </div>
          {outlet.stalls && <div className="craftfacts__cell">
            <span className="craftfacts__key"><LocalizedRecordField english="Scale" dzongkha="ཚོང་སྒྲོམ" /></span>
            <span className="craftfacts__val"><LocalizedRecordField english={outlet.stalls} dzongkha={outlet.stalls_dz} /></span>
          </div>}
          {outlet.payment && <div className="craftfacts__cell">
            <span className="craftfacts__key"><LocalizedRecordField english="Payment" dzongkha="དངུལ་སྤྲོད" /></span>
            <span className="craftfacts__val"><LocalizedRecordField english={outlet.payment} dzongkha={outlet.payment_dz} /></span>
          </div>}
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="longread">
          <div>
            <p className="eyebrow eyebrow--accent"><LocalizedRecordField english="How it works" dzongkha="ལཱ་ག་དེ་སྦེ་འབདཝ་ཨིན་ན" /></p>
          </div>
          <div>
            <p className="longread__body">
              <LocalizedRecordField english={outlet.long_description || outlet.description || outlet.note} dzongkha={outlet.long_description_dz || outlet.description_dz || outlet.note_dz} />
            </p>
          </div>
        </div>
      </section>

      {/* Practical Detail */}
      {(outlet.getting_there || outlet.facilities || outlet.crafts_on_site) && (
        <section className="section">
          <p className="eyebrow eyebrow--accent"><LocalizedRecordField english="Practical detail" dzongkha="ལག་ལེན་གྱི་གནས་ཚུལ" /></p>
          <h2 className="display display--sub"><LocalizedRecordField english="Before you go" dzongkha="མ་འགྱོ་བའི་ཧེ་མ" /></h2>
          <dl className="deeplist" style={{ marginTop: 22 }}>
            {outlet.getting_there && (
              <div className="deeplist__row">
                <dt className="deeplist__key"><LocalizedRecordField english="Getting there" dzongkha="འགྱོ་ཐངས" /></dt>
                <dd className="deeplist__val"><LocalizedRecordField english={outlet.getting_there} dzongkha={outlet.getting_there_dz} /></dd>
              </div>
            )}
            {outlet.facilities && (
              <div className="deeplist__row">
                <dt className="deeplist__key"><LocalizedRecordField english="Facilities" dzongkha="མཁོ་ཆས་ཚུ" /></dt>
                <dd className="deeplist__val"><LocalizedRecordField english={outlet.facilities} dzongkha={outlet.facilities_dz} /></dd>
              </div>
            )}
            {outlet.crafts_on_site && (
              <div className="deeplist__row">
                <dt className="deeplist__key"><LocalizedRecordField english="What you will find" dzongkha="འདི་ནང་ག་ཅི་ཐོབ་འོང" /></dt>
                <dd className="deeplist__val"><LocalizedRecordField english={outlet.crafts_on_site} dzongkha={outlet.crafts_on_site_dz} /></dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Other Outlets */}
      {others.length > 0 && (
        <section className="section section--last">
          <p className="eyebrow eyebrow--accent"><LocalizedRecordField english="Also" dzongkha="གཞན་ཡང" /></p>
          <h2 className="display display--sub"><LocalizedRecordField english="Other outlets & markets" dzongkha="ཚོང་ཁང་དང་ཁྲོམ་ར་གཞན" /></h2>
          <div className="grid grid--3" style={{ marginTop: 22 }}>
            {others.map((row) => (
              <Link key={row.key} className="card outlet" href={`/outlets/${row.key}`}>
                <figure className="frame frame--wide16 has-image" data-cms-img style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                  <Image
                    src={row.imageUrl || '/assets/photos/image-unavailable.svg'}
                    alt={row.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </figure>
                <div className="card__body">
                  <span className="tag" style={{ marginBottom: 4 }}>{row.type}</span>
                  <h3 className="card__title clamp-2" style={{ marginBottom: 4 }}>
                    <LocalizedRecordField english={row.name} dzongkha={row.name_dz} />
                  </h3>
                  <p className="card__meta clamp-1" style={{ marginBottom: 4 }}><LocalizedRecordField english={row.place} dzongkha={row.place_dz} /></p>
                  <p className="card__text clamp-3"><LocalizedRecordField english={row.note || row.description} dzongkha={row.note_dz || row.description_dz} /></p>
                  {row.hours && <p className="outlet__hours"><LocalizedRecordField english={row.hours} dzongkha={row.hours_dz} /></p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
