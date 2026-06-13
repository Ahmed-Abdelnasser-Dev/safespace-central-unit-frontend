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
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Email field */}
        <div className="space-y-2">
          <label className="font-display text-sm font-semibold text-safe-text-dark">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-safe-text-gray/50">
              <i className="bi bi-envelope text-sm" />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full pl-11 pr-4 py-3 text-sm rounded-lg border border-safe-border/60 hover:border-safe-border bg-white text-safe-text-dark placeholder:text-safe-text-gray/50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-safe-blue/20 focus:border-safe-blue transition-all duration-200 disabled:opacity-60 disabled:bg-safe-gray-light"
            />
          </div>
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
          type="button"
          onClick={() => navigate('/check-email')}
        >
          Send Reset Instructions
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
