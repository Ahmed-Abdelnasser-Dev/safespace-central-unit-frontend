/**
 * SafeSpace Design System Tokens
 *
 * This file provides JS-accessible aliases for the design tokens defined in:
 *   - tailwind.config.js  (Tailwind class names, safe-* tokens)
 *   - src/index.css       (CSS custom properties for theme-adaptive surfaces)
 *   - docs/design-system.md (full documentation + contrast ratios)
 *
 * Use the safe-* Tailwind classes in JSX. Import from here when you need
 * class-string constants in component logic (e.g. dynamic class maps).
 */

// -- Spacing (raw values, matches Tailwind defaults) --------------------------
export const spacing = {
  xs: '0.25rem',   // 4px  — gap-1
  sm: '0.5rem',    // 8px  — gap-2
  md: '1rem',      // 16px — gap-4
  lg: '1.5rem',    // 24px — gap-6
  xl: '2rem',      // 32px — gap-8
  '2xl': '3rem',   // 48px — gap-12
};

// -- Typography (Tailwind class strings) --------------------------------------
// Fixed rem scale — no fluid clamp() in product UI. See docs/design-system.md.
export const typography = {
  display:  'text-3xl font-bold font-display',
  h1:       'text-2xl font-semibold font-display',
  h2:       'text-xl font-semibold font-display',
  h3:       'text-lg font-medium font-display',
  subtitle: 'text-sm font-medium',
  body:     'text-sm',
  caption:  'text-xs text-safe-text-muted',
  tiny:     'text-xs tracking-wide',  // use sparingly — only for truly secondary meta
  mono:     'font-mono tabular-nums text-sm',
};

// -- Radii (Tailwind class strings) ------------------------------------------
export const radii = {
  sm:      'rounded-md',   // 6px — form controls, buttons
  md:      'rounded-lg',   // 8px — buttons, inputs, badges
  lg:      'rounded-xl',   // 16px — cards, panels
  xl:      'rounded-2xl',  // 24px — modals, floating panels
  full:    'rounded-full',
  // Semantic aliases
  card:    'rounded-xl',   // standard card radius
  modal:   'rounded-2xl',  // modal / dialog radius
  control: 'rounded-lg',   // button / input radius
};

// -- Shadows (Tailwind class strings) ----------------------------------------
export const shadows = {
  card: 'shadow-card',  // 0 8px 24px -2px rgba(0,0,0,0.08) — standard card elevation
  sm:   'shadow-sm',    // subtle
  lg:   'shadow-lg',    // modal emphasis, hover state
  xl:   'shadow-xl',    // floating panels
};

// -- Layout helpers (Tailwind class strings) ----------------------------------
export const layout = {
  container:   'max-w-7xl mx-auto px-6',
  pageWrapper: 'flex-1 p-6 overflow-auto',
  // Standard card base — use Card component whenever possible
  cardBase:    'bg-safe-sidebar border border-safe-border rounded-xl shadow-card',
  // Inner surface (nested panels, secondary cards)
  innerSurface: 'bg-safe-gray border border-safe-border rounded-xl',
};
