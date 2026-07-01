/**
 * Shared math for mapping accident/lane polygon points onto a displayed image.
 *
 * Polygon points are stored as absolute pixels inside the polygon's own
 * `baseWidth` x `baseHeight` authoring space (lane polygons are authored at a
 * canonical 640x640; the accident polygon from the AI service carries its own
 * native frame resolution). Both can differ, and neither matches the size the
 * image is actually rendered at, so every consumer must normalize per-polygon
 * before drawing.
 */

export const DEFAULT_POLYGON_BASE = 640;

/**
 * Points arrive as either `{x, y}` objects or `[x, y]` pairs depending on the
 * source (node editor vs. AI service) — same tolerance as the node editor's
 * own `normalizePoints` (PolygonEditorDialog.jsx). Anything else is dropped
 * rather than producing NaN coordinates that silently fail to draw.
 *
 * @param {Array<{x:number,y:number}|[number,number]>} points
 * @returns {Array<{x:number,y:number}>}
 */
function normalizePoints(points) {
  return (points || [])
    .map((p) => {
      if (typeof p?.x === 'number' && typeof p?.y === 'number') return p;
      if (Array.isArray(p) && p.length >= 2) return { x: p[0], y: p[1] };
      return null;
    })
    .filter(Boolean);
}

/**
 * Convert a polygon's pixel points into a "x,y x,y ..." string in a 0-100
 * percentage space, normalized by the polygon's own baseWidth/baseHeight.
 * Intended for an SVG with viewBox="0 0 100 100" preserveAspectRatio="none".
 *
 * @param {{ points?: Array<{x:number,y:number}|[number,number]>, baseWidth?: number, baseHeight?: number }} polygon
 * @returns {string}
 */
export function polygonToPercentPoints(polygon) {
  const points = normalizePoints(polygon?.points);
  if (!points.length) return '';
  const baseWidth = polygon.baseWidth || DEFAULT_POLYGON_BASE;
  const baseHeight = polygon.baseHeight || DEFAULT_POLYGON_BASE;
  return points
    .map((point) => `${(point.x / baseWidth) * 100},${(point.y / baseHeight) * 100}`)
    .join(' ');
}

/**
 * Scale a polygon's pixel points into an arbitrary target width/height
 * (e.g. a canvas), normalized by the polygon's own baseWidth/baseHeight.
 *
 * @param {{ points?: Array<{x:number,y:number}|[number,number]>, baseWidth?: number, baseHeight?: number }} polygon
 * @param {number} targetWidth
 * @param {number} targetHeight
 * @returns {Array<{x:number,y:number}>}
 */
export function scalePolygonPoints(polygon, targetWidth, targetHeight) {
  const points = normalizePoints(polygon?.points);
  if (!points.length) return [];
  const baseWidth = polygon.baseWidth || DEFAULT_POLYGON_BASE;
  const baseHeight = polygon.baseHeight || DEFAULT_POLYGON_BASE;
  return points.map((point) => ({
    x: (point.x / baseWidth) * targetWidth,
    y: (point.y / baseHeight) * targetHeight,
  }));
}

/**
 * Compute aspect-ratio-preserving canvas dimensions for a natural image size,
 * capped to a maximum side length.
 *
 * @param {number} naturalWidth
 * @param {number} naturalHeight
 * @param {number} [maxSide=640]
 * @returns {{ width: number, height: number }}
 */
export function computeFitCanvasSize(naturalWidth, naturalHeight, maxSide = DEFAULT_POLYGON_BASE) {
  if (!naturalWidth || !naturalHeight) {
    return { width: maxSide, height: maxSide };
  }
  // Scale so the longest side matches maxSide, preserving aspect ratio
  // (scales up or down — unlike a min(...,1) cap, this keeps small images
  // at a usable display size instead of leaving them tiny).
  const scale = maxSide / Math.max(naturalWidth, naturalHeight);
  return {
    width: Math.round(naturalWidth * scale),
    height: Math.round(naturalHeight * scale),
  };
}
