import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/rbac';
import { GET as adminGet, POST as adminPost, PUT as adminPut } from '../src/app/api/admin/honours/route';
import { GET as publicGet } from '../src/app/api/honours/route';

async function main() {
  const token = await createSessionToken({ id: 'local-test-admin', email: 'local@example.invalid', name: 'Local test', roleSlug: 'super_admin' });
  const db = prisma.honourRecord as any;
  const audit = prisma.auditLog as any;
  const original = { create: db.create, update: db.update, findMany: db.findMany, auditCreate: audit.create };
  const records: any[] = [];

  db.create = async ({ data }: any) => {
    const created = { id: 'in-memory-honour-1', ...data };
    records.push(created);
    return created;
  };
  db.update = async ({ where, data }: any) => {
    const record = records.find((item) => item.id === where.id);
    assert.ok(record, 'test honour record should exist before update');
    Object.assign(record, data);
    return record;
  };
  db.findMany = async () => records;
  audit.create = async ({ data }: any) => data;

  const request = (path: string, method: string, body?: unknown) => new NextRequest(`http://localhost${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  try {
    const createdResponse = await adminPost(request('/api/admin/honours', 'POST', {
      name: 'Local Test Artisan', craft: 'thagzo', dzongkhag: 'Thimphu', citation: 'English citation', citationDz: 'རྫོང་ཁའི་ངོས་ལེན་ཡི་གེ',
    }));
    const created = await createdResponse.json();
    assert.equal(createdResponse.status, 200);
    assert.equal(created.honour.citationDz, 'རྫོང་ཁའི་ངོས་ལེན་ཡི་གེ');

    const updatedResponse = await adminPut(request('/api/admin/honours', 'PUT', {
      id: created.honour.id, citationDz: 'རྫོང་ཁའི་ངོས་ལེན་ཡི་གེ་བསྐྱར་བཅོས',
    }));
    const updated = await updatedResponse.json();
    assert.equal(updatedResponse.status, 200);
    assert.equal(updated.honour.citation, 'English citation', 'editing the Dzongkha copy must preserve English');
    assert.equal(updated.honour.citationDz, 'རྫོང་ཁའི་ངོས་ལེན་ཡི་གེ་བསྐྱར་བཅོས');

    const [adminResponse, publicResponse] = await Promise.all([
      adminGet(request('/api/admin/honours', 'GET')),
      publicGet(new NextRequest('http://localhost/api/honours')),
    ]);
    assert.equal((await adminResponse.json()).honours[0].citationDz, updated.honour.citationDz);
    assert.equal((await publicResponse.json()).honours[0].citationDz, updated.honour.citationDz);
    console.log('PASS: in-memory honours Admin create/update and both reads preserve English and Dzongkha citations; no database writes.');
  } finally {
    db.create = original.create;
    db.update = original.update;
    db.findMany = original.findMany;
    audit.create = original.auditCreate;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
