import { useState } from 'react';
import Modal from '@/components/ui/Modal.jsx';
import Button from '@/components/ui/Button.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const OUTCOME_OPTIONS = [
  { value: 'answered', label: 'Answered — spoke with victim' },
  { value: 'no_answer', label: 'No answer' },
  { value: 'voicemail', label: 'Left voicemail' },
  { value: 'wrong_number', label: 'Wrong number / disconnected' },
];

function CallbackModal({ open, caseRecord, onClose, onLogOutcome }) {
  const [outcome, setOutcome] = useState('answered');
  const [notes, setNotes] = useState('');

  if (!caseRecord) return null;

  const handleClose = () => {
    setOutcome('answered');
    setNotes('');
    onClose();
  };

  const phone = caseRecord.victim?.phone ?? null;

  const handleSubmit = () => {
    const selectedLabel = OUTCOME_OPTIONS.find((o) => o.value === outcome)?.label ?? outcome;
    const noteContent = notes.trim()
      ? `Callback — ${selectedLabel}. ${notes.trim()}`
      : `Callback — ${selectedLabel}`;
    onLogOutcome(caseRecord.id, noteContent);
    setNotes('');
    setOutcome('answered');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="md">
      <Modal.Header title="Call Back Victim" onClose={handleClose} />

      <Modal.Content>
        {phone ? (
          <div className="flex items-center gap-3 bg-safe-gray rounded-xl px-4 py-3 border border-safe-border/20 mb-5">
            <FontAwesomeIcon icon="phone" className="text-safe-success text-sm flex-shrink-0" />
            <a
              href={`tel:${phone}`}
              className="text-safe-blue font-mono text-sm hover:underline flex-1"
              aria-label={`Call ${phone}`}
            >
              {phone}
            </a>
            <span className="text-xs text-safe-text-gray">Tap to call</span>
          </div>
        ) : (
          <div className="bg-safe-gray rounded-xl px-4 py-3 border border-safe-border/20 mb-5 text-sm text-safe-text-gray">
            <FontAwesomeIcon icon="phone-slash" className="mr-2 opacity-60" />
            No phone number on file for this case.
          </div>
        )}

        <p className="text-sm font-medium text-safe-text-primary mb-2">Outcome</p>
        <div className="space-y-2 mb-5">
          {OUTCOME_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="callback-outcome"
                value={opt.value}
                checked={outcome === opt.value}
                onChange={() => setOutcome(opt.value)}
                className="w-4 h-4 accent-safe-blue flex-shrink-0"
              />
              <span className="text-sm text-safe-text-gray group-hover:text-safe-text-primary transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>

        <p className="text-sm font-medium text-safe-text-primary mb-1.5">Additional notes (optional)</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Victim confirmed location, injuries minor…"
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-safe-border/30 bg-safe-gray text-safe-text-primary text-sm placeholder:text-safe-text-gray/50 focus:outline-none focus:ring-2 focus:ring-safe-blue/30 focus:border-safe-blue/60 transition-all resize-none"
        />
      </Modal.Content>

      <Modal.Footer>
        <Button variant="ghost" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>
          Log Outcome
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CallbackModal;
