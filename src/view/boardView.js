import { BOARD_SIZE } from '../config.js';

export function createBoard(container) {
  container.style.setProperty('--size', BOARD_SIZE);

  const cells = document.createDocumentFragment();

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = col;
      cell.dataset.y = BOARD_SIZE - 1 - row;
      cells.append(cell);
    }
  }

  container.replaceChildren(cells);
}
