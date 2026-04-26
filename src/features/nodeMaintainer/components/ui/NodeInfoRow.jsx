/**
 * Reusable Info Row Component
 * 
 * Displays a key-value pair in a horizontally aligned row
 * Used for displaying Node Information, Status, etc.
 * 
 * @component
 */

import { typography, fontFamily } from '../../styles/typography';

function NodeInfoRow({ 
  label, 
  value, 
  valueStyle = {},
  className = '' 
}) {
  return (
    <div 
      className={`flex justify-between items-center gap-2 pb-2 ${className}`}
    >
      <span
        className="text-safe-text-gray font-normal"
        style={{
          fontSize: 'clamp(12px, 1.2vw, 13px)',
          fontFamily,
        }}
      >
        {label}
      </span>
      <span
        className="font-bold text-gray-900 text-right"
        style={{
          fontSize: 'clamp(13px, 1.3vw, 16px)',
          fontFamily,
          ...valueStyle
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default NodeInfoRow;
