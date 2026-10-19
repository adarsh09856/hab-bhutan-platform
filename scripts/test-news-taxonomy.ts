import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/rbac';
import { GET, POST } from '../src/app/api/admin/news-taxonomy/route';

async function main() {
  let permissions = ['content:view', 'content:create'];
  let stored: any = { trustBadges: { unrelated: { keep: true }, newsTaxonomy: { categories: ['Saved category'], subCategories: ['Saved type'] } } };
  let writes = 0;
  const originals = { user: prisma.user.findUnique, setting: prisma.siteSetting.findUnique, articles: prisma.newsArticle.findMany, transaction: prisma.$transaction, audit: prisma.auditLog.create };
  try {
    (prisma.user as any).findUnique = async () => ({ id: 'taxonomy-test', email: 'taxonomy@example.invalid', status: 'ACTIVE', sessionVersion: 1, role: { id: 'taxonomy-role', slug: 'staff_operator', status: 'ACTIVE', version: 1, permissions } });
    (prisma.siteSetting as any).findUnique = async () => structuredClone(stored);
    (prisma.newsArticle as any).findMany = async () => [{ kind: 'Existing custom', subCategory: 'Existing type' }];
    (prisma.auditLog as any).create = async () => ({ id: 'audit-test' });
    (prisma as any).$transaction = async (run: any) => run({
      $queryRaw: async () => [{ id: 'default' }],
      siteSetting: { findUnique: prisma.siteSetting.findUnique, update: async ({ data }: any) => { stored = structuredClone(data); writes++; return stored; } },
      newsArticle: { findMany: prisma.newsArticle.findMany },
    });
    const token = await createSessionToken({ id: 'taxonomy-test', roleSlug: 'staff_operator', sessionVersion: 1 });
    const request = (body?: any) => new NextRequest('http://localhost/api/admin/news-taxonomy', { method: body ? 'POST' : 'GET', headers: { Cookie: `hab_session=${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const initial = await (await GET(request())).json();
    assert(initial.categories.includes('Vacancies') && initial.categories.includes('Saved category') && initial.categories.includes('Existing custom'));
    const result = await (await POST(request({ type: 'category', name: '  Community   Notices  ' }))).json();
    assert.equal(result.name, 'Community Notices'); assert.equal(writes, 1);
    assert.deepEqual(stored.trustBadges.unrelated, { keep: true });
    assert((await (await GET(request())).json()).categories.includes('Community Notices'), 'New options persist on reload');
    const duplicate = await (await POST(request({ type: 'category', name: 'community notices' }))).json();
    assert.equal(duplicate.name, 'Community Notices'); assert.equal(writes, 1);
    assert.equal((await POST(request({ type: 'subCategory', name: 'Recruitment Notice' }))).status, 200);
    assert((await (await GET(request())).json()).subCategories.includes('Recruitment Notice'));
    for (const body of [{ type: 'category', name: '' }, { type: 'category', name: '<script>' }, { type: 'other', name: 'Bad' }, { type: 'category', name: 'x'.repeat(81) }]) assert.equal((await POST(request(body))).status, 400);
    permissions = ['content:view'];
    assert.equal((await POST(request({ type: 'category', name: 'Denied' }))).status, 403);
    assert.equal(writes, 2);
    assert.equal((await GET(new NextRequest('http://localhost/api/admin/news-taxonomy'))).status, 401);
    console.log('PASS: saved custom categories/sub-categories, reload, duplicate handling, existing article options, validation, permissions and unrelated setting preservation. Mocked persistence only.');
  } finally {
    (prisma.user as any).findUnique = originals.user; (prisma.siteSetting as any).findUnique = originals.setting;
    (prisma.newsArticle as any).findMany = originals.articles; (prisma as any).$transaction = originals.transaction;
    (prisma.auditLog as any).create = originals.audit;
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
