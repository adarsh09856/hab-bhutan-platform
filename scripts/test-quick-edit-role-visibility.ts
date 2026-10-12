import assert from 'node:assert/strict';
import fs from 'node:fs';
import { canAccessAdminPortal, canUseUniversalQuickEdit } from '../src/lib/permissions';

const contentEditor = ['content:view', 'content:edit'];
assert.equal(canAccessAdminPortal('content_editor_custom', contentEditor), true,
  'custom content editors must be able to enter Admin');
assert.equal(canUseUniversalQuickEdit(contentEditor), true,
  'custom content editors must be able to activate Universal Quick Edit');
assert.equal(canAccessAdminPortal('content_viewer_custom', ['content:view']), true,
  'custom content viewers must be able to enter Admin');
assert.equal(canUseUniversalQuickEdit(['content:view']), false,
  'view-only content roles must not enter Quick Edit');
assert.equal(canUseUniversalQuickEdit(['products:edit']), true,
  'product editors must be able to edit product media in Quick Edit');
assert.equal(canUseUniversalQuickEdit(['members:edit']), true,
  'member editors must be able to edit member portraits in Quick Edit');
assert.equal(canAccessAdminPortal('member', ['products:create']), false,
  'member-only product creation must not grant Admin or Quick Edit access');
assert.equal(canUseUniversalQuickEdit(['products:create']), false,
  'create-only permissions must not grant Quick Edit edit access');
assert.equal(canUseUniversalQuickEdit(['*']), true,
  'wildcard staff roles retain Quick Edit access');

const liveBar = fs.readFileSync('src/components/public/AdminLiveBar.tsx', 'utf8');
const sectionBadge = fs.readFileSync('src/components/public/SectionEditBadge.tsx', 'utf8');
const universalEditor = fs.readFileSync('src/components/public/UniversalPageQuickEdit.tsx', 'utf8');
for (const [name, source] of [['Admin live bar', liveBar], ['section badge', sectionBadge], ['universal editor', universalEditor]] as const) {
  assert.doesNotMatch(source, /\['super_admin',\s*'staff_operator'\]\.includes\(role\)/,
    `${name} must not hide edit access based on a hard-coded role-name allowlist`);
}
assert.match(liveBar, /canAccessAdminPortal\(role,\s*permissions\)/,
  'Admin live navigation uses the central permission-aware Admin access rule');
assert.match(liveBar, /canUseUniversalQuickEdit\(permissions\)/,
  'the visual edit switch requires a content mutation permission');
assert.match(sectionBadge, /canAccessAdminPortal\(role,\s*permissions\)/,
  'section controls use the active permission-aware Admin access rule');
assert.match(universalEditor, /canUseUniversalQuickEdit\(permissions\)/,
  'Universal Quick Edit uses the current permission-based edit gate');

console.log('PASS: custom content/product/member editors can access the appropriate Quick Edit controls; view-only and member-only product roles stay restricted.');
