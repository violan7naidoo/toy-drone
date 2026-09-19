import { BOARD_SIZE, SHOW_COORDINATES } from '../config.js';
import { flipY } from './coords.js';

export function createBoard(container) {
  const cells = document.createDocumentFragment();

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const x = col;
      const y = flipY(row);

      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;

      if (SHOW_COORDINATES) {
        cell.textContent = `${x},${y}`;
      }

      cells.append(cell);
    }
  }

  container.replaceChildren(cells);
}
