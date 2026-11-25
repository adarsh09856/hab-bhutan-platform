import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/rbac';
import { DELETE as adminDelete, GET as adminGet, POST as adminPost, PUT as adminPut } from '../src/app/api/admin/honours/route';
import { GET as publicGet } from '../src/app/api/honours/route';

async function main() {
  const db = prisma.honourRecord as any;
  const audit = prisma.auditLog as any;
  const users = prisma.user as any;
  const original = {
    create: db.create,
    update: db.update,
    findMany: db.findMany,
    findUnique: db.findUnique,
    count: db.count,
    delete: db.delete,
    auditCreate: audit.create,
    userFindUnique: users.findUnique,
  };
  const records: any[] = [];
  const testUsers = new Map<string, any>([
    ['local-test-admin', { id: 'local-test-admin', email: 'admin@example.invalid', name: 'Local test admin', status: 'ACTIVE', sessionVersion: 1, role: { id: 'role-admin', slug: 'super_admin', name: 'Local test admin', version: 1, status: 'ACTIVE', permissions: ['*'] } }],
    ['local-test-reader', { id: 'local-test-reader', email: 'reader@example.invalid', name: 'Local test reader', status: 'ACTIVE', sessionVersion: 1, role: { id: 'role-reader', slug: 'content_reader', name: 'Local test reader', version: 1, status: 'ACTIVE', permissions: ['content:view'] } }],
    ['local-test-creator', { id: 'local-test-creator', email: 'creator@example.invalid', name: 'Local test creator', status: 'ACTIVE', sessionVersion: 1, role: { id: 'role-creator', slug: 'content_creator', name: 'Local test creator', version: 1, status: 'ACTIVE', permissions: ['content:create'] } }],
  ]);

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
  db.findMany = async ({ where }: any = {}) => records.filter((item) => {
    if (where?.isActive !== undefined && item.isActive !== where.isActive) return false;
    if (where?.showHome !== undefined && item.showHome !== where.showHome) return false;
    if (where?.awardType && item.awardType !== where.awardType) return false;
    return true;
  });
  db.findUnique = async ({ where }: any) => records.find((item) => item.id === where.id) ?? null;
  db.count = async ({ where }: any = {}) => records.filter((item) =>
    Object.entries(where ?? {}).every(([key, value]: [string, any]) => {
      if (key === 'id' && value?.not) return item.id !== value.not;
      return item[key] === value;
    }),
  ).length;
  db.delete = async ({ where }: any) => {
    const index = records.findIndex((item) => item.id === where.id);
    assert.notEqual(index, -1, 'test honour should exist before delete');
    return records.splice(index, 1)[0];
  };
  users.findUnique = async ({ where }: any) => testUsers.get(where.id) ?? null;
  audit.create = async ({ data }: any) => data;

  const tokens = await Promise.all(['local-test-admin', 'local-test-reader', 'local-test-creator'].map((id) => createSessionToken({ id })));
  const [adminToken, readerToken, creatorToken] = tokens;
  const request = (path: string, method: string, body?: unknown, token = adminToken) => new NextRequest(`http://localhost${path}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  try {
    const anonymousRead = await adminGet(request('/api/admin/honours', 'GET', undefined, ''));
    const anonymousCreate = await adminPost(request('/api/admin/honours', 'POST', { name: 'No auth' }, ''));
    const readerRead = await adminGet(request('/api/admin/honours', 'GET', undefined, readerToken));
    const readerCreate = await adminPost(request('/api/admin/honours', 'POST', { name: 'Reader cannot create' }, readerToken));
    const creatorCreate = await adminPost(request('/api/admin/honours', 'POST', { name: 'Creator can create', craft: 'weaving', dzongkhag: 'Thimphu', citation: 'Synthetic' }, creatorToken));
    const creatorUpdate = await adminPut(request('/api/admin/honours', 'PUT', { id: 'in-memory-honour-1', citation: 'Creator cannot edit' }, creatorToken));
    const creatorDelete = await adminDelete(request('/api/admin/honours?id=in-memory-honour-1', 'DELETE', undefined, creatorToken));
    assert.equal(anonymousRead.status, 401, 'Admin list requires authentication');
    assert.equal(anonymousCreate.status, 401, 'Create requires authentication');
    assert.equal(readerRead.status, 200, 'content:view may read awards');
    assert.equal(readerCreate.status, 401, 'content:view cannot create awards');
    assert.equal(creatorCreate.status, 200, 'content:create may create awards');
    assert.equal(creatorUpdate.status, 401, 'content:create alone cannot edit awards');
    assert.equal(creatorDelete.status, 401, 'content:create alone cannot delete awards');
    records.length = 0;

    const blankCreate = await adminPost(request('/api/admin/honours', 'POST', {
      name: '   ', craft: 'thagzo', dzongkhag: 'Thimphu', citation: 'Whitespace must not satisfy required fields',
    }));
    assert.equal(blankCreate.status, 400, 'required text containing only whitespace must be rejected');

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
    const blankUpdate = await adminPut(request('/api/admin/honours', 'PUT', { id: created.honour.id, name: '   ' }));
    assert.equal(blankUpdate.status, 400, 'updates must reject blank required text');

    const [adminResponse, publicResponse] = await Promise.all([
      adminGet(request('/api/admin/honours', 'GET')),
      publicGet(new NextRequest('http://localhost/api/honours')),
    ]);
    const adminList = await adminResponse.json();
    const publicList = await publicResponse.json();
    assert.equal(adminList.honours[0].citationDz, updated.honour.citationDz);
    assert.equal(publicList.honours[0].citationDz, updated.honour.citationDz);
    assert.equal(publicList.honours[0].citation, 'English citation', 'public listing reflects the saved English edit');

    const deleteResponse = await adminDelete(request(`/api/admin/honours?id=${created.honour.id}`, 'DELETE'));
    assert.equal(deleteResponse.status, 200);
    assert.equal(records.length, 0, 'synthetic award record must be deleted');
    const publicAfterDelete = await publicGet(new NextRequest('http://localhost/api/honours'));
    assert.equal((await publicAfterDelete.json()).honours.length, 0, 'deleted synthetic award must disappear from public API');
    console.log('PASS: synthetic Admin award create/edit/public reflection/delete, role permissions, whitespace validation, and bilingual values; in-memory delegates only, no database writes.');
  } finally {
    db.create = original.create;
    db.update = original.update;
    db.findMany = original.findMany;
    db.findUnique = original.findUnique;
    db.count = original.count;
    db.delete = original.delete;
    audit.create = original.auditCreate;
    users.findUnique = original.userFindUnique;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
