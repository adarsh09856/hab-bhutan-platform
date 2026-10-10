import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import OutletsBrowser from '@/components/public/OutletsBrowser';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Outlets, Markets & Clusters · Handicrafts Association of Bhutan',
  description: 'Physical outlets, verified markets and artisan clusters across Bhutan validated by HAB.',
};

async function getOutletsData() {
  try {
    const dbOutlets = await prisma.outletRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    const dbClusters = await prisma.clusterRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    const outlets = dbOutlets.map(o => {
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
            sort_order: o.sortOrder,
            is_featured: o.isFeatured,
            place: o.place,
            note,
            description: o.description,
            long_description: o.longDescription,
            hours: o.hours,
            stalls: o.stalls || '',
            crafts_on_site: o.craftsOnSite || '',
            payment: o.payment || '',
            getting_there: o.gettingThere || '',
            facilities: o.facilities || '',
            imageUrl,
          };
        });

    const clusters = dbClusters.map(c => {
          let visitor_note = c.visitorNote || undefined;
          let imageUrl: string | undefined = undefined;
          if (visitor_note && visitor_note.includes('<!-- HAB_IMAGE:')) {
            const match = visitor_note.match(/<!--\s*HAB_IMAGE:\s*(.*?)\s*-->/);
            if (match) {
              imageUrl = match[1].trim();
              visitor_note = visitor_note.replace(/<!--\s*HAB_IMAGE:\s*[\s\S]*?-->/g, '').trim() || undefined;
            }
          }
          return {
            key: c.key,
            name: c.name,
            craft_key: c.craftKey,
            dzongkhag: c.dzongkhag,
            members: c.members,
            established: c.established,
            is_featured: c.isFeatured,
            sort_order: c.sortOrder,
            summary: c.summary,
            story: c.story,
            visitor_note,
            imageUrl,
          };
        });

    return { outlets, clusters, unavailable: false };
  } catch {
    return { outlets: [], clusters: [], unavailable: true };
  }
}

export default async function OutletsPage() {
  const { outlets, clusters, unavailable } = await getOutletsData();
  return (
    <div className="relative">
      <SectionEditBadge label="Markets & Outlets" studioHref="/admin/clusters-outlets" sectionType="outlets" />
      <OutletsBrowser initialOutlets={outlets} clusters={clusters} unavailable={unavailable} />
    </div>
  );
}
