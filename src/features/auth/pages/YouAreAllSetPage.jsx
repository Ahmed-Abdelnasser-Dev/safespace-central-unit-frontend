import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginLayout from '../components/LoginLayout.jsx';

function YouAreAllSet() {
  const navigate = useNavigate();

  useEffect(() => {
    const id = setTimeout(() => {
      navigate('/'); // main app screen
    }, 3000);

    return () => clearTimeout(id);
  }, [navigate]);

 return (
  <LoginLayout
    title="Welcome Back!"
    subtitle="You have successfully verified your account"
    icon={
      <div className="w-20 h-20 rounded-full bg-safe-success/10 flex items-center justify-center animate-scaleIn">
        <i className="bi bi-check-circle-fill text-safe-success text-6xl animate-bounce" />
      </div>
    }
    leftTitle={"You're All Set!"}
    leftDescription="Welcome to the Accident Prevention Admin System. Your authentication is complete and secure."
    leftBullets={[]}
  >
    {/* Email line close to subtitle */}
    <div className="text-center mb-8">
      <p className="text-base font-semibold text-safe-text-dark">
        example@gmail.com
      </p>
    </div>

    {/* Status box */}
    <div className="rounded-lg border border-safe-success/20 bg-safe-success/5 px-5 py-4 text-center mb-6 animate-slideUp stagger-1">
      <p className="text-sm font-light text-safe-text-dark leading-relaxed">
        Redirecting to your dashboard in 3 seconds...
      </p>
    </div>

    {/* Flow summary */}
    <div className="rounded-lg border border-safe-blue/20 bg-safe-blue/5 px-5 py-4 text-sm animate-slideUp stagger-2">
      <p className="font-semibold text-safe-text-dark mb-3">Authentication Complete</p>
      <ul className="space-y-2.5 text-safe-text-gray/80 font-light">
        <li className="flex items-start gap-3">
          <span className="w-5 h-5 rounded-full bg-safe-success flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">✓</span>
          <span>Email verification</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="w-5 h-5 rounded-full bg-safe-success flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">✓</span>
          <span>Multi-factor authentication</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="w-5 h-5 rounded-full bg-safe-success flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">✓</span>
          <span>Secure session created</span>
        </li>
      </ul>
    </div>
  </LoginLayout>
);
}

export default YouAreAllSet;
