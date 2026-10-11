import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { cleanOutletGalleryMarker, packOutletGallery, readOutletGallery } from '@/lib/outlet-gallery';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const isStaff =
    user.roleSlug === 'super_admin' ||
    user.roleSlug === 'staff_operator' ||
    user.permissions?.includes('*') ||
    user.permissions?.includes('content:edit');
  return isStaff ? user : null;
}

function packOutletNote(note?: string | null, imageUrl?: string | null, currentNote?: string | null) {
  let cleanNote = note !== undefined ? (note?.trim() || '') : (currentNote?.trim() || '');
  let finalImg = imageUrl !== undefined ? (imageUrl?.trim() || null) : null;
  if (imageUrl === undefined && currentNote) {
    const match = currentNote.match(/<!--\s*HAB_IMAGE:\s*(.*?)\s*-->/);
    if (match) finalImg = match[1].trim();
  }
  cleanNote = cleanNote.replace(/<!--\s*HAB_IMAGE:\s*[\s\S]*?-->/g, '').trim();
  if (finalImg) {
    return cleanNote ? `${cleanNote}\n<!-- HAB_IMAGE: ${finalImg} -->` : `<!-- HAB_IMAGE: ${finalImg} -->`;
  }
  return cleanNote || null;
}

function unpackOutlet(outlet: any) {
  if (!outlet) return outlet;
  let note = outlet.note || '';
  let imageUrl = null;
  const match = note.match(/<!--\s*HAB_IMAGE:\s*(.*?)\s*-->/);
  if (match) {
    imageUrl = match[1].trim();
    note = note.replace(/<!--\s*HAB_IMAGE:\s*[\s\S]*?-->/g, '').trim();
  }
  return {
    ...outlet,
    note: cleanOutletGalleryMarker(note) || null,
    imageUrl: imageUrl || null,
    galleryImages: readOutletGallery(outlet.note),
  };
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const rawOutlets = await prisma.outletRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    const outlets = rawOutlets.map(unpackOutlet);
    return NextResponse.json({ success: true, outlets });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch outlets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      key,
      type,
      name,
      nameDz,
      sortOrder,
      isFeatured,
      place,
      placeDz,
      note,
      noteDz,
      description,
      descriptionDz,
      longDescription,
      longDescriptionDz,
      hours,
      hoursDz,
      stalls,
      stallsDz,
      craftsOnSite,
      craftsOnSiteDz,
      payment,
      paymentDz,
      gettingThere,
      gettingThereDz,
      facilities,
      facilitiesDz,
      imageUrl,
      galleryImages,
    } = body;

    if (!key || !name || !place) {
      return NextResponse.json({ error: 'key, name, and place are required' }, { status: 400 });
    }

    const outlet = await prisma.outletRecord.create({
      data: {
        key: key.trim().toLowerCase(),
        type: type?.trim() || 'OUTLET',
        name: name.trim(),
        nameDz: nameDz?.trim() || null,
        sortOrder: Number(sortOrder) || 0,
        isFeatured: Boolean(isFeatured),
        place: place.trim(),
        placeDz: placeDz?.trim() || null,
        note: packOutletGallery(packOutletNote(note, imageUrl), galleryImages || []),
        noteDz: noteDz?.trim() || null,
        description: description?.trim() || '',
        descriptionDz: descriptionDz?.trim() || null,
        longDescription: longDescription?.trim() || description?.trim() || '',
        longDescriptionDz: longDescriptionDz?.trim() || null,
        hours: hours?.trim() || '09:00 - 18:00 daily',
        hoursDz: hoursDz?.trim() || null,
        stalls: stalls?.trim() || null,
        stallsDz: stallsDz?.trim() || null,
        craftsOnSite: craftsOnSite?.trim() || null,
        craftsOnSiteDz: craftsOnSiteDz?.trim() || null,
        payment: payment?.trim() || 'Cash, card and mBoB accepted',
        paymentDz: paymentDz?.trim() || null,
        gettingThere: gettingThere?.trim() || null,
        gettingThereDz: gettingThereDz?.trim() || null,
        facilities: facilities?.trim() || null,
        facilitiesDz: facilitiesDz?.trim() || null,
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'OUTLET_CREATED',
      entityType: 'OutletRecord',
      entityId: outlet.id,
      details: { key: outlet.key, name: outlet.name },
    });

    return NextResponse.json({ success: true, outlet: unpackOutlet(outlet) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create outlet' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      id,
      key,
      type,
      name,
      nameDz,
      sortOrder,
      isFeatured,
      place,
      placeDz,
      note,
      noteDz,
      description,
      descriptionDz,
      longDescription,
      longDescriptionDz,
      hours,
      hoursDz,
      stalls,
      stallsDz,
      craftsOnSite,
      craftsOnSiteDz,
      payment,
      paymentDz,
      gettingThere,
      gettingThereDz,
      facilities,
      facilitiesDz,
      imageUrl,
      galleryImages,
    } = body;

    if (!id && !key) {
      return NextResponse.json({ error: 'id or key is required' }, { status: 400 });
    }

    const existing = await prisma.outletRecord.findUnique({
      where: id ? { id } : { key },
    });

    const packedNote = (note !== undefined || imageUrl !== undefined || galleryImages !== undefined)
      ? packOutletGallery(packOutletNote(note, imageUrl, existing?.note), galleryImages === undefined ? readOutletGallery(existing?.note) : galleryImages)
      : undefined;

    const updated = await prisma.outletRecord.update({
      where: id ? { id } : { key },
      data: {
        ...(type !== undefined && { type: type.trim() }),
        ...(name !== undefined && { name: name.trim() }),
        ...(nameDz !== undefined && { nameDz: nameDz?.trim() || null }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(place !== undefined && { place: place.trim() }),
        ...(placeDz !== undefined && { placeDz: placeDz?.trim() || null }),
        ...(packedNote !== undefined && { note: packedNote }),
        ...(noteDz !== undefined && { noteDz: noteDz?.trim() || null }),
        ...(description !== undefined && { description: description.trim() }),
        ...(descriptionDz !== undefined && { descriptionDz: descriptionDz?.trim() || null }),
        ...(longDescription !== undefined && { longDescription: longDescription.trim() }),
        ...(longDescriptionDz !== undefined && { longDescriptionDz: longDescriptionDz?.trim() || null }),
        ...(hours !== undefined && { hours: hours.trim() }),
        ...(hoursDz !== undefined && { hoursDz: hoursDz?.trim() || null }),
        ...(stalls !== undefined && { stalls: stalls?.trim() || null }),
        ...(stallsDz !== undefined && { stallsDz: stallsDz?.trim() || null }),
        ...(craftsOnSite !== undefined && { craftsOnSite: craftsOnSite?.trim() || null }),
        ...(craftsOnSiteDz !== undefined && { craftsOnSiteDz: craftsOnSiteDz?.trim() || null }),
        ...(payment !== undefined && { payment: payment?.trim() || null }),
        ...(paymentDz !== undefined && { paymentDz: paymentDz?.trim() || null }),
        ...(gettingThere !== undefined && { gettingThere: gettingThere?.trim() || null }),
        ...(gettingThereDz !== undefined && { gettingThereDz: gettingThereDz?.trim() || null }),
        ...(facilities !== undefined && { facilities: facilities?.trim() || null }),
        ...(facilitiesDz !== undefined && { facilitiesDz: facilitiesDz?.trim() || null }),
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'OUTLET_UPDATED',
      entityType: 'OutletRecord',
      entityId: updated.id,
      details: { key: updated.key, name: updated.name },
    });

    return NextResponse.json({ success: true, outlet: unpackOutlet(updated) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update outlet' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const key = searchParams.get('key');

    if (!id && !key) {
      return NextResponse.json({ error: 'id or key required' }, { status: 400 });
    }

    const deleted = await prisma.outletRecord.delete({
      where: id ? { id } : { key: key! },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'OUTLET_DELETED',
      entityType: 'OutletRecord',
      entityId: deleted.id,
      details: { key: deleted.key, name: deleted.name },
    });

    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete outlet' }, { status: 500 });
  }
}
