import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const isStaff =
    user.roleSlug === 'super_admin' ||
    user.roleSlug === 'staff_operator' ||
    user.permissions?.includes('*') ||
    user.permissions?.includes('content:edit') ||
    user.permissions?.includes('content:view');
  return isStaff ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const rawEvents = await prisma.eventRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    const events = rawEvents.map((ev) => {
      const sched = ev.schedule && typeof ev.schedule === 'object' ? (ev.schedule as any) : {};
      return {
        ...ev,
        day: sched.day || '',
        mon: sched.mon || '',
        time: sched.time || '',
      };
    });

    const res = NextResponse.json({ success: true, events });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { key, title, category, dateDisplay, day, mon, time, startDate, endDate, location, venue, craft, organiser, description, schedule, speakers, registration, isActive, sortOrder } = body;

    if (!key || !title || !description) {
      return NextResponse.json({ error: 'key, title, and description are required' }, { status: 400 });
    }

    const mergedSchedule = schedule && typeof schedule === 'object' 
      ? { ...schedule, ...(day && { day }), ...(mon && { mon }), ...(time && { time }) }
      : (day || mon || time ? { day, mon, time } : null);

    const event = await prisma.eventRecord.create({
      data: {
        key: key.trim().toLowerCase(),
        title: title.trim(),
        category: category?.trim() || 'Exhibition',
        dateDisplay: dateDisplay?.trim() || '',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location: location?.trim() || '',
        venue: venue?.trim() || null,
        craft: craft?.trim() || null,
        organiser: organiser?.trim() || null,
        description: description.trim(),
        schedule: mergedSchedule,
        speakers: speakers || null,
        registration: registration?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'EVENT_CREATED',
      entityType: 'EventRecord',
      entityId: event.id,
      details: { key: event.key, title: event.title },
    });

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create event' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, key, title, category, dateDisplay, day, mon, time, startDate, endDate, location, venue, craft, organiser, description, schedule, speakers, registration, isActive, sortOrder } = body;

    if (!id && !key) {
      return NextResponse.json({ error: 'id or key is required for update' }, { status: 400 });
    }

    const where = id ? { id } : { key };
    const existing = await prisma.eventRecord.findUnique({ where });
    const prevSchedule = (existing?.schedule && typeof existing.schedule === 'object' ? existing.schedule : {}) as any;
    const mergedSchedule = schedule !== undefined 
      ? schedule 
      : ((day !== undefined || mon !== undefined || time !== undefined)
          ? { ...prevSchedule, ...(day !== undefined && { day }), ...(mon !== undefined && { mon }), ...(time !== undefined && { time }) }
          : undefined);

    const event = await prisma.eventRecord.update({
      where,
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(category !== undefined && { category: category.trim() }),
        ...(dateDisplay !== undefined && { dateDisplay: dateDisplay.trim() }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(location !== undefined && { location: location.trim() }),
        ...(venue !== undefined && { venue: venue?.trim() || null }),
        ...(craft !== undefined && { craft: craft?.trim() || null }),
        ...(organiser !== undefined && { organiser: organiser?.trim() || null }),
        ...(description !== undefined && { description: description.trim() }),
        ...(mergedSchedule !== undefined && { schedule: mergedSchedule }),
        ...(speakers !== undefined && { speakers }),
        ...(registration !== undefined && { registration: registration?.trim() || null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) || 0 }),
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'EVENT_UPDATED',
      entityType: 'EventRecord',
      entityId: event.id,
      details: { key: event.key, title: event.title },
    });

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update event' }, { status: 500 });
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
      return NextResponse.json({ error: 'id or key required for deletion' }, { status: 400 });
    }

    const where = id ? { id } : { key: key! };
    const deleted = await prisma.eventRecord.delete({ where });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'EVENT_DELETED',
      entityType: 'EventRecord',
      entityId: deleted.id,
      details: { key: deleted.key, title: deleted.title },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete event' }, { status: 500 });
  }
}
