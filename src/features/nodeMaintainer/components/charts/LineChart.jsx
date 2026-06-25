function LineChart({
  data = [0, 25, 50, 75, 100],
  color = '#3b82f6',
  title = 'History',
  timeLabels = ['-40s', '-30s', '-20s', '-10s', 'now'],
}) {
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 300;
      const y = 100 - (value / 100) * 80;
      return `${x},${y}`;
    })
    .join(' ');

  const gridLines = [0, 20, 40, 60, 80, 100].map((percent) => {
    const y = 100 - (percent / 100) * 80;
    return (
      <line
        key={`grid-${percent}`}
        x1="0"
        y1={y}
        x2="300"
        y2={y}
        stroke="rgb(var(--color-safe-gray-light))"
        strokeWidth="1"
        strokeDasharray="2,2"
      />
    );
  });

  return (
    <div className="w-full mt-2">
      <p className="text-xs font-bold text-safe-text-primary mb-2">{title}</p>

      <svg
        viewBox="0 0 300 100"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          backgroundColor: 'rgb(var(--color-safe-gray))',
          borderRadius: '4px',
        }}
        preserveAspectRatio="xMidYMid meet"
      >
        {gridLines}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 300;
          const y = 100 - (value / 100) * 80;
          return <circle key={`point-${index}`} cx={x} cy={y} r="2" fill={color} />;
        })}
      </svg>

      <div className="flex justify-between mt-1.5">
        {timeLabels.map((label, index) => (
          <span key={`label-${index}`} className="text-[10px] text-safe-text-muted">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default LineChart;
