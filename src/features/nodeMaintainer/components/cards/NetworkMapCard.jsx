/**
 * Network Map Card - Pixel Perfect Figma Design
 * 
 * Displays the network map with node markers and legend.
 * Features: Pan/zoom to selected node, hover card with node details
 * 
 * @component
 */

import React, { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectNode, selectAllNodes, selectSelectedNodeId } from '../../nodesSlice';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FullScreenMapDialog from "../FullScreenMapDialog";
import MapHoverCard from '../map/MapHoverCard.jsx';
import MapNodeMarker from '../map/MapNodeMarker.jsx';
import useMapAutoCenter from '../map/useMapAutoCenter.js';
import useMapHoverPosition from '../map/useMapHoverPosition.js';

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

export default function NetworkMapCard() {
  const dispatch = useDispatch();
  const nodes = useSelector(selectAllNodes);
  const selectedNodeId = useSelector(selectSelectedNodeId);
  const mapRef = useRef(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const hoveredNode = nodes.find(node => node.id === hoveredNodeId);
  const hoverPosition = useMapHoverPosition(mapRef, hoveredNode);

  // Calculate status counts
  const counts = nodes.reduce((acc, node) => {
    if (node.status === 'online') acc.online++;
    else if (node.status === 'offline') acc.offline++;
    else acc.warning++;
    return acc;
  }, { online: 0, warning: 0, offline: 0 });

  const handleMarkerClick = (nodeId) => {
    dispatch(selectNode(nodeId));
  };

  useMapAutoCenter(mapRef, nodes, selectedNodeId);

  return (
    <Card className="border-safe-gray-light rounded-[8px] sm:rounded-[10px] lg:rounded-[13.684px] overflow-hidden flex flex-col flex-1 w-full h-full bg-safe-sidebar">
      {/* Header */}
      <div className="border-b border-safe-gray-light flex items-center justify-between px-[12px] sm:px-[14px] md:px-[16px] h-[40px] sm:h-[44px] md:h-[48px] bg-safe-sidebar flex-shrink-0">
        <div className="flex items-center gap-3">
          <h3
            className="font-bold text-safe-text-primary"
            style={{ fontSize: 'clamp(12px, 1.3vw, 13px)', lineHeight: '18.642px', fontFamily: 'Arimo, sans-serif' }}
          >
            Network Map
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullScreenOpen(true)}
            className="!px-1.5 !py-1.5 text-safe-text-muted hover:bg-safe-gray"
            title="Full Screen"
          >
            <FontAwesomeIcon icon={faExpand} className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-[8px] sm:gap-[10px] md:gap-[12px]">
          {/* Green nodes */}
          <div className="flex items-center gap-[4px] sm:gap-[6px]">
            <div className="w-[6px] h-[6px] sm:w-[7px] sm:h-[7px] rounded-full bg-[#4caf50] flex-shrink-0" />
            <span
              className="text-safe-text-muted font-medium"
              style={{ fontSize: 'clamp(9px, 1vw, 9.114px)', lineHeight: '13.671px', fontFamily: 'Arimo, sans-serif' }}
            >
              Online ({counts.online})
            </span>
          </div>

          {/* Orange nodes */}
          <div className="flex items-center gap-[4px] sm:gap-[6px]">
            <div className="w-[6px] h-[6px] sm:w-[7px] sm:h-[7px] rounded-full bg-[#ff9800] flex-shrink-0" />
            <span
              className="text-safe-text-muted font-medium"
              style={{ fontSize: 'clamp(9px, 1vw, 9.114px)', lineHeight: '13.671px', fontFamily: 'Arimo, sans-serif' }}
            >
              Warning ({counts.warning})
            </span>
          </div>

          {/* Red nodes */}
          <div className="flex items-center gap-[4px] sm:gap-[6px]">
            <div className="w-[6px] h-[6px] sm:w-[7px] sm:h-[7px] rounded-full bg-[#d63e4d] flex-shrink-0" />
            <span
              className="text-safe-text-muted font-medium"
              style={{ fontSize: 'clamp(9px, 1vw, 9.114px)', lineHeight: '13.671px', fontFamily: 'Arimo, sans-serif' }}
            >
              Offline ({counts.offline})
            </span>
          </div>
        </div>
      </div>

      {/* Map View - WITH PROPER HEIGHT */}
      <div className="p-[8px] sm:p-[10px] md:p-[12px] flex-1 relative w-full min-h-0">
        <Map
          ref={mapRef}
          mapLib={import('maplibre-gl')}
          initialViewState={{
            longitude: nodes[0]?.location.longitude || -74.0060,
            latitude: nodes[0]?.location.latitude || 40.7128,
            zoom: 11
          }}
          style={{ width: '100%', height: '100%', borderRadius: '6px', display: 'block' }}
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
