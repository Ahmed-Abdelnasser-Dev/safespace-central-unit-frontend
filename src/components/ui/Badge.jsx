/**
 * Badge component for small status labels.
 * @param {object} props
 * @param {string} props.variant - (neutral | success | danger)
 */
function Badge({ variant = 'neutral', children, className = '' }) {
  const base = 'inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold tracking-wide uppercase';
  const variants = {
    neutral: 'bg-safe-gray-light text-safe-text-gray',
    success: 'bg-safe-success/15 text-safe-success',
    danger: 'bg-safe-danger/15 text-safe-danger'
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}

export default Badge;
