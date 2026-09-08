import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const isStaff = user.roleSlug === 'super_admin' ||
                  user.roleSlug === 'staff_operator' ||
                  user.permissions?.includes('*') ||
                  user.permissions?.includes('content:edit');
  return isStaff ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
  return NextResponse.json({ success: true, setting });
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();

  try {
    const updated = await prisma.siteSetting.upsert({
      where: { id: 'default' },
      update: {
        ...(body.announcementText !== undefined && { announcementText: body.announcementText }),
        ...(body.announcementLink !== undefined && { announcementLink: body.announcementLink }),
        ...(body.isAnnouncementOn !== undefined && { isAnnouncementOn: Boolean(body.isAnnouncementOn) }),
        ...(body.tagline !== undefined && { tagline: body.tagline }),
        ...(body.heroParagraph !== undefined && { heroParagraph: body.heroParagraph }),
        ...(body.heroCtaPrimaryText !== undefined && { heroCtaPrimaryText: body.heroCtaPrimaryText }),
        ...(body.heroCtaPrimaryLink !== undefined && { heroCtaPrimaryLink: body.heroCtaPrimaryLink }),
        ...(body.heroCtaSecondaryText !== undefined && { heroCtaSecondaryText: body.heroCtaSecondaryText }),
        ...(body.heroCtaSecondaryLink !== undefined && { heroCtaSecondaryLink: body.heroCtaSecondaryLink }),
        ...(body.stat1Number !== undefined && { stat1Number: body.stat1Number }),
        ...(body.stat1Label !== undefined && { stat1Label: body.stat1Label }),
        ...(body.stat2Number !== undefined && { stat2Number: body.stat2Number }),
        ...(body.stat2Label !== undefined && { stat2Label: body.stat2Label }),
        ...(body.stat3Number !== undefined && { stat3Number: body.stat3Number }),
        ...(body.stat3Label !== undefined && { stat3Label: body.stat3Label }),
        ...(body.stat4Number !== undefined && { stat4Number: body.stat4Number }),
        ...(body.stat4Label !== undefined && { stat4Label: body.stat4Label }),
        ...(body.officeAddress !== undefined && { officeAddress: body.officeAddress }),
        ...(body.officePhone !== undefined && { officePhone: body.officePhone }),
        ...(body.edPhone !== undefined && { edPhone: body.edPhone }),
        ...(body.marketingPhone !== undefined && { marketingPhone: body.marketingPhone }),
        ...(body.officialEmail !== undefined && { officialEmail: body.officialEmail }),
        ...(body.footerAbout !== undefined && { footerAbout: body.footerAbout }),
        ...(body.csoRegistration !== undefined && { csoRegistration: body.csoRegistration }),
        ...(body.copyrightText !== undefined && { copyrightText: body.copyrightText }),
        ...(body.punakhaMarketNotice !== undefined && { punakhaMarketNotice: body.punakhaMarketNotice }),
        ...(body.partnersList !== undefined && { partnersList: body.partnersList }),
      },
      create: {
        id: 'default',
        announcementText: body.announcementText || 'CSO/2011/043 · Handicrafts Association of Bhutan',
        announcementLink: body.announcementLink || '/about',
        isAnnouncementOn: body.isAnnouncementOn !== undefined ? Boolean(body.isAnnouncementOn) : true,
        tagline: body.tagline || 'Towards a vibrant & sustainable handicrafts sector',
        heroParagraph: body.heroParagraph || 'Handicrafts Association of Bhutan supports local artisans...',
        heroCtaPrimaryText: body.heroCtaPrimaryText || 'Our mission',
        heroCtaPrimaryLink: body.heroCtaPrimaryLink || '/about',
        heroCtaSecondaryText: body.heroCtaSecondaryText || 'Shop the crafts →',
        heroCtaSecondaryLink: body.heroCtaSecondaryLink || '/shop',
        stat1Number: body.stat1Number || '7,500',
        stat1Label: body.stat1Label || 'Micro & small enterprises in the network',
        stat2Number: body.stat2Number || '5,250',
        stat2Label: body.stat2Label || 'Women-led enterprises',
        stat3Number: body.stat3Number || '195',
        stat3Label: body.stat3Label || 'Affiliated stores across Bhutan',
        stat4Number: body.stat4Number || '13',
        stat4Label: body.stat4Label || 'Arts & crafts of Zorig Chusum',
        officeAddress: body.officeAddress || 'Metog Lam, Thimphu, Bhutan',
        officePhone: body.officePhone || '+975-2-338089',
        edPhone: body.edPhone || '+975-77654508',
        marketingPhone: body.marketingPhone || '+975-17462636 / 17881111',
        officialEmail: body.officialEmail || 'officehab@gmail.com',
        footerAbout: body.footerAbout || 'Handicrafts Association of Bhutan...',
        csoRegistration: body.csoRegistration || 'CSO Registration: CSO/2011/043',
        copyrightText: body.copyrightText || '© 2026 Handicrafts Association of Bhutan',
        punakhaMarketNotice: body.punakhaMarketNotice || 'Validated and managed by HAB',
        partnersList: body.partnersList || [],
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'SITE_SETTINGS_UPDATED',
      entityType: 'SiteSetting',
      entityId: 'default',
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Update failed' }, { status: 500 });
  }
}