import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

function AiAnalysisCard({ aiData }) {
  const getSeverityColor = (severity) => {
    if (severity >= 4) return '#dc2626';
    if (severity >= 3) return '#ea580c';
    if (severity >= 2) return '#f59e0b';
    return '#16a34a';
  };

  const getInjuryRiskColor = (risk) => {
    if (risk === 'high') return '#dc2626';
    if (risk === 'medium') return '#f97316';
    return '#16a34a';
  };

  return (
    <div className="bg-safe-sidebar border border-safe-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-safe-border">
        <div className="w-8 h-8 rounded-md bg-safe-blue/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faRobot} className="text-safe-blue text-sm" />
        </div>
        <h4 className="font-bold text-sm text-safe-text-primary">AI Analysis</h4>
      </div>

      {aiData && Object.keys(aiData).length > 0 ? (
        <div className="space-y-3">
          {/* Type and Severity Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-medium text-safe-text-muted uppercase tracking-wide mb-1">Type</p>
              <p className="text-sm font-bold text-safe-text-primary capitalize">{aiData.accidentType || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-safe-text-muted uppercase tracking-wide mb-1">Severity</p>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-sm font-bold"
                  style={{ color: getSeverityColor(aiData.severity || 0) }}
                >
                  {aiData.severity || 0}/5
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div
                      key={level}
                      className="w-1 h-4 rounded-full"
                      style={{
                        backgroundColor: level <= (aiData.severity || 0)
                          ? getSeverityColor(aiData.severity || 0)
                          : 'rgb(var(--color-safe-gray-light))'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Confidence and Injury Risk Row */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-safe-border">
            <div>
              <p className="text-[11px] font-medium text-safe-text-muted uppercase tracking-wide mb-1">Confidence</p>
              <p className="text-sm font-bold text-safe-text-primary">
                {((aiData.confidence || 0) * 100).toFixed(0)}%
              </p>
            </div>
            {aiData.injuryRisk && (
              <div>
                <p className="text-[11px] font-medium text-safe-text-muted uppercase tracking-wide mb-1">Injury Risk</p>
                <p
                  className="text-sm font-bold capitalize"
                  style={{ color: getInjuryRiskColor(aiData.injuryRisk) }}
                >
                  {aiData.injuryRisk}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-5 text-center text-sm text-safe-text-muted">
          No AI analysis available
        </div>
      )}
    </div>
  );
}

export default AiAnalysisCard;
