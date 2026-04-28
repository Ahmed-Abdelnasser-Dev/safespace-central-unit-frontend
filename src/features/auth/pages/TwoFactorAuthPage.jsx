import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginLayout from '../components/LoginLayout.jsx';
import Button from '@/components/ui/Button.jsx';

function TwoFactorAuth() {
  const navigate = useNavigate();
  const inputsRef = useRef([]);
  const [codes, setCodes] = useState(Array(6).fill(''));

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // allow single digit only

    const next = [...codes];
    next[index] = value;
    setCodes(next);

    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = codes.join('');
    if (code.length === 6) {
      navigate('/you-are-all-set');
    }
  };

  return (
    <LoginLayout
      title="Verify Your Account"
      subtitle="Enter the 6-digit code sent to your email"
      icon={
        <div className="w-16 h-16 rounded-full bg-safe-blue/10 flex items-center justify-center">
          <i className="bi bi-shield-check text-safe-blue text-3xl" />
        </div>
      }
      leftTitle={'Two-Factor\nAuthentication'}
      leftDescription="Multi-factor authentication adds an extra layer of security to your account, ensuring that only you can access critical system functions."
      leftBullets={[
        'Time-based one-time passwords',
        'Protected against unauthorized access',
        'Secure verification codes',
      ]}
    >
      {/* Email under subtitle */}
      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-safe-text-dark">
          example@gmail.com
        </p>
      </div>

      {/* Code boxes */}
      <div className="flex justify-center gap-3 mb-8">
        {codes.map((value, idx) => (
          <input
            key={idx}
            ref={(el) => (inputsRef.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className="w-12 h-12 text-center text-2xl font-bold rounded-lg border-2 border-safe-border/60 hover:border-safe-border bg-white text-safe-text-dark focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-safe-blue/20 focus:border-safe-blue transition-all duration-200"
          />
        ))}
      </div>

      {/* Verify button */}
      <Button
        variant="primary"
        size="md"
        className="w-full font-semibold"
        type="button"
        onClick={handleVerify}
      >
        Verify Code
      </Button>

      {/* Resend + back */}
      <div className="mt-8 space-y-4 text-center">
        <p className="text-sm text-safe-text-gray font-light">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            className="text-safe-blue hover:text-safe-blue-light font-semibold transition-colors duration-150"
          >
            Resend Code
          </button>
        </p>
        <div className="border-t border-safe-border/30 pt-4">
          <Link
            to="/sign-in"
            className="inline-flex items-center gap-2 text-xs font-medium text-safe-text-gray hover:text-safe-text-dark transition-colors duration-150"
          >
            <span>←</span>
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </LoginLayout>
  );
}

export default TwoFactorAuth;
