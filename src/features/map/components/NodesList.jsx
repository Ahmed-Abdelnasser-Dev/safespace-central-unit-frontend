import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function NodesList() {
  const connectedNodes = Array(4).fill(null).map((_, i) => ({
    id: `unit-9-${i}`,
    name: 'Unit 9',
    distance: '10 km from C1 section',
    online: true,
  }));

  const disconnectedNodes = Array(4).fill(null).map((_, i) => ({
    id: `unit-9-offline-${i}`,
    name: 'Unit 9',
    distance: '10 km from C1 section',
    online: false,
  }));

  return (
    <aside className="w-[280px] bg-white border-l border-safe-border flex flex-col overflow-hidden">
      {/* Connected Nodes Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-safe-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-safe-green/10 flex items-center justify-center">
                <FontAwesomeIcon icon="chart-line" className="text-safe-green text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-safe-text-dark">Connected Nodes</h3>
                <p className="text-[11px] text-safe-text-gray">Active monitoring</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-safe-green rounded-full text-white text-xs font-semibold">
              6
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {connectedNodes.map((node) => (
            <div key={node.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-safe-bg transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-safe-green/10 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon="map-pin" className="text-safe-green text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-safe-text-dark">{node.name}</h4>
                  <span className="w-2 h-2 rounded-full bg-safe-green flex-shrink-0"></span>
                </div>
                <p className="text-[11px] text-safe-text-gray mt-0.5 flex items-center gap-1">
                  <FontAwesomeIcon icon="location-crosshairs" className="text-[10px]" />
                  {node.distance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disconnected Nodes Section */}
      <div className="flex-1 flex flex-col overflow-hidden border-t border-safe-border">
        <div className="px-5 py-4 border-b border-safe-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-safe-danger/10 flex items-center justify-center">
                <FontAwesomeIcon icon="exclamation-triangle" className="text-safe-danger text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-safe-text-dark">Disconnected Nodes</h3>
                <p className="text-[11px] text-safe-text-gray">Requires attention</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-safe-danger rounded-full text-white text-xs font-semibold">
              6
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {disconnectedNodes.map((node) => (
            <div key={node.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-safe-bg transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-safe-danger/10 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon="map-pin" className="text-safe-danger text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-safe-text-dark">{node.name}</h4>
                  <span className="w-2 h-2 rounded-full bg-safe-danger flex-shrink-0"></span>
                </div>
                <p className="text-[11px] text-safe-text-gray mt-0.5 flex items-center gap-1">
                  <FontAwesomeIcon icon="location-crosshairs" className="text-[10px]" />
                  {node.distance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default NodesList;
