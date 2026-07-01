import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function CaseInfoPanel({ caseRecord }) {
  const lat = caseRecord.latitude.toFixed(4);
  const lon = caseRecord.longitude.toFixed(4);

  return (
    <div className="bg-safe-gray rounded-xl border border-safe-gray-light px-4 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <FontAwesomeIcon icon="location-dot" className="text-safe-danger/70 text-sm flex-shrink-0" />
        <span className="text-sm font-mono text-safe-text-primary">
          {lat}° N, {lon}° E
        </span>
      </div>
      <a
        href={`https://www.google.com/maps?q=${lat},${lon}`}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-safe-blue/80 hover:text-safe-blue transition-colors flex-shrink-0 flex items-center gap-1"
      >
        <FontAwesomeIcon icon="arrow-up-right-from-square" />
        Maps
      </a>
    </div>
  );
}

export default CaseInfoPanel;
