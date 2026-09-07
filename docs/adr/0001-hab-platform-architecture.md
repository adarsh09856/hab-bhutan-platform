# ADR 0001: Architecture & Technical Foundations for the HAB Digital Platform

## Status
Accepted

## Date
2026-09-06

## Context & Problem Statement
The Handicrafts Association of Bhutan (HAB) requires a unified digital platform serving two distinct audiences:
1. **A public-facing website and e-commerce shop** supporting ~7,500 artisan members, promoting the 13 traditional arts and crafts (*Zorig Chusum*), and facilitating international retail and wholesale orders. The client has provided a high-fidelity approved prototype (`HAB Website.dc.html`) and strict design contracts (`BUILD-RULES.md`, `README.md`).
2. **An operational Admin Panel (Staff CRM) and Member Portal** with no existing design specifications, requiring granular role-based access control (RBAC), multi-step membership approvals, consignment tracking, immutable audit trails, and financial reporting.

Furthermore, the handoff documentation highlighted specific technical risks and gaps:
- The legacy WordPress/WooCommerce site (`handicraftsbhutan.org`) was compromised at handoff with injected spam and hacker tags.
- Discrepancies between `BUILD-RULES.md` and `README.md` regarding typography.
- Hardcoded exchange rates (USD 1 = BTN 84) with no staleness ceiling.
- Missing responsive design specifications for viewports under 1200px.
- Outdated governance documentation on the About page versus the 2026 AGM-endorsed Articles of Association (AoA).

---

## Decisions

### 1. Headless Next.js + PostgreSQL over WordPress/WooCommerce
- **Decision**: Build the platform as a clean, headless application using Next.js (App Router), TypeScript, and PostgreSQL with Prisma ORM.
- **Rationale**:
  - The legacy WordPress installation is treated as compromised. Rebuilding from clean code eliminates vulnerabilities and prevents tainted database records, themes, or credentials from carrying over.
  - The CRM requirement (multi-step application queues, immutable audit logs, immutable role lifecycles, member-product consignment links, fine-grained permission gating) cannot be cleanly built or maintained on `wp-admin` without fragile plugin architectures.
  - PostgreSQL natively provides robust concurrency, ACID compliance, and row-level locking needed for simultaneous operations (public customer checkouts, continuous audit logging, member registration, staff fulfillment, and directory queries scaling to 7,500 records). SQLite was rejected due to its single-writer file-locking bottlenecks under concurrent write workloads.

### 2. Dual Design Systems (Strict Public Fidelity vs. Dense Operational CRM)
- **Decision**: The two environments use completely separate visual and design systems:
  - **Public Site**: Warm cream surface palette (`--bg: #F4F0E7`, `--surface: #FFFCF8`, `--ink: #33261F`, `--accent: #8B2E24`), strict 1200px desktop floor, exactly two shadow definitions (Shop Mega-Menu `0 18px 44px rgba(58,42,33,.16)` and Members Dropdown `0 14px 34px rgba(27,26,24,.12)`), and strict typography hierarchy.
  - **Admin Panel & Member Portal**: Dense, neutral Slate/Zinc operational UI with standard 8px grid, semantic status pills (Pending, Verified, Rejected, Fulfilled), and accessible data tables.
- **Enforcement**: Components are not shared across the public/CRM boundary. If a concept (e.g. a product card or member card) appears in both, it is implemented separately within its respective design language.

### 3. Empirical Resolution of Public Typography Discrepancy
- **Decision**: Implement all public display headings (`h1`, `h2`, `h3`) using **Marcellus 400**, body copy using **Lora 400**, UI/buttons/numerals using **Figtree (400–800)**, and metadata using **IBM Plex Mono (400–500)**.
- **Verification**: Executed an automated headless browser measurement via Chrome DevTools Protocol directly inspecting `HAB Website.dc.html`. The computed styles confirmed:
  - Hero `h1`: `font-family: Marcellus, serif; font-size: 60px; line-height: 61.8px; letter-spacing: -0.48px`.
  - Section `h2`: `font-family: Marcellus, serif; font-size: 40px; line-height: 44px; letter-spacing: -0.32px`.
  - Panel `h3`: `font-family: Marcellus, serif; font-size: 27px - 34px`.
  - Body `p`: `font-family: Lora, Georgia, serif; font-size: 14px - 18.5px`.
- All four font families are self-hosted in production.

### 4. Server-Enforced RBAC with Create-Only Immutable Roles
- **Decision**: Access control is enforced at both the route middleware and individual API handler levels. Roles are strictly **create-only**; they cannot be modified in place.
- **Mechanism**:
  - Permissions are fine-grained strings (e.g., `applications:approve`, `orders:fulfill`, `products:publish`).
  - To alter a role's permissions, an administrator creates a new role revision (e.g., `Staff Operator v2`), migrates assigned users via an atomic reassignment action, and transitions the old role to `RETIRED`.
  - Retired roles sit inert and cannot be assigned to new users. Roles cannot be deleted if historical users or audit records reference them (`onDelete: Restrict`).
  - Every API mutation executes `await requirePermission(req, permission)` as its first action, returning `403 Forbidden` and writing a security audit event if unauthorized.

### 5. Multi-Currency Engine with 72-Hour Hard Staleness Ceiling
- **Decision**: Currency conversion from USD to BTN Ngultrum utilizes a three-tier cache with a hard staleness ceiling:
  - **0–24 Hours**: Fresh cache served (`status: FRESH`).
  - **24–72 Hours**: Stale rate allowed with administrative warning flag (`status: STALE`).
  - **>72 Hours**: Hard ceiling breached. Automated BTN checkout fails safe and is blocked with an informative user prompt unless a verified administrative **Manual Override Rate** has been explicitly confirmed by staff.
- **Order Integrity**: Every order records `fxRateAtPurchase` immutably at the time of checkout. Historical order values are never recalculated using future rates.

### 6. Polymorphic Audit Logging
- **Decision**: The `AuditLog` model captures every state-changing event across all user classifications without requiring a registered user account:
  - `actorType`: `STAFF`, `MEMBER`, `GUEST`, `SYSTEM`.
  - Captures actor ID, email/identifier, client IP, action, entity type, entity ID, and structured JSON `{ before, after }` snapshots.
  - Covers guest checkouts, staff order fulfillment updates (e.g., Bhutan Post EMS tracking numbers), member product submissions, application approvals/rejections, and system exchange-rate updates.

### 7. Governance Alignment with 2026 AoA
- **Decision**: Overhaul the outdated General Assembly / Board of Directors model on the About page and Membership Application to conform to the **Articles of Association (2026 AGM endorsed)**:
  - Structure: **Board of Trustees**, **Dzongkhag Chapters**, **Annual Sector Forum**, and **Endowment Fund**.
  - Legal Classification: Public Benefit Organisation (PBO) under the CSOA 2007 (as amended 2022).
  - Tiers: Active Sector Member vs. Associate Sector Member.

---

## Consequences
- **Positive**: Clean security boundary, zero legacy vulnerability carryover, verifiable design fidelity matching client prototype, audit-proof operations for donor reporting, and rock-solid concurrent performance on PostgreSQL.
- **Operational Requirement**: Staff must be onboarded with assigned roles; RMA exchange rates are monitored via the Admin Settings dashboard; mobile layouts remain classified as a proposal pending client review.
