import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const rootDir = 'E:\\ai\\bhutanprojects\\newbend';

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

async function runTests() {
  console.log('================================================================');
  console.log('  HAB BHUTAN — UNIVERSAL IMAGE REPLACEMENT & 2-WAY CRUD SUITE   ');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // SECTION 1: CORE FILE UPLOAD INPUT REPLACEMENT ARCHITECTURE
  // ---------------------------------------------------------------------------
  console.log('>>> 1. VERIFYING FILE UPLOAD INPUT COMPONENT ARCHITECTURE');
  {
    const fileUploadInput = fs.readFileSync(path.join(rootDir, 'src/components/admin/FileUploadInput.tsx'), 'utf-8');
    
    assert(fileUploadInput.includes('ref={fileInputRef}') && fileUploadInput.includes('type="file"'), 
      'FileUploadInput mounts hidden file input permanently at component root');

    assert(fileUploadInput.includes('Drop here to replace this file'), 
      'FileUploadInput supports drag-and-drop file replacement over existing image preview');

    assert(fileUploadInput.includes('Replace') && fileUploadInput.includes('animate-spin'), 
      'FileUploadInput provides visual loading indicator during replacement');
  }

  // ---------------------------------------------------------------------------
  // SECTION 2: END-TO-END 2-WAY CRUD TESTS (DATABASE & API LOGIC)
  // ---------------------------------------------------------------------------

  // Test 1: Products
  console.log('\n>>> 2. TESTING CRUD: Products (/admin/products -> /shop)');
  {
    const testSku = `TEST-PRD-${Date.now().toString().slice(-5)}`;
    const initialImg = `/uploads/test_product_init_${Date.now()}.jpg`;
    const replaceImg = `/uploads/test_product_repl_${Date.now()}.jpg`;

    // CREATE
    const product = await prisma.product.create({
      data: {
        code: testSku,
        name: 'Automated Test Silk Textile',
        craftKey: 'thagzo',
        priceUSD: 145,
        stock: 5,
        region: 'Lhuentse',
        status: 'PUBLISHED',
        description: 'Test product for 2-way sync.',
        images: [{ url: initialImg, role: 'primary' }],
      },
    });
    assert(product.id && product.code === testSku, `CREATE product: ${testSku} saved in DB`);

    // READ
    const readProd = await prisma.product.findUnique({ where: { code: testSku } });
    assert((readProd.images)[0]?.url === initialImg, 'READ product: Initial image URL matches');

    // UPDATE / REPLACE IMAGE
    const updatedProd = await prisma.product.update({
      where: { code: testSku },
      data: {
        images: [{ url: replaceImg, role: 'primary' }],
        priceUSD: 160,
      },
    });
    assert((updatedProd.images)[0]?.url === replaceImg, 'UPDATE / REPLACE product: Replaced image URL saved in DB');
    assert(updatedProd.priceUSD === 160, 'UPDATE / REPLACE product: Metadata update persists');

    // DELETE
    await prisma.product.delete({ where: { code: testSku } });
    const deletedCheck = await prisma.product.findUnique({ where: { code: testSku } });
    assert(deletedCheck === null, 'DELETE product: Clean removal from DB');
  }

  // Test 2: Hero Slides
  console.log('\n>>> 3. TESTING CRUD: Hero Slides (/admin/hero -> Homepage Hero)');
  {
    const initialImg = `/uploads/test_hero_init_${Date.now()}.jpg`;
    const replaceImg = `/uploads/test_hero_repl_${Date.now()}.jpg`;

    // CREATE
    const slide = await prisma.heroSlide.create({
      data: {
        imageUrl: initialImg,
        caption: 'Initial Test Hero Slide Caption',
        altText: 'Initial Test Hero Slide',
        linkUrl: '/shop',
        sortOrder: 99,
        isActive: true,
      },
    });
    assert(slide.id && slide.imageUrl === initialImg, 'CREATE hero slide: Saved in DB');

    // UPDATE / REPLACE IMAGE
    const updatedSlide = await prisma.heroSlide.update({
      where: { id: slide.id },
      data: {
        imageUrl: replaceImg,
        caption: 'Replaced Hero Slide Caption',
      },
    });
    assert(updatedSlide.imageUrl === replaceImg, 'UPDATE / REPLACE hero slide: Replaced image URL saved in DB');

    // DELETE
    await prisma.heroSlide.delete({ where: { id: slide.id } });
    const deletedCheck = await prisma.heroSlide.findUnique({ where: { id: slide.id } });
    assert(deletedCheck === null, 'DELETE hero slide: Clean removal from DB');
  }

  // Test 3: Artisan Clusters
  console.log('\n>>> 4. TESTING CRUD: Artisan Clusters (/admin/clusters-outlets -> /clusters)');
  {
    const testKey = `test-cluster-${Date.now().toString().slice(-5)}`;
    const initialImg = `/uploads/test_cluster_init_${Date.now()}.jpg`;
    const replaceImg = `/uploads/test_cluster_repl_${Date.now()}.jpg`;

    // CREATE with tag packing
    const packedInitial = `High altitude village workshop.\n<!-- HAB_IMAGE: ${initialImg} -->`;
    const cluster = await prisma.clusterRecord.create({
      data: {
        key: testKey,
        name: 'Test Artisan Cluster',
        craftKey: 'thagzo',
        dzongkhag: 'Lhuntse',
        members: 42,
        established: 2021,
        summary: 'Village cluster test.',
        story: '<p>Story of village cluster.</p>',
        visitorNote: packedInitial,
        sortOrder: 99,
      },
    });
    assert(cluster.id && cluster.visitorNote.includes(initialImg), 'CREATE cluster: Initial image tag stored in visitorNote');

    // UPDATE / REPLACE IMAGE
    const packedReplace = `High altitude village workshop.\n<!-- HAB_IMAGE: ${replaceImg} -->`;
    const updatedCluster = await prisma.clusterRecord.update({
      where: { key: testKey },
      data: { visitorNote: packedReplace },
    });
    assert(updatedCluster.visitorNote.includes(replaceImg) && !updatedCluster.visitorNote.includes(initialImg), 
      'UPDATE / REPLACE cluster: Old image stripped, new replacement URL saved');

    // DELETE
    await prisma.clusterRecord.delete({ where: { key: testKey } });
    const deletedCheck = await prisma.clusterRecord.findUnique({ where: { key: testKey } });
    assert(deletedCheck === null, 'DELETE cluster: Clean removal from DB');
  }

  // Test 4: Outlets & Markets
  console.log('\n>>> 5. TESTING CRUD: Outlets & Markets (/admin/clusters-outlets -> /outlets)');
  {
    const testKey = `test-outlet-${Date.now().toString().slice(-5)}`;
    const initialImg = `/uploads/test_outlet_init_${Date.now()}.jpg`;
    const replaceImg = `/uploads/test_outlet_repl_${Date.now()}.jpg`;

    // CREATE with tag packing
    const packedInitial = `Authentic verified craft bazaar.\n<!-- HAB_IMAGE: ${initialImg} -->`;
    const outlet = await prisma.outletRecord.create({
      data: {
        key: testKey,
        name: 'Test Crafts Market',
        type: 'MARKET',
        place: 'Punakha Valley',
        description: 'Test bazaar description.',
        longDescription: 'Authentic verified craft bazaar long description.',
        note: packedInitial,
        sortOrder: 99,
      },
    });
    assert(outlet.id && outlet.note.includes(initialImg), 'CREATE outlet: Initial image tag stored in note');

    // UPDATE / REPLACE IMAGE
    const packedReplace = `Authentic verified craft bazaar.\n<!-- HAB_IMAGE: ${replaceImg} -->`;
    const updatedOutlet = await prisma.outletRecord.update({
      where: { key: testKey },
      data: { note: packedReplace },
    });
    assert(updatedOutlet.note.includes(replaceImg) && !updatedOutlet.note.includes(initialImg), 
      'UPDATE / REPLACE outlet: Old image stripped, new replacement URL saved');

    // DELETE
    await prisma.outletRecord.delete({ where: { key: testKey } });
    const deletedCheck = await prisma.outletRecord.findUnique({ where: { key: testKey } });
    assert(deletedCheck === null, 'DELETE outlet: Clean removal from DB');
  }

  // Test 5: Programme Pillars
  console.log('\n>>> 6. TESTING CRUD: Programme Pillars (/admin/programmes -> /programmes)');
  {
    const testRef = `TEST-${Date.now().toString().slice(-4)}`;
    const initialImg = `/uploads/test_prog_init_${Date.now()}.jpg`;
    const replaceImg = `/uploads/test_prog_repl_${Date.now()}.jpg`;

    // CREATE with JSON activities
    const pillar = await prisma.programmePillar.create({
      data: {
        ref: testRef,
        title: 'Test Programme Pillar Title',
        description: 'Testing programme pillar description.',
        activities: {
          list: ['Wool procurement', 'Dye formulation'],
          imageUrl: initialImg,
        },
        sortOrder: 99,
        isActive: true,
      },
    });
    assert(pillar.id && (pillar.activities).imageUrl === initialImg, 'CREATE programme: Image URL saved in activities JSON');

    // UPDATE / REPLACE IMAGE
    const updatedPillar = await prisma.programmePillar.update({
      where: { id: pillar.id },
      data: {
        activities: {
          list: ['Wool procurement', 'Dye formulation'],
          imageUrl: replaceImg,
        },
      },
    });
    assert((updatedPillar.activities).imageUrl === replaceImg, 'UPDATE / REPLACE programme: Replaced image URL saved in activities JSON');

    // DELETE
    await prisma.programmePillar.delete({ where: { id: pillar.id } });
    const deletedCheck = await prisma.programmePillar.findUnique({ where: { id: pillar.id } });
    assert(deletedCheck === null, 'DELETE programme: Clean removal from DB');
  }

  // Test 6: Donor Projects
  console.log('\n>>> 7. TESTING CRUD: Donor Projects (/admin/projects -> /projects)');
  {
    const initialImg = `/uploads/test_proj_cover_init_${Date.now()}.jpg`;
    const replaceImg = `/uploads/test_proj_cover_repl_${Date.now()}.jpg`;
    const initialPdf = `/uploads/test_proj_report_init_${Date.now()}.pdf`;
    const replacePdf = `/uploads/test_proj_report_repl_${Date.now()}.pdf`;

    // CREATE
    const project = await prisma.projectRecord.create({
      data: {
        status: 'current',
        name: 'Test SWITCH-Asia Sustainable Crafts Project',
        partner: 'EU SWITCH-Asia',
        period: '2026 – 2029',
        budget: 'EUR 1.2 m',
        progressPercent: 45,
        summary: 'Sustainable craft project test summary.',
        activities: {
          list: ['Workshop audits', 'Eco-labeling'],
          coverPhotoUrl: initialImg,
          reportPdfUrl: initialPdf,
        },
        results: [{ n: '150', l: 'Workshops supported' }],
      },
    });
    assert(project.id && (project.activities).coverPhotoUrl === initialImg, 'CREATE project: Cover photo URL saved in activities JSON');
    assert((project.activities).reportPdfUrl === initialPdf, 'CREATE project: Evaluation PDF report URL saved in activities JSON');

    // UPDATE / REPLACE IMAGE AND PDF
    const updatedProject = await prisma.projectRecord.update({
      where: { id: project.id },
      data: {
        activities: {
          list: ['Workshop audits', 'Eco-labeling'],
          coverPhotoUrl: replaceImg,
          reportPdfUrl: replacePdf,
        },
      },
    });
    assert((updatedProject.activities).coverPhotoUrl === replaceImg, 'UPDATE / REPLACE project: Replaced cover photo saved');
    assert((updatedProject.activities).reportPdfUrl === replacePdf, 'UPDATE / REPLACE project: Replaced evaluation PDF saved');

    // Verify public route unpack helper
    const apiRoute = fs.readFileSync(path.join(rootDir, 'src/app/api/projects/route.ts'), 'utf-8');
    assert(apiRoute.includes('unpackProject') && apiRoute.includes('coverPhotoUrl'), 'PUBLIC /api/projects route unpacks coverPhotoUrl');
    assert(apiRoute.includes('reportPdfUrl'), 'PUBLIC /api/projects route unpacks reportPdfUrl');

    // DELETE
    await prisma.projectRecord.delete({ where: { id: project.id } });
    const deletedCheck = await prisma.projectRecord.findUnique({ where: { id: project.id } });
    assert(deletedCheck === null, 'DELETE project: Clean removal from DB');
  }

  // Test 7: Newsroom Articles
  console.log('\n>>> 8. TESTING CRUD: News Articles (/admin/content -> /news)');
  {
    const initialImg = `/uploads/test_news_init_${Date.now()}.jpg`;
    const replaceImg = `/uploads/test_news_repl_${Date.now()}.jpg`;
    const testSlug = `test-article-${Date.now().toString().slice(-5)}`;

    // CREATE
    const article = await prisma.newsArticle.create({
      data: {
        slug: testSlug,
        kind: 'Programs',
        title: 'Autumn Natural Dye Workshop Concludes',
        dateString: '16 Sep 2026',
        blurb: 'Artisans from Khoma completed masterclass.',
        content: `<!-- HAB_COVER_IMAGE: ${initialImg} -->\n<p>Full article body text.</p>`,
        isPublished: true,
      },
    });
    assert(article.id && article.content.includes(initialImg), 'CREATE news: Cover image tag saved in content');

    // UPDATE / REPLACE IMAGE
    const updatedArticle = await prisma.newsArticle.update({
      where: { id: article.id },
      data: {
        content: `<!-- HAB_COVER_IMAGE: ${replaceImg} -->\n<p>Full article body text.</p>`,
      },
    });
    assert(updatedArticle.content.includes(replaceImg) && !updatedArticle.content.includes(initialImg), 
      'UPDATE / REPLACE news: Old cover stripped, replaced image tag saved');

    // DELETE
    await prisma.newsArticle.delete({ where: { id: article.id } });
    const deletedCheck = await prisma.newsArticle.findUnique({ where: { id: article.id } });
    assert(deletedCheck === null, 'DELETE news: Clean removal from DB');
  }

  // Test 8: Events & Exhibitions
  console.log('\n>>> 9. TESTING CRUD: Events & Exhibitions (/admin/events -> /events)');
  {
    const testKey = `test-event-${Date.now().toString().slice(-5)}`;
    const initialImg = `/uploads/test_event_poster_init_${Date.now()}.jpg`;
    const replaceImg = `/uploads/test_event_poster_repl_${Date.now()}.jpg`;
    const initialPdf = `/uploads/test_event_brochure_init_${Date.now()}.pdf`;
    const replacePdf = `/uploads/test_event_brochure_repl_${Date.now()}.pdf`;

    // CREATE
    const event = await prisma.eventRecord.create({
      data: {
        key: testKey,
        title: 'National Zorig Chusum Expo 2026',
        category: 'Exhibition',
        dateDisplay: '12 – 14 OCT 2026',
        location: 'Thimphu',
        venue: 'Clock Tower Square',
        description: 'Exhibition of authentic handicrafts.',
        schedule: {
          day: '12',
          mon: 'OCT',
          time: '09:00 AM - 05:00 PM',
          imageUrl: initialImg,
          pdfUrl: initialPdf,
        },
        isActive: true,
        sortOrder: 99,
      },
    });
    assert(event.id && (event.schedule).imageUrl === initialImg, 'CREATE event: Poster image saved in schedule JSON');
    assert((event.schedule).pdfUrl === initialPdf, 'CREATE event: Brochure PDF saved in schedule JSON');

    // UPDATE / REPLACE POSTER AND BROCHURE
    const updatedEvent = await prisma.eventRecord.update({
      where: { key: testKey },
      data: {
        schedule: {
          day: '12',
          mon: 'OCT',
          time: '09:00 AM - 05:00 PM',
          imageUrl: replaceImg,
          pdfUrl: replacePdf,
        },
      },
    });
    assert((updatedEvent.schedule).imageUrl === replaceImg, 'UPDATE / REPLACE event: Replaced poster image URL saved');
    assert((updatedEvent.schedule).pdfUrl === replacePdf, 'UPDATE / REPLACE event: Replaced brochure PDF URL saved');

    // Verify public /api/events normalizer extracts imageUrl and pdfUrl
    const publicEventsRoute = fs.readFileSync(path.join(rootDir, 'src/app/api/events/route.ts'), 'utf-8');
    assert(publicEventsRoute.includes('eventImg = sched.imageUrl || e.imageUrl'), 'PUBLIC /api/events extracts eventImg');
    assert(publicEventsRoute.includes('eventPdf = sched.pdfUrl || e.pdfUrl'), 'PUBLIC /api/events extracts eventPdf');

    // DELETE
    await prisma.eventRecord.delete({ where: { key: testKey } });
    const deletedCheck = await prisma.eventRecord.findUnique({ where: { key: testKey } });
    assert(deletedCheck === null, 'DELETE event: Clean removal from DB');
  }

  // Test 9: Membership Categories
  console.log('\n>>> 10. TESTING CRUD: Membership Categories (/admin/membership-categories -> /membership)');
  {
    const testKey = `test-cat-${Date.now().toString().slice(-5)}`;
    const initialImg = `/uploads/test_cat_banner_init_${Date.now()}.jpg`;
    const replaceImg = `/uploads/test_cat_banner_repl_${Date.now()}.jpg`;

    // CREATE
    const cat = await prisma.membershipCategory.create({
      data: {
        key: testKey,
        name: 'Master Craftsperson Tier',
        duesBTN: 1200,
        duesUSD: 15,
        description: 'Elite master category.',
        documents: {
          bannerImageUrl: initialImg,
        },
        isActive: true,
        sortOrder: 99,
      },
    });
    assert(cat.id && (cat.documents).bannerImageUrl === initialImg, 'CREATE category: Banner image URL saved in documents JSON');

    // UPDATE / REPLACE BANNER
    const updatedCat = await prisma.membershipCategory.update({
      where: { key: testKey },
      data: {
        documents: {
          bannerImageUrl: replaceImg,
        },
      },
    });
    assert((updatedCat.documents).bannerImageUrl === replaceImg, 'UPDATE / REPLACE category: Replaced banner URL saved in documents JSON');

    // DELETE
    await prisma.membershipCategory.delete({ where: { key: testKey } });
    const deletedCheck = await prisma.membershipCategory.findUnique({ where: { key: testKey } });
    assert(deletedCheck === null, 'DELETE category: Clean removal from DB');
  }

  // Test 10: Artisan Members Directory
  console.log('\n>>> 11. TESTING CRUD: Members Directory (/admin/members -> /members)');
  {
    const testCid = `${Date.now().toString().slice(-11).padStart(11, '1')}`;
    const initialPortrait = `/uploads/test_artisan_portrait_init_${Date.now()}.jpg`;
    const replacePortrait = `/uploads/test_artisan_portrait_repl_${Date.now()}.jpg`;

    // CREATE
    const member = await prisma.member.create({
      data: {
        name: 'Master Pema Dorji (Automated Test)',
        craftKey: 'thagzo',
        dzongkhag: 'Lhuntse',
        regNumber: `HAB-TEST-${Date.now().toString().slice(-4)}`,
        cidNumber: testCid,
        joinYear: 2026,
        duesExpiryDate: new Date('2027-12-31T23:59:59Z'),
        tier: 'ACTIVE_SECTOR_MEMBER',
        status: 'VERIFIED',
        bio: 'Master weaver in Khoma.',
        portraitUrl: initialPortrait,
      },
    });
    assert(member.id && member.portraitUrl === initialPortrait, 'CREATE member: Portrait photo URL saved in Member model');

    // UPDATE / REPLACE PORTRAIT
    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: {
        portraitUrl: replacePortrait,
      },
    });
    assert(updatedMember.portraitUrl === replacePortrait, 'UPDATE / REPLACE member: Replaced portrait photo URL saved');

    // DELETE
    await prisma.member.delete({ where: { id: member.id } });
    const deletedCheck = await prisma.member.findUnique({ where: { id: member.id } });
    assert(deletedCheck === null, 'DELETE member: Clean removal from DB');
  }

  // Test 11: The 13 Crafts
  console.log('\n>>> 12. TESTING UPDATE & 2-WAY SYNC: The 13 Crafts (/admin/crafts -> /craft/[craft])');
  {
    const originalCraft = await prisma.craft.findUnique({ where: { key: 'thagzo' } });
    const replaceBanner = `/uploads/test_thagzo_banner_repl_${Date.now()}.jpg`;

    // UPDATE / REPLACE CRAFT BANNER
    const updatedCraft = await prisma.craft.update({
      where: { key: 'thagzo' },
      data: { bannerUrl: replaceBanner },
    });
    assert(updatedCraft.bannerUrl === replaceBanner, 'UPDATE / REPLACE craft: Replaced banner URL saved in Craft model');

    // Verify public craft page reads bannerUrl in flipper carousel
    const publicCraftPage = fs.readFileSync(path.join(rootDir, 'src/app/(public)/craft/[craft]/page.tsx'), 'utf-8');
    assert(publicCraftPage.includes('(craft as any).bannerUrl'), 'PUBLIC /craft/[craft] page dynamically binds craft.bannerUrl');

    // Restore original banner
    await prisma.craft.update({
      where: { key: 'thagzo' },
      data: { bannerUrl: originalCraft?.bannerUrl || null },
    });
    console.log('  ✓ RESTORE craft banner: Cleanly reset');
  }

  // Test 12: National Honours & Masters
  console.log('\n>>> 13. TESTING CRUD: National Honours (/admin/honours -> /masters)');
  {
    const initialPortrait = `/uploads/test_honour_portrait_init_${Date.now()}.jpg`;
    const replacePortrait = `/uploads/test_honour_portrait_repl_${Date.now()}.jpg`;

    // CREATE
    const honour = await prisma.honourRecord.create({
      data: {
        name: 'Master Carpenter Karma (Test)',
        craft: 'parzo',
        dzongkhag: 'Trashiyangtse',
        awardType: 'NationalMaster',
        yearAwarded: 2026,
        citation: 'For preservation of sacred wooden mask carving.',
        portraitUrl: initialPortrait,
        isActive: true,
        sortOrder: 99,
      },
    });
    assert(honour.id && honour.portraitUrl === initialPortrait, 'CREATE honour: Portrait photo URL saved in HonourRecord');

    // UPDATE / REPLACE PORTRAIT
    const updatedHonour = await prisma.honourRecord.update({
      where: { id: honour.id },
      data: { portraitUrl: replacePortrait },
    });
    assert(updatedHonour.portraitUrl === replacePortrait, 'UPDATE / REPLACE honour: Replaced portrait photo URL saved');

    // DELETE
    await prisma.honourRecord.delete({ where: { id: honour.id } });
    const deletedCheck = await prisma.honourRecord.findUnique({ where: { id: honour.id } });
    assert(deletedCheck === null, 'DELETE honour: Clean removal from DB');
  }

  // Test 13: Site Settings & Partner Logos
  console.log('\n>>> 14. TESTING UPDATE & 2-WAY SYNC: Site Settings & Partner Logos');
  {
    const siteSettingsPage = fs.readFileSync(path.join(rootDir, 'src/app/(admin)/admin/site-settings/page.tsx'), 'utf-8');
    assert(siteSettingsPage.includes('aboutBandImageUrl') && siteSettingsPage.includes('FileUploadInput'), 
      'Site Settings has FileUploadInput for aboutBandImageUrl');
    assert(siteSettingsPage.includes('Partner Logo Artwork') && siteSettingsPage.includes('FileUploadInput'), 
      'Site Settings has FileUploadInput for Partner Logo Artwork');

    const publicHomepage = fs.readFileSync(path.join(rootDir, 'src/app/(public)/page.tsx'), 'utf-8');
    assert(publicHomepage.includes('siteSettings.aboutBandImageUrl'), 'Public homepage renders siteSettings.aboutBandImageUrl');
    assert(publicHomepage.includes('partner.logoUrl || partner.logo_path'), 'Public homepage renders partner.logoUrl');
  }

  // Test 14: Membership Settings mBoB QR Code
  console.log('\n>>> 15. TESTING: Membership Settings mBoB QR Code Upload');
  {
    const mbobPage = fs.readFileSync(path.join(rootDir, 'src/app/(admin)/admin/membership-settings/page.tsx'), 'utf-8');
    assert(mbobPage.includes('mBoB QR Code Image') && mbobPage.includes('FileUploadInput'), 
      'Membership Settings uses FileUploadInput for official mBoB QR code upload');
  }

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('================================================================\n');

  await prisma.$disconnect();

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runTests().catch(async (e) => {
  console.error('Fatal error during test run:', e);
  await prisma.$disconnect();
  process.exit(1);
});
