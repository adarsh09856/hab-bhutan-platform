import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { referenceNewsImage } from '@/lib/reference-images';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import DocumentEmbedViewer from '@/components/public/DocumentEmbedViewer';
import LocalizedRecordField from '@/components/public/LocalizedRecordField';

export const dynamic = 'force-dynamic';

interface NewsPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NewsPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  let dbPost: any = null;
  try {
    dbPost = await prisma.newsArticle.findFirst({
      where: { OR: [{ slug }, { id: slug }], isPublished: true },
    });
  } catch {}
  const post = dbPost;
  if (!post) return { title: 'News Post Not Found' };

  return {
    title: `${post.title} · News · HAB`,
    description: post.blurb || post.summary,
  };
}

export default async function NewsPostPage({ params }: NewsPostPageProps) {
  const { slug } = await params;
  let dbPost: any = null;
  try {
    dbPost = await prisma.newsArticle.findFirst({
      where: { OR: [{ slug }, { id: slug }], isPublished: true },
    });
  } catch {}

  const rawPost = dbPost;

  if (!rawPost) {
    notFound();
  }

  let image_path = rawPost.image_path || rawPost.imageUrl || rawPost.image_url || '';
  let cleanContent = rawPost.content || rawPost.body || rawPost.blurb || '';
  if (cleanContent.includes('<!-- HAB_COVER_IMAGE:')) {
    const match = cleanContent.match(/<!-- HAB_COVER_IMAGE:\s*(.*?)\s*-->/);
    if (match) {
      image_path = match[1].trim();
      cleanContent = cleanContent.replace(/<!-- HAB_COVER_IMAGE:\s*(.*?)\s*-->\s*/, '');
    }
  }

  const post = {
    ...rawPost,
    id: rawPost.id || rawPost.slug || 'news-item',
    slug: rawPost.slug || rawPost.id,
    title: rawPost.title,
    titleDz: rawPost.titleDz,
    kind: rawPost.kind || 'Programs',
    kindDz: rawPost.kindDz,
    blurb: rawPost.blurb || rawPost.summary || '',
    blurbDz: rawPost.blurbDz,
    body: cleanContent,
    bodyDz: rawPost.contentDz,
    image_path: image_path || referenceNewsImage(rawPost.slug),
    published_at: rawPost.dateString || rawPost.published_at || rawPost.date || '',
    documentUrl: rawPost.documentUrl || rawPost.pdfUrl || null,
    documentType: rawPost.documentType || 'PDF',
    documentTitle: rawPost.documentTitle || `${rawPost.title} – Official Document`,
    subCategory: rawPost.subCategory || null,
  };

  const bannerImg = post.image_path || '/assets/photos/image-unavailable.svg';
  const otherNews = await prisma.newsArticle.findMany({
    where: { isPublished: true, id: { not: rawPost.id } },
    orderBy: { createdAt: 'desc' },
    take: 3,
  }).catch(() => []);

  const displayDate = post.published_at || post.date || post.created_at || '';

  return (
    <main id="main">
      <section className="section relative" data-hab-section="news-post">
        <SectionEditBadge label="News & Stories Studio" studioHref="/admin/content" />
        
        {/* Blueprint Backbar */}
        <div className="backbar">
          <Link className="backbar__link" href="/news">
            <span aria-hidden="true">←</span> Back to News &amp; events
          </Link>
        </div>

        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/news">News &amp; events</Link> / <LocalizedRecordField as="span" english={post.title} dzongkha={post.titleDz} />
        </p>

        <div className="detailhero">
          <p className="eyebrow eyebrow--accent">
            <LocalizedRecordField as="span" english={post.kind} dzongkha={post.kindDz} />{displayDate ? ` · ${displayDate}` : ''}
          </p>
          <LocalizedRecordField as="h1" className="display display--page" english={post.title} dzongkha={post.titleDz} />
          <LocalizedRecordField as="p" className="lede lede--wide" english={post.blurb || post.summary} dzongkha={post.blurbDz} />
        </div>

        <figure className="frame frame--banner has-image" data-cms-img style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Image
            src={bannerImg}
            alt={post.image_path ? post.title : ''}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </figure>
      </section>

      {/* Full Story */}
      <section className="section">
        <div 
          className="longread"
          style={post.documentUrl ? { gridTemplateColumns: 'minmax(330px, 0.44fr) 0.56fr', gap: '40px', alignItems: 'start' } : undefined}
        >
          <div>
            <p className="eyebrow eyebrow--accent">The story</p>
            {post.subCategory && (
              <span className="inline-block mt-2 px-2.5 py-1 rounded bg-[#EDE5D6] text-[#6B5A4C] font-mono text-xs font-semibold">
                {post.subCategory}
              </span>
            )}

            {/* Official Document (PDF / Flipbook) positioned on the left side under The Story */}
            {post.documentUrl && (
              <div className="mt-6">
                <DocumentEmbedViewer
                  documentUrl={post.documentUrl}
                  documentType={post.documentType}
                  documentTitle={post.documentTitle || `${post.title} – Official Document`}
                  className="my-0 shadow-xs"
                />
              </div>
            )}
          </div>
          <div>
            <LocalizedRecordField as="p" className="longread__body" style={{ marginBottom: 20 }} english={post.body || post.blurb} dzongkha={post.bodyDz} splitParagraphs />
          </div>
        </div>
      </section>

      {/* More Updates */}
      {otherNews.length > 0 && (
        <section className="section section--last">
          <div className="section__head">
            <div>
              <p className="eyebrow eyebrow--accent">Newsroom</p>
              <h2 className="display display--sub">More updates</h2>
            </div>
            <Link className="btn btn--ink btn--sm" href="/news">
              All news →
            </Link>
          </div>

          <div className="grid grid--3">
            {otherNews.map((on: any) => {
              const cardImg = on.imageUrl || on.image_url || on.image_path || referenceNewsImage(on.slug) || '/assets/photos/image-unavailable.svg';

              return (
                <Link key={on.slug || on.id} className="card news" href={`/news/${on.slug || on.id}`}>
                  <figure className="frame frame--wide16 has-image" data-cms-img style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                    <Image
                      src={cardImg}
                      alt={on.imageUrl || on.image_url || on.image_path ? on.title : ''}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </figure>
                  <div className="card__body">
                    <div className="news__meta" style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                      <span className="tag">{on.kind}</span>
                      <span className="news__date" style={{ color: 'var(--muted)', fontSize: 13 }}>
                        {on.published_at || on.date || on.created_at}
                      </span>
                    </div>
                    <h3 className="news__title clamp-2" style={{ marginBottom: 8 }}>
                      {on.title}
                    </h3>
                    <p className="card__text clamp-3">{on.blurb || on.summary}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
