import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const craft = searchParams.get('craft');
    const dzongkhag = searchParams.get('dzongkhag');
    const q = searchParams.get('q')?.trim()?.toLowerCase();
    const slug = searchParams.get('slug');

    // Single member query by slug or name
    if (slug) {
      const decodedSlug = decodeURIComponent(slug).toLowerCase();
      const member = await prisma.member.findFirst({
        where: {
          status: 'VERIFIED',
          OR: [
            { name: { equals: decodedSlug, mode: 'insensitive' } },
            { regNumber: { equals: decodedSlug, mode: 'insensitive' } },
          ],
        },
        include: {
          craft: true,
          products: {
            where: { status: 'PUBLISHED' },
            select: {
              id: true,
              code: true,
              name: true,
              priceUSD: true,
              images: true,
              stock: true,
              craftKey: true,
              region: true,
            },
          },
        },
      });

      if (!member) {
        return NextResponse.json(
          { success: false, error: 'Artisan member profile not found.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        member,
      });
    }

    // List all verified members with optional filtering
    const whereClause: any = {
      status: 'VERIFIED',
    };

    if (craft) {
      whereClause.craftKey = craft;
    }

    if (dzongkhag) {
      whereClause.dzongkhag = dzongkhag;
    }

    if (q) {
      whereClause.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
        { dzongkhag: { contains: q, mode: 'insensitive' } },
        { regNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    const members = await prisma.member.findMany({
      where: whereClause,
      include: {
        craft: true,
        products: {
          where: { status: 'PUBLISHED' },
          select: { id: true, code: true, name: true, priceUSD: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: members.length,
      members,
    });
  } catch (err: any) {
    console.error('Error fetching public members:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching member directory.' },
      { status: 500 }
    );
  }
}
