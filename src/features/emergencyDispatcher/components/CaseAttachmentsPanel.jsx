import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Lightbox({ attachment, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/92 animate-fadeIn"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <FontAwesomeIcon icon="xmark" />
      </button>
      <img
        src={attachment.url}
        alt={attachment.caption}
        className="max-w-[88vw] max-h-[80vh] rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      {attachment.caption && (
        <p className="mt-4 text-sm text-white/60 max-w-[80vw] text-center">
          {attachment.caption}
        </p>
      )}
    </div>
  );
}

function CaseAttachmentsPanel({ attachments = [] }) {
  const [lightbox, setLightbox] = useState(null);

  if (attachments.length === 0) return null;

  return (
    <div className="bg-safe-gray rounded-xl border border-white/8 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Attached Media</h3>
        <span className="text-xs text-safe-text-muted">{attachments.length} file{attachments.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="p-3 grid grid-cols-3 gap-2">
        {attachments.map((att) => (
          <button
            key={att.id}
            type="button"
            onClick={() => setLightbox(att)}
            className="relative group rounded-lg overflow-hidden aspect-[4/3] bg-safe-gray-light border border-white/6 hover:border-safe-blue/40 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-safe-blue/40"
            aria-label={att.caption || 'View attachment'}
          >
            <img
              src={att.url}
              alt={att.caption}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-150 flex items-center justify-center">
              <FontAwesomeIcon
                icon="magnifying-glass-plus"
                className="text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              />
            </div>
            {att.caption && (
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <p className="text-[10px] text-white/80 truncate">{att.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {lightbox && <Lightbox attachment={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

export default CaseAttachmentsPanel;
