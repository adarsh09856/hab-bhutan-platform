import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

nextEnv.loadEnvConfig(process.cwd(), true);
const prisma = new PrismaClient();
const baseUrl = process.env.MEMBER_IMPORT_TEST_URL || 'http://127.0.0.1:3033';
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const cidNumber = `CID-CODEX-${Date.now()}`;
let user;
let creatorRole;
let creatorUser;
const memberIds = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  assert(['localhost', '127.0.0.1', '::1'].includes(new URL(process.env.DATABASE_URL).hostname), 'Safety stop: local database only.');
  assert(['localhost', '127.0.0.1', '::1'].includes(new URL(baseUrl).hostname), 'Safety stop: local app only.');
  assert(process.env.JWT_SECRET?.length >= 32, 'Local JWT_SECRET is missing or too short.');

  try {
    const staffRole = await prisma.role.findFirst({ where: { slug: { in: ['super_admin', 'staff_operator'] } } });
    assert(staffRole, 'Local database has no super_admin or staff_operator role for the protected API test.');
    const craft = await prisma.craft.findUnique({ where: { key: 'thagzo' } });
    assert(craft, 'Required local test craft thagzo is not seeded.');

    user = await prisma.user.create({
      data: {
        email: `member-import-api-${suffix}@example.invalid`,
        name: 'Temporary local member-import API test',
        passwordHash: 'not-used',
        roleId: staffRole.id,
      },
    });
    const token = await new SignJWT({
      user: {
        id: user.id, userId: user.id, email: user.email, name: user.name,
        roleId: staffRole.id, role: staffRole.slug, roleSlug: staffRole.slug,
        roleVersion: staffRole.version, roleStatus: staffRole.status,
        sessionVersion: user.sessionVersion, mustChangePassword: false,
      },
    }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    const creatorPermissions = ['members:create'];
    creatorRole = await prisma.role.create({
      data: { name: 'Temporary import creator without verifier', slug: `member_import_creator_${suffix.replace(/[^a-z0-9]/gi, '_')}`, permissions: creatorPermissions },
    });
    creatorUser = await prisma.user.create({
      data: { email: `member-import-creator-${suffix}@example.invalid`, name: 'Temporary Member Import Creator', passwordHash: 'not-used', roleId: creatorRole.id },
    });
    const creatorToken = await new SignJWT({
      user: {
        id: creatorUser.id, userId: creatorUser.id, email: creatorUser.email, name: creatorUser.name,
        roleId: creatorRole.id, role: creatorRole.slug, roleSlug: creatorRole.slug,
        roleVersion: creatorRole.version, roleStatus: creatorRole.status,
        sessionVersion: creatorUser.sessionVersion, mustChangePassword: false,
      },
    }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    const verifiedWithoutPermission = await fetch(`${baseUrl}/api/admin/members/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: `hab_session=${creatorToken}` },
      body: JSON.stringify({ rows: [{ name: 'Must not be published', craftKey: 'thagzo', dzongkhag: 'Thimphu', cidNumber: `CID-DENIED-${Date.now()}`, status: 'VERIFIED' }] }),
    });
    assert(verifiedWithoutPermission.status === 403, 'Member import allowed VERIFIED rows without the members:verify permission.');

    const rows = [
      { name: `Temporary member ${suffix}`, craftKey: 'thagzo', dzongkhag: 'Thimphu', cidNumber, joinYear: 2025 },
      { name: `Duplicate member ${suffix}`, craftKey: 'thagzo', dzongkhag: 'Thimphu', cidNumber: cidNumber.toLowerCase(), joinYear: 2025, status: 'PENDING' },
      { name: `Invalid member ${suffix}`, dzongkhag: 'Thimphu', cidNumber: `CID-INVALID-${Date.now()}` },
    ];
    const postImport = async (payload) => {
      const response = await fetch(`${baseUrl}/api/admin/members/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: `hab_session=${token}` },
        body: JSON.stringify({ rows: payload }),
      });
      return { response, body: await response.json().catch(() => ({})) };
    };

    const first = await postImport(rows);
    assert(first.response.ok && first.body.success, `First import failed: ${first.body.error || first.response.status}.`);
    assert(first.body.count === 1 && first.body.skippedCount === 1 && first.body.badRows.length === 2, 'Import should insert one, skip one duplicate, and report the duplicate plus the invalid row.');
    let created = await prisma.member.findMany({ where: { cidNumber: { equals: cidNumber, mode: 'insensitive' } } });
    memberIds.push(...created.map((member) => member.id));
    assert(created.length === 1, 'Exactly one member should exist after first import.');
    assert(created[0].status === 'PENDING', 'Import without an explicit status must create a pending record.');

    const second = await postImport([rows[0]]);
    assert(second.response.ok && second.body.count === 0 && second.body.skippedCount === 1, 'Re-import should skip the already saved member.');
    created = await prisma.member.findMany({ where: { cidNumber: { equals: cidNumber, mode: 'insensitive' } } });
    assert(created.length === 1, 'Repeated import created a duplicate member.');
    console.log('PASS: protected member import inserts valid row, reports invalid fields, skips a duplicate within the file, and remains idempotent when re-imported.');
  } finally {
    await prisma.member.deleteMany({
      where: { OR: [{ id: { in: memberIds } }, { cidNumber: { equals: cidNumber, mode: 'insensitive' } }] },
    });
    if (user) {
      await prisma.auditLog.deleteMany({ where: { actorId: user.id } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: user.id } });
    }
    if (creatorUser) {
      await prisma.auditLog.deleteMany({ where: { actorId: creatorUser.id } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: creatorUser.id } });
    }
    if (creatorRole) await prisma.role.deleteMany({ where: { id: creatorRole.id } });
    await prisma.$disconnect();
  }
}

run().catch((error) => {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
});
