# Build rules — do not change the design

This file is the contract for implementation. The prototype in this folder is the source of truth
for every measurement. Where this document and the prototype disagree, **measure the prototype**.

## 1. Type system — exact values, no substitutions

Three families, all Google Fonts, all self-hosted in production (do not hotlink):

| Family | Weights to ship | Used for |
|---|---|---|
| **Marcellus** | 400 only | Every display heading: page h1, section h2, panel h3. It has ONE weight — never synthesise bold, never apply `font-weight` other than 400 |
| **Figtree** | 400, 500, 600, 700, 800 | All UI: nav, buttons, card titles, prices, numerals, labels, form labels |
| **Lora** | 400, 500, 400 italic | All running body copy and paragraphs |
| **IBM Plex Mono** | 400, 500 | Eyebrows, metadata, counts, breadcrumbs, product references, placeholder captions, step labels |

```css
body { font-family: Lora, Georgia, serif; }        /* body default */
h1, h2, h3 { font-family: Marcellus, serif; font-weight: 400; }
.ui, button, nav, .card-title, .price { font-family: Figtree, sans-serif; }
.meta, .eyebrow { font-family: "IBM Plex Mono", ui-monospace, monospace; }
```

### Type scale — every size in the design (px, not rem-scaled)

| Role | Family / weight | Size | Line-height | Letter-spacing |
|---|---|---|---|---|
| Home hero h1 | Marcellus 400 | 60 | 1.03 | −0.008em |
| Page h1 (About) | Marcellus 400 | 56 | 1.06 | −0.008em |
| Page h1 (Programmes) | Marcellus 400 | 54 | 1.06 | −0.008em |
| Shop-landing promo h1 | Marcellus 400 | 52 | 1.04 | −0.008em |
| Page h1 (Shop grid, Directory, Projects, Publications, Basket, Apply) | Marcellus 400 | 42–46 | 1.06 | −0.008em |
| Section h2 (About band, Zorig, Programmes on home, Outlets) | Marcellus 400 | 40 | 1.1 | −0.008em |
| Featured publication h2 | Marcellus 400 | 38 | 1.1 | −0.008em |
| Product detail h1 | Marcellus 400 | 38 | 1.08 | −0.008em |
| Sub-section h2 (New in the shop, Programme types, Scope, Delivery, Values, Governance, Board, Team, Milestones) | Marcellus 400 | 34 | 1.2 | −0.008em |
| Vision / Mission h2 | Marcellus 400 | 36 | 1.18 | −0.008em |
| Panel h3 (Find a member, Become a member, Meet the makers, Wholesale, Outlet name) | Marcellus 400 | 26–34 | 1.12–1.2 | −0.008em |
| Project h2 (card) | Marcellus 400 | 26 | 1.2 | −0.008em |
| Stat numeral (home) | Figtree 700 | 38 | 1 | −0.03em |
| Stat numeral (profile, project results, milestones) | Figtree 700 | 22–24 | 1–1.2 | −0.02em |
| Card title — craft card | Figtree 700 | 20 | normal | −0.015em |
| Card title — governance tier, plan name | Figtree 700 | 19–20 | normal | −0.015em |
| Card title — programme object, member name, news (list) | Figtree 700 | 17–20 | 1.28–1.35 | −0.01 to −0.015em |
| Card title — product name | Figtree 600 | 15.5 | normal | normal |
| Body large (hero, intros) | Lora 400 | 17.5–18.5 | 1.6–1.62 | normal |
| Body (About band, project summary, objects) | Lora 400 | 16–17 | 1.55–1.66 | normal |
| Body small (card copy, meta descriptions) | Lora 400 | 14–15.5 | 1.45–1.6 | normal |
| Buttons / nav | Figtree 500–600 | 13–15.5 | normal | normal |
| Eyebrow | IBM Plex Mono 400 | 10.5–11.5 | normal | 0.1–0.16em, uppercase |
| Meta / count / breadcrumb | IBM Plex Mono 400 | 10–11.5 | normal | 0.05–0.12em |

Rules: no fluid/clamp typography, no rem re-scaling, no `font-display: swap` flash mitigation that
substitutes a fallback with different metrics. Paragraphs carry `text-wrap: pretty`; the hero h1 and
some panel headings carry `text-wrap: balance` — keep both.

## 2. Layout — fixed geometry

- **Minimum page width 1200px.** The root wrapper, the utility bar, the header row, every `<section>`
  container and the footer grid all declare `min-width: 1200px`. Below that the page scrolls
  horizontally as one piece; the design does not reflow. Do not remove these.
- Container: `max-width: 1280px; padding: 0 40px`. Narrower shells: Basket 1180, Membership/Login 1080.
- Header row is exactly 1200px of content at the floor: logo 206 + nav 437 + flexible spacer +
  search 128 + CTA cluster 299, `gap: 10px`, `padding: 0 40px`. **Every header child is
  `flex: 0 0 auto` with `white-space: nowrap`.** Adding or renaming a nav item, or widening the
  search field, overflows the row and pushes the basket outside the header surface. If you must add
  one, take the width back from the gap or the search field and re-measure.
- Section rhythm: 76–86px top padding between major sections; last section 90px bottom.
- Grid gaps: cards 20–22px, filter/summary columns 26px, feature columns 44–64px.
- Radii: 7 (buttons, chips), 8–9 (inputs, large buttons), 10–12 (cards, panels), 14–16 (feature
  panels, promo panels), 50% (avatars).
- Shadows: only two in the whole design — shop mega-menu `0 18px 44px rgba(58,42,33,.16)`, members
  dropdown `0 14px 34px rgba(27,26,24,.12)`. Cards use borders, never shadows.
- Sticky: header `top: 0`, shop left rail / news sidebar / basket summary `top: 100px`.

## 3. Header menus — required behaviour

Both the Shop mega-menu and the Members dropdown:
- open on `mouseenter` of the **wrapper** (not the button) and on click of the button (touch);
- the panel is a child of the wrapper, positioned `top: 100%` with the visual offset supplied by
  `padding-top: 10px` **inside** the wrapper. There must be no geometric gap between the button and
  the panel, or the pointer leaving the button closes the menu mid-travel. This was a real bug;
  do not reintroduce a `top: 46px` style offset;
- close on pointer exit of the wrapper, on click outside (`mousedown` capture, ignoring anything
  inside `[data-menu]`), on Escape, and on navigation;
- only one open at a time.

## 4. CMS contract

The markup is already annotated for a dynamic backend. Preserve the annotations.

| Hook | Meaning for the implementation |
|---|---|
| `[data-cms-img]` | Image frame with locked dimensions. Insert `<img>` as a direct child; global CSS applies `position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center`. Any uploaded aspect ratio or resolution fills the frame without changing the frame |
| `[data-cms-avatar]` | Same for circular portraits and small covers |
| `[data-cms-repeat]` | A loop. One item template inside; render 1 or 100 records from it. Carries `align-items: stretch` so cards in a row stay equal height |
| `[data-cms-item]` | The item root inside a loop. Carries `min-width: 0` so long unbroken strings cannot widen the grid cell |
| `.cms-1 … .cms-5` | Line clamp at N lines for **author-entered** fields only |

Global CSS already applies `overflow-wrap: break-word; word-break: break-word; hyphens: auto` to
text elements, and `min-height` (never fixed `height`) on chrome rows and content cells.

**Clamping policy — important.** Fixed editorial and constitutional text is NOT clamped: the eleven
programme objects, the objectives, values, milestones, delivery steps and programme card bodies must
render in full, with grid rows growing to the tallest card. Clamps apply only to fields a content
editor types freely (product names 2 lines, card blurbs 3–4, news blurbs 4, project summaries 5,
meta lines 1), and each is set above the length the designed copy needs. The one deliberate
exception: the programme-object description is clamped to 3 lines **because it is paired with a
Read more / Read less toggle** that expands the card in place to the full Article 3.2 wording plus
its "How it is delivered" list.

Verification to run after wiring the backend: no element matching
`main [class*="cms-"]` may have `scrollHeight > clientHeight + 1` with the designed copy in place.

## 5. Content that must not be rewritten

Wording taken from the client's site and from the **Articles of Association (2026 AGM endorsed)**
is quoted deliberately. Do not paraphrase, shorten or "improve":

- Tagline "Towards a vibrant & sustainable handicrafts sector"; the hero paragraph; both About-band
  paragraphs; the stats 7,500 / 5,250 / 195 / 13; "Change lives, build a better community";
  "Stay informed, stay empowered."; the contact block.
- **Programmes page**: the primary purpose (Art. 3.1), the eleven objects (a)–(k) (Art. 3.2), the
  nine activity categories (Art. 3A.1), the six governing principles (Preamble), and the
  *ultra vires* limitation (Art. 3.4).
- The 13 crafts, their English glosses and descriptions (`crafts.json`).
- Punakha Crafts Market: "the only authentic crafts market validated and managed by HAB".

## 6. Known gaps to resolve with the client

1. **Governance is out of date on the About page.** It was built before the AoA was supplied and
   shows a General Assembly / Board of Directors model. The AoA establishes a **Board of Trustees**,
   **Dzongkhag Chapters**, **Sector Membership** (Active / Associate), an **Annual Sector Forum**,
   an **Endowment Fund**, and Public Benefit Organisation status under the CSOA 2007 as amended
   2022. Rebuild that section — and the membership categories on the application — from the AoA.
2. Board and secretariat names/portraits are marked "Name to confirm".
3. News items, project records, publication titles, registration numbers, and the Punakha market's
   hours and stall count are sample content.
4. All imagery is a labelled placeholder. 13 craft photographs are needed, plus hero, workshop,
   outlet, programme, product (3 angles each), portraits and news thumbnails.
5. **Responsive is not designed.** The prototype is desktop-only at a 1200px floor. Agree the
   mobile and tablet treatment with the client before build; the starting rules in `README.md`
   are a proposal, not a spec.
6. The USD→Nu. rate is hardcoded at 84. Replace with a live or daily-cached RMA rate.
7. The live WordPress site was serving injected spam at handoff. Treat the existing installation as
   compromised: do not migrate its database or theme without a clean audit; rotate all credentials.
