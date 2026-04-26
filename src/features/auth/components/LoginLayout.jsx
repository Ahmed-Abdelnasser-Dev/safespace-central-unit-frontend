// src/components/AuthLayout.jsx
import LoginLeftPanel from './LoginLeftPanel.jsx';
import LoginRightPanel from './LoginRightPanel.jsx';

/**
 * 2-column auth layout (left hero + right form card)
 */
function LoginLayout({
  children,
  title,
  subtitle,
  icon,          // optional icon
  leftTitle,
  leftDescription,
  leftBullets,
}) {
  return (
    <div className="min-h-screen w-full bg-safe-bg flex items-center">
      {/* Left hero */}
      <div className="w-1/2 h-[80vh] flex items-center">
        <LoginLeftPanel
          title={leftTitle}
          description={leftDescription}
          bullets={leftBullets}
        />
      </div>

      {/* Right card – centered in its half */}
      <div className="w-1/2 h-[80vh] flex items-center justify-center px-16">
        <LoginRightPanel icon={icon} title={title} subtitle={subtitle}>
          {children}
        </LoginRightPanel>
      </div>
    </div>
  );
}

export default LoginLayout;
