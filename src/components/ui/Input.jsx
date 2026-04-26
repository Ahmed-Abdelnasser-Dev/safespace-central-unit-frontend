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
  className = '',
  ...rest
}) {
  const base = 'w-full px-4 py-3 rounded-lg border border-safe-border bg-white text-safe-text-dark placeholder:text-safe-text-gray/70 focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/25 disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`${base} ${className}`}
      {...rest}
    />
  );
}

export default Input;
