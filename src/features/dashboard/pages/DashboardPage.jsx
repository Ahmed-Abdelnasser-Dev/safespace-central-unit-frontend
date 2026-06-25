import LayoutContainer from '../components/LayoutContainer.jsx';
import GridSection from '../components/GridSection.jsx';
import DashboardCard from '../components/DashboardCard.jsx';
import StatBlock from '../components/StatBlock.jsx';
import ChartWrapper from '../components/ChartWrapper.jsx';
import PageActions from '@/components/ui/PageActions';
import Button from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// TODO(Phase 3): Replace hardcoded stats with live data from metricsAPI / socket
const MOCK_STATS_TOP = [
  { label: 'Active Users',    value: 1289,         trend: 4.2,  positive: true,  icon: 'users' },
  { label: 'Incidents Today', value: 7,            trend: 12.5, positive: false, icon: 'bell' },
  { label: 'System Health',   value: 'Operational', trend: 0.0,  positive: true,  icon: 'gauge-high' },
  { label: 'Alerts (24h)',    value: 23,           trend: 5.6,  positive: false, icon: 'bell' },
];

const MOCK_PERFORMANCE = [
  { label: 'API Latency (ms)',     value: 124,      trend: 3.1, positive: true },
  { label: 'Message Queue Lag',   value: 'Normal', trend: 0.0, positive: true },
  { label: 'Uptime (days)',        value: 12,       trend: 1.2, positive: true },
  { label: 'Geo Events/min',       value: 341,      trend: 8.3, positive: true },
];

function DashboardPage() {
  // TODO(Phase 3): wire to refetch thunk
  function handleRefresh() {}

  return (
    <div className="min-h-full bg-safe-dark text-safe-text-primary">
      {/* Actions slot: populated into AppTopBar */}
      <PageActions>
        <span className="flex items-center gap-1.5 text-xs text-safe-success">
          <FontAwesomeIcon icon="circle" className="text-[8px]" />
          Live
        </span>
        <Button size="sm" variant="secondary" icon="rotate" onClick={handleRefresh}>
          Refresh
        </Button>
      </PageActions>

      <LayoutContainer>
        <div className="flex flex-col gap-10">
          {/* KPI Grid */}
          <GridSection>
            {MOCK_STATS_TOP.map((s, idx) => (
              <div key={idx} className="col-span-12 sm:col-span-6 lg:col-span-3">
                <DashboardCard title={s.label} icon={s.icon}>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">{s.value}</span>
                    <div className={`text-xs flex items-center gap-1 ${s.positive ? 'text-safe-success' : 'text-safe-danger'}`}>
                      <FontAwesomeIcon icon={s.positive ? 'arrow-up' : 'arrow-down'} />
                      {s.trend}%
                    </div>
                  </div>
                </DashboardCard>
              </div>
            ))}
          </GridSection>

          {/* Charts & Performance */}
          <GridSection>
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              <DashboardCard title="User Activity" icon="chart-line">
                <ChartWrapper title="User Activity (24h)" />
              </DashboardCard>
              <DashboardCard title="Alert Frequency" icon="chart-line">
                <ChartWrapper title="Alerts per Hour" />
              </DashboardCard>
            </div>
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <DashboardCard title="Performance" icon="gauge-high">
                <div className="flex flex-col gap-4">
                  {MOCK_PERFORMANCE.map((p, i) => (
                    <StatBlock key={i} label={p.label} value={p.value} trend={p.trend} positive={p.positive} />
                  ))}
                </div>
              </DashboardCard>
              {/* TODO(Phase 3): replace with live alerts from socket */}
              <DashboardCard title="Recent Alerts" icon="bell">
                <ul className="space-y-2 text-xs text-safe-text-muted">
                  <li className="flex justify-between"><span>High vibration detected</span><span className="text-safe-danger">Critical</span></li>
                  <li className="flex justify-between"><span>Geo-fence breach zone 3</span><span className="text-safe-orange">Warning</span></li>
                  <li className="flex justify-between"><span>Camera feed restarted</span><span className="text-safe-info">Info</span></li>
                </ul>
              </DashboardCard>
            </div>
          </GridSection>
        </div>
      </LayoutContainer>
    </div>
  );
}

export default DashboardPage;
