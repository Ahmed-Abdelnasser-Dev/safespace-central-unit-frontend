/**
 * SafeSpace Design System Tokens
 * Single source of truth for all design values.
 * Aligned with tailwind.config.js color palette.
 */

// -- Colors (Tailwind class suffixes, use with bg-, text-, border-) ----------
export const colors = {
  // Core backgrounds
  dark: 'safe-dark',
  sidebar: 'safe-sidebar',
  gray: 'safe-gray',
  grayLight: 'safe-gray-light',
  bg: 'safe-bg',
  white: 'safe-white',

  // Brand
  blue: 'safe-blue',
  blueLight: 'safe-blue-light',
  blueBtn: 'safe-blue-btn',

  // Semantic
  success: 'safe-success',
  danger: 'safe-danger',
  accent: 'safe-accent',
  orange: 'safe-orange',
  info: 'safe-info',
  green: 'safe-green',
  purple: 'safe-purple',
  teal: 'safe-teal',

  // Text
  textDark: 'safe-text-dark',
  textGray: 'safe-text-gray',

  // Border
  border: 'safe-border',
};

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
  h1: 'font-display text-4xl font-bold tracking-tight',
  h2: 'font-display text-3xl font-bold tracking-tight',
  h3: 'font-display text-2xl font-semibold tracking-tight',
  h4: 'font-display text-xl font-semibold tracking-tight',
  subtitle: 'text-base font-medium tracking-wide',
  body: 'text-sm font-normal',
  bodySmall: 'text-xs font-normal',
  caption: 'text-xs text-safe-text-gray font-medium tracking-wide',
  tiny: 'text-[11px] tracking-widest font-mono',
  label: 'text-sm font-semibold uppercase tracking-wider',
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
