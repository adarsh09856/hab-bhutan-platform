import fs from 'fs';

const homePage = fs.readFileSync('src/app/(public)/page.tsx', 'utf-8');
const outletsPage = fs.readFileSync('src/app/(public)/outlets/page.tsx', 'utf-8');
const outletsBrowser = fs.readFileSync('src/components/public/OutletsBrowser.tsx', 'utf-8');
const programmesPage = fs.readFileSync('src/app/(public)/programmes/page.tsx', 'utf-8');
const clientCss = fs.readFileSync('src/styles/client-hab.css', 'utf-8');

console.log('====================================================');
console.log('  STARTING TWO-WAY VERIFICATION FOR PHASE 3');
console.log('  Public Site HTML Alignment: Image 1, Image 2 & Programmes A..K');
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

// -----------------------------------------------------------------
// 1. Image 2 Alignment: Physical Outlets & Clusters Structure
// -----------------------------------------------------------------
console.log('[1/3] Verifying Image 2 Alignment (Outlets & Clusters)...');

assert(homePage.includes('id="outlets"'), 'Section #outlets exists on homepage');
assert(homePage.includes('className="outlet-lead"'), 'Punakha Crafts Market lead card exists');
assert(homePage.includes("outlet.key === 'punakha-market'"), 'Featured market is selected from saved outlet records by key');
assert(outletsPage.includes('prisma.outletRecord.findMany'), 'Outlet directory is sourced from saved outlet records');
assert(outletsBrowser.includes('HAB validated'), 'Featured outlet is labelled as HAB validated');

// Verify 3-column outlets grid directly follows Punakha Market
const outletLeadPos = homePage.indexOf('className="outlet-lead"');
const outletGridPos = homePage.indexOf('className="grid grid--3"', outletLeadPos);
const clustersPos = homePage.indexOf('id="clusters"', outletGridPos);

assert(outletLeadPos > 0 && outletGridPos > outletLeadPos, '3-column outlets grid placed after Punakha lead card');
assert(clustersPos > outletGridPos, 'Artisan clusters section placed after 3-column outlets grid');

// Outlet copy is now data-driven and must not be coupled to historical seed names.
assert(homePage.includes('displayedOutlets.map'), 'Homepage renders saved outlet records from the outlet collection');
assert(homePage.includes("fetch('/api/outlets?shuffle=false'"), 'Homepage loads its outlet list from the public outlet API');
assert(outletsBrowser.includes('filteredOutlets.map') || outletsBrowser.includes('visibleOutlets.map'), 'Outlet directory renders its filtered saved records');

// -----------------------------------------------------------------
// 2. Image 1 Alignment: Reports & Publications + Development Partners
// -----------------------------------------------------------------
console.log('\n[2/3] Verifying Image 1 Alignment (Reports & Development Partners)...');

assert(homePage.includes('id="publications"'), 'Section #publications exists on homepage');
assert(homePage.includes('Accountability'), 'Publications section eyebrow is "Accountability"');
assert(homePage.includes('Reports &amp; publications') || homePage.includes('Reports & publications'), 'Publications heading matches Image 1');
assert(homePage.includes('All publications →'), 'Link "All publications →" present');
assert(homePage.includes('className="grid grid--2"'), '2-column publications card grid present');

// Verify Development Partners section
assert(homePage.includes('Development Partners'), 'Development Partners section present');
assert(clientCss.includes('grid-template-columns:repeat(6,1fr)'), 'CSS defines 6-column grid for partners');
assert(homePage.includes('partnersList.map'), 'Partners dynamically mapped from siteSettings.partnersList');

// -----------------------------------------------------------------
// 3. Programmes Uppercase Letter Badges (A through K)
// -----------------------------------------------------------------
console.log('\n[3/3] Verifying Programmes Clean Uppercase Letter Badges (A..K)...');

assert(programmesPage.includes('{String(p.ref || \'\').toUpperCase()}'), 'Programmes page uses clean uppercase letter badges');
assert(!programmesPage.includes('Art. 3.2({p.ref})'), 'Old developer jargon "Art. 3.2(a)" removed from programmes page');
assert(homePage.includes('{String(p.ref || \'\').toUpperCase()}'), 'Homepage programmes section uses clean uppercase letter badges');
assert(!homePage.includes('Art. 3.2({p.ref})'), 'Old developer jargon "Art. 3.2(a)" removed from homepage');

console.log('\n====================================================');
console.log(`  PHASE 3 TWO-WAY VERIFICATION COMPLETE: ${passed} passed, ${failed} failed`);
console.log('====================================================\n');

process.exit(failed > 0 ? 1 : 0);
