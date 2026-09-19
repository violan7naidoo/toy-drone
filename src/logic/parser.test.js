import { describe, it, expect } from 'vitest';
import { parseCommand } from './parser.js';

describe('parseCommand', () => {
  it.each(['MOVE', 'LEFT', 'RIGHT', 'REPORT', 'ATTACK'])('understands %s', (word) => {
    expect(parseCommand(word)).toEqual({ type: word });
  });

  it('ignores case and surrounding spaces', () => {
    expect(parseCommand('  move ')).toEqual({ type: 'MOVE' });
    expect(parseCommand('Report')).toEqual({ type: 'REPORT' });
  });

  it('understands PLACE with a position and a facing', () => {
    expect(parseCommand('PLACE 1,2,EAST')).toEqual({
      type: 'PLACE',
      x: 1,
      y: 2,
      facing: 'EAST',
    });
  });

  it('is forgiving about spacing and case in PLACE', () => {
    expect(parseCommand('  place   3 , 4 ,  north ')).toEqual({
      type: 'PLACE',
      x: 3,
      y: 4,
      facing: 'NORTH',
    });
  });

  it('turns the numbers into real numbers, not text', () => {
    const command = parseCommand('PLACE 7,8,WEST');

    expect(command.x).toBe(7);
    expect(command.y).toBe(8);
  });

  it('lets the simulator judge values that have the right shape', () => {
    expect(parseCommand('PLACE -1,12,NORTH')).toEqual({
      type: 'PLACE',
      x: -1,
      y: 12,
      facing: 'NORTH',
    });
    expect(parseCommand('PLACE 0,0,UP')).toEqual({
      type: 'PLACE',
      x: 0,
      y: 0,
      facing: 'UP',
    });
  });

  it.each([
    '',
    '   ',
    'JUMP',
    'MOVE NOW',
    'PLACE',
    'PLACE 1,2',
    'PLACE 1,2,',
    'PLACE 1.5,2,NORTH',
    'PLACE a,b,NORTH',
    'PLACE1,2,NORTH',
    'PLACE 1,2,NORTH,EXTRA',
  ])('returns null for "%s"', (text) => {
    expect(parseCommand(text)).toBeNull();
  });

  it('returns null for things that are not text', () => {
    expect(parseCommand(undefined)).toBeNull();
    expect(parseCommand(null)).toBeNull();
    expect(parseCommand(42)).toBeNull();
  });
});
