import { useRef, useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import useGeolocation from '@/hooks/useGeolocation';
import { useMapStyle } from '@/hooks/useMapStyle.js';
import { getLaneCfg } from './NodesList.jsx';

/** Coloured dot marker for a single node. */
function NodeMarker({ node, isActive, onClick, onMouseEnter, onMouseLeave }) {
  const isOnline = node.status === 'online';
  const color = isActive ? '#ff6b35' : isOnline ? '#22c55e' : '#ef4444';

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative focus:outline-none flex items-center justify-center"
      aria-label={`Node ${node.name}: ${isOnline ? 'online' : 'offline'}${isActive ? ', active incident' : ''}`}
      style={{ width: 36, height: 36, cursor: 'pointer' }}
    >
      {/* Pulse ring for active incident */}
      {isActive && (
        <span
          className="absolute rounded-full motion-safe:animate-ping"
          style={{ backgroundColor: color, opacity: 0.4, width: 32, height: 32 }}
        />
      )}
      {/* Outer glow ring */}
      <span
        className="absolute rounded-full"
        style={{ width: 26, height: 26, backgroundColor: color, opacity: 0.2 }}
      />
      {/* Main dot */}
      <span
        className="relative block rounded-full border-2 border-white shadow-lg"
        style={{ width: 18, height: 18, backgroundColor: color }}
      />
    </button>
  );
}

/**
 * Rich hover popover — shows node status, speed limit, lane visual tiles,
 * and a View Details button that opens the full NodeDetailDialog.
 */
function NodePopover({ node, onClose, onViewDetails }) {
  const isOnline = node.status === 'online';
  const lanes = node.lanes || node.roadRules?.lanes || [];
  const speedLimit = node.speedLimit ?? node.roadRules?.speedLimit ?? null;

  return (
    <div className="bg-safe-gray border border-safe-gray-light rounded-xl shadow-2xl overflow-hidden w-56">

      {/* Header — name + address + close */}
      <div className="flex items-start justify-between gap-2 px-3.5 pt-3 pb-2.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-safe-text-primary truncate leading-tight">{node.name}</p>
          <p className="text-[11px] text-safe-text-muted mt-0.5 truncate">
            {node.streetName || node.location?.address || 'Unknown location'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center text-safe-text-muted hover:text-safe-text-primary flex-shrink-0 mt-0.5 rounded transition-colors"
          aria-label="Close"
        >
          <FontAwesomeIcon icon="xmark" className="text-xs" />
        </button>
      </div>

      {/* Status + quick-stats bar */}
      <div className="flex items-center gap-2 px-3.5 pb-2.5 border-b border-safe-gray-light flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOnline ? 'bg-safe-green' : 'bg-safe-danger'}`} />
          <span className={`text-[11px] font-medium ${isOnline ? 'text-safe-green' : 'text-safe-danger'}`}>
            {isOnline ? 'Active' : 'Inactive'}
          </span>
        </div>
        {speedLimit != null && (
          <>
            <span className="text-safe-gray-light text-[10px]">·</span>
            <span className="text-[11px] text-safe-text-muted font-mono">{speedLimit} km/h</span>
          </>
        )}
        {lanes.length > 0 && (
          <>
            <span className="text-safe-gray-light text-[10px]">·</span>
            <span className="text-[11px] text-safe-text-muted">{lanes.length} lanes</span>
          </>
        )}
      </div>

      {/* Lane visual mini-tiles */}
      {lanes.length > 0 && (
        <div className="flex gap-1.5 px-3.5 py-2.5 border-b border-safe-gray-light">
          {lanes.map((lane, i) => {
            const cfg = getLaneCfg(lane);
            return (
              <div
                key={lane.id ?? i}
                className={`flex-1 min-w-0 flex flex-col items-center gap-1 py-2 rounded-lg border ${cfg.bg} ${cfg.border}`}
              >
                <FontAwesomeIcon icon={cfg.icon} className={`text-sm ${cfg.color}`} />
                <p className="text-[8px] text-safe-text-muted font-medium">L{lane.id ?? i + 1}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details action */}
      <div className="px-3.5 py-2.5">
        <button
          type="button"
          onClick={onViewDetails}
          className="w-full py-1.5 text-xs font-semibold bg-safe-blue/10 hover:bg-safe-blue/20 border border-safe-blue/20 rounded-lg transition-all flex items-center justify-center gap-1.5 text-safe-blue"
        >
          <FontAwesomeIcon icon="circle-info" className="text-[10px]" />
          View Details
        </button>
      </div>
    </div>
  );
}

/**
 * MapView — dark MapLibre map with node markers and hover popovers.
 *
 * @param {object}   props
 * @param {Array}    props.nodes                — node objects from Redux
 * @param {string}   props.filter               — 'all' | 'online' | 'offline' | 'active'
 * @param {string[]} props.activeIncidentNodeIds — node IDs with active incidents
 * @param {string}   props.focusedNodeId        — triggers flyTo when changes
 * @param {Function} props.onViewNodeDetails    — callback(node) → opens NodeDetailDialog
 */
function MapView({ nodes = [], filter = 'all', activeIncidentNodeIds = [], focusedNodeId = null, onViewNodeDetails }) {
  const mapRef = useRef();
  const location = useGeolocation();
  const mapStyle = useMapStyle();
  const [viewState, setViewState] = useState({
    longitude: 32.5498,
    latitude: 30.0131,
    zoom: 12,
  });
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const hoverTimerRef = useRef(null);

  const clearCloseTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const startCloseTimer = useCallback(() => {
    clearCloseTimer();
    hoverTimerRef.current = setTimeout(() => setHoveredNode(null), 300);
  }, [clearCloseTimer]);

  // Cleanup timer on unmount
  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  // Center on user's geolocation on first fix
  useEffect(() => {
    if (location.latitude && location.longitude && !hasInitialized) {
      setViewState({ longitude: location.longitude, latitude: location.latitude, zoom: 15 });
      setHasInitialized(true);
    }
  }, [location.latitude, location.longitude, hasInitialized]);

  // FlyTo when a node is selected from the rail
  useEffect(() => {
    if (!focusedNodeId) return;
    const node = nodes.find((n) => n.id === focusedNodeId);
    if (node && node.latitude && node.longitude && mapRef.current) {
      mapRef.current.flyTo({ center: [node.longitude, node.latitude], zoom: 17, duration: 1200 });
    }
  }, [focusedNodeId, nodes]);

  const handleLocateMe = useCallback(() => {
    if (location.latitude && location.longitude && mapRef.current) {
      mapRef.current.flyTo({ center: [location.longitude, location.latitude], zoom: 17, duration: 1500 });
    }
  }, [location.latitude, location.longitude]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  const visibleNodes = nodes.filter((node) => {
    if (filter === 'online') return node.status === 'online';
    if (filter === 'offline') return node.status !== 'online';
    if (filter === 'active') return activeIncidentNodeIds.includes(node.id);
    return true;
  });

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapLib={import('maplibre-gl')}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        onClick={() => { clearCloseTimer(); setHoveredNode(null); }}
      >
        {/* User geolocation marker */}
        {location.latitude && location.longitude && (
          <Marker longitude={location.longitude} latitude={location.latitude} anchor="center">
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 rounded-full bg-safe-blue-btn/30 motion-safe:animate-ping" />
              <div className="relative w-full h-full rounded-full bg-safe-blue-btn border-[3px] border-white shadow-lg" />
            </div>
          </Marker>
        )}

        {/* Node markers with hover popovers */}
        {visibleNodes.map((node) => {
          if (!node.latitude || !node.longitude) return null;
          const isActive = activeIncidentNodeIds.includes(node.id);
          const isOpen = hoveredNode?.id === node.id;

          return (
            <Marker
              key={node.id}
              longitude={node.longitude}
              latitude={node.latitude}
              anchor="center"
            >
              <div className="relative">
                <NodeMarker
                  node={node}
                  isActive={isActive}
                  onMouseEnter={() => { clearCloseTimer(); setHoveredNode(node); }}
                  onMouseLeave={startCloseTimer}
                  onClick={(e) => {
                    e.stopPropagation();
                    setHoveredNode((prev) => (prev?.id === node.id ? null : node));
                  }}
                />
                {isOpen && (
                  <div
                    className="absolute bottom-7 left-1/2 -translate-x-1/2 z-[100]"
                    onMouseEnter={clearCloseTimer}
                    onMouseLeave={startCloseTimer}
                  >
                    <NodePopover
                      node={node}
                      onClose={() => { clearCloseTimer(); setHoveredNode(null); }}
                      onViewDetails={() => {
                        clearCloseTimer();
                        setHoveredNode(null);
                        onViewNodeDetails?.(node);
                      }}
                    />
                  </div>
                )}
              </div>
            </Marker>
          );
        })}

        <NavigationControl position="bottom-right" style={{ display: 'none' }} />
        <GeolocateControl position="bottom-right" style={{ display: 'none' }} />
      </Map>

      {/* Location error */}
      {location.error && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-safe-danger text-safe-text-primary px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <FontAwesomeIcon icon="exclamation-triangle" />
          {location.error}
        </div>
      )}

      {/* Locating indicator */}
      {location.loading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-safe-gray border border-safe-gray-light px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 text-safe-text-primary">
          <div className="w-4 h-4 border-2 border-safe-blue border-t-transparent rounded-full animate-spin" />
          Getting location…
        </div>
      )}

      {/* Location accuracy pill */}
      {location.accuracy && !location.loading && !location.error && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-safe-gray/90 border border-safe-gray-light backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm text-xs flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${location.accuracy < 20 ? 'bg-safe-green' : location.accuracy < 50 ? 'bg-safe-accent' : 'bg-safe-orange'}`} />
          <span className="text-safe-text-muted">±{Math.round(location.accuracy)} m</span>
        </div>
      )}

      {/* Custom controls — bottom right */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <div className="bg-safe-gray border border-safe-gray-light rounded-lg overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 flex items-center justify-center text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray-light/50 border-b border-safe-gray-light transition-colors"
            aria-label="Zoom in"
          >
            <FontAwesomeIcon icon="plus" className="text-sm" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 flex items-center justify-center text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray-light/50 transition-colors"
            aria-label="Zoom out"
          >
            <FontAwesomeIcon icon="minus" className="text-sm" />
          </button>
        </div>
        <button
          onClick={handleLocateMe}
          className="w-9 h-9 bg-safe-gray border border-safe-gray-light rounded-lg flex items-center justify-center text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray-light/50 transition-colors"
          aria-label="Center on my location"
        >
          <FontAwesomeIcon icon="location-crosshairs" className="text-sm" />
        </button>
      </div>
    </div>
  );
}

export default MapView;
