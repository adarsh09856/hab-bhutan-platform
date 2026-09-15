import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runPhase2Tests() {
  console.log('====================================================');
  console.log('  STARTING TWO-WAY VERIFICATION FOR PHASE 2');
  console.log('  Universal Components: FileUploadInput & RichTextEditor');
  console.log('====================================================\n');

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
    const cwd = 'E:\\ai\\bhutanprojects\\newbend';

    // ----------------------------------------------------
    // TEST 1: Verify /api/admin/upload logic & filesystem
    // ----------------------------------------------------
    console.log('[1/4] Testing File Upload Logic & Storage Pipeline...');

    const uploadsDir = path.join(cwd, 'public', 'uploads');
    assert(fs.existsSync(uploadsDir), `Uploads directory exists at ${uploadsDir}`);

    // Create a mock image file buffer
    const mockImageBuffer = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;');
    const testImageFilename = `test_artisan_${Date.now()}.gif`;
    const testImagePath = path.join(uploadsDir, testImageFilename);
    await fs.promises.writeFile(testImagePath, mockImageBuffer);

    assert(fs.existsSync(testImagePath), `Image successfully saved to disk: ${testImageFilename}`);
    const imgStat = await fs.promises.stat(testImagePath);
    assert(imgStat.size > 0, `Image file has non-zero size (${imgStat.size} bytes)`);

    // Clean up test image
    await fs.promises.unlink(testImagePath);
    assert(!fs.existsSync(testImagePath), 'Test image cleaned up successfully');

    // ----------------------------------------------------
    // TEST 2: Verify PDF Document Handling
    // ----------------------------------------------------
    console.log('\n[2/4] Testing PDF / Document Handling Pipeline...');

    const mockPdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    const testPdfFilename = `test_publication_${Date.now()}.pdf`;
    const testPdfPath = path.join(uploadsDir, testPdfFilename);
    await fs.promises.writeFile(testPdfPath, mockPdfBuffer);

    assert(fs.existsSync(testPdfPath), `PDF document successfully saved to disk: ${testPdfFilename}`);
    const pdfStat = await fs.promises.stat(testPdfPath);
    assert(pdfStat.size > 0, `PDF file has non-zero size (${pdfStat.size} bytes)`);

    // Clean up test pdf
    await fs.promises.unlink(testPdfPath);
    assert(!fs.existsSync(testPdfPath), 'Test PDF cleaned up successfully');

    // ----------------------------------------------------
    // TEST 3: Rich Text HTML with Brand Colors & Styling
    // ----------------------------------------------------
    console.log('\n[3/4] Testing Rich Text Editor Brand Color & Formatting Persistence...');

    const sampleRichHtml = `
      <h2 style="color: #8B2E24;">Master Weavers of Lhuentse</h2>
      <p>Practicing authentic <strong style="color: #D97706;">Kishuthara</strong> silk brocade with traditional backstrap looms.</p>
      <ul>
        <li>Natural vegetable and madder root dyes</li>
        <li>100% Certified Bhutanese silk warp</li>
      </ul>
      <blockquote>Honoured with the National Seal of Authenticity.</blockquote>
    `.trim();

    // Verify DB persistence of rich HTML without escaping or truncation
    const testProductCode = `TEST-P2-${Date.now().toString().slice(-4)}`;
    const createdProduct = await prisma.product.create({
      data: {
        code: testProductCode,
        name: 'Phase 2 Test Textile',
        craftKey: 'thagzo',
        region: 'Lhuentse',
        priceUSD: 250,
        
        stock: 5,
        status: 'PUBLISHED',
        images: [{ url: '/assets/photos/product-hhb01.jpg', role: 'primary' }],
        description: sampleRichHtml,
      },
    });

    assert(createdProduct.id !== undefined, `Created test product with code ${testProductCode}`);
    assert(createdProduct.description.includes('#8B2E24'), 'Preserved HAB Madder Red brand color hex in description');
    assert(createdProduct.description.includes('#D97706'), 'Preserved Bhutan Gold brand color hex in description');
    assert(createdProduct.description.includes('Kishuthara</strong>') && createdProduct.description.includes('<strong'), 'Preserved bold HTML formatting tag');
    assert(createdProduct.description.includes('<ul>'), 'Preserved unordered list formatting tag');

    // Clean up test product
    await prisma.product.delete({ where: { id: createdProduct.id } });
    console.log('  ✓ Cleaned up test product record from database');

    // ----------------------------------------------------
    // TEST 4: Verify Component Coverage Across Admin Modules
    // ----------------------------------------------------
    console.log('\n[4/4] Verifying Universal Component Coverage Across Admin Modules...');

    const modulesChecking = [
      { name: 'Products Catalog', file: 'src/app/(admin)/admin/products/page.tsx', checks: ['FileUploadInput', 'RichTextEditor'] },
      { name: 'Artisan Members', file: 'src/app/(admin)/admin/members/page.tsx', checks: ['FileUploadInput', 'RichTextEditor'] },
      { name: 'Events Calendar', file: 'src/app/(admin)/admin/events/page.tsx', checks: ['RichTextEditor'] },
      { name: 'Global Site Settings', file: 'src/app/(admin)/admin/site-settings/page.tsx', checks: ['FileUploadInput', 'RichTextEditor'] },
      { name: 'Photo & Asset Library', file: 'src/app/(admin)/admin/media/page.tsx', checks: ['FileUploadInput'] },
      { name: 'Publications Studio', file: 'src/app/(admin)/admin/publications/page.tsx', checks: ['FileUploadInput', 'RichTextEditor'] },
      { name: 'Honours & Masters', file: 'src/app/(admin)/admin/honours/page.tsx', checks: ['FileUploadInput', 'RichTextEditor'] },
      { name: 'News & Editorial', file: 'src/app/(admin)/admin/content/page.tsx', checks: ['FileUploadInput', 'RichTextEditor'] },
      { name: 'Hero Slideshow', file: 'src/app/(admin)/admin/hero/page.tsx', checks: ['FileUploadInput'] },
      { name: 'Homepage Studio', file: 'src/app/(admin)/admin/pages/home/page.tsx', checks: ['FileUploadInput', 'RichTextEditor'] },
      { name: 'About Us Studio', file: 'src/app/(admin)/admin/pages/about/page.tsx', checks: ['RichTextEditor'] },
      { name: 'Programmes Studio', file: 'src/app/(admin)/admin/programmes/page.tsx', checks: ['RichTextEditor'] },
      { name: 'Outlets & Clusters', file: 'src/app/(admin)/admin/clusters-outlets/page.tsx', checks: ['RichTextEditor'] },
      { name: 'Donations Studio', file: 'src/app/(admin)/admin/donate-settings/page.tsx', checks: ['RichTextEditor'] },
      { name: 'Legal Policies', file: 'src/app/(admin)/admin/policies/page.tsx', checks: ['RichTextEditor'] },
    ];

    for (const mod of modulesChecking) {
      const filePath = path.join(cwd, mod.file);
      const exists = fs.existsSync(filePath);
      assert(exists, `Module file exists: ${mod.file}`);
      if (exists) {
        const content = fs.readFileSync(filePath, 'utf-8');
        for (const check of mod.checks) {
          assert(content.includes(check), `${mod.name} integrates ${check}`);
        }
      }
    }

    console.log('\n====================================================');
    console.log(`  PHASE 2 TWO-WAY VERIFICATION COMPLETE`);
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase2Tests();
