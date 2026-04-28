import logoSrc from '@/assets/icons/LA.svg';
import authBg from '@/assets/images/images.jpg';

/**
 * Left hero panel for all auth screens.
 * Modern gradient overlay with refined typography and animated content.
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

      {/* Modern gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(10, 17, 25, 0.97) 0%,
            rgba(10, 17, 25, 0.94) 30%,
            rgba(18, 24, 32, 0.92) 60%,
            rgba(59, 124, 255, 0.15) 100%
          )`
        }}
      />

      {/* Accent gradient elements */}
      <div
        className="absolute top-0 right-0 w-96 h-96 opacity-10 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(59, 124, 255, 0.8) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-24 pt-24 pb-24 text-white">
        {/* Logo with animation */}
        <div className="mb-12 animate-fadeIn">
          <img src={logoSrc} alt="Safe Space logo" className="w-20 h-20 hover:scale-105 transition-transform duration-300" />
        </div>

        <div className="max-w-2xl space-y-8 animate-slideUp">
          {/* Title with refined typography */}
          {title && (
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight space-y-2">
              {titleLines.map((line, idx) => (
                <div 
                  key={idx}
                  className="animate-slideUp"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {line}
                </div>
              ))}
            </h1>
          )}

          {/* Description */}
          {description && (
            <p className="text-lg text-white/80 leading-relaxed font-light max-w-lg animate-slideUp stagger-2">
              {description}
            </p>
          )}

          {/* Bullets with staggered animation */}
          {bullets.length > 0 && (
            <ul className="space-y-4 pt-4">
              {bullets.map((item, idx) => (
                <li 
                  key={item} 
                  className="flex items-start gap-4 text-white/85 animate-slideUp"
                  style={{ animationDelay: `${(idx + 3) * 0.1}s` }}
                >
                  <span className="w-2 h-2 rounded-full bg-gradient-to-b from-safe-blue to-safe-blue-light mt-2 flex-shrink-0" />
                  <span className="text-base leading-relaxed font-light">{item}</span>
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
