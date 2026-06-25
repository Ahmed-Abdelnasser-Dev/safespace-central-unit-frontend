import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchInput from '@/components/ui/SearchInput';

/**
 * Map page action bar — search + refresh + notification panel toggle.
 * Title lives in AppTopBar; this bar provides map-specific actions.
 * Phase 3: migrate to PageActions and delete this component.
 */
function MapHeader({
  unreadCount = 0,
  notifOpen = false,
  onToggleNotif,
  onRefresh,
  isLoading = false,
}) {
  return (
    <div className="bg-safe-sidebar border-b border-safe-border px-6 py-3 flex items-center justify-end gap-3 flex-shrink-0">
      <SearchInput
        placeholder="Search locations, units, incidents..."
        width="320px"
      />

      <button
        onClick={onRefresh}
        disabled={isLoading}
        title="Refresh"
        className="w-9 h-9 rounded-lg border border-safe-border flex items-center justify-center text-safe-text-muted hover:bg-safe-gray transition-colors disabled:opacity-50"
      >
        <FontAwesomeIcon
          icon="rotate"
          className={`text-sm ${isLoading ? 'animate-spin' : ''}`}
        />
      </button>

      {/* Controls the map's NotificationPanel — separate from AppTopBar bell */}
      <button
        onClick={onToggleNotif}
        title="Map Alerts"
        aria-pressed={notifOpen}
        className={`relative w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
          notifOpen
            ? 'border-safe-blue bg-safe-blue/10 text-safe-blue'
            : 'border-safe-border text-safe-text-muted hover:bg-safe-gray'
        }`}
      >
        <FontAwesomeIcon icon="map-pin" className="text-sm" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-safe-danger rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

export default MapHeader;
