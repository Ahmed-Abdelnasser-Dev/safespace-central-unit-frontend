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
  subtitle="You have successfully signed in to"
  icon={
    <div className="w-16 h-16 rounded-full bg-safe-success/10 flex items-center justify-center">
      <i className="bi bi-check2-circle text-safe-success text-5xl" />
    </div>
  }
  leftTitle={"You're All Set!"}
  leftDescription="Welcome to the Accident Prevention Admin System. Your authentication flow is complete and ready to integrate with your dashboard."
  leftBullets={[]}
>
  {/* Email line close to subtitle */}
  <div className="text-center">
    <p className="text-md font-semibold text-safe-text-dark">
      example@gmail.com
    </p>
  </div>

  {/* Info box */}
  <div className="rounded-lg border border-safe-border bg-safe-bg/60 px-4 py-3 text-md text-safe-text-gray mb-4 text-center">
    This is a demonstration of the authentication flow. In a production
    environment, you would now be redirected to your admin dashboard.
  </div>

  {/* Flow summary */}
  <div className="rounded-lg border border-safe-blue-btn/40 bg-safe-blue-btn/5 px-4 py-3 text-md text-safe-text-dark">
    <p className="font-semibold mb-2">Authentication Flow Complete</p>
    <ul className="list-disc list-inside space-y-1 text-safe-text-gray">
      <li className="marker:text-safe-blue-btn">Sign In / Sign Up pages</li>
      <li className="marker:text-safe-blue-btn">Forgot Password flow</li>
      <li className="marker:text-safe-blue-btn">Multi-Factor Authentication</li>
      <li className="marker:text-safe-blue-btn">Password Reset</li>
    </ul>
  </div>
</LoginLayout>
);
}

export default YouAreAllSet;
