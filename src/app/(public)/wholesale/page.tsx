import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import WholesaleClientView from '@/components/public/WholesaleClientView';
import { resolveWholesaleOffer } from '@/lib/wholesale-offer';
import { SERVER_WHOLESALE_TERMS } from '@/lib/wholesale-terms.server';
import { normalizeProductImages } from '@/lib/product-image-fallbacks';

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
  let crafts: Array<{ key: string; name: string; english: string }> = [];
  let unavailable = false;
  try {
    [siteSettings, dbProducts, crafts] = await Promise.all([
      prisma.siteSetting.findFirst(),
      prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          AND: [
            { NOT: { code: { startsWith: 'SKU-TEST-', mode: 'insensitive' } } },
            { NOT: { name: { contains: 'Automated Test', mode: 'insensitive' } } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: { craft: true, maker: true, wholesaleTerms: true },
      }),
      prisma.craft.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { key: true, name: true, english: true } }),
    ]);
  } catch { unavailable = true; }

  const legacyTerms = { ...SERVER_WHOLESALE_TERMS, ...((siteSettings?.wholesaleTerms as Record<string, any> | null) || {}) };
  const eligibleProducts = dbProducts.filter((product) => resolveWholesaleOffer(product.wholesaleTerms, legacyTerms[product.code]));
  const craftCounts = Object.fromEntries(crafts.map((craft) => [craft.key, eligibleProducts.filter((product) => product.craftKey === craft.key).length]));
  const previewProducts = eligibleProducts.slice(0, 8).map((p) => ({
        code: p.code,
        name: p.name,
        craft_key: p.craftKey,
        craft_name: p.craft?.name || p.craftKey,
        maker: p.maker?.name || '',
        region: p.region || p.maker?.dzongkhag || '',
        image_path: normalizeProductImages(p.code, p.craftKey, p.images).imageUrl,
      }));

  return (
    <WholesaleClientView
      initialSettings={siteSettings}
      craftCounts={craftCounts}
      crafts={crafts}
      unavailable={unavailable}
      initialProducts={previewProducts}
      flowSteps={FLOW_STEPS}
    />
  );
}
