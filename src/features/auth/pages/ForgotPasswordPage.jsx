import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginLayout from '../components/LoginLayout.jsx';
import Button from '@/components/ui/Button.jsx';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  return (
    <LoginLayout
      title="Forgot Password?"
      subtitle="Enter your email and we’ll send you instructions to reset your password"
      leftTitle={'Account Recovery'}
      leftDescription="We’ll help you regain access to your account securely. Enter your email to receive password reset instructions."
      leftBullets={[
        'Secure password reset process',
        'Protected against unauthorized access',
        'Guided recovery steps',
      ]}
    >
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-safe-border bg-safe-bg/40 text-safe-text-dark placeholder:text-safe-text-gray-light focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/20 focus:border-safe-blue-btn"
            />
          </div>
        </div>

        {/* Primary button */}
        <Button
          variant="primary"
          size="md"
          className="w-full"
          type="button"
          onClick={() => navigate('/check-email')}
        >
          Send Reset Instructions
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
