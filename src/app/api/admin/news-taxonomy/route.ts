import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { NEWS_CATEGORIES, NEWS_SUBCATEGORIES, mergeNewsOptions, normalizeNewsCategory } from '@/lib/news-categories';

export const dynamic = 'force-dynamic';

function options(settings: any, articles: { kind: string; subCategory: string | null }[]) {
  const stored = settings?.trustBadges?.newsTaxonomy || {};
  return {
    categories: mergeNewsOptions([...NEWS_CATEGORIES], Array.isArray(stored.categories) ? stored.categories : [], articles.map((item) => normalizeNewsCategory(item.kind))),
    subCategories: mergeNewsOptions([...NEWS_SUBCATEGORIES], Array.isArray(stored.subCategories) ? stored.subCategories : [], articles.map((item) => item.subCategory)),
  };
}

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');
    const [settings, articles] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { id: 'default' }, select: { trustBadges: true } }),
      prisma.newsArticle.findMany({ select: { kind: true, subCategory: true } }),
    ]);
    return NextResponse.json({ success: true, ...options(settings, articles) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unable to load news categories.' }, { status: error.statusCode || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requirePermission(req, 'content:create');
    const body = await req.json();
    if (!['category', 'subCategory'].includes(body.type) || typeof body.name !== 'string') {
      return NextResponse.json({ success: false, error: 'Choose category or sub-category and enter a name.' }, { status: 400 });
    }
    const name = body.type === 'category' ? normalizeNewsCategory(body.name).replace(/\s+/g, ' ') : body.name.trim().replace(/\s+/g, ' ');
    if (!name || name.length > 80 || /[<>\u0000-\u001f]/.test(name)) {
      return NextResponse.json({ success: false, error: 'Use a name of 1–80 characters without HTML or control characters.' }, { status: 400 });
    }
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "SiteSetting" WHERE id = 'default' FOR UPDATE`;
      const settings = await tx.siteSetting.findUnique({ where: { id: 'default' }, select: { trustBadges: true } });
      if (!settings) throw Object.assign(new Error('Save the website settings before adding categories.'), { statusCode: 409 });
      const articles = await tx.newsArticle.findMany({ select: { kind: true, subCategory: true } });
      const current = options(settings, articles);
      const key = body.type === 'category' ? 'categories' : 'subCategories';
      const existing = current[key].find((label) => label.toLocaleLowerCase() === name.toLocaleLowerCase());
      if (existing) return { ...current, name: existing, created: false };
      const badges = (settings.trustBadges && !Array.isArray(settings.trustBadges) && typeof settings.trustBadges === 'object') ? settings.trustBadges : {};
      const saved: any = badges.newsTaxonomy || {};
      const taxonomy = { ...saved, [key]: mergeNewsOptions(Array.isArray(saved[key]) ? saved[key] : [], [name]) };
      await tx.siteSetting.update({ where: { id: 'default' }, data: { trustBadges: { ...badges, newsTaxonomy: taxonomy } } });
      return { ...current, [key]: [...current[key], name], name, created: true };
    });
    if (result.created) await logAudit({ actorType: 'STAFF', actorId: actor.id, actorIdentifier: actor.email, action: 'NEWS_TAXONOMY_CREATED', entityType: 'NewsTaxonomy', entityId: body.type, details: { name } });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unable to add news category.' }, { status: error.statusCode || 500 });
  }
}
