import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { SignJWT } from 'jose';
import { requireTestDatabaseUrl } from './lib/safe-test-database.mjs';

nextEnv.loadEnvConfig(process.cwd(), true);
const databaseUrl = requireTestDatabaseUrl();
const baseUrl = process.env.QUICK_EDIT_TEST_URL || 'http://127.0.0.1:3037';
if (!['127.0.0.1', 'localhost', '::1'].includes(new URL(baseUrl).hostname)) {
  throw new Error('Safety stop: News cover verification requires a loopback app URL.');
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('Local JWT_SECRET is required.');

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const suffix = randomUUID();
const original = '/assets/photos/hero-1-weaving.jpg';
const replacement = '/assets/photos/hero-4-textiles.jpg';
const bodyText = `Local-only news cover test ${suffix}`;
let role;
let user;
let article;

function assert(value, message) {
  if (!value) throw new Error(message);
}

try {
  role = await prisma.role.create({ data: {
    name: 'Disposable News cover verifier',
    slug: `news_cover_test_${suffix.replaceAll('-', '_')}`,
    permissions: ['content:view', 'content:edit'],
  } });
  user = await prisma.user.create({ data: {
    email: `news-cover-${suffix}@example.invalid`, name: 'Disposable News cover verifier',
    passwordHash: 'not-used', roleId: role.id,
  } });
  article = await prisma.newsArticle.create({ data: {
    slug: `news-cover-test-${suffix}`, kind: 'Announcement', title: `Disposable News cover ${suffix}`,
    dateString: '13 Oct 2026', blurb: 'Local-only Quick Edit test.', content: `Body remains. ${bodyText}`,
    imageUrl: original, isPublished: true,
  } });

  const permissions = ['content:view', 'content:edit'];
  const token = await new SignJWT({ user: {
    id: user.id, userId: user.id, email: user.email, name: user.name,
    roleId: role.id, role: role.slug, roleSlug: role.slug,
    roleVersion: role.version, roleStatus: role.status, permissions,
    sessionVersion: user.sessionVersion, mustChangePassword: false,
  } }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const publicNews = async () => {
    const response = await fetch(`${baseUrl}/api/news`, { cache: 'no-store' });
    assert(response.ok, `Public News API returned ${response.status}.`);
    const { articles } = await response.json();
    return articles.find(item => item.id === article.id);
  };
  assert((await publicNews())?.image_path === original, 'Original cover is not present in the public News API.');

  const denied = await fetch(`${baseUrl}/api/admin/content`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'NEWS', id: article.id, image_path: replacement }),
  });
  assert(denied.status === 401 || denied.status === 403, 'Anonymous cover update was not denied.');
  assert((await publicNews())?.image_path === original, 'Anonymous update changed the News cover.');

  const savedResponse = await fetch(`${baseUrl}/api/admin/content`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: `hab_session=${token}` },
    body: JSON.stringify({ type: 'NEWS', id: article.id, image_path: replacement }),
  });
  const saved = await savedResponse.json();
  assert(savedResponse.ok && saved.success, `Authorized cover update failed: ${saved.error || savedResponse.status}.`);
  const stored = await prisma.newsArticle.findUniqueOrThrow({ where: { id: article.id } });
  assert(stored.imageUrl === replacement, 'Admin News imageUrl did not persist the replacement.');
  assert(stored.content?.includes(`<!-- HAB_COVER_IMAGE: ${replacement} -->`), 'Admin News cover marker was not updated.');
  assert(stored.content?.includes(bodyText), 'Updating the cover erased the News article body.');
  const publicItem = await publicNews();
  assert(publicItem?.image_path === replacement, 'Public News API did not reflect the new cover.');

  const adminResponse = await fetch(`${baseUrl}/api/admin/content`, {
    headers: { Cookie: `hab_session=${token}` }, cache: 'no-store',
  });
  const admin = await adminResponse.json();
  const adminItem = admin.news?.find(item => item.id === article.id);
  assert(adminResponse.ok && adminItem?.image_path === replacement, 'Admin News read did not return the saved cover.');
  assert(adminItem.content?.includes(bodyText), 'Admin News read did not preserve article text.');

  const pageResponse = await fetch(`${baseUrl}/news/${article.slug}`, { cache: 'no-store' });
  const html = await pageResponse.text();
  assert(pageResponse.ok && html.includes('data-hab-gallery="news"'), 'News article cover is not linked to Quick Edit.');
  assert(html.includes(`data-hab-gallery-id="${article.id}"`), 'News article cover lacks its Admin record ID.');
  assert(html.includes(replacement), 'News article page did not render the saved cover.');
  console.log('PASS: anonymous cover update denied; authorized Quick Edit API save persisted to Admin, preserved article text, and appeared in the public News API and article page.');
} finally {
  if (article) await prisma.newsArticle.deleteMany({ where: { id: article.id } });
  if (user) {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
  }
  if (role) await prisma.role.deleteMany({ where: { id: role.id } });
  await prisma.$disconnect();
}
