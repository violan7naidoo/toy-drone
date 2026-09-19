import './styles/main.css';
import { BOARD_SIZE } from './config.js';
import { createBoard } from './view/boardView.js';

const frame = document.querySelector('#board-frame');
frame.style.setProperty('--size', BOARD_SIZE);

createBoard(document.querySelector('#board'));
