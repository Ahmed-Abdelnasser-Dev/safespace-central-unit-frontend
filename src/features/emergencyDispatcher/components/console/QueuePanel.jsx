import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CaseCard from '../CaseCard';
import CaseListTabs from '../CaseListTabs';
import { timeSince } from '../../utils/caseFormatters';

const SEVERITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const ACTIVE_STATUSES = ['queued', 'acknowledged', 'active', 'escalated'];

function sortCases(cases) {
  return [...cases].sort((a, b) => {
    const sev = (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3);
    if (sev !== 0) return sev;
    return Date.parse(b.receivedAt) - Date.parse(a.receivedAt);
  });
}

const SEVERITY_DOT = {
  HIGH: 'bg-safe-danger',
  MEDIUM: 'bg-safe-accent',
  LOW: 'bg-safe-info',
};

function AssignedCard({ caseRecord, onOpen }) {
  const identity = caseRecord.caseType === 'sos'
    ? caseRecord.victim?.fullName ?? 'Unknown'
    : caseRecord.nodeLabel;
  const dot = SEVERITY_DOT[caseRecord.severity] ?? 'bg-safe-text-muted/40';

  return (
    <button
      type="button"
      onClick={() => onOpen(caseRecord)}
      aria-label={`Open assigned case: ${identity}, ${caseRecord.severity} severity`}
      className="w-full text-left bg-safe-blue/8 rounded-lg border border-safe-blue/20 px-3 py-2 transition-all duration-150 hover:bg-safe-blue/14 hover:border-safe-blue/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-safe-blue/50 flex items-center gap-3"
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate">{identity}</p>
        <p className="text-[10px] text-safe-text-muted/60 font-mono mt-0.5">{timeSince(caseRecord.receivedAt)}</p>
      </div>
      <FontAwesomeIcon icon="chevron-right" className="text-safe-text-muted/40 text-xs flex-shrink-0" />
    </button>
  );
}

export default function QueuePanel({
  cases,
  assignedToMe,
  activeTab,
  onTabChange,
  mapHighlightedCaseId,
  keyboardFocusId,
  onMapHighlight,
}) {
  const navigate = useNavigate();
  const highlightedCardRef = useRef(null);

  function openCase(caseRecord) {
    navigate(`/cases/${caseRecord.caseType}/${caseRecord.id}`);
  }

  useEffect(() => {
    if (keyboardFocusId && highlightedCardRef.current) {
      highlightedCardRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [keyboardFocusId]);

  const activeCases = cases.filter((c) => ACTIVE_STATUSES.includes(c.status));
  const tabCases = sortCases(activeCases.filter((c) => c.caseType === activeTab));

  const unreadCounts = {
    sos: activeCases.filter((c) => c.caseType === 'sos' && c.isUnread).length,
    incident: activeCases.filter((c) => c.caseType === 'incident' && c.isUnread).length,
  };

  const activeAssignedToMe = assignedToMe.filter((c) => ACTIVE_STATUSES.includes(c.status));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-safe-dark">
      {/* Assigned-to-me — only shown when assignments exist */}
      {activeAssignedToMe.length > 0 && (
        <div className="flex-shrink-0 border-b border-white/6 bg-safe-blue/5">
          <div className="px-4 py-2 flex items-center gap-2">
            <FontAwesomeIcon icon="user-check" className="text-safe-blue text-xs" />
            <span className="text-xs font-semibold text-safe-blue">Assigned to me</span>
            <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-safe-blue/20 text-safe-blue text-[10px] font-bold">
              {activeAssignedToMe.length}
            </span>
          </div>
          <div className="px-3 pb-3 space-y-1.5">
            {activeAssignedToMe.map((c) => (
              <AssignedCard key={c.id} caseRecord={c} onOpen={openCase} />
            ))}
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex-shrink-0 px-2 border-b border-white/6">
        <CaseListTabs activeTab={activeTab} onChange={onTabChange} unreadCounts={unreadCounts} />
      </div>

      {/* Case list */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-1.5">
        {tabCases.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center px-4">
            <FontAwesomeIcon icon="circle-check" className="text-2xl text-safe-success/35 mb-3" />
            <p className="text-sm font-medium text-safe-text-muted">No active {activeTab === 'sos' ? 'SOS requests' : 'incidents'}</p>
            <p className="text-xs text-safe-text-muted/60 mt-1">New cases will appear here in real time</p>
          </div>
        ) : (
          tabCases.map((c) => {
            const isKbFocused = c.id === keyboardFocusId;
            const isMapHighlighted = c.id === mapHighlightedCaseId;
            return (
              <div
                key={c.id}
                ref={isKbFocused ? highlightedCardRef : undefined}
                className={`relative rounded-xl transition-all duration-150 ${
                  isKbFocused
                    ? 'ring-2 ring-safe-blue/60 ring-offset-1 ring-offset-safe-dark'
                    : isMapHighlighted
                    ? 'ring-1 ring-safe-blue/30'
                    : ''
                }`}
                onMouseEnter={() => onMapHighlight?.(c.id)}
                onMouseLeave={() => onMapHighlight?.(null)}
              >
                <CaseCard caseRecord={c} onOpen={openCase} suppressQueuedBadge />
              </div>
            );
          })
        )}
      </div>

      {/* Closed count footer */}
      {(() => {
        const closedCount = cases.filter(
          (c) => ['resolved', 'false_alarm', 'closed'].includes(c.status) && c.caseType === activeTab
        ).length;
        return closedCount > 0 ? (
          <div className="flex-shrink-0 px-4 py-2 border-t border-white/6">
            <p className="text-[10px] text-safe-text-muted/50 font-mono">
              + {closedCount} resolved / closed
            </p>
          </div>
        ) : null;
      })()}
    </div>
  );
}
