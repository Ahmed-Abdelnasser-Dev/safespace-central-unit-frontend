import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function EmptyState({ icon, title, message = '', className = '' }) {
  return (
    <div className={`text-center py-8 ${className}`}>
      {icon && (
        <FontAwesomeIcon icon={icon} className="text-safe-text-muted mb-3 block text-2xl" />
      )}
      <p className="text-sm text-safe-text-muted">{title}</p>
      {message && <p className="text-xs text-safe-text-muted mt-1">{message}</p>}
    </div>
  );
}

export default EmptyState;
