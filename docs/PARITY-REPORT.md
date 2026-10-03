# Visual & Behavioral Parity Verification Report

**Project:** Raas~Rang Garba Nights 2026  
**Migration Target:** React 18 + TypeScript + Vite + Tailwind CSS v3.4+  
**Target URL Live Baseline:** https://raasranggkp.netlify.app/  
**Verification Date:** October 2, 2026  

---

## 1. Section-by-Section Parity Matrix

| Section / Component | Original Behavior (Vanilla JS / Static HTML) | Migrated Behavior (React 18 + TS + Tailwind) | Visual Parity | Notes & Verification |
|---|---|---|:---:|---|
| **Opening Preloader** | 3.4s cinematic loading overlay with 432Hz temple bell harmonics, animated golden rays halo, official emblem, Devanagari motto and flourish. Failsafe after 4.2s. | Preserved 100%. Re-implemented in `Preloader.tsx` with Web Audio API synthesizer (432, 864, 1296, 2160 Hz) and auto-fadeout. | ✅ | Exact timing, same easing curve `cubic-bezier(0.16, 1, 0.3, 1)`, same failsafe. |
| **Particle Canvas** | Floating 2D canvas particle system with 7 festive Garba colors, sinusoidal sway, size variations, auto-pause on tab blur. | Preserved 100% in `ParticleCanvas.tsx` using HTML5 Canvas API, `requestAnimationFrame`, and `document.visibilitychange` handling. Added `prefers-reduced-motion` compliance. | ✅ | Identical particle colors (`#FF2D78`, `#F0B429`, `#FF6B00`, `#E91E9C`, `#FFD54F`, `#9C27B0`, `#00BFA5`). |
| **Sticky Navbar** | Transparent on top, frosted glass (`rgba(10,4,18,0.95)`) on scroll > 60px. Mobile drawer toggle with hamburger animation, scrollspy active link indicator. | Preserved 100% in `Navbar.tsx` using `useScrolled(60)` and `useScrollSpy()`. Mobile menu automatically closes on link click with smooth scroll offset. | ✅ | Section offsets and `-75px` scroll offset maintained. |
| **Hero Section** | Temple arch SVG crest, red velvet drapery swag/tassels, authentic hanging brass bells, dandiya sticks in corners, floating diyas with flame flicker, 3D champagne gold title with SVG flourishes, Devanagari motto, 3 CTA buttons. | Preserved 100% in `Hero.tsx`. All vector SVG paths, gradient definitions (`#goldGrad`), filigree brackets, and animations ported verbatim. | ✅ | Character-for-character Hindi motto: `भक्ति • संस्कृति • संगम`. Exact typography stack. |
| **Countdown Timer** | Targets `17 Oct 2026, 18:00 IST`. Padded Days, Hours, Minutes, Seconds. | Preserved 100% in `useCountdown.ts` and `Hero.tsx`. Fully timezone-safe with UTC+05:30 target. Fixed initial render flash by calculating synchronously on initial mount. Displays celebration banner on expiry without negative values. | ✅ | Bug fix: zero flashing `00` on initial render. |
| **About Section** | Intro paragraph, 4 cards (🪔 What is Raas~Rang, 🏛️ Why Gorakhpur, 🎯 Our Vision, 🤝 Community Impact) with staggered scroll reveal. | Preserved 100% in `About.tsx` with structured typed data and reusable `<Reveal>` component. | ✅ | Same card gradients, border glow, and stagger delays (`0.1s` - `0.4s`). |
| **Events / Highlights** | 9 highlight cards (Garba Night, Dandiya Raas, Cultural Shows, DJ & Folk Music, Food Festival, Fashion, Family Zone, Photo Booth, Awards) with hover glow. | Preserved 100% in `Events.tsx` mapped from `src/data/events.ts`. | ✅ | Identical layout, emojis, and copy. |
| **Stats ("By the Numbers")** | 4 stats cards with animated counters (1500+ Footfall, 200K+ Reach, 65% Youth, ₹499-₹1,699 Range). | Preserved 100% in `Stats.tsx` with `useCountUp` hook. Uses original cubic ease-out `1 - (1-p)^3` over 2000ms. Numbers formatted with Indian system (`toLocaleString('en-IN')`). | ✅ | Counters trigger strictly once on first viewport view. |
| **Schedule Timeline** | Alternating vertical timeline (6:00 PM Gates Open to 10:30 PM Finale) with golden connecting line and pulse dots. | Preserved 100% in `Schedule.tsx` mapped from `src/data/schedule.ts`. Left/right alternation preserved on desktop and stacked on mobile (`<= 768px`). | ✅ | Exact timeline dots, delays, and text. |
| **Tickets Section** | 3 passes (Sigma Pass ₹499, Couple Pass ₹899 with Most Popular badge, Family Pass ₹1,699), steppers, promo code, UPI QR, collapsible terms. | Preserved 100% in `Tickets.tsx` with controlled `QuantityStepper.tsx`. Interactive booking confirmation ("Added X× Pass Name") with 2.5s auto-revert. Promo code "Applied ✓" feedback. Accordion terms. | ✅ | Formatted using `Intl.NumberFormat('en-IN')`. Quantity bounds [1, 10] enforced. |
| **Sponsorship Section** | 4 core tiers (Title ₹1,50,000, Co-Presenting ₹1,00,000, Powered By ₹70,000, Event Sponsor ₹50,000) + 5 exclusive partnerships. CTAs link to `#contact`. | Preserved 100% in `Sponsors.tsx` mapped from `src/data/sponsors.ts`. Preserves all tier badges (👑 ⭐ ⚡ 🎪) and "Recommended for" recommendations. Preselects subject on contact form. | ✅ | Exact rupee formatting, benefits list, and CTA navigation. |
| **Gallery & Lightbox** | Category filter tabs (`All`, `Garba`, `Dandiya`, `Stage`, `Food`, `Fashion`), masonry grid, modal lightbox with prev/next/close and keyboard support. | Preserved 100% in `Gallery.tsx` and `Lightbox.tsx`. Filter transitions without layout jump. Lightbox includes Escape, ArrowLeft, ArrowRight, body scroll lock, and backdrop dismissal. | ✅ | Added lazy loading, `decoding="async"`, and accessibility modal tags. |
| **Venue Section** | Facility list (🅿️ 🚪 🍽️ 🎤 ℹ️), directions button to Google Maps, embedded Google Map iframe. | Preserved 100% in `Venue.tsx`. Iframe lazy loaded with accessible title. | ✅ | Identical styling, border radius, and map embed. |
| **Contact Section** | Contact info card (phones, email, Instagram `@raasrang_gkp`) + form (Name, Email, Phone, Subject dropdown, Message). Submission transitions. | Preserved 100% in `Contact.tsx`. Controlled form state, smooth submit transition ("Sending..." -> "Message Sent ✓" -> reset). Includes hidden Netlify form integration. | ✅ | Auto-complete, input modes (`inputMode="tel"`), and accessible labels preserved. |
| **Footer** | Official logo, brand typography with gold shimmer, motto, quick links, contact links, Instagram link, copyright, and Gorakhpur credit. | Preserved 100% in `Footer.tsx`. Smooth scrolling on quick links with `-75px` navbar offset. | ✅ | Character-for-character footer text. |

---

## 2. Breakpoint Compatibility Audit

| Viewport Width | Visual Parity Status | Layout Behavior Verified |
|---|:---:|---|
| **320px - 375px (Mobile Portrait)** | ✅ Parity Verified | Single column layouts, info frames stacked, navbar collapsed into slide-out drawer, touch targets >= 44px, 0 horizontal overflow. |
| **768px (Tablet Portrait)** | ✅ Parity Verified | Timeline collapses gracefully to left-aligned line with 50px indent; 2-column grids on gallery, ticket cards stack vertically with prominent Most Popular badge. |
| **1024px (Tablet Landscape)** | ✅ Parity Verified | Footer wraps into 2-column grid, venue and contact form stack side-by-side, desktop navigation active. |
| **1440px+ (Desktop Full HD & Ultra-Wide)** | ✅ Parity Verified | Centered max-width containers (`1200px` max), pristine gold ornaments, full alternating schedule timeline, 3-column ticket grid. |
