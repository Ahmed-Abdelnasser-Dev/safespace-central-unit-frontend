import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../authSlice';
import LoginLayout from '../components/LoginLayout.jsx';
import Button from '@/components/ui/Button.jsx';

function TwoFactorAuth() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const dispatch    = useDispatch();
  const inputsRef   = useRef([]);

  const [codes, setCodes]     = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // userId and rememberMe forwarded from SignInPage via navigate(state)
  const userId     = location.state?.userId;
  const rememberMe = location.state?.rememberMe ?? false;

  // Guard: no userId means someone navigated here directly — send them back
  useEffect(() => {
    if (!userId) navigate('/sign-in', { replace: true });
  }, [userId, navigate]);

  // ── Input handlers ──────────────────────────────────────────────────────────

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...codes];
    next[index] = value;
    setCodes(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft'  && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputsRef.current[index + 1]?.focus();
    if (e.key === 'Enter') handleVerify();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setCodes(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Verify ──────────────────────────────────────────────────────────────────

  const handleVerify = async () => {
    const code = codes.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { authAPI, userAPI } = await import('@/services/api');

      // 1. Verify TOTP — backend sets HttpOnly auth cookies on success
      await authAPI.verifyMFA(userId, code, rememberMe);

      // 2. Fetch the user profile now that the cookie is in place
      const user = await userAPI.getMe();

      // 3. Persist the user in the right storage depending on rememberMe
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(user));
        sessionStorage.removeItem('user');
      } else {
        sessionStorage.setItem('user', JSON.stringify(user));
        localStorage.removeItem('user');
      }

      // 4. Update Redux so isAuthenticated becomes true and ProtectedRoute lets us through
      dispatch(setUser(user));

      // 5. Navigate to dashboard
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
      setCodes(Array(6).fill(''));
      setTimeout(() => inputsRef.current[0]?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <LoginLayout
      title="Two-Factor Authentication"
      subtitle="Enter the 6-digit code from your authenticator app"
      icon={
        <div className="w-16 h-16 rounded-full bg-safe-blue-btn/5 flex items-center justify-center">
          <i className="bi bi-shield-lock text-safe-blue-btn text-3xl" />
        </div>
      }
      leftTitle="Enhanced Security"
      leftDescription="Multi-factor authentication adds an extra layer of security to your account, ensuring that only you can access critical system functions."
      leftBullets={[
        'Time-based one-time passwords (TOTP)',
        'Protected against unauthorized access',
        'Compatible with Google Authenticator, Authy, and more',
      ]}
    >
      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <i className="bi bi-exclamation-circle" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 6 digit input boxes */}
      <div className="flex justify-center gap-3 mb-5" onPaste={handlePaste}>
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
            autoFocus={idx === 0}
            className={`w-11 h-11 text-center text-lg font-semibold rounded-lg border bg-safe-bg/40 text-safe-text-dark focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/30 focus:border-safe-blue-btn transition-colors ${
              value ? 'border-safe-blue-btn' : 'border-safe-border'
            }`}
            disabled={loading}
          />
        ))}
      </div>

      <Button
        variant="primary"
        size="md"
        className="w-full"
        type="button"
        onClick={handleVerify}
        disabled={loading || codes.join('').length !== 6}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Verifying...
          </span>
        ) : 'Verify Code'}
      </Button>

      <div className="mt-4 space-y-2 text-center">
        <p className="text-xs text-safe-text-gray/70">
          Can&apos;t access your authenticator?{' '}
          <span className="text-safe-text-gray">Use one of your 8-character backup codes instead.</span>
        </p>
        <Link
          to="/sign-in"
          className="inline-flex items-center gap-1 text-xs text-safe-text-gray hover:underline"
        >
          <span>←</span>
          <span>Back to Sign In</span>
        </Link>
      </div>
    </LoginLayout>
  );
}

export default TwoFactorAuth;