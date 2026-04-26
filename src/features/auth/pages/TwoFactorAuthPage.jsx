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
      title="Two-Factor Authentication"
      subtitle="Enter the 6-digit code sent to"
      icon={
        <div className="w-16 h-16 rounded-full bg-safe-blue-btn/5 flex items-center justify-center">
          <i className="bi bi-shield text-safe-blue-btn text-3xl" />
        </div>
      }
      leftTitle={'Enhanced Security'}
      leftDescription="Multi-factor authentication adds an extra layer of security to your account, ensuring that only you can access critical system functions."
      leftBullets={[
        'Time-based one-time passwords',
        'Protected against unauthorized access',
        'Secure verification codes',
      ]}
    >
      {/* Email under subtitle */}
      <div className="text-center mb-3">
        <p className="text-sm font-semibold text-safe-text-dark">
          example@gmail.com
        </p>
      </div>

      {/* Code boxes */}
      <div className="flex justify-center gap-3 mb-5">
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
            className="w-11 h-11 text-center text-lg font-semibold rounded-lg border border-safe-border bg-safe-bg/40 text-safe-text-dark focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/30 focus:border-safe-blue-btn"
          />
        ))}
      </div>

      {/* Verify button */}
      <Button
        variant="primary"
        size="md"
        className="w-full"
        type="button"
        onClick={handleVerify}
      >
        Verify Code
      </Button>

      {/* Resend + back */}
      <div className="mt-4 space-y-2 text-md text-safe-text-gray text-center">
        <p>
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            className="text-safe-blue-btn font-medium underline"
          >
            Resend
          </button>
        </p>
        <p>
          <Link
            to="/sign-in"
            className="inline-flex items-center gap-1 hover:underline"
          >
            <span className="text-xs text-safe-text-gray">←</span>
            <span>Back to Sign In</span>
          </Link>
        </p>
      </div>
    </LoginLayout>
  );
}

export default TwoFactorAuth;
