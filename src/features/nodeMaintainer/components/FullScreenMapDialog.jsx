/**
 * Full Screen Map Dialog
 * Full-screen MapLibre map with node markers and controls.
 */

import { useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { selectNode } from '../nodesSlice';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import MapHoverCard from './map/MapHoverCard.jsx';
import MapNodeMarker from './map/MapNodeMarker.jsx';
import useMapAutoCenter from './map/useMapAutoCenter.js';
import useMapHoverPosition from './map/useMapHoverPosition.js';
import { useMapStyle } from '@/hooks/useMapStyle.js';
import useGeolocation from '@/hooks/useGeolocation.js';

export default function FullScreenMapDialog({ nodes, selectedNodeId, onClose }) {
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const mapStyle = useMapStyle();
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const hoveredNode = nodes.find((node) => node.id === hoveredNodeId);
  const hoverPosition = useMapHoverPosition(mapRef, hoveredNode);
  const { latitude: userLat, longitude: userLng } = useGeolocation();

  const handleMarkerClick = (nodeId) => {
    dispatch(selectNode(nodeId));
  };

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
      { padding: 80, maxZoom: 16, duration: 800 }
    );
  }, [nodes]);

  const handleLocateMe = useCallback(() => {
    if (!mapRef.current || userLat == null || userLng == null) return;
    mapRef.current.flyTo({ center: [userLng, userLat], zoom: 15, duration: 800 });
  }, [userLat, userLng]);

  useMapAutoCenter(mapRef, nodes, selectedNodeId);

  return (
    <Modal open onClose={onClose} size="full">
      <Card className="w-full h-full flex flex-col rounded-none shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-safe-sidebar border-b border-safe-gray-light px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-safe-text-primary">Network Map</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="!px-2 !py-2 text-safe-text-muted hover:bg-safe-gray"
            title="Close"
          >
            <FontAwesomeIcon icon="xmark" className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 relative w-full overflow-hidden">
          <Map
            ref={mapRef}
            mapLib={import('maplibre-gl')}
            initialViewState={{
              longitude: nodes[0]?.location.longitude || 32.5498,
              latitude: nodes[0]?.location.latitude || 30.0131,
              zoom: 11,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={mapStyle}
          >
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

          {/* Status legend — bottom left */}
          <div className="absolute bottom-6 left-6 bg-safe-sidebar/90 backdrop-blur-sm border border-safe-gray-light rounded-lg p-3 z-40">
            <p className="text-[10px] font-semibold text-safe-text-muted mb-2">STATUS</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-safe-success" />
                <span className="text-safe-text-muted text-xs">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-safe-orange" />
                <span className="text-safe-text-muted text-xs">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-safe-danger" />
                <span className="text-safe-text-muted text-xs">Offline</span>
              </div>
            </div>
          </div>

          {/* Controls — bottom right */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-1.5 z-40">
            <button
              onClick={() => mapRef.current?.zoomIn({ duration: 300 })}
              title="Zoom in"
              className="w-9 h-9 rounded-lg bg-safe-sidebar border border-safe-gray-light flex items-center justify-center text-safe-text-muted hover:bg-safe-gray transition-colors shadow-sm"
            >
              <FontAwesomeIcon icon="plus" />
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut({ duration: 300 })}
              title="Zoom out"
              className="w-9 h-9 rounded-lg bg-safe-sidebar border border-safe-gray-light flex items-center justify-center text-safe-text-muted hover:bg-safe-gray transition-colors shadow-sm"
            >
              <FontAwesomeIcon icon="minus" />
            </button>
            {nodes.length > 0 && (
              <button
                onClick={handleFitBounds}
                title="Fit all nodes"
                className="w-9 h-9 rounded-lg bg-safe-sidebar border border-safe-gray-light flex items-center justify-center text-safe-text-muted hover:bg-safe-gray transition-colors shadow-sm"
              >
                <FontAwesomeIcon icon="arrows-up-down-left-right" />
              </button>
            )}
            <button
              onClick={handleLocateMe}
              title="Locate me"
              disabled={userLat == null}
              className="w-9 h-9 rounded-lg bg-safe-sidebar border border-safe-gray-light flex items-center justify-center text-safe-text-muted hover:bg-safe-gray transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon="location-crosshairs" />
            </button>
            <div className="mt-1 bg-safe-gray border border-safe-gray-light rounded-lg px-3 py-1.5 text-[9px] text-safe-text-muted text-center">
              <kbd className="bg-safe-sidebar border border-safe-gray-light rounded px-1 font-mono text-[8px]">ESC</kbd>
              {' '}to close
            </div>
          </div>
        </div>
      </Card>
    </Modal>
  );
}
