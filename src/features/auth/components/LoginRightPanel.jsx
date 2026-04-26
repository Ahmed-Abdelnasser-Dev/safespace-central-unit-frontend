import Card from '@/components/ui/Card.jsx';

/**
 * Card shell for auth forms (right side).
 * Optional Icon / Title / subtitle / footer text can be overridden per screen.
 */
function AuthRightPanel({
  icon,
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="w-full max-w-lg">
      <Card className="rounded-3xl bg-white border border-safe-border shadow-none flex flex-col">
        {/* Icon + Header */}
        {(icon || title || subtitle) && (
          <div className="px-14 pt-10 text-center">
            {icon && (
              <div className="flex justify-center mb-4">
                {icon}
              </div>
            )}
            {title && (
              <h1 className="text-3xl font-bold text-safe-text-dark">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-2 text-sm text-safe-text-gray">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Main content – tighter spacing */}
        <div className="px-14 pt-4 pb-9 flex-1 flex flex-col gap-4 text-sm">
          {children}
        </div>

        {/* Optional footer area inside the card */}
        {footer && (
          <div className="px-14 py-4 bg-safe-bg text-xs text-safe-text-gray border-t border-safe-border">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}

export default AuthRightPanel;
