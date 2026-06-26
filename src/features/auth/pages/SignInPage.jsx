import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../authSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
      const result = await dispatch(loginUser({ email, password, rememberMe: remember })).unwrap();
      
      // Handle special cases
      if (result.mustChangePassword) {
        // Navigate to profile — ProtectedRoute will let us through since isAuthenticated is now true
        navigate('/profile', { replace: true, state: { mustChangePassword: true } });
        return;
      }
      
      if (result.mfaRequired) {
        navigate('/two-factor', { 
          replace: true, 
          state: { userId: result.userId, rememberMe: remember, from: location.state?.from } 
        });
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
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Global error message */}
        {error && (
          <div className="rounded-lg border border-safe-danger/30 bg-safe-danger/5 px-4 py-3 animate-slideUp">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon="circle-exclamation" className="text-safe-danger text-lg mt-0.5 flex-shrink-0" />
              <div className="text-sm text-safe-danger/80 flex-1">
                <p className="font-semibold mb-1">Sign In Failed</p>
                <p className="text-xs opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Email */}
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
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              className={`w-full pl-11 pr-4 py-3 text-sm rounded-lg border bg-white dark:bg-safe-gray text-safe-text-dark placeholder:text-safe-text-gray/50 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${emailError ? 'border-safe-danger focus:ring-safe-danger/20 focus:border-safe-danger' : 'border-safe-border/60 dark:border-safe-border hover:border-safe-border focus:ring-safe-blue/20 focus:border-safe-blue'} disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-safe-gray-light`}
              disabled={loading || isSubmitting}
              autoComplete="email"
            />
          </div>
          {emailError && (
            <p className="text-xs text-safe-danger font-medium animate-slideUp">{emailError}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="font-display text-sm font-semibold text-safe-text-dark">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-safe-text-gray/50">
              <FontAwesomeIcon icon="lock" className="text-sm" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handlePasswordBlur}
              className={`w-full pl-11 pr-12 py-3 text-sm rounded-lg border bg-white dark:bg-safe-gray text-safe-text-dark placeholder:text-safe-text-gray/50 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${passwordError ? 'border-safe-danger focus:ring-safe-danger/20 focus:border-safe-danger' : 'border-safe-border/60 dark:border-safe-border hover:border-safe-border focus:ring-safe-blue/20 focus:border-safe-blue'} disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-safe-gray-light`}
              disabled={loading || isSubmitting}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-safe-text-gray/60 hover:text-safe-text-dark transition-colors duration-150"
              disabled={loading || isSubmitting}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <FontAwesomeIcon icon={showPassword ? 'eye-slash' : 'eye'} className="text-sm" />
            </button>
          </div>
          {passwordError && (
            <p className="text-xs text-safe-danger font-medium animate-slideUp">{passwordError}</p>
          )}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between text-xs">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setRemember(!remember)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRemember(!remember); } }}
            className="flex items-center gap-2.5 text-safe-text-dark cursor-pointer hover:text-safe-text-dark/70 transition-colors"
            aria-pressed={remember}
          >
            <Checkbox
              checked={remember}
              onChange={setRemember}
              className="w-4 h-4"
            />
            <span className="font-medium">Remember me</span>
          </div>
          <Link
            to="/forgot-password"
            className="text-safe-blue hover:text-safe-blue-light font-medium transition-colors duration-150"
          >
            Forgot password?
          </Link>
        </div>

        {/* Security info */}
        <div className="flex items-start gap-3 rounded-lg border border-safe-info/20 bg-safe-info/5 px-4 py-3">
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FontAwesomeIcon icon="shield-halved" className="text-safe-info text-sm" />
          </div>
          <div className="text-xs leading-relaxed text-safe-text-dark">
            <p className="font-semibold text-safe-text-dark/90 mb-1">
              Enhanced Security
            </p>
            <p className="text-safe-text-gray/80">
              Multi-factor authentication will be required after sign in.
            </p>
          </div>
        </div>

        {/* Primary button */}
        <Button
          variant="primary"
          size="md"
          className="w-full font-semibold"
          type="submit"
          disabled={loading || isSubmitting}
          isLoading={loading || isSubmitting}
        >
          {!loading && !isSubmitting && 'Sign In'}
        </Button>
      </form>
    </LoginLayout>
  );
}

export default SignIn;