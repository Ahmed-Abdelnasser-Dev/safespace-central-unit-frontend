function PolygonOverlay({ accidentPolygon, nodePolygons = [], overlayRect }) {
  const toPoints = (polygon) => {
    if (!polygon?.points?.length) return '';
    const baseWidth = polygon?.baseWidth || 100;
    const baseHeight = polygon?.baseHeight || 100;
    return polygon.points
      .map(point => `${(point.x / baseWidth) * 100},${(point.y / baseHeight) * 100}`)
      .join(' ');
  };

  return (
    <svg
      className="absolute pointer-events-none z-10"
      style={{
        left: `${overlayRect.left}px`,
        top: `${overlayRect.top}px`,
        width: `${overlayRect.width}px`,
        height: `${overlayRect.height}px`
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {Array.isArray(nodePolygons) && nodePolygons.map((polygon, index) => (
        <polygon
          key={`lane-${index}`}
          points={toPoints(polygon)}
          fill="rgba(96, 165, 250, 0.08)"
          stroke="#60A5FA"
          strokeWidth="0.8"
        />
      ))}
      {accidentPolygon?.points?.length > 0 && (
        <polygon
          points={toPoints(accidentPolygon)}
          fill="rgba(239, 68, 68, 0.18)"
          stroke="#EF4444"
          strokeWidth="1.1"
        />
      )}
    </svg>
  );
}

export default PolygonOverlay;
