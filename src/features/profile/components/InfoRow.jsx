import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function InfoRow({ icon, label, value, bold = false }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="flex items-center gap-2.5 text-sm text-safe-text-muted">
        <FontAwesomeIcon icon={icon} className="text-xs w-3.5 text-safe-text-muted/70" />
        {label}
      </span>
      <span className={`text-sm text-safe-text-primary text-right ${bold ? 'font-semibold' : ''}`}>
        {value}
      </span>
    </div>
  );
}

export default InfoRow;
