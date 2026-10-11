import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/rbac';
import { POST } from '../src/app/api/admin/upload/route';

async function main() {
  const originals = {
    user: prisma.user.findUnique,
    member: prisma.member.findUnique,
    audit: prisma.auditLog.create,
  };
  let permissions = ['members:edit'];

  try {
    (prisma.user as any).findUnique = async () => ({
      id: 'portrait-upload-test-user', email: 'portrait-upload@example.invalid', name: 'Portrait Upload Test',
      status: 'ACTIVE', sessionVersion: 1,
      role: { id: 'portrait-upload-test-role', slug: 'staff_operator', status: 'ACTIVE', version: 1, permissions },
    });
    (prisma.member as any).findUnique = async ({ where }: any) => where.regNumber === 'HAB-TEST-PORTRAIT' ? { id: 'member-test-id' } : null;
    (prisma.auditLog as any).create = async () => ({ id: 'mock-audit' });

    const token = await createSessionToken({ id: 'portrait-upload-test-user', roleSlug: 'staff_operator', sessionVersion: 1 });
    const request = () => {
      const form = new FormData();
      form.append('file', new Blob(['not an image'], { type: 'text/plain' }), 'not-image.txt');
      return new NextRequest('http://localhost/api/admin/upload?purpose=member-portrait&memberRegNumber=HAB-TEST-PORTRAIT', {
        method: 'POST', headers: { Cookie: `hab_session=${token}` }, body: form,
      });
    };

    const allowedRole = await POST(request());
    assert.equal(allowedRole.status, 400);
    assert.match((await allowedRole.json()).error, /must be a JPG, PNG, WebP, GIF, or AVIF/i,
      'members:edit must reach portrait-specific validation without requiring content:edit');

    permissions = ['members:view'];
    const deniedRole = await POST(request());
    assert.equal(deniedRole.status, 403);
    assert.match((await deniedRole.json()).error, /members:edit/i);
  } finally {
    (prisma.user as any).findUnique = originals.user;
    (prisma.member as any).findUnique = originals.member;
    (prisma.auditLog as any).create = originals.audit;
  }

  console.log('PASS: portrait uploads authorize members:edit, validate image files and deny unauthorized roles. No files or database records written.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
