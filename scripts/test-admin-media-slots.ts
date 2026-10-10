import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/rbac';
import { GET, PATCH } from '../src/app/api/admin/media/route';

async function main() {
  const originals = {
    user: prisma.user.findUnique,
    audit: prisma.auditLog.create,
    setting: prisma.siteSetting.findUnique,
    settingUpdate: prisma.siteSetting.updateMany,
    slides: prisma.heroSlide.findMany,
    slideUpdate: prisma.heroSlide.updateMany,
    crafts: prisma.craft.findMany,
    craftUpdate: prisma.craft.updateMany,
    outlets: prisma.outletRecord.findMany,
    outlet: prisma.outletRecord.findUnique,
    outletUpdate: prisma.outletRecord.update,
  };
  const updates: Record<string, any>[] = [];
  try {
    (prisma.user as any).findUnique = async () => ({
      id: 'media-test-user', email: 'media-test@example.invalid', name: 'Media test',
      status: 'ACTIVE', sessionVersion: 1,
      role: { id: 'media-role', slug: 'super_admin', status: 'ACTIVE', version: 1, permissions: ['content:view', 'content:edit'] },
    });
    (prisma.auditLog as any).create = async () => ({ id: 'mock-audit' });
    (prisma.siteSetting as any).findUnique = async () => ({ id: 'default', aboutBandImageUrl: '/assets/photos/about-hab.jpg' });
    (prisma.siteSetting as any).updateMany = async ({ data }: any) => { updates.push({ type: 'about', data }); return { count: 1 }; };
    (prisma.heroSlide as any).findMany = async () => [{ id: 'slide-1', imageUrl: '/assets/photos/hero-1-weaving.jpg', caption: 'Saved caption', altText: 'Saved alt' }];
    (prisma.heroSlide as any).updateMany = async ({ where, data }: any) => { updates.push({ type: 'hero', where, data }); return { count: where.id === 'slide-1' ? 1 : 0 }; };
    (prisma.craft as any).findMany = async () => [{ key: 'thagzo', name: 'Thagzo', english: 'Weaving', bannerUrl: null }];
    (prisma.craft as any).updateMany = async ({ where, data }: any) => { updates.push({ type: 'craft', where, data }); return { count: where.key === 'thagzo' ? 1 : 0 }; };
    (prisma.outletRecord as any).findMany = async () => [{ key: 'saved-outlet', name: 'Saved outlet', note: 'Existing note' }];
    (prisma.outletRecord as any).findUnique = async ({ where }: any) => where.key === 'saved-outlet' ? { id: 'outlet-1', note: 'Existing note' } : null;
    (prisma.outletRecord as any).update = async ({ where, data }: any) => { updates.push({ type: 'outlet', where, data }); return { id: where.id }; };

    const token = await createSessionToken({ id: 'media-test-user', roleSlug: 'super_admin', sessionVersion: 1 });
    const request = (method: 'GET' | 'PATCH', body?: object) => new NextRequest('http://localhost/api/admin/media', {
      method, headers: { Cookie: `hab_session=${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const listed = await GET(request('GET'));
    assert.equal(listed.status, 200);
    const slots = (await listed.json()).slots;
    assert.deepEqual(slots.map((slot: any) => slot.key), ['hero.slide-1', 'about.band', 'craft.thagzo', 'outlet.saved-outlet']);
    assert.equal(slots[0].caption, 'Saved alt');

    const unsafe = await PATCH(request('PATCH', { key: 'hero.slide-1', url: 'javascript:alert(1)' }));
    assert.equal(unsafe.status, 400);
    const unsupported = await PATCH(request('PATCH', { key: 'publication.unsaved', url: '/assets/photos/about-hab.jpg' }));
    assert.equal(unsupported.status, 404);
    const missing = await PATCH(request('PATCH', { key: 'craft.unknown', url: '/assets/photos/about-hab.jpg' }));
    assert.equal(missing.status, 404);
    assert.equal(updates.length, 1); // attempted updateMany for unknown craft, never a confirmed write

    const hero = await PATCH(request('PATCH', { key: 'hero.slide-1', url: '/assets/photos/new.jpg', caption: 'New accessible description' }));
    assert.equal(hero.status, 200);
    assert.deepEqual(updates.at(-1)?.data, { imageUrl: '/assets/photos/new.jpg', altText: 'New accessible description' });
    const outlet = await PATCH(request('PATCH', { key: 'outlet.saved-outlet', url: '/assets/photos/outlet.jpg' }));
    assert.equal(outlet.status, 200);
    assert.equal(updates.at(-1)?.data.note, 'Existing note\n<!-- HAB_IMAGE: /assets/photos/outlet.jpg -->');

    (prisma.heroSlide as any).updateMany = async () => { throw new Error('Simulated database failure'); };
    const failed = await PATCH(request('PATCH', { key: 'hero.slide-1', url: '/assets/photos/new.jpg' }));
    assert.equal(failed.status, 500);
    assert.equal((await failed.json()).success, false);
    (prisma.heroSlide as any).findMany = async () => { throw new Error('Simulated database failure'); };
    const unavailable = await GET(request('GET'));
    assert.equal(unavailable.status, 503);
    assert.equal((await unavailable.json()).success, false);
  } finally {
    (prisma.user as any).findUnique = originals.user;
    (prisma.auditLog as any).create = originals.audit;
    (prisma.siteSetting as any).findUnique = originals.setting;
    (prisma.siteSetting as any).updateMany = originals.settingUpdate;
    (prisma.heroSlide as any).findMany = originals.slides;
    (prisma.heroSlide as any).updateMany = originals.slideUpdate;
    (prisma.craft as any).findMany = originals.crafts;
    (prisma.craft as any).updateMany = originals.craftUpdate;
    (prisma.outletRecord as any).findMany = originals.outlets;
    (prisma.outletRecord as any).findUnique = originals.outlet;
    (prisma.outletRecord as any).update = originals.outletUpdate;
  }
  console.log('PASS: media slots use saved records; unsupported/missing/failed updates do not report success. No database writes.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
