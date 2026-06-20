import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SeverityBadge from './badges/SeverityBadge';
import { useDispatcherData } from '../hooks/useDispatcherData';
import { getCaseTypeLabel, timeSince } from '../utils/caseFormatters';

function LiveTimeSince({ receivedAt }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  return <span>{timeSince(receivedAt)}</span>;
}

/**
 * NewIncidentDialog
 *
 * Global alert dialog that pops for every connected dispatcher in the
 * dispatcher:global room whenever a case:new socket event arrives.
 * Driven by state.dispatcher.incomingCase — set in dispatcherSlice.caseNew
 * and cleared by dismissIncomingCase or when the case reaches a terminal status.
 *
 * Mount once inside DispatcherLayout so it fires on all dispatcher sub-pages.
 */
export default function NewIncidentDialog() {
  const navigate = useNavigate();
  const { incomingCase, dismissIncomingCase } = useDispatcherData();

  if (!incomingCase) return null;

  const {
    id,
    caseType,
    severity,
    latitude,
    longitude,
    receivedAt,
    // Incident fields
    incidentType,
    confidence,
    affectedLanes,
    nodeLabel,
    // SOS fields
    victim,
  } = incomingCase;

  const typeLabel = getCaseTypeLabel(incomingCase);
  const isSOS = caseType === 'sos';

  function handleDismiss() {
    dismissIncomingCase();
  }

  function handleAssign() {
    dismissIncomingCase();
    navigate(`/cases/${caseType}/${id}`);
  }

  return (
    <Modal open onClose={handleDismiss} size="md">
      <Modal.Header
        title={
          <div className="flex items-center gap-2">
            <SeverityBadge severity={severity} />
            <span className="text-sm font-semibold text-safe-text-primary">{typeLabel}</span>
          </div>
        }
        onClose={handleDismiss}
      />

      <Modal.Content>
        <div className="flex flex-col gap-4">
          {/* Alert header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-safe-danger/12 border border-safe-danger/25 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon="triangle-exclamation" className="text-safe-danger text-sm" />
            </div>
            <div>
              <p className="text-sm font-semibold text-safe-text-primary">New incident in queue</p>
              <p className="text-xs text-safe-text-muted">Review and assign personnel immediately.</p>
            </div>
          </div>

          {/* Case summary card */}
          <div className="bg-safe-gray rounded-xl border border-safe-gray-light px-4 py-3 space-y-2.5">
            {/* Case ID row */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-safe-text-muted/70 uppercase tracking-wider">
                {isSOS ? 'SOS Request' : 'Incident'}
              </span>
              <span className="ml-auto font-mono text-[10px] text-safe-text-muted/45">{id}</span>
            </div>

            {/* Received time */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {isSOS && victim?.fullName && (
                  <p className="text-sm font-semibold text-safe-text-primary truncate">{victim.fullName}</p>
                )}
                {!isSOS && nodeLabel && (
                  <p className="text-sm font-semibold text-safe-text-primary truncate">{nodeLabel}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] font-medium text-safe-text-muted/60 uppercase tracking-wide">Received</p>
                <p className="text-xs font-mono text-safe-text-primary mt-0.5">
                  <LiveTimeSince receivedAt={receivedAt} />
                </p>
              </div>
            </div>

            {/* Location */}
            {latitude != null && longitude != null && (
              <div className="flex items-center gap-1.5">
                <FontAwesomeIcon icon="location-dot" className="text-[9px] text-safe-text-muted/35" />
                <span className="text-[10px] font-mono text-safe-text-muted/55">
                  {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
                </span>
              </div>
            )}

            {/* Incident-specific details */}
            {!isSOS && (
              <div className="pt-1 border-t border-safe-gray-light space-y-1">
                {incidentType && (
                  <p className="text-xs text-safe-text-muted">
                    <span className="text-safe-text-muted/50">Type: </span>
                    {incidentType}
                  </p>
                )}
                {confidence != null && (
                  <p className="text-xs text-safe-text-muted">
                    <span className="text-safe-text-muted/50">AI Confidence: </span>
                    {(confidence * 100).toFixed(1)}%
                  </p>
                )}
                {affectedLanes?.length > 0 && (
                  <p className="text-xs text-safe-text-muted">
                    <span className="text-safe-text-muted/50">Affected lanes: </span>
                    {affectedLanes.map((l) => l.name ?? l.id).join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* SOS-specific details */}
            {isSOS && victim && (
              <div className="pt-1 border-t border-safe-gray-light space-y-1">
                {victim.phone && (
                  <p className="text-xs font-mono text-safe-text-muted">
                    <FontAwesomeIcon icon="phone" className="mr-1.5 text-[10px] text-safe-text-muted/50" />
                    {victim.phone}
                  </p>
                )}
                {victim.nationalId && (
                  <p className="text-xs text-safe-text-muted">
                    <span className="text-safe-text-muted/50">National ID: </span>
                    {victim.nationalId}
                  </p>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-safe-text-muted/60">
            Open the case to review all details and dispatch appropriate units.
          </p>
        </div>
      </Modal.Content>

      <Modal.Footer>
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          Dismiss
        </Button>
        <Button variant="primary" size="sm" onClick={handleAssign}>
          <FontAwesomeIcon icon="arrow-up-right-from-square" className="mr-1.5" />
          Assign Personnel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
