import './styles/main.css';
import { BOARD_SIZE } from './config.js';
import { parseScript } from './logic/parser.js';
import { createSimulator } from './logic/simulator.js';
import { createBoard } from './view/boardView.js';
import { createDroneView } from './view/droneView.js';
import { createCommandQueue } from './commandQueue.js';

const frame = document.querySelector('#board-frame');
frame.style.setProperty('--size', BOARD_SIZE);

createBoard(document.querySelector('#board'));

const simulator = createSimulator();
const droneView = createDroneView(document.querySelector('#board-layer'));

const queue = createCommandQueue(async (command) => {
  const result = simulator.execute(command);
  await droneView.render(result);
  return result;
});

function dispatch(command) {
  return queue.push(command);
}

if (import.meta.env.DEV) {
  window.dispatch = dispatch;
  window.run = (text) =>
    Promise.all(
      parseScript(text)
        .filter((entry) => entry.command !== null)
        .map((entry) => dispatch(entry.command)),
    );
}
