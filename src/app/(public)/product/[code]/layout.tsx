import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { normalizeProductImages } from '@/lib/product-image-fallbacks';

const SITE_URL = 'https://hab.touratbhutan.info';
type Props = { children: React.ReactNode; params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code: routeCode } = await params;
  let code = routeCode || '';
  try { code = decodeURIComponent(code); } catch { /* Invalid route gets the generic not-found metadata. */ }
  const product = await prisma.product.findFirst({
    where: { code: { equals: code, mode: 'insensitive' }, status: 'PUBLISHED' },
    select: { code: true, name: true, description: true, craftKey: true, images: true },
  }).catch(() => null);

  if (!product) return { title: 'Handcrafted product · HAB', description: 'Shop authentic Bhutanese handicrafts from HAB-accredited makers.' };

  const description = String(product.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200) || `Authentic ${product.craftKey} handicraft from Bhutan, curated by the Handicrafts Association of Bhutan.`;
  const image = normalizeProductImages(product.code, product.craftKey, product.images).imageUrl;
  const imageUrl = image.startsWith('http') ? image : new URL(image, SITE_URL).toString();
  const title = `${product.name} · HAB Handicrafts`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: `${SITE_URL}/product/${encodeURIComponent(product.code)}` },
    openGraph: { type: 'website', url: `${SITE_URL}/product/${encodeURIComponent(product.code)}`, title, description, images: [{ url: imageUrl, alt: product.name }] },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  };
}

export default function ProductMetadataLayout({ children }: Props) {
  return children;
}
