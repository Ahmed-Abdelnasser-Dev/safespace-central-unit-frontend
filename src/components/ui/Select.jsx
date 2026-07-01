/**
 * Select — styled native select input
 *
 * Props:
 *   value, onChange, disabled, className, children (option elements)
 *   id — for label association
 *   placeholder — first disabled option text (optional)
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Select({ value, onChange, disabled = false, className = '', id, placeholder, children, ...rest }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={[
          'w-full appearance-none bg-safe-dark border border-safe-border rounded-lg',
          'px-4 py-3 pr-10 text-sm text-safe-text-primary',
          'focus:outline-none focus:border-safe-blue',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors',
          className,
        ].join(' ')}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-safe-text-muted">
        <FontAwesomeIcon icon="chevron-down" className="text-xs" />
      </div>
    </div>
  );
}

export default Select;
