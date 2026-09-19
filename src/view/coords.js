import { BOARD_SIZE } from '../config.js';

export function flipY(value) {
  return BOARD_SIZE - 1 - value;
}
