import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function KPICards() {
  const metrics = [
    {
      id: 'vehicles',
      icon: 'chart-line',
      iconBg: 'bg-safe-blue-btn',
      value: '58k',
      label: 'Total Vehicles',
      subtext: 'last day',
      trend: '+26%',
      trendPositive: true,
    },
    {
      id: 'incidents',
      icon: 'exclamation-triangle',
      iconBg: 'bg-safe-danger',
      value: '8',
      label: 'Active Incidents',
      subtext: 'weekly average',
      trend: '-18',
      trendPositive: false,
    },
    {
      id: 'response',
      icon: 'clock',
      iconBg: 'bg-safe-orange',
      value: '4.2m',
      label: 'Avg Response Time',
      subtext: 'last day',
      trend: '-25%',
      trendPositive: true,
    },
    {
      id: 'safety',
      icon: 'shield',
      iconBg: 'bg-safe-green',
      value: '94%',
      label: 'Safety Score',
      subtext: 'last day',
      trend: '+4%',
      trendPositive: true,
    },
  ];

  return (
    <div >
      <div className="grid grid-cols-4 gap-5">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-xl p-5 border border-safe-border relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${metric.id === 'vehicles' ? 'bg-safe-blue-btn' : metric.id === 'incidents' ? 'bg-safe-danger' : metric.id === 'response' ? 'bg-safe-orange' : 'bg-safe-green'}`}></div>
            <div className="flex items-start justify-between mb-3 pt-2">
              <div className={`w-14 h-14 ${metric.iconBg} rounded-2xl flex items-center justify-center`}>
                <FontAwesomeIcon icon={metric.icon} className="text-white text-xl" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
                metric.trendPositive ? 'text-safe-green bg-safe-green/10' : 'text-safe-danger bg-safe-danger/10'
              }`}>
                <FontAwesomeIcon icon={metric.trendPositive ? 'arrow-up' : 'arrow-down'} className="text-[9px]" />
                {metric.trend}
              </div>
            </div>
            <div className="mt-2">
              <div className="text-3xl font-bold text-safe-text-dark mb-0.5">{metric.value}</div>
              <div className="text-sm font-semibold text-safe-text-dark mb-1">{metric.label}</div>
              <div className="text-xs text-safe-text-gray">{metric.subtext}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KPICards;
