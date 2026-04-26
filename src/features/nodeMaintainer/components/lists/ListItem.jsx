/**
 * Reusable List Item Component
 * 
 * Displays item with meta info and action buttons
 * Used for polygon lists, lane lists, etc.
 * 
 * @component
 */

import { typography, fontFamily } from '../../styles/typography';

function ListItem({ 
  title, 
  subtitle = null,
  actions = [],
  leadingIcon = null,
  leadingColor = "#247cff",
  leadingBg = "#e3f2fd",
  className = '' 
}) {
  return (
    <div className={`p-[10px] sm:p-[11px] md:p-[12px] border border-[#e5e7eb] rounded-[6px] sm:rounded-[7px] md:rounded-[8px] hover:bg-[#f7f8f9] transition-colors ${className}`}>
      <div className="flex items-center justify-between gap-[6px] sm:gap-[8px]">
        <div className="flex items-center gap-[8px] sm:gap-[10px] md:gap-[12px] min-w-0">
          {leadingIcon && (
            <div
              className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] md:w-[28px] md:h-[28px] rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: leadingBg, color: leadingColor }}
            >
              {leadingIcon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[#101828] truncate" style={{ fontSize: 'clamp(12px, 1.3vw, 16px)', fontFamily }}>
              {title}
            </p>
            {subtitle && (
              <p className="text-[#6a7282] truncate" style={{ fontSize: 'clamp(11px, 1vw, 12px)', fontFamily }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions.length > 0 && (
          <div className="flex gap-[4px] sm:gap-[5px] md:gap-[6px] flex-shrink-0 flex-wrap justify-end">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`px-[8px] sm:px-[9px] md:px-[10px] py-[4px] sm:py-[5px] md:py-[6px] font-medium rounded-[4px] sm:rounded-[5px] transition-colors whitespace-nowrap ${
                  action.variant === 'danger'
                    ? 'text-[#d63e4d] hover:bg-[#fee2e2]'
                    : action.variant === 'primary'
                      ? 'text-white bg-[#247cff] hover:bg-[#1a5dcc]'
                      : 'text-[#247cff] hover:bg-[#e3f2fd]'
                }`}
                style={{ fontSize: 'clamp(10px, 1vw, 12px)', fontFamily }}
              >
                {action.icon && (
                  <>{action.icon} </>
                )}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListItem;
