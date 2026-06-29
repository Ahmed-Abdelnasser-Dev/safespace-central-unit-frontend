/**
 * AnalyticsHeatmapPage — /analytics/heatmap
 *
 * Geographic incident density view using maplibre-gl heatmap layer.
 * Uses the same CARTO tile style as MapOverviewPage.
 * Read-only. No actions.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { analyticsAPI } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext.jsx';

// ── Map style (mirrors useMapStyle hook) ──────────────────────────────────────

function getMapStyle(theme) {
  const variant = theme === 'light' ? 'light' : 'dark';
  const tiles = variant === 'dark'
    ? ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
       'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png']
    : ['https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
       'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'];
  return {
    version: 8,
    sources: {
      'carto-tiles': {
        type: 'raster',
        tiles,
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxzoom: 20,
      },
    },
    layers: [{ id: 'carto-tiles', type: 'raster', source: 'carto-tiles' }],
  };
}

// ── Controls ──────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: '7 Days',  days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
];

const SEV_FILTERS = [
  { label: 'All',     value: '' },
  { label: 'Sev 3+',  value: '3' },
  { label: 'Sev 5',   value: '5' },
];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AnalyticsHeatmapPage() {
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const { theme }       = useTheme();

  const [daysBack, setDaysBack]     = useState(30);
  const [minSev, setMinSev]         = useState('');
  const [pointCount, setPointCount] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [mapReady, setMapReady]     = useState(false);

  // ── Helper: add incident + node sources/layers (called on load AND after setStyle) ──
  const cachedDataRef = useRef({ incidents: null, nodes: null });

  function addMapLayers(map) {
    // Incidents heatmap source
    map.addSource('incidents', {
      type: 'geojson',
      data: cachedDataRef.current.incidents ?? { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id: 'incidents-heat',
      type: 'heatmap',
      source: 'incidents',
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'severity'], 1, 0.2, 5, 1.0],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 3],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0,   'rgba(33,102,172,0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1,   'rgb(178,24,43)',
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 20, 15, 40],
        'heatmap-opacity': 0.85,
      },
    });

    // Nodes circle source
    map.addSource('nodes', {
      type: 'geojson',
      data: cachedDataRef.current.nodes ?? { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id: 'nodes-circles',
      type: 'circle',
      source: 'nodes',
      paint: {
        'circle-radius': 8,
        'circle-color': ['case', ['==', ['get', 'status'], 'online'], '#22c55e', '#ef4444'],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-opacity': 0.9,
      },
    });
  }

  // ── Init map ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapStyle(theme),
      center: [32.2654, 30.5952], // Ismailia centre
      zoom: 12,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    mapRef.current.on('load', () => {
      addMapLayers(mapRef.current);
      setMapReady(true);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update map style when theme changes — re-add layers afterwards ───────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const center = mapRef.current.getCenter();
    const zoom   = mapRef.current.getZoom();
    mapRef.current.setStyle(getMapStyle(theme));
    mapRef.current.once('styledata', () => {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(zoom);
      // setStyle() wipes all sources/layers — re-add them with cached data
      addMapLayers(mapRef.current);
    });
  }, [theme, mapReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch & render points ───────────────────────────────────────────────────
  const fetchAndRender = useCallback(async () => {
    if (!mapReady || !mapRef.current) return;

    setLoading(true);
    try {
      const start = new Date(Date.now() - daysBack * 86400_000).toISOString();
      const [points, nodes] = await Promise.all([
        analyticsAPI.getHeatmapPoints({ start, ...(minSev && { minSeverity: minSev }) }),
        analyticsAPI.getNodeList(),
      ]);

      setPointCount(points.length);

      // Build GeoJSON
      const incidentGeo = {
        type: 'FeatureCollection',
        features: points.map((p) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
          properties: { severity: p.severity },
        })),
      };

      const nodeGeo = {
        type: 'FeatureCollection',
        features: nodes
          .filter((n) => n.longitude != null && n.latitude != null)
          .map((n) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [Number(n.longitude), Number(n.latitude)] },
            properties: { name: n.name, status: n.status, incidentCount: n.incidentCount },
          })),
      };

      // Cache for theme-change rebuilds
      cachedDataRef.current = { incidents: incidentGeo, nodes: nodeGeo };

      const incidentSrc = mapRef.current.getSource('incidents');
      const nodeSrc     = mapRef.current.getSource('nodes');

      if (incidentSrc) incidentSrc.setData(incidentGeo);
      if (nodeSrc)     nodeSrc.setData(nodeGeo);
    } catch (err) {
      console.error('Heatmap fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [mapReady, daysBack, minSev]);

  useEffect(() => {
    fetchAndRender();
  }, [fetchAndRender]);

  return (
    <div className="relative h-[calc(100vh-64px)] flex flex-col">
      {/* Controls overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        {/* Title card */}
        <div className="bg-safe-dark/90 backdrop-blur rounded-xl border border-safe-border px-4 py-3 pointer-events-auto">
          <h1 className="text-sm font-bold text-safe-text-primary">Incident Density Map</h1>
          <p className="text-xs text-safe-text-muted mt-0.5">
            {loading ? 'Loading…' : `${pointCount ?? '—'} incidents plotted`}
          </p>
        </div>

        {/* Time range */}
        <div className="bg-safe-dark/90 backdrop-blur rounded-xl border border-safe-border p-3 pointer-events-auto">
          <p className="text-xs font-medium text-safe-text-gray mb-2">Time Range</p>
          <div className="flex flex-col gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.days}
                onClick={() => setDaysBack(p.days)}
                className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  daysBack === p.days
                    ? 'bg-safe-blue-btn text-white'
                    : 'text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray/30'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Severity filter */}
        <div className="bg-safe-dark/90 backdrop-blur rounded-xl border border-safe-border p-3 pointer-events-auto">
          <p className="text-xs font-medium text-safe-text-gray mb-2">Severity Filter</p>
          <div className="flex flex-col gap-1">
            {SEV_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setMinSev(f.value)}
                className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  minSev === f.value
                    ? 'bg-safe-blue-btn text-white'
                    : 'text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray/30'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-10 bg-safe-dark/90 backdrop-blur rounded-xl border border-safe-border px-4 py-3">
        <p className="text-xs font-medium text-safe-text-gray mb-2">Density Legend</p>
        <div className="flex items-center gap-1 mb-2">
          {['#3361ac', '#67a9cf', '#d1e5f0', '#fdbf7f', '#ef8a62', '#b2182b'].map((c) => (
            <div key={c} className="w-7 h-3 rounded-sm" style={{ background: c }} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-safe-text-muted">
          <span>Low</span>
          <span>High</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
            <span className="text-xs text-safe-text-muted">Online node</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            <span className="text-xs text-safe-text-muted">Offline</span>
          </div>
        </div>
      </div>

      {/* Loading spinner overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-safe-dark/20 z-20 pointer-events-none">
          <div className="bg-safe-dark/80 rounded-xl p-4 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-safe-blue-btn border-t-transparent animate-spin" />
            <span className="text-safe-text-muted text-sm">Loading heatmap…</span>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainerRef} className="flex-1 w-full" />
    </div>
  );
}