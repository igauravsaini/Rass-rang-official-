# PROMPT: Migrate "Raas~Rang Garba Nights 2026" to React + Tailwind CSS (Pixel-Faithful) and Polish

> Paste this entire document into your AI coding assistant (Claude Code / Cursor / etc.) together with the **original source files** (`index.html`, `css/`, `js/`, `assets/`). The live reference is https://raasranggkp.netlify.app/

---

## 1. ROLE

You are a senior front-end engineer. You will migrate an existing static HTML/CSS/vanilla-JS single-page website into a **React + Tailwind CSS** project, and polish its quality (performance, accessibility, SEO, code structure, responsiveness) **without changing the visual UI or style in any visible way**.

## 2. PROJECT CONTEXT

- **Site:** Raas~Rang Garba Nights 2026 – Purvanchal's premier Navratri cultural showcase & festive brand expo.
- **Venue / Date:** Mahant Digvijaynath Park, Gorakhpur, UP · 17 October 2026 · 6:00 PM onwards (Sharad Purnima eve).
- **Type:** Single-page marketing + ticketing + sponsorship site, deployed on **Netlify**.
- **Language:** English with Devanagari tagline (`भक्ति • संस्कृति • संगम`). Must keep the correct font rendering for Devanagari.
- **Future goal (NOT part of this task):** Add richer Navratri visual vibes (festive animations, nine-day Navdurga theme, diyas, garba motifs, etc.). **This migration must make that future work easy**, but must not implement any new visual features now.

## 3. THE GOLDEN RULE

> **The migrated site must look and behave identically to the current site.** Same colors, fonts, spacing, borders, shadows, gradients, ornaments (❧ ❈ ✦), emoji icons, animations, hover effects, section order, copy, and breakpoints.

If you are ever unsure whether a change is visible, **do not make it**. List it under "Suggested follow-ups" instead.

Allowed visible differences: **none**, except fixing clear bugs (listed in §9), and only if the fix is called out in the final report.

---

## 4. STEP 0 – AUDIT BEFORE CODING (MANDATORY)

Before writing any React code, read the original CSS/JS/HTML and produce a short **audit document** (`/docs/AUDIT.md`) containing:

1. **Design tokens extracted from the existing CSS**: every color (hex/rgba), gradient, font-family, font-size scale, font-weight, letter-spacing, line-height, border-radius, box-shadow, spacing values, z-index layers, transition durations/easings, and breakpoints.
2. **CSS custom properties** (`:root` variables) – list all, with values.
3. **Keyframe animations** and where each is used (e.g., hero entrance, floating ornaments, marquee, countdown flip, scroll reveal).
4. **JS behaviors inventory** – every interaction in the vanilla JS (see §6).
5. **Asset inventory** – all images/fonts/icons with file sizes and where used.
6. **Pseudo-elements & decorative CSS** (`::before`/`::after` ornaments, dividers, borders) – these are easy to lose in a migration.
7. A **screenshot checklist** of the current site at 375px, 768px, 1024px, 1440px for visual comparison later.

> Do not guess values. If a value is not found in the source, ask or inspect the live site's computed styles.

---

## 5. TARGET STACK

| Concern | Choice |
|---|---|
| Build tool | **Vite** + React 18 (JavaScript or TypeScript – prefer **TypeScript**) |
| Styling | **Tailwind CSS v3.4+** (or v4 if stable in your toolchain) |
| Routing | None needed (single page with anchor navigation) – do **not** add React Router |
| Animation | Pure CSS / Tailwind keyframes first. Only add `framer-motion` if an existing animation cannot be reproduced otherwise |
| Icons | Keep the **existing emoji and unicode glyphs** exactly as-is. No icon library |
| Forms | Controlled React components, no heavy form library |
| Deployment | Netlify (keep `netlify.toml` / `_redirects`, build command `npm run build`, publish dir `dist`) |
| Lint/format | ESLint + Prettier + `prettier-plugin-tailwindcss` |

Do **not** add UI kits (MUI, Chakra, shadcn, Bootstrap, etc.) — they will change the look.

---

## 6. FUNCTIONALITY TO PRESERVE (CONVERT FROM VANILLA JS TO REACT)

Re-implement each behavior with React hooks. Behavior must match the original exactly.

1. **Sticky/transparent navbar** – style change on scroll, active-link highlight by section (use `IntersectionObserver`), mobile hamburger menu open/close, closes on link click, smooth scrolling to anchors (`#home #about #events #schedule #tickets #sponsors #gallery #contact`). "Book Now" CTA in nav → `#tickets`.
2. **Hero** – emblem/logo, ornaments (`❧`), Devanagari tagline, venue/date/time info blocks (✦ Venue ✦ / ✦ Date ✦ / ✦ Time ✦), three CTAs (Book Tickets, Become Sponsor, Explore Event), "Scroll to Discover" indicator, hero background image `hero-bg.jpg`.
3. **Countdown timer** – counts down to **17 Oct 2026, 18:00 IST (UTC+05:30)**. Show Days / Hours / Minutes / Seconds with zero-padding. Must be timezone-safe (always target IST, not the viewer's local time). Clean up the interval on unmount. Handle "event started" state without showing negatives.
4. **Scroll-reveal animations** – elements fade/slide in when entering viewport. Build a reusable `<Reveal>` component or `useInView` hook using `IntersectionObserver`; replicate the original delays/stagger/transition exactly.
5. **Animated counters** ("By the Numbers" – Expected Footfall, Regional Digital Reach, Youth & Professionals count up from 0). Trigger once on first view. Use the **same target values, suffixes (+, K, etc.), duration and easing** as the original JS.
6. **Ticket section**
   - 3 cards: **Sigma Pass ₹499**, **Couple Pass ₹899 (Most Popular badge)**, **Family Pass ₹1,699**.
   - Quantity stepper (− / +) per card with sensible min (1) and max, exactly like the original.
   - "Book Now" buttons – keep current behavior (whatever the original JS does on click; replicate, do not invent a payment flow).
   - Promo code input + Apply button – replicate existing validation/behavior.
   - UPI QR block ("Scan to Pay via UPI").
   - Terms & Conditions list.
   - Price formatting must use `Intl.NumberFormat('en-IN')` (e.g., `₹1,699`).
7. **Schedule timeline** – 7 entries (6:00 PM Gates Open → 10:30 PM Finale Celebration), same alternating/vertical timeline layout as the original.
8. **Sponsorship section** – 4 core tiers (Title ₹1,50,000 · Co-Presenting ₹1,00,000 · Powered By ₹70,000 · Event Sponsor ₹50,000) + 5 exclusive partnerships (Food ₹2,00,000 · Beverage ₹50,000 · Auto Expo ₹75,000 · EV Launch ₹50,000 · Commercial F&B Stall ₹50,000). Preserve badges (👑 ⭐ ⚡ 🎪), "Recommended for / Best for" lines, and "Enquire Now" / "Book Partnership" links to `#contact`. **Optional nicety (invisible):** pre-select the Subject dropdown to "Sponsorship Partnership" when these are clicked, only if the original does it.
9. **Gallery** – category filter tabs (All, Garba, Dandiya, Stage, Food, Fashion) with the same transition effect; **lightbox** with close (×), previous (❮), next (❯), keyboard support (Esc / ← / →) and click-outside-to-close. Add focus trapping and body scroll lock (invisible a11y improvements).
10. **Venue** – amenities list (🅿️ 🚪 🍽️ 🎤 ℹ️), "Navigate to Venue" Google Maps link, embedded Google Map iframe (lazy-loaded).
11. **Contact form** – fields: Full Name, Email, Phone, Subject (Select a topic / Ticket Enquiry / Sponsorship Partnership / Food / Stall Booking / Media & Press / General Enquiry), Message. Keep the **existing submission mechanism** (check the original: Netlify Forms, mailto, or fetch endpoint) and preserve success/error messaging. If it is Netlify Forms, keep `data-netlify="true"`, hidden `form-name` input, and honeypot — and add a static hidden form in `index.html` so Netlify detects it in a React build.
12. **Footer** – logo, tagline, quick links, contact info (tel/mailto links), Instagram `@raasrang_gkp`, copyright, "Crafted with ❤️ in Gorakhpur".
13. **Any preloader, back-to-top button, cursor effect, particles/ornament animation** present in the original JS – port them 1:1 (the audit in §4 should surface these).

---

## 7. ARCHITECTURE & FOLDER STRUCTURE

```
raasrang/
├─ index.html                 # SEO meta, OG tags, fonts preconnect, hidden Netlify form
├─ netlify.toml
├─ tailwind.config.ts         # ALL design tokens live here
├─ postcss.config.js
├─ vite.config.ts
├─ public/
│  ├─ favicon.*  robots.txt  sitemap.xml  _redirects
│  └─ assets/images/...       # keep original filenames so URLs don't break
├─ docs/AUDIT.md
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ index.css               # @tailwind layers + minimal @layer base/components/utilities
   ├─ data/                   # ALL content as typed data, not hard-coded JSX
   │  ├─ site.ts              # name, tagline, venue, date, contact, social links
   │  ├─ events.ts            # 9 highlight cards
   │  ├─ schedule.ts
   │  ├─ tickets.ts
   │  ├─ sponsors.ts          # tiers + exclusive partnerships
   │  ├─ gallery.ts
   │  └─ navigation.ts
   ├─ hooks/
   │  ├─ useCountdown.ts
   │  ├─ useInView.ts
   │  ├─ useCountUp.ts
   │  ├─ useScrollSpy.ts
   │  ├─ useScrolled.ts
   │  └─ useLockBodyScroll.ts
   ├─ components/
   │  ├─ layout/   Navbar, Footer, Section, SectionHeading (the "❈" ornament heading)
   │  ├─ ui/       Button, Card, Badge, Reveal, Ornament, QuantityStepper, Modal
   │  └─ sections/ Hero, Countdown, About, Events, Stats, Schedule, Tickets,
   │               Sponsors, Gallery, Lightbox, Venue, Contact
   └─ lib/         format.ts (Intl), constants.ts
```

**Rules**
- **Content in `/data`, structure in components.** Mapping arrays → cards (no copy-pasted JSX blocks). This is the key enabler for the Navratri expansion (e.g., swap theme data per day).
- Each section is a self-contained component with its own `id` for anchors.
- Components < ~150 lines; extract when larger.
- No inline `style={{}}` unless the value is truly dynamic (e.g., countdown progress, gallery filter transitions).

---

## 8. TAILWIND CONVERSION RULES (THE CRITICAL PART)

1. **Tokens first.** Put every color, font family, font size, shadow, radius, gradient, keyframe and animation found in the audit into `tailwind.config.ts` under `theme.extend` with **semantic names** (e.g., `colors.maroon.deep`, `colors.gold.DEFAULT`, `colors.saffron`, `fontFamily.display`, `boxShadow.glow-gold`, `animation.float`). Use **the exact original values** – never "close enough" Tailwind defaults (e.g., don't replace `#8B1A1A` with `red-800`).
2. **Arbitrary values are allowed** (`px-[18px]`, `tracking-[0.25em]`) when the original value is not on Tailwind's scale. Fidelity beats purity. But if a value repeats ≥3 times, promote it to a token.
3. **Preserve the exact responsive breakpoints** of the original CSS media queries. If the original uses `768px` and `1024px`, configure `screens` accordingly (`md: 768px`, `lg: 1024px`) – and verify no visual shift between Tailwind's default `sm/md/lg/xl` and the original.
4. **Fonts:** Keep the exact same Google Fonts (or self-hosted) families and weights. Prefer **self-hosting via `@fontsource`** or keeping the current `<link>` with `preconnect` + `font-display: swap`. Ensure Devanagari subset is included.
5. **Complex decorative CSS** (ornamental dividers, double borders, gradient borders, pseudo-element flourishes, backdrop blur, background patterns/mandala textures) → implement through:
   - `@layer components` classes in `index.css` (e.g., `.ornate-border`, `.section-divider`) **or**
   - small dedicated components (`<Ornament />`),
   - never by dropping the effect.
6. **Keyframes** go in `tailwind.config.ts` (`keyframes` + `animation`). Reproduce original duration, delay, easing, iteration count and fill-mode.
7. **Hover/focus/active states** – convert every `:hover` rule, including transform, shadow, color and gradient changes, with the same transition timing (`transition-all duration-300 ease-in-out` etc. – match original).
8. **Do not use `@apply` excessively**; use it only in `@layer components` for truly repeated multi-property patterns.
9. **Dark/light:** The original is a single theme – do not add dark mode.
10. **Class ordering:** enforced by `prettier-plugin-tailwindcss`. Use `clsx`/`tailwind-merge` for conditional classes.
11. **Remove the old CSS files** only after visual parity is verified. No leftover unused CSS.

---

## 9. POLISH (INVISIBLE IMPROVEMENTS ONLY)

Apply these **without altering how the page looks**:

### Performance
- Convert `logo.jpg`, gallery and hero images to **WebP/AVIF** with JPG fallback via `<picture>`; generate responsive `srcset`/`sizes`. Keep original filenames or update references consistently.
- `loading="lazy"` + `decoding="async"` on all below-the-fold images; `fetchpriority="high"` + preload for the hero background/LCP image.
- Always set explicit `width`/`height` (or `aspect-ratio`) to prevent layout shift (target **CLS < 0.05**).
- Lazy-load the Google Maps iframe (`loading="lazy"`) and the lightbox code (`React.lazy`).
- Font preloading + `font-display: swap`.
- Vite code-splitting, tree-shaking; Tailwind purge via `content` globs. Target **Lighthouse ≥ 90 Performance, ≥ 95 Accessibility / Best Practices / SEO** on mobile.

### Accessibility
- Semantic landmarks: `<header> <nav> <main> <section aria-labelledby> <footer>`; one `<h1>` (the hero title), logical h2/h3 hierarchy.
- Decorative glyphs/emojis (`❧ ❈ ✦ 🪔` etc.) → `aria-hidden="true"`; meaningful ones get `role="img"` + `aria-label`.
- Descriptive `alt` text on all images (current alts are fine; improve where generic).
- Keyboard: visible focus ring that **matches the theme** (add `focus-visible` styles only – no visual change for mouse users), skip-to-content link (visually hidden until focused), mobile menu `aria-expanded`/`aria-controls`, lightbox focus trap + `aria-modal`, Esc to close.
- Form: `<label htmlFor>`, `required`, `autocomplete`, `inputMode="tel"`, `type="email"`, inline error messages with `aria-live="polite"`.
- `prefers-reduced-motion`: disable non-essential animations/count-ups/auto-motion (users who didn't opt in see no change).
- Color-contrast audit: **report** any failing pairs but do **not** change colors; list as follow-ups.

### SEO & Sharing
- Keep existing `<title>`, description, keywords, OG tags; **add** `og:image` (1200×630), `og:url`, `twitter:card`, canonical, `theme-color`, `lang="en"`.
- Add **JSON-LD `Event` schema** (name, startDate `2026-10-17T18:00:00+05:30`, location Mahant Digvijaynath Park Gorakhpur, offers ₹499/₹899/₹1,699, organizer, image).
- `robots.txt`, `sitemap.xml`, favicon set + `manifest.webmanifest`.

### Code quality
- TypeScript strict mode; typed data models (`Ticket`, `SponsorTier`, `ScheduleItem`, `GalleryItem`).
- No `any`, no dead code, no console logs, no unused deps.
- Environment/config constants centralized (event date, contact numbers, UPI details) in `src/data/site.ts`.
- Phone/email links remain `tel:` / `mailto:`.
- Security: `rel="noopener noreferrer"` on external links; no inline `dangerouslySetInnerHTML`.

### Bugs/edge cases to check and fix (report each one)
- Countdown flashing `00` on first render (render skeleton/initial value from `Date.now()` synchronously).
- Countdown showing negative numbers after the event.
- Counters re-triggering on every scroll.
- Gallery filter causing layout jump.
- Mobile menu not closing on route/anchor change; body scroll not locked.
- 100vh issue on mobile browsers in the hero (use `min-h-[100svh]` **only if** visually identical on desktop).
- Anchor links hidden under the fixed navbar (`scroll-margin-top` / `scroll-mt-*`).
- Horizontal overflow on small screens (375px / 320px).
- Quantity stepper going below 1.
- Broken `href="#"` placeholders on Book Now buttons – keep the behavior, but report.

---

## 10. FUTURE-PROOFING FOR "MORE NAVRATRI VIBES" (STRUCTURE ONLY – DO NOT BUILD)

Prepare the codebase so the next phase is easy, but **do not add any new visuals now**:

- Centralize all theme tokens in Tailwind config so a festive palette variant (e.g., nine Navdurga colors) can be added as CSS variables later (`--color-accent` etc.), with the **current palette as the default**.
- Create an empty, documented `src/components/effects/` folder (e.g., for future falling-petals / diya-glow / garba-ring / mandala backgrounds), and a `<Reveal>` + `<Ornament>` API flexible enough to be reused.
- Keep section components accepting `className` so decorative layers can be injected later.
- Document in `README.md` how to add a new section, a new animation, and a new theme.

---

## 11. DELIVERABLES

1. Complete working Vite + React + Tailwind project (runs with `npm install && npm run dev`, builds with `npm run build`).
2. `docs/AUDIT.md` (from Step 0).
3. `README.md` – setup, scripts, folder structure, how to edit content in `/data`, deploy to Netlify.
4. `docs/PARITY-REPORT.md` – section-by-section comparison table:

   | Section | Original behavior | New behavior | Visual parity (✅/⚠️) | Notes |
   |---|---|---|---|---|

5. `docs/POLISH-CHANGELOG.md` – every invisible improvement made + any bug fixed.
6. "Suggested follow-ups" list – anything that would change visuals (contrast fixes, spacing inconsistencies, etc.) but was intentionally **not** changed.

---

## 12. ACCEPTANCE CRITERIA (DEFINITION OF DONE)

- [ ] Side-by-side screenshots at **375 / 768 / 1024 / 1440 px** show no visible difference from the original for every section.
- [ ] All hover, focus, scroll, countdown, counter, filter, lightbox and form interactions work identically.
- [ ] All copy, prices, emojis, links, phone numbers, and the Devanagari text are **character-for-character identical** to the original.
- [ ] No horizontal scroll at any width ≥ 320px.
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- [ ] Zero console errors/warnings; ESLint + TypeScript pass with no errors.
- [ ] Production build deploys on Netlify with working form submission and anchor navigation.
- [ ] Bundle: no unused dependencies; initial JS < ~150 KB gzipped.

---

## 13. WORKING METHOD

1. Do Step 0 (audit) and show me the extracted design tokens **before** continuing.
2. Scaffold the project + Tailwind config with tokens.
3. Build layout primitives (`Section`, `SectionHeading`, `Ornament`, `Button`, `Reveal`).
4. Migrate section by section, **in page order**, verifying parity after each one.
5. Port JS behaviors into hooks.
6. Apply polish (§9).
7. Produce the reports (§11).

**If anything in the original source is ambiguous, ask a clarifying question instead of assuming. Never "improve" the design.**
