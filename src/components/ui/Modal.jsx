import { useEffect } from 'react';
import Button from './Button.jsx';

/**
 * Global Modal container with refined backdrop and animations.
 * @param {object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {React.ReactNode} props.children
 * @param {string} [props.size] - width sizing (md | lg | full)
 */
function Modal({ open, onClose, children, size = 'lg' }) {
  useEffect(() => {
    function esc(e) { if (e.key === 'Escape') onClose?.(); }
    if (open) window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, onClose]);

  if (!open) return null;
  const isFull = size === 'full';
  const sizes = { md: 'max-w-2xl', lg: 'max-w-4xl', full: 'max-w-none' };
  const containerClasses = isFull
    ? 'fixed inset-0 z-50 flex items-stretch justify-center animate-fadeIn'
    : 'fixed inset-0 z-50 flex items-center justify-center px-4 animate-fadeIn';
  const contentClasses = isFull
    ? `relative w-full h-full ${sizes[size]} rounded-none`
    : `relative w-full ${sizes[size]} mx-4 rounded-2xl animate-scaleIn shadow-xl`;
  return (
    <div className={containerClasses}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={contentClasses}>{children}</div>
    </div>
  );
}

Modal.Header = function ModalHeader({ children, title, onClose }) {
  return (
    <div className="flex items-center justify-between px-8 py-6 border-b border-safe-border/40 bg-white rounded-t-2xl">
      {title && <h2 className="font-display text-xl font-semibold text-safe-text-dark">{title}</h2>}
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-safe-text-gray/60 hover:text-safe-text-dark hover:bg-safe-bg rounded-lg transition-all"
          aria-label="Close modal"
        >
          ✕
        </button>
      )}
    </div>
  );
};

Modal.Content = function ModalContent({ children }) {
  return <div className="px-8 py-6 bg-white">{children}</div>;
};

Modal.Footer = function ModalFooter({ children }) {
  return (
    <div className="flex items-center justify-end gap-3 px-8 py-5 bg-safe-bg/30 border-t border-safe-border/40 rounded-b-2xl">
      {children}
    </div>
  );
};

Modal.CloseButton = function ModalCloseButton({ onClick }) {
  return <Button variant="secondary" size="sm" onClick={onClick}>Close</Button>;
};

export default Modal;
