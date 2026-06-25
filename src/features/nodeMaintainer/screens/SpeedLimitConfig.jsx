import SectionHeader from '../components/layout/SectionHeader';
import { fontFamily } from '../styles/typography';

export default function SpeedLimitConfig({ speedLimit, onChange }) {
  return (
    <div className="space-y-[8px] sm:space-y-[10px] md:space-y-[12px]">
      <SectionHeader title="Speed Limit Configuration" showDivider={true} />
      <div className="p-[10px] sm:p-[12px] md:p-[14px] bg-safe-gray rounded-[6px] sm:rounded-[7px] md:rounded-[8px] border border-safe-gray-light">
        <div className="flex items-center justify-between mb-[10px] sm:mb-[12px] md:mb-[14px]">
          <span
            className="font-medium text-safe-text-primary"
            style={{ fontSize: 'clamp(12px, 1.2vw, 13px)', fontFamily }}
          >
            Speed Limit (km/h)
          </span>
          <span
            className="font-bold text-safe-blue"
            style={{ fontSize: 'clamp(16px, 2vw, 20px)', fontFamily }}
          >
            {speedLimit} km/h
          </span>
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
        <div
          className="flex justify-between text-safe-text-muted mt-[8px] sm:mt-[10px]"
          style={{ fontSize: 'clamp(11px, 1vw, 12px)', fontFamily }}
        >
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
