import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Reusable password input field with show/hide toggle
 */
export default function PasswordInput({
  label,
  value,
  onChange,
  error,
  placeholder,
  showPassword,
  onToggleShow,
}) {
  return (
    <div>
      <label className="text-xs font-medium text-safe-text-dark block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 pr-10 text-sm rounded-lg border ${
            error ? 'border-red-500' : 'border-safe-border'
          } focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/20`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-safe-text-gray hover:text-safe-text-dark"
        >
          <FontAwesomeIcon icon={showPassword ? 'eye-slash' : 'eye'} className="text-sm" />
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
