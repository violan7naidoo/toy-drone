export function createCommandQueue(handler) {
  const pending = [];
  let running = false;

  async function drain() {
    running = true;

    while (pending.length > 0) {
      const { command, resolve } = pending.shift();

      try {
        resolve(await handler(command));
      } catch (error) {
        console.error(error);
        resolve(null);
      }
    }

    running = false;
  }

  function push(command) {
    return new Promise((resolve) => {
      pending.push({ command, resolve });
      if (!running) drain();
    });
  }

  return { push };
}
