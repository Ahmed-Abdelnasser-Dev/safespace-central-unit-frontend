/**
 * Controlled Checkbox component.
 * @param {object} props
 * @param {boolean} props.checked
 * @param {function} props.onChange
 */
function Checkbox({ checked, onChange, className = '' }) {
  // Provide a 44x44px minimum interactive area for touch accessibility
  // while keeping the visible checkbox small using an inner span.
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-0.5 rounded-md transition-all ${className}`}
      aria-pressed={checked}
    >
      <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-white text-xs font-bold ${checked ? 'bg-safe-success border-safe-success shadow-sm scale-105' : 'bg-white border-safe-border hover:border-safe-text-gray/40'}`}>
        {checked ? '✓' : ''}
      </span>
    </button>
  );
}

export default Checkbox;
