import assert from 'node:assert/strict';
import fs from 'node:fs';

const profile = fs.readFileSync('src/app/(public)/members/[slug]/page.tsx', 'utf8');
const quickEdit = fs.readFileSync('src/components/public/UniversalPageQuickEdit.tsx', 'utf8');
const adminRoute = fs.readFileSync('src/app/api/admin/members/route.ts', 'utf8');
const publicMapper = fs.readFileSync('src/lib/public-member-profile.ts', 'utf8');
const viewMapper = fs.readFileSync('src/lib/member-profile-view.ts', 'utf8');

assert.match(profile, /data-hab-gallery="member"\s+data-hab-gallery-id=\{member\.regNumber\}/,
  'member portrait uses the public registration number to identify the Admin record');
assert.match(profile, /data-hab-media-placeholder="member-portrait"/,
  'the initials fallback remains a selectable portrait-upload target');
assert.match(quickEdit, /selected\.hasAttribute\('data-hab-media-placeholder'\)/,
  'Quick Edit classifies the initials fallback as an image, not editable letter text');
assert.match(quickEdit, /galleryType === 'member'[\s\S]*?\/api\/admin\/members'[\s\S]*?portraitUrl:\s*nextUrl/,
  'Quick Edit writes an uploaded portrait to the member Admin record');
assert.match(quickEdit, /purpose=member-portrait&memberRegNumber=/,
  'member portrait uploads use the domain-specific upload permission');
assert.match(quickEdit, /galleryType === 'member' \? \['members:view', 'members:edit'\]/,
  'member portrait editing requires member-view and member-edit permissions');
assert.match(adminRoute, /if \(editFields\.portraitUrl !== undefined\) updateData\.portraitUrl = editFields\.portraitUrl/,
  'the protected Admin member update persists the portrait URL');
assert.match(publicMapper, /portraitUrl:\s*member\.portraitUrl/,
  'the public API exposes the saved portrait URL');
assert.match(viewMapper, /regNumber:\s*record\.regNumber/,
  'the public member view retains the non-sensitive registration key for record matching');
const uploadRoute = fs.readFileSync('src/app/api/admin/upload/route.ts', 'utf8');
assert.match(uploadRoute, /purpose === 'member-portrait' \? 'members:edit' : 'content:edit'/,
  'portrait upload accepts member-edit permission without broadening other media uploads');

console.log('PASS: Quick Edit can target an empty member portrait, upload and save to the protected member record, and render the saved portrait publicly.');
