# Handoff: Handicrafts Association of Bhutan — website redesign

## Overview

A redesign of handicraftsbhutan.org covering the public website, the e-shop, and a public
membership database. The organisation is a registered Civil Society Organization that supports
~7,500 micro and small craft enterprises and sells member work centrally through its own shop.

The design is **mission-first**: the association's purpose, programmes and accountability lead the
page; commerce is prominent but secondary. The 13 arts and crafts of Bhutan (Zorig Chusum) are the
primary organising principle of the shop — they are the category system, not a tag.

Thirteen linked screens: Home, About us, Programmes, Projects, Shop landing, Shop grid (all
products / by craft / by collection), Product detail, Member directory, Member profile, Membership
application (3 steps + confirmation), Member login, Publications, News & events, Basket & checkout.

**Read `BUILD-RULES.md` first.** It carries the exact type scale, layout geometry, header-menu
behaviour and CMS contract that must not change during implementation.

## About the design files

The files in this bundle are **design references created in HTML** — a working prototype that shows
intended layout, copy and behaviour. They are **not production code to copy directly**.

The task is to **recreate these designs in the target codebase's existing environment** (React, Vue,
Laravel/Blade, WordPress theme, etc.) using its established patterns, component library and
conventions. If no environment exists yet, choose the most appropriate stack for the project — see
"Platform notes" below — and implement the designs there.

`HAB Website.dc.html` is a single-file prototype using a small internal streaming-template runtime.
Do not treat its template syntax (`{{ }}`, `<sc-for>`, `<sc-if>`) as a target format; read it as
markup + data + handlers and translate. All styling is inline by design in the prototype — in
production, extract it into whatever the codebase uses (CSS modules, Tailwind, SCSS).

## Fidelity

**High-fidelity.** Colours, typography, spacing, radii, copy and interaction states are final and
should be reproduced exactly. Two exceptions:

- **All imagery is a labelled placeholder** (striped fill + a monospace caption such as
  `photo — weaving`). The client supplies real photography. Every placeholder caption states what
  belongs there; keep the aspect ratios given.
- **Sample content**: news items, event dates, report titles, registration numbers
  (`CSO/2011/043`, `HAB-2026-0417`, order `HAB-S-88214`), member names and product descriptions are
  plausible stand-ins for structure. Real figures that ARE from the client and must be kept verbatim
  are listed under "Verbatim content" below.

---

## Design tokens

### Colour

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#33261F` | Dark surfaces (About band, footer, promo panels, summary rails), primary "ink" buttons, body text |
| `--ink-2` | `#4A3C33` | Secondary body copy on light |
| `--muted` | `#6B5A4C` | Meta text, labels, captions |
| `--bg` | `#F4F0E7` | Page background (warm cream) |
| `--surface` | `#FFFCF8` | Cards, panels, inputs — warm white, never pure #FFF |
| `--line` | `#E4DDD1` | Card and panel borders |
| `--line-soft` | `#EFE9DE` | Dividers inside cards |
| `--field-border` | `#CDBEA8` | Input and select borders; dashed empty-state borders |
| `--accent` | `#8B2E24` | Madder red. Primary action (Shop button, price CTAs), links, eyebrow labels, AND the highlight surface for the Programmes governing-principles box and delivery band |
| `--accent-hover` | `#6E241C` | Hover for accent buttons |
| `--accent-deep` | `#7A2820` | Raised cards ON an accent surface (delivery step cards) |
| `--accent-rule` | `#A85246` | Dividers on an accent surface |
| `--accent-label` | `#F0D2C9` | Eyebrow/label text on an accent surface |
| `--accent-body` | `#F6E7E2` | Body copy on an accent surface |
| `--accent-faint` | `#EBC9C2` | Fine print on an accent surface |
| `--accent-soft` | `#F1E9DB` | Craft/category tag ground on light |
| `--brass` | `#C9A46A` | Secondary accent: eyebrow labels on `--ink` surfaces, link underlines on dark. NEVER as text on the cream ground (fails contrast) and never on small text over accent red |
| `--on-dark` | `#F1ECE2` | Headings on `--ink` |
| `--on-dark-body` | `#D2C2AE` | Body copy on `--ink` |
| `--on-dark-faint` | `#A8947F` | Fine print on `--ink` |
| `--dark-line` | `#4E3D2E` | Dividers on `--ink` |
| `--dark-line-2` | `#463629` | Footer top rule |
| `--dark-surface-2` | `#42332A` | Raised panel on `--ink` |
| `--verify-bg` | `#EFF0E4` | "HAB verified" badge ground |
| `--verify-fg` | `#4C6B41` | "HAB verified" badge text |
| `--hover-nav` | `#EDE5D6` | Nav item hover |
| `--hover-menu` | `#F1EADC` | Dropdown row hover |
| `--placeholder-a` | `#E8E1D4` | Image placeholder stripe A |
| `--placeholder-b` | `#F0EBE0` | Image placeholder stripe B |
| `--placeholder-cap` | `#86745F` | Placeholder caption text |
| `--dark-ph-a` / `--dark-ph-b` | `#42332A` / `#463629` | Placeholder stripes on `--ink` |

Selection: `background:#8B2E24; color:#fff`.

Image placeholder fill (all light contexts):
`repeating-linear-gradient(135deg,#E8E1D4 0 9px,#F0EBE0 9px 18px)`
On dark: `repeating-linear-gradient(135deg,#42332A 0 9px,#463629 9px 18px)`

### Typography

Three families, loaded from Google Fonts:

- **Figtree** (400/500/600/700/800) — all headings, buttons, nav, labels, prices, numerals.
- **Lora** (400/500, 400 italic) — body copy. `body { font-family: Lora, Georgia, serif }`.
- **IBM Plex Mono** (400/500) — eyebrows, metadata, counts, breadcrumbs, product references,
  placeholder captions.

| Role | Family | Size | Weight | Tracking | Notes |
|---|---|---|---|---|---|
| Hero h1 | Figtree | 60px | 800 | −0.03em | line-height 1.03, `text-wrap: balance` |
| Screen h1 | Figtree | 42–44px | 800 | −0.03em | Shop, Directory, Basket, Apply |
| Section h2 | Figtree | 40px | 700 | −0.025em | About, Zorig Chusum, Programs |
| Sub-section h2 | Figtree | 26–32px | 700 | −0.02em | "New in the shop", "Reports & publications" |
| Card title | Figtree | 15.5–20px | 600–700 | −0.01em | product 15.5px, craft card 20px, member 17px |
| Body large | Lora | 17–18.5px | 400 | — | line-height 1.6–1.66 |
| Body | Lora | 14.5–16.5px | 400 | — | line-height 1.55–1.6 |
| Nav / button | Figtree | 13.5–15.5px | 500–600 | — | `white-space: nowrap` on all header items |
| Eyebrow | IBM Plex Mono | 11–11.5px | 400 | 0.14–0.16em | uppercase |
| Meta / count | IBM Plex Mono | 10.5–11.5px | 400 | 0.06–0.12em | often uppercase |
| Stat numeral | Figtree | 38px (24px on profile) | 700 | −0.03em | line-height 1 |

Use `text-wrap: pretty` on paragraphs, `text-wrap: balance` on the hero h1.

### Spacing, radius, elevation

- Page container: `max-width: 1280px`, `padding: 0 40px`. Narrower shells: Basket 1180px,
  Membership/Login 1080px.
- Section rhythm: `padding-top: 86px` between major home sections; 78px before the dark About band;
  final section `padding-bottom: 90px`.
- Card grid gap: 22px. Filter/summary panel gap: 26px. Two-column feature gap: 44–64px.
- Card padding: 20–26px. Panel padding: 24–38px. Confirmation panels: 52px.
- Radius: `7px` buttons and chips, `8–9px` inputs and large buttons, `10–12px` cards and panels,
  `14px` hero/feature panels and confirmation cards, `50%` avatars.
- Only one shadow in the design — the Shop mega-menu:
  `0 18px 44px rgba(58,42,33,.16)`. The Members dropdown uses `0 14px 34px rgba(27,26,24,.12)`.
  Cards carry borders, not shadows.
- Minimum layout width is **1200px** (`min-width:1200px` on the utility bar, header row and footer
  grid) — the prototype is desktop-only and scrolls horizontally below that. See "Responsive".

---

## Global chrome

### 1. Utility bar (top, `--ink` background, 38px)
Left: `Registered Civil Society Organization · CSO Act of Bhutan 2007` in `--on-dark`.
Right, in order: `Contact the secretariat`, `Tenders & vacancies`, `Publications`, `Donate`, a 1×15px
`--dark-line` divider, then the language switch `EN / རྫོང་ཁ` (EN active in `--on-dark`).
All IBM Plex Mono 11px, tracking 0.05em, hover to `#fff`.
Toggleable — the prototype exposes a `showAnnouncementBar` boolean prop (default true).

### 2. Header (sticky, 74px)
`position: sticky; top: 0; z-index: 50`, `background: rgba(248,244,236,.94)` with
`backdrop-filter: blur(10px)`, `border-bottom: 1px solid --line`.

Row contents, left to right, gap 34px:

1. **Logo lockup** (click → Home): 38px circle, `--accent` fill, white Figtree 800 14px "HAB";
   beside it two lines — `Handicrafts Association` (Figtree 700 14.5px) and
   `OF BHUTAN · EST. 2005` (11px, `--muted`, tracking 0.04em).
2. **Primary nav** (Figtree 500 14px, `padding: 9px 12px`, `border-radius: 6px`,
   hover `background: --hover-nav`): About Us · Programs · Projects · News & Events · Members ▾.
   The first three are in-page anchors (`#about`, `#programs`); News & Events and Members route.
3. **Members dropdown** (opens on `mouseenter`, closes on `mouseleave`): 250px white panel, 8px
   padding, rows 10px/12px with hover `--hover-menu` — Directory by category · Publications &
   downloads · Member shops & outlets · divider · **Members-only login** (accent, 600).
4. **Search field**: 212px × 42px, white, `--line` border, radius 7px, `⌕` glyph in
   `--placeholder-cap`, placeholder `Search crafts, members`. Enter routes to Shop with the term
   held in state. (Production: wire to real product + member search.)
5. **Currency toggle**: IBM Plex Mono 11.5px chip, `USD $` ⇄ `BTN Nu.`, white, `--line` border.
   Switching reformats every price on every screen.
6. **Membership** button: outline `--ink`, radius 7px, `10px 15px`; hover inverts to `--ink` fill.
7. **Shop** button: `--accent` fill, white, `10px 16px`, with a ▾ caret. Click → Shop.
   **Hover opens the shop mega-menu** (below).
8. **Basket**: 42px square, white, `--line` border, 🧺 glyph, with a count badge — 20px min-width
   pill, `--accent`, white Figtree 700 11px, offset `top:-7px; right:-7px`. Badge hidden at 0.

### 3. Shop mega-menu
660px panel anchored `top: 46px; right: 0` off the Shop button. White, `--line` border, radius 12px,
padding 20px, shadow `0 18px 44px rgba(58,42,33,.16)`, `z-index: 60`.
Eyebrow `SHOP BY CRAFT CATEGORY`. Then a 3-column grid of all 13 crafts — each row is the Dzongkha
name (Figtree 600 14px) over the English craft (12.5px `--muted`), hover `--hover-menu`, click →
Shop filtered to that craft. Footer rule, then `All products →` (`--ink` fill),
`Your basket` (outline), spacer, `Free EMS over $200` in mono.

> **Design note:** an earlier version put a permanent 13-chip craft strip under the header. It was
> removed as visually noisy. Craft access is deliberately in three places only: this mega-menu, the
> 13 picture cards on the landing page, and the left rail on the Shop screen. Do not reinstate a
> persistent category bar.

### 4. Footer (`--ink`, `padding: 64px 0 34px`)
Grid `1.35fr repeat(4, 1fr)`, gap 34px, `min-width: 1200px`.
Column 1: 36px logo circle + name, then the mission line
"A registered Civil Society Organization under the CSO Act of Bhutan 2007. Established 2005.",
then contact block in IBM Plex Mono 11.5px / line-height 1.9 —
`Metog Lam, Thimphu, Bhutan` / `Office +975-2-338089` / `officehab@gmail.com`.
Columns 2–5 (title Figtree 700 13.5px `--on-dark`, links Lora 14.5px `--on-dark-body`, hover `#fff`,
9px gap):

- **Association** — About HAB · Programs · Projects · Membership · News & events
- **Shop & support** — E-shop · Shipping & delivery · Returns · Track your order · Duty & customs
- **Members** — Directory by category · Publications · Member shops · Member login · Apply to join
- **Governance** — Board of directors · Secretariat · Annual reports · Audited accounts · Tenders & vacancies

Bottom rule (`--dark-line-2`), then two mono 11px lines:
`© 2026 Handicrafts Association of Bhutan. All rights reserved. · Registration CSO/2011/043` and
`Prices shown in {currency} · Payments by card, mBoB and bank transfer`.

---

## Screens added after the first handoff

Three screens joined the set; they follow the same tokens, card and section rules as the rest.

### Shop landing (`/shop`)

The **Shop** button in the header now opens a shop landing page; the category-filtered grid keeps
its own route (`/shop/all`, `/shop/{craft}`). Sections in order:

1. **Promo hero** — a single `--ink` panel, radius 16px, grid `1.02fr .98fr`. Left `padding: 64px
   56px`: brass eyebrow `THE HAB E-SHOP`, h1 "Handmade in Bhutan, bought fairly, shipped worldwide"
   (Figtree 800 52px, −0.03em, balanced), 17.5px `--on-dark-body` paragraph, then
   `Shop all products` (accent fill) and `Shop by craft ↓` (`--dark-line` outline, anchors to the
   craft grid). Right: dark striped placeholder, min-height 420px, caption
   `shop hero — seasonal collection, styled`.
2. **Service bar** — 4 hairline cells (1px gap on `--line`), radius 12px: Worldwide shipping ·
   Duty made clear · 14-day returns · Secure payment.
3. **New arrivals** — h2 34px + mono subline "Added to the catalogue this month", `All products →`,
   then 4 standard product cards.
4. **Shop by craft** (`id="shop-crafts"`) — `repeat(auto-fill, minmax(210px, 1fr))`, gap 16px. Each
   tile: 3/2 placeholder with a caption chip, then Dzongkha name (Figtree 700 16px), English gloss,
   and a mono accent `N products →` (pluralised).
5. **Collections** — 3 cards, 16/9 placeholder, name + mono count, description, "Shop the
   collection →". Collections are price/craft rules, not stored categories:
   `Under $50` = price < 50 · `Textiles & weaving` = thagzo, tshemzo ·
   `Home & table` = tshazo, shagzo, dezo. Selecting one routes to the grid with a removable
   `Collection: {name} ✕` chip above the results.
6. **Most bought** — 4 product cards.
7. **Two closing panels** — "Meet the makers" (into the membership database) and "Trade &
   wholesale" (quote request, catalogue download).

### Projects (`/projects`)

Breadcrumb, h1 "Projects", a 17.5px intro, and a 2×2 hairline totals grid (projects delivered,
artisans reached, funding managed, funding partners).

**Tabs** — two pill buttons with counts, `Projects in hand` / `Completed projects`; the active one
takes `--ink` fill. Separated from the list by a `--line` rule.

**Project card** — white, radius 14px, grid `300px 1fr`. Left: striped placeholder, min-height
260px, caption chip. Right, `padding: 28px 30px 30px`:
- Status chip (`In progress` accent-on-`--accent-soft`, `Completed` `--verify-fg`-on-`--verify-bg`),
  then period and budget in mono.
- h2 Figtree 700 26px; funding partner line in accent 14.5px; 16px summary (max 78ch).
- Two columns `1.15fr .85fr`, gap 34px:
  **Key activities** — numbered rows (mono accent `01`…) divided by `--line-soft`, 15.5px text.
  **Achievements to date** — a `--bg` panel, radius 11px, holding 2–3 figures (Figtree 700 23px
  numeral + 13.5px `--muted` label), then a 6px progress bar (`--accent` on `--line-soft`) with a
  mono caption — `N% of workplan delivered` for live projects, `Final report published` for
  completed ones.

Closing: an `--ink` "Partner with us on the next one" band (contact + project reports), and a mono
note that the records are samples to be replaced by the secretariat's project register.

Data shape per project: `status`, `name`, `partner`, `period`, `budget`, `progress` (live only),
`summary`, `activities[]`, `results[{n, l}]`.

### Shop empty state

Any craft with no listed products (5 of the 13 in the sample data) renders a dashed `--field-border`
panel in place of the grid: "Nothing listed in {craft} right now", a craft-specific explanation that
HAB buys in batches so stock rotates, then `Commission a piece` (`--ink`), `Notify me when
available` (outline) and `Browse all crafts →`. Never leave the grid empty.

## Screens

### Home

Order of sections, top to bottom:

1. **Hero** — grid `1.05fr .95fr`, gap 56px, `padding: 64px 40px 20px`.
   Left: accent mono eyebrow `CIVIL SOCIETY ORGANIZATION · BHUTAN`; h1
   "Towards a vibrant & sustainable handicrafts sector"; 18.5px Lora paragraph (max 52ch);
   three actions — `Our mission` (`--ink` fill, hover to `--accent`), `Shop the crafts →`
   (white, `--field-border` border), `Find a member` (accent text only).
   Right: 4/3.4 placeholder, radius 14px, caption `hero photo — artisan at the loom, Khoma`.
2. **Stat row** — 4 columns between two `--line` rules, `padding: 26px 24px 26px 0` per cell.
   Figtree 700 38px numeral over 14.5px `--muted` label:
   `7,500` Micro & small enterprises in the network · `5,250` Women-led enterprises ·
   `195` Affiliated stores across Bhutan · `13` Arts & crafts of Zorig Chusum.
3. **Assurance band** — white card, `--line` border, radius 14px, 4 equal cells divided by
   `--line-soft`, 26px padding. Title Figtree 700 15.5px + 14px `--muted` body:
   Verified members only · Fair price, paid upfront · Secure payment · Tracked worldwide.
4. **About band** (`id="about"`, `--ink` background, `padding: 86px 0`) — grid `1fr 1fr`, gap 64px.
   Eyebrow `ABOUT US` in `--accent-tint-dark`; h2 "A network built for the artisans, not the
   middlemen"; two 17px paragraphs in `--on-dark-body` (verbatim client copy — see below);
   link "Read about our programs" with a 1px `--accent` underline.
   Right: 1/1 placeholder using the dark stripe fill, caption `photo — HAB training workshop`.
5. **Zorig Chusum — the 13 crafts** — heading block with eyebrow `ZORIG CHUSUM`, h2
   "The 13 arts & crafts of Bhutan", 17px `--muted` intro, and a right-aligned
   `Browse all crafts →`.
   Grid `repeat(auto-fill, minmax(286px, 1fr))`, gap 22px. **Each card**:
   - 16/10 placeholder header with a numbered badge `01/13` (mono 10.5px, `--ink` fill,
     `--bg` text, radius 4px, inset 12px) and a white caption chip `photo — carpentry`.
   - Body `padding: 18px 20px 20px`: Dzongkha name (Figtree 700 20px) beside the English craft
     (14.5px `--muted`); a 15px description paragraph; a `--line-soft` top rule then a mono accent
     row `N members · N products` with a `→`.
   - Whole card is clickable → Shop filtered to that craft. Hover `border-color: --ink`.
   All 13 names, English glosses and descriptions are in `crafts.json`.
6. **New in the shop** — h2 + `All products →`, then 4 product cards (see card spec below).
7. **Programs & projects** (`id="programs"`) — eyebrow, h2 "Change lives, build a better community",
   4 cards: 16/10 placeholder, Figtree 700 17px title, 14.5px `--muted` description, `Read more →`.
   Titles are the client's four service areas: Trade facilitation · Artisan support ·
   Education & awareness · Product innovation.
8. **Membership double panel** — grid `1fr 1fr`, gap 22px, radius 14px.
   Left (white, `--line` border): eyebrow `MEMBERSHIP DATABASE`, h3 "Find a member", 15.5px body,
   then an inline search field + `Search` button (`--ink` fill) → Member directory.
   Right (`--accent` fill, white text): eyebrow `JOIN HAB` in `#F0C4BD`, h3 "Become a member",
   body in `#F6DED9`, then `Apply for membership` (white fill, accent text) and
   `Member login` (translucent outline).
9. **News & events** — h2 + `All updates →`, 3 cards: mono kind-chip (`--accent` on `#F0EAE1`) +
   date, Figtree 600 18px title, 14.5px `--muted` blurb. Whole card routes to News.
10. **Reports & publications** — top `--line` rule, then grid `.85fr 1.15fr`, gap 52px.
    Left: eyebrow `ACCOUNTABILITY`, h2 "Reports & publications", 16px body, `All publications →`.
    Right: 2×2 grid of download cards — mono accent kind, Figtree 600 16px title, mono
    `PDF · size · note ↓` pinned to the bottom. Hover `border-color: --ink`.
11. **Partners & funders** — mono eyebrow, then a 6-column 1px-gap grid on `--line` (so cells read
    as a hairline table), each cell 78px, white, centred mono 11px name. Twelve partners; replace
    the text cells with real logo SVGs at handoff.

### Shop

Breadcrumb (mono 11.5px): `Home / E-shop / {craft or "All crafts"}`.
Grid `246px 1fr`, gap 44px, `align-items: start`.

**Left rail** (`position: sticky; top: 100px`):
- Label "Craft category", then a white `--line` card, radius 10px, rows divided by `--line-soft`:
  an `All crafts` row with the total count, then all 13 — Dzongkha name (Figtree 600 14px) over
  English (12.5px `--muted`) on the left, product count in mono on the right. Active row background
  `--accent-soft`; hover `--bg`.
- "Sort" select: Newest · Price: low to high · Price: high to low.
- Shipping note card: "EMS / Bhutan Post worldwide, 7–14 days. Duties and customs are payable on
  arrival — see the notes at checkout."

**Right column**: h1 = craft name + English, or "The HAB e-shop"; a 16.5px `--muted` intro (max
70ch) that changes with the filter; then a 3-column product grid, gap 22px.

**Product card** (used on Home, Shop, Product-related, Member profile):
white, `--line` border, radius 12px, `overflow: hidden`, flex column, hover
`border-color: #CFC0AC`.
- 1/1 placeholder with the product reference in mono 10.5px, centred. Click → Product.
- Body `padding: 15px 16px 16px`, 4px gaps: mono accent uppercase craft name; Figtree 600 15.5px
  product name (click → Product); 13.5px `--muted` maker or region; then a row with the price
  (Figtree 700 16px) and an `Add` button (outline `--ink`, radius 6px, `7px 12px`, hover inverts).
  `Add` must `stopPropagation` so it never triggers navigation.

### Product detail

Breadcrumb `Home / E-shop / {craft} / {reference}`.
Grid `1.1fr .9fr`, gap 56px.

**Left — gallery**: 2-column 12px grid. First cell spans both columns, 4/3, radius 12px, caption
`product shot 1 — {reference}`. Two 1/1 placeholders below.

**Right — buy column**:
- Mono accent line `{Dzongkha craft} · {English craft}`.
- h1 Figtree 800 38px, tracking −0.03em, line-height 1.08.
- Price Figtree 700 26px; below it 13.5px `--muted`: `{other currency} · duties payable on arrival`.
- 16.5px Lora description.
- Actions: `Add to basket` (accent fill, flex:1, 16px padding, radius 9px) and `Buy now` (outline
  `--ink`, adds to basket then routes to Basket).
- Spec table: white card, rows `13px 16px` divided by `--line-soft`, label `--muted` left, value 500
  right — Reference · Craft · Origin · Made by · Lead time ("Ships in 2 working days").
- **Maker card** — white, `--line` border, radius 12px, 18px padding, 54px circular placeholder,
  mono `MADE BY` label, Figtree 600 16px maker name, 13.5px `--muted`
  `{region} · HAB verified member`, `→` in accent. Click → that member's profile. This card is the
  bridge between shop and membership database and should not be dropped.
- Below: "More from {craft}" — 4 compact product cards (image, name, price only).

### Member directory

Breadcrumb `Home / Members / Directory`.
Header row: h1 "Membership database" + 17px intro (max 66ch) explaining the count and that every
listing links to that member's products; right-aligned `Apply for membership` button (accent fill).

**Filter bar**: white card, `--line` border, radius 12px, 18px padding, grid
`1.6fr 1fr 1fr auto`, gap 12px — free-text input (`Search by name, craft or village`), craft-category
select (all 13, labelled `Dzongkha — English`), dzongkhag select (derived from the data), and a
`Reset` text button. Below it a mono result line:
`N of M listings shown · directory sample of the full 7,500-member database`.
All three filters compose (AND) and the text search matches name, dzongkhag, craft name, craft
English and the blurb.

**Result cards**: 3-column grid, gap 22px. White, `--line` border, radius 12px, 22px padding, flex
column, gap 12px, hover `border-color: --ink`, whole card routes to the profile.
- 52px circular placeholder + Figtree 700 17px name + 13.5px `--muted`
  `{dzongkhag} · member since {year}`.
- Two mono 10.5px badges: craft category (`--accent` on `--accent-soft`) and
  `HAB verified` (`--verify-fg` on `--verify-bg`).
- 14.5px `--muted` blurb.
- `--line-soft` top rule, then `N products in shop` and `View profile →` in accent 600.

### Member profile

Breadcrumb `Home / Members / {name}`.
Grid `.95fr 1.05fr`, gap 52px.
Left: 1/1 placeholder, radius 14px, caption `portrait — {name} at work`.
Right: the two badges; h1 Figtree 800 44px; a 16px `--muted` line
`{dzongkhag}, Bhutan · HAB member since {year} · Reg. {number}`; a 17px story paragraph; a 3-column
stat strip between `--line` rules (products in the HAB shop / years registered / dzongkhag); then
`Shop this member's work` (`--ink` fill) and `Request a wholesale quote` (outline).
Below: "In the HAB shop" — 4-column grid of that member's products, each with an inline `Add`.

### Membership application

1080px shell. Breadcrumb `Home / Membership / Apply`. h1 "Apply for HAB membership" + intro
"Three steps, about five minutes. Dues are annual and can be paid by card, mBoB or bank transfer."

**Step indicator**: three equal blocks, each a 3px top border — `--accent` when
`stepNumber <= currentStep`, else `--line` — over mono `STEP N` and a Figtree 600 15.5px label:
Category & dues · Your details · Payment.

**Step 1** — 2-column grid, gap 22px:
- Three plan cards (2px border, `--accent` when selected else `--line`, radius 12px, 24px padding):
  name Figtree 700 20px + accent price, 14.5px `--muted` "who it's for", mono perks line.
  `Individual artisan` Nu. 500/year · `Craft enterprise` Nu. 2,000/year ·
  `Institutional` Nu. 5,000/year.
- A fourth cell: "Primary craft category" select (all 13) and "Dzongkhag" select.
- `Continue to details →` (accent fill) with a mono summary line beneath.

**Step 2** — white card, 30px padding, 2-column field grid, gap 18px. Fields (span in columns):
Full name / enterprise name (2) · Citizenship ID (1) · Business licence no., optional (1) · Mobile
(1) · Email (1) · Village / gewog (1) · Years practising the craft (1). Then a full-width `--bg`
note describing the document upload (citizenship ID, business licence, 5 MB limit) — implement as a
real drag-and-drop uploader. `← Back` (outline) and `Continue to payment →` (accent).

**Step 3** — grid `1.15fr .85fr`, gap 26px.
Left: white card, "Pay your annual dues", three radio rows (2px border, accent when selected; 19–20px
circle, `--field-border` ring, accent fill when active):
`International card` — Visa, Mastercard, Amex — 3-D Secure ·
`Bhutan mobile pay` — mBoB / RMA-approved wallets, in Nu. ·
`Bank transfer` — BNB / BOB account, invoice issued on order.
Right: `--ink` summary panel, radius 12px, 26px padding — eyebrow `SUMMARY`, then rows divided by
`--dark-line` (Membership, Craft, Dzongkhag), a Figtree 700 20px `Due today` row, then
`Submit application` (accent fill) and a `← Back to details` link.

**Confirmation** — white card, 52px padding, centred: 56px `--verify-bg` circle with a
`--verify-fg` check, h2 "Application received", 16.5px body quoting the reference and the
five-working-day verification window, then `Go to member area` (`--ink`) and `Back to home`.

### Member login

1080px shell, grid `1fr 1fr`, gap 44px, vertically centred, `padding: 64px 40px 110px`.
Left: mono accent eyebrow `MEMBERS-ONLY AREA`, h1 "Sign in to your member account", then five
benefit lines each prefixed with an accent em-dash: order history and consignment statements ·
submit new products for the HAB shop · download training material and publications · apply to trade
fairs and buyer meetings · renew annual dues online.
Right: white card, radius 14px, 34px padding — "Membership number or email" and "Password" fields,
`Log in` (accent fill), then `Forgot password` and `Not a member yet?` on one row.

### News & events

Breadcrumb, h1 "News & events", subtitle "Stay informed, stay empowered." (client's line).
Grid `1.4fr 1fr`, gap 26px.
Left: a column of article cards, gap 20px — each `grid-template-columns: 200px 1fr`, a striped
placeholder pane (min-height 150px) beside `padding: 22px 24px`: kind chip + date in mono,
Figtree 700 20px title, 15px `--muted` blurb, `Continue reading →`.
Right (`position: sticky; top: 100px`, gap 20px):
- "Upcoming events" card — rows divided by `--line-soft`, a 44px date block (Figtree 700 13px day
  over 11px `--muted` month) beside title + place.
- A `--ink` "Publications" card with a `Browse downloads` link underlined in `--accent`.
- A mono 11px note: "Sample copy — replace with real posts from the HAB newsroom."

### Basket & checkout

1180px shell. Breadcrumb `Home / Basket & checkout`. h1 "Your basket".
Three mutually exclusive states: **confirmed**, **empty**, **active**.

**Active** — grid `1.35fr .65fr`, gap 26px.
Left column, three stacked cards:
1. **Line items** — white card, rows 20px padding divided by `--line-soft`, each row: 86px square
   placeholder (radius 9px) · mono accent craft name + Figtree 600 16.5px product name + 13.5px
   `--muted` `{maker} · {region}` · a quantity stepper (`--field-border` border, radius 8px,
   `--bg` fill, 34px `−`/`+` hit areas with hover `--hover-nav`, 32px centred value) · a
   96px right-aligned line total (Figtree 700 16px) · a `Remove` text link. Decrementing to 0 drops
   the line.
2. **Shipping** — two radio rows in the same style as payment:
   `EMS / Bhutan Post` — 7–14 days, tracked, **free over $200**, otherwise $24 ·
   `Express courier` — 3–5 days, tracked and insured, $62.
   Below, a `--bg` note: "Import duty and local taxes are not included and are collected by your
   customs authority on arrival. HAB provides a commercial invoice and craft certificate in every
   parcel."
3. **Payment** — the same three methods as the membership application.

Right column (`--ink`, radius 12px, 26px padding, `position: sticky; top: 100px`): eyebrow
`ORDER SUMMARY`, rows for Subtotal, Shipping (`Free (EMS)` when waived), Paying with, then a
Figtree 700 22px Total, a 13px `--on-dark-faint` line `≈ {other currency} at today's rate`,
`Place order` (accent fill, 16px padding), and `← Keep shopping`.

**Empty** — white card, 56px padding, centred: "Nothing in the basket yet." +
`Browse the 13 crafts` (accent fill) → Shop.

**Confirmed** — same treatment as the application confirmation: check circle, h2 "Order confirmed",
body quoting the order number and the EMS tracking expectation, `Continue shopping`.

---

## Interactions & behaviour

- **Routing** is a single `screen` value: `home | shop | product | members | member | membership |
  login | news | cart`. Every route change scrolls to top and closes open menus. In production use
  real URLs: `/`, `/shop`, `/shop/{craft}`, `/product/{ref}`, `/members`, `/members/{slug}`,
  `/membership/apply`, `/members/login`, `/news`, `/basket`.
- **Dropdowns** (Members, Shop mega-menu) open on `mouseenter`, close on `mouseleave`, and are
  mutually exclusive. Add keyboard/focus support and `aria-expanded` in production — the prototype
  is mouse-only.
- **Currency toggle** flips a single `currency` value; every price string is derived, never stored
  formatted. `USD` → `$N` with thousands separators; `BTN` → `Nu. round(N × 84)`. **84 is a
  hardcoded placeholder rate — replace with a live or daily-cached RMA rate.** The product page and
  the basket total also show the opposite currency as a secondary line.
- **Add to cart** increments a `{reference: qty}` map. From a card it must stop propagation.
  `Buy now` adds then routes to the basket. The header badge shows the summed quantity and hides at
  zero.
- **Shipping cost** recomputes from the subtotal on every change: EMS is free at subtotal ≥ 200 USD,
  else 24; express is always 62. Values are USD-based and formatted through the currency helper.
- **Directory filters** compose and reset together. Empty result state is currently unstyled — add
  one ("No members match these filters").
- **Application steps** clamp to 1–3, then a terminal step 4 (confirmation). No validation is
  implemented; production needs required-field validation, CID format checks, file-type/size limits
  on upload, and a real payment handoff.
- **Hover states** are defined on: nav items (`--hover-nav`), dropdown rows (`--hover-menu`), cards
  (border darkens to `#CFC0AC` for products, `--ink` for craft/member/report cards), outline buttons
  (invert to `--ink` fill / `--bg` text), accent buttons (`--accent-hover`), footer and dark-panel
  links (to `#fff`).
- **Missing states to build**: loading skeletons, out-of-stock, form errors, login failure, search
  with no results, and pagination for the directory (only nine sample members exist; the real
  database is ~7,500 and needs server-side paging).

## State

| State | Type | Purpose |
|---|---|---|
| `screen` | enum | Active route |
| `currency` | `USD \| BTN` | Price formatting |
| `craft` | craft key or `""` | Shop category filter |
| `sort` | `new \| low \| high` | Shop ordering |
| `productCode` | reference | Product being viewed |
| `memberName` | member key | Profile being viewed |
| `cart` | `{ref: qty}` | Basket |
| `ship` | `ems \| exp` | Shipping choice |
| `pay` | `card \| mbob \| bank` | Payment choice |
| `placed` | boolean | Order confirmation |
| `q`, `craftFilter`, `region` | strings | Directory filters (`q` is shared with header search) |
| `joinStep` | 1–4 | Application progress |
| `joinPlan`, `joinCraft`, `joinRegion` | strings | Application selections |
| `menu`, `shopMenu` | booleans | Dropdown visibility |

Data the real implementation needs from the back end: product catalogue (reference, name, price,
craft, region, maker, description, images, stock), member records (name, craft, dzongkhag, join year,
registration number, story, verification status, linked products, portrait), news/events, and
publications. `crafts.json` in this bundle is reference data that can ship as a fixture — the 13
crafts do not change.

## Verbatim content

These are the client's own words and figures. **Do not rewrite.**

- Tagline: "Towards a vibrant & sustainable handicrafts sector"
- Hero paragraph: "Handicrafts Association of Bhutan supports local artisans in promoting their
  handicrafts in markets both within Bhutan and internationally, and supports skills development and
  capacity building of the craftspeople."
- Both About-band paragraphs (fair compensation / market accessibility; and the 7,500 MSE network
  with 5,250 women-led, 2,250 men-led, 195 affiliated stores, 100+ unique products).
- Stats: 7,500 · 5,250 · 195 · 13.
- Programme names: Trade facilitation, Artisan support, Education & awareness, Product innovation.
- Section lines: "Change lives, build a better community", "Stay informed, stay empowered."
- Contact: Metog Lam, Thimphu, Bhutan · Office +975-2-338089 · ED +975-77654508 ·
  Marketing +975-17462636 / 17881111 · officehab@gmail.com
- Partner list: RGoB, EU SWITCH-Asia, SHINE, GrAT, UNDP, SGP, EIF, Government of Canada,
  Ernst & Young, Helvetas Bhutan, BCCI, Bhutan Post.
- The 13 crafts and their English glosses (`crafts.json`).

## Assets

Nothing binary ships in this bundle.

- **Fonts**: Figtree, Lora, IBM Plex Mono — Google Fonts, open licence. Self-host in production.
- **Imagery**: none. Every image is a striped placeholder with a caption naming the shot required.
  Needed: one hero photograph; one training/workshop photograph; **13 craft-category photographs**;
  four programme photographs; product photography (three angles per product); member portraits; news
  thumbnails.
- **Logos**: the HAB mark is drawn as a text circle in the prototype — replace with the real logo.
  Twelve partner logos are text cells — replace with SVGs.
- **Icons**: only two glyph stand-ins, `🧺` (basket) and `⌕` (search). Replace with the codebase's
  icon set.
- **Dzongkha**: the language switch renders `རྫོང་ཁ`. Confirm the production font stack covers Tibetan
  script on Windows and Android.

## Platform notes

The current site runs WordPress + WooCommerce. Two viable paths:

1. **Stay on WordPress/WooCommerce** — implement as a custom theme. The 13 crafts become product
   categories; the membership database becomes a custom post type with taxonomies for craft and
   dzongkhag; membership dues use a subscription/payment plugin; member↔product links use a
   post-meta relation. Lowest operational change for the secretariat.
2. **Headless** — Next.js front end against WooCommerce or another commerce API. Better performance
   and full control over the layouts above; requires developer availability for maintenance.

Either way, three things are non-negotiable in implementation: multi-currency (USD/Nu.) with a real
rate source, a payment stack that covers international cards **and** mBoB/RMA, and EMS/Bhutan Post
shipping with tracking numbers.

**Security note:** at the time of this handoff the live site (handicraftsbhutan.org) was serving
injected spam content — the document title read "hacked by trenggalek6etar" and the news feed
contained casino spam. Treat the existing installation as compromised: do not migrate the existing
database or theme files without a clean audit, rotate all credentials, and rebuild from known-good
sources.

## Responsive

The prototype is **desktop-only at a 1200px minimum**. Breakpoints were not designed. Given that a
large share of buyers will arrive on phones, agree the mobile treatment before build. Recommended
starting rules:

- ≥1280px: as designed.
- 1024–1279px: container padding to 28px; product grids 3→2 up (Home "New in the shop" 4→3); footer
  `1fr repeat(2, 1fr)` on two rows.
- 768–1023px: single-column hero and About band; shop left rail collapses into a "Filter by craft"
  sheet or a horizontally scrolling chip row **on this screen only**; stat row 4→2; craft cards 2 up;
  basket summary moves below the line items.
- <768px: everything single column; header keeps logo, search icon, basket, and a hamburger holding
  nav + Shop + Membership; sticky elements unstick; all hit targets ≥44px; product cards full width.

## Files

| File | What it is |
|---|---|
| `HAB Website.dc.html` | The full prototype — all nine screens, all data, all handlers. Open in a browser. |
| `crafts.json` | The 13 crafts: key, Dzongkha name, English gloss, description. Ships as fixture data. |
| `HAB Website.dc.html` header order note | Landing section order is deliberate: hero → stats → About → New in the shop → assurance band → 13 crafts → Programs & projects → Membership → News → Reports → Partners. |
| `BUILD-RULES.md` | The implementation contract: exact fonts and sizes, fixed layout geometry, menu behaviour, CMS hooks, protected copy, open gaps. Read before writing code. |
| `README.md` | This document — overview, tokens, screen-by-screen specification. |
