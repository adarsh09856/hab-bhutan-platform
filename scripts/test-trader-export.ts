import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import ExcelJS from 'exceljs';
import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/rbac';
import { GET as exportGet } from '../src/app/api/admin/traders/export/route';

async function main() {
  const traders = prisma.traderRecord as any;
  const users = prisma.user as any;
  const audit = prisma.auditLog as any;
  const original = {
    findMany: traders.findMany,
    userFindUnique: users.findUnique,
    auditCreate: audit.create,
  };
  const sample = [{
    id: 'synthetic-trader-1',
    shopName: '=HYPERLINK("https://example.invalid")',
    registrationNumber: 'HAB-TEST-001',
    ownerName: 'Synthetic Owner',
    slug: 'synthetic-test-shop',
    dzongkhag: 'Thimphu',
    town: 'Thimphu',
    address: 'Synthetic address',
    mapUrl: null,
    openingHours: '09:00–17:00',
    shortDescription: 'Synthetic short description',
    quote: null,
    description: 'Synthetic description',
    craftKeys: ['thagzo', 'tshemzo'],
    productTypes: ['textiles'],
    productPhotoUrls: ['/uploads/synthetic.jpg'],
    bannerUrl: null,
    expiresAt: new Date('2030-01-01T00:00:00.000Z'),
    isVisible: false,
    verifiedSince: 2020,
    sortOrder: 7,
  }];
  const testUsers = new Map<string, any>([
    ['export-reader', { id: 'export-reader', email: 'reader@example.invalid', name: 'Reader', status: 'ACTIVE', sessionVersion: 1, role: { id: 'reader-role', slug: 'content_reader', name: 'Reader', version: 1, status: 'ACTIVE', permissions: ['content:view'] } }],
    ['export-creator', { id: 'export-creator', email: 'creator@example.invalid', name: 'Creator', status: 'ACTIVE', sessionVersion: 1, role: { id: 'creator-role', slug: 'content_creator', name: 'Creator', version: 1, status: 'ACTIVE', permissions: ['content:create'] } }],
  ]);
  traders.findMany = async () => sample;
  users.findUnique = async ({ where }: any) => testUsers.get(where.id) ?? null;
  audit.create = async ({ data }: any) => data;

  const readerToken = await createSessionToken({ id: 'export-reader' });
  const creatorToken = await createSessionToken({ id: 'export-creator' });
  const request = (url: string, token?: string) => new NextRequest(`http://localhost${url}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  try {
    const anonymous = await exportGet(request('/api/admin/traders/export'));
    const underprivileged = await exportGet(request('/api/admin/traders/export', creatorToken));
    assert.equal(anonymous.status, 401, 'export requires authentication');
    assert.equal(underprivileged.status, 401, 'export requires view or edit permission');

    const invalid = await exportGet(request('/api/admin/traders/export?format=pdf', readerToken));
    assert.equal(invalid.status, 400, 'unsupported export formats are rejected');

    const csv = await exportGet(request('/api/admin/traders/export?format=csv', readerToken));
    assert.equal(csv.status, 200);
    assert.match(csv.headers.get('content-type') || '', /text\/csv/i);
    assert.match(csv.headers.get('content-disposition') || '', /hab-traders\.csv/);
    const csvText = await csv.text();
    assert.match(csvText, /'=/, 'CSV formula-leading text is neutralized');
    assert.match(csvText, /Synthetic Owner/, 'Admin export includes the owner field');
    assert.match(csvText, /false/, 'hidden listings retain their published state in export');

    const xlsx = await exportGet(request('/api/admin/traders/export?format=xlsx', readerToken));
    assert.equal(xlsx.status, 200);
    assert.match(xlsx.headers.get('content-type') || '', /spreadsheetml\.sheet/);
    assert.match(xlsx.headers.get('content-disposition') || '', /hab-traders\.xlsx/);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(await xlsx.arrayBuffer()) as any);
    const sheet = workbook.getWorksheet('Accredited Traders');
    assert.ok(sheet, 'XLSX export includes the named worksheet');
    assert.equal(sheet.getCell(1, 1).value, 'shopName');
    assert.equal(sheet.getCell(2, 1).value, '=HYPERLINK("https://example.invalid")');
    assert.equal(sheet.getCell(2, 3).value, 'Synthetic Owner');
    assert.equal(sheet.getCell(2, 18).value, 'false');

    console.log('PASS: trader CSV/XLSX export, auth/permission denial, workbook fields and CSV formula safety; mocked delegates only, no database writes.');
  } finally {
    traders.findMany = original.findMany;
    users.findUnique = original.userFindUnique;
    audit.create = original.auditCreate;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
