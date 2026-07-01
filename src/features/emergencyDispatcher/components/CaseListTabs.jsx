/**
 * SOS Cases / Incidents tab switcher for the Dispatch Console.
 *
 * Uses the same pill-style button tabs as the admin page (solid blue fill for active,
 * transparent for inactive) so the dispatcher feels native to the system vocabulary.
 * Unread counts only render when non-zero.
 */
function CaseListTabs({ activeTab, onChange, unreadCounts }) {
  const tabs = [
    { key: 'sos', label: 'SOS Cases', unread: unreadCounts.sos },
    { key: 'incident', label: 'Incidents', unread: unreadCounts.incident },
  ];

  return (
    <div className="flex items-center gap-2 py-2.5 px-1" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
              isActive
                ? 'bg-safe-blue text-white shadow-sm'
                : 'text-safe-text-gray hover:text-safe-text-primary hover:bg-safe-gray-light/30'
            }`}
          >
            {tab.label}
            {tab.unread > 0 && (
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                isActive ? 'bg-white/25 text-white' : 'bg-safe-danger text-white'
              }`}>
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
