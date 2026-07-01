---
name: Safe Space Central Unit Dashboard
description: The operator control room for an AI highway accident detection and emergency-response system.
colors:
  dark: "#0a1119"
  sidebar: "#121820"
  surface: "#1a1f2e"
  surface-elevated: "#2a3142"
  content-bg: "#f0f4f8"
  white: "#ffffff"
  blue: "#3b7cff"
  blue-light: "#5a96ff"
  blue-btn: "#2563eb"
  accent: "#ff6b35"
  orange: "#fb923c"
  danger: "#ef4444"
  red-icon: "#dc2626"
  success: "#10b981"
  green: "#22c55e"
  info: "#0ea5e9"
  teal: "#14b8a6"
  purple: "#8b5cf6"
  text-dark: "#0f1419"
  text-gray: "#64748b"
  border: "#e2e8f0"
typography:
  display:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Poppins, system-ui, Avenir, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Poppins, system-ui, Avenir, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.1em"
  mono:
    fontFamily: "Space Mono, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "8px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.blue-light}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.blue}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  badge:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text-gray}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  input-default:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Design System: Safe Space Central Unit Dashboard

## 1. Overview

**Creative North Star: "The Control Room"**

A 24/7 highway-operations control room, not a SaaS product. Operators sit in dim
ambient light, attention split across live feeds and this screen, acting on real
emergencies under time pressure. The interface ships in **both dark and light mode**
via a user-toggleable theme (sun/moon button in the sidebar). Every visual decision
answers one question: does this help an operator act correctly, faster? If not, it
doesn't belong.

**Default theme:** dark (preferred for low-light control rooms). The toggle persists
to `localStorage['safespace-theme']`; dark is used when no preference is stored.

This system explicitly rejects the generic SaaS-dashboard look: no gradient
hero-metric blocks, no marketing-style identical card grids, no playful illustration,
no consumer-app gloss, no decorative motion. Confidence comes from clarity and
consistency, not decoration. Urgency lives in the data — a red severity badge, a
pulsing unread indicator — never in the chrome around it.

**Key Characteristics:**
- Dual-theme adaptive surface system (`safe-*` tokens driven by CSS custom properties). A `.dark` class on `<html>` flips all surfaces — no `dark:` Tailwind variants needed in component code.
- One brand blue carries primary actions and selection; all other color is semantic state.
- DM Sans for structure (headings, page titles), Poppins for everything operators read at length, Space Mono for technical/tiny labels.
- Flat by default — shadows are rare and reserved for floating/overlay elements, not ambient decoration.
- Every interactive element ships its hover, focus, active, disabled, and loading state. None are optional.

## 2. Colors

One primary blue and a tight semantic vocabulary for state — not a decorative palette. All neutral surfaces are **adaptive** (CSS custom properties that flip between modes).

### Adaptive Neutral Tokens (the operating canvas)

| Token | Light value | Dark value | Purpose |
|-------|-------------|------------|---------|
| `safe-dark` | `#f5f7fa` | `#111111` | Primary page canvas / body bg |
| `safe-sidebar` | `#ffffff` | `#1a1a1a` | Sidebar, header, card surfaces |
| `safe-gray` | `#edf1f6` | `#242424` | Subtle inner panel, hover bg |
| `safe-gray-light` / `safe-border` | `#d1dbe7` | `#333333` | Borders and separators |
| `safe-text-primary` | `#0f1419` | `#ffffff` | Headings and body text |
| `safe-text-muted` | `#475569` | `#8b99b5` | Secondary / descriptive text |

`safe-text-muted` passes WCAG AA (≥4.5:1) in both modes. Use `text-safe-text-primary` / `text-safe-text-muted` exclusively — never raw gray values (`text-gray-400`, etc.).

**Surface tokens are never text colors.** `text-safe-dark`, `text-safe-gray`, etc. are invisible in light mode. Only `safe-text-primary` and `safe-text-muted` are valid for text.

**`text-white` rule:** keep only on elements whose parent has a *fixed non-adaptive* background (blue/red action buttons, gradient headers, dark video viewfinders, fixed-color alert banners). On any `safe-*` adaptive surface, always use `text-safe-text-primary` or `text-safe-text-muted`.

### Primary
- **Operational Blue** (#3b7cff → `safe-blue`): the one accent. Primary actions, current selection, links, focus rings.
- **Blue Light** (#5a96ff → `safe-blue-light`): hover state for Operational Blue.
- **Blue Button** (#2563eb → `safe-blue-btn`): solid call-to-action buttons.

### State Semantics (the real color vocabulary of this system)
- **Danger / Critical** (#ef4444, icon variant #dc2626): errors, destructive actions, HIGH severity.
- **Warning** (#fb923c): caution, MEDIUM severity.
- **Success** (#10b981 text/badge, #22c55e visual accents): confirmed, completed, available.
- **Info** (#0ea5e9): informational state, LOW severity.
- **Accent** (#ff6b35): a second, rarer highlight — on-scene/in-progress states, secondary emphasis distinct from the primary blue.
- **Teal** (#14b8a6) / **Purple** (#8b5cf6): reserved tertiary accents for data categorization (e.g. distinguishing entity types) — use only when the primary five colors above can't carry the distinction.

### Named Rules
**The One Accent Rule.** Operational Blue marks exactly one thing per screen: the primary action or the current selection. If two elements compete for blue, one is wrong.

**The State, Not Decoration Rule.** Every non-neutral color on screen must map to a real system state (severity, status, error, success). A color with no state behind it is a bug, not a design choice.

## 3. Typography

**Display Font:** DM Sans (with system-ui, sans-serif fallback)
**Body Font:** Poppins (with system-ui, Avenir, sans-serif fallback)
**Label/Mono Font:** Space Mono (with monospace fallback)

**Character:** A geometric grotesque (DM Sans) for structure paired with a rounder,
friendlier humanist sans (Poppins) for reading text — confident headings, approachable
body copy. Space Mono marks anything technical (IDs, coordinates, timestamps) as
distinctly "system-generated" data.

### Hierarchy
- **Display** (700, 1.875rem–2.25rem, 1.2 line-height, -0.02em tracking): page titles in `PageHeader`. Appears once per screen.
- **Headline** (600, 1.5rem, 1.25 line-height): section/card titles, modal headers.
- **Title** (600, 1.25rem, 1.3 line-height): subsection headers, list-item primary text.
- **Body** (400, 0.875rem, 1.6 line-height): the default reading size for nearly everything — labels, descriptions, table cells. Cap prose at 65–75ch.
- **Label** (700, 0.75rem, uppercase, 0.1em tracking): badges, tags, form field labels.
- **Mono** (400, 0.6875rem): timestamps, IDs, coordinates, technical metadata.

### Named Rules
**The One Family Per Role Rule.** DM Sans never carries body text; Poppins never carries a page title. The pairing is fixed, not situational.

## 4. Elevation

Flat by default. The canvas relies on **tonal layering** (page bg → sidebar → card surface → gray panel, each one adaptive step) to convey depth without shadows. Shadows are reserved for elements that visually float above the surface: modals and their backdrop blur.

**Dark mode:** `safe-dark (#111)` → `safe-sidebar (#1a1a1a)` → `safe-gray (#242424)` → `safe-gray-light (#333)` elevated.
**Light mode:** `safe-dark (#f5f7fa)` → `safe-sidebar (#fff)` → `safe-gray (#edf1f6)` → `safe-gray-light (#d1dbe7)` borders.

### Shadow Vocabulary
- **card** (`box-shadow: 0 8px 24px -2px rgba(0,0,0,0.08)`): subtle lift for light-surface cards (modal content, form panels) — not used on the dark canvas.
- **lg** (`box-shadow: 0 12px 32px -4px rgba(0,0,0,0.12)`): hover state for light-surface cards.
- **xl** (`box-shadow: 0 16px 40px -4px rgba(0,0,0,0.15)`): the modal panel itself, floating over the blurred backdrop.

### Named Rules
**The Tonal-Layering Rule.** On the dark canvas, depth comes from a lighter step of navy, never a shadow. Shadows exist only inside light (modal/form) contexts.

## 5. Components

### Buttons
- **Shape:** rounded-lg (8px radius).
- **Primary:** Operational Blue background, white text, `hover:bg-safe-blue-light`, shadow-sm at rest growing to shadow-lg on hover.
- **Secondary:** Card Navy background, white text, Elevated Navy border — used for de-emphasized or "Close"-type actions, including inside light modals (`Modal.CloseButton`).
- **Danger:** Danger red background, white text — destructive actions (Close Case, Cancel Dispatch, Delete).
- **Ghost:** transparent background, Operational Blue text, 10%-opacity blue background on hover — lowest-emphasis actions.
- **Accent:** Accent orange background, white text — reserved for a second emphasis tier distinct from primary blue (rare).
- **All variants:** `active:scale-[0.98]` on press, 50%-opacity + no-cursor when disabled, an inline spinner + "Loading..." label when `isLoading`.

### Badges & Tags
- **Badge:** `rounded-full`, uppercase, bold, widely tracked (0.1em) text at 0.75rem. Tinted background at 15% opacity of its semantic color (e.g. danger badge = `bg-safe-danger/15 text-safe-danger`). Used for short status words (HIGH, ACTIVE, AVAILABLE).
- **Tag:** same color logic as Badge but `rounded-lg` and sentence case, semibold — used where the label is a longer phrase or not a status word.

### Cards / Containers
- **Corner Style:** rounded-xl (16px) for dark-canvas feature cards (`bg-safe-gray` + `border-safe-gray-light`); the shared `Card` primitive (white, rounded-xl, `shadow-card`) is reserved for light/modal contexts, not the dark canvas.
- **Background:** Card Navy (#1a1f2e) on dark canvas; white inside modals.
- **Shadow Strategy:** none on dark canvas (tonal layering only); `shadow-card`/`shadow-lg` inside light contexts.
- **Border:** 1px Elevated Navy on dark cards; `safe-border/50` on light cards.
- **Internal Padding:** 24px (lg) standard.

### Inputs / Fields
- **Style:** white background, `safe-border/60` stroke, rounded-lg, dark ink text. Inputs are a light-surface component even when the surrounding page is dark (they live inside modals/forms).
- **Focus:** border shifts to Operational Blue, 20%-opacity blue ring.
- **Error:** border and ring shift to Danger red.
- **Disabled:** 60% opacity, Paper background.

### Modal
- **Style:** centered light panel (white, rounded-2xl, shadow-xl) over a `bg-black/40` blurred backdrop. No portal — renders in place.
- **Entry:** backdrop fades in (`animate-fadeIn`, 0.3s), panel scales in from 0.95 (`animate-scaleIn`, 0.4s) — both with a slight overshoot easing.
- **Sizes:** `md` (max-w-2xl), `lg` (max-w-4xl, default), `full` (edge-to-edge).
- **Structure:** `Modal.Header` (title + close ✕), `Modal.Content`, `Modal.Footer` (right-aligned action buttons) — always compose these three, never freeform modal content.
- **Dismiss:** Escape key or backdrop click.

### Navigation
- **Style:** fixed 74px icon-only rail (Sidebar Navy), FontAwesome icons, active route highlighted with Blue Button background + white icon. Profile avatar pinned to the bottom, links to `/profile`.
- **States:** default (muted icon), hover (lighten), active (solid blue chip).
- **Role-scoped:** the rail only ever renders the nav items the current role can access — never a disabled/greyed-out item for an inaccessible route.

### Checkbox (signature component)
- **Style:** button-based, not a native checkbox — 44×44px touch target for fast clicking under pressure, renders a ✓ glyph when checked, `bg-safe-success` when active. `aria-pressed` carries the state for assistive tech.

## 6. Do's and Don'ts

### Do:
- **Do** keep the operating canvas on `safe-dark`/`safe-sidebar`/`safe-gray`/`safe-gray-light` tonal steps — depth via layering, not shadow.
- **Do** reserve Operational Blue (#3b7cff) for exactly one primary action or selection per screen.
- **Do** map every non-neutral color to a real state (severity, status, error) — never decorative.
- **Do** ship default, hover, focus, active, disabled, and loading states for every interactive component — half-finished states are not acceptable.
- **Do** use `Modal.Header` / `Modal.Content` / `Modal.Footer` compound structure, with the real `open`/`size` prop API.
- **Do** cap body text at 65–75ch and use Poppins for anything operators read at length.

### Don't:
- **Don't** build a generic SaaS dashboard — no gradient hero-metric blocks, no identical marketing-style card grids, no playful illustration, no consumer-app gloss.
- **Don't** use decorative motion. Motion conveys state change or feedback only; no orchestrated page-load choreography.
- **Don't** apply shadows on the dark canvas as a stand-in for hierarchy — use a lighter navy step instead.
- **Don't** use raw hex values in JSX — always the `safe-*` Tailwind token.
- **Don't** use a side-stripe (`border-left`/`border-right`) as a colored accent on cards or list rows — use a full border, background tint, or a leading icon/number instead.
- **Don't** introduce a second accent color competing with Operational Blue for primary-action attention.
