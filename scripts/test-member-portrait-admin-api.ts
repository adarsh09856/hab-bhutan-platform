import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/rbac';
import { PATCH } from '../src/app/api/admin/members/route';

async function main() {
  const originals = {
    user: prisma.user.findUnique,
    memberFind: prisma.member.findUnique,
    memberUpdate: prisma.member.update,
    audit: prisma.auditLog.create,
  };
  const member = { id: 'member-test-id', regNumber: 'HAB-TEST-PORTRAIT', name: 'Portrait Test', status: 'VERIFIED', craftKey: 'thagzo', dzongkhag: 'Thimphu' };
  let permissions = ['members:view', 'members:edit'];
  const writes: any[] = [];

  try {
    (prisma.user as any).findUnique = async () => ({
      id: 'member-test-user', email: 'portrait-test@example.invalid', name: 'Portrait Test Admin',
      status: 'ACTIVE', sessionVersion: 1,
      role: { id: 'member-test-role', slug: 'staff_operator', status: 'ACTIVE', version: 1, permissions },
    });
    (prisma.member as any).findUnique = async ({ where }: any) => where.id === member.id ? member : null;
    (prisma.member as any).update = async ({ where, data }: any) => {
      writes.push({ where, data });
      return { ...member, ...data, craft: null, products: [] };
    };
    (prisma.auditLog as any).create = async () => ({ id: 'mock-audit' });

    const token = await createSessionToken({ id: 'member-test-user', roleSlug: 'staff_operator', sessionVersion: 1 });
    const request = (portraitUrl: string) => new NextRequest('http://localhost/api/admin/members', {
      method: 'PATCH',
      headers: { Cookie: `hab_session=${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: member.id, portraitUrl }),
    });

    const url = '/uploads/member-portrait-test.webp';
    const response = await PATCH(request(url));
    assert.equal(response.status, 200);
    assert.equal(writes.length, 1);
    assert.deepEqual(writes[0], { where: { id: member.id }, data: { portraitUrl: url } });
    assert.equal((await response.json()).member.portraitUrl, url);

    permissions = ['members:view'];
    const originalConsoleError = console.error;
    console.error = () => {};
    let denied: Response;
    try {
      denied = await PATCH(request('/uploads/should-not-save.webp'));
    } finally {
      console.error = originalConsoleError;
    }
    assert.equal(denied.status, 403);
    assert.equal(writes.length, 1, 'a role without members:edit must not update the portrait');
  } finally {
    (prisma.user as any).findUnique = originals.user;
    (prisma.member as any).findUnique = originals.memberFind;
    (prisma.member as any).update = originals.memberUpdate;
    (prisma.auditLog as any).create = originals.audit;
  }

  console.log('PASS: member portrait API persists the uploaded path and rejects roles without members:edit. No database writes.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
