const PROMPT = 'Tap a cell to place your drone';
const READY = 'Drone ready';

export function createHudView({ status, pad }) {
  const buttons = pad.querySelectorAll('[data-command]');

  function setReady(placed) {
    buttons.forEach((button) => {
      button.disabled = !placed;
    });
  }

  function render(result, state) {
    setReady(state.placed);

    if (!state.placed) {
      status.textContent = PROMPT;
    } else if (result.type === 'PLACED') {
      status.textContent = READY;
    } else if (result.type === 'REPORTED') {
      status.textContent = `${result.x},${result.y},${result.facing}`;
    }

    return Promise.resolve();
  }

  setReady(false);
  status.textContent = PROMPT;

  return { render };
}
