import assert from 'node:assert/strict';
import fs from 'node:fs';

const badge = fs.readFileSync('src/components/public/SectionEditBadge.tsx', 'utf8');
const shopPages = [
  'src/app/(public)/shop/page.tsx',
  'src/app/(public)/shop/[craft]/page.tsx',
].map(path => fs.readFileSync(path, 'utf8'));

assert.match(badge, /compactAction\?:\s*\{\s*label\?:\s*string;\s*requiredPermissions\?:\s*string\[\];\s*onClick:\s*\(\)\s*=>\s*void\s*\}/,
  'section badges expose an explicit compact-action contract');
assert.match(badge, /\{canUseCompactAction\s*&&\s*compactAction\s*\?\s*\(/,
  'compact actions render instead of adding another Admin link beside the popup action');
assert.match(badge, /compactAction\.onClick\(\)/,
  'the compact-action button invokes the supplied editor callback');

for (const [index, source] of shopPages.entries()) {
  assert.match(source, /<ProductQuickEdit\s+isOpen=\{productEditorOpen\}/,
    `shop page ${index + 1} contains the existing compact product editor`);
  assert.match(source, /<SectionEditBadge[^>]*compactAction=\{\{\s*requiredPermissions:\s*\['products:view',\s*'products:edit'\],\s*onClick:\s*\(\)\s*=>\s*setProductEditorOpen\(true\)\s*\}\}/,
    `shop page ${index + 1} connects its Quick Edit action to the compact product editor`);
}

console.log('PASS: the shop and craft-catalogue Quick Edit badges open their existing compact product CRUD editor.');
