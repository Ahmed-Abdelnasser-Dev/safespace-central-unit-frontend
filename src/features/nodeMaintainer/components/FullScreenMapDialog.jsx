/**
 * Full Screen Map Dialog
 * 
 * Displays the map in a full-screen modal dialog with all node markers
 * 
 * @component
 */

import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { selectNode } from '../nodesSlice';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import MapHoverCard from './map/MapHoverCard.jsx';
import MapNodeMarker from './map/MapNodeMarker.jsx';
import useMapAutoCenter from './map/useMapAutoCenter.js';
import useMapHoverPosition from './map/useMapHoverPosition.js';

const MAP_STYLE = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxzoom: 20,
    },
  },
  layers: [{ id: 'carto-dark', type: 'raster', source: 'carto-dark', paint: { 'raster-opacity': 1 } }],
};

export default function FullScreenMapDialog({ nodes, selectedNodeId, onClose }) {
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const hoveredNode = nodes.find(node => node.id === hoveredNodeId);
  const hoverPosition = useMapHoverPosition(mapRef, hoveredNode);

  const handleMarkerClick = (nodeId) => {
    dispatch(selectNode(nodeId));
  };

  useMapAutoCenter(mapRef, nodes, selectedNodeId);

  return (
    <Modal open onClose={onClose} size="full">
      <Card className="w-full h-full flex flex-col rounded-none shadow-2xl overflow-hidden">
        <div className="bg-safe-sidebar border-b border-safe-gray-light px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-safe-text-primary">Network Map - Full Screen</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="!px-2 !py-2 text-safe-text-muted hover:bg-safe-gray"
            title="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 relative w-full overflow-hidden">
          <Map
            ref={mapRef}
            mapLib={import('maplibre-gl')}
            initialViewState={{
              longitude: nodes[0]?.location.longitude || -74.0060,
              latitude: nodes[0]?.location.latitude || 40.7128,
              zoom: 11
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAP_STYLE}
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
          </Map>
          <MapHoverCard node={hoveredNode} position={hoverPosition} />

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-safe-sidebar border border-safe-gray-light rounded-lg p-4 max-w-sm z-40">
            <h3 className="text-sm font-bold text-safe-text-primary mb-3">Status Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#4caf50]" />
                <span className="text-safe-text-muted text-xs">Online</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#ff9800]" />
                <span className="text-safe-text-muted text-xs">Warning</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#d63e4d]" />
                <span className="text-safe-text-muted text-xs">Offline</span>
              </div>
            </div>
          </div>

          {/* Keyboard Hint */}
          <div className="absolute bottom-6 right-6 bg-safe-gray border border-safe-gray-light rounded-lg px-4 py-2 text-[10px] text-safe-text-muted z-40">
            Press <kbd className="bg-safe-sidebar border border-safe-gray-light rounded px-1.5 text-[9px] font-mono">ESC</kbd> or click X to close
          </div>
        </div>
      </Card>
    </Modal>
  );
}
