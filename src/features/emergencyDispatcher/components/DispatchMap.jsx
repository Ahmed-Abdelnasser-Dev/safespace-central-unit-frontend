import { useMemo, useRef, useState } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { rankByDistance } from '@/shared/utils/haversine';
import UnitMarker from './UnitMarker';
import UnitPopover from './UnitPopover';
import MapControls from './MapControls';
import { useMapStyle } from '@/hooks/useMapStyle.js';

const RADIUS_RING_KM = [1, 5, 10];

/** Destination-point formula — generates a circle polygon for a ring overlay. */
function circlePolygon(centerLat, centerLon, radiusKm, points = 64) {
  const earthRadiusKm = 6371;
  const coordinates = [];
  for (let i = 0; i <= points; i += 1) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = (radiusKm / earthRadiusKm) * Math.cos(angle);
    const dy = (radiusKm / earthRadiusKm) * Math.sin(angle);
    const lat = centerLat + (dy * 180) / Math.PI;
    const lon = centerLon + ((dx * 180) / Math.PI) / Math.cos((centerLat * Math.PI) / 180);
    coordinates.push([lon, lat]);
  }
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coordinates] }, properties: {} };
}

function DispatchMap({ caseRecord, units, dispatchedUnitIds = [] }) {
  const mapRef = useRef();
  const mapStyle = useMapStyle();
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [viewState, setViewState] = useState({
    longitude: caseRecord.longitude,
    latitude: caseRecord.latitude,
    zoom: 12,
  });
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [showRings, setShowRings] = useState(false);
  const [unitFilter, setUnitFilter] = useState({ types: [], availableOnly: false });

  const rankedUnits = useMemo(
    () =>
      rankByDistance(units, { latitude: caseRecord.latitude, longitude: caseRecord.longitude }, (unit) => ({
        latitude: unit.currentLatitude,
        longitude: unit.currentLongitude,
      })),
    [units, caseRecord.latitude, caseRecord.longitude]
  );

  const visibleUnits = useMemo(
    () =>
      rankedUnits.filter((unit) => {
        if (unitFilter.types.length > 0 && !unitFilter.types.includes(unit.unitType)) return false;
        if (unitFilter.availableOnly && unit.status !== 'available') return false;
        return true;
      }),
    [rankedUnits, unitFilter]
  );

  const selectedUnit = visibleUnits.find((u) => u.id === selectedUnitId);

  const ringFeatures = useMemo(
    () =>
      showRings
        ? {
            type: 'FeatureCollection',
            features: RADIUS_RING_KM.map((radiusKm) => circlePolygon(caseRecord.latitude, caseRecord.longitude, radiusKm)),
          }
        : null,
    [showRings, caseRecord.latitude, caseRecord.longitude]
  );

  const mapAnimDuration = prefersReducedMotion ? 0 : 1000;

  function handleZoomToIncident() {
    mapRef.current?.flyTo({ center: [caseRecord.longitude, caseRecord.latitude], zoom: 13, duration: mapAnimDuration });
  }

  function handleZoomIn() {
    mapRef.current?.zoomIn({ duration: prefersReducedMotion ? 0 : 300 });
  }

  function handleZoomOut() {
    mapRef.current?.zoomOut({ duration: prefersReducedMotion ? 0 : 300 });
  }

  function handleZoomToAllUnits() {
    if (visibleUnits.length === 0) return handleZoomToIncident();
    const lons = [caseRecord.longitude, ...visibleUnits.map((u) => u.currentLongitude)];
    const lats = [caseRecord.latitude, ...visibleUnits.map((u) => u.currentLatitude)];
    mapRef.current?.fitBounds(
      [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ],
      { padding: 60, duration: mapAnimDuration }
    );
  }

  const dispatchedUnits = visibleUnits.filter((unit) => dispatchedUnitIds.includes(unit.id));

  return (
    <div className="relative w-full h-full min-h-[420px] bg-safe-dark overflow-hidden rounded-xl">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapLib={import('maplibre-gl')}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {ringFeatures && (
          <Source id="distance-rings" type="geojson" data={ringFeatures}>
            <Layer
              id="distance-rings-line"
              type="line"
              paint={{ 'line-color': '#5a96ff', 'line-width': 1, 'line-dasharray': [2, 2], 'line-opacity': 0.5 }}
            />
          </Source>
        )}

        {dispatchedUnits.map((unit) => (
          <Source
            key={`route-${unit.id}`}
            id={`route-${unit.id}`}
            type="geojson"
            data={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [
                  [unit.currentLongitude, unit.currentLatitude],
                  [caseRecord.longitude, caseRecord.latitude],
                ],
              },
              properties: {},
            }}
          >
            <Layer
              id={`route-line-${unit.id}`}
              type="line"
              paint={{ 'line-color': '#3b7cff', 'line-width': 2, 'line-dasharray': [1, 1.5] }}
            />
          </Source>
        ))}

        {/* Incident / case location pin */}
        <Marker longitude={caseRecord.longitude} latitude={caseRecord.latitude} anchor="bottom">
          <div className="flex flex-col items-center" aria-label="Case location">
            <div className="w-8 h-8 rounded-full bg-safe-danger border-2 border-white shadow-lg flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <div className="w-1 h-3 bg-safe-danger -mt-0.5" />
          </div>
        </Marker>

        {/* Home base markers — only shown when unit has left its base */}
        {visibleUnits
          .filter((unit) => {
            if (!unit.homeBase) return false;
            const dLat = Math.abs(unit.currentLatitude - unit.homeBase.latitude);
            const dLon = Math.abs(unit.currentLongitude - unit.homeBase.longitude);
            return dLat > 0.001 || dLon > 0.001;
          })
          .map((unit) => (
            <UnitMarker key={`base-${unit.id}`} unit={unit} isHomeBase onSelect={() => {}} />
          ))}
        {visibleUnits.map((unit) => (
          <UnitMarker
            key={unit.id}
            unit={unit}
            isSelected={unit.id === selectedUnitId}
            onSelect={setSelectedUnitId}
          />
        ))}

        {selectedUnit && (
          <UnitPopover unit={selectedUnit} distanceKm={selectedUnit.distanceKm} onClose={() => setSelectedUnitId(null)} />
        )}
      </Map>

      <MapControls
        unitFilter={unitFilter}
        onFilterChange={(patch) => setUnitFilter((prev) => ({ ...prev, ...patch }))}
        showRings={showRings}
        onToggleRings={setShowRings}
        onZoomToIncident={handleZoomToIncident}
        onZoomToAllUnits={handleZoomToAllUnits}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </div>
  );
}

export default DispatchMap;
