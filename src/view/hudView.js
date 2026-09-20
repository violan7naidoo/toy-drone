const PROMPT = 'Tap a cell to place your drone';
const READY = 'Drone ready';
const BLOCKED = 'Blocked: that is the edge of the surface';

const REASONS = {
  NOT_PLACED: 'Place the drone first: tap a cell',
  OFF_SURFACE: 'That position is off the surface',
  BAD_FACING: 'Facing must be NORTH, EAST, SOUTH or WEST',
  OUT_OF_RANGE: 'No room to attack: fewer than 2 cells ahead',
  UNKNOWN_COMMAND: 'Command not understood',
};

function describe(result, state) {
  switch (result.type) {
    case 'PLACED':
      return { text: READY, tone: 'info' };
    case 'REPORTED':
      return { text: `${result.x},${result.y},${result.facing}`, tone: 'report' };
    case 'BLOCKED':
      return { text: BLOCKED, tone: 'warn' };
    case 'IGNORED':
      return { text: REASONS[result.reason] ?? REASONS.UNKNOWN_COMMAND, tone: 'warn' };
    default:
      return { text: state.placed ? '' : PROMPT, tone: 'info' };
  }
}

export function createHudView({ status, pad }) {
  const buttons = pad.querySelectorAll('[data-command]');

  function setReady(placed) {
    buttons.forEach((button) => {
      button.disabled = !placed;
    });
  }

  function show({ text, tone }) {
    status.textContent = text;
    status.dataset.tone = tone;
  }

  function render(result, state) {
    setReady(state.placed);
    show(describe(result, state));

    return Promise.resolve();
  }

  setReady(false);
  show({ text: PROMPT, tone: 'info' });

  return { render };
}
