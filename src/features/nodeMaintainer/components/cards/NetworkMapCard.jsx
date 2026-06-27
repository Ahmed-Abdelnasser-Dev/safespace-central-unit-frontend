/**
 * Network Map Card
 * Interactive map: Egypt-centered, custom controls, status-driven markers.
 */

import { useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectNode, selectAllNodes, selectSelectedNodeId } from '../../nodesSlice';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FullScreenMapDialog from '../FullScreenMapDialog';
import MapHoverCard from '../map/MapHoverCard.jsx';
import MapNodeMarker from '../map/MapNodeMarker.jsx';
import useMapAutoCenter from '../map/useMapAutoCenter.js';
import useMapHoverPosition from '../map/useMapHoverPosition.js';
import { useMapStyle } from '@/hooks/useMapStyle.js';
import useGeolocation from '@/hooks/useGeolocation.js';

// Egypt default (Ismailia/Suez area — matches the road observer map)
const EGYPT_CENTER = { longitude: 32.5498, latitude: 30.0131, zoom: 12 };

export default function NetworkMapCard() {
  const dispatch = useDispatch();
  const nodes = useSelector(selectAllNodes);
  const selectedNodeId = useSelector(selectSelectedNodeId);
  const mapRef = useRef(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const mapStyle = useMapStyle();
  const hoveredNode = nodes.find((node) => node.id === hoveredNodeId);
  const hoverPosition = useMapHoverPosition(mapRef, hoveredNode);
  const { latitude: userLat, longitude: userLng } = useGeolocation();

  // Status counts for legend
  const counts = nodes.reduce(
    (acc, node) => {
      if (node.status === 'online') acc.online++;
      else if (node.status === 'offline') acc.offline++;
      else acc.warning++;
      return acc;
    },
    { online: 0, warning: 0, offline: 0 }
  );

  const handleMarkerClick = (nodeId) => {
    dispatch(selectNode(nodeId));
  };

  // Fit map to show all nodes
  const handleFitBounds = useCallback(() => {
    if (!mapRef.current || nodes.length === 0) return;
    const lngs = nodes.map((n) => n.location?.longitude).filter(Boolean);
    const lats = nodes.map((n) => n.location?.latitude).filter(Boolean);
    if (!lngs.length) return;
    mapRef.current.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 60, maxZoom: 16, duration: 800 }
    );
  }, [nodes]);

  // Fly to user location
  const handleLocateMe = useCallback(() => {
    if (!mapRef.current || userLat == null || userLng == null) return;
    mapRef.current.flyTo({ center: [userLng, userLat], zoom: 15, duration: 800 });
  }, [userLat, userLng]);

  useMapAutoCenter(mapRef, nodes, selectedNodeId);

  return (
    <Card className="border-safe-gray-light rounded-[8px] sm:rounded-[10px] lg:rounded-[13.684px] overflow-hidden flex flex-col flex-1 w-full h-full bg-safe-sidebar">
      {/* Header: title + legend + fullscreen */}
      <div className="border-b border-safe-gray-light flex items-center justify-between px-3 md:px-4 h-10 md:h-11 bg-safe-sidebar flex-shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-bold text-safe-text-primary">Network Map</h3>
          {/* Compact KPI counts */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-safe-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-safe-success inline-block" />
              {counts.online}
            </span>
            {counts.warning > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-safe-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-safe-orange inline-block" />
                {counts.warning}
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-safe-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-safe-danger inline-block" />
              {counts.offline}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFullScreenOpen(true)}
          className="!px-1.5 !py-1.5 text-safe-text-muted hover:bg-safe-gray"
          title="Full Screen"
        >
          <FontAwesomeIcon icon="expand" className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Map area */}
      <div className="p-2 md:p-3 flex-1 relative w-full min-h-0">
        <Map
          ref={mapRef}
          mapLib={import('maplibre-gl')}
          initialViewState={EGYPT_CENTER}
          style={{ width: '100%', height: '100%', borderRadius: '6px', display: 'block' }}
          mapStyle={mapStyle}
        >
          {/* Node markers */}
          {nodes.map((node) => (
            <MapNodeMarker
              key={node.id}
              node={node}
              isSelected={node.id === selectedNodeId}
              onSelect={handleMarkerClick}
              onHoverStart={(nodeId) => setHoveredNodeId(nodeId)}
              onHoverEnd={() => setHoveredNodeId(null)}
            />
          ))}

          {/* User location dot */}
          {userLat != null && userLng != null && (
            <Marker longitude={userLng} latitude={userLat} anchor="center">
              <div className="relative">
                <div className="absolute w-5 h-5 rounded-full bg-safe-blue/30 animate-ping -top-2.5 -left-2.5" />
                <div className="w-3 h-3 rounded-full bg-safe-blue border-2 border-white shadow-md -top-1.5 -left-1.5 relative" />
              </div>
            </Marker>
          )}
        </Map>

        <MapHoverCard node={hoveredNode} position={hoverPosition} />

        {/* Custom map controls — bottom right */}
        <div className="absolute bottom-5 right-5 flex flex-col gap-1.5 z-20">
          {/* Zoom in */}
          <button
            onClick={() => mapRef.current?.zoomIn({ duration: 300 })}
            title="Zoom in"
            className="w-8 h-8 rounded-lg bg-safe-sidebar border border-safe-gray-light flex items-center justify-center text-safe-text-muted hover:bg-safe-gray hover:text-safe-text-primary transition-colors shadow-sm"
          >
            <FontAwesomeIcon icon="plus" className="text-xs" />
          </button>
          {/* Zoom out */}
          <button
            onClick={() => mapRef.current?.zoomOut({ duration: 300 })}
            title="Zoom out"
            className="w-8 h-8 rounded-lg bg-safe-sidebar border border-safe-gray-light flex items-center justify-center text-safe-text-muted hover:bg-safe-gray hover:text-safe-text-primary transition-colors shadow-sm"
          >
            <FontAwesomeIcon icon="minus" className="text-xs" />
          </button>
          {/* Fit all nodes */}
          {nodes.length > 0 && (
            <button
              onClick={handleFitBounds}
              title="Fit all nodes"
              className="w-8 h-8 rounded-lg bg-safe-sidebar border border-safe-gray-light flex items-center justify-center text-safe-text-muted hover:bg-safe-gray hover:text-safe-text-primary transition-colors shadow-sm"
            >
              <FontAwesomeIcon icon="arrows-up-down-left-right" className="text-xs" />
            </button>
          )}
          {/* Locate me */}
          <button
            onClick={handleLocateMe}
            title={userLat != null ? 'Locate me' : 'Location unavailable'}
            disabled={userLat == null}
            className="w-8 h-8 rounded-lg bg-safe-sidebar border border-safe-gray-light flex items-center justify-center text-safe-text-muted hover:bg-safe-gray hover:text-safe-text-primary transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon="location-crosshairs" className="text-xs" />
          </button>
        </div>

        {/* Full Screen Map Dialog */}
        {isFullScreenOpen && (
          <FullScreenMapDialog
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onClose={() => setIsFullScreenOpen(false)}
          />
        )}
      </div>
    </Card>
  );
}
