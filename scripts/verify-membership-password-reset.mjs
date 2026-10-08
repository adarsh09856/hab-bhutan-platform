import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

nextEnv.loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();
const baseUrl = process.env.QUICK_EDIT_TEST_URL || 'http://127.0.0.1:3034';
const parsedUrl = new URL(baseUrl);
if (!['127.0.0.1', 'localhost', '::1'].includes(parsedUrl.hostname)) {
  throw new Error('Safety check: this verification script only runs against a loopback test server.');
}

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const permissions = ['applications:view', 'users:edit'];
const roleSlug = `codex_member_reset_${suffix.replace(/[^a-z0-9]/gi, '_')}`;
const cidNumber = String(Date.now()).slice(-11);
let role;
let actor;
let memberUser;
let member;
let application;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, token, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Cookie: `hab_session=${token}` } : {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function createToken(user, userRole) {
  return new SignJWT({
    user: {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      roleId: userRole.id,
      role: userRole.slug,
      roleSlug: userRole.slug,
      roleVersion: userRole.version,
      roleStatus: userRole.status,
      permissions,
      sessionVersion: user.sessionVersion,
      mustChangePassword: false,
    },
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
}

try {
  assert(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32, 'Local JWT_SECRET is missing or too short.');
  const craft = await prisma.craft.findFirst({ select: { key: true } });
  assert(craft, 'No craft exists in the local test database.');

  role = await prisma.role.create({ data: { name: 'Temporary member password reset verification', slug: roleSlug, permissions } });
  actor = await prisma.user.create({
    data: { email: `codex-reset-actor-${suffix}@example.invalid`, name: 'Temporary Reset Test Actor', passwordHash: 'not-used', roleId: role.id },
  });
  const token = await createToken(actor, role);

  memberUser = await prisma.user.create({
    data: {
      email: `codex-reset-member-${suffix}@example.invalid`,
      name: 'Temporary Enrolled Member',
      passwordHash: bcrypt.hashSync('old-test-password', 12),
      roleId: role.id,
    },
  });
  const staleMemberToken = await createToken(memberUser, role);
  member = await prisma.member.create({
    data: {
      name: 'Temporary Enrolled Member',
      craftKey: craft.key,
      dzongkhag: 'Thimphu',
      joinYear: 2026,
      regNumber: `TEST-${suffix}`,
      status: 'VERIFIED',
      bio: 'Temporary local verification fixture.',
      cidNumber,
      userId: memberUser.id,
      duesExpiryDate: new Date('2027-12-31'),
    },
  });
  application = await prisma.membershipApplication.create({
    data: {
      applicantName: 'Temporary Enrolled Member',
      email: memberUser.email,
      phone: '+975-17000000',
      cidNumber,
      craftKey: craft.key,
      dzongkhag: 'Thimphu',
      villageGewog: 'Local verification only',
      yearsPractising: 1,
      planTier: 'ACTIVE_SECTOR_MEMBER',
      status: 'APPROVED',
    },
  });

  const listed = await request('/api/admin/applications', token);
  const listedApplication = listed.body.applications?.find((item) => item.id === application.id);
  assert(listed.response.ok && listedApplication?.memberUserId === memberUser.id, 'Approved membership list did not resolve its verified enrolled user account.');
  assert(listedApplication.memberAccountEmail === memberUser.email, 'Membership list did not expose the enrolled account email.');

  const reset = await request('/api/admin/users/credentials', token, {
    method: 'POST',
    body: JSON.stringify({ userId: memberUser.id, action: 'RESET_PASSWORD' }),
  });
  assert(reset.response.ok && reset.body.success && reset.body.temporaryPassword, `Password reset failed: ${reset.body.error || reset.response.status}.`);

  const updatedUser = await prisma.user.findUnique({ where: { id: memberUser.id } });
  assert(updatedUser?.mustChangePassword === true, 'Reset did not require a password change at next sign-in.');
  assert(updatedUser?.sessionVersion === memberUser.sessionVersion + 1, 'Reset did not invalidate existing sessions.');
  assert(bcrypt.compareSync(reset.body.temporaryPassword, updatedUser.passwordHash), 'Returned temporary password does not match the saved password hash.');

  const staleSessionAttempt = await request('/api/admin/users/credentials', staleMemberToken, {
    method: 'POST',
    body: JSON.stringify({ userId: memberUser.id, action: 'INVALID_TEST_ACTION' }),
  });
  assert(staleSessionAttempt.response.status === 401, `Pre-reset session remained usable (HTTP ${staleSessionAttempt.response.status}).`);

  console.log('PASS: approved application maps to its verified member account; password reset returns a matching temporary password, requires password change, increments sessionVersion, and invalidates the prior session. Local temporary records are removed in cleanup.');
} catch (error) {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
} finally {
  if (application) await prisma.membershipApplication.deleteMany({ where: { id: application.id } }).catch(() => {});
  if (member) await prisma.member.deleteMany({ where: { id: member.id } }).catch(() => {});
  const actorIds = [actor?.id].filter(Boolean);
  if (actorIds.length) await prisma.auditLog.deleteMany({ where: { actorId: { in: actorIds } } }).catch(() => {});
  if (memberUser) await prisma.user.deleteMany({ where: { id: memberUser.id } }).catch(() => {});
  if (actor) await prisma.user.deleteMany({ where: { id: actor.id } }).catch(() => {});
  if (role) await prisma.role.deleteMany({ where: { id: role.id } }).catch(() => {});
  await prisma.$disconnect();
}
