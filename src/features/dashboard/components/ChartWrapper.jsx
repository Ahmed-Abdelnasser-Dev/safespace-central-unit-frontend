import { useRef, useEffect, useCallback, useState } from 'react';
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { metricsAPI } from '@/services/api';

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

// Hex values are required here — canvas can't use CSS classes (sanctioned exception)
const CHART_COLORS = {
  line: '#4a90d9',
  fill: 'rgba(74, 144, 217, 0.12)',
  grid: 'rgba(255, 255, 255, 0.05)',
  tick: 'rgba(255, 255, 255, 0.35)',
  tooltipBg: '#1a1a1a',
  tooltipBorder: 'rgba(255, 255, 255, 0.08)',
  tooltipTitle: 'rgba(255, 255, 255, 0.6)',
  tooltipBody: 'rgba(255, 255, 255, 0.9)',
};

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: CHART_COLORS.tooltipBg,
      borderColor: CHART_COLORS.tooltipBorder,
      borderWidth: 1,
      titleColor: CHART_COLORS.tooltipTitle,
      bodyColor: CHART_COLORS.tooltipBody,
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      border: { display: false },
      grid: { color: CHART_COLORS.grid },
      ticks: {
        color: CHART_COLORS.tick,
        maxTicksLimit: 8,
        font: { size: 11 },
        maxRotation: 0,
      },
    },
    y: {
      border: { display: false },
      grid: { color: CHART_COLORS.grid },
      ticks: {
        color: CHART_COLORS.tick,
        maxTicksLimit: 5,
        font: { size: 11 },
      },
      beginAtZero: true,
    },
  },
};

function buildDataset(values) {
  return {
    data: values,
    borderColor: CHART_COLORS.line,
    backgroundColor: CHART_COLORS.fill,
    fill: true,
    tension: 0.4,
    pointRadius: 0,
    pointHoverRadius: 4,
    pointHoverBackgroundColor: CHART_COLORS.line,
    borderWidth: 2,
  };
}

/**
 * @param {string}  type        - metric type key passed to metricsAPI.getHourly
 * @param {number}  refreshKey  - increment to trigger a refetch
 * @param {string}  emptyLabel  - shown when data is an empty array
 * @param {number}  windowHours - how many past hours to request (default 24)
 */
function ChartWrapper({ type, refreshKey = 0, emptyLabel = 'No data available', windowHours = 24 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const mountedRef = useRef(true);
  const [status, setStatus] = useState('loading');

  // Init Chart.js instance once on mount
  useEffect(() => {
    mountedRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Guard against React StrictMode double-invoke: destroy any existing chart
    // on this canvas before creating a new one (avoids "Canvas is already in use")
    Chart.getChart(canvas)?.destroy();

    chartRef.current = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: { labels: [], datasets: [buildDataset([])] },
      options: CHART_OPTIONS,
    });

    return () => {
      mountedRef.current = false;
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  // Fetch data whenever type or refreshKey changes
  const load = useCallback(async () => {
    if (!mountedRef.current) return;
    setStatus('loading');
    try {
      const now = new Date();
      const start = new Date(now.getTime() - windowHours * 60 * 60 * 1000);
      const result = await metricsAPI.getHourly(
        type,
        start.toISOString(),
        now.toISOString(),
      );

      if (!mountedRef.current) return;

      const labels = result?.labels ?? [];
      const values = result?.data ?? [];

      if (!labels.length) {
        setStatus('empty');
        return;
      }

      if (chartRef.current) {
        chartRef.current.data.labels = labels;
        chartRef.current.data.datasets[0].data = values;
        chartRef.current.update('none');
      }
      setStatus('ok');
    } catch {
      if (mountedRef.current) setStatus('error');
    }
  }, [type, windowHours]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <div className="relative h-48 w-full">
      <canvas ref={canvasRef} />
      {status !== 'ok' && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-safe-gray/70">
          {status === 'loading' && (
            <div className="w-5 h-5 rounded-full border-2 border-safe-blue-btn border-t-transparent animate-spin" />
          )}
          {status === 'error' && (
            <p className="text-xs text-safe-text-muted">Unable to load chart data</p>
          )}
          {status === 'empty' && (
            <p className="text-xs text-safe-text-muted">{emptyLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ChartWrapper;
