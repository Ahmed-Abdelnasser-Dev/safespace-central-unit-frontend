import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearPasswordResetState } from '../authSlice';
import LoginLayout from '../components/LoginLayout.jsx';
import Button from '@/components/ui/Button.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Server / network error */}
        {passwordResetError && (
          <div className="rounded-lg border border-safe-danger/20 bg-safe-danger/5 px-4 py-3">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon="circle-exclamation" className="text-safe-danger text-lg mt-0.5 flex-shrink-0" />
              <div className="text-sm text-safe-text-dark">
                <p className="font-semibold mb-1">Request Failed</p>
                <p>{passwordResetError}</p>
              </div>
            </div>
          </div>
        )}


        {/* Email field */}
        <div className="space-y-2">
          <label className="font-display text-sm font-semibold text-safe-text-dark">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-safe-text-gray/50">
              <FontAwesomeIcon icon="envelope" className="text-sm" />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
              onBlur={() => setEmailError(validateEmail(email))}
              placeholder="name@company.com"
              disabled={passwordResetLoading}
              className="w-full pl-11 pr-4 py-3 text-sm rounded-lg border border-safe-border/60 dark:border-safe-border hover:border-safe-border bg-white dark:bg-safe-gray text-safe-text-dark placeholder:text-safe-text-gray/50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-safe-blue/20 focus:border-safe-blue transition-all duration-200 disabled:opacity-60 disabled:bg-safe-gray-light"
            />
          </div>
          {emailError && <p className="text-xs text-safe-danger mt-1">{emailError}</p>}
        </div>

        {/* Info box */}
        <div className="rounded-lg border border-safe-info/20 bg-safe-info/5 px-4 py-3">
          <p className="text-xs text-safe-text-dark/80 leading-relaxed font-light">
            We'll send you an email with a secure link to reset your password. The link will expire in 24 hours.
          </p>
        </div>

        {/* Primary button */}
        <Button
          variant="primary"
          size="md"
          className="w-full font-semibold"
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
      <div className="mt-6 text-xs text-safe-text-gray text-center">
        <Link
          to="/sign-in"
          className="inline-flex items-center gap-2 hover:text-safe-text-dark transition-colors duration-150 font-medium"
        >
          <span>←</span>
          <span>Back to Sign In</span>
        </Link>
      </div>
    </LoginLayout>
  );
}

export default ForgotPassword;
