/**
 * ResetPasswordModal
 *
 * Admin confirms how to reset a user's password:
 *   Option A (default): Send the user a reset link via email — user sets their own new password.
 *   Option B: Generate a temp password — shown to admin once to share securely.
 */

import { useState } from 'react';
import { userAPI } from '@/services/api';
import { showSuccess, showError } from '@/utils/toast';

function ResetPasswordModal({ user, isOpen, onClose }) {
  const [mode,       setMode]       = useState('email');  // 'email' | 'manual'
  const [loading,    setLoading]    = useState(false);
  const [tempResult, setTempResult] = useState(null);     // { tempPassword, email }
  const [copied,     setCopied]     = useState(false);

  if (!isOpen || !user) return null;

  const handleReset = async () => {
    setLoading(true);
    try {
      const result = await userAPI.adminResetPassword(user.id, { sendEmail: mode === 'email' });

      if (mode === 'email') {
        showSuccess(`Reset link sent to ${user.email}`);
        onClose();
      } else {
        // Show temp password to admin — never shown again after this
        setTempResult(result);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const copyTemp = () => {
    navigator.clipboard.writeText(tempResult.tempPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClose = () => {
    setMode('email');
    setTempResult(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-safe-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <i className="bi bi-key text-amber-600 text-lg" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-safe-text-dark">Reset Password</h2>
                <p className="text-xs text-safe-text-gray mt-0.5">
                  {user.fullName || user.username || user.email}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="text-safe-text-gray hover:text-safe-text-dark p-1">
              <i className="bi bi-x-lg text-sm" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Temp password result screen */}
          {tempResult ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex items-start gap-2 text-sm text-amber-800">
                  <i className="bi bi-exclamation-triangle mt-0.5 shrink-0" />
                  <span>This temporary password is shown <strong>once only</strong>. Copy it now and share with the user via a secure channel. They must change it on next login.</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-safe-text-gray mb-1.5">Temporary password for <span className="font-medium text-safe-text-dark">{tempResult.email}</span></p>
                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-safe-border rounded-xl">
                  <code className="flex-1 font-mono text-sm text-safe-text-dark tracking-wider select-all">
                    {tempResult.tempPassword}
                  </code>
                  <button
                    onClick={copyTemp}
                    className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border border-safe-border bg-white hover:bg-gray-50 text-safe-text-dark transition-colors"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-safe-blue-btn text-white text-sm font-medium hover:bg-safe-blue-btn/90 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Mode selection */}
              <p className="text-sm text-safe-text-gray">
                Choose how to reset the password for <span className="font-medium text-safe-text-dark">{user.email}</span>:
              </p>

              <div className="space-y-2">
                {/* Option A: email */}
                <button
                  type="button"
                  onClick={() => setMode('email')}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    mode === 'email'
                      ? 'border-safe-blue-btn bg-safe-blue-btn/5'
                      : 'border-safe-border bg-white hover:border-safe-blue-btn/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      mode === 'email' ? 'border-safe-blue-btn' : 'border-safe-border'
                    }`}>
                      {mode === 'email' && <div className="w-2 h-2 rounded-full bg-safe-blue-btn" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-safe-text-dark">Send reset link via email</p>
                      <p className="text-xs text-safe-text-gray mt-0.5">
                        The user receives a secure link to set their own new password. Expires in 1 hour. <span className="text-green-600 font-medium">Recommended.</span>
                      </p>
                    </div>
                  </div>
                </button>

                {/* Option B: manual */}
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    mode === 'manual'
                      ? 'border-safe-blue-btn bg-safe-blue-btn/5'
                      : 'border-safe-border bg-white hover:border-safe-blue-btn/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      mode === 'manual' ? 'border-safe-blue-btn' : 'border-safe-border'
                    }`}>
                      {mode === 'manual' && <div className="w-2 h-2 rounded-full bg-safe-blue-btn" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-safe-text-dark">Generate a temporary password</p>
                      <p className="text-xs text-safe-text-gray mt-0.5">
                        A random password is shown to you once. You share it with the user securely. They must change it on next login.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="rounded-xl border border-safe-border bg-safe-bg/40 px-4 py-3">
                <div className="flex items-start gap-2 text-xs text-safe-text-gray">
                  <i className="bi bi-info-circle mt-0.5 shrink-0" />
                  <span>Either option will <strong>log the user out of all devices</strong> and require them to change their password on next sign-in.</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-safe-border text-sm text-safe-text-gray hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-safe-blue-btn text-white text-sm font-medium hover:bg-safe-blue-btn/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Processing...
                    </span>
                  ) : mode === 'email' ? 'Send Reset Link' : 'Generate Password'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordModal;