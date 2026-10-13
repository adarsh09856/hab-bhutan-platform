import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { canOpenAdminRoute, hasAdminPermission } from '../src/lib/admin-navigation-access';

const viewer = { roleSlug: 'viewer_custom', permissions: ['members:view', 'products:view', 'content:view'] };
for (const href of ['/admin/members', '/admin/products', '/admin/content', '/admin/pages', '/admin/crafts', '/admin/trade']) {
  assert.equal(canOpenAdminRoute(viewer, href), true, `Reader must reach ${href}`);
}
for (const href of ['/admin', '/admin/users', '/admin/settings', '/admin/pages?new=1', '/admin/pages/live-content', '/admin/orders', '/admin/pos']) {
  assert.equal(canOpenAdminRoute(viewer, href), false, `Reader must not receive ${href}`);
}
assert.equal(hasAdminPermission(viewer, 'products:create'), false);
const editor = { roleSlug: 'member_editor', permissions: ['members:view', 'members:edit'] };
assert.equal(canOpenAdminRoute(editor, '/admin/members'), true);
assert.equal(canOpenAdminRoute(editor, '/admin/products'), false);
assert.equal(canOpenAdminRoute({ roleSlug: 'content_editor', permissions: ['content:edit'] }, '/admin/site-settings'), false);
assert.equal(canOpenAdminRoute({ roleSlug: 'staff_operator', permissions: ['content:edit'] }, '/admin/site-settings'), true);
assert.equal(canOpenAdminRoute({ roleSlug: 'finance', permissions: ['reports:view'] }, '/admin'), true);
assert.equal(canOpenAdminRoute(null, '/admin/members'), false);
assert.equal(canOpenAdminRoute(viewer, '/admin/members-imposter'), false);
const admin = { roleSlug: 'super_admin', permissions: ['*'] };
let pages = 0;
for (const file of readdirSync('src/app/(admin)/admin', { recursive: true }) as string[]) {
  if (!file.endsWith('page.tsx')) continue;
  const route = `/admin/${file.replaceAll('\\', '/').replace(/\/?page\.tsx$/, '')}`.replace(/\/$/, '');
  if (route === '/admin/login') continue;
  assert.equal(canOpenAdminRoute(admin, route), true, `Admin route missing from access map: ${route}`);
  pages++;
}
assert.equal(canOpenAdminRoute(admin, '/admin/pages?new=1'), true);
console.log(`PASS: staff permission boundaries and ${pages} Admin page destinations covered.`);
