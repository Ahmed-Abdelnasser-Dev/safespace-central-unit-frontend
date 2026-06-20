/**
 * Tag component for lane labels etc.
 * @param {object} props
 * @param {string} props.variant - (default | danger)
 */
function Tag({ variant = 'default', children, className = '' }) {
  const base = 'px-3 py-1.5 rounded text-xs font-semibold';
  const variants = {
    default: 'bg-safe-gray-light text-safe-text-dark',
    danger: 'bg-safe-danger/12 text-safe-danger'
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}

export default Tag;
