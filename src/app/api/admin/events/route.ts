import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserForAnyPermission, Permission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { moveToRecycleBin } from '@/lib/recycle-bin';
import { dateDisplayHasRange, formatEventDateRange, timeContainsEventDuration } from '@/lib/event-dates';

export const dynamic = 'force-dynamic';

function parseRequestDate(value: unknown): { valid: boolean; date: Date | null } {
  if (value === undefined || value === null || value === '') return { valid: true, date: null };
  if (typeof value !== 'string') return { valid: false, date: null };

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00.000Z`);
    return { valid: !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value, date };
  }

  const date = new Date(value);
  return { valid: !Number.isNaN(date.getTime()), date: Number.isNaN(date.getTime()) ? null : date };
}

async function verifyAdmin(req: NextRequest, permissions: Permission[]) {
  return getSessionUserForAnyPermission(req, permissions);
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req, ['content:view', 'content:edit']);
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
        imageUrl: sched.imageUrl || '',
        pdfUrl: sched.pdfUrl || '',
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
  const user = await verifyAdmin(req, ['content:create', 'content:edit']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { key, title, titleDz, category, categoryDz, subCategory, dateDisplay, shortSummary, day, mon, time, imageUrl, pdfUrl, documentUrl, documentType, documentTitle, startDate, endDate, location, locationDz, venue, venueDz, craft, organiser, description, descriptionDz, schedule, speakers, registration, registrationDz, isActive, sortOrder } = body;

    if (!key || !title || !description) {
      return NextResponse.json({ error: 'key, title, and description are required' }, { status: 400 });
    }
    if (body.isMultiDay !== undefined && typeof body.isMultiDay !== 'boolean') return NextResponse.json({ error: 'isMultiDay must be a boolean.' }, { status: 400 });
    const multiDaySelected = body.isMultiDay === true || (body.isMultiDay === undefined && dateDisplayHasRange(dateDisplay));
    const parsedStart = parseRequestDate(startDate);
    const parsedEnd = parseRequestDate(endDate);
    if (!parsedStart.date) return NextResponse.json({ error: 'A valid start date is required.' }, { status: 400 });
    if (!parsedStart.valid) return NextResponse.json({ error: 'Start date is invalid.' }, { status: 400 });
    if (multiDaySelected && !parsedEnd.date) return NextResponse.json({ error: 'Multi-day events require a valid end date.' }, { status: 400 });
    if (endDate && !parsedEnd.valid) return NextResponse.json({ error: 'End date is invalid.' }, { status: 400 });
    if (parsedEnd.date && parsedEnd.date < parsedStart.date) return NextResponse.json({ error: 'End date must be on or after the start date.' }, { status: 400 });
    if (body.isMultiDay === true && parsedEnd.date && parsedEnd.date <= parsedStart.date) return NextResponse.json({ error: 'A multi-day event end date must be after its start date.' }, { status: 400 });
    if (body.isMultiDay === false && parsedEnd.date) return NextResponse.json({ error: 'A single-day event cannot include an end date.' }, { status: 400 });
    if (timeContainsEventDuration(time)) return NextResponse.json({ error: 'Time is for event hours only. Use the end date for event duration.' }, { status: 400 });

    const docUrlToSave = documentUrl || pdfUrl || null;

    const mergedSchedule = schedule && typeof schedule === 'object' 
      ? { ...schedule, ...(day && { day }), ...(mon && { mon }), ...(time && { time }), ...(imageUrl && { imageUrl }), ...(docUrlToSave && { pdfUrl: docUrlToSave }) }
      : (day || mon || time || imageUrl || docUrlToSave ? { day, mon, time, imageUrl, pdfUrl: docUrlToSave } : null);

    const event = await prisma.eventRecord.create({
      data: {
        key: key.trim().toLowerCase(),
        title: title.trim(),
        titleDz: titleDz?.trim() || null,
        category: category?.trim() || 'Exhibition',
        categoryDz: categoryDz?.trim() || null,
        subCategory: subCategory?.trim() || null,
        dateDisplay: formatEventDateRange(parsedStart.date, parsedEnd.date, dateDisplay?.trim() || ''),
        startDate: parsedStart.date,
        endDate: body.isMultiDay === false ? null : parsedEnd.date,
        location: location?.trim() || '',
        locationDz: locationDz?.trim() || null,
        venue: venue?.trim() || null,
        venueDz: venueDz?.trim() || null,
        craft: craft?.trim() || null,
        organiser: organiser?.trim() || null,
        documentUrl: docUrlToSave,
        documentType: documentType || 'PDF',
        documentTitle: documentTitle || null,
        imageUrl: imageUrl || null,
        description: description.trim(),
        shortSummary: shortSummary?.trim() || null,
        descriptionDz: descriptionDz?.trim() || null,
        schedule: mergedSchedule,
        speakers: speakers || null,
        registration: registration?.trim() || null,
        registrationDz: registrationDz?.trim() || null,
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
  const user = await verifyAdmin(req, ['content:edit']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, key, title, category, dateDisplay, day, mon, time, imageUrl, pdfUrl, startDate, endDate, location, venue, craft, organiser, description, schedule, speakers, registration, isActive, sortOrder } = body;

    if (!id && !key) {
      return NextResponse.json({ error: 'id or key is required for update' }, { status: 400 });
    }

    const where = id ? { id } : { key };
    const existing = await prisma.eventRecord.findUnique({ where });
    if (!existing) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    if (body.isMultiDay !== undefined && typeof body.isMultiDay !== 'boolean') return NextResponse.json({ error: 'isMultiDay must be a boolean.' }, { status: 400 });
    const parsedStart = parseRequestDate(startDate);
    const parsedEnd = parseRequestDate(endDate);
    if (startDate !== undefined && !parsedStart.valid) return NextResponse.json({ error: 'Start date is invalid.' }, { status: 400 });
    if (endDate !== undefined && !parsedEnd.valid) return NextResponse.json({ error: 'End date is invalid.' }, { status: 400 });
    const nextStart = startDate !== undefined ? parsedStart.date : existing.startDate;
    const nextEnd = body.isMultiDay === false ? null : endDate !== undefined ? parsedEnd.date : existing.endDate;
    const nextDateDisplay = body.dateDisplay !== undefined ? body.dateDisplay : existing.dateDisplay;
    if (body.isMultiDay === true && (!parsedEnd.date || endDate === undefined)) return NextResponse.json({ error: 'Multi-day events require a valid end date.' }, { status: 400 });
    const legacyMultiDay = body.isMultiDay === undefined && dateDisplayHasRange(nextDateDisplay);
    if (legacyMultiDay && (!nextStart || !nextEnd)) return NextResponse.json({ error: 'Multi-day events require start and end dates.' }, { status: 400 });
    if (nextEnd && (!nextStart || nextEnd < nextStart)) return NextResponse.json({ error: 'End date must be valid and on or after the start date.' }, { status: 400 });
    if (body.isMultiDay === true && nextStart && nextEnd && nextEnd <= nextStart) return NextResponse.json({ error: 'A multi-day event end date must be after its start date.' }, { status: 400 });
    const prevSchedule = (existing?.schedule && typeof existing.schedule === 'object' ? existing.schedule : {}) as any;
    const previousTime = prevSchedule.time || (existing as any).time || '';
    if (isActive !== false && !nextStart) return NextResponse.json({ error: 'A start date is required for a public event.' }, { status: 400 });
    const nextTime = time !== undefined ? time : previousTime;
    if (isActive !== false && timeContainsEventDuration(nextTime)) {
      const error = nextEnd
        ? 'Time is for event hours only. Replace the duration text with event hours.'
        : 'This event has a duration in its saved Time field. Set its end date, then replace the duration text with event hours.';
      return NextResponse.json({ error }, { status: 400 });
    }
    const mergedSchedule = schedule !== undefined 
      ? schedule 
      : ((day !== undefined || mon !== undefined || time !== undefined || imageUrl !== undefined || pdfUrl !== undefined)
          ? { 
              ...prevSchedule, 
              ...(day !== undefined && { day }), 
              ...(mon !== undefined && { mon }), 
              ...(time !== undefined && { time }),
              ...(imageUrl !== undefined && { imageUrl }),
              ...(pdfUrl !== undefined && { pdfUrl })
            }
          : undefined);

    const event = await prisma.eventRecord.update({
      where,
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(body.titleDz !== undefined && { titleDz: body.titleDz?.trim() || null }),
        ...(category !== undefined && { category: category.trim() }),
        ...(body.categoryDz !== undefined && { categoryDz: body.categoryDz?.trim() || null }),
        ...(body.subCategory !== undefined && { subCategory: body.subCategory?.trim() || null }),
        ...((dateDisplay !== undefined || startDate !== undefined || endDate !== undefined || body.isMultiDay !== undefined) && {
          dateDisplay: formatEventDateRange(nextStart, nextEnd, typeof nextDateDisplay === 'string' ? nextDateDisplay.trim() : ''),
        }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...((endDate !== undefined || body.isMultiDay === false) && { endDate: body.isMultiDay === false ? null : parsedEnd.date }),
        ...(location !== undefined && { location: location.trim() }),
        ...(body.locationDz !== undefined && { locationDz: body.locationDz?.trim() || null }),
        ...(venue !== undefined && { venue: venue?.trim() || null }),
        ...(body.venueDz !== undefined && { venueDz: body.venueDz?.trim() || null }),
        ...(craft !== undefined && { craft: craft?.trim() || null }),
        ...(organiser !== undefined && { organiser: organiser?.trim() || null }),
        ...(body.documentUrl !== undefined && { documentUrl: body.documentUrl }),
        ...(body.documentType !== undefined && { documentType: body.documentType }),
        ...(body.documentTitle !== undefined && { documentTitle: body.documentTitle }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(description !== undefined && { description: description.trim() }),
        ...(body.shortSummary !== undefined && { shortSummary: body.shortSummary?.trim() || null }),
        ...(body.descriptionDz !== undefined && { descriptionDz: body.descriptionDz?.trim() || null }),
        ...(mergedSchedule !== undefined && { schedule: mergedSchedule }),
        ...(speakers !== undefined && { speakers }),
        ...(registration !== undefined && { registration: registration?.trim() || null }),
        ...(body.registrationDz !== undefined && { registrationDz: body.registrationDz?.trim() || null }),
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
  const user = await verifyAdmin(req, ['content:delete', 'content:edit']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const key = searchParams.get('key');

    if (!id && !key) {
      return NextResponse.json({ error: 'id or key required for deletion' }, { status: 400 });
    }

    const where = id ? { id } : { key: key! };
    const existing = await prisma.eventRecord.findUnique({ where });

    if (existing) {
      await moveToRecycleBin({
        entityType: 'EVENT',
        originalId: existing.id,
        itemTitle: existing.title,
        itemData: existing,
        deletedBy: user.email,
        reason: 'Deleted by administrator from Events Studio',
      });
    }

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

    return NextResponse.json({ success: true, deleted: true, message: `Event '${deleted.title}' moved to Recycle Bin.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete event' }, { status: 500 });
  }
}
