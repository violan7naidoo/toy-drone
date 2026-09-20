const PREFIX = 'toy-drone:';

function read(key) {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    // Storage can be blocked (private mode, strict settings). The toggle still works for this visit.
  }
}

export function bindToggle({ button, target, attribute, key, states, initial, onChange }) {
  const saved = read(key);
  let state = states.includes(saved) ? saved : initial;

  function apply() {
    target.dataset[attribute] = state;
    button.setAttribute('aria-pressed', String(state === states[0]));
    if (onChange) onChange(state);
  }

  button.addEventListener('click', () => {
    state = states[(states.indexOf(state) + 1) % states.length];
    write(key, state);
    apply();
  });

  apply();
}
