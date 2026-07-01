import { useEffect } from 'react';

/**
 * Global Modal container with backdrop.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {function} props.onClose
 * @param {React.ReactNode} props.children
 * @param {string}  [props.size]  — sm | md | lg | xl | 2xl | full
 * @param {boolean} [props.bare]  — when true, children supply their own card container;
 *                                  Modal only provides the backdrop + positioning.
 *                                  Always true for size="full".
 */
function Modal({ open, onClose, children, size = 'lg', bare = false }) {
  useEffect(() => {
    function esc(e) { if (e.key === 'Escape') onClose?.(); }
    if (open) window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, onClose]);

  if (!open) return null;

  const isFull = size === 'full';

  const sizes = {
    sm:   'max-w-lg',
    md:   'max-w-2xl',
    lg:   'max-w-5xl',
    xl:   'max-w-6xl',
    '2xl':'max-w-5xl',
    full: 'max-w-none',
  };

  const containerClasses = isFull
    ? 'fixed inset-0 z-50 flex items-stretch justify-center animate-fadeIn'
    : 'fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 pb-4 animate-fadeIn';

  const wrapperClasses = isFull
    ? 'relative w-full h-full'
    : `relative w-full ${sizes[size]} animate-slideUp`;

  return (
    <div className={containerClasses}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={wrapperClasses}>
        {bare || isFull ? (
          children
        ) : (
          <div className="bg-safe-sidebar rounded-2xl border border-safe-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

Modal.Header = function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-safe-border flex-shrink-0">
      <div className="text-base font-semibold text-safe-text-primary">{title}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray transition-colors text-sm"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
};

Modal.Content = function ModalContent({ children, className = '' }) {
  return (
    <div className={`px-6 py-5 flex-1 overflow-y-auto ${className}`}>
      {children}
    </div>
  );
};

Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-3 px-6 py-4 bg-safe-gray/60 border-t border-safe-border flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
};

Modal.CloseButton = function ModalCloseButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray transition-colors text-sm"
    >
      ✕
    </button>
  );
};

export default Modal;
