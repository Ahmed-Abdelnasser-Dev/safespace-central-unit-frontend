import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * FilterChips — compact segmented filter control above the map.
 *
 * Replaces the old dead placeholder bar (Call Emergency / Traffic Lights / …)
 * with working filter chips that actually drive the map + node/camera rail.
 *
 * @param {string}              activeFilter    - 'all' | 'online' | 'offline' | 'active'
 * @param {Function}            onFilterChange  - callback(filter: string)
 * @param {{ all, online, offline, active }} counts - per-filter counts for badges
 */
const CHIPS = [
  { id: 'all',     label: 'All',        icon: 'layer-group' },
  { id: 'online',  label: 'Online',     icon: 'circle-check' },
  { id: 'offline', label: 'Offline',    icon: 'circle-xmark' },
  { id: 'active',  label: 'Active',     icon: 'triangle-exclamation' },
];

function FilterChips({ activeFilter = 'all', onFilterChange, counts = {} }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-safe-gray-light bg-safe-gray">
      <span className="text-[10px] font-semibold text-safe-text-muted uppercase tracking-wider mr-1">
        Filter
      </span>
      {CHIPS.map((chip) => {
        const isActive = activeFilter === chip.id;
        const count = counts[chip.id];
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onFilterChange?.(chip.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? 'bg-safe-blue text-white shadow-sm'
                : 'bg-safe-sidebar text-safe-text-muted border border-safe-gray-light hover:text-safe-text-primary hover:bg-safe-gray-light/40'
            }`}
          >
            <FontAwesomeIcon icon={chip.icon} className="text-[10px]" />
            {chip.label}
            {count != null && (
              <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                isActive ? 'bg-white/25 text-white' : 'bg-safe-gray-light text-safe-text-muted'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default FilterChips;
