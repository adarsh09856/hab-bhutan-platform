import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/rbac';
import { POST } from '../src/app/api/admin/traders/import/route';

async function main() {
  const trader = prisma.traderRecord as any;
  const user = prisma.user as any;
  const audit = prisma.auditLog as any;
  const original = {
    findUnique: trader.findUnique,
    create: trader.create,
    userFindUnique: user.findUnique,
    auditCreate: audit.create,
  };
  const created: any[] = [];

  user.findUnique = async () => ({
    id: 'trader-import-test-user', email: 'trader-import@example.invalid', name: 'Disposable importer',
    status: 'ACTIVE', sessionVersion: 1,
    role: { id: 'trader-import-role', slug: 'super_admin', status: 'ACTIVE', version: 1, permissions: ['content:create'] },
  });
  trader.findUnique = async () => null;
  trader.create = async ({ data }: any) => { created.push(data); return { id: `disposable-${created.length}`, ...data }; };
  audit.create = async ({ data }: any) => ({ id: 'mock-audit', ...data });

  try {
    const token = await createSessionToken({
      id: 'trader-import-test-user', email: 'trader-import@example.invalid', roleSlug: 'super_admin',
      permissions: ['content:create'],
    });
    const rows = ['shopName,registrationNumber,dzongkhag,town,address,shortDescription,description,expiresAt,isVisible'];
    for (let i = 1; i <= 100; i += 1) {
      rows.push(`Test Workshop ${i},HAB-IMPORT-${String(i).padStart(3, '0')},Thimphu,Thimphu,Test address ${i},Short description ${i},Long description ${i},2030-12-31,false`);
    }
    const form = new FormData();
    form.append('file', new File([rows.join('\n')], 'traders.csv', { type: 'text/csv' }));
    const request = new NextRequest('http://localhost/api/admin/traders/import', {
      method: 'POST', headers: { Cookie: `hab_session=${token}` }, body: form,
    });

    const response = await POST(request);
    const body = await response.json();
    assert.equal(response.status, 200, JSON.stringify(body));
    assert.equal(body.created, 100);
    assert.equal(body.updated, 0);
    assert.equal(body.errors.length, 0);
    assert.equal(created.length, 100);
    assert.ok(created.every((record) => record.isVisible === false && record.productPhotoUrls.length === 0));
    console.log('PASS: one authenticated CSV import created 100 disposable in-memory trader records without publishing placeholders or touching a database.');
  } finally {
    trader.findUnique = original.findUnique;
    trader.create = original.create;
    user.findUnique = original.userFindUnique;
    audit.create = original.auditCreate;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
