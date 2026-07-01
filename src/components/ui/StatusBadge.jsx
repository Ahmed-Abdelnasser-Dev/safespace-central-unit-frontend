/**
 * StatusBadge — operational status pill with a colored dot.
 *
 * Use for node status, unit status, camera status, connection health —
 * anything where an "is it up or down?" answer is needed at a glance.
 *
 * Status values: online | offline | warning | unknown | active | inactive | error
 *
 * Custom: pass status="custom" + dotColor + textColor for one-off cases.
 *
 * Works on both light and dark surfaces.
 */
const STATUS_STYLES = {
  online:   { dot: 'bg-safe-success', text: 'text-safe-success',      bg: 'bg-safe-success/10' },
  offline:  { dot: 'bg-safe-danger',  text: 'text-safe-danger',       bg: 'bg-safe-danger/10'  },
  error:    { dot: 'bg-safe-danger',  text: 'text-safe-danger',       bg: 'bg-safe-danger/10'  },
  warning:  { dot: 'bg-safe-orange',  text: 'text-safe-orange',       bg: 'bg-safe-orange/10'  },
  active:   { dot: 'bg-safe-blue',    text: 'text-safe-blue',         bg: 'bg-safe-blue/10'    },
  inactive: { dot: 'bg-safe-text-muted', text: 'text-safe-text-muted', bg: 'bg-safe-gray-light/60' },
  unknown:  { dot: 'bg-safe-text-muted', text: 'text-safe-text-muted', bg: 'bg-safe-gray-light/60' },
};

function StatusBadge({ status = 'unknown', label, className = '', pulse = false }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.unknown;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} ${className}`}
    >
      {pulse && (status === 'online' || status === 'active') ? (
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping motion-reduce:animate-none ${style.dot}`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${style.dot}`} />
        </span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
      )}
      {label ?? status}
    </span>
  );
}

export default StatusBadge;
