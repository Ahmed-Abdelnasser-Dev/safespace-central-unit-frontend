/**
 * SafeSpace Design System Tokens
 * Single source of truth for all design values.
 *
 * Colors: defined as CSS custom properties in src/index.css (:root + .dark)
 * and surfaced as Tailwind tokens in tailwind.config.js.
 * Use the safe-* Tailwind classes directly; don't duplicate color values here.
 */

// -- Spacing (raw values) ---------------------------------------------------
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
};

// -- Typography (Tailwind class strings) ------------------------------------
export const typography = {
  h1: 'text-2xl font-bold',
  h2: 'text-xl font-semibold',
  h3: 'text-lg font-semibold',
  subtitle: 'text-sm font-medium',
  body: 'text-sm',
  caption: 'text-xs text-safe-text-muted',
  tiny: 'text-[11px] tracking-wide',
};

// -- Radii (Tailwind class strings) -----------------------------------------
export const radii = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  full: 'rounded-full',
};

// -- Shadows (Tailwind class strings) ---------------------------------------
export const shadows = {
  card: 'shadow-card',
  sm: 'shadow-sm',
};

// -- Layout helpers (Tailwind class strings) --------------------------------
export const layout = {
  container: 'max-w-7xl mx-auto px-6',
  pageWrapper: 'flex-1 p-6 overflow-auto',
  cardBase: 'bg-safe-gray rounded-xl border border-safe-gray-light p-6',
};
