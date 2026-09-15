import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('====================================================');
console.log('  STARTING TWO-WAY VERIFICATION FOR PHASE 6');
console.log('  Step-by-Step Upgrade of Page Studios with Full CRUD');
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

async function runPhase6Tests() {
  try {
    // ----------------------------------------------------
    // 1. Audit All 10 Page Studio Files
    // ----------------------------------------------------
    console.log('[1/4] Auditing all 10 Page Studio components on disk...');

    const studios = [
      { id: '6A', name: 'Homepage Studio', path: 'src/app/(admin)/admin/pages/home/page.tsx', hasRichText: true, hasUpload: true },
      { id: '6B', name: 'About Us Studio', path: 'src/app/(admin)/admin/pages/about/page.tsx', hasRichText: true, hasUpload: false },
      { id: '6C', name: 'Programmes Studio', path: 'src/app/(admin)/admin/programmes/page.tsx', hasRichText: true, hasUpload: false },
      { id: '6D', name: 'Outlets & Clusters Studio', path: 'src/app/(admin)/admin/clusters-outlets/page.tsx', hasRichText: true, hasUpload: false },
      { id: '6E', name: 'Honours & Masters Studio', path: 'src/app/(admin)/admin/honours/page.tsx', hasRichText: true, hasUpload: true },
      { id: '6F', name: 'News & Editorial Studio', path: 'src/app/(admin)/admin/content/page.tsx', hasRichText: true, hasUpload: true },
      { id: '6G', name: 'Publications Studio', path: 'src/app/(admin)/admin/publications/page.tsx', hasRichText: true, hasUpload: true },
      { id: '6H', name: 'Donations Studio', path: 'src/app/(admin)/admin/donate-settings/page.tsx', hasRichText: true, hasUpload: false },
      { id: '6I', name: 'Policies Studio', path: 'src/app/(admin)/admin/policies/page.tsx', hasRichText: true, hasUpload: false },
      { id: '6J', name: 'Products Catalog Studio', path: 'src/app/(admin)/admin/products/page.tsx', hasRichText: true, hasUpload: true },
    ];

    for (const st of studios) {
      assert(fs.existsSync(st.path), `Studio ${st.id} exists: ${st.name} (${st.path})`);
      const code = fs.readFileSync(st.path, 'utf-8');
      if (st.hasRichText) {
        assert(code.includes('RichTextEditor'), `Studio ${st.id} integrates RichTextEditor`);
      }
      if (st.hasUpload) {
        assert(code.includes('FileUploadInput'), `Studio ${st.id} integrates FileUploadInput`);
      }
    }

    // ----------------------------------------------------
    // 2. Audit Backend API Routes for Studios
    // ----------------------------------------------------
    console.log('\n[2/4] Auditing Backend API routes and CRUD methods...');

    const apiRoutes = [
      { name: 'Hero Slides API', path: 'src/app/api/admin/hero-slides/route.ts', required: ['GET', 'POST'] },
      { name: 'Hero Slide Item API', path: 'src/app/api/admin/hero-slides/[id]/route.ts', required: ['PUT', 'DELETE'] },
      { name: 'Site Settings API', path: 'src/app/api/admin/site-settings/route.ts', required: ['GET', 'PUT'] },
      { name: 'Governance API', path: 'src/app/api/admin/governance/route.ts', required: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'Programmes API', path: 'src/app/api/admin/programmes/route.ts', required: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'Clusters API', path: 'src/app/api/admin/clusters/route.ts', required: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'Outlets API', path: 'src/app/api/admin/outlets/route.ts', required: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'Honours API', path: 'src/app/api/admin/honours/route.ts', required: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'News Content API', path: 'src/app/api/admin/content/route.ts', required: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'Publications API', path: 'src/app/api/admin/publications/route.ts', required: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'Support Pillars API', path: 'src/app/api/admin/support-pillars/route.ts', required: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'Policies API', path: 'src/app/api/admin/policies/route.ts', required: ['GET', 'PATCH'] },
      { name: 'Products API', path: 'src/app/api/admin/products/route.ts', required: ['GET', 'POST', 'PUT', 'DELETE'] },
    ];

    for (const r of apiRoutes) {
      assert(fs.existsSync(r.path), `Route handler exists: ${r.name} (${r.path})`);
      const c = fs.readFileSync(r.path, 'utf-8');
      for (const m of r.required) {
        assert(c.includes('export async function ' + m) || c.includes('export const ' + m), `${r.name} implements HTTP ${m}`);
      }
    }

    // ----------------------------------------------------
    // 3. Live Two-Way Database CRUD Verification
    // ----------------------------------------------------
    console.log('\n[3/4] Testing live database CRUD cycles for all studio entities...');

    // 3A: Hero Slide CRUD
    const testSlide = await prisma.heroSlide.create({
      data: {
        imageUrl: '/assets/photos/test-slide.jpg',
        caption: 'Test Slide Caption',
        altText: 'Test Slide Alt',
        sortOrder: 999,
        isActive: true,
      },
    });
    assert(testSlide.id, '6A Hero Slide: Created test record in database');

    const updatedSlide = await prisma.heroSlide.update({
      where: { id: testSlide.id },
      data: { caption: 'Updated Slide Caption' },
    });
    assert(updatedSlide.caption === 'Updated Slide Caption', '6A Hero Slide: Updated record in database');

    await prisma.heroSlide.delete({ where: { id: testSlide.id } });
    const checkSlide = await prisma.heroSlide.findUnique({ where: { id: testSlide.id } });
    assert(checkSlide === null, '6A Hero Slide: Deleted record and verified cleanup');

    // 3B: Governance (About) CRUD
    const testGov = await prisma.governanceRecord.create({
      data: {
        category: 'BOARD_OF_TRUSTEES',
        roleTitle: 'Test Trustee',
        individualName: 'Dasho Test Person',
        chapterOrNote: 'Royal Representative',
        sortOrder: 999,
      },
    });
    assert(testGov.id, '6B Governance: Created test record in database');

    const updatedGov = await prisma.governanceRecord.update({
      where: { id: testGov.id },
      data: { individualName: 'Dasho Updated Name' },
    });
    assert(updatedGov.individualName === 'Dasho Updated Name', '6B Governance: Updated record in database');

    await prisma.governanceRecord.delete({ where: { id: testGov.id } });
    const checkGov = await prisma.governanceRecord.findUnique({ where: { id: testGov.id } });
    assert(checkGov === null, '6B Governance: Deleted record and verified cleanup');

    // 3C: Programmes Pillar CRUD
    const testProg = await prisma.programmePillar.create({
      data: {
        ref: 'Z_TEST',
        title: 'Test Programme Pillar',
        description: 'Test description for statutory programme',
        activities: ['Activity 1', 'Activity 2'],
        sortOrder: 999,
        isActive: true,
      },
    });
    assert(testProg.id, '6C Programme: Created test record in database');

    const updatedProg = await prisma.programmePillar.update({
      where: { id: testProg.id },
      data: { title: 'Updated Programme Title' },
    });
    assert(updatedProg.title === 'Updated Programme Title', '6C Programme: Updated record in database');

    await prisma.programmePillar.delete({ where: { id: testProg.id } });
    const checkProg = await prisma.programmePillar.findUnique({ where: { id: testProg.id } });
    assert(checkProg === null, '6C Programme: Deleted record and verified cleanup');

    // 3D: Outlets CRUD
    const testOutlet = await prisma.outletRecord.create({
      data: {
        key: 'test-outlet-phase6',
        name: 'Test Outlet Shop',
        place: 'Paro International Airport',
        description: 'Test outlet description',
        longDescription: 'Detailed outlet description',
        hours: '08:00 - 20:00',
        sortOrder: 999,
        isFeatured: false,
      },
    });
    assert(testOutlet.id, '6D Outlet: Created test record in database');

    const updatedOutlet = await prisma.outletRecord.update({
      where: { id: testOutlet.id },
      data: { hours: '07:00 - 22:00' },
    });
    assert(updatedOutlet.hours === '07:00 - 22:00', '6D Outlet: Updated record in database');

    await prisma.outletRecord.delete({ where: { id: testOutlet.id } });
    const checkOutlet = await prisma.outletRecord.findUnique({ where: { id: testOutlet.id } });
    assert(checkOutlet === null, '6D Outlet: Deleted record and verified cleanup');

    // 3E: Honours CRUD
    const testHonour = await prisma.honourRecord.create({
      data: {
        name: 'Aum Test Weaver',
        craft: 'thagzo',
        dzongkhag: 'Lhuentse',
        awardType: 'NationalMaster',
        yearAwarded: 2026,
        citation: 'Mastery in Kishuthara intricate patterning',
        sortOrder: 999,
        isActive: true,
      },
    });
    assert(testHonour.id, '6E Honour: Created test record in database');

    const updatedHonour = await prisma.honourRecord.update({
      where: { id: testHonour.id },
      data: { citation: 'Updated citation recognition' },
    });
    assert(updatedHonour.citation === 'Updated citation recognition', '6E Honour: Updated record in database');

    await prisma.honourRecord.delete({ where: { id: testHonour.id } });
    const checkHonour = await prisma.honourRecord.findUnique({ where: { id: testHonour.id } });
    assert(checkHonour === null, '6E Honour: Deleted record and verified cleanup');

    // 3F: Publications CRUD
    const testPub = await prisma.publication.create({
      data: {
        title: 'HAB Annual Report 2026 Phase 6 Test',
        kind: 'Annual reports',
        year: 2026,
        metaDetails: 'PDF - 4.5 MB',
        fileUrl: '/uploads/annual-report-2026.pdf',
        isFeatured: false,
      },
    });
    assert(testPub.id, '6G Publication: Created test record in database');

    const updatedPub = await prisma.publication.update({
      where: { id: testPub.id },
      data: { isFeatured: true },
    });
    assert(updatedPub.isFeatured === true, '6G Publication: Updated record in database');

    await prisma.publication.delete({ where: { id: testPub.id } });
    const checkPub = await prisma.publication.findUnique({ where: { id: testPub.id } });
    assert(checkPub === null, '6G Publication: Deleted record and verified cleanup');

    // 3G: Support Pillars (Donations) CRUD
    const testSupport = await prisma.supportPillar.create({
      data: {
        key: 'test_pillar_6',
        iconEmoji: 'leaf',
        title: 'Test Support Pillar',
        description: 'Empowering grassroots artisans across all dzongkhags',
        targetAmountUSD: 50000,
        raisedAmountUSD: 12000,
        sortOrder: 999,
        isActive: true,
      },
    });
    assert(testSupport.id, '6H Support Pillar: Created test record in database');

    const updatedSupport = await prisma.supportPillar.update({
      where: { id: testSupport.id },
      data: { raisedAmountUSD: 15000 },
    });
    assert(updatedSupport.raisedAmountUSD === 15000, '6H Support Pillar: Updated record in database');

    await prisma.supportPillar.delete({ where: { id: testSupport.id } });
    const checkSupport = await prisma.supportPillar.findUnique({ where: { id: testSupport.id } });
    assert(checkSupport === null, '6H Support Pillar: Deleted record and verified cleanup');

    // 3H: Policy CRUD
    const testPolicy = await prisma.policyPage.upsert({
      where: { slug: 'test-phase6-policy' },
      update: { title: 'Test Policy Updated', content: '<p>Updated content</p>' },
      create: { slug: 'test-phase6-policy', title: 'Test Policy', content: '<p>Initial policy content</p>' },
    });
    assert(testPolicy.id, '6I Policy: Upserted test policy in database');

    await prisma.policyPage.delete({ where: { slug: 'test-phase6-policy' } });
    const checkPolicy = await prisma.policyPage.findUnique({ where: { slug: 'test-phase6-policy' } });
    assert(checkPolicy === null, '6I Policy: Deleted test policy and verified cleanup');

    // 3I: Product Catalog CRUD
    const testProduct = await prisma.product.create({
      data: {
        code: 'TEST-P6-PROD',
        name: 'Test Handwoven Raw Silk Scarf',
        priceUSD: 120,
        
        craftKey: 'thagzo',
        
        region: 'Lhuentse',
        stock: 5,
        status: 'PUBLISHED',
        description: '<p>Authentic handmade scarf</p>', images: [],
      },
    });
    assert(testProduct.id, '6J Product: Created test product in database');

    const updatedProduct = await prisma.product.update({
      where: { id: testProduct.id },
      data: { stock: 8 },
    });
    assert(updatedProduct.stock === 8, '6J Product: Updated product stock in database');

    await prisma.product.delete({ where: { id: testProduct.id } });
    const checkProduct = await prisma.product.findUnique({ where: { id: testProduct.id } });
    assert(checkProduct === null, '6J Product: Deleted test product and verified cleanup');

    // ----------------------------------------------------
    // 4. Verification Summary
    // ----------------------------------------------------
    console.log('\n====================================================');
    console.log(`  PHASE 6 TWO-WAY VERIFICATION COMPLETE: ${passed} passed, ${failed} failed`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('Phase 6 verification error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runPhase6Tests();
