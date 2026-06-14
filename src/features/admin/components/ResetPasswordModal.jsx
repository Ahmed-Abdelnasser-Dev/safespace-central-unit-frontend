import { useState } from 'react';
import { userAPI } from '@/services/api';
import { showSuccess, showError } from '@/utils/toast';

// ── Inline SVG icons (no library dependency, clean strokes) ──────────────────
const IconEnvelope = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

const IconSpinner = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

function ResetPasswordModal({ user, isOpen, onClose }) {
  const [mode,       setMode]       = useState('email');
  const [loading,    setLoading]    = useState(false);
  const [tempResult, setTempResult] = useState(null);
  const [copied,     setCopied]     = useState(false);

  if (!isOpen || !user) return null;

  const displayName = user.fullName || user.username || user.email;

  const handleReset = async () => {
    setLoading(true);
    try {
      const result = await userAPI.adminResetPassword(user.id, { sendEmail: mode === 'email' });
      if (mode === 'email') {
        showSuccess(`Reset link sent to ${user.email}`);
        handleClose();
      } else {
        setTempResult(result);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tempResult.tempPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleClose = () => {
    setMode('email');
    setTempResult(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-slideUp">

        {/* ── Header ── */}
        <div className="px-7 pt-6 pb-5 flex items-start justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-safe-text-dark tracking-tight">Reset User Password</h2>
            <p className="text-[13px] text-safe-text-gray mt-0.5">{displayName} · {user.email}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-safe-text-gray hover:text-safe-text-dark transition-colors mt-0.5 p-1 -mr-1 rounded-md hover:bg-safe-bg"
          >
            <IconClose />
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-safe-border mx-7" />

        {/* ── Body ── */}
        <div className="px-7 py-5 space-y-4">

          {tempResult ? (
            /* ── Temp password result ── */
            <>
              <p className="text-[13px] text-safe-text-gray leading-relaxed border-l-2 border-amber-400 pl-3">
                This password is shown <strong className="text-safe-text-dark font-medium">once only</strong> and cannot be retrieved again.
                Share it with the user through a secure channel.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-safe-text-gray uppercase tracking-wider mb-2">
                  Temporary password for {tempResult.email}
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-safe-bg border border-safe-border rounded-lg">
                  <code className="flex-1 font-mono text-[15px] font-semibold text-safe-text-dark tracking-[0.18em] select-all">
                    {tempResult.tempPassword}
                  </code>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md border transition-colors ${
                      copied
                        ? 'bg-safe-success/10 text-safe-success border-safe-success/30'
                        : 'bg-white border-safe-border text-safe-text-dark hover:bg-safe-bg'
                    }`}
                  >
                    {copied ? <IconCheck /> : <IconCopy />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <p className="text-[12px] text-safe-text-gray leading-relaxed border-l-2 border-safe-blue-btn/40 pl-3">
                The user has been signed out of all devices and must change this password on next sign-in.
              </p>
            </>

          ) : (
            /* ── Mode selection ── */
            <>
              <div className="space-y-2">

                {/* Option A — email link */}
                <button
                  type="button"
                  onClick={() => setMode('email')}
                  className={`w-full text-left px-4 py-3.5 border rounded-lg transition-all ${
                    mode === 'email'
                      ? 'border-safe-blue-btn border-l-[3px] bg-safe-blue-btn/[0.03]'
                      : 'border-safe-border hover:border-safe-blue-btn/40 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      mode === 'email' ? 'border-safe-blue-btn' : 'border-safe-border'
                    }`}>
                      {mode === 'email' && <div className="w-1.5 h-1.5 rounded-full bg-safe-blue-btn" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[13px] font-medium transition-colors ${mode === 'email' ? 'text-safe-text-dark' : 'text-safe-text-dark'}`}>
                          Send reset link via email
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-safe-success/10 text-safe-success tracking-wide">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[12px] text-safe-text-gray mt-0.5">
                        User receives a secure link to set their own password. Expires in 1 hour.
                      </p>
                    </div>
                    <span className={`flex-shrink-0 transition-colors ${mode === 'email' ? 'text-safe-blue-btn' : 'text-safe-text-gray'}`}>
                      <IconEnvelope />
                    </span>
                  </div>
                </button>

                {/* Option B — temp password */}
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className={`w-full text-left px-4 py-3.5 border rounded-lg transition-all ${
                    mode === 'manual'
                      ? 'border-safe-blue-btn border-l-[3px] bg-safe-blue-btn/[0.03]'
                      : 'border-safe-border hover:border-safe-blue-btn/40 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      mode === 'manual' ? 'border-safe-blue-btn' : 'border-safe-border'
                    }`}>
                      {mode === 'manual' && <div className="w-1.5 h-1.5 rounded-full bg-safe-blue-btn" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium transition-colors ${mode === 'manual' ? 'text-safe-text-dark' : 'text-safe-text-dark'}`}>
                        Generate a temporary password
                      </p>
                      <p className="text-[12px] text-safe-text-gray mt-0.5">
                        A one-time password shown to you. Share through a secure channel.
                      </p>
                    </div>
                    <span className={`flex-shrink-0 transition-colors ${mode === 'manual' ? 'text-amber-500' : 'text-safe-text-gray'}`}>
                      <IconShield />
                    </span>
                  </div>
                </button>

              </div>

              {/* Info notice */}
              <p className="text-[12px] text-safe-text-gray leading-relaxed border-l-2 border-safe-border pl-3">
                Either option will <strong className="text-safe-text-dark font-medium">sign the user out of all devices</strong> and
                require a password change on next sign-in.
              </p>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-7 py-4 border-t border-safe-border flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-[13px] font-medium text-safe-text-dark bg-white border border-safe-border hover:bg-safe-bg rounded-lg transition-colors"
          >
            {tempResult ? 'Done' : 'Cancel'}
          </button>

          {!tempResult && (
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2 text-[13px] font-medium text-white bg-safe-blue-btn hover:bg-safe-blue-btn/90 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <IconSpinner />
                  {mode === 'email' ? 'Sending…' : 'Generating…'}
                </>
              ) : (
                mode === 'email' ? 'Send Reset Link' : 'Generate Password'
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default ResetPasswordModal;