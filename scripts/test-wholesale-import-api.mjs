import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import fs from 'node:fs';
import path from 'node:path';

nextEnv.loadEnvConfig(process.cwd(), true);
const prisma = new PrismaClient();
const baseUrl = process.env.WHOLESALE_IMPORT_TEST_URL || 'http://127.0.0.1:3033';
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const freshEmail = `wholesale-import-${suffix}@example.invalid`;
const existingEmail = `wholesale-existing-${suffix}@example.invalid`;
let user;
let seededDuplicate;
const createdBuyerIds = [];

function cleanFallbackRows() {
  const file = path.join(process.cwd(), '.data', 'wholesale-buyers.json');
  if (!fs.existsSync(file)) return;
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(rows)) return;
  const filtered = rows.filter((row) => ![freshEmail, existingEmail].includes(String(row?.email || '').toLowerCase()));
  if (filtered.length !== rows.length) fs.writeFileSync(file, JSON.stringify(filtered, null, 2), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  assert(['localhost', '127.0.0.1', '::1'].includes(new URL(process.env.DATABASE_URL).hostname), 'Safety stop: local database only.');
  assert(['localhost', '127.0.0.1', '::1'].includes(new URL(baseUrl).hostname), 'Safety stop: local app only.');
  assert(process.env.JWT_SECRET?.length >= 32, 'Local JWT_SECRET is missing or too short.');

  try {
    const role = await prisma.role.findFirst({ where: { slug: { in: ['super_admin', 'staff_operator'] } } });
    assert(role, 'Local database has no super_admin or staff_operator role.');
    user = await prisma.user.create({
      data: { email: `wholesale-import-api-${suffix}@example.invalid`, name: 'Temporary local wholesale import test', passwordHash: 'not-used', roleId: role.id },
    });
    seededDuplicate = await prisma.wholesaleBuyer.create({
      data: {
        id: `wholesale-seed-${suffix}`, username: `existing_${suffix.replace(/\W/g, '').slice(-12)}`,
        passwordHash: 'not-used', companyName: 'Existing local buyer test', contactName: 'Test Buyer',
        email: existingEmail, country: 'Bhutan', discountTier: 20, status: 'ACTIVE',
      },
    });
    const token = await new SignJWT({ user: {
      id: user.id, userId: user.id, email: user.email, name: user.name,
      roleId: role.id, role: role.slug, roleSlug: role.slug, roleVersion: role.version,
      roleStatus: role.status, sessionVersion: user.sessionVersion, mustChangePassword: false,
    } }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    const rows = [
      { _sourceRowNumber: 2, companyName: `Temporary buyer ${suffix}`, contactName: 'Local Test', email: freshEmail, country: 'Bhutan', discountTier: 20, status: 'PENDING' },
      { _sourceRowNumber: 7, companyName: 'Duplicate existing', contactName: 'Existing', email: existingEmail },
      { _sourceRowNumber: 11, companyName: 'Duplicate in file', contactName: 'Again', email: freshEmail },
      { _sourceRowNumber: 18, companyName: 'Invalid email', contactName: 'No email', email: 'bad-email' },
    ];
    const requestImport = async (payload) => {
      const response = await fetch(`${baseUrl}/api/admin/wholesale/import`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: `hab_session=${token}` },
        body: JSON.stringify({ rows: payload }),
      });
      return { response, body: await response.json().catch(() => ({})) };
    };

    const first = await requestImport(rows);
    assert(first.response.ok && first.body.success, `Wholesale import failed: ${first.body.error || first.response.status}.`);
    assert(first.body.count === 1 && first.body.skippedCount === 2 && first.body.badRows.length === 3, 'Import should create one buyer and give a reason for both duplicates and the invalid row.');
    assert(first.body.badRows.map((item) => item.rowNumber).join(',') === '7,11,18', 'API results must preserve original spreadsheet row numbers after invalid/duplicate rows are filtered in preview.');
    const duplicateReasons = first.body.badRows.map((item) => item.reason).join(' ');
    assert(duplicateReasons.includes(existingEmail) && duplicateReasons.includes(freshEmail), 'Duplicate row reasons must identify the email that was skipped.');
    const created = await prisma.wholesaleBuyer.findMany({ where: { email: { equals: freshEmail, mode: 'insensitive' } } });
    createdBuyerIds.push(...created.map((buyer) => buyer.id));
    assert(created.length === 1, 'Exactly one newly imported wholesale buyer should exist.');

    const second = await requestImport([rows[0]]);
    assert(second.response.ok && second.body.count === 0 && second.body.skippedCount === 1, 'Re-import should skip the existing buyer.');
    assert(second.body.badRows.length === 1 && second.body.badRows[0].reason.includes(freshEmail), 'Re-import should explain the duplicate row.');
    assert(await prisma.wholesaleBuyer.count({ where: { email: { equals: freshEmail, mode: 'insensitive' } } }) === 1, 'Repeated import created a duplicate buyer.');
    console.log('PASS: local protected wholesale import creates one buyer, reports invalid and duplicate row reasons, and skips the same buyer on re-import.');
  } finally {
    await prisma.wholesaleBuyer.deleteMany({ where: { OR: [{ id: { in: createdBuyerIds } }, { email: { equals: freshEmail, mode: 'insensitive' } }] } });
    if (seededDuplicate) await prisma.wholesaleBuyer.deleteMany({ where: { id: seededDuplicate.id } });
    cleanFallbackRows();
    if (user) {
      await prisma.auditLog.deleteMany({ where: { actorId: user.id } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: user.id } });
    }
    await prisma.$disconnect();
  }
}

run().catch((error) => {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
});
