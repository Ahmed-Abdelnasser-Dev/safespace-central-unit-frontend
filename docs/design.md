# Design System

---

## Theme system

The app supports **light and dark mode** via a CSS custom property token system. `darkMode: 'class'` is set in `tailwind.config.js`. The `ThemeProvider` in `src/contexts/ThemeContext.jsx` toggles a `.dark` class on `<html>` and persists the user's preference to `localStorage` under the key `safespace-theme`.

**Default:** dark mode (falls back to `'dark'` when no value is stored).

---

## Adaptive surface tokens

Six tokens are backed by CSS custom properties defined in `src/index.css`. Their values flip automatically when the `.dark` class is present. These are the only tokens needed for page chrome, cards, panels, and text.

| Token | Light value | Dark value | Purpose |
|-------|------------|------------|---------|
| `safe-dark` | `#f5f7fa` | `#111111` | Primary page canvas |
| `safe-sidebar` | `#ffffff` | `#1a1a1a` | Sidebar, header, card surfaces |
| `safe-gray` | `#edf1f6` | `#242424` | Subtle inner panel, hover bg |
| `safe-gray-light` | `#d1dbe7` | `#333333` | Borders, separators |
| `safe-text-primary` | `#0f1419` | `#ffffff` | Headings and body text |
| `safe-text-muted` | `#475569` | `#8b99b5` | Secondary / descriptive text |

`safe-text-muted` at `#475569` achieves **6.1:1** contrast against a white card (`#ffffff`). WCAG AA requires 4.5:1 for body text and 3:1 for large text — both thresholds are met in light mode.

### CSS variable format

All six tokens use the `rgb(var(--color-*) / <alpha-value>)` format in `tailwind.config.js` so Tailwind's opacity modifier syntax works: `bg-safe-dark/50`, `text-safe-text-muted/80`, etc.

```css
/* src/index.css */
:root {
  --color-safe-dark:       245 247 250;   /* #f5f7fa  */
  --color-safe-sidebar:    255 255 255;   /* #ffffff  */
  --color-safe-gray:       237 241 246;   /* #edf1f6  */
  --color-safe-gray-light: 209 219 231;   /* #d1dbe7  */
  --color-text-primary:    15 20 25;      /* #0f1419  */
  --color-text-muted:      71 85 105;     /* #475569 — 6.1:1 on #fff */
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

## Legacy surface tokens (remapped — do not use for new code)

Five legacy tokens that were once static hex values have been remapped in `tailwind.config.js` to point at the same CSS vars as the primary adaptive tokens. Existing components using them become adaptive automatically.

| Legacy token | Maps to | Effectively the same as |
|-------------|---------|------------------------|
| `safe-bg` | `--color-safe-dark` | `safe-dark` |
| `safe-white` | `--color-safe-sidebar` | `safe-sidebar` |
| `safe-text-dark` | `--color-text-primary` | `safe-text-primary` |
| `safe-text-gray` | `--color-text-muted` | `safe-text-muted` |
| `safe-border` | `--color-safe-gray-light` | `safe-gray-light` |

**For new code, use the primary adaptive tokens** (`safe-dark`, `safe-text-primary`, etc.), not the legacy aliases.

---

## Static semantic / brand tokens

These tokens are fixed hex values — they do not change between light and dark mode.

| Token | Hex | Purpose |
|-------|-----|---------|
| `safe-blue` | `#3b7cff` | Primary brand blue |
| `safe-blue-light` | `#5a96ff` | Blue hover/lighter variant |
| `safe-blue-btn` | `#2563eb` | Button blue (slightly darker) |
| `safe-accent` | `#ff6b35` | Accent / highlight orange-red |
| `safe-orange` | `#fb923c` | Warning / orange |
| `safe-danger` | `#ef4444` | Error / destructive red |
| `safe-red-icon` | `#dc2626` | Icon red (slightly darker than danger) |
| `safe-success` | `#10b981` | Success green (text/badge) |
| `safe-green` | `#22c55e` | Success green (visual/icon) |
| `safe-info` | `#0ea5e9` | Informational blue |
| `safe-teal` | `#14b8a6` | Teal accent |
| `safe-purple` | `#8b5cf6` | Purple accent |

---

## Tonal layering rules

**Dark mode** — depth through neutral gray steps, no shadows:
`safe-dark (#111)` → `safe-sidebar (#1a1a1a)` → `safe-gray (#242424)` → `safe-gray-light (#333)` elevated.

**Light mode** — depth through subtle borders and background tints:
`safe-dark (#f5f7fa)` → `safe-sidebar (#fff)` → `safe-gray (#edf1f6)` → `safe-gray-light (#d1dbe7)` borders.

**Border rule:** always use `border-safe-gray-light` (solid adaptive token). Never use `border-white/N` alpha-white tokens inside cards — they render inconsistently across surface backgrounds.

**Hover tints (dark mode):** `bg-safe-gray/40` for subtle hover, `bg-safe-gray-light/30` for icon boxes. Do not use `bg-white/N`.

---

## WCAG AA contrast rules

| Context | Minimum ratio | Token meeting it |
|---------|--------------|-----------------|
| Body text on card surface | 4.5:1 | `safe-text-primary` (21:1 in both modes) |
| Muted / secondary text | 4.5:1 | `safe-text-muted` (6.1:1 light, ~5.2:1 dark) |
| Large text (≥18px or bold ≥14px) | 3:1 | All `safe-text-*` tokens |
| Icon on surface | 3:1 | `safe-text-muted` |

**Never use raw gray values** (`text-gray-400`, `text-slate-500`, etc.) for text. Always use `text-safe-text-primary` or `text-safe-text-muted` — these are the only text tokens that have verified contrast in both light and dark modes.

---

## Map tile rule

Both the Emergency Dispatcher and Road Observer maps use **CARTO Dark Matter** tiles at all times. The map is the one "dark island" in the road observer light-mode layout — tile style does not flip with the theme.

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

## PageHeader component

`src/components/layout/PageHeader.jsx` is the standard page title block used by most feature pages.

**Props:** `title`, `description`, `icon` (FontAwesome name), `actions` (React node)

Uses `text-safe-text-primary` for the title and `text-safe-text-muted` for the description — both adaptive. Never hardcode `text-white` inside this component.

---

## Styling conventions

- **Always use `safe-*` tokens** — no raw hex values or Tailwind gray-N/slate-N classes in JSX.
- **For page canvas:** `bg-safe-dark` (adapts to `#f5f7fa` light / `#111111` dark)
- **For card/panel surfaces:** `bg-safe-sidebar` (adapts to `#ffffff` / `#1a1a1a`)
- **For subtle inner panels:** `bg-safe-gray` (adapts to `#edf1f6` / `#242424`)
- **For borders:** `border-safe-gray-light` (adapts to `#d1dbe7` / `#333333`)
- **For primary text:** `text-safe-text-primary` — never `text-white` or `text-black`
- **For secondary text:** `text-safe-text-muted` — never `text-gray-400` or `text-slate-500`
- **No RTL support** — all layouts are LTR. `index.html` has `lang="en"`, no `dir` attribute.
- Feature-local UI components may exist (e.g. `src/features/nodeMaintainer/components/ui/`) — prefer the shared primitives in `src/components/ui/` for consistency.
- The `designSystem.js` token constants are **not enforced** — components hardcode classes. Consult `tailwind.config.js` as the ground truth for available tokens.
