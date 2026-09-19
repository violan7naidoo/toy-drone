import { describe, it, expect } from 'vitest';
import { isOnSurface } from './surface.js';

describe('isOnSurface', () => {
  it('accepts the four corners', () => {
    expect(isOnSurface(0, 0)).toBe(true);
    expect(isOnSurface(9, 0)).toBe(true);
    expect(isOnSurface(0, 9)).toBe(true);
    expect(isOnSurface(9, 9)).toBe(true);
  });

  it('rejects positions just outside each edge', () => {
    expect(isOnSurface(-1, 0)).toBe(false);
    expect(isOnSurface(10, 0)).toBe(false);
    expect(isOnSurface(0, -1)).toBe(false);
    expect(isOnSurface(0, 10)).toBe(false);
  });

  it('rejects values that are not whole numbers', () => {
    expect(isOnSurface(1.5, 2)).toBe(false);
    expect(isOnSurface('1', 2)).toBe(false);
    expect(isOnSurface(undefined, 2)).toBe(false);
  });
});
