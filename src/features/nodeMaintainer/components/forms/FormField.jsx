/**
 * Reusable Form Field Component
 * 
 * Wrapper for label + input or slider
 * Displays field label and value for number fields
 * 
 * @component
 */

import { typography, fontFamily } from '../../styles/typography';

function FormField({ 
  label,
  value,
  onChange,
  type = 'text',
  min = null,
  max = null,
  className = '' 
}) {
  return (
    <div className={className}>
      <label className="text-[#101828] mb-[8px] block font-medium" style={{ ...typography.label, fontFamily }}>
        {label}
      </label>
      {type === 'number' ? (
        <div className="flex items-center gap-[12px]">
          <input
            type="range"
            min={min || 0}
            max={max || 100}
            value={value || 0}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#247cff]"
          />
          <span className="font-bold text-[#247cff] whitespace-nowrap" style={{ ...typography.body, fontFamily }}>
            {value}
          </span>
        </div>
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-[12px] py-[10px] border border-[#e5e7eb] rounded-[6px] text-[#101828] bg-white focus:outline-none focus:ring-2 focus:ring-[#247cff] focus:ring-opacity-20 transition-all duration-200"
          style={{ ...typography.body, fontFamily }}
        />
      )}
    </div>
  );
}

export default FormField;
