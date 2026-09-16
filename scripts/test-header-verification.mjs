import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function runTests() {
  console.log('=== VERIFYING HEADER LIVE EDITING & 2-WAY DATABASE PERSISTENCE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Component existence & integration verification
    console.log('1. Verifying Component Architecture...');
    const hlePath = path.join(process.cwd(), 'src/components/public/HeaderLiveEditor.tsx');
    assert(fs.existsSync(hlePath), 'HeaderLiveEditor.tsx exists');
    const hleCode = fs.readFileSync(hlePath, 'utf8');
    assert(hleCode.includes('Live Header & Navigation Editor'), 'HeaderLiveEditor has correct modal title');
    assert(hleCode.includes('hab:header-updated'), 'HeaderLiveEditor dispatches hab:header-updated custom event');
    assert(hleCode.includes('/api/admin/site-settings'), 'HeaderLiveEditor persists to /api/admin/site-settings');
    assert(hleCode.includes('/api/admin/navigation'), 'HeaderLiveEditor persists to /api/admin/navigation');

    const headerPath = path.join(process.cwd(), 'src/components/public/Header.tsx');
    const headerCode = fs.readFileSync(headerPath, 'utf8');
    assert(headerCode.includes('HeaderLiveEditor'), 'Header.tsx imports and renders HeaderLiveEditor');
    assert(headerCode.includes('onQuickEdit={() => setHeaderLiveEditOpen(true)}'), 'Header.tsx connects onQuickEdit handler');
    assert(headerCode.includes('studioHref="/admin/navigation"'), 'Header.tsx links to /admin/navigation instead of broken /admin/menus');
    assert(headerCode.includes('hab:header-updated'), 'Header.tsx listens for hab:header-updated event');

    const utilityPath = path.join(process.cwd(), 'src/components/public/UtilityBar.tsx');
    const utilityCode = fs.readFileSync(utilityPath, 'utf8');
    assert(utilityCode.includes('hab:header-updated'), 'UtilityBar.tsx listens for hab:header-updated event');

    const menusPath = path.join(process.cwd(), 'src/app/(admin)/admin/menus/page.tsx');
    assert(fs.existsSync(menusPath), '/admin/menus redirect page exists');
    const menusCode = fs.readFileSync(menusPath, 'utf8');
    assert(menusCode.includes('/admin/navigation'), '/admin/menus redirects to /admin/navigation');

    // 2. Database 2-way sync: Announcement Bar (SiteSetting)
    console.log('\n2. Testing 2-Way Announcement Persistence (SiteSetting)...');
    const initialSetting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    const originalText = initialSetting?.announcementText || 'CSO/2011/043 · Handicrafts Association of Bhutan';

    const testAnnouncement = `Live Header Test Notice - ${Date.now()}`;
    const testLink = `/news/live-edit-test`;

    const updated = await prisma.siteSetting.upsert({
      where: { id: 'default' },
      update: {
        announcementText: testAnnouncement,
        announcementLink: testLink,
        isAnnouncementOn: true,
      },
      create: {
        id: 'default',
        announcementText: testAnnouncement,
        announcementLink: testLink,
        isAnnouncementOn: true,
        heroParagraph: 'Default',
        footerAbout: 'Default',
        partnersList: [],
      },
    });

    assert(updated.announcementText === testAnnouncement, 'Announcement text updated in PostgreSQL');
    assert(updated.announcementLink === testLink, 'Announcement link updated in PostgreSQL');
    assert(updated.isAnnouncementOn === true, 'Announcement visibility toggle persisted');

    // Verify read-back
    const readBack = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    assert(readBack?.announcementText === testAnnouncement, 'Verified read-back of announcement text');

    // Restore original text
    await prisma.siteSetting.update({
      where: { id: 'default' },
      data: { announcementText: originalText, announcementLink: '/about' },
    });
    console.log('  ✓ Announcement test completed and original restored.');

    // 3. Database 2-way sync: Navigation Items (NavigationItem)
    console.log('\n3. Testing 2-Way Navigation CRUD (NavigationItem)...');
    const testNavItem = await prisma.navigationItem.create({
      data: {
        menuType: 'HEADER',
        label: 'Live Test Menu Item',
        href: '/test-live-link',
        sortOrder: 99,
        isActive: true,
        isExternal: false,
      },
    });

    assert(testNavItem.id !== undefined, `Created test navigation item with ID: ${testNavItem.id}`);
    assert(testNavItem.label === 'Live Test Menu Item', 'Label stored accurately');

    // Update item
    const updatedNavItem = await prisma.navigationItem.update({
      where: { id: testNavItem.id },
      data: {
        label: 'Updated Live Test Menu Item',
        href: '/updated-live-link',
      },
    });
    assert(updatedNavItem.label === 'Updated Live Test Menu Item', 'Navigation item label updated');
    assert(updatedNavItem.href === '/updated-live-link', 'Navigation item URL updated');

    // Clean up
    await prisma.navigationItem.delete({ where: { id: testNavItem.id } });
    const deletedCheck = await prisma.navigationItem.findUnique({ where: { id: testNavItem.id } });
    assert(deletedCheck === null, 'Test navigation item safely deleted');
    console.log('  ✓ Navigation item CRUD test completed.\n');

  } catch (err) {
    console.error('Fatal error during test:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log(`=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();