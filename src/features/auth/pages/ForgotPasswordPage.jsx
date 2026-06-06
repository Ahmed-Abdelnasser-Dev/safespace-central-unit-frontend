import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearPasswordResetState } from '../authSlice';
import LoginLayout from '../components/LoginLayout.jsx';
import Button from '@/components/ui/Button.jsx';

function ForgotPassword() {
  const [email,      setEmail]      = useState('');
  const [emailError, setEmailError] = useState('');

  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { passwordResetLoading, passwordResetError, passwordResetSuccess } =
    useSelector((state) => state.auth);

  // Clear stale state when this page mounts
  useEffect(() => {
    dispatch(clearPasswordResetState());
  }, [dispatch]);

  // Navigate to confirmation page when backend responds
  useEffect(() => {
    if (passwordResetSuccess) {
      navigate('/check-email', { state: { email } });
    }
  }, [passwordResetSuccess, navigate, email]);

  const validateEmail = (value) => {
    if (!value.trim())                          return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    dispatch(forgotPassword({ email }));
  };

  return (
    <LoginLayout
      title="Forgot Password?"
      subtitle="Enter your email and we'll send you instructions to reset your password"
      leftTitle={'Account Recovery'}
      leftDescription="We'll help you regain access to your account securely. Enter your email to receive password reset instructions."
      leftBullets={[
        'Secure password reset process',
        'Protected against unauthorized access',
        'Guided recovery steps',
      ]}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Server / network error */}
        {passwordResetError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <i className="bi bi-exclamation-circle text-red-600 text-lg mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Request Failed</p>
                <p>{passwordResetError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Email field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-safe-text-dark">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-safe-text-gray/60">
              <i className="bi bi-envelope text-xs" />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
              onBlur={() => setEmailError(validateEmail(email))}
              placeholder="Enter your email"
              disabled={passwordResetLoading}
              className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border ${
                emailError
                  ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                  : 'border-safe-border focus:ring-safe-blue-btn/20 focus:border-safe-blue-btn'
              } bg-safe-bg/40 text-safe-text-dark placeholder:text-safe-text-gray-light focus:outline-none focus:ring-2`}
            />
          </div>
          {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
        </div>

        {/* Primary button */}
        <Button
          variant="primary"
          size="md"
          className="w-full"
          type="submit"
          disabled={passwordResetLoading}
        >
          {passwordResetLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Sending...
            </span>
          ) : (
            'Send Reset Instructions'
          )}
        </Button>
      </form>

      {/* Back link */}
      <div className="mt-4 text-[11px] text-safe-text-gray text-center">
        <Link
          to="/sign-in"
          className="inline-flex items-center gap-1 hover:underline"
        >
          <span className="text-xs text-safe-text-gray">←</span>
          <span>Back to Sign In</span>
        </Link>
      </div>
    </LoginLayout>
  );
}

export default ForgotPassword;
