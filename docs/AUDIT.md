# Raas~Rang Garba Nights 2026 — Step 0 Pre-Migration Audit

**Document Date:** October 2, 2026  
**Source Target:** Static HTML5 / CSS3 / Vanilla JS single-page application  
**Target Architecture:** Vite + React 18 + TypeScript + Tailwind CSS v3.4+  
**Parity Mandate:** Pixel-faithful reproduction; 0 visible discrepancies.

---

## 1. Design Tokens Extracted from CSS (`styles.css`)

### 1.1 Color Palette

#### Brand Primary Colors
| Token Name | Hex / Value | Description & Purpose |
|---|---|---|
| `--royal-navy` | `#0a0412` | Deepest background canvas tone |
| `--navy-deep` | `#06020d` | Ultra-dark gradient stop / overlay edge |
| `--navy-light` | `#1a0a2e` | Midnight purple accent backdrop |
| `--deep-maroon` | `#8B0A3A` | Ceremonial royal velvet primary tone |
| `--maroon-light` | `#B91452` | Vibrant crimson highlight |
| `--maroon-velvet` | `#6d0830` | Rich dark velvet accent |
| `--antique-gold` | `#F0B429` | Primary metallic gold accent |
| `--gold-light` | `#FFD54F` | High-glimmer metallic gold stop |
| `--gold-pale` | `#FFF3C4` | Soft champagne gold / pill backgrounds |
| `--gold-rich` | `#E09800` | Saturated antique amber gold |
| `--gold-dark` | `#8B6914` | Deep shadow border gold |
| `--saffron` | `#FF6B00` | Festive holy orange accent |
| `--vermillion` | `#E53935` | Sindoor red highlight |
| `--vermillion-deep` | `#C62828` | Crimson dark anchor |
| `--cream` | `#FFF3C4` | Muted parchment gold-tinted cream |
| `--ivory` | `#fdf6e3` | Main readable foreground typography |

#### Festive Garba Accent Tones
| Token Name | Hex / Value | Usage |
|---|---|---|
| `--hot-pink` | `#FF2D78` | Festive particle / dandiya ribbon / glow |
| `--magenta` | `#E91E9C` | Garba glow gradient stop |
| `--electric-orange` | `#FF8A00` | Energetic festive highlight |
| `--festive-purple` | `#9C27B0` | Royal dusk ambiance radial gradient |
| `--festive-teal` | `#00BFA5` | Cool contrast particle tone |
| `--neon-green` | `#76FF03` | Vibrancy accent / particle sparkle |
| `--dandiya-red` | `#D50000` | Dandiya bandhani stick stripes |

#### Neutrals & Typography Scale
| Token Name | Hex / Value | Usage |
|---|---|---|
| `--white` | `#ffffff` | Pure white highlights / embossing |
| `--gray-100` | `#f7f3eb` | Off-white text accent |
| `--gray-200` | `#e8dfd3` | Light neutral |
| `--gray-300` | `#d4c5b1` | Secondary body text (`--text-secondary`) |
| `--gray-400` | `#a09585` | Muted captions & metadata (`--text-muted`) |
| `--gray-500` | `#6b6055` | Subtle borders / inactive states |
| `--gray-600` | `#4a4138` | Dark separator line |
| `--text-primary` | `#fdf6e3` | Default body font color |

---

### 1.2 Gradients

```css
--gold-gradient: linear-gradient(135deg, #F0B429 0%, #FFD54F 25%, #F0B429 50%, #E09800 75%, #F0B429 100%);
--gold-emboss: linear-gradient(180deg, #FFFFFF 0%, #FFF3CF 12%, #FFD54F 28%, #F0B429 48%, #A87800 68%, #E09800 86%, #FFE699 100%);
--gold-emboss-sub: linear-gradient(180deg, #FFFFFF 0%, #FFF5DB 20%, #FFD54F 50%, #C68A00 80%, #FFD54F 100%);
--gold-antique-rich: linear-gradient(180deg, #FFF9E6 0%, #FFD54F 40%, #C68A00 75%, #6A4B0C 100%);
--maroon-gradient: linear-gradient(135deg, #8B0A3A, #B91452, #8B0A3A);
--maroon-velvet-bg: radial-gradient(ellipse at center, #9C1048 0%, #5D082A 65%, #2A0412 100%);
--navy-gradient: linear-gradient(180deg, #0a0412 0%, #1a0a2e 50%, #0a0412 100%);
--hero-overlay: linear-gradient(180deg, rgba(10,4,18,0.2) 0%, rgba(10,4,18,0.6) 40%, rgba(10,4,18,0.92) 100%);
--card-gradient: linear-gradient(145deg, rgba(240,180,41,0.06) 0%, rgba(139,10,58,0.08) 100%);
--festive-gradient: linear-gradient(135deg, #FF2D78, #FF6B00, #FFD54F, #76FF03, #00BFA5, #9C27B0, #FF2D78);
--garba-glow: linear-gradient(135deg, #FF2D78 0%, #E91E9C 25%, #9C27B0 50%, #FF6B00 75%, #FFD54F 100%);
--dandiya-stripe: repeating-linear-gradient(45deg, #D50000, #D50000 8px, #F0B429 8px, #F0B429 12px, #FF2D78 12px, #FF2D78 16px, #FFD54F 16px, #FFD54F 20px);
```

---

### 1.3 Typography Stack

- **Display Title:** `'Cinzel Decorative', 'Cinzel', serif`
- **Section Heading:** `'Cinzel', serif`
- **Subheadings / Elegant Serif:** `'Cormorant Garamond', 'Marcellus', serif`
- **Primary Body:** `'Outfit', sans-serif`
- **Accent UI:** `'Poppins', sans-serif`
- **Devanagari Tagline:** `'Yatra One', cursive`

Google Fonts CDN URL with weights:
```html
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Marcellus&family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display+SC:wght@400;700;900&family=Poppins:wght@300;400;500;600;700&family=Rozha+One&family=Yatra+One&display=swap" rel="stylesheet">
```

---

### 1.4 Spacing, Radii, Borders, and Shadows

- **Spacing Scale:**
  - `xs`: `0.25rem` (4px)
  - `sm`: `0.5rem` (8px)
  - `md`: `1rem` (16px)
  - `lg`: `1.5rem` (24px)
  - `xl`: `2rem` (32px)
  - `2xl`: `3rem` (48px)
  - `3xl`: `4rem` (64px)
  - `4xl`: `6rem` (96px)
  - `5xl`: `8rem` (128px)
- **Border Radii:**
  - `sm`: `8px`
  - `md`: `12px`
  - `lg`: `16px`
  - `xl`: `24px`
  - `full`: `9999px`
- **Borders:**
  - `gold`: `1px solid rgba(240,180,41,0.3)`
  - `gold-strong`: `2px solid rgba(240,180,41,0.5)`
  - `festive`: `1px solid rgba(255,45,120,0.25)`
- **Shadows:**
  - `gold`: `0 0 20px rgba(240,180,41,0.2)`
  - `festive`: `0 0 25px rgba(255,45,120,0.15), 0 0 50px rgba(233,30,156,0.08)`
  - `card`: `0 8px 32px rgba(0,0,0,0.4)`
  - `elevated`: `0 16px 48px rgba(0,0,0,0.5)`
- **Transitions:**
  - `fast`: `0.2s ease`
  - `base`: `0.3s ease`
  - `slow`: `0.5s ease`
  - `smooth`: `0.6s cubic-bezier(0.16, 1, 0.3, 1)`

---

### 1.5 Responsive Breakpoints

- **Mobile:** `max-width: 480px`
- **Tablet / Mobile Nav Drawer:** `max-width: 768px`
- **Desktop Grid Wrap:** `max-width: 1024px`
- **Large Desktop:** `> 1024px`

---

## 2. Keyframe Animations & Usages

| Keyframe Name | Timing & Curve | Usage Location |
|---|---|---|
| `loaderParticlesFloat` | `8s ease-in-out infinite alternate` | Preloader floating sparkle elements |
| `loaderContentSequence`| `3.4s cubic-bezier(0.16, 1, 0.3, 1) forwards` | Preloader inner emblem sequence |
| `rotateHalo` | `16s / 20s / 30s linear infinite` | Emblem radiant rings & halo layers |
| `haloPulse` | `3s ease-in-out infinite alternate` | Glow expansion around central emblem |
| `mottoReveal` | `1.2s 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards` | Devanagari motto entrance in loader |
| `shimmer` | `2s / 4s / 6s ease-in-out infinite` | Metallic gold borders & CTA highlights |
| `hero-parallax` | `30s ease-in-out infinite alternate` | Ambient background scale/pan drift |
| `mandala-float` | `15s ease-in-out infinite` | Sacred geometric mandala layer rotation |
| `bellSwing` | `4.5s ease-in-out infinite alternate` | Hanging brass bells pendulum physics |
| `bellGlowPulse` | `3s ease-in-out infinite alternate` | Warm radiance around brass bells |
| `diyaFloat` | `4s ease-in-out infinite alternate` | Corner floating oil lamps vertical sway |
| `flameFlicker` | `0.25s ease-in-out infinite alternate` | Organic diya flame shimmer |
| `light-rays-pulse` | `4s ease-in-out infinite alternate` | Radiant sunburst behind hero emblem |
| `logo-glow` | `3s ease-in-out infinite alternate` | Golden halo pulsation on main crest |
| `title-shimmer` | `7s 2.5s ease-in-out infinite` | 3D champagne gold text shine sweep |
| `blink` | `1s step-end infinite` | Live event / alert pulse |
| `scroll-down` | `2s ease-in-out infinite` | Hero mouse scroll bounce cue |
| `fadeInUp` | `1s forwards` (staggered 0.3s - 2s) | Hero sequential content entrance |
| `glow-rotate` | `3s linear infinite` | Highlighted cards & popular badge borders |

---

## 3. Vanilla JS Behaviors Inventory

1. **Cinematic Opening Preloader & Temple Bell Chime:**
   - Web Audio API synthesizes a 4-partial sacred harmonic bell (`432Hz`, `864Hz`, `1296Hz`, `2160Hz`).
   - Handles browser autoplay policy with user click/touch unlock.
   - 3.4-second entrance animation with 4.2-second failsafe.
2. **Interactive Particle Canvas Engine:**
   - 2D canvas dynamically rendered on window resize.
   - Calculates density based on screen dimensions (`Math.min(w*h / 15000, 80)`).
   - Simulates gentle Garba particle sway using festive color palette.
   - Automatically pauses on tab blur (`visibilitychange`) to conserve battery and GPU.
3. **Sticky Navbar & Navigation:**
   - Adds `.scrolled` state when `pageYOffset > 60px`.
   - Mobile hamburger drawer toggle with `aria-expanded` and sliding transition.
   - Auto-closes mobile menu upon clicking any anchor link.
   - Scrollspy highlighting active section using section offsets.
4. **Timezone-Safe Countdown Engine:**
   - Targets **17 October 2026 at 18:00 IST (UTC+05:30)**.
   - Computes days, hours, minutes, seconds with `padStart(2, '0')`.
   - Handles post-event state gracefully without negative values.
5. **Scroll-Reveal Engine:**
   - IntersectionObserver triggers `.revealed` on `.reveal-up`, `.reveal-left`, `.reveal-right`.
6. **Animated Counters ("By The Numbers"):**
   - Animates to numerical target on first viewport intersection using cubic easing (`1 - (1-p)^3`) over 2000ms.
   - Formatted in Indian numbering system (`toLocaleString('en-IN')`).
7. **Ticket Purchase Steppers & Feedback:**
   - Plus/minus steppers bounded between 1 and 10.
   - "Book Now" buttons provide immediate feedback ("Added X× Pass") with 2.5s auto-revert.
8. **Promo Code Validation:**
   - Visual confirmation button ("Applied ✓") with green gradient feedback and 3s auto-reset.
9. **Gallery Filtering & Lightbox Modal:**
   - Category filtering (`all`, `garba`, `dandiya`, `stage`, `food`, `fashion`) with display toggling.
   - Fullscreen modal lightbox with image preview, caption, next/prev arrow controls, keyboard navigation (Esc, ArrowLeft, ArrowRight), and backdrop click dismissal.
10. **Interactive Contact Form Simulation:**
    - Submits with state transition ("Sending..." → "Message Sent ✓" → reset form) preserving form UX.
11. **Smooth Anchor Scrolling:**
    - Offsets scroll target by `-75px` to prevent fixed navbar occlusion.

---

## 4. Asset Inventory

| Path | File Size | Usage |
|---|---|---|
| `assets/images/logo.jpg` | 366.6 KB | Preloader logo, Navbar brand, Hero logo showcase, Footer emblem |
| `assets/images/hero-bg.jpg` | 2.67 MB | Hero parallax background |
| `assets/images/b1.jpg` | 926.5 KB | About section primary visual |
| `assets/images/b2.jpg` | 906.0 KB | About section secondary visual |
| `assets/images/gallery-garba.jpg` | 1.20 MB | Gallery Garba category item |
| `assets/images/gallery-dandiya.jpg` | 886.8 KB | Gallery Dandiya category item |
| `assets/images/gallery-stage.jpg` | 1.04 MB | Gallery Stage category item |
| `assets/images/gallery-food.jpg` | 1.17 MB | Gallery Food category item |
| `assets/images/gallery-fashion.jpg` | 961.7 KB | Gallery Fashion category item |

---

## 5. Decorative CSS & Pseudo-Elements Inventory

- **Ornaments & Flourishes:** `❧`, `✦`, `❈`, Lotus SVG dividers, Bandhani Dandiya corner frames, Hanging Brass Bells, Floating Diyas.
- **29 Pseudo-Elements Identified:**
  - Plaque filigree corners (`.frame-filigree::before`, `.frame-filigree::after`)
  - Section ornate dividers (`.section-divider::before`, `.section-divider::after`)
  - Red velvet drapery tassels (`.hero-drape-left::after`, `.hero-drape-right::after`)
  - Shimmer overlay on CTA buttons (`.btn::before`)
  - Nav link underline hover animations (`.nav-link::after`)
  - Gold border glow and corner accents across Cards and Badges (`.ticket-popular::before`, `.stat-card::after`).

---

## 6. Visual Parity Screenshot & Viewport Checklist

- [ ] **375px (Mobile Portrait - Small/Standard)**
- [ ] **768px (Tablet / Mobile Menu Breakpoint)**
- [ ] **1024px (Tablet Landscape / Desktop Breakpoint)**
- [ ] **1440px (Desktop Full HD / Wide)**
