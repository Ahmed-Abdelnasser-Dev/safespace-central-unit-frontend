import { useEffect } from 'react';
import Button from './Button.jsx';

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
    : `relative w-full ${sizes[size]} mx-4 rounded-2xl animate-scaleIn shadow-2xl overflow-hidden`;
  return (
    <div className={containerClasses}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={contentClasses}>{children}</div>
    </div>
  );
}

Modal.Header = function ModalHeader({ children, title, onClose }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-safe-gray">
      {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center text-safe-text-gray hover:text-white hover:bg-white/10 rounded-lg transition-all"
          aria-label="Close modal"
        >
          ✕
        </button>
      )}
    </div>
  );
};

Modal.Content = function ModalContent({ children }) {
  return <div className="px-6 py-5 bg-safe-dark">{children}</div>;
};

Modal.Footer = function ModalFooter({ children }) {
  return (
    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-safe-gray border-t border-white/10">
      {children}
    </div>
  );
};

Modal.CloseButton = function ModalCloseButton({ onClick }) {
  return <Button variant="secondary" size="sm" onClick={onClick}>Close</Button>;
};

export default Modal;
