import fs from 'fs';
import path from 'path';

const HAB_DIR = 'E:/Downloads/Final_webdesign/hab-site';
const NEXT_DIR = 'E:/ai/bhutanprojects/newbend';

console.log('========================================================================');
console.log('  HAB BHUTAN — ROUTE SOURCE INVENTORY (NOT VISUAL/FUNCTIONAL QA)        ');
console.log('========================================================================\n');

// 34 Static HTML Pages Mapping to Next.js routes
const PAGE_MAPPINGS = [
  {
    htmlFile: 'index.html',
    nextFile: 'src/app/(public)/page.tsx',
    route: '/',
    name: 'Homepage',
    adminStudio: '/admin/pages/home'
  },
  {
    htmlFile: 'about.html',
    nextFile: 'src/app/(public)/about/page.tsx',
    route: '/about',
    name: 'About Us',
    adminStudio: '/admin/pages'
  },
  {
    htmlFile: 'craft.html',
    nextFile: 'src/app/(public)/craft/[craft]/page.tsx',
    route: '/craft/[craft]',
    name: 'Craft Detail',
    adminStudio: '/admin/crafts'
  },
  {
    htmlFile: 'shop.html',
    nextFile: 'src/app/(public)/shop/page.tsx',
    route: '/shop',
    name: 'E-Shop Catalog',
    adminStudio: '/admin/products'
  },
  {
    htmlFile: 'product.html',
    nextFile: 'src/app/(public)/product/[code]/page.tsx',
    route: '/product/[code]',
    name: 'Product Detail',
    adminStudio: '/admin/products'
  },
  {
    htmlFile: 'basket.html',
    nextFile: 'src/app/(public)/basket/page.tsx',
    route: '/basket',
    name: 'Shopping Basket',
    adminStudio: '/admin/settings'
  },
  {
    htmlFile: 'clusters.html',
    nextFile: 'src/app/(public)/clusters/page.tsx',
    route: '/clusters',
    name: 'Artisan Clusters',
    adminStudio: '/admin/clusters-outlets'
  },
  {
    htmlFile: 'cluster.html',
    nextFile: 'src/app/(public)/clusters/[key]/page.tsx',
    route: '/clusters/[key]',
    name: 'Cluster Detail',
    adminStudio: '/admin/clusters-outlets'
  },
  {
    htmlFile: 'outlets.html',
    nextFile: 'src/app/(public)/outlets/page.tsx',
    route: '/outlets',
    name: 'Outlets & Markets',
    adminStudio: '/admin/clusters-outlets'
  },
  {
    htmlFile: 'outlet.html',
    nextFile: 'src/app/(public)/outlets/[key]/page.tsx',
    route: '/outlets/[key]',
    name: 'Outlet Detail',
    adminStudio: '/admin/clusters-outlets'
  },
  {
    htmlFile: 'masters.html',
    nextFile: 'src/app/(public)/masters/page.tsx',
    route: '/masters',
    name: 'Master Craftspeople',
    adminStudio: '/admin/artisans'
  },
  {
    htmlFile: 'members.html',
    nextFile: 'src/app/(public)/members/page.tsx',
    route: '/members',
    name: 'Member Directory',
    adminStudio: '/admin/members'
  },
  {
    htmlFile: 'member.html',
    nextFile: 'src/app/(public)/members/[slug]/page.tsx',
    route: '/members/[slug]',
    name: 'Member Profile',
    adminStudio: '/admin/members'
  },
  {
    htmlFile: 'membership.html',
    nextFile: 'src/app/(public)/membership/page.tsx',
    route: '/membership',
    name: 'Membership Categories',
    adminStudio: '/admin/applications'
  },
  {
    htmlFile: 'membership-category.html',
    nextFile: 'src/app/(public)/membership/[category]/page.tsx',
    route: '/membership/[category]',
    name: 'Membership Category Detail',
    adminStudio: '/admin/applications'
  },
  {
    htmlFile: 'register.html',
    nextFile: 'src/app/(public)/register/page.tsx',
    route: '/register',
    name: 'Member Registration',
    adminStudio: '/admin/applications'
  },
  {
    htmlFile: 'wholesale.html',
    nextFile: 'src/app/(public)/wholesale/page.tsx',
    route: '/wholesale',
    name: 'Wholesale Overview',
    adminStudio: '/admin/trade'
  },
  {
    htmlFile: 'wholesale-shop.html',
    nextFile: 'src/app/(public)/wholesale/shop/page.tsx',
    route: '/wholesale/shop',
    name: 'Wholesale Catalog',
    adminStudio: '/admin/products'
  },
  {
    htmlFile: 'wholesale-cart.html',
    nextFile: 'src/app/(public)/wholesale/cart/page.tsx',
    route: '/wholesale/cart',
    name: 'Wholesale Quote Basket',
    adminStudio: '/admin/wholesale'
  },
  {
    htmlFile: 'wholesale-register.html',
    nextFile: 'src/app/(public)/wholesale/register/page.tsx',
    route: '/wholesale/register',
    name: 'Wholesale Registration',
    adminStudio: '/admin/wholesale'
  },
  {
    htmlFile: 'programmes.html',
    nextFile: 'src/app/(public)/programmes/page.tsx',
    route: '/programmes',
    name: 'Programmes Overview',
    adminStudio: '/admin/programmes'
  },
  {
    htmlFile: 'programme.html',
    nextFile: 'src/app/(public)/programmes/[ref]/page.tsx',
    route: '/programmes/[ref]',
    name: 'Programme Detail',
    adminStudio: '/admin/programmes'
  },
  {
    htmlFile: 'projects.html',
    nextFile: 'src/app/(public)/projects/page.tsx',
    route: '/projects',
    name: 'Projects Overview',
    adminStudio: '/admin/projects'
  },
  {
    htmlFile: 'project.html',
    nextFile: 'src/app/(public)/projects/[key]/page.tsx',
    route: '/projects/[key]',
    name: 'Project Detail',
    adminStudio: '/admin/projects'
  },
  {
    htmlFile: 'news.html',
    nextFile: 'src/app/(public)/news/page.tsx',
    route: '/news',
    name: 'Newsroom',
    adminStudio: '/admin/news'
  },
  {
    htmlFile: 'news-post.html',
    nextFile: 'src/app/(public)/news/[slug]/page.tsx',
    route: '/news/[slug]',
    name: 'News Article',
    adminStudio: '/admin/news'
  },
  {
    htmlFile: 'events.html',
    nextFile: 'src/app/(public)/events/page.tsx',
    route: '/events',
    name: 'Events Overview',
    adminStudio: '/admin/events'
  },
  {
    htmlFile: 'event.html',
    nextFile: 'src/app/(public)/events/[key]/page.tsx',
    route: '/events/[key]',
    name: 'Event Detail',
    adminStudio: '/admin/events'
  },
  {
    htmlFile: 'publications.html',
    nextFile: 'src/app/(public)/publications/page.tsx',
    route: '/publications',
    name: 'Publications',
    adminStudio: '/admin/publications'
  },
  {
    htmlFile: 'donate.html',
    nextFile: 'src/app/(public)/donate/page.tsx',
    route: '/donate',
    name: 'Support & Donate',
    adminStudio: '/admin/settings'
  },
  {
    htmlFile: 'contact.html',
    nextFile: 'src/app/(public)/contact/page.tsx',
    route: '/contact',
    name: 'Contact Secretariat',
    adminStudio: '/admin/settings'
  },
  {
    htmlFile: 'privacy.html',
    nextFile: 'src/app/(public)/privacy/page.tsx',
    route: '/privacy',
    name: 'Privacy Policy',
    adminStudio: '/admin/policies'
  },
  {
    htmlFile: 'terms.html',
    nextFile: 'src/app/(public)/terms/page.tsx',
    route: '/terms',
    name: 'Terms of Service',
    adminStudio: '/admin/policies'
  },
  {
    htmlFile: 'shipping-policy.html',
    nextFile: 'src/app/(public)/shipping-policy/page.tsx',
    route: '/shipping-policy',
    name: 'Shipping & Delivery Policy',
    adminStudio: '/admin/policies'
  }
];

// Additional 10 Specialized Sub-Pages (Preserved)
const SPECIALIZED_PAGES = [
  {
    nextFile: 'src/app/(public)/returns-policy/page.tsx',
    route: '/returns-policy',
    name: 'Returns & Refund Policy',
    adminStudio: '/admin/policies'
  },
  {
    nextFile: 'src/app/(public)/customs-policy/page.tsx',
    route: '/customs-policy',
    name: 'Bhutan Customs & Tariffs',
    adminStudio: '/admin/policies'
  },
  {
    nextFile: 'src/app/(public)/board-of-trustees/page.tsx',
    route: '/board-of-trustees',
    name: 'Board of Trustees',
    adminStudio: '/admin/pages'
  },
  {
    nextFile: 'src/app/(public)/secretariat/page.tsx',
    route: '/secretariat',
    name: 'Secretariat Directory',
    adminStudio: '/admin/pages'
  },
  {
    nextFile: 'src/app/(public)/annual-reports/page.tsx',
    route: '/annual-reports',
    name: 'Annual Reports Repository',
    adminStudio: '/admin/publications'
  },
  {
    nextFile: 'src/app/(public)/audited-accounts/page.tsx',
    route: '/audited-accounts',
    name: 'Statutory Audited Accounts',
    adminStudio: '/admin/publications'
  },
  {
    nextFile: 'src/app/(public)/tenders/page.tsx',
    route: '/tenders',
    name: 'Tenders & Procurement',
    adminStudio: '/admin/publications'
  },
  {
    nextFile: 'src/app/(public)/code-of-ethics/page.tsx',
    route: '/code-of-ethics',
    name: 'Code of Ethics & Craft Integrity',
    adminStudio: '/admin/policies'
  },
  {
    nextFile: 'src/app/(public)/mandate/page.tsx',
    route: '/mandate',
    name: 'CSO Mandate & AoA',
    adminStudio: '/admin/pages'
  },
  {
    nextFile: 'src/app/(public)/strategic-plan/page.tsx',
    route: '/strategic-plan',
    name: 'Strategic Plan (2025–2030)',
    adminStudio: '/admin/pages'
  }
];

const results = [];
let passCount = 0;
let failCount = 0;

// Helper to inspect HTML file
function parseHtmlFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');

  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'N/A';

  const h1 = [...content.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const h2 = [...content.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const imgs = [...content.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);

  return { title, h1, h2, imgs, length: content.length };
}

// Helper to inspect Next.js page
function parseNextFile(filePath) {
  const fullPath = path.join(NEXT_DIR, filePath);
  if (!fs.existsSync(fullPath)) return { exists: false };
  let content = fs.readFileSync(fullPath, 'utf8');

  // If this file is a re-export, resolve target
  const reexportMatch = content.match(/export\s*\{\s*default[^}]*\}\s*from\s*['"]([^'"]+)['"]/);
  let resolvedPath = fullPath;
  if (reexportMatch) {
    const target = path.resolve(path.dirname(fullPath), reexportMatch[1] + (reexportMatch[1].endsWith('.tsx') ? '' : '.tsx'));
    if (fs.existsSync(target)) {
      resolvedPath = target;
      content = fs.readFileSync(target, 'utf8');
    }
  }

  // Also check if it renders a client view component
  const clientCompMatch = content.match(/import\s+(\w+)\s+from\s+['"](@\/components\/public\/[^'"]+)['"]/);
  let clientContent = '';
  if (clientCompMatch) {
    const compPath = path.join(NEXT_DIR, clientCompMatch[2].replace('@/', 'src/') + '.tsx');
    if (fs.existsSync(compPath)) {
      clientContent = fs.readFileSync(compPath, 'utf8');
    }
  }

  const combined = content + '\n' + clientContent;

  const hasQuickEdit = combined.includes('SectionEditBadge') || combined.includes('UniversalLiveSectionEditor');
  const hasSectionTag = combined.includes('data-hab-section');
  const hasSafePrice = !combined.includes('Nu. NaN') && (combined.includes('formatPrice') || combined.includes('priceUSD') || combined.includes('price_usd') || combined.includes('price'));
  
  return {
    exists: true,
    resolvedPath: path.relative(NEXT_DIR, resolvedPath),
    hasQuickEdit,
    hasSectionTag,
    hasSafePrice,
    length: combined.length
  };
}

// 1. Process 34 HTML Mappings
console.log('>>> SECTION 1: CHECKING SOURCE FILE PRESENCE AND EDITOR MARKERS ONLY\n');

for (let i = 0; i < PAGE_MAPPINGS.length; i++) {
  const item = PAGE_MAPPINGS[i];
  const htmlPath = path.join(HAB_DIR, item.htmlFile);
  const htmlInfo = parseHtmlFile(htmlPath);
  const nextInfo = parseNextFile(item.nextFile);

  const idx = `[${String(i + 1).padStart(2, '0')}/34]`;

  if (!htmlInfo) {
    console.log(`❌ FAIL ${idx} ${item.htmlFile}: Static HTML file missing!`);
    failCount++;
    continue;
  }

  if (!nextInfo.exists) {
    console.log(`❌ FAIL ${idx} ${item.htmlFile} -> ${item.nextFile}: Next.js route file missing!`);
    failCount++;
    continue;
  }

  const checks = [];
  if (nextInfo.exists) checks.push('File: OK');
  if (nextInfo.hasQuickEdit) checks.push('QuickEdit: YES');
  else checks.push('QuickEdit: NO');
  if (nextInfo.hasSectionTag) checks.push('data-hab-section: YES');
  if (nextInfo.hasSafePrice) checks.push('SafePrice: YES');

  console.log(`SOURCE FOUND ${idx} ${item.htmlFile.padEnd(24)} -> ${item.route.padEnd(24)} [${checks.join(' | ')}]`);
  passCount++;

  results.push({
    index: i + 1,
    type: 'STATIC_HTML',
    htmlFile: item.htmlFile,
    route: item.route,
    name: item.name,
    adminStudio: item.adminStudio,
    title: htmlInfo.title,
    h1: htmlInfo.h1,
    h2Count: htmlInfo.h2.length,
    quickEditMounted: nextInfo.hasQuickEdit,
    sectionTagMounted: nextInfo.hasSectionTag,
    status: 'SOURCE_SCAN_ONLY',
    evidenceLimit: 'Does not compare rendered copy/layout/data or verify Quick Edit behavior.'
  });
}

// 2. Process 10 Specialized Pages
console.log('\n>>> SECTION 2: CHECKING SPECIALIZED ROUTE SOURCE FILES ONLY\n');

for (let i = 0; i < SPECIALIZED_PAGES.length; i++) {
  const item = SPECIALIZED_PAGES[i];
  const nextInfo = parseNextFile(item.nextFile);
  const idx = `[${String(i + 35).padStart(2, '0')}/44]`;

  if (!nextInfo.exists) {
    console.log(`❌ FAIL ${idx} Specialized: ${item.nextFile} missing!`);
    failCount++;
    continue;
  }

  const checks = [];
  if (nextInfo.exists) checks.push('File: OK');
  if (nextInfo.hasQuickEdit) checks.push('QuickEdit: YES');
  if (nextInfo.hasSectionTag) checks.push('data-hab-section: YES');

  console.log(`SOURCE FOUND ${idx} ${item.route.padEnd(24)} -> ${item.name.padEnd(30)} [${checks.join(' | ')}]`);
  passCount++;

  results.push({
    index: i + 35,
    type: 'SPECIALIZED_SUBPAGE',
    route: item.route,
    name: item.name,
    adminStudio: item.adminStudio,
    quickEditMounted: nextInfo.hasQuickEdit,
    sectionTagMounted: nextInfo.hasSectionTag,
    status: 'SOURCE_SCAN_ONLY',
    evidenceLimit: 'Does not compare rendered copy/layout/data or verify Quick Edit behavior.'
  });
}

// 3. Verify Global Components: Footer & Utility Bar
console.log('\n>>> SECTION 3: CHECKING GLOBAL COMPONENT SOURCE MARKERS ONLY\n');

const footerPath = path.join(NEXT_DIR, 'src/components/public/Footer.tsx');
const footerContent = fs.readFileSync(footerPath, 'utf8');

const footerCol0 = footerContent.includes('Secretariat') && footerContent.includes('+975-2-338089');
const footerCol1 = footerContent.includes('Association') && footerContent.includes('/about');
const footerCol2 = footerContent.includes('Shop & support') && footerContent.includes('/shop');
const footerCol3 = footerContent.includes('Members') && footerContent.includes('/members');
const footerCol4 = footerContent.includes('Governance') && footerContent.includes('/board-of-trustees');
const footerSocials = ['facebook', 'instagram', 'x', 'youtube', 'tiktok'].every(s => footerContent.includes(s));
const footerBadge = footerContent.includes('SectionEditBadge');

console.log(`  ✓ Footer Column 0 (Secretariat): ${footerCol0 ? 'PASS' : 'FAIL'}`);
console.log(`  ✓ Footer Column 1 (Association): ${footerCol1 ? 'PASS' : 'FAIL'}`);
console.log(`  ✓ Footer Column 2 (Shop & support): ${footerCol2 ? 'PASS' : 'FAIL'}`);
console.log(`  ✓ Footer Column 3 (Members): ${footerCol3 ? 'PASS' : 'FAIL'}`);
console.log(`  ✓ Footer Column 4 (Governance): ${footerCol4 ? 'PASS' : 'FAIL'}`);
console.log(`  ✓ Footer 5 Social Channels (FB/IG/X/YT/TT): ${footerSocials ? 'PASS' : 'FAIL'}`);
console.log(`  ✓ Footer Quick Edit Badge: ${footerBadge ? 'PASS' : 'FAIL'}`);

if (footerCol0 && footerCol1 && footerCol2 && footerCol3 && footerCol4 && footerSocials && footerBadge) {
  passCount++;
} else {
  failCount++;
}

const utilityPath = path.join(NEXT_DIR, 'src/components/public/UtilityBar.tsx');
const utilityContent = fs.readFileSync(utilityPath, 'utf8');

const counterRemoved = !utilityContent.includes('{currentTickerIdx + 1}/{tickerMessages.length}') && !utilityContent.includes('1/4') && !utilityContent.includes('1/3');
const tickerControlsPreserved = utilityContent.includes('‹') && utilityContent.includes('›');

console.log(`  ✓ Announcement Bar Counter Numbers Removed: ${counterRemoved ? 'PASS' : 'FAIL'}`);
console.log(`  ✓ Announcement Bar Ticker Controls (‹, ›) Preserved: ${tickerControlsPreserved ? 'PASS' : 'FAIL'}`);

if (counterRemoved && tickerControlsPreserved) {
  passCount++;
} else {
  failCount++;
}

console.log('\n========================================================================');
console.log(`TOTAL SOURCE INVENTORY: ${passCount} marker groups found, ${failCount} missing marker groups`);
console.log('No item in this report proves visual parity, complete content, or working CRUD.');
console.log('========================================================================\n');

fs.writeFileSync(path.join(NEXT_DIR, 'scripts/file-by-file-results.json'), JSON.stringify(results, null, 2), 'utf8');
console.log('Saved detailed results to scripts/file-by-file-results.json.');
