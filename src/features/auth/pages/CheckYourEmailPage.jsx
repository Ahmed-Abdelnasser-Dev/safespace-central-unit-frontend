import { useNavigate } from 'react-router-dom';
import LoginLayout from '../components/LoginLayout.jsx';
import Button from '@/components/ui/Button.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function CheckYourEmail() {
  const navigate = useNavigate();

  return (
    <LoginLayout
      title="Check Your Email"
      subtitle="We've sent password reset instructions to your email"
      icon={
        <div className="w-20 h-20 rounded-full bg-safe-success/10 flex items-center justify-center animate-scaleIn">
          <FontAwesomeIcon icon="envelope-circle-check" className="text-safe-success text-5xl" />
        </div>
      }
      leftTitle={'Account Recovery'}
      leftDescription="We'll help you regain access to your account securely. Check your inbox for the password reset link."
      leftBullets={[
        'Secure password reset process',
        'Protected against unauthorized access',
        'Guided recovery steps',
      ]}
    >
      {/* Email line */}
      <div className="text-center mb-8">
        <p className="text-base font-semibold text-safe-text-dark">
          example@gmail.com
        </p>
      </div>

      {/* Info box */}
      <div className="rounded-lg border border-safe-success/20 bg-safe-success/5 px-5 py-4 text-sm text-safe-text-dark mb-6 text-center font-light leading-relaxed animate-slideUp">
        <p>Follow the link in your email to reset your password. The link will expire in 24 hours.</p>
      </div>

      {/* Spam notice */}
      <div className="rounded-lg border border-safe-info/20 bg-safe-info/5 px-5 py-4 text-xs text-safe-text-gray/80 mb-8 animate-slideUp stagger-1">
        <p className="font-medium text-safe-info mb-2">💡 Tip:</p>
        <p>Didn&apos;t see the email? Check your spam or promotions folder. You can also request a new code if needed.</p>
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
