# PulseOS — Design System & UX Specification

## 1. Design Tokens & Foundations

PulseOS employs a disciplined, Apple-inspired aesthetic characterized by deep contrast, luminous clinical accent tones, tactile surfaces, and generous negative space.

### 1.1 Token Dictionary
| Category | Token Name | Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Color: Core** | `--color-ink` | `#07090D` | Primary deep canvas background |
| **Color: Core** | `--color-card` | `#12161D` | Elevated dark surface for cards and modals |
| **Color: Core** | `--color-mist` | `#F4F5F7` | Luminous light section background for contrast |
| **Color: Text** | `--color-text-primary` | `#F2F4F7` | High-contrast headings and prominent content |
| **Color: Text** | `--color-text-muted` | `#8B93A1` | Secondary captions, subheadings, and units |
| **Color: Accent** | `--color-pulse` | `#FF4D5E` | Primary crimson brand accent & abnormal flag |
| **Color: Accent** | `--color-teal` | `#5EE1D2` | Normal biomarker state, calm vitality, success |
| **Color: Accent** | `--color-amber` | `#FFB86B` | Cautionary readings, borderline metrics |
| **Typography** | `--font-family-sans` | `Geist, -apple-system, sans-serif` | Clean, high-legibility geometric sans |
| **Type Scale** | `--text-display` | `3.5rem (56px) / 1.1` | Marketing hero headlines (`font-semibold`, `-0.04em`) |
| **Type Scale** | `--text-h1` | `2.5rem (40px) / 1.2` | Primary section titles (`-0.03em`) |
| **Type Scale** | `--text-h2` | `1.75rem (28px) / 1.25` | Modal titles, major dashboard cards (`-0.02em`) |
| **Type Scale** | `--text-body` | `1rem (16px) / 1.6` | Narrative text, reading-level plain explanations |
| **Type Scale** | `--text-caption` | `0.875rem (14px) / 1.4`| Metadata, timestamps, table cells |
| **Radii** | `--radius-card` | `1.5rem (24px) – 1.75rem (28px)` | Bento cards, containers, previews |
| **Radii** | `--radius-button` | `0.75rem (12px)` | Buttons, input fields, interactive chips |
| **Radii** | `--radius-pill` | `9999px` | Status badges, category pills |
| **Shadows** | `--shadow-glow-pulse`| `0 0 40px rgba(255, 77, 94, 0.2)` | Hero focal points, active state |
| **Shadows** | `--shadow-elevation` | `0 20px 40px rgba(0, 0, 0, 0.5)` | Elevated floating panels |
| **Z-Index** | `--z-canvas` | `0` | Background 3D Three.js particle canvas |
| **Z-Index** | `--z-content` | `10` | Standard layout flow |
| **Z-Index** | `--z-sticky` | `50` | Sticky navigation headers |
| **Z-Index** | `--z-modal` | `100` | Overlays, dialogs, full-screen sheets |
| **Breakpoints** | `--bp-mobile` | `375px` | Baseline mobile phone |
| **Breakpoints** | `--bp-tablet` | `768px` | Tablet / small laptop |
| **Breakpoints** | `--bp-desktop` | `1024px` | Standard desktop view |
| **Breakpoints** | `--bp-wide` | `1440px` | Large monitors |

### 1.2 Ready-to-Use Tailwind Configuration Snippet
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: '#07090D',
        card: '#12161D',
        'card-border': 'rgba(255, 255, 255, 0.08)',
        mist: '#F4F5F7',
        'mist-dark': '#E5E7EB',
        pulse: '#FF4D5E',
        'pulse-glow': 'rgba(255, 77, 94, 0.25)',
        teal: '#5EE1D2',
        amber: '#FFB86B',
        text: {
          primary: '#F2F4F7',
          muted: '#8B93A1',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'card': '1.75rem',     // 28px
        'card-sm': '1.25rem',  // 20px
        'control': '0.75rem',  // 12px
      },
      boxShadow: {
        'glow-pulse': '0 0 50px rgba(255, 77, 94, 0.2)',
        'glow-teal': '0 0 50px rgba(94, 225, 210, 0.2)',
        'surface': '0 24px 48px -12px rgba(0, 0, 0, 0.6)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
      },
    },
  },
};
```

---

## 2. Typography Rules & Content Hierarchy

1. **Heading Posture**:
   - Headings are tight, imposing, and confident (`font-semibold`, tracking `-0.04em`).
   - Line height stays compact ($1.1$ to $1.2$) to maintain editorial unity.
2. **Body & Explanatory Prose**:
   - Clean, light weight body font ($400$), rendered at `16px` minimum with generous line height ($1.6$).
   - High contrast against dark surfaces (`#F2F4F7` on `#12161D`), preventing eye fatigue.
3. **Clinical Values & Data Points**:
   - Monospaced or tabular numbers (`font-mono` / `tabular-nums`) for lab values and vital readings to facilitate vertical scanning.
4. **Tone of Copy**:
   - Calm, objective, reassuring. Avoid alarmist punctuation (no exclamation marks in clinical alerts). Plain English translated to an 8th-grade comprehension tier.

---

## 3. Component Inventory & Accessibility Requirements

### 3.1 Button
- **Variants**:
  - `Primary (Pulse)`: Solid `#FF4D5E` background, white text, subtle pulse glow on hover.
  - `Secondary (Outline)`: Transparent with `1px` subtle white border (`rgba(255, 255, 255, 0.15)`), hover shifts to white fill.
  - `Ghost`: Text-only with subtle opacity shift.
- **States**: `default`, `hover`, `active`, `focused`, `disabled`, `loading` (spinner with `aria-busy="true"`).
- **Accessibility**: Minimum touch target $44 \times 44\text{px}$; visible focus ring (`ring-2 ring-pulse ring-offset-2 ring-offset-ink`).

### 3.2 Input Field
- **Variants**: Standard text, email, password, numerical inputs with unit badges.
- **States**: `default`, `active/focused` (border transitions to `#5EE1D2`), `error` (crimson border with inline message), `disabled`.
- **Accessibility**: Explicit `<label>` associations; `aria-invalid` and `aria-describedby` bound to validation errors.

### 3.3 Bento Card
- **Structure**: High-radius container (`28px`), dark semi-translucent backdrop (`bg-card/90 backdrop-blur-md`), hairline border (`border border-white/5`).
- **States**: Static or interactive (`hover:translate-y-[-2px] hover:border-white/15`).

### 3.4 Status Chip / Badge
- **Variants**:
  - `Normal / Stable`: Teal background tint (`rgba(94, 225, 210, 0.1)`), teal text (`#5EE1D2`), dot indicator.
  - `High / Out of Range`: Pulse red tint (`rgba(255, 77, 94, 0.1)`), red text (`#FF4D5E`).
  - `Cautionary / Borderline`: Amber tint (`rgba(255, 184, 107, 0.1)`), amber text (`#FFB86B`).

### 3.5 Modal Dialog
- **Behavior**: Centered card over dark backdrop blur (`rgba(7, 9, 13, 0.8)`).
- **Accessibility**: Focus trapped via `react-focus-lock`; dismissible via `Escape` key; `role="dialog"` with `aria-modal="true"`.

### 3.6 Accordion
- **Behavior**: Smooth height tween for FAQ and expandable medical definitions.
- **Accessibility**: Native `<button>` triggers with `aria-expanded` and `aria-controls`.

### 3.7 Chart Card & Metric Tile
- **Structure**: Minimalist Recharts container with custom dark SVG tooltip, trend badge (`+2.4%`), and average metric callout.

### 3.8 Skeleton Loader
- **Animation**: Gentle shimmering gradient tween across `rgba(255,255,255,0.04)` to `rgba(255,255,255,0.08)`.

---

## 4. Page-by-Page Layout Specifications

### 4.1 Marketing Landing (`/`)
- **Desktop (≥1024px)**:
  - Header: Fixed glass bar (`backdrop-blur-md`) with logo, navigation links, and "Sign In" button.
  - Hero Section: 50/50 split or centered display title over full-width 3D interactive particle heart. Word-by-word reveal text.
  - Pinned Story Section: Pins for 300vh. 3D heart transitions rightward while 3 narrative slides cross-fade on the left.
  - Interactive Demo: Centered interactive diagnostic card where users run a sample report and watch streaming explanations.
  - Dashboard Preview: Bento layout showcasing vitals ring, mock CBC report, and doctor booking preview.
  - Trust & Security: Bento grid emphasizing zero PII retention, synthetic testing, and encryption.
  - FAQ: Expandable accordion list.
- **Mobile (<768px)**:
  - Full-width stacked layout; 3D heart canvas occupies upper 40vh; text panels stack cleanly underneath.

### 4.2 Dashboard (`/dashboard`)
- **Overview Bento Grid**:
  - Tile 1 (Large): Daily Health Score Gauge (circular SVG ring) with status badge.
  - Tile 2: Recent Reports widget with quick "Upload" button and status pill.
  - Tile 3: 7-day Blood Pressure sparkline.
  - Tile 4: Upcoming doctor consultation card.

### 4.3 Reports Hub & Detail (`/reports`, `/reports/[id]`)
- **Upload Dropzone**: Large dashed boundary with animated drag-and-drop state, supported format badges, and 10MB limit indicator.
- **Report Detail View**:
  - Left column (60%): Clean table of extracted biomarkers (Name, Value, Unit, Reference Range, Status chip).
  - Right column (40%): AI Plain-Language explanation panel with streaming output, urgent warning banner (if applicable), and "Questions for Your Doctor" checklist.

### 4.4 Vitals Tracking (`/vitals`)
- Segmented control to toggle between "7 Days" and "30 Days".
- Time-series Recharts line charts with hover cursors, min/max guides, and average metric pills.
- Floating "Log Vital" modal trigger with quick input for HR, BP, Glucose, and Weight.

### 4.5 Appointments Hub (`/appointments`)
- Multi-step booking wizard:
  1. Doctor Selection card grid (Photo/avatar, Name, Specialty, Bio).
  2. Weekly calendar slot selector (Clean grid of available time buttons).
  3. One-click reservation with immediate confirmation modal and toast.

---

## 5. Motion & Animation Specification

| Animation | Trigger | Target Properties | Duration | Easing | Reduced Motion Fallback |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Headline Reveal** | Page Mount | `opacity: 0 -> 1`<br>`y: 20px -> 0px` | `0.8s` | `power3.out` | Instant display (`opacity: 1`) |
| **Particle Pulse** | Constant Loop | `scale: 1.0 -> 1.05 -> 1.0` | `1.2s` | `sine.inOut` | Fixed scale (`1.0`) |
| **Pinned Narrative**| Scroll Window | `x: 0 -> 40vw`<br>`rotation: 0 -> 360deg` | Tied to scroll | Linear scroll | Static element without motion |
| **Chart Draw** | In Viewport | `strokeDashoffset: 1000 -> 0` | `1.4s` | `power2.out` | Fully drawn line instantly |
| **Streaming Text** | SSE Token Chunk | `opacity: 0 -> 1` | `0.1s` | Linear | Render plain text instantly |
| **Modal Entry** | Click Open | `scale: 0.95 -> 1.0`<br>`opacity: 0 -> 1` | `0.25s` | `back.out(1.5)`| Simple fade (`opacity: 0 -> 1`) |

*Reduced Motion Rule*: When `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is active, Lenis smooth scrolling is disabled, 3D particle rotation stops, and CSS transitions default to instantaneous or gentle opacity fades.

---

## 6. 3D Hero Particle Specification

1. **Geometry & Particle Budget**:
   - Approximately **8,000 vertices** generated mathematically using parametric 3D heart point equations:
     $$x = 16 \sin^3(t)$$
     $$y = 13 \cos(t) - 5 \cos(2t) - 2 \cos(3t) - \cos(4t)$$
     $$z = \text{depth dispersion}$$
2. **Custom Shader Implementation**:
   - Custom GLSL vertex and fragment shaders.
   - Points repel dynamically based on normalized cursor coordinates $(x, y)$ mapped onto screen space.
   - Point color interpolates smoothly between Pulse Crimson (`#FF4D5E`) and Teal (`#5EE1D2`) based on vertex displacement velocity.
3. **Performance Boundaries**:
   - Canvas pixel ratio is capped at `min(window.devicePixelRatio, 2.0)` to eliminate GPU thermal throttling on retina screens.
   - Target framerate: Steady **60 FPS**.
4. **Fallback Strategy**:
   - If WebGL context creation fails or is unsupported, the 3D canvas is unmounted and replaced with an animated radial gradient glow heart rendered via pure SVG/CSS.

---

## 7. Open Questions
1. Should the marketing site include a persistent dark/light theme switch in MVP, or should we lock the experience to the curated dark palette for launch consistency?
2. For mobile devices with low battery mode enabled, should 3D particle rendering automatically step down to 3,000 particles to conserve energy?
