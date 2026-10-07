import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { getClientIp } from '@/lib/rbac';
import { saveFallbackWholesaleBuyer } from '@/lib/wholesale-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessName,
      buyerType,
      country = 'Bhutan',
      city,
      regNumber,
      website,
      contactPerson,
      position,
      phone,
      email,
      purpose,
      orderValue,
      frequency,
      customNotes,
      customOrderNotes,
      customOrderDate,
      selectedCrafts,
    } = body;

    if (!businessName?.trim() || !contactPerson?.trim() || !email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Business name, contact person, and business email are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCompany = businessName.trim();
    const cleanContact = contactPerson.trim();
    const cleanUsernameBase = (cleanEmail.split('@')[0] || cleanCompany)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15);
    const username = `${cleanUsernameBase || 'buyer'}_${Math.floor(100 + Math.random() * 900)}`;

    const notesSummary = [
      `Buyer Type: ${buyerType || 'General Wholesale'}`,
      position ? `Position: ${position}` : '',
      website ? `Website: ${website}` : '',
      purpose ? `Business Purpose: ${purpose}` : '',
      orderValue ? `Estimated Order Value: ${orderValue}` : '',
      frequency ? `Order Frequency: ${frequency}` : '',
      Array.isArray(selectedCrafts) && selectedCrafts.length > 0 ? `Selected Crafts: ${selectedCrafts.join(', ')}` : '',
      customNotes ? `Production Notes: ${customNotes}` : '',
      customOrderNotes ? `Order Details: ${customOrderNotes}` : '',
      customOrderDate ? `Target Delivery: ${customOrderDate}` : '',
    ].filter(Boolean).join('\n');

    const buyerId = crypto.randomUUID();
    const tempPassword = `HAB-${Math.random().toString(36).slice(2, 10)}`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const reference = `HAB-W-${buyerId.slice(0, 6).toUpperCase()}`;

    // 1. Resilient Fallback Storage
    saveFallbackWholesaleBuyer({
      id: buyerId,
      username,
      companyName: cleanCompany,
      contactName: cleanContact,
      email: cleanEmail,
      phone: phone ? String(phone).trim() : null,
      country: String(country).trim(),
      city: city ? String(city).trim() : null,
      taxId: regNumber ? String(regNumber).trim() : null,
      discountTier: 20,
      status: 'PENDING',
      notes: notesSummary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 2. Database Storage
    let dbBuyer: any = null;
    try {
      // Check if email already registered in DB
      const existing = await prisma.wholesaleBuyer.findFirst({
        where: { OR: [{ email: cleanEmail }, { username }] },
      }).catch(() => null);

      if (existing) {
        dbBuyer = await prisma.wholesaleBuyer.update({
          where: { id: existing.id },
          data: {
            companyName: cleanCompany,
            contactName: cleanContact,
            phone: phone ? String(phone).trim() : existing.phone,
            country: String(country).trim(),
            city: city ? String(city).trim() : existing.city,
            taxId: regNumber ? String(regNumber).trim() : existing.taxId,
            notes: notesSummary,
          },
        }).catch(() => null);
      } else {
        dbBuyer = await prisma.wholesaleBuyer.create({
          data: {
            id: buyerId,
            username,
            passwordHash,
            companyName: cleanCompany,
            contactName: cleanContact,
            email: cleanEmail,
            phone: phone ? String(phone).trim() : null,
            country: String(country).trim(),
            city: city ? String(city).trim() : null,
            taxId: regNumber ? String(regNumber).trim() : null,
            discountTier: 20,
            status: 'PENDING',
            notes: notesSummary,
          },
        }).catch((err) => {
          console.warn('[wholesale/register] Database insert error (fallback preserved):', err.message);
          return null;
        });
      }

      if (dbBuyer) {
        const ip = getClientIp(req);
        logAudit({
          actorType: 'GUEST',
          actorIdentifier: cleanEmail,
          actorIp: ip,
          action: 'WHOLESALE_BUYER_REGISTRATION_SUBMITTED',
          entityType: 'WholesaleBuyer',
          entityId: dbBuyer.id,
          details: {
            companyName: cleanCompany,
            email: cleanEmail,
            username: dbBuyer.username,
          },
        }).catch(() => {});
      }
    } catch (dbErr: any) {
      console.warn('[wholesale/register] DB operation skipped, preserved in fallback store:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      reference,
      buyerId: dbBuyer ? dbBuyer.id : buyerId,
      message: 'Wholesale buyer registration received successfully. The secretariat will review your credentials within three working days.',
    });
  } catch (err: any) {
    console.error('Error registering wholesale buyer:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error processing wholesale registration.' },
      { status: 500 }
    );
  }
}
