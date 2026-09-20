import { FACINGS } from '../config.js';
import { flipY } from './coords.js';
import { play, transitionEnd } from './motion.js';

const ROTOR_CENTRES = [
  [26, 26],
  [74, 26],
  [74, 74],
  [26, 74],
];

function rotor([cx, cy]) {
  return `
    <g class="rotor">
      <circle class="rotor-ring" cx="${cx}" cy="${cy}" r="14" />
      <g class="rotor-blades">
        <ellipse cx="${cx}" cy="${cy}" rx="12" ry="2.4" />
        <ellipse cx="${cx}" cy="${cy}" rx="2.4" ry="12" />
      </g>
    </g>`;
}

const DRONE_SVG = `
<svg viewBox="0 0 100 100" aria-hidden="true">
  <g class="drone-arms">
    <line x1="28" y1="28" x2="72" y2="72" />
    <line x1="72" y1="28" x2="28" y2="72" />
  </g>
  ${ROTOR_CENTRES.map(rotor).join('')}
  <rect class="drone-hull" x="37" y="36" width="26" height="32" rx="9" />
  <path class="drone-nose" d="M50 10 L62 36 H38 Z" />
</svg>`;

const LANDING = { duration: 460, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' };

export function createDroneView(layer) {
  const drone = document.createElement('div');
  drone.className = 'piece drone';
  drone.hidden = true;
  drone.innerHTML = `
    <div class="drone-beacon"></div>
    <div class="drone-craft"><div class="drone-tilt">${DRONE_SVG}</div></div>`;
  layer.append(drone);

  const beacon = drone.querySelector('.drone-beacon');
  const craft = drone.querySelector('.drone-craft');

  let angle = 0;

  function setAngle(value) {
    angle = value;
    drone.style.setProperty('--angle', angle);
  }

  function setLean(lean, bank) {
    drone.style.setProperty('--lean', lean);
    drone.style.setProperty('--bank', bank);
  }

  function moveTo({ x, y }) {
    drone.style.setProperty('--col', x);
    drone.style.setProperty('--row', flipY(y));
  }

  function place(result) {
    drone.classList.add('is-placing');
    setAngle(FACINGS.indexOf(result.facing) * 90);
    setLean(0, 0);
    moveTo(result);
    drone.hidden = false;

    // Reading a layout value makes the browser apply the jump now, so the transition cannot animate it.
    void drone.offsetWidth;
    drone.classList.remove('is-placing');

    return Promise.all([
      play(
        craft,
        [
          { transform: 'translateZ(calc(var(--hover) * 5)) scale(1.3)', opacity: 0 },
          { transform: 'translateZ(var(--hover)) scale(1)', opacity: 1 },
        ],
        LANDING,
      ),
      play(
        beacon,
        [
          { scale: 2.4, opacity: 0 },
          { scale: 1, opacity: 0.95 },
        ],
        LANDING,
      ),
    ]);
  }

  async function glide(to) {
    setLean(1, 0);
    moveTo(to);
    await transitionEnd(drone, 'translate');
    setLean(0, 0);
  }

  async function turn(direction) {
    const sign = direction === 'RIGHT' ? 1 : -1;

    setLean(0, sign);
    setAngle(angle + sign * 90);
    await transitionEnd(drone, 'rotate');
    setLean(0, 0);
  }

  function render(result) {
    switch (result.type) {
      case 'PLACED':
        return place(result);
      case 'MOVED':
        return glide(result.to);
      case 'TURNED':
        return turn(result.direction);
      default:
        return Promise.resolve();
    }
  }

  return { render };
}
