import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/rbac';
import {
  getRecycleBinItems,
  moveToRecycleBin,
  restoreFromRecycleBin,
  purgeFromRecycleBin,
  emptyRecycleBin,
  RecycleEntityType,
} from '@/lib/recycle-bin';

export const dynamic = 'force-dynamic';

async function verifyStaff(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const isStaff =
    user.roleSlug === 'super_admin' ||
    user.roleSlug === 'staff_operator' ||
    user.permissions?.includes('*') ||
    user.permissions?.includes('content:edit');
  return isStaff ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await verifyStaff(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await getRecycleBinItems();
  return NextResponse.json({ success: true, items });
}

export async function POST(req: NextRequest) {
  const user = await verifyStaff(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { entityType, originalId, itemTitle, itemData, reason } = body;

    if (!entityType || !originalId || !itemTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: entityType, originalId, itemTitle.' },
        { status: 400 }
      );
    }

    const item = await moveToRecycleBin({
      entityType: entityType as RecycleEntityType,
      originalId,
      itemTitle,
      itemData: itemData || {},
      deletedBy: user.email || user.name || 'Admin',
      reason,
    });

    if (!item) {
      return NextResponse.json({ error: 'Failed to move item to Recycle Bin.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing request.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verifyStaff(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { recycleBinId } = body;

    if (!recycleBinId) {
      return NextResponse.json({ error: 'Missing recycleBinId.' }, { status: 400 });
    }

    const result = await restoreFromRecycleBin(recycleBinId, user.email || 'Admin');
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to restore item.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Item successfully restored to active state.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error restoring item.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await verifyStaff(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const recycleBinId = searchParams.get('id');
    const emptyAll = searchParams.get('emptyAll') === 'true';

    if (emptyAll) {
      const result = await emptyRecycleBin(user.email || 'Admin');
      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Failed to empty recycle bin.' }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Recycle bin emptied.' });
    }

    if (!recycleBinId) {
      return NextResponse.json({ error: 'Missing recycle bin item ID.' }, { status: 400 });
    }

    const result = await purgeFromRecycleBin(recycleBinId, user.email || 'Admin');
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to permanently delete item.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Item permanently deleted.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error purging item.' }, { status: 500 });
  }
}
