function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
  errorMessage = '',
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-safe-gray border border-safe-gray-light rounded-2xl max-w-[400px] w-full p-5">
        <h3 className="text-base font-bold text-safe-text-primary mb-3">{title}</h3>
        <p className="text-sm text-safe-text-muted mb-3">{message}</p>

        {errorMessage && (
          <div className="mb-5 rounded-lg border border-safe-danger/20 bg-safe-danger/10 px-3 py-2 text-xs text-safe-danger">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-sm border border-safe-gray-light rounded-lg text-safe-text-primary font-medium transition-all duration-200 hover:bg-safe-gray-light/50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2.5 text-sm rounded-lg text-white font-medium transition-all duration-200 ${
              isDangerous
                ? 'bg-safe-danger hover:bg-safe-danger/90'
                : 'bg-safe-blue-btn hover:bg-safe-blue-light'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
