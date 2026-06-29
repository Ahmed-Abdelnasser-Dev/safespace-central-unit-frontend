/**
 * ChartOverlay — loading / error / empty state overlay for chart panels.
 *
 * Props:
 *   status  {'loading'|'error'|'empty'|'ok'}
 *   height  {string}  e.g. 'h-56'
 */

export default function ChartOverlay({ status, height = 'h-56', emptyText = 'No data for this period' }) {
  if (status === 'ok') return null;
  return (
    <div className={`absolute inset-0 flex items-center justify-center rounded-lg bg-safe-gray/70 ${height}`}>
      {status === 'loading' && (
        <div className="w-5 h-5 rounded-full border-2 border-safe-blue-btn border-t-transparent animate-spin" />
      )}
      {status === 'error' && (
        <p className="text-xs text-safe-text-muted">Unable to load chart</p>
      )}
      {status === 'empty' && (
        <p className="text-xs text-safe-text-muted">{emptyText}</p>
      )}
    </div>
  );
}