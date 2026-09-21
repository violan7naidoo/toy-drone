export function bindInfoPanel({ button, dialog }) {
  button.addEventListener('click', () => {
    dialog.showModal();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}
