/**
 * Textarea — styled multi-line text input
 *
 * Props: value, onChange, placeholder, disabled, rows, className, id, ...rest
 */
function Textarea({ value, onChange, placeholder, disabled = false, rows = 3, className = '', id, ...rest }) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={[
        'w-full bg-safe-dark border border-safe-border rounded-lg',
        'px-4 py-3 text-sm text-safe-text-primary placeholder-safe-text-muted',
        'focus:outline-none focus:border-safe-blue',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'resize-none transition-colors',
        className,
      ].join(' ')}
      {...rest}
    />
  );
}

export default Textarea;
