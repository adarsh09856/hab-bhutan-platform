import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TRANSLATIONS } from '../src/context/LanguageContext';

const pages = [
  join(process.cwd(), 'src/app/(public)/shop/page.tsx'),
  join(process.cwd(), 'src/app/(public)/shop/[craft]/page.tsx'),
];

const keys = new Set<string>();
for (const page of pages) {
  const source = readFileSync(page, 'utf8');
  for (const match of source.matchAll(/\bt\('([^']+)'\)/g)) keys.add(match[1]);
}

for (const key of keys) {
  const translation = TRANSLATIONS[key];
  assert.ok(translation, `${key} must exist in the shared language dictionary`);
  assert.ok(translation.en.trim(), `${key} must have English copy`);
  assert.ok(translation.dz.trim(), `${key} must have Dzongkha copy`);
}

assert.ok(keys.size >= 25, 'Both shop routes should use the bilingual dictionary for core controls');
console.log(`PASS: ${keys.size} shop translation keys have English and Dzongkha copy.`);
