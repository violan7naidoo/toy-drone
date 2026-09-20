import { FACINGS } from '../config.js';
import { flipY } from './coords.js';
import { flare, play, transitionEnd } from './motion.js';

const SCORCH_MS = 8000;

export function createEffectsView(layer, frame) {
  function setCell(element, { x, y }) {
    element.style.setProperty('--col', x);
    element.style.setProperty('--row', flipY(y));
  }

  function spawn(className, cell, facing) {
    const element = document.createElement('div');
    element.className = `piece ${className}`;
    setCell(element, cell);
    if (facing) element.style.setProperty('--angle', FACINGS.indexOf(facing) * 90);
    layer.append(element);
    return element;
  }

  async function showThenRemove(element, animation) {
    await animation;
    element.remove();
  }

  function shakeFloor() {
    return play(
      frame,
      [
        { translate: '0 0' },
        { translate: '0.6% -0.4%' },
        { translate: '-0.5% 0.4%' },
        { translate: '0.3% 0.2%' },
        { translate: '0 0' },
      ],
      { duration: 180, easing: 'linear' },
    );
  }

  async function attack({ from, target, facing }) {
    const muzzle = spawn('muzzle', from, facing);
    showThenRemove(
      muzzle,
      play(
        muzzle,
        [
          { opacity: 1, scale: 0.7 },
          { opacity: 0, scale: 1.5 },
        ],
        { duration: 170, easing: 'ease-out' },
      ),
    );

    const shot = spawn('shot', from);

    // Reading a layout value applies the start cell first, so the move to the target is animated.
    void shot.offsetWidth;
    setCell(shot, target);
    await transitionEnd(shot, 'translate');
    shot.remove();

    const scorch = spawn('scorch', target);
    scorch.style.setProperty('--scorch-time', `${SCORCH_MS}ms`);
    setTimeout(() => scorch.remove(), SCORCH_MS);

    const blast = spawn('blast', target);
    const ring = spawn('ring', target);

    await Promise.all([
      showThenRemove(
        blast,
        flare(
          blast,
          [
            { scale: 0.2, opacity: 1 },
            { scale: 1.9, opacity: 0 },
          ],
          { duration: 420, easing: 'ease-out' },
        ),
      ),
      showThenRemove(
        ring,
        play(
          ring,
          [
            { scale: 0.3, opacity: 0.9 },
            { scale: 3.4, opacity: 0 },
          ],
          { duration: 560, easing: 'ease-out' },
        ),
      ),
      shakeFloor(),
    ]);
  }

  function render(result) {
    if (result.type === 'ATTACKED') return attack(result);

    return Promise.resolve();
  }

  return { render };
}
