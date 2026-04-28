import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../authSlice';
import { validateEmail } from '@/utils/egyptianValidation';
import LoginLayout from '../components/LoginLayout.jsx';
import Button from '@/components/ui/Button.jsx';
import Checkbox from '@/components/ui/Checkbox.jsx';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if already authenticated - ONLY ONCE
  useEffect(() => {
    if (isAuthenticated && !isSubmitting) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, isSubmitting]);

  // Validate email on blur
  const handleEmailBlur = () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    
    const { valid, error: validationError } = validateEmail(email);
    if (!valid) {
      setEmailError(validationError);
    } else {
      setEmailError('');
    }
  };

  // Validate password on blur
  const handlePasswordBlur = () => {
    if (!password) {
      setPasswordError('Password is required');
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
    } else {
      setPasswordError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting || loading) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Clear previous errors
    dispatch(clearError());
    setEmailError('');
    setPasswordError('');

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      setIsSubmitting(false);
      return;
    }
    const { valid: emailValid, error: emailValidationError } = validateEmail(email);
    if (!emailValid) {
      setEmailError(emailValidationError);
      setIsSubmitting(false);
      return;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      setIsSubmitting(false);
      return;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      setIsSubmitting(false);
      return;
    }

    // Attempt login
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      
      // Handle special cases
      if (result.mustChangePassword) {
        // Navigate to profile — ProtectedRoute will let us through since isAuthenticated is now true
        navigate('/profile', { replace: true, state: { mustChangePassword: true } });
        return;
      }
      
      if (result.mfaRequired) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
        return;
      }

      // Successful login - redirect
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <LoginLayout
      title="Sign In"
      subtitle="Access your admin dashboard"
      leftTitle={'Welcome to Accident\nPrevention System'}
      leftDescription="Monitor real-time traffic, manage emergency responses, and prevent accidents with AI-powered analytics and smart city infrastructure."
      leftBullets={[
        'Real-time monitoring and alerts.',
        'AI-powered accident prediction.',
        'Smart city infrastructure integration.',
      ]}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Global error message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <i className="bi bi-exclamation-circle text-red-600 text-lg mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Login Failed</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-safe-text-dark">
            Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-safe-text-gray/60">
              <i className="bi bi-envelope text-xs" />
            </span>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border ${emailError ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-safe-border focus:ring-safe-blue-btn/20 focus:border-safe-blue-btn'} bg-safe-bg/40 text-safe-text-dark placeholder:text-safe-text-gray focus:outline-none focus:ring-2`}
              disabled={loading || isSubmitting}
            />
          </div>
          {emailError && (
            <p className="text-xs text-red-600 mt-1">{emailError}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-safe-text-dark">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-safe-text-gray/60">
              <i className="bi bi-lock text-xs" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handlePasswordBlur}
              className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border ${passwordError ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-safe-border focus:ring-safe-blue-btn/20 focus:border-safe-blue-btn'} bg-safe-bg/40 text-safe-text-dark placeholder:text-safe-text-gray focus:outline-none focus:ring-2`}
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center min-w-[44px] min-h-[44px] text-safe-text-gray/70 text-xs hover:text-safe-text-gray"
              disabled={loading || isSubmitting}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <i className={`bi bi-eye${showPassword ? '-slash' : ''}`} />
            </button>
          </div>
          {passwordError && (
            <p className="text-xs text-red-600 mt-1">{passwordError}</p>
          )}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between text-xs">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setRemember(!remember)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRemember(!remember); } }}
            className="flex items-center gap-2 text-safe-text-dark cursor-pointer"
            aria-pressed={remember}
          >
            <Checkbox
              checked={remember}
              onChange={setRemember}
              className="w-4 h-4 shadow-none"
            />
            <span>Remember me</span>
          </div>
          <Link
            to="/forgot-password"
            className="text-safe-blue-btn hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* MFA info row */}
        <div className="flex items-start gap-3 rounded-lg border border-safe-border bg-safe-bg/60 px-3 py-3">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <i className="bi bi-shield text-safe-blue-btn text-lg font-bold" />
          </div>
          <div className="text-[11px] leading-relaxed text-safe-text-dark">
            <p className="font-semibold text-safe-text-dark mb-0.5">
              Multi-Factor Authentication
            </p>
            <p>
              For enhanced security, MFA will be required after sign in.
            </p>
          </div>
        </div>

        {/* Primary button */}
        <Button
          variant="primary"
          size="md"
          className="w-full"
          type="submit"
          disabled={loading || isSubmitting}
        >
          {loading || isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Signing In...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </LoginLayout>
  );
}

export default SignIn;