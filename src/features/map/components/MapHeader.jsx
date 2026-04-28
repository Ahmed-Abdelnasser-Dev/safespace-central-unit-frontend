import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function MapHeader() {
  return (
    <header className="bg-gradient-to-r from-safe-white to-safe-bg border-b border-safe-border/40 px-8 py-6">
      <div className="flex items-start justify-between gap-6">
        <div className="animate-slideUp">
          <h1 className="font-display text-3xl font-bold text-safe-text-dark">Map Overview</h1>
          <p className="text-sm text-safe-text-gray/80 mt-2 font-light">Real-time monitoring dashboard with live incident tracking</p>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0 animate-slideUp stagger-1">
          {/* Search Bar */}
          <div className="relative">
            <FontAwesomeIcon 
              icon="magnifying-glass" 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-safe-text-gray/50 text-sm"
            />
            <input
              type="text"
              placeholder="Search locations, units, incidents..."
              className="pl-11 pr-4 py-2.5 w-[300px] rounded-lg border border-safe-border/60 hover:border-safe-border text-sm text-safe-text-dark placeholder:text-safe-text-gray/50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-safe-blue/20 focus:border-safe-blue transition-all duration-200"
            />
          </div>

          {/* Refresh Button */}
          <button type="button" className="w-10 h-10 rounded-lg border border-safe-border/60 hover:border-safe-border flex items-center justify-center text-safe-text-gray/60 hover:text-safe-text-dark hover:bg-safe-bg transition-all duration-200 group">
            <FontAwesomeIcon icon="rotate" className="text-sm group-hover:rotate-180 transition-transform duration-300" />
          </button>

          {/* Notifications */}
          <button type="button" className="relative w-10 h-10 rounded-lg border border-safe-border/60 hover:border-safe-border flex items-center justify-center text-safe-text-gray/60 hover:text-safe-text-dark hover:bg-safe-bg transition-all duration-200">
            <FontAwesomeIcon icon="bell" className="text-sm" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-safe-danger rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-pulse-glow">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default MapHeader;
