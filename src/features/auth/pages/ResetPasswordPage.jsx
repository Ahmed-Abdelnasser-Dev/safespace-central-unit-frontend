import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearPasswordResetState } from '../authSlice';
import LoginLayout from '../components/LoginLayout.jsx';
import Button from '@/components/ui/Button.jsx';

// Password rules — must match backend auth.schema.js strongPassword
const RULES = [
  { test: (v) => v.length >= 8,           label: 'At least 8 characters' },
  { test: (v) => /[A-Z]/.test(v),         label: 'One uppercase letter'  },
  { test: (v) => /[a-z]/.test(v),         label: 'One lowercase letter'  },
  { test: (v) => /[0-9]/.test(v),         label: 'One number'            },
  { test: (v) => /[^A-Za-z0-9]/.test(v),  label: 'One special character' },
];

function validateNewPassword(value) {
  for (const rule of RULES) {
    if (!rule.test(value)) return `${rule.label} is required`;
  }
  return '';
}

function ResetPassword() {
  const [searchParams]   = useSearchParams();
  const token            = searchParams.get('token') || '';

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [newPassError,    setNewPassError]    = useState('');
  const [confirmError,    setConfirmError]    = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { passwordResetLoading, passwordResetError, passwordResetSuccess } =
    useSelector((state) => state.auth);

  // Clear stale state on mount
  useEffect(() => { dispatch(clearPasswordResetState()); }, [dispatch]);

  // Redirect to sign-in 2.5s after success
  useEffect(() => {
    if (!passwordResetSuccess) return;
    const id = setTimeout(() => navigate('/sign-in', { replace: true }), 2500);
    return () => clearTimeout(id);
  }, [passwordResetSuccess, navigate]);

  // No token in URL — show error state
  if (!token) {
    return (
      <LoginLayout
        title="Invalid Link"
        subtitle="This password reset link is missing or malformed."
        leftTitle={'Account Recovery'}
        leftDescription="Request a new password reset link from the Forgot Password page."
        leftBullets={[]}
      >
        <Button variant="primary" size="md" className="w-full" type="button"
          onClick={() => navigate('/forgot-password')}>
          Request a New Link
        </Button>
      </LoginLayout>
    );
  }

  // Success state
  if (passwordResetSuccess) {
    return (
      <LoginLayout
        title="Password Reset"
        subtitle="Your password has been updated successfully."
        icon={
          <div className="w-20 h-20 rounded-full bg-safe-success/10 flex items-center justify-center">
            <i className="bi bi-check2-circle text-safe-success text-5xl" />
          </div>
        }
        leftTitle={'Account Recovery'}
        leftDescription="Your password has been changed. All previous sessions have been signed out for your security."
        leftBullets={[
          'Secure password reset process',
          'Previous sessions revoked',
          'Sign in with your new password',
        ]}
      >
        <div className="rounded-lg border border-safe-border bg-safe-bg/60 px-4 py-3 text-sm text-safe-text-gray mb-5 text-center">
          Redirecting to sign in&hellip;
        </div>
        <Button variant="primary" size="md" className="w-full" type="button"
          onClick={() => navigate('/sign-in', { replace: true })}>
          Sign In Now
        </Button>
      </LoginLayout>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const pe = validateNewPassword(newPassword);
    const ce = confirmPassword !== newPassword ? 'Passwords do not match' : '';
    setNewPassError(pe);
    setConfirmError(ce);
    if (pe || ce) return;
    dispatch(resetPassword({ token, newPassword }));
  };

  return (
    <LoginLayout
      title="Reset Password"
      subtitle="Choose a strong new password for your account"
      leftTitle={'Account Recovery'}
      leftDescription="Set a new password below. For your security, all other active sessions will be signed out."
      leftBullets={[
        'Secure password reset process',
        'Protected against unauthorized access',
        'Previous sessions will be revoked',
      ]}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Token invalid / expired error */}
        {passwordResetError && (
          <div className="rounded-lg border border-safe-danger/20 bg-safe-danger/5 px-4 py-3">
            <div className="flex items-start gap-3">
              <i className="bi bi-exclamation-circle text-safe-danger text-lg mt-0.5" />
              <div className="text-sm text-safe-text-dark">
                <p className="font-semibold mb-1">Reset Failed</p>
                <p>{passwordResetError}</p>
              </div>
            </div>
            <div className="mt-3">
              <Link to="/forgot-password" className="text-xs text-safe-blue-btn hover:underline">
                Request a new reset link
              </Link>
            </div>
          </div>
        )}

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-safe-text-dark">New Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-safe-text-gray/60">
              <i className="bi bi-lock text-xs" />
            </span>
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); if (newPassError) setNewPassError(''); }}
              onBlur={() => setNewPassError(validateNewPassword(newPassword))}
              disabled={passwordResetLoading}
              className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border ${
                newPassError
                  ? 'border-safe-danger focus:ring-safe-danger/20 focus:border-safe-danger'
                  : 'border-safe-border focus:ring-safe-blue-btn/20 focus:border-safe-blue-btn'
              } bg-safe-bg/40 text-safe-text-dark placeholder:text-safe-text-gray-light focus:outline-none focus:ring-2`}
            />
            <button type="button" onClick={() => setShowNew(!showNew)} disabled={passwordResetLoading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-safe-text-gray/70 text-xs hover:text-safe-text-gray">
              <i className={`bi bi-eye${showNew ? '-slash' : ''}`} />
            </button>
          </div>
          {newPassError && <p className="text-xs text-safe-danger mt-1">{newPassError}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-safe-text-dark">Confirm New Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-safe-text-gray/60">
              <i className="bi bi-lock-fill text-xs" />
            </span>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (confirmError) setConfirmError(''); }}
              onBlur={() => setConfirmError(confirmPassword !== newPassword ? 'Passwords do not match' : '')}
              disabled={passwordResetLoading}
              className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border ${
                confirmError
                  ? 'border-safe-danger focus:ring-safe-danger/20 focus:border-safe-danger'
                  : 'border-safe-border focus:ring-safe-blue-btn/20 focus:border-safe-blue-btn'
              } bg-safe-bg/40 text-safe-text-dark placeholder:text-safe-text-gray-light focus:outline-none focus:ring-2`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} disabled={passwordResetLoading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-safe-text-gray/70 text-xs hover:text-safe-text-gray">
              <i className={`bi bi-eye${showConfirm ? '-slash' : ''}`} />
            </button>
          </div>
          {confirmError && <p className="text-xs text-safe-danger mt-1">{confirmError}</p>}
        </div>

        {/* Live password requirements checklist */}
        <div className="rounded-lg border border-safe-border bg-safe-bg/60 px-3 py-2.5">
          <p className="text-[11px] font-medium text-safe-text-dark mb-1.5">Password requirements:</p>
          <ul className="space-y-1">
            {RULES.map((rule) => {
              const passing = newPassword ? rule.test(newPassword) : null;
              return (
                <li key={rule.label} className="flex items-center gap-2 text-[11px]">
                  <i className={`bi text-xs ${
                    passing === null ? 'bi-circle text-safe-text-gray/40'
                    : passing        ? 'bi-check-circle-fill text-safe-success'
                                     : 'bi-x-circle-fill text-safe-danger'
                  }`} />
                  <span className={passing ? 'text-safe-success' : 'text-safe-text-gray'}>
                    {rule.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Submit */}
        <Button variant="primary" size="md" className="w-full" type="submit" disabled={passwordResetLoading}>
          {passwordResetLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Resetting...
            </span>
          ) : 'Reset Password'}
        </Button>
      </form>

      <div className="mt-4 text-[11px] text-safe-text-gray text-center">
        <Link to="/sign-in" className="inline-flex items-center gap-1 hover:underline">
          <span className="text-xs text-safe-text-gray">←</span>
          <span>Back to Sign In</span>
        </Link>
      </div>
    </LoginLayout>
  );
}

export default ResetPassword;