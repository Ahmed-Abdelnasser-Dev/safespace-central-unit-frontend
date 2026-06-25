function InfoRow({ label, value, valueStyle = {}, className = '' }) {
  return (
    <div className={`flex justify-between items-center gap-2 pb-2 ${className}`}>
      <span className="text-xs text-safe-text-muted font-normal">{label}</span>
      <span className="text-sm font-bold text-safe-text-primary text-right" style={valueStyle}>
        {value}
      </span>
    </div>
  );
}

export default InfoRow;
