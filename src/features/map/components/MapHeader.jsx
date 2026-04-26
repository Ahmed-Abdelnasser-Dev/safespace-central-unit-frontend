import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function MapHeader() {
  return (
    <header className="bg-white border-b border-safe-border px-8 py-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-safe-text-dark">Map Overview</h1>
          <p className="text-xs text-safe-text-gray mt-1">Real-time monitoring dashboard</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <FontAwesomeIcon 
              icon="magnifying-glass" 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-safe-text-gray text-sm"
            />
            <input
              type="text"
              placeholder="Search locations, units, incidents..."
              className="pl-11 pr-4 py-2.5 w-[340px] rounded-lg border border-safe-border text-sm text-safe-text-dark placeholder:text-safe-text-gray focus:outline-none focus:ring-2 focus:ring-safe-blue-btn/20 focus:border-safe-blue-btn"
            />
          </div>

          {/* Refresh Button */}
          <button className="w-10 h-10 rounded-lg border border-safe-border flex items-center justify-center text-safe-text-gray hover:bg-safe-bg transition-colors">
            <FontAwesomeIcon icon="rotate" className="text-sm" />
          </button>

          {/* Notifications */}
          <button className="relative w-10 h-10 rounded-lg border border-safe-border flex items-center justify-center text-safe-text-gray hover:bg-safe-bg transition-colors">
            <FontAwesomeIcon icon="bell" className="text-sm" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-safe-danger rounded-full text-white text-[10px] font-semibold flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default MapHeader;
