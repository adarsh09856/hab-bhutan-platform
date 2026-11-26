import { notFound, permanentRedirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { productHref } from '@/lib/product-routes';

type Props = { params: Promise<{ code: string; legacy: string[] }> };

export default async function LegacyProductPage({ params }: Props) {
  const { code, legacy } = await params;
  const sku = [code, ...legacy].join('/');
  const product = await prisma.product.findFirst({
    where: { code: { equals: sku, mode: 'insensitive' }, status: 'PUBLISHED' },
    select: { code: true, slug: true },
  });

  if (!product) notFound();
  permanentRedirect(productHref(product.code, product.slug));
}
