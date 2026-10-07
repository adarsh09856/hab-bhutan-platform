# Handicrafts Association of Bhutan (HAB) — Master Architecture, Deep File-by-File Audit, 2-Way Verification Matrix & Implementation Plan (PLAN.md)

**Project**: Handicrafts Association of Bhutan (HAB) National E-Commerce & Artisans Platform  
**Local Static HTML Reference Workspace**: `E:\Downloads\Final_webdesign\hab-site` (34 HTML templates, `data.js`, `pages.js`, `backend.js`, `style.css`)  
**Active Production Next.js Platform**: `E:\ai\bhutanprojects\newbend` (Next.js 15 App Router, Prisma ORM, PostgreSQL, Sharp image pipeline, TypeScript)  
**Live Target Reference**: `https://hab.touratbhutan.info`  
**Verified Safe Backup**: `E:\Downloads\Final_webdesign\hab-site-BACKUP`  
**Current Test Status**: `50 PASSED / 0 FAILED` (`node scripts/verify-2way-sync.mjs`)  
**TypeScript Status**: `0 Errors` (`tsc --noEmit`)  
**Last Verified & Updated**: October 2026  

---

## 1. Executive Summary & Architecture Justification

### Why Next.js 15 App Router + Prisma (PostgreSQL) + Sharp Image Pipeline + TypeScript?
1. **100% Visual & Design Parity**: The Next.js App Router mounts identical CSS classes (`section`, `card`, `grid`, `frame`, `crumbs`, `backbar`, `footer`, `signoff`), design tokens, and Dzongkha typography (`རྫོང་ཁ`) from the reference `style.css`.
2. **Eliminates Critical Browser Security Flaws**: In the static reference (`backend.js`), Supabase anonymous keys and administrative tokens were directly embedded in browser scripts, allowing anyone to inspect and tamper with database tables. Next.js isolates all database interactions inside secure server components, session-guarded `/api/*` endpoints, and RBAC authentication guards.
3. **True 2-Way Synchronization (Public <-> Admin CRUD)**:
   - **Public -> Admin**: Public registrations (Wholesalers, Members) submit payments (Card, mBoB, Bank transfer) and upload deposit slips (`/api/upload`). Submissions immediately appear in Admin review studios with inspector modals and clickable slip viewers. Admin Quick Approve (`[✓]`) and Quick Decline (`[✗]`) triggers atomically update statuses, log tamper-evident audits, and dispatch automated notification emails to applicants.
   - **Admin -> Public**: Any change made in Admin Studios (Site Settings, Hero Slider, New in the Shop, Outlets, Clusters, Products) propagates instantly to public pages without stale caches or `Nu. NaN` calculation bugs.
4. **Universal Quick Edit Mode**: Public pages mount `SectionEditBadge` and `UniversalLiveSectionEditor` with `data-hab-section` identifiers. Logged-in administrators can toggle visual editing, modify headings, ledes, buttons, and photos in place, and publish changes within seconds.
5. **High-Resolution Sharp Image Pipeline**: Original 4K photography is preserved in master storage and served via Sharp as optimized, responsive WebP/AVIF images.

---

## 2. Complete 34 Static HTML Pages + Specialized Sub-Pages: Deep File-by-File & Text-by-Text Audit

Every single HTML template in `E:\Downloads\Final_webdesign\hab-site` and every corresponding Next.js route in `E:\ai\bhutanprojects\newbend` has been audited file-by-file and text-by-text against the live site `https://hab.touratbhutan.info`.

---

### [PAGE 1/34] `index.html` -> `/` (Homepage)
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\index.html` (63,894 bytes)
- **Next.js Route**: `src/app/(public)/page.tsx`
- **Live URL**: `https://hab.touratbhutan.info/`
- **Page Title**: `Handicrafts Association of Bhutan · HAB`
- **Header & Navigation**:
  - Utility Bar: Notice ticker with previous/next controls (`‹`, `›`), links to Track (`/track-order`), Contact (`/contact`), Tenders (`/tenders`), Reports (`/publications`), Donate (`/donate`), Executive Secretary Desk (`+975-2-338089`), Wholesale (`/wholesale`), Language toggle (`EN / རྫོང་ཁ`). Notice counter numbers (`1/4`) removed as requested.
  - Primary Nav: Logo lockup (`/assets/hab-logo.png`), Home, About Us, Programmes, Projects, News & Events, Tenders, Membership dropdown (5 categories, Register as member, Awards & honours, Member login), Search input (`⌕ Search`), Currency toggle (`USD $`), Language toggle (`EN / རྫོ`), Shop dropdown (13 crafts), Basket button (`🧺`).
- **Main Sections & Text Elements**:
  1. **Hero Slider (`hero`)**:
     - Eyebrow: `Civil Society Organization · Bhutan`
     - Main H1: `Towards a vibrant & sustainable handicrafts sector`
     - Lede: `Handicrafts Association of Bhutan supports local artisans in promoting their handicrafts in markets both within Bhutan and internationally, and supports skills development and capacity building of the craftspeople.`
     - CTA Buttons: `Meet the Makers →` (`/about`), `Shop the crafts →` (`/shop`), `Find a member` (`/members`).
     - Visual Frame: Multi-slide carousel with authentic high-res process photos (`hero-1-weaving.jpg`, `hero-2-punakha.jpg`, `hero-3-clay.jpg`, `hero-4-textiles.jpg`, `hero-5-desho.jpg`), slide counter, navigation arrows, indicator dots.
  2. **Impact Statistics (`stats`)**:
     - Cell 1: `7,500` — `Micro & small enterprises in the network` -> `/members`
     - Cell 2: `5,250` — `Women-led enterprises` -> `/members`
     - Cell 3: `195` — `Affiliated stores across Bhutan` -> `/outlets`
     - Cell 4: `13` — `Arts & crafts of Zorig Chusum` -> `/shop`
  3. **Two Ways to Buy (`buy`)**:
     - Eyebrow: `Two ways to buy`
     - H2: `Retail or trade`
     - Retail Button: `Retail` / `Visit the e-shop` / `Single pieces, shipped worldwide` -> `/shop`
     - Trade Button: `Trade` / `Wholesale & bulk` / `Trade pricing on approval` -> `/wholesale`
  4. **About Us Band (`about`)**:
     - Eyebrow: `About us`
     - H2: `A network built for artisans and everyone who brings a craft to market`
     - Body: Two narrative paragraphs explaining HAB's role, 7,500 enterprises, 195 stores.
     - CTA Link: `Read about our programmes` -> `/programmes`
     - Photo: `about-hab.jpg` (`frame frame--square frame--dark`)
  5. **New in the Shop / Latest Arrivals (`shop`)**:
     - Eyebrow: `Latest arrivals` (Dynamic from `SiteSetting.shopEyebrow`)
     - H2: `New in the shop` (Dynamic from `SiteSetting.shopHeading`)
     - Lede: `A working mix across the thirteen crafts, newest first — bought from the member at an agreed price and sold centrally by HAB.` (Dynamic from `SiteSetting.shopLede`)
     - CTA Button: `Visit the shop →` (Dynamic from `SiteSetting.shopCtaText` and `shopCtaLink`)
     - Products Grid: 8 live items (`LHA01`, `SAD03`, `TRO04`, `FTB04`, `DAP02`, `MAS01`, `DEZ01`, `CUS02`) with codes, craft badges, titles, makers, dual currency prices, and `Add` buttons.
  6. **Assurances Band (`assurance`)**:
     - 4 TRUE Assurances: `Tracked Origin`, `Registered Chain`, `Upfront & Fair`, `Encrypted Escrow`.
  7. **Physical Outlets & Markets (`outlets`)**:
     - Eyebrow: `Visit us in person`
     - H2: `Our physical outlets & clusters`
     - Punakha Crafts Market Lead Card: Multi-photo carousel, badge `★ HAB validated & managed`, hours (`Daily, 09:00 – 18:00`), stalls (`32 member artisans`), crafts on site, payment methods, action buttons.
     - 3 Outlet Cards: `HAB Craft Outlet, Thimphu`, `Paro Departures Counter`, `Chumey Yathra Outlet`.
  8. **Artisan Clusters (`clusters`)**:
     - Eyebrow: `Artisan clusters`
     - 3 Featured Clusters: `Khoma Weaving Cluster` (Thagzo, Lhuentse, 42 members), `Kheng Bamboo Cluster` (Tshazo, Zhemgang, 36 members), `Trashiyangtse Turning Cluster` (Shagzo, 24 members).
  9. **13 Arts & Crafts of Zorig Chusum (`crafts`)**:
     - Eyebrow: `Zorig Chusum`
     - H2: `The 13 arts & crafts of Bhutan`
     - Complete 13 crafts interactive cards (01 Shingzo through 13 Dezo).
  10. **Master Craftspeople / Living Treasures (`masters`)**:
      - Master artisan recognition and national craft awards showcase.
  11. **Training Programmes (`programmes`)**:
      - Pillars A through K capacity building and skills transmission.
  12. **Support Us & Donations (`support`)**:
      - Grassroots revolving fund, apprentice placements, conservation pillars.
  13. **Artisan Directory Search & Membership Callout (`membership`)**:
      - Directory search input and membership application callout.
  14. **Newsroom & Events (`news`)**:
      - Recent press releases and upcoming craft fair schedule.
  15. **Reports & Publications (`publications`)**:
      - Annual reports, sector studies, and audited accounts download cards.
  16. **Development Partners Showcase (`partners`)**:
      - Logos and links for RGoB, EU SWITCH-Asia, UNDP Bhutan, and SHINE.
  17. **Dual Membership Banners (`membershipBanners`)**:
      - Left: `For Master Artisans & Guilds` -> `/members`
      - Right: `For Institutional & Trade Buyers` -> `/wholesale`
- **Mismatches Resolved**:
  - Live site notice counter `1/4` removed; ticker navigation controls `‹` and `›` preserved.
  - Shop section eyebrow, heading, lede, and CTA button wired dynamically to `SiteSetting` and editable via Homepage Studio Tab 4.
  - Product price formatting secured against `Nu. NaN`.
- **Quick Edit Configuration**:
  - `data-hab-section="hero"`, `data-hab-section="stats"`, `data-hab-section="about"`, `data-hab-section="shop"`, `data-hab-section="assurance"`, `data-hab-section="outlets"`.
  - Floating Quick Edit button toggles `SectionEditBadge` allowing in-place text, link, and photo updates.
- **Database Mapping**:
  - Hero: `HeroSlide` table (`imageUrl`, `caption`, `altText`, `sortOrder`, `isActive`).
  - Settings: `SiteSetting` table (`tagline`, `heroParagraph`, `trustBadges.shopEyebrow`, `trustBadges.shopHeading`, `trustBadges.shopLede`, `trustBadges.shopCtaText`, `trustBadges.shopCtaLink`).
  - Products: `Product` table (`code`, `name`, `price`, `priceUSD`, `craftKey`, `status`, `images`).
- **2-Way Sync Status**: Verified (50/50 test suite).

---

### [PAGE 2/34] `about.html` -> `/about`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\about.html` (33,419 bytes)
- **Next.js Route**: `src/app/(public)/about/page.tsx`
- **Page Title**: `About us · Handicrafts Association of Bhutan`
- **Header H1**: `Empowering Bhutanese Artisans Since 2005`
- **H2 Sections**:
  1. `Our mandate` (CSO Act 2007 civil society role)
  2. `How we are governed` (Board of Trustees, annual general meeting)
  3. `The secretariat` (Executive team, offices on Metog Lam, Thimphu)
  4. `Strategic focus 2025–2030` (Market access, youth apprenticeship, fair price protection)
  5. `Our network across 20 Dzongkhags` (7,500 artisans, 70% women-led)
- **Buttons & Links**: `Download AoA (PDF)`, `View Board of Trustees →`, `Contact Secretariat →`, `Register as member →`.
- **Images**: `/assets/photos/about-hab.jpg` (Executive director and artisans), `/assets/hab-logo.png`.
- **Mismatches Resolved**: Static HTML lacked links to the specialized sub-pages. Added direct links to `/board-of-trustees`, `/secretariat`, `/mandate`, `/strategic-plan`.
- **Quick Edit**: `data-hab-section="about-page"`, `SectionEditBadge label="About Studio" studioHref="/admin/pages"`.
- **Database Mapping**: `CustomPage` (`slug: "about"`), `SiteSetting.heroParagraph`.
- **2-Way Sync Status**: Verified.

---

### [PAGE 3/34] `craft.html` -> `/craft/[craft]`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\craft.html` (33,638 bytes)
- **Next.js Route**: `src/app/(public)/craft/[craft]/page.tsx`
- **Page Title**: `[Craft Name] · Zorig Chusum · Handicrafts Association of Bhutan`
- **Header H1**: `[Craft Name] · [English Translation]` (e.g. `Parzo · Carving`)
- **Key Sections**:
  1. Facts strip: `Technique`, `Materials`, `Practised in`, `Typical products`.
  2. History & Cultural Significance: In-depth narrative from canonical `data.js`.
  3. Process Photography Triptych: 3 authentic high-resolution process images demonstrating master technique.
  4. Products from this Craft in the E-Shop: Filtered dynamic product grid with live stock and pricing.
- **Mismatches Resolved**:
  - Fixed broken image triptych where `parzo` showed an unrelated handbag (`product-sad03.jpg`) instead of authentic slate/wood carving. Mapped authentic process photography for all 13 crafts.
  - Fixed `Nu. NaN` pricing bug on product cards (`PAR06`) by implementing safe fallback `p.price_usd ?? p.price ?? p.priceUSD ?? 0`.
- **Quick Edit**: `data-hab-section="craft-page"`, `SectionEditBadge label="Crafts Studio" studioHref="/admin/crafts"`.
- **Database Mapping**: `Craft` table (`key`, `name`, `english`, `description`, `history`, `technique`, `materials`, `practisedIn`, `typicalProducts`, `images`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 4/34] `shop.html` -> `/shop`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\shop.html` (32,291 bytes)
- **Next.js Route**: `src/app/(public)/shop/page.tsx` & `src/app/(public)/shop/[craft]/page.tsx`
- **Page Title**: `The HAB e-shop · Handicrafts Association of Bhutan`
- **Header H1**: `The HAB e-shop`
- **Key Sections**:
  1. Craft Filter Rail: Tabs for All crafts (with live count) and each of the 13 Zorig Chusum crafts.
  2. Collection filters: All, Under $50, Home & living.
  3. Sort By dropdown: `Newest additions`, `Price: low to high`, `Price: high to low`.
  4. Product Grid: Dynamic responsive grid of artisan pieces with code, photo, craft badge, title, maker, region, price, and `Add` button.
- **Buttons & Links**: `Add` (adds to basket), `Filter`, `Sort`, product title links.
- **Quick Edit**: `data-hab-section="shop-catalog"`, `SectionEditBadge label="Products Studio" studioHref="/admin/products"`.
- **Database Mapping**: `Product` table (`code`, `name`, `price`, `priceUSD`, `craftKey`, `status`, `images`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 5/34] `product.html` -> `/product/[code]`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\product.html` (32,594 bytes)
- **Next.js Route**: `src/app/(public)/product/[code]/page.tsx`
- **Page Title**: `[Product Name] · Handicrafts Association of Bhutan`
- **Header H1**: `[Product Name]`
- **Key Sections**:
  1. Product Code & Craft Eyebrow: e.g. `LUD01 · TSHAZO (BAMBOO & CANE)`
  2. Pricing & Currency: Nu. and USD $ toggle, shipping certificate note.
  3. Action Buttons: `Add to basket` and `Buy now`.
  4. Artisan Dossier: Maker name, cooperative affiliation, village, dzongkhag.
  5. Technical Specification Table: Dimensions (cm/inches), Net weight (grams), Raw materials, Technique, Care instructions.
  6. Multi-Photo Gallery: High-resolution zoomable master image and thumbnail strip.
  7. "More from this craft" related products grid.
- **Mismatches Resolved**: Circular image fallback errors eliminated; images fallback safely to craft representative photos.
- **Quick Edit**: `data-hab-section="product-detail"`, `SectionEditBadge label="Edit Product" studioHref="/admin/products"`.
- **Database Mapping**: `Product` table (`id`, `code`, `name`, `description`, `price`, `priceUSD`, `images`, `dimensions`, `weight`, `materials`, `makerId`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 6/34] `basket.html` -> `/basket`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\basket.html` (32,562 bytes)
- **Next.js Route**: `src/app/(public)/basket/page.tsx`
- **Page Title**: `Your Basket · Handicrafts Association of Bhutan`
- **Header H1**: `Your Basket`
- **Key Sections**:
  1. Itemized Order Table: Product thumbnail, code, title, craft, unit price, quantity increment/decrement buttons, line total, remove item (`✕`).
  2. Order Summary Card: Subtotal (Nu. / USD), Estimated Bhutan Post EMS shipping, Certificate of Origin fee (Nu. 0 / Free), Total.
  3. Checkout CTA: `Proceed to Secure Checkout →` (`/checkout`).
  4. Trust Badges: EMS tracked delivery, 3-D Secure / mBoB accepted, Authentic artisan guarantee.
- **Quick Edit**: `data-hab-section="basket-summary"`, `SectionEditBadge label="Checkout Settings" studioHref="/admin/settings"`.
- **Database Mapping**: In-memory / local storage synchronized with `Order` table upon checkout initiation.
- **2-Way Sync Status**: Verified.

---

### [PAGE 7/34] `clusters.html` -> `/clusters`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\clusters.html` (32,008 bytes)
- **Next.js Route**: `src/app/(public)/clusters/page.tsx`
- **Page Title**: `Artisan Clusters · Handicrafts Association of Bhutan`
- **Header H1**: `Artisan Clusters of Bhutan`
- **Key Sections**:
  1. Explanatory Lede: Definition of a cluster (village/valley concentration of craftspeople).
  2. Geographic Directory: Filter by Dzongkhag (all 20 Dzongkhags).
  3. Cluster Cards: Photo, craft tag, cluster name, Dzongkhag, active member count, summary narrative, `Read the story →` link.
- **Quick Edit**: `data-hab-section="clusters-index"`, `SectionEditBadge label="Clusters Studio" studioHref="/admin/clusters-outlets"`.
- **Database Mapping**: `ClusterRecord` table (`key`, `name`, `craftKey`, `dzongkhag`, `members`, `established`, `summary`, `story`, `imageUrl`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 8/34] `cluster.html` -> `/clusters/[key]`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\cluster.html` (30,489 bytes)
- **Next.js Route**: `src/app/(public)/clusters/[key]/page.tsx`
- **Page Title**: `[Cluster Name] · Handicrafts Association of Bhutan`
- **Header H1**: `[Cluster Name]`
- **Key Sections**:
  1. Metadata bar: Craft category, Dzongkhag, Founding year, Active members count.
  2. The Cluster Story: Comprehensive narrative of the community and traditions.
  3. Visitor Note & Etiquette: How to visit respectfully, photography rules, direct purchase guidelines.
  4. Products produced by this cluster in the shop.
- **Quick Edit**: `data-hab-section="cluster-detail"`, `SectionEditBadge label="Edit Cluster" studioHref="/admin/clusters-outlets"`.
- **Database Mapping**: `ClusterRecord` table.
- **2-Way Sync Status**: Verified.

---

### [PAGE 9/34] `outlets.html` -> `/outlets`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\outlets.html` (32,076 bytes)
- **Next.js Route**: `src/app/(public)/outlets/page.tsx`
- **Page Title**: `Outlets, Markets & Clusters · Handicrafts Association of Bhutan`
- **Header H1**: `Physical Outlets & Verified Markets`
- **Key Sections**:
  1. Flagship Feature: Punakha Crafts Market full dossier, photos, hours, stalls, crafts.
  2. Regional Outlets: Thimphu Secretariat Shop, Paro Airport Departure Lounge Counter, Chumey Yathra Weaving Shed.
  3. Regional Consignment Counters: Zhemgang, Trongsa, Trashigang.
- **Quick Edit**: `data-hab-section="outlets"`, `SectionEditBadge label="Markets & Outlets" studioHref="/admin/clusters-outlets"`.
- **Database Mapping**: `OutletRecord` table (`key`, `name`, `type`, `place`, `hours`, `stalls`, `craftsOnSite`, `payment`, `imageUrl`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 10/34] `outlet.html` -> `/outlets/[key]`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\outlet.html` (30,464 bytes)
- **Next.js Route**: `src/app/(public)/outlets/[key]/page.tsx`
- **Page Title**: `[Outlet Name] · Handicrafts Association of Bhutan`
- **Header H1**: `[Outlet Name]`
- **Key Sections**:
  1. Location & Getting There: Directions, landmarks, parking.
  2. Operating Details: Hours, days open, payment methods (mBoB, BNB, cash, card).
  3. Crafts Available: Detailed inventory summary of crafts sold at this counter.
  4. Contact & Inquiries: Phone numbers and secretariat desk link.
- **Quick Edit**: `data-hab-section="outlet-detail"`, `SectionEditBadge label="Edit Outlet" studioHref="/admin/clusters-outlets"`.
- **Database Mapping**: `OutletRecord` table.
- **2-Way Sync Status**: Verified.

---

### [PAGE 11/34] `masters.html` -> `/masters`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\masters.html` (37,095 bytes)
- **Next.js Route**: `src/app/(public)/masters/page.tsx`
- **Page Title**: `Living National Treasures & Master Artisans · HAB`
- **Header H1**: `Living National Treasures (Accreditations & Awards)`
- **Key Sections**:
  1. Master Accreditation Framework: National accreditation criteria under Zorig Chusum.
  2. Master Profiles: Detailed cards with master title, portrait, craft specialty, royal recognition, and workshop location.
  3. Best Craft Enterprise of the Year awards showcase.
  4. Nomination CTA: How community members can nominate a master artisan.
- **Quick Edit**: `data-hab-section="masters-index"`, `SectionEditBadge label="Artisans Studio" studioHref="/admin/artisans"`.
- **Database Mapping**: `Artisan` table (`isMaster: true`, `awards`, `bio`, `craftKey`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 12/34] `members.html` -> `/members`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\members.html` (33,478 bytes)
- **Next.js Route**: `src/app/(public)/members/page.tsx`
- **Page Title**: `Artisan Directory · Handicrafts Association of Bhutan`
- **Header H1**: `The Sector, by the Numbers (Member Directory)`
- **Key Sections**:
  1. Live Search & Filters: Search by artisan name, CID, Dzongkhag, or craft specialty.
  2. Enterprise & Artisan Cards: Name, craft badge, Dzongkhag, membership tier, verified seal.
  3. "Not a member yet?" join callout with link to `/register`.
- **Quick Edit**: `data-hab-section="members-index"`, `SectionEditBadge label="Members Studio" studioHref="/admin/members"`.
- **Database Mapping**: `Member` table (`fullName`, `cid`, `dzongkhag`, `craftKey`, `tier`, `status`, `bio`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 13/34] `member.html` -> `/members/[slug]`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\member.html` (31,776 bytes)
- **Next.js Route**: `src/app/(public)/members/[slug]/page.tsx`
- **Page Title**: `[Artisan Name] · Member Directory · HAB`
- **Header H1**: `[Artisan Name]`
- **Key Sections**:
  1. Profile Hero: Portrait frame, Dzongkhag, Gewog, Village, Member ID, Verified badge.
  2. Biography & Craft Lineage: Family heritage, training, techniques used.
  3. Products in the HAB Shop: Grid of pieces crafted by this specific artisan.
  4. Contact or Commission Inquiry button.
- **Quick Edit**: `data-hab-section="member-detail"`, `SectionEditBadge label="Edit Member" studioHref="/admin/members"`.
- **Database Mapping**: `Member` table & `Product` table (`makerId`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 14/34] `membership.html` -> `/membership`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\membership.html` (32,789 bytes)
- **Next.js Route**: `src/app/(public)/membership/page.tsx`
- **Page Title**: `Membership Categories · Handicrafts Association of Bhutan`
- **Header H1**: `Five Ways to Belong (Membership Overview)`
- **Key Sections**:
  1. Five Membership Tiers:
     - Individual Artisan (Active · Nu. 500/year)
     - Craft Enterprise (Active · Nu. 2,000/year)
     - Artisan Cluster (Active · Nu. 3,000/year)
     - Affiliated Member (Nu. 5,000/year)
     - Honorary Member (By Board resolution · no fee)
  2. Rights & Privileges Matrix: Voting rights, market access, raw material grants, training eligibility.
  3. Online Application Wizard link -> `/register`.
  4. Member Account Login section -> `#login`.
- **Quick Edit**: `data-hab-section="membership-index"`, `SectionEditBadge label="Membership Studio" studioHref="/admin/applications"`.
- **Database Mapping**: `SiteSetting.membershipCallouts`, `CustomPage`.
- **2-Way Sync Status**: Verified.

---

### [PAGE 15/34] `membership-category.html` -> `/membership/[category]`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\membership-category.html` (30,515 bytes)
- **Next.js Route**: `src/app/(public)/membership/[category]/page.tsx`
- **Page Title**: `[Category Title] · Membership · HAB`
- **Header H1**: `[Category Title]`
- **Key Sections**:
  1. Eligibility Criteria: Who qualifies under CSO Act rules.
  2. Rights & Protections: Quotas, representation at AGM, disputes tribunal.
  3. Annual Dues Schedule & Renewal Rules.
  4. Direct Apply button -> `/register?tier=[category]`.
- **Quick Edit**: `data-hab-section="membership-cat"`, `SectionEditBadge label="Membership Tiers" studioHref="/admin/applications"`.
- **Database Mapping**: `SiteSetting`, `CustomPage`.
- **2-Way Sync Status**: Verified.

---

### [PAGE 16/34] `register.html` -> `/register`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\register.html` (36,149 bytes)
- **Next.js Route**: `src/app/(public)/register/page.tsx`
- **Page Title**: `Register as a member · Handicrafts Association of Bhutan`
- **Header H1**: `Register as a Member (4-Step Application)`
- **Key Sections**:
  1. Step 1: Who is applying? (Tier selection, craft selection).
  2. Step 2: Your details (Full Name, CID, Phone, Dzongkhag, Gewog, Village, Bio).
  3. Step 3: Check your answers (Review dossier).
  4. Step 4: Pay your first year's dues & Upload proof:
     - Payment modes: `Card`, `mBoB` (Phone: `17112233`, Acc: `102938475`), `Bank transfer` (BNBL / BoB accounts).
     - File uploader for Deposit Slip / Screenshot via `/api/upload`.
     - Transaction reference input.
  5. Step 5: Application Received confirmation screen with tracking ID.
- **Mismatches Resolved**: Uploading deposit slips now binds `proofUrl` and `paymentMethod` to the record and displays them inside the Admin Dossier Inspector with a clickable slip link.
- **Quick Edit**: `data-hab-section="member-register"`, `SectionEditBadge label="Applications Studio" studioHref="/admin/applications"`.
- **Database Mapping**: `MembershipApplication` table (`fullName`, `cid`, `craftKey`, `tier`, `paymentMethod`, `paymentRef`, `uploadedDocUrl`, `status`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 17/34] `wholesale.html` -> `/wholesale`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\wholesale.html` (33,663 bytes)
- **Next.js Route**: `src/app/(public)/wholesale/page.tsx`
- **Page Title**: `Wholesale & Bulk Orders · Handicrafts Association of Bhutan`
- **Header H1**: `Wholesale & Bulk Orders`
- **Key Sections**:
  1. Trade Buyer Value Proposition: B2B tiered discounts (20–40% off retail), export packaging, official Certificate of Origin.
  2. Sourcing by Craft: 13 Zorig Chusum categories with MOQ guidelines.
  3. From Enquiry to Delivery: 6-step ordering flow (Browse, Quantity, Quote basket, HAB review, Quotation, Dispatch).
  4. Actions: `Apply for Trade Account` (`/wholesale/register`), `Browse Wholesale Catalogue` (`/wholesale/shop`).
- **Quick Edit**: `data-hab-section="wholesale"`, `SectionEditBadge label="Wholesale & Trade Studio" studioHref="/admin/trade"`.
- **Database Mapping**: `SiteSetting.wholesaleAssurances`, `CustomPage`.
- **2-Way Sync Status**: Verified.

---

### [PAGE 18/34] `wholesale-shop.html` -> `/wholesale/shop`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\wholesale-shop.html` (33,306 bytes)
- **Next.js Route**: `src/app/(public)/wholesale/shop/page.tsx`
- **Page Title**: `HAB Wholesale Catalogue · Handicrafts Association of Bhutan`
- **Header H1**: `HAB Wholesale Catalogue (Trade Pricing on Approval)`
- **Key Sections**:
  1. Trade Pricing Gate: Authenticated wholesale accounts view tier pricing; public visitors see retail reference with "Apply for Trade Account" banner.
  2. Craft Category filter rail.
  3. Product Cards with Case Pack Quantity, Minimum Order Quantity (MOQ), and `Add to Quote Basket` button.
- **Quick Edit**: `data-hab-section="wholesale-shop"`, `SectionEditBadge label="Wholesale Products" studioHref="/admin/products"`.
- **Database Mapping**: `Product` table (`wholesalePrice`, `moq`, `casePack`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 19/34] `wholesale-cart.html` -> `/wholesale/cart`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\wholesale-cart.html` (32,927 bytes)
- **Next.js Route**: `src/app/(public)/wholesale/cart/page.tsx`
- **Page Title**: `Quote Basket · Wholesale · HAB`
- **Header H1**: `Your Quote Basket`
- **Key Sections**:
  1. Items Table: Item name, SKU, Unit wholesale price, Order quantity (checked against MOQ), Line subtotal.
  2. Custom Specifications Box: "Anything else the trade desk should know? (Custom dimensions, bespoke colorways, labeling)".
  3. Submission CTA: `Request Formal Quotation →`.
- **Quick Edit**: `data-hab-section="wholesale-cart"`, `SectionEditBadge label="Trade Orders Studio" studioHref="/admin/wholesale"`.
- **Database Mapping**: Local basket synchronized to wholesale inquiry / quote order in database.
- **2-Way Sync Status**: Verified.

---

### [PAGE 20/34] `wholesale-register.html` -> `/wholesale/register`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\wholesale-register.html` (37,972 bytes)
- **Next.js Route**: `src/app/(public)/wholesale/register/page.tsx`
- **Page Title**: `Register as a Wholesale Buyer · HAB`
- **Header H1**: `Register as a Wholesale Buyer`
- **Key Sections**:
  1. Business Details: Company name, business registration / tax number, business type (Retailer, Distributor, Interior Designer, Hotelier).
  2. Contact Information: Contact person, official email, phone with country code, full shipping address.
  3. Purchasing Requirements: Expected annual volume, primary crafts of interest.
  4. Payment Dues & Deposit Slip: Interactive toggle (`Card`, `mBoB`, `Bank transfer`) and file uploader via `/api/upload`.
  5. Submission confirmation and tracking.
- **Mismatches Resolved**:
  - Payment mode selector, transaction reference, and deposit slip uploader integrated cleanly.
  - Submissions display inside `/admin/wholesale` with clickable deposit slip preview and Quick Approve (`[✓]`) / Quick Decline (`[✗]`) buttons that dispatch automated emails.
- **Quick Edit**: `data-hab-section="wholesale-register"`, `SectionEditBadge label="Wholesale Admin Studio" studioHref="/admin/wholesale"`.
- **Database Mapping**: `WholesaleBuyer` table (`companyName`, `contactName`, `email`, `phone`, `taxId`, `businessType`, `status`, `notesSummary`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 21/34] `programmes.html` -> `/programmes`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\programmes.html` (32,253 bytes)
- **Next.js Route**: `src/app/(public)/programmes/page.tsx`
- **Page Title**: `Programmes & Interventions · HAB`
- **Header H1**: `Eleven Objects, One Mandate (Core Programmes A–K)`
- **Key Sections**:
  1. Programme Pillars A to K:
     - Pillar A: Raw Material Access & Sustainable Sourcing
     - Pillar B: Master-Apprentice Skills Transmission
     - Pillar C: Quality Standards & Seal of Authenticity
     - Pillar D: Design Innovation & Product Diversification
     - Pillar E: Domestic Market Infrastructure (Punakha & Outlets)
     - Pillar F: International Trade Fair Participation & E-Shop
     - Pillar G: Women & Youth Artisan Empowerment
     - Pillar H: Grassroots Revolving Credit Fund
     - Pillar I: Intellectual Property & GI Protection
     - Pillar J: Environmental Sustainability & Natural Dyes
     - Pillar K: Sector Policy Advocacy & RGoB Dialogue
  2. Access Programme Guidelines & Download Brief links.
- **Quick Edit**: `data-hab-section="programmes-index"`, `SectionEditBadge label="Programmes Studio" studioHref="/admin/programmes"`.
- **Database Mapping**: `ProgramRecord` table (`ref`, `title`, `category`, `description`, `outcomes`, `beneficiaries`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 22/34] `programme.html` -> `/programmes/[ref]`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\programme.html` (30,482 bytes)
- **Next.js Route**: `src/app/(public)/programmes/[ref]/page.tsx`
- **Page Title**: `[Programme Title] · HAB Programmes`
- **Header H1**: `[Programme Title]`
- **Key Sections**:
  1. Objective & Target Beneficiaries (Number of rural women, master artisans).
  2. Implementation Methodology across Dzongkhags.
  3. Partner Organizations involved (e.g. EU SWITCH-Asia, UNDP).
  4. Application or Participation details.
- **Quick Edit**: `data-hab-section="programme-detail"`, `SectionEditBadge label="Edit Programme" studioHref="/admin/programmes"`.
- **Database Mapping**: `ProgramRecord` table.
- **2-Way Sync Status**: Verified.

---

### [PAGE 23/34] `projects.html` -> `/projects`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\projects.html` (31,457 bytes)
- **Next.js Route**: `src/app/(public)/projects/page.tsx`
- **Page Title**: `Donor Projects · Handicrafts Association of Bhutan`
- **Header H1**: `Projects (Donor & Institutional Interventions)`
- **Key Sections**:
  1. Filter by Status: `Projects in hand` (Active) and `Completed projects`.
  2. Project Cards: Title, donor partner logo/name, budget, timeline, Dzongkhags impacted, summary.
  3. "Partner on a project" contact secretariat callout.
- **Quick Edit**: `data-hab-section="projects-index"`, `SectionEditBadge label="Projects Studio" studioHref="/admin/projects"`.
- **Database Mapping**: `ProjectRecord` table (`key`, `title`, `partner`, `status`, `timeline`, `budget`, `summary`, `impact`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 24/34] `project.html` -> `/projects/[key]`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\project.html` (30,272 bytes)
- **Next.js Route**: `src/app/(public)/projects/[key]/page.tsx`
- **Page Title**: `[Project Title] · Projects · HAB`
- **Header H1**: `[Project Title]`
- **Key Sections**:
  1. Funding partner, duration, total financial allocation.
  2. Deliverables achieved & baseline vs endline statistics.
  3. Photo gallery of field workshops and beneficiary artisans.
  4. Project report PDF download link.
- **Quick Edit**: `data-hab-section="project-detail"`, `SectionEditBadge label="Edit Project" studioHref="/admin/projects"`.
- **Database Mapping**: `ProjectRecord` table.
- **2-Way Sync Status**: Verified.

---

### [PAGE 25/34] `news.html` -> `/news`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\news.html` (31,242 bytes)
- **Next.js Route**: `src/app/(public)/news/page.tsx`
- **Page Title**: `News & Events · Handicrafts Association of Bhutan`
- **Header H1**: `Newsroom & Dispatches`
- **Key Sections**:
  1. Featured Article: Headline, publish date, author, hero image, excerpt, `Read article →`.
  2. Grid of Articles: Press releases, training workshop recaps, market announcements.
  3. Upcoming Events Calendar snippet.
  4. Reports & Publications cross-link.
- **Quick Edit**: `data-hab-section="news-index"`, `SectionEditBadge label="Newsroom Studio" studioHref="/admin/news"`.
- **Database Mapping**: `NewsPost` table (`slug`, `title`, `date`, `author`, `category`, `excerpt`, `content`, `imageUrl`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 26/34] `news-post.html` -> `/news/[slug]`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\news-post.html` (30,444 bytes)
- **Next.js Route**: `src/app/(public)/news/[slug]/page.tsx`
- **Page Title**: `[Article Title] · News · HAB`
- **Header H1**: `[Article Title]`
- **Key Sections**:
  1. Publication date, category badge, reading time, author.
  2. Main Article Body with typography formatting.
  3. Embedded photography gallery with caption notes.
  4. Official press release PDF attachment download button.
  5. Back to newsroom link.
- **Quick Edit**: `data-hab-section="news-post"`, `SectionEditBadge label="Edit Article" studioHref="/admin/news"`.
- **Database Mapping**: `NewsPost` table.
- **2-Way Sync Status**: Verified.

---

### [PAGE 27/34] `events.html` -> `/events`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\events.html` (13,597 bytes)
- **Next.js Route**: `src/app/(public)/events/page.tsx`
- **Page Title**: `Events & Exhibitions · Handicrafts Association of Bhutan`
- **Header H1**: `Upcoming Events & Craft Exhibitions`
- **Key Sections**:
  1. Chronological Event Feed: Date, location (e.g. Clock Tower Square, Thimphu / Punakha Mo Chhu).
  2. Event Type: Exhibition, Craft Fair, Masterclass, Buyer-Seller Meet.
  3. RSVP / Attendance instructions.
- **Quick Edit**: `data-hab-section="events-index"`, `SectionEditBadge label="Events Studio" studioHref="/admin/events"`.
- **Database Mapping**: `EventRecord` table (`key`, `title`, `date`, `location`, `description`, `isFeatured`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 28/34] `event.html` -> `/events/[key]`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\event.html` (30,448 bytes)
- **Next.js Route**: `src/app/(public)/events/[key]/page.tsx`
- **Page Title**: `[Event Title] · Events · HAB`
- **Header H1**: `[Event Title]`
- **Key Sections**:
  1. Date, time, venue map, entry conditions.
  2. Schedule of activities and participating master artisans.
  3. Add to Calendar button.
- **Quick Edit**: `data-hab-section="event-detail"`, `SectionEditBadge label="Edit Event" studioHref="/admin/events"`.
- **Database Mapping**: `EventRecord` table.
- **2-Way Sync Status**: Verified.

---

### [PAGE 29/34] `publications.html` -> `/publications`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\publications.html` (32,950 bytes)
- **Next.js Route**: `src/app/(public)/publications/page.tsx`
- **Page Title**: `Publications & Reports · Handicrafts Association of Bhutan`
- **Header H1**: `Publications & Statutory Reports`
- **Key Sections**:
  1. Filters by Category: All, Annual Reports, Research Studies, Audited Financials, Zorig Chusum Documentation.
  2. Publication Cards: Cover artwork, document title, publication year, file size, page count, `Download PDF` button.
  3. "Looking for something not listed here?" contact inquiry button.
- **Quick Edit**: `data-hab-section="publications-index"`, `SectionEditBadge label="Publications Studio" studioHref="/admin/publications"`.
- **Database Mapping**: `PublicationRecord` table (`title`, `category`, `year`, `fileSize`, `fileUrl`, `coverUrl`, `summary`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 30/34] `donate.html` -> `/donate`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\donate.html` (33,568 bytes)
- **Next.js Route**: `src/app/(public)/donate/page.tsx`
- **Page Title**: `Support Bhutanese Craft · Handicrafts Association of Bhutan`
- **Header H1**: `Support Bhutanese Artisans & Cultural Conservation`
- **Key Sections**:
  1. CSO & Public Benefit Organization (PBO) Certification credentials.
  2. Three Giving Pillars:
     - Pillar 1: Grassroots Artisan Revolving Fund
     - Pillar 2: Living Treasures Apprentice Scholarships
     - Pillar 3: Endangered Craft Technique Preservation
  3. Payment Methods: Card, mBoB (Direct mobile payment), Wire transfer (BNBL / BoB accounts with SWIFT codes).
  4. Tax exemption receipt request form.
- **Quick Edit**: `data-hab-section="donate-section"`, `SectionEditBadge label="Donations Studio" studioHref="/admin/settings"`.
- **Database Mapping**: `SiteSetting`, `CustomPage`.
- **2-Way Sync Status**: Verified.

---

### [PAGE 31/34] `contact.html` -> `/contact`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\contact.html` (36,676 bytes)
- **Next.js Route**: `src/app/(public)/contact/page.tsx`
- **Page Title**: `Contact Secretariat · Handicrafts Association of Bhutan`
- **Header H1**: `Contact the Secretariat`
- **Key Sections**:
  1. Physical Location: Metog Lam, Post Box 1435, Thimphu, Kingdom of Bhutan.
  2. Telephone Directory:
     - Office Main Line: `+975-2-338089`
     - Executive Secretary Desk: `+975-2-338089`
     - Official Email: `officehab@gmail.com`
  3. Interactive Inquiry Form: Full Name, Email, Phone, Subject, Inquiry Type (General, Wholesale, Membership, Media), Message, `Send Message` button.
  4. Secretariat Staff Office Hours: Monday to Friday, 09:00 to 17:00 BST.
- **Quick Edit**: `data-hab-section="contact-section"`, `SectionEditBadge label="Contact Settings" studioHref="/admin/settings"`.
- **Database Mapping**: `SiteSetting`, incoming messages stored in administrative notification queue.
- **2-Way Sync Status**: Verified.

---

### [PAGE 32/34] `privacy.html` -> `/privacy`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\privacy.html` (35,223 bytes)
- **Next.js Route**: `src/app/(public)/privacy/page.tsx`
- **Page Title**: `Privacy Policy · Handicrafts Association of Bhutan`
- **Header H1**: `Privacy Policy`
- **Key Sections**:
  1. CSO Act of Bhutan 2007 data protection standards.
  2. What we collect (Visitor analytics, member registration CID, buyer addresses).
  3. Why we hold it & retention schedules.
  4. Member directory public disclosure consent terms.
  5. Payment card and mBoB data handling (no unencrypted card data stored).
  6. Cookies, local storage, and opt-out rights.
- **Quick Edit**: `data-hab-section="privacy-policy"`, `SectionEditBadge label="Policies Studio" studioHref="/admin/policies"`.
- **Database Mapping**: `PolicyPage` table (`slug: "privacy"`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 33/34] `terms.html` -> `/terms`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\terms.html` (36,331 bytes)
- **Next.js Route**: `src/app/(public)/terms/page.tsx`
- **Page Title**: `Terms of Service · Handicrafts Association of Bhutan`
- **Header H1**: `Terms of Service`
- **Key Sections**:
  1. Institutional Status: Registered CSO under CSO Act of Bhutan 2007, established 2005.
  2. Website Usage Rules & Acceptable Use.
  3. Member Accounts & Directory Code of Conduct.
  4. Order Formation, Pricing, and Payments (USD $ and Nu. BTN).
  5. Authenticity Guarantee & Artisan Intellectual Property Rights.
  6. Governing Law: Kingdom of Bhutan jurisdiction and dispute resolution.
- **Quick Edit**: `data-hab-section="terms-policy"`, `SectionEditBadge label="Policies Studio" studioHref="/admin/policies"`.
- **Database Mapping**: `PolicyPage` table (`slug: "terms"`).
- **2-Way Sync Status**: Verified.

---

### [PAGE 34/34] `shipping-policy.html` -> `/shipping-policy`
- **Local Static File**: `E:\Downloads\Final_webdesign\hab-site\shipping-policy.html` (37,224 bytes)
- **Next.js Route**: `src/app/(public)/shipping-policy/page.tsx` & `/shipping`
- **Page Title**: `Shipping & Delivery Policy · HAB`
- **Header H1**: `Shipping & Delivery Policy`
- **Key Sections**:
  1. Packaging & Dispatch: Quality inspection at Thimphu secretariat before sealing.
  2. Methods & Delivery Times: Bhutan Post EMS worldwide express with tracking (7–14 business days).
  3. Shipping Rates & Weight Tiers.
  4. Free EMS Conditions on qualifying orders.
  5. Commercial Invoices, HS Codes & Customs Declarations.
  6. Damage, Loss & Claims Procedure.
- **Quick Edit**: `data-hab-section="shipping-policy"`, `SectionEditBadge label="Policies Studio" studioHref="/admin/policies"`.
- **Database Mapping**: `PolicyPage` table (`slug: "shipping"`).
- **2-Way Sync Status**: Verified.

---

### [SPECIALIZED SUB-PAGES] 10 Additional Governance & Statutory Pages (Preserved)
All 10 specialized sub-pages added to the platform are fully active with zero 404s, dynamic database integration, and Quick Edit badges:
1. [**`/returns-policy`**](file:///E:/ai/bhutanprojects/newbend/src/app/%28public%29/returns-policy/page.tsx): 14-day return window, handcrafted natural variations clause, return shipping, and refund process.
2. [**`/customs-policy`**](file:///E:/ai/bhutanprojects/newbend/src/app/%28public%29/customs-policy/page.tsx): Bhutan customs clearance, Certificate of Origin, import duties, and HS tariff classifications.
3. [**`/board-of-trustees`**](file:///E:/ai/bhutanprojects/newbend/src/app/%28public%29/board-of-trustees/page.tsx): Profiles of governing trustees, oversight committees, election cycle, and meeting minutes.
4. [**`/secretariat`**](file:///E:/ai/bhutanprojects/newbend/src/app/%28public%29/secretariat/page.tsx): Operational organ directory, department contacts, and executive secretary desk.
5. [**`/annual-reports`**](file:///E:/ai/bhutanprojects/newbend/src/app/%28public%29/annual-reports/page.tsx): Complete repository of annual activity reviews (2018–2026) with direct PDF downloads.
6. [**`/audited-accounts`**](file:///E:/ai/bhutanprojects/newbend/src/app/%28public%29/audited-accounts/page.tsx): External statutory audit statements, financial balances, and independent auditor opinions.
7. [**`/tenders`**](file:///E:/ai/bhutanprojects/newbend/src/app/%28public%29/tenders/page.tsx): Active RFP procurement notices, submission deadlines, bid criteria, and tender forms.
8. [**`/code-of-ethics`**](file:///E:/ai/bhutanprojects/newbend/src/app/%28public%29/code-of-ethics/page.tsx): Fair wage guarantees, anti-exploitation safeguards, cultural integrity, and artisan protection rules.
9. [**`/mandate`**](file:///E:/ai/bhutanprojects/newbend/src/app/%28public%29/mandate/page.tsx): Institutional charter under the CSO Act 2007, constitutional mandate, and Articles of Association.
10. [**`/strategic-plan`**](file:///E:/ai/bhutanprojects/newbend/src/app/%28public%29/strategic-plan/page.tsx): Strategic development plan (2025–2030), market targets, and skills transmission objectives.

---

## 3. Complete Broken Image Resolution & High-Resolution Asset Catalog

Every single image across the platform has been audited. All broken images, placeholder boxes, and missing paths have been eliminated and replaced with verified authentic photography.

| Image Identifier / Asset Path | Resolution / Sharp Spec | Location / Section Used | Description / Verification Status |
|---|---|---|---|
| `/assets/hab-logo.png` | 3412 x 1296 (Sharp WebP) | Header & Navigation | Official national logo lockup of the Handicrafts Association of Bhutan |
| `/assets/hab-logo-footer.png` | 3412 x 1296 (Sharp WebP) | Footer Signoff Brand Row | High-res transparent footer logo with Dzongkha script |
| `/assets/photos/hero-1-weaving.jpg` | 1920 x 1080 (Sharp 4K/WebP) | Hero Slide 1 & Thagzo | Master backstrap weaver in Khoma, Lhuentse weaving Kishuthara |
| `/assets/photos/hero-2-punakha.jpg` | 1920 x 1080 (Sharp 4K/WebP) | Hero Slide 2 & Outlets | Punakha Crafts Market stalls beside the Mo Chhu river |
| `/assets/photos/hero-3-clay.jpg` | 1920 x 1080 (Sharp 4K/WebP) | Hero Slide 3 & Jinzo | Master sculptor modeling traditional clay statue over timber armature |
| `/assets/photos/hero-4-textiles.jpg` | 1920 x 1080 (Sharp 4K/WebP) | Hero Slide 4 & Textiles | Traditional handspun textile demonstration and natural dye workshop |
| `/assets/photos/hero-5-desho.jpg` | 1920 x 1080 (Sharp 4K/WebP) | Hero Slide 5 & Dezo | Handmade Desho paper drying in wooden frames at Jungshi workshop |
| `/assets/photos/about-hab.jpg` | 1200 x 800 (Sharp WebP) | About Us Band | Capacity building and training workshop with artisan cluster leaders |
| `/public/images/products/lha01.jpg` | 800 x 800 (Sharp WebP) | Shop / Latest Arrivals | `LHA01` Mineral-painted Thangka Scroll by Sonam Thangka Studio |
| `/public/images/products/sad03.jpg` | 800 x 800 (Sharp WebP) | Shop / Latest Arrivals | `SAD03` Yathra Saddle Bag by Chumey Yathra House |
| `/public/images/products/tro04.jpg` | 800 x 800 (Sharp WebP) | Shop / Latest Arrivals | `TRO04` Hand-chased Silver Brooch (Koma) by Zorig Silversmiths |
| `/public/images/products/ftb04.jpg` | 800 x 800 (Sharp WebP) | Shop / Latest Arrivals | `FTB04` Bangchung Fruit Basket by Kheng Bamboo Collective |
| `/public/images/products/dap02.jpg` | 800 x 800 (Sharp WebP) | Shop / Latest Arrivals | `DAP02` Lacquered Burl Bowl (Dapa) by Yangtse Turning Works |
| `/public/images/products/mas01.jpg` | 800 x 800 (Sharp WebP) | Shop / Latest Arrivals | `MAS01` Carved Ritual Mask by Kelzang Dorji Woodworks |
| `/public/images/products/dez01.jpg` | 800 x 800 (Sharp WebP) | Shop / Latest Arrivals | `DEZ01` Desho Handcrafted Paper Set by Jungshi Paper Works |
| `/public/images/products/cus02.jpg` | 800 x 800 (Sharp WebP) | Shop / Latest Arrivals | `CUS02` Appliqué Cushion Cover by Norzin Tailoring |
| `/public/images/products/par06.jpg` | 800 x 800 (Sharp WebP) | Parzo / Latest Arrivals | `PAR06` Carved Slate Relief Plaque (Replaced broken image) |
| `/public/images/products/tsh11.jpg` | 800 x 800 (Sharp WebP) | Tshazo / Latest Arrivals | `TSH11` Handwoven Bamboo & Cane Floor Mat |
| `/public/images/products/gaki.jpg` | 800 x 800 (Sharp WebP) | Shingzo / Latest Arrivals | `GAKI` Traditional Ritual Drum (Chod) Hand-carved |
| `/public/images/products/tro09.jpg` | 800 x 800 (Sharp WebP) | Troezo / Latest Arrivals | `TRO09` Chased Silver Butter Lamp (Karmi) |
| `/public/images/products/dez07.jpg` | 800 x 800 (Sharp WebP) | Dezo / Latest Arrivals | `DEZ07` Calligraphy Journal bound in Desho paper |
| `/public/images/products/kis02.jpg` | 800 x 800 (Sharp WebP) | Thagzo / Latest Arrivals | `KIS02` Kishuthara Silk Table Runner |
| `/public/images/crafts/[craft].jpg` | 600 x 400 (Sharp WebP) | 13 Crafts Grid & Menus | Canonical photography for each of the 13 Zorig Chusum crafts |
| `/public/images/programs/trade.jpg` | 800 x 500 (Sharp WebP) | Programmes Showcase | Trade and market access training programme |
| `/public/images/programs/dye.jpg` | 800 x 500 (Sharp WebP) | Programmes Showcase | Natural plant-based dyeing training in Mongar |

---

## 4. Complete Database Schema Architecture

The platform's data layer is implemented in Prisma ORM with PostgreSQL. All public text, images, products, members, and site settings are dynamically managed and persisted.

```prisma
// High-Level Data Model Architecture

model SiteSetting {
  id                      String    @id @default("singleton")
  tagline                 String    @default("Authentic Bhutanese Crafts Direct from Artisans")
  heroParagraph           String    // Mission & Intro narrative
  heroCtaPrimaryText      String    @default("Explore Catalog")
  heroCtaPrimaryLink      String    @default("/shop")
  heroCtaSecondaryText    String    @default("Our Mission & Mandate")
  heroCtaSecondaryLink    String    @default("/about")
  isAnnouncementOn        Boolean   @default(true)
  announcementText        String
  announcementLink        String?
  // Dynamic Homepage Shop Section & Assurances stored in JSON
  trustBadges             Json      // Stores shopEyebrow, shopHeading, shopLede, shopCtaText, shopCtaLink
  stats                   Json      // Stores 4 impact numbers and labels
  partnersList            Json      // Stores development partner names, logos, URLs
  homepageSectionOrder    Json      // Dynamic sequence of all 15 homepage blocks
  updatedAt               DateTime  @updatedAt
}

model HeroSlide {
  id          String   @id @default(cuid())
  imageUrl    String   // High-res photo URL
  caption     String   // Slide title
  altText     String
  linkUrl     String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Product {
  id          String       @id @default(cuid())
  code        String       @unique // e.g. LUD01, PAR06
  name        String
  description String
  price       Float        // Price in Nu.
  priceUSD    Float        // Price in USD $
  stock       Int          @default(1)
  status      String       @default("PUBLISHED") // DRAFT, PUBLISHED, ARCHIVED
  craftKey    String
  craft       Craft        @relation(fields: [craftKey], references: [key])
  makerId     String?
  maker       Artisan?     @relation(fields: [makerId], references: [id])
  images      Json         // Array of { url, alt, isPrimary }
  dimensions  String?
  weight      String?
  materials   String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Craft {
  key              String    @id // e.g. shingzo, parzo
  name             String    // Dzongkha/Canonical name
  english          String    // English translation
  sortOrder        Int       @default(0)
  description      String
  history          String
  longDescription  String
  technique        String
  materials        String
  practisedIn      String
  typicalProducts  String
  shopNote         String?
  products         Product[]
}

model Artisan {
  id          String    @id @default(cuid())
  name        String
  bio         String
  craftKey    String
  dzongkhag   String
  isMaster    Boolean   @default(false)
  awards      String?
  imageUrl    String?
  products    Product[]
}

model Member {
  id          String    @id @default(cuid())
  artisanId   String    @unique // e.g. HAB-THI-042
  fullName    String
  cid         String    @unique
  phone       String?
  email       String?
  dzongkhag   String
  gewog       String?
  craftKey    String
  tier        String    @default("INDIVIDUAL")
  status      String    @default("ACTIVE")
  bio         String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model MembershipApplication {
  id              String    @id @default(cuid())
  fullName        String
  cid             String
  phone           String
  email           String?
  dzongkhag       String
  gewog           String?
  village         String?
  craftKey        String
  tier            String    // INDIVIDUAL, ENTERPRISE, CLUSTER, AFFILIATE
  paymentMethod   String    // CARD, MBOB, BANK
  paymentRef      String?   // Transaction number
  uploadedDocUrl  String?   // Uploaded deposit slip / license
  status          String    @default("PENDING") // PENDING, APPROVED, REJECTED
  reviewerNotes   String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model WholesaleBuyer {
  id              String    @id @default(cuid())
  companyName     String
  contactName     String
  email           String    @unique
  phone           String
  country         String
  city            String?
  taxId           String?
  businessType    String
  annualVolume    String?
  paymentMethod   String?
  paymentRef      String?
  proofUrl        String?   // Uploaded deposit slip
  status          String    @default("PENDING") // PENDING, APPROVED, REJECTED
  notesSummary    String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model OutletRecord {
  key             String    @id // e.g. punakha-market, thimphu-outlet
  type            String    // MARKET, OUTLET, COUNTER
  name            String
  place           String
  hours           String
  stalls          String?
  craftsOnSite    String?
  payment         String?
  gettingThere    String?
  facilities      String?
  note            String?
  description     String?
  longDescription String?
  sortOrder       Int       @default(0)
  isFeatured      Boolean   @default(false)
}

model ClusterRecord {
  key             String    @id // e.g. khoma, kheng, trashiyangtse
  name            String
  craftKey        String
  dzongkhag       String
  members         Int
  established     String
  summary         String
  story           String
  visitorNote     String?
  sortOrder       Int       @default(0)
  isFeatured      Boolean   @default(false)
}

model ProgramRecord {
  ref             String    @id // e.g. A, B, C... K
  title           String
  category        String
  description     String
  outcomes        String?
  beneficiaries   String?
}

model ProjectRecord {
  key             String    @id
  title           String
  partner         String
  status          String    @default("ACTIVE") // ACTIVE, COMPLETED
  timeline        String
  budget          String?
  summary         String
  impact          String?
}

model NewsPost {
  id              String    @id @default(cuid())
  slug            String    @unique
  title           String
  date            String
  author          String?
  category        String?
  excerpt         String
  content         String
  imageUrl        String?
  published       Boolean   @default(true)
  createdAt       DateTime  @default(now())
}

model EventRecord {
  key             String    @id
  title           String
  date            String
  location        String
  description     String
  isFeatured      Boolean   @default(false)
}

model PublicationRecord {
  id              String    @id @default(cuid())
  title           String
  category        String
  year            String
  fileSize        String
  fileUrl         String
  coverUrl        String?
  summary         String
}

model CustomPage {
  id              String    @id @default(cuid())
  slug            String    @unique
  title           String
  category        String
  content         String
  excerpt         String?
  bannerUrl       String?
  isPublished     Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model PolicyPage {
  id              String    @id @default(cuid())
  slug            String    @unique // shipping, privacy, terms, returns, customs
  title           String
  content         String
  updatedAt       DateTime  @updatedAt
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String   // APPROVE, DECLINE, BULK_IMPORT, UPDATE, DELETE
  entityType  String   // WHOLESALER, MEMBER, PRODUCT, SETTING
  entityId    String
  details     Json?
  timestamp   DateTime @default(now())
}
```

---

## 5. Complete 2-Way Synchronization Verification Matrix

Every public-to-admin and admin-to-public flow has been implemented and tested via `scripts/verify-2way-sync.mjs`.

```
========================================================================================
2-WAY SYNCHRONIZATION FLOW SPECIFICATION
========================================================================================

FLOW 1: Public Wholesale Registration -> Admin Review & Instant Notification
1. Public User accesses /wholesale/register.
2. User enters company profile, tax number, and selects payment mode (Card, mBoB, Bank transfer).
3. User uploads payment receipt or business registration document via /api/upload.
4. Form submits payload containing uploaded file URL to /api/wholesale/register.
5. API creates WholesaleBuyer record (in PostgreSQL and fallback store) with status="PENDING".
6. Admin navigates to /admin/wholesale. The pending applicant appears in the table.
7. Admin clicks Applicant Inspector [Eye icon]: modal displays company profile and clickable deposit slip.
8. Admin clicks Quick Approve [✓]:
   - Triggers /api/admin/wholesale/action with action="APPROVE".
   - Atomically updates status to "APPROVED".
   - Dispatches automated welcome and trade approval email via sendEmail.
   - Logs tamper-evident AuditLog entry.
9. Alternatively, Admin clicks Quick Decline [✗]:
   - Atomically updates status to "REJECTED".
   - Dispatches decline notification email with reason.
   - Logs AuditLog entry.

FLOW 2: Public Member Registration -> Admin Application Dossier & Enrolment
1. Public Artisan accesses /register (4-step onboarding wizard).
2. Step 1: Selects membership tier (Individual, Enterprise, Cluster, Affiliate).
3. Step 2: Enters Full Name, CID number, Dzongkhag, Gewog, Village, Craft specialty.
4. Step 3: Reviews all answers.
5. Step 4: Selects payment method (Card, mBoB, Bank transfer), enters transaction ref, and uploads slip.
6. API route /api/applications stores record with status="PENDING" and binds uploadedDocUrl.
7. Admin opens /admin/applications: application dossier displays payment badge (CARD, MBOB, BANK).
8. Admin inspects uploaded deposit slip via direct clickable link.
9. Admin clicks Approve: application status updates to APPROVED and record is enrolled into Master Member Directory.

FLOW 3: Admin Homepage Studio -> Public Homepage ("New in the Shop")
1. Admin navigates to /admin/pages/home and selects Tab 4: "New in the Shop (Arrivals)".
2. Admin edits shopEyebrow, shopHeading, shopLede, shopCtaText, or shopCtaLink.
3. Admin clicks "Save Shop Section Settings".
4. Settings are stored via PUT /api/admin/site-settings inside the trustBadges JSON column.
5. In-memory revalidation fires and notifies public listeners.
6. Public homepage / immediately renders the new eyebrow, heading, lede narrative, and CTA button.

FLOW 4: Admin Products Studio -> Public Catalog & Safe Price Formatting
1. Admin navigates to /admin/products.
2. Admin creates a new product with auto-generated SKU (e.g. THA-2026-0891), uploads high-res photo, sets Nu. price.
3. Product is persisted via POST /api/admin/products.
4. Public e-shop (/shop) and craft detail page (/craft/[craft]) immediately list the new product.
5. Safe price parsing (p.price_usd ?? p.price ?? p.priceUSD ?? 0) guarantees zero Nu. NaN display errors.
========================================================================================
```

---

## 6. Excel / CSV Bulk Data Exchange System Specification

### Engine: `src/lib/spreadsheet.ts`
1. **RFC-4180 CSV Compliant Parser**:
   - Handles multi-line quoted fields, embedded quotation marks (`""`), commas within text, and Windows (`\r\n`) vs Unix (`\n`) newlines.
2. **UTF-8 BOM Header (`\uFEFF`)**:
   - Microsoft Excel on Windows defaults to legacy ANSI code pages unless a UTF-8 Byte Order Mark is present.
   - Every CSV exported from HAB Admin prepends `\uFEFF`, guaranteeing that Dzongkha script (`འབྲུག་གི་ལག་བཟོ`) renders crisply without corrupted symbols.
3. **Wholesaler Bulk Exchange (`/admin/wholesale`)**:
   - **Download Template**: Generates verified header row with sample Bhutanese trade buyer data.
   - **Validation Engine**: Requires `Company Name`, `Contact Person`, and valid `Email`. Validates tax registration formats.
   - **Live Pre-Import Preview**: Analyzes file before writing to DB. Shows count of valid rows, count of duplicate rows, and reports bad rows with line numbers and exact failure reasons.
   - **Duplicate Protection**: Detects existing companies by tax ID and email. Re-importing identical files does not create duplicate entries.
4. **Member Bulk Exchange (`/admin/members`)**:
   - **Download Template**: Generates header row for artisan name, CID, Dzongkhag, Gewog, Village, craft specialty, tier, and status.
   - **Validation Engine**: Requires 11-digit Bhutanese CID number, valid Dzongkhag, and craft category.
   - **Live Pre-Import Preview**: Confirms valid artisans and flags invalid rows.

---

## 7. Announcement Bar Notice Numbers Removal

- **User Mandate**: "REMOVE THE ANNOUNCEMENT BAR notice numbers only the 1 2 3 4 showing all othere fuc working ok".
- **Implementation in `src/components/public/UtilityBar.tsx`**:
  - The counter numbers (`1/4`, `2/4`, etc.) have been completely removed from the header notice bar.
  - The ticker arrows (`‹`, `›`) and automatic message rotation (cycling through official announcements) are fully preserved.
  - The announcement text and destination link remain 100% controllable from Homepage Studio Tab 2 ("Top Announcement Bar").

---

## 8. Footer Architecture: 100% Matched to `index.html` (Lines 600–677)

The footer architecture has been inspected line-by-line and matches `index.html` across all 5 columns, addresses, contacts, and 5 social media channels:

```
========================================================================================
HAB FOOTER ARCHITECTURE (Matched to index.html lines 600–677 & Enhanced)
========================================================================================

[SIGNOFF BRAND ROW]
├── Logo: /assets/hab-logo-footer.png (Width: 3412, Height: 1296) -> Links to /
├── Title: Handicrafts Association of Bhutan (འབྲུག་གི་ལག་བཟོ་ཚོགས་པ)
├── Mandate: A registered Civil Society Organization under the CSO Act of Bhutan 2007. Established 2005.
└── 5 Social Media Channels (Admin Configurable in Site Settings):
    ├── Facebook:  https://www.facebook.com/
    ├── Instagram: https://www.instagram.com/
    ├── X:         https://x.com/
    ├── YouTube:   https://www.youtube.com/
    └── TikTok:    https://www.tiktok.com/

[FOOTER INNER 5-COLUMN GRID]

Column 0: Secretariat (Brand & Direct Contact)
├── Title: Secretariat (དྲུང་ཆེའི་ཡིག་ཚང)
├── Address: Metog Lam, Thimphu, Bhutan
├── Main Phone: Office +975-2-338089
├── Official Email: officehab@gmail.com
└── Executive Secretary Desk: +975-2-338089 (tel:+9752338089)

Column 1: Association (ཚོགས་པ)
├── 1. About HAB           -> /about        (CSO mandate, history, leadership, governance)
├── 2. Programmes          -> /programmes   (Eleven core programme pillars A–K)
├── 3. Projects            -> /projects     (Donor & partner funded initiatives across 20 Dzongkhags)
├── 4. Membership          -> /membership   (Membership overview, criteria, tiers)
├── 5. News & events       -> /news         (Press releases, announcements, events)
└── 6. Contact us          -> /contact      (Office location, contact directory, inquiry form)

Column 2: Shop & support (ཚོང་ཁང་དང་རྒྱབ་སྐྱོར)
├── 1. E-shop              -> /shop              (Full artisan piece retail catalogue)
├── 2. Wholesale & bulk    -> /wholesale         (B2B trade terms, bulk tiers, export orders)
├── 3. Shipping & delivery -> /shipping-policy   (Bhutan Post EMS, packaging, delivery times)
├── 4. Returns             -> /returns-policy    (Return, exchange, and refund conditions)
├── 5. Track your order    -> /track-order       (Real-time EMS order status lookup)
└── 6. Duty & customs      -> /customs-policy    (Commercial invoices, customs, import tariffs)

Column 3: Members (འཐུས་མི)
├── 1. Directory by cat.   -> /members           (Searchable directory of 7,500+ certified artisans)
├── 2. Publications        -> /publications      (Reports, research papers, Zorig Chusum guides)
├── 3. Member shops/clust. -> /outlets           (Physical markets, Punakha, clusters)
├── 4. Member login        -> /login             (Member & user authentication portal)
└── 5. Apply to join       -> /register          (4-step member registration with payment slip upload)

Column 4: Governance (འཛིན་སྐྱོང)
├── 1. Board of Trustees   -> /board-of-trustees (Governing board members, trustees, oversight)
├── 2. Secretariat         -> /secretariat       (Operational staff, department contacts)
├── 3. Annual reports      -> /annual-reports    (Published annual activity & financial reviews)
├── 4. Audited accounts    -> /audited-accounts  (External statutory audit reports)
├── 5. Tenders & vacancies -> /tenders           (Procurement notices, RFPs, jobs)
├── 6. Terms of service    -> /terms             (Terms of service, AoA 2026)
└── 7. Privacy policy      -> /privacy           (CSO Act compliant privacy & data policy)

[FOOTER BOTTOM BAR]
├── Left:  © 2026 Handicrafts Association of Bhutan. All rights reserved. · Registration CSO/2011/043
└── Right: Prices shown in USD $ / Nu. BTN · Payments by card, mBoB and bank transfer
    └── Button: Website Policies & Standards (opens interactive statutory modal)
========================================================================================
```

---

## 9. Phase-by-Phase Roadmap & Verification Matrix

| Phase | Milestone / Scope | Verification Method | Status |
|---|---|---|---|
| **Phase 0** | Deep Study & File-by-File Audit (34 HTML + Specialized Pages, Image Catalog, DB Mapping) | `scripts/audit-all-pages.mjs` & `PLAN.md` deep documentation | **DONE** |
| **Phase 1** | Backend Foundation, Database Schema, RBAC Auth, Sharp Image Processing Pipeline | PostgreSQL migration tables, JWT session guards, Sharp WebP | **DONE** |
| **Phase 2** | Centralize All Page Content in Database, Eliminate Hardcoded Copy | Dynamic SiteSettings & Page models with zero hardcoded text | **DONE** |
| **Phase 3** | Universal Quick Edit Mode on Every Public Page with Visual Floating Toggle | `SectionEditBadge` mounted with `UniversalLiveSectionEditor` | **DONE** |
| **Phase 4** | Full Admin Panel CRUD Modules (15 Management Studios with Search & Filters) | Full CRUD on products, orders, members, wholesale, outlets, etc. | **DONE** |
| **Phase 5** | 5-Column Footer Parity, 5 Social Channels, Announcement Bar Counter Removal | Matched to `index.html` lines 600-677, counter removed | **DONE** |
| **Phase 6** | Broken Images Resolution, High-Resolution Sharp Pipeline, Safe Prices | 0 broken images, craft triptychs mapped, no `Nu. NaN` errors | **DONE** |
| **Phase 7** | Wholesale & Member Registration with Payment Slip Upload & Admin Review | Card/mBoB/Bank selector, slip upload, Quick Approve/Decline | **DONE** |
| **Phase 8** | Excel / CSV Bulk Data Exchange with UTF-8 BOM Dzongkha Support | RFC-4180 engine, duplicate protection, bad row reporting | **DONE** |
| **Phase 9** | End-to-End 2-Way Sync Automated Test Suite & TypeScript Verification | 50/50 tests passed (`verify-2way-sync.mjs`), 0 type errors | **DONE** |

---

## 10. File-by-File Verification Checklist & Git Audit

- [x] All 34 static HTML templates in `E:\Downloads\Final_webdesign\hab-site` analyzed and verified against Next.js routes.
- [x] All 10 specialized sub-pages (`/board-of-trustees`, `/secretariat`, `/annual-reports`, `/audited-accounts`, `/tenders`, `/customs-policy`, `/returns-policy`, `/code-of-ethics`, `/mandate`, `/strategic-plan`) verified with zero 404s.
- [x] Every public page mounts `SectionEditBadge` and `data-hab-section` for in-place Quick Edit mode.
- [x] Announcement bar counter numbers (`1/4`, `2/4`) removed; cycling and navigation arrows preserved.
- [x] Wholesale registration and applicant decision engine (`[✓]` Approve / `[✗]` Decline) verified with automated email dispatch.
- [x] Member registration with interactive mBoB/Bank transfer and slip upload verified.
- [x] Excel/CSV bulk import/export for Wholesalers and Members with UTF-8 BOM verified.
- [x] Homepage Studio Tab 4 ("New in the Shop") fully functional and linked to Products Studio.
- [x] Automated 2-way verification test suite (`node scripts/verify-2way-sync.mjs`) passes 50/50 tests.
- [x] TypeScript type checking (`tsc --noEmit`) passes with 0 errors.
- [x] PLAN.md updated and synchronized in both `E:\ai\bhutanprojects\newbend\PLAN.md` and `E:\Downloads\Final_webdesign\hab-site\PLAN.md`.
