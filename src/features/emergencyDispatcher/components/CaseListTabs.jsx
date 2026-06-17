/**
 * SOS Cases / Incidents tab switcher for CaseListPage.
 *
 * Active tab uses a full bottom border + bold text, not a colored side
 * stripe (DESIGN.md ban). Unread counts only render when non-zero.
 */
function CaseListTabs({ activeTab, onChange, unreadCounts }) {
  const tabs = [
    { key: 'sos', label: 'SOS Cases', unread: unreadCounts.sos },
    { key: 'incident', label: 'Incidents', unread: unreadCounts.incident },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-safe-gray-light" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 border-b-2 -mb-px ${
              isActive
                ? 'border-safe-blue text-white'
                : 'border-transparent text-safe-text-gray hover:text-white'
            }`}
          >
            {tab.label}
            {tab.unread > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-safe-danger text-white text-xs font-bold">
                {tab.unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default CaseListTabs;
