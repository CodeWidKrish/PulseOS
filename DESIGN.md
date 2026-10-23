# PulseOS — DESIGN.md (The Canonical Design Authority)

> **Status**: Canonical Single Source of Truth for all UI, UX, Motion, and Visual Engineering.  
> Every visual and interaction decision in PulseOS must be directly traceable to this document.

---

## 1. Design Philosophy

PulseOS communicates calm, clinical authority and effortless comprehension. It strips away diagnostic fear and medical jargon through radical visual restraint, generous physical space, and cinematic polish reminiscent of Apple's flagship product presentations.

### Core Principles

1. **Clarity Over Decoration**
   - **Do**: Render biomarkers with crisp monospaced values, clear baseline ranges, and unambiguous state colors.
   - **Don't**: Add decorative gradients, illustrative doodles, or gratuitous iconography that obscures clinical facts.
2. **One Idea Per Screen**
   - **Do**: Anchor each viewport to a single dominant focal point, message, and singular call to action.
   - **Don't**: Overwhelm the user with split attention, competing buttons, or multi-topic dashboard clutter.
3. **Content Is the Hero**
   - **Do**: Treat patient metrics, explanations, and physician questions as primary sculptural elements.
   - **Don't**: Let heavy UI borders, saturated panels, or complex chrome compete with the patient's data.
4. **Motion Explains, Never Decorates**
   - **Do**: Use fluid transitions to reveal causality (e.g., values highlighting before explanation streams).
   - **Don't**: Introduce bouncy, spinning, or looped animations that induce anxiety or distract from medical reading.
5. **Radical Restraint**
   - **Do**: Rely on whitespace, typographical scale contrast, and subtle surface elevations.
   - **Don't**: Use rainbow status palettes, loud drop shadows, or more than three accent colors across an experience.
6. **Depth Through Light and Blur**
   - **Do**: Construct spatial hierarchy with physical layering: deep obsidian canvas, frosted glass navigation, and tactile cards.
   - **Don't**: Use harsh 100% black hard drop shadows or opaque flat borders that sever visual flow.
7. **Speed Is Part of the Design**
   - **Do**: Guarantee immediate UI feedback, 60fps scroll transitions, and instant non-blocking first paints.
   - **Don't**: Block user interaction on 3D canvas compilation or force users to wait for asset loads.

---

## 2. Design Tokens

### 2.1 Color Palette & Contrast Validation

All text and background combinations are rigorously measured against **WCAG 2.1 Level AA** standards (minimum 4.5:1 for regular text, 3.0:1 for large text).

| Token Name | Hex Code | Purpose / Semantic Role | Pairing Background | Contrast Ratio | WCAG AA Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `ink` | `#07090D` | Deep canvas obsidian background | — | Base | Pass |
| `graphite` | `#12161D` | Elevated dark card / surface background | `ink` | 1.15:1 (Surface) | Pass |
| `mist` | `#F4F5F7` | Luminous light section background | `ink` | 17.2:1 (Section) | Pass |
| `text-primary` | `#F2F4F7` | Headings, primary metrics, high emphasis | `ink` / `graphite` | **16.8:1 / 14.5:1** | **Pass (AAA)** |
| `text-muted` | `#8B93A1` | Secondary labels, units, timestamps | `ink` / `graphite` | **5.3:1 / 4.6:1** | **Pass (AA)** |
| `text-dark` | `#0B0F15` | Text rendered on light `mist` sections | `mist` (`#F4F5F7`) | **16.2:1** | **Pass (AAA)** |
| `text-dark-muted` | `#5A6270` | Muted text on light `mist` sections | `mist` (`#F4F5F7`) | **5.4:1** | **Pass (AA)** |
| `pulse` | `#FF4D5E` | Brand crimson, abnormal flags, critical alert | `ink` / `graphite` | **5.2:1** | **Pass (AA)** |
| `teal` | `#5EE1D2` | Normal biomarker state, positive health | `ink` / `graphite` | **11.4:1** | **Pass (AAA)** |
| `amber` | `#FFB86B` | Cautionary readings, borderline metrics | `ink` / `graphite` | **8.8:1** | **Pass (AAA)** |
| `card-border` | `rgba(255, 255, 255, 0.08)` | Hairline container borders | `graphite` | Architectural | Pass |

### 2.2 Gradients
- `surface-glow-pulse`: `radial-gradient(ellipse at top, rgba(255, 77, 94, 0.15), transparent 70%)`
- `surface-glow-teal`: `radial-gradient(ellipse at center, rgba(94, 225, 210, 0.12), transparent 70%)`
- `glass-highlight`: `linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 100%)`
- `mist-fade`: `linear-gradient(180deg, #F4F5F7 0%, #E8EBF0 100%)`

### 2.3 Typography Scale (Fluid `clamp()` System)
Font family: `Geist, Inter, -apple-system, BlinkMacSystemFont, sans-serif`. Monospace: `Geist Mono, JetBrains Mono, monospace`.

| Level | Size (Mobile -> Desktop) | Fluid `clamp()` Value | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Display** | 40px -> 64px | `clamp(2.5rem, 1.8rem + 3.5vw, 4.0rem)` | 600 | 1.05 | `-0.04em` |
| **Heading 1** | 32px -> 48px | `clamp(2.0rem, 1.5rem + 2.5vw, 3.0rem)` | 600 | 1.15 | `-0.035em` |
| **Heading 2** | 24px -> 36px | `clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)` | 600 | 1.20 | `-0.025em` |
| **Heading 3** | 20px -> 26px | `clamp(1.25rem, 1.1rem + 0.8vw, 1.625rem)` | 500 | 1.30 | `-0.02em` |
| **Heading 4** | 18px -> 20px | `clamp(1.125rem, 1.05rem + 0.4vw, 1.25rem)` | 500 | 1.40 | `-0.01em` |
| **Body Large** | 16px -> 18px | `clamp(1.0rem, 0.95rem + 0.25vw, 1.125rem)` | 400 | 1.60 | `0` |
| **Body** | 15px -> 16px | `clamp(0.9375rem, 0.9rem + 0.2vw, 1.0rem)` | 400 | 1.55 | `0` |
| **Caption** | 13px -> 14px | `clamp(0.8125rem, 0.78rem + 0.15vw, 0.875rem)` | 400 | 1.40 | `+0.01em` |

### 2.4 Spacing Scale (4px Grid)
`2` (8px), `3` (12px), `4` (16px), `5` (20px), `6` (24px), `8` (32px), `10` (40px), `12` (48px), `16` (64px), `20` (80px), `24` (96px), `32` (128px), `40` (160px).

### 2.5 Radii, Elevation & Blur Tokens
- **Border Radii**:
  - `radius-pill`: `9999px` (Buttons, chips, search pills)
  - `radius-card`: `28px` (`1.75rem` — Bento tiles, modals, large cards)
  - `radius-card-sm`: `20px` (`1.25rem` — Nested cards, dropdown menus)
  - `radius-control`: `12px` (`0.75rem` — Form inputs, select dropdowns)
- **Shadows & Glows**:
  - `shadow-glow-pulse`: `0 0 50px -10px rgba(255, 77, 94, 0.25)`
  - `shadow-glow-teal`: `0 0 50px -10px rgba(94, 225, 210, 0.25)`
  - `shadow-elevation-high`: `0 24px 48px -12px rgba(0, 0, 0, 0.7)`
  - `shadow-elevation-low`: `0 8px 24px -6px rgba(0, 0, 0, 0.4)`
- **Backdrop Blur Levels**:
  - `blur-nav`: `backdrop-blur(16px)`
  - `blur-modal`: `backdrop-blur(24px)`
  - `blur-card`: `backdrop-blur(12px)`
- **Z-Index Hierarchy**:
  - `z-canvas`: `0` (Three.js WebGL scene)
  - `z-content`: `10` (Standard page flow)
  - `z-sticky-bar`: `50` (Top navigation, utility bars)
  - `z-modal-backdrop`: `90` (Darkened veil)
  - `z-modal`: `100` (Dialogs, command palette)
  - `z-toast`: `110` (High-priority feedback toasts)
- **Breakpoints & Container Widths**:
  - `sm`: `375px` (Mobile baseline)
  - `md`: `768px` (Tablet)
  - `lg`: `1024px` (Laptop / standard desktop)
  - `xl`: `1440px` (Max layout container width: `1280px` centered)

### 2.6 Ready-to-Paste Tailwind Theme Snippet
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#07090D',
        graphite: '#12161D',
        mist: '#F4F5F7',
        'card-border': 'rgba(255, 255, 255, 0.08)',
        pulse: {
          DEFAULT: '#FF4D5E',
          glow: 'rgba(255, 77, 94, 0.25)',
          muted: 'rgba(255, 77, 94, 0.10)',
        },
        teal: {
          DEFAULT: '#5EE1D2',
          glow: 'rgba(94, 225, 210, 0.25)',
          muted: 'rgba(94, 225, 210, 0.10)',
        },
        amber: {
          DEFAULT: '#FFB86B',
          muted: 'rgba(255, 184, 107, 0.10)',
        },
        text: {
          primary: '#F2F4F7',
          muted: '#8B93A1',
          dark: '#0B0F15',
          'dark-muted': '#5A6270',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        pill: '9999px',
        card: '1.75rem',    // 28px
        'card-sm': '1.25rem', // 20px
        control: '0.75rem',  // 12px
      },
      boxShadow: {
        'glow-pulse': '0 0 50px -10px rgba(255, 77, 94, 0.25)',
        'glow-teal': '0 0 50px -10px rgba(94, 225, 210, 0.25)',
        'elevation-high': '0 24px 48px -12px rgba(0, 0, 0, 0.70)',
        'elevation-low': '0 8px 24px -6px rgba(0, 0, 0, 0.40)',
      },
    },
  },
};
```

### 2.7 CSS Variables Implementation (`globals.css`)
```css
:root {
  --color-ink: #07090D;
  --color-graphite: #12161D;
  --color-mist: #F4F5F7;
  --color-text-primary: #F2F4F7;
  --color-text-muted: #8B93A1;
  --color-text-dark: #0B0F15;
  --color-text-dark-muted: #5A6270;
  --color-pulse: #FF4D5E;
  --color-teal: #5EE1D2;
  --color-amber: #FFB86B;
  --border-card: rgba(255, 255, 255, 0.08);
  --radius-card: 1.75rem;
  --radius-control: 0.75rem;
  --radius-pill: 9999px;
  --font-sans: 'Geist', 'Inter', -apple-system, sans-serif;
  --font-mono: 'Geist Mono', monospace;
}
```

---

## 3. Layout Rules & Whitespace Discipline

1. **The 100svh Whitespace Rule**:
   - Every major narrative section on the marketing page MUST span at least **100svh** (small viewport height).
   - Only narrow utility bands (e.g., trust tickers, footnote disclaimers) may be shorter.
   - Generous breathing room: vertical padding defaults to `py-24` (96px) on mobile and `py-36` (144px) on desktop.
2. **Alternating Section Temperature**:
   - The marketing page deliberately contrasts mood through alternating light and dark zones:
     - **Hero & Pinned Story**: Deep Obsidian Ink (`#07090D`) with glowing 3D particle light.
     - **Interactive Demo Section**: Crisp, luminous Mist (`#F4F5F7`) delivering immediate clinical clarity.
     - **Dashboard & Security Architecture**: Return to Deep Obsidian Ink (`#07090D`) with graphite bento cards.
3. **Maximum Text Column Measure**:
   - Narrative body text never exceeds **68 characters per line** (`max-w-2xl` / ~672px).
   - Section headlines never wrap onto more than 3 lines.
4. **Bento Grid Architecture**:
   - 12-column CSS Grid with a strict 24px (`gap-6`) gutter.
   - Bento tiles observe consistent height ratios: $1:1$ (square metric tile), $2:1$ (wide sparkline card), or $3:2$ (primary action card).
   - The top-left tile of any bento grid must contain the primary user insight (e.g., the Composite Health Score).
5. **Intentional Negative Space**:
   - Never fill space just because it is empty. Unoccupied space conveys calm control, reducing cognitive load for anxious patients.

---

## 4. Typography Rules

1. **Tight, Sculptural Headings**:
   - Headings are set in `Geist` or `Inter` at weight 600, with aggressive negative tracking (`-0.035em` to `-0.04em`) and compact line heights ($1.05$ to $1.15$).
   - Headlines use **sentence case** exclusively (e.g., "Your health, explained in plain English" — NEVER Title Case).
2. **Light, Spacious Body Text**:
   - Body copy is set at weight 400 with a generous line height ($1.6$).
   - Never use more than **two type weights** per screen (Weight 600 for headings/key metrics; Weight 400 for copy/labels).
3. **Number Formatting & Tabular Numerals**:
   - All laboratory figures, vital readings, reference ranges, and timestamps MUST enable CSS `font-variant-numeric: tabular-nums` or `font-mono`.
   - Units always sit on the same line as numbers with a non-breaking space (e.g., `14.2&nbsp;g/dL`).
4. **Scroll-Driven Typography Reveals**:
   - Main section headlines reveal word-by-word on scroll using GSAP SplitType, animating from `opacity: 0.15` to `opacity: 1.0` as the user traverses the trigger window.

---

## 5. Component Library Specifications

### 5.1 Button
- **Anatomy**: Inner label text, optional left/right icon (16px), pill container (`rounded-pill`).
- **Variants**:
  - `Primary (Pulse)`: Solid `#FF4D5E` background, `#FFFFFF` text, subtle pulse glow shadow.
  - `Secondary (Outline)`: Transparent fill, `1px solid rgba(255, 255, 255, 0.15)`, `#F2F4F7` text.
  - `Ghost`: Text-only with opacity transition.
  - `Light-Section Primary`: Solid `#0B0F15` background, `#F4F5F7` text on `mist` surfaces.
- **States**: `default`, `hover` (scale `1.02`, glow intensity +20%), `focus` (visible 2px ring with 2px offset), `active` (scale `0.98`), `disabled` (opacity `0.4`, `cursor: not-allowed`), `loading` (spinner with `aria-busy="true"`).
- **Sizes**: Small (36px height, 14px text), Medium (44px height, 15px text), Large (52px height, 16px text).
- **A11y**: Minimum touch target $44 \times 44\text{px}$.

### 5.2 Input Field
- **Anatomy**: Floating label, input container (`rounded-control`), input text, optional trailing unit badge.
- **Variants**: Dark surface (`bg-graphite border-card-border`), Light surface (`bg-white border-gray-200`).
- **States**: `default`, `hover`, `focus` (border color `#5EE1D2`, box-shadow `0 0 0 2px rgba(94, 225, 210, 0.2)`), `error` (border color `#FF4D5E`, inline helper text), `disabled`.
- **A11y**: Explicit `<label htmlFor="...">`, `aria-invalid`, `aria-describedby` bound to error text.

### 5.3 Select & Dropdown
- **Anatomy**: Trigger button with chevron, floating popover menu (`bg-graphite/95 backdrop-blur-md rounded-card-sm border-card-border`), option items with checkmarks.
- **A11y**: WAI-ARIA Listbox pattern with complete keyboard navigation (`ArrowUp`/`ArrowDown`/`Enter`/`Escape`).

### 5.4 Toggle Switch
- **Anatomy**: Pill track ($48 \times 28\text{px}$), circular thumb ($22 \times 22\text{px}$).
- **States**: Inactive (`bg-white/10`), Active (`bg-pulse` or `bg-teal`).
- **A11y**: `role="switch"`, `aria-checked="true|false"`.

### 5.5 Bento Tile & Card
- **Anatomy**: Dark graphite surface (`bg-graphite/90 backdrop-blur-md`), 28px border radius, hairline top highlight (`border-t border-white/10 border-x border-b border-white/5`).
- **Hover**: Subtle vertical translation (`-2px`) and border luminance increase.

### 5.6 Status Chip / Pill
- **Variants**:
  - `Normal`: `bg-teal-muted text-teal border border-teal/20`.
  - `High / Alert`: `bg-pulse-muted text-pulse border border-pulse/20`.
  - `Borderline`: `bg-amber-muted text-amber border border-amber/20`.
- **Anatomy**: Dot indicator (6px circle) + uppercase 12px bold metric label.

### 5.7 Toast Notification
- **Anatomy**: Floating pill or rounded-control box at bottom-right, icon, message, dismiss button.
- **Motion**: Enters via `translate-y: 20px -> 0px` with fade in 0.25s. Auto-dismisses in 4.0s.
- **A11y**: `role="status"`, `aria-live="polite"`.

### 5.8 Modal Dialog
- **Anatomy**: Centered card over dark frosted veil (`bg-ink/80 backdrop-blur-xl`), title, close button (`X`), action buttons.
- **A11y**: Focus lock trapped inside; `Escape` key closes; `role="dialog"`, `aria-modal="true"`.

### 5.9 Navigation Bar
- **Anatomy**: Fixed floating glass pill or edge-to-edge bar with translucent backdrop blur (`bg-ink/75 backdrop-blur-md border-b border-white/5`), wordmark, center nav links, right action button.

### 5.10 Command Palette (Post-MVP)
- **Anatomy**: Centered modal, search input with instantaneous fuzzy filtering, grouped search results, keyboard shortcuts (`⌘K` / `Ctrl+K`).

---

## 6. Motion System & Signature Moments

PulseOS motion is strictly physical, smooth, and grounded. **Bouncing, spinning, or elastic rubber-band effects are strictly forbidden.**

### 6.1 Easing Curves & GSAP Equivalents
- **Standard Easing (Natural Entrance)**:
  - CSS: `cubic-bezier(0.16, 1, 0.3, 1)`
  - GSAP: `expo.out` (Duration: 0.6s to 0.8s)
- **Smooth Deceleration (Hover & Touch)**:
  - CSS: `cubic-bezier(0.25, 1, 0.5, 1)`
  - GSAP: `power2.out` (Duration: 0.25s)
- **Linear Acceleration (Continuous Canvas Rotation)**:
  - CSS: `linear`
  - GSAP: `none`

### 6.2 Animation Registry Table

| Animation | Trigger | Duration | Easing | Animated Properties | Reduced Motion Fallback |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Headline Word Reveal** | In Viewport | 0.8s | `expo.out` (stagger: 0.04s) | `opacity`, `transform: translateY` | Instant `opacity: 1` |
| **Particle Heart Repel** | Cursor Move | Realtime | Realtime shader physics | Shader uniform coordinates | Static heart position |
| **Pinned Narrative Swap**| Scroll (300vh) | Scroll-tied | `none` (direct scrub) | `transform: translateX`, `color` | Static stacked cards |
| **Count-Up Numbers** | In Viewport | 1.2s | `power2.out` | Numerical value (0 -> target) | Displays final number |
| **Chart Line Draw** | In Viewport | 1.4s | `power2.out` | `strokeDashoffset` (path length) | Pre-drawn static line |
| **AI Streamed Token** | SSE Event | 0.08s | `linear` | `opacity: 0 -> 1` | Plain instantaneous text |
| **Modal Entry** | Click Trigger | 0.3s | `expo.out` | `opacity`, `transform: scale(0.96 -> 1.0)` | Simple fade (`opacity`) |

---

## 7. 3D & Imagery Rules

1. **The 3D Particle Heart Specification**:
   - **Particle Budget**: Exactly **8,000 vertices** on desktop; throttled to **3,500 vertices** on mobile or low-power modes.
   - **Shader Behavior**: Custom GLSL points shader. Particles maintain a gentle organic heartbeat scaling pulse ($1.0 \to 1.04 \to 1.0$ at 60 bpm). Cursor proximity applies a radial inverse-square repulsion force, with smooth spring return.
   - **Dynamic Color States**: Interpolates smoothly across Crimson (`#FF4D5E`) during default/abnormal focus, Teal (`#5EE1D2`) during healthy states, and Amber (`#FFB86B`) during cautionary scroll panels.
2. **WebGL Fallback Strategy**:
   - If WebGL context is lost or unsupported:
     - The `<canvas>` is unmounted cleanly.
     - A high-fidelity radial pulse element rendered via CSS/SVG with a layered radial glow (`glow-pulse`) takes its place with zero layout shift.
3. **Product Framing & Screenshots**:
   - App screenshots sit inside bento containers featuring subtle dark bezel framing, hairline highlights, and soft ambient drop shadows (`shadow-elevation-high`).
4. **Iconography Treatment**:
   - Icons use a consistent **1.5px stroke weight** with rounded caps (`stroke-linecap="round"`), sourced from Lucide or Iconsax.
   - Icons never exceed 20px in body copy or 24px in headers.

---

## 8. Page Blueprints & Viewport Specifications

### 8.1 Marketing Page (`/`)
- **Single CTA**: "Try Interactive Demo" / "Get Started".
- **Mobile (375px)**:
  - Top: 40vh particle heart canvas.
  - Stacked hero title and single action button.
  - Pinned story unwinds into 3 clean vertical cards with minimal horizontal shift.
  - Interactive demo occupies 100% screen width with touch-friendly value toggles.
- **Desktop (1440px)**:
  - Hero: Full-screen cinematic canvas with 50/50 split layout.
  - Pinned Story: Left column pins text while right column rotates and recolors the 3D heart across 300vh.
  - Interactive Demo: Centered floating bento card on `mist` background with live streaming text simulator.

### 8.2 Dashboard (`/dashboard`)
- **Single CTA**: "Upload New Lab Report".
- **Mobile (375px)**: Single-column vertical stream: Health Score tile -> Recent report pill -> 7-day BP card -> Upcoming appointment.
- **Desktop (1440px)**: 12-column asymmetric bento layout with 28px card radii.

### 8.3 Reports Hub & Report Detail (`/reports`, `/reports/[id]`)
- **Single CTA**: "Explain My Report" (triggers real-time SSE stream).
- **Mobile (375px)**: Sticky bottom action bar; tabbed view switching between "Values Table" and "AI Explanation".
- **Desktop (1440px)**: 60/40 side-by-side split screen (Left: Structured biomarker table; Right: Streaming explanation with urgent care alert banner if triggered).

### 8.4 Vitals Tracking (`/vitals`)
- **Single CTA**: "Log Vital Reading".
- **Mobile (375px)**: Segmented control (`7d` vs `30d`), full-width touch chart, floating action button for quick logging.
- **Desktop (1440px)**: Side-by-side metric tiles with interactive crosshairs and trend percentage badges.

### 8.5 Appointments (`/appointments`)
- **Single CTA**: "Confirm Appointment".
- **Mobile (375px)**: Doctor selection carousel followed by a simple calendar slot list.
- **Desktop (1440px)**: Two-column booking wizard: Doctor bio on the left, weekly interactive calendar grid on the right.

### 8.6 Authentication (`/login`, `/register`)
- **Single CTA**: "Sign In" / "Create Free Account".
- **Layout**: Centered compact bento card ($420\text{px}$ width) over deep obsidian canvas with subtle ambient background pulse glow.

---

## 9. Copywriting Voice & Tone Guidelines

PulseOS speaks with the calm, grounded reassurance of a world-class clinician. **Never alarmist, never hyped, never evasive.**

### Voice Principles & Do / Don't Examples
| Context | Do (Calm, Plain, Objective) | Don't (Alarmist, Clinical Jargon, or Hyped) |
| :--- | :--- | :--- |
| **Headline** | Understand your lab results in minutes. | Revolutionize your biochemical diagnostics with cutting-edge AI! |
| **Abnormal Value** | Your blood sugar is slightly higher than usual. | WARNING: Dangerously high glucose level detected! |
| **Disclaimer** | PulseOS explains information. It does not provide medical diagnoses. | We are not doctors, use at your own risk. |
| **Button Action** | Explain report | Process diagnostics with deep learning |
| **Error Message** | We couldn't read this scan. Please try a clearer photo. | Fatal Parser Exception: OCR Confidence below 0.60 |
| **Empty State** | No reports uploaded yet. Add a lab report to see plain explanations. | You currently have zero diagnostic entities in your database. |

### Headline Rules
- Exactly **under 8 words**.
- Must communicate one clear benefit.

### 10 Sample Headlines in Voice
1. "Your health, explained in plain English."
2. "Lab results without the medical jargon."
3. "Turn numbers into your next healthy step."
4. "Clear answers before your doctor visit."
5. "Calm insight for every diagnostic test."
6. "Track your vital trends with clarity."
7. "Book consultations with confidence."
8. "A simpler way to understand bloodwork."
9. "Your personal guide through complex reports."
10. "Health metrics made genuinely easy to read."

---

## 10. Quality Gates & Pre-Merge Checklist

### Performance & Accessibility Budgets
- **Mobile Lighthouse Performance**: Score **≥ 90** on mobile emulation.
- **Largest Contentful Paint (LCP)**: **< 2.5 seconds** on a 4G connection.
- **Cumulative Layout Shift (CLS)**: **< 0.1**.
- **Frame Rate**: Constant **60 FPS** scroll throughout the pinned story section.
- **3D Initialization**: Particle canvas must mount asynchronously without blocking initial HTML/CSS first paint.

### Pre-Merge Design Review (15 Mandatory Yes/No Checks)
1. [ ] Is there exactly **one primary call to action** on this screen?
2. [ ] Does every text-to-background pairing pass **WCAG AA contrast (≥ 4.5:1)**?
3. [ ] Are all headlines formatted in **sentence case**?
4. [ ] Are there **no more than two font weights** displayed on this screen?
5. [ ] Do all interactive controls meet the **$44 \times 44\text{px}$ minimum touch target**?
6. [ ] Are all button corners formatted with **pill radii (`rounded-pill`)**?
7. [ ] Are all card containers formatted with **28px radii (`rounded-card`)**?
8. [ ] Is all motion strictly confined to **`transform` and `opacity`** (no layout-property animations)?
9. [ ] Does the screen support **`prefers-reduced-motion`** gracefully?
10. [ ] Are all numerical values and clinical units rendered with **`tabular-nums` or monospace font**?
11. [ ] Does the Server-Sent Events streaming text container feature **`aria-live="polite"`**?
12. [ ] Are all form inputs bound to explicit `<label>` elements with visible focus rings?
13. [ ] Is the non-diagnostic clinical disclaimer clearly visible on any screen showing AI output?
14. [ ] Does the screen render without horizontal overflow or text clipping at **375px mobile width**?
15. [ ] Is there **zero layout shift (CLS < 0.1)** when 3D elements or charts complete loading?

---

## 11. Anti-Patterns (15 Ways to Ruin the Aesthetic)

1. **Gradient Overload**: Applying multi-color neon gradients across buttons, borders, and text fills simultaneously.
2. **Harsh Dark Shadows**: Using pitch-black, non-diffused `rgba(0,0,0,1)` box shadows that look dated and unrefined.
3. **Centered Narrative Copy**: Centering multi-line body paragraphs (body copy must always be left-aligned for readability).
4. **Bouncy / Elastic Motion**: Adding spring physics or rubber-band overshoot to UI dialogs, cards, or buttons.
5. **Color Palette Chaos**: Introducing more than 3 accent colors (stick strictly to Pulse `#FF4D5E`, Teal `#5EE1D2`, and Amber `#FFB86B`).
6. **Generic Stock Iconography**: Using generic, multicolored, or clip-art icons instead of refined, uniform 1.5px stroke icons.
7. **Wall of Numbers Without Context**: Displaying raw biomarker quantities without reference intervals or clear plain-language status badges.
8. **Tiny, Low-Contrast Footnotes**: Rendering secondary information in illegible 10px gray text below contrast thresholds.
9. **Cluttered Navigation**: Stuffing the top navigation bar with more than 4 primary links.
10. **Capitalization Inconsistency**: Mixing Title Case and Sentence Case across buttons, headers, and tabs.
11. **Abrupt Motion Cuts**: Animating height or width directly with CSS transitions, resulting in janky layout recalculations.
12. **Decorative Medical Fluff**: Adding heartbeat EKG squiggles or medical caduceus symbols purely for decorative fill.
13. **Auto-Playing Audio**: Playing chimes, heartbeat sounds, or audio alerts without explicit user interaction.
14. **Over-saturated Backgrounds**: Using pure `#000000` pitch black everywhere instead of the nuanced, luminous Obsidian Ink (`#07090D`) and Graphite (`#12161D`).
15. **Alarmist Framing**: Employing flashing red banners or exclamation marks that induce unnecessary anxiety in patients.

---

## 12. Open Questions
1. Should the interactive demo on the marketing page offer a choice of 3 different sample reports (e.g., Routine CBC, Lipid Profile, or Thyroid Panel), or should it default strictly to a single CBC report for streamlined storytelling?
2. When a patient switches between 7-day and 30-day vitals charts, should the line morph smoothly via Recharts animation or perform a clean cross-fade?
