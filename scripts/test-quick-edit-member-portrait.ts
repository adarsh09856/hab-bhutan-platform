import assert from 'node:assert/strict';
import fs from 'node:fs';

const directory = fs.readFileSync('src/app/(public)/members/page.tsx', 'utf8');
const profile = fs.readFileSync('src/app/(public)/members/[slug]/page.tsx', 'utf8');
const publicApi = fs.readFileSync('src/app/api/members/route.ts', 'utf8');
const adminPage = fs.readFileSync('src/app/(admin)/admin/members/page.tsx', 'utf8');
const adminApi = fs.readFileSync('src/app/api/admin/members/route.ts', 'utf8');

assert.match(directory, /redirect\('\/traders'\)/,
  'the public members directory redirects to the Trader Directory');
assert.match(profile, /redirect\('\/traders'\)/,
  'legacy public member-profile URLs redirect to the Trader Directory');
assert.match(publicApi, /status:\s*410/,
  'the former public member API does not expose private registry records');
assert.match(adminPage, /<FileUploadInput[\s\S]*?value=\{createForm\.portraitUrl\}[\s\S]*?label="Artisan Portrait \/ Workshop Photo"/,
  'staff can upload a member portrait from the Admin member editor');
assert.match(adminPage, /value=\{editingMember\.portraitUrl\s*\|\|\s*''\}/,
  'the Admin editor shows the saved portrait during member edits');
assert.match(adminApi, /editFields\.portraitUrl !== undefined\) updateData\.portraitUrl = editFields\.portraitUrl/,
  'the protected Admin member API persists portrait changes');

console.log('PASS: public member records stay private; staff can upload and edit portraits in Admin.');
