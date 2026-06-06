import { useNavigate, useLocation } from 'react-router-dom';
import LoginLayout from '../components/LoginLayout.jsx';
import Button from '@/components/ui/Button.jsx';

function CheckYourEmail() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Email is passed from ForgotPasswordPage via navigate('/check-email', { state: { email } })
  const email = location.state?.email || '';

  return (
    <LoginLayout
      title="Check Your Email"
      subtitle="We've sent password reset instructions to"
      icon={
        <div className="w-20 h-20 rounded-full bg-safe-success/10 flex items-center justify-center">
          <i className="bi bi-check2-circle text-safe-success text-5xl" />
        </div>
      }
      leftTitle={'Account Recovery'}
      leftDescription="We'll help you regain access to your account securely. Enter your email to receive password reset instructions."
      leftBullets={[
        'Secure password reset process',
        'Protected against unauthorized access',
        'Guided recovery steps',
      ]}
    >
      {/* Submitted email */}
      {email && (
        <div className="text-center mb-4">
          <p className="text-md font-semibold text-safe-text-dark">{email}</p>
        </div>
      )}

      {/* Info box */}
      <div className="rounded-lg border border-safe-border bg-safe-bg/60 px-4 py-3 text-md text-safe-text-gray mb-5 text-center">
        The link expires in <strong>1 hour</strong>. Didn&apos;t receive the email? Check your spam
        folder or{' '}
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-safe-blue-btn hover:underline font-medium"
        >
          try again
        </button>
        .
      </div>

      {/* Back to sign-in */}
      <Button
        variant="primary"
        size="md"
        className="w-full"
        type="button"
        onClick={() => navigate('/sign-in')}
      >
        Back to Sign In
      </Button>
    </LoginLayout>
  );
}

export default CheckYourEmail;