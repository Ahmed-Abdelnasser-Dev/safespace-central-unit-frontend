/**
 * Great-circle distance helpers.
 *
 * Used to rank emergency units by straight-line proximity to an incident/SOS
 * location (no routing/driving-distance service exists in this system — see
 * specs/001-emergency-dispatcher/research.md).
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Great-circle distance between two lat/lng points, in kilometers.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometers
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const a =
    sinDLat * sinDLat +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Default coordinate accessor — expects { latitude, longitude } on each item.
 * @param {object} item
 */
function defaultCoordsOf(item) {
  return { latitude: item.latitude, longitude: item.longitude };
}

/**
 * Ranks a list of items by distance from an origin point, nearest first.
 * Returns a new array of new objects (immutable) — never mutates the input.
 *
 * @param {object[]} items
 * @param {{ latitude: number, longitude: number }} origin
 * @param {(item: object) => { latitude: number, longitude: number }} [coordsOf]
 *   accessor for an item's coordinates; defaults to reading latitude/longitude directly
 * @returns {object[]} new array of `{ ...item, distanceKm }`, sorted nearest first
 */
export function rankByDistance(items, origin, coordsOf = defaultCoordsOf) {
  return items
    .map((item) => {
      const { latitude, longitude } = coordsOf(item);
      const distanceKm = haversineDistanceKm(
        origin.latitude,
        origin.longitude,
        latitude,
        longitude
      );
      return { ...item, distanceKm };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
