import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { validateTestDatabaseUrl } from './lib/safe-test-database.mjs';

nextEnv.loadEnvConfig(process.cwd(), true);
const testDatabaseUrl = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const baseUrl = process.env.HAB_TEST_BASE_URL || 'http://127.0.0.1:3033';
assert.ok(['127.0.0.1', 'localhost', '::1'].includes(new URL(baseUrl).hostname), 'Only a loopback app may be tested.');
assert.ok(process.env.JWT_SECRET?.length >= 32, 'Local JWT secret is required.');
const prisma = new PrismaClient({ datasources: { db: { url: testDatabaseUrl } } });
const suffix = randomUUID();
const roleSlug = `codex_membership_approval_${suffix.replaceAll('-', '_')}`;
const email = (kind) => `codex-approval-${kind}-${suffix}@example.invalid`;
let actorRole;
let actor;
let staffUser;
let memberUser;
let conflictApplication;
let memberApplication;
let enrolledMember;

try {
  const craft = await prisma.craft.findFirst({ select: { key: true } });
  const memberRole = await prisma.role.findFirst({ where: { slug: 'member', status: 'ACTIVE' } });
  assert.ok(craft && memberRole, 'The disposable test database needs seeded craft and member roles.');
  actorRole = await prisma.role.create({ data: { name: 'Disposable approval verifier', slug: roleSlug, permissions: ['applications:approve'] } });
  actor = await prisma.user.create({ data: { email: email('actor'), name: 'Disposable reviewer', passwordHash: 'unused', roleId: actorRole.id } });
  staffUser = await prisma.user.create({ data: { email: email('staff'), name: 'Disposable staff account', passwordHash: bcrypt.hashSync('old-staff-password', 4), roleId: actorRole.id } });
  memberUser = await prisma.user.create({ data: { email: email('member'), name: 'Disposable member account', passwordHash: bcrypt.hashSync('old-member-password', 4), roleId: memberRole.id } });
  const applicationData = (applicantEmail, cid) => ({
    applicantName: 'Disposable application', email: applicantEmail, phone: '+97517000000', cidNumber: cid,
    craftKey: craft.key, dzongkhag: 'Thimphu', villageGewog: 'Local test', yearsPractising: 1,
    planTier: 'ACTIVE_SECTOR_MEMBER', paymentMethod: 'MBOB', status: 'PENDING',
  });
  conflictApplication = await prisma.membershipApplication.create({ data: applicationData(staffUser.email, `91${suffix.replaceAll('-', '').slice(0, 9)}`) });
  memberApplication = await prisma.membershipApplication.create({ data: applicationData(memberUser.email, `92${suffix.replaceAll('-', '').slice(0, 9)}`) });
  const token = await new SignJWT({ user: {
    id: actor.id, userId: actor.id, email: actor.email, name: actor.name,
    roleId: actorRole.id, role: actorRole.slug, roleSlug: actorRole.slug,
    roleVersion: actorRole.version, roleStatus: actorRole.status,
    permissions: ['applications:approve'], sessionVersion: actor.sessionVersion,
    mustChangePassword: false,
  } }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
  const approve = async (id) => {
    const response = await fetch(`${baseUrl}/api/admin/applications`, {
      method: 'PATCH', headers: { 'content-type': 'application/json', cookie: `hab_session=${token}` },
      body: JSON.stringify({ id, status: 'APPROVED' }),
    });
    return { status: response.status, body: await response.json() };
  };

  const conflict = await approve(conflictApplication.id);
  assert.equal(conflict.status, 409, 'Existing staff email must be rejected before account linking.');
  assert.equal((await prisma.membershipApplication.findUnique({ where: { id: conflictApplication.id } })).status, 'PENDING');
  assert.equal(await prisma.member.count({ where: { userId: staffUser.id } }), 0);
  assert.ok(await bcrypt.compare('old-staff-password', (await prisma.user.findUnique({ where: { id: staffUser.id } })).passwordHash));

  const success = await approve(memberApplication.id);
  assert.equal(success.status, 200, success.body.error || 'Existing unlinked member account should be enrolled.');
  enrolledMember = await prisma.member.findUnique({ where: { userId: memberUser.id } });
  assert.ok(enrolledMember && enrolledMember.cidNumber === memberApplication.cidNumber);
  const updatedUser = await prisma.user.findUnique({ where: { id: memberUser.id } });
  assert.ok(await bcrypt.compare(success.body.tempCredentials.temporaryPassword, updatedUser.passwordHash), 'Displayed temporary password must authenticate.');
  assert.equal(updatedUser.sessionVersion, memberUser.sessionVersion + 1, 'Existing sessions must be invalidated.');
  assert.equal(updatedUser.mustChangePassword, true);
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: memberUser.email, password: success.body.tempCredentials.temporaryPassword, targetPortal: 'member' }),
  });
  assert.equal(loginResponse.status, 200, 'The issued temporary password must pass the member login endpoint.');
  const repeat = await approve(memberApplication.id);
  assert.equal(repeat.status, 409, 'Repeated approval must not issue another credential or member record.');
  console.log('PASS: staff account was protected; an unlinked member account received a working temporary password, signed in and gained one verified member profile; repeat approval was rejected.');
} finally {
  if (enrolledMember) await prisma.member.deleteMany({ where: { id: enrolledMember.id } });
  if (conflictApplication || memberApplication) await prisma.membershipApplication.deleteMany({ where: { id: { in: [conflictApplication?.id, memberApplication?.id].filter(Boolean) } } });
  if (actor || staffUser || memberUser) {
    const ids = [actor?.id, staffUser?.id, memberUser?.id].filter(Boolean);
    await prisma.auditLog.deleteMany({ where: { OR: [{ actorId: { in: ids } }, { entityId: { in: ids } }] } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  }
  if (actorRole) await prisma.role.delete({ where: { id: actorRole.id } });
  await prisma.$disconnect();
}
