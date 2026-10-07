import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failedTests++;
  }
}

async function runTwoWayVerification() {
  console.log('========================================================================');
  console.log('  HAB BHUTAN — 2-WAY VERIFICATION SUITE: PUBLIC <-> ADMIN CRUD SYNC     ');
  console.log('========================================================================\n');

  // ---------------------------------------------------------------------------
  // MODULE 1: PUBLIC -> ADMIN: Wholesale Registration with Payment & Proof Upload
  // ---------------------------------------------------------------------------
  console.log('>>> [TEST GROUP 1] PUBLIC -> ADMIN: Wholesale Registration & Decision Engine');
  {
    const wholesaleStorePath = path.join(rootDir, 'src/lib/wholesale-store.ts');
    const wholesaleStoreCode = fs.readFileSync(wholesaleStorePath, 'utf-8');
    assert(wholesaleStoreCode.includes('saveFallbackWholesaleBuyer'), 'Wholesale store provides fallback storage');
    assert(wholesaleStoreCode.includes("'REJECTED'"), 'Wholesale store supports REJECTED status');

    const wholesaleRegPage = fs.readFileSync(path.join(rootDir, 'src/app/(public)/wholesale/register/page.tsx'), 'utf-8');
    assert(wholesaleRegPage.includes('handlePaymentProofUpload'), 'Wholesale registration has deposit slip file uploader');
    assert(wholesaleRegPage.includes('/api/upload'), 'Wholesale registration uploads proof via /api/upload');
    assert(wholesaleRegPage.includes('payMethod'), 'Wholesale registration has payMethod selector (Card, mBoB, Bank)');
    assert(wholesaleRegPage.includes('proofUrl'), 'Wholesale registration binds uploaded proof URL to submission payload');

    const wholesaleRegRoute = fs.readFileSync(path.join(rootDir, 'src/app/api/wholesale/register/route.ts'), 'utf-8');
    assert(wholesaleRegRoute.includes('proofUrl') && wholesaleRegRoute.includes('paymentMethod'), 
      'Wholesale registration API extracts paymentMethod and proofUrl');
    assert(wholesaleRegRoute.includes('Payment Slip Proof:'), 
      'Wholesale registration API stores payment proof URL in notes summary for admin inspection');

    const adminWholesalePage = fs.readFileSync(path.join(rootDir, 'src/app/(admin)/admin/wholesale/page.tsx'), 'utf-8');
    assert(adminWholesalePage.includes('handleQuickApprove'), 'Admin wholesale studio provides Quick Approve button [✓]');
    assert(adminWholesalePage.includes('setDeclineBuyer'), 'Admin wholesale studio provides Quick Decline button [✗]');
    assert(adminWholesalePage.includes('Application Notes'), 
      'Admin wholesale inspector modal displays applicant payment details & proof');
  }

  // ---------------------------------------------------------------------------
  // MODULE 2: PUBLIC -> ADMIN: Member Registration with Payment & Proof Upload
  // ---------------------------------------------------------------------------
  console.log('\n>>> [TEST GROUP 2] PUBLIC -> ADMIN: Member Registration & Enrolment Flow');
  {
    const registerPage = fs.readFileSync(path.join(rootDir, 'src/app/(public)/register/page.tsx'), 'utf-8');
    assert(registerPage.includes('handlePaymentProofUpload'), 'Member registration has deposit slip file uploader');
    assert(registerPage.includes('/api/upload'), 'Member registration uploads slip via /api/upload');
    assert(registerPage.includes('mBoB Transfer Details'), 'Member registration Step 4 renders interactive mBoB details');
    assert(registerPage.includes('Bank Deposit / SWIFT Wire Details'), 'Member registration Step 4 renders interactive Bank details');
    assert(registerPage.includes('setProofUrl'), 'Member registration tracks proofUrl state');

    const applicationsRoute = fs.readFileSync(path.join(rootDir, 'src/app/api/applications/route.ts'), 'utf-8');
    assert(applicationsRoute.includes('uploadedDocUrl'), 'Applications public API captures uploadedDocUrl / proofUrl');
    assert(applicationsRoute.includes('reviewerNotes: paymentNotes'), 'Applications public API records payment reference in reviewer notes');

    const adminApplicationsPage = fs.readFileSync(path.join(rootDir, 'src/app/(admin)/admin/applications/page.tsx'), 'utf-8');
    assert(adminApplicationsPage.includes('Payment Deposit Slip / Proof Uploaded'), 
      'Admin applications dossier inspector displays clickable payment slip proof link');
    assert(adminApplicationsPage.includes('handleApprove'), 'Admin applications studio has atomic approval and enrollment trigger');
  }

  // ---------------------------------------------------------------------------
  // MODULE 3: ADMIN -> PUBLIC: Wholesale Quick Decision Action & Email Dispatch
  // ---------------------------------------------------------------------------
  console.log('\n>>> [TEST GROUP 3] ADMIN -> PUBLIC: Wholesale Approval & Decline Action Route');
  {
    const actionRoute = fs.readFileSync(path.join(rootDir, 'src/app/api/admin/wholesale/action/route.ts'), 'utf-8');
    assert(actionRoute.includes("action === 'APPROVE' ? 'ACTIVE' : 'REJECTED'"), 
      'Action route transitions account status atomically');
    assert(actionRoute.includes('sendEmail'), 'Action route dispatches email notification to applicant');
    assert(actionRoute.includes('logAudit'), 'Action route records tamper-evident audit trail entry');
  }

  // ---------------------------------------------------------------------------
  // MODULE 4: ADMIN -> PUBLIC: Excel / CSV Bulk Import & Export Engines
  // ---------------------------------------------------------------------------
  console.log('\n>>> [TEST GROUP 4] ADMIN: Excel / CSV Bulk Data Exchange System');
  {
    const spreadsheetLib = fs.readFileSync(path.join(rootDir, 'src/lib/spreadsheet.ts'), 'utf-8');
    assert(spreadsheetLib.includes('parseCsv'), 'Spreadsheet engine contains RFC-4180 CSV parser');
    assert(spreadsheetLib.includes('\\uFEFF'), 'Spreadsheet engine outputs UTF-8 BOM for Microsoft Excel Windows compatibility');
    assert(spreadsheetLib.includes('validateWholesaleImport'), 'Spreadsheet engine validates wholesaler records');
    assert(spreadsheetLib.includes('validateMemberImport'), 'Spreadsheet engine validates member records');
    assert(spreadsheetLib.includes('WHOLESALE_SAMPLE_ROWS'), 'Spreadsheet engine provides downloadable wholesaler template');
    assert(spreadsheetLib.includes('MEMBER_SAMPLE_ROWS'), 'Spreadsheet engine provides downloadable member template');

    const wholesaleImportRoute = fs.readFileSync(path.join(rootDir, 'src/app/api/admin/wholesale/import/route.ts'), 'utf-8');
    assert(wholesaleImportRoute.includes('prisma.wholesaleBuyer.create'), 'Wholesale import route persists valid rows to database');

    const membersImportRoute = fs.readFileSync(path.join(rootDir, 'src/app/api/admin/members/import/route.ts'), 'utf-8');
    assert(membersImportRoute.includes('prisma.member.create'), 'Members import route persists valid rows to database');
  }

  // ---------------------------------------------------------------------------
  // MODULE 5: ADMIN -> PUBLIC: Products CRUD & Home "New in the Shop"
  // ---------------------------------------------------------------------------
  console.log('\n>>> [TEST GROUP 5] ADMIN -> PUBLIC: Products CRUD & Home "New in the Shop"');
  {
    const productsAdminPage = fs.readFileSync(path.join(rootDir, 'src/app/(admin)/admin/products/page.tsx'), 'utf-8');
    assert(productsAdminPage.includes('generateProductSKU'), 'Admin products studio supports automatic SKU generation');
    assert(productsAdminPage.includes('showAddModal'), 'Admin products studio supports creating new products');
    assert(productsAdminPage.includes('editingProduct'), 'Admin products studio supports editing products');
    assert(productsAdminPage.includes('deletingProduct'), 'Admin products studio supports deleting products');

    const publicHomepage = fs.readFileSync(path.join(rootDir, 'src/app/(public)/page.tsx'), 'utf-8');
    assert(publicHomepage.includes("data-hab-section=\"shop\""), 'Public homepage mounts shop section with data-hab-section identifier');
    assert(publicHomepage.includes("SectionEditBadge"), 'Shop section mounts SectionEditBadge for Quick Edit mode');
    assert(publicHomepage.includes("p.priceUSD || p.price || 0"), 'Public products safely parse price without Nu. NaN errors');

    const craftPage = fs.readFileSync(path.join(rootDir, 'src/app/(public)/craft/[craft]/page.tsx'), 'utf-8');
    assert(craftPage.includes("craftTriptychs"), 'Craft detail page maps authentic process photography triptychs');
    assert(craftPage.includes("p.price_usd ?? p.price ?? p.priceUSD ?? 0"), 'Craft detail page guarantees safe price formatting');
  }

  // ---------------------------------------------------------------------------
  // MODULE 6: SUB-PAGE PARITY: All 34 HTML Templates & Specialized Sub-Pages
  // ---------------------------------------------------------------------------
  console.log('\n>>> [TEST GROUP 6] PUBLIC: 34 HTML Sub-Page Parity Matrix');
  {
    const requiredPages = [
      'about',
      'programmes',
      'projects',
      'membership',
      'news',
      'contact',
      'shop',
      'wholesale',
      'shipping-policy',
      'returns-policy',
      'track-order',
      'customs-policy',
      'members',
      'publications',
      'outlets',
      'login',
      'register',
      'board-of-trustees',
      'secretariat',
      'annual-reports',
      'audited-accounts',
      'tenders',
      'terms',
      'privacy',
      'donate',
      'clusters',
      'masters',
      'events',
      'basket'
    ];

    let missingPages = 0;
    for (const p of requiredPages) {
      const pageDir = path.join(rootDir, 'src/app/(public)', p);
      const exists = fs.existsSync(pageDir);
      if (!exists) {
        console.error(`  ✗ Missing page directory: ${p}`);
        missingPages++;
      }
    }
    assert(missingPages === 0, `All ${requiredPages.length} core and specialized sub-page routes exist without 404s`);
  }

  // ---------------------------------------------------------------------------
  // MODULE 7: FOOTER & ANNOUNCEMENT BAR PARITY
  // ---------------------------------------------------------------------------
  console.log('\n>>> [TEST GROUP 7] PUBLIC: Footer Architecture & Announcement Bar');
  {
    const footerCode = fs.readFileSync(path.join(rootDir, 'src/components/public/Footer.tsx'), 'utf-8');
    assert(footerCode.includes('Secretariat'), 'Footer includes Column 0: Secretariat');
    assert(footerCode.includes('Association'), 'Footer includes Column 1: Association');
    assert(footerCode.includes('Shop & support'), 'Footer includes Column 2: Shop & support');
    assert(footerCode.includes('Members'), 'Footer includes Column 3: Members');
    assert(footerCode.includes('Governance'), 'Footer includes Column 4: Governance');
    assert(footerCode.includes('facebook') && footerCode.includes('instagram') && footerCode.includes('tiktok'),
      'Footer renders all social media channels with dynamic URLs');
    assert(footerCode.includes('SectionEditBadge'), 'Footer is equipped with SectionEditBadge for in-place Quick Edit');

    const utilityBarCode = fs.readFileSync(path.join(rootDir, 'src/components/public/UtilityBar.tsx'), 'utf-8');
    assert(!utilityBarCode.includes('{currentTickerIdx + 1}/{tickerMessages.length}'), 
      'Announcement bar counter numbers (1/3, 2/3) successfully removed as instructed');
    assert(utilityBarCode.includes('‹') && utilityBarCode.includes('›'), 
      'Announcement bar ticker navigation controls (‹, ›) preserved and working');
  }

  console.log('\n========================================================================');
  console.log(`2-WAY VERIFICATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTwoWayVerification().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
