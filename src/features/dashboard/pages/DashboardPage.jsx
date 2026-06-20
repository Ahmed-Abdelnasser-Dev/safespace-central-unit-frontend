import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LayoutContainer from '../components/LayoutContainer.jsx';
import GridSection from '../components/GridSection.jsx';
import DashboardCard from '../components/DashboardCard.jsx';
import ChartWrapper from '../components/ChartWrapper.jsx';
import { initSocket, onNodeHeartbeat, offNodeHeartbeat, onAccidentDetected, offAccidentDetected } from '../../../services/socketService';
import { dispatcherAPI } from '../../../services/api';
import { formatNumber } from '../utils/format';

const ACTIVE_STATUSES = ['queued', 'acknowledged', 'active', 'escalated'];

const SEVERITY_COLOR = {
  HIGH:   'text-safe-danger',
  MEDIUM: 'text-safe-accent',
  LOW:    'text-safe-info',
};

const STATUS_COLOR = {
  queued:       'bg-white/6 text-safe-text-muted',
  acknowledged: 'bg-safe-info/12 text-safe-info',
  active:       'bg-safe-info/12 text-safe-info',
  escalated:    'bg-safe-accent/12 text-safe-accent',
  closed:       'bg-white/6 text-safe-text-muted/60',
};

function timeSince(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function KpiCard({ label, value, icon, accent = 'blue', loading }) {
  const accentMap = {
    blue:   'bg-safe-blue/10 text-safe-blue border-safe-blue/20',
    danger: 'bg-safe-danger/10 text-safe-danger border-safe-danger/20',
    accent: 'bg-safe-accent/10 text-safe-accent border-safe-accent/20',
    success:'bg-safe-success/10 text-safe-success border-safe-success/20',
  };
  return (
    <DashboardCard title={label} icon={icon}>
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${accentMap[accent]}`}>
        <FontAwesomeIcon icon={icon} className="text-base" />
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-white/8 rounded animate-pulse mt-1" />
      ) : (
        <span className="text-3xl font-bold text-white leading-none mt-1">{formatNumber(value)}</span>
      )}
    </DashboardCard>
  );
}

function computeSeries(timestamps, points = 24, unit = 'hour') {
  const now = Date.now();
  const unitMs = unit === 'minute' ? 60_000 : 3_600_000;
  const labels = [];
  const data = [];
  for (let i = points - 1; i >= 0; i--) {
    const start = new Date(now - i * unitMs);
    if (unit === 'hour') start.setMinutes(0, 0, 0);
    else start.setSeconds(0, 0);
    const end = new Date(start.getTime() + unitMs);
    labels.push(start.toISOString());
    data.push(timestamps.filter(ts => ts >= start.getTime() && ts < end.getTime()).length);
  }
  return { labels, data };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const [activitySeries, setActivitySeries] = useState(null);
  const [alertSeries, setAlertSeries] = useState(null);
  const hbRef = useRef([]);
  const alertRef = useRef([]);

  const fetchData = useCallback(async () => {
    try {
      const [{ cases: fetchedCases }, fetchedUnits] = await Promise.all([
        dispatcherAPI.listCases({ limit: 100 }),
        dispatcherAPI.listUnits(),
      ]);
      setCases(fetchedCases ?? []);
      setUnits(fetchedUnits ?? []);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    initSocket();

    const hbHandler = (payload) => {
      const ts = payload?.ts ?? payload?.timestamp ?? payload?.time ?? Date.now();
      const t = typeof ts === 'number' ? ts : new Date(ts).getTime();
      hbRef.current = [...hbRef.current, t].filter(x => x >= Date.now() - 7 * 86_400_000);
      setActivitySeries(computeSeries(hbRef.current));
    };

    const alertHandler = (payload) => {
      const ts = payload?.ts ?? payload?.timestamp ?? payload?.time ?? Date.now();
      const t = typeof ts === 'number' ? ts : new Date(ts).getTime();
      alertRef.current = [...alertRef.current, t].filter(x => x >= Date.now() - 7 * 86_400_000);
      setAlertSeries(computeSeries(alertRef.current));
    };

    onNodeHeartbeat(hbHandler);
    onAccidentDetected(alertHandler);
    setActivitySeries(computeSeries(hbRef.current));
    setAlertSeries(computeSeries(alertRef.current));

    return () => {
      offNodeHeartbeat(hbHandler);
      offAccidentDetected(alertHandler);
    };
  }, []);

  // Derived KPIs
  const activeCases   = cases.filter(c => ACTIVE_STATUSES.includes(c.status)).length;
  const escalated     = cases.filter(c => c.status === 'escalated').length;
  const availableUnits = units.filter(u => u.status === 'available').length;
  const deployedUnits  = units.filter(u => ['en_route', 'on_scene'].includes(u.status)).length;

  // Breakdown
  const bySeverity = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  const byType     = { sos: 0, incident: 0 };
  cases.filter(c => ACTIVE_STATUSES.includes(c.status)).forEach(c => {
    if (c.severity in bySeverity) bySeverity[c.severity]++;
    if (c.caseType in byType) byType[c.caseType]++;
  });

  // Recent cases (last 5 by receivedAt)
  const recentCases = [...cases]
    .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
    .slice(0, 5);

  return (
    <div className="min-h-full bg-safe-dark text-white">
      <LayoutContainer>
        <div className="flex flex-col gap-10">

          {/* Header */}
          <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-safe-gray-light/30 pb-8">
            <div className="space-y-3 flex-1">
              <h2 className="font-display text-4xl font-bold tracking-tight text-white">Dashboard Overview</h2>
              <p className="text-sm text-safe-text-gray/80 font-light max-w-lg">Live operational snapshot — cases, units, and incident activity.</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {lastRefresh && (
                <span className="text-[11px] text-safe-text-muted/50 font-mono">
                  Updated {timeSince(lastRefresh.toISOString())}
                </span>
              )}
              <div className="flex items-center gap-2 bg-safe-success/10 px-3 py-2 rounded-lg border border-safe-success/30">
                <span className="w-1.5 h-1.5 rounded-full bg-safe-success animate-pulse" />
                <span className="text-xs font-semibold text-safe-success">Live</span>
              </div>
              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-safe-blue/10 border border-safe-blue/25 text-safe-blue text-xs font-semibold hover:bg-safe-blue/20 transition-colors disabled:opacity-50"
              >
                <FontAwesomeIcon icon="arrows-rotate" className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </section>

          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-safe-danger/10 border border-safe-danger/25 text-safe-danger text-sm">
              <FontAwesomeIcon icon="circle-exclamation" />
              {error}
            </div>
          )}

          {/* KPI Grid */}
          <GridSection>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <KpiCard label="Active Cases" value={activeCases} icon="radio" accent="blue" loading={loading} />
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <KpiCard label="Escalated" value={escalated} icon="triangle-exclamation" accent="accent" loading={loading} />
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <KpiCard label="Available Units" value={availableUnits} icon="truck-medical" accent="success" loading={loading} />
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <KpiCard label="Deployed Units" value={deployedUnits} icon="location-arrow" accent="danger" loading={loading} />
            </div>
          </GridSection>

          {/* Charts + Sidebar */}
          <GridSection>
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              <DashboardCard title="Node Heartbeat Activity" icon="chart-line">
                <ChartWrapper title="Heartbeats" series={activitySeries} timeUnit="hour" updateThrottle={600} animationDuration={700} showLegend={false} />
              </DashboardCard>
              <DashboardCard title="Accident Detections" icon="chart-line">
                <ChartWrapper title="Detections" series={alertSeries} timeUnit="hour" updateThrottle={600} animationDuration={700} showLegend={false} />
              </DashboardCard>
            </div>

            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

              {/* Case Breakdown */}
              <DashboardCard title="Active Case Breakdown" icon="gauge-high">
                {loading ? (
                  <div className="space-y-2">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-6 bg-white/6 rounded animate-pulse" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-safe-text-muted/60 mb-1.5">By Severity</p>
                      {Object.entries(bySeverity).map(([sev, count]) => (
                        <div key={sev} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                          <span className={`text-xs font-medium ${SEVERITY_COLOR[sev] ?? 'text-white'}`}>{sev}</span>
                          <span className="text-sm font-bold text-white">{count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-safe-text-muted/60 mb-1.5">By Type</p>
                      {[['sos', 'SOS Emergency'], ['incident', 'Road Incident']].map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                          <span className="text-xs text-safe-text-muted">{label}</span>
                          <span className="text-sm font-bold text-white">{byType[key]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </DashboardCard>

              {/* Recent Cases */}
              <DashboardCard title="Recent Cases" icon="bell">
                {loading ? (
                  <div className="space-y-2">
                    {[1,2,3].map(i => <div key={i} className="h-10 bg-white/6 rounded animate-pulse" />)}
                  </div>
                ) : recentCases.length === 0 ? (
                  <p className="text-xs text-safe-text-muted/60">No cases on record.</p>
                ) : (
                  <ul className="space-y-2">
                    {recentCases.map(c => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => navigate(`/cases/${c.caseType}/${c.id}`)}
                          className="w-full text-left flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white/4 border border-white/6 hover:bg-white/8 hover:border-white/12 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">
                              {c.caseType === 'sos' ? (c.victim?.fullName ?? 'Unknown Caller') : (c.nodeLabel ?? 'Node Incident')}
                            </p>
                            <p className="text-[10px] text-safe-text-muted/60 truncate">
                              {c.caseType === 'sos' ? (c.emergencyType?.replace(/_/g, ' ') ?? 'SOS') : (c.incidentType?.replace(/_/g, ' ') ?? 'Incident')}
                              {' · '}{timeSince(c.receivedAt)}
                            </p>
                          </div>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${STATUS_COLOR[c.status] ?? 'bg-white/6 text-white'}`}>
                            {c.status}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </DashboardCard>

            </div>
          </GridSection>

        </div>
      </LayoutContainer>
    </div>
  );
}
