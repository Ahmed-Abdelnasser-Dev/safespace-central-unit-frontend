function FormField({ label, value, onChange, type = 'text', min = null, max = null, className = '' }) {
  return (
    <div className={className}>
      <label className="text-safe-text-primary mb-2 block text-xs font-medium tracking-wide">
        {label}
      </label>
      {type === 'number' ? (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={min || 0}
            max={max || 100}
            value={value || 0}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-safe-gray-light rounded-lg appearance-none cursor-pointer accent-safe-blue-btn"
          />
          <span className="text-sm font-bold text-safe-blue whitespace-nowrap">{value}</span>
        </div>
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-safe-gray-light rounded-lg text-sm text-safe-text-primary bg-safe-gray focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/20 transition-all duration-200"
        />
      )}
    </div>
  );
}

export default FormField;
