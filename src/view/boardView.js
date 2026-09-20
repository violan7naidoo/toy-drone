import { BOARD_SIZE } from '../config.js';
import { flipY } from './coords.js';

export function createBoard(container) {
  const cells = document.createDocumentFragment();

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const x = col;
      const y = flipY(row);

      const label = document.createElement('span');
      label.className = 'cell-label';
      label.textContent = `${x},${y}`;

      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.append(label);

      cells.append(cell);
    }
  }

  container.replaceChildren(cells);
}
