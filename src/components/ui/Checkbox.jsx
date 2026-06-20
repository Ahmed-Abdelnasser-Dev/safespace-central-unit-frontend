/**
 * Controlled Checkbox component.
 * @param {object} props
 * @param {boolean} props.checked
 * @param {function} props.onChange
 */
function Checkbox({ checked, onChange, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-white text-xs font-bold transition-all ${checked ? 'bg-safe-success border-safe-success shadow-sm scale-105' : 'bg-white border-safe-border hover:border-safe-text-gray/40'} ${className}`}
      aria-pressed={checked}
    >
      {checked ? '✓' : ''}
    </button>
  );
}

export default Checkbox;
