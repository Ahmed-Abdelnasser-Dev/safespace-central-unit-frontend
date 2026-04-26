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
        <div className="bg-gradient-to-r from-[#f7f8f9] to-white border-b border-[#e5e7eb] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-[#101828]">Network Map - Full Screen</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="!px-2 !py-2 text-[#6a7282] hover:bg-[#e5e7eb]"
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
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
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
          <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg border border-[#e5e7eb] p-4 max-w-sm z-40">
            <h3 className="text-sm font-bold text-[#101828] mb-3">Status Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#4caf50]" />
                <span className="text-[#6a7282] text-xs">Online</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#ff9800]" />
                <span className="text-[#6a7282] text-xs">Warning</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#d63e4d]" />
                <span className="text-[#6a7282] text-xs">Offline</span>
              </div>
            </div>
          </div>

          {/* Keyboard Hint */}
          <div className="absolute bottom-6 right-6 bg-[#f7f8f9] rounded-lg border border-[#e5e7eb] px-4 py-2 text-[10px] text-[#6a7282] z-40">
            Press <kbd className="bg-white border border-[#d0d5dd] rounded px-1.5 text-[9px] font-mono">ESC</kbd> or click X to close
          </div>
        </div>
      </Card>
    </Modal>
  );
}
