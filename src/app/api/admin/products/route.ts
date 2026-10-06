import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { moveToRecycleBin } from '@/lib/recycle-bin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'products:view');

    const products = await prisma.product.findMany({
      include: {
        craft: true,
        maker: {
          select: { id: true, name: true, regNumber: true, status: true },
        },
        orderItems: {
          select: { id: true, orderId: true },
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
      stock,
      status,
      imageUrl,
      images,
    } = body;

    if (!code || !name || priceUSD === undefined || !craftKey) {
      return NextResponse.json(
        { success: false, error: 'Product code, name, priceUSD, and craft tradition are required.' },
        { status: 400 }
      );
    }

    // Check code uniqueness
    const existing = await prisma.product.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Product with code '${code}' already exists.` },
        { status: 400 }
      );
    }

    // Prepare images array
    let imageList = images || [];
    if (imageUrl && imageList.length === 0) {
      imageList = [{ url: imageUrl, role: 'primary' }];
    }

    const newProduct = await prisma.product.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        priceUSD: Math.max(0, Number(priceUSD)),
        craftKey,
        region: region || 'Bhutan',
        makerMemberId: makerMemberId || null,
        description: description || 'Authentic artisan handicraft curated by HAB.',
        images: imageList,
        stock: stock !== undefined ? Math.max(0, Number(stock)) : 10,
        status: ['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'ARCHIVED'].includes(status)
          ? status
          : 'PUBLISHED',
      },
      include: { craft: true, maker: true },
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: newProduct.id,
      details: {
        code: newProduct.code,
        name: newProduct.name,
        priceUSD: newProduct.priceUSD,
        craftKey: newProduct.craftKey,
        stock: newProduct.stock,
      },
    });

    return NextResponse.json({
      success: true,
      product: newProduct,
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
    const session = await requirePermission(req, 'products:edit');
    const body = await req.json();
    const {
      id,
      code,
      name,
      priceUSD,
      craftKey,
      region,
      makerMemberId,
      description,
      stock,
      inventoryCount,
      status,
      imageUrl,
      images,
    } = body;

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

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (priceUSD !== undefined) updateData.priceUSD = Math.max(0, Number(priceUSD));
    if (stock !== undefined) updateData.stock = Math.max(0, Number(stock));
    if (inventoryCount !== undefined) updateData.stock = Math.max(0, Number(inventoryCount));
    if (craftKey !== undefined) updateData.craftKey = craftKey;
    if (region !== undefined) updateData.region = region;
    if (makerMemberId !== undefined) updateData.makerMemberId = makerMemberId || null;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      updateData.status = ['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'ARCHIVED'].includes(status)
        ? status
        : 'PUBLISHED';
    }

    if (images !== undefined) {
      updateData.images = images;
    } else if (imageUrl !== undefined) {
      updateData.images = [{ url: imageUrl, role: 'primary' }];
    }

    const updated = await prisma.product.update({
      where,
      data: updateData,
      include: { craft: true, maker: true },
    });

    const ip = getClientIp(req);
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
        previous: {
          priceUSD: previous.priceUSD,
          stock: previous.stock,
          status: previous.status,
        },
        changes: updateData,
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'products:delete');
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');
    let code = searchParams.get('code');

    if (!id && !code) {
      try {
        const body = await req.json();
        id = body.id;
        code = body.code;
      } catch {
        // query params empty, body not JSON
      }
    }

    const where = id ? { id } : code ? { code } : null;
    if (!where) {
      return NextResponse.json(
        { success: false, error: 'Product id or code is required for deletion.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where,
      include: {
        orderItems: { select: { id: true, orderId: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found.' },
        { status: 404 }
      );
    }

    // Check if referenced by orders - if so, soft-delete via ARCHIVED, otherwise remove from products table
    const orderItemCount = product.orderItems.length;

    // 1. Snapshot product to Recycle Bin for recovery
    await moveToRecycleBin({
      entityType: 'PRODUCT',
      originalId: product.id,
      itemTitle: `${product.name} (${product.code})`,
      itemData: {
        id: product.id,
        code: product.code,
        name: product.name,
        priceUSD: product.priceUSD,
        craftKey: product.craftKey,
        region: product.region,
        description: product.description,
        images: product.images,
        stock: product.stock,
        status: product.status,
      },
      deletedBy: session.email,
      reason: 'Moved to Recycle Bin by administrator',
    });

    if (orderItemCount > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: { status: 'ARCHIVED' },
      });
    } else {
      await prisma.product.delete({ where: { id: product.id } });
    }

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'PRODUCT_MOVED_TO_RECYCLE_BIN',
      entityType: 'Product',
      entityId: product.id,
      details: {
        code: product.code,
        name: product.name,
        orderItemCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Product '${product.name}' (${product.code}) moved to Recycle Bin. You can restore or permanently purge it from the Recycle Bin studio.`,
    });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error deleting product.' },
      { status: err.statusCode || 500 }
    );
  }
}

export const PUT = PATCH;

