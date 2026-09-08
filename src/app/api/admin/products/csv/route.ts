import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// GET: Export all products as CSV
export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'products:view');

    const products = await prisma.product.findMany({
      include: {
        craft: true,
        maker: { select: { name: true, regNumber: true } },
      },
      orderBy: { code: 'asc' },
    });

    const headers = ['Code', 'Name', 'PriceUSD', 'CraftKey', 'Stock', 'Status', 'Region', 'Maker', 'Description'];
    const rows = products.map((p) => [
      `"${p.code}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.priceUSD.toFixed(2),
      `"${p.craftKey}"`,
      p.stock,
      `"${p.status}"`,
      `"${(p.region || '').replace(/"/g, '""')}"`,
      `"${(p.maker?.name || '').replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="hab_products_catalog_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    console.error('Error exporting products CSV:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error exporting products CSV.' },
      { status: err.statusCode || 500 }
    );
  }
}

// POST: Bulk import products from CSV
export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'products:create');
    const body = await req.json();
    const { items, csvText } = body;

    let parsedItems: any[] = [];

    if (Array.isArray(items) && items.length > 0) {
      parsedItems = items;
    } else if (typeof csvText === 'string' && csvText.trim()) {
      const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        return NextResponse.json(
          { success: false, error: 'CSV must contain at least a header row and one data row.' },
          { status: 400 }
        );
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const codeIdx = headers.findIndex(h => h === 'code' || h === 'sku');
      const nameIdx = headers.findIndex(h => h === 'name' || h === 'title');
      const priceIdx = headers.findIndex(h => h.includes('price'));
      const craftIdx = headers.findIndex(h => h.includes('craft'));
      const stockIdx = headers.findIndex(h => h.includes('stock') || h.includes('qty'));
      const descIdx = headers.findIndex(h => h.includes('desc'));
      const regionIdx = headers.findIndex(h => h === 'region');

      if (codeIdx === -1 || nameIdx === -1 || priceIdx === -1 || craftIdx === -1) {
        return NextResponse.json(
          { success: false, error: 'CSV missing required headers: Code, Name, PriceUSD, CraftKey' },
          { status: 400 }
        );
      }

      for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i];
        // Split by comma preserving quoted values
        const cols: string[] = [];
        let cur = '';
        let insideQuote = false;
        for (let c = 0; c < rawLine.length; c++) {
          const char = rawLine[c];
          if (char === '"') {
            insideQuote = !insideQuote;
          } else if (char === ',' && !insideQuote) {
            cols.push(cur.trim().replace(/^"|"$/g, ''));
            cur = '';
          } else {
            cur += char;
          }
        }
        cols.push(cur.trim().replace(/^"|"$/g, ''));

        const code = cols[codeIdx]?.trim();
        const name = cols[nameIdx]?.trim();
        const price = parseFloat(cols[priceIdx]);
        const craftKey = cols[craftIdx]?.trim().toLowerCase();
        const stock = stockIdx !== -1 ? parseInt(cols[stockIdx]) || 0 : 10;
        const description = descIdx !== -1 ? cols[descIdx]?.trim() : '';
        const region = regionIdx !== -1 ? cols[regionIdx]?.trim() : 'Bhutan';

        if (code && name && !isNaN(price) && craftKey) {
          parsedItems.push({ code, name, priceUSD: price, craftKey, stock, description, region });
        }
      }
    }

    if (parsedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid product rows parsed from payload.' },
        { status: 400 }
      );
    }

    let createdCount = 0;
    let updatedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const item of parsedItems) {
        const existing = await tx.product.findUnique({
          where: { code: item.code.toUpperCase() },
        });

        if (existing) {
          await tx.product.update({
            where: { id: existing.id },
            data: {
              name: item.name,
              priceUSD: Math.max(0, Number(item.priceUSD)),
              craftKey: item.craftKey,
              stock: Math.max(0, Number(item.stock)),
              description: item.description || existing.description,
              region: item.region || existing.region,
            },
          });
          updatedCount++;
        } else {
          await tx.product.create({
            data: {
              code: item.code.toUpperCase(),
              name: item.name,
              priceUSD: Math.max(0, Number(item.priceUSD)),
              craftKey: item.craftKey,
              stock: Math.max(0, Number(item.stock)),
              description: item.description || 'Authentic artisan handicraft curated by HAB.',
              region: item.region || 'Bhutan',
              images: [{ url: `/images/crafts/${item.craftKey}.jpg`, role: 'primary' }],
              status: 'PUBLISHED',
            },
          });
          createdCount++;
        }
      }
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'PRODUCTS_BULK_IMPORTED',
      entityType: 'Product',
      entityId: `bulk_${Date.now()}`,
      details: {
        totalRows: parsedItems.length,
        createdCount,
        updatedCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${parsedItems.length} items (${createdCount} created, ${updatedCount} updated).`,
      createdCount,
      updatedCount,
    });
  } catch (err: any) {
    console.error('Error importing products CSV:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error processing bulk product import.' },
      { status: err.statusCode || 500 }
    );
  }
}
