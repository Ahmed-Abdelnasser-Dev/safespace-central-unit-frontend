function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-safe-gray-light last:border-0">
      <span className="text-[11px] font-medium text-safe-text-muted/70 uppercase tracking-wide flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-safe-text-primary text-right">{value}</span>
    </div>
  );
}

function IncidentInfoPanel({ caseRecord }) {
  return (
    <div className="bg-safe-gray rounded-xl border border-safe-gray-light overflow-hidden">
      <div className="px-4 py-3 border-b border-safe-gray-light">
        <h3 className="text-sm font-semibold text-safe-text-primary">Detection Details</h3>
      </div>
      <div className="px-4 py-2">
        <InfoRow label="Source" value={caseRecord.nodeLabel ?? '—'} />
        <InfoRow label="Confidence" value={caseRecord.confidence != null ? `${Math.round(caseRecord.confidence * 100)}%` : '—'} />
      </div>
      {caseRecord.affectedLanes?.length > 0 && (
        <div className="px-4 pb-3">
          <span className="text-[11px] font-medium text-safe-text-muted/60 uppercase tracking-wide">Affected Lanes</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {caseRecord.affectedLanes.map((lane) => (
              <span key={lane} className="px-2 py-0.5 rounded-full text-xs font-medium bg-safe-orange/12 text-safe-orange">
                {lane}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default IncidentInfoPanel;
