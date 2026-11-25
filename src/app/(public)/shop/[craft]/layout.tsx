import type { Metadata } from 'next';
import prisma from '@/lib/prisma';

type Props = { children: React.ReactNode; params: Promise<{ craft: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { craft: key } = await params;
  if (!key || key === 'all') {
    return {
      title: 'All Bhutanese Handicrafts · HAB Shop',
      description: 'Browse the full HAB catalogue of authentic Bhutanese handicrafts.',
    };
  }

  const craft = await prisma.craft.findFirst({
    where: { key },
    select: { name: true, english: true },
  }).catch(() => null);
  const craftName = craft ? `${craft.name} · ${craft.english}` : key.replace(/[-_]+/g, ' ');
  return {
    title: `${craftName} Handicrafts · HAB Shop`,
    description: `Browse ${craftName} handicrafts from HAB-accredited makers in Bhutan.`,
  };
}

export default function CraftShopLayout({ children }: Props) {
  return children;
}
