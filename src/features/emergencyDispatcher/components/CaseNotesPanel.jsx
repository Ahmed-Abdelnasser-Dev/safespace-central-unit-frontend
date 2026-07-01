import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/ui/Button.jsx';
import { timeSince } from '../utils/caseFormatters.js';

function NoteEntry({ note }) {
  const isSystem = note.authorType === 'system';
  return (
    <li className="flex gap-3" aria-label={isSystem ? 'System log entry' : 'Dispatcher note'}>
      <div className="flex-shrink-0 mt-0.5">
        {isSystem ? (
          <span className="w-6 h-6 rounded-full bg-safe-gray-light border border-safe-gray-light flex items-center justify-center">
            <FontAwesomeIcon icon="circle-info" className="text-[10px] text-safe-text-muted" />
          </span>
        ) : (
          <span className="w-6 h-6 rounded-full bg-safe-blue/20 border border-safe-blue/30 flex items-center justify-center">
            <FontAwesomeIcon icon="headset" className="text-[10px] text-safe-blue" />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={`text-xs font-semibold ${isSystem ? 'text-safe-text-muted' : 'text-safe-blue'}`}>
            {isSystem ? 'System' : 'Dispatcher'}
          </span>
          <span className="text-[10px] text-safe-text-muted/60 font-mono">{timeSince(note.createdAt)}</span>
        </div>
        <p className={`text-sm mt-0.5 leading-relaxed ${isSystem ? 'text-safe-text-muted' : 'text-safe-text-primary'}`}>
          {note.content}
        </p>
      </div>
    </li>
  );
}

function CaseNotesPanel({ caseRecord, onAddNote }) {
  const [draft, setDraft] = useState('');

  const notes = caseRecord?.notes ?? [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !caseRecord) return;
    onAddNote(caseRecord.id, trimmed);
    setDraft('');
  };

  return (
    <div className="bg-safe-gray border border-safe-gray-light rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-safe-gray-light">
        <h3 className="text-sm font-semibold text-safe-text-primary">Notes &amp; Activity</h3>
      </div>

      {notes.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-safe-text-muted text-sm">No activity yet</p>
          <p className="text-xs text-safe-text-muted/60 mt-1">
            System events and your notes will appear here.
          </p>
        </div>
      ) : (
        <ul className="px-4 py-4 space-y-4 max-h-[280px] overflow-y-auto">
          {[...notes].reverse().map((note) => (
            <NoteEntry key={note.id} note={note} />
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 px-3 py-3 border-t border-safe-gray-light"
      >
        {/* Dark-surface input — matches the card background, avoids jarring white box */}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note…"
          aria-label="Case note"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-safe-gray-light bg-safe-gray-light text-safe-text-primary text-sm placeholder:text-safe-text-muted/50 focus:outline-none focus:ring-2 focus:ring-safe-blue/30 focus:border-safe-blue/60 transition-all"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!draft.trim()}
          className="flex-shrink-0 px-3"
        >
          <FontAwesomeIcon icon="paper-plane" />
        </Button>
      </form>
    </div>
  );
}

export default CaseNotesPanel;
