# Handicrafts Association of Bhutan (HAB)
# Complete Site Operations Manual & Administrator Guide
**Platform Version:** 2026 Production Edition  
**Statutory Authorization:** Civil Society Organizations Act of Bhutan 2007 (Reg. CSO/2011/043)  
**Target Audience:** Secretariat Staff, Content Managers, E-Commerce Operators, and Non-Technical Administrators

---

## Table of Contents
1. [Platform Architecture & Executive Overview](#1-platform-architecture--executive-overview)
2. [Accessing the Admin Control Center](#2-accessing-the-admin-control-center)
3. [Visual Live Edit Mode (On-Page Front-End Editing)](#3-visual-live-edit-mode-on-page-front-end-editing)
4. [Universal Media & Document Uploading Guide](#4-universal-media--document-uploading-guide)
5. [Homepage CMS & Hero Slideshow Management](#5-homepage-cms--hero-slideshow-management)
6. [Development Partners & Brand Logo Showcase](#6-development-partners--brand-logo-showcase)
7. [Institutional About Page, Mandate & Governance Roster](#7-institutional-about-page-mandate--governance-roster)
8. [Artisan Directory & Member Profiles](#8-artisan-directory--member-profiles)
9. [Membership Categories, Application Pipeline & Annual Dues](#9-membership-categories-application-pipeline--annual-dues)
10. [E-Shop Products, Craft Categories & Inventory Control](#10-e-shop-products-craft-categories--inventory-control)
11. [Online Orders, Customer Fulfillment & Dispatch Logistics](#11-online-orders-customer-fulfillment--dispatch-logistics)
12. [In-Store Counter Billing Point of Sale (POS)](#12-in-store-counter-billing-point-of-sale-pos)
13. [B2B Wholesale Accounts, Bulk Orders & Lookbook Catalog](#13-b2b-wholesale-accounts-bulk-orders--lookbook-catalog)
14. [Newsroom Editorial Feed & Press Releases](#14-newsroom-editorial-feed--press-releases)
15. [Exhibitions, Bazaars & Calendar Events](#15-exhibitions-bazaars--calendar-events)
16. [Donations, Support Pillars & Statutory Bank Remittance](#16-donations-support-pillars--statutory-bank-remittance)
17. [Statutory Programmes (A–K) & Donor Funded Projects](#17-statutory-programmes-a-k--donor-funded-projects)
18. [The 13 Traditional Arts & Crafts of Zorig Chusum](#18-the-13-traditional-arts--crafts-of-zorig-chusum)
19. [Physical Outlets, Punakha Market & Artisan Village Clusters](#19-physical-outlets-punakha-market--artisan-village-clusters)
20. [Publications, Annual Reports & Audited Financial Accounts](#20-publications-annual-reports--audited-financial-accounts)
21. [Institutional Policies, Legal Terms & Customer Service Settings](#21-institutional-policies-legal-terms--customer-service-settings)
22. [Localization, Dual Currency (USD/BTN) & Exchange Rates](#22-localization-dual-currency-usdbtn--exchange-rates)
23. [Staff Logins, User Accounts & Role Permissions](#23-staff-logins-user-accounts--role-permissions)
24. [Database Backups, Disaster Recovery & VPS Deployment](#24-database-backups-disaster-recovery--vps-deployment)

---

## 1. Platform Architecture & Executive Overview
The **HAB Bhutan Platform** is a unified digital ecosystem designed for the apex handicraft organization of the Kingdom of Bhutan. It integrates three primary operational engines:
1. **Public Web Experience**: A high-performance, mobile-responsive portal matching the certified HAB design blueprint, featuring cultural storytelling, dynamic product catalogs, member directories, and international order checkout.
2. **Admin Control Studios**: A suite of 20+ specialized management studios organized for non-technical users. There are no raw code or JSON fields—everything uses visual cards, drop-and-drag uploaders, and formatted input forms.
3. **Real-Time 2-Way Sync Engine**: Any update made in an admin studio writes directly to the PostgreSQL database and immediately invalidates public cache headers (`Cache-Control: no-store`), reflecting live on the public site with zero lag.

---

## 2. Accessing the Admin Control Center
### Logging In
1. Open your browser and navigate to: `https://your-domain.com/admin` (or `/admin/login`).
2. Enter your authorized secretariat credentials (e.g. `admin@hab.org.bt`).
3. Click **Sign In**.

### The 5-Category Collapsible Sidebar
To keep navigation intuitive for staff, all studios are grouped into 5 logical categories:
- **1. Website Pages**: Homepage Studio, About Us, Programmes (A–K), Donor Projects, Outlets & Markets, Honours & Masters, Publications, News & Stories, Exhibitions & Events, Donation Appeals, Customer Inquiries, Institutional Policies, 13 Crafts.
- **2. Shop & E-Commerce**: Products & Stock, Online Orders, Counter Billing (POS), Payment Gateways, Wholesale Sourcing.
- **3. Artisans & Community**: Artisan Directory, New Member Applications, Membership Categories, Membership Fees & Renewals.
- **4. Settings & Customization**: Website Settings, Typography Styler, Menus & Links, Photo & Document Library, Currency & Language, Staff Logins.
- **5. Overview & Reports**: Sales Reports, System Status.

### Global Command Launcher (Quick Search)
- Press **Ctrl + K** (or **Cmd + K** on Mac) anywhere in the admin panel to open the instant command search.
- Type the name of any page, studio, or tool (e.g., `orders`, `partners`, `hero`, `pos`) and press **Enter** to jump straight to it.

---

## 3. Visual Live Edit Mode (On-Page Front-End Editing)
The Visual Live Edit mode allows staff to browse the public website and edit any section directly.

1. Log in to the Admin Panel.
2. Visit any public page (e.g. `/`, `/about`, `/news`, `/donate`, `/shop`, `/members`).
3. Look at the dark **Admin Toolbar** pinned to the top of your screen:
   - Notice the toggle: **Visual Edit: OFF / ON**.
   - Click to switch it to **ON**.
4. Every editable section will now display a floating amber badge:
   - Example: `[✏️ Edit Hero Slideshow]`
   - Example: `[✏️ Edit Mandate & History]`
   - Example: `[✏️ Edit Support Pillars]`
   - Example: `[✏️ Edit Partner Logos]`
5. Clicking any badge opens the corresponding Admin Studio in a dedicated tab.
6. Make your changes and click **Save**. When you return to the public site, your changes are immediately live!

---

## 4. Universal Media & Document Uploading Guide
Every admin studio is equipped with drag-and-drop file uploaders:
- **Photo Uploads**: Drag any JPG, PNG, WebP, or SVG file directly into the upload area, or click **[Choose File]** to select from your computer.
- **Thumbnail Preview**: As soon as a photo is selected, a preview thumbnail appears.
- **Replace / Remove**: Click **[Replace]** to swap the file or **[Remove]** to delete it.
- **PDF Documents**: For annual reports, B2B wholesale catalogs, or audited accounts, upload PDF files up to 30 MB.
- **Transparent Logos**: For partner logos, use PNG, SVG, or WebP with a transparent background for the cleanest presentation.

---

## 5. Homepage CMS & Hero Slideshow Management
**Admin Route:** `/admin/pages/home` or `/admin/hero`

### Managing Hero Slides
1. Go to **Website Pages > Homepage Studio** (tab: **Hero Slides**).
2. To add a new slide:
   - Click **[+ Add Slide]**.
   - Upload a high-resolution photograph (1200×800 recommended).
   - Enter an internal **Slide Caption / Reference**.
   - *(Note: Captions are kept in admin for identification, but are cleanly hidden from the public homepage slider for a distraction-free visual presentation).*
   - Set a destination button link (e.g., `/shop` or `/outlets/punakha-market`).
   - Click **[Save Slide]**.
3. To reorder slides: Change the sort order number or toggle the **Active** switch.

### Editing Tagline, Intro & Impact Statistics
1. In the **Homepage Studio**, switch to the **Mission & Statistics** tab.
2. Update the main header tagline (e.g., `Authentic Bhutanese Crafts Direct from Artisans`).
3. Update the four national impact counters:
   - Stat 1: `7,500+` — Micro & small enterprises in the network
   - Stat 2: `5,250` — Women-led enterprises
   - Stat 3: `195` — Affiliated stores across Bhutan
   - Stat 4: `13` — Arts & crafts of Zorig Chusum
4. Click **[Save Mission & Statistics]**.

### Editing the 4 Statutory Assurances
1. In **Homepage Studio**, switch to the **Assurances** tab.
2. Edit the titles and descriptive bodies for the 4 credibility badges:
   - 1: *Verified members only*
   - 2: *Fair price, paid upfront*
   - 3: *Secure payment (mBoB, Card, Bank Wire)*
   - 4: *Tracked worldwide (Bhutan Post EMS)*
3. Click **[Save Assurances]**.

---

## 6. Development Partners & Brand Logo Showcase
**Admin Route:** `/admin/site-settings` (Partners tab) or `/admin/pages/home` (Partners tab)

### Adding a Partner Organization
1. Go to **Settings & Customization > Website Settings > Partners tab**.
2. Click **[+ Add Partner]**.
3. In the modal dialog:
   - **Partner Name**: Enter official name (e.g. `EU SWITCH-Asia`, `UNDP Bhutan`, `RGoB`, `SHINE Project`).
   - **Website URL**: (Optional) Enter their official website link (e.g. `https://www.undp.org/bhutan`).
   - **Partner Logo Artwork**: Click the upload area and choose a transparent PNG or SVG logo.
4. Click **[Add to Showcase]**.
5. Click **[Save Changes]**.
6. The public homepage displays the logo mark at 44px height in the partners ribbon with automatic external linking.

---

## 7. Institutional About Page, Mandate & Governance Roster
**Admin Route:** `/admin/pages/about`

### Statutory Mandate & Strategic Vision
1. Navigate to **Website Pages > About Us Studio**.
2. Under the **Mandate** tab:
   - Edit the Statutory Mandate opening narrative.
   - Edit the Artisan Network Scope (Paragraph 2).
   - Upload the About Page Hero Feature photograph.
3. Under the **Vision & Objectives** tab:
   - Edit the Institutional Vision, Mission Statement, and core values.
4. Click **[Save Mandate Settings]**.

### Managing the Board of Trustees & Secretariat Team
1. In **About Us Studio**, switch to the **Board & Secretariat** tab.
2. Click **[+ Add Board Member]** or **[+ Add Secretariat Staff]**.
3. Enter their Full Name, Official Role Title (e.g. `Executive Director`, `Chairperson`, `Marketing Officer`), and brief biography.
4. Upload their official portrait photo.
5. Click **[Save]**.

---

## 8. Artisan Directory & Member Profiles
**Admin Route:** `/admin/members`

### Adding or Updating an Artisan
1. Go to **Artisans & Community > Artisan Directory**.
2. Click **[+ Add New Member]** or click **[Edit]** on an existing artisan.
3. Fill in the profile fields:
   - **Full Name**: e.g., `Ap Sonam Dorji`
   - **Enterprise / Workshop Name**: e.g., `Khoma Weavers Collective`
   - **Primary Craft**: Select from the 13 Zorig Chusum crafts (e.g. `Thagzo (Weaving)`, `Tshazo (Bamboo)`).
   - **Dzongkhag (District)**: Choose from all 20 Dzongkhags (Lhuentse, Thimphu, Trashiyangtse, Paro, etc.).
   - **Artisan Bio & Work Summary**: Background on their master apprenticeship and heritage techniques.
   - **Member Portrait Avatar**: Upload their portrait photograph.
   - **Status**: Set to `Active Verified Member`.
4. Click **[Save Member]**.
5. The public directory at `/members` and profile at `/members/[slug]` automatically displays their portrait, location tag, and craft specialty.

---

## 9. Membership Categories, Application Pipeline & Annual Dues
**Admin Routes:** `/admin/membership-categories`, `/admin/applications`, `/admin/membership-settings`

### Managing Categories & Fees
1. Go to **Artisans & Community > Membership Types**.
2. View and edit the 5 established tiers:
   - **Individual Artisan**: Nu. 500 / year (Active Sector Member)
   - **Craft Enterprise**: Nu. 2,000 / year (Active Sector Member)
   - **Artisan Cluster**: Nu. 3,000 / year (Active Sector Member)
   - **Affiliated Member**: Nu. 5,000 / year (Associate Member)
   - **Honorary Member**: Nu. 0 / Board Resolution
3. In each category: Upload hero banner imagery, update annual dues, and edit eligibility criteria.

### Reviewing New Member Applications
1. Go to **Artisans & Community > New Member Applications**.
2. Review pending submissions submitted from `/register` or `/membership/apply`.
3. Check artisan credentials, CID/registration number, and craft samples.
4. Click **[Approve Application]** to automatically convert the applicant into a verified member profile, or **[Request Clarification]**.

---

## 10. E-Shop Products, Craft Categories & Inventory Control
**Admin Route:** `/admin/products`

### Creating a New Craft Product
1. Go to **Shop & E-Commerce > Products & Stock**.
2. Click **[+ Add New Product]**.
3. Fill in product attributes:
   - **Product Code (SKU)**: e.g. `HAB-TEX-042`
   - **Product Name**: e.g. `Kushutara Silk Supplementary Weft Kira`
   - **Craft Category**: Choose from the 13 crafts (e.g. `Thagzo`).
   - **Maker Attribution**: Select from the verified members directory.
   - **Prices**: Enter price in Ngultrum (Nu. BTN) and USD ($).
   - **Stock Count**: Current inventory units available at the central warehouse.
   - **Photographs**: Upload Primary Cover Photo + Multi-angle detail photos (Angle 2, Angle 3).
   - **Materials & Dimensions**: Technical specs (e.g. 100% natural dyed raw silk, 250cm × 140cm).
4. Click **[Save Product]**.
5. The item is immediately available on the public E-Shop (`/shop`) and craft page.

---

## 11. Online Orders, Customer Fulfillment & Dispatch Logistics
**Admin Route:** `/admin/orders`

### Fulfilling Customer Orders
1. Go to **Shop & E-Commerce > Online Orders**.
2. Filter orders by status: **All**, **Pending Payment**, **Processing**, **Dispatched**, **Delivered**.
3. Click an order number to open the **Full Order Manifest**:
   - Customer name, international delivery address, email, and phone.
   - List of items ordered with quantities and pricing.
   - Payment method used (Credit Card, mBoB, or Bank Transfer).
4. **Verifying Payment**:
   - For Bank Wire or mBoB orders: Verify the payment receipt against the order reference number (e.g. `HAB-2026-XXXX`).
   - Click **[Mark as Paid]**.
5. **Packing & Dispatch**:
   - Package the artisanal products with HAB CSO certificate of origin.
   - Hand the parcel to Bhutan Post EMS or DHL.
   - Enter the official **Courier Tracking Number** (e.g. `BT102938475`).
   - Click **[Mark Dispatched]**.
6. The customer can track their parcel in real-time on `/track-order`.

---

## 12. In-Store Counter Billing Point of Sale (POS)
**Admin Route:** `/admin/pos`

### Operating the Counter Billing Screen
Designed for staff running the physical retail counter at the HAB Secretariat or Punakha Market:
1. Go to **Shop & E-Commerce > Counter Billing (Live POS)**.
2. In the search box, scan or type a product code (e.g. `LHA01`, `SAD03`, `FTB04`).
3. Click **[+ Add to Cart]**. Items appear in the current sale manifest with live subtotal and tax calculation.
4. Select the payment method:
   - **Cash**: Enter amount tendered; system displays exact change due.
   - **mBoB / Bhutan QR**: Generates dynamic payment QR code on screen.
   - **Credit / Debit Card**: Process card on the terminal.
5. Click **[Complete Sale & Print Receipt]**.
6. System deducts stock from inventory in real time and logs the transaction.

---

## 13. B2B Wholesale Accounts, Bulk Orders & Lookbook Catalog
**Admin Route:** `/admin/trade`

### Managing Wholesale Operations
1. Go to **Shop & E-Commerce > Wholesale Accounts & Orders**.
2. **Wholesale Sourcing Rules**: Set default Minimum Order Quantity (e.g. 10 pieces) and lead times (e.g. 3–5 weeks).
3. **B2B Catalog & Media**:
   - Upload the official **Wholesale Catalog PDF** for institutional buyers.
   - Upload the **Trade Lookbook Cover Artwork**.
4. **Trade Registrations**: Review and approve wholesale applications from international boutique buyers, interior designers, and museum shops.

---

## 14. Newsroom Editorial Feed & Press Releases
**Admin Route:** `/admin/content`

### Publishing News & Announcements
1. Go to **Website Pages > News & Stories**.
2. Click **[+ Add New Story]**.
3. Enter Story Title, Category (Sector News, Feature, Tender Notice, Announcement), and Publish Date.
4. Upload the **Cover Story Banner Image**.
5. Write your article using the rich text editor (supports bold, italics, headings, bullet lists, blockquotes).
6. Click **[Publish Story]**.
7. The story immediately appears in the 2-column editorial feed on `/news`.

---

## 15. Exhibitions, Bazaars & Calendar Events
**Admin Route:** `/admin/events`

### Adding an Event to the Calendar
1. Go to **Website Pages > Exhibitions & Events**.
2. Click **[+ Add Event]**.
3. Set event details:
   - **Title**: e.g., `Autumn National Craft Bazaar 2026`
   - **Event Type**: Exhibition, Training, Bazaar, or Export Clinic.
   - **Date & Time**: Calendar day, month, and time duration.
   - **Venue**: Location in Bhutan (e.g., `Clock Tower Square, Thimphu`).
   - **Promotional Banner**: Upload event poster artwork.
4. Click **[Save Event]**.
5. Appears automatically on the events calendar at `/events` and the homepage calendar sidebar.

---

## 16. Donations, Support Pillars & Statutory Bank Remittance
**Admin Route:** `/admin/donate-settings`

### Managing Support Pillars
1. Go to **Website Pages > Donation Appeals**.
2. Review the 4 statutory funds:
   - *Endowment Fund for Bhutanese Artisans*
   - *Artisan Emergency & Medical Relief*
   - *Master Skills Transmission & Apprenticeship*
   - *Women in Craft Empowerment*
3. Upload custom illustration/icon artwork for each pillar.
4. Set funding targets and current amounts raised.

### Official Bank Wire Remittance Reference
The public donation screen at `/donate` provides automated wire remittance instructions with the following statutory credentials:
- **Beneficiary Bank:** Bank of Bhutan Limited (BOB)
- **Account Title:** Handicrafts Association of Bhutan
- **CSO Reg Number:** CSO/2011/043
- **Account Number:** 201104300189
- **SWIFT Code:** BOBTBLBT

---

## 17. Statutory Programmes (A–K) & Donor Funded Projects
**Admin Routes:** `/admin/programmes`, `/admin/projects`

### Managing Programmes (a) through (k)
1. Go to **Website Pages > Training Programmes**.
2. Article 3.2 of the Articles of Association governs 11 statutory programme objects:
   - (a) Raw material supply & sustainable harvesting
   - (b) Master-apprentice traditional skill transfer
   - (c) Quality standardization & CSO certification
   - (d) Market access & retail outlet management
   - (e) Export documentation & international trade
   - (f) Cluster enterprise development & machinery grants
   - (g) Intellectual property & cultural preservation
   - (h) Design innovation while retaining traditional iconography
   - (i) Youth and women employment in rural craft
   - (j) Living wage benchmarks & artisan welfare
   - (k) Sector census, research & publications
3. Edit descriptions, download links, and photo galleries for each programme area.

### Donor Projects
1. Go to **Website Pages > Donor Projects**.
2. Create project records for donor partners (e.g. EU SWITCH-Asia, UNDP Bhutan, GEF Small Grants).
3. Record project budgets, target milestones, and upload final evaluation PDF reports.

---

## 18. The 13 Traditional Arts & Crafts of Zorig Chusum
**Admin Route:** `/admin/crafts`

### Updating Craft Heritage Profiles
Profiles for each of the thirteen traditional arts are fully editable:
- **1. Shingzo** — Woodwork & carpentry
- **2. Parzo** — Wood & stone carving
- **3. Jinzo** — Traditional clay sculpting & statuary
- **4. Lhazo** — Sacred thangka painting & mineral pigments
- **5. Lugzo** — Bronze & metal casting
- **6. Garzo** — Blacksmithing & ironwork
- **7. Tshazo** — Cane & bamboo weaving
- **8. Dezo** — Traditional handmade Daphne papermaking
- **9. Troezo** — Gold & silver ornament chasing
- **10. Tshemzo** — Tailoring, embroidery & bootmaking
- **11. Thagzo** — Supplementary weft silk & wool weaving
- **12. Shagzo** — Wood turning (dapa bowls & cups)
- **13. Choezo** — Traditional leather craft

Each profile includes tool lists, regional craft clusters, raw material notes, and direct links to shop items.

---

## 19. Physical Outlets, Punakha Market & Artisan Village Clusters
**Admin Route:** `/admin/clusters-outlets`

### Managing Markets & Outlets
1. Go to **Website Pages > Outlets & Craft Shops**.
2. Manage flagship physical counters:
   - **Punakha Weekend Crafts Market**: Managed directly by HAB beside the Mo Chhu river with 32 verified stalls.
   - **Thimphu Central Craft Outlet**: Main retail showroom.
   - **Paro International Airport Counter**: Export and tourist retail point.
3. Edit operating hours, location directions, and storefront photography.

### Artisan Clusters
1. Manage cooperative village clusters (e.g. Khoma Weavers in Lhuentse, Kheng Bamboo Collective in Zhemgang, Bumthang Yathra House).
2. Update artisan member counts, established year, and village stories.

---

## 20. Publications, Annual Reports & Audited Financial Accounts
**Admin Route:** `/admin/publications`

### Publishing an Institutional Document
1. Go to **Website Pages > Reports & Publications**.
2. Click **[+ Add Publication]**.
3. Select Document Type: **Annual Report**, **Audited Accounts**, **Policy Study**, or **Sector Guidelines**.
4. Enter Publication Title, Year (e.g. 2026), and Summary Abstract.
5. Upload the **PDF Document File**.
6. Upload a cover preview thumbnail.
7. Click **[Publish]**.
8. Appears instantly on `/publications` with free public PDF download capability.

---

## 21. Institutional Policies, Legal Terms & Customer Service Settings
**Admin Routes:** `/admin/policies`, `/admin/site-settings`

### Editing Legal Policies
1. Go to **Website Pages > Policies & Rules**.
2. Select any institutional policy:
   - **Terms of Service** (`/terms`)
   - **Privacy Policy** (`/privacy`)
   - **Shipping & Delivery Policy** (`/shipping-policy`)
3. Edit section by section with rich text formatting. Click **Save Policy**.

### Customer Service & Contact Info
1. Go to **Settings & Customization > Website Settings** (tab: **Contact**).
2. Update official secretariat details:
   - Primary Office Phone: `+975-2-338089`
   - Executive Director Mobile: `+975-77654508`
   - Marketing Hotline: `+975-17462636 / 17881111`
   - Official Email: `officehab@gmail.com`
   - Physical Address: `Metog Lam, Thimphu, Kingdom of Bhutan`
   - Post Office Box: `P.O. Box 1234, Thimphu`
3. Click **[Save Contact Details]**.

---

## 22. Localization, Dual Currency (USD/BTN) & Exchange Rates
**Admin Route:** `/admin/localization` or `/admin/site-settings`

### Currency Configuration
The platform supports dual currency pricing:
- **USD ($)**: For international customers and export orders.
- **Nu. BTN**: For domestic customers within Bhutan and regional trade.
- **Setting Manual FX Rate Override**: Under **Settings & Customization > Currency & Language**, configure the reference exchange rate (e.g. `1 USD = 84.0 BTN`).
- Public visitors can switch currency instantly using the currency toggle chip in the top header.

---

## 23. Staff Logins, User Accounts & Role Permissions
**Admin Route:** `/admin/users`

### Managing Staff Accounts
1. Go to **Settings & Customization > Staff Logins**.
2. Click **[+ Add New Staff Member]**.
3. Enter their Name, Official Email, and temporary password.
4. Assign their Role:
   - **Super Admin**: Complete unrestricted control over all studios, financial settings, and user logins.
   - **Staff Operator**: Operational access to products, orders, news, events, and member profiles.
   - **Shop Attendant (POS)**: Restricted access to Counter Billing (POS) and inventory search.
5. Click **[Create User]**.

---

## 24. Database Backups, Disaster Recovery & VPS Deployment
### Database Backups
Automated database backup scripts are located in the `scripts/` directory:
- Run a manual backup anytime on the VPS:
  ```bash
  node scripts/db-backup.mjs
  ```
- Backups are stored timestamped in `.backups/` with full table data.
- To restore a backup:
  ```bash
  node scripts/db-restore.mjs
  ```

### VPS & aaPanel Deployment Command
To automatically pull latest updates, synchronize database schema, rebuild, and reload PM2 with zero-downtime:
```bash
bash scripts/deploy-aapanel.sh
```

Or manually:
```bash
git fetch origin main && git reset --hard origin/main
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push --accept-data-loss
npm run build
pm2 reload habbhutanplatform --update-env || pm2 start ecosystem.config.js
pm2 save
```

### Essential PM2 Process Commands on VPS:
```bash
pm2 status                      # Check service status and memory usage
pm2 logs habbhutanplatform      # Stream live application logs in real-time
pm2 reload habbhutanplatform    # Zero-downtime hot reload
pm2 restart habbhutanplatform   # Full restart of the application process
pm2 stop habbhutanplatform      # Stop the application
pm2 monit                       # Terminal dashboard monitoring CPU & RAM
```

---
*Official Manual Document compiled for the Handicrafts Association of Bhutan (HAB).*  
*Royal Civil Society Organization Certificate: CSO/2011/043 · Thimphu, Kingdom of Bhutan.*
