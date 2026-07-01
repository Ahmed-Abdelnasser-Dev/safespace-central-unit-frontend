export function formatNumber(value) {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'number') return String(value);
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export default formatNumber;
