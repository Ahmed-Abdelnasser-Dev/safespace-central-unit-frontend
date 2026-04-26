import { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import useGeolocation from '@/hooks/useGeolocation';

function MapView() {
  const mapRef = useRef();
  const location = useGeolocation();
  const [viewState, setViewState] = useState({
    longitude: location.longitude || -122.4194,
    latitude: location.latitude || 37.7749,
    zoom: 14,
  });
  const [hasInitialized, setHasInitialized] = useState(false);

  // Update map center when user location is available for the first time
  useEffect(() => {
    if (location.latitude && location.longitude && !hasInitialized) {
      setViewState({
        longitude: location.longitude,
        latitude: location.latitude,
        zoom: 17, // Higher zoom for more accurate view
      });
      setHasInitialized(true);
    }
  }, [location.latitude, location.longitude, hasInitialized]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleLocateMe = () => {
    if (location.latitude && location.longitude && mapRef.current) {
      mapRef.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 18, // Higher zoom for precise location
        duration: 2000,
      });
    }
  };

  return (
    <div className="relative w-full h-full bg-safe-bg overflow-hidden">
      {/* Map Container */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapLib={import('maplibre-gl')}
        mapStyle={{
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap Contributors',
              maxzoom: 19,
            },
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm',
              paint: {
                'raster-opacity': 1,
              },
            },
          ],
        }}
        style={{ width: '100%', height: '100%', borderRadius: '12px' }}
        attributionControl={false}
      >
        {/* Current Location Marker */}
        {location.latitude && location.longitude && (
          <Marker
            longitude={location.longitude}
            latitude={location.latitude}
            anchor="center"
          >
            <div className="relative">
              {/* Pulsing ring */}
              <div className="absolute inset-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                <div className="w-full h-full rounded-full bg-safe-blue-btn/30 animate-ping"></div>
              </div>
              {/* Main marker */}
              <div className="relative w-6 h-6 -translate-x-1/2 -translate-y-1/2">
                <div className="w-full h-full rounded-full bg-safe-blue-btn border-4 border-white shadow-lg"></div>
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </Marker>
        )}

        {/* Built-in Navigation Control */}
        <NavigationControl position="bottom-right" style={{ display: 'none' }} />
        <GeolocateControl position="bottom-right" style={{ display: 'none' }} />
      </Map>

      {/* Location Error Message */}
      {location.error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-safe-danger text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <FontAwesomeIcon icon="exclamation-triangle" />
          {location.error}
        </div>
      )}

      {/* Loading Indicator */}
      {location.loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 text-safe-text-gray">
          <div className="w-4 h-4 border-2 border-safe-blue-btn border-t-transparent rounded-full animate-spin"></div>
          Getting your location...
        </div>
      )}

      {/* Location Accuracy Indicator */}
      {location.accuracy && !location.loading && !location.error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md text-xs flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${location.accuracy < 20 ? 'bg-safe-green' : location.accuracy < 50 ? 'bg-safe-accent' : 'bg-safe-orange'}`}></div>
          <span className="text-safe-text-gray">
            Accuracy: <span className="font-semibold text-safe-text-dark">{Math.round(location.accuracy)}m</span>
          </span>
        </div>
      )}

      {/* Custom Map Controls - Bottom Right */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          className="w-11 h-11 bg-white rounded-lg shadow-md flex items-center justify-center text-safe-text-dark hover:bg-safe-bg transition-colors"
          title="Center on my location"
        >
          <FontAwesomeIcon icon="location-crosshairs" className="text-base" />
        </button>
      </div>

      {/* Zoom Controls - Bottom Right (above other controls) */}
      <div className="absolute bottom-20 right-6 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
        <button
          onClick={handleZoomIn}
          className="w-11 h-11 flex items-center justify-center text-safe-text-dark hover:bg-safe-bg transition-colors border-b border-safe-border"
        >
          <FontAwesomeIcon icon="plus" className="text-base" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-11 h-11 flex items-center justify-center text-safe-text-dark hover:bg-safe-bg transition-colors"
        >
          <FontAwesomeIcon icon="minus" className="text-base" />
        </button>
      </div>
    </div>
  );
}

export default MapView;
