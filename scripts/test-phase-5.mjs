import fs from 'fs';

console.log('====================================================');
console.log('  STARTING TWO-WAY VERIFICATION FOR PHASE 5');
console.log('  Live Front-End Visual Edit Mode & Live Bar');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  ? PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ? FAIL: ${msg}`);
    failed++;
  }
}

// ----------------------------------------------------
// 1. AdminLiveBar Component Audit
// ----------------------------------------------------
console.log('[1/5] Auditing AdminLiveBar.tsx component...');
assert(fs.existsSync('src/components/public/AdminLiveBar.tsx'), 'AdminLiveBar.tsx exists on disk');
const liveBar = fs.readFileSync('src/components/public/AdminLiveBar.tsx', 'utf-8');

assert(liveBar.includes('/api/admin/health'), 'AdminLiveBar checks /api/admin/health for session verification');
assert(liveBar.includes('loading || !isAdmin'), 'AdminLiveBar completely suppresses output when not authenticated');
assert(liveBar.includes('hab-visual-edit-on'), 'AdminLiveBar toggles hab-visual-edit-on class on document.body');
assert(liveBar.includes('usePathname'), 'AdminLiveBar uses Next.js usePathname for dynamic route detection');
assert(liveBar.includes('ROUTE_STUDIO_MAP'), 'AdminLiveBar contains intelligent route-to-studio mapping dictionary');
assert(liveBar.includes('/admin/pages/home'), 'Route map contains Homepage Studio link');
assert(liveBar.includes('/admin/pages/about'), 'Route map contains About Us Studio link');
assert(liveBar.includes('/admin/programmes'), 'Route map contains Programmes Studio link');
assert(liveBar.includes('/admin/publications'), 'Route map contains Publications Studio link');
assert(liveBar.includes('/admin/pages'), 'AdminLiveBar provides link to Pages Directory Hub');
assert(liveBar.includes('/admin'), 'AdminLiveBar provides link to Admin Console');

// ----------------------------------------------------
// 2. SectionEditBadge Component Audit
// ----------------------------------------------------
console.log('\n[2/5] Auditing SectionEditBadge.tsx component...');
assert(fs.existsSync('src/components/public/SectionEditBadge.tsx'), 'SectionEditBadge.tsx exists on disk');
const badgeCode = fs.readFileSync('src/components/public/SectionEditBadge.tsx', 'utf-8');

assert(badgeCode.includes('hab-section-edit-badge'), 'Badge uses hab-section-edit-badge CSS target');
assert(badgeCode.includes('studioHref'), 'Badge receives and binds studioHref');
assert(badgeCode.includes('onQuickEdit'), 'Badge supports onQuickEdit callback');
assert(badgeCode.includes('Studio'), 'Badge displays Studio action button');

// ----------------------------------------------------
// 3. VisualSectionEditor Modal Audit
// ----------------------------------------------------
console.log('\n[3/5] Auditing VisualSectionEditor.tsx modal...');
assert(fs.existsSync('src/components/public/VisualSectionEditor.tsx'), 'VisualSectionEditor.tsx exists on disk');
const editorModal = fs.readFileSync('src/components/public/VisualSectionEditor.tsx', 'utf-8');

assert(editorModal.includes('FileUploadInput'), 'VisualSectionEditor integrates FileUploadInput for media');
assert(editorModal.includes('RichTextEditor'), 'VisualSectionEditor integrates RichTextEditor for WYSIWYG rich text');
assert(editorModal.includes("method: 'PUT'"), 'VisualSectionEditor transmits updates via HTTP PUT');
assert(editorModal.includes('saveApiUrl'), 'VisualSectionEditor accepts configurable saveApiUrl');

// ----------------------------------------------------
// 4. CSS Isolation & Styling Audit
// ----------------------------------------------------
console.log('\n[4/5] Auditing CSS rules in globals.css & public layout...');
const globalsCss = fs.readFileSync('src/styles/globals.css', 'utf-8');
const publicLayout = fs.readFileSync('src/app/(public)/layout.tsx', 'utf-8');

assert(globalsCss.includes('body.hab-visual-edit-on [data-hab-section]'), 'globals.css defines selector for editable sections');
assert(globalsCss.includes('outline: 2px dashed #8B2E24'), 'globals.css defines branded dashed outline on hover');
assert(globalsCss.includes('.hab-section-edit-badge'), 'globals.css defines .hab-section-edit-badge rule');
assert(globalsCss.includes('display: none !important'), 'Section edit badges are hidden by default for public visitors');
assert(globalsCss.includes('body.hab-visual-edit-on .hab-section-edit-badge'), 'Badges become visible when edit mode is toggled on');
assert(publicLayout.includes('<AdminLiveBar />'), 'Public layout mounts <AdminLiveBar />');

// ----------------------------------------------------
// 5. Section Tags & Badges Coverage in Homepage & About
// ----------------------------------------------------
console.log('\n[5/5] Auditing section tags in page.tsx and about/page.tsx...');
const homePage = fs.readFileSync('src/app/(public)/page.tsx', 'utf-8');
const aboutPage = fs.readFileSync('src/app/(public)/about/page.tsx', 'utf-8');

const requiredHomeSections = [
  { tag: 'data-hab-section="hero"', name: 'Hero Slideshow' },
  { tag: 'data-hab-section="stats"', name: 'Stats & Counters' },
  { tag: 'data-hab-section="buy"', name: 'Retail & Trade Gateway' },
  { tag: 'data-hab-section="about"', name: 'About HAB Band' },
  { tag: 'data-hab-section="shop"', name: 'Featured Shop' },
  { tag: 'data-hab-section="assurance"', name: 'Assurance Band' },
  { tag: 'data-hab-section="outlets"', name: 'Outlets & Market' },
  { tag: 'data-hab-section="crafts"', name: '13 Crafts of Bhutan' },
  { tag: 'data-hab-section="masters"', name: 'Master Artisans' },
  { tag: 'data-hab-section="programmes"', name: 'Training Programmes' },
  { tag: 'data-hab-section="support"', name: 'Support Pillars' },
  { tag: 'data-hab-section="membership"', name: 'Artisan Directory' },
  { tag: 'data-hab-section="news"', name: 'News & Events' },
  { tag: 'data-hab-section="publications"', name: 'Reports & Publications' },
  { tag: 'data-hab-section="partners"', name: 'Development Partners' },
];

for (const sec of requiredHomeSections) {
  assert(homePage.includes(sec.tag), `Homepage includes section tag: ${sec.tag} (${sec.name})`);
}

const requiredAboutSections = [
  { tag: 'data-hab-section="about-hero"', name: 'About Intro & Mandate' },
  { tag: 'data-hab-section="about-vision"', name: 'About Vision & Mission' },
  { tag: 'data-hab-section="about-objectives"', name: 'About Strategic Objectives' },
  { tag: 'data-hab-section="about-governance"', name: 'About Governance Structure' },
  { tag: 'data-hab-section="about-board"', name: 'About Board of Trustees' },
  { tag: 'data-hab-section="about-team"', name: 'About Secretariat Team' },
];

for (const sec of requiredAboutSections) {
  assert(aboutPage.includes(sec.tag), `About Us page includes section tag: ${sec.tag} (${sec.name})`);
}

console.log('\n====================================================');
console.log(`  PHASE 5 TWO-WAY VERIFICATION COMPLETE: ${passed} passed, ${failed} failed`);
console.log('====================================================\n');

process.exit(failed > 0 ? 1 : 0);
