import fs from 'fs';

const globalsCss = fs.readFileSync('src/styles/globals.css', 'utf-8');
const adminCss = fs.readFileSync('src/styles/admin.css', 'utf-8');
const adminLayout = fs.readFileSync('src/app/(admin)/layout.tsx', 'utf-8');
const publicLayout = fs.readFileSync('src/app/(public)/layout.tsx', 'utf-8');

console.log('====================================================');
console.log('  STARTING TWO-WAY VERIFICATION FOR PHASE 1');
console.log('  Admin Light Theme Guarantee (Zero Cream, Zero Black)');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

assert(globalsCss.includes('#f8fafc !important'), 'globals.css locks admin containers to #f8fafc');
assert(globalsCss.includes('#0f172a !important'), 'globals.css locks admin text to high-contrast #0f172a');
assert(adminCss.includes('--admin-bg-base: #f8fafc'), 'admin.css defines --admin-bg-base: #f8fafc');
assert(adminCss.includes('--admin-surface: #ffffff'), 'admin.css defines --admin-surface: #ffffff');
assert(adminCss.includes('--admin-title: #0f172a'), 'admin.css defines --admin-title: #0f172a');
assert(adminCss.includes('--admin-border: #e2e8f0'), 'admin.css defines --admin-border: #e2e8f0');
assert(adminLayout.includes("backgroundColor='#f8fafc'"), 'admin root layout enforces #f8fafc background');
assert(publicLayout.includes('bg-[#F4F0E7]'), 'public layout preserves authentic cream #F4F0E7');
assert(!globalsCss.includes('background-color: #020617 !important'), 'no black background-color: #020617 forced on admin');

console.log('\n====================================================');
console.log(`  PHASE 1 TWO-WAY VERIFICATION COMPLETE: ${passed} passed, ${failed} failed`);
console.log('====================================================\n');

process.exit(failed > 0 ? 1 : 0);
