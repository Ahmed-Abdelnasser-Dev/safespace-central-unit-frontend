# Safe Space Design System

This is the **canonical source of truth** for all design decisions in the Safe Space central-unit dashboard. All other design references (`DESIGN.md`, `docs/design.md`, `src/designSystem.js`) defer to this document.

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
- **Never** use raw hex values in JSX/TSX — use `safe-*` tokens (MapLibre paint exception: see below).
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

**Font families (already loaded in `src/index.css` via Google Fonts):**
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

### State Requirements

Every interactive component must have: **default · hover · focus · active · disabled · loading** states. Never ship with half.

---

## Motion

- Duration: 150–250ms on most transitions. `200ms` is the default.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-quart, already in `index.css` animations).
- State-conveying only: transitions, loading spinners, live-status pulses. No decorative motion.
- `prefers-reduced-motion`: the `index.css` guard at line 114 already covers all `animate-*` utilities.

Reuse existing utilities from `src/index.css`:
```
animate-fadeIn    animate-slideUp    animate-slideIn
animate-scaleIn   animate-pulse-glow
stagger-1 through stagger-4
```

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
