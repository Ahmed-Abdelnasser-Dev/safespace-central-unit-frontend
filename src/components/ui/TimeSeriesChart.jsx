import { useRef, useEffect } from 'react';
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

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

// Hex values are required here — canvas can't use CSS classes (sanctioned exception)
const GRID_COLOR = 'rgba(255,255,255,0.05)';
const TICK_COLOR = 'rgba(255,255,255,0.35)';
const TOOLTIP_BG = '#1a1a1a';
const TOOLTIP_BORDER = 'rgba(255,255,255,0.08)';
const TOOLTIP_TITLE = 'rgba(255,255,255,0.6)';
const TOOLTIP_BODY = 'rgba(255,255,255,0.9)';

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function TimeSeriesChart({
  labels = [],
  values = [],
  color = '#3b7cff',
  unit = '%',
  label = 'Value',
  height = 160,
  isLoading = false,
  isEmpty = false,
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const hasData = !isEmpty && Array.isArray(labels) && labels.length > 0;

  // Respect prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Guard StrictMode double-invoke
    Chart.getChart(canvas)?.destroy();

    chartRef.current = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label,
            data: values,
            borderColor: color,
            backgroundColor: hexToRgba(color, 0.12),
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: color,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReducedMotion ? false : { duration: 400 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: TOOLTIP_BG,
            borderColor: TOOLTIP_BORDER,
            borderWidth: 1,
            titleColor: TOOLTIP_TITLE,
            bodyColor: TOOLTIP_BODY,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => `${ctx.parsed.y}${unit}`,
            },
          },
        },
        scales: {
          x: {
            border: { display: false },
            grid: { color: GRID_COLOR },
            ticks: {
              color: TICK_COLOR,
              maxTicksLimit: 8,
              font: { size: 11 },
              maxRotation: 0,
            },
          },
          y: {
            border: { display: false },
            grid: { color: GRID_COLOR },
            ticks: {
              color: TICK_COLOR,
              maxTicksLimit: 5,
              font: { size: 11 },
              callback: (val) => `${val}${unit}`,
            },
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // Only re-create chart when color or unit changes (structural change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, unit, label]);

  // Update data without destroying the chart instance
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !hasData) return;
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.data.datasets[0].borderColor = color;
    chart.data.datasets[0].backgroundColor = hexToRgba(color, 0.12);
    chart.update('none'); // 'none' = no animation on data update (smooth live feel)
  }, [labels, values, color, hasData]);

  return (
    <div className="relative w-full" style={{ height }}>
      <canvas ref={canvasRef} className={hasData && !isLoading ? '' : 'invisible'} />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-safe-gray/60">
          <div className="w-5 h-5 rounded-full border-2 border-safe-blue-btn border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty / awaiting telemetry */}
      {!isLoading && !hasData && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-safe-gray/50 gap-1">
          <p className="text-xs text-safe-text-muted">Awaiting telemetry</p>
          <p className="text-[10px] text-safe-text-muted/60">{label} history not yet available</p>
        </div>
      )}
    </div>
  );
}

export default TimeSeriesChart;
