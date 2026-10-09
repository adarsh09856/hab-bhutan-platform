import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import assert from 'node:assert/strict';
import { SignJWT } from 'jose';

nextEnv.loadEnvConfig(process.cwd(), true);
const base = process.env.POLICY_TEST_URL || 'http://127.0.0.1:3039';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
assert(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));
const prisma = new PrismaClient();
let fixture;
try {
  assert(process.env.JWT_SECRET?.length >= 32);
  const token = await new SignJWT({ user: {
    id: 'local-policy-verification', roleSlug: 'super_admin', role: 'super_admin', permissions: ['*'], sessionVersion: 1,
  }}).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m').sign(new TextEncoder().encode(process.env.JWT_SECRET));
  const request = (method, data) => fetch(`${base}/api/admin/policies`, { method, headers: { Cookie: `hab_session=${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const create = await request('POST', {
    slug: `local-policy-verification-${Date.now()}`, title: 'Local policy verification', isActive: true,
    content: '## Saved heading\nSaved paragraph.\n- One item\n## Saved heading\nSecond paragraph.',
  });
  const createData = await create.json();
  assert.equal(create.status, 201, JSON.stringify(createData));
  fixture = createData.policy;
  assert.equal((await fetch(`${base}/api/admin/policies`)).status, 401);
  assert.equal((await request('PATCH', { slug: fixture.slug, title: null, content: [] })).status, 400);
  const inspect = async () => {
    const response = await fetch(`${base}/policies/${fixture.slug}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    const nav = html.match(/<nav\b[^>]*class="policy__nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert(nav, 'Saved policy must provide its navigation.');
    const anchors = [...nav.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
    assert.equal(anchors.length, 2);
    assert.equal(new Set(anchors).size, 2);
    for (const anchor of anchors) assert(html.includes(`id="${anchor}"`));
    return html;
  };
  const markdown = await inspect();
  assert(markdown.includes('<li>One item</li>'));
  const update = await request('PATCH', { slug: fixture.slug, title: fixture.title,
    content: '<h2>Rich heading</h2><p><strong>Saved formatted paragraph</strong></p><h2>Rich heading</h2><p>Changed content.</p><script>window.POLICY_UNSAFE=true</script>',
  });
  assert.equal(update.status, 200);
  const rich = await inspect();
  assert(rich.includes('<strong>Saved formatted paragraph</strong>'));
  // Next embeds the original server data in its escaped RSC payload; inspect the rendered body only.
  const body = rich.match(/<div class="policy__body">([\s\S]*?)<\/main>/)?.[1] || '';
  assert(!body.includes('<script>window.POLICY_UNSAFE'));
  assert(!body.includes('<h2 id="saved-heading"'));
  const listing = await fetch(`${base}/api/admin/policies`, { headers: { Cookie: `hab_session=${token}` } });
  assert((await listing.json()).policies.some(policy => policy.slug === fixture.slug));
  const remove = await fetch(`${base}/api/admin/policies?slug=${fixture.slug}`, { method: 'DELETE', headers: { Cookie: `hab_session=${token}` } });
  assert.equal(remove.status, 200);
  assert.equal(await prisma.policyPage.count({ where: { id: fixture.id } }), 0);
  fixture = null;
  console.log('PASS: local policy Admin API CRUD/validation/privacy and saved Markdown/rich HTML render with matching navigation anchors.');
} finally {
  if (fixture) await prisma.policyPage.delete({ where: { id: fixture.id } });
  await prisma.$disconnect();
}
