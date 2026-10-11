import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID, randomBytes } from 'node:crypto';
import { validateTestDatabaseUrl } from './lib/safe-test-database.mjs';

const databaseUrl = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const mode = process.argv[2];

try {
  if (mode === 'setup') {
    let role = await prisma.role.findFirst({ where: { slug: 'staff_operator', status: 'ACTIVE' } });
    if (!role) role = await prisma.role.create({ data: {
      name: 'Disposable Quick Edit role', slug: 'staff_operator', permissions: ['*', 'content:view', 'content:edit'],
    } });
    const suffix = randomUUID();
    const key = `codex-quickedit-${suffix}`;
    const email = `${key}@example.invalid`;
    const password = `Local${randomBytes(18).toString('base64url')}!`;
    const user = await prisma.user.create({ data: {
      email, name: 'Disposable Quick Edit verifier', roleId: role.id,
      passwordHash: bcrypt.hashSync(password, 10),
    } });
    try {
      await prisma.outletRecord.create({ data: {
        key, type: 'OUTLET', name: 'Disposable Quick Edit outlet', place: 'Local test only',
        description: 'Local test fixture.', longDescription: 'Local test fixture.',
        note: '<!-- HAB_IMAGE: /assets/photos/hero-2-punakha.jpg -->\n<!-- HAB_GALLERY: ["/assets/photos/hero-4-textiles.jpg","/assets/photos/hero-1-weaving.jpg"] -->',
      } });
    } catch (error) {
      await prisma.user.delete({ where: { id: user.id } });
      throw error;
    }
    console.log(JSON.stringify({ key, email, password }));
  } else if (mode === 'setup-extra') {
    const key = process.argv[3];
    if (!/^codex-quickedit-[0-9a-f-]{36}$/.test(key || '')) throw new Error('Provide the exact disposable fixture key.');
    await prisma.heroSlide.create({ data: {
      imageUrl: '/assets/photos/hero-1-weaving.jpg', caption: `Disposable hero ${key}`,
      altText: 'Disposable hero slide', sortOrder: 1, isActive: true,
    } });
    await prisma.craft.create({ data: {
      key, name: 'Test Craft', english: 'Test Craft', description: 'Disposable test craft.',
    } });
    await prisma.product.create({ data: {
      code: key.toUpperCase(), name: 'Disposable Gallery Product', craftKey: key,
      region: 'Local test only', priceUSD: 12, stock: 2, description: 'Disposable product.',
      images: [{ url: '/assets/photos/hero-1-weaving.jpg', role: 'primary' }, { url: '/assets/photos/hero-4-textiles.jpg', role: 'gallery' }],
    } });
    await prisma.customPage.create({ data: {
      slug: key, title: 'Disposable Gallery Page', content: '<p>Local test only.</p>',
      galleryImages: [{ url: '/assets/photos/hero-1-weaving.jpg', caption: 'Photo one' }, { url: '/assets/photos/hero-4-textiles.jpg', caption: 'Photo two' }],
    } });
    console.log(`Created extra gallery fixtures for ${key}.`);
  } else if (mode === 'cleanup') {
    const key = process.argv[3];
    if (!/^codex-quickedit-[0-9a-f-]{36}$/.test(key || '')) throw new Error('Provide the exact disposable fixture key.');
    const email = `${key}@example.invalid`;
    const user = await prisma.user.findUnique({ where: { email } });
    await prisma.heroSlide.deleteMany({ where: { caption: `Disposable hero ${key}` } });
    await prisma.product.deleteMany({ where: { code: key.toUpperCase() } });
    await prisma.craft.deleteMany({ where: { key } });
    await prisma.customPage.deleteMany({ where: { slug: key } });
    await prisma.outletRecord.deleteMany({ where: { key } });
    if (user) {
      await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    const disposableRole = await prisma.role.findFirst({ where: { slug: 'staff_operator', name: 'Disposable Quick Edit role' } });
    if (disposableRole && await prisma.user.count({ where: { roleId: disposableRole.id } }) === 0) {
      await prisma.role.delete({ where: { id: disposableRole.id } });
    }
    console.log(`Removed local fixture ${key}.`);
  } else {
    throw new Error('Use setup or cleanup with an exact fixture key.');
  }
} finally {
  await prisma.$disconnect();
}
