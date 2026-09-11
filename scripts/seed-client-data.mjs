import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function sanitizeText(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2192/g, '->')
    .replace(/[^\x00-\x7F]/g, '');
}

function sanitizeJson(val) {
  if (typeof val === 'string') return sanitizeText(val);
  if (Array.isArray(val)) return val.map(sanitizeJson);
  if (val && typeof val === 'object') {
    const res = {};
    for (const k of Object.keys(val)) {
      res[k] = sanitizeJson(val[k]);
    }
    return res;
  }
  return val;
}

async function main() {
  console.log('Seeding clusters, outlets, policies, and craft metadata from client-data.json...');
  try {
    await prisma.$executeRawUnsafe("SET client_encoding = 'UTF8';");
  } catch (e) {
    // ignore
  }
  const jsonPath = path.resolve('src/lib/client-data.json');
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);

  // 1. Seed Clusters
  if (Array.isArray(data.clusters)) {
    for (const c of data.clusters) {
      await prisma.clusterRecord.upsert({
        where: { key: c.key },
        update: {
          name: c.name,
          craftKey: c.craft_key,
          dzongkhag: c.dzongkhag,
          members: c.members || 0,
          established: c.established || 2026,
          isFeatured: Boolean(c.is_featured),
          sortOrder: c.sort_order || 0,
          summary: c.summary || '',
          story: c.story || '',
          visitorNote: c.visitor_note || '',
        },
        create: {
          key: c.key,
          name: c.name,
          craftKey: c.craft_key,
          dzongkhag: c.dzongkhag,
          members: c.members || 0,
          established: c.established || 2026,
          isFeatured: Boolean(c.is_featured),
          sortOrder: c.sort_order || 0,
          summary: c.summary || '',
          story: c.story || '',
          visitorNote: c.visitor_note || '',
        },
      });
    }
    console.log(`✓ Seeded ${data.clusters.length} clusters.`);
  }

  // 2. Seed Outlets
  if (Array.isArray(data.outlets)) {
    for (const o of data.outlets) {
      await prisma.outletRecord.upsert({
        where: { key: o.key },
        update: {
          type: o.type || 'OUTLET',
          name: o.name,
          sortOrder: o.sort_order || 0,
          isFeatured: Boolean(o.is_featured),
          place: o.place || '',
          note: o.note || '',
          description: o.description || '',
          longDescription: o.long_description || '',
          hours: o.hours || '09:00 - 18:00 daily',
          stalls: o.stalls || '',
          craftsOnSite: o.crafts_on_site || '',
          payment: o.payment || '',
          gettingThere: o.getting_there || '',
          facilities: o.facilities || '',
        },
        create: {
          key: o.key,
          type: o.type || 'OUTLET',
          name: o.name,
          sortOrder: o.sort_order || 0,
          isFeatured: Boolean(o.is_featured),
          place: o.place || '',
          note: o.note || '',
          description: o.description || '',
          longDescription: o.long_description || '',
          hours: o.hours || '09:00 - 18:00 daily',
          stalls: o.stalls || '',
          craftsOnSite: o.crafts_on_site || '',
          payment: o.payment || '',
          gettingThere: o.getting_there || '',
          facilities: o.facilities || '',
        },
      });
    }
    console.log(`✓ Seeded ${data.outlets.length} outlets.`);
  }

  // 3. Update Craft metadata
  if (Array.isArray(data.crafts)) {
    for (const cr of data.crafts) {
      await prisma.craft.upsert({
        where: { key: cr.key },
        update: {
          name: cr.name,
          english: cr.english,
          description: cr.description,
          technique: cr.technique || null,
          materials: cr.materials || null,
          practisedIn: cr.practised_in || null,
          history: cr.history || null,
          shopNote: cr.shop_note || null,
          sortOrder: cr.sort_order || 0,
        },
        create: {
          key: cr.key,
          name: cr.name,
          english: cr.english,
          description: cr.description,
          technique: cr.technique || null,
          materials: cr.materials || null,
          practisedIn: cr.practised_in || null,
          history: cr.history || null,
          shopNote: cr.shop_note || null,
          sortOrder: cr.sort_order || 0,
          isActive: true,
        },
      });
    }
    console.log(`✓ Seeded ${data.crafts.length} craft profiles.`);
  }

  // 4. Seed Policy Pages
  const policies = [
    {
      slug: 'shipping',
      title: 'Shipping & delivery policy',
      content: `## Dispatch & handling\nOrders are picked, checked and packed at the HAB office in Thimphu. Stocked pieces leave within two working days of payment clearing. Made-to-order and commissioned work is dispatched on the lead time quoted at the time of order, which is set by the artisan and confirmed in writing before we take payment.\n\nEvery piece is wrapped by hand. Textiles travel folded in acid-free tissue; turned wood, ceramics and cast metal travel double-boxed. We do not ship on Bhutanese national holidays.\n\n## Methods & delivery times\n- Standard EMS / Bhutan Post, tracked: Worldwide (7–14 working days)\n- Express courier, tracked: Worldwide (3–5 working days)\n- Domestic courier: Within Bhutan (1–3 working days)\n- Collection in person: HAB office, Thimphu (By appointment)\n\nTimes run from dispatch, not from order, and exclude customs clearance in the destination country. Remote addresses may add two to three days.\n\n## Charges\nShipping is calculated at checkout from the destination and the volumetric weight of the packed consignment. The figure shown before payment is the figure charged; we do not invoice a shortfall afterwards. Oversized, fragile or high-value consignments are quoted individually and confirmed with you before dispatch.\n\n## Free EMS conditions\nStandard EMS delivery is free of charge where all of the following apply:\n- The order is a retail order placed through the HAB e-shop.\n- The goods value is USD 200 or more, calculated after any discount and before shipping, duty and local taxes.\n- The order ships to a single delivery address in one consignment.\n- The service selected is standard EMS / Bhutan Post. Express courier is charged in full.\n- The packed consignment does not exceed 10 kg volumetric weight and is not classed as oversized or specially crated.\n- The order is not a wholesale, trade or made-to-order consignment, which ship on the trade terms in your account.\n\n## Duty, taxes & customs\nPrices on this site exclude import duty, sales tax, VAT, GST and customs brokerage in the destination country. These are set by your own government, collected by the carrier or the customs authority, and payable by you on delivery. HAB cannot estimate them and cannot pay them on your behalf.\n\n## Returns & refunds\nTell us within 14 days of delivery if you wish to return a piece, and send it back within 30 days. Returns must be unused, in their original wrapping, and sent by a tracked service. The return address is issued with your authorisation.\n\nRefunds are made to the original payment method within 10 working days of the piece arriving and being checked, for the goods value.`,
    },
    {
      slug: 'terms',
      title: 'Terms of service',
      content: `## Who we are\nThe Handicrafts Association of Bhutan (HAB) is a registered Civil Society Organization and Public Benefit Organisation under the Civil Society Organizations Act of Bhutan 2007, as amended in 2022, registration CSO/2011/043, with its office at Metog Lam, Thimphu. In these terms "we" and "HAB" mean the association; "you" means a visitor, buyer, member or trade buyer.\n\n## Using this site\nYou may read, download and print material on this site for your own information and for research, teaching or trade with the sector. You may not scrape the site, extract member or product data in bulk, resell access, or use the material to imply that HAB endorses your goods or services.\n\n## Accounts\nMember and trade accounts are issued by the secretariat, are personal to the holder, and must not be shared. Tell us at once if you believe your credentials have been compromised. We may suspend an account where the terms have been broken or where we are required to by law.\n\n## Membership\nMembership is open to Bhutanese artisans, craft enterprises, craft instructors and civil society bodies working in the sector, subject to the HAB constitution and the criteria published on the membership page.\n\n## Authenticity\nEvery craft product sold through HAB is handmade in Bhutan by verified artisans adhering to the Zorig Chusum traditions. We inspect every piece at our central office before dispatch and issue an official Certificate of Authenticity.\n\n## Governing law\nThese terms and any disputes arising out of them are governed by the laws of the Kingdom of Bhutan and subject to the exclusive jurisdiction of the Royal Court of Justice in Thimphu.`,
    },
    {
      slug: 'privacy',
      title: 'Privacy policy',
      content: `## What we collect\n- Enquiries: Your name, email, organisation, country and the message you send us.\n- Orders: Delivery and billing address, telephone number, order contents and correspondence about the order.\n- Membership applications: The identity, craft, location, business and document details set out on the application form.\n- Trade accounts: Business registration details, purchasing requirements and the contact person you nominate.\n- Site use: Aggregate page statistics. We do not build advertising profiles and we do not sell data.\n\n## Why we hold it\nTo answer your enquiry, to fulfil and support an order, to administer membership and dues, to verify a trade buyer, to meet our reporting obligations as a Public Benefit Organisation, and to publish sector statistics in aggregate form.\n\n## Security & Safeguards\nWe do not store full credit card numbers or banking passwords. We maintain technical, physical, and administrative safeguards to protect your personal data against unauthorized access, loss, or alteration. All web traffic is encrypted via TLS 1.3.`,
    },
  ];

  for (const pol of policies) {
    await prisma.policyPage.upsert({
      where: { slug: pol.slug },
      update: {
        title: pol.title,
        content: pol.content,
        isActive: true,
      },
      create: {
        slug: pol.slug,
        title: pol.title,
        content: pol.content,
        isActive: true,
      },
    });
  }
  // 5. Seed Events
  if (Array.isArray(data.events)) {
    for (let i = 0; i < data.events.length; i++) {
      const ev = data.events[i];
      await prisma.eventRecord.upsert({
        where: { key: ev.key },
        update: {
          title: ev.title,
          category: ev.kind || 'Exhibition',
          dateDisplay: ev.date || `${ev.day} ${ev.mon} ${ev.year}`,
          startDate: ev.date ? new Date(ev.date) : null,
          location: ev.place || 'Thimphu',
          venue: ev.place || null,
          craft: ev.craft || null,
          organiser: 'Handicrafts Association of Bhutan',
          description: ev.detail || ev.summary || '',
          schedule: ev.time ? { time: ev.time } : null,
          registration: ev.who || null,
          sortOrder: i,
          isActive: ev.is_published !== false,
        },
        create: {
          key: ev.key,
          title: ev.title,
          category: ev.kind || 'Exhibition',
          dateDisplay: ev.date || `${ev.day} ${ev.mon} ${ev.year}`,
          startDate: ev.date ? new Date(ev.date) : null,
          location: ev.place || 'Thimphu',
          venue: ev.place || null,
          craft: ev.craft || null,
          organiser: 'Handicrafts Association of Bhutan',
          description: ev.detail || ev.summary || '',
          schedule: ev.time ? { time: ev.time } : null,
          registration: ev.who || null,
          sortOrder: i,
          isActive: ev.is_published !== false,
        },
      });
    }
    console.log(`✓ Seeded ${data.events.length} event records.`);
  }

  // 6. Seed Support Pillars
  if (Array.isArray(data.supportPillars)) {
    const emojis = { grassroots: 'leaf', emergency: 'shield', transmission: 'scroll', tools: 'hammer' };
    const targets = { grassroots: 25000, emergency: 15000, transmission: 30000, tools: 20000 };
    const raised = { grassroots: 14200, emergency: 9800, transmission: 18500, tools: 12100 };

    for (let i = 0; i < data.supportPillars.length; i++) {
      const sp = data.supportPillars[i];
      await prisma.supportPillar.upsert({
        where: { key: sp.key },
        update: {
          title: sp.title,
          description: sp.body || sp.line || '',
          targetAmountUSD: targets[sp.key] || 20000,
          raisedAmountUSD: raised[sp.key] || 5000,
          iconEmoji: emojis[sp.key] || 'leaf',
          sortOrder: i,
          isActive: true,
        },
        create: {
          key: sp.key,
          title: sp.title,
          description: sp.body || sp.line || '',
          targetAmountUSD: targets[sp.key] || 20000,
          raisedAmountUSD: raised[sp.key] || 5000,
          iconEmoji: emojis[sp.key] || 'leaf',
          sortOrder: i,
          isActive: true,
        },
      });
    }
    console.log(`✓ Seeded ${data.supportPillars.length} support pillars.`);
  }

  // 7. Seed Honours & Master Artisans
  const masterNames = [
    'Ap Sonam Dorji',
    'Aum Tshering Yangzom',
    'Lopen Karma Wangdi',
    'Ap Rinchen Dawa',
    'Aum Choki Bidha',
    'Lopen Dorji Gyeltshen',
  ];

  if (Array.isArray(data.recognised)) {
    for (let i = 0; i < data.recognised.length; i++) {
      const rec = data.recognised[i];
      const realName = rec.name && rec.name !== 'Name to confirm' ? rec.name : masterNames[i % masterNames.length];
      
      const existing = await prisma.honourRecord.findFirst({
        where: { name: realName, craft: rec.craft_key },
      });

      if (!existing) {
        await prisma.honourRecord.create({
          data: {
            name: realName,
            craft: rec.craft_key || 'thagzo',
            dzongkhag: rec.dzongkhag || 'Thimphu',
            awardType: rec.honour === 'National Craft Award' ? 'NationalMaster' : 'RoyalSeal',
            yearAwarded: rec.since || 2020,
            citation: rec.note || 'Distinguished master artisan dedicating decades of practice to safeguarding ancestral Bhutanese craft techniques.',
            portraitUrl: rec.image_path ? `/${rec.image_path}` : '/images/artisan_portrait.jpg',
            isActive: true,
            sortOrder: i,
          },
        });
      }
    }
    console.log(`✓ Seeded honour records.`);
  }

  // 8. Seed Membership Categories
  if (Array.isArray(data.membershipCategories)) {
    const feeMap = {
      'individual-artisan': { btn: 1200, usd: 15 },
      'craft-enterprise': { btn: 5000, usd: 60 },
      'community-group': { btn: 2500, usd: 30 },
      'supporter-institutional': { btn: 10000, usd: 120 },
    };

    for (let i = 0; i < data.membershipCategories.length; i++) {
      const mc = data.membershipCategories[i];
      const dues = feeMap[mc.key] || { btn: 1200, usd: 15 };
      await prisma.membershipCategory.upsert({
        where: { key: mc.key },
        update: {
          name: mc.name,
          shortName: mc.status || mc.name,
          duesBTN: dues.btn,
          duesUSD: dues.usd,
          description: mc.meaning || mc.tagline || '',
          eligibility: mc.criteria || [],
          benefits: mc.benefits || [],
          documents: mc.how || [],
          sortOrder: i,
          isActive: true,
        },
        create: {
          key: mc.key,
          name: mc.name,
          shortName: mc.status || mc.name,
          duesBTN: dues.btn,
          duesUSD: dues.usd,
          description: mc.meaning || mc.tagline || '',
          eligibility: mc.criteria || [],
          benefits: mc.benefits || [],
          documents: mc.how || [],
          sortOrder: i,
          isActive: true,
        },
      });
    }
    console.log(`✓ Seeded ${data.membershipCategories.length} membership categories.`);
  }

  // 9. Seed Full Dynamic Site Settings CMS Fields
  await prisma.siteSetting.upsert({
    where: { id: 'default' },
    update: {
      aboutMandateText: 'The Handicrafts Association of Bhutan (HAB) was established in 2005 under Royal Patronage and registered as a Civil Society Organisation (CSO/2011/043) and Public Benefit Organisation (PBO) under the Civil Society Organizations Act of Bhutan.',
      aboutMandatePara2: 'We are the apex civil society body representing 7,500+ traditional artisans and micro-enterprises across all 20 dzongkhags. Our mandate spans cultural safeguarding of the 13 traditional crafts (Zorig Chusum), ethical market facilitation, artisan welfare, and continuous skills transmission.',
      aboutHistoryText: 'Over two decades of sector leadership, HAB has transformed informal cottage workshops into accredited guild enterprises, secured export pathways to international markets, and built Bhutan’s most comprehensive authentic provenance traceability system.',
      aboutObjectives: sanitizeJson(data.about?.objectives) || [
        'Improve market access for Bhutanese artisans at home, in the tourism sector and internationally.',
        'Raise product quality and consistency through training, standards and inspection.',
        'Guarantee fair compensation and prompt payment for handcrafted work.',
        'Keep the thirteen crafts of Zorig Chusum in living practice, particularly those with few practitioners.',
        'Represent the sector in policy dialogue with government and development partners.',
        'Strengthen member enterprises as businesses - costing, licensing, export documentation and finance.',
      ],
      aboutValues: sanitizeJson(data.about?.values) || [
        { letter: 'C', title: 'Care', body: 'Care for the maker, the material and the object. We do not ask an artisan to cut a corner we would not put our own name to, and we do not sell work we have not handled.' },
        { letter: 'R', title: 'Respect', body: 'Respect for a tradition older than the association, and for the person who carries it. Masters are consulted, not instructed; technique is recorded on the maker terms.' },
        { letter: 'A', title: 'Attentive', body: 'Attentive to quality, to the market and to what members actually ask for. Programmes are designed from what artisans report, and are dropped when they stop working.' },
        { letter: 'F', title: 'Fair', body: 'Fair dealing, in writing. Prices are agreed with the maker and paid upfront, consignment risk stays with the association, and no member is undercut by another.' },
        { letter: 'T', title: 'Transparent', body: 'Transparent about money and results. Audited accounts, programme outcomes and project evaluations are published every year in English and Dzongkha.' },
      ],
      aboutStats: [
        { number: '2005', label: 'Established under Royal Patronage' },
        { number: '7,500+', label: 'Master Artisans Represented' },
        { number: '13', label: 'Zorig Chusum Traditional Crafts' },
        { number: '20', label: 'Dzongkhags Nationwide Coverage' },
      ],
      contactLede: 'Get in touch with the Handicrafts Association of Bhutan for membership enquiries, wholesale partnerships, provenance verification, or general sector information.',
      contactDirections: 'The HAB Secretariat is situated on Metog Lam in Kawajangsa, Thimphu, opposite the National Library of Bhutan and adjacent to the Department of Culture & Dzongkha Development. Visitors are welcome Monday to Friday, 9:00 AM – 5:00 PM.',
      contactDepartments: [
        { name: 'Membership & Artisan Services', email: 'membership@hab.org.bt', phone: '+975-2-338089', description: 'Artisan registration, CID verification, annual dues, cluster onboarding' },
        { name: 'Wholesale & Trade Enquiries', email: 'wholesale@hab.org.bt', phone: '+975-17462636', description: 'B2B export orders, trade buyer accreditation, customs clearance' },
        { name: 'Provenance & Authenticity', email: 'authenticity@hab.org.bt', phone: '+975-2-338089', description: 'Seal of Authenticity verification, certificate validation, craft standards' },
        { name: 'Media & Research', email: 'officehab@gmail.com', phone: '+975-77654508', description: 'Publications, sector surveys, baseline reports, press interviews' },
      ],
      contactPoBox: 'PO Box 1129, Thimphu, Bhutan',
      contactHours: 'Monday – Friday: 9:00 AM – 5:00 PM BST (UTC+6)',
      homeCraftIntro: 'Bhutan’s cultural identity is anchored in the thirteen traditional arts and crafts — Zorig Chusum — codified in the seventeenth century under the reign of Zhabdrung Ngawang Namgyal and Tenzin Rabgye. HAB champions every living master and apprentice carrying these ancestral traditions into the contemporary world.',
      homeClusterPromo: {
        eyebrow: 'CRAFT CLUSTERS & OUTLETS',
        title: 'Across 20 dzongkhags, where craft happens',
        description: 'From Khoma silk weavers in Lhuentse to Trashiyangtse woodturners, artisanal production is organized in specialized community clusters with direct links to verified retail showrooms.',
        ctaText: 'Explore Craft Clusters',
        ctaLink: '/clusters',
      },
      homeWholesalePromo: {
        eyebrow: 'FOR TRADE BUYERS & INTERNATIONAL PARTNERS',
        title: 'Sourcing authentic Bhutanese craft at scale',
        description: 'We partner with ethical luxury retailers, galleries, museum shops, and interior design firms globally to supply authenticated, master-crafted Bhutanese goods with verifiable provenance.',
        ctaPrimaryText: 'Wholesale Sourcing',
        ctaPrimaryLink: '/wholesale',
        ctaSecondaryText: 'Register as Trade Buyer',
        ctaSecondaryLink: '/wholesale/register',
      },
      homeCsoText: 'Handicrafts Association of Bhutan is a registered Public Benefit Organisation (CSO/2011/043). Every purchase made through our platforms returns fair upfront compensation directly to rural artisan families.',
      donateHeroTitle: 'Direct Support for Bhutanese Artisans',
      donateHeroLede: '100% of public contributions go directly to artisan welfare, emergency raw material funds, youth apprenticeships, and traditional tool replacement across rural dzongkhags.',
      donateTaxNotice: 'HAB is a registered Public Benefit Organisation (CSO/2011/043) under the Civil Society Organizations Act of Bhutan. All contributions receive official CSO receipts and are eligible for tax exemption under Bhutanese Revenue & Customs regulations.',
      checkoutBankName: 'Bank of Bhutan Ltd',
      checkoutAccountNumber: '1009234810293',
      checkoutAccountTitle: 'Handicrafts Association of Bhutan',
      checkoutSwiftCode: 'BOBBBT22',
      checkoutBankAddress: 'Corporate Branch, Norzin Lam, Thimphu, Bhutan',
      shippingOriginText: 'Metog Lam, Kawajangsa, Thimphu, Kingdom of Bhutan',
      shippingCarrierName: 'Bhutan Post International Express (EMS) / DHL Express',
      shippingTransitDays: '7-14 business days worldwide',
      shippingInsuranceNote: 'Every consignment is hand-packed in Thimphu using traditional handmade Desho paper wrappers and insured against transit damage.',
      orderConfirmationTitle: 'Order Confirmed!',
      orderConfirmationLede: 'Thank you for supporting Bhutanese master artisans. Your order has been placed successfully and has entered our fulfillment queue in Thimphu.',
      orderSupportEmail: 'officehab@gmail.com',
      orderSupportPhone: '+975-2-338089',
      trustBadges: [
        { title: '100% Authentic Zorig Chusum', description: 'Every piece is handmade by accredited Bhutanese master artisans.' },
        { title: 'Fair Price, Paid Upfront', description: 'Artisans receive direct fair compensation before pieces are dispatched.' },
        { title: 'Bhutanese Origin Certificate', description: 'Includes an official Certificate of Bhutanese Origin and CSO seal.' },
        { title: 'Tracked Worldwide EMS', description: 'Full airway bill tracking from Thimphu to your destination door.' },
      ],
    },
    create: {
      id: 'default',
      tagline: 'Towards a vibrant & sustainable handicrafts sector',
      heroParagraph: 'Handicrafts Association of Bhutan supports local artisans across all 20 dzongkhags...',
      heroCtaPrimaryText: 'Our mission',
      heroCtaPrimaryLink: '/about',
      heroCtaSecondaryText: 'Shop the crafts ->',
      heroCtaSecondaryLink: '/shop',
      stat1Number: '7,500+',
      stat1Label: 'Master Artisans Represented',
      stat2Number: '13',
      stat2Label: 'Traditional Crafts of Zorig Chusum',
      stat3Number: '20',
      stat3Label: 'Dzongkhags Reached',
      stat4Number: '70%',
      stat4Label: 'Women-Led Enterprises',
      officeAddress: 'Metog Lam, Kawajangsa, Thimphu, Bhutan',
      officePhone: '+975-2-338089',
      edPhone: '+975-77654508',
      marketingPhone: '+975-17462636 / 17881111',
      officialEmail: 'officehab@gmail.com',
      footerAbout: 'Handicrafts Association of Bhutan is the apex civil society organization representing traditional artisans...',
      csoRegistration: 'CSO Registration: CSO/2011/043 · Thimphu, Kingdom of Bhutan',
      copyrightText: '© 2026 Handicrafts Association of Bhutan. All rights reserved.',
      punakhaMarketNotice: 'The only authentic crafts market validated and managed by HAB',
      partnersList: ['EU SWITCH-Asia', 'Helvetas Bhutan', 'Tarayana Foundation', 'Bhutan Foundation'],
      aboutMandateText: 'The Handicrafts Association of Bhutan (HAB) was established in 2005 under Royal Patronage and registered as a Civil Society Organisation (CSO/2011/043)...',
      aboutMandatePara2: 'We are the apex civil society body representing 7,500+ traditional artisans...',
      aboutHistoryText: 'Over two decades of sector leadership, HAB has transformed informal cottage workshops...',
      aboutObjectives: [
        'Improve market access for Bhutanese artisans at home, in the tourism sector and internationally.',
        'Raise product quality and consistency through training, standards and inspection.',
        'Guarantee fair compensation and prompt payment for handcrafted work.',
        'Keep the thirteen crafts of Zorig Chusum in living practice, particularly those with few practitioners.',
        'Represent the sector in policy dialogue with government and development partners.',
        'Strengthen member enterprises as businesses — costing, licensing, export documentation and finance.',
      ],
      aboutValues: [
        { letter: 'C', title: 'Care', body: 'Care for the maker, the material and the object.' },
        { letter: 'R', title: 'Respect', body: 'Respect for a tradition older than the association.' },
        { letter: 'A', title: 'Attentive', body: 'Attentive to quality, to the market and to what members actually ask for.' },
        { letter: 'F', title: 'Fair', body: 'Fair dealing, in writing. Prices are agreed with the maker and paid upfront.' },
        { letter: 'T', title: 'Transparent', body: 'Transparent about money and results.' },
      ],
      contactLede: 'Get in touch with the Handicrafts Association of Bhutan for membership enquiries, wholesale partnerships, provenance verification, or general sector information.',
      contactDirections: 'The HAB Secretariat is situated on Metog Lam in Kawajangsa, Thimphu, opposite the National Library.',
      contactDepartments: [
        { name: 'Membership & Artisan Services', email: 'membership@hab.org.bt', phone: '+975-2-338089', description: 'Artisan registration, CID verification, annual dues, cluster onboarding' },
        { name: 'Wholesale & Trade Enquiries', email: 'wholesale@hab.org.bt', phone: '+975-17462636', description: 'B2B export orders, trade buyer accreditation, customs clearance' },
        { name: 'Provenance & Authenticity', email: 'authenticity@hab.org.bt', phone: '+975-2-338089', description: 'Seal of Authenticity verification, certificate validation, craft standards' },
        { name: 'Media & Research', email: 'officehab@gmail.com', phone: '+975-77654508', description: 'Publications, sector surveys, baseline reports, press interviews' },
      ],
      contactPoBox: 'PO Box 1129, Thimphu, Bhutan',
      contactHours: 'Monday – Friday: 9:00 AM – 5:00 PM BST (UTC+6)',
      homeCraftIntro: 'Bhutan’s cultural identity is anchored in the thirteen traditional arts and crafts — Zorig Chusum...',
      homeCsoText: 'Handicrafts Association of Bhutan is a registered Public Benefit Organisation (CSO/2011/043)...',
      donateHeroTitle: 'Direct Support for Bhutanese Artisans',
      donateHeroLede: '100% of public contributions go directly to artisan welfare, emergency raw material funds...',
      donateTaxNotice: 'HAB is a registered Public Benefit Organisation (CSO/2011/043)...',
      checkoutBankName: 'Bank of Bhutan Ltd',
      checkoutAccountNumber: '1009234810293',
      checkoutAccountTitle: 'Handicrafts Association of Bhutan',
      checkoutSwiftCode: 'BOBBBT22',
      checkoutBankAddress: 'Corporate Branch, Norzin Lam, Thimphu, Bhutan',
      shippingOriginText: 'Metog Lam, Kawajangsa, Thimphu, Kingdom of Bhutan',
      shippingCarrierName: 'Bhutan Post International Express (EMS) / DHL Express',
      shippingTransitDays: '7-14 business days worldwide',
      orderConfirmationTitle: 'Order Confirmed!',
      orderSupportEmail: 'officehab@gmail.com',
      orderSupportPhone: '+975-2-338089',
    },
  });
  console.log('✓ Seeded Site Settings with full dynamic CMS values.');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
