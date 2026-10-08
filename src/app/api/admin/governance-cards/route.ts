import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { STRATEGIC_PILLARS, MANDATE_ARTICLES, ETHICS_STANDARDS } from '@/lib/governance-page-defaults';

export const dynamic = 'force-dynamic';
const sections = ['strategic', 'mandate', 'ethics'] as const;
type Section = typeof sections[number];
const isSection = (value: unknown): value is Section => typeof value === 'string' && sections.includes(value as Section);
const error = (message: string, status: number) => NextResponse.json({ success: false, error: message }, { status });

function defaultRows(section: Section) {
  return section === 'strategic'
    ? STRATEGIC_PILLARS.map((item, idx) => ({ id: `default-strategic-${idx}`, section, number: item.num, title: item.title, body: item.desc, metric: item.metric, sortOrder: idx, isActive: true }))
    : section === 'mandate'
      ? MANDATE_ARTICLES.map((item, idx) => ({ id: `default-mandate-${idx}`, section, number: item.num, title: item.title, body: item.body, tags: item.tags.join('\n'), sortOrder: idx, isActive: true }))
      : ETHICS_STANDARDS.map((item, idx) => ({ id: `default-ethics-${idx}`, section, title: item.title, body: item.body, iconKey: item.iconKey, sortOrder: idx, isActive: true }));
}

async function ensureDefaults(section: Section) {
  const count = await prisma.governancePageCard.count({ where: { section } });
  if (count) return;
  await prisma.governancePageCard.createMany({ data: defaultRows(section), skipDuplicates: true });
}

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');
    const section = req.nextUrl.searchParams.get('section');
    if (!isSection(section)) return error('Valid governance section required.', 400);
    const records = await prisma.governancePageCard.findMany({ where: { section }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
    return NextResponse.json({ success: true, records: records.length ? records : defaultRows(section) });
  } catch (err: any) { return error(err?.message || 'Unable to load cards.', err?.statusCode || 500); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'content:edit');
    const data = await req.json();
    if (!isSection(data.section)) return error('Valid governance section required.', 400);
    if (!String(data.title || '').trim()) return error('Title is required.', 400);
    await ensureDefaults(data.section);
    const record = await prisma.governancePageCard.create({ data: {
      section: data.section, number: String(data.number || '').trim() || null, title: String(data.title).trim().slice(0, 250),
      body: String(data.body || '').slice(0, 20000), titleDz: String(data.titleDz || '').trim() || null,
      bodyDz: String(data.bodyDz || '').slice(0, 20000) || null, metric: String(data.metric || '').trim() || null,
      metricDz: String(data.metricDz || '').trim() || null, tags: String(data.tags || '').trim() || null,
      tagsDz: String(data.tagsDz || '').slice(0, 20000) || null, iconKey: String(data.iconKey || '').trim() || null,
      sortOrder: Number.isFinite(Number(data.sortOrder)) ? Number(data.sortOrder) : 0, isActive: data.isActive !== false,
    } });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'GOVERNANCE_CARD_CREATED', entityType: 'GovernancePageCard', entityId: record.id, details: { section: record.section } });
    return NextResponse.json({ success: true, record });
  } catch (err: any) { return error(err?.message || 'Unable to create card.', err?.statusCode || 500); }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'content:edit');
    const data = await req.json();
    if (!isSection(data.section) || typeof data.id !== 'string') return error('Section and card ID required.', 400);
    await ensureDefaults(data.section);
    const existing = await prisma.governancePageCard.findUnique({ where: { id: data.id } });
    if (!existing || existing.section !== data.section) return error('Card not found in this section.', 404);
    if (data.title !== undefined && !String(data.title).trim()) return error('Title is required.', 400);
    const record = await prisma.governancePageCard.update({ where: { id: data.id }, data: {
      number: data.number === undefined ? undefined : String(data.number).trim() || null,
      title: data.title === undefined ? undefined : String(data.title).trim().slice(0, 250),
      body: data.body === undefined ? undefined : String(data.body).slice(0, 20000),
      titleDz: data.titleDz === undefined ? undefined : String(data.titleDz).trim() || null,
      bodyDz: data.bodyDz === undefined ? undefined : String(data.bodyDz).slice(0, 20000) || null,
      metric: data.metric === undefined ? undefined : String(data.metric).trim() || null,
      metricDz: data.metricDz === undefined ? undefined : String(data.metricDz).trim() || null,
      tags: data.tags === undefined ? undefined : String(data.tags).trim() || null,
      tagsDz: data.tagsDz === undefined ? undefined : String(data.tagsDz).slice(0, 20000) || null,
      iconKey: data.iconKey === undefined ? undefined : String(data.iconKey).trim() || null,
      sortOrder: Number.isFinite(Number(data.sortOrder)) ? Number(data.sortOrder) : undefined,
      isActive: typeof data.isActive === 'boolean' ? data.isActive : undefined,
    } });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'GOVERNANCE_CARD_UPDATED', entityType: 'GovernancePageCard', entityId: record.id, details: { section: record.section } });
    return NextResponse.json({ success: true, record });
  } catch (err: any) { return error(err?.message || 'Unable to update card.', err?.statusCode || 500); }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'content:edit');
    const id = req.nextUrl.searchParams.get('id');
    const section = req.nextUrl.searchParams.get('section');
    if (!id || !isSection(section)) return error('Section and card ID required.', 400);
    await ensureDefaults(section);
    const existing = await prisma.governancePageCard.findUnique({ where: { id } });
    if (!existing || existing.section !== section) return error('Card not found in this section.', 404);
    await prisma.governancePageCard.update({ where: { id }, data: { isActive: false } });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'GOVERNANCE_CARD_HIDDEN', entityType: 'GovernancePageCard', entityId: id, details: { section } });
    return NextResponse.json({ success: true });
  } catch (err: any) { return error(err?.message || 'Unable to hide card.', err?.statusCode || 500); }
}
