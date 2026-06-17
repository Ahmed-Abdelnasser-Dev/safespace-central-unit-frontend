/**
 * Global Button component
 * All buttons across the app must use this component to ensure consistency.
 *
 * @param {object} props
 * @param {string} [props.variant] - visual style variant (primary | secondary | danger | ghost | accent)
 * @param {string} [props.size] - size variant (sm | md | lg)
 * @param {string} [props.type] - button type (button | submit | reset)
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.isLoading]
 * @param {function} [props.onClick]
 * @param {React.ReactNode} props.children
 */
function Button({ 
  variant = 'primary', 
  size = 'md', 
  type = 'button', 
  disabled = false, 
  isLoading = false,
  onClick, 
  children, 
  className = '' 
}) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3'
  };
  const variants = {
    primary: 'bg-safe-blue text-white hover:bg-safe-blue-light shadow-sm hover:shadow-lg focus:ring-safe-blue/30 disabled:bg-safe-gray disabled:text-safe-text-gray',
    secondary: 'bg-safe-gray text-white hover:bg-safe-gray-light border border-safe-gray-light focus:ring-safe-blue/30',
    danger: 'bg-safe-danger text-white hover:bg-safe-danger/90 shadow-sm hover:shadow-lg focus:ring-safe-danger/30',
    ghost: 'bg-transparent text-safe-blue hover:bg-safe-blue/10 focus:ring-safe-blue/20',
    accent: 'bg-safe-accent text-white hover:bg-safe-accent/90 shadow-sm hover:shadow-lg focus:ring-safe-accent/30',
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled || isLoading} 
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <span className="animate-spin mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;