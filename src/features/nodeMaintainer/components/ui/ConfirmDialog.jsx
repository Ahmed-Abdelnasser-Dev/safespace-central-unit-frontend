/**
 * Reusable Confirm Dialog Component
 * 
 * Modal dialog for user confirmations (delete, cancel, etc.)
 * 
 * @component
 * @param {boolean} isOpen - Whether dialog is visible
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @param {Function} onConfirm - Callback when confirmed
 * @param {Function} onCancel - Callback when cancelled
 * @param {boolean} isDangerous - If true, confirm button is red (for destructive actions)
 * @param {string} [errorMessage] - Optional error text displayed under the message
 */

function ConfirmDialog({ 
  isOpen, 
  title, 
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
  errorMessage = ''
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-[16px]">
      <div className="bg-safe-gray border border-safe-gray-light rounded-2xl max-w-[400px] w-full p-[20px]">
        {/* Header */}
        <h3
          className="font-bold text-safe-text-primary mb-[12px]"
          style={{
            fontSize: 'clamp(14px, 1.5vw, 16px)',
            fontFamily: 'Arimo, sans-serif'
          }}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          className="text-safe-text-muted mb-[12px]"
          style={{
            fontSize: 'clamp(12px, 1.3vw, 14px)',
            fontFamily: 'Arimo, sans-serif'
          }}
        >
          {message}
        </p>

        {errorMessage && (
          <div
            className="mb-[20px] rounded-[8px] border border-safe-danger/20 bg-safe-danger/10 px-[12px] py-[8px] text-safe-danger"
            style={{
              fontSize: 'clamp(11px, 1.2vw, 12px)',
              fontFamily: 'Arimo, sans-serif'
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-[12px] justify-end">
          <button
            onClick={onCancel}
            className="px-[16px] py-[10px] border border-safe-gray-light rounded-[6px] text-safe-text-primary font-medium transition-all duration-200 hover:bg-safe-gray-light/50"
            style={{
              fontSize: 'clamp(12px, 1.2vw, 13px)',
              fontFamily: 'Arimo, sans-serif'
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`px-[16px] py-[10px] rounded-[6px] text-white font-medium transition-all duration-200 ${
              isDangerous
                ? 'bg-[#d63e4d] hover:bg-[#b82c3a]'
                : 'bg-[#247cff] hover:bg-[#1a5dcc]'
            }`}
            style={{
              fontSize: 'clamp(12px, 1.2vw, 13px)',
              fontFamily: 'Arimo, sans-serif'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
