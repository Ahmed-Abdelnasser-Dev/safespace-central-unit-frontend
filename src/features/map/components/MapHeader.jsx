import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function MapHeader({
  unreadCount = 0,
  notifOpen = false,
  onToggleNotif,
  onRefresh,
  isLoading = false,
}) {
  return (
    <header className="bg-safe-sidebar border-b border-safe-border px-8 py-5 flex-shrink-0">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-safe-text-primary">Map Overview</h1>
          <p className="text-xs text-safe-text-muted mt-1">Real-time monitoring dashboard</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <FontAwesomeIcon
              icon="magnifying-glass"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-safe-text-muted text-sm"
            />
            <input
              type="text"
              placeholder="Search locations, units, incidents..."
              className="pl-11 pr-4 py-2.5 w-[340px] rounded-lg border border-safe-border bg-safe-dark text-sm text-safe-text-primary placeholder:text-safe-text-muted focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/20 focus:border-safe-blue-btn"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh"
            className="w-10 h-10 rounded-lg border border-safe-border flex items-center justify-center text-safe-text-muted hover:bg-safe-gray transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon
              icon="rotate"
              className={`text-sm ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>

          {/* Notification Bell */}
          <button
            onClick={onToggleNotif}
            title="Notifications"
            aria-pressed={notifOpen}
            className={`relative w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
              notifOpen
                ? 'border-safe-blue bg-safe-blue/10 text-safe-blue'
                : 'border-safe-border text-safe-text-muted hover:bg-safe-gray'
            }`}
          >
            <FontAwesomeIcon icon="bell" className="text-sm" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-safe-danger rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default MapHeader;
