/**
 * Controlled Checkbox component.
 * @param {object} props
 * @param {boolean} props.checked
 * @param {function} props.onChange
 * @param {'light'|'dark'} props.surface - 'dark' uses tonal unchecked box for dark card backgrounds
 */
function Checkbox({ checked, onChange, className = '', surface = 'light' }) {
  const uncheckedStyle = surface === 'dark'
    ? 'bg-safe-gray-light border-safe-border hover:border-safe-blue/60'
    : 'bg-white border-safe-border hover:border-safe-text-gray/40';

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-0.5 rounded-md transition-all ${className}`}
      aria-pressed={checked}
    >
      <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-white text-xs font-bold transition-all ${checked ? 'bg-safe-success border-safe-success scale-105' : uncheckedStyle}`}>
        {checked ? '✓' : ''}
      </span>
    </button>
  );
}

export default Checkbox;
