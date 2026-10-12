import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/rbac';
import { POST } from '../src/app/api/admin/upload/route';
import { PATCH as patchMember } from '../src/app/api/admin/members/route';
import { toMemberProfileView } from '../src/lib/member-profile-view';

async function main() {
  const originals = {
    user: prisma.user.findUnique,
    member: prisma.member.findUnique,
    memberUpdate: prisma.member.update,
    audit: prisma.auditLog.create,
  };
  let permissions = ['members:edit'];
  const uploadMarker = `portrait_e2e_${randomUUID()}`;
  const uploadsRoot = path.resolve(process.cwd(), 'public/uploads');
  // The upload route truncates sanitized basenames to 30 chars before its suffix.
  const cleanupPrefix = `${uploadMarker.slice(0, 30)}_`;
  const member = { id: 'member-test-id', regNumber: 'HAB-TEST-PORTRAIT', name: 'Portrait Test', status: 'VERIFIED', craftKey: 'thagzo', dzongkhag: 'Thimphu', portraitUrl: '' };
  const writes: any[] = [];

  try {
    (prisma.user as any).findUnique = async () => ({
      id: 'portrait-upload-test-user', email: 'portrait-upload@example.invalid', name: 'Portrait Upload Test',
      status: 'ACTIVE', sessionVersion: 1,
      role: { id: 'portrait-upload-test-role', slug: 'staff_operator', status: 'ACTIVE', version: 1, permissions },
    });
    (prisma.member as any).findUnique = async ({ where }: any) =>
      where.regNumber === member.regNumber || where.id === member.id ? member : null;
    (prisma.member as any).update = async ({ where, data }: any) => {
      writes.push({ where, data });
      return { ...member, ...data, craft: null, products: [] };
    };
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

    permissions = ['members:edit'];
    const imageBytes = await fs.readFile(path.join(process.cwd(), 'public/assets/photos/hero-1-weaving.jpg'));
    const imageForm = new FormData();
    imageForm.append('file', new File([imageBytes], `${uploadMarker}.jpg`, { type: 'image/jpeg' }));
    const validUploadRequest = new NextRequest(
      `http://localhost/api/admin/upload?purpose=member-portrait&memberRegNumber=HAB-TEST-PORTRAIT`,
      { method: 'POST', headers: { Cookie: `hab_session=${token}` }, body: imageForm },
    );
    const validUpload = await POST(validUploadRequest);
    assert.equal(validUpload.status, 200, 'A valid member portrait must pass through the real image-processing upload path.');
    const uploaded = await validUpload.json();
    assert.equal(uploaded.success, true);
    assert.equal(uploaded.type, 'image/jpeg');
    assert(uploaded.width > 0 && uploaded.height > 0, 'The uploaded image returns its decoded dimensions.');
    assert.match(uploaded.originalUrl, /^\/uploads\/originals\//, 'The original is stored under the public uploads directory.');
    assert(uploaded.variants.length > 0, 'The upload returns responsive WebP variants.');
    assert(uploaded.variants.some((variant: { url: string }) => variant.url === uploaded.url), 'The preferred public URL is one of the generated variants.');

    const returnedPaths = [uploaded.originalUrl, ...uploaded.variants.map((variant: { url: string }) => variant.url)];
    for (const returnedPath of returnedPaths) {
      assert.match(returnedPath, /^\/uploads\/(?:originals|responsive)\/[a-zA-Z0-9_-]+\.(?:jpg|webp)$/);
      const absolutePath = path.resolve(process.cwd(), 'public', returnedPath.slice(1));
      assert(absolutePath.startsWith(uploadsRoot + path.sep), 'Upload result stays inside public/uploads.');
      const fileBytes = await fs.readFile(absolutePath);
      assert(fileBytes.length > 0, `Upload result ${returnedPath} exists and is non-empty.`);
      if (returnedPath.endsWith('.webp')) assert.equal(fileBytes.toString('ascii', 8, 12), 'WEBP', 'Responsive variants are valid WebP output.');
    }

    const savePortraitRequest = new NextRequest('http://localhost/api/admin/members', {
      method: 'PATCH',
      headers: { Cookie: `hab_session=${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: member.id, portraitUrl: uploaded.url }),
    });
    const savedPortrait = await patchMember(savePortraitRequest);
    assert.equal(savedPortrait.status, 200, 'Quick Edit portrait URL persists through the Admin member API.');
    const savedPortraitBody = await savedPortrait.json();
    assert.equal(savedPortraitBody.member.portraitUrl, uploaded.url);
    assert.deepEqual(writes.at(-1), { where: { id: member.id }, data: { portraitUrl: uploaded.url } });
    assert.equal(toMemberProfileView(savedPortraitBody.member).portraitUrl, uploaded.url,
      'The public member profile mapper uses the uploaded portrait URL.');
  } finally {
    (prisma.user as any).findUnique = originals.user;
    (prisma.member as any).findUnique = originals.member;
    (prisma.member as any).update = originals.memberUpdate;
    (prisma.auditLog as any).create = originals.audit;
    for (const directory of ['originals', 'responsive']) {
      const target = path.join(uploadsRoot, directory);
      for (const entry of await fs.readdir(target, { withFileTypes: true }).catch(() => [])) {
        if (entry.isFile() && entry.name.startsWith(cleanupPrefix)) {
          await fs.unlink(path.join(target, entry.name));
        }
      }
    }
  }

  console.log('PASS: portrait upload permission/validation plus real local JPEG processing, original/optimized file checks, and exact-name test-file cleanup. No database records written.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
