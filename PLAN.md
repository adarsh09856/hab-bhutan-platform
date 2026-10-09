# Handicrafts Association of Bhutan (HAB) — Master Architecture, Deep File-by-File Audit, Universal Quick Edit & 2-Way Sync Plan (PLAN.md)

## Current live status and remaining checks — 9 October 2026

Deployment reconciliation (9 Oct 2026): the guarded release confirmed production at `5162d00`; live health reports PostgreSQL connected. Git ancestry confirms that commits `f1f2845`, `30e403f`, `125bd73`, `74e0028`, `469554a`, `9ca9e9c`, `64daddd`, `81f603f`, `64ae6cd`, `16b9a5f`, and `406b9d3` are present in that checkout. Older chronological entries saying these changes were “not deployed,” “pending,” or “SSH blocked” describe an earlier checkpoint and are superseded. This proves deployed code presence, not every interactive workflow; retain only the specific browser/external-service gaps below.

Rate-limit verification/fix (9 Oct 2026): source inspection confirmed that login, password-reset requests, and checkout accepted the unauthenticated `x-bypass-rate-limit: true` header and skipped throttling. Removed that bypass in all three handlers. Local HTTP regression sent only empty/invalid payloads with the header and a unique test identity: login returned five 401 responses then 429; password reset returned five 400 responses then 429; checkout returned ten 400 responses then 429. Exact temporary rate-limit/audit rows were cleaned; no accounts, orders, emails, or production submissions were created. Local optimized build passed. Release `98a041e` is pushed and deployed; production schema was already synced, optimized build passed, and HAB PM2 returned online. Production throttle submissions were deliberately not performed.

Most planned modules are implemented and deployed. The previous **56% implementation estimate had no weighted denominator and should not be used as a completion claim**. Status below separates a live feature from the narrower check or genuine gap that remains:

1. **Public website — live:** the latest read-only check returned HTTP 200 for home, programmes, wholesale shop and membership application; the earlier 76-route audit found 76 HTTP 200 responses. **Remaining:** compare every route and new/detail page with the HTML reference for full data, text, layout, links and responsive design. HTTP status does not establish parity.
2. **Quick Edit — live globally:** `UniversalPageQuickEdit` is mounted in the shared public layout, so canonical public pages and custom pages inherit leaf text/link/image/placeholder editing; page-local badge scans alone undercount this. A source scan of 78 route templates found many of the 25 without a local badge are redirect aliases, re-exports, or pages whose shared component owns the badge. **Remaining:** prove image upload, save/undo/close and immediate refresh end-to-end in an authenticated browser; confirm actual canonical routes' visual controls.
3. **Admin — live:** the main module screens and CRUD APIs exist; wholesale product controls and several Admin actions have local integration tests. **Verified:** signed-in production logout returned to login and a protected Trade Desk revisit redirected to login (release `fbbf569` below). **Remaining:** complete the module-by-module browser/role/usability audit; do not list logout itself as unfinished.
4. **Homepage arrivals — implemented and deployed:** Admin now has published-product search, selection and manual ordering (up to 8); with no saved list the existing rotation stays on. Selection logic passed its focused regression; production settings expose the field, currently empty. **Remaining:** signed-in Admin visual/save interaction is UNVERIFIED; do not change production selection without HAB choosing products.
5. **Dzongkha — partly live:** header/footer and several page translations, plus editable programme fields, are deployed. **Remaining:** every-page visible-text inventory, saved translation coverage, language-switch persistence and HAB review of machine-authored copy.
6. **Payments/applications — partly live:** membership and wholesale submission/review flows and bank/mBoB/BNB reference handling exist, with scoped local API tests. **Remaining:** authenticated staff/browser and notification tests; card processing requires an actual configured provider and is currently unavailable.
7. **Excel — live:** both member and wholesale Admin screens include XLSX/CSV upload, templates, preview, row-error display and export; their protected import APIs have local multi-row/duplicate tests. The current spreadsheet validation suite passed XLSX Unicode round-trip, required member fields, within-file duplicate IDs/emails, and invalid wholesale email. **Remaining:** signed-in browser file-selection/preview/import/export checks. Do not describe the system as needing initial implementation.
8. **Images/details — partly verified:** 38 same-origin rendered/CSS image URLs passed the read-only availability audit, and detail-field Admin/public APIs were locally tested. Cluster detail pages query saved products/members and outlet cards use saved images; live GETs verified `/clusters/khoma` and `/outlets/punakha-market` after release `5b047a5`. **Remaining:** browser-only and remote images, sharpness/authenticity, replacement list and every saved-field/public-page comparison.
9. **Release state — live:** guarded deployments and health checks have passed, including the recent rate-limit fix. Record new evidence only for a concrete change or uncovered behavior; production records and forms remain read-only.

Audit snapshot (9 Oct 2026, updated after verified releases): rough implementation coverage is **about 78%** across the 11 original requirement groups, weighting groups equally and counting partial work proportionally. This is a planning estimate—not an end-to-end pass rate. The latest-arrivals picker/order and cluster/outlet saved-data fixes are now implemented and deployed. The largest remaining work/evidence areas are exhaustive page/reference parity, Quick Edit browser/save/upload coverage, module-by-module Admin browser CRUD/usability, all-field saved-data display, all-visible-copy editability/localization, and real provider/payment workflows. Re-score only after a checklist audit with fresh evidence.

Homepage featured-arrivals control (9 Oct 2026): added a published-product picker to `/admin/pages/home` with search, an eight-item cap and explicit move-up/down ordering. Selection is stored additively in the existing SiteSetting `trustBadges` JSON; the write API rejects non-string, over-limit, and non-published SKUs. The public settings API returns the saved order; homepage rendering honors it and does not silently substitute other products if selected SKUs become unavailable. With no manual selection, the previous automatic rotating arrivals behavior remains. The isolated ordering regression passed manual order, automatic mode, removed SKU, deduplication and item-limit checks; typecheck, `git diff --check` and full optimized production build passed. Commit `20fcf02` is pushed and deployed by the guarded release; production schema was already synced, the optimized build passed, HAB PM2 returned online and the server health check succeeded. Read-only live checks confirmed `/` returns 200 and `/api/site-settings` returns the new `shopProductCodes` field (currently empty, so live homepage behavior is unchanged). Signed-in Admin visual/save interaction remains **UNVERIFIED**; no live setting was changed.

Wholesale price-tier compatibility (9 Oct 2026): the offer resolver, Trade Desk card, and editor previously accepted only tuple-shaped price breaks (`[quantity, price]`). Added one normalizer that also reads named historical shapes (`quantity`/`price`, `minQty`/`unitPrice`, etc.) across Admin listing, edit/save, product disable handling, and public wholesale eligibility. Blank values remain invalid rather than becoming a zero-price offer. `scripts/verify-wholesale-offer.mjs` passed the tuple/object, duplicate, blank, inactive and JWT-secret cases; featured-order regression, typecheck, `git diff --check`, and optimized production build also passed. Commit `3ab004d` is pushed and deployed by the guarded release; schema was already synced, optimized build and health recovery passed. Read-only checks returned 200 for `/wholesale/shop`, healthy PostgreSQL status, and expected 401 responses from signed-out `/api/trade` and `/api/admin/trade`. No production terms were inspected or modified. Authenticated UI confirmation remains **UNVERIFIED**.

Cluster/outlet saved-data audit (9 Oct 2026): source inspection found cluster detail cards were using static sample products and members even though the live API provides saved cluster, product and member records; related-outlet cards also reused one generic image. Cluster detail now queries published, non-test products for the cluster craft and verified members for that craft, with the existing sample data retained only as a database-error fallback. Related-outlet cards now use each outlet's saved image URL, with the prior generic photo only as a fallback. Verification: typecheck, spreadsheet validation, `git diff --check`, optimized build, and live read-only GETs passed. Commit `5b047a5` is pushed and deployed. Live `/clusters/khoma` HTML includes the actual product name returned by the corresponding product API; `/outlets/punakha-market` returned 200. No production records were changed.

Universal Quick Edit nested-text correction (9 Oct 2026): the global editor collected only direct text nodes, so editing a heading/paragraph containing inline `strong`, `em`, or `span` text could omit nested words. It now collects nested inline text while excluding nested links, controls, block descendants, SVGs, and aria-hidden content, and joins fragments without injecting extra spaces. Focused tests cover inline descendants, isolated nested link/block/icon content, and normalized fragment joining; arrivals and wholesale regressions, typecheck, `git diff --check`, and optimized build passed. Commit `5162d00` is pushed and deployed. The guarded release passed schema sync, optimized build, HAB PM2 restart and health recovery; read-only live checks returned healthy PostgreSQL status and HTTP 200 for `/`, `/clusters/khoma`, and `/product/HHB10`. No production content was changed. Authenticated browser interaction for the editor remains **UNVERIFIED**.

Linked-image Quick Edit follow-up (9 Oct 2026): an image nested inside a link now exposes the link destination alongside image source/alt text and applies saved `href` overrides to its parent anchor. Typecheck and optimized production build passed; the build generated all routes. Live authenticated editing/upload remains **UNVERIFIED**; deploy status is recorded separately after release verification.

Admin logout follow-up (9 Oct 2026): inspected the Admin sidebar click handler and auth cookie configuration, then exercised the built app over loopback. `POST /api/auth/logout` returned HTTP 200 with `hab_session` cleared (`Path=/`, `Max-Age=0`, `HttpOnly`, `SameSite=lax`); the next unauthenticated `/admin` request returned 307 to `/admin/login?redirect=%2Fadmin`. This is additional endpoint evidence. The earlier signed-in production browser logout/revisit was already verified in the `fbbf569` release entry below.

Programme Dzongkha CRUD (9 Oct 2026): added nullable Dzongkha title, description, and activity fields for programme records; exposed them in Admin programme CRUD and Quick Edit Records; and rendered saved translations with English fallback on programme index/detail pages. Added an additive, rerunnable schema migration and `scripts/verify-programme-dz-crud.mjs`, which is loopback-only and cleans its temporary fixtures. Prisma validation, typecheck, and optimized production build passed. An end-to-end local Admin-create/update → public-API-read regression passed against an isolated temporary UTF-8 database. The pre-existing local `hab_platform` database is WIN1252 and cannot store Dzongkha; it was not altered by the failed Unicode test or replaced. Commit `9a13785` is pushed and deployed by the guarded script; production schema sync and build passed, HAB PM2 returned online, health reported PostgreSQL connected, and GET `/api/programmes` and `/programmes` returned 200 with all 11 records and the new translation fields. No production programme records were changed. Translation wording is machine-authored and requires HAB editorial review; editorial review and saved-production-translation coverage remain **UNVERIFIED**. Overall plan remains in progress.

Product-to-wholesale control (9 Oct 2026): Products add/edit and public product Quick Edit record form each show a single "Enable wholesale" checkbox, without B2B pricing fields. Checking an unpriced product opens that SKU in the Wholesale Trade Desk pricing drawer. Existing valid terms can be enabled/disabled from Products; disabling persists a database override so legacy terms cannot reactivate the offer. Trade Desk owns B2B pricing/terms CRUD. Commits `332965a` and `40d12e7` were pushed and deployed by the guarded script; schema was already synced, optimized builds passed, the named HAB PM2 process restarted online, and live health reported PostgreSQL connected. Signed-in production browser inspection confirmed the checkbox in add, edit, and Quick Edit product forms and showed the Quick Edit list loading 21 products; opened records were closed without saving. The loopback integration verifier passed product create/public-read/update/admin-list, wholesale price tier create/read/update, wholesale enable/disable persistence, member contact CRUD/privacy, member-import validation/permissions, and duplicate re-import prevention; all temporary records were cleaned up. Production CRUD mutation remains **UNVERIFIED**; no live catalog records were changed.

Wholesale create-flow validation follow-up (9 Oct 2026): the dedicated “Add wholesale product” drawer now requires a production lead time before enabling a new B2B offer and explicitly blocks more than the API-supported eight price breaks. This aligns its validation with the existing Trade Desk editor and avoids saving an enabled offer that the regular edit flow would reject. `npm run typecheck`, `git diff --check`, `npx tsx scripts/verify-wholesale-offer.mjs`, and the complete optimized `npm run build` passed. The change is present in `main` at `64ae6cd` and was included in production release `a425b76`; that later guarded release passed Prisma sync, optimized build, PM2 restart and health recovery. The focused wholesale drawer itself has not been visually rechecked in a signed-in browser, so browser interaction and production CRUD remain **UNVERIFIED**.

Checkout card-payment safety (9 Oct 2026): found that the UI collected raw card fields without sending them to a payment processor, while `/api/orders` marked the request paid as a sandbox simulation. Removed the fake card form and its API success path; checkout now defaults to mBoB, and direct CARD requests return HTTP 503 before order creation or inventory changes. The old runtime verification expectation was updated to require that rejection and verify no order/stock mutation. Expanded the localhost payment guard test; built-app loopback execution passed for order-card rejection, membership/wholesale card rejection, and missing bank/mBoB proof rejection. Full optimized build and typecheck passed. Real server-side card-provider integration remains **PENDING**; card checkout is intentionally unavailable until configured and tested. Deployment follow-up: release `4dbd033` was deployed by the guarded production script; schema was already in sync, optimized build passed, the HAB PM2 process returned online and the local health check succeeded. Read-only live GET checks returned 200 for `/api/admin/health` (PostgreSQL connected) and `/checkout`; the served HTML no longer contains the fake sandbox claim or card-number placeholder. No live checkout was submitted, and no production records/forms were changed. Authenticated payment workflow and actual provider integration remain **UNVERIFIED/PENDING**.

BNB payment-method integrity (9 Oct 2026): public checkout previously translated BNB Pay to the `MBOB` enum, making Admin and confirmation instructions misidentify the bank. Added a distinct `BNB` database enum member and additive migration, preserved BNB through the public order API, gave the Admin transaction-reference display a provider-specific label, and rendered confirmation instructions with the correct BNB identity and reference. `prisma validate`, client generation, typecheck and optimized build passed. A loopback API/database regression created a temporary local product/order and confirmed `paymentMethod=BNB`, correct transfer reference, and `PENDING` payment state; it then removed the test order/product and its exact fallback-store copy. The one earlier failed test fixture was also removed by exact order number; other `.data` records were preserved. Deployment follow-up: release `6d0a844` was fast-forwarded by the guarded script; production Prisma schema sync succeeded without a data-loss override; optimized build passed; only the HAB PM2 app was restarted and returned online after health recovery. Read-only live GET checks returned 200 for `/api/admin/health` (PostgreSQL connected), `/checkout`, and `/order-confirmation/LOCAL-READONLY-CHECK`; no production order was submitted. Signed-in order Admin display and a genuine customer BNB order remain **UNVERIFIED**.

Unverified transfer-order state correction (9 Oct 2026): mBoB and BNB orders are now saved as `PENDING` / `PENDING_PAYMENT` rather than entering order processing before staff verifies payment. The public order API rejects either method when its transaction reference is missing, even if a client bypasses the checkout form. Corrected bank, mBoB and BNB confirmation instructions to state that dispatch follows verification instead of promising automatic payment approval. Typecheck and the complete optimized build passed; the local BNB regression passed missing-reference rejection for both providers plus successful BNB reference persistence and pending statuses, with local test product/order/fallback fixtures cleaned. Deployment follow-up: release `a425b76` was deployed by the guarded script, production schema was already in sync, optimized build passed, and only the HAB PM2 process was restarted and returned online. Read-only live GET checks returned 200 for `/api/admin/health` (PostgreSQL connected) and `/order-confirmation/LOCAL-READONLY-CHECK`; the previous false promise of automatic paid/dispatched status is absent. No live order or payment was submitted. Signed-in staff review and fulfilment behavior remain **UNVERIFIED**.

Full public route/image availability refresh (9 Oct 2026): restored the optimized local build after the development server replaced its `.next` manifest; the first audit invocation correctly yielded zero routes and was discarded. Rerun against the production route manifest fetched 76 live public route variants: all 76 returned HTTP 200. It discovered and checked 38 same-origin rendered/CSS image URLs, all successful, across two linked stylesheets. This is availability evidence only; browser-only/lazy images, external-host images, quality, text/data parity, and visual parity remain **UNVERIFIED**.

File inventory evidence correction (9 Oct 2026): `scripts/file-by-file-verifier.mjs` previously labeled source-presence/editor-marker checks `VERIFIED_PASS`, which overstated its evidence. It now reports `SOURCE_SCAN_ONLY` and explicitly states it does not prove rendered parity, content completeness, or working CRUD. Regenerated `scripts/file-by-file-results.json` now preserves that limited status for all 44 route templates. `node --check` and the inventory run passed; no application code or site data changed.

**Project**: Handicrafts Association of Bhutan (HAB) National E-Commerce & Artisans Platform  
**Target Next.js Platform (Execution Target)**: `E:\ai\bhutanprojects\newbend` (Next.js 15 App Router, Prisma ORM, PostgreSQL, Sharp image pipeline, TypeScript)  
**Reference Static HTML Source**: `E:\Downloads\Final_webdesign\hab-site` (34 HTML templates, `data.js`, `pages.js`, `backend.js`, `style.css`)  
**Live Target Reference**: `https://hab.touratbhutan.info`  
**Reference policy**: `E:\Downloads\Final_webdesign\hab-site` is read-only; no backup folder is created.
**Commit Reference**: `40ee78f` / `7c2e6b0`  
**Last Updated**: October 2026  

## Recent progress — Wholesale Admin shortcuts (8 Oct 2026)

- Elevated **Create wholesale order** (opens `/admin/orders?createWholesale=1`) and **Manage products** (`/admin/products`) to the main wholesale-page toolbar; removed the duplicate task-card block below the header.
- Product CRUD: Admin → Products. B2B terms (MOQ, lead time, customization, tier pricing): Admin → Wholesale Trade Desk. Wholesale order creation is now a primary action in the Wholesale Buyer Accounts page.
- `npm run typecheck` and `git diff --check` passed. Production build and browser interaction for this exact toolbar change are **UNVERIFIED**; this is a focused usability fix, not full-plan completion.

## Recent progress — B2B pricing integrity (8 Oct 2026)

- Removed the Trade Desk's fictional sample wholesale quotes and buyer inquiries and its client-data product fallback. A database read outage now surfaces as an error rather than showing fabricated business records.
- New retail products no longer receive guessed B2B tiers derived from their retail price. The Admin Trade Desk shows unconfigured products as inactive with no price breaks; the public wholesale catalogue omits them until terms are explicitly saved. Quote submission rejects products without active, valid configured terms rather than calculating an unapproved buyer-discount price.
- Shared eligibility validation normalizes saved/legacy tiers, rejects inactive or malformed/missing pricing, and is covered by `scripts/verify-wholesale-offer.mjs` (passed). `npm run typecheck` and `git diff --check` passed. Production build, authenticated browser catalogue, and real quote workflow remain **UNVERIFIED**; no production data or submitted quote was changed.
- Follow-up reliability fix: Trade Desk quote/registration status actions no longer swallow database errors and return false success; they report success only after the PostgreSQL update resolves. Typecheck and full optimized build passed. Authenticated UI mutation remains **UNVERIFIED**.
- B2B session security follow-up: removed hard-coded fallback JWT secrets from the wholesale catalogue and quote endpoints. Login, session inspection, catalogue access and quote requests now share one validator requiring a configured 32+ character `JWT_SECRET`; missing configuration returns a service error rather than authenticating with a known secret. The local verifier checks absent/short/valid secret behavior; typecheck passed. Full build and authenticated forged-token/runtime checks remain **UNVERIFIED** at this checkpoint.

## Recent progress — Wholesale spreadsheet import safety (9 Oct 2026)

- Excel/CSV wholesale import now forces all newly imported buyers to `PENDING`; rows can no longer activate accounts whose randomly generated password is unknown to the buyer. The preview template and import modal explain that staff approval sends credentials.
- Server-side import checks normalized email and username duplicates against a single prefetched set from PostgreSQL/fallback storage and against earlier valid rows in the same upload; this avoids repeated database/file lookups for large files. Invalid usernames are reported against their spreadsheet row, and fallback buyer records retain the generated password hash for reliable local fallback authentication after approval.
- Extended `scripts/test-spreadsheet-validation.ts` to assert a supplied `ACTIVE` status previews as `PENDING`. Typecheck, the ExcelJS spreadsheet validation suite (including XLSX/Dzongkha round-trip and duplicate detection), and `git diff --check` passed. The authenticated multi-row API import, repeat-upload DB behavior, and browser preview remain **UNVERIFIED**; no real member/buyer data or `.data` files were touched.
- Member-import correction: CID/business licence is now the duplicate identity instead of name, so distinct artisans with the same name are retained. The server preloads existing identity keys once, unspecified or invalid verification status defaults to `PENDING`, and imported member records no longer receive a shared generic HAB portrait. The preview template explains the status rule. The spreadsheet test now covers repeated ID rejection, same-name/different-ID acceptance, and the pending default. Typecheck, spreadsheet validation and `git diff --check` passed; authenticated database import and member-directory browser QA remain **UNVERIFIED**.

---

## Recent progress — Wholesale product creation and member contacts (9 Oct 2026)

- Added an in-place **Add wholesale product** drawer to Wholesale Buyer Accounts and Trade Desk. It creates the shared catalog product, uploads its photo through the existing media uploader, and saves explicitly entered MOQ, lead time, customisation, up to eight quantity-price breaks, and the B2B enable checkbox. It stays on the wholesale page. If product creation succeeds but terms saving fails, retry reuses the saved SKU and does not create a second product. Signed-in visual interaction, upload and retry behavior remain **UNVERIFIED**.
- Added nullable village, phone and email columns to Member with an additive SQL migration. Admin create/edit, spreadsheet import and existing export now retain these fields; public member API responses omit private phone/email. The local schema sync succeeded without destructive flags. Production schema sync and deployment remain **PENDING**.
- Local optimized build and typecheck passed, with existing repository lint warnings. Extended `scripts/verify-product-detail-fields.mjs` passed authenticated product creation, wholesale MOQ/tier persistence, enable/disable persistence, member contact create/update/admin read and anonymous public contact privacy. Temporary local fixtures and their audit records were cleaned. The initial run against the Next CLI server failed session authentication; the successful run used the repository's production `server.js` with its normal environment loading. No production data/forms were written. Production deployment remains blocked by the previously recorded SSH authentication failure; full-site parity and authenticated visual workflows remain open.

## Release and member-import follow-up (9 Oct 2026)

- Password-prompt SSH authentication restored deployment access. Release `406b9d3` was fast-forwarded, its three nullable Member columns synced, and its full production build completed. The guarded script restarted only `habbhutanplatform` and passed health recovery. Live read-only checks returned 200 for health, home, wholesale, wholesale shop, and the admin wholesale/trade page endpoints; anonymous admin products/members API requests returned 401. This proves deployment and availability, not signed-in visual CRUD. Production records/forms were not submitted or edited; existing untracked server data/uploads remained intact.
- Member import now uses the same live account/role permission check as ordinary member creation. It reports unknown craft keys, invalid emails, and invalid join years against original spreadsheet row numbers; preview also reports invalid emails/years. Local optimized build, spreadsheet validation and the expanded authenticated integration verifier passed: pending/contact persistence, invalid-craft row reporting, repeated-upload duplicate prevention, anonymous denial, and denial of a suspended account's existing token. Temporary fixtures were cleaned. Browser XLSX preview/import remains **UNVERIFIED**; production deployment of this follow-up is pending.

- Release follow-up: `16b9a5f` deployed through the guarded script; schema was already synced, production build and targeted restart/health recovery passed. Public health returned 200. A fresh read-only production audit fetched 76 public routes (all 200) and checked 38 rendered HTML/CSS same-origin image URLs (none broken). Client-only images, image quality, HTML-reference visual parity, approved translations, and signed-in browser CRUD remain **UNVERIFIED**. No production record or form was mutated by the audit.

## Wholesale pricing, logout and member-count correction (9 Oct 2026)

- A signed-in production Trade Desk inspection confirmed the user's screenshot: `SKU-TEST-44899` had no saved wholesale terms, yet its card displayed a fabricated 5-unit MOQ and 4–6-week lead time; the pricing drawer opened with no price-break input and its enable checkbox unchecked. Source fixes now show “Set terms”/“Not set”/“No wholesale prices saved yet” and “Not configured” until terms exist. An unsaved product now opens with one editable MOQ-aligned price break and enable checked, while saved disabled products retain their disabled state. No production product was edited by this inspection. Post-release browser/save verification remains **PENDING**.
- Admin logout previously attempted to clear the HttpOnly `hab_session` cookie in client JavaScript, which cannot work. A dedicated server POST logout clears that cookie with the same path/security settings used at login; the sidebar waits for a successful response before navigating to login. Post-release browser verification remains **PENDING**.
- The `/members` page previously added hardcoded sector/dzongkhag baseline counts to real verified Member records and labeled the result “registered members.” It now counts only verified Member records, handles database unavailability and zero counts honestly, and derives dzongkhag rows from saved member locations. Local PostgreSQL contained 15 verified members; built local `/members` rendered “15 verified members recorded” with HTTP 200, rather than the fabricated baseline. Typecheck passed. Production page parity and editorial review remain **PENDING**.

## Wholesale editor and admin browser verification (9 Oct 2026)

- Release `fbbf569` was built and deployed through the guarded server flow. A signed-in live browser check found the existing `SKU-TEST-44899` card now says “Not configured,” “Set terms,” “Not set,” and “No wholesale prices saved yet.” Its pricing drawer has one MOQ-aligned quantity row and a checked enable box; no live terms were saved. A live browser logout returned to `/admin/login`, and revisiting `/admin/trade` redirected to the login page. Login then succeeded again with the user-provided staff account. This directly verifies the prior logout defect is fixed for that browser session.
- Follow-up: empty tier prices in the new editor must be explicitly entered before saving, and enabled terms require a production lead time. The Wholesale Buyer Accounts toolbar now links directly to Trade Desk pricing for existing products, and Trade Desk explains create/edit/remove terms versus editing/archiving the retail product. These changes are pending build and deployment; no production product or application record was mutated.

## 1. Executive Alignment & Core Mandate

### The Strict Development Rules
1. **NO FAKE SCRIPT COMPLETION CLAIMS**:
   - Never run a background test script (e.g. `verify-2way-sync.mjs`) and claim the job is "done". 
   - Every file must be physically updated, verified, and checked in the actual browser.
   - Do not mark items as "done" until the actual physical components and endpoints exist and operate.
2. **TRUE UNIVERSAL QUICK EDIT (EVERY TEXT, IMAGE, BUTTON, PARAGRAPH)**:
   - Quick Edit mode cannot be limited to 2 or 3 generic homepage fields.
   - Every text element (eyebrows, headings, ledes, body paragraphs, badges), every button (labels, target links), and every image asset (hero slides, banners, product photos, process triptychs, partner logos) across **all 34 pages** must be editable in-place via Quick Edit mode.
3. **COMPLETE SUB-PAGE & NAVIGATION PARITY**:
   - Sub-pages are not abstract link targets—they are full, physical pages (`/craft/[craft]`, `/product/[code]`, `/programme/[ref]`, `/project/[key]`, `/outlets/[key]`, `/clusters/[key]`, `/members/[slug]`, `/wholesale/register`, etc.) with real data, real images, and real Quick Edit controls.
   - Zero `#contact` placeholder links where specialized pages exist.
4. **MASTER 5-COLUMN FOOTER PARITY**:
   - The footer across all pages must 100% match `index.html` lines 600–677 and the live reference screenshot (`media_1791376678497.png`):
     - Logo lockup (`assets/hab-logo-footer.png`)
     - CSO Act 2007 signoff statement
     - 5 Social channels: Facebook, Instagram, X, YouTube, TikTok
     - Column 1: Secretariat (Metog Lam, Phone, Email, Executive Secretary Desk)
     - Column 2: Organization / Association (About HAB, Mandate & Act, Code of Ethics, Strategic Plan, CSO Registration)
     - Column 3: Shop & Support (E-Shop, Wholesale & Bulk, Shipping & Delivery, Returns, Track Order, Duty & Customs)
     - Column 4: Members (Directory by Category, Publications, Member Shops & Clusters, Member Login, Apply to Join)
     - Column 5: Governance (Board of Trustees, Secretariat, Annual Reports, Audited Accounts, Tenders & Vacancies, Terms, Privacy)
     - Bottom Bar: Copyright line + Currency label (`Nu. BTN` / `USD $`) + Payment notice (`Payments by card, mBoB and bank transfer`).
5. **ANNOUNCEMENT BAR TICKER**:
   - Notice counter fractions (`< 1/4 >`, `1/3`) removed across all views.
   - Previous/Next navigation controls (`‹`, `›`), rotating ticker items, and contact links preserved.
6. **2-WAY SYNCHRONIZATION (ADMIN <-> PUBLIC CRUD)**:
   - **Public -> Admin**: Public submissions (Wholesale accounts, Member registrations, Donors, Contact inquiries) with payment options (Card, mBoB, Bank transfer) and deposit slip uploads appear immediately inside the Admin Review Studios with clickable slip previews and Quick Approve/Decline actions.
   - **Admin -> Public**: Any change saved in Admin Studios or via Universal Quick Edit reflects immediately on public pages without stale caches or calculation bugs (`Nu. NaN`).

---

## 2. Universal Quick Edit System Architecture

To fulfill the requirement that **every text, image, asset, button, and paragraph** can be quick-edited:

### Component: `UniversalLiveSectionEditor.tsx`
The editor is expanded from a narrow settings dialog to a comprehensive, multi-tab modal that dynamically renders fields for the targeted section:

```
┌────────────────────────────────────────────────────────────────────────┐
│  LIVE SECTION QUICK EDIT: [Section Name]                    [✕ Close] │
├────────────────────────────────────────────────────────────────────────┤
│  [CONTENT & TEXT]   [ACTION BUTTONS]   [IMAGES & ASSETS]   [CARDS/LIST] │
├────────────────────────────────────────────────────────────────────────┤
│  TAB 1: CONTENT & TEXT                                                 │
│  ├── Eyebrow Tag / Kicker       (text input)                           │
│  ├── Main Heading (H1 / H2)     (text input)                           │
│  ├── Subtitle / Lede            (textarea)                             │
│  └── Body Paragraphs            (multi-paragraph rich textarea)        │
│                                                                        │
│  TAB 2: ACTION BUTTONS                                                 │
│  ├── Primary Button Label       (text input)                           │
│  ├── Primary Button Target URL  (text input + preset dropdown)         │
│  ├── Secondary Button Label     (text input)                           │
│  └── Secondary Button URL       (text input + preset dropdown)         │
│                                                                        │
│  TAB 3: IMAGES & ASSETS                                                │
│  ├── Primary Section Image/Banner (FileUploadInput + URL + focal)     │
│  ├── Image Caption & Alt Text   (text inputs)                          │
│  └── Gallery / Triptych Images  (multi-image uploader & slots)         │
│                                                                        │
│  TAB 4: CARDS & METADATA (Section-specific)                            │
│  ├── Stat numbers & labels (for stats sections)                        │
│  ├── Fact cells (Technique, Materials, Practised In for crafts)       │
│  └── Feature cards / bullets                                           │
├────────────────────────────────────────────────────────────────────────┤
│  [Cancel]                                      [✓ Save Changes Live]  │
└────────────────────────────────────────────────────────────────────────┘
```

### Universal Integration on Every Page:
Every public page mounts:
1. Floating **Quick Edit Mode** launcher (`AdminLiveBar.tsx` / `VisualSectionEditor.tsx`).
2. `SectionEditBadge` on every logical section (`data-hab-section="..."`).
3. Direct `onClick` trigger opening `UniversalLiveSectionEditor` with that section's content preloaded.
4. Immediate re-render / mutate upon saving to reflect updates in real-time.

---

## 3. Deep 34-Page Audit: Element-by-Element, Text-by-Text & Quick Edit Inventory

Below is the complete, exhaustive file-by-file audit of all 34 static HTML pages from `E:\Downloads\Final_webdesign\hab-site` matched directly to their production Next.js routes in `E:\ai\bhutanprojects\newbend`.

---

### [PAGE 1/34] `index.html` -> `/` (Homepage)
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\index.html` (63,894 bytes)
* **Next.js Route**: `src/app/(public)/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  1. **Utility Bar (`utility-bar`)**:
     - *Texts*: Notice ticker headlines, CSO status, Secretary Desk phone (`+975-2-338089`), Secretary email.
     - *Actions*: Links to Contact, Tenders, Publications, Donate, Wholesale, Language (`EN / རྫོ`), Currency (`USD $` / `Nu. BTN`).
     - *Quick Edit*: Section type `utility-bar` in `UniversalLiveSectionEditor`.
  2. **Hero Slider (`hero`)**:
     - *Texts*: Eyebrow (`Civil Society Organization · Bhutan`), Heading (`Towards a vibrant & sustainable handicrafts sector`), Lede (HAB mission narrative).
     - *Actions*: Primary CTA (`Our mission` -> `/about`), Secondary CTA (`Shop the crafts ->` -> `/shop`), Tertiary CTA (`Find a member` -> `/members`).
     - *Images*: 5 Carousel slides (`hero-1-weaving.jpg`, `hero-2-punakha.jpg`, `hero-3-clay.jpg`, `hero-4-textiles.jpg`, `hero-5-desho.jpg`).
     - *Quick Edit*: Live slide uploader, caption editor, and text controls.
  3. **Impact Statistics (`stats`)**:
     - *Texts*: 4 Stat numbers & labels (`7,500 Enterprises`, `5,250 Women-led`, `195 Affiliated stores`, `13 Zorig Chusum crafts`).
     - *Actions*: Links to `/members`, `/outlets`, `/shop`.
     - *Quick Edit*: Dedicated STATS tab in editor.
  4. **Two Ways to Buy (`buy`)**:
     - *Texts*: Eyebrow (`Two ways to buy`), Heading (`Retail or trade`), Retail description, Trade description.
     - *Actions*: Retail button (`/shop`), Wholesale button (`/wholesale`).
     - *Quick Edit*: Section type `buy` in editor.
  5. **About Band (`about`)**:
     - *Texts*: Eyebrow (`About us`), Heading (`A network built for artisans...`), 2 Narrative paragraphs.
     - *Actions*: Button (`Read about our programmes` -> `/programmes`).
     - *Images*: Master photo (`about-hab.jpg`) with focal alignment.
     - *Quick Edit*: Section type `about` in editor.
  6. **New in the Shop (`shop` / `products`)**:
     - *Texts*: Eyebrow (`Latest arrivals`), Heading (`New in the shop`), Lede (Consignment policy narrative).
     - *Actions*: Button (`Visit the shop →` -> `/shop`), `Add to cart` buttons on 8 live product cards.
     - *Images*: High-resolution product photos (`LHA01`, `SAD03`, `TRO04`, `FTB04`, `DAP02`, `MAS01`, `DEZ01`, `CUS02`).
     - *Quick Edit*: Section type `products` with Homepage Studio Tab 4.
  7. **Assurances Band (`assurances`)**:
     - *Texts*: 4 Trust cards: `Tracked Origin`, `Registered Chain`, `Upfront & Fair`, `Encrypted Escrow`.
     - *Quick Edit*: Section type `assurances` in editor.
  8. **Outlets & Markets (`outlets`)**:
     - *Texts*: Eyebrow (`Visit us in person`), Heading (`Our physical outlets & clusters`), Punakha market full description.
     - *Actions*: `Directions & Hours`, `Visit Punakha Market`.
     - *Images*: Punakha photography carousel (`hero-2-punakha.jpg`, etc.).
     - *Quick Edit*: Section type `outlets` in editor.
  9. **13 Crafts of Zorig Chusum (`crafts`)**:
     - *Texts*: Eyebrow (`Zorig Chusum`), Heading (`The 13 arts & crafts of Bhutan`), 13 craft cards with Dzongkha subtitles and summaries.
     - *Actions*: Links to `/craft/[craft]` for each craft.
     - *Images*: 13 authentic craft images (`dezo.jpg`, `dozo.jpg`, etc.).
     - *Quick Edit*: Section type `crafts` in editor.
  10. **Living Treasures (`masters`)**:
      - *Texts*: Accreditation criteria, Master profiles, Royal awards.
      - *Actions*: Links to `/masters`.
  11. **Statutory Programmes (`programmes`)**:
      - *Texts*: Pillars A–K summaries.
      - *Actions*: Links to `/programmes`.
  12. **Donor Support & Pillars (`donate`)**:
      - *Texts*: Grassroots fund, apprentice placements, cultural conservation.
      - *Actions*: Donate buttons and amounts selector.
  13. **News & Events (`news`)**:
      - *Texts*: Latest press dispatches and upcoming craft fair schedule.
      - *Actions*: Links to `/news` and `/events`.
  14. **Publications & Reports (`publications`)**:
      - *Texts*: Annual reports, audited financial accounts, research briefs.
      - *Actions*: PDF download buttons.
  15. **Development Partners (`partners`)**:
      - *Texts*: RGoB, EU SWITCH-Asia, UNDP, SHINE descriptions.
      - *Images*: Partner official logos.
  16. **Dual Membership Banners (`membership`)**:
      - *Texts*: Left: For Master Artisans; Right: For Institutional Buyers.
      - *Actions*: `/members` and `/wholesale`.
* **Current Status**: Verified & fully editable.

---

### [PAGE 2/34] `about.html` -> `/about`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\about.html` (33,419 bytes)
* **Next.js Route**: `src/app/(public)/about/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Eyebrow (`Civil Society Organization · Bhutan`), Title (`Empowering Bhutanese Artisans Since 2005`), Lede.
  - *Banner Image*: `about-hab.jpg` with focal alignment.
  - *Sections*:
    1. `Our mandate` (CSO Act 2007 civil society role).
    2. `How we are governed` (Board of Trustees & AGM).
    3. `The secretariat` (Executive team, Metog Lam office).
    4. `Strategic focus 2025–2030` (Market access, youth apprenticeship).
    5. `Our network across 20 Dzongkhags` (7,500 artisans, 70% women-led).
  - *Actions*: `Download AoA (PDF)`, `View Board of Trustees →` (`/board-of-trustees`), `Contact Secretariat →` (`/secretariat`), `Register as member →` (`/register`).
  - *Quick Edit*: Section type `about-page` with Content, Actions, and Media tabs.
* **Current Status**: Verified & mounted.

---

### [PAGE 3/34] `craft.html` -> `/craft/[craft]` & `/craft`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\craft.html` (33,638 bytes)
* **Next.js Routes**: `src/app/(public)/craft/[craft]/page.tsx` and `src/app/(public)/craft/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Badge (`01/13 · ZORIG CHUSUM`), Dzongkha name (e.g. `སྤར་བཟོ།`), English name (`Parzo · Wood & Slate Carving`), Description lede.
  - *Actions*: `Shop [Craft] →` (`/shop/[craft]`), `Visit [Craft] Outlets` (`/outlets`).
  - *Flipper Carousel*: 3 alternating process photographs.
  - *Facts Strip*: 4 cells: `Craft`, `Technique`, `Materials`, `Practised In`.
  - *How It Is Made*: Longread multi-paragraph making process narrative.
  - *Process Triptych*: 3 authentic process images with captions (`Parzo workshop`, `The master at work`, `Detail of technique`).
  - *In the Shop*: Dynamic grid of products belonging to this craft with code, name, dual-currency price, and `Add` button.
  - *Artisans Section*: "Who practises it" artisan cards with link to `/members`.
  - *Clusters Section*: "Where it is concentrated" cluster cards with link to `/clusters`.
  - *Bottom Nav*: Previous Craft and Next Craft links.
  - *Quick Edit Requirements*:
    - Mount `SectionEditBadge` on Hero, Facts, How It Is Made, Triptych, and Shop sections.
    - Wire `UniversalLiveSectionEditor` to update craft description, facts, and triptych images in-place.
* **Current Status**: `SectionEditBadge` missing on sub-sections; wiring in progress.

---

### [PAGE 4/34] `shop.html` -> `/shop` & `/shop/[craft]`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\shop.html` (32,291 bytes)
* **Next.js Routes**: `src/app/(public)/shop/page.tsx` and `src/app/(public)/shop/[craft]/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`The HAB e-shop`), Eyebrow (`Authentic Bhutanese Handicrafts`), Lede narrative.
  - *Filter Rails*: Craft selector (All + 13 Zorig Chusum crafts with counts), Price filter (`Under $50`, `Home & Living`, `Collector Pieces`).
  - *Sort Dropdown*: `Newest additions`, `Price: Low to High`, `Price: High to Low`.
  - *Product Grid*: Responsive product cards with code badge, image, title, maker, region, price, and `Add to Cart` button.
  - *Quick Edit*: Section type `products` with direct shortcut to Products Studio and banner editor.
* **Current Status**: Verified on `/shop`; wiring sub-route `/shop/[craft]`.

---

### [PAGE 5/34] `product.html` -> `/product/[code]` & `/product`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\product.html` (32,594 bytes)
* **Next.js Routes**: `src/app/(public)/product/[code]/page.tsx` and `src/app/(public)/product/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Breadcrumbs*: Home / Shop / [Craft] / [Product Name].
  - *Header*: Product Code (`LUD01`), Title, Craft category.
  - *Pricing*: Dual currency display (`Nu. BTN` / `USD $`), EMS shipping notice, Certificate of Origin notice.
  - *Action Buttons*: `Add to basket`, `Buy now`.
  - *Artisan Dossier*: Maker name, cooperative affiliation, village, dzongkhag, member since year.
  - *Specification Table*: Dimensions (H x W x D cm), Net weight (grams), Raw materials, Technique, Care instructions.
  - *Gallery*: High-resolution master photograph, zoom view, thumbnail strip.
  - *Related Products*: "More from this craft" 4-card grid.
  - *Quick Edit Requirements*:
    - Mount `SectionEditBadge` allowing administrators to edit product name, price, description, specs, and photos directly in-place.
* **Current Status**: Missing Quick Edit badge; wiring in progress.

---

### [PAGE 6/34] `basket.html` -> `/basket`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\basket.html` (32,562 bytes)
* **Next.js Route**: `src/app/(public)/basket/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Your Basket`), Item count.
  - *Table*: Item thumbnail, code, title, unit price, quantity increment/decrement, line total, remove (`✕`).
  - *Summary Card*: Subtotal, Bhutan Post EMS shipping estimate, Certificate of Origin (Free), Grand Total.
  - *Action*: `Proceed to Secure Checkout →` (`/checkout`).
  - *Trust Badges*: EMS Tracked delivery, 3-D Secure / mBoB accepted, Authentic artisan guarantee.
  - *Quick Edit*: Trust badges and shipping threshold editor.
* **Current Status**: Verified.

---

### [PAGE 7/34] `clusters.html` -> `/clusters`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\clusters.html` (32,008 bytes)
* **Next.js Route**: `src/app/(public)/clusters/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Artisan Clusters of Bhutan`), Eyebrow (`Community Guilds`), Explanatory Lede.
  - *Filters*: Dzongkhag selector (All 20 Dzongkhags) and Craft category tabs.
  - *Cluster Cards*: Photo, craft tag, cluster name, Dzongkhag, active members count, summary, `Read the story →` link.
  - *Quick Edit*: Section type `clusters` with direct shortcut to Clusters Studio.
* **Current Status**: Verified.

---

### [PAGE 8/34] `cluster.html` -> `/clusters/[key]` & `/cluster`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\cluster.html` (30,489 bytes)
* **Next.js Routes**: `src/app/(public)/clusters/[key]/page.tsx` and `src/app/(public)/cluster/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Cluster Name, Craft category, Dzongkhag, Founding year, Active members count.
  - *Story Section*: Multi-paragraph community history, weaving/crafting traditions.
  - *Visitor Etiquette*: Visiting rules, photography guidelines, direct purchase advice.
  - *Products Grid*: Pieces produced by this specific cluster in the HAB shop.
  - *Quick Edit Requirements*:
    - Mount `SectionEditBadge` to edit cluster name, story, visitor notes, and banner image.
* **Current Status**: Missing Quick Edit badge; wiring in progress.

---

### [PAGE 9/34] `outlets.html` -> `/outlets`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\outlets.html` (32,076 bytes)
* **Next.js Route**: `src/app/(public)/outlets/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Physical Outlets & Verified Markets`), Eyebrow (`Visit Us in Person`), Lede.
  - *Flagship Feature*: Punakha Crafts Market full card with photos, hours (`Daily, 09:00 – 18:00`), 32 stalls, verified badge.
  - *Regional Outlets*: Thimphu Secretariat Shop, Paro Airport Counter, Chumey Yathra Shed.
  - *Consignment Counters*: Zhemgang, Trongsa, Trashigang.
  - *Quick Edit Requirements*:
    - Mount `SectionEditBadge` allowing edits to outlet hours, locations, descriptions, and photography.
* **Current Status**: Missing Quick Edit badge; wiring in progress.

---

### [PAGE 10/34] `outlet.html` -> `/outlets/[key]` & `/outlet`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\outlet.html` (30,464 bytes)
* **Next.js Routes**: `src/app/(public)/outlets/[key]/page.tsx` and `src/app/(public)/outlet/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Outlet Title, Location, Operating hours, Payment methods.
  - *Getting There*: Directions, road access, parking details.
  - *Crafts Available*: Inventory summary of crafts on site.
  - *Contact*: On-site manager phone and secretariat desk.
  - *Quick Edit Requirements*:
    - Mount `SectionEditBadge` for in-place text and photo updates.
* **Current Status**: Missing Quick Edit badge; wiring in progress.

---

### [PAGE 11/34] `masters.html` -> `/masters`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\masters.html` (37,095 bytes)
* **Next.js Route**: `src/app/(public)/masters/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Living National Treasures & Master Artisans`), Eyebrow (`Royal Accreditations`), Lede.
  - *Criteria*: National master accreditation standards under Zorig Chusum.
  - *Master Cards*: Master artisan portrait, title, craft discipline, royal recognition, workshop location.
  - *Awards Section*: Best Craft Enterprise of the Year showcase.
  - *Nomination CTA*: Community nomination guidelines.
  - *Quick Edit*: Section type `masters` in editor.
* **Current Status**: Verified.

---

### [PAGE 12/34] `members.html` -> `/members`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\members.html` (33,478 bytes)
* **Next.js Route**: `src/app/(public)/members/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`The Sector, by the Numbers`), Eyebrow (`Certified Artisans`), Lede.
  - *Search & Filter Rail*: Search by artisan name, CID, Dzongkhag, or craft specialty.
  - *Artisan Cards*: Name, craft badge, Dzongkhag, membership tier, verified seal.
  - *Join Callout*: "Not a member yet?" banner linking to `/register`.
  - *Quick Edit*: Section type `membership` in editor.
* **Current Status**: Verified.

---

### [PAGE 13/34] `member.html` -> `/members/[slug]` & `/member`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\member.html` (31,776 bytes)
* **Next.js Routes**: `src/app/(public)/members/[slug]/page.tsx` and `src/app/(public)/member/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Profile Hero*: Portrait photo, artisan name, Dzongkhag, Gewog, Village, Member ID, Verified badge.
  - *Bio & Lineage*: Multi-paragraph heritage story, master mentors, techniques used.
  - *Artisan's Products*: Dynamic grid of shop pieces crafted by this artisan.
  - *Inquiry CTA*: Direct commission inquiry button.
  - *Quick Edit Requirements*:
    - Mount `SectionEditBadge` to edit artisan biography, village, and photo.
* **Current Status**: Missing Quick Edit badge; wiring in progress.

---

### [PAGE 14/34] `membership.html` -> `/membership`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\membership.html` (32,789 bytes)
* **Next.js Route**: `src/app/(public)/membership/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Five Ways to Belong`), Eyebrow (`Membership Tiers`), Lede.
  - *Five Tiers*: Individual Artisan (Nu. 500), Craft Enterprise (Nu. 2,000), Artisan Cluster (Nu. 3,000), Affiliated Member (Nu. 5,000), Honorary Member.
  - *Rights & Benefits Matrix*: Voting rights, shop consignment, training grants.
  - *Actions*: Apply link (`/register`), Login link (`/login`).
  - *Quick Edit*: Section type `membership` in editor.
* **Current Status**: Verified.

---

### [PAGE 15/34] `membership-category.html` -> `/membership/[category]` & `/membership-category`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\membership-category.html` (30,515 bytes)
* **Next.js Routes**: `src/app/(public)/membership/[category]/page.tsx` and `src/app/(public)/membership-category/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Tier Title, Annual Dues, Criteria.
  - *Eligibility*: CSO Act qualification requirements.
  - *Rights & Protections*: Representation, dispute arbitration.
  - *Action*: `Apply Under This Category →` (`/register?tier=...`).
  - *Quick Edit Requirements*:
    - Mount `SectionEditBadge` to edit tier criteria and dues.
* **Current Status**: Missing Quick Edit badge; wiring in progress.

---

### [PAGE 16/34] `register.html` -> `/register`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\register.html` (36,149 bytes)
* **Next.js Route**: `src/app/(public)/register/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Register as a Member`), Eyebrow (`Artisan Network`), 4-Step wizard.
  - *Step 1*: Membership tier and craft selection.
  - *Step 2*: Personal details (Full Name, CID, Phone, Dzongkhag, Gewog, Village, Bio).
  - *Step 3*: Review dossier.
  - *Step 4*: Payment of first year's dues:
    - Selector: `Card`, `mBoB` (Account details provided), `Bank transfer`.
    - Deposit slip screenshot uploader via `/api/upload`.
    - Journal / transaction reference input.
  - *Step 5*: Confirmation screen with application tracking number.
  - *Quick Edit*: Section type `membership` in editor.
* **Current Status**: Verified & payment slip workflow fully active.

---

### [PAGE 17/34] `wholesale.html` -> `/wholesale`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\wholesale.html` (33,663 bytes)
* **Next.js Route**: `src/app/(public)/wholesale/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Wholesale & Bulk Orders`), Eyebrow (`Institutional & Trade Buyers`), Lede.
  - *Value Proposition*: B2B tiered discounts (20–40%), export packaging, Certificate of Origin.
  - *Sourcing by Craft*: 13 crafts with MOQ guidelines.
  - *6-Step Ordering Flow*: Browse, Quantity, Quote basket, HAB review, Quotation, Dispatch.
  - *Actions*: `Apply for Trade Account` (`/wholesale/register`), `Browse Wholesale Catalogue` (`/wholesale/shop`).
  - *Quick Edit Requirements*:
    - Mount `SectionEditBadge` for wholesale terms, MOQs, and lead time.
* **Current Status**: Missing Quick Edit badge; wiring in progress.

---

### [PAGE 18/34] `wholesale-shop.html` -> `/wholesale/shop` & `/wholesale-shop`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\wholesale-shop.html` (33,306 bytes)
* **Next.js Routes**: `src/app/(public)/wholesale/shop/page.tsx` and `src/app/(public)/wholesale-shop/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`HAB Wholesale Catalogue`), Eyebrow (`Trade Pricing on Approval`), Gate notice.
  - *Catalogue*: Craft filters, MOQ badges, Case pack sizes, `Add to Quote Basket` buttons.
  - *Quick Edit*: Products Studio integration.
* **Current Status**: Verified on `/wholesale/shop`; wiring `/wholesale-shop`.

---

### [PAGE 19/34] `wholesale-cart.html` -> `/wholesale/cart` & `/wholesale-cart`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\wholesale-cart.html` (32,971 bytes)
* **Next.js Routes**: `src/app/(public)/wholesale/cart/page.tsx` and `src/app/(public)/wholesale-cart/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Wholesale Quote Basket`), MOQ compliance indicator.
  - *Table*: Case packs, wholesale unit price, quantity increment/decrement, quote subtotal.
  - *Actions*: `Submit Request for Quotation (RFQ)`.
  - *Quick Edit*: B2B terms and checkout policy editor.
* **Current Status**: Verified on `/wholesale/cart`; wiring `/wholesale-cart`.

---

### [PAGE 20/34] `wholesale-register.html` -> `/wholesale/register` & `/wholesale-register`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\wholesale-register.html` (37,972 bytes)
* **Next.js Routes**: `src/app/(public)/wholesale/register/page.tsx` and `src/app/(public)/wholesale-register/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Register as a Wholesale Buyer`), Eyebrow (`Trade Account Application`).
  - *Business Details*: Company name, business registration / tax number, business type.
  - *Contact*: Contact person, email, phone with country code, shipping address.
  - *Volume*: Expected annual volume and crafts of interest.
  - *Payment / Slip*: Payment mode selector and deposit slip uploader.
  - *2-Way Review*: Submissions appear in `/admin/wholesale` with clickable deposit slip viewer and Quick Approve/Decline actions.
  - *Quick Edit*: Section type `wholesale` in editor.
* **Current Status**: Verified on `/wholesale/register`; wiring `/wholesale-register`.

---

### [PAGE 21/34] `programmes.html` -> `/programmes`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\programmes.html` (32,253 bytes)
* **Next.js Route**: `src/app/(public)/programmes/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Eleven Objects, One Mandate`), Eyebrow (`Statutory Programmes A–K`), Lede.
  - *11 Pillars*:
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
  - *Actions*: Links to `/programmes/[ref]`.
  - *Quick Edit*: Section type `programmes` in editor.
* **Current Status**: Verified.

---

### [PAGE 22/34] `programme.html` -> `/programmes/[ref]` & `/programme`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\programme.html` (30,482 bytes)
* **Next.js Routes**: `src/app/(public)/programmes/[ref]/page.tsx` and `src/app/(public)/programme/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Programme Pillar Title, Code (e.g. `Pillar B`), Category, Lede.
  - *Objectives*: Target beneficiaries count (women, youths, master craftspeople).
  - *Methodology*: Implementation across 20 Dzongkhags.
  - *Partners*: Supporting organizations (UNDP, EU, RGoB).
  - *Quick Edit Requirements*:
    - Mount `SectionEditBadge` to edit pillar objectives, beneficiaries, and narrative.
* **Current Status**: Missing Quick Edit badge; wiring in progress.

---

### [PAGE 23/34] `projects.html` -> `/projects`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\projects.html` (31,457 bytes)
* **Next.js Route**: `src/app/(public)/projects/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Projects`), Eyebrow (`Donor & Institutional Interventions`), Lede.
  - *Tabs*: `Projects in hand` (Active) and `Completed projects`.
  - *Cards*: Project title, funding partner logo/name, budget, timeline, Dzongkhags impacted, summary.
  - *CTA*: "Partner on a project" contact secretariat callout.
  - *Quick Edit*: Section type `projects` in editor.
* **Current Status**: Verified.

---

### [PAGE 24/34] `project.html` -> `/projects/[key]` & `/project`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\project.html` (30,272 bytes)
* **Next.js Routes**: `src/app/(public)/projects/[key]/page.tsx` and `src/app/(public)/project/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Project Title, Funding Partner, Duration, Total budget.
  - *Deliverables*: Key outcomes, baseline vs endline indicators.
  - *Gallery*: Field workshop photos and beneficiary artisans.
  - *Download*: Project completion report PDF link.
  - *Quick Edit Requirements*:
    - Mount `SectionEditBadge` to edit project summary, outcomes, and budget text.
* **Current Status**: Missing Quick Edit badge; wiring in progress.

---

### [PAGE 25/34] `news.html` -> `/news`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\news.html` (31,242 bytes)
* **Next.js Route**: `src/app/(public)/news/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Newsroom & Dispatches`), Eyebrow (`Official Communications`), Lede.
  - *Featured Post*: Large headline, date, author, hero photo, excerpt, `Read article →`.
  - *Articles Grid*: Recent press releases, training workshop recaps, procurement notices.
  - *Events Snippet*: Upcoming craft fair calendar.
  - *Quick Edit*: Section type `news` in editor.
* **Current Status**: Verified.

---

### [PAGE 26/34] `news-post.html` -> `/news/[slug]` & `/news-post`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\news-post.html` (30,444 bytes)
* **Next.js Routes**: `src/app/(public)/news/[slug]/page.tsx` and `src/app/(public)/news-post/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Publication date, Category badge, Author, Reading time, Headline.
  - *Body*: Rich text formatted article paragraphs.
  - *Media*: Embedded photograph with caption note.
  - *Attachments*: Official press release PDF download button.
  - *Quick Edit Requirements*:
    - Mount `SectionEditBadge` to edit article headline, body paragraphs, and photo.
* **Current Status**: Missing Quick Edit badge; wiring in progress.

---

### [PAGE 27/34] `events.html` -> `/events`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\events.html` (13,597 bytes)
* **Next.js Route**: `src/app/(public)/events/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Upcoming Events & Craft Exhibitions`), Eyebrow (`Community Gatherings`), Lede.
  - *Feed*: Date badge, event title, venue (Clock Tower Square / Punakha Mo Chhu), event type.
  - *Action*: RSVP / Visitor information button.
  - *Quick Edit*: Section type `events` in editor.
* **Current Status**: Verified.

---

### [PAGE 28/34] `event.html` -> `/events/[key]` & `/event`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\event.html` (30,227 bytes)
* **Next.js Routes**: `src/app/(public)/events/[key]/page.tsx` and `src/app/(public)/event/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Event Title, Date, Timing, Venue, Organizer.
  - *Schedule*: Timetable of demonstrations, exhibitions, and artisan booths.
  - *Participation*: How member artisans can book a stall.
  - *Quick Edit Requirements*:
    - Mount `SectionEditBadge` to edit event description, venue, and timing.
* **Current Status**: Missing Quick Edit badge; wiring in progress.

---

### [PAGE 29/34] `publications.html` -> `/publications`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\publications.html` (32,233 bytes)
* **Next.js Route**: `src/app/(public)/publications/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Reports, Studies & Downloads`), Eyebrow (`Statutory Transparency`), Lede.
  - *Sections*:
    1. Annual Reports (2020–2025).
    2. Statutory Audited Financial Accounts.
    3. Sector Research Studies & Zorig Chusum Documentation.
    4. Procurement Tenders & Terms of Reference.
  - *Actions*: Direct PDF download buttons and in-browser DocumentEmbedViewer.
  - *Quick Edit*: Section type `publications` in editor.
* **Current Status**: Verified.

---

### [PAGE 30/34] `donate.html` -> `/donate`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\donate.html` (32,960 bytes)
* **Next.js Route**: `src/app/(public)/donate/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Support Bhutanese Artisans`), Eyebrow (`Philanthropic Giving`), Lede.
  - *Four Support Pillars*:
    1. Grassroots Revolving Fund
    2. Impact Crowdfunding & Enterprise
    3. Vital Cultural Preservation
    4. Environmental & Landscape Conservation
  - *Donation Form*: Amount presets ($25, $50, $100, $250, Custom), Currency toggle, Card / mBoB selector.
  - *Tax Exemption*: CSO Act 2007 tax-deductible receipt notice.
  - *Quick Edit*: Section type `donate` in editor.
* **Current Status**: Verified.

---

### [PAGE 31/34] `contact.html` -> `/contact`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\contact.html` (32,492 bytes)
* **Next.js Route**: `src/app/(public)/contact/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Contact the Secretariat`), Eyebrow (`Inquiries & Support`), Lede.
  - *Secretariat Dossier*: Address (`Metog Lam, Thimphu`), Phone (`+975-2-338089`), Email (`officehab@gmail.com`), Hours (`Monday–Friday 09:00–17:00`).
  - *Department Contacts*: Executive Director Desk, Marketing Desk, Membership Desk.
  - *Inquiry Form*: Name, Email, Topic (General, Membership, Wholesale, Commission, Press), Message.
  - *Quick Edit*: Section type `contact` in editor.
* **Current Status**: Verified.

---

### [PAGE 32/34] `privacy.html` -> `/privacy`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\privacy.html` (31,438 bytes)
* **Next.js Route**: `src/app/(public)/privacy/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Privacy Policy & Data Protection`), Statutory reference (CSO Act 2007).
  - *Clauses*: Data collection, artisan personal records, payment transaction security, third-party sharing, cookies.
  - *Actions*: Interactive statutory drawer and policy modal.
  - *Quick Edit*: Section type `policies` in editor.
* **Current Status**: Verified.

---

### [PAGE 33/34] `terms.html` -> `/terms`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\terms.html` (31,529 bytes)
* **Next.js Route**: `src/app/(public)/terms/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Terms of Service & Articles of Association`), CSO Act registration.
  - *Clauses*: E-shop terms, wholesale conditions, artisan consignment rules, dispute resolution under Royal Court of Justice, Bhutan.
  - *Quick Edit*: Section type `policies` in editor.
* **Current Status**: Verified.

---

### [PAGE 34/34] `shipping-policy.html` -> `/shipping-policy`
* **Static File**: `E:\Downloads\Final_webdesign\hab-site\shipping-policy.html` (31,702 bytes)
* **Next.js Route**: `src/app/(public)/shipping-policy/page.tsx`
* **Real Elements & Quick Edit Inventory**:
  - *Header*: Title (`Shipping & Delivery Policy`), Eyebrow (`International Dispatch`), Lede.
  - *Clauses*: Bhutan Post EMS transit times (7–14 days), DHL Express option, packaging standards, tracking numbers, customs declarations.
  - *Quick Edit Requirements*:
    - Mount `SectionEditBadge` to edit shipping thresholds and transit timelines.
* **Current Status**: Missing Quick Edit badge; wiring in progress.

---

### [SPECIALIZED GOVERNANCE SUB-PAGES (PRESERVED)]
In addition to the 34 HTML files, the 10 statutory governance pages linked in the master footer are fully preserved with zero 404s:
1. `/board-of-trustees`: Governing board profiles, oversight mandate, election rules.
2. `/secretariat`: Staff directory, department desks, office location map.
3. `/annual-reports`: Statutory annual reports catalog (2020–2025) with verified PDFs.
4. `/audited-accounts`: External statutory financial audits and balance sheets.
5. `/tenders`: Procurement RFPs, machinery tenders, and terms of reference.
6. `/customs-policy`: International customs, import tariffs, and Certificate of Origin guidelines.
7. `/returns-policy`: 14-day collector guarantee, transit damage replacements, and refunds.
8. `/code-of-ethics`: Fair dealing, child labour prohibition, fair artisan wages code.
9. `/mandate`: CSO Act 2007 apex mandate, legal objects, and powers.
10. `/strategic-plan`: 2025–2030 strategic plan pillars, targets, and milestones.

---

## 4. Master 5-Column Footer Specification

```
========================================================================================
[SIGNOFF HEADER]
├── Logo:           assets/hab-logo-footer.png (3412 x 1296)
├── Title:          Handicrafts Association of Bhutan (འབྲུག་གི་ལག་བཟོ་ཚོགས་པ)
├── Mission:        A registered Civil Society Organization under the CSO Act of Bhutan 2007. Established 2005.
└── Social Icons:
    ├── Facebook:  https://www.facebook.com/
    ├── Instagram: https://www.instagram.com/
    ├── X:         https://x.com/
    ├── YouTube:   https://www.youtube.com/
    └── TikTok:    https://www.tiktok.com/

[FOOTER 5-COLUMN INNER GRID]
Column 0: Secretariat (དྲུང་ཆེའི་ཡིག་ཚང)
├── Address: Metog Lam, Thimphu, Bhutan
├── Main Phone: Office +975-2-338089
├── Official Email: officehab@gmail.com
└── Executive Secretary Desk: +975-2-338089 (tel:+9752338089)

Column 1: Association (ཚོགས་པ)
├── 1. About HAB           -> /about
├── 2. Programmes          -> /programmes
├── 3. Projects            -> /projects
├── 4. Membership          -> /membership
├── 5. News & events       -> /news
└── 6. Contact us          -> /contact

Column 2: Shop & support (ཚོང་ཁང་དང་རྒྱབ་སྐྱོར)
├── 1. E-shop              -> /shop
├── 2. Wholesale & bulk    -> /wholesale
├── 3. Shipping & delivery -> /shipping-policy
├── 4. Returns             -> /returns-policy
├── 5. Track your order    -> /track-order
└── 6. Duty & customs      -> /customs-policy

Column 3: Members (འཐུས་མི)
├── 1. Directory by cat.   -> /members
├── 2. Publications        -> /publications
├── 3. Member shops/clust. -> /outlets
├── 4. Member login        -> /login
└── 5. Apply to join       -> /register

Column 4: Governance (འཛིན་སྐྱོང)
├── 1. Board of Trustees   -> /board-of-trustees
├── 2. Secretariat         -> /secretariat
├── 3. Annual reports      -> /annual-reports
├── 4. Audited accounts    -> /audited-accounts
├── 5. Tenders & vacancies -> /tenders
├── 6. Terms of service    -> /terms
└── 7. Privacy policy      -> /privacy

[FOOTER BOTTOM BAR]
├── Left:  © 2026 Handicrafts Association of Bhutan. All rights reserved. · Registration CSO/2011/043
└── Right: Prices shown in USD $ / Nu. BTN · Payments by card, mBoB and bank transfer
========================================================================================
```

---

## 5. 2-Way Synchronization Verification Matrix (Admin <-> Public CRUD)

| Flow # | Origin | Action | Destination / Effect | Status |
|---|---|---|---|---|
| **01** | Public (`/register`) | Submit member application with payment slip upload | Appears in `/admin/applications` with clickable slip viewer and Quick Approve/Decline actions | UNVERIFIED end-to-end |
| **02** | Public (`/wholesale/register`) | Submit wholesale buyer registration with deposit slip | Appears in `/admin/wholesale` with clickable slip viewer and Quick Approve/Decline actions | UNVERIFIED end-to-end |
| **03** | Admin (`/admin/applications`) | Click Quick Approve `[✓]` on member application | Status changes to `APPROVED`, audit logged, notification email dispatched | UNVERIFIED end-to-end |
| **04** | Admin (`/admin/wholesale`) | Click Quick Approve `[✓]` on wholesale application | Status changes to `APPROVED`, audit logged, wholesale credentials email dispatched | UNVERIFIED end-to-end |
| **05** | Public (`/`) via Quick Edit | Modify Hero headline or upload new slide | Saves to `HeroSlide` / `SiteSetting`, immediately renders on homepage | UNVERIFIED end-to-end |
| **06** | Public (`/`) via Quick Edit | Modify Shop section eyebrow, heading, lede | Saves to `SiteSetting`, immediately renders on homepage | UNVERIFIED end-to-end |
| **07** | Admin (`/admin/products`) | Add new artisan piece with price and photo | Immediately appears in `/shop` and corresponding `/craft/[craft]` grid | UNVERIFIED end-to-end |
| **08** | Admin (`/admin/members`) | Import artisans from Excel/CSV file | Directory at `/members` immediately shows imported artisans with Dzongkhag filters | UNVERIFIED end-to-end |
| **09** | Admin (`/admin/wholesale`) | Import trade buyers from Excel/CSV file | Wholesale accounts table updates with buyer profiles and tier levels | UNVERIFIED end-to-end |
| **10** | Public (`/contact`) | Submit inquiry with topic | Appears in Admin Inquiries inbox with reply trigger | UNVERIFIED end-to-end |

---

## 6. Implementation Checklist & Real Execution Status

| Task / File | Scope | Real Status | Next Step |
|---|---|---|---|
| `UniversalLiveSectionEditor.tsx` | Upgrade editor to support all content tabs (Text, Actions, Media, Cards) for crafts, products, outlets, clusters, programmes, projects | IN PROGRESS | Add universal multi-field tab support |
| `src/app/(public)/craft/[craft]/page.tsx` | Mount SectionEditBadge and UniversalLiveSectionEditor on all sub-sections | PARTIAL | Badge now invokes the craft record editor; authenticated per-field record controls still need browser verification |
| `src/app/(public)/product/[code]/page.tsx` | Mount SectionEditBadge for product details & specs | PARTIAL | Badge now invokes the product record editor; authenticated per-field controls still need browser verification |
| `src/app/(public)/outlets/page.tsx` | Mount SectionEditBadge for outlets and markets | PARTIAL | Badge moved above the client page wrapper so it can render and invoke the outlet record editor; browser verification remains |
| `src/app/(public)/clusters/page.tsx` | Mount SectionEditBadge and database-backed index copy | PARTIAL | Badge and major headings/panels are wired; row labels, links and authenticated save loop remain |
| `src/app/(public)/wholesale/page.tsx` | Mount SectionEditBadge for wholesale B2B terms | PARTIAL | Existing Quick Edit button now launches the native wholesale buyer CRUD records tab; section copy controls still exist separately |
| `src/app/(public)/shipping-policy/page.tsx` | Mount SectionEditBadge for shipping policy | PARTIAL | Policy page badge now launches the policy record editor; check both canonical and alias routes |
| `src/components/public/Footer.tsx` | Ensure 100% parity with index.html lines 600-677 | VERIFIED | Maintain parity |
| `src/components/public/UtilityBar.tsx` | Ensure notice numbers (`1/4`) remain removed, arrows preserved | VERIFIED | Maintain parity |

## 7. Current Execution Contract

- All implementation changes are made only in `E:\ai\bhutanprojects\newbend`.
- `E:\Downloads\Final_webdesign\hab-site` is a read-only comparison source.
- No backup directory is created.
- Automated scripts are supplementary evidence only; they never replace direct file and browser verification.
- Each page, section, text field, button, link, image, footer item, and form is tracked as `VERIFIED`, `UNVERIFIED`, or `PENDING`.
- Completion requires direct evidence from the affected source files, API behavior, and browser-visible result.

## 8. Current Verified Work and Open Gaps (8 October 2026)

| Area | Direct finding | Status |
|---|---|---|
| Build | `npm run typecheck` passed and the patched Next.js 15.5.24 production build completed across the full application. The local PostgreSQL service was connected during route verification. | Build verified; authenticated edit loops UNVERIFIED |
| Quick Edit access | The public edit bar previously accepted `?edit=true` or `localStorage` as proof of staff identity. It now waits for a staff session check; section badges use a shared session check. | Source and typecheck verified; browser session check PENDING |
| Clusters index | Hero title, lede, count template, registration band and visit/shop panel copy now read `SiteSetting.trustBadges`; corresponding editor fields are present. Per-row labels, action links, breadcrumb and edit loop still need work. | Source and typecheck verified; database and browser edit loop UNVERIFIED |
| Server rendered edits | Quick Editor now refreshes the current Next.js route after a successful save. | Source and typecheck verified; browser edit loop UNVERIFIED |
| Unicode content | Settings writes previously replaced punctuation and could strip Dzongkha on an encoding error. Writes now preserve exact text and return a visible error when the database cannot store it. Schema drift also returns an error instead of silently dropping fields. | Source and typecheck verified; database write UNVERIFIED |
| Wholesale product image | The preview previously prepended `/` to an absolute uploaded image URL. It now preserves HTTP URLs and normalizes local paths. | Source and typecheck verified; browser image display PENDING |
| Footer social links | Browser inspection found generic platform homepages used when HAB profile URLs were unset. Footer now renders only configured HTTPS profile URLs. | Source and typecheck verified; refreshed browser display PENDING |
| Local database | Existing `hab_platform` database is `WIN1252`, so Dzongkha edits cannot be reliably persisted there. `prisma db push --skip-generate` synced missing tables and columns without a data-loss flag; the original database content was retained. A data-preserving migration to UTF-8 is still required. | Schema sync and encoding directly verified; Unicode migration PENDING |
| Admin-only live editing | Public edit bar and section badges require a staff session; a URL flag or local storage alone cannot reveal them. Shared session checks are no longer cached indefinitely across login changes. Anonymous `/api/admin/health` returned `user: null`; local public HTML did not render the admin bar. | Source, typecheck and anonymous HTTP verified; authenticated browser edit loop UNVERIFIED |
| Language switcher | The single EN/Dz control now sits at the end of the fixed upper utility/menu strip, not the lower light main-navigation row or mobile drawer. It is pinned to the utility strip's right edge on phone widths while ticker/navigation content may scroll. Fresh live-page accessibility order confirms it is the last upper-strip control before the main header and absent from the lower row. | Typecheck, optimized builds, production deploy, live DOM and `/publications` + `/clusters` HTTP 200 verified; pixel-level mobile viewport check UNVERIFIED |
| Universal page Quick Edit | A shared editor now targets public headings, paragraphs, list items, buttons, links, captions and images across routes. It persists path/element overrides in `SiteSetting.trustBadges.pageOverrides`, supports text/link/image/alt edits, staff-authenticated image upload, live application and per-element undo. | Authenticated API save/read/undo and cleanup verified; visual browser interaction UNVERIFIED |
| Admin Quick Edit manager | `/admin/pages/live-content` lists, searches, directly edits and restores saved text/link/image overrides. Header, utility-bar and footer edits are stored globally while body edits remain page-specific. It is linked from Website & Pages and requires staff login. | Source and TypeScript verified; authenticated browser workflow UNVERIFIED |
| Membership submission | The public form previously advanced to a success screen even when the API failed. It now advances only after an HTTP/API success and displays the real failure otherwise. mBoB/bank submissions require a transaction reference and uploaded proof in both UI and API. | Source and TypeScript verified; real payment and browser submission UNVERIFIED |
| Wholesale approval | Approval now creates and hashes a fresh temporary password, includes working credentials in the approval email, shows them in Admin when live delivery is not confirmed, distinguishes simulated SMTP from delivery, requires a staff role, and exposes uploaded payment proof in the inspector. | Source and TypeScript verified; SMTP delivery and authenticated approval UNVERIFIED |
| Public upload safety | Public application and donation-slip endpoints now validate file signatures against the declared MIME type and choose a canonical extension from the validated content, rejecting disguised SVG/HTML bodies and filename-extension spoofing. | Both handlers exercised directly: hostile SVG-as-PNG rejected; valid PNG accepted as `.png` despite `.svg` filename; generated test files removed. Typecheck passed. |
| Support pillar Quick Edit permissions and Dzongkha safety | A review found the support-pillar API was using a permission helper that let content viewers write, and its encoding fallback could silently strip non-ASCII text. GET now requires `content:view`; all mutations require `content:edit`; failed encoding writes return a clear no-substitution error. | Isolated local API/database test verified editor CRUD, viewer GET plus 403 for POST/PUT/DELETE, unchanged data after denied writes, and explicit rejection without a record on the WIN1252 local database. `npm run typecheck` passed; optimized build generated 52/52 pages. Commit `be0bce2` was pushed and deployed using the guarded script; production schema was already in sync, optimized build generated 52/52 pages, PM2 reported the target app online, and the script's health check passed. Authenticated production edit/browser workflow remains **UNVERIFIED**. |
| Membership ledger privacy and one payment-settings source | The admin membership-settings GET returned member ledger data without verifying a staff session. It now requires the existing staff/member-verification authorization before querying. The public dues endpoint returns only the three fee fields and timestamp, not its stale duplicate bank/QR settings. The Admin Membership Settings form no longer edits a second payment account; it displays the shared public BOB/BNB details and links to Site Settings. Its save path updates dues only. | Local regression confirmed anonymous admin GET 401; public dues GET 200 with no `accountNumber` or `mbobQrUrl`; membership/wholesale card requests 503 and unpaid offline requests without proof 400. Typecheck passed; production build generated 52/52 pages (existing lint warnings only). Commit `650564e` was pushed and deployed via the guarded script; schema was already in sync, the target PM2 app came online, and deployment script health passed. Read-only production checks: `/api/admin/health` 200 HEALTHY with PostgreSQL connected; `/api/membership-settings` 200 contains only fee fields/timestamp; anonymous `/api/admin/membership-settings` returns 401. Staff-authenticated admin visual workflow remains **UNVERIFIED**; no production member ledger or payment configuration was changed. |
| Wholesale registration duplicate safety | Public wholesale registration previously updated an existing database buyer by email and rewrote the fallback record before duplicate detection, allowing an unauthenticated repeat application to change existing company/contact data. Existing fallback/database emails now receive HTTP 409 without mutation; creates use a database uniqueness guard before fallback persistence. | Local API regression: first temporary registration returned 200; same-email altered submission returned 409; both DB and fallback values remained unchanged; temporary records were removed. `npm run typecheck` and optimized build (52/52 pages) passed. Commit `70c4b5e` was pushed/deployed through the guarded script; production schema was already synced, the target PM2 app came online, and health passed. No live registration was submitted. Production authenticated workflows remain **UNVERIFIED**. |
| Membership/wholesale application payment truth | Read-only production configuration showed card mode is TEST with no publishable key, while neither application endpoint creates a card checkout. Both forms falsely promised a 3-D Secure gateway and displayed hardcoded account numbers that differed from donation/Admin settings. These application forms now offer mBoB/bank proof submission, source dues from Membership Settings and account details from the same public Site Settings used by Donate, and prevent submit until the current values load. The APIs reject card payments for paid applications with an explicit 503; honorary no-fee applications remain submit-able without payment. | Local API checks passed: membership/wholesale card attempts return 503, offline attempts without reference/proof return 400, and the wholesale registration+duplicate test passes with cleanup. Typecheck passed and optimized build generated 52/52 pages (database-backed prerender used the documented local-offline fallback). Commit `15c45c5` was deployed via the guarded script; schema remained in sync, the 52-page production build passed, the HAB process came online, and health is `HEALTHY`. Read-only live GETs confirmed `/register` and `/wholesale/register` return 200 and the current fee/payment settings are served. No live form was submitted. Visual/browser payment workflow remains **UNVERIFIED**. A real card processor cannot be enabled until HAB provides/configures an actual provider checkout and credentials; card acceptance is not claimed. |
| Excel import/export | Members and wholesalers accept real `.xlsx` plus CSV, download genuine `.xlsx` templates and exports, preview parsed rows, preserve Unicode, report bad rows and skip database duplicates. Legacy `.xls` produces an explicit conversion message. The vulnerable SheetJS package was removed and replaced with ExcelJS. Import endpoints enforce staff roles and return imported/skipped/bad-row counts. | XLSX Unicode round-trip and member/wholesale preview validators tested. Local member import API create, malformed/duplicate row report, and same-file re-import idempotence passed with cleanup. Wholesale API import, authenticated browser preview, export/download, and bad-row visual UX remain **UNVERIFIED** |
| Public route sweep | Direct HTTP requests were made to the 34 reference routes plus 10 governance routes with PostgreSQL connected. Broken legacy defaults for `/cluster`, `/news-post`, and `/event` were corrected to existing records. | 44/44 routes returned HTTP 200 locally |
| Responsive images | Staff image uploads preserve the original file and generate non-enlarged 480/960/1600-or-source-width WebP variants; the preferred responsive URL, dimensions, original URL and variants are returned and audited. | Authenticated upload returned original plus two responsive variants; output files verified and test files removed. Admin browser UI UNVERIFIED |
| Admin API access | Media, policy, wholesale trade, SMTP test, image upload, and all-page Quick Edit endpoints now reject anonymous/non-staff access. | Anonymous HTTP test verified 401 for 6/6 endpoints; role matrix beyond two staff roles UNVERIFIED |
| Missing assets | Nonexistent report PDF links were replaced with clear awaiting-publication states. Missing member/news/product fallbacks now resolve to existing files. Missing bank QR settings no longer render broken image URLs. | Source and route checks verified; real report PDFs and BoB/BNB QR images must still be uploaded by HAB |
| Dependency security | Removed vulnerable `xlsx`; upgraded Next.js from 14.2 to patched 15.5.24; migrated asynchronous route params/cookies and proxy IP handling required by Next 15. The critical production audit finding was eliminated. | Typecheck, optimized build, XLSX Unicode test and 44/44 HTTP route sweep verified; remaining non-critical transitive audit findings documented |

The larger project remains open. In particular, every reference page still needs direct content and visual parity review; many visible strings remain in page/components; public/admin CRUD flows and payment email delivery require a working database and browser verification. None of those items are marked complete by the successful build alone.

### Quick Edit interaction and CRUD audit (8 October 2026)

- The universal page editor was rendered at `z-[90]`, below existing floating controls at z-index 130–140. Its panel now uses a body portal at `z-[99999]` and accepts Escape to close.
- The page-wide capture listener could intercept clicks in the live section, header, visual-section and custom-page editors. Those dialogs are now explicitly excluded, so their controls (including Close) receive clicks. Authenticated browser verification is still **UNVERIFIED**.
- The universal editor now checks the current staff session before attaching click-to-edit behavior. Anonymous visual-edit flags alone cannot activate that editor.
- The live section dialog initially tried an embedded Admin Records screen. That did not meet the requirement for separate Quick Edit controls. It has been removed; Admin pages again deny all framing.
- The unused legacy AdminDrawer public component contained toast-only save stubs and could open as a second editor through a shortcut, #admin, or repeated logo clicks. It is no longer mounted in the public layout; its source file is retained but inactive. The functioning staff-only in-page and section Quick Edit tools remain mounted. Deployed as 084550c; after a live page reload, the browser showed zero dialogs and a working page remained accessible.
- The earlier EN/Dz placement in the lower main-header row (after the basket on desktop, alongside the mobile hamburger) did not match the user's repeated request for the upper/top strip. The switcher has now been removed from that lower row and placed last in the fixed upper utility strip at every width, pinned to the visible right edge on phones. Navigation and existing translated UI strings react to it, but core translation across every page remains **PENDING**.
- Commit `362e000` is live: the production checkout fast-forwarded without touching `.data/`, `.htaccess`, or `public/uploads/`; the optimized build passed (with pre-existing lint warnings), only `habbhutanplatform` was restarted and is online, and a fresh production publications page exposes the language control in the upper strip before `siteHeader`. `/publications` and `/clusters` returned HTTP 200. The phone-width `position: sticky`/right-edge CSS is in the deployed bundle; physical mobile viewport screenshot verification remains **UNVERIFIED**.

### Native Quick Edit record controls (8 October 2026, continuation)

- Added separate list/search/create/edit/delete forms within the public-page Quick Edit dialog for products, members, wholesale buyers, clusters, outlets, programmes, projects, masters, news, events, publications and tenders. Wholesale buyers also have direct approve/decline controls that invoke the existing notification workflow; payment details and the stored deposit-proof link are visible for manual review before the action. Automatic payment verification and actual email delivery are **UNVERIFIED**. The forms use the same authenticated database APIs as Admin; image and document fields use the existing upload component. Craft categories can be created, read, edited and hidden/re-enabled, but deliberate hard deletion of the 13 heritage categories is not exposed because products and members can depend on them.
- Corrected section routing so outlet badges no longer open the cluster editor, and project badges no longer open programme records.
- No Admin screen is embedded in Quick Edit; the generic links to Admin were removed from the modal header/footer. At this audit point, CRUD for every section is still **PENDING**; unsupported sections retain their existing text/settings Quick Edit controls and do not show a nonfunctional Records tab. Header/footer collections, applications and orders are now handled by dedicated native controls, but not every public section has field-level CRUD yet.
- Read-only `content:view` and `products:review` permissions no longer authorize writes to events, honours or crafts. Authenticated role-matrix and end-to-end browser save/delete tests remain **UNVERIFIED**.
- Local verification after the native controls change: TypeScript and optimized Next.js build passed; six anonymous record endpoints (clusters, events, honours, tenders, members, products) each returned HTTP 401. These checks do **not** prove authenticated create/edit/delete or UI behavior, which remain **UNVERIFIED**.

## 9. Whole-site continuation: craft detail and editor coverage

- Compared the 13 craft records in the read-only HTML reference `data.js` against `src/lib/client-data.json`. Names, descriptions, history, long descriptions, techniques, materials, regions, typical products and shop notes match for all 13. Image paths differ only by the leading `/` needed by Next.js.
- The production craft API omitted history for single-craft requests and had no database fields for the long description or typical products. The public craft page therefore replaced the full reference narrative with the one-line description after loading. Added `Craft.longDescription` and `Craft.typicalProducts`, returned both plus history from the public API, and added both to Admin Crafts. A fill-only script copies reference values into empty database fields while preserving existing admin edits.
- The craft page now reads verified public members and preserves cluster establishment date, sort order and image when fetching live data. Absolute product image URLs are preserved.
- Quick Edit now covers leaf labels, spans, numbers, table cells, small print and form placeholders in addition to headings, paragraphs, links and images. Saved placeholders appear in the Admin live-content manager. Browser interaction on all pages remains UNVERIFIED.
- Draft custom page HTML, metadata and API now validate an active staff session and current `content:view` permission. The public order-list endpoint now requires current `orders:view` permission.
- Local verification: TypeScript and optimized production build passed; 13/13 single-craft API responses included history, long description and typical products; anonymous order listing returned 401. Production migration and live craft response remain PENDING at this checkpoint.
- A direct production heading check covered 21 reference routes. Most static headings matched. `/contact`, `/donate`, `/register` and `/shop` had no `<h1>` in the server-rendered HTML; `/outlets` rendered a data-dependent market heading, while the reference fills its heading in JavaScript. These need browser-level parity review and administrative text-source review. This check is not a completion claim for those pages or the remaining pages.

## 10. New governance pages and live-content continuation

- The public router currently contains 78 `page.tsx` route files, including redirect/alias routes, while the read-only HTML reference contains 34 files. The 34-file audit above does not establish parity for newly added pages such as `/strategic-plan`, `/mandate`, `/code-of-ethics`, `/board-of-trustees`, `/secretariat`, `/annual-reports`, and `/audited-accounts`. Their full content/design parity remains **UNVERIFIED**.
- The Admin Live Quick Edit manager sent its save payload as `value` while the API expected `override`. This has been corrected. The API now rejects empty overrides instead of reporting a successful blank save. Source, typecheck and production build verified; authenticated browser save **UNVERIFIED**.
- Board of Trustees and Secretariat badges now open their own native Quick Edit records tab instead of an unrelated About settings form. The tab supports create, list, edit, delete, order, portrait upload, biography, and—in the Secretariat—phone/email through the governance API. Source, typecheck, optimized build, and anonymous page HTTP 200 verified; logged-in CRUD and image rendering **UNVERIFIED**.
- Governance biographies, photographs, phones and emails now have optional database columns and controls in both Admin About and Quick Edit. Existing `chapterOrNote||photo:` records retain a read fallback; editing migrates their portrait into the new column. Four additive columns were reviewed in generated SQL and applied without dropping data. Production rendering and production-authenticated saves remain **UNVERIFIED**.
- Follow-up local authenticated governance test: a uniquely named temporary Secretariat record was created with biography, phone and email; the public governance API and `/secretariat` HTML showed it; an edited biography appeared in refreshed HTML; the test record was deleted in `finally` (cleanup confirmed). Production-authenticated editing and browser Quick Edit controls remain **UNVERIFIED**.
- At this checkpoint, the new strategic-plan, mandate, and code-of-ethics pages had hardcoded card collections and no structural controls. The later governance-card phase below addresses these three collections. Other governance sections and all-page parity remain **PENDING**.

## 11. Cross-page section CRUD continuation

- Added `PublicPageBlock` records for extra public sections on any route, with title, body, optional uploaded image and button, display order, and visibility. Public pages render published blocks after their existing page content; staff can create/edit/delete them from the live Quick Edit toolbar, and Admin has `/admin/pages/sections` for the same records. Existing page-specific sections are **not** migrated into these records and remain in their own editors.
- The new API requires `content:edit` for mutations and `content:view` for staff listing; anonymous public reads expose published blocks only. Local optimized build passed; anonymous GET returned 200 with an empty list and anonymous POST and admin-list GET both returned 401. Live visual interaction remains **UNVERIFIED**.
- Follow-up local authenticated API test: staff login succeeded; a uniquely named temporary `/strategic-plan` block was created, observed through the public GET, updated to hidden, verified absent from public GET, and deleted in `finally` (cleanup confirmed). This verifies the API and local database loop; the Quick Edit/Admin browser controls and production-authenticated CRUD remain **UNVERIFIED**.
- Fixed the universal leaf editor so editing text inside a parent element no longer clears text in its child elements. Typecheck and optimized build passed; visual browser regression test remains **UNVERIFIED**.
- Live route sweep: 44 entry routes (34 HTML-reference routes plus 10 governance routes) returned HTTP 200. This is availability only, not visual/data parity. An initial server-rendered local-image HEAD check across 33 representative pages found 41 unique local image URLs and three 404s on `/about` (`hero-1-desho`, `hero-2-desho`, `hero-3-desho`). The dynamically generated fallback filename has been replaced with an explicit list of existing assets across About, Board, Secretariat, Projects and Programmes. Client-rendered, CSS-background, remote and data-driven images remain **UNVERIFIED**.
- After deployment, `/about` rendered six distinct local images and all six returned successfully; the public health endpoint remained healthy. The Strategic Plan, Mandate and Ethics badges now open the cross-page section manager instead of unrelated modules; their existing hardcoded card grids are **not** yet field-level database collections.
- Page override links and images now reject unsafe schemes (including `javascript:` and protocol-relative URLs), and new page-block URLs reject backslash-based external paths. Source and typecheck verified; authenticated negative-input tests **UNVERIFIED**.
- HTML reference versus live server-rendered H1 comparison across all 34 files found nine mismatches or absent headings. Six were loading/suspense entry states (`/shop`, `/register`, `/donate`, `/contact`, `/wholesale-shop`, `/wholesale-cart`); these now include their corresponding reference H1 while loading. `/craft` alias also has a loading H1. `/outlets` and `/membership-category` are data-dependent and still require browser-level comparison. These loading headings are still code fallback strings rather than database content; the no-hardcoded-visible-text requirement is **PENDING**.

## 13. Wholesale product pricing and quote workflow (8 October 2026)

- Added a normalized one-to-one `WholesaleProductTerms` record per product: MOQ, lead time, editable volume tiers, customization notes, active/disabled state, and timestamps. Admin Trade Desk pricing now creates and updates those terms, validates positive MOQ/price and strictly increasing quantity thresholds, and has a distinct delete action that removes both normalized terms and any legacy per-SKU setting without deleting the product. Pricing writes no longer swallow database errors and pretend to succeed. Terms reads require the product-view permission; save and delete require separate product-edit/delete permissions. The sidebar entry is now “Wholesale Trade Desk” with a “Pricing · Quotes” badge. Product CRUD responses include terms for the Admin order form.
- `/api/trade` now requires a valid session belonging to an active, approved wholesale buyer. The old product-specific wholesale defaults were moved out of the shared public `client-data.json` into a server-only JSON module. Inspection of the optimized client chunks found zero occurrences of a unique product-specific wholesale term; the corresponding term remains only in server output. Anonymous price endpoint returned HTTP 401 in the local integration check.
- The authenticated catalogue reads the normalized product terms first, displays the quantity tiers and selected unit price, and feeds the same records to the Admin manual-order UI. The order API enforces product MOQ and computes wholesale line prices server-side from configured tiers; it does not trust a browser-supplied unit price. The quote basket now requires an approved buyer and `/api/wholesale/quote` independently verifies that buyer, reloads current published products and current prices, validates MOQ, and derives the quoted identity and total from server records. It does not trust buyer identity or price totals sent by the browser.
- Local verification: additive Prisma schema sync on `127.0.0.1/hab_platform`; `npx prisma validate`, Prisma Client generation, `npm run typecheck`, and optimized production build passed. `scripts/verify-wholesale-order-create.mjs` passed against loopback and cleaned its temporary rows: Admin term create/read/update/delete, rejection of invalid tier ordering, anonymous price denial, approved-buyer catalogue access, quote MOQ rejection and server-priced quote creation, buyer identity protection, order MOQ enforcement, quantity-tier order price, and inventory decrement. Build has existing lint warnings unrelated to this change.
- Deployment is **DONE** at `c6267b1`: GitHub `main` was pushed, the production checkout fast-forwarded from `fe2c75a`, Prisma applied the additive schema without a data-loss override, the optimized server build generated the full route set, only `habbhutanplatform` was restarted, and the guarded local health check passed. Follow-up read-only checks returned `/api/admin/health` = `HEALTHY`, anonymous `/api/trade` = HTTP 401, `/wholesale/shop` = HTTP 200, and `/wholesale/cart` = HTTP 200. No live wholesale account was used and no live form or business record was changed.
- **UNVERIFIED:** Admin visual usability with a real staff browser session; mobile layout; real buyer login and approved-buyer catalogue/quote workflow on production; email delivery of quote requests; confirmation by HAB of the actual price values. A read-only production check fetched the 22 JavaScript chunks referenced by `/wholesale/shop`; none contains the unique product-specific wholesale term tested. This checks that sample term's bundle exposure, not every possible way of inspecting the website.
- Overall-plan completion is still an estimate because the original plan has no weighted completion denominator: roughly **56% implemented**. This does not mean 56% of requirements are end-to-end verified. Broad remaining work includes every-page live/reference parity, all-section Quick Edit CRUD, Admin visual workflows, translation coverage, real payment-provider setup, spreadsheet browser import/export, image-quality review, and production-authenticated checks. Do not mark the plan complete from this percentage.

## 12. Final admin usability pass (requested after functional plan completion)

### Governance card collections (8 October 2026)

- Strategic pillars, mandate articles and ethical standards now have database-backed records with create, list, update, order, show/hide and native public-page Quick Edit controls. The Admin page `/admin/pages/governance-cards` manages the same records. Existing published wording was copied into shared defaults and seeded additively; no existing records are overwritten.
- Local authenticated test created and updated a strategic card and observed the changed text in public HTML. A separate visibility probe confirmed that hiding a card removes its rendered `<h3>` even though Next.js still includes the card data in its serialized page payload; the temporary test records were removed. Mandate and ethics mutation flows, in-browser Quick Edit clicks and production-authenticated CRUD remain **UNVERIFIED**.
- Deployed as commit `dc8cbf6`: production schema diff contained only the new table and index; the original 5 strategic, 5 mandate and 6 ethics cards were seeded after Prisma client generation. The server build completed and all three public routes returned HTTP 200 after restart. A 502 immediately during the restart cleared as the process came online. This is an availability check, not field-by-field or browser CRUD verification.
- A follow-up sweep of 23 representative public routes returned HTTP 200 on the deployed site; the new governance-card Admin API returned HTTP 401 to an anonymous GET. These checks do not establish visual parity, payment flow, or end-to-end editor behavior.
- Hero and other static governance text is still hardcoded, so this is not completion of the all-visible-text requirement.

- Once all page parity, public/admin synchronization, Quick Edit CRUD, payment, import/export, media and language work is verified, simplify the Admin panel. Group tasks by plain-language purpose; remove duplicate or misleading navigation entries; make record list, create, edit, preview, publish, approve/decline and restore actions consistent; show concise help and meaningful errors; check keyboard and mobile use.
- Preserve every existing module and capability while reorganizing. The usability pass is **PENDING** because the functional plan is not complete. Do not call the Admin easy to use until a real staff workflow has been tested.

### Navigation source-of-truth correction

- The public navigation API no longer substitutes default header/footer links when saved collections are empty, and the Header/Quick Edit no longer forcibly inserts Home or excludes Donate. The explicit “Reset to defaults” control remains. Footer compatibility repairs only a known list of historical wrong destinations (such as `/about` for Projects or `/publications` for Strategic Plan); any other saved/custom destination is preserved exactly, so standard legacy data can still reach its intended dedicated page without overriding arbitrary Admin links. New navigation writes reject unsafe URL schemes. Local authenticated CRUD/SSR regression now covers both canonical legacy repairs and custom destination preservation; the currently logged-in production user and delete-the-last-saved-link behavior remain **UNVERIFIED**.

### Cross-page language QA

- Direct browser inspection of `/strategic-plan` while the page language was Dzongkha showed the header and footer translated but the main title, body copy, and all five card descriptions remained in English. This confirms the site's current language switch does **not** translate the core content across all pages.
- The shared product card now uses the existing `shop.add_to_cart` and `shop.out_of_stock` Dzongkha translations, so those common controls follow the selected language. Typecheck and optimized production build passed; live browser test toggled the language to Dzongkha and confirmed eight visible Add buttons changed to བཙུགས. Full public-page text localization remains **PENDING**.
- The EN/Dz switcher is now the last control at the far right of the top header row on desktop and mobile, outside the menu drawer. Commit `8a0167f` was deployed; production build passed and PM2 restarted online. Live browser checks at phone width confirmed the switch is visible after the hamburger, and while scrolled confirmed the header stays fixed with the language switch still visible. The default browser viewport was restored. Core page translation remains **PENDING** outside the listed localized surfaces.
- Continued Dzongkha localization on `/news` and `/publications`: page titles, intros, filters, search controls, count labels, empty states, links, calls to action, and publication/news navigation copy use the shared EN/Dz dictionary. Dynamic record values required the record-level translation fields tracked below.
- Production continuation deployed from `4525a13`: remote optimized build passed and PM2 `habbhutanplatform` returned online. Browser verification while toggling Dzongkha showed translated controls and core interface copy on `/news` and `/publications`; English was restored after the test. Publication/article/event record titles and descriptions remain English. Added Events page UI localization locally; typecheck and full optimized build passed, but it is not yet deployed or live-verified.
- Events UI continuation deployed from `f50cc1b`: production build and PM2 restart passed. On live `/events`, the heading, introductory copy, filter label/options, event count, open-to-all fallback, details link, and event-host CTA displayed in Dzongkha after toggling the mobile menu switch; English was restored afterward. Event category names, dates, titles, place names and descriptions are still English record values, and the address/call sentence only has its introductory text localized. Full event-record bilingual support remains **PENDING**.
- Bilingual record support for news, events and publications added nullable Dzongkha fields in Prisma; controls in Quick Edit and dedicated Admin forms; API create/update pass-through; and language-aware rendering on list/detail pages with English fallback. Commit `889a0d4` was deployed: generated production SQL was additive-only nullable `TEXT` columns; production schema sync completed without `--accept-data-loss`; optimized production build passed and PM2 returned online. Read-only live checks confirmed localized interface labels on `/news`, `/events`, and `/publications`. Records remain English where no Dzongkha value exists. Authenticated live create/edit and populated translation display remain **UNVERIFIED**; no live records were modified.
- Live read-only QA found anomalous record counts on `/news` (12 rows) and `/publications` (32 rows), including repeated/generated-looking entries rather than the expected reference content counts. These are production data-quality mismatches only; no live rows were edited or removed. Verify origin/duplication in Admin or a read-only database review before considering cleanup.
- The local PostgreSQL database `hab_platform` uses `WIN1252`, which cannot round-trip Dzongkha. Production database encoding was directly checked as `UTF8`. Do not attempt an in-place encoding conversion on the existing local database without a separately reviewed, data-preserving migration plan. Local Unicode persistence and populated production translations remain **UNVERIFIED**.
- Universal public-page Quick Edit now exposes separate English and optional Dzongkha text fields. Saved `text` overrides apply in English mode; saved `textDz` values apply in Dzongkha mode, while absent Dzongkha values leave the page's own localized content or English fallback untouched. The Admin Live Quick Edit manager exposes both fields; the API accepts and returns optional `textDz`. Local typecheck and optimized build passed. Commit `d907785` is included in the deployed `f939d65` release. Authenticated visual interaction, saved bilingual override persistence, and post-edit language-toggle behavior remain **UNVERIFIED**.
- Strategic Plan, Mandate/AoA, and Code of Ethics card records now have optional Dzongkha title/body/metric/tag columns; the existing native Quick Edit/Admin card form edits them, and the three public card lists choose the translation in Dzongkha mode with English fallback. The production schema diff contained only four nullable `TEXT` columns and was synced without a data-loss flag. Commit `f939d65` was built and deployed; production build passed, PM2 is online, all three public routes returned 200, and the anonymous governance-card API returned 401. Local browser rendering and language-switch behavior passed; cards fall back to English because approved Dzongkha values have not been entered. Authenticated CRUD, verified Unicode field round-trip and translation accuracy remain **UNVERIFIED**.
- Deployment was performed with a fast-forward Git pull, reviewed additive-only Prisma sync, production build, and targeted PM2 restart. The repository deployment script was not run because it includes a hard reset, `--accept-data-loss`, and an admin credential reset. Existing untracked server paths `.data/`, `.htaccess`, and `public/uploads/` were preserved; no production content records were edited.
- Order/checkout pages now expose the separate native Quick Edit editor for order lookup and fulfillment (customer, items, shipping destination, tracking, internal notes, and order status). It deliberately does not create or hard-delete orders, and it does not directly confirm payment; cancellation/refund/shipment transitions carry explicit confirmation, reason and existing API permission/audit requirements.
- During anonymous-access testing, `/api/admin/orders` returned seeded fallback orders with HTTP 200 because its catch block treated authorization errors like database outages. That was a sensitive data exposure. The route now returns the original authorization status and never supplies fallback customer/order information on an auth failure. PATCH checks permission before looking up an order ID, preventing unauthenticated ID enumeration. The fix is deployed in commit `362e000`; live anonymous GET and PATCH requests both returned 401.
- TypeScript typecheck and optimized local and production builds pass after the order-editor/security changes. The build emitted existing repo-wide React-hook/image lint warnings but no errors. On the built local server, `/checkout`, `/basket`, `/track-order`, and `/order-confirmation/test` returned HTTP 200; production `/publications` and `/clusters` returned HTTP 200. Anonymous `GET /api/admin/orders` and `PATCH /api/admin/orders` returned HTTP 401, with no order body. Authenticated role-specific browser workflows remain **UNVERIFIED**.
- Replaced `scripts/deploy-aapanel.sh` with a guarded deployment flow: requires a clean tracked checkout on `main`, uses fast-forward-only Git sync, requires the existing `.env`, avoids destructive Prisma flags and arbitrary process kills, never resets credentials, preserves untracked uploads/config, restarts only the existing named PM2 app, and checks its local health endpoint. `bash -n` and dangerous-command scan passed. Script runtime behavior remains **UNVERIFIED**; the production release above was performed manually and did not run this script.
- Product details now have nullable database fields for size, weight, materials, care instructions and lead time. Admin product create/edit and the separate public Quick Edit product form include all five; the admin API persists them and includes them in recycle-bin snapshots. Product detail pages no longer substitute a hardcoded SKU map or fabricated specification values; they show only saved details. Local schema sync was additive-only; authenticated local API integration created a temporary product, verified the public read, updated all five values, verified the Admin list, and removed the test record successfully. The `0a0212b` changes were included in the production fast-forward described in the prior execution log; production authenticated CRUD remains **UNVERIFIED**.
- Header whitespace reported from a 797px screenshot: at compact widths the primary navigation is hidden. An initial spacing adjustment put the action group too far from the logo; live screenshot review exposed that and the auto-spacer was removed so logo, search and action buttons form one compact group. The utility strip also overflowed and hid its language control; the switch is sticky at the far right of the upper strip at all widths. A server fast-forward to `cc442c1` was confirmed, but the subsequent remote build/restart session ended before a result was captured. Current production spacing and same-width live pixel recheck are **UNVERIFIED**; a fresh key-based SSH attempt was rejected.
- Quick Edit save reliability: header settings/navigation, footer navigation, and donation support-pillar saves no longer swallow failed HTTP responses and then show a success state. 401/403 responses surface a staff-session/permission message; other errors identify the failed item/action. Added `scripts/verify-quick-edit-navigation.mjs`, which exercised anonymous-write rejection plus authenticated navigation create, public read, update and delete against the local running app; all checks passed and temporary records were cleaned up. Local typecheck and optimized production build completed with PostgreSQL running; existing repository-wide lint warnings remain. The visual Quick Edit failure-state/browser workflow, footer CRUD, and support-pillar CRUD are **UNVERIFIED**.
- Membership Quick Edit gap: `/membership` and `/register` now open the native records tab for membership categories (name, key, dues, eligibility, benefits, banner upload, order, visibility, and CRUD) instead of an unrelated member-directory form. Category API mutations now require the matching `members:create`, `members:edit`, or `members:delete` permission; `members:view` is read-only. Local authenticated create/read/update/delete and public category API read-back passed; a members:view-only write attempt returned 403; test category/user/roles were cleaned up. Optimized build and typecheck passed. Authenticated visual Quick Edit use and image upload remain **UNVERIFIED**.
- Membership application Quick Edit: `/register` now opens a dedicated staff-only application-record tab with create/list/search/edit/delete, CID/document/payment-proof viewing, and confirmed approve/reject/under-review actions; finalized applications cannot be deleted in this UI. Application API PATCH now authorizes by action before querying the submitted ID, preventing anonymous ID-existence probing. Fallback-only applications can be edited in the fallback store and are promoted to the database before final approval/rejection so approval uses the existing atomic Member/User enrollment path. Local authenticated application create/list/update/delete passed; anonymous PATCH with a real temporary ID returned 401 before lookup; temporary users/roles/application and test audit records were cleaned up. Full optimized build and typecheck passed. Staff browser interaction, approval/member enrollment, real email delivery, fallback-only promotion, and production deployment are **UNVERIFIED**; the test did not approve/reject or send email.
- Order payment authorization follow-up: the order API previously allowed any `orders:edit` user to set `paymentStatus`, despite payment verification being a separate financial action. Added granular `orders:payment` to the role editor and now require it for payment-status writes (except refunds, which still require `orders:refund`) and `orderStatus=PAID`; authorization occurs before order-ID lookup. Admin order edits omit unchanged statuses so editing tracking/notes on a paid order does not demand unnecessary payment authority. Payment status changes receive a dedicated audit action and old/new payment-state details. Local API permission matrix now passes: anonymous write 401, `orders:edit`-only staff 403 without a state change, and `orders:payment` staff persisted PAID; all temporary order/user/role/audit data was removed. Live authenticated permissions and actual payment processor reconciliation remain **UNVERIFIED**.
- Production read-only checkpoint (8 Oct 2026): commit `8538b77` completed additive-safe Prisma sync, built all 52 static pages, restarted only `habbhutanplatform`, and passed `/api/admin/health`. Public `/`, `/register`, `/membership`, `/publications`, `/strategic-plan`, `/clusters`, and `/product/LHA01` returned HTTP 200; anonymous orders/applications/membership-category endpoints returned HTTP 401. After the payment-authorization change, commit `b806abc` was deployed using the guarded fast-forward script; the production schema was already in sync, the optimized build passed, only `habbhutanplatform` was restarted, and the app health check reported `Deployment healthy at commit b806abc`. The same public routes returned HTTP 200 and all three protected endpoints returned HTTP 401. The local authenticated Quick Edit regression script could not run because PostgreSQL at `127.0.0.1:5432` was unavailable; no writes were attempted against production. Staff-side payment permission behavior is deployed but **UNVERIFIED** end-to-end.
- Donation ledger Quick Edit continuation: `/donate` now adds a distinct native records tab alongside the existing page/pillar editors. It supports receipt search/list, recording a manual donation, editing donor/amount/frequency/status, and viewing saved payment-proof links. The delete affordance is a permission-checked void: it retains the receipt/audit row, removes a completed gift from totals, and updates the pillar tally and donation status transactionally. The donations API now requires separate `donations:view/create/edit/delete` permissions, validates status/frequency/amount, records before/after details, and no longer authorizes via broad stale JWT role claims. Commits `1779868` and `10b851f` are deployed; production reported healthy with its PostgreSQL connection live, `/donate` returned HTTP 200, and anonymous donation API GET returned HTTP 401. Local authenticated UI/API and ledger reconciliation tests remain **UNVERIFIED** because local PostgreSQL is unavailable. Staff roles need these new donation permissions enabled before using the ledger.
- Public route/editor source audit: the route scanner found 25 public `page.tsx` files without their own SectionEditBadge import. Inspection showed these were aliases/re-exports/redirects to canonical pages, wrappers around the register editor, or pages whose editor is mounted in a shared client component (`/wholesale`, `/pages/[slug]`). The public layout mounts the universal page editor globally. This narrows the gap to field-level coverage and logged-in browser behavior; it does **not** establish all-page Quick Edit completeness or page parity, which remain **UNVERIFIED**.
- Latest read-only production route sweep (8 Oct 2026): derived route paths from the built Next.js route manifest and checked 62 public routes with representative values for dynamic segments. All 62 returned HTTP 200; an intentionally unknown custom-page slug returned the expected 404. No forms were submitted and no records were written. This verifies availability only; live content/design/image parity and staff Quick Edit behavior across these routes remain **UNVERIFIED**.
- Rendered-image audit: added `scripts/audit-public-images.mjs`, which fetches public route HTML, collects `<img>`, `<source>`, `srcset`, lazy image attributes and inline CSS URLs, then HEAD-checks same-origin assets. Initial live scan fetched 77 pages, found two broken URLs (`/images/hero-2.jpg` and `/images/hero-5.jpg`) on craft-detail cluster cards, and skipped external-host images. Root cause was a generated legacy fallback path when a database cluster had no image. It now uses the matching existing client-data cluster image or `/assets/photos/hero-2-punakha.jpg`. The `ClusterData` type now includes the existing reference `image_path`/`image_alt` fields. TypeScript and optimized build pass; all 6 reference cluster image files and the shared fallback exist locally. Commit `c505649` was fast-forward deployed using the guarded production deploy script; Prisma reported schema in sync, the production build generated 52/52 static pages, only `habbhutanplatform` was restarted, and the deployment health check passed. A post-deploy repeat scan fetched 77 route variants and checked all 31 same-origin rendered media URLs with no broken URLs detected. The scanner now also fetches linked same-origin stylesheets and checks image URLs used by CSS; the repeat audit scanned two linked stylesheets and still found no broken same-origin image URLs. External-host and client-only images remain outside coverage. Visual image quality, resolution, and parity with the reference are still **UNVERIFIED**.
- Public-upload validation follow-up: both `/api/upload` and `/api/donations/upload` now require supported JPEG/PNG/WebP/GIF/PDF signatures to agree with the declared MIME type and derive saved extensions from the validated type, not a client filename. `scripts/test-public-upload-validation.ts` directly invoked both route handlers: each rejected an SVG body labeled PNG, accepted a supported PNG signature named `attacker.svg`, saved it as `.png`, and removed its temporary test file. Five supported signatures and four malformed/mismatched cases passed; TypeScript passed and the optimized production build generated all 52 static pages. The local build logged database-unavailable errors during dynamic prerender fallback because PostgreSQL at `localhost:5432` is offline; database-backed rendering remains **UNVERIFIED**. Commit `22b0359` was deployed with additive-only schema sync (already in sync), successful 52/52 production build, and the guarded health check; only `habbhutanplatform` was restarted. No production upload forms or upload APIs were exercised. Live upload tests and filename/MIME behavior on production remain **UNVERIFIED**.
- Live home-page content defect: browser accessibility inspection of the production homepage showed all four support pillars rendering the opening sentence twice. The duplication came from deriving the card lead from the opening sentence of `description` while also rendering the full description. Added `removeRepeatedLead` to show that sentence only once without modifying or deleting stored data; pure regression cases cover repeated, distinct and empty leads. TypeScript and optimized build passed; commit `f1b80bc` deployed with production schema already in sync, 52/52 pages built, and health check passed. A fresh live homepage read confirmed each support pillar lead/body appears once. The rest of the homepage has not been compared to the reference and remains **UNVERIFIED**.
- Footer-link recheck correction: an initial interpretation of ellipses in the browser accessibility output suggested blank targets, but the read-only `/api/navigation` response showed all 19 footer entries have configured `href` values. Seven distinct internal paths were checked and all returned HTTP 200 (`/about`, `/members`, `/membership/apply`, `/news`, `/publications`, `/shop`, `/track-order`). A further target check found `/about#mandate`, `#ethics`, and `#support` had no matching anchors (the contact and governance anchors did exist). The About page now adds anchors to its objectives and values sections, plus a Quick-Editable support-policy index linking to the canonical shipping, returns and customs pages. TypeScript and optimized build passed; commit `de834ce` was deployed with production schema already in sync, 52/52 pages generated, and guarded health check passed. A read-only live HTML check confirmed all three anchors and each policy target returned HTTP 200. Hash scroll behavior in a visual browser and corresponding actual footer click remain **UNVERIFIED**; no production footer records were changed.
- Local authenticated CRUD rerun (8 Oct 2026): after confirming `.env` targets only the local `hab_platform` database, started the existing embedded PostgreSQL data directory and local app on port 3033. `scripts/verify-quick-edit-navigation.mjs` passed again: anonymous navigation create returned 401; authenticated navigation CRUD/public read passed; members:view-only category create returned 403; category CRUD/public read passed; membership-application CRUD passed; anonymous application edit returned 401; all temporary rows, users, roles and audit rows were cleaned up. No production records were touched. The local database remains WIN1252; this run used ASCII-only test values and does not verify Dzongkha persistence. `scripts/db-server.mjs` now handles SIGINT/SIGTERM by stopping embedded PostgreSQL cleanly.
- Local payment/order verification (8 Oct 2026): with the host restricted to local PostgreSQL, the COD/mBoB record test passed create, address read, payment reconciliation and cleanup; its revised `finally` cleanup also runs after assertion failures. Payment permission API matrix passed for anonymous, edit-only, and payment-authorized roles. These tests exercised database state and authorization only—no card processor, mBoB, bank, real payment, customer notification or production record was involved. Both local server processes were stopped after tests. TypeScript passed; local PostgreSQL remains WIN1252.
- Excel import follow-up (8 Oct 2026): preview validators now reject member rows without craft/region and flag repeated CID/name or email within one workbook; comparisons are case-insensitive. The two protected import APIs now reject malformed row objects, cap a file at 5,000 rows, detect duplicates within the same request, and no longer turn a failed database duplicate lookup into “not found.” Local unit tests passed for XLSX Unicode round-trip, missing required member fields, duplicate member CID/wholesale email, and invalid wholesaler email. A local authenticated member API import created one row, returned duplicate/invalid-row details, skipped the same row on re-import, and cleaned up its temporary record/user/audit data. TypeScript and optimized 52-page build passed; database-backed prerender logged expected local PostgreSQL-offline errors. Wholesale import API, live Excel flows, and export/download UX remain **UNVERIFIED**.
- Wholesale Excel import follow-up (8 Oct 2026): duplicate rows that match an existing database or fallback buyer now appear in `badRows` with their spreadsheet row number and exact duplicate email; member imports now likewise explain existing CID/name duplicates rather than only incrementing `skippedCount`. A localhost-only authenticated wholesale API test seeded a temporary existing buyer, imported one valid buyer alongside existing/in-file duplicates and an invalid email, confirmed the row-level duplicate reasons and invalid-row feedback, re-imported the valid buyer to verify idempotence, and removed test database/fallback rows and the test user/audit rows. `npm run typecheck`, spreadsheet validation tests, and the local wholesale/member import API tests passed. Commit `b4d7409` was pushed and deployed; the production build generated all 52 pages and the live health endpoint reported `HEALTHY` with PostgreSQL connected. Authenticated browser preview/export/download UX and live Excel flows remain **UNVERIFIED**.
- Excel export workbook follow-up (8 Oct 2026): separated the workbook-byte generation from the browser download trigger so it can be directly tested. Tests generate actual `.xlsx` workbooks for both member and wholesale templates, reopen them through the same parser, confirm all headers round-trip, and preserve Dzongkha text. Spreadsheet validation tests and TypeScript pass. The optimized local build generated all 52 pages; database-backed pages logged their known local PostgreSQL-offline fallback warnings. Commit `745dd3a` was pushed and deployed; production generated all 52 pages and `/api/admin/health` reported `HEALTHY` with PostgreSQL connected. This verifies workbook generation/encoding, not the authenticated browser download click or import-modal visual workflow; those remain **UNVERIFIED**.
- Admin navigation usability pass (8 Oct 2026): removed artificial numeric prefixes from sidebar categories and made module search ignore surrounding spaces. Commit `0e2b470` was pushed and deployed; production generated all 52 pages and health was confirmed afterward. This is a source-level navigation refinement only; authenticated visual browser testing and the broader admin usability audit remain **UNVERIFIED**.
- Read-only live Quick Edit check (8 Oct 2026): inspected the currently open production homepage accessibility tree. It shows the public content and the language switcher in the upper utility strip; no staff Quick Edit bar is present in this browser session. The live health endpoint also reported `user: null`, so this is consistent with the admin-only guard and is not a test of the signed-in editor. No production content was changed; authenticated Quick Edit open/save/close/image behavior remains **UNVERIFIED** until a staff session is available.
- Quick Edit dismissal improvement (8 Oct 2026): the page-level floating editor now closes when clicking outside the editor on page whitespace or excluded UI, in addition to its labeled Close button and Escape key. Its panel is exposed as a named dialog for assistive technology. TypeScript, diff checks, and the optimized build (52/52 pages; local PostgreSQL-offline fallback warnings only) passed. Commit `4505e43` was deployed by the guarded script, which reported healthy; a follow-up live health request confirmed PostgreSQL connected. Signed-in browser confirmation that click-outside/Close/Escape behaves as expected remains **UNVERIFIED** because the open browser session is logged out.
- Excel import result visibility (8 Oct 2026): member and wholesale import dialogs now stay open after a successful API response and show imported count, duplicate count, and every API-returned row/reason, with a Done action; this prevents server-detected duplicate/error details from disappearing when the modal closes. Preview-valid records carry their original spreadsheet line number into the import API, and API errors use that source number even when earlier invalid rows were filtered out. Local authenticated wholesale/member API tests passed, including wholesale server results mapping to original workbook rows 7, 11, and 18; spreadsheet XLSX/Dzongkha/source-row unit tests, TypeScript and a connected-DB 52-page production build passed. Commit `154b5df` was deployed by the guarded script, which reported healthy; a live health request confirmed PostgreSQL connected. Dialog rendering and clicks were not browser-tested.
- Live rendered-image audit refresh (8 Oct 2026): first run exposed that the audit script's synthetic `/pages/strategic-plan` example was not a real CustomPage and correctly returned 404. The scanner now discovers actual custom-page paths from public header/footer navigation instead of probing that fabricated slug. Rerun fetched 76 valid route variants with 0 non-200 pages, scanned two same-origin stylesheets, and checked all 31 discovered same-origin rendered/CSS image URLs with no broken URLs. External-host and client-only images remain outside scan coverage.
- Read-only 34-template/live-route heading pass (8 Oct 2026): derived all 34 HTML-to-route mappings from the existing route audit, used sample slugs for dynamic detail routes, and fetched every live route successfully (34/34 HTTP 200). 24 templates had exact static H1 matches; the remaining 10 are JavaScript-populated detail templates with blank placeholder H1s in the source HTML, and every sampled live detail route rendered an H1. This confirms route/H1 availability, not full data, text, element, image-quality, or visual-design parity; those remain **UNVERIFIED**.
- Read-only production asset audit re-run (8 Oct 2026): fetched 76 route samples (including navigation-linked custom pages), all returned HTTP 200. Scanned 31 rendered/same-origin CSS image URLs across two linked stylesheets; all returned successful HEAD responses. No broken same-origin images were found in server-rendered HTML/CSS. External-host images and images rendered only after client JavaScript/data loading were not covered; visual resolution/quality is still **UNVERIFIED**.
- Admin CRUD test safety (8 Oct 2026): removed the 19-module test script's embedded fallback admin credential and added a hard localhost-only guard before any network request. `node --check` passed; an intentional production-host dry run stopped with the safety error before requests. The full destructive CRUD suite remains **UNVERIFIED** and must be run only against local test data with an explicit test account.
- Footer destination and first-render correction (8 Oct 2026): production data had entries pointing to About anchors, Publications, Shop, and News instead of the page named by the footer label. Releases `252a006` and `e408971` corrected the routes; read-only production API checks verified all 19 currently configured labels. Commit `5a26fb1` reuses one canonical resolver in SSR, API, and client rendering, and reads active navigation before producing public page HTML so saved header/footer labels, columns, and links appear immediately rather than flashing built-in fallback content. Local regression passed, including saved navigation on initial homepage HTML, all 12 footer route fixtures, authorization checks, membership-category/application checks, and test-record cleanup. Typecheck and optimized build passed. The guarded production build applied no schema changes, generated successfully, restarted only `habbhutanplatform`, and passed health (`HEALTHY`, PostgreSQL connected). A read-only production check confirmed the initial homepage HTML contains all 19 current footer labels and their saved/canonical destinations. Footer first-render correction is **DONE and DEPLOYED**. No production content/forms/payments were changed.
- Membership application admin controls (8 Oct 2026): commit `3b9b064` adds approve/decline/view/edit/delete actions for applications, a confirmation before approval, and a reset-password action for enrolled/verified members. The application list now resolves approved applications to their verified member record by CID so the reset action targets the correct user account. The reset API returns a one-time temporary password, requires password change at next login, increments session version, and invalidates the previous session. Local `scripts/verify-membership-password-reset.mjs` passed; it created and cleaned temporary local test rows and confirmed account mapping, reset behavior, and token invalidation. Typecheck and optimized production build passed; guarded deployment to production completed at `3b9b064`, schema already in sync, only `habbhutanplatform` restarted, and health passed. No real application was approved/declined and no live email was sent. Signed-in Admin visual/use check and real configured email delivery remain **UNVERIFIED**.
- Secretariat public accuracy correction (8 Oct 2026): read-only production inspection found all 6 displayed Secretariat staff names were “Name to confirm”; the local offline fallback instead invented six plausible names, roles and email addresses. The read-only HTML reference explicitly says names and portraits are still to be supplied. The page now filters those unconfirmed records without deleting/changing them and uses a neutral update notice plus the association’s general contact when no verified staff identities are available; the offline fallback no longer invents identities. `npm run typecheck`, optimized build, and local built `/secretariat` check passed (HTTP 200; update notice and general contact present; no placeholder or invented staff names in HTML). Production page deployment and browser appearance after release remain **PENDING**.
- Governance identity accuracy follow-up (8 Oct 2026): extended the same non-destructive placeholder-name filter to Board of Trustees and About page governance/team blocks. Placeholder identities are hidden and honest “details to be confirmed” messaging is used; records are not deleted or rewritten. Local typecheck/build and rendered route smoke checks for `/about`, `/board-of-trustees`, and `/secretariat` passed. Production release `fe2c75a` is live; all three routes returned HTTP 200 and no rendered “Name to confirm” placeholder. Authentic member identities and portraits still require HAB source material; portrait correctness remains **UNVERIFIED**.
- Wholesale buyer sign-in correction (8 Oct 2026): `/wholesale/shop` previously initialized itself as authenticated and its sign-in form merely toggled a client boolean, so it did not authenticate an account at all. It now validates the server-issued wholesale session, requires an approved active account, posts credentials to the real wholesale auth API, displays actionable auth errors and buyer-tier context, and truly clears the session at sign-out. `/wholesale/login` now opens the trade catalogue after login. Approval/reset fallback storage is kept in sync with the temporary password shown to Admin. `scripts/verify-wholesale-login.mjs` passed locally with isolated temporary fixtures: invalid password 401, pending account 403, active buyer login by email, session persistence, logout, and restored local fallback data. Typecheck/build passed. Release `fe2c75a` is deployed; live `/wholesale/shop` and `/wholesale/login` return HTTP 200, the unauthenticated session check correctly returns `authenticated=false`, and both Admin routes redirect unauthenticated visitors to Admin login. A real buyer login was intentionally not attempted; credential delivery and buyer-specific browser confirmation remain **UNVERIFIED**.
- Wholesale order workflow and simpler Admin entry points (8 Oct 2026): Wholesale Trade Desk now has two clear actions—Create wholesale order and Manage products—and an active buyer’s detail view can start a preselected order. The existing product catalog has its own create/edit workflow; a direct link is provided rather than duplicating product forms in the wholesale screen. Manual Order now supports wholesale buyer selection, canonical buyer contact details, account discount preview, separate initial payment/order states, and catalogue line items. `Order` records are linked to `WholesaleBuyer`; server-side creation verifies the buyer remains active, calculates discount from the saved buyer tier (ignoring client price), requires payment-verification permission for a paid order, rejects walk-in wholesale checkout, and atomically decrements stock. `scripts/verify-wholesale-order-create.mjs` passed against loopback/local PostgreSQL: buyer linkage, canonical identity, 25% price calculation despite forged client price, unpaid order visibility, stock decrement, paid-order permission denial without inventory changes, and walk-in rejection. The local schema synchronized. Typecheck, optimized build, and image/spreadsheet regression tests passed. Release `fe2c75a` was pushed and deployed: remote schema sync and app build passed, only `habbhutanplatform` was restarted, the guarded health check passed, and the live health endpoint reports `HEALTHY`. Live signed-in Admin visual confirmation remains **UNVERIFIED**; no production orders or products were created.
- Members directory integrity pass (8 Oct 2026): compared `/members` to the read-only HTML reference and inspected the live public honours API. The reference contains demo fallback names (“Name to confirm”); the production API currently returns five active records whose portrait URLs are generic hero/event photography. The directory query now filters to active records and matches the public API ordering, its offline fallback excludes demo names, and generic hero/About-HAB assets are shown as a clearly labeled “Portrait to be supplied” placeholder instead of being presented as a person. No database/live record or image was edited. `npm run typecheck` and optimized build passed (52/52 pages; known local DB-offline prerender warnings); built local `/members` returned 200, hid “Name to confirm” entries, and showed an honest empty state when the database was offline. Commit `30e403f` was pushed and deployed through the guarded script; production generated 52/52 pages, target PM2 app came online, and deployment health passed. Read-only live verification: health `HEALTHY`/PostgreSQL connected, `/members` renders no “Name to confirm” and labels the five generic portraits as pending; `/api/honours` still returns the same five active records. Real portrait images and staff-authenticated portrait-upload workflow remain **UNVERIFIED**.
- Follow-up rendered-page defect fixes (8 Oct 2026): the read-only production DOM sweep found HHB10 member/wholesale product cards consuming legacy `/placeholders/hhb10_*.jpg` entries even though the API exposed the existing `/assets/photos/product-hhb10.jpg` fallback, a SWITCH-Asia project detail with no hero `src` when the database project had no cover, and direct text nodes inside `div` elements omitted by the universal Quick Edit element selector (including wholesale shop note, tender rows/badges, annual-report badge, board role labels, and ethics enforcement labels). Product list/detail APIs now normalize/filter unusable legacy placeholders and retain valid uploaded images/metadata; member detail and wholesale shop prefer the canonical normalized image; project detail matches route keys against the route slug/name and safely selects an available cover; Quick Edit includes direct `div` text nodes while retaining direct-text-only targeting. Added a focused image-normalization regression test. `npx tsx scripts/test-product-image-normalization.mjs`, `npm run typecheck`, and optimized build (52/52 pages) passed. Local built `/projects/switch-asia` rendered its expected H1 and a real `/assets/photos/hero-1-weaving.jpg` hero (1800px natural width); lazy/offscreen local gallery images were not treated as broken based on an immediate `complete` flag. Production image/API and logged-in Quick Edit browser checks are pending deployment; no production data was edited. Image-quality appropriateness and authentic project photography remain **UNVERIFIED**.
- Deployment status for `f1f2845` (8 Oct 2026): the earlier “NOT DEPLOYED” checkpoint was superseded after secure SSH authentication was provided. The guarded script fast-forwarded the production checkout from `30e403f` to `125bd73`, confirmed Prisma schema already in sync, generated all 52 pages, restarted only `habbhutanplatform`, and completed its healthy deployment check. Read-only live verification: `/api/admin/health` returned `HEALTHY` with PostgreSQL connected; `/api/products?limit=100` now returns HHB10 `images: [{url:"/assets/photos/product-hhb10.jpg",role:"primary"}]` with no placeholders, and the asset responds HTTP 200. `/projects/switch-asia` renders the expected H1 and loaded hero image, with no broken images. `/product/HHB10` completed client loading, rendered “Handheld Bag”, loaded its product image and had no broken images. Production records and forms were not changed. Signed-in Quick Edit behavior remains **UNVERIFIED**.
- Wholesale product-detail visual follow-up: read-only production browser inspection of `/product/HHB10` found related-product cards all using `/assets/photos/product-hhb01.jpg` because the related-products API returned raw images but no resolved `image_path`. The product-detail API now adds the maker name relation and runs each related item through the shared product-image normalizer, exposing per-item `image_path`, `imageUrl` and filtered `images`. The normalization regression test covers HHB01/SAD03/KIS02 legacy placeholders. Commit `c701a00` was deployed subsequently; the live `/api/products/HHB10` now returns three distinct SKU-matched related-image paths. Production records were not edited.
- Universal Quick Edit rendered-text sweep (8 Oct 2026): after adding direct `<div>` text, a 24-route local rendered DOM scan found four more uncovered direct-text nodes, all `<option>` labels on the wholesale sort select. `<option>` is now in the editable selector. A repeat scan across 24 public routes (wholesale shop/registration, members/detail, governance/tenders/reports, projects/detail, programmes, news/events, publications, donations, contact/shop, craft/product detail, strategic plan/mandate, and policies) found no visible direct-text nodes outside the selector. This is source/DOM coverage evidence only; staff-authenticated edit/save/undo and image-upload behavior remain **UNVERIFIED**.
- Product-catalog correctness follow-up (8 Oct 2026): live APIs showed cross-assigned SKU photos and a published automated test product in related results. Product normalization now resolves known SKUs to matching assets, preserves valid uploads, and public catalogue reads suppress non-published/test fixtures without deleting or changing database records. Regression tests, TypeScript, and optimized 52-page build passed. Commit `d882029` was deployed through the guarded release; the live health endpoint is `HEALTHY` with PostgreSQL connected. Read-only API checks confirmed the HHB10 hero and three distinct matching related photos, and that the test SKU is absent. Photo appropriateness across every route remains **UNVERIFIED**.
- Header layout correction (8 Oct 2026) — **DONE and deployed** as `1465a79`: at 752px viewport, production DOM geometry confirms one 74px header row; logo x=22; Search x=288; currency/shop/basket/menu in one uninterrupted group x=476–715; primary navigation row hidden; language switch remains in upper 38px utility strip (x=653). Captured and visually inspected the production header at this width; its composition matches the supplied one-row example. Production CSS bundle includes the final ordered tablet override. Guarded deployment fast-forwarded to `1465a79`, generated 52/52 routes and passed its health check; follow-up production health is HEALTHY/PostgreSQL connected. Temporary viewport override was reset. TypeScript and product-image regression tests passed. No production records were changed.
- Admin CRUD/security follow-up (8 Oct 2026): confirmed the B2B cards in the user's screenshot are the wholesale product catalogue, not the downloadable PDF/lookbook fields. Trade Desk already edits each card's MOQ, lead time, custom terms, and volume tiers; the separate Products admin provides product create/read/update/archive/delete. Added a direct “Manage Catalog Products” link from the Trade Desk; local typecheck and optimized build passed. Hero slide admin API now enforces database-backed `content:view/create/edit/delete` permissions, rejects unsafe image/link URL schemes, and writes audit events; the UI now surfaces load/delete/visibility failures instead of reporting success. The loopback regression `scripts/verify-wholesale-order-create.mjs` passed Hero Slide CRUD, anonymous denial (401), unsafe URL rejection (400), view-only mutation denial (403), plus existing wholesale pricing/quote/order checks; fixtures were cleaned up. Commit `a5be44a` was pushed and deployed through the guarded script; Prisma reported schema in sync, the full production build passed, only `habbhutanplatform` was restarted, and the server reported healthy at `a5be44a`. Read-only live checks returned health 200 and anonymous hero-slide/products Admin APIs 401; no production records were changed. Signed-in Admin browser behavior remains **UNVERIFIED**. Overall completion remains a rough **56%** estimate (not end-to-end verified); broad scope gaps recorded above remain open.
- Spreadsheet regression continuation (8 Oct 2026): against the local loopback app and local PostgreSQL only, `scripts/test-member-import-api.mjs` and `scripts/test-wholesale-import-api.mjs` both passed authorized imports, detailed bad/duplicate row results, idempotent repeat-import behavior, and fixture cleanup. `npx tsx scripts/test-spreadsheet-validation.ts` passed Dzongkha XLSX parse/export round-trips, templates/headers, required-field validation and duplicate checks. `npx tsx scripts/test-product-image-normalization.mjs` also passed. No production forms or records were touched. Browser-level spreadsheet selection/preview/download/export and real staff role permissions remain **UNVERIFIED**.
- B2B catalog media save reliability (8 Oct 2026): the Admin previously swallowed database errors and always reported a successful catalog/lookbook save; it also authorized this content through `products:edit`. The save now requires `content:edit`, rejects unsafe asset URL schemes, propagates database errors, and the UI checks both HTTP and API success. Local loopback regression verified successful persistence, unsafe URL rejection (400), a content-view-only denial (403), and restored the original local SiteSetting afterward. Typecheck and optimized build passed. This concerns the PDF/lookbook fields, separate from the B2B product cards. Commit `42f5eab` was pushed and deployed through the guarded script; Prisma schema was in sync, production build passed, and the named HAB PM2 process restarted. Read-only checks returned health 200 and anonymous Admin hero/trade endpoints 401. Signed-in Admin UI remains **UNVERIFIED**.
- Footer destination follow-up (8 Oct 2026): read the public production navigation API without changing it. The active footer currently has 18 distinct internal targets; each target (`/about`, `/mandate`, `/code-of-ethics`, `/strategic-plan`, `/secretariat`, `/shop`, `/shipping-policy`, `/returns-policy`, `/track-order`, `/customs-policy`, `/members`, `/publications`, `/outlets`, `/membership/apply`, `/board-of-trustees`, `/annual-reports`, `/audited-accounts`, `/tenders`) returned HTTP 200 with no redirect. Public layout resolves legacy label/URL combinations to dedicated routes before rendering. This verifies current link destinations and availability, not every page's content/design parity; full footer visual comparison remains **UNVERIFIED**. No production records were changed.
- Live navigation and footer localization follow-up (8 Oct 2026): rechecked all current header/footer internal links from the production navigation API; 22 unique destinations returned HTTP 200. Compared every live footer column and link label against the Dzongkha footer map; found and added the missing “Member shops” translation. The live-footer-label coverage check reports 23 distinct labels and zero missing translation keys; `npm run typecheck` passed. Commit `4fa59ef` was deployed through the guarded release; production generated the full route build and the HAB PM2 process returned online. Post-deploy health reports `HEALTHY`/PostgreSQL connected, and read-only inspection of the homepage's served JS confirmed the Dzongkha label exists in the deployed bundle. Live switcher interaction and translation quality review remain **UNVERIFIED**.
- Admin destination fidelity follow-up (8 Oct 2026): tightened the shared footer resolver so it repairs only explicitly known legacy misroutes and preserves other custom URLs saved through Admin. Extended `scripts/verify-quick-edit-navigation.mjs`; local loopback test passed all 12 legacy route fixtures and a custom `/pages/custom-strategy` URL in public API output and initial server-rendered HTML, alongside existing auth/CRUD checks; fixture rows were removed. `npm run typecheck` and optimized build passed. Commit `4386ac3` was deployed by the guarded script, which confirmed schema in sync, full production build, only the named HAB PM2 restart, and healthy status. Post-deploy read-only checks report health `HEALTHY`, public navigation API success, and all 22 current internal header/footer destinations HTTP 200; no production menu rows were changed. Live testing of a newly saved custom URL still requires an authenticated staff session and remains **UNVERIFIED**.
- Strategic-plan language follow-up (8 Oct 2026): replaced English-only rendering for the page's static labels/copy, monitoring cards, action links, and the five default strategic-pillar title/description/milestone fields with English/Dzongkha-aware `LocalizedRecordField` rendering. Database-provided pillar Dzongkha values remain authoritative; static fallback translations apply only when the default copy is used. `npm run typecheck`, `git diff --check`, and the complete optimized Next.js production build passed. Existing unrelated ESLint warnings remain. Dzongkha editorial review and live language-switch interaction are **UNVERIFIED**; no production content was edited.
- Strategic-plan release verification (8 Oct 2026): commit `6816324` was pushed and deployed through the guarded server script. It fast-forwarded without disturbing server-only `.data`, `.htaccess`, or uploaded media; schema was already in sync; the full production build passed; only `habbhutanplatform` was restarted; health returned healthy. Read-only live HTTP checks returned 200 for `/strategic-plan` and `/api/admin/health`. The local `.data/` artifact remains untracked and untouched. Live visual language-toggle behavior and Dzongkha editorial review remain **UNVERIFIED**.
- Fresh production image/page availability audit (8 Oct 2026): reran `node scripts/audit-public-images.mjs` from the current 78-route source build (76 concrete public routes after alias/parameter expansion plus linked custom pages). All 76 fetched pages returned HTTP 200; all 38 unique same-origin image/CSS assets discovered from the rendered HTML and linked stylesheets returned successful status. No broken same-origin image URL was found in this covered set. This does not detect client-only/lazy assets, inspect external hosts, judge resolution/authenticity, or establish page visual parity; those remain **UNVERIFIED**. Read-only requests only.
- Governance-page localization implementation (8 Oct 2026): `/mandate` and `/code-of-ethics` now render static headings, facts, explanatory copy, reporting information, action links, and fallback article/ethics cards through English/Dzongkha-aware fields. Saved admin-provided Dzongkha values remain authoritative; fallback translations are used only when database card records are absent. Typecheck, `git diff --check`, and complete optimized build passed. Existing repository ESLint warnings remain. Deployment and route availability are documented in the release-verification entry below. Dzongkha proofreading and interactive language-toggle verification remain **UNVERIFIED**.
- Governance-page localization deployment (8 Oct 2026): release `b2e9dcf` fast-forwarded on the server via the guarded script; production schema was already synced, optimized build passed, only the HAB PM2 app was restarted, and health recovery passed. Read-only live HTTP checks returned 200 for `/mandate`, `/code-of-ethics`, and `/api/admin/health`. No production records or forms were modified. Interactive language-switch behavior, saved database-card translation coverage, and Dzongkha editorial review remain **UNVERIFIED**.
- Publication and audited-accounts integrity correction (8 Oct 2026): production read-only inspection found two rows titled `HAB Annual Craft Sector Impact Report ####`, matching the exact title pattern generated by `scripts/test-all-19-admin-crud.js`; they were still being exposed by `/api/publications` and `/annual-reports`. Added a precise public-visibility filter for that legacy test pattern without deleting/changing any database rows. Removed the API's sample-publication fallback, which used non-document `/publications` URLs. `/annual-reports` no longer substitutes invented report dates, outcome highlights, summaries, or a fake report collection; it renders saved publication title/year/metadata/summary only and describes missing attachments honestly. `/audited-accounts` previously invented specific auditor identities, clean opinions, revenue/disbursement/admin figures, and compliance claims unsupported by Publication fields; these were removed. That page now lists only saved account-publication metadata and attached original files, and directs financial questions to the source statements. Added Dzongkha-aware labels/copy on both pages. Focused title-filter assertions passed (both known fixtures hidden; ordinary title preserved), typecheck, `git diff --check`, and the complete optimized build passed. Production records remain untouched. Editorial translation review and authenticated Admin workflows remain **UNVERIFIED**; deployment result is documented below.
- Publication integrity release verification (8 Oct 2026): commit `067d51c` was deployed by the guarded script; schema was already synced, full production build passed, only `habbhutanplatform` was restarted, and health recovery succeeded. Read-only live checks: `/api/publications` returns success with 32 records and neither of the two generated fixture titles; `/annual-reports`, `/audited-accounts`, and `/api/admin/health` return 200; audited-page output contains none of the fabricated auditor/revenue/disbursement assertions removed above. A separate live check found zero attached `fileUrl` values among the remaining 32 publication records, so no publication PDFs could be checked for download availability. The UI accurately shows that no file is attached. Real source documents need to be attached by HAB through Admin; no records/forms/files were changed. Dzongkha review and signed-in Admin workflow remain **UNVERIFIED**.
- B2B wholesale price-break editor follow-up (8 Oct 2026): the user's screenshot refers to product-specific B2B pricing cards. Existing Trade Desk CRUD edits/creates/removes product wholesale terms (MOQ, lead time, customisation, enable/disable and tier prices); retail product CRUD remains in `/admin/products`. Updated the terms drawer to add/remove price-break rows dynamically (up to the API's eight-tier limit), adjust each threshold/unit price, and sort rows before saving. Removal of wholesale terms now requires `products:edit`, not `products:delete`, since the action leaves the retail product intact. Server validation still enforces MOQ, increasing thresholds and valid non-negative prices. After the final code changes, `npm run typecheck`, `git diff --check`, and full optimized `npm run build` passed; existing unrelated ESLint warnings remain. Commits `74e0028` and `469554a` are pushed to GitHub. Production deployment is blocked because key-only SSH returned `Permission denied (publickey,password)`; no password-based shell workaround was used. No production data was changed. Browser interaction/authenticated production permissions remain **UNVERIFIED**; overall Admin usability/CRUD and site plan remain open.
- Membership Quick Edit CRUD regression (8 Oct 2026): the membership landing page mounts the native Quick Edit Records editor for category records, and the member-application page mounts its own application CRUD/review editor; these do not route the editor action into Admin. Ran `scripts/verify-quick-edit-navigation.mjs` against the localhost app/PostgreSQL only: membership-category create/update/public read/delete passed, the `members:view`-only writer was correctly denied, and membership-application create/list/update/delete passed; temporary fixtures/roles were cleaned. This is API regression evidence, not browser interaction proof; signed-in Quick Edit visual usability remains **UNVERIFIED**. Production data/forms were not touched. The prior B2B commits remain pushed at `81f603f`; production deploy remains blocked by key-only SSH authentication as recorded above.
- Wholesale approval/login hardening (8 Oct 2026): approval previously swallowed database-update failures and could still send credentials/report success while a DB buyer remained pending; it now returns 503 before sending any email when the DB write fails, and verifies fallback persistence before proceeding. Login no longer treats missing password hashes as valid and no longer falls back to plaintext comparisons; wholesale JWT authentication now requires a configured 32-character secret rather than a hard-coded fallback. Added `scripts/verify-wholesale-approval-login.mjs`, restricted to loopback hosts; it creates/cleans temporary local DB buyers and verifies staff approval -> ACTIVE status/password-hash match -> login with issued credential -> authenticated session/logout, plus denial for an active record with an empty hash. The localhost regression passed; email was simulated, no real email or production account was touched. `npm run typecheck`, `git diff --check`, and optimized `npm run build` passed (pre-existing repository ESLint warnings remain). Commit `9ca9e9c` is pushed to GitHub but is not deployed. Production deployment is still blocked by the key-only SSH failure documented above; authenticated production behavior remains **UNVERIFIED**.
- Membership application submission reliability (8 Oct 2026): `/api/applications` previously wrote a fallback copy even when PostgreSQL succeeded and always returned success even if both stores failed. It now uses PostgreSQL as the normal source and writes/verifies fallback storage only if the database insert did not succeed; it returns 503 rather than a false success when neither store persisted the record, and rejects non-HAB craft keys. Added loopback-only `scripts/verify-membership-application-submit.mjs`; it confirms unconfigured CARD attempts and mBoB submissions missing proof are rejected, a temporary PDF proof uploads and is retrievable over localhost, valid payment-reference/proof submission becomes a PENDING database record with saved payment method/receipt notes, and an invalid craft is rejected. The local upload and database record were both cleaned up by the test; no payment was performed, no email/live record or `.data` fallback file was changed. `npm run typecheck`, `git diff --check`, and the optimized build passed; pre-existing unrelated ESLint warnings remain. Commit `64daddd` is pushed to GitHub but not deployed. Real provider checkout and signed-in Admin proof-view interaction remain **UNVERIFIED**; production release is still blocked by SSH authentication.
