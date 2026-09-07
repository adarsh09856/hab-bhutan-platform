export interface CraftItem {
  id: string;
  key: string;
  name: string;
  english: string;
  dzongkha: string;
  description: string;
}

export const CRAFTS: CraftItem[] = [
  { id: "shing-zo", key: "shingzo", name: "Shing-zo", dzongkha: "ཤིང་བཟོ།", english: "Carpentry", description: "Timber joinery for dzongs, temples and houses — beams, brackets and window frames cut without nails." },
  { id: "do-zo", key: "dozo", name: "Do-zo", dzongkha: "རྡོ་བཟོ།", english: "Masonry", description: "Stone and rammed-earth walls, the load-bearing craft behind every dzong and farmhouse." },
  { id: "par-zo", key: "parzo", name: "Par-zo", dzongkha: "སྤར་བཟོ།", english: "Carving", description: "Carving in wood, slate and stone: masks, altar panels, printing blocks and mani walls." },
  { id: "lha-zo", key: "lhazo", name: "Lha-zo", dzongkha: "ལྷ་བཟོ།", english: "Painting", description: "Thangka scrolls, murals and decorative motifs painted to classical proportion in mineral pigment." },
  { id: "jin-zo", key: "jinzo", name: "Jin-zo", dzongkha: "འཇིམ་བཟོ།", english: "Clay & sculpture", description: "Clay statues, ritual objects and moulded ornament, built up over a wooden armature." },
  { id: "lug-zo", key: "lugzo", name: "Lug-zo", dzongkha: "ལུགས་བཟོ།", english: "Bronze casting", description: "Casting in bronze, brass and iron — bells, statues, cymbals and household vessels." },
  { id: "gar-zo", key: "garzo", name: "Gar-zo", dzongkha: "མགར་བཟོ།", english: "Blacksmithing", description: "Forged tools, knives, chains and farm implements, a craft centred on eastern Bhutan." },
  { id: "troe-zo", key: "troezo", name: "Troe-zo", dzongkha: "སྤྲོས་བཟོ།", english: "Gold & silversmithing", description: "Chased and filigreed silver and gold: koma clasps, jewellery, ritual vessels." },
  { id: "tsha-zo", key: "tshazo", name: "Tsha-zo", dzongkha: "ཚར་བཟོ།", english: "Bamboo & cane", description: "Split bamboo and cane woven into baskets, bangchungs, mats and quivers." },
  { id: "thag-zo", key: "thagzo", name: "Thag-zo", dzongkha: "ཐག་བཟོ།", english: "Weaving", description: "Backstrap and pedal-loom textiles — kira, gho, kisuthara silk and yathra wool." },
  { id: "tshem-zo", key: "tshemzo", name: "Tshem-zo", dzongkha: "ཚེམ་བཟོ།", english: "Tailoring & embroidery", description: "Tailoring, appliqué and embroidery, including the giant thongdrel banners." },
  { id: "shag-zo", key: "shagzo", name: "Shag-zo", dzongkha: "ཤག་བཟོ།", english: "Wood turning", description: "Bowls and cups turned from burl wood and lacquered, associated with healing properties." },
  { id: "de-zo", key: "dezo", name: "De-zo", dzongkha: "དེ་བཟོ།", english: "Paper making", description: "Desho paper made by hand from daphne and edgeworthia bark, dried on frames in the sun." }
];

export const CLIENT_VERBATIM = {
  tagline: "Towards a vibrant & sustainable handicrafts sector",
  heroPara: "Handicrafts Association of Bhutan supports local artisans in promoting their handicrafts in markets both within Bhutan and internationally, and supports skills development and capacity building of the craftspeople.",
  stats: [
    { n: "7,500", label: "Micro & small enterprises in the network" },
    { n: "5,250", label: "Women-led enterprises" },
    { n: "195", label: "Affiliated stores across Bhutan" },
    { n: "13", label: "Arts & crafts of Zorig Chusum" }
  ],
  sectionLines: {
    programs: "Change lives, build a better community",
    news: "Stay informed, stay empowered."
  },
  contactBlock: {
    address: "Metog Lam, Thimphu, Bhutan",
    office: "+975-2-338089",
    ed: "+975-77654508",
    marketing: "+975-17462636 / 17881111",
    email: "officehab@gmail.com"
  },
  partners: [
    "RGoB", "EU SWITCH-Asia", "SHINE", "GrAT", "UNDP", "SGP",
    "EIF", "Government of Canada", "Ernst & Young", "Helvetas Bhutan", "BCCI", "Bhutan Post"
  ],
  punakhaMarket: "the only authentic crafts market validated and managed by HAB"
};

export const PROGRAM_OBJECTS = [
  { ref: "a", t: "Sector Representation and Advocacy", d: "Represent and advance the collective interests of all handicrafts sector stakeholders — artisans, producers, designers, traders and service providers — before governmental, legislative, regulatory, intergovernmental and private sector bodies.", activities: ["Representation in national and subnational planning processes", "Participation in legislative and regulatory consultations", "Engagement with ministries, regulators and international forums"] },
  { ref: "b", t: "Policy Development and Intervention", d: "Engage with competent authorities on policies, laws, regulations, standards and incentive frameworks affecting the sector; submit evidence-based positions and monitor implementation of policy commitments.", activities: ["Evidence-based policy positions submitted to competent authorities", "Review of standards and incentive frameworks affecting the sector", "Monitoring of sector-relevant policy commitments"] },
  { ref: "c", t: "Trade Facilitation", d: "Facilitate domestic and international trade through trade infrastructure, standards compliance systems, market linkage mechanisms, export facilitation instruments and certification frameworks.", activities: ["Domestic and international trade fairs and exhibitions", "Export readiness programmes and trade facilitation tools", "Buyer–seller linkages and market information systems", "Certification and standards compliance support"] },
  { ref: "d", t: "Product Development", d: "Support innovation, quality enhancement, design evolution and product diversification through design interventions, technical upgradation and linkages between artisans, designers, institutions and markets.", activities: ["Design workshops and innovation programmes", "Artisan–designer collaborations", "Quality improvement initiatives", "Product development guidelines and toolkits"] },
  { ref: "e", t: "Branding and Market Development", d: "Steward a credible sector brand identity for Bhutanese handicrafts, promote authenticity and cultural value, and support distribution networks, retail channels and promotional platforms.", activities: ["Sector brand assets and stewardship", "Domestic and international marketing campaigns", "Geographical indications and certification marks", "Digital and physical promotional platforms"] },
  { ref: "f", t: "Capacity Development", d: "Strengthen productive, entrepreneurial, managerial, technical and institutional capacity through training, professional development, knowledge exchange, mentorship and peer learning.", activities: ["Craft skills, business management and financial literacy training", "Digital marketing and export procedure courses", "Study tours, peer exchanges and mentorship", "Support to training institutions and curricula"] },
  { ref: "g", t: "Cultural Heritage Stewardship", d: "Protect, document, promote and transmit the intangible cultural heritage of the Zorig Chusum; maintain a registry of authentic craft practices and producers; pursue geographical indication and certification of origin.", activities: ["Registry of authentic craft practices and producers", "Documentation of traditional craft knowledge", "Geographical indication and certification of origin", "Cooperation with national and international heritage bodies"] },
  { ref: "h", t: "Research and Knowledge Management", d: "Undertake and disseminate research, sector data, market intelligence and policy analysis to inform advocacy, programme design and the evidence base for the sector.", activities: ["Sector surveys, market studies and policy analyses", "Sector data platform", "Research reports and market intelligence briefs"] },
  { ref: "i", t: "Social Inclusion and Equity", d: "Advance equitable participation of rural artisans, women practitioners, youth, persons with disabilities and marginalised communities in the sector and in HAB's programmes, governance and services.", activities: ["Targeted participation of rural artisans and women practitioners", "Pathways for youth entering the crafts", "Access for persons with disabilities and marginalised communities"] },
  { ref: "j", t: "Financial Sustainability of the Sector", d: "Facilitate access to finance, grants, concessional credit and catalytic investment; develop financial literacy and entrepreneurship programmes; strengthen long-term viability.", activities: ["Access to grants, concessional credit and catalytic investment", "Financial literacy and entrepreneurship programmes", "Endowment Fund and resilience mechanisms"] },
  { ref: "k", t: "Partnerships and Institutional Linkages", d: "Establish and grow partnerships with national and international organisations, government agencies, development partners, research and educational institutions, the private sector and civil society.", activities: ["Partnerships with government agencies and development partners", "Linkages with research and educational institutions", "Private sector and civil society collaboration"] }
];

export const ACTIVITY_SCOPE = [
  { t: "Advocacy and Representation", items: ["Evidence-based policy advocacy", "National and subnational planning processes", "Legislative and regulatory consultations", "Engagement with ministries and international forums"] },
  { t: "Trade and Market Support", items: ["Domestic and international trade fairs", "Export readiness programmes", "Buyer–seller linkages", "Certification and standards compliance", "Market information systems"] },
  { t: "Product and Design Development", items: ["Design workshops and innovation programmes", "Artisan–designer collaborations", "Quality improvement initiatives", "Product development guidelines and toolkits"] },
  { t: "Branding and Promotion", items: ["Sector brand assets", "Domestic and international campaigns", "Digital and physical promotional platforms", "Geographical indications and certification marks"] },
  { t: "Capacity Building and Training", items: ["Craft skills and business management", "Financial literacy and digital marketing", "Export procedures", "Study tours, peer exchange, mentorship", "Training institutions and curricula"] },
  { t: "Research and Documentation", items: ["Sector surveys and market studies", "Sector data platform", "Research reports and market intelligence briefs", "Documentation of traditional craft knowledge"] },
  { t: "Membership Services and Sector Engagement", items: ["Sector Membership programme", "Annual Sector Forum and SCC meetings", "DHDC operations support", "Targeted services to Active Sector Members"] },
  { t: "Financial Resource Mobilisation", items: ["Endowment Fund management", "Grants and donations administration", "Project-based programmes", "Social enterprises under Authority approval"] },
  { t: "Governance and Compliance", items: ["Statutory registers and records", "Reports and returns to the Authority", "BCAS compliance", "Subsidiary governance instruments"] }
];

export const DELIVERY_CHAIN = [
  { n: "1", t: "Strategic Plan", d: "Adopted by the Board of Trustees and reported to the Authority. Sets the objects each programme serves." },
  { n: "2", t: "Annual Workplans", d: "Board-approved workplans convert the strategy into the year's programme activity and budget." },
  { n: "3", t: "Projects", d: "Funded projects with agreed indicators deliver the workplan, each reported against separately." },
  { n: "4", t: "Review and reporting", d: "Internal review by the Board, external reporting to the Authority, published in the annual report." }
];

export const BENEFICIARY_GROUPS = [
  "Artisans and craft practitioners", "Producers and craft enterprises", "Designers and product developers",
  "Traders, retailers and exporters", "Service providers to the sector", "Rural and informal producers",
  "Women practitioners", "Youth entering the crafts", "Persons with disabilities", "Marginalised communities"
];

export const OBJECTIVES = [
  "Improve market access for Bhutanese artisans at home, in the tourism sector and internationally.",
  "Raise product quality and consistency through training, standards and inspection.",
  "Guarantee fair compensation and prompt payment for handcrafted work.",
  "Keep the thirteen crafts of Zorig Chusum in living practice, particularly those with few practitioners.",
  "Represent the sector in policy dialogue with government and development partners.",
  "Strengthen member enterprises as businesses — costing, licensing, export documentation and finance."
];

export const VALUES = [
  { t: "Craft first", d: "Decisions are judged by whether they leave the craft, and the craftsperson, better off." },
  { t: "Fairness", d: "Agreed prices, paid upfront. No consignment risk pushed onto the artisan." },
  { t: "Inclusion", d: "Seventy percent of our network is women-led; rural and informal producers are members on equal terms." },
  { t: "Accountability", d: "Audited accounts and programme results published every year, in English and Dzongkha." },
  { t: "Sustainability", d: "Local materials, low-waste production and skills that outlive any single project." }
];

export const AOA_GOVERNANCE = {
  tiers: [
    { n: "1", tier: "Annual Sector Forum", note: "All registered Sector Members (Active and Associate). Convenes annually to review sector outcomes, validate chapter priorities, and endorse recommendations.", items: ["7,500 enterprise network", "Chapter representatives", "Sector policy dialogue"] },
    { n: "2", tier: "Board of Trustees", note: "Governing body under the Articles of Association (2026 AGM endorsed) and CSOA 2007 (as amended 2022). Fiduciary responsibility, strategic oversight, and Endowment Fund stewardship.", items: ["Chairperson", "Vice-Chairperson", "Finance & Audit Trustee", "Regional Trustees", "Zorig Chusum Specialist"] },
    { n: "3", tier: "Dzongkhag Chapters", note: "Subnational structures across Bhutan's twenty dzongkhags, organising clusters, conducting training, and aggregating regional craft output.", items: ["Regional Cluster Leads", "Dzongkhag Handicraft Committees", "Artisan Field Liaisons"] },
    { n: "4", tier: "Secretariat", note: "Led by the Executive Director, accountable to the Board of Trustees for execution of strategy, donor projects, e-shop operations, and member intake.", items: ["Executive Director", "Programmes & Projects", "Marketing & E-shop Desk", "Finance & Administration", "Membership Services"] }
  ],
  board: [
    { role: "Chairperson", name: "Name to confirm", note: "Elected master weaver · Lhuentse" },
    { role: "Vice-Chairperson", name: "Name to confirm", note: "Craft enterprise owner · Thimphu" },
    { role: "Trustee — Finance & Audit", name: "Name to confirm", note: "Chairs the finance & endowment committee" },
    { role: "Trustee — Sector Membership", name: "Name to confirm", note: "Eastern dzongkhags representative" },
    { role: "Trustee — Zorig Chusum Heritage", name: "Name to confirm", note: "Co-opted expert, Institute of Zorig Chusum" }
  ],
  team: [
    { role: "Executive Director", name: "Name to confirm", note: "+975-77654508" },
    { role: "Programmes & Projects", name: "Name to confirm", note: "Donor projects, training, M&E" },
    { role: "Marketing & E-shop", name: "Name to confirm", note: "+975-17462636" },
    { role: "Finance & Administration", name: "Name to confirm", note: "Accounts, procurement, payroll" },
    { role: "Membership Services", name: "Name to confirm", note: "Applications, directory, dues" },
    { role: "Trade Facilitation", name: "Name to confirm", note: "Export documentation, buyer liaison" }
  ],
  milestones: [
    { y: "2005", t: "HAB founded by a group of Thimphu craft producers and retailers." },
    { y: "2011", t: "Formally registered as a Civil Society Organization under the CSO Act of Bhutan 2007." },
    { y: "2016", t: "Membership passes 3,000 enterprises; first national craft bazaar held." },
    { y: "2020", t: "E-shop launched during the tourism shutdown; cash-for-craft procurement begins." },
    { y: "2024", t: "EU SWITCH-Asia project starts, moving members to resource-efficient production." },
    { y: "2026", t: "Articles of Association (AoA) endorsed at AGM; Board of Trustees and Sector Membership framework established." }
  ]
};

export interface ProductItem {
  code: string;
  name: string;
  price: number;
  priceUsd: number;
  craftKey: string;
  craftId: string;
  craftName: string;
  region: string;
  maker: string;
  desc: string;
  description: string;
  materials?: string;
  dimensions?: string;
  inStock: boolean;
  inventoryCount: number;
}

export const PRODUCTS: ProductItem[] = [
  { code: "MAS01", name: "Ritual Mask", price: 87, priceUsd: 87, craftKey: "parzo", craftId: "par-zo", craftName: "Par-zo (Carving)", region: "Trashiyangtse", maker: "Kelzang Dorji Woodworks", desc: "Hand-carved and painted mask of the kind worn in tshechu dances, cut from a single block of seasoned wood.", description: "Hand-carved and painted mask of the kind worn in tshechu dances, cut from a single block of seasoned wood.", materials: "Blue pine wood, mineral paints", dimensions: "28 × 22 × 14 cm", inStock: true, inventoryCount: 6 },
  { code: "HHB01", name: "Handheld Bag", price: 40, priceUsd: 40, craftKey: "thagzo", craftId: "thag-zo", craftName: "Thag-zo (Weaving)", region: "Lhuentse", maker: "Khoma Weavers Group", desc: "Backstrap-loom cloth in yathra-inspired stripes, lined and finished with a wooden handle.", description: "Backstrap-loom cloth in yathra-inspired stripes, lined and finished with a wooden handle.", materials: "Raw wild silk (Bura), walnut handle", dimensions: "32 × 26 cm", inStock: true, inventoryCount: 14 },
  { code: "FTB04", name: "Fruits Basket", price: 43, priceUsd: 43, craftKey: "tshazo", craftId: "tsha-zo", craftName: "Tsha-zo (Bamboo)", region: "Zhemgang", maker: "Kheng Bamboo Collective", desc: "Split bamboo woven tight enough to hold water, in the Kheng technique passed down through generations.", description: "Split bamboo woven tight enough to hold water, in the Kheng technique passed down through generations.", materials: "Wild mountain bamboo", dimensions: "24 × 24 × 12 cm", inStock: true, inventoryCount: 8 },
  { code: "LUD01", name: "Laundry Basket", price: 50, priceUsd: 50, craftKey: "tshazo", craftId: "tsha-zo", craftName: "Tsha-zo (Bamboo)", region: "Zhemgang", maker: "Kheng Bamboo Collective", desc: "Deep cane basket with a reinforced rim, sized for a household and light enough to carry full.", description: "Deep cane basket with a reinforced rim, sized for a household and light enough to carry full.", materials: "Split cane and bamboo", dimensions: "45 × 38 × 38 cm", inStock: true, inventoryCount: 5 },
  { code: "HHB10", name: "Handheld Bag (Narrow Cut)", price: 40, priceUsd: 40, craftKey: "thagzo", craftId: "thag-zo", craftName: "Thag-zo (Weaving)", region: "Lhuentse", maker: "Khoma Weavers Group", desc: "A narrower cut of the handheld bag with a plain-weave body and patterned panel.", description: "A narrower cut of the handheld bag with a plain-weave body and patterned panel.", materials: "Silk-cotton blend, brass clasp", dimensions: "28 × 22 cm", inStock: true, inventoryCount: 9 },
  { code: "SAD03", name: "Saddle Bag", price: 158, priceUsd: 158, craftKey: "thagzo", craftId: "thag-zo", craftName: "Thag-zo (Weaving)", region: "Bumthang", maker: "Chumey Yathra House", desc: "Yathra wool woven in Chumey valley, sewn into a two-pocket saddle bag with leather straps.", description: "Yathra wool woven in Chumey valley, sewn into a two-pocket saddle bag with leather straps.", materials: "100% indigenous sheep wool", dimensions: "55 × 30 cm", inStock: true, inventoryCount: 3 },
  { code: "CAM01", name: "Camera Bag", price: 50, priceUsd: 50, craftKey: "tshemzo", craftId: "tshem-zo", craftName: "Tshem-zo (Tailoring)", region: "Thimphu", maker: "Norzin Tailoring", desc: "Padded and quilted by hand, with an adjustable strap and a water-resistant inner layer.", description: "Padded and quilted by hand, with an adjustable strap and a water-resistant inner layer.", materials: "Handwoven cotton canvas", dimensions: "24 × 18 × 12 cm", inStock: true, inventoryCount: 12 },
  { code: "CUS02", name: "Cushion Cover", price: 68, priceUsd: 68, craftKey: "tshemzo", craftId: "tshem-zo", craftName: "Tshem-zo (Tailoring)", region: "Thimphu", maker: "Norzin Tailoring", desc: "Appliqué cushion cover in raw silk with hand-stitched borders.", description: "Appliqué cushion cover in raw silk with hand-stitched borders.", materials: "Wild silk, vegetable dyes", dimensions: "45 × 45 cm", inStock: true, inventoryCount: 7 },
  { code: "DAP02", name: "Wooden Bowl (Dapa)", price: 65, priceUsd: 65, craftKey: "shagzo", craftId: "shag-zo", craftName: "Shag-zo (Turning)", region: "Trashiyangtse", maker: "Yangtse Turning Works", desc: "Turned from the burl of a maple, then lacquered — the bowl form long associated with healing properties.", description: "Turned from the burl of a maple, then lacquered — the bowl form long associated with healing properties.", materials: "Turned maple burl, natural lacquer", dimensions: "16 × 16 × 8 cm", inStock: true, inventoryCount: 15 },
  { code: "DEZ01", name: "Daphne Paper Set", price: 22, priceUsd: 22, craftKey: "dezo", craftId: "de-zo", craftName: "De-zo (Paper)", region: "Punakha", maker: "Jungshi Paper Works", desc: "Sheets of desho paper made from daphne bark, sun-dried on frames. Set of ten.", description: "Sheets of desho paper made from daphne bark, sun-dried on frames. Set of ten.", materials: "Daphne shrub bark", dimensions: "A4 / 21 × 29.7 cm", inStock: true, inventoryCount: 40 },
  { code: "TRO04", name: "Silver Brooch (Koma)", price: 120, priceUsd: 120, craftKey: "troezo", craftId: "troe-zo", craftName: "Troe-zo (Smithing)", region: "Thimphu", maker: "Zorig Silversmiths", desc: "Hand-chased silver koma, the clasp traditionally worn with a kira.", description: "Hand-chased silver koma, the clasp traditionally worn with a kira.", materials: "Solid sterling silver (.925)", dimensions: "6.5 cm diameter", inStock: true, inventoryCount: 4 },
  { code: "LHA01", name: "Thangka Scroll", price: 340, priceUsd: 340, craftKey: "lhazo", craftId: "lha-zo", craftName: "Lha-zo (Painting)", region: "Paro", maker: "Sonam Thangka Studio", desc: "Mineral pigments on cotton, brocade-mounted. Painted to the proportions set out in the classical treatises.", description: "Mineral pigments on cotton, brocade-mounted. Painted to the proportions set out in the classical treatises.", materials: "Crushed minerals, 24k gold leaf, silk brocade", dimensions: "65 × 45 cm", inStock: true, inventoryCount: 2 }
];

export const SAMPLE_PRODUCTS = PRODUCTS;

export interface MemberItem {
  id?: string;
  name: string;
  craftKey: string;
  craftName?: string;
  dz: string;
  dzongkhag?: string;
  year: number;
  bio: string;
  products: string[];
  status?: string;
}

export const MEMBERS: MemberItem[] = [
  { id: "mem-01", name: "Khoma Weavers Group", craftKey: "thagzo", craftName: "Thag-zo (Weaving)", dz: "Lhuentse", dzongkhag: "Lhuentse", year: 2011, bio: "Forty-two women weaving kisuthara silk patterns on backstrap looms in Khoma village.", products: ["HHB01", "HHB10"], status: "VERIFIED" },
  { id: "mem-02", name: "Kheng Bamboo Collective", craftKey: "tshazo", craftName: "Tsha-zo (Bamboo & Cane)", dz: "Zhemgang", dzongkhag: "Zhemgang", year: 2013, bio: "Bamboo and cane baskets, bangchungs and mats from the Kheng region.", products: ["FTB04", "LUD01"], status: "VERIFIED" },
  { id: "mem-03", name: "Chumey Yathra House", craftKey: "thagzo", craftName: "Thag-zo (Weaving)", dz: "Bumthang", dzongkhag: "Bumthang", year: 2009, bio: "Yathra wool weaving in Chumey valley — blankets, jackets and saddle bags.", products: ["SAD03"], status: "VERIFIED" },
  { id: "mem-04", name: "Kelzang Dorji Woodworks", craftKey: "parzo", craftName: "Par-zo (Wood Carving)", dz: "Trashiyangtse", dzongkhag: "Trashiyangtse", year: 2015, bio: "Carving workshop producing masks, choesham panels and altar detail.", products: ["MAS01"], status: "VERIFIED" },
  { id: "mem-05", name: "Norzin Tailoring", craftKey: "tshemzo", craftName: "Tshem-zo (Tailoring)", dz: "Thimphu", dzongkhag: "Thimphu", year: 2012, bio: "Tailoring and appliqué studio working in raw silk and cotton.", products: ["CAM01", "CUS02"], status: "VERIFIED" },
  { id: "mem-06", name: "Yangtse Turning Works", craftKey: "shagzo", craftName: "Shag-zo (Wood Turning)", dz: "Trashiyangtse", dzongkhag: "Trashiyangtse", year: 2010, bio: "Lacquered dapa and phob turned from burl wood.", products: ["DAP02"], status: "VERIFIED" },
  { id: "mem-07", name: "Jungshi Paper Works", craftKey: "dezo", craftName: "De-zo (Papermaking)", dz: "Punakha", dzongkhag: "Punakha", year: 2008, bio: "Traditional desho paper from daphne and edgeworthia bark.", products: ["DEZ01"], status: "VERIFIED" },
  { id: "mem-08", name: "Zorig Silversmiths", craftKey: "troezo", craftName: "Troe-zo (Smithing)", dz: "Thimphu", dzongkhag: "Thimphu", year: 2014, bio: "Silver koma, jewellery and ritual objects, hand-chased.", products: ["TRO04"], status: "VERIFIED" },
  { id: "mem-09", name: "Sonam Thangka Studio", craftKey: "lhazo", craftName: "Lha-zo (Painting)", dz: "Paro", dzongkhag: "Paro", year: 2007, bio: "Thangka painting to classical proportion, mineral pigments only.", products: ["LHA01"], status: "VERIFIED" }
];

export const SAMPLE_MEMBERS = MEMBERS;

export interface PublicationItem {
  id: string;
  kind: string;
  category: string;
  title: string;
  year: number;
  meta: string;
  pages: number;
  fileSize: string;
  isFeatured: boolean;
}

export const PUBLICATIONS: PublicationItem[] = [
  { id: "pub-01", kind: "Annual report", category: "Annual report", title: "Annual Report 2025", year: 2026, meta: "PDF · 4.2 MB · English & Dzongkha", pages: 68, fileSize: "4.2 MB", isFeatured: true },
  { id: "pub-02", kind: "Strategy", category: "Strategy", title: "Five-Year Strategic Plan 2026–2030", year: 2026, meta: "PDF · 3.6 MB · Board approved", pages: 52, fileSize: "3.6 MB", isFeatured: true },
  { id: "pub-03", kind: "Sector study", category: "Sector study", title: "Zorig Chusum Value Chain Assessment", year: 2025, meta: "PDF · 2.8 MB · 96 pages", pages: 96, fileSize: "2.8 MB", isFeatured: true },
  { id: "pub-04", kind: "Accounts", category: "Accounts", title: "Audited Financial Statements 2025", year: 2026, meta: "PDF · 1.1 MB · Independent auditor", pages: 34, fileSize: "1.1 MB", isFeatured: true },
  { id: "pub-05", kind: "Catalogue", category: "Catalogue", title: "HAB Product Catalogue 2026", year: 2026, meta: "PDF · 18.4 MB · 120 products", pages: 120, fileSize: "18.4 MB", isFeatured: false },
  { id: "pub-06", kind: "Policy brief", category: "Policy brief", title: "Craft Sector Tax and Licensing: A Note for Policymakers", year: 2025, meta: "PDF · 640 KB · 12 pages", pages: 12, fileSize: "640 KB", isFeatured: false },
  { id: "pub-07", kind: "Guideline", category: "Guideline", title: "Natural Dye Handbook for Weavers", year: 2025, meta: "PDF · 6.2 MB · Illustrated", pages: 84, fileSize: "6.2 MB", isFeatured: false },
  { id: "pub-08", kind: "Training manual", category: "Training manual", title: "Costing and Pricing for Craft Enterprises", year: 2025, meta: "PDF · 2.1 MB · Workbook", pages: 40, fileSize: "2.1 MB", isFeatured: false }
];

export interface NewsEventItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
}

export const NEWS_EVENTS: NewsEventItem[] = [
  { id: "news-01", title: "Trade facilitation desk opens for the autumn export season", excerpt: "Members can now book one-to-one sessions on export documentation, EMS rates and commercial invoicing at the HAB office in Thimphu.", category: "Programs", date: "28 Aug 2026" },
  { id: "news-02", title: "Natural dye training concludes in Lhuentse", excerpt: "Twenty-six weavers from Khoma and Gangzur completed a ten-day course on madder, indigo and lac dye preparation.", category: "Artisan support", date: "14 Aug 2026" },
  { id: "news-03", title: "Zorig Chusum craft bazaar returns to Clock Tower Square", excerpt: "Forty member enterprises will exhibit across three days, with live demonstrations from each of the thirteen crafts.", category: "Events", date: "02 Aug 2026" },
  { id: "news-04", title: "Annual report 2025 available to download", excerpt: "Sector figures, programme outcomes and audited accounts for the year, published in English and Dzongkha.", category: "Publications", date: "19 Jul 2026" }
];

export interface ProjectItem {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'current' | 'past';
  title: string;
  name: string;
  partner: string;
  donor: string;
  period: string;
  budget: string;
  funding: string;
  progress: number;
  summary: string;
}

export const PROJECTS: ProjectItem[] = [
  { id: "proj-01", status: "ACTIVE", title: "Sustainable Bhutanese Handicrafts (SWITCH-Asia)", name: "Sustainable Bhutanese Handicrafts (SWITCH-Asia)", partner: "EU SWITCH-Asia · with GrAT and SHINE", donor: "EU SWITCH-Asia", period: "2024 – 2027", budget: "EUR 1.4 m", funding: "EUR 1,400,000", progress: 62, summary: "Shifting member enterprises to resource-efficient production: natural dyes, waste reduction and cleaner finishing." },
  { id: "proj-02", status: "ACTIVE", title: "Market Access for Rural Artisans", name: "Market Access for Rural Artisans", partner: "Enhanced Integrated Framework (EIF)", donor: "EIF / WTO", period: "2025 – 2027", budget: "USD 620,000", funding: "USD 620,000", progress: 38, summary: "Connecting rural producer groups to export buyers through the HAB e-shop, trade fairs and consolidated EMS shipping." },
  { id: "proj-03", status: "ACTIVE", title: "Women in Craft Enterprise (WICE)", name: "Women in Craft Enterprise (WICE)", partner: "Government of Canada", donor: "Global Affairs Canada", period: "2023 – 2026", budget: "CAD 480,000", funding: "CAD 480,000", progress: 84, summary: "Business skills, financial literacy and peer mentorship for women artisans in eastern and southern dzongkhags." }
];
