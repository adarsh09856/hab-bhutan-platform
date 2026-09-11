import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CLIENT_DATA } from '@/lib/client-data';
import prisma from '@/lib/prisma';

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

  const post = {
    ...rawPost,
    id: rawPost.id || rawPost.slug || 'news-item',
    slug: rawPost.slug || rawPost.id,
    title: rawPost.title,
    kind: rawPost.kind || 'Programs',
    blurb: rawPost.blurb || rawPost.summary || '',
    body: rawPost.content || rawPost.body || rawPost.blurb || '',
    published_at: rawPost.dateString || rawPost.published_at || rawPost.date || 'Recent',
  };

  const otherNews = CLIENT_DATA.news
    .filter((n) => (n.slug || n.id) !== (post.slug || post.id))
    .slice(0, 3);

  const photoPool = [
    '/assets/photos/about-hab.jpg',
    '/assets/photos/hero-4-textiles.jpg',
    '/assets/photos/hero-1-weaving.jpg',
    '/assets/photos/hero-5-desho.jpg',
    '/assets/photos/hero-2-punakha.jpg',
  ];
  const postIndex = CLIENT_DATA.news.findIndex((n) => (n.slug || n.id) === (post.slug || post.id));
  const bannerImg = photoPool[postIndex % photoPool.length];

  const displayDate = post.published_at || post.date || post.created_at || 'Recent';

  return (
    <main id="main">
      <section className="section">
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

        <figure className="frame frame--banner" style={{ position: 'relative', height: 420, overflow: 'hidden', marginTop: 24 }}>
          <Image
            src={bannerImg}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
          <figcaption className="frame__caption">
            {post.title} — {post.kind}
          </figcaption>
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
            {otherNews.map((on) => (
              <article key={on.slug || on.id} className="card news">
                <div className="card__body">
                  <div className="news__meta" style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                    <span className="tag">{on.kind}</span>
                    <span className="news__date" style={{ color: 'var(--muted)', fontSize: 13 }}>
                      {on.published_at || on.date || on.created_at}
                    </span>
                  </div>
                  <h3 className="news__title clamp-2" style={{ marginBottom: 8 }}>
                    <Link href={`/news/${on.slug || on.id}`}>{on.title}</Link>
                  </h3>
                  <p className="card__text clamp-3">{on.blurb || on.summary}</p>
                  <Link className="link-accent" href={`/news/${on.slug || on.id}`} style={{ marginTop: 12, display: 'inline-block' }}>
                    Read story →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
