import logoSrc from '@/assets/icons/LA.svg';
import authBg from '@/assets/images/images.jpg';

/**
 * Left hero panel for all auth screens.
 * Background image with blue gradient overlay + text + bullets.
 */
function AuthLeftPanel({ title, description, bullets = [] }) {
  const titleLines = (title || '').split('\n');

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      {/* Background image */}
      <img
        src={authBg}
        alt="Traffic infrastructure"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
<div
  className="absolute inset-0"
  style={{
    background: `linear-gradient(
      135deg,
      rgba(10, 25, 50, 0.95) 40%,
      rgba(12, 30, 60, 0.90) 60%,
      rgba(15, 45, 100, 0.80) 100%
    )`
  }}
/>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-24 pt-24 pb-24 text-white">
        {/* Logo */}
        <div className="mb-8">
          <img src={logoSrc} alt="Safe Space logo" className="w-24 h-24" />
        </div>

        <div className="max-w-xl">
          {/* Title (optional) */}
          {title && (
            <h1 className="text-4xl font-bold leading-snug mb-5">
              {titleLines.map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < titleLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
          )}

          {/* Description (optional) */}
          {description && (
            <p className="text-lg text-white/85 leading-relaxed mb-7">
              {description}
            </p>
          )}

          {/* Bullets (optional) */}
          {bullets.length > 0 && (
            <ul className="space-y-3 text-sm text-white/90">
              {bullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-safe-blue" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthLeftPanel;
