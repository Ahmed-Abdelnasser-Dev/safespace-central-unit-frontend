/**
 * Badge component for small status labels with refined styling.
 * @param {object} props
 * @param {string} props.variant - (neutral | success | danger | info | accent)
 */
function Badge({ variant = 'neutral', children, className = '' }) {
  const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-200';
  const variants = {
    neutral: 'bg-safe-gray-light/40 text-safe-text-gray hover:bg-safe-gray-light/60',
    success: 'bg-safe-success/15 text-safe-success hover:bg-safe-success/25',
    danger: 'bg-safe-danger/15 text-safe-danger hover:bg-safe-danger/25',
    info: 'bg-safe-info/15 text-safe-info hover:bg-safe-info/25',
    accent: 'bg-safe-accent/15 text-safe-accent hover:bg-safe-accent/25'
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}

export default Badge;
