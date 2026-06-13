# Design System

---

## Color palette — `tailwind.config.js` → `safe-*`

All custom colors are prefixed `safe-`. Use with Tailwind utilities: `bg-safe-blue`, `text-safe-danger`, `border-safe-border`, etc.

| Token | Hex | Purpose |
|-------|-----|---------|
| `safe-dark` | `#0a1119` | Primary dark background |
| `safe-sidebar` | `#121820` | Sidebar background |
| `safe-gray` | `#1a1f2e` | Card/surface background |
| `safe-gray-light` | `#2a3142` | Elevated surface, input backgrounds |
| `safe-bg` | `#f0f4f8` | Light content area background |
| `safe-white` | `#ffffff` | White (foreground content) |
| `safe-blue` | `#3b7cff` | Primary brand blue |
| `safe-blue-light` | `#5a96ff` | Blue hover/lighter variant |
| `safe-blue-btn` | `#2563eb` | Button blue (slightly darker) |
| `safe-accent` | `#ff6b35` | Accent / highlight orange-red |
| `safe-orange` | `#fb923c` | Warning / orange |
| `safe-danger` | `#ef4444` | Error / destructive |
| `safe-red-icon` | `#dc2626` | Icon red (slightly darker than danger) |
| `safe-success` | `#10b981` | Success green (darker, text/badge) |
| `safe-green` | `#22c55e` | Success green (lighter, visual) |
| `safe-info` | `#0ea5e9` | Informational blue |
| `safe-teal` | `#14b8a6` | Teal accent |
| `safe-purple` | `#8b5cf6` | Purple accent |
| `safe-text-dark` | `#0f1419` | Primary text on light backgrounds |
| `safe-text-gray` | `#64748b` | Secondary/muted text |
| `safe-border` | `#e2e8f0` | Border color on light backgrounds |

> ⚠️ `safe-red-icon` exists in `tailwind.config.js` but is **not listed in `src/designSystem.js`** — a minor drift between the two sources.

The app uses a **single fixed dark theme** (navy surfaces). There is no light/dark toggle and no `darkMode` Tailwind config.

---

## Design tokens — `src/designSystem.js`

Token constants that map to Tailwind class strings. Intended as a single source of truth — but UI primitives and feature components hardcode Tailwind classes directly and do not import these. Treat as advisory documentation.

| Group | Contents |
|-------|----------|
| `colors` | 24 keys → `safe-*` suffix strings (e.g. `colors.blue = 'safe-blue'`) |
| `spacing` | xs(4px), sm(8px), md(16px), lg(24px), xl(32px), 2xl(48px) — raw rem values |
| `typography` | `h1`–`h4`, `subtitle`, `body`, `bodySmall`, `caption`, `tiny` (mono), `label` — full Tailwind class strings |
| `radii` | `sm`, `md`, `lg`, `full` — rounded-* class strings |
| `shadows` | `card`, `sm` |
| `layout` | `container`, `pageWrapper`, `cardBase` — utility class strings |

---

## Typography

Fonts loaded from Google Fonts in `src/index.css`:
- `DM Sans` — `font-display` (headings)
- `Poppins` — `font-sans` (body default)
- `Space Mono` — `font-mono` (code/monospace)

`body` defaults to `font-sans` (Poppins). Headings default to `font-display` (DM Sans) via `src/index.css`.

---

## Animations

Custom keyframes and utilities defined in `src/index.css`:

| Utility | Keyframe | Used in |
|---------|----------|---------|
| `animate-fadeIn` | opacity 0→1 | Modal overlay |
| `animate-scaleIn` | scale 0.95→1 + fade | Modal panel |
| `animate-slideUp` | translateY 20px→0 + fade | — |
| `animate-slideIn` | translateX -20px→0 + fade | — |
| `animate-pulse-glow` | box-shadow pulse | — |
| `stagger-1` … `stagger-4` | animation-delay helpers | — |

---

## UI Primitives — `src/components/ui/`

Eight hand-built reusable components. All are default-exported function components.

### Button
**Variants:** `primary` (blue), `secondary` (gray outline), `danger` (red), `ghost` (transparent), `accent` (orange)
**Sizes:** `sm`, `md`, `lg`
**Props:** `isLoading` (shows spinner + disables), `disabled`, all standard button attrs

### Badge
Small pill status label. **Variants:** `neutral`, `success`, `danger`, `info`, `accent`
Uppercase text, `tracking-widest`.

### Card
Surface container. **Variants:** `default` (shadow + subtle border), `elevated` (stronger shadow), `flat` (border only, no shadow)

### Checkbox
Button-based (not native `<input type="checkbox">`). 44×44 px touch target. `aria-pressed` for accessibility. Renders a ✓ glyph when checked.
**Props:** `checked` (controlled), `onChange`, `label`, `disabled`

### Input
Controlled text input. `error` prop toggles `safe-danger` border. Spreads remaining props to `<input>`.

### Modal
Fixed overlay with backdrop blur. No portal — renders in place.
**Sizes:** `md`, `lg`, `full`
**Escape key** closes the modal. Entry: fade + scale animation.
**Compound subcomponents:** `Modal.Header`, `Modal.Content`, `Modal.Footer`, `Modal.CloseButton`

### Tag
Label chip, similar to Badge but uses `rounded-lg` (vs `rounded-full` for Badge).
**Variants:** `default`, `danger`, `success`, `info`, `accent`

### UsersTable
Config-driven generic table (despite the "Users" name).
**Props:** `columns` (def with `key`, `label`, `sortable`, `renderCell`), `data`, `onRowClick`
Supports client-side sorting with chevron indicators. Handles nested sort keys (`role`, `status`, `lastActive`, `created`, `name`). Empty-state row with inbox icon.

---

## Styling conventions

- **Always use `safe-*` tokens** — no raw hex values in JSX.
- **No RTL support** — all layouts are LTR. `index.html` has `lang="en"`, no `dir` attribute.
- **No dark mode toggle** — the app is a fixed dark-themed design.
- Feature-local UI components may exist (e.g. `src/features/nodeMaintainer/components/ui/`) — prefer the shared primitives in `src/components/ui/` for consistency.
- The `designSystem.js` token constants are **not enforced** — components hardcode classes. Consult `tailwind.config.js` as the ground truth for available tokens.
