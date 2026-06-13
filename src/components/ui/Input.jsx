/**
 * Global Input component
 * All text inputs across the app should use this component.
 *
 * @param {object} props
 * @param {string} [props.type]
 * @param {string} [props.value]
 * @param {function} [props.onChange]
 * @param {string} [props.placeholder]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
function Input({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  disabled = false,
  error = false,
  className = '',
  ...rest
}) {
  const base = 'w-full px-4 py-3 rounded-lg border transition-all duration-200 bg-white text-safe-text-dark placeholder:text-safe-text-gray/60 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-safe-bg';
  
  const borderClass = error 
    ? 'border-safe-danger focus:ring-safe-danger/25 focus:border-safe-danger' 
    : 'border-safe-border/60 hover:border-safe-border focus:ring-safe-blue/20 focus:border-safe-blue';

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`${base} ${borderClass} ${className}`}
      {...rest}
    />
  );
}

export default Input;
