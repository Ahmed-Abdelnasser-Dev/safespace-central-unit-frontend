function ChartWrapper({ title }) {
  return (
    <div className="h-48 w-full bg-gradient-to-br from-safe-gray to-safe-gray-light rounded-xl border border-safe-gray-light flex items-center justify-center text-safe-text-muted text-xs">
      {title || 'Chart Placeholder'}
    </div>
  );
}

export default ChartWrapper;
