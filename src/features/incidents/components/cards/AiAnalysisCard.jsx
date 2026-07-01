import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

const SEVERITY_CONFIG = [
  { textClass: 'text-safe-success', barClass: 'bg-safe-success' },        // 0-1
  { textClass: 'text-safe-success', barClass: 'bg-safe-success' },        // 1
  { textClass: 'text-safe-orange',  barClass: 'bg-safe-orange/60' },      // 2
  { textClass: 'text-safe-orange',  barClass: 'bg-safe-orange' },         // 3
  { textClass: 'text-safe-danger',  barClass: 'bg-safe-danger' },         // 4
  { textClass: 'text-safe-danger',  barClass: 'bg-safe-danger' },         // 5
];

const RISK_CLASS = {
  high: 'text-safe-danger',
  medium: 'text-safe-orange',
};

function getSeverityConfig(severity) {
  const level = Math.min(Math.max(Math.floor(severity || 0), 0), 5);
  return SEVERITY_CONFIG[level];
}

function getInjuryRiskClass(risk) {
  return RISK_CLASS[risk] ?? 'text-safe-success';
}

function AiAnalysisCard({ aiData }) {
  const severityConfig = getSeverityConfig(aiData?.severity);

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
                <span className={`text-sm font-bold ${severityConfig.textClass}`}>
                  {aiData.severity || 0}/5
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-1 h-4 rounded-full ${
                        level <= (aiData.severity || 0)
                          ? getSeverityConfig(aiData.severity).barClass
                          : 'bg-safe-gray-light'
                      }`}
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
                <p className={`text-sm font-bold capitalize ${getInjuryRiskClass(aiData.injuryRisk)}`}>
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
