import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Global search input with adaptive dark/light styling.
 * Single source of truth for all search fields across the app.
 */
function SearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  className = '',
  inputClassName = '',
  width,
  ...rest
}) {
  return (
    <div className={`relative ${className}`} style={width ? { width } : undefined}>
      <FontAwesomeIcon
        icon="magnifying-glass"
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-safe-text-muted text-sm pointer-events-none"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-safe-border bg-safe-dark text-sm text-safe-text-primary placeholder:text-safe-text-muted focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/20 focus:border-safe-blue-btn transition-colors ${inputClassName}`}
        {...rest}
      />
    </div>
  );
}

export default SearchInput;
