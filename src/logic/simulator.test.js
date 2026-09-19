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
    describe('MOVE', () => {
    it.each([
      ['NORTH', { x: 5, y: 6 }],
      ['EAST', { x: 6, y: 5 }],
      ['SOUTH', { x: 5, y: 4 }],
      ['WEST', { x: 4, y: 5 }],
    ])('moves one cell when facing %s', (facing, to) => {
      sim.execute({ type: 'PLACE', x: 5, y: 5, facing });

      expect(sim.execute({ type: 'MOVE' })).toEqual({
        type: 'MOVED',
        from: { x: 5, y: 5 },
        to,
        facing,
      });
      expect(sim.getState()).toEqual({ placed: true, ...to, facing });
    });

    it.each([
      ['NORTH', 5, 9],
      ['EAST', 9, 5],
      ['SOUTH', 5, 0],
      ['WEST', 0, 5],
    ])('is blocked at the %s edge', (facing, x, y) => {
      sim.execute({ type: 'PLACE', x, y, facing });

      expect(sim.execute({ type: 'MOVE' })).toEqual({ type: 'BLOCKED', x, y, facing });
      expect(sim.getState()).toEqual({ placed: true, x, y, facing });
    });

    it('still accepts a valid move after a blocked one', () => {
      sim.execute({ type: 'PLACE', x: 0, y: 0, facing: 'SOUTH' });
      expect(sim.execute({ type: 'MOVE' }).type).toBe('BLOCKED');

      sim.execute({ type: 'PLACE', x: 0, y: 0, facing: 'NORTH' });
      expect(sim.execute({ type: 'MOVE' }).type).toBe('MOVED');
      expect(sim.getState()).toEqual({ placed: true, x: 0, y: 1, facing: 'NORTH' });
    });
  });
  describe('LEFT and RIGHT', () => {
    it.each([
      ['NORTH', 'EAST'],
      ['EAST', 'SOUTH'],
      ['SOUTH', 'WEST'],
      ['WEST', 'NORTH'],
    ])('RIGHT turns %s to %s', (from, to) => {
      sim.execute({ type: 'PLACE', x: 2, y: 2, facing: from });

      expect(sim.execute({ type: 'RIGHT' })).toEqual({
        type: 'TURNED',
        direction: 'RIGHT',
        x: 2,
        y: 2,
        facing: to,
      });
    });

    it.each([
      ['NORTH', 'WEST'],
      ['WEST', 'SOUTH'],
      ['SOUTH', 'EAST'],
      ['EAST', 'NORTH'],
    ])('LEFT turns %s to %s', (from, to) => {
      sim.execute({ type: 'PLACE', x: 2, y: 2, facing: from });

      expect(sim.execute({ type: 'LEFT' })).toEqual({
        type: 'TURNED',
        direction: 'LEFT',
        x: 2,
        y: 2,
        facing: to,
      });
    });

    it.each(['LEFT', 'RIGHT'])('four %s turns come back to the start', (type) => {
      sim.execute({ type: 'PLACE', x: 2, y: 2, facing: 'EAST' });

      for (let i = 0; i < 4; i += 1) {
        sim.execute({ type });
      }

      expect(sim.getState()).toEqual({ placed: true, x: 2, y: 2, facing: 'EAST' });
    });
  });

});
