/**
 * LocationPicker — interactive map pin for node location selection.
 * Click or drag the pin to set coordinates.
 */
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStyle } from '@/hooks/useMapStyle.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const EGYPT_CENTER = { longitude: 32.5498, latitude: 30.0131, zoom: 8 };

// Stable promise — created once at module scope to avoid remounting the map on every render
const mapLibPromise = import('maplibre-gl');

export default function LocationPicker({ lat, lng, onChange }) {
  const mapStyle = useMapStyle();

  const hasPin = lat != null && lng != null && !isNaN(lat) && !isNaN(lng);
  const pinLat = hasPin ? lat : EGYPT_CENTER.latitude;
  const pinLng = hasPin ? lng : EGYPT_CENTER.longitude;

  const handleMapClick = (e) => {
    onChange(e.lngLat.lat, e.lngLat.lng);
  };

  const handleDragEnd = (e) => {
    onChange(e.lngLat.lat, e.lngLat.lng);
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ height: 240 }}>
      <Map
        mapLib={mapLibPromise}
        initialViewState={EGYPT_CENTER}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        cursor="crosshair"
        onClick={handleMapClick}
      >
        <Marker
          longitude={pinLng}
          latitude={pinLat}
          anchor="bottom"
          draggable
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-safe-blue-btn border-2 border-white shadow-lg flex items-center justify-center">
              <FontAwesomeIcon icon="location-dot" className="text-white text-xs" />
            </div>
            <div className="w-0.5 h-3 bg-safe-blue-btn" />
          </div>
        </Marker>
      </Map>
      <div className="absolute top-2 left-2 bg-safe-sidebar/90 backdrop-blur-sm border border-safe-gray-light rounded px-2 py-1">
        <p className="text-[10px] text-safe-text-muted">Click map or drag pin to set location</p>
      </div>
    </div>
  );
}
