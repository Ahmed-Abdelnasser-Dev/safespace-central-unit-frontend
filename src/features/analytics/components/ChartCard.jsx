/**
 * ChartCard — reusable wrapper for analytics chart panels.
 *
 * Props:
 *   title       {string}    – section heading
 *   subtitle    {string}    – optional description line
 *   info        {string}    – tooltip shown on ⓘ hover
 *   children    {ReactNode}
 *   className   {string}    – extra tailwind classes
 */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ChartCard({ title, subtitle, info, children, className = '' }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className={`bg-safe-sidebar rounded-xl p-5 border border-safe-border relative ${className}`}>
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-sm font-semibold text-safe-text-gray">{title}</h2>
        {info && (
          <div className="relative ml-2 flex-shrink-0">
            <button
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              onFocus={() => setShowInfo(true)}
              onBlur={() => setShowInfo(false)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-safe-text-muted hover:text-safe-blue-btn transition-colors focus:outline-none"
              aria-label="Chart information"
            >
              <FontAwesomeIcon icon="circle-info" className="text-xs" />
            </button>
            {showInfo && (
              <div className="absolute right-0 top-6 z-50 w-64 bg-safe-dark border border-safe-border rounded-xl p-3 shadow-xl text-xs text-safe-text-muted leading-relaxed pointer-events-none">
                {info}
              </div>
            )}
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-safe-text-muted mb-3">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-3" />}
      {children}
    </div>
  );
}