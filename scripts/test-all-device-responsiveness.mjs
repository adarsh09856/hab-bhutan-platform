import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    totalPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    totalFailed++;
  }
}

async function runDeviceResponsiveAudit() {
  console.log('================================================================');
  console.log('  HAB BHUTAN — COMPREHENSIVE MULTI-DEVICE RESPONSIVENESS SUITE  ');
  console.log('================================================================\n');

  // 1. Root Viewport Configuration Test
  console.log('>>> 1. AUDITING ROOT HTML VIEWPORT & STABILITY LAYER');
  {
    const rootLayout = fs.readFileSync(path.join(rootDir, 'src/app/layout.tsx'), 'utf-8');
    assert(rootLayout.includes('export const viewport: Viewport'), 'Root layout exports Next.js Viewport object');
    assert(rootLayout.includes("width: 'device-width'"), 'Viewport specifies device-width');
    assert(rootLayout.includes("initialScale: 1"), 'Viewport sets initialScale: 1');
    assert(rootLayout.includes("viewportFit: 'cover'"), 'Viewport sets viewportFit: cover (notch / dynamic island safe)');
    assert(rootLayout.includes("themeColor: '#8B2E24'"), 'Viewport sets themeColor to HAB brand crimson');

    const publicLayout = fs.readFileSync(path.join(rootDir, 'src/app/(public)/layout.tsx'), 'utf-8');
    assert(publicLayout.includes('overflow-x-clip'), 'Public layout root has overflow-x-clip to prevent side-scrolling');
    assert(publicLayout.includes('hab-public-shell') && publicLayout.includes('overflow-x-clip'), 'hab-public-shell has overflow-x-clip');

    const globalsCss = fs.readFileSync(path.join(rootDir, 'src/styles/globals.css'), 'utf-8');
    assert(globalsCss.includes('overflow-x: clip'), 'globals.css enforces overflow-x: clip on html and body');
    assert(globalsCss.includes('max-width: 100%'), 'globals.css enforces max-width: 100% on body');
    assert(globalsCss.includes('font-size: 16px !important'), 'globals.css prevents iOS Safari 16px input zoom on mobile');
  }

  // 2. Public Storefront Navigation & Header Breakpoints
  console.log('\n>>> 2. AUDITING PUBLIC NAVIGATION & HEADER RESPONSIVENESS (< 1191px, < 639px, < 380px)');
  {
    const clientCss = fs.readFileSync(path.join(rootDir, 'src/styles/client-hab.css'), 'utf-8');
    const header = fs.readFileSync(path.join(rootDir, 'src/components/public/Header.tsx'), 'utf-8');
    assert(header.includes('mobile-drawer-portal') && header.includes("height: '100dvh'") && header.includes('overflow-y-auto'),
      'Mobile navigation uses a viewport-height, scrollable drawer');
    assert(header.includes('aria-expanded={mobileNavOpen}') && header.includes('aria-controls="primaryNav"'),
      'Mobile hamburger exposes its expanded state and controlled navigation');
    assert(clientCss.includes('.nav-toggle{display:flex !important') && clientCss.includes('width:38px;height:38px'),
      'Mobile hamburger is shown at phone breakpoints and keeps the compact reference-sized control');
    assert(clientCss.includes('.menu__panel--wide{') && clientCss.includes('width:min(440px,calc(100vw - 20px))'), 
      'Shop dropdown overlay panel safely constrained to mobile viewport');
    assert(clientCss.includes('@media (max-width:380px)'), 
      'Extra-small phone breakpoint (@media max-width: 380px) defined for compact screens');
  }

  // 3. Touch Gestures & Interactive Components
  console.log('\n>>> 3. AUDITING TOUCH INTERACTIONS & HERO SLIDER');
  {
    const heroSlider = fs.readFileSync(path.join(rootDir, 'src/components/public/HeroSlider.tsx'), 'utf-8');
    assert(heroSlider.includes('touchStartX') && heroSlider.includes('handleTouchStart'), 
      'HeroSlider tracks touch coordinates on mobile');
    assert(heroSlider.includes('handleTouchEnd') && (heroSlider.includes('next()') || heroSlider.includes('prev()')), 
      'HeroSlider supports finger swipe gestures left and right');
    assert(heroSlider.includes('onTouchStart={handleTouchStart}'), 
      'HeroSlider binds onTouchStart listener');
    assert(heroSlider.includes('onTouchEnd={handleTouchEnd}'), 
      'HeroSlider binds onTouchEnd listener');
  }

  // 4. Checkout, Donation & Basket Mobile Ergonomics
  console.log('\n>>> 4. AUDITING DONATION, BASKET & CHECKOUT ON MOBILE');
  {
    const clientCss = fs.readFileSync(path.join(rootDir, 'src/styles/client-hab.css'), 'utf-8');
    assert(clientCss.includes('.paymethod__head{padding:12px 14px;flex-wrap:wrap;gap:8px}'), 
      'Payment methods accordion header wraps gracefully on mobile phones');
    assert(clientCss.includes('.paymethod__body{padding:0 14px 16px 14px}'), 
      'Payment methods accordion body reduces side padding on mobile for maximum input width');
    assert(clientCss.includes('.basketline{display:grid;grid-template-columns:72px 1fr;gap:10px 12px;padding:14px;align-items:start}'),
      'Basket line items reflow into a compact two-column mobile layout');
    assert(clientCss.includes('.basketline__remove{grid-column:2;min-height:36px'),
      'Basket remove action remains touch-accessible in the mobile layout');
  }

  // 5. Admin Console Universal Responsiveness
  console.log('\n>>> 5. AUDITING ADMIN CONSOLE MULTI-DEVICE ARCHITECTURE');
  {
    const adminCss = fs.readFileSync(path.join(rootDir, 'src/styles/admin.css'), 'utf-8');
    assert(adminCss.includes('.hab-admin div:has(> table)'), 
      'Admin console applies universal :has(> table) responsive horizontal scroll containment');
    assert(adminCss.includes('.hab-admin .admin-modal') && adminCss.includes('max-height: 92dvh'), 
      'Admin modals constrained to max-height 92dvh with internal scroll');
    assert(adminCss.includes('max-width: min(100%, 96vw)'), 
      'Admin modals constrained to max-width 96vw so they never clip off mobile screens');

    const adminLayout = fs.readFileSync(path.join(rootDir, 'src/app/(admin)/admin/layout.tsx'), 'utf-8');
    assert(adminLayout.includes('admin-sidebar-toggle') && adminLayout.includes('min-w-[44px] min-h-[44px]'), 
      'Admin hamburger toggle has 44px min touch target');
    assert(adminLayout.includes('admin-sidebar-close') && adminLayout.includes('min-w-[44px] min-h-[44px]'), 
      'Admin sidebar close button has 44px min touch target');
    assert(adminLayout.includes('fixed inset-y-0 left-0 z-50 w-72'), 
      'Admin sidebar transforms into fixed off-canvas drawer on screens < lg');
  }

  // 6. Grid Reflows & Breakpoint Consistency
  console.log('\n>>> 6. AUDITING RESPONSIVE GRID REFLOWS ACROSS STOREFRONT');
  {
    const clientCss = fs.readFileSync(path.join(rootDir, 'src/styles/client-hab.css'), 'utf-8');
    assert(clientCss.includes('.grid--4{grid-template-columns:repeat(3,1fr)}'), 
      '4-column grid reflows to 3 columns on tablet landscape');
    assert(clientCss.includes('.grid--3,.grid--4{grid-template-columns:repeat(2,1fr)}'), 
      '4-column and 3-column grids reflow to 2 columns on tablet portrait');
    assert(clientCss.includes('.grid--2,.grid--3,.grid--4,.grid--auto{grid-template-columns:1fr}'), 
      'All multi-column grids collapse to 1 column on mobile phones (< 639px)');
  }

  console.log('\n================================================================');
  console.log(`MULTI-DEVICE AUDIT RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('================================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runDeviceResponsiveAudit().catch((err) => {
  console.error('Fatal error in responsive test:', err);
  process.exit(1);
});
