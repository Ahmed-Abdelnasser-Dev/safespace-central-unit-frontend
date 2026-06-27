import { Marker } from 'react-map-gl/maplibre';
import { getNodeStatusColors } from './mapUtils';

function MapNodeMarker({ node, isSelected, onSelect, onHoverStart, onHoverEnd }) {
  if (!node?.location) return null;
  const { latitude, longitude } = node.location;
  if (latitude == null || longitude == null) return null;

  const statusColor = getNodeStatusColors(node.status).dot;
  const shouldPulse = isSelected || node.status === 'offline' || node.status === 'warning';

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      onClick={(event) => {
        event.originalEvent.stopPropagation();
        onSelect?.(node.id);
      }}
    >
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => onHoverStart?.(node.id)}
        onMouseLeave={() => onHoverEnd?.()}
      >
        {/* Pulse ring — status-driven */}
        <div
          className={`absolute rounded-full ${shouldPulse ? 'animate-ping' : ''}`}
          style={{
            width: '26.368px',
            height: '26.368px',
            backgroundColor: statusColor,
            opacity: 0.4,
            left: '-8.21px',
            top: '-8.21px',
          }}
        />
        {/* Core dot */}
        <div
          className="rounded-full border-[1.364px] border-white"
          style={{
            width: '14.912px',
            height: '14.912px',
            backgroundColor: statusColor,
            marginLeft: '-2.49px',
            marginTop: '-2.49px',
          }}
        />
      </div>
    </Marker>
  );
}

export default MapNodeMarker;
