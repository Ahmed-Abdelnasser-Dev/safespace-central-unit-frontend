import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Reusable page header with icon, title, description, and optional action buttons.
 */
function PageHeader({ title, description, icon, actions }) {
  return (
    <div className="flex items-start justify-between gap-6 mb-10 animate-slideUp">
      <div className="flex items-start gap-4 flex-1">
        {icon && (
          <div className="w-14 h-14 bg-gradient-to-br from-safe-blue/20 to-safe-blue/5 rounded-xl flex items-center justify-center flex-shrink-0 border border-safe-blue/30 group hover:from-safe-blue/30 transition-all duration-200">
            <FontAwesomeIcon icon={icon} className="text-safe-blue text-xl group-hover:scale-110 transition-transform duration-200" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">{title}</h1>
          {description && <p className="text-base text-safe-text-gray/80 mt-2 font-light max-w-2xl leading-relaxed">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0 animate-slideUp stagger-1">{actions}</div>}
    </div>
  );
}

export default PageHeader;
