const SAFETY_MS = 1000;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function transitionEnd(element, property) {
  if (reducedMotion.matches) return Promise.resolve();

  return new Promise((resolve) => {
    function done(event) {
      if (event && (event.target !== element || event.propertyName !== property)) return;

      clearTimeout(timer);
      element.removeEventListener('transitionend', done);
      resolve();
    }

    const timer = setTimeout(done, SAFETY_MS);
    element.addEventListener('transitionend', done);
  });
}

export function play(element, keyframes, options) {
  if (reducedMotion.matches) return Promise.resolve();

  return element.animate(keyframes, options).finished;
}

