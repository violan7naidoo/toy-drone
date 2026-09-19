import { FACINGS } from '../config.js';
import { flipY } from './coords.js';

const DRONE_SVG = `
<svg viewBox="0 0 100 100" aria-hidden="true">
  <g class="drone-arms">
    <line x1="28" y1="28" x2="72" y2="72" />
    <line x1="72" y1="28" x2="28" y2="72" />
  </g>
  <g class="drone-rotors">
    <circle cx="26" cy="26" r="14" />
    <circle cx="74" cy="26" r="14" />
    <circle cx="26" cy="74" r="14" />
    <circle cx="74" cy="74" r="14" />
  </g>
  <rect class="drone-body" x="37" y="36" width="26" height="32" rx="9" />
  <path class="drone-nose" d="M50 10 L62 36 H38 Z" />
</svg>`;

export function createDroneView(layer) {
  const drone = document.createElement('div');
  drone.className = 'piece drone';
  drone.hidden = true;
  drone.innerHTML = DRONE_SVG;
  layer.append(drone);

  function moveTo({ x, y }) {
    drone.style.setProperty('--col', x);
    drone.style.setProperty('--row', flipY(y));
  }

  function place(result) {
    drone.classList.add('is-placing');
    drone.style.setProperty('--angle', FACINGS.indexOf(result.facing) * 90);
    moveTo(result);
    drone.hidden = false;

    // Reading a layout value makes the browser apply the jump now, so the transition cannot animate it.
    void drone.offsetWidth;
    drone.classList.remove('is-placing');
  }

  function render(result) {
    switch (result.type) {
      case 'PLACED':
        place(result);
        break;
      case 'MOVED':
        moveTo(result.to);
        break;
      default:
        break;
    }
  }

  return { render };
}
