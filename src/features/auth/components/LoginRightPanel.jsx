import Card from '@/components/ui/Card.jsx';

/**
 * Card shell for auth forms (right side).
 * Modern refined design with smooth animations.
 */
function AuthRightPanel({
  icon,
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="w-full max-w-md animate-scaleIn">
      <Card variant="elevated" className="rounded-2xl flex flex-col overflow-hidden">
        {/* Icon + Header */}
        {(icon || title || subtitle) && (
          <div className="px-12 pt-12 pb-8 text-center bg-gradient-to-b from-safe-bg to-white">
            {icon && (
              <div className="flex justify-center mb-6 animate-slideUp">
                <div className="text-safe-blue text-4xl">{icon}</div>
              </div>
            )}
            {title && (
              <h1 className="font-display text-3xl font-bold text-safe-text-dark animate-slideUp stagger-1">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-3 text-sm text-safe-text-gray font-light leading-relaxed animate-slideUp stagger-2">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Main content */}
        <div className="px-12 py-8 flex-1 flex flex-col gap-5 text-sm animate-slideUp stagger-3">
          {children}
        </div>

        {/* Optional footer area */}
        {footer && (
          <div className="px-12 py-4 bg-safe-bg text-xs text-safe-text-gray border-t border-safe-border/50 font-light">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}

export default AuthRightPanel;
