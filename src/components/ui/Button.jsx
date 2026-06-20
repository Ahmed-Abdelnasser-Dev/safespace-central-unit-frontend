/**
 * Global Button component
 * All buttons across the app must use this component to ensure consistency.
 *
 * @param {object} props
 * @param {string} [props.variant] - visual style variant (primary | secondary | danger | ghost)
 * @param {string} [props.size] - size variant (sm | md)
 * @param {string} [props.type] - button type (button | submit | reset)
 * @param {boolean} [props.disabled]
 * @param {function} [props.onClick]
 * @param {React.ReactNode} props.children
 */
function Button({ variant = 'primary', size = 'md', type = 'button', disabled = false, onClick, children, className = '' }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-6 py-3'
  };
  const variants = {
    primary: 'bg-safe-blue-btn text-white hover:bg-safe-blue-btn/90 hover:shadow-md active:scale-[0.98] focus:ring-safe-blue-btn/30',
    secondary: 'bg-white text-safe-text-dark border border-safe-border hover:bg-safe-bg hover:border-safe-text-gray/30 active:scale-[0.98] focus:ring-safe-blue-btn/30',
    danger: 'bg-safe-danger text-white hover:bg-safe-danger/90 hover:shadow-md active:scale-[0.98] focus:ring-safe-danger/30',
    ghost: 'bg-transparent text-safe-text-gray hover:bg-safe-bg active:scale-[0.98] focus:ring-safe-blue-btn/20'
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export default Button;