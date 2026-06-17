import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function MediaCarousel({ mediaList = [], nodePolygons = [] }) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => { setIndex(0); }, [mediaList]);

  const hasMedia = mediaList && mediaList.length > 0;
  const current = hasMedia ? mediaList[index] : null;

  const currentUrl = current?.url
    ? (current.url.startsWith('http') ? current.url : current.url)
    : '';

  const next = () => setIndex((i) => (i + 1) % mediaList.length);
  const prev = () => setIndex((i) => (i - 1 + mediaList.length) % mediaList.length);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-gray-200 relative overflow-hidden">
      {current ? (
        <>
          <div className="relative w-full h-full">
            {current.type === 'video' ? (
              <video src={currentUrl} className="object-cover w-full h-full" controls autoPlay muted />
            ) : (
              <img
                src={currentUrl}
                alt={`Accident media ${index + 1}`}
                className="object-contain w-full h-full bg-black/10"
                ref={imageRef}
              />
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <FontAwesomeIcon icon="image" className="text-gray-400 text-3xl" />
          <span className="text-xs text-gray-600 font-medium">No media available</span>
        </div>
      )}

      {hasMedia && (
        <>
          <button onClick={prev} className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center shadow z-10 text-sm">‹</button>
          <button onClick={next} className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center shadow z-10 text-sm">›</button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {mediaList.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>

          <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5 text-xs z-10">
            <div className="flex items-center gap-1.5 bg-black/60 text-white px-2 py-1 rounded">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Accident</span>
            </div>
            {nodePolygons.length > 0 && (
              <div className="flex items-center gap-1.5 bg-black/60 text-white px-2 py-1 rounded">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Lanes</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default MediaCarousel;
