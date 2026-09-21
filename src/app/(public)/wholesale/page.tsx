import type { Metadata } from 'next';
import { CLIENT_DATA, getCountsByCraft } from '@/lib/client-data';
import prisma from '@/lib/prisma';
import WholesaleClientView from '@/components/public/WholesaleClientView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Wholesale & Bulk Orders · Handicrafts Association of Bhutan',
  description: 'Trade pricing, minimum order quantities and made-to-order Bhutanese handicraft for retailers, hotels, designers and distributors.',
};

const FLOW_STEPS = [
  { title: 'Browse', desc: 'Category, then product. The catalogue is the same one the retail shop uses.' },
  { title: 'Quantity', desc: 'Set quantities against the MOQ. Tier pricing applies automatically.' },
  { title: 'Quote basket', desc: 'Collect several products into one basket rather than checking out.' },
  { title: 'HAB review', desc: 'The trade desk confirms availability with the producing members.' },
  { title: 'Quotation', desc: 'Formal quote with freight, lead time and payment terms.' },
  { title: 'Order & tracking', desc: 'Production, quality control in Thimphu, then shipment with tracking.' },
];

export default async function WholesalePage() {
  let siteSettings: any = null;
  let dbProducts: any[] = [];
  try {
    siteSettings = await prisma.siteSetting.findFirst();
    dbProducts = await prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { craft: true, maker: true },
    });
  } catch {}

  const craftCounts = getCountsByCraft();
  const previewProducts = dbProducts.length > 0
    ? dbProducts.map((p) => ({
        code: p.code,
        name: p.name,
        craft_key: p.craft?.key || p.craftKey || 'thagzo',
        craft_name: p.craft?.name ? `${p.craft.name} · ${p.craft.english}` : 'Zorig Chusum',
        maker: p.maker?.name || 'Master Artisan',
        region: p.region || 'Bhutan',
        image_path: (p.images as any)?.[0]?.url || '/assets/photos/product-sad03.jpg',
      }))
    : CLIENT_DATA.products.slice(0, 8);

  return (
    <WholesaleClientView
      initialSettings={siteSettings}
      craftCounts={craftCounts}
      initialProducts={previewProducts}
      flowSteps={FLOW_STEPS}
    />
  );
}
