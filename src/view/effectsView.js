import { flipY } from './coords.js';
import { play, transitionEnd } from './motion.js';

const EMBER_MS = 3000;

export function createEffectsView(layer) {
  function setCell(element, { x, y }) {
    element.style.setProperty('--col', x);
    element.style.setProperty('--row', flipY(y));
  }

  function spawn(className, cell) {
    const element = document.createElement('div');
    element.className = `piece ${className}`;
    setCell(element, cell);
    layer.append(element);
    return element;
  }

  async function attack({ from, target }) {
    const shot = spawn('shot', from);

    // Reading a layout value applies the start cell first, so the move to the target is animated.
    void shot.offsetWidth;
    setCell(shot, target);
    await transitionEnd(shot, 'translate');
    shot.remove();

    const ember = spawn('ember', target);
    ember.style.setProperty('--ember-time', `${EMBER_MS}ms`);
    setTimeout(() => ember.remove(), EMBER_MS);

    const blast = spawn('blast', target);
    await play(
      blast,
      [
        { scale: 0.2, opacity: 1 },
        { scale: 1.9, opacity: 0 },
      ],
      { duration: 420, easing: 'ease-out' },
    );
    blast.remove();
  }

  function render(result) {
    if (result.type === 'ATTACKED') return attack(result);

    return Promise.resolve();
  }

  return { render };
}
