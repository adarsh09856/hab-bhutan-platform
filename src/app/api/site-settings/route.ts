import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_VERBATIM } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    if (!setting) {
      setting = await prisma.siteSetting.create({
        data: {
          id: 'default',
          announcementText: 'CSO/2011/043 · Handicrafts Association of Bhutan · Apex Civil Society Organization',
          announcementLink: '/about',
          isAnnouncementOn: true,
          tagline: CLIENT_VERBATIM.tagline,
          heroParagraph: CLIENT_VERBATIM.heroPara,
          heroCtaPrimaryText: 'Our mission',
          heroCtaPrimaryLink: '/about',
          heroCtaSecondaryText: 'Shop the crafts →',
          heroCtaSecondaryLink: '/shop',
          stat1Number: CLIENT_VERBATIM.stats[0]?.n || '7,500',
          stat1Label: CLIENT_VERBATIM.stats[0]?.label || 'Micro & small enterprises in the network',
          stat2Number: CLIENT_VERBATIM.stats[1]?.n || '5,250',
          stat2Label: CLIENT_VERBATIM.stats[1]?.label || 'Women-led enterprises',
          stat3Number: CLIENT_VERBATIM.stats[2]?.n || '195',
          stat3Label: CLIENT_VERBATIM.stats[2]?.label || 'Affiliated stores across Bhutan',
          stat4Number: CLIENT_VERBATIM.stats[3]?.n || '13',
          stat4Label: CLIENT_VERBATIM.stats[3]?.label || 'Arts & crafts of Zorig Chusum',
          officeAddress: CLIENT_VERBATIM.contactBlock.address,
          officePhone: CLIENT_VERBATIM.contactBlock.office,
          edPhone: CLIENT_VERBATIM.contactBlock.ed,
          marketingPhone: CLIENT_VERBATIM.contactBlock.marketing,
          officialEmail: CLIENT_VERBATIM.contactBlock.email,
          footerAbout: 'Handicrafts Association of Bhutan is the apex civil society organization stewarding Bhutan’s thirteen traditional arts and crafts (Zorig Chusum). We empower rural craftspeople, safeguard indigenous cultural heritage, and open international market access.',
          csoRegistration: 'CSO Registration: CSO/2011/043 · Thimphu, Kingdom of Bhutan',
          copyrightText: '© 2026 Handicrafts Association of Bhutan. All rights reserved.',
          punakhaMarketNotice: CLIENT_VERBATIM.punakhaMarket,
          partnersList: CLIENT_VERBATIM.partners,
        },
      });
    }
    return NextResponse.json({ success: true, setting });
  } catch (error) {
    return NextResponse.json({
      success: true,
      setting: {
        announcementText: 'CSO/2011/043 · Handicrafts Association of Bhutan',
        announcementLink: '/about',
        isAnnouncementOn: true,
        tagline: CLIENT_VERBATIM.tagline,
        heroParagraph: CLIENT_VERBATIM.heroPara,
        heroCtaPrimaryText: 'Our mission',
        heroCtaPrimaryLink: '/about',
        heroCtaSecondaryText: 'Shop the crafts →',
        heroCtaSecondaryLink: '/shop',
        stat1Number: '7,500',
        stat1Label: 'Micro & small enterprises in the network',
        stat2Number: '5,250',
        stat2Label: 'Women-led enterprises',
        stat3Number: '195',
        stat3Label: 'Affiliated stores across Bhutan',
        stat4Number: '13',
        stat4Label: 'Arts & crafts of Zorig Chusum',
        officeAddress: CLIENT_VERBATIM.contactBlock.address,
        officePhone: CLIENT_VERBATIM.contactBlock.office,
        edPhone: CLIENT_VERBATIM.contactBlock.ed,
        marketingPhone: CLIENT_VERBATIM.contactBlock.marketing,
        officialEmail: CLIENT_VERBATIM.contactBlock.email,
        footerAbout: 'Handicrafts Association of Bhutan is the apex civil society organization stewarding Bhutan’s traditional crafts.',
        csoRegistration: 'CSO Registration: CSO/2011/043 · Thimphu, Kingdom of Bhutan',
        copyrightText: '© 2026 Handicrafts Association of Bhutan. All rights reserved.',
        punakhaMarketNotice: CLIENT_VERBATIM.punakhaMarket,
        partnersList: CLIENT_VERBATIM.partners,
      },
    });
  }
}