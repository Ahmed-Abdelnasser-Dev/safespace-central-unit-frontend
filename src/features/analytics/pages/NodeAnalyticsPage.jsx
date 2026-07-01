/**
 * NodeAnalyticsPage — /analytics/nodes
 *
 * Left sidebar: all nodes list
 * Right panel: selected node detail (health sparklines, incident timeline, cameras)
 * Read-only.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { analyticsAPI } from '@/services/api';
import {
  Chart, LineController, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler,
} from 'chart.js';

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const CHART_GRID = 'rgba(255,255,255,0.05)';
const CHART_TICK = 'rgba(255,255,255,0.35)';

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ label, value, unit = '', color = '#4a90d9', data = [] }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    Chart.getChart(canvas)?.destroy();
    chartRef.current = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, backgroundColor: color + '22', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 1.5 }] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false, beginAtZero: true } },
      },
    });
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, [data, color]);

  return (
    <div className="bg-safe-gray/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-safe-text-muted">{label}</span>
        <span className="text-sm font-bold text-safe-text-primary">{value}{unit}</span>
      </div>
      <div className="h-10"><canvas ref={canvasRef} /></div>
    </div>
  );
}

// ── NodeSidebar ───────────────────────────────────────────────────────────────

function NodeSidebar({ nodes, selected, onSelect, loading }) {
  const [search, setSearch] = useState('');
  const filtered = nodes.filter((n) =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.streetName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center pt-12">
      <div className="w-5 h-5 rounded-full border-2 border-safe-blue-btn border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-safe-border">
        <input
          type="text"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-safe-gray/40 border border-safe-border rounded-lg px-3 py-1.5 text-sm text-safe-text-primary placeholder:text-safe-text-muted focus:outline-none focus:border-safe-blue-btn"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((n) => (
          <button
            key={n.nodeId}
            onClick={() => onSelect(n.nodeId)}
            className={`w-full text-left px-4 py-3 border-b border-safe-border/50 transition-colors hover:bg-safe-gray/30 ${selected === n.nodeId ? 'bg-safe-blue-btn/10 border-l-2 border-l-safe-blue-btn' : ''}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-safe-text-primary truncate pr-2">{n.name}</span>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${n.status === 'online' ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
            <div className="text-xs text-safe-text-muted truncate">{n.streetName}</div>
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-safe-text-muted">{n.incidentCount} incidents</span>
              <span className={`text-xs px-1.5 py-0 rounded ${n.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>{n.status}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-safe-text-muted text-sm py-8">No nodes found</p>
        )}
      </div>
    </div>
  );
}

// ── NodeDetailPanel ───────────────────────────────────────────────────────────

function IncidentTimelineSparkline({ labels, values }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    Chart.getChart(canvas)?.destroy();
    chartRef.current = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{ data: values, borderColor: '#4a90d9', backgroundColor: 'rgba(74,144,217,0.12)', fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a1a', titleColor: 'rgba(255,255,255,0.6)', bodyColor: 'rgba(255,255,255,0.9)', padding: 8, cornerRadius: 6 } },
        scales: {
          x: { border: { display: false }, grid: { color: CHART_GRID }, ticks: { color: CHART_TICK, font: { size: 10 }, maxTicksLimit: 7, maxRotation: 0 } },
          y: { border: { display: false }, grid: { color: CHART_GRID }, ticks: { color: CHART_TICK, font: { size: 10 } }, beginAtZero: true },
        },
      },
    });
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, [labels, values]);

  return <div className="relative h-32 w-full"><canvas ref={canvasRef} /></div>;
}

function NodeDetailPanel({ nodeId }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nodeId) return;
    setLoading(true);
    analyticsAPI.getNodeDetail(nodeId, { range: '30d' }).then(setDetail).catch(() => setDetail(null)).finally(() => setLoading(false));
  }, [nodeId]);

  if (!nodeId) return (
    <div className="flex flex-col items-center justify-center h-full text-safe-text-muted">
      <FontAwesomeIcon icon="server" className="text-4xl mb-3 opacity-30" />
      <p className="text-sm">Select a node from the list</p>
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <div className="w-6 h-6 rounded-full border-2 border-safe-blue-btn border-t-transparent animate-spin" />
    </div>
  );

  if (!detail) return (
    <div className="flex justify-center items-center h-full text-safe-text-muted text-sm">Failed to load node data</div>
  );

  const { node, cameras, incidents, incidentTimeline } = detail;

  // Build fake sparkline arrays (current single values — in production would be telemetry history)
  const fakeHistory = (base) => Array.from({ length: 20 }, () => Math.max(0, base + (Math.random() - 0.5) * base * 0.3));

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-safe-text-primary">{node.name}</h2>
          <p className="text-safe-text-muted text-sm">{node.streetName}</p>
          {node.lastHeartbeat && (
            <p className="text-xs text-safe-text-muted mt-1">
              Last heartbeat: {new Date(node.lastHeartbeat).toLocaleString('en-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${node.status === 'online' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${node.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {node.status}
          </span>
          {node.status !== 'online' && (
            <span className="text-xs text-safe-text-muted">No heartbeat received</span>
          )}
        </div>
      </div>

      {/* Health sparklines */}
      <div>
        <h3 className="text-xs font-semibold text-safe-text-gray uppercase tracking-wider mb-3">Hardware Health</h3>
        <div className="grid grid-cols-2 gap-3">
          <Sparkline label="CPU Usage" value={node.cpu?.toFixed(1) ?? 0} unit="%" color="#4a90d9" data={fakeHistory(node.cpu ?? 20)} />
          <Sparkline label="Temperature" value={node.temperature?.toFixed(1) ?? 0} unit="°C" color="#fb923c" data={fakeHistory(node.temperature ?? 40)} />
          <Sparkline label="Memory" value={node.memory?.toFixed(1) ?? 0} unit="%" color="#a78bfa" data={fakeHistory(node.memory ?? 30)} />
          <Sparkline label="Network" value={node.network?.toFixed(1) ?? 0} unit="%" color="#34d399" data={fakeHistory(node.network ?? 15)} />
        </div>
      </div>

      {/* Incident timeline */}
      <div>
        <h3 className="text-xs font-semibold text-safe-text-gray uppercase tracking-wider mb-3">Incident History (30 days)</h3>
        {incidentTimeline.labels.length > 0
          ? <IncidentTimelineSparkline labels={incidentTimeline.labels} values={incidentTimeline.data} />
          : <p className="text-safe-text-muted text-sm text-center py-4">No incidents in this period</p>
        }
      </div>

      {/* Camera list */}
      <div>
        <h3 className="text-xs font-semibold text-safe-text-gray uppercase tracking-wider mb-3">Cameras ({cameras.length})</h3>
        {cameras.length === 0
          ? <p className="text-safe-text-muted text-sm">No cameras registered</p>
          : (
            <div className="space-y-2">
              {cameras.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-safe-gray/20 rounded-lg px-3 py-2">
                  <span className="text-sm text-safe-text-primary">{c.name}</span>
                  <div className="flex items-center gap-2">
                    {c.lastSeenAt && <span className="text-xs text-safe-text-muted">{new Date(c.lastSeenAt).toLocaleDateString()}</span>}
                    <span className={`w-2 h-2 rounded-full ${c.status === 'ONLINE' ? 'bg-green-400' : 'bg-red-400'}`} />
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* Recent incidents (last 5) */}
      <div>
        <h3 className="text-xs font-semibold text-safe-text-gray uppercase tracking-wider mb-3">Recent Incidents</h3>
        {incidents.length === 0
          ? <p className="text-safe-text-muted text-sm">No incidents recorded</p>
          : (
            <div className="space-y-1">
              {incidents.slice(-5).reverse().map((inc) => (
                <div key={inc.incidentId} className="flex items-center justify-between text-sm bg-safe-gray/20 rounded-lg px-3 py-2">
                  <span className="font-mono text-xs text-safe-text-muted">{inc.incidentId}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-safe-text-muted">
                      {new Date(inc.createdAt).toLocaleDateString('en-EG', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`font-bold text-sm ${inc.severityLevel >= 4 ? 'text-red-400' : inc.severityLevel >= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                      Sev {inc.severityLevel}
                    </span>
                    <span className={`text-xs ${inc.adminDecision && inc.adminDecision !== 'rejected' ? 'text-green-400' : inc.adminDecision === 'rejected' ? 'text-red-400' : 'text-safe-text-muted'}`}>
                      {inc.adminDecision ?? 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function NodeAnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [nodes, setNodes]               = useState([]);
  const [nodesLoading, setNodesLoading] = useState(true);
  const selectedNodeId = searchParams.get('node') ?? null;

  useEffect(() => {
    analyticsAPI.getNodeList()
      .then(setNodes)
      .catch(() => setNodes([]))
      .finally(() => setNodesLoading(false));
  }, []);

  const handleSelect = useCallback((nodeId) => {
    setSearchParams({ node: nodeId });
  }, [setSearchParams]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-safe-sidebar border-r border-safe-border overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-safe-border">
          <h1 className="text-sm font-bold text-safe-text-primary">Node Health</h1>
          <p className="text-xs text-safe-text-muted mt-0.5">{nodes.length} nodes in fleet</p>
          {nodes.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-green-400 font-medium">
                  {nodes.filter((n) => n.status === 'online').length} online
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 opacity-70" />
                <span className="text-xs text-safe-text-muted">
                  {nodes.filter((n) => n.status !== 'online').length} offline
                </span>
              </div>
            </div>
          )}
        </div>
        <NodeSidebar
          nodes={nodes}
          selected={selectedNodeId}
          onSelect={handleSelect}
          loading={nodesLoading}
        />
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-hidden bg-safe-dark">
        <NodeDetailPanel nodeId={selectedNodeId} />
      </div>
    </div>
  );
}