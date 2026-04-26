/**
 * Reusable Line Chart Component
 * 
 * SVG-based line chart for displaying historical data trends
 * Includes grid lines, data points, and time labels
 * 
 * @component
 * @param {Array} data - Array of numeric values to plot (should have 5 points)
 * @param {string} color - Hex color for the line and points (e.g., '#3b82f6')
 * @param {string} title - Chart title label
 * @param {Array} timeLabels - Array of time labels (e.g., ['-40s', '-30s', '-20s', '-10s', 'now'])
 */

import { typography, fontFamily } from '../../styles/typography';

function LineChart({ 
  data = [0, 25, 50, 75, 100], 
  color = '#3b82f6', 
  title = 'History',
  timeLabels = ['-40s', '-30s', '-20s', '-10s', 'now']
}) {
  // Calculate SVG polyline points from data
  // Data is normalized to 0-100 scale and plotted within 0 0 300 100 viewBox
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 300;
      const y = 100 - (value / 100) * 80; // Reverse Y axis (SVG origin top-left)
      return `${x},${y}`;
    })
    .join(' ');

  // Generate grid lines (horizontal reference lines at 0%, 25%, 50%, 75%, 100%)
  const gridLines = [0, 20, 40, 60, 80, 100].map(percent => {
    const y = 100 - (percent / 100) * 80;
    return (
      <line
        key={`grid-${percent}`}
        x1="0"
        y1={y}
        x2="300"
        y2={y}
        stroke="#e5e7eb"
        strokeWidth="1"
        strokeDasharray="2,2"
      />
    );
  });

  return (
    <div style={{ width: '100%', marginTop: 'clamp(8px, 1vw, 12px)' }}>
      <p
        className="font-bold text-[#101828] mb-[8px] sm:mb-[9px] md:mb-[10px]"
        style={{
          fontSize: 'clamp(12px, 1.3vw, 13px)',
          fontFamily,
        }}
      >
        {title}
      </p>

      <svg
        viewBox="0 0 300 100"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          backgroundColor: '#f9fafb',
          borderRadius: '4px',
        }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid references */}
        {gridLines}

        {/* Polyline for the data */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Data points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 300;
          const y = 100 - (value / 100) * 80;
          return (
            <circle
              key={`point-${index}`}
              cx={x}
              cy={y}
              r="2"
              fill={color}
            />
          );
        })}
      </svg>

      {/* Time labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'clamp(6px, 1vw, 8px)' }}>
        {timeLabels.map((label, index) => (
          <span
            key={`label-${index}`}
            style={{
              fontSize: 'clamp(10px, 1vw, 12px)',
              color: '#64748b',
              fontFamily,
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default LineChart;
