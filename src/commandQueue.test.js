import { describe, it, expect, vi } from 'vitest';
import { createCommandQueue } from './commandQueue.js';

describe('command queue', () => {
  it('runs commands in order, one at a time', async () => {
    const log = [];
    const queue = createCommandQueue(async (command) => {
      log.push(`start ${command}`);
      await Promise.resolve();
      log.push(`end ${command}`);
      return command.toUpperCase();
    });

    const results = await Promise.all([queue.push('a'), queue.push('b'), queue.push('c')]);

    expect(log).toEqual(['start a', 'end a', 'start b', 'end b', 'start c', 'end c']);
    expect(results).toEqual(['A', 'B', 'C']);
  });

  it('carries on after a command fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const queue = createCommandQueue(async (command) => {
      if (command === 'bad') throw new Error('boom');
      return command;
    });

    const results = await Promise.all([queue.push('bad'), queue.push('good')]);

    expect(results).toEqual([null, 'good']);
  });
});
