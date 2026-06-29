/**
 * RangePicker — horizontal button group for selecting a named time range.
 *
 * Props:
 *   ranges   {Array<{label, value}>}
 *   value    {string}
 *   onChange {(value: string) => void}
 */

export default function RangePicker({ ranges, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {ranges.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === r.value
              ? 'bg-safe-blue-btn text-white'
              : 'bg-safe-sidebar text-safe-text-muted border border-safe-border hover:text-safe-text-primary'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}