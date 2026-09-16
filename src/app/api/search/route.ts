import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q) {
      return NextResponse.json({
        query: '',
        total: 0,
        results: {
          products: [],
          crafts: [],
          members: [],
          news: [],
          events: [],
          programmes: [],
          projects: [],
          publications: [],
        },
      });
    }

    const lowerQ = q.toLowerCase();

    // Query Prisma in parallel
    const [
      dbProducts,
      dbCrafts,
      dbMembers,
      dbNews,
      dbEvents,
      dbProgrammes,
      dbProjects,
      dbPublications,
    ] = await Promise.all([
      prisma.product
        .findMany({
          where: {
            status: 'PUBLISHED',
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { code: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { region: { contains: q, mode: 'insensitive' } },
              { craftKey: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 20,
        })
        .catch(() => []),

      prisma.craft
        .findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { english: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { key: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 10,
        })
        .catch(() => []),

      prisma.member
        .findMany({
          where: {
            status: 'VERIFIED',
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { dzongkhag: { contains: q, mode: 'insensitive' } },
              { craftKey: { contains: q, mode: 'insensitive' } },
              { bio: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 15,
        })
        .catch(() => []),

      prisma.newsArticle
        .findMany({
          where: {
            isPublished: true,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { blurb: { contains: q, mode: 'insensitive' } },
              { kind: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 10,
        })
        .catch(() => []),

      prisma.eventRecord
        .findMany({
          where: {
            isActive: true,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { location: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { category: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 10,
        })
        .catch(() => []),

      prisma.programmePillar
        .findMany({
          where: {
            isActive: true,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { ref: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 10,
        })
        .catch(() => []),

      prisma.projectRecord
        .findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { partner: { contains: q, mode: 'insensitive' } },
              { summary: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 10,
        })
        .catch(() => []),

      prisma.publication
        .findMany({
          where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { kind: { contains: q, mode: 'insensitive' } },
              { metaDetails: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 10,
        })
        .catch(() => []),
    ]);

    // Format products
    const products = (dbProducts.length > 0
      ? dbProducts
      : (CLIENT_DATA.products || []).filter(
          (p: any) =>
            p.name?.toLowerCase().includes(lowerQ) ||
            p.code?.toLowerCase().includes(lowerQ) ||
            p.craft_name?.toLowerCase().includes(lowerQ)
        )
    ).map((p: any) => {
      const img = Array.isArray(p.images) ? p.images[0]?.url : p.image_path || '/assets/photos/product-hhb01.jpg';
      return {
        id: p.id || p.code,
        title: p.name,
        subtitle: `SKU: ${p.code} · $${p.priceUSD || p.price_usd || 0}`,
        description: p.description || '',
        url: `/shop/${(p.code || '').toLowerCase()}`,
        imageUrl: img,
        category: 'Product',
        badge: p.region || 'Bhutan',
      };
    });

    // Format crafts
    const crafts = (dbCrafts.length > 0
      ? dbCrafts
      : (CLIENT_DATA.crafts || []).filter(
          (c: any) =>
            c.name?.toLowerCase().includes(lowerQ) ||
            c.english?.toLowerCase().includes(lowerQ)
        )
    ).map((c: any) => ({
      id: c.id || c.key,
      title: `${c.name} (${c.english})`,
      subtitle: 'The 13 Traditional Arts of Bhutan',
      description: c.description || '',
      url: `/crafts/${c.key}`,
      imageUrl: c.bannerUrl || `/assets/photos/craft-${c.key}.jpg`,
      category: 'Craft Tradition',
      badge: c.key?.toUpperCase(),
    }));

    // Format members
    const members = (dbMembers.length > 0
      ? dbMembers
      : (CLIENT_DATA.members || []).filter(
          (m: any) =>
            m.name?.toLowerCase().includes(lowerQ) ||
            m.dzongkhag?.toLowerCase().includes(lowerQ)
        )
    ).map((m: any) => ({
      id: m.id || m.regNumber,
      title: m.name,
      subtitle: `${m.dzongkhag} · Reg: ${m.regNumber || 'Verified'}`,
      description: m.bio || '',
      url: `/members?q=${encodeURIComponent(m.name)}`,
      imageUrl: m.portraitUrl || '/assets/photos/artisan-default.jpg',
      category: 'Artisan Member',
      badge: m.tier ? m.tier.replace(/_/g, ' ') : 'VERIFIED',
    }));

    // Format news
    const news = (dbNews.length > 0
      ? dbNews
      : (CLIENT_DATA.news || []).filter(
          (n: any) =>
            n.title?.toLowerCase().includes(lowerQ) ||
            n.blurb?.toLowerCase().includes(lowerQ)
        )
    ).map((n: any) => ({
      id: n.id || n.title,
      title: n.title,
      subtitle: `${n.kind || 'Press'} · ${n.dateString || ''}`,
      description: n.blurb || '',
      url: `/news#${n.slug || n.id}`,
      imageUrl: n.imageUrl || '/assets/photos/news-default.jpg',
      category: 'News & Press',
      badge: n.kind || 'NEWS',
    }));

    // Format events
    const events = dbEvents.map((e: any) => ({
      id: e.id,
      title: e.title,
      subtitle: `${e.dateDisplay || ''} · ${e.location}`,
      description: e.description || '',
      url: `/events#${e.key}`,
      imageUrl: e.posterUrl || '',
      category: 'Event & Expo',
      badge: e.category || 'EVENT',
    }));

    // Format programmes
    const programmes = dbProgrammes.map((p: any) => ({
      id: p.id,
      title: `${p.ref ? `Pillar ${p.ref}: ` : ''}${p.title}`,
      subtitle: 'Statutory Handicrafts Mandate',
      description: p.description || '',
      url: `/programmes#${p.ref || ''}`,
      imageUrl: p.bannerUrl || '',
      category: 'Programme',
      badge: 'MANDATE',
    }));

    // Format projects
    const projects = dbProjects.map((p: any) => ({
      id: p.id,
      title: p.name,
      subtitle: `Partner: ${p.partner} · ${p.period || ''}`,
      description: p.summary || '',
      url: `/projects#${p.id}`,
      imageUrl: p.coverUrl || '',
      category: 'Donor Project',
      badge: p.status === 'current' ? 'ACTIVE' : 'COMPLETED',
    }));

    // Format publications
    const publications = dbPublications.map((p: any) => ({
      id: p.id,
      title: p.title,
      subtitle: `${p.kind} · ${p.metaDetails || 'PDF'}`,
      description: p.metaDetails || '',
      url: p.fileUrl || '/publications',
      imageUrl: '',
      category: 'Publication',
      badge: p.year ? String(p.year) : 'REPORT',
    }));

    const total =
      products.length +
      crafts.length +
      members.length +
      news.length +
      events.length +
      programmes.length +
      projects.length +
      publications.length;

    return NextResponse.json({
      query: q,
      total,
      results: {
        products,
        crafts,
        members,
        news,
        events,
        programmes,
        projects,
        publications,
      },
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process search query' },
      { status: 500 }
    );
  }
}
