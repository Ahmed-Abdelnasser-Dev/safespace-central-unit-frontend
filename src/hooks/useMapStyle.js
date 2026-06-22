import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext.jsx';

const CARTO_TILES = {
  dark: [
    'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
  ],
  light: [
    'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
  ],
};

export function useMapStyle() {
  const { theme } = useTheme();

  return useMemo(() => {
    const variant = theme === 'light' ? 'light' : 'dark';
    return {
      version: 8,
      sources: {
        'carto-tiles': {
          type: 'raster',
          tiles: CARTO_TILES[variant],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxzoom: 20,
        },
      },
      layers: [{ id: 'carto-tiles', type: 'raster', source: 'carto-tiles', paint: { 'raster-opacity': 1 } }],
    };
  }, [theme]);
}
