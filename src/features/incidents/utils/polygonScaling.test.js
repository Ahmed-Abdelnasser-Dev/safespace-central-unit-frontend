import { describe, expect, it } from 'vitest';
import {
  polygonToPercentPoints,
  scalePolygonPoints,
  computeFitCanvasSize,
} from './polygonScaling.js';

describe('polygonToPercentPoints', () => {
  it('normalizes points by the polygon\'s own baseWidth/baseHeight into a 0-100 space', () => {
    const polygon = { points: [{ x: 0, y: 0 }, { x: 320, y: 640 }], baseWidth: 640, baseHeight: 640 };
    expect(polygonToPercentPoints(polygon)).toBe('0,0 50,100');
  });

  it('handles a non-square base (e.g. native 1280x720 accident polygon)', () => {
    const polygon = { points: [{ x: 1280, y: 720 }], baseWidth: 1280, baseHeight: 720 };
    expect(polygonToPercentPoints(polygon)).toBe('100,100');
  });

  it('falls back to 640 when baseWidth/baseHeight are missing', () => {
    const polygon = { points: [{ x: 64, y: 320 }] };
    expect(polygonToPercentPoints(polygon)).toBe('10,50');
  });

  it('returns an empty string when there are no points', () => {
    expect(polygonToPercentPoints({ points: [] })).toBe('');
    expect(polygonToPercentPoints(null)).toBe('');
    expect(polygonToPercentPoints(undefined)).toBe('');
  });

  it('tolerates [x, y] array-pair points, not just {x, y} objects', () => {
    const polygon = { points: [[0, 0], [320, 640]], baseWidth: 640, baseHeight: 640 };
    expect(polygonToPercentPoints(polygon)).toBe('0,0 50,100');
  });

  it('drops malformed points instead of producing NaN coordinates', () => {
    const polygon = { points: [{ x: 64, y: 320 }, null, 'garbage', [1]], baseWidth: 640, baseHeight: 640 };
    expect(polygonToPercentPoints(polygon)).toBe('10,50');
  });
});

describe('scalePolygonPoints', () => {
  it('scales points into an arbitrary target size using the polygon\'s own base', () => {
    const polygon = { points: [{ x: 320, y: 160 }], baseWidth: 640, baseHeight: 320 };
    expect(scalePolygonPoints(polygon, 1280, 640)).toEqual([{ x: 640, y: 320 }]);
  });

  it('returns an empty array when there are no points', () => {
    expect(scalePolygonPoints({ points: [] }, 100, 100)).toEqual([]);
    expect(scalePolygonPoints(null, 100, 100)).toEqual([]);
  });

  it('tolerates [x, y] array-pair points (e.g. AI service output)', () => {
    const polygon = { points: [[320, 160]], baseWidth: 640, baseHeight: 320 };
    expect(scalePolygonPoints(polygon, 1280, 640)).toEqual([{ x: 640, y: 320 }]);
  });
});

describe('computeFitCanvasSize', () => {
  it('caps the longest side of a landscape image to maxSide, preserving aspect ratio', () => {
    expect(computeFitCanvasSize(1280, 720)).toEqual({ width: 640, height: 360 });
  });

  it('caps the longest side of a portrait image to maxSide, preserving aspect ratio', () => {
    expect(computeFitCanvasSize(720, 1280)).toEqual({ width: 360, height: 640 });
  });

  it('keeps a square image square at maxSide', () => {
    expect(computeFitCanvasSize(300, 300)).toEqual({ width: 640, height: 640 });
  });

  it('falls back to a maxSide square when dimensions are missing', () => {
    expect(computeFitCanvasSize(0, 0)).toEqual({ width: 640, height: 640 });
  });

  it('respects a custom maxSide', () => {
    expect(computeFitCanvasSize(1280, 720, 320)).toEqual({ width: 320, height: 180 });
  });
});
