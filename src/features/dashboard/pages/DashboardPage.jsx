import React, { useEffect, useRef, useState } from 'react';
import LayoutContainer from '../components/LayoutContainer.jsx';
import GridSection from '../components/GridSection.jsx';
import DashboardCard from '../components/DashboardCard.jsx';
import StatBlock from '../components/StatBlock.jsx';
import ChartWrapper from '../components/ChartWrapper.jsx';
import { initSocket, onNodeHeartbeat, offNodeHeartbeat, onAccidentDetected, offAccidentDetected } from '../../../services/socketService';
import { metricsAPI } from '../../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatNumber } from '../utils/format';

function DashboardPage() {
  const [userActivitySeries, setUserActivitySeries] = useState(null);
  const [alertSeries, setAlertSeries] = useState(null);
  const [timeUnit, setTimeUnit] = useState('hour'); // 'hour' or 'minute'
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [isLoadingBackfill, setIsLoadingBackfill] = useState(false);

  const hbRef = useRef([]); // heartbeat timestamps
  const alertRef = useRef([]); // alert timestamps

  function computeSeries(timestamps, points = 24, unit = 'hour') {
    const now = Date.now();
    const unitMs = unit === 'minute' ? 60 * 1000 : 60 * 60 * 1000;
    const labels = [];
    const data = [];
    for (let i = points - 1; i >= 0; i--) {
      const start = new Date(now - i * unitMs);
      if (unit === 'hour') start.setMinutes(0, 0, 0);
      else start.setSeconds(0, 0);
      const end = new Date(start.getTime() + unitMs);
      labels.push(start.toISOString());
      const count = timestamps.filter(ts => {
        const t = typeof ts === 'number' ? ts : new Date(ts).getTime();
        return t >= start.getTime() && t < end.getTime();
      }).length;
      data.push(count);
    }
    return { labels, data };
  }

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    initSocket();

    const hbHandler = (payload) => {
      try {
        const ts = payload && (payload.ts || payload.timestamp || payload.time) ? (payload.ts || payload.timestamp || payload.time) : Date.now();
        const t = typeof ts === 'number' ? ts : new Date(ts).getTime();
        hbRef.current.push(t);
        // keep last 7 days to bound memory
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        hbRef.current = hbRef.current.filter(x => x >= weekAgo);
        setUserActivitySeries(computeSeries(hbRef.current, timeUnit === 'hour' ? 24 : 60, timeUnit));
      } catch (e) { console.error(e); }
    };

    const alertHandler = (payload) => {
      try {
        const ts = payload && (payload.ts || payload.timestamp || payload.time) ? (payload.ts || payload.timestamp || payload.time) : Date.now();
        const t = typeof ts === 'number' ? ts : new Date(ts).getTime();
        alertRef.current.push(t);
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        alertRef.current = alertRef.current.filter(x => x >= weekAgo);
        setAlertSeries(computeSeries(alertRef.current, timeUnit === 'hour' ? 24 : 60, timeUnit));
      } catch (e) { console.error(e); }
    };

    onNodeHeartbeat(hbHandler);
    onAccidentDetected(alertHandler);

    // initialize series with empty data
    setUserActivitySeries(computeSeries(hbRef.current, timeUnit === 'hour' ? 24 : 60, timeUnit));
    setAlertSeries(computeSeries(alertRef.current, timeUnit === 'hour' ? 24 : 60, timeUnit));

    return () => {
      offNodeHeartbeat(hbHandler);
      offAccidentDetected(alertHandler);
    };
  }, []);

  async function fetchBackfill() {
    try {
      setIsLoadingBackfill(true);
      const s = startDate || null;
      const e = endDate || null;
      const unit = timeUnit;
      const user = await metricsAPI.getHourly('user_activity', s, e, unit);
      const alerts = await metricsAPI.getHourly('alerts', s, e, unit);
      if (user) setUserActivitySeries(user);
      if (alerts) setAlertSeries(alerts);
    } catch (err) {
      console.error('Backfill failed', err);
    } finally {
      setIsLoadingBackfill(false);
    }
  }

  // auto-refresh backfill when enabled
  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(() => fetchBackfill(), Math.max(5000, refreshInterval * 1000));
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval, startDate, endDate, timeUnit]);
  const statsTop = [
    { label: 'Active Users', value: 1289, trend: 4.2, positive: true, icon: 'users' },
    { label: 'Incidents Today', value: 7, trend: 12.5, positive: false, icon: 'bell' },
    { label: 'System Health', value: 'Operational', trend: 0.0, positive: true, icon: 'gauge-high' },
    { label: 'Alerts (24h)', value: 23, trend: 5.6, positive: false, icon: 'bell' },
  ];

  const performance = [
    { label: 'API Latency (ms)', value: 124, trend: 3.1, positive: true },
    { label: 'Message Queue Lag', value: 'Normal', trend: 0.0, positive: true },
    { label: 'Uptime (days)', value: 12, trend: 1.2, positive: true },
    { label: 'Geo Events/min', value: 341, trend: 8.3, positive: true },
  ];

  return (
    <div className="min-h-full bg-safe-dark text-white">
      <LayoutContainer>
        <div className="flex flex-col gap-10">
          {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-safe-gray-light/30 pb-8">
          <div className="space-y-3 flex-1">
            <h2 className="font-display text-4xl font-bold tracking-tight text-white">Dashboard Overview</h2>
            <p className="text-sm text-safe-text-gray/80 font-light max-w-lg">Real-time system monitoring, KPIs, and operational insights. All metrics update live.</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2 bg-safe-success/10 px-4 py-2.5 rounded-lg border border-safe-success/30">
              <span className="w-2 h-2 rounded-full bg-safe-success animate-pulse-glow" />
              <span className="text-xs font-semibold text-safe-success">Live</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-safe-text-gray/70">From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-safe-dark/40 text-xs px-2 py-1 rounded-md" />
              <label className="text-xs text-safe-text-gray/70">To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-safe-dark/40 text-xs px-2 py-1 rounded-md" />

              <label className="text-xs text-safe-text-gray/70">Granularity</label>
              <select value={timeUnit} onChange={(e) => setTimeUnit(e.target.value)} className="bg-safe-dark/40 text-xs px-2 py-1 rounded-md">
                <option value="hour">Hourly</option>
                <option value="minute">Per-minute (last 60)</option>
              </select>

              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                Auto
              </label>
              <select value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))} className="bg-safe-dark/40 text-xs px-2 py-1 rounded-md">
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>

              <button onClick={fetchBackfill} type="button" className="px-3 py-2 rounded-lg bg-safe-blue hover:bg-safe-blue-light text-white font-semibold text-xs transition-all duration-200 shadow-sm hover:shadow-lg active:scale-95">
                {isLoadingBackfill ? 'Loading…' : 'Backfill'}
              </button>
            </div>
          </div>
          </section>

          {/* KPI Grid */}
          <GridSection>
            {statsTop.map((s, idx) => (
              <div key={idx} className="col-span-12 sm:col-span-6 lg:col-span-3">
                <DashboardCard title={s.label} icon={s.icon}>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">{typeof s.value === 'number' ? formatNumber(s.value) : s.value}</span>
                    <div className={`text-[11px] flex items-center gap-1 ${s.positive ? 'text-safe-success' : 'text-safe-danger'}`}>
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
                <ChartWrapper title="User Activity" series={userActivitySeries} timeUnit={timeUnit} updateThrottle={600} animationDuration={700} showLegend={false} />
              </DashboardCard>
              <DashboardCard title="Alert Frequency" icon="chart-line">
                <ChartWrapper title="Alerts" series={alertSeries} timeUnit={timeUnit} updateThrottle={600} animationDuration={700} showLegend={false} />
              </DashboardCard>
            </div>
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <DashboardCard title="Performance" icon="gauge-high">
                <div className="flex flex-col gap-4">
                  {performance.map((p, i) => (
                    <StatBlock key={i} label={p.label} value={p.value} trend={p.trend} positive={p.positive} />
                  ))}
                </div>
              </DashboardCard>
              <DashboardCard title="Recent Alerts" icon="bell">
                <ul className="space-y-2 text-[11px] text-gray-300">
                  <li className="flex justify-between"><span>High vibration detected</span><span className="text-safe-danger">Critical</span></li>
                  <li className="flex justify-between"><span>Geo-fence breach zone 3</span><span className="text-safe-accent">Warning</span></li>
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
