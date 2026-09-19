const KEY_COMMANDS = {
  ArrowUp: 'MOVE',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  ' ': 'ATTACK',
  r: 'REPORT',
  R: 'REPORT',
};

function isTyping(element) {
  return element.closest('input, textarea, [contenteditable]') !== null;
}

function isButton(element) {
  return element.closest('button') !== null;
}

export function bindKeyboard(target, dispatch) {
  target.addEventListener('keydown', (event) => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;
    if (isTyping(event.target)) return;

    const type = KEY_COMMANDS[event.key];
    if (!type) return;
    if (event.key === ' ' && isButton(event.target)) return;

    event.preventDefault();
    dispatch({ type });
  });
}
