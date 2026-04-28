/**
 * Tag component for labels with refined styling.
 * @param {object} props
 * @param {string} props.variant - (default | danger | success | info | accent)
 */
function Tag({ variant = 'default', children, className = '' }) {
  const base = 'inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200';
  const variants = {
    default: 'bg-safe-gray-light/60 text-safe-text-dark hover:bg-safe-gray-light',
    danger: 'bg-safe-danger/12 text-safe-danger hover:bg-safe-danger/20',
    success: 'bg-safe-success/12 text-safe-success hover:bg-safe-success/20',
    info: 'bg-safe-info/12 text-safe-info hover:bg-safe-info/20',
    accent: 'bg-safe-accent/12 text-safe-accent hover:bg-safe-accent/20'
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}

export default Tag;
