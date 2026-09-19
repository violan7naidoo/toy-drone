import { FACINGS, STEPS } from '../config.js';
import { isOnSurface } from './surface.js';

export function createSimulator() {
  let state = { placed: false, x: 0, y: 0, facing: 'NORTH' };

  function ignored(commandType, reason) {
    return { type: 'IGNORED', command: commandType, reason };
  }

  function place({ x, y, facing }) {
    if (!isOnSurface(x, y)) return ignored('PLACE', 'OFF_SURFACE');
    if (!FACINGS.includes(facing)) return ignored('PLACE', 'BAD_FACING');

    state = { placed: true, x, y, facing };
    return { type: 'PLACED', x, y, facing };
  }

  function report() {
    const { x, y, facing } = state;
    return { type: 'REPORTED', x, y, facing };
  }
  function move() {
    const { x, y, facing } = state;
    const step = STEPS[facing];
    const to = { x: x + step.x, y: y + step.y };

    if (!isOnSurface(to.x, to.y)) return { type: 'BLOCKED', x, y, facing };

    state = { ...state, x: to.x, y: to.y };
    return { type: 'MOVED', from: { x, y }, to, facing };
  }

    function turn(direction) {
    const offset = direction === 'RIGHT' ? 1 : FACINGS.length - 1;
    const index = (FACINGS.indexOf(state.facing) + offset) % FACINGS.length;
    state = { ...state, facing: FACINGS[index] };
    const { x, y, facing } = state;
    return { type: 'TURNED', direction, x, y, facing };
  }


  function execute(command) {
    const type = command?.type;

    if (type === 'PLACE') return place(command);
    if (!state.placed) return ignored(type, 'NOT_PLACED');

    switch (type) {
      case 'MOVE':
        return move();
      case 'LEFT':
      case 'RIGHT':
        return turn(type);  
      case 'REPORT':
        return report();
      default:
        return ignored(type, 'UNKNOWN_COMMAND');
    }
  }

  function getState() {
    return { ...state };
  }

  return { execute, getState };
}
