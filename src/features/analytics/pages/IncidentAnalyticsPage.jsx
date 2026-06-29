/**
 * IncidentAnalyticsPage — /analytics/incidents
 *
 * Deep-dive into incident patterns.
 * Uses shared ChartCard / RangePicker / ChartOverlay components.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { analyticsAPI } from '@/services/api';
import ChartCard from '../components/ChartCard.jsx';
import RangePicker from '../components/RangePicker.jsx';
import {
  Chart,
  LineController, BarController,
  CategoryScale, LinearScale,
  PointElement, LineElement, BarElement,
  Tooltip, Legend, Filler,
} from 'chart.js';

Chart.register(
  LineController, BarController,
  CategoryScale, LinearScale,
  PointElement, LineElement, BarElement,
  Tooltip, Legend, Filler,
);

const CHART_GRID = 'rgba(255,255,255,0.05)';
const CHART_TICK = 'rgba(255,255,255,0.35)';

const RESPONSE_BUCKETS = [
  { label: '< 5 min',   color: '#4ade80', desc: 'Excellent — operator responded immediately' },
  { label: '5–15 min',  color: '#a3e635', desc: 'Good — within target SLA' },
  { label: '15–30 min', color: '#fb923c', desc: 'Slow — review staffing' },
  { label: '> 30 min',  color: '#f87171', desc: 'Critical — needs attention' },
];

const PRESET_RANGES = [
  { label: 'Today', value: 'today' },
  { label: '7d',    value: '7d' },
  { label: '30d',   value: '30d' },
  { label: '90d',   value: '90d' },
];

// ── TimeOfDayGrid ─────────────────────────────────────────────────────────────

function fmtHour(h) {
  if (h === 0)  return '12am';
  if (h === 12) return '12pm';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function TimeOfDayGrid({ data, loading }) {
  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 rounded-full border-2 border-safe-blue-btn border-t-transparent animate-spin" /></div>;
  if (!data || !data.matrix) return <p className="text-safe-text-muted text-sm text-center py-12">No incident data for this period</p>;

  const { matrix, days } = data;
  const allValues = matrix.flat();
  const maxVal = Math.max(...allValues, 1);

  function cellColor(count) {
    if (!count) return 'bg-safe-gray/20';
    const intensity = count / maxVal;
    if (intensity < 0.2) return 'bg-blue-900/40';
    if (intensity < 0.4) return 'bg-blue-700/60';
    if (intensity < 0.6) return 'bg-orange-500/60';
    if (intensity < 0.8) return 'bg-orange-600/80';
    return 'bg-red-500';
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Hour labels */}
        <div className="flex mb-1">
          <div className="w-8" />
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="w-6 text-center text-safe-text-muted leading-4" style={{ fontSize: '9px' }}>
              {h % 3 === 0 ? fmtHour(h) : ''}
            </div>
          ))}
        </div>
        {days.map((day, dow) => (
          <div key={day} className="flex items-center mb-0.5">
            <div className="w-8 text-xs text-safe-text-muted text-right pr-1">{day}</div>
            {matrix[dow].map((count, hour) => (
              <div
                key={hour}
                title={`${day} ${fmtHour(hour)} — ${count} incidents`}
                className={`w-6 h-5 rounded-sm mx-0.5 ${cellColor(count)} cursor-default transition-opacity hover:opacity-80`}
              />
            ))}
          </div>
        ))}


                {/* Density legend */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-safe-border/50">
          <span className="text-xs text-safe-text-muted mr-1">Density:</span>
          {[
            { color: 'bg-safe-gray/20',    label: '0' },
            { color: 'bg-blue-900/40',     label: 'Low' },
            { color: 'bg-blue-700/60',     label: '' },
            { color: 'bg-orange-500/60',   label: '' },
            { color: 'bg-orange-600/80',   label: '' },
            { color: 'bg-red-500',         label: 'High' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`w-5 h-4 rounded-sm ${s.color}`} />
              {s.label && <span className="text-xs text-safe-text-muted">{s.label}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ConfirmationRateChart ─────────────────────────────────────────────────────

function ConfirmationRateChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    Chart.getChart(canvas)?.destroy();
    chartRef.current = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Confirmed %',
          data: [],
          borderColor: '#4ade80',
          backgroundColor: 'rgba(74,222,128,0.1)',
          fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1a', titleColor: 'rgba(255,255,255,0.6)',
            bodyColor: 'rgba(255,255,255,0.9)', padding: 10, cornerRadius: 8,
            callbacks: {
              label: (ctx) => `Confirmed: ${ctx.parsed.y.toFixed(1)}%`,
            },
          },
        },
        scales: {
          x: { border: { display: false }, grid: { color: CHART_GRID }, ticks: { color: CHART_TICK, font: { size: 10 }, maxRotation: 0, maxTicksLimit: 8 } },
          y: { border: { display: false }, grid: { color: CHART_GRID }, ticks: { color: CHART_TICK, callback: (v) => `${v}%` }, min: 0, max: 100 },
        },
      },
    });
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, []);

  useEffect(() => {
    if (!data || !chartRef.current) return;
    chartRef.current.data.labels = data.map((r) => r.week);
    chartRef.current.data.datasets[0].data = data.map((r) => r.confirmationRate);
    chartRef.current.update('none');
  }, [data]);

  return <div className="relative h-52 w-full"><canvas ref={canvasRef} /></div>;
}

// ── ResponseTimeChart ─────────────────────────────────────────────────────────

function ResponseTimeChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    Chart.getChart(canvas)?.destroy();
    chartRef.current = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: RESPONSE_BUCKETS.map((b) => b.label),
        datasets: [{
          data: [],
          backgroundColor: RESPONSE_BUCKETS.map((b) => b.color),
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1a', titleColor: 'rgba(255,255,255,0.6)',
            bodyColor: 'rgba(255,255,255,0.9)', padding: 10, cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const bucket = RESPONSE_BUCKETS[ctx.dataIndex];
                return [`Count: ${ctx.parsed.y}`, bucket?.desc ?? ''];
              },
            },
          },
        },
        scales: {
          x: { border: { display: false }, grid: { color: CHART_GRID }, ticks: { color: CHART_TICK, font: { size: 11 } } },
          y: {
            border: { display: false }, grid: { color: CHART_GRID },
            ticks: { color: CHART_TICK, font: { size: 11 }, stepSize: 1 },
            beginAtZero: true,
            title: { display: true, text: 'Incidents', color: CHART_TICK, font: { size: 10 } },
          },
        },
      },
    });
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, []);

  useEffect(() => {
    if (!data || !chartRef.current) return;
    chartRef.current.data.datasets[0].data = [data.lt5, data['5to15'], data['15to30'], data.gt30];
    chartRef.current.update('none');
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="relative h-44 w-full"><canvas ref={canvasRef} /></div>
      {/* Legend inside same box */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-safe-border/50">
        {RESPONSE_BUCKETS.map(({ label, color, desc }) => (
          <div key={label} className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0 mt-0.5" style={{ background: color }} />
            <div>
              <span className="text-safe-text-primary text-xs font-medium">{label}</span>
              <span className="text-safe-text-muted text-xs block">{desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── IncidentTable ─────────────────────────────────────────────────────────────

function IncidentTable({ filters }) {
  const [rows, setRows]   = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage]   = useState(1);
  const [loading, setLoading] = useState(false);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await analyticsAPI.getIncidentTable({ ...filters, page, limit: LIMIT });
      setRows(result.data ?? []);
      setTotal(result.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { setPage(1); }, [filters]);
  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / LIMIT);

  const decisionBadge = (d) => {
    if (!d) return <span className="text-safe-text-muted text-xs">Pending</span>;
    const ok = d !== 'rejected';
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ok ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
        {ok ? 'Confirmed' : 'Rejected'}
      </span>
    );
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-safe-text-gray border-b border-safe-border">
              <th className="text-left pb-2 font-medium pr-4">ID</th>
              <th className="text-left pb-2 font-medium pr-4">Node</th>
              <th className="text-left pb-2 font-medium pr-4">Time</th>
              <th className="text-right pb-2 font-medium pr-4">Sev</th>
              <th className="text-right pb-2 font-medium pr-4">AI Conf.</th>
              <th className="text-left pb-2 font-medium pr-4">Status</th>
              <th className="text-left pb-2 font-medium pr-4">Decision</th>
              <th className="text-right pb-2 font-medium">Response</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8} className="py-12 text-center text-safe-text-muted"><div className="flex justify-center"><div className="w-5 h-5 rounded-full border-2 border-safe-blue-btn border-t-transparent animate-spin" /></div></td></tr>
              : rows.length === 0
              ? <tr><td colSpan={8} className="py-12 text-center text-safe-text-muted text-sm">No incidents match these filters</td></tr>
              : rows.map((inc) => (
                <tr key={inc.id} className="border-b border-safe-border/50 hover:bg-safe-gray/20 transition-colors">
                  <td className="py-2.5 pr-4 font-mono text-xs text-safe-text-muted">{inc.incidentId}</td>
                  <td className="py-2.5 pr-4">
                    <div className="text-safe-text-primary text-xs">{inc.node?.name ?? inc.nodeId}</div>
                    <div className="text-safe-text-muted text-xs">{inc.node?.streetName}</div>
                  </td>
                  <td className="py-2.5 pr-4 text-safe-text-muted text-xs whitespace-nowrap">
                    {new Date(inc.createdAt).toLocaleString('en-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <span className={`font-bold text-sm ${inc.severityLevel >= 4 ? 'text-red-400' : inc.severityLevel >= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {inc.severityLevel}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right text-safe-text-muted text-xs">
                    {inc.aiConfidence ? `${Math.round(inc.aiConfidence * 100)}%` : '—'}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      inc.status === 'resolved' ? 'bg-green-900/40 text-green-400' :
                      inc.status === 'assigned' ? 'bg-blue-900/40 text-blue-400' :
                      'bg-yellow-900/40 text-yellow-400'
                    }`}>{inc.status}</span>
                  </td>
                  <td className="py-2.5 pr-4">{decisionBadge(inc.adminDecision)}</td>
                  <td className="py-2.5 text-right text-safe-text-muted text-xs">
                    {inc.responseMinutes != null ? `${inc.responseMinutes}m` : '—'}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-safe-text-muted">{total} incidents total</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg bg-safe-sidebar border border-safe-border text-safe-text-muted disabled:opacity-40 hover:text-safe-text-primary">Prev</button>
            <span className="px-3 py-1.5 text-safe-text-muted">Page {page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg bg-safe-sidebar border border-safe-border text-safe-text-muted disabled:opacity-40 hover:text-safe-text-primary">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function IncidentAnalyticsPage() {
  const [range, setRange]               = useState('30d');
  const [todHeatmap, setTodHeatmap]     = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(true);
  const [confRate, setConfRate]         = useState(null);
  const [respTime, setRespTime]         = useState(null);
  const [filters, setFilters]           = useState({});

  function getStart(r) {
    const now = new Date();
    const days = r === '7d' ? 7 : r === '90d' ? 90 : r === 'today' ? 0 : 30;
    if (days === 0) { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.toISOString(); }
    return new Date(now.getTime() - days * 86400_000).toISOString();
  }

  useEffect(() => {
    const start = getStart(range);
    setFilters({ start });
    setHeatmapLoading(true);
    analyticsAPI.getTimeOfDayHeatmap({ start })
      .then((d) => { setTodHeatmap(d); setHeatmapLoading(false); })
      .catch(() => { setTodHeatmap(null); setHeatmapLoading(false); });
    analyticsAPI.getConfirmationRate({ start }).then(setConfRate).catch(() => setConfRate([]));
    analyticsAPI.getResponseTimeDistribution({ start })
      .then(setRespTime)
      .catch(() => setRespTime({ lt5: 0, '5to15': 0, '15to30': 0, gt30: 0 }));
  }, [range]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-safe-text-primary">Incident Analysis</h1>
          <p className="text-safe-text-muted text-sm mt-0.5">Deep-dive into accident patterns on Ismailia Ring Road</p>
        </div>
        <RangePicker ranges={PRESET_RANGES} value={range} onChange={setRange} />
      </div>

      {/* 2×2 chart grid */}
      <div className="grid grid-cols-2 gap-4">

        {/* 1 — Heatmap (with legend inline) */}
        <ChartCard
          title="Time-of-Day Incident Heatmap"
          subtitle="Rows = day of week · Columns = hour · Color = incident density"
          info="Shows which hours and days have the most incidents. Red cells indicate peak accident times. Use this to schedule patrols and plan staffing around high-risk windows."
        >
          <TimeOfDayGrid data={todHeatmap} loading={heatmapLoading} />
        </ChartCard>

        {/* 2 — AI Confirmation Rate */}
        <ChartCard
          title="AI Confirmation Rate Over Time"
          subtitle="Weekly % of AI detections that were confirmed by road observers or operators"
          info="Tracks how often the AI's incident detections are validated by human operators each week. A high rate (>80%) means the AI is reliably accurate. A sudden drop may indicate environmental issues (lighting, occlusion) or a model drift that needs review."
        >
          {confRate === null
            ? <div className="flex justify-center py-12"><div className="w-5 h-5 rounded-full border-2 border-safe-blue-btn border-t-transparent animate-spin" /></div>
            : confRate.length === 0
            ? <p className="text-safe-text-muted text-sm text-center py-12">No confirmation data for this period</p>
            : <ConfirmationRateChart data={confRate} />
          }
        </ChartCard>

        {/* 3 — Response Time Distribution (legend inside same box) */}
        <ChartCard
          title="Response Time Distribution"
          subtitle="Time from AI detection to operator/AI decision, grouped by duration"
          info="Measures how quickly incidents are acted upon after being detected. Short response times (green) indicate a well-staffed and responsive operation. Spikes in the orange or red buckets signal staffing gaps or workflow bottlenecks."
        >
          {respTime === null
            ? <div className="flex justify-center py-12"><div className="w-5 h-5 rounded-full border-2 border-safe-blue-btn border-t-transparent animate-spin" /></div>
            : <ResponseTimeChart data={respTime} />
          }
        </ChartCard>

        {/* 4 — Incident table summary card */}
        <ChartCard
          title="Incident Summary"
          info="Quick stats panel for the selected time range. Scroll down to see the full filterable incident table."
        >
          <div className="text-safe-text-muted text-sm space-y-3 py-2">
            <p>The table below lists all incidents for the selected period. You can page through them and export via the Reports page.</p>
            <ul className="space-y-1.5 text-xs list-disc list-inside">
              <li>Filter by date range using the buttons above</li>
              <li>Click any chart to drill down by severity or hour</li>
              <li>Use <span className="text-safe-text-primary font-medium">Analytics → Reports</span> to export CSV</li>
            </ul>
          </div>
        </ChartCard>
      </div>

      {/* Incident table */}
      <ChartCard
        title="All Incidents"
        info="Full incident log for the selected period. Read-only. Use the Reports page to download as CSV."
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-safe-text-muted">Read-only view · sorted by most recent</span>
        </div>
        <IncidentTable filters={filters} />
      </ChartCard>
    </div>
  );
}