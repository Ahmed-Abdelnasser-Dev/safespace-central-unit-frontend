function ListItem({
  title,
  subtitle = null,
  actions = [],
  leadingIcon = null,
  leadingColor = '',
  leadingBg = '',
  className = '',
}) {
  return (
    <div
      className={`p-3 border border-safe-gray-light rounded-lg hover:bg-safe-gray transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {leadingIcon && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: leadingBg, color: leadingColor }}
            >
              {leadingIcon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-safe-text-primary truncate">{title}</p>
            {subtitle && (
              <p className="text-xs text-safe-text-muted truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {actions.length > 0 && (
          <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  action.variant === 'danger'
                    ? 'text-safe-danger hover:bg-safe-danger/10'
                    : action.variant === 'primary'
                      ? 'text-white bg-safe-blue-btn hover:bg-safe-blue-light'
                      : 'text-safe-blue hover:bg-safe-blue/10'
                }`}
              >
                {action.icon && <>{action.icon} </>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListItem;
