import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { NEWS_CATEGORIES, NEWS_SUBCATEGORIES, mergeNewsOptions, normalizeNewsCategory } from '@/lib/news-categories';

export const dynamic = 'force-dynamic';

function taxonomyConfig(settings: any) {
  const stored = settings?.trustBadges?.newsTaxonomy || {};
  return {
    categories: Array.isArray(stored.categories) ? stored.categories : [],
    subCategories: Array.isArray(stored.subCategories) ? stored.subCategories : [],
    retiredCategories: Array.isArray(stored.retiredCategories) ? stored.retiredCategories : [],
    retiredSubCategories: Array.isArray(stored.retiredSubCategories) ? stored.retiredSubCategories : [],
  };
}

function options(settings: any, articles: { kind: string; subCategory: string | null }[]) {
  const stored = taxonomyConfig(settings);
  const retiredCategories = new Set(stored.retiredCategories.map((value: unknown) => String(value).toLocaleLowerCase()));
  const retiredSubCategories = new Set(stored.retiredSubCategories.map((value: unknown) => String(value).toLocaleLowerCase()));
  return {
    categories: mergeNewsOptions([...NEWS_CATEGORIES], stored.categories, articles.map((item) => normalizeNewsCategory(item.kind)))
      .filter((value) => !retiredCategories.has(value.toLocaleLowerCase())),
    subCategories: mergeNewsOptions([...NEWS_SUBCATEGORIES], stored.subCategories, articles.map((item) => item.subCategory))
      .filter((value) => !retiredSubCategories.has(value.toLocaleLowerCase())),
  };
}

function cleanName(type: 'category' | 'subCategory', value: unknown) {
  const raw = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  const name = type === 'category' ? normalizeNewsCategory(raw) : raw;
  if (!name || name.length > 80 || /[<>\u0000-\u001f]/.test(name)) throw Object.assign(new Error('Use a name of 1–80 characters without HTML or control characters.'), { statusCode: 400 });
  return name;
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
    const name = cleanName(body.type, body.name);
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
      const saved = taxonomyConfig(settings);
      const retiredKey = body.type === 'category' ? 'retiredCategories' : 'retiredSubCategories';
      const taxonomy = {
        ...saved,
        [key]: mergeNewsOptions(saved[key], [name]),
        [retiredKey]: saved[retiredKey].filter((value: unknown) => String(value || '').toLocaleLowerCase() !== name.toLocaleLowerCase()),
      };
      await tx.siteSetting.update({ where: { id: 'default' }, data: { trustBadges: { ...badges, newsTaxonomy: taxonomy } } });
      return { ...current, [key]: [...current[key], name], name, created: true };
    });
    if (result.created) await logAudit({ actorType: 'STAFF', actorId: actor.id, actorIdentifier: actor.email, action: 'NEWS_TAXONOMY_CREATED', entityType: 'NewsTaxonomy', entityId: body.type, details: { name } });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unable to add news category.' }, { status: error.statusCode || 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const actor = await requirePermission(req, 'content:edit');
    const body = await req.json();
    if (!['category', 'subCategory'].includes(body.type) || !['rename', 'retire'].includes(body.action)) {
      return NextResponse.json({ success: false, error: 'Choose a category action and category or sub-category.' }, { status: 400 });
    }
    const type = body.type as 'category' | 'subCategory';
    const oldName = cleanName(type, body.name);
    const newName = body.action === 'rename' ? cleanName(type, body.newName) : null;
    if (newName && oldName.toLocaleLowerCase() === newName.toLocaleLowerCase()) {
      return NextResponse.json({ success: false, error: 'Enter a different name to rename this option.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "SiteSetting" WHERE id = 'default' FOR UPDATE`;
      const settings = await tx.siteSetting.findUnique({ where: { id: 'default' }, select: { trustBadges: true } });
      if (!settings) throw Object.assign(new Error('Website settings are not available.'), { statusCode: 409 });
      const articles = await tx.newsArticle.findMany({ select: { kind: true, subCategory: true } });
      const current = options(settings, articles);
      const key = type === 'category' ? 'categories' : 'subCategories';
      const retiredKey = type === 'category' ? 'retiredCategories' : 'retiredSubCategories';
      const existing = current[key].find((label) => label.toLocaleLowerCase() === oldName.toLocaleLowerCase());
      if (!existing) throw Object.assign(new Error('That active option was not found. Refresh the page and try again.'), { statusCode: 404 });
      if (newName && current[key].some((label) => label.toLocaleLowerCase() === newName.toLocaleLowerCase())) {
        throw Object.assign(new Error('An option with that name already exists.'), { statusCode: 409 });
      }

      const badges = settings.trustBadges && !Array.isArray(settings.trustBadges) && typeof settings.trustBadges === 'object' ? settings.trustBadges : {};
      const saved = taxonomyConfig(settings);
      const remaining = saved[key].filter((value: unknown) => String(value || '').toLocaleLowerCase() !== existing.toLocaleLowerCase());
      const retired = mergeNewsOptions(saved[retiredKey], [existing]);
      const taxonomy = {
        ...saved,
        [key]: newName ? mergeNewsOptions(remaining, [newName]) : remaining,
        [retiredKey]: newName ? retired : mergeNewsOptions(retired, [existing]),
      };
      await tx.siteSetting.update({ where: { id: 'default' }, data: { trustBadges: { ...badges, newsTaxonomy: taxonomy } } });
      const updatedSettings = { ...settings, trustBadges: { ...badges, newsTaxonomy: taxonomy } };
      return { ...options(updatedSettings, articles), oldName: existing, newName, action: body.action };
    });

    await logAudit({
      actorType: 'STAFF', actorId: actor.id, actorIdentifier: actor.email,
      action: body.action === 'rename' ? 'NEWS_TAXONOMY_RENAMED' : 'NEWS_TAXONOMY_RETIRED',
      entityType: 'NewsTaxonomy', entityId: type,
      details: { oldName: result.oldName, newName: result.newName },
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unable to update news category.' }, { status: error.statusCode || 500 });
  }
}
