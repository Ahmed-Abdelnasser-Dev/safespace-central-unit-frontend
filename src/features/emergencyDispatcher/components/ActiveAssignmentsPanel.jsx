import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/ui/Button.jsx';
import { getAssignmentStatusStyle, getUnitTypeIcon } from '../utils/caseFormatters.js';

const NEXT_STATUS_LABEL = {
  notified: 'Mark En Route',
  en_route: 'Mark On Scene',
  on_scene: 'Mark Completed',
};

const NEXT_STATUS = {
  notified: 'en_route',
  en_route: 'on_scene',
  on_scene: 'completed',
};

function AssignmentRow({ assignment, unit, onUpdateStatus, onCancel }) {
  const { variant, label } = getAssignmentStatusStyle(assignment.status);
  const canAdvance = Boolean(NEXT_STATUS_LABEL[assignment.status]);
  const canCancel = ['notified', 'en_route'].includes(assignment.status);

  const variantColors = {
    neutral: 'text-safe-text-muted bg-safe-gray-light/60',
    info: 'text-safe-blue bg-safe-blue/10',
    accent: 'text-safe-accent bg-safe-accent/10',
    success: 'text-safe-success bg-safe-success/10',
  };

  return (
    <li className="px-4 py-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {unit && (
            <FontAwesomeIcon
              icon={getUnitTypeIcon(unit.unitType)}
              className="text-safe-text-muted text-[11px] flex-shrink-0"
            />
          )}
          <span className="text-sm font-medium text-white truncate">
            {unit?.name ?? assignment.unitId}
          </span>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${variantColors[variant] ?? variantColors.neutral}`}
        >
          {label}
        </span>
      </div>

      {(canAdvance || canCancel) && (
        <div className="flex gap-2">
          {canAdvance && (
            <Button
              variant="ghost"
              className="text-xs py-1 px-2 h-auto flex-1"
              onClick={() => onUpdateStatus(assignment.id, NEXT_STATUS[assignment.status])}
            >
              {NEXT_STATUS_LABEL[assignment.status]}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="danger"
              className="text-xs py-1 px-2 h-auto"
              onClick={() => onCancel(assignment.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

function ActiveAssignmentsPanel({ assignments, units, onUpdateStatus, onCancel }) {
  const activeAssignments = assignments.filter(
    (a) => !['completed', 'cancelled'].includes(a.status)
  );
  const closedAssignments = assignments.filter(
    (a) => ['completed', 'cancelled'].includes(a.status)
  );

  if (assignments.length === 0) {
    return (
      <div className="bg-safe-gray border border-white/8 rounded-xl px-4 py-8 text-center">
        <FontAwesomeIcon icon="route" className="text-2xl text-safe-text-muted/50 mb-2" />
        <p className="text-safe-text-muted text-sm">No units dispatched yet</p>
        <p className="text-xs text-safe-text-muted/60 mt-1">
          Dispatch units above to track them here.
        </p>
      </div>
    );
  }

  function getUnit(unitId) {
    return units.find((u) => u.id === unitId) ?? null;
  }

  return (
    <div className="bg-safe-gray border border-white/8 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Active Assignments</h3>
        {activeAssignments.length > 0 && (
          <span className="bg-safe-blue/20 text-safe-blue rounded-full px-2 py-0.5 text-xs font-medium">
            {activeAssignments.length}
          </span>
        )}
      </div>

      {activeAssignments.length > 0 && (
        <ul className="divide-y divide-white/6">
          {activeAssignments.map((a) => (
            <AssignmentRow
              key={a.id}
              assignment={a}
              unit={getUnit(a.unitId)}
              onUpdateStatus={onUpdateStatus}
              onCancel={onCancel}
            />
          ))}
        </ul>
      )}

      {closedAssignments.length > 0 && (
        <>
          <div className="px-4 py-2 border-t border-white/8 bg-safe-gray-light/10">
            <span className="text-xs text-safe-text-muted/60">Resolved</span>
          </div>
          <ul className="divide-y divide-white/6 opacity-60">
            {closedAssignments.map((a) => (
              <AssignmentRow
                key={a.id}
                assignment={a}
                unit={getUnit(a.unitId)}
                onUpdateStatus={onUpdateStatus}
                onCancel={onCancel}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default ActiveAssignmentsPanel;
