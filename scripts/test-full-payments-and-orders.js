const { PrismaClient, PaymentMethod } = require('E:/ai/bhutanprojects/newbend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('=== Starting Full Payment Gateways, COD & Admin Orders Verification ===\n');

  try {
    // 1. Verify PaymentMethod enum supports COD
    console.log('1. Checking Prisma PaymentMethod Enum...');
    console.log('   Available enum values:', Object.values(PaymentMethod));
    if (!PaymentMethod.COD) {
      throw new Error('PaymentMethod.COD is missing from Prisma Client!');
    }
    console.log('   ✓ PaymentMethod.COD is present and verified.\n');

    // 2. Test Creating an Order with Cash on Delivery (COD)
    console.log('2. Testing E-Commerce Order Placement with COD...');
    const codOrderNumber = `TEST-COD-${Date.now().toString().slice(-5)}`;
    const createdCodOrder = await prisma.order.create({
      data: {
        orderNumber: codOrderNumber,
        customerType: 'GUEST',
        customerName: 'Sonam Dorji',
        customerEmail: 'sonam.dorji@druknet.bt',
        customerPhone: '+975 17123456',
        shippingAddress: {
          fullName: 'Sonam Dorji',
          street: 'Changzamtog Expressway Building 14',
          city: 'Thimphu',
          dzongkhag: 'Thimphu',
          country: 'Bhutan',
          postalCode: '11001',
          phone: '+975 17123456',
        },
        shippingMethod: 'EMS',
        shippingFeeUSD: 0,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        orderStatus: 'PROCESSING',
        currencyUsed: 'BTN',
        fxRateAtPurchase: 84.0,
        totalUSD: 85.0,
        totalPaidCurrency: 7140.0,
        internalNotes: '[CASH ON DELIVERY] Payment of Nu. 7140 to be collected upon courier arrival.',
        items: [
          {
            code: 'YAT01',
            name: 'Yathra Woolen Table Runner',
            priceUSD: 85.0,
            quantity: 1,
          },
        ],
      },
    });

    console.log(`   ✓ Created COD Order: ${createdCodOrder.orderNumber}`);
    console.log(`     Payment Method: ${createdCodOrder.paymentMethod}`);
    console.log(`     Payment Status: ${createdCodOrder.paymentStatus}`);
    console.log(`     Order Status: ${createdCodOrder.orderStatus}`);
    console.log(`     Shipping Address:`, JSON.stringify(createdCodOrder.shippingAddress));
    console.log(`     Internal Notes: ${createdCodOrder.internalNotes}\n`);

    // 3. Test Order with mBoB & Transaction Reference
    console.log('3. Testing E-Commerce Order Placement with mBoB...');
    const mbobOrderNumber = `TEST-MBOB-${Date.now().toString().slice(-5)}`;
    const createdMbobOrder = await prisma.order.create({
      data: {
        orderNumber: mbobOrderNumber,
        customerType: 'GUEST',
        customerName: 'Dechen Zangmo',
        customerEmail: 'dechen.z@example.bt',
        customerPhone: '+975 77889900',
        mBOBTransactionRef: 'BOB-TXN-984721',
        shippingAddress: {
          fullName: 'Dechen Zangmo',
          street: 'Norzin Lam Shop 12',
          city: 'Thimphu',
          dzongkhag: 'Thimphu',
          country: 'Bhutan',
          postalCode: '11001',
          phone: '+975 77889900',
        },
        shippingMethod: 'EMS',
        shippingFeeUSD: 0,
        paymentMethod: 'MBOB',
        paymentStatus: 'PENDING',
        orderStatus: 'PROCESSING',
        currencyUsed: 'BTN',
        fxRateAtPurchase: 84.0,
        totalUSD: 120.0,
        totalPaidCurrency: 10080.0,
        internalNotes: '[mBoB] Customer submitted Journal Ref: BOB-TXN-984721.',
        items: [
          {
            code: 'DES01',
            name: 'Desho Handmade Manuscript Paper Set',
            priceUSD: 60.0,
            quantity: 2,
          },
        ],
      },
    });

    console.log(`   ✓ Created mBoB Order: ${createdMbobOrder.orderNumber}`);
    console.log(`     Payment Method: ${createdMbobOrder.paymentMethod}`);
    console.log(`     mBoB Ref: ${createdMbobOrder.mBOBTransactionRef}`);
    console.log(`     Customer Phone: ${createdMbobOrder.customerPhone}\n`);

    // 4. Test Admin Order Fetch & Address Verification
    console.log('4. Testing Admin Order Delivery Address Resolution...');
    const fetchedOrders = await prisma.order.findMany({
      where: {
        orderNumber: { in: [codOrderNumber, mbobOrderNumber] },
      },
    });

    for (const o of fetchedOrders) {
      const addr = o.shippingAddress;
      console.log(`   Order #${o.orderNumber}:`);
      console.log(`     Consignee: ${addr.fullName || o.customerName}`);
      console.log(`     Street: ${addr.street}`);
      console.log(`     Location: ${addr.city}, ${addr.country} ${addr.postalCode}`);
      console.log(`     Contact Phone: ${o.customerPhone || addr.phone}`);
      if (!addr.street || !addr.city) {
        throw new Error(`Order ${o.orderNumber} is missing delivery address street or city!`);
      }
    }
    console.log('   ✓ Delivery address successfully resolved for staff dispatch.\n');

    // 5. Test Admin Updating Address and Reconciling Payment
    console.log('5. Testing Admin Order Updates (Address Edit + Mark as PAID)...');
    const updated = await prisma.order.update({
      where: { id: createdCodOrder.id },
      data: {
        paymentStatus: 'PAID',
        trackingNumber: 'BP-EMS-BT-99001',
        shippingAddress: {
          fullName: 'Sonam Dorji (Amended)',
          street: 'Kawajangsa Ministerial Enclave Villa 5',
          city: 'Thimphu',
          dzongkhag: 'Thimphu',
          country: 'Bhutan',
          postalCode: '11002',
          phone: '+975 17123456',
        },
        internalNotes: '[CASH ON DELIVERY] Payment collected by Bhutan Post courier on parcel handover. Reconciled.',
      },
    });

    console.log(`   ✓ Updated Order ${updated.orderNumber}:`);
    console.log(`     New Payment Status: ${updated.paymentStatus}`);
    console.log(`     Tracking Number: ${updated.trackingNumber}`);
    console.log(`     Updated Street: ${updated.shippingAddress.street}`);
    console.log(`     Updated Internal Notes: ${updated.internalNotes}\n`);

    // 6. Cleanup test records
    await prisma.order.deleteMany({
      where: { orderNumber: { in: [codOrderNumber, mbobOrderNumber] } },
    });
    console.log('6. Cleaned up test records. Database is clean.\n');

    console.log('🎉 ALL PAYMENT GATEWAYS, COD, AND ADMIN ORDER CHECKS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test Failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
