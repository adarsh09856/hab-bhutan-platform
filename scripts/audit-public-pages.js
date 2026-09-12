const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) res.push(...walk(p));
    else if (f.endsWith('page.tsx')) res.push(p);
  }
  return res;
}

const pages = walk('src/app/(public)');
console.log(`Total public pages found: ${pages.length}\n`);

const results = pages.map((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const hasFetch = content.includes('fetch(') || content.includes('fetchRate(');
  const hasPrisma = content.includes('prisma.');
  const usesClientData = content.includes('CLIENT_DATA') || content.includes('client-data');
  const usesStaticData = content.includes('@/lib/data');
  const isDynamic = content.includes("export const dynamic = 'force-dynamic'") || content.includes("'use client'");
  
  return {
    file: file.replace(/\\/g, '/'),
    isDynamic,
    hasFetch,
    hasPrisma,
    usesClientData,
    usesStaticData,
  };
});

console.log('PUBLIC PAGES WITH NO FETCH AND NO PRISMA (POTENTIALLY STATIC):');
const staticPages = results.filter(r => !r.hasFetch && !r.hasPrisma);
staticPages.forEach(p => console.log(' - ' + p.file + (p.usesClientData ? ' (uses CLIENT_DATA)' : '') + (p.usesStaticData ? ' (uses @/lib/data)' : '')));

console.log('\nPUBLIC PAGES WIRED TO DYNAMIC DATA (FETCH OR PRISMA):');
const dynamicPages = results.filter(r => r.hasFetch || r.hasPrisma);
dynamicPages.forEach(p => console.log(' - ' + p.file));
