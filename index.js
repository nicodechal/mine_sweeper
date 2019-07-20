// useful contant
const PIXEL_SIZE = 70;
const PIXEL_GAP = 4;
const BOARD_H = 13, BOARD_W = 13;
const HARD_RATE = 0.8;
// TODO: change
const FONT_NAME = 'somybmp01_7';
const LOSS_BOOM = '💣';
const WIN_BOOM = '🙂';
const DEAD_BOOM = '☠️';
const USER_FLAG = '😎';
const WRONG_USER_FLAG = '😟';
const ALERT_W_RATE = 0.6;
const ALERT_H_RATE = 0.3;

const MINE_COLOR = '#f76262';
const REVEALED_COLOR = '#fff';
const UNREVEALED_COLOR = '#f0e3c4';
const ALERT_COLOR = '#daa592';
const PIXEL_TEXT_COLOR = '#666';
const DRAW_ALERT_DEFAULT_OPTIONS = { color: ALERT_COLOR, width: 6, height: 3, fontSize: 35 };
const DRAW_PIXEL_TEXT_DEFAULT_OPTIONS = { color: PIXEL_TEXT_COLOR, size: 16 };
const DRAW_BOX_DEFAULT_OPTIONS = { color: UNREVEALED_COLOR, width: 1, height: 1 };

// game state
const WIN = 0;
const LOSS = 1;
const RUNNING = 2;
let gameState = RUNNING;

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");;
const ratio = getPixelRatio(ctx);

const board = [];

// set canvas' width & height
canvas.width = BOARD_W * PIXEL_SIZE + (BOARD_W - 1) * PIXEL_GAP;
canvas.height = BOARD_H * PIXEL_SIZE + (BOARD_H - 1) * PIXEL_GAP;
canvas.style.width = (canvas.width / ratio) + 'px';
canvas.style.height = (canvas.height / ratio) + 'px';
canvas.oncontextmenu = () => false;

ctx.textBaseline = "middle";
ctx.textAlign = "center";

canvas.addEventListener('click', function (e) {
  if (gameState !== RUNNING) return false;
  const [i, j] = getBoardIndecis(e.offsetX, e.offsetY);
  updateBoard(board, [i, j]);
  drawBoard();
  updateGameState();
  if (gameState !== RUNNING) {
    const alertContent = gameState === WIN ? 'YOU WIN!!!' : "YOU FAILED!";
    drawResultBoard();
    drawBigRectWithText(alertContent);
    setTimeout(() => {
      clear();
      drawResultBoard();
    }, 1000)
  }
})

canvas.addEventListener('contextmenu', e => {
  if (gameState !== RUNNING) return false;
  const [i, j] = getBoardIndecis(e.offsetX, e.offsetY);
  const v = board[i][j];
  if (v === 'E') board[i][j] = 'A';
  if (v === 'M') board[i][j] = 'V';
  if (v === 'A') board[i][j] = 'E';
  if (v === 'V') board[i][j] = 'M';
  drawBoard();
  return false;
})

initBoard();
drawBoard();

function initBoard() {
  for (let i = 0; i < BOARD_W; i++) {
    board[i] = [];
    for (let j = 0; j < BOARD_H; j++) {
      board[i][j] = 'E';
      // TODO: change
      if (Math.random() > HARD_RATE) board[i][j] = 'M';
    }
  }
}

function drawBoard() {
  for (let i = 0; i < BOARD_W; i++) {
    for (let j = 0; j < BOARD_H; j++) {
      if (board[i][j] === 'E' || board[i][j] === 'M') {
        // Normally, mines are unrevealed
        drawPixel(i, j);
        // the code below is used to test, it will show the mines position.
        // if (board[i][j] === 'M') {
        //   drawPixelText('H', i, j);
        // }
      } else if (board[i][j] === 'X') {
        drawPixel(i, j, {color: MINE_COLOR});
        drawPixelText(LOSS_BOOM, i, j, {color: 'white'});
      } else if (board[i][j] === 'B') {
        drawPixel(i, j, {color: REVEALED_COLOR});
      } else if (board[i][j] === 'V' || board[i][j] === 'A') {
        drawPixel(i, j);
        drawPixelText(USER_FLAG, i, j);
      } else {
        drawPixel(i, j, {color: REVEALED_COLOR});
        drawPixelText(board[i][j], i, j);
      }
    }
  }
}

function updateGameState() {
  let res = WIN;
  for (let i = 0; i < BOARD_W; i++) {
    for (let j = 0; j < BOARD_H; j++) {
      if (board[i][j] === 'X') return gameState = LOSS;
      if (board[i][j] === 'E' || board[i][j] === 'A') res = RUNNING;
    }
  }
  return gameState = res;
}

function drawResultBoard() {
  const boom = gameState === WIN ? WIN_BOOM : LOSS_BOOM;
  for (let i = 0; i < BOARD_W; i++) {
    for (let j = 0; j < BOARD_H; j++) {
      if (board[i][j] === 'E') {
        drawPixel(i, j);
      } else if (board[i][j] === 'M') {
        // Show mines' position if the game ends.
        drawPixel(i, j, {color: MINE_COLOR});
        drawPixelText(boom, i, j);
      } else if (board[i][j] === 'X') {
        drawPixel(i, j, {color: MINE_COLOR});
        drawPixelText(DEAD_BOOM, i, j);
      } else if (board[i][j] === 'B') {
        drawPixel(i, j, {color: REVEALED_COLOR});
      } else if (board[i][j] === 'V') {
        drawPixel(i, j, {color: MINE_COLOR});
        drawPixelText(WIN_BOOM, i, j);
      } else if (board[i][j] === 'A') {
        drawPixel(i, j, {color: UNREVEALED_COLOR});
        drawPixelText(WRONG_USER_FLAG, i, j);
      } else {
        drawPixel(i, j, {color: REVEALED_COLOR});
        drawPixelText(board[i][j], i, j);
      }
    }
  }
}

function drawBigRectWithText(str, i, j, options = {}) {
  const {color, width, height, fontSize} = Object.assign(Object.create(DRAW_ALERT_DEFAULT_OPTIONS), options);
  i = i || (BOARD_W - width) / 2;
  j = j || (BOARD_H - height) / 2;
  drawPixel(i, j, {color, width, height});
  ctx.fillStyle = "white";
  ctx.font = fontSize + "px " + FONT_NAME;
  const [x, y] = getRawCoordinate(i, j);
  ctx.fillText(str, x + PIXEL_SIZE * (width / 2) + PIXEL_GAP * (width / 2 - 1), y + PIXEL_SIZE * (height / 2) + PIXEL_GAP * (height / 2 - 1));
}

function drawPixelText(str, i, j, options = {}) {
  const {color, size} = Object.assign(Object.create(DRAW_PIXEL_TEXT_DEFAULT_OPTIONS), options);
  const [x, y] = getRawCoordinate(i, j);
  ctx.fillStyle = color;
  ctx.font = size * ratio + "px " + FONT_NAME;
  ctx.fillText(str, x + PIXEL_SIZE / 2, y + PIXEL_SIZE / 2);
}

function drawPixel(i, j, options = {}) {
  const {color, width, height} = Object.assign(Object.create(DRAW_BOX_DEFAULT_OPTIONS), options);
  const [x, y] = getRawCoordinate(i, j);
  ctx.fillStyle = color;
  const w = PIXEL_SIZE * width + PIXEL_GAP * (width - 1);
  const h = PIXEL_SIZE * height + PIXEL_GAP * (height - 1);
  ctx.fillRect(x, y, w, h);
}

/**
 * Give x, y, return the pixel's position on board
 * @param {Number} x point's x on canvas
 * @param {Number} y point's y on canvas
 */
function getBoardIndecis(x, y) {
  [x, y] = [x*ratio, y*ratio];
  return [Math.floor(x / (PIXEL_GAP + PIXEL_SIZE)), Math.floor(y / (PIXEL_GAP + PIXEL_SIZE))];
}

/**
 * Get pixel's coordinate on the canvas.
 * @param {Number} i pixel's x position
 * @param {Number} j pixel's y position
 */
function getRawCoordinate(i, j) {
  return [i * (PIXEL_GAP + PIXEL_SIZE), j * (PIXEL_GAP + PIXEL_SIZE)]
}

function getPixelRatio(context) {
  var backingStore = context.backingStorePixelRatio ||
  context.webkitBackingStorePixelRatio ||
  context.mozBackingStorePixelRatio ||
  context.msBackingStorePixelRatio ||
  context.oBackingStorePixelRatio ||
  context.backingStorePixelRatio || 1;
  return (window.devicePixelRatio || 1) / backingStore;
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Give a board and a *left* click, update the board to a new state.
 * board state meaning:
 * E: Unrevealed Empty Square
 * B: Revealed Blank Square
 * X: Revealed Mine
 * M: Unrevealed Mine
 * V: Add Flag on M
 * A: Add Flag on E
 * @param {Array[][]} board board is a 2D array represents game board
 * @param {Array[2]} click the pixel user clicked
 */
function updateBoard(board, click) {
  const [r, c] = [board.length, board[0].length];
  const dir = [
      [-1, 0], [-1, 1], [0, 1], [1, 1], 
      [1, 0], [1, -1], [0, -1], [-1, -1]
  ];
  const [x, y] = click;
  const start = board[x][y];
  
  const inRange = (x, y) => x >= 0 && x < r && y >= 0 && y < c;
  const closeMine = (x, y) => {
      let count = 0;
      for (const [dx, dy] of dir) {
          const [nx, ny] = [x + dx, y + dy];
          if (!inRange(nx, ny)) continue;
          if (board[nx][ny] === 'M' || board[nx][ny] === 'V') count++;
      }
      if (count !== 0) board[x][y] = `${count}`;
      return count;
  }
  
  const fill = (x, y) => {
      if (closeMine(x, y)) return;
      board[x][y] = 'B';
      for (const [dx, dy] of dir) {
          const [nx, ny] = [x + dx, y + dy];
          if (!inRange(nx, ny)) continue;
          if (board[nx][ny] !== 'E') continue;
          fill(nx, ny);
      }
  }
  
  if (start === 'E') fill(x, y);
  else if (start === 'M') board[x][y] = 'X';
}