import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '@/components/ui/Modal.jsx';
import Button from '@/components/ui/Button.jsx';
import UnitStatusBadge from './badges/UnitStatusBadge.jsx';
import { getUnitTypeIcon, getCaseTypeLabel } from '../utils/caseFormatters.js';

function DispatchConfirmModal({ open, selectedUnits = [], caseRecord, onConfirm, onClose }) {
  if (!caseRecord) return null;

  const unitCount = selectedUnits.length;

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Modal.Header title="Confirm Dispatch" onClose={onClose} />

      <Modal.Content>
        <p className="text-safe-text-gray text-sm mb-4">
          Dispatching{' '}
          <span className="text-white font-semibold">
            {unitCount} unit{unitCount !== 1 ? 's' : ''}
          </span>{' '}
          to{' '}
          <span className="text-white font-semibold">
            {getCaseTypeLabel(caseRecord)}
          </span>
          . A push notification will be sent to each unit immediately.
        </p>

        <ul className="space-y-2 mb-5">
          {selectedUnits.map((unit) => (
            <li
              key={unit.id}
              className="flex items-center gap-3 rounded-lg bg-safe-gray px-3 py-2.5 border border-safe-border/20"
            >
              <FontAwesomeIcon
                icon={getUnitTypeIcon(unit.unitType)}
                className="text-safe-text-gray text-sm w-4 flex-shrink-0"
              />
              <span className="flex-1 text-sm font-medium text-white truncate">
                {unit.name}
              </span>
              <UnitStatusBadge status={unit.status} />
              <span className="text-xs text-safe-text-gray font-mono flex-shrink-0">
                {unit.distanceKm.toFixed(1)} km
              </span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-safe-text-gray bg-safe-gray rounded-lg px-3 py-2.5 border border-safe-border/20">
          Each dispatched unit will move to <strong className="text-white">en route</strong>{' '}
          and an active assignment will be created on this case.
        </p>
      </Modal.Content>

      <Modal.Footer>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Dispatch {unitCount} Unit{unitCount !== 1 ? 's' : ''}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DispatchConfirmModal;
