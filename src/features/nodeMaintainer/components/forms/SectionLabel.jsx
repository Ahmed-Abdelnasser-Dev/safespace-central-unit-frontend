/**
 * Reusable Section Label Component
 * 
 * Displays uppercase section title with optional icon
 * Used across configuration tabs
 * 
 * @component
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { typography, fontFamily } from '../../styles/typography';

function SectionLabel({ 
  text, 
  icon = null,
  className = '' 
}) {
  return (
    <div className={`flex items-center gap-[6px] sm:gap-[7px] md:gap-[8px] ${className}`}>
      {icon && (
        <FontAwesomeIcon 
          icon={icon} 
          className="text-[#247cff]" 
          style={{ width: 'clamp(12px, 1.5vw, 16px)', height: 'clamp(12px, 1.5vw, 16px)' }} 
        />
      )}
      <label 
        className="font-medium text-[#101828] uppercase tracking-wider" 
        style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', fontFamily }}
      >
        {text}
      </label>
    </div>
  );
}

export default SectionLabel;
