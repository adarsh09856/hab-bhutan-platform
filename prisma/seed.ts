import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for HAB Digital Platform...');

  // 1. Seed 13 Zorig Chusum Crafts from crafts.json
  const craftsRaw = fs.readFileSync(path.join(__dirname, '../crafts.json'), 'utf-8');
  const craftsJson = JSON.parse(craftsRaw);

  for (const craft of craftsJson.crafts) {
    await prisma.craft.upsert({
      where: { key: craft.key },
      update: {
        name: craft.name,
        english: craft.english,
        description: craft.description,
      },
      create: {
        key: craft.key,
        name: craft.name,
        english: craft.english,
        description: craft.description,
      },
    });
  }
  console.log(`Seeded ${craftsJson.crafts.length} Zorig Chusum craft categories.`);

  // 2. Seed Immutable Roles
  const superAdminRole = await prisma.role.upsert({
    where: { slug_version: { slug: 'super_admin', version: 1 } },
    update: {},
    create: {
      name: 'Super Admin',
      slug: 'super_admin',
      version: 1,
      status: 'ACTIVE',
      permissions: ['*'],
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { slug_version: { slug: 'staff_operator', version: 1 } },
    update: {},
    create: {
      name: 'Staff Operator',
      slug: 'staff_operator',
      version: 1,
      status: 'ACTIVE',
      permissions: [
        'applications:view',
        'applications:review',
        'applications:approve',
        'applications:reject',
        'members:view',
        'members:verify',
        'products:create',
        'products:review',
        'products:publish',
        'orders:view',
        'orders:fulfill',
        'content:edit',
      ],
    },
  });

  const trusteeRole = await prisma.role.upsert({
    where: { slug_version: { slug: 'trustee_viewer', version: 1 } },
    update: {},
    create: {
      name: 'Board of Trustees Viewer',
      slug: 'trustee_viewer',
      version: 1,
      status: 'ACTIVE',
      permissions: ['members:view', 'orders:view', 'reports:view', 'dues:view'],
    },
  });

  const memberRole = await prisma.role.upsert({
    where: { slug_version: { slug: 'member', version: 1 } },
    update: {},
    create: {
      name: 'Artisan Member',
      slug: 'member',
      version: 1,
      status: 'ACTIVE',
      permissions: ['products:create', 'PORTAL_ACCESS', 'PRODUCTS_SUBMIT', 'DUES_PAY'],
    },
  });

  // 3. Seed Initial Staff User with real bcrypt hash
  const adminPasswordHash = bcrypt.hashSync('AdminSecure2026!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@handicraftsbhutan.org' },
    update: {
      passwordHash: adminPasswordHash,
      status: 'ACTIVE',
    },
    create: {
      email: 'admin@handicraftsbhutan.org',
      name: 'HAB Secretariat Admin',
      passwordHash: adminPasswordHash,
      roleId: superAdminRole.id,
      status: 'ACTIVE',
    },
  });

  // 3b. Seed Demo Member User Account with real bcrypt hash
  // Note: Seed demo accounts maintain fixed demo credentials with mustChangePassword: false for evaluation testing,
  // whereas real member auto-provisioning generates 100% random temporary passwords with mustChangePassword: true.
  const memberPasswordHash = bcrypt.hashSync('ArtisanMember2026!', 10);
  const memberUser = await prisma.user.upsert({
    where: { email: 'member@handicraftsbhutan.org' },
    update: {
      passwordHash: memberPasswordHash,
      status: 'ACTIVE',
      mustChangePassword: false,
    },
    create: {
      email: 'member@handicraftsbhutan.org',
      name: 'Choki Wangmo (Khoma Weavers)',
      passwordHash: memberPasswordHash,
      roleId: memberRole.id,
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });

  // 4. Seed 9 Verified Member Enterprises
  const memberData = [
    { name: "Khoma Weavers Group", craftKey: "thagzo", dz: "Lhuentse", year: 2011, bio: "Forty-two women weaving kisuthara silk patterns on backstrap looms in Khoma village.", cid: "10602001122", prods: ["HHB01", "HHB10"] },
    { name: "Kheng Bamboo Collective", craftKey: "tshazo", dz: "Zhemgang", year: 2013, bio: "Bamboo and cane baskets, bangchungs and mats from the Kheng region.", cid: "11803002233", prods: ["FTB04", "LUD01"] },
    { name: "Chumey Yathra House", craftKey: "thagzo", dz: "Bumthang", year: 2009, bio: "Yathra wool weaving in Chumey valley — blankets, jackets and saddle bags.", cid: "10101003344", prods: ["SAD03"] },
    { name: "Kelzang Dorji Woodworks", craftKey: "parzo", dz: "Trashiyangtse", year: 2015, bio: "Carving workshop producing masks, choesham panels and altar detail.", cid: "11604004455", prods: ["MAS01"] },
    { name: "Norzin Tailoring", craftKey: "tshemzo", dz: "Thimphu", year: 2012, bio: "Tailoring and appliqué studio working in raw silk and cotton.", cid: "11405005566", prods: ["CAM01", "CUS02"] },
    { name: "Yangtse Turning Works", craftKey: "shagzo", dz: "Trashiyangtse", year: 2010, bio: "Lacquered dapa and phob turned from burl wood.", cid: "11604006677", prods: ["DAP02"] },
    { name: "Jungshi Paper Works", craftKey: "dezo", dz: "Punakha", year: 2008, bio: "Traditional desho paper from daphne and edgeworthia bark.", cid: "10806007788", prods: ["DEZ01"] },
    { name: "Zorig Silversmiths", craftKey: "troezo", dz: "Thimphu", year: 2014, bio: "Silver koma, jewellery and ritual objects, hand-chased.", cid: "11405008899", prods: ["TRO04"] },
    { name: "Sonam Thangka Studio", craftKey: "lhazo", dz: "Paro", year: 2007, bio: "Thangka painting to classical proportion, mineral pigments only.", cid: "11107009900", prods: ["LHA01"] }
  ];

  const createdMembers = new Map();
  for (let i = 0; i < memberData.length; i++) {
    const m = memberData[i];
    const isFirst = i === 0;
    const created = await prisma.member.upsert({
      where: { regNumber: `HAB-${m.year}-${100 + i}` },
      update: {
        name: m.name,
        craftKey: m.craftKey,
        dzongkhag: m.dz,
        bio: m.bio,
        status: 'VERIFIED',
        userId: isFirst ? memberUser.id : undefined,
      },
      create: {
        name: m.name,
        craftKey: m.craftKey,
        dzongkhag: m.dz,
        joinYear: m.year,
        regNumber: `HAB-${m.year}-${100 + i}`,
        tier: 'ACTIVE_SECTOR_MEMBER',
        status: 'VERIFIED',
        bio: m.bio,
        cidNumber: m.cid,
        duesExpiryDate: new Date('2026-12-31'),
        userId: isFirst ? memberUser.id : undefined,
      },
    });
    createdMembers.set(m.name, created);
  }

  // 5. Seed 12 Catalog Products
  const productData = [
    { code: "MAS01", name: "Ritual Mask", price: 87, craft: "parzo", region: "Trashiyangtse", maker: "Kelzang Dorji Woodworks", desc: "Hand-carved and painted mask of the kind worn in tshechu dances, cut from a single block of seasoned wood." },
    { code: "HHB01", name: "Handheld Bag", price: 40, craft: "thagzo", region: "Lhuentse", maker: "Khoma Weavers Group", desc: "Backstrap-loom cloth in yathra-inspired stripes, lined and finished with a wooden handle." },
    { code: "FTB04", name: "Fruits Basket", price: 43, craft: "tshazo", region: "Zhemgang", maker: "Kheng Bamboo Collective", desc: "Split bamboo woven tight enough to hold water, in the Kheng technique passed down through generations." },
    { code: "LUD01", name: "Laundry Basket", price: 50, craft: "tshazo", region: "Zhemgang", maker: "Kheng Bamboo Collective", desc: "Deep cane basket with a reinforced rim, sized for a household and light enough to carry full." },
    { code: "HHB10", name: "Handheld Bag", price: 40, craft: "thagzo", region: "Lhuentse", maker: "Khoma Weavers Group", desc: "A narrower cut of the handheld bag with a plain-weave body and patterned panel." },
    { code: "SAD03", name: "Saddle Bag", price: 158, craft: "thagzo", region: "Bumthang", maker: "Chumey Yathra House", desc: "Yathra wool woven in Chumey valley, sewn into a two-pocket saddle bag with leather straps." },
    { code: "CAM01", name: "Camera Bag", price: 50, craft: "tshemzo", region: "Thimphu", maker: "Norzin Tailoring", desc: "Padded and quilted by hand, with an adjustable strap and a water-resistant inner layer." },
    { code: "CUS02", name: "Cushion Cover", price: 68, craft: "tshemzo", region: "Thimphu", maker: "Norzin Tailoring", desc: "Appliqué cushion cover in raw silk with hand-stitched borders." },
    { code: "DAP02", name: "Wooden Bowl (Dapa)", price: 65, craft: "shagzo", region: "Trashiyangtse", maker: "Yangtse Turning Works", desc: "Turned from the burl of a maple, then lacquered — the bowl form long associated with healing properties." },
    { code: "DEZ01", name: "Daphne Paper Set", price: 22, craft: "dezo", region: "Punakha", maker: "Jungshi Paper Works", desc: "Sheets of desho paper made from daphne bark, sun-dried on frames. Set of ten." },
    { code: "TRO04", name: "Silver Brooch (Koma)", price: 120, craft: "troezo", region: "Thimphu", maker: "Zorig Silversmiths", desc: "Hand-chased silver koma, the clasp traditionally worn with a kira." },
    { code: "LHA01", name: "Thangka Scroll", price: 340, craft: "lhazo", region: "Paro", maker: "Sonam Thangka Studio", desc: "Mineral pigments on cotton, brocade-mounted. Painted to the proportions set out in the classical treatises." }
  ];

  for (const p of productData) {
    const maker = createdMembers.get(p.maker);
    await prisma.product.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        priceUSD: p.price,
        craftKey: p.craft,
        region: p.region,
        makerMemberId: maker ? maker.id : null,
        description: p.desc,
      },
      create: {
        code: p.code,
        name: p.name,
        priceUSD: p.price,
        craftKey: p.craft,
        region: p.region,
        makerMemberId: maker ? maker.id : null,
        description: p.desc,
        images: [
          { url: `/placeholders/${p.code.toLowerCase()}_1.jpg`, role: "primary" },
          { url: `/placeholders/${p.code.toLowerCase()}_2.jpg`, role: "angle2" },
          { url: `/placeholders/${p.code.toLowerCase()}_3.jpg`, role: "angle3" }
        ],
        stock: 12,
        status: 'PUBLISHED',
      },
    });
  }

  // 6. Seed 32 Publications
  const publicationData = [
    ["Annual report","Annual Report 2025",2026,"PDF · 4.2 MB · English & Dzongkha",true],
    ["Strategy","Five-Year Strategic Plan 2026–2030",2026,"PDF · 3.6 MB · Board approved",true],
    ["Sector study","Zorig Chusum Value Chain Assessment",2025,"PDF · 2.8 MB · 96 pages",true],
    ["Accounts","Audited Financial Statements 2025",2026,"PDF · 1.1 MB · Independent auditor",true],
    ["Catalogue","HAB Product Catalogue 2026",2026,"PDF · 18.4 MB · 120 products",false],
    ["Policy brief","Craft Sector Tax and Licensing: A Note for Policymakers",2025,"PDF · 640 KB · 12 pages",false],
    ["Guideline","Natural Dye Handbook for Weavers",2025,"PDF · 6.2 MB · Illustrated",false],
    ["Training manual","Costing and Pricing for Craft Enterprises",2025,"PDF · 2.1 MB · Workbook",false],
    ["Annual report","Annual Report 2024",2025,"PDF · 3.9 MB · English & Dzongkha",false],
    ["Accounts","Audited Financial Statements 2024",2025,"PDF · 1.0 MB · Independent auditor",false],
    ["Case study","Khoma Weavers: Fifteen Years of Kisuthara",2024,"PDF · 5.4 MB · Photo essay",false],
    ["Sector study","Market Demand for Bhutanese Handicrafts in Japan",2024,"PDF · 2.2 MB · Buyer survey",false],
    ["Guideline","Export Documentation Guide for Members",2024,"PDF · 1.4 MB · Checklists",false],
    ["Newsletter","Zorig Bulletin — Issue 12",2024,"PDF · 900 KB · Quarterly",false],
    ["Annual report","Annual Report 2023",2024,"PDF · 3.6 MB · English & Dzongkha",false],
    ["Training manual","Bamboo Splitting and Weaving: Technique Notes",2023,"PDF · 4.8 MB · Illustrated",false],
    ["Case study","Women in Craft Enterprise: Endline Evaluation",2023,"PDF · 3.1 MB · External evaluator",false],
    ["Policy brief","Protecting Craft Origin: Options for Bhutan",2023,"PDF · 720 KB · 14 pages",false],
    ["Newsletter","Zorig Bulletin — Issue 9",2023,"PDF · 880 KB · Quarterly",false],
    ["Accounts","Audited Financial Statements 2022",2023,"PDF · 980 KB · Independent auditor",false],
    ["Sector study","Craft Sector Employment and Income Baseline",2022,"PDF · 2.6 MB · 78 pages",false],
    ["Guideline","Quality Standards for HAB-Listed Products",2022,"PDF · 1.2 MB · Inspection criteria",false],
    ["Case study","COVID-19 Recovery: What Cash-for-Craft Achieved",2022,"PDF · 2.9 MB · Review",false],
    ["Annual report","Annual Report 2021",2022,"PDF · 3.2 MB · English",false],
    ["Training manual","Photographing Craft for Online Sale",2021,"PDF · 5.9 MB · Practical guide",false],
    ["Catalogue","Zorig Chusum Reference Catalogue",2021,"PDF · 22.1 MB · 13 crafts",false],
    ["Newsletter","Zorig Bulletin — Issue 5",2021,"PDF · 810 KB · Quarterly",false],
    ["Policy brief","Craft in the Tourism Value Chain",2020,"PDF · 690 KB · 10 pages",false],
    ["Sector study","Raw Material Supply Constraints in Eastern Bhutan",2019,"PDF · 1.9 MB · Field study",false],
    ["Annual report","Annual Report 2018",2019,"PDF · 2.8 MB · English",false],
    ["Guideline","Setting Up a Craft Producer Group",2017,"PDF · 1.1 MB · Handbook",false],
    ["Case study","Chumey Yathra: From Household Loom to Retail",2016,"PDF · 2.4 MB · Photo essay",false]
  ];

  for (const pub of publicationData) {
    await prisma.publication.create({
      data: {
        kind: pub[0] as string,
        title: pub[1] as string,
        year: pub[2] as number,
        metaDetails: pub[3] as string,
        isFeatured: pub[4] as boolean,
      },
    });
  }

  // 7. Seed 6 Projects
  const projectData = [
    { status: "current", name: "Sustainable Bhutanese Handicrafts (SWITCH-Asia)", partner: "EU SWITCH-Asia · with GrAT and SHINE", period: "2024 – 2027", budget: "EUR 1.4 m", progress: 62,
      summary: "Shifting member enterprises to resource-efficient production: natural dyes, waste reduction and cleaner finishing, while holding craft quality.",
      activities: ["Cleaner-production audits in 240 workshops","Natural dye and low-waste finishing training","Green business plans and access to finance","Eco-label criteria drafted with RGoB"],
      results: [{n:"240",l:"Enterprises audited"},{n:"1,180",l:"Artisans trained"},{n:"31%",l:"Average waste reduction"}] },
    { status: "current", name: "Market Access for Rural Artisans", partner: "Enhanced Integrated Framework (EIF)", period: "2025 – 2027", budget: "USD 620,000", progress: 38,
      summary: "Connecting rural producer groups to export buyers through the HAB e-shop, trade fairs and consolidated EMS shipping.",
      activities: ["Product photography and cataloguing for 400 items","Export documentation clinics in six dzongkhags","Buyer missions to India, Thailand and Japan","Consolidated shipping desk at the secretariat"],
      results: [{n:"400",l:"Products catalogued"},{n:"14",l:"Export buyers engaged"},{n:"6",l:"Dzongkhags covered"}] },
    { status: "current", name: "Zorig Chusum Skills Transmission", partner: "UNDP GEF Small Grants Programme", period: "2026 – 2028", budget: "USD 180,000", progress: 12,
      summary: "Master-to-apprentice placements in the five crafts with the fewest practising members, to keep endangered techniques alive.",
      activities: ["Master craftspeople identified in Lugzo, Garzo, Jinzo, Dozo and Shingzo","Two-year paid apprenticeships for 40 young artisans","Technique documentation in video and print","Curriculum shared with the Institute of Zorig Chusum"],
      results: [{n:"40",l:"Apprenticeships opened"},{n:"5",l:"Endangered crafts covered"},{n:"18",l:"Masters engaged"}] },
    { status: "past", name: "Women in Craft Enterprise", partner: "Government of Canada · Helvetas Bhutan", period: "2021 – 2024", budget: "CAD 900,000", progress: 100,
      summary: "Business and pricing capability for women-led craft enterprises, with a revolving fund for raw material purchase.",
      activities: ["Costing and pricing training for 2,100 women","Revolving raw-material fund in 9 dzongkhags","Producer groups formalised and registered","Childcare support at training venues"],
      results: [{n:"2,100",l:"Women trained"},{n:"64%",l:"Reported income increase"},{n:"312",l:"New enterprises registered"}] },
    { status: "past", name: "COVID-19 Craft Sector Recovery", partner: "UNDP Bhutan · RGoB", period: "2020 – 2022", budget: "USD 450,000", progress: 100,
      summary: "Emergency income support and a first move to online selling when tourism arrivals stopped.",
      activities: ["Cash-for-craft procurement from 1,600 artisans","HAB e-shop launched with payment gateway","Domestic craft bazaars in four dzongkhags","Raw material bulk purchase to hold prices"],
      results: [{n:"1,600",l:"Artisans supported"},{n:"Nu. 24 m",l:"Craft purchased directly"},{n:"195",l:"Stores kept trading"}] },
    { status: "past", name: "Craft Product Innovation Lab", partner: "BCCI · Ernst & Young (pro bono)", period: "2019 – 2021", budget: "USD 210,000", progress: 100,
      summary: "Pairing artisans with designers to develop contemporary lines from traditional technique for retail and hospitality.",
      activities: ["Six design–artisan cycles across four crafts","Prototyping grants and material sourcing","Hotel and retail buyer showcases","Design rights guidance for participants"],
      results: [{n:"38",l:"New products launched"},{n:"11",l:"Hotel and retail accounts"},{n:"4",l:"Crafts represented"}] }
  ];

  for (const prj of projectData) {
    await prisma.projectRecord.create({
      data: {
        status: prj.status,
        name: prj.name,
        partner: prj.partner,
        period: prj.period,
        budget: prj.budget,
        progressPercent: prj.progress,
        summary: prj.summary,
        activities: prj.activities,
        results: prj.results,
      },
    });
  }

  // 8. Seed News & Events
  const news = [
    { kind: "Programs", dateString: "28 Aug 2026", title: "Trade facilitation desk opens for the autumn export season", blurb: "Members can now book one-to-one sessions on export documentation, EMS rates and commercial invoicing at the HAB office in Thimphu." },
    { kind: "Artisan support", dateString: "14 Aug 2026", title: "Natural dye training concludes in Lhuentse", blurb: "Twenty-six weavers from Khoma and Gangzur completed a ten-day course on madder, indigo and lac dye preparation." },
    { kind: "Events", dateString: "02 Aug 2026", title: "Zorig Chusum craft bazaar returns to Clock Tower Square", blurb: "Forty member enterprises will exhibit across three days, with live demonstrations from each of the thirteen crafts." },
    { kind: "Publications", dateString: "19 Jul 2026", title: "Annual report 2025 available to download", blurb: "Sector figures, programme outcomes and audited accounts for the year, published in English and Dzongkha." },
    { kind: "Projects", dateString: "30 Jun 2026", title: "Product innovation lab pairs six artisans with designers", blurb: "A six-month cycle developing new homeware lines from bamboo, yathra and desho paper for international retail." }
  ];

  for (const n of news) {
    await prisma.newsArticle.create({ data: n });
  }

  const events = [
    { day: "12", mon: "SEP", title: "Craft bazaar, day one", place: "Clock Tower Square, Thimphu" },
    { day: "27", mon: "SEP", title: "Export documentation clinic", place: "HAB office, Metog Lam" },
    { day: "08", mon: "OCT", title: "Members' general assembly", place: "Thimphu" }
  ];

  for (const ev of events) {
    await prisma.calendarEvent.create({ data: ev });
  }

  // 9. Seed Governance (AoA 2026 Structure)
  const govRecords = [
    { category: "BOARD_OF_TRUSTEES", roleTitle: "Chairperson", individualName: "Name to confirm", chapterOrNote: "Elected 2024 · master weaver, Lhuentse", sortOrder: 1 },
    { category: "BOARD_OF_TRUSTEES", roleTitle: "Vice-Chairperson", individualName: "Name to confirm", chapterOrNote: "Elected 2024 · craft enterprise owner, Thimphu", sortOrder: 2 },
    { category: "BOARD_OF_TRUSTEES", roleTitle: "Trustee — Finance & Audit", individualName: "Name to confirm", chapterOrNote: "Chairs the finance & endowment committee", sortOrder: 3 },
    { category: "BOARD_OF_TRUSTEES", roleTitle: "Trustee — Sector Membership", individualName: "Name to confirm", chapterOrNote: "Eastern dzongkhags representative", sortOrder: 4 },
    { category: "BOARD_OF_TRUSTEES", roleTitle: "Trustee — Zorig Chusum Heritage", individualName: "Name to confirm", chapterOrNote: "Co-opted expert, Institute of Zorig Chusum", sortOrder: 5 },
    { category: "SECRETARIAT", roleTitle: "Executive Director", individualName: "Name to confirm", chapterOrNote: "+975-77654508 · Secretariat lead", sortOrder: 1 },
    { category: "SECRETARIAT", roleTitle: "Programmes & Donor Projects", individualName: "Name to confirm", chapterOrNote: "Donor projects, training, M&E", sortOrder: 2 },
    { category: "SECRETARIAT", roleTitle: "Marketing & E-shop Desk", individualName: "Name to confirm", chapterOrNote: "+975-17462636 · Retail and wholesale", sortOrder: 3 },
    { category: "SECRETARIAT", roleTitle: "Finance & Administration", individualName: "Name to confirm", chapterOrNote: "Accounts, audit compliance, payroll", sortOrder: 4 },
    { category: "SECRETARIAT", roleTitle: "Membership Services", individualName: "Name to confirm", chapterOrNote: "Applications, directory, dues collection", sortOrder: 5 },
    { category: "SECRETARIAT", roleTitle: "Trade Facilitation", individualName: "Name to confirm", chapterOrNote: "Export documentation, buyer liaison", sortOrder: 6 },
    { category: "DZONGKHAG_CHAPTER", roleTitle: "Lhuentse Chapter", individualName: "Khoma Craft Community", chapterOrNote: "Kisuthara silk weaving cluster", sortOrder: 1 },
    { category: "DZONGKHAG_CHAPTER", roleTitle: "Zhemgang Chapter", individualName: "Kheng Bamboo Group", chapterOrNote: "Bamboo and cane basketry", sortOrder: 2 },
    { category: "DZONGKHAG_CHAPTER", roleTitle: "Bumthang Chapter", individualName: "Chumey Yathra Producers", chapterOrNote: "Yathra wool weaving", sortOrder: 3 },
    { category: "DZONGKHAG_CHAPTER", roleTitle: "Trashiyangtse Chapter", individualName: "Yangtse Woodworkers & Turners", chapterOrNote: "Dapa bowls and carving", sortOrder: 4 }
  ];

  for (const g of govRecords) {
    await prisma.governanceRecord.create({ data: g });
  }

  // 10. Seed Initial Exchange Rate
  await prisma.fxRateRecord.create({
    data: {
      rate: 84.0,
      source: 'RMA_FEED',
      status: 'FRESH',
      isManualOverride: false,
      notes: 'Initial seed baseline rate',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
