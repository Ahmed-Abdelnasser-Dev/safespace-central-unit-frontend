import { useState, useEffect } from 'react';
import { userAPI } from '@/services/api';
import { showSuccess, showError } from '@/utils/toast';

// ── Inline SVG icons (matches ResetPasswordModal's style — no library dependency) ──
const IconAlertCircle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconPause = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const IconSpinner = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

/**
 * DeleteUserModal — two-step destructive-action gate.
 *
 * Step 1 ("offer"):   "Deactivate instead?" — the reversible, low-friction option
 *                      is presented first and given the visual priority.
 * Step 2 ("confirm"): Permanent delete requires typing the user's exact email.
 *
 * Friction is proportional to severity: deactivation is one click, deletion
 * requires acknowledging the irreversible-ness and proving intent by typing
 * the email.
 */
function DeleteUserModal({ user, isOpen, onClose, onDeactivated, onDeleted }) {
  const [step, setStep] = useState('offer'); // 'offer' | 'confirm'
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset internal state whenever the modal is opened for a (possibly new) user
  useEffect(() => {
    if (isOpen) {
      setStep('offer');
      setEmailInput('');
      setLoading(false);
    }
  }, [isOpen, user?.id]);

  if (!isOpen || !user) return null;

  const displayName = user.fullName || user.username || user.email;
  const emailMatches = emailInput.trim().toLowerCase() === (user.email || '').toLowerCase();

  const handleClose = () => {
    if (loading) return;
    setStep('offer');
    setEmailInput('');
    onClose();
  };

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      await userAPI.deactivateUser(user.id);
      showSuccess(`${displayName} has been deactivated`);
      onDeactivated?.(user);
      handleClose();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!emailMatches) return;
    setLoading(true);
    try {
      await userAPI.deleteUser(user.id, emailInput.trim());
      showSuccess(`${displayName} has been permanently deleted`);
      onDeleted?.(user);
      handleClose();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-safe-sidebar rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-slideUp">

        {/* ── Header ── */}
        <div className="px-7 pt-6 pb-5 flex items-start justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-safe-text-dark tracking-tight">
              {step === 'offer' ? 'Delete User' : 'Confirm Permanent Delete'}
            </h2>
            <p className="text-[13px] text-safe-text-gray mt-0.5">{displayName} · {user.email}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-safe-text-gray hover:text-safe-text-dark transition-colors mt-0.5 p-1 -mr-1 rounded-md hover:bg-safe-bg disabled:opacity-40"
          >
            <IconClose />
          </button>
        </div>

        <div className="h-px bg-safe-border mx-7" />

        {/* ── Body ── */}
        <div className="px-7 py-5 space-y-4">

          {step === 'offer' ? (
            /* ── Step 1: offer deactivation instead ── */
            <>
              <div className="px-4 py-3.5 rounded-lg border border-safe-blue-btn/30 bg-safe-blue-btn/[0.03]">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-0.5 text-safe-blue-btn"><IconPause /></span>
                  <div>
                    <p className="text-[13px] font-medium text-safe-text-dark">Deactivating blocks login and hides the user, but can be undone anytime.</p>
                    <p className="text-[12px] text-safe-text-gray mt-1">Deletion is permanent. The account cannot be restored, and the email and IDs are retained only as a historical record.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ── Step 2: type-to-confirm permanent delete ── */
            <>
              <p className="text-[13px] text-safe-text-gray leading-relaxed border-l-2 border-safe-danger pl-3">
                This will <strong className="text-safe-text-dark font-medium">permanently delete</strong> this account.
                It cannot be undone. To rehire this person later, a brand-new account will need to be created —
                this one will not be restorable.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-safe-text-gray uppercase tracking-wider mb-2">
                  Type the user&rsquo;s email to confirm
                </label>
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={user.email}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={loading}
                  className="w-full px-4 py-2.5 text-sm font-mono rounded-lg border border-safe-border text-safe-text-dark placeholder:text-safe-text-gray/60 focus:outline-none focus:ring-2 focus:ring-safe-danger/20 focus:border-safe-danger disabled:opacity-60"
                />
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-7 py-4 border-t border-safe-border flex items-center justify-end gap-2.5">
          {step === 'offer' ? (
            <>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={loading}
                className="px-4 py-2 text-[13px] font-medium text-white bg-safe-blue-btn hover:bg-safe-blue-btn/90 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <IconSpinner /> : <IconPause />}
                {loading ? 'Deactivating…' : 'Deactivate'}
              </button>
              <button
                type="button"
                onClick={() => setStep('confirm')}
                disabled={loading}
                className="px-4 py-2 text-[13px] font-medium text-safe-danger bg-safe-sidebar border border-safe-danger/30 hover:bg-safe-danger/5 rounded-lg transition-colors disabled:opacity-50"
              >
                Delete instead →
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('offer')}
                disabled={loading}
                className="px-4 py-2 text-[13px] font-medium text-safe-text-dark bg-safe-sidebar border border-safe-border hover:bg-safe-bg rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading || !emailMatches}
                className="px-4 py-2 text-[13px] font-medium text-white bg-safe-danger hover:bg-safe-danger/90 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <IconSpinner /> : <IconTrash />}
                {loading ? 'Deleting…' : 'Delete user'}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default DeleteUserModal;