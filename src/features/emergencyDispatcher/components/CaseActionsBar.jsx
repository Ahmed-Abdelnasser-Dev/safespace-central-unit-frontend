import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '@/components/ui/Modal.jsx';
import Button from '@/components/ui/Button.jsx';
import CallbackModal from './CallbackModal.jsx';

const TERMINAL_STATUSES = ['resolved', 'false_alarm', 'closed'];

function ConfirmModal({ open, title, body, confirmLabel, confirmVariant = 'primary', onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={onClose} size="md">
      <Modal.Header title={title} onClose={onClose} />
      <Modal.Content>
        <p className="text-safe-text-gray text-sm">{body}</p>
      </Modal.Content>
      <Modal.Footer>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
      </Modal.Footer>
    </Modal>
  );
}

function ActionButton({ icon, label, onClick, colorClass, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg border transition-all duration-150 text-center disabled:opacity-40 disabled:cursor-not-allowed ${colorClass}`}
    >
      <FontAwesomeIcon icon={icon} className="text-base" />
      <span className="text-[11px] font-medium leading-none">{label}</span>
    </button>
  );
}

function CaseActionsBar({
  caseRecord,
  onEscalate,
  onResolve,
  onMarkFalseAlarm,
  onClose: onCloseCase,
  onAddNote,
}) {
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [falseAlarmOpen, setFalseAlarmOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);

  if (!caseRecord) return null;

  const status = caseRecord.status;
  const isTerminal = TERMINAL_STATUSES.includes(status);
  const isEscalated = status === 'escalated';
  const isSOS = caseRecord.caseType === 'sos';

  if (isTerminal) {
    const terminalMeta = {
      resolved: { icon: 'circle-check', label: 'Resolved', cls: 'text-safe-success bg-safe-success/10 border-safe-success/20' },
      false_alarm: { icon: 'triangle-exclamation', label: 'False Alarm', cls: 'text-safe-text-gray bg-safe-gray-light/25 border-safe-gray-light' },
      closed: { icon: 'lock', label: 'Closed', cls: 'text-safe-text-gray bg-safe-gray-light/25 border-safe-gray-light' },
    }[status];
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${terminalMeta.cls}`}>
        <FontAwesomeIcon icon={terminalMeta.icon} />
        <span className="text-sm font-medium">Case {terminalMeta.label}</span>
      </div>
    );
  }

  return (
    <>
      <div className={`grid gap-2 w-full ${isSOS ? 'grid-cols-4' : 'grid-cols-4'}`}>
        <ActionButton
          icon="angles-up"
          label={isEscalated ? 'Escalated' : 'Escalate'}
          disabled={isEscalated}
          onClick={() => setEscalateOpen(true)}
          colorClass={
            isEscalated
              ? 'border-safe-orange/20 bg-safe-orange/5 text-safe-orange opacity-50'
              : 'border-safe-orange/30 bg-safe-orange/10 text-safe-orange hover:bg-safe-orange/20 hover:border-safe-orange/50'
          }
        />

        {isSOS ? (
          <ActionButton
            icon="phone"
            label="Call Back"
            onClick={() => setCallbackOpen(true)}
            colorClass="border-safe-blue/30 bg-safe-blue/10 text-safe-blue hover:bg-safe-blue/20 hover:border-safe-blue/50"
          />
        ) : (
          <ActionButton
            icon="triangle-exclamation"
            label="False Alarm"
            onClick={() => setFalseAlarmOpen(true)}
            colorClass="border-safe-gray-light bg-safe-gray-light/25 text-safe-text-gray hover:bg-safe-gray-light/30 hover:text-safe-text-primary"
          />
        )}

        <ActionButton
          icon="circle-check"
          label="Resolve"
          onClick={() => setResolveOpen(true)}
          colorClass="border-safe-success/30 bg-safe-success/10 text-safe-success hover:bg-safe-success/20 hover:border-safe-success/50"
        />

        <ActionButton
          icon="circle-xmark"
          label="Close"
          onClick={() => setCloseOpen(true)}
          colorClass="border-safe-danger/30 bg-safe-danger/10 text-safe-danger hover:bg-safe-danger/20 hover:border-safe-danger/50"
        />
      </div>

      <ConfirmModal
        open={escalateOpen}
        title="Escalate Case"
        body="This will flag the case as escalated and notify supervisors. Are you sure?"
        confirmLabel="Escalate"
        confirmVariant="primary"
        onConfirm={() => { onEscalate(caseRecord.id); setEscalateOpen(false); }}
        onClose={() => setEscalateOpen(false)}
      />

      <ConfirmModal
        open={resolveOpen}
        title="Mark as Resolved"
        body="This confirms the response was successful. All active units will be marked as completed and returned to available. This cannot be undone."
        confirmLabel="Mark Resolved"
        confirmVariant="primary"
        onConfirm={() => { onResolve(caseRecord.id); setResolveOpen(false); }}
        onClose={() => setResolveOpen(false)}
      />

      <ConfirmModal
        open={falseAlarmOpen}
        title="Mark as False Alarm"
        body="This marks the AI detection as incorrect. Any dispatched units will be recalled. This cannot be undone."
        confirmLabel="Mark False Alarm"
        confirmVariant="ghost"
        onConfirm={() => { onMarkFalseAlarm(caseRecord.id); setFalseAlarmOpen(false); }}
        onClose={() => setFalseAlarmOpen(false)}
      />

      <ConfirmModal
        open={closeOpen}
        title="Close Case"
        body="Closing this case will mark all active dispatches as completed and return units to available. This cannot be undone."
        confirmLabel="Close Case"
        confirmVariant="danger"
        onConfirm={() => { onCloseCase(caseRecord.id); setCloseOpen(false); }}
        onClose={() => setCloseOpen(false)}
      />

      <CallbackModal
        open={callbackOpen}
        caseRecord={caseRecord}
        onClose={() => setCallbackOpen(false)}
        onLogOutcome={onAddNote}
      />
    </>
  );
}

export default CaseActionsBar;
