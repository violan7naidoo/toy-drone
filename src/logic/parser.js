const SIMPLE_COMMANDS = ['MOVE', 'LEFT', 'RIGHT', 'REPORT', 'ATTACK'];

const PLACE_PATTERN = /^PLACE\s+(-?\d+)\s*,\s*(-?\d+)\s*,\s*([A-Z]+)$/;

export function parseCommand(text) {
  if (typeof text !== 'string') return null;

  const line = text.trim().toUpperCase();

  if (SIMPLE_COMMANDS.includes(line)) return { type: line };

  const match = PLACE_PATTERN.exec(line);
  if (!match) return null;

  const [, x, y, facing] = match;
  return { type: 'PLACE', x: Number(x), y: Number(y), facing };
}
