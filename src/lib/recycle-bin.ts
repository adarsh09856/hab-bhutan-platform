import prisma from './prisma';
import { logAudit } from './audit';

export type RecycleEntityType = 'PRODUCT' | 'PAGE' | 'NEWS' | 'EVENT' | 'TENDER' | 'OUTLET' | 'MEMBER' | 'DOCUMENT';

export interface RecycleBinItem {
  id: string;
  entityType: RecycleEntityType;
  originalId: string;
  itemTitle: string;
  itemData: Record<string, any>;
  deletedBy?: string;
  reason?: string;
  deletedAt: string;
}

/**
 * Fetch all items currently held in the Recycle Bin.
 */
export async function getRecycleBinItems(): Promise<RecycleBinItem[]> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    const tb = (setting?.trustBadges as Record<string, any>) || {};
    const items: RecycleBinItem[] = Array.isArray(tb.recycleBin) ? tb.recycleBin : [];
    return items.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  } catch (error) {
    console.error('[RecycleBin] Error fetching items:', error);
    return [];
  }
}

/**
 * Move any supported content entity to the Recycle Bin.
 */
export async function moveToRecycleBin(params: {
  entityType: RecycleEntityType;
  originalId: string;
  itemTitle: string;
  itemData: Record<string, any>;
  deletedBy?: string;
  reason?: string;
}): Promise<RecycleBinItem | null> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    const tb = (setting?.trustBadges as Record<string, any>) || {};
    const currentList: RecycleBinItem[] = Array.isArray(tb.recycleBin) ? tb.recycleBin : [];

    const newItem: RecycleBinItem = {
      id: `TRASH-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entityType: params.entityType,
      originalId: params.originalId,
      itemTitle: params.itemTitle,
      itemData: params.itemData,
      deletedBy: params.deletedBy || 'Admin',
      reason: params.reason || 'Moved to trash by administrator',
      deletedAt: new Date().toISOString(),
    };

    const nextList = [newItem, ...currentList.filter((i) => i.originalId !== params.originalId)];

    if (setting) {
      await prisma.siteSetting.update({
        where: { id: 'default' },
        data: {
          trustBadges: {
            ...tb,
            recycleBin: nextList,
          } as any,
        },
      });
    } else {
      await prisma.siteSetting.create({
        data: {
          id: 'default',
          heroParagraph: 'Preserving and advancing the 13 traditional arts and crafts of Bhutan.',
          footerAbout: 'Handicrafts Association of Bhutan.',
          partnersList: [],
          trustBadges: {
            recycleBin: nextList,
          } as any,
        } as any,
      });
    }

    await logAudit({
      actorType: 'STAFF',
      actorIdentifier: params.deletedBy || 'Admin',
      action: 'RECYCLE_BIN_ITEM_ADDED',
      entityType: params.entityType,
      entityId: params.originalId,
      details: {
        itemTitle: params.itemTitle,
        recycleBinId: newItem.id,
      },
    });

    return newItem;
  } catch (error) {
    console.error('[RecycleBin] Error moving item to trash:', error);
    return null;
  }
}

/**
 * Restore an item from the Recycle Bin back to its active live state.
 */
export async function restoreFromRecycleBin(recycleBinId: string, actorEmail = 'Admin') {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    const tb = (setting?.trustBadges as Record<string, any>) || {};
    const currentList: RecycleBinItem[] = Array.isArray(tb.recycleBin) ? tb.recycleBin : [];

    const target = currentList.find((i) => i.id === recycleBinId);
    if (!target) {
      return { success: false, error: 'Item not found in Recycle Bin.' };
    }

    const { entityType, originalId, itemData } = target;

    // Reactivate based on entityType
    if (entityType === 'PRODUCT') {
      const exists = await prisma.product.findUnique({ where: { id: originalId } });
      if (exists) {
        await prisma.product.update({
          where: { id: originalId },
          data: { status: 'PUBLISHED' },
        });
      } else if (itemData) {
        await prisma.product.create({
          data: {
            id: originalId,
            code: itemData.code || `HAB-${Date.now()}`,
            name: itemData.name || target.itemTitle,
            priceUSD: Number(itemData.priceUSD) || 50,
            craftKey: itemData.craftKey || 'thagzo',
            region: itemData.region || 'Thimphu',
            description: itemData.description || '',
            images: itemData.images || [],
            stock: Number(itemData.stock) || 1,
            status: 'PUBLISHED',
          },
        });
      }
    } else if (entityType === 'PAGE') {
      const exists = await prisma.customPage.findUnique({ where: { id: originalId } });
      if (exists) {
        await prisma.customPage.update({
          where: { id: originalId },
          data: { isPublished: true },
        });
      } else if (itemData) {
        await prisma.customPage.create({
          data: {
            id: originalId,
            slug: itemData.slug || `restored-page-${Date.now()}`,
            title: itemData.title || target.itemTitle,
            content: itemData.content || '',
            isPublished: true,
            category: itemData.category || 'General',
          },
        });
      }
    } else if (entityType === 'NEWS') {
      const exists = await prisma.newsArticle.findUnique({ where: { id: originalId } });
      if (exists) {
        await prisma.newsArticle.update({
          where: { id: originalId },
          data: { isPublished: true },
        });
      } else if (itemData) {
        await prisma.newsArticle.create({
          data: {
            id: originalId,
            title: itemData.title || target.itemTitle,
            kind: itemData.kind || 'Programs',
            dateString: itemData.dateString || 'Recent',
            blurb: itemData.blurb || '',
            content: itemData.content || '',
            isPublished: true,
          },
        });
      }
    } else if (entityType === 'EVENT') {
      const exists = await prisma.eventRecord.findUnique({ where: { id: originalId } });
      if (exists) {
        await prisma.eventRecord.update({
          where: { id: originalId },
          data: { isActive: true },
        });
      } else if (itemData) {
        await prisma.eventRecord.create({
          data: {
            id: originalId,
            key: itemData.key || `evt-${Date.now()}`,
            title: itemData.title || target.itemTitle,
            dateDisplay: itemData.dateDisplay || 'Upcoming',
            location: itemData.location || 'Thimphu',
            description: itemData.description || '',
            isActive: true,
          },
        });
      } else {
        const calExists = await prisma.calendarEvent.findUnique({ where: { id: originalId } });
        if (calExists) {
          // Already present
        }
      }
    } else if (entityType === 'TENDER') {
      const exists = await prisma.tenderRecord.findUnique({ where: { id: originalId } });
      if (exists) {
        await prisma.tenderRecord.update({
          where: { id: originalId },
          data: { status: 'OPEN' },
        });
      }
    }

    // Remove from Recycle Bin
    const updatedList = currentList.filter((i) => i.id !== recycleBinId);
    await prisma.siteSetting.update({
      where: { id: 'default' },
      data: {
        trustBadges: {
          ...tb,
          recycleBin: updatedList,
        } as any,
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorIdentifier: actorEmail,
      action: 'RECYCLE_BIN_ITEM_RESTORED',
      entityType,
      entityId: originalId,
      details: {
        itemTitle: target.itemTitle,
        recycleBinId,
      },
    });

    return { success: true, item: target };
  } catch (error: any) {
    console.error('[RecycleBin] Error restoring item:', error);
    return { success: false, error: error.message || 'Error restoring item.' };
  }
}

/**
 * Permanently purge an item from the Recycle Bin and database.
 */
export async function purgeFromRecycleBin(recycleBinId: string, actorEmail = 'Admin') {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    const tb = (setting?.trustBadges as Record<string, any>) || {};
    const currentList: RecycleBinItem[] = Array.isArray(tb.recycleBin) ? tb.recycleBin : [];

    const target = currentList.find((i) => i.id === recycleBinId);
    if (!target) {
      return { success: false, error: 'Item not found in Recycle Bin.' };
    }

    const { entityType, originalId } = target;

    // Hard delete from database if row is still present in an archived/soft state
    try {
      if (entityType === 'PRODUCT') {
        await prisma.product.deleteMany({ where: { id: originalId } });
      } else if (entityType === 'PAGE') {
        await prisma.customPage.deleteMany({ where: { id: originalId } });
      } else if (entityType === 'NEWS') {
        await prisma.newsArticle.deleteMany({ where: { id: originalId } });
      } else if (entityType === 'EVENT') {
        await prisma.eventRecord.deleteMany({ where: { id: originalId } });
        await prisma.calendarEvent.deleteMany({ where: { id: originalId } });
      } else if (entityType === 'TENDER') {
        await prisma.tenderRecord.deleteMany({ where: { id: originalId } });
      }
    } catch (dbErr) {
      console.warn('[RecycleBin] DB record may have already been purged:', dbErr);
    }

    // Remove from Recycle Bin
    const updatedList = currentList.filter((i) => i.id !== recycleBinId);
    await prisma.siteSetting.update({
      where: { id: 'default' },
      data: {
        trustBadges: {
          ...tb,
          recycleBin: updatedList,
        } as any,
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorIdentifier: actorEmail,
      action: 'RECYCLE_BIN_ITEM_PURGED',
      entityType,
      entityId: originalId,
      details: {
        itemTitle: target.itemTitle,
        recycleBinId,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('[RecycleBin] Error purging item:', error);
    return { success: false, error: error.message || 'Error permanently deleting item.' };
  }
}

/**
 * Empty all items from the Recycle Bin.
 */
export async function emptyRecycleBin(actorEmail = 'Admin') {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    const tb = (setting?.trustBadges as Record<string, any>) || {};

    await prisma.siteSetting.update({
      where: { id: 'default' },
      data: {
        trustBadges: {
          ...tb,
          recycleBin: [],
        } as any,
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorIdentifier: actorEmail,
      action: 'RECYCLE_BIN_EMPTIED',
      entityType: 'RecycleBin',
      entityId: 'default',
    });

    return { success: true };
  } catch (error: any) {
    console.error('[RecycleBin] Error emptying recycle bin:', error);
    return { success: false, error: error.message || 'Error emptying recycle bin.' };
  }
}
