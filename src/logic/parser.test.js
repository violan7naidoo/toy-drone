import { describe, it, expect } from 'vitest';
import { parseCommand, parseScript } from './parser.js';
import { createSimulator } from './simulator.js';

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

describe('parseScript', () => {
  it('parses one command per line and keeps the line numbers', () => {
    expect(parseScript('PLACE 0,0,NORTH\nMOVE\nREPORT')).toEqual([
      {
        line: 1,
        text: 'PLACE 0,0,NORTH',
        command: { type: 'PLACE', x: 0, y: 0, facing: 'NORTH' },
      },
      { line: 2, text: 'MOVE', command: { type: 'MOVE' } },
      { line: 3, text: 'REPORT', command: { type: 'REPORT' } },
    ]);
  });

  it('skips blank lines but keeps the original numbering', () => {
    const entries = parseScript('MOVE\n\n   \nLEFT');

    expect(entries.map((entry) => entry.line)).toEqual([1, 4]);
  });

  it('handles Windows line endings', () => {
    const entries = parseScript('MOVE\r\nLEFT\r\n');

    expect(entries.map((entry) => entry.command)).toEqual([{ type: 'MOVE' }, { type: 'LEFT' }]);
  });

  it('marks a line it does not understand instead of failing', () => {
    const entries = parseScript('MOVE\nFLY AWAY\nLEFT');

    expect(entries).toHaveLength(3);
    expect(entries[1]).toEqual({ line: 2, text: 'FLY AWAY', command: null });
  });

  it('returns an empty list for empty or non-text input', () => {
    expect(parseScript('')).toEqual([]);
    expect(parseScript(undefined)).toEqual([]);
  });
});

describe('the brief examples as pasted text', () => {
  function report(script) {
    const sim = createSimulator();
    const results = parseScript(script)
      .filter((entry) => entry.command !== null)
      .map((entry) => sim.execute(entry.command));
    const last = results.filter((result) => result.type === 'REPORTED').at(-1);

    return `${last.x},${last.y},${last.facing}`;
  }

  it.each([
    ['a', 'PLACE 0,0,NORTH\nMOVE\nLEFT\nLEFT\nATTACK\nREPORT', '0,1,SOUTH'],
    ['b', 'PLACE 0,0,NORTH\nLEFT\nREPORT', '0,0,WEST'],
    ['c', 'PLACE 1,2,EAST\nMOVE\nMOVE\nLEFT\nMOVE\nATTACK\nREPORT', '3,3,NORTH'],
  ])('example %s', (name, script, expected) => {
    expect(report(script)).toBe(expected);
  });
});
