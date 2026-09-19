import './styles/main.css';
import { BOARD_SIZE } from './config.js';
import { parseScript } from './logic/parser.js';
import { createSimulator } from './logic/simulator.js';
import { createBoard } from './view/boardView.js';
import { createDroneView } from './view/droneView.js';

const frame = document.querySelector('#board-frame');
frame.style.setProperty('--size', BOARD_SIZE);

createBoard(document.querySelector('#board'));

const simulator = createSimulator();
const droneView = createDroneView(document.querySelector('#board-layer'));

function dispatch(command) {
  const result = simulator.execute(command);
  droneView.render(result);
  return result;
}

if (import.meta.env.DEV) {
  window.dispatch = dispatch;
  window.run = (text) =>
    parseScript(text)
      .filter((entry) => entry.command !== null)
      .map((entry) => dispatch(entry.command));
}
