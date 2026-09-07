import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'products:review');

    const products = await prisma.product.findMany({
      include: {
        craft: true,
        maker: {
          select: { id: true, name: true, regNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (err: any) {
    console.error('Error fetching admin products:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching products.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'products:create');
    const body = await req.json();
    const {
      code,
      name,
      priceUSD,
      craftKey,
      region,
      makerMemberId,
      description,
      inventoryCount,
      stock,
    } = body;

    if (!code || !name || !priceUSD || !craftKey) {
      return NextResponse.json(
        { success: false, error: 'code, name, priceUSD, and craftKey are required.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        code,
        name,
        priceUSD: Number(priceUSD),
        craftKey,
        region: region || 'Bhutan',
        makerMemberId: makerMemberId || null,
        description: description || 'Masterpiece curated by HAB Secretariat.',
        images: [],
        stock: Number(inventoryCount ?? stock) || 10,
        status: 'PUBLISHED',
      },
      include: { craft: true, maker: true },
    });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product.id,
      details: {
        code: product.code,
        name: product.name,
        priceUSD: product.priceUSD,
        craftKey: product.craftKey,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (err: any) {
    console.error('Error creating product:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error creating product.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'products:review');
    const body = await req.json();
    const { id, code, priceUSD, inventoryCount, stock, status, name, description } = body;

    const where = id ? { id } : code ? { code } : null;
    if (!where) {
      return NextResponse.json(
        { success: false, error: 'Product id or code is required.' },
        { status: 400 }
      );
    }

    const previous = await prisma.product.findUnique({ where });
    if (!previous) {
      return NextResponse.json(
        { success: false, error: 'Product not found.' },
        { status: 404 }
      );
    }

    const dataToUpdate: any = {};
    if (priceUSD !== undefined) dataToUpdate.priceUSD = Number(priceUSD);
    if (inventoryCount !== undefined) dataToUpdate.stock = Math.max(0, Number(inventoryCount));
    if (stock !== undefined) dataToUpdate.stock = Math.max(0, Number(stock));
    if (status) dataToUpdate.status = status;
    if (name) dataToUpdate.name = name;
    if (description) dataToUpdate.description = description;

    const updated = await prisma.product.update({
      where,
      data: dataToUpdate,
      include: { craft: true, maker: true },
    });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'PRODUCT_UPDATED',
      entityType: 'Product',
      entityId: updated.id,
      details: {
        code: updated.code,
        changes: dataToUpdate,
      },
    });

    return NextResponse.json({
      success: true,
      product: updated,
    });
  } catch (err: any) {
    console.error('Error updating product:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating product.' },
      { status: err.statusCode || 500 }
    );
  }
}
