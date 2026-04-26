/**
 * Reusable Section Header Component
 * 
 * Displays a section title with optional divider
 * Used consistently across all tabs
 * 
 * @component
 */

import { typography, fontFamily } from '../../styles/typography';

function SectionHeader({ 
  title, 
  showDivider = true,
  className = '' 
}) {
  return (
    <div className={`${showDivider ? 'mt-[12px] sm:mt-[14px] md:mt-[16px] lg:mt-[20px] pt-[12px] sm:pt-[14px] md:pt-[16px] lg:pt-[20px] border-t border-[#e5e7eb]' : 'mt-[12px] sm:mt-[14px] md:mt-[16px] lg:mt-[20px]'} ${className}`}>
      <h3
        className="font-bold text-[#101828]"
        style={{
          fontSize: 'clamp(14px, 1.6vw, 18px)',
          fontFamily,
        }}
      >
        {title}
      </h3>
    </div>
  );
}

export default SectionHeader;
