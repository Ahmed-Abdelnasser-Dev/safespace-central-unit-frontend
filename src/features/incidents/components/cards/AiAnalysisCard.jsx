import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

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
    <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[16px]">
      <div className="flex items-center gap-[8px] mb-[12px] pb-[12px] border-b border-[#f3f4f6]">
        <div className="w-[32px] h-[32px] rounded-[6px] bg-[#eff6ff] flex items-center justify-center">
          <FontAwesomeIcon icon={faRobot} className="text-[#3b82f6] text-[14px]" />
        </div>
        <h4 className="font-bold text-[14px] text-[#111827]">AI Analysis</h4>
      </div>
      
      {aiData && Object.keys(aiData).length > 0 ? (
        <div className="space-y-[12px]">
          {/* Type and Severity Row */}
          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <p className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide mb-[4px]">Type</p>
              <p className="text-[14px] font-bold text-[#111827] capitalize">{aiData.accidentType || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide mb-[4px]">Severity</p>
              <div className="flex items-center gap-[6px]">
                <span 
                  className="text-[14px] font-bold"
                  style={{ color: getSeverityColor(aiData.severity || 0) }}
                >
                  {aiData.severity || 0}/5
                </span>
                <div className="flex gap-[2px]">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div
                      key={level}
                      className="w-[4px] h-[16px] rounded-full"
                      style={{
                        backgroundColor: level <= (aiData.severity || 0) 
                          ? getSeverityColor(aiData.severity || 0)
                          : '#e5e7eb'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Confidence and Injury Risk Row */}
          <div className="grid grid-cols-2 gap-[12px] pt-[12px] border-t border-[#f3f4f6]">
            <div>
              <p className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide mb-[4px]">Confidence</p>
              <p className="text-[14px] font-bold text-[#111827]">
                {((aiData.confidence || 0) * 100).toFixed(0)}%
              </p>
            </div>
            {aiData.injuryRisk && (
              <div>
                <p className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide mb-[4px]">Injury Risk</p>
                <p 
                  className="text-[14px] font-bold capitalize"
                  style={{ color: getInjuryRiskColor(aiData.injuryRisk) }}
                >
                  {aiData.injuryRisk}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-[20px] text-center text-[13px] text-[#9ca3af]">
          No AI analysis available
        </div>
      )}
    </div>
  );
}

export default AiAnalysisCard;
