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
const permissions = ['products:view', 'products:create', 'products:edit', 'members:view', 'members:create', 'members:edit'];
let role;
let user;
let productId;
let memberId;

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
  const terms = { moq: 10, lead_time: '3 weeks', tiers: [[10, 9], [50, 7]], customisation: 'Local test only', is_active: true };
  await request('/api/admin/trade', token, { method: 'PATCH', body: JSON.stringify({ action: 'save_terms', payload: { productCode: code, terms } }) });
  const savedTerms = await prisma.wholesaleProductTerms.findUnique({ where: { productId } });
  assert(savedTerms?.isActive && savedTerms.moq === 10 && JSON.stringify(savedTerms.tiers) === JSON.stringify(terms.tiers), 'New wholesale product did not retain enabled MOQ and prices.');
  await request('/api/admin/trade', token, { method: 'PATCH', body: JSON.stringify({ action: 'save_terms', payload: { productCode: code, terms: { ...terms, is_active: false } } }) });
  const disabledTerms = await prisma.wholesaleProductTerms.findUnique({ where: { productId } });
  assert(disabledTerms?.isActive === false, 'Wholesale disable flag did not persist.');
  console.log('PASS: product creation followed by wholesale terms, quantity breaks, enable and disable persistence.');
  const memberCreated = await request('/api/admin/members', token, { method: 'POST', body: JSON.stringify({ name: `Temporary contact verification ${suffix}`, craftKey: craft.key, dzongkhag: 'Thimphu', cidNumber: String(Date.now()).slice(-11), status: 'VERIFIED', village: 'Test village', phone: 'Test contact', email: 'contact@example.invalid' }) });
  memberId = memberCreated.member.id;
  assert(memberCreated.member.email === 'contact@example.invalid' && memberCreated.member.phone === 'Test contact' && memberCreated.member.village === 'Test village', 'Member creation lost contact fields.');
  const memberUpdated = await request('/api/admin/members', token, { method: 'PATCH', body: JSON.stringify({ id: memberId, phone: 'Updated contact', village: 'Updated village', email: 'UPDATED@example.invalid' }) });
  assert(memberUpdated.member.email === 'updated@example.invalid' && memberUpdated.member.phone === 'Updated contact', 'Member edit lost contact fields.');
  const memberList = await request('/api/admin/members', token);
  assert(memberList.members.find(m => m.id === memberId)?.village === 'Updated village', 'Admin member list lost village.');
  const memberPublic = await fetch(`${baseUrl}/api/members?slug=${encodeURIComponent(memberCreated.member.regNumber)}`).then(r => r.json());
  assert(memberPublic.member && !('phone' in memberPublic.member) && !('email' in memberPublic.member), 'Public directory exposed private contact details.');
  console.log('PASS: member contact create/update/admin read and public contact privacy.');
  console.log('PASS: authenticated product create, public read, update and admin list; all five detail fields round-tripped.');
} finally {
  if (memberId) await prisma.member.deleteMany({ where: { id: memberId } });
  if (productId) await prisma.product.deleteMany({ where: { id: productId } });
  if (user) {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
  }
  if (role) await prisma.role.deleteMany({ where: { id: role.id } });
  await prisma.$disconnect();
}
