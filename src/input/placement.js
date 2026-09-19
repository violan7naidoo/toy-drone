export function bindPlacement({ board, pad, picker, targetLabel }, dispatch) {
  let selected = null;

  function clear() {
    if (selected) selected.classList.remove('is-selected');
    selected = null;
    picker.hidden = true;
    pad.hidden = false;
  }

  function select(cell) {
    clear();
    selected = cell;
    cell.classList.add('is-selected');
    targetLabel.textContent = `${cell.dataset.x},${cell.dataset.y}`;
    pad.hidden = true;
    picker.hidden = false;
  }

  board.addEventListener('click', (event) => {
    const cell = event.target.closest('.cell');
    if (!cell) return;

    if (cell === selected) {
      clear();
    } else {
      select(cell);
    }
  });

  picker.addEventListener('click', (event) => {
    if (event.target.closest('[data-cancel]')) {
      clear();
      return;
    }

    const button = event.target.closest('[data-facing]');
    if (!button || !selected) return;

    dispatch({
      type: 'PLACE',
      x: Number(selected.dataset.x),
      y: Number(selected.dataset.y),
      facing: button.dataset.facing,
    });
    clear();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') clear();
  });
}
