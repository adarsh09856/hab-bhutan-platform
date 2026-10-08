import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

// Use the isolated local `.env` database/config for this temporary integration test.
nextEnv.loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();
const baseUrl = 'http://127.0.0.1:3033';
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const code = `QET${Date.now().toString().slice(-9)}`;
const email = `codex-product-check-${suffix}@example.invalid`;
const roleSlug = `codex_product_check_${suffix.replace(/[^a-z0-9]/gi, '_')}`;
const permissions = ['products:view', 'products:create', 'products:edit'];
let role;
let user;
let productId;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, token, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Cookie: `hab_session=${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(`${options.method || 'GET'} ${path} failed (${response.status}): ${data.error || 'unknown error'}`);
  }
  return data;
}

try {
  const craft = await prisma.craft.findFirst({ select: { key: true } });
  assert(craft, 'Local database has no craft record for a test product.');

  role = await prisma.role.create({
    data: { name: 'Temporary product field verification', slug: roleSlug, permissions },
  });
  user = await prisma.user.create({
    data: { email, name: 'Temporary Product Verification', passwordHash: 'not-used', roleId: role.id },
  });

  const secret = process.env.JWT_SECRET;
  assert(secret && secret.length >= 32, 'Production JWT secret was not loaded for the local test.');
  const token = await new SignJWT({
    user: {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      roleId: role.id,
      role: role.slug,
      roleSlug: role.slug,
      roleVersion: role.version,
      roleStatus: role.status,
      permissions,
      sessionVersion: user.sessionVersion,
      mustChangePassword: false,
    },
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(new TextEncoder().encode(secret));

  const initial = {
    size: '25 × 18 cm (verification)',
    weight: '350 g (verification)',
    materials: 'Cotton and natural dye (verification)',
    care: 'Keep dry (verification)',
    lead: 'Ships in 3 days (verification)',
  };
  const created = await request('/api/admin/products', token, {
    method: 'POST',
    body: JSON.stringify({
      code,
      name: 'Temporary product details verification',
      priceUSD: 12,
      craftKey: craft.key,
      region: 'Local QA',
      description: 'Temporary local API verification record.',
      status: 'PUBLISHED',
      ...initial,
    }),
  });
  productId = created.product.id;
  for (const [key, value] of Object.entries(initial)) assert(created.product[key] === value, `Create did not persist ${key}.`);

  const publicResponse = await fetch(`${baseUrl}/api/products/${encodeURIComponent(code)}`, { cache: 'no-store' });
  const publicData = await publicResponse.json();
  assert(publicResponse.ok && publicData.product?.size === initial.size, 'Public read did not return the saved size.');
  assert(publicData.product?.materials === initial.materials, 'Public read did not return saved materials.');

  const changed = {
    size: '30 × 20 cm (updated)',
    weight: '420 g (updated)',
    materials: 'Silk and cotton (updated)',
    care: 'Dry clean only (updated)',
    lead: 'Made to order (updated)',
  };
  const updated = await request('/api/admin/products', token, {
    method: 'PATCH',
    body: JSON.stringify({ id: productId, ...changed }),
  });
  for (const [key, value] of Object.entries(changed)) assert(updated.product[key] === value, `Update did not persist ${key}.`);

  const listed = await request('/api/admin/products', token);
  const item = listed.products.find((product) => product.id === productId);
  assert(item?.care === changed.care && item?.lead === changed.lead, 'Admin read did not include updated fields.');
  console.log('PASS: authenticated product create, public read, update and admin list; all five detail fields round-tripped.');
} finally {
  if (productId) await prisma.product.deleteMany({ where: { id: productId } });
  if (user) {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
  }
  if (role) await prisma.role.deleteMany({ where: { id: role.id } });
  await prisma.$disconnect();
}
