/**
 * Tabs — accessible horizontal tab bar
 *
 * Props:
 *   tabs: Array<{ id: string, label: string, icon?: string }>
 *   activeTab: string — id of the active tab
 *   onChange: (id: string) => void
 *   className: string — extra classes on the container
 *   size: 'sm' | 'md' (default 'md')
 */
import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Tabs({ tabs = [], activeTab, onChange, className = '', size = 'md' }) {
  const listRef = useRef(null);

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (index + 1) % tabs.length;
      onChange(tabs[next].id);
      listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (index - 1 + tabs.length) % tabs.length;
      onChange(tabs[prev].id);
      listRef.current?.querySelectorAll('[role="tab"]')[prev]?.focus();
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      className={`flex items-center gap-1 ${className}`}
      aria-label="Tabs"
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={[
              'inline-flex items-center rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-safe-blue',
              sizeClasses[size],
              isActive
                ? 'bg-safe-blue-btn text-white'
                : 'text-safe-text-muted hover:bg-safe-gray hover:text-safe-text-primary',
            ].join(' ')}
          >
            {tab.icon && <FontAwesomeIcon icon={tab.icon} className="text-xs" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
