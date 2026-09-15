import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runPhase8Tests() {
  console.log('====================================================');
  console.log('  STARTING TWO-WAY VERIFICATION FOR PHASE 8');
  console.log('  End-to-End Build & Compilation Verification');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✔ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✖ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // 1. Next.js Production Build Artifacts Audit
    // ----------------------------------------------------
    console.log('[1/6] Auditing Next.js production build artifacts (.next)...');
    assert(fs.existsSync('.next'), '.next build output directory exists');
    assert(fs.existsSync('.next/BUILD_ID'), '.next/BUILD_ID exists');
    assert(fs.existsSync('.next/routes-manifest.json'), '.next/routes-manifest.json exists');
    assert(fs.existsSync('.next/prerender-manifest.json'), '.next/prerender-manifest.json exists');
    assert(fs.existsSync('.next/server'), '.next/server directory exists');
    assert(fs.existsSync('.next/static'), '.next/static client bundle directory exists');

    // ----------------------------------------------------
    // 2. Public Front-End Routes Audit
    // ----------------------------------------------------
    console.log('\n[2/6] Auditing public front-end routes...');
    const publicRoutes = [
      'src/app/(public)/page.tsx',
      'src/app/(public)/about/page.tsx',
      'src/app/(public)/programmes/page.tsx',
      'src/app/(public)/clusters/page.tsx',
      'src/app/(public)/masters/page.tsx',
      'src/app/(public)/news/page.tsx',
      'src/app/(public)/publications/page.tsx',
      'src/app/(public)/donate/page.tsx',
      'src/app/(public)/shop/page.tsx',
    ];

    for (const route of publicRoutes) {
      assert(fs.existsSync(route), `Public route exists: ${route}`);
    }

    const publicLayout = fs.readFileSync('src/app/(public)/layout.tsx', 'utf-8');
    assert(publicLayout.includes('AdminLiveBar'), 'Public layout integrates AdminLiveBar for logged-in admins');
    assert(publicLayout.includes('DesignTweaks'), 'Public layout integrates DesignTweaks for typography and styling engine');

    // ----------------------------------------------------
    // 3. Admin WordPress-Style Studios Audit
    // ----------------------------------------------------
    console.log('\n[3/6] Auditing WordPress-style admin studios...');
    const adminStudios = [
      'src/app/(admin)/admin/pages/page.tsx',
      'src/app/(admin)/admin/pages/home/page.tsx',
      'src/app/(admin)/admin/pages/about/page.tsx',
      'src/app/(admin)/admin/programmes/page.tsx',
      'src/app/(admin)/admin/clusters-outlets/page.tsx',
      'src/app/(admin)/admin/honours/page.tsx',
      'src/app/(admin)/admin/content/page.tsx',
      'src/app/(admin)/admin/publications/page.tsx',
      'src/app/(admin)/admin/donate-settings/page.tsx',
      'src/app/(admin)/admin/policies/page.tsx',
      'src/app/(admin)/admin/products/page.tsx',
      'src/app/(admin)/admin/styling/page.tsx',
    ];

    for (const studio of adminStudios) {
      assert(fs.existsSync(studio), `Admin studio exists: ${studio}`);
    }

    const adminLayout = fs.readFileSync('src/app/(admin)/admin/layout.tsx', 'utf-8');
    assert(adminLayout.includes('hab-admin'), 'Admin layout includes hab-admin CSS isolation container');
    assert(adminLayout.includes('/admin/pages'), 'Admin layout includes Pages Hub navigation link');
    assert(adminLayout.includes('/admin/styling'), 'Admin layout includes Typography & Styling navigation link');

    // ----------------------------------------------------
    // 4. API Endpoints Audit
    // ----------------------------------------------------
    console.log('\n[4/6] Auditing API endpoints...');
    const apiEndpoints = [
      'src/app/api/admin/governance/route.ts',
      'src/app/api/admin/publications/route.ts',
      'src/app/api/admin/upload/route.ts',
      'src/app/api/admin/site-settings/route.ts',
      'src/app/api/site-settings/route.ts',
      'src/app/api/admin/hero-slides/route.ts',
      'src/app/api/admin/clusters/route.ts',
      'src/app/api/admin/outlets/route.ts',
      'src/app/api/admin/honours/route.ts',
      'src/app/api/admin/content/route.ts',
      'src/app/api/admin/policies/route.ts',
    ];

    for (const endpoint of apiEndpoints) {
      assert(fs.existsSync(endpoint), `API endpoint exists: ${endpoint}`);
    }

    // ----------------------------------------------------
    // 5. Universal Reusable Components Audit
    // ----------------------------------------------------
    console.log('\n[5/6] Auditing universal reusable components...');
    const universalComponents = [
      'src/components/admin/FileUploadInput.tsx',
      'src/components/admin/RichTextEditor.tsx',
      'src/components/public/AdminLiveBar.tsx',
      'src/components/public/SectionEditBadge.tsx',
      'src/components/public/VisualSectionEditor.tsx',
      'src/components/public/DesignTweaks.tsx',
    ];

    for (const comp of universalComponents) {
      assert(fs.existsSync(comp), `Universal component exists: ${comp}`);
    }

    // ----------------------------------------------------
    // 6. Live Database Connectivity & Data Integrity
    // ----------------------------------------------------
    console.log('\n[6/6] Auditing live database models & records...');
    const counts = {
      siteSettings: await prisma.siteSetting.count(),
      heroSlides: await prisma.heroSlide.count(),
      governance: await prisma.governanceRecord.count(),
      programmes: await prisma.programmePillar.count(),
      outlets: await prisma.outletRecord.count(),
      honours: await prisma.honourRecord.count(),
      publications: await prisma.publication.count(),
      supportPillars: await prisma.supportPillar.count(),
      policies: await prisma.policyPage.count(),
      products: await prisma.product.count(),
    };

    assert(counts.siteSettings > 0, `SiteSetting records: ${counts.siteSettings}`);
    assert(counts.heroSlides > 0, `HeroSlide records: ${counts.heroSlides}`);
    assert(counts.governance > 0, `GovernanceRecord records: ${counts.governance}`);
    assert(counts.programmes > 0, `ProgrammePillar records: ${counts.programmes}`);
    assert(counts.outlets > 0, `OutletRecord records: ${counts.outlets}`);
    assert(counts.honours > 0, `HonourRecord records: ${counts.honours}`);
    assert(counts.publications > 0, `Publication records: ${counts.publications}`);
    assert(counts.supportPillars > 0, `SupportPillar records: ${counts.supportPillars}`);
    assert(counts.policies > 0, `PolicyPage records: ${counts.policies}`);
    assert(counts.products > 0, `Product records: ${counts.products}`);

    console.log('\n====================================================');
    console.log(`  PHASE 8 TWO-WAY VERIFICATION COMPLETE: ${passed} passed, ${failed} failed`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('Phase 8 verification error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runPhase8Tests();
