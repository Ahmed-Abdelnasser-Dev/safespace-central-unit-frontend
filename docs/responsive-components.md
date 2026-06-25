# Responsive Components Guide

Design choices that depend on viewport width. All component sizing decisions should be documented here.

---

## Target Viewports

| Name | Width | Context |
|------|-------|---------|
| Laptop | 1366px | Minimum tested; most field operations |
| Desktop | 1920px | Primary ops-room context; more space for panels |

The sidebar is always 74px wide (`flex-shrink-0`). Available content width:
- Laptop: 1366 − 74 = **1292px**
- Desktop: 1920 − 74 = **1846px**

---

## Shell Layout

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

AppLayout class: `flex h-screen bg-safe-dark`

---

## Top Bar

- Height: **`h-16`** (64px) — fixed, `flex-shrink-0`.
- Padding: **`px-6`** horizontal.
- Left: title (+ optional section breadcrumb) — truncates with `truncate` on narrow viewports.
- Right: actions slot (page-specific) + notifications bell.
- Responsive: the title truncates before the right utilities do. The actions slot wraps or hides at very narrow widths if needed.

---

## Card Grids

Prefer adaptive grids over fixed breakpoint columns:

```jsx
// Self-adapting: fills columns down to 280px min before wrapping
<div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
```

For explicit column counts:

| Layout | Laptop | Desktop | Tailwind |
|--------|--------|---------|---------|
| 4-col KPI tiles | 2 cols | 4 cols | `grid-cols-2 xl:grid-cols-4` |
| 3-col KPI tiles | 3 cols (slim) | 3 cols | `grid-cols-1 sm:grid-cols-3` |
| 2-col panels | 1 col | 2 cols | `grid-cols-1 lg:grid-cols-2` |
| Single content | full width | capped at ~1000px | `max-w-4xl` |

---

## Typography

**Type scale is FIXED** — not fluid. No `clamp()` for font sizes in this codebase. Responsive behavior is layout density, not text scaling. All font sizes from `docs/design-system.md` apply at all viewports.

---

## Panels and Drawers

| Panel type | Min width | Max / typical | Notes |
|-----------|----------|---------------|-------|
| Side queue / list | 260px | 320px | Dispatcher queue, node list |
| Detail panel | 360px | 480px | Case detail, node detail |
| Floating panel | — | 420px `shadow-xl` | Notification panel, dropdowns |
| Full-screen modal | — | `max-w-5xl` (80rem) | Incident dialog |

---

## Tables

Tables can run at full content width (up to ~120ch). Use `overflow-x-auto` on the wrapper when table may exceed viewport:

```jsx
<div className="overflow-x-auto">
  <table className="w-full">...</table>
</div>
```

Minimum column width: 80px. Truncate long text with `truncate max-w-[200px]` on cell content.

---

## Scroll Containers

Pattern for a flex-column scroll container (avoids the common "flex child doesn't shrink" bug):

```jsx
<div className="flex flex-col min-h-0 flex-1">
  <div className="flex-1 overflow-y-auto">
    {/* scrollable content */}
  </div>
</div>
```

The `min-h-0` on the parent is critical — without it, flex children can expand past the container in a column direction.

**Do NOT use `scrollbar-none`** — the Tailwind scrollbar plugin is not installed in this project. The class silently does nothing. If you need to hide a scrollbar, add a CSS rule directly:

```css
.my-container::-webkit-scrollbar { display: none; }
.my-container { scrollbar-width: none; }
```

Global scrollbar styling (thin, adaptive, `src/index.css:162-199`) applies everywhere. Do not override it.

---

## Map Views

Maps fill their container (`width: 100%, height: 100%` or `flex-1`). They are always controlled children of a flex container — do not set explicit pixel widths on map wrappers.

Map style switches via `src/hooks/useMapStyle.js` based on theme:
- Dark → CARTO `dark_all` raster tiles
- Light → CARTO `rastertiles/voyager`

Map overlay panels (KPI cards, notification panel, controls) use `absolute` positioning inside the map container and must specify `z-index` explicitly from the semantic scale.

---

## z-Index Scale

Use only these named levels:

| Level | z-index | Use |
|-------|---------|-----|
| `z-10` | 10 | Sticky headers, floating map overlays |
| `z-20` | 20 | Dropdown menus |
| `z-30` | 30 | Sticky nav, command bars |
| `z-40` | 40 | Modal backdrops |
| `z-50` | 50 | Modals, dialogs, toasts |

Never use arbitrary values like `z-[999]` or `z-[9999]`.

---

## Dispatcher Console Layout

The dispatch console has its own fixed 3-column layout within the content area:

```
┌─────────────────────────────────────────────────┐
│ CommandBar (status strip, flex-shrink-0)         │
├──────────────┬──────────────┬────────────────────┤
│ QueuePanel   │  ConsoleMap  │  UnitsRosterPanel  │
│ w-[320px]    │  flex-1      │  w-[340px]         │
│ overflow-y   │              │  overflow-y        │
└──────────────┴──────────────┴────────────────────┘
```

At laptop width (1292px available): 320 + map + 340 = map gets ~632px. Acceptable.
At desktop (1846px): map gets ~1186px. Good.

The CommandBar is a live-status strip (dispatcher name, live indicator, active/available counts, clock) that sits between AppTopBar and the 3-column layout.
