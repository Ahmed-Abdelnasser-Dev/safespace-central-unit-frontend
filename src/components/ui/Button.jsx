import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Button — all action buttons across the app must use this component.
 *
 * Variants: primary | secondary | danger | ghost | outline
 * Sizes:    sm | md
 *
 * isLoading: shows a spinner and disables the button.
 * icon:      FontAwesome icon name, shown before children (or alone).
 * iconRight: FontAwesome icon name, shown after children.
 */
function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  isLoading = false,
  onClick,
  children,
  className = '',
  icon,
  iconRight,
}) {
  const isDisabled = disabled || isLoading;

  const base =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'text-sm px-3 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
  };

  const variants = {
    primary:
      'bg-safe-blue-btn text-white hover:bg-safe-blue-btn/90 hover:shadow-md active:scale-[0.98] focus:ring-safe-blue-btn/30',
    secondary:
      'bg-safe-sidebar text-safe-text-primary border border-safe-border hover:bg-safe-gray hover:border-safe-text-muted/30 active:scale-[0.98] focus:ring-safe-blue-btn/30',
    danger:
      'bg-safe-danger text-white hover:bg-safe-danger/90 hover:shadow-md active:scale-[0.98] focus:ring-safe-danger/30',
    ghost:
      'bg-transparent text-safe-text-muted hover:bg-safe-gray hover:text-safe-text-primary active:scale-[0.98] focus:ring-safe-blue-btn/20',
    outline:
      'bg-transparent text-safe-blue border border-safe-blue hover:bg-safe-blue/10 active:scale-[0.98] focus:ring-safe-blue/30',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <FontAwesomeIcon icon="spinner" className="animate-spin" />
      ) : icon ? (
        <FontAwesomeIcon icon={icon} />
      ) : null}
      {children}
      {!isLoading && iconRight && <FontAwesomeIcon icon={iconRight} />}
    </button>
  );
}

export default Button;
