import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { normalizeProductImages } from '@/lib/product-image-fallbacks';
import { isPublicCatalogProduct } from '@/lib/public-catalog-visibility';
import { PUBLIC_PRODUCT_MAKER_SELECT, toPublicProductMaker } from '@/lib/public-product-maker';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: rawCode } = await params;
    const code = rawCode?.toUpperCase();

    const product = await prisma.product.findFirst({
      where: {
        code: { equals: code, mode: 'insensitive' },
      },
      include: {
        craft: true,
        maker: {
          select: PUBLIC_PRODUCT_MAKER_SELECT,
        },
      },
    });

    if (product && !isPublicCatalogProduct(product)) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product) {
      // Also fetch 4 related products from the same craft
      const related = await prisma.product.findMany({
        where: {
          craftKey: product.craftKey,
          code: { not: product.code },
          status: 'PUBLISHED',
        },
        include: { maker: { select: { name: true } } },
        take: 12,
      });

      const normalizedImages = normalizeProductImages(product.code, product.craftKey, product.images);
      const img = normalizedImages.imageUrl;
      const resolvedGallery = normalizedImages.images.map((image) => image.url);

      return NextResponse.json({
        success: true,
        product: {
          ...product,
          maker: toPublicProductMaker(product.maker),
          image_path: img,
          imageUrl: img,
          images: normalizedImages.images,
          gallery: resolvedGallery,
        },
        related: related
          .filter(isPublicCatalogProduct)
          .slice(0, 4)
          .map((item) => {
          const images = normalizeProductImages(item.code, item.craftKey, item.images);
          return {
            ...item,
            image_path: images.imageUrl,
            imageUrl: images.imageUrl,
            images: images.images,
          };
          }),
      });
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (err: any) {
    console.error('[products/detail] Catalogue read failed:', err);
    return NextResponse.json({ error: 'The product catalogue is temporarily unavailable.' }, { status: 503 });
  }
}
