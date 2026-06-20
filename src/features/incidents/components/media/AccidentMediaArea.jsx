import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MediaCarousel from './MediaCarousel.jsx';
import AccidentPolygonDialog from './AccidentPolygonDialog.jsx';

/**
 * AccidentMediaArea – Media carousel with polygon overlay button
 */
export default function AccidentMediaArea({ incident }) {
  const [polygonDialogOpen, setPolygonDialogOpen] = useState(false);

  return (
    <div
      className="bg-[#e5e7eb] rounded-[8px] overflow-hidden border border-[#d1d5db] relative max-w-[640px] mx-auto"
      style={{ aspectRatio: '1 / 1', minHeight: '320px', maxHeight: '640px' }}
    >
      <MediaCarousel
        mediaList={incident?.mediaList || []}
        accidentPolygon={incident?.accidentPolygon}
        nodePolygons={incident?.nodePolygons || []}
      />
      <button
        className="absolute top-2 right-2 z-20 bg-white/80 hover:bg-white text-safe-blue border border-safe-border rounded px-3 py-1 text-xs font-semibold shadow transition"
        onClick={() => setPolygonDialogOpen(true)}
        title="View Polygons"
      >
        <FontAwesomeIcon icon="draw-polygon" className="mr-1" />
        View Polygons
      </button>
      <AccidentPolygonDialog
        open={polygonDialogOpen}
        onClose={() => setPolygonDialogOpen(false)}
        accidentPolygon={incident?.accidentPolygon}
        nodePolygons={incident?.nodePolygons || []}
        imageUrl={incident?.mediaList?.[0]?.url || ''}
      />
    </div>
  );
}
