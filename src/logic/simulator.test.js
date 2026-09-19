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
  describe('ATTACK', () => {
    it('hits the cell two ahead and leaves the drone where it is', () => {
      sim.execute({ type: 'PLACE', x: 3, y: 3, facing: 'NORTH' });

      expect(sim.execute({ type: 'ATTACK' })).toEqual({
        type: 'ATTACKED',
        from: { x: 3, y: 3 },
        target: { x: 3, y: 5 },
        facing: 'NORTH',
      });
      expect(sim.getState()).toEqual({ placed: true, x: 3, y: 3, facing: 'NORTH' });
    });

    it.each([
      ['NORTH', 5, 7, { x: 5, y: 9 }],
      ['EAST', 7, 5, { x: 9, y: 5 }],
      ['SOUTH', 5, 2, { x: 5, y: 0 }],
      ['WEST', 2, 5, { x: 0, y: 5 }],
    ])('can reach the last cell when facing %s', (facing, x, y, target) => {
      sim.execute({ type: 'PLACE', x, y, facing });

      expect(sim.execute({ type: 'ATTACK' })).toMatchObject({ type: 'ATTACKED', target });
    });

    it.each([
      ['NORTH', 5, 8],
      ['NORTH', 5, 9],
      ['EAST', 8, 5],
      ['EAST', 9, 5],
      ['SOUTH', 5, 1],
      ['SOUTH', 5, 0],
      ['WEST', 1, 5],
      ['WEST', 0, 5],
    ])('is ignored facing %s from %i,%i', (facing, x, y) => {
      sim.execute({ type: 'PLACE', x, y, facing });

      expect(sim.execute({ type: 'ATTACK' })).toEqual({
        type: 'IGNORED',
        command: 'ATTACK',
        reason: 'OUT_OF_RANGE',
      });
      expect(sim.getState()).toEqual({ placed: true, x, y, facing });
    });
  });
  describe('the test sheet', () => {
    const MOVE = { type: 'MOVE' };
    const LEFT = { type: 'LEFT' };
    const RIGHT = { type: 'RIGHT' };
    const REPORT = { type: 'REPORT' };
    const ATTACK = { type: 'ATTACK' };

    function place(x, y, facing) {
      return { type: 'PLACE', x, y, facing };
    }

    function run(commands) {
      return commands.map((command) => sim.execute(command));
    }

    function lastReport(results) {
      return results.filter((result) => result.type === 'REPORTED').at(-1);
    }

    it.each([
      // The brief prints 0,0,SOUTH here, but by its own rules MOVE takes the drone to 0,1.
      ['brief example a', [place(0, 0, 'NORTH'), MOVE, LEFT, LEFT, ATTACK, REPORT], '0,1,SOUTH'],
      ['brief example b', [place(0, 0, 'NORTH'), LEFT, REPORT], '0,0,WEST'],
      ['brief example c', [place(1, 2, 'EAST'), MOVE, MOVE, LEFT, MOVE, ATTACK, REPORT], '3,3,NORTH'],
      ['blocked in the north-east corner', [place(9, 9, 'NORTH'), MOVE, REPORT], '9,9,NORTH'],
      ['a valid move after a blocked one', [place(9, 9, 'NORTH'), MOVE, RIGHT, RIGHT, MOVE, REPORT], '9,8,SOUTH'],
      ['blocked twice in the south-west corner', [place(0, 0, 'SOUTH'), MOVE, RIGHT, MOVE, REPORT], '0,0,WEST'],
      ['an attack does not move the drone', [place(5, 7, 'NORTH'), ATTACK, REPORT], '5,7,NORTH'],
      ['four right turns', [place(2, 2, 'EAST'), RIGHT, RIGHT, RIGHT, RIGHT, REPORT], '2,2,EAST'],
      ['a second PLACE moves the drone', [place(1, 1, 'NORTH'), place(6, 4, 'WEST'), REPORT], '6,4,WEST'],
      ['a bad PLACE after a good one', [place(1, 1, 'NORTH'), place(12, 4, 'WEST'), REPORT], '1,1,NORTH'],
    ])('%s reports the right position', (name, commands, expected) => {
      const report = lastReport(run(commands));

      expect(`${report.x},${report.y},${report.facing}`).toBe(expected);
    });

    it.each([
      ['commands before any PLACE', [MOVE, LEFT, REPORT]],
      ['a PLACE off the surface', [place(10, 0, 'NORTH'), REPORT]],
      ['a PLACE with a bad facing', [place(0, 0, 'UP'), REPORT]],
    ])('%s are all ignored', (name, commands) => {
      const results = run(commands);

      expect(results.every((result) => result.type === 'IGNORED')).toBe(true);
      expect(sim.getState().placed).toBe(false);
    });

    it('brief example a ignores the attack at the edge', () => {
      const results = run([place(0, 0, 'NORTH'), MOVE, LEFT, LEFT, ATTACK]);

      expect(results.at(-1)).toEqual({
        type: 'IGNORED',
        command: 'ATTACK',
        reason: 'OUT_OF_RANGE',
      });
    });

    it('brief example c explodes on 3,5', () => {
      const results = run([place(1, 2, 'EAST'), MOVE, MOVE, LEFT, MOVE, ATTACK]);

      expect(results.at(-1).target).toEqual({ x: 3, y: 5 });
    });
  });

});
