import { useMemo, useRef, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import UnitMarker from '../UnitMarker';
import UnitPopover from '../UnitPopover';
import MapControls from '../MapControls';
import CaseMarker from './CaseMarker';
import StationMarker from './StationMarker';
import { rankByDistance } from '@/shared/utils/haversine';

const DARK_BASEMAP_STYLE = {
  version: 8,
  sources: {
    'dark-matter': {
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
  layers: [{ id: 'dark-matter', type: 'raster', source: 'dark-matter', paint: { 'raster-opacity': 1 } }],
};

const RADIUS_RING_KM = [1, 5, 10];

function circlePolygon(lat, lon, radiusKm, points = 64) {
  const R = 6371;
  const coords = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = (radiusKm / R) * Math.cos(angle);
    const dy = (radiusKm / R) * Math.sin(angle);
    coords.push([
      lon + ((dx * 180) / Math.PI) / Math.cos((lat * Math.PI) / 180),
      lat + (dy * 180) / Math.PI,
    ]);
  }
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: {} };
}

// Centre of Ismailia coverage area — used as initial map view
const DEFAULT_CENTER = { latitude: 30.59, longitude: 32.27, zoom: 10 };

function buildInitialView(cases, units) {
  const allLats = [...cases.map((c) => c.latitude), ...units.map((u) => u.currentLatitude)];
  const allLons = [...cases.map((c) => c.longitude), ...units.map((u) => u.currentLongitude)];
  if (allLats.length === 0) return DEFAULT_CENTER;
  const midLat = (Math.min(...allLats) + Math.max(...allLats)) / 2;
  const midLon = (Math.min(...allLons) + Math.max(...allLons)) / 2;
  return { latitude: midLat, longitude: midLon, zoom: 10 };
}

export default function ConsoleMap({
  cases,
  units,
  stations = [],
  allAssignments,
  selectedCaseId,
  mapHighlightedCaseId,
  onSelectCase,
  onSelectUnit,
}) {
  const mapRef = useRef();
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [viewState, setViewState] = useState(() => buildInitialView(cases, units));
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [showRings, setShowRings] = useState(false);
  const [unitFilter, setUnitFilter] = useState({ types: [], availableOnly: false });

  const animDuration = prefersReducedMotion ? 0 : 900;

  // Active cases shown on map (exclude resolved/closed/false_alarm)
  const activeCases = useMemo(
    () => cases.filter((c) => !['resolved', 'false_alarm', 'closed'].includes(c.status)),
    [cases]
  );

  const visibleUnits = useMemo(
    () =>
      units.filter((u) => {
        if (unitFilter.types.length > 0 && !unitFilter.types.includes(u.unitType)) return false;
        if (unitFilter.availableOnly && u.status !== 'available') return false;
        return true;
      }),
    [units, unitFilter]
  );

  const selectedUnit = visibleUnits.find((u) => u.id === selectedUnitId);

  // Distance from selected-case center for popover
  const focusCase = activeCases.find((c) => c.id === (selectedCaseId ?? mapHighlightedCaseId));
  const rankedUnits = useMemo(() => {
    if (!focusCase) return visibleUnits;
    return rankByDistance(visibleUnits, { latitude: focusCase.latitude, longitude: focusCase.longitude }, (u) => ({
      latitude: u.currentLatitude,
      longitude: u.currentLongitude,
    }));
  }, [visibleUnits, focusCase]);

  // Route lines for all active en_route assignments
  const enRouteAssignments = useMemo(
    () => allAssignments.filter((a) => a.status === 'en_route'),
    [allAssignments]
  );

  // Faint spoke lines from each station to its non-dispatched units
  const homeBaseLineFeatures = useMemo(() => {
    const stationMap = Object.fromEntries(stations.map((s) => [s.id, s]));
    const features = [];
    for (const unit of visibleUnits) {
      if (!unit.stationId) continue;
      if (unit.status === 'en_route' || unit.status === 'on_scene') continue;
      const station = stationMap[unit.stationId];
      if (!station) continue;
      // Skip zero-length lines (unit exactly at station)
      const dLat = Math.abs(unit.currentLatitude - station.latitude);
      const dLon = Math.abs(unit.currentLongitude - station.longitude);
      if (dLat < 0.0001 && dLon < 0.0001) continue;
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [station.longitude, station.latitude],
            [unit.currentLongitude, unit.currentLatitude],
          ],
        },
        properties: { unitId: unit.id },
      });
    }
    return { type: 'FeatureCollection', features };
  }, [visibleUnits, stations]);

  // Distance rings centred on the selected/highlighted case
  const ringCenter = focusCase;
  const ringFeatures = useMemo(() => {
    if (!showRings || !ringCenter) return null;
    return {
      type: 'FeatureCollection',
      features: RADIUS_RING_KM.map((r) => circlePolygon(ringCenter.latitude, ringCenter.longitude, r)),
    };
  }, [showRings, ringCenter]);

  function handleZoomToCase() {
    if (focusCase) {
      mapRef.current?.flyTo({ center: [focusCase.longitude, focusCase.latitude], zoom: 13, duration: animDuration });
    } else if (activeCases.length > 0) {
      fitAll();
    }
  }

  function fitAll() {
    const allLons = [
      ...activeCases.map((c) => c.longitude),
      ...visibleUnits.map((u) => u.currentLongitude),
    ];
    const allLats = [
      ...activeCases.map((c) => c.latitude),
      ...visibleUnits.map((u) => u.currentLatitude),
    ];
    if (allLons.length === 0) return;
    mapRef.current?.fitBounds(
      [[Math.min(...allLons), Math.min(...allLats)], [Math.max(...allLons), Math.max(...allLats)]],
      { padding: 60, duration: animDuration }
    );
  }

  function handleUnitSelect(unitId) {
    const unit = rankedUnits.find((u) => u.id === unitId);
    setSelectedUnitId(unitId);
    if (unit) {
      mapRef.current?.flyTo({ center: [unit.currentLongitude, unit.currentLatitude], zoom: 13, duration: animDuration });
    }
    onSelectUnit?.(unitId);
  }

  return (
    <div className="relative w-full h-full min-h-[360px] bg-safe-dark overflow-hidden">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapLib={import('maplibre-gl')}
        mapStyle={DARK_BASEMAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Distance rings */}
        {ringFeatures && (
          <Source id="distance-rings" type="geojson" data={ringFeatures}>
            <Layer
              id="distance-rings-line"
              type="line"
              paint={{ 'line-color': '#5a96ff', 'line-width': 1, 'line-dasharray': [2, 2], 'line-opacity': 0.45 }}
            />
          </Source>
        )}

        {/* Home-base spokes — faint dotted lines from station to patrolling/standby units */}
        {homeBaseLineFeatures.features.length > 0 && (
          <Source id="home-base-spokes" type="geojson" data={homeBaseLineFeatures}>
            <Layer
              id="home-base-spokes-layer"
              type="line"
              paint={{
                'line-color': '#ffffff',
                'line-width': 0.8,
                'line-opacity': 0.14,
                'line-dasharray': [1, 5],
              }}
            />
          </Source>
        )}

        {/* Route lines for all en_route assignments */}
        {enRouteAssignments.map((assignment) => {
          const caseRecord = activeCases.find((c) => c.id === assignment.caseId);
          const unit = units.find((u) => u.id === assignment.unitId);
          if (!caseRecord || !unit) return null;
          return (
            <Source
              key={`route-${assignment.id}`}
              id={`route-${assignment.id}`}
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
                id={`route-line-${assignment.id}`}
                type="line"
                paint={{ 'line-color': '#3b7cff', 'line-width': 1.5, 'line-dasharray': [1, 1.5], 'line-opacity': 0.6 }}
              />
            </Source>
          );
        })}

        {/* Station bases */}
        {stations.map((station) => (
          <StationMarker key={station.id} station={station} />
        ))}

        {/* Unit home-base ghost markers when unit has moved from base */}
        {visibleUnits
          .filter((u) => {
            if (!u.homeBase) return false;
            return (
              Math.abs(u.currentLatitude - u.homeBase.latitude) > 0.001 ||
              Math.abs(u.currentLongitude - u.homeBase.longitude) > 0.001
            );
          })
          .map((u) => (
            <UnitMarker key={`base-${u.id}`} unit={u} isHomeBase onSelect={() => {}} />
          ))}

        {/* Unit markers */}
        {rankedUnits.map((unit) => (
          <UnitMarker
            key={unit.id}
            unit={unit}
            isSelected={unit.id === selectedUnitId}
            onSelect={handleUnitSelect}
          />
        ))}

        {/* Case pins — drawn on top */}
        {activeCases.map((c) => (
          <CaseMarker
            key={c.id}
            caseRecord={c}
            isSelected={c.id === selectedCaseId}
            isMapHighlighted={c.id === mapHighlightedCaseId}
            onClick={(id) => {
              onSelectCase?.(id);
              const found = activeCases.find((ac) => ac.id === id);
              if (found) {
                mapRef.current?.flyTo({ center: [found.longitude, found.latitude], zoom: 13, duration: animDuration });
              }
            }}
          />
        ))}

        {selectedUnit && (
          <UnitPopover
            unit={selectedUnit}
            distanceKm={selectedUnit.distanceKm}
            onClose={() => setSelectedUnitId(null)}
          />
        )}
      </Map>

      <MapControls
        unitFilter={unitFilter}
        onFilterChange={(patch) => setUnitFilter((prev) => ({ ...prev, ...patch }))}
        showRings={showRings}
        onToggleRings={setShowRings}
        onZoomToIncident={handleZoomToCase}
        onZoomToAllUnits={fitAll}
        onZoomIn={() => mapRef.current?.zoomIn({ duration: prefersReducedMotion ? 0 : 300 })}
        onZoomOut={() => mapRef.current?.zoomOut({ duration: prefersReducedMotion ? 0 : 300 })}
      />
    </div>
  );
}
