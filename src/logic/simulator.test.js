import { describe, it, expect, beforeEach } from 'vitest';
import { createSimulator } from './simulator.js';

describe('simulator', () => {
  let sim;

  beforeEach(() => {
    sim = createSimulator();
  });

  describe('PLACE', () => {
    it('places the drone on a valid position', () => {
      const result = sim.execute({ type: 'PLACE', x: 1, y: 2, facing: 'EAST' });

      expect(result).toEqual({ type: 'PLACED', x: 1, y: 2, facing: 'EAST' });
      expect(sim.getState()).toEqual({ placed: true, x: 1, y: 2, facing: 'EAST' });
    });

    it('ignores a position off the surface', () => {
      const result = sim.execute({ type: 'PLACE', x: 10, y: 0, facing: 'NORTH' });

      expect(result).toEqual({ type: 'IGNORED', command: 'PLACE', reason: 'OFF_SURFACE' });
      expect(sim.getState().placed).toBe(false);
    });

    it('ignores a facing that does not exist', () => {
      const result = sim.execute({ type: 'PLACE', x: 0, y: 0, facing: 'UP' });

      expect(result).toEqual({ type: 'IGNORED', command: 'PLACE', reason: 'BAD_FACING' });
      expect(sim.getState().placed).toBe(false);
    });

    it('can be repeated to put the drone somewhere else', () => {
      sim.execute({ type: 'PLACE', x: 1, y: 1, facing: 'NORTH' });
      sim.execute({ type: 'PLACE', x: 6, y: 4, facing: 'WEST' });

      expect(sim.getState()).toEqual({ placed: true, x: 6, y: 4, facing: 'WEST' });
    });

    it('keeps the drone where it is when a later PLACE is invalid', () => {
      sim.execute({ type: 'PLACE', x: 1, y: 1, facing: 'NORTH' });
      sim.execute({ type: 'PLACE', x: 12, y: 4, facing: 'WEST' });

      expect(sim.getState()).toEqual({ placed: true, x: 1, y: 1, facing: 'NORTH' });
    });
  });

  describe('before the first valid PLACE', () => {
    it('discards every other command', () => {
      for (const type of ['MOVE', 'LEFT', 'RIGHT', 'REPORT', 'ATTACK']) {
        expect(sim.execute({ type })).toEqual({
          type: 'IGNORED',
          command: type,
          reason: 'NOT_PLACED',
        });
      }

      expect(sim.getState().placed).toBe(false);
    });
  });

  describe('REPORT', () => {
    it('announces the position and facing', () => {
      sim.execute({ type: 'PLACE', x: 3, y: 3, facing: 'SOUTH' });

      expect(sim.execute({ type: 'REPORT' })).toEqual({
        type: 'REPORTED',
        x: 3,
        y: 3,
        facing: 'SOUTH',
      });
    });
  });
});
