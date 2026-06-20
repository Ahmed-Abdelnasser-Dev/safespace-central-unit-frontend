import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getCaseStatusStyle, getCaseTypeLabel, timeSince } from '../utils/caseFormatters';

const SEVERITY_DOT = {
  HIGH:   { dot: 'bg-safe-danger',  border: 'border-safe-danger/35' },
  MEDIUM: { dot: 'bg-safe-accent',  border: 'border-safe-accent/25' },
  LOW:    { dot: 'bg-safe-info',    border: 'border-safe-gray-light' },
};

// Status mini-pill color map
const STATUS_CHIP = {
  info:    'bg-safe-info/12 text-safe-info',
  accent:  'bg-safe-accent/12 text-safe-accent',
  danger:  'bg-safe-danger/12 text-safe-danger',
  success: 'bg-safe-success/12 text-safe-success',
  neutral: 'bg-safe-gray-light/30 text-safe-text-muted/70',
};

function CaseCard({ caseRecord, onOpen, suppressQueuedBadge: _suppressQueuedBadge = false }) {
  const isSos = caseRecord.caseType === 'sos';
  const statusStyle = getCaseStatusStyle(caseRecord.status);
  const dispatchedCount = caseRecord.assignmentIds.length;

  // Show status pill only for non-queued states — queued is implied in the queue context
  const showStatusBadge = caseRecord.status !== 'queued';

  const victimLabel = isSos
    ? (caseRecord.victim?.fullName ?? 'Unknown Caller')
    : (caseRecord.nodeLabel ?? 'Node Incident');
  const secondaryLabel = isSos
    ? (caseRecord.victim?.phone ?? 'No phone on file')
    : [
        caseRecord.confidence != null ? `${Math.round(caseRecord.confidence * 100)}% confidence` : null,
        caseRecord.affectedLanes?.length ? `Lanes ${caseRecord.affectedLanes.join(', ')}` : null,
      ].filter(Boolean).join(' · ') || 'Road incident';

  const typeLabel = getCaseTypeLabel(caseRecord);
  const sev = SEVERITY_DOT[caseRecord.severity] ?? { dot: 'bg-safe-text-muted/40', border: 'border-safe-gray-light' };
  const borderClass = caseRecord.isUnread ? 'border-safe-danger/45' : sev.border;

  return (
    <button
      type="button"
      onClick={() => onOpen(caseRecord)}
      aria-label={`Open case: ${victimLabel}, ${caseRecord.severity} ${caseRecord.caseType}`}
      className={`w-full text-left bg-safe-gray rounded-xl border p-3.5 transition-all duration-200
        hover:border-safe-blue/40 hover:bg-safe-gray-light/15
        focus:outline-none focus-visible:ring-2 focus-visible:ring-safe-blue/50
        ${borderClass}`}
    >
      {/* Row 1: type + status pill + time */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {caseRecord.isUnread && (
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-safe-danger animate-pulse motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-safe-danger" />
            </span>
          )}
          {/* Severity dot — single color signal per card */}
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sev.dot}`}
            aria-label={`Severity: ${caseRecord.severity}`}
          />
          <span className="text-[10px] font-semibold text-safe-text-muted/75 uppercase tracking-wider truncate">
            {typeLabel}
          </span>
          {showStatusBadge && (
            <span className={`text-[10px] font-medium px-1.5 py-px rounded-md flex-shrink-0 ${STATUS_CHIP[statusStyle.variant] ?? STATUS_CHIP.neutral}`}>
              {statusStyle.label}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-safe-text-muted/55 whitespace-nowrap flex-shrink-0">
          {timeSince(caseRecord.receivedAt)}
        </span>
      </div>

      {/* Row 2: hero identity — the primary scan anchor */}
      <p className="text-sm font-semibold text-safe-text-primary truncate leading-snug mb-0.5">
        {victimLabel}
      </p>

      {/* Row 3: secondary info */}
      <p className="text-xs text-safe-text-muted truncate mb-2.5">
        {secondaryLabel}
      </p>

      {/* Row 4: location metadata + dispatch count */}
      <div className="flex items-center gap-1">
        <FontAwesomeIcon icon="location-dot" className="text-[9px] text-safe-text-muted/35 flex-shrink-0" />
        <span className="text-[10px] font-mono text-safe-text-muted/50 truncate">
          {caseRecord.latitude.toFixed(4)}° N, {caseRecord.longitude.toFixed(4)}° E
        </span>
        {dispatchedCount > 0 && (
          <>
            <span className="text-safe-text-muted/25 flex-shrink-0 mx-0.5">·</span>
            <span className="text-[10px] font-medium text-safe-success/70 whitespace-nowrap flex-shrink-0">
              {dispatchedCount} dispatched
            </span>
          </>
        )}
      </div>
    </button>
  );
}

export default CaseCard;
