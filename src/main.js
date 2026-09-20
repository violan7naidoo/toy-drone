import './styles/main.css';
import { BOARD_SIZE } from './config.js';
import { parseScript } from './logic/parser.js';
import { createSimulator } from './logic/simulator.js';
import { createBoard } from './view/boardView.js';
import { createDroneView } from './view/droneView.js';
import { createCommandQueue } from './commandQueue.js';
import { bindTouchControls } from './input/touchControls.js';
import { bindKeyboard } from './input/keyboard.js';
import { bindPlacement } from './input/placement.js';
import { bindConsole } from './input/console.js';
import { createHudView } from './view/hudView.js';
import { createEffectsView } from './view/effectsView.js';

const frame = document.querySelector('#board-frame');
frame.style.setProperty('--size', BOARD_SIZE);

createBoard(document.querySelector('#board'));

const simulator = createSimulator();
const droneView = createDroneView(document.querySelector('#board-layer'));
const effectsView = createEffectsView(document.querySelector('#board-layer'));
const hudView = createHudView({
  status: document.querySelector('#status'),
  pad: document.querySelector('#pad'),
});

const queue = createCommandQueue(async (command) => {
  const result = simulator.execute(command);
  if (import.meta.env.DEV) console.log(command.type, result);

  await Promise.all([
    droneView.render(result),
    effectsView.render(result),
    hudView.render(result, simulator.getState()),
  ]);


  return result;
});



function dispatch(command) {
  return queue.push(command);
}
bindTouchControls(document.querySelector('#pad'), dispatch);
bindKeyboard(window, dispatch);
bindPlacement(
  {
    board: document.querySelector('#board'),
    pad: document.querySelector('#pad'),
    picker: document.querySelector('#facing-picker'),
    targetLabel: document.querySelector('#facing-target'),
  },
  dispatch,
);

bindConsole(
  {
    form: document.querySelector('#console'),
    input: document.querySelector('#console-input'),
    output: document.querySelector('#console-output'),
  },
  dispatch,
);


if (import.meta.env.DEV) {
  window.dispatch = dispatch;
  window.run = (text) =>
    Promise.all(
      parseScript(text)
        .filter((entry) => entry.command !== null)
        .map((entry) => dispatch(entry.command)),
    );
}
