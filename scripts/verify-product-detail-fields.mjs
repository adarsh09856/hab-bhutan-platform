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
const permissions = ['products:view', 'products:create', 'products:edit', 'members:view', 'members:create', 'members:edit', 'members:verify'];
let role;
let user;
let creatorRole;
let creatorUser;
let productId;
let memberId;
const importCid = `LOCAL-IMPORT-${suffix}`;

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
  const createToken = (targetUser, targetRole, targetPermissions) => new SignJWT({
    user: {
      id: targetUser.id,
      userId: targetUser.id,
      email: targetUser.email,
      name: targetUser.name,
      roleId: targetRole.id,
      role: targetRole.slug,
      roleSlug: targetRole.slug,
      roleVersion: targetRole.version,
      roleStatus: targetRole.status,
      permissions: targetPermissions,
      sessionVersion: targetUser.sessionVersion,
      mustChangePassword: false,
    },
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(new TextEncoder().encode(secret));
  const token = await createToken(user, role, permissions);
  const creatorPermissions = ['members:view', 'members:create', 'members:edit'];
  creatorRole = await prisma.role.create({
    data: { name: 'Temporary member creator without verifier', slug: `${roleSlug}_creator`, permissions: creatorPermissions },
  });
  creatorUser = await prisma.user.create({
    data: { email: `codex-member-creator-${suffix}@example.invalid`, name: 'Temporary Member Creator', passwordHash: 'not-used', roleId: creatorRole.id },
  });
  const creatorToken = await createToken(creatorUser, creatorRole, creatorPermissions);

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
  const memberCreated = await request('/api/admin/members', creatorToken, { method: 'POST', body: JSON.stringify({ name: `Temporary contact verification ${suffix}`, craftKey: craft.key, dzongkhag: 'Thimphu', cidNumber: String(Date.now()).slice(-11), village: 'Test village', phone: 'Test contact', email: 'contact@example.invalid' }) });
  memberId = memberCreated.member.id;
  assert(memberCreated.member.status === 'PENDING', 'New admin-created member was published without an explicit verification decision.');
  const unauthorizedVerification = await fetch(`${baseUrl}/api/admin/members`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: `hab_session=${creatorToken}` }, body: JSON.stringify({ id: memberId, status: 'VERIFIED', phone: 'Unauthorized composite edit' }) });
  assert(unauthorizedVerification.status === 403, 'A member editor without members:verify published a member through a combined edit/status change.');
  const memberVerified = await request('/api/admin/members', token, { method: 'PATCH', body: JSON.stringify({ id: memberId, status: 'VERIFIED' }) });
  assert(memberVerified.member.status === 'VERIFIED', 'Authorized member verification did not persist.');
  assert(memberCreated.member.email === 'contact@example.invalid' && memberCreated.member.phone === 'Test contact' && memberCreated.member.village === 'Test village', 'Member creation lost contact fields.');
  const memberUpdated = await request('/api/admin/members', token, { method: 'PATCH', body: JSON.stringify({ id: memberId, phone: 'Updated contact', village: 'Updated village', email: 'UPDATED@example.invalid' }) });
  assert(memberUpdated.member.email === 'updated@example.invalid' && memberUpdated.member.phone === 'Updated contact', 'Member edit lost contact fields.');
  const memberList = await request('/api/admin/members', token);
  assert(memberList.members.find(m => m.id === memberId)?.village === 'Updated village', 'Admin member list lost village.');
  const memberPublic = await fetch(`${baseUrl}/api/members?slug=${encodeURIComponent(memberCreated.member.regNumber)}`).then(r => r.json());
  assert(memberPublic.member && !('phone' in memberPublic.member) && !('email' in memberPublic.member), 'Public directory exposed private contact details.');
  console.log('PASS: member contact create/update/admin read and public contact privacy.');
  const importRows = [{ _sourceRowNumber: 2, name: `Temporary import verification ${suffix}`, cidNumber: importCid, craftKey: craft.key, dzongkhag: 'Thimphu', village: 'Import village', phone: 'Import contact', email: 'import@example.invalid' }, { _sourceRowNumber: 3, name: 'Invalid craft', cidNumber: `INVALID-${suffix}`, craftKey: 'unknown-craft', dzongkhag: 'Thimphu' }];
  const imported = await request('/api/admin/members/import', token, { method: 'POST', body: JSON.stringify({ rows: importRows }) });
  assert(imported.count === 1 && imported.badRows.some(row => row.rowNumber === 3 && /craft/.test(row.reason)), 'Import did not report the invalid craft against its original row.');
  const importedMember = await prisma.member.findFirst({ where: { cidNumber: importCid } });
  assert(importedMember?.status === 'PENDING' && importedMember.email === 'import@example.invalid' && importedMember.phone === 'Import contact' && importedMember.village === 'Import village', 'Imported member lost pending status or contacts.');
  const repeated = await request('/api/admin/members/import', token, { method: 'POST', body: JSON.stringify({ rows: [importRows[0]] }) });
  assert(repeated.count === 0 && repeated.skippedCount === 1, 'Repeat upload created duplicate members.');
  assert(await prisma.member.count({ where: { cidNumber: importCid } }) === 1, 'Repeat upload changed the identity count.');
  const anonymousImport = await fetch(`${baseUrl}/api/admin/members/import`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows: importRows }) });
  assert(anonymousImport.status === 401, 'Anonymous member import was not denied.');
  await prisma.user.update({ where: { id: user.id }, data: { status: 'SUSPENDED' } });
  const suspendedImport = await fetch(`${baseUrl}/api/admin/members/import`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: `hab_session=${token}` }, body: JSON.stringify({ rows: importRows }) });
  assert(suspendedImport.status === 403, 'A suspended staff account could import using its old token.');
  console.log('PASS: member import permissions, contacts, pending default, invalid-row reporting and duplicate re-upload.');
  console.log('PASS: authenticated product create, public read, update and admin list; all five detail fields round-tripped.');
} finally {
  await prisma.member.deleteMany({ where: { cidNumber: importCid } });
  if (memberId) await prisma.member.deleteMany({ where: { id: memberId } });
  if (productId) await prisma.product.deleteMany({ where: { id: productId } });
  if (user) {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
  }
  if (creatorUser) {
    await prisma.auditLog.deleteMany({ where: { actorId: creatorUser.id } });
    await prisma.user.deleteMany({ where: { id: creatorUser.id } });
  }
  if (role) await prisma.role.deleteMany({ where: { id: role.id } });
  if (creatorRole) await prisma.role.deleteMany({ where: { id: creatorRole.id } });
  await prisma.$disconnect();
}
