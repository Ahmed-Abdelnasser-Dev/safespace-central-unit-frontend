import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

const COLORS = ['#4C72B0', '#DD8452', '#55A868', '#C44E52'];

function generateHourlySeries(points = 24) {
  const now = Date.now();
  const labels = [];
  const data = [];
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(now - i * 60 * 60 * 1000);
    labels.push(t.toISOString());
    data.push(Math.round(80 + Math.random() * 400));
  }
  return { labels, data };
}

function ChartWrapper({
  title = 'Chart',
  type = 'line',
  series,
  timeUnit = 'hour', // 'hour' | 'minute'
  updateThrottle = 900,
  animationDuration = 600,
  showLegend = false,
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');

    // create chart only once
    if (!chartRef.current) {
      const sample = series || generateHourlySeries(24);
      chartRef.current = new Chart(ctx, {
        type,
        data: {
          labels: sample.labels,
          datasets: [
            {
              label: title,
              data: sample.data,
              borderColor: COLORS[0],
              backgroundColor: COLORS[0] + '33',
              fill: true,
              tension: 0.3,
              pointRadius: 2,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: animationDuration, easing: 'easeOutQuart' },
          plugins: {
            legend: { display: showLegend },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: (items) => {
                  const d = items[0]?.label ?? items[0]?.parsed?.x ?? items[0];
                  try { return new Date(d).toLocaleString(undefined, { hour: 'numeric', minute: 'numeric', hour12: true }); } catch (e) { return String(d); }
                },
                label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed?.y ?? ctx.parsed}`
              }
            }
          },
          scales: {
            x: { type: 'time', time: { unit: timeUnit }, grid: { display: false } },
            y: { beginAtZero: true }
          }
        }
      });
    } else {
      // throttle updates: collect and apply once per interval
      if (series) {
        if (!chartRef.current._pending) chartRef.current._pending = { timer: null, next: null };
        chartRef.current._pending.next = { title, type, series };
        if (chartRef.current._pending.timer) return;
        chartRef.current._pending.timer = setTimeout(() => {
          const next = chartRef.current._pending.next;
          chartRef.current._pending.timer = null;
          chartRef.current._pending.next = null;
          // apply with animation
          chartRef.current.options.animation = { duration: animationDuration, easing: 'easeOutQuad' };
          chartRef.current.data.labels = next.series.labels;
          if (Array.isArray(next.series.data[0])) {
            chartRef.current.data.datasets = next.series.data.map((d, i) => ({
              label: `${next.title} ${i + 1}`,
              data: d,
              borderColor: COLORS[i % COLORS.length],
              backgroundColor: COLORS[i % COLORS.length] + '33',
              fill: true,
            }));
          } else {
            chartRef.current.data.datasets[0].data = next.series.data;
            chartRef.current.data.datasets[0].label = next.title;
            chartRef.current.data.datasets[0].borderColor = COLORS[0];
            chartRef.current.data.datasets[0].backgroundColor = COLORS[0] + '33';
          }
          chartRef.current.update();
        }, updateThrottle);
      }
    }

    return () => {
      if (chartRef.current && chartRef.current._pending?.timer) clearTimeout(chartRef.current._pending.timer);
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = null;
    };
  }, [title, type, series]);

      return ( 
    <div className="relative h-48 w-full rounded-xl border border-safe-gray-light bg-gradient-to-br from-safe-gray to-safe-gray-light p-2">
      <div className="sr-only">{title}</div>
      {series && series.data && (
        <div className="absolute top-3 right-3 bg-black/40 text-xs text-white px-2 py-1 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-safe-success animate-pulse" />
          <span>{series.data.reduce((a, b) => a + (Number(b) || 0), 0)}</span>
        </div>
      )}

          {/* toolbar: legend toggle, exports */}
          <div className="absolute left-3 top-3 flex items-center gap-2"> 
            {showLegend && (
              <button type="button" onClick={() => {
                if (!chartRef.current) return;
                chartRef.current.options.plugins.legend.display = !chartRef.current.options.plugins.legend.display;
                chartRef.current.update();
              }} className="text-xs bg-black/30 px-2 py-1 rounded-md text-white">Legend</button>
            )}
            <button type="button" onClick={() => {
              if (!chartRef.current) return;
              const url = chartRef.current.toBase64Image();
              const a = document.createElement('a');
              a.href = url; a.download = `${title.replace(/\s+/g,'_')}.png`; a.click();
            }} className="text-xs bg-black/30 px-2 py-1 rounded-md text-white">PNG</button>
            <button type="button" onClick={() => {
              if (!chartRef.current) return;
              const labels = chartRef.current.data.labels || [];
              const datasets = chartRef.current.data.datasets || [];
              let csv = 'label,' + datasets.map(d => `"${d.label}"`).join(',') + '\n';
              for (let i=0;i<labels.length;i++){
                csv += '"' + labels[i] + '",' + datasets.map(d => `"${d.data[i] ?? ''}"`).join(',') + '\n';
              }
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `${title.replace(/\s+/g,'_')}.csv`; a.click();
              URL.revokeObjectURL(url);
            }} className="text-xs bg-black/30 px-2 py-1 rounded-md text-white">CSV</button>
          </div>

      <canvas ref={canvasRef} />

          {/* dataset toggles */}
          <div className="absolute left-3 bottom-3 flex items-center gap-2">
            {(chartRef.current?.data?.datasets || []).map((d, i) => (
              <button key={i} type="button" onClick={() => {
                if (!chartRef.current) return;
                const visible = chartRef.current.isDatasetVisible(i);
                chartRef.current.setDatasetVisibility(i, !visible);
                chartRef.current.update();
              }} className={`text-xs px-2 py-1 rounded-md ${chartRef.current?.isDatasetVisible(i) ? 'bg-black/40 text-white' : 'bg-black/10 text-safe-text-gray'}`}>
                {d.label}
              </button>
            ))}
          </div>
    </div>
  );
}

export default ChartWrapper;
