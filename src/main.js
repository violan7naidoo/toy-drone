import './styles/main.css';
import { BOARD_SIZE, DEFAULT_VIEW, SHOT_MS, SHOW_COORDINATES } from './config.js';
import { createCommandQueue } from './commandQueue.js';
import { parseScript } from './logic/parser.js';
import { createSimulator } from './logic/simulator.js';
import { createBoard } from './view/boardView.js';
import { createDroneView } from './view/droneView.js';
import { createEffectsView } from './view/effectsView.js';
import { createHudView } from './view/hudView.js';
import { createSoundView } from './view/soundView.js';
import { bindConsole } from './input/console.js';
import { bindKeyboard } from './input/keyboard.js';
import { bindPlacement } from './input/placement.js';
import { bindToggle } from './input/preferences.js';
import { bindTouchControls } from './input/touchControls.js';

const $ = (selector) => document.querySelector(selector);

$('#board-frame').style.setProperty('--size', BOARD_SIZE);
$('#board-frame').style.setProperty('--shot-time', `${SHOT_MS}ms`);
createBoard($('#board'));

const simulator = createSimulator();
const droneView = createDroneView($('#board-layer'));
const effectsView = createEffectsView($('#board-layer'));
const hudView = createHudView({ status: $('#status'), pad: $('#pad') });
const soundView = createSoundView();

const queue = createCommandQueue(async (command) => {
  const result = simulator.execute(command);
  if (import.meta.env.DEV) console.log(command.type, result);

  await Promise.all([
    droneView.render(result),
    effectsView.render(result),
    hudView.render(result, simulator.getState()),
    soundView.render(result),
  ]);

  return result;
});

function dispatch(command) {
  return queue.push(command);
}

bindTouchControls($('#pad'), dispatch);
bindKeyboard(window, dispatch);
bindPlacement(
  {
    board: $('#board'),
    pad: $('#pad'),
    picker: $('#facing-picker'),
    targetLabel: $('#facing-target'),
  },
  dispatch,
);
bindConsole(
  {
    form: $('#console'),
    input: $('#console-input'),
    output: $('#console-output'),
    toggle: $('#console-toggle'),
    panel: $('#controls'),
  },
  dispatch,
);

bindToggle({
  button: $('#view-toggle'),
  target: $('#board-area'),
  attribute: 'view',
  key: 'view',
  states: ['3d', 'top'],
  initial: DEFAULT_VIEW,
});
bindToggle({
  button: $('#sound-toggle'),
  target: document.documentElement,
  attribute: 'sound',
  key: 'sound',
  states: ['on', 'off'],
  initial: 'on',
  onChange: (state) => soundView.setMuted(state === 'off'),
});
bindToggle({
  button: $('#coords-toggle'),
  target: $('#board-frame'),
  attribute: 'coords',
  key: 'coords',
  states: ['on', 'off'],
  initial: SHOW_COORDINATES ? 'on' : 'off',
});

if (import.meta.env.DEV) {
  window.dispatch = dispatch;
  window.run = (text) =>
    Promise.all(
      parseScript(text)
        .filter((entry) => entry.command !== null)
        .map((entry) => dispatch(entry.command)),
    );
}
