/**
 * AnalyticsOverviewPage — /analytics
 *
 * Executive dashboard for the data_analyst role.
 * Uses shared ChartCard / RangePicker / ChartOverlay components.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import StatCard from '@/components/ui/StatCard';
import ChartCard from '../components/ChartCard.jsx';
import RangePicker from '../components/RangePicker.jsx';
import ChartOverlay from '../components/ChartOverlay.jsx';
import { analyticsAPI } from '@/services/api';
import {
  Chart,
  BarController, DoughnutController,
  CategoryScale, LinearScale,
  BarElement, ArcElement,
  Tooltip, Legend,
} from 'chart.js';

Chart.register(
  BarController, DoughnutController,
  CategoryScale, LinearScale,
  BarElement, ArcElement,
  Tooltip, Legend,
);

const SEVERITY_COLORS = ['#4ade80', '#a3e635', '#facc15', '#fb923c', '#f87171'];
const SEVERITY_LABELS = ['Sev 1', 'Sev 2', 'Sev 3', 'Sev 4', 'Sev 5'];
const CHART_COLORS = {
  grid: 'rgba(255,255,255,0.05)',
  tick: 'rgba(255,255,255,0.35)',
};

const RANGES = [
  { label: '7 Days',  value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function changeArrow(pct) {
  if (pct === null) return null;
  const isUp = pct >= 0;
  return (
    <span className={isUp ? 'text-red-400' : 'text-green-400'}>
      <FontAwesomeIcon icon={isUp ? 'arrow-up' : 'arrow-down'} className="mr-1 text-xs" />
      {Math.abs(pct)}% vs last month
    </span>
  );
}

// ── IncidentTimelineChart ─────────────────────────────────────────────────────

const SEVERITY_DESCRIPTIONS = ['Minor', 'Moderate', 'Serious', 'Severe', 'Critical'];

// Pre-fill every day in [startISO, endISO] so the timeline is always continuous
function buildDayLabels(startISO, endISO) {
  const labels = [];
  const cur = new Date(startISO);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(endISO);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    labels.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return labels;
}

function fmtAxisDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-EG', { month: 'short', day: 'numeric' });
}

function fmtRangeLabel(startISO, days) {
  const end = new Date();
  const start = new Date(startISO);
  const fmtOpts = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${start.toLocaleDateString('en-EG', fmtOpts)} — ${end.toLocaleDateString('en-EG', fmtOpts)}`;
}

function IncidentTimelineChart({ range }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const [status, setStatus] = useState('loading');
  const [activeSeverities, setActiveSeverities] = useState([]);
  const [rangeLabel, setRangeLabel] = useState('');
  const [peakInfo, setPeakInfo]     = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    Chart.getChart(canvas)?.destroy();
    chartRef.current = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1a',
            borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
            titleColor: 'rgba(255,255,255,0.85)',
            bodyColor: 'rgba(255,255,255,0.75)',
            footerColor: 'rgba(255,255,255,0.55)',
            padding: 12, cornerRadius: 8,
            callbacks: {
              title: (items) => {
                const d = new Date(items[0].label);
                return isNaN(d) ? items[0].label
                  : d.toLocaleDateString('en-EG', { weekday: 'long', month: 'long', day: 'numeric' });
              },
              label: (ctx) => {
                if (ctx.parsed.y === 0) return null;
                const sev = ctx.datasetIndex + 1;
                const desc = SEVERITY_DESCRIPTIONS[sev - 1];
                return `  Sev ${sev} — ${desc}: ${ctx.parsed.y} incident${ctx.parsed.y !== 1 ? 's' : ''}`;
              },
              footer: (items) => {
                const total = items.reduce((s, i) => s + i.parsed.y, 0);
                return total > 0 ? `  Total: ${total} incident${total !== 1 ? 's' : ''} this day` : null;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            border: { display: false },
            grid: { display: false },
            ticks: {
              color: CHART_COLORS.tick,
              font: { size: 10 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10,
              callback(val) {
                // Show tick only for clean intervals (every 3rd, 7th, etc.)
                const label = this.getLabelForValue(val);
                return fmtAxisDate(label);
              },
            },
          },
          y: {
            stacked: true,
            border: { display: false },
            grid: { color: CHART_COLORS.grid },
            ticks: {
              color: CHART_COLORS.tick,
              font: { size: 11 },
              precision: 0,
            },
            beginAtZero: true,
            title: {
              display: true,
              text: 'incidents / day',
              color: CHART_COLORS.tick,
              font: { size: 10 },
              padding: { bottom: 4 },
            },
          },
        },
      },
    });
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setRangeLabel('');
    setPeakInfo(null);
    const now = new Date();
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const startDate = new Date(now.getTime() - days * 86400_000);
    const start = startDate.toISOString();

    analyticsAPI.getIncidentTimeline({ start }).then((d) => {
      if (cancelled || !chartRef.current) return;

      // Build a complete day-by-day label array (no gaps)
      const allDays = buildDayLabels(start, now.toISOString());

      // Re-index API data onto the complete day array
      const apiDaySet = new Set(d.labels ?? []);
      const apiDataByDay = {};
      (d.datasets ?? []).forEach((ds) => {
        ds.data.forEach((val, i) => {
          const day = d.labels[i];
          if (!apiDataByDay[day]) apiDataByDay[day] = {};
          apiDataByDay[day][ds.severity] = val;
        });
      });

      const datasets = [1, 2, 3, 4, 5].map((sev, i) => ({
        label: `Sev ${sev} — ${SEVERITY_DESCRIPTIONS[i]}`,
        data: allDays.map((day) => apiDataByDay[day]?.[sev] ?? 0),
        backgroundColor: SEVERITY_COLORS[i] + 'cc',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 2,
        borderSkipped: false,
      }));

      chartRef.current.data.labels = allDays;
      chartRef.current.data.datasets = datasets;
      chartRef.current.update('none');

      // Compute which severities have any data
      const active = [1,2,3,4,5].filter((sev, i) =>
        datasets[i].data.some((v) => v > 0)
      );
      setActiveSeverities(active);

      // Find peak day for the annotation
      const dailyTotals = allDays.map((day) =>
        [1,2,3,4,5].reduce((s, sev) => s + (apiDataByDay[day]?.[sev] ?? 0), 0)
      );
      const peakIdx = dailyTotals.indexOf(Math.max(...dailyTotals));
      const peakTotal = dailyTotals[peakIdx];
      if (peakTotal > 0) {
        setPeakInfo({
          date: new Date(allDays[peakIdx]).toLocaleDateString('en-EG', { month: 'short', day: 'numeric' }),
          count: peakTotal,
        });
      }

      setRangeLabel(fmtRangeLabel(start, days));
      setStatus(active.length ? 'ok' : 'empty');
    }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [range]);

  const severityLegend = SEVERITY_LABELS
    .map((label, i) => ({ label, color: SEVERITY_COLORS[i], desc: SEVERITY_DESCRIPTIONS[i], sev: i + 1 }))
    .filter(({ sev }) => activeSeverities.includes(sev));

  return (
    <div>
      {/* Legend row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
        {severityLegend.map(({ label, color, desc }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
            <span className="text-xs text-safe-text-muted">{label} <span className="opacity-50">({desc})</span></span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="relative h-52 w-full">
        <canvas ref={canvasRef} />
        <ChartOverlay status={status} height="h-52" emptyText="No incident data for this period" />
      </div>

      {/* Date range + peak annotation below the chart */}
      {status === 'ok' && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-safe-border/40">
          <span className="text-xs text-safe-text-muted">{rangeLabel}</span>
          {peakInfo && (
            <span className="text-xs text-safe-text-muted">
              Peak: <span className="text-safe-text-primary font-medium">{peakInfo.date}</span>
              {' '}·{' '}
              <span className="text-safe-text-primary font-medium">{peakInfo.count}</span> incidents
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── SeverityDonut ─────────────────────────────────────────────────────────────

function SeverityDonut({ range }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    Chart.getChart(canvas)?.destroy();
    chartRef.current = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: SEVERITY_LABELS,
        datasets: [{ data: [], backgroundColor: SEVERITY_COLORS, borderWidth: 2, borderColor: '#1a1a1a' }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        layout: { padding: { bottom: 4 } },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#1a1a1a', titleColor: 'rgba(255,255,255,0.6)', bodyColor: 'rgba(255,255,255,0.9)', padding: 10, cornerRadius: 8 },
        },
      },
    });
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    const now = new Date();
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const start = new Date(now.getTime() - days * 86400_000).toISOString();
    analyticsAPI.getSeverityBreakdown({ start }).then((d) => {
      if (cancelled || !chartRef.current) return;
      if (!d?.length) { setStatus('empty'); return; }
      const counts = [0, 0, 0, 0, 0];
      d.forEach((r) => { if (r.severity >= 1 && r.severity <= 5) counts[r.severity - 1] = r.count; });
      chartRef.current.data.datasets[0].data = counts;
      chartRef.current.update('none');
      setStatus('ok');
    }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [range]);

  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
        {SEVERITY_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: SEVERITY_COLORS[i] }} />
            <span className="text-xs text-safe-text-muted">{label}</span>
          </div>
        ))}
      </div>
      <div className="relative h-64 w-full">
        <canvas ref={canvasRef} />
        <ChartOverlay status={status} height="h-64" emptyText="No data" />
      </div>
    </div>
  );
}

// ── TopNodesTable ─────────────────────────────────────────────────────────────

function TopNodesTable({ nodes, loading }) {
  const navigate = useNavigate();
  if (loading) return <div className="flex justify-center py-8"><div className="w-5 h-5 rounded-full border-2 border-safe-blue-btn border-t-transparent animate-spin" /></div>;
  if (!nodes?.length) return <p className="text-safe-text-muted text-sm text-center py-8">No node data available</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-safe-text-gray border-b border-safe-border">
          <th className="text-left pb-2 font-medium">#</th>
          <th className="text-left pb-2 font-medium">Node</th>
          <th className="text-right pb-2 font-medium">Incidents</th>
          <th className="text-right pb-2 font-medium">Avg Severity</th>
          <th className="text-right pb-2 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {nodes.map((n, i) => (
          <tr
            key={n.nodeId}
            className="border-b border-safe-border/50 hover:bg-safe-gray/30 cursor-pointer transition-colors"
            onClick={() => navigate(`/analytics/nodes?node=${n.nodeId}`)}
          >
            <td className="py-2.5 text-safe-text-muted">{i + 1}</td>
            <td className="py-2.5">
              <div className="text-safe-text-primary font-medium">{n.name}</div>
              <div className="text-safe-text-muted text-xs">{n.streetName}</div>
            </td>
            <td className="py-2.5 text-right text-safe-text-primary font-bold">{n.incidentCount}</td>
            <td className="py-2.5 text-right">
              <span className={`font-medium ${n.avgSeverity >= 4 ? 'text-red-400' : n.avgSeverity >= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                {n.avgSeverity ?? '—'}
              </span>
            </td>
            <td className="py-2.5 text-right">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${n.uptimePct >= 90 ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                {n.uptimePct}%
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── RecentDecisionsTable ──────────────────────────────────────────────────────

function RecentDecisionsTable({ decisions, loading }) {
  if (loading) return <div className="flex justify-center py-8"><div className="w-5 h-5 rounded-full border-2 border-safe-blue-btn border-t-transparent animate-spin" /></div>;
  if (!decisions?.length) return <p className="text-safe-text-muted text-sm text-center py-8">No decisions yet</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-safe-text-gray border-b border-safe-border">
          <th className="text-left pb-2 font-medium">Incident</th>
          <th className="text-left pb-2 font-medium">Node</th>
          <th className="text-right pb-2 font-medium">Sev</th>
          <th className="text-right pb-2 font-medium">AI Conf.</th>
          <th className="text-right pb-2 font-medium">Decision</th>
        </tr>
      </thead>
      <tbody>
        {decisions.map((d) => {
          const isConfirmed = d.adminDecision && d.adminDecision !== 'rejected';
          return (
            <tr key={d.incidentId} className="border-b border-safe-border/50">
              <td className="py-2 text-safe-text-muted font-mono text-xs">{d.incidentId}</td>
              <td className="py-2 text-safe-text-primary text-xs">{d.node?.name ?? d.nodeId}</td>
              <td className="py-2 text-right">
                <span className={`font-bold ${d.severityLevel >= 4 ? 'text-red-400' : d.severityLevel >= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {d.severityLevel}
                </span>
              </td>
              <td className="py-2 text-right text-safe-text-muted text-xs">
                {d.aiConfidence ? `${Math.round(d.aiConfidence * 100)}%` : '—'}
              </td>
              <td className="py-2 text-right">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isConfirmed ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                  {isConfirmed ? '✓ Confirmed' : '✕ Rejected'}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AnalyticsOverviewPage() {
  const [overview, setOverview]     = useState(null);
  const [topNodes, setTopNodes]     = useState([]);
  const [decisions, setDecisions]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [decisionsLoading, setDecisionsLoading] = useState(true);
  const [range, setRange]           = useState('30d');

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const data = await analyticsAPI.getOverview({ range });
      setOverview(data);
    } catch {
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [range]);

  const fetchTopNodes = useCallback(async () => {
    try {
      setNodesLoading(true);
      setTopNodes(await analyticsAPI.getTopDangerousNodes());
    } catch {
      setTopNodes([]);
    } finally {
      setNodesLoading(false);
    }
  }, []);

  const fetchDecisions = useCallback(async () => {
    try {
      setDecisionsLoading(true);
      setDecisions(await analyticsAPI.getRecentDecisions());
    } catch {
      setDecisions([]);
    } finally {
      setDecisionsLoading(false);
    }
  }, []);



  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    fetchTopNodes();
    fetchDecisions();
  }, [fetchTopNodes, fetchDecisions]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-safe-text-primary">Analytics Overview</h1>
          <p className="text-safe-text-muted text-sm mt-0.5">System-wide performance at a glance</p>
        </div>
        <RangePicker ranges={RANGES} value={range} onChange={setRange} />
      </div>

      {/* Stat Cards — 2 rows of 3 */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label={range === '7d' ? 'Incidents (7 Days)' : range === '90d' ? 'Incidents (90 Days)' : 'Incidents (30 Days)'}
          value={loading ? '—' : overview?.incidentsThisMonth ?? '—'}
          trend={loading ? null : changeArrow(overview?.monthChange)}
          icon="triangle-exclamation"
          iconColor="text-orange-400"
        />
        <StatCard
          label="Avg AI Confidence"
          value={loading ? '—' : overview?.avgAiConfidence != null ? `${overview.avgAiConfidence}%` : '—'}
          trend="across confirmed incidents"
          icon="robot"
          iconColor="text-purple-400"
        />
        <StatCard
          label="Avg Response Time"
          value={loading ? '—' : overview?.avgResponseMinutes != null ? `${overview.avgResponseMinutes} min` : '—'}
          trend="AI detection → operator/AI decision"
          icon="clock"
          iconColor="text-blue-400"
        />
        <StatCard
          label="Node Fleet Uptime"
          value={loading ? '—' : overview?.nodeUptimePct != null ? `${overview.nodeUptimePct}%` : '—'}
          trend={loading ? null : `${overview?.onlineNodes ?? '?'} of ${overview?.totalNodes ?? '?'} nodes online`}
          icon="server"
          iconColor="text-green-400"
        />
        <StatCard
          label="Confirmation Rate"
          value={loading ? '—' : overview?.confirmationRate != null ? `${overview.confirmationRate}%` : '—'}
          trend="AI detections confirmed by observers"
          icon="check-circle"
          iconColor="text-teal-400"
        />
        <StatCard
          label="Operator Roles"
          value={loading ? '—' : overview?.roleCount != null ? String(overview.roleCount) : '—'}
          trend={loading ? null : overview?.roleNames || '—'}
          icon="shield"
          iconColor="text-safe-accent"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard
          title="Incident Timeline — by Severity"
          info="Shows the number of incidents per day grouped by severity level. Use this to spot spikes or trends in accident frequency over the selected period."
        >
          <IncidentTimelineChart range={range} />
        </ChartCard>
        <ChartCard
          title="Severity Breakdown"
          info="Distribution of incidents by severity level (1=minor → 5=critical) for the selected period. Helps assess overall risk profile of the network."
        >
          <SeverityDonut range={range} />
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard
          title="Top 5 Most Dangerous Nodes"
          info="Nodes ranked by total incident count. Click a row to open the node's full analytics detail view."
        >
          <TopNodesTable nodes={topNodes} loading={nodesLoading} />
        </ChartCard>
        <ChartCard
          title="Recent AI vs Human Decisions"
          info="Latest incidents showing the AI-detected event alongside the final human (or AI-assisted) decision — confirmed or rejected."
        >
          <RecentDecisionsTable decisions={decisions} loading={decisionsLoading} />
        </ChartCard>
      </div>
    </div>
  );
}