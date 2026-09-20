import { parseScript } from '../logic/parser.js';

function describe(entries, unknown) {
  if (unknown.length > 0) {
    const lines = unknown.map((entry) => `line ${entry.line} "${entry.text}"`);
    return `Not understood: ${lines.join(', ')}`;
  }

  return `Ran ${entries.length} command${entries.length === 1 ? '' : 's'}`;
}

export function bindConsole({ form, input, output, toggle, panel }, dispatch) {
  function run() {
    const entries = parseScript(input.value);
    if (entries.length === 0) return;

    const unknown = entries.filter((entry) => entry.command === null);

    entries
      .filter((entry) => entry.command !== null)
      .forEach((entry) => dispatch(entry.command));

    output.textContent = describe(entries, unknown);
    input.value = '';
  }

  function setOpen(open) {
    panel.dataset.console = open ? 'open' : 'closed';
    toggle.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    run();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }

    if (event.key === 'Escape') setOpen(false);
  });

  toggle.addEventListener('click', () => {
    setOpen(panel.dataset.console !== 'open');
  });
}
