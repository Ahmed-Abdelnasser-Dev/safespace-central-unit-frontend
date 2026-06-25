/**
 * Badge — categorical / status labels (rectangular pill, uppercase text).
 *
 * Variants: neutral | success | danger | warning | info | purple | teal
 *
 * Works on both light and dark surfaces — uses opacity-based backgrounds
 * so the tint auto-adapts to the surface behind it.
 */
function Badge({ variant = 'neutral', children, className = '' }) {
  const base =
    'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide uppercase';

  const variants = {
    neutral: 'bg-safe-gray-light text-safe-text-muted',
    success: 'bg-safe-success/15 text-safe-success',
    danger:  'bg-safe-danger/15 text-safe-danger',
    warning: 'bg-safe-orange/15 text-safe-orange',
    info:    'bg-safe-info/15 text-safe-info',
    purple:  'bg-safe-purple/15 text-safe-purple',
    teal:    'bg-safe-teal/15 text-safe-teal',
  };

  return (
    <span className={`${base} ${variants[variant] ?? variants.neutral} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
