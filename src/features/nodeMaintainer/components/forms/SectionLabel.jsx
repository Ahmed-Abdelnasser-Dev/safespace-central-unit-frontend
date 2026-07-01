import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function SectionLabel({ text, icon = null, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon && <FontAwesomeIcon icon={icon} className="text-safe-blue text-sm" />}
      <label className="text-xs font-medium text-safe-text-primary uppercase tracking-wider">
        {text}
      </label>
    </div>
  );
}

export default SectionLabel;
