/**
 * MFACard — Enable / disable TOTP-based two-factor authentication.
 *
 * States:
 *   disabled → click "Enable" → scan QR code → enter first TOTP → see backup codes → done
 *   enabled  → click "Disable" → enter password + TOTP → confirm → done
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setupMFA, enableMFA, disableMFA, resetMfaSetup } from '@/features/auth/authSlice';

// ─── Small sub-components ─────────────────────────────────────────────────────

function OtpInput({ value, onChange, disabled }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      placeholder="000000"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      disabled={disabled}
      className="w-full px-3 py-2.5 text-center text-2xl font-mono tracking-[0.5em] rounded-lg border border-safe-border bg-safe-bg/40 text-safe-text-dark focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/30 focus:border-safe-blue-btn"
    />
  );
}

function StatusBadge({ enabled }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
      enabled
        ? 'bg-green-100 text-green-700 border border-green-200'
        : 'bg-gray-100 text-gray-500 border border-gray-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
      {enabled ? '2FA Enabled' : '2FA Disabled'}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function MFACard() {
  const dispatch = useDispatch();
  const { user, mfaSetupLoading, mfaSetupError, mfaSetupQrCode, mfaSetupSecret, mfaSetupStep, mfaBackupCodes } = useSelector((s) => s.auth);

  const mfaEnabled = user?.mfaEnabled ?? false;

  // Local UI state
  const [totpCode,  setTotpCode]  = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes,  setCopiedCodes]  = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSetup = () => {
    dispatch(setupMFA());
    setTotpCode('');
  };

  const handleEnable = () => {
    if (totpCode.length !== 6) return;
    dispatch(enableMFA({ code: totpCode }));
    setTotpCode('');
  };

  const handleDisable = () => {
    if (!password || totpCode.length !== 6) return;
    dispatch(disableMFA({ password, code: totpCode })).unwrap()
      .then(() => { setDisableOpen(false); setTotpCode(''); setPassword(''); })
      .catch(() => {}); // error shown via mfaSetupError
  };

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Render: backup codes step ────────────────────────────────────────────────
  if (mfaSetupStep === 'backup') {
    return (
      <div className="bg-white rounded-xl border border-safe-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <i className="bi bi-check2-circle text-green-600 text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-safe-text-dark">2FA Enabled Successfully!</h3>
            <p className="text-xs text-safe-text-gray">Save these backup codes somewhere safe</p>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-2 text-xs text-amber-800">
            <i className="bi bi-exclamation-triangle mt-0.5" />
            <span>These codes are shown <strong>only once</strong>. Each code can be used once if you lose access to your authenticator app.</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {mfaBackupCodes.map((code, i) => (
            <div key={i} className="font-mono text-sm text-center py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-safe-text-dark tracking-wider">
              {code}
            </div>
          ))}
        </div>

        <button
          onClick={() => copyToClipboard(mfaBackupCodes.join('\n'), setCopiedCodes)}
          className="w-full flex items-center justify-center gap-2 text-xs text-safe-blue-btn border border-safe-blue-btn/30 rounded-lg py-2 hover:bg-safe-blue-btn/5 transition-colors"
        >
          <i className={`bi bi-${copiedCodes ? 'check' : 'clipboard'}`} />
          {copiedCodes ? 'Copied!' : 'Copy all codes'}
        </button>

        <p className="text-xs text-center text-safe-text-gray">
          You can close this — 2FA is now active on your account.
        </p>
      </div>
    );
  }

  // ── Render: QR scan step ─────────────────────────────────────────────────────
  if (mfaSetupStep === 'scan') {
    return (
      <div className="bg-white rounded-xl border border-safe-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-safe-blue-btn/10 flex items-center justify-center">
            <i className="bi bi-qr-code text-safe-blue-btn text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-safe-text-dark">Set Up Authenticator App</h3>
            <p className="text-xs text-safe-text-gray">Scan with Google Authenticator, Authy, or similar</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <img src={mfaSetupQrCode} alt="Scan this QR code" className="w-44 h-44 rounded-xl border border-safe-border" />
        </div>

        {/* Manual entry */}
        <div className="rounded-lg border border-safe-border bg-safe-bg/40 px-3 py-2">
          <p className="text-xs text-safe-text-gray mb-1">Or enter this key manually:</p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-safe-text-dark tracking-wider flex-1 break-all">{mfaSetupSecret}</code>
            <button
              onClick={() => copyToClipboard(mfaSetupSecret, setCopiedSecret)}
              className="shrink-0 text-safe-blue-btn text-xs hover:underline"
            >
              {copiedSecret ? '✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Enter first code */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-safe-text-dark">Enter the 6-digit code shown in your app:</p>
          <OtpInput value={totpCode} onChange={setTotpCode} disabled={mfaSetupLoading} />
        </div>

        {mfaSetupError && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <i className="bi bi-exclamation-circle" />
            {mfaSetupError}
          </div>
        )}

        <button
          onClick={handleEnable}
          disabled={mfaSetupLoading || totpCode.length !== 6}
          className="w-full py-2.5 rounded-lg bg-safe-blue-btn text-white text-sm font-medium hover:bg-safe-blue-btn/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {mfaSetupLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Verifying...
            </span>
          ) : 'Confirm & Enable 2FA'}
        </button>

        <button
          onClick={() => dispatch(resetMfaSetup())}
          className="w-full text-xs text-safe-text-gray hover:text-safe-text-dark text-center"
        >
          Cancel
        </button>
      </div>
    );
  }

  // ── Render: default card ─────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-safe-border p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mfaEnabled ? 'bg-green-50' : 'bg-gray-50'}`}>
            <i className={`bi bi-shield-${mfaEnabled ? 'check' : 'exclamation'} text-xl ${mfaEnabled ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-safe-text-dark">Two-Factor Authentication</h3>
            <p className="text-xs text-safe-text-gray">Extra protection for your account</p>
          </div>
        </div>
        <StatusBadge enabled={mfaEnabled} />
      </div>

      <p className="text-xs text-safe-text-gray leading-relaxed">
        {mfaEnabled
          ? 'Your account is protected with TOTP-based 2FA. Every login requires your authenticator app in addition to your password.'
          : 'Add a second layer of security. Once enabled, you\'ll need your authenticator app every time you sign in.'}
      </p>

      {mfaSetupError && !mfaSetupStep && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <i className="bi bi-exclamation-circle" />
          {mfaSetupError}
        </div>
      )}

      {/* Enable button */}
      {!mfaEnabled && !disableOpen && (
        <button
          onClick={handleSetup}
          disabled={mfaSetupLoading}
          className="w-full py-2.5 rounded-lg bg-safe-blue-btn text-white text-sm font-medium hover:bg-safe-blue-btn/90 disabled:opacity-50 transition-colors"
        >
          {mfaSetupLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Setting up...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <i className="bi bi-shield-plus" />
              Enable Two-Factor Authentication
            </span>
          )}
        </button>
      )}

      {/* Disable section */}
      {mfaEnabled && (
        <div className="space-y-3">
          {!disableOpen ? (
            <button
              onClick={() => setDisableOpen(true)}
              className="w-full py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <i className="bi bi-shield-x" />
                Disable Two-Factor Authentication
              </span>
            </button>
          ) : (
            <div className="space-y-3 border border-red-100 rounded-lg p-4 bg-red-50/40">
              <p className="text-xs font-medium text-red-800">Confirm to disable 2FA</p>

              <div className="space-y-1">
                <label className="text-xs text-safe-text-gray">Current password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 pr-9 py-2 text-sm rounded-lg border border-safe-border bg-white text-safe-text-dark focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/20"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-safe-text-gray text-xs">
                    <i className={`bi bi-eye${showPass ? '-slash' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safe-text-gray">Authenticator code</label>
                <OtpInput value={totpCode} onChange={setTotpCode} disabled={mfaSetupLoading} />
              </div>

              {mfaSetupError && (
                <div className="flex items-center gap-2 text-xs text-red-700">
                  <i className="bi bi-exclamation-circle" />
                  {mfaSetupError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setDisableOpen(false); setTotpCode(''); setPassword(''); }}
                  className="flex-1 py-2 rounded-lg border border-safe-border text-sm text-safe-text-gray hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisable}
                  disabled={mfaSetupLoading || !password || totpCode.length !== 6}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {mfaSetupLoading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MFACard;