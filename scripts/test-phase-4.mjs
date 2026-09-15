import fs from 'fs';
import path from 'path';

const layoutContent = fs.readFileSync('src/app/(admin)/admin/layout.tsx', 'utf-8');
const pagesHubContent = fs.readFileSync('src/app/(admin)/admin/pages/page.tsx', 'utf-8');

console.log('====================================================');
console.log('  STARTING TWO-WAY VERIFICATION FOR PHASE 4');
console.log('  WordPress-Style Admin Navigation & Architecture');
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

// ----------------------------------------------------
// 1. Verify 5 Main Navigation Categories
// ----------------------------------------------------
console.log('[1/3] Verifying 5 Sidebar Categories in admin layout...');

const requiredGroups = [
  '1. Website Pages',
  '2. Shop & E-Commerce',
  '3. Artisans & Community',
  '4. Settings & Customization',
  '5. Overview & Reports'
];

for (const grp of requiredGroups) {
  assert(layoutContent.includes(grp), `Sidebar includes category: "${grp}"`);
}

// ----------------------------------------------------
// 2. Verify Complete Set of Admin Module Routes (0 Lost Modules)
// ----------------------------------------------------
console.log('\n[2/3] Auditing all Admin Directories & Page Files...');

const adminRoutes = [
  { name: 'Admin Dashboard', path: 'src/app/(admin)/admin/page.tsx' },
  { name: 'Pages Hub', path: 'src/app/(admin)/admin/pages/page.tsx' },
  { name: 'Homepage Studio', path: 'src/app/(admin)/admin/pages/home/page.tsx' },
  { name: 'About Us Studio', path: 'src/app/(admin)/admin/pages/about/page.tsx' },
  { name: 'Hero Slideshow', path: 'src/app/(admin)/admin/hero/page.tsx' },
  { name: 'Programmes Studio', path: 'src/app/(admin)/admin/programmes/page.tsx' },
  { name: 'Donor Projects', path: 'src/app/(admin)/admin/projects/page.tsx' },
  { name: 'Outlets & Clusters', path: 'src/app/(admin)/admin/clusters-outlets/page.tsx' },
  { name: 'Honours & Masters', path: 'src/app/(admin)/admin/honours/page.tsx' },
  { name: 'Reports & Publications', path: 'src/app/(admin)/admin/publications/page.tsx' },
  { name: 'News & Stories', path: 'src/app/(admin)/admin/content/page.tsx' },
  { name: 'Exhibitions & Events', path: 'src/app/(admin)/admin/events/page.tsx' },
  { name: 'Donations & Giving', path: 'src/app/(admin)/admin/donate-settings/page.tsx' },
  { name: 'Wholesale Trade B2B', path: 'src/app/(admin)/admin/trade/page.tsx' },
  { name: 'Inquiries & Messages', path: 'src/app/(admin)/admin/inquiries/page.tsx' },
  { name: 'Policies & Legal', path: 'src/app/(admin)/admin/policies/page.tsx' },
  { name: '13 Crafts Zorig Chusum', path: 'src/app/(admin)/admin/crafts/page.tsx' },
  { name: 'Orders Management', path: 'src/app/(admin)/admin/orders/page.tsx' },
  { name: 'POS Counter Checkout', path: 'src/app/(admin)/admin/pos/page.tsx' },
  { name: 'Products Catalog', path: 'src/app/(admin)/admin/products/page.tsx' },
  { name: 'Payment Settings', path: 'src/app/(admin)/admin/payments/page.tsx' },
  { name: 'Wholesale Portal', path: 'src/app/(admin)/admin/wholesale/page.tsx' },
  { name: 'Artisan Members Directory', path: 'src/app/(admin)/admin/members/page.tsx' },
  { name: 'Member Applications Queue', path: 'src/app/(admin)/admin/applications/page.tsx' },
  { name: 'Membership Categories', path: 'src/app/(admin)/admin/membership-categories/page.tsx' },
  { name: 'Membership Dues & Settings', path: 'src/app/(admin)/admin/membership-settings/page.tsx' },
  { name: 'Website Global Settings', path: 'src/app/(admin)/admin/site-settings/page.tsx' },
  { name: 'Typography Styler', path: 'src/app/(admin)/admin/styling/page.tsx' },
  { name: 'Navigation Menus', path: 'src/app/(admin)/admin/navigation/page.tsx' },
  { name: 'Media Asset Library', path: 'src/app/(admin)/admin/media/page.tsx' },
  { name: 'Currency & Language', path: 'src/app/(admin)/admin/localization/page.tsx' },
  { name: 'Staff User Logins', path: 'src/app/(admin)/admin/users/page.tsx' },
  { name: 'Analytics & Reports', path: 'src/app/(admin)/admin/reports/page.tsx' },
  { name: 'System Diagnostics', path: 'src/app/(admin)/admin/settings/page.tsx' },
];

for (const mod of adminRoutes) {
  const fileExists = fs.existsSync(mod.path);
  assert(fileExists, `Module page exists on disk: ${mod.name} (${mod.path})`);
}

// ----------------------------------------------------
// 3. Verify Pages Directory Hub Listing
// ----------------------------------------------------
console.log('\n[3/3] Verifying Central Pages Hub (/admin/pages)...');

const requiredHubPages = [
  'Homepage (A to Z)',
  'About Us',
  'Training Programmes',
  'Donor Projects',
  'Outlets & Artisan Clusters',
  'Master Artisans & Honours',
  'Membership Information',
  'News & Stories',
  'Exhibitions & Events',
  'Reports & Publications',
  'Donations & Support Appeals',
  'B2B Wholesale & Trade'
];

for (const pageTitle of requiredHubPages) {
  assert(pagesHubContent.includes(pageTitle), `Pages Hub includes: "${pageTitle}"`);
}

assert(pagesHubContent.includes('publicPath'), 'Pages Hub contains public destination links');
assert(pagesHubContent.includes('adminHref'), 'Pages Hub contains admin studio editor links');

console.log('\n====================================================');
console.log(`  PHASE 4 TWO-WAY VERIFICATION COMPLETE: ${passed} passed, ${failed} failed`);
console.log('====================================================\n');

process.exit(failed > 0 ? 1 : 0);
