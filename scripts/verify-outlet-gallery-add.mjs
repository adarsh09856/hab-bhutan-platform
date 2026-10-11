import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import { randomUUID } from 'node:crypto';

nextEnv.loadEnvConfig(process.cwd(), true);
const prisma = new PrismaClient();
const baseUrl = process.env.OUTLET_GALLERY_TEST_URL || 'http://127.0.0.1:3033';
const dbUrl = new URL(process.env.DATABASE_URL || '');
if (!['127.0.0.1', 'localhost', '::1'].includes(new URL(baseUrl).hostname)
  || !['127.0.0.1', 'localhost', '::1'].includes(dbUrl.hostname)
  || !/(test|tmp|verify|scratch)/i.test(dbUrl.pathname)) {
  throw new Error('Safety stop: outlet gallery verification requires a loopback app and explicitly disposable database.');
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('Local JWT_SECRET is required.');

const suffix = randomUUID();
const key = `codex-gallery-${suffix}`;
const roleSlug = `codex_outlet_gallery_${suffix.replaceAll('-', '_')}`;
const permissions = ['content:view', 'content:create', 'content:edit', 'content:delete'];
let role;
let user;
let outlet;

async function request(path, token, method = 'GET', body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Cookie: `hab_session=${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { response, body: await response.json().catch(() => ({})) };
}

try {
  role = await prisma.role.create({ data: { name: 'Temporary outlet gallery verifier', slug: roleSlug, permissions } });
  user = await prisma.user.create({
    data: { email: `codex-gallery-${suffix}@example.invalid`, name: 'Temporary outlet gallery verifier', passwordHash: 'not-used', roleId: role.id },
  });
  outlet = await prisma.outletRecord.create({
    data: {
      key, type: 'OUTLET', name: 'Temporary gallery verification outlet', place: 'Local test only',
      description: 'Temporary local test only.', longDescription: 'Temporary local test only.',
      note: '<!-- HAB_IMAGE: /assets/photos/hero-2-punakha.jpg -->\n<!-- HAB_GALLERY: ["/assets/photos/hero-1-weaving.jpg","/assets/photos/hero-4-textiles.jpg","/assets/photos/hero-3-clay.jpg"] -->',
    },
  });
  const token = await new SignJWT({ user: {
    id: user.id, userId: user.id, email: user.email, name: user.name,
    roleId: role.id, role: role.slug, roleSlug: role.slug, roleVersion: role.version,
    roleStatus: role.status, permissions, sessionVersion: user.sessionVersion, mustChangePassword: false,
  } }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const before = await request(`/api/outlets?key=${encodeURIComponent(key)}`);
  if (!before.response.ok || before.body.outlet?.galleryImages?.length !== 3) throw new Error('Fixture gallery was not visible through the public outlet API.');
  const appendUrl = '/assets/photos/about-hab.jpg';
  const saved = await request('/api/admin/outlets', token, 'PUT', {
    id: outlet.id,
    galleryImages: [...before.body.outlet.galleryImages, appendUrl],
  });
  if (!saved.response.ok || !saved.body.success) throw new Error(`Outlet gallery append failed: ${saved.body.error || saved.response.status}`);
  if (saved.body.outlet.imageUrl !== '/assets/photos/hero-2-punakha.jpg') throw new Error('Appending a gallery slide changed the existing lead image.');
  const expected = [...before.body.outlet.galleryImages, appendUrl];
  if (JSON.stringify(saved.body.outlet.galleryImages) !== JSON.stringify(expected)) throw new Error('Admin save did not preserve and append the existing photo list in order.');

  const rereadAdmin = await request('/api/admin/outlets', token);
  const adminOutlet = rereadAdmin.body.outlets?.find((row) => row.id === outlet.id);
  if (JSON.stringify(adminOutlet?.galleryImages) !== JSON.stringify(expected)) throw new Error('Admin reload did not retain the appended photo.');
  const rereadPublic = await request(`/api/outlets?key=${encodeURIComponent(key)}`);
  if (JSON.stringify(rereadPublic.body.outlet?.galleryImages) !== JSON.stringify(expected)) throw new Error('Public outlet API did not reflect the appended photo.');
  console.log('PASS: adding an outlet slide preserves the lead image and all existing gallery slides; Admin reload and public read show the appended slide in order.');
} finally {
  if (outlet) await prisma.outletRecord.deleteMany({ where: { id: outlet.id } });
  if (user) {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
  }
  if (role) await prisma.role.deleteMany({ where: { id: role.id } });
  await prisma.$disconnect();
}
