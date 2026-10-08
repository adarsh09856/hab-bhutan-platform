import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import CustomPageClientView from '@/components/public/CustomPageClientView';
import { canPreviewDraftPage } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

interface CustomPageRouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CustomPageRouteProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  if (!slug) return { title: 'Page Not Found · HAB' };

  try {
    const page = await prisma.customPage.findUnique({
      where: { slug: slug.toLowerCase().trim() },
    });

    if (!page || (!page.isPublished && !await canPreviewDraftPage((await cookies()).get('hab_session')?.value))) {
      return { title: 'Page Not Found · HAB' };
    }

    return {
      title: page.seoTitle || `${page.title} · Handicrafts Association of Bhutan`,
      description: page.seoDescription || page.excerpt || 'Handicrafts Association of Bhutan official page.',
      keywords: page.seoKeywords ? page.seoKeywords.split(',').map((k) => k.trim()) : undefined,
      openGraph: {
        title: page.seoTitle || page.title,
        description: page.seoDescription || page.excerpt || undefined,
        images: page.bannerUrl ? [{ url: page.bannerUrl }] : undefined,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: page.seoTitle || page.title,
        description: page.seoDescription || page.excerpt || undefined,
        images: page.bannerUrl ? [page.bannerUrl] : undefined,
      },
    };
  } catch {
    return { title: 'Handicrafts Association of Bhutan' };
  }
}

export default async function CustomPageRoute({ params }: CustomPageRouteProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  if (!slug) {
    notFound();
  }

  let page = null;
  try {
    page = await prisma.customPage.findUnique({
      where: { slug: slug.toLowerCase().trim() },
    });
  } catch (err) {
    console.error('Error querying custom page:', err);
  }

  if (!page) {
    notFound();
  }

  // Drafts are visible only to active staff with content viewing permission.
  if (!page.isPublished) {
    const cookieStore = await cookies();
    if (!await canPreviewDraftPage(cookieStore.get('hab_session')?.value)) {
      notFound();
    }
  }

  const pageData = {
    id: page.id,
    slug: page.slug,
    title: page.title,
    category: page.category,
    subCategory: page.subCategory || null,
    excerpt: page.excerpt,
    content: page.content,
    bannerUrl: page.bannerUrl,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    isPublished: page.isPublished,
    showInHeaderNav: page.showInHeaderNav,
    showInFooterNav: page.showInFooterNav,
  };

  return <CustomPageClientView initialPage={pageData} />;
}
