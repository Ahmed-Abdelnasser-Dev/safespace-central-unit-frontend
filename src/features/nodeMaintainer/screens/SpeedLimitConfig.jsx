import SectionHeader from '../components/layout/SectionHeader';

export default function SpeedLimitConfig({ speedLimit, onChange }) {
  return (
    <div className="space-y-2">
      <SectionHeader title="Speed Limit Configuration" showDivider={true} />
      <div className="p-3.5 bg-safe-gray rounded-lg border border-safe-gray-light">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-safe-text-primary">Speed Limit (km/h)</span>
          <span className="text-lg font-bold text-safe-blue">{speedLimit} km/h</span>
        </div>
        <input
          type="range"
          min="30"
          max="180"
          step="5"
          value={speedLimit}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-safe-gray-light rounded-lg appearance-none cursor-pointer accent-safe-blue-btn"
        />
        <div className="flex justify-between text-safe-text-muted mt-2 text-[10px]">
          <span>30</span>
          <span>60</span>
          <span>90</span>
          <span>120</span>
          <span>150</span>
          <span>180</span>
        </div>
      </div>
    </div>
  );
}
