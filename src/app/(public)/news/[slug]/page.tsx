import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CLIENT_DATA } from '@/lib/client-data';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export const dynamic = 'force-dynamic';

interface NewsPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NewsPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  let dbPost: any = null;
  try {
    dbPost = await prisma.newsArticle.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
    });
  } catch {}
  const post = dbPost || CLIENT_DATA.news.find((n) => n.slug === slug || n.id === slug);
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
      where: { OR: [{ slug }, { id: slug }] },
    });
  } catch {}

  const fallback = CLIENT_DATA.news.find((n) => n.slug === slug || n.id === slug);
  const rawPost = dbPost || fallback;

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
    kind: rawPost.kind || 'Programs',
    blurb: rawPost.blurb || rawPost.summary || '',
    body: cleanContent,
    image_path,
    published_at: rawPost.dateString || rawPost.published_at || rawPost.date || 'Recent',
  };

  const otherNews = CLIENT_DATA.news
    .filter((n) => (n.slug || n.id) !== (post.slug || post.id))
    .slice(0, 3);

  const NEWS_PHOTO_MAP: Record<string, string> = {
    'trade-facilitation-desk-autumn': '/assets/photos/hero-2-punakha.jpg',
    'natural-dye-training-lhuentse': '/assets/photos/hero-1-weaving.jpg',
    'craft-bazaar-clock-tower': '/assets/photos/hero-4-textiles.jpg',
    'annual-report-2025': '/assets/photos/hero-5-desho.jpg',
    'product-innovation-lab': '/assets/photos/hero-3-clay.jpg',
  };

  const photoPool = [
    '/assets/photos/about-hab.jpg',
    '/assets/photos/hero-4-textiles.jpg',
    '/assets/photos/hero-1-weaving.jpg',
    '/assets/photos/hero-5-desho.jpg',
    '/assets/photos/hero-2-punakha.jpg',
    '/assets/photos/hero-3-clay.jpg',
  ];
  const postIndex = CLIENT_DATA.news.findIndex((n) => (n.slug || n.id) === (post.slug || post.id));
  const bannerImg = post.image_path || NEWS_PHOTO_MAP[post.slug || post.id] || photoPool[postIndex >= 0 ? postIndex % photoPool.length : 0];

  const displayDate = post.published_at || post.date || post.created_at || 'Recent';

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
          <Link href="/">Home</Link> / <Link href="/news">News &amp; events</Link> / {post.title}
        </p>

        <div className="detailhero">
          <p className="eyebrow eyebrow--accent">
            {post.kind} · {displayDate}
          </p>
          <h1 className="display display--page">{post.title}</h1>
          <p className="lede lede--wide">{post.blurb || post.summary}</p>
        </div>

        <figure className="frame frame--banner has-image" data-cms-img style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Image
            src={bannerImg}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </figure>
      </section>

      {/* Full Story */}
      <section className="section">
        <div className="longread">
          <div>
            <p className="eyebrow eyebrow--accent">The story</p>
          </div>
          <div>
            {(post.body || post.blurb || '').split('\n\n').map((para: string, i: number) => (
              <p key={i} className="longread__body" style={{ marginBottom: 20 }}>
                {para.trim()}
              </p>
            ))}
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
            {otherNews.map((on, idx) => {
              const slugKey = on.slug || on.id || '';
              const cardImg = (on as any).image_path || (on as any).imageUrl || (on as any).image_url || (slugKey ? NEWS_PHOTO_MAP[slugKey] : undefined) || photoPool[idx % photoPool.length];

              return (
                <Link key={on.slug || on.id} className="card news" href={`/news/${on.slug || on.id}`}>
                  <figure className="frame frame--wide16 has-image" data-cms-img style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                    <Image
                      src={cardImg}
                      alt={on.title}
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
