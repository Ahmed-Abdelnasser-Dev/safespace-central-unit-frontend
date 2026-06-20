import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Reusable page header with icon, title, description, and optional action buttons.
 */
function PageHeader({ title, description, icon, actions }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 bg-safe-blue/10 rounded-xl flex items-center justify-center">
            <FontAwesomeIcon icon={icon} className="text-safe-blue text-lg" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold text-safe-text-primary">{title}</h1>
          {description && <p className="text-xs text-safe-text-muted mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export default PageHeader;
