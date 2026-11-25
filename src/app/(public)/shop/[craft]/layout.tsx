import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { publicPageMetadata } from '@/lib/public-metadata';

type Props = { children: React.ReactNode; params: Promise<{ craft: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { craft: key } = await params;
  if (!key || key === 'all') {
    return publicPageMetadata('/shop/all', 'All Bhutanese Handicrafts', 'Browse the full HAB catalogue of authentic Bhutanese handicrafts.');
  }

  const craft = await prisma.craft.findFirst({
    where: { key },
    select: { name: true, english: true },
  }).catch(() => null);
  const craftName = craft ? `${craft.name} · ${craft.english}` : key.replace(/[-_]+/g, ' ');
  return publicPageMetadata(`/shop/${encodeURIComponent(key)}`, `${craftName} Handicrafts`, `Browse ${craftName} handicrafts from HAB-accredited makers in Bhutan.`);
}

export default function CraftShopLayout({ children }: Props) {
  return children;
}
