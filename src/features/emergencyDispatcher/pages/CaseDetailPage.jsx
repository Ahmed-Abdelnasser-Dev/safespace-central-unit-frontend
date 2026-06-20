import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/ui/Button.jsx';
import SeverityBadge from '../components/badges/SeverityBadge.jsx';
import CaseTypeBadge from '../components/badges/CaseTypeBadge.jsx';
import CaseInfoPanel from '../components/CaseInfoPanel.jsx';
import VictimProfilePanel from '../components/VictimProfilePanel.jsx';
import IncidentInfoPanel from '../components/IncidentInfoPanel.jsx';
import DispatchMap from '../components/DispatchMap.jsx';
import NearestUnitsPanel from '../components/NearestUnitsPanel.jsx';
import ActiveAssignmentsPanel from '../components/ActiveAssignmentsPanel.jsx';
import CaseNotesPanel from '../components/CaseNotesPanel.jsx';
import CaseActionsBar from '../components/CaseActionsBar.jsx';
import CaseAttachmentsPanel from '../components/CaseAttachmentsPanel.jsx';
import { useDispatcherData } from '../hooks/useDispatcherData.js';
import { timeSince, getCaseStatusStyle } from '../utils/caseFormatters.js';

function LiveTimer({ receivedAt }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono">{timeSince(receivedAt)}</span>;
}

function CaseDetailPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const {
    cases,
    units,
    assignments,
    selectedUnitIds,
    selectCase,
    selectUnit,
    deselectUnit,
    clearSelectedUnits,
    dispatchUnits,
    cancelAssignment,
    updateAssignmentStatus,
    addNote,
    escalateCase,
    resolveCase,
    markFalseAlarm,
    closeCase,
  } = useDispatcherData();

  const caseRecord = useMemo(
    () => cases.find((c) => c.id === caseId) ?? null,
    [cases, caseId]
  );

  useEffect(() => {
    if (caseId) selectCase(caseId);
  }, [caseId, selectCase]);

  const dispatchedUnitIds = useMemo(
    () => assignments.filter((a) => ['notified', 'en_route', 'on_scene'].includes(a.status)).map((a) => a.unitId),
    [assignments]
  );

  if (!caseRecord) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FontAwesomeIcon icon="circle-xmark" className="text-4xl text-safe-danger/60 mb-4" />
        <p className="text-safe-text-primary font-semibold text-lg mb-1">Case not found</p>
        <p className="text-safe-text-gray text-sm mb-6">
          Case <span className="font-mono">{caseId}</span> does not exist.
        </p>
        <Button variant="ghost" onClick={() => navigate('/cases')}>
          Back to Cases
        </Button>
      </div>
    );
  }

  const isSOSCase = caseRecord.caseType === 'sos';
  const statusStyle = getCaseStatusStyle(caseRecord.status);
  const victimName = isSOSCase ? caseRecord.victim?.fullName : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Compact case header */}
      <div className="px-5 py-3 border-b border-safe-gray-light flex-shrink-0 flex items-center gap-4 bg-safe-sidebar/60">
        <button
          type="button"
          onClick={() => navigate('/cases')}
          aria-label="Back to Dispatch Console"
          className="flex items-center gap-1.5 text-safe-text-muted hover:text-safe-text-primary transition-colors text-sm flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-safe-blue/40 rounded"
        >
          <FontAwesomeIcon icon="arrow-left" className="text-xs" />
          Dispatch
        </button>

        <div className="w-px h-4 bg-safe-border/30 flex-shrink-0" />

        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <SeverityBadge severity={caseRecord.severity} />
          <CaseTypeBadge caseRecord={caseRecord} />
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              statusStyle.variant === 'danger'
                ? 'bg-safe-danger/15 text-safe-danger'
                : statusStyle.variant === 'success'
                ? 'bg-safe-success/15 text-safe-success'
                : statusStyle.variant === 'info'
                ? 'bg-safe-info/15 text-safe-info'
                : 'bg-safe-gray-light/40 text-white/60'
            }`}
          >
            {statusStyle.label}
          </span>
          {victimName && (
            <>
              <span className="text-safe-text-muted/40 flex-shrink-0">·</span>
              <span className="text-sm font-semibold text-safe-text-primary truncate">{victimName}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 text-xs text-safe-text-muted">
          <span>
            <FontAwesomeIcon icon="clock" className="mr-1 opacity-60" />
            <LiveTimer receivedAt={caseRecord.receivedAt} />
          </span>
          <span className="font-mono text-safe-text-muted/55">{caseRecord.id}</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col xl:grid xl:grid-cols-[minmax(300px,360px)_1fr_minmax(320px,380px)]">

        {/* Center / top on mobile: Live Map */}
        <div className="order-1 xl:order-2 h-[300px] xl:h-full xl:border-x xl:border-safe-gray-light">
          <DispatchMap
            caseRecord={caseRecord}
            units={units}
            dispatchedUnitIds={dispatchedUnitIds}
          />
        </div>

        {/* Left Column: Case Info + Profile + Notes */}
        <div className="order-2 xl:order-1 overflow-y-auto xl:border-r xl:border-safe-gray-light p-4 space-y-4">
          <CaseInfoPanel caseRecord={caseRecord} />
          {isSOSCase ? (
            <VictimProfilePanel
              victim={caseRecord.victim}
              medicalProfile={caseRecord.medicalProfile}
              emergencyContacts={caseRecord.emergencyContacts}
              loading={!('notes' in caseRecord)}
            />
          ) : (
            <IncidentInfoPanel caseRecord={caseRecord} />
          )}
          <CaseAttachmentsPanel attachments={caseRecord.attachments} />
          <CaseNotesPanel caseRecord={caseRecord} onAddNote={addNote} />
        </div>

        {/* Right Column: Actions (sticky) + Dispatch + Assignments */}
        <div className="order-3 xl:order-3 xl:flex xl:flex-col xl:overflow-hidden xl:border-l xl:border-safe-gray-light">
          <div className="p-4 border-b border-safe-gray-light flex-shrink-0">
            <CaseActionsBar
              caseRecord={caseRecord}
              onEscalate={escalateCase}
              onResolve={resolveCase}
              onMarkFalseAlarm={markFalseAlarm}
              onClose={closeCase}
              onAddNote={addNote}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <NearestUnitsPanel
              caseRecord={caseRecord}
              units={units}
              selectedUnitIds={selectedUnitIds}
              assignments={assignments}
              onSelectUnit={selectUnit}
              onDeselectUnit={deselectUnit}
              onClearSelectedUnits={clearSelectedUnits}
              onDispatch={dispatchUnits}
            />
            <ActiveAssignmentsPanel
              assignments={assignments}
              units={units}
              onUpdateStatus={updateAssignmentStatus}
              onCancel={cancelAssignment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaseDetailPage;
