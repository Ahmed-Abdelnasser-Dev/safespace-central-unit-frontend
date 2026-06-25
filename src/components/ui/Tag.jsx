/**
 * Tag — lane labels, category chips.
 *
 * Variants:
 *   default — neutral gray, works on both light and dark surfaces
 *   danger  — red tint
 *   success — green tint
 *   info    — blue tint
 *   warning — orange tint
 */
function Tag({ variant = 'default', children, className = '' }) {
  const base = 'px-3 py-1.5 rounded-lg text-xs font-semibold';

  const variants = {
    default: 'bg-safe-gray-light/60 text-safe-text-primary',
    danger:  'bg-safe-danger/12 text-safe-danger',
    success: 'bg-safe-success/12 text-safe-success',
    info:    'bg-safe-info/12 text-safe-info',
    warning: 'bg-safe-orange/12 text-safe-orange',
  };

  return (
    <span className={`${base} ${variants[variant] ?? variants.default} ${className}`}>
      {children}
    </span>
  );
}

export default Tag;
