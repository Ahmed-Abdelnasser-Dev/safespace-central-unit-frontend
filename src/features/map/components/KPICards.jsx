import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function KPICards() {
  const metrics = [
    {
      id: 'vehicles',
      icon: 'chart-line',
      iconBg: 'bg-safe-blue/20',
      iconColor: 'text-safe-blue',
      value: '58k',
      label: 'Total Vehicles',
      subtext: 'last day',
      trend: '+26%',
      trendPositive: true,
    },
    {
      id: 'incidents',
      icon: 'exclamation-triangle',
      iconBg: 'bg-safe-danger/20',
      iconColor: 'text-safe-danger',
      value: '8',
      label: 'Active Incidents',
      subtext: 'weekly average',
      trend: '-18',
      trendPositive: false,
    },
    {
      id: 'response',
      icon: 'clock',
      iconBg: 'bg-safe-accent/20',
      iconColor: 'text-safe-accent',
      value: '4.2m',
      label: 'Avg Response Time',
      subtext: 'last day',
      trend: '-25%',
      trendPositive: true,
    },
    {
      id: 'safety',
      icon: 'shield',
      iconBg: 'bg-safe-green/20',
      iconColor: 'text-safe-green',
      value: '94%',
      label: 'Safety Score',
      subtext: 'last day',
      trend: '+4%',
      trendPositive: true,
    },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div 
            key={metric.id} 
            className="bg-white rounded-xl p-6 border border-safe-border/50 hover:border-safe-border/80 relative overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 group animate-slideUp"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Accent bar */}
            <div className={`absolute top-0 left-0 h-1 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              metric.id === 'vehicles' ? 'bg-safe-blue' : 
              metric.id === 'incidents' ? 'bg-safe-danger' : 
              metric.id === 'response' ? 'bg-safe-accent' : 
              'bg-safe-green'
            }`} />
            
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${metric.iconBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <FontAwesomeIcon icon={metric.icon} className={`${metric.iconColor} text-lg`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
                metric.trendPositive ? 'text-safe-green bg-safe-green/10' : 'text-safe-danger bg-safe-danger/10'
              }`}>
                <FontAwesomeIcon icon={metric.trendPositive ? 'arrow-up' : 'arrow-down'} className="text-[9px]" />
                {metric.trend}
              </div>
            </div>

            <div className="mt-3">
              <div className="text-3xl font-bold text-safe-text-dark mb-1">{metric.value}</div>
              <div className="text-sm font-semibold text-safe-text-dark mb-1">{metric.label}</div>
              <div className="text-xs text-safe-text-gray/70 font-light">{metric.subtext}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KPICards;
