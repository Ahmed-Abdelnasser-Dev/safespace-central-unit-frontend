# Safe Space Design System

This is the **canonical source of truth** for all design decisions in the Safe Space central-unit dashboard. All other design references defer to this document.

---

## Principles

1. **The tool disappears into the task.** Every visual decision should help an operator act faster, not draw attention to itself.
2. **State over decoration.** Color, motion, and emphasis convey real system state — severity, unit availability, live updates — never applied for visual interest alone.
3. **One glance, no ambiguity.** Critical information (severity, status, location, time) must be legible at a glance under operational stress.
4. **Consistency over surprise.** Same component vocabulary, screen to screen.

---

## Token Hierarchy

### Surface Tokens (theme-adaptive)

Defined in `src/index.css` as CSS custom properties, surfaced via `tailwind.config.js`.

| Tailwind Token | Light (`#hex`) | Dark (`#hex`) | Role |
|----------------|---------------|--------------|------|
| `safe-dark` / `safe-bg` | `#f5f7fa` | `#111111` | Page canvas — outermost background |
| `safe-sidebar` / `safe-white` | `#ffffff` | `#1a1a1a` | Cards, panel surfaces, headers |
| `safe-gray` | `#edf1f6` | `#242424` | Inner card surfaces, nested panels |
| `safe-gray-light` / `safe-border` | `#d1dbe7` | `#333333` | Borders, elevated hover surfaces |

> **Legacy aliases** (`safe-bg`, `safe-white`, `safe-text-dark`, `safe-text-gray`, `safe-border`) resolve to the same CSS vars as their primary equivalents. New code should use the primary token names.

### Text Tokens (theme-adaptive)

| Tailwind Token | Light | Dark | Role |
|----------------|-------|------|------|
| `safe-text-primary` / `safe-text-dark` | `#0f1419` | `#ffffff` | Body text, headings, labels |
| `safe-text-muted` / `safe-text-gray` | `#475569` | `#8b99b5` | Captions, secondary info |

### Semantic Tokens (fixed — same in both themes)

| Token | Hex | Role |
|-------|-----|------|
| `safe-blue` | `#3b7cff` | Highlights, links, accents |
| `safe-blue-light` | `#5a96ff` | Hover state of blue |
| `safe-blue-btn` | `#2563eb` | Primary action buttons |
| `safe-success` | `#10b981` | Online, healthy, confirmed |
| `safe-danger` | `#ef4444` | Error, offline, critical, rejected |
| `safe-orange` / `safe-accent` | `#fb923c` / `#ff6b35` | Warnings, secondary emphasis |
| `safe-info` | `#0ea5e9` | Informational states |
| `safe-purple` | `#8b5cf6` | Special/tertiary states |
| `safe-teal` | `#14b8a6` | Secondary semantic accent |
| `safe-red-icon` | `#dc2626` | Icon-only danger indicators |
| `safe-green` | `#22c55e` | Secondary success |

### CSS Custom Properties Reference

All surface and text tokens use the `rgb(var(--color-*) / <alpha-value>)` format so Tailwind's opacity modifier syntax works: `bg-safe-dark/50`, `text-safe-text-muted/80`, etc.

```css
/* src/index.css */
:root {
  --color-safe-dark:       245 247 250;   /* #f5f7fa  */
  --color-safe-sidebar:    255 255 255;   /* #ffffff  */
  --color-safe-gray:       237 241 246;   /* #edf1f6  */
  --color-safe-gray-light: 209 219 231;   /* #d1dbe7  */
  --color-text-primary:    15 20 25;      /* #0f1419  */
  --color-text-muted:      71 85 105;     /* #475569  */
}
.dark {
  --color-safe-dark:       17 17 17;
  --color-safe-sidebar:    26 26 26;
  --color-safe-gray:       36 36 36;
  --color-safe-gray-light: 51 51 51;
  --color-text-primary:    255 255 255;
  --color-text-muted:      139 153 181;
}
```

---

## Tonal Layering Rules

**Dark mode** — depth through neutral gray steps, no shadows:
`safe-dark (#111)` → `safe-sidebar (#1a1a1a)` → `safe-gray (#242424)` → `safe-gray-light (#333)` elevated.

**Light mode** — depth through subtle borders and background tints:
`safe-dark (#f5f7fa)` → `safe-sidebar (#fff)` → `safe-gray (#edf1f6)` → `safe-gray-light (#d1dbe7)` borders.

**Border rule:** always use `border-safe-gray-light` (solid adaptive token). Never use `border-white/N` alpha-white tokens inside cards — they render inconsistently across surface backgrounds.

**Hover tints (dark mode):** `bg-safe-gray/40` for subtle hover, `bg-safe-gray-light/30` for icon boxes. Do not use `bg-white/N`.

---

## Contrast Ratios

**WCAG AA minimums:** body text ≥ 4.5:1 · large text (≥18px, or bold ≥14px) ≥ 3:1 · placeholder text ≥ 4.5:1.

### Light Mode

| Text token | On surface | Ratio | Pass |
|-----------|-----------|-------|------|
| `safe-text-primary` (#0f1419) | `safe-dark` (#f5f7fa) | ~17.8:1 | ✓ AAA |
| `safe-text-primary` (#0f1419) | `safe-sidebar` (#fff) | ~19.1:1 | ✓ AAA |
| `safe-text-primary` (#0f1419) | `safe-gray` (#edf1f6) | ~16.5:1 | ✓ AAA |
| `safe-text-muted` (#475569) | `safe-sidebar` (#fff) | ~6.1:1 | ✓ AA |
| `safe-text-muted` (#475569) | `safe-gray` (#edf1f6) | ~5.7:1 | ✓ AA |
| `safe-text-muted` (#475569) | `safe-dark` (#f5f7fa) | ~5.9:1 | ✓ AA |

### Dark Mode

| Text token | On surface | Ratio | Pass |
|-----------|-----------|-------|------|
| `safe-text-primary` (#ffffff) | `safe-dark` (#111) | ~18.1:1 | ✓ AAA |
| `safe-text-primary` (#ffffff) | `safe-sidebar` (#1a1a1a) | ~14.9:1 | ✓ AAA |
| `safe-text-primary` (#ffffff) | `safe-gray` (#242424) | ~12.2:1 | ✓ AAA |
| `safe-text-muted` (#8b99b5) | `safe-dark` (#111) | ~5.3:1 | ✓ AA |
| `safe-text-muted` (#8b99b5) | `safe-sidebar` (#1a1a1a) | ~4.9:1 | ✓ AA |
| `safe-text-muted` (#8b99b5) | `safe-gray` (#242424) | ~4.6:1 | ✓ AA (borderline) |

### Absolute Rules

- **Never** use `text-gray-*`, `bg-gray-*`, `text-gray-900`, or `bg-white` in component code — use `safe-*` tokens.
- **Never** use raw hex values in JSX/TSX — use `safe-*` tokens (MapLibre paint exception: see Sanctioned Exceptions).
- **Never** use `text-[10px]` or `text-[11px]` for readable content — minimum is `text-xs` (12px) for captions, `text-sm` (14px) for body.
- **Never** use `bg-yellow-*`, `text-yellow-*`, `bg-blue-50`, etc. (raw Tailwind palette) — use semantic tokens.

---

## Typography

Fixed rem scale (1.125–1.2 ratio). **No fluid `clamp()` in product UI.** Responsive behavior is structural (layout density), not typographic.

| Tailwind class | rem / px | Weight | Role |
|----------------|---------|--------|------|
| `text-3xl font-bold` | 1.875rem / 30px | 700 | Display (h1, page hero — rare) |
| `text-2xl font-semibold` | 1.5rem / 24px | 600 | Section headings (h2), page titles in top bar |
| `text-xl font-semibold` | 1.25rem / 20px | 600 | Sub-section headings (h3) |
| `text-lg font-medium` | 1.125rem / 18px | 500 | Card titles, emphasized labels |
| `text-base` | 1rem / 16px | 400 | Primary body text |
| `text-sm` | 0.875rem / 14px | 400 | Compact body, form labels, table cells, button text |
| `text-xs` | 0.75rem / 12px | 400 | Captions, timestamps, metadata |

**Minimums:**
- Body copy: `text-sm` (14px) — smallest for readable content.
- Buttons and nav: `text-sm` minimum.
- Captions / meta: `text-xs` (12px) acceptable for truly secondary info only.

**Font families (loaded via Google Fonts in `src/index.css`):**
- `font-sans` = **Poppins** — nav, labels, body text, buttons, data values.
- `font-display` = **DM Sans** — applied automatically to h1–h6 via `@layer base`.
- `font-mono` = **Space Mono** — timestamps, code, live clock, numeric telemetry.
- **Arimo is NOT loaded.** Any usage is a bug — replace with `font-sans`.

---

## Spacing Scale

| Tailwind | px | Common use |
|----------|-----|------------|
| `gap-1` / `p-1` | 4px | Icon-to-label, badge internal |
| `gap-2` / `p-2` | 8px | Chip padding, icon margins |
| `gap-3` / `p-3` | 12px | Button sm padding |
| `gap-4` / `p-4` | 16px | Card sm padding, form field gap |
| `gap-6` / `p-6` | 24px | **Card md padding (standard)**, section gap |
| `gap-8` / `p-8` | 32px | Card lg padding (roomy), section spacing |
| `gap-10` | 40px | Between major page sections |

---

## Elevation Scale (Radius + Shadow)

| Component | Radius | Shadow | Notes |
|-----------|--------|--------|-------|
| Button, Input, Badge | `rounded-lg` (8px) | — | Controls |
| Card (standard) | `rounded-xl` (16px) | `shadow-card` | All cards and panels |
| Card (interactive hover) | `rounded-xl` | `shadow-lg` | On hover/focus |
| Modal, floating panel | `rounded-2xl` (24px) | `shadow-xl` | Dialogs, popovers |
| Status dot, avatar | `rounded-full` | — | |

**Shadow definitions** (from `tailwind.config.js`):
```
shadow-card: 0 8px 24px -2px rgba(0,0,0,0.08)    ← standard card lift
shadow-sm:   0 1px 2px 0 rgba(0,0,0,0.05)          ← subtle
shadow-lg:   0 12px 32px -4px rgba(0,0,0,0.12)     ← modal emphasis, hover
shadow-xl:   0 16px 40px -4px rgba(0,0,0,0.15)     ← floating panels
```

**Elevation hierarchy** (shallow to deep):
1. `safe-dark` — page canvas (base)
2. `safe-sidebar` — cards, panel surfaces (↑ shadow-card)
3. `safe-gray` — inner / nested surfaces
4. `safe-gray-light` — borders, hover overlays
5. `shadow-xl` — modals, dialogs (↑ backdrop-blur)

---

## Component Vocabulary

All shared primitives live in `src/components/ui/`. **Do not reimplement these in feature code.** If a variant is missing, add it to the shared component.

| Component | File | Purpose |
|-----------|------|---------|
| `Card` | `Card.jsx` | All card surfaces — variants: default, elevated, subtle, ghost |
| `Button` | `Button.jsx` | All action buttons — variants: primary, secondary, danger, ghost |
| `Badge` | `Badge.jsx` | Categorical / status labels (rectangular, uppercase) |
| `StatusBadge` | `StatusBadge.jsx` | Operational status pill with colored dot |
| `Tag` | `Tag.jsx` | Lane and category labels |
| `Input` | `Input.jsx` | All form text inputs |
| `SearchInput` | `SearchInput.jsx` | Search fields (composes Input) |
| `Modal` | `Modal.jsx` | All dialogs and overlays (blur backdrop + slide animation) |
| `Checkbox` | `Checkbox.jsx` | Controlled checkboxes |
| `UsersTable` | `UsersTable.jsx` | Generic sortable data table |
| `PageActions` | `PageActions.jsx` | Teleports page action buttons to the AppTopBar slot |
| `StatCard` | `StatCard.jsx` | KPI stat tile — icon, label, value, trend. Used by admin, dashboard, map |

### Button

**Variants:** `primary` (blue), `secondary` (gray outline), `danger` (red), `ghost` (transparent), `accent` (orange)  
**Sizes:** `sm`, `md`, `lg`  
**Props:** `isLoading` (shows spinner + disables), `disabled`, all standard button attrs

### Modal

Fixed overlay with backdrop blur. No portal — renders in place.  
**Sizes:** `md`, `lg`, `full`  
**Escape key** closes the modal. Entry: fade + scale animation.  
**Compound subcomponents:** `Modal.Header`, `Modal.Content`, `Modal.Footer`, `Modal.CloseButton`

### PageHeader

`src/components/layout/PageHeader.jsx` — standard page title block used by most feature pages.

**Props:** `title`, `description`, `icon` (FontAwesome name), `actions` (React node)

Uses `text-safe-text-primary` for the title and `text-safe-text-muted` for the description — both adaptive. Never hardcode `text-white` inside this component.

### State Requirements

Every interactive component must have: **default · hover · focus · active · disabled · loading** states. Never ship with half.

---

## Motion

- Duration: 150–250ms on most transitions. `200ms` is the default.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-quart, already in `index.css` animations).
- State-conveying only: transitions, loading spinners, live-status pulses. No decorative motion.
- `prefers-reduced-motion`: the `index.css` guard at line 114 already covers all `animate-*` utilities.

Animation utilities from `src/index.css`:

| Utility | Effect | Used in |
|---------|--------|---------|
| `animate-fadeIn` | opacity 0→1 | Modal overlay |
| `animate-scaleIn` | scale 0.95→1 + fade | Modal panel |
| `animate-slideUp` | translateY 20px→0 + fade | — |
| `animate-slideIn` | translateX -20px→0 + fade | — |
| `animate-pulse-glow` | box-shadow pulse | — |
| `stagger-1` … `stagger-4` | animation-delay helpers | Staggered list entries |

---

## Map Tiles

Map tile behavior differs between map surfaces:

| Surface | Tile behavior |
|---------|--------------|
| **Road Observer** (`MapView.jsx`) | Adapts to theme via `src/hooks/useMapStyle.js` — dark mode → CARTO `dark_all`, light mode → CARTO `rastertiles/voyager` |
| **Emergency Dispatcher** (`DispatchMap.jsx`) | CARTO Dark Matter at all times — the ops console is always dark regardless of system theme |

The Road Observer is the only map surface with a visible "dark island" in light mode. This is intentional: the map content (road network, node markers) reads better on dark tiles under daylight glare.

---

## Sanctioned Exceptions

**MapLibre GL `paint` properties and inline SVG fills** cannot accept Tailwind classes. These files are exempt from the "tokens only" rule but must be annotated with the `safe-*` equivalent:

```js
'circle-color': '#ef4444',  // safe-danger
'line-color':   '#5a96ff',  // safe-blue-light
'fill-color':   '#22c55e',  // safe-green
```

Exempt files: `ConsoleMap.jsx`, `DispatchMap.jsx`, `MapView.jsx`, `CaseMarker.jsx`, `StationMarker.jsx`, `UnitMarker.jsx`, `PolygonOverlay.jsx`.

---

## Dark Mode

Theme is toggled via the sidebar button. Implemented via:
- `src/contexts/ThemeContext.jsx` — persists `safespace-theme` in localStorage, toggles `.dark` class on `<html>`.
- `tailwind.config.js` — `darkMode: 'class'`.
- All adaptive tokens resolve via `rgb(var(--color-*) / alpha)` in `tailwind.config.js`.

**Checklist before every PR:**
- [ ] Every new surface uses `safe-*` tokens (not raw hex or Tailwind palette).
- [ ] Tested visually in both light and dark mode.
- [ ] No `bg-white`, `text-gray-900`, `text-gray-400` in component code.
- [ ] Contrast ratio checked for new text/background combinations.

---

## Responsive Layout

### Target Viewports

| Name | Width | Context |
|------|-------|---------|
| Laptop | 1366px | Minimum tested; most field operations |
| Desktop | 1920px | Primary ops-room context; more space for panels |

The sidebar is always 74px wide (`flex-shrink-0`). Available content width:
- Laptop: 1366 − 74 = **1292px**
- Desktop: 1920 − 74 = **1846px**

### Shell Layout

```
┌──────────────────────────────────────────────┐
│ AppTopBar (h-16 = 64px, flex-shrink-0)       │
├────┬─────────────────────────────────────────┤
│    │                                         │
│ S  │   <Outlet /> — page content             │
│ i  │   flex-1 overflow-auto                  │
│ d  │                                         │
│ e  │                                         │
│ b  │                                         │
│ a  │                                         │
│ r  │                                         │
│    │                                         │
└────┴─────────────────────────────────────────┘
74px    remaining width (flex-1)
```

`AppLayout` class: `flex h-screen bg-safe-dark`

### Top Bar

- Height: **`h-16`** (64px) — fixed, `flex-shrink-0`.
- Padding: **`px-6`** horizontal.
- Left: title (+ optional section breadcrumb) — truncates with `truncate` on narrow viewports.
- Right: actions slot (page-specific via `PageActions`) + notifications bell.

### Card Grids

Prefer adaptive grids over fixed breakpoint columns:

```jsx
// Self-adapting: fills columns down to 280px min before wrapping
<div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
```

For explicit column counts:

| Layout | Laptop | Desktop | Tailwind |
|--------|--------|---------|---------|
| 4-col KPI tiles | 2 cols | 4 cols | `grid-cols-2 xl:grid-cols-4` |
| 3-col KPI tiles | 3 cols | 3 cols | `grid-cols-1 sm:grid-cols-3` |
| 2-col panels | 1 col | 2 cols | `grid-cols-1 lg:grid-cols-2` |
| Single content | full width | capped at ~1000px | `max-w-4xl` |

### Panels and Drawers

| Panel type | Min width | Max / typical | Notes |
|-----------|----------|---------------|-------|
| Side queue / list | 260px | 320px | Dispatcher queue, node list |
| Detail panel | 360px | 480px | Case detail, node detail |
| Floating panel | — | 420px `shadow-xl` | Notification panel, dropdowns |
| Full-screen modal | — | `max-w-5xl` (80rem) | Incident dialog |

### Tables

Tables can run at full content width (up to ~120ch). Use `overflow-x-auto` on the wrapper when table may exceed viewport:

```jsx
<div className="overflow-x-auto">
  <table className="w-full">...</table>
</div>
```

Minimum column width: 80px. Truncate long text with `truncate max-w-[200px]` on cell content.

### Scroll Containers

Pattern for a flex-column scroll container (avoids the common "flex child doesn't shrink" bug):

```jsx
<div className="flex flex-col min-h-0 flex-1">
  <div className="flex-1 overflow-y-auto">
    {/* scrollable content */}
  </div>
</div>
```

The `min-h-0` on the parent is critical — without it, flex children expand past the container in column direction.

**Do NOT use `scrollbar-none`** — the Tailwind scrollbar plugin is not installed. The class silently does nothing. If you need to hide a scrollbar, add a CSS rule directly:

```css
.my-container::-webkit-scrollbar { display: none; }
.my-container { scrollbar-width: none; }
```

Global scrollbar styling (thin, adaptive, `src/index.css:162-199`) applies everywhere. Do not override it.

### z-Index Scale

Use only these named levels:

| Level | z-index | Use |
|-------|---------|-----|
| `z-10` | 10 | Sticky headers, floating map overlays |
| `z-20` | 20 | Dropdown menus |
| `z-30` | 30 | Sticky nav, command bars |
| `z-40` | 40 | Modal backdrops |
| `z-50` | 50 | Modals, dialogs, toasts |

Never use arbitrary values like `z-[999]` or `z-[9999]`.

### Dispatcher Console Layout

The dispatch console has its own fixed 3-column layout within the content area:

```
┌─────────────────────────────────────────────────┐
│ CommandBar (status strip, flex-shrink-0)         │
├──────────────┬──────────────┬────────────────────┤
│ QueuePanel   │  ConsoleMap  │  UnitsRosterPanel  │
│ ~320px       │  flex-1      │  ~340px            │
│ overflow-y   │              │  overflow-y        │
└──────────────┴──────────────┴────────────────────┘
```

At laptop width (1292px available): 320 + map + 340 = map gets ~632px.  
At desktop (1846px): map gets ~1186px.

The CommandBar is a live-status strip (dispatcher name, live indicator, active/available counts, clock) that sits between AppTopBar and the 3-column layout.
