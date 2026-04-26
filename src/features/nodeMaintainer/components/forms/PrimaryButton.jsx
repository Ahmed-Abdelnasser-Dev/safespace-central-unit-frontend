/**
 * Reusable Primary Button Component
 * 
 * Styled action button with loading and disabled states
 * Used for primary actions (Save, Submit, etc.)
 * 
 * @component
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { typography, fontFamily } from '../../styles/typography';

function PrimaryButton({ 
  onClick,
  disabled = false,
  icon = null,
  text,
  fullWidth = true,
  className = '' 
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-[12px] sm:px-[14px] md:px-[16px] py-[10px] sm:py-[11px] md:py-[12px] rounded-[6px] sm:rounded-[7px] md:rounded-[8px] font-bold transition-all duration-200 flex items-center justify-center gap-[6px] sm:gap-[8px] ${
        disabled
          ? 'bg-[#e5e7eb] text-[#99a1af] cursor-not-allowed'
          : 'bg-[#247cff] text-white hover:bg-[#1a5dcc] shadow-sm'
      } ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{ fontSize: 'clamp(13px, 1.3vw, 16px)', fontFamily }}
    >
      {icon && <FontAwesomeIcon icon={icon} style={{ width: 'clamp(14px, 1.5vw, 16px)', height: 'clamp(14px, 1.5vw, 16px)' }} />}
      {text}
    </button>
  );
}

export default PrimaryButton;
