import { describe, expect, it } from 'vitest';
import { haversineDistanceKm, rankByDistance } from './haversine';

describe('haversineDistanceKm', () => {
  it('returns ~0 for two identical coordinates', () => {
    const distance = haversineDistanceKm(30.5952, 32.2654, 30.5952, 32.2654);
    expect(distance).toBeCloseTo(0, 5);
  });

  it('matches the known great-circle distance between Cairo and Ismailia (~119km)', () => {
    // Cairo (Tahrir Square): 30.0444, 31.2357 — Ismailia: 30.5965, 32.2715
    const distance = haversineDistanceKm(30.0444, 31.2357, 30.5965, 32.2715);
    expect(distance).toBeGreaterThan(110);
    expect(distance).toBeLessThan(130);
  });

  it('is symmetric regardless of point order', () => {
    const a = haversineDistanceKm(30.5952, 32.2654, 30.0444, 31.2357);
    const b = haversineDistanceKm(30.0444, 31.2357, 30.5952, 32.2654);
    expect(a).toBeCloseTo(b, 9);
  });

  it('returns a larger distance for farther points', () => {
    const near = haversineDistanceKm(30.5952, 32.2654, 30.6, 32.27);
    const far = haversineDistanceKm(30.5952, 32.2654, 31.2, 30.0);
    expect(far).toBeGreaterThan(near);
  });
});

describe('rankByDistance', () => {
  const origin = { latitude: 30.5952, longitude: 32.2654 };

  it('sorts items nearest-first and attaches a distanceKm field', () => {
    const items = [
      { id: 'far', latitude: 31.2, longitude: 30.0 },
      { id: 'near', latitude: 30.6, longitude: 32.27 },
      { id: 'mid', latitude: 30.8, longitude: 32.4 },
    ];

    const ranked = rankByDistance(items, origin);

    expect(ranked.map((item) => item.id)).toEqual(['near', 'mid', 'far']);
    ranked.forEach((item) => {
      expect(typeof item.distanceKm).toBe('number');
      expect(item.distanceKm).toBeGreaterThanOrEqual(0);
    });
  });

  it('does not mutate the original array or its items', () => {
    const items = [{ id: 'a', latitude: 30.6, longitude: 32.27 }];
    const itemsCopy = items.map((item) => ({ ...item }));

    rankByDistance(items, origin);

    expect(items).toEqual(itemsCopy);
  });

  it('returns an empty array when given no items', () => {
    expect(rankByDistance([], origin)).toEqual([]);
  });

  it('reads latitude/longitude via a custom accessor when provided', () => {
    const items = [
      { id: 'near', pos: { lat: 30.6, lng: 32.27 } },
      { id: 'far', pos: { lat: 31.2, lng: 30.0 } },
    ];

    const ranked = rankByDistance(items, origin, (item) => ({
      latitude: item.pos.lat,
      longitude: item.pos.lng,
    }));

    expect(ranked.map((item) => item.id)).toEqual(['near', 'far']);
  });
});
