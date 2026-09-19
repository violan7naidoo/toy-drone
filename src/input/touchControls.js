export function bindTouchControls(root, dispatch) {
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-command]');
    if (!button || button.disabled) return;

    dispatch({ type: button.dataset.command });
  });
}
