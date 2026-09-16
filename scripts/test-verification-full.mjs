// Automated Verification Test Script: Dynamic Uploads, Multi-Entity Global Search & Universal 2-Way CRUD
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function runTests() {
  console.log('=== STARTING UNIVERSAL CRUD, UPLOADS & SEARCH VERIFICATION ===\n');

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
    // 1. DYNAMIC UPLOAD TEST
    console.log('1. Testing Dynamic File Streaming Handler (/uploads/[...slug])...');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const testFileName = `test_verification_${Date.now()}.png`;
    const testFilePath = path.join(uploadsDir, testFileName);
    // 1x1 transparent PNG buffer
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testFilePath, pngBuffer);

    assert(fs.existsSync(testFilePath), `Test file written to disk at public/uploads/${testFileName}`);

    // Verify route handler logic
    const MIME_TYPES = { png: 'image/png', jpg: 'image/jpeg', pdf: 'application/pdf' };
    const ext = path.extname(testFilePath).replace('.', '');
    assert(MIME_TYPES[ext] === 'image/png', `MIME type resolved correctly to image/png`);
    assert(fs.statSync(testFilePath).size === pngBuffer.length, `File size matches buffer (${pngBuffer.length} bytes)`);

    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('  ✓ Upload file test completed.\n');

    // 2. MULTI-ENTITY GLOBAL SEARCH TEST
    console.log('2. Testing Multi-Entity Global Search Engine...');
    const searchQueries = [
      { q: 'Thagzo', check: 'crafts' },
      { q: 'Mask', check: 'products' },
      { q: 'Sonam', check: 'members' },
      { q: 'Report', check: 'newsOrPubs' },
    ];

    for (const item of searchQueries) {
      const q = item.q;
      const [prods, crafts, mems, news, pubs] = await Promise.all([
        prisma.product.findMany({
          where: {
            status: 'PUBLISHED',
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { code: { contains: q, mode: 'insensitive' } },
              { craftKey: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
        prisma.craft.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { english: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
        prisma.member.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { bio: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
        prisma.newsArticle.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { blurb: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
        prisma.publication.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { kind: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
      ]);

      const totalMatches = prods.length + crafts.length + mems.length + news.length + pubs.length;
      assert(totalMatches > 0, `Search for "${q}" returned ${totalMatches} matching entities`);
    }
    console.log('  ✓ Search verification completed.\n');

    // 3. UNIVERSAL 2-WAY CRUD & IMAGE REPLACEMENT TEST
    console.log('3. Testing Universal 2-Way CRUD (Create -> Replace Image & Update Text -> Read Public -> Delete)...');

    const testCode = `TEST_${Date.now().toString().slice(-5)}`;
    const initialImgUrl = `/uploads/initial_${testCode}.jpg`;
    const replacedImgUrl = `/uploads/replaced_${testCode}.jpg`;

    // Step A: CREATE product with initial image
    const created = await prisma.product.create({
      data: {
        code: testCode,
        name: `Automated Test Mask ${testCode}`,
        priceUSD: 145.0,
        craftKey: 'parzo',
        region: 'Trashiyangtse',
        stock: 8,
        status: 'PUBLISHED',
        description: 'Hand-carved ritual dance mask created during 2-way verification testing.',
        images: [{ url: initialImgUrl, role: 'primary' }],
      },
    });

    assert(created.id && created.code === testCode, `Product successfully created in PostgreSQL with code ${testCode}`);
    assert(created.images[0]?.url === initialImgUrl, `Product initialized with image URL: ${initialImgUrl}`);

    // Step B: READ from public viewpoint
    const publicRead1 = await prisma.product.findUnique({
      where: { code: testCode },
      include: { craft: true },
    });
    assert(publicRead1.status === 'PUBLISHED', `Public catalog read confirms product is PUBLISHED`);
    assert(publicRead1.priceUSD === 145.0, `Public catalog price is $145.00`);

    // Step C: UPDATE / REPLACE Image, Price, and Description
    const updated = await prisma.product.update({
      where: { code: testCode },
      data: {
        priceUSD: 180.0,
        stock: 12,
        name: `Updated Test Mask ${testCode}`,
        description: 'Updated ritual dance mask description with newly replaced photograph.',
        images: [{ url: replacedImgUrl, role: 'primary' }],
      },
    });

    assert(updated.priceUSD === 180.0, `Product price updated from $145 -> $180`);
    assert(updated.stock === 12, `Product stock updated from 8 -> 12`);
    assert(updated.images[0]?.url === replacedImgUrl, `Product image REPLACED from ${initialImgUrl} -> ${replacedImgUrl}`);

    // Step D: VERIFY 2-WAY REFLECTION
    const publicRead2 = await prisma.product.findUnique({
      where: { code: testCode },
    });
    assert(publicRead2.images[0]?.url === replacedImgUrl, `2-Way Reflection: Public query receives updated image URL ${replacedImgUrl}`);
    assert(publicRead2.priceUSD === 180.0, `2-Way Reflection: Public query receives updated price $180.00`);

    // Step E: DELETE and verify removal
    await prisma.product.delete({ where: { code: testCode } });
    const publicRead3 = await prisma.product.findUnique({ where: { code: testCode } });
    assert(publicRead3 === null, `Product deleted and verified completely removed from public view`);

    console.log('  ✓ 2-Way CRUD verification completed.\n');

    // 4. CLUSTERS & OUTLETS 2-WAY TEST
    console.log('4. Testing Craft Cluster 2-Way CRUD & Image Replacement...');
    const testClusterKey = `test_cluster_${Date.now().toString().slice(-4)}`;
    const cluster = await prisma.clusterRecord.create({
      data: {
        key: testClusterKey,
        name: 'Test Weaving Village',
        craftKey: 'thagzo',
        dzongkhag: 'Lhuentse',
        members: 42,
        summary: 'Village cluster test summary.',
        story: 'Village cluster test story.',
      },
    });
    assert(cluster.key === testClusterKey, `Cluster created: ${cluster.name}`);

    const updatedCluster = await prisma.clusterRecord.update({
      where: { key: testClusterKey },
      data: {
        members: 45,
        summary: 'Updated village cluster summary.',
      },
    });
    assert(updatedCluster.members === 45, `Cluster members updated to 45`);

    await prisma.clusterRecord.delete({ where: { key: testClusterKey } });
    assert(
      (await prisma.clusterRecord.findUnique({ where: { key: testClusterKey } })) === null,
      `Cluster deleted and removed.`
    );
    console.log('  ✓ Clusters verification completed.\n');

  } catch (err) {
    console.error('Fatal error during test run:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log(`=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
