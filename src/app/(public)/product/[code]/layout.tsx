import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { normalizeProductImages } from '@/lib/product-image-fallbacks';

const SITE_URL = 'https://hab.touratbhutan.info';
type Props = { children: React.ReactNode; params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code: routeCode } = await params;
  const identifier = routeCode || '';
  let decodedCode = identifier;
  try { decodedCode = decodeURIComponent(identifier); } catch { /* Invalid route gets the generic not-found metadata. */ }
  const product = await prisma.product.findFirst({
    where: { slug: { equals: identifier, mode: 'insensitive' }, status: 'PUBLISHED' },
    select: { code: true, slug: true, name: true, description: true, craftKey: true, images: true },
  }).catch(() => null) || await prisma.product.findFirst({
    where: { code: { equals: decodedCode, mode: 'insensitive' }, status: 'PUBLISHED' },
    select: { code: true, slug: true, name: true, description: true, craftKey: true, images: true },
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
  const canonicalUrl = `${SITE_URL}/product/${encodeURIComponent(product.slug)}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { type: 'website', url: canonicalUrl, title, description, images: [{ url: imageUrl, alt: product.name }] },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  };
}

export default async function ProductMetadataLayout({ children, params }: Props) {
  const { code: routeCode } = await params;
  const identifier = routeCode || '';
  let decodedCode = identifier;
  try { decodedCode = decodeURIComponent(identifier); } catch { /* Leave malformed legacy URLs to the not-found UI. */ }
  const product = await prisma.product.findFirst({
    where: { slug: { equals: identifier, mode: 'insensitive' } },
    select: { code: true, slug: true, status: true },
  }).catch(() => null) || await prisma.product.findFirst({
    where: { code: { equals: decodedCode, mode: 'insensitive' } },
    select: { code: true, slug: true, status: true },
  }).catch(() => null);

  if (product?.status === 'PUBLISHED' && product.slug.toLowerCase() !== identifier.toLowerCase()) {
    redirect(`/product/${encodeURIComponent(product.slug)}`);
  }
  return children;
}
