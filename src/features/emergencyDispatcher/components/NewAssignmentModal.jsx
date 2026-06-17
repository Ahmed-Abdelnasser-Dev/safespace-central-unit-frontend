import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { getCaseTypeLabel, timeSince } from '../utils/caseFormatters';

const SEVERITY_DOT = {
  HIGH:   'bg-safe-danger',
  MEDIUM: 'bg-safe-accent',
  LOW:    'bg-safe-info',
};

function LiveTimeSince({ receivedAt }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  return <span>{timeSince(receivedAt)}</span>;
}

export default function NewAssignmentModal({ caseRecord, onDismiss }) {
  const navigate = useNavigate();
  const isOpen = !!caseRecord;

  function handleOpen() {
    onDismiss();
    navigate(`/cases/${caseRecord.caseType}/${caseRecord.id}`);
  }

  if (!caseRecord) return null;

  const isSOS = caseRecord.caseType === 'sos';
  const identity = isSOS ? (caseRecord.victim?.fullName ?? 'Unknown Caller') : caseRecord.nodeLabel;
  const typeLabel = getCaseTypeLabel(caseRecord);
  const dot = SEVERITY_DOT[caseRecord.severity] ?? 'bg-safe-text-muted/40';

  return (
    <Modal open={isOpen} onClose={onDismiss} size="md">
      <Modal.Header title="New Assignment" onClose={onDismiss} />
      <Modal.Content>
        <div className="flex flex-col gap-4">
          {/* Alert header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-safe-orange/12 border border-safe-orange/25 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon="triangle-exclamation" className="text-safe-orange text-sm" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">You've been assigned a case</p>
              <p className="text-xs text-safe-text-muted">Respond and begin coordinating immediately.</p>
            </div>
          </div>

          {/* Case summary */}
          <div className="bg-safe-gray rounded-xl border border-white/8 px-4 py-3 space-y-2.5">
            {/* Type row */}
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} aria-hidden="true" />
              <span className="text-[10px] font-semibold text-safe-text-muted/70 uppercase tracking-wider">
                {typeLabel}
              </span>
              <span className="ml-auto font-mono text-[10px] text-safe-text-muted/45">{caseRecord.id}</span>
            </div>

            {/* Identity + time */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{identity}</p>
                {isSOS && caseRecord.victim?.phone && (
                  <p className="text-xs text-safe-text-muted font-mono mt-0.5">{caseRecord.victim.phone}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] font-medium text-safe-text-muted/60 uppercase tracking-wide">Received</p>
                <p className="text-xs font-mono text-white mt-0.5">
                  <LiveTimeSince receivedAt={caseRecord.receivedAt} />
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5">
              <FontAwesomeIcon icon="location-dot" className="text-[9px] text-safe-text-muted/35" />
              <span className="text-[10px] font-mono text-safe-text-muted/55">
                {caseRecord.latitude.toFixed(4)}° N, {caseRecord.longitude.toFixed(4)}° E
              </span>
            </div>
          </div>

          <p className="text-xs text-safe-text-muted/60">
            Open the case to review details and dispatch the appropriate units.
          </p>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Acknowledge
        </Button>
        <Button variant="primary" size="sm" onClick={handleOpen}>
          <FontAwesomeIcon icon="arrow-up-right-from-square" className="mr-1.5" />
          Open Case
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
