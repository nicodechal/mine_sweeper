// useful contant
const boxSize = 70;
const boxGap = 4;
const boardH = 13, boardW = 13;
const hardRate = 0.8;
// TODO: change
const fontName = 'somybmp01_7';
const boom = '💣';
const alertWidthRate = 0.6;
const alertHeightRate = 0.3;

const DRAW_ALERT_DEFAULT_OPTIONS = { color: "#daa592", width: 6, height: 3, fontSize: 35 };
const DRAW_PIXEL_TEXT_DEFAULT_OPTIONS = { color: "#666", size: 16 };
const DRAW_BOX_DEFAULT_OPTIONS = { color: "#f0e3c4", width: 1, height: 1 };
const MINE_COLOR = '#f76262';
const REVEALED_COLOR = 'white';

// game state
let gameRunning = 0;

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");;
const ratio = getPixelRatio(ctx);

const board = [];

// set canvas' width & height
canvas.width = boardW * boxSize + (boardW - 1) * boxGap;
canvas.height = boardH * boxSize + (boardH - 1) * boxGap;
canvas.style.width = (canvas.width / ratio) + 'px';
canvas.style.height = (canvas.height / ratio) + 'px';
canvas.oncontextmenu = () => false;

ctx.textBaseline = "middle";
ctx.textAlign = "center";

canvas.addEventListener('click', function (e) {
  if (!gameRunning) return false;
  const [i, j] = getBoardIndecis(e.offsetX, e.offsetY);
  const state = updateBoard(board, [i, j]);
  drawBoard();
  if (!state) {
    gameRunning = false;
    drawAlert("YOU FAILED!");
    setTimeout(() => {
      clear();
      drawResultBoard();
    }, 3000)
  }
})

initBoard();
drawBoard();

function initBoard(hardRate = 0.9) {
  for (let i = 0; i < boardW; i++) {
    board[i] = [];
    for (let j = 0; j < boardH; j++) {
      board[i][j] = 'E';
      // TODO: change
      if (Math.random() > hardRate) board[i][j] = 'M';
    }
  }
  gameRunning = 1;
}

function drawBoard() {
  for (let i = 0; i < boardW; i++) {
    for (let j = 0; j < boardH; j++) {
      if (board[i][j] === 'E' || board[i][j] === 'M') {
        drawBox(i, j);
      } else if (board[i][j] === 'X') {
        drawBox(i, j, {color: MINE_COLOR});
        drawPixelText(boom, i, j, {color: 'white'});
      } else if (board[i][j] === 'B') {
        drawBox(i, j, {color: REVEALED_COLOR});
      } else {
        drawBox(i, j, {color: REVEALED_COLOR});
        drawPixelText(board[i][j], i, j);
      }
    }
  }
}

function drawResultBoard() {
  for (let i = 0; i < boardW; i++) {
    for (let j = 0; j < boardH; j++) {
      if (board[i][j] === 'E') {
        drawBox(i, j);
      } else if (board[i][j] === 'M' || board[i][j] === 'X') {
        drawBox(i, j, {color: MINE_COLOR});
        drawPixelText(boom, i, j, {color: 'white'});
      } else if (board[i][j] === 'B') {
        drawBox(i, j, {color: REVEALED_COLOR});
      } else {
        drawBox(i, j, {color: REVEALED_COLOR});
        drawPixelText(board[i][j], i, j);
      }
    }
  }
}

function drawAlert(str, i, j, options = {}) {
  const {color, width, height, fontSize} = Object.assign(Object.create(DRAW_ALERT_DEFAULT_OPTIONS), options);
  i = i || (boardW - width) / 2;
  j = j || (boardH - height) / 2;
  drawBox(i, j, {color, width, height});
  ctx.fillStyle = "white";
  ctx.font = fontSize + "px " + fontName;
  const [x, y] = getRawCoordinate(i, j);
  ctx.fillText(str, x + boxSize * (width / 2) + boxGap * (width / 2 - 1), y + boxSize * (height / 2) + boxGap * (height / 2 - 1));
}

function drawPixelText(str, i, j, options = {}) {
  const {color, size} = Object.assign(Object.create(DRAW_PIXEL_TEXT_DEFAULT_OPTIONS), options);
  const [x, y] = getRawCoordinate(i, j);
  ctx.fillStyle = color;
  ctx.font = size * ratio + "px " + fontName;
  ctx.fillText(str, x + boxSize / 2, y + boxSize / 2);
}

function drawBox(i, j, options = {}) {
  const {color, width, height} = Object.assign(Object.create(DRAW_BOX_DEFAULT_OPTIONS), options);
  const [x, y] = getRawCoordinate(i, j);
  ctx.fillStyle = color;
  const w = boxSize * width + boxGap * (width - 1);
  const h = boxSize * height + boxGap * (height - 1);
  ctx.fillRect(x, y, w, h);
}

function getBoardIndecis(x, y) {
  [x, y] = [x*ratio, y*ratio];
  return [Math.floor(x / (boxGap + boxSize)), Math.floor(y / (boxGap + boxSize))];
}

function getRawCoordinate(i, j) {
  return [i * (boxGap + boxSize), j * (boxGap + boxSize)]
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
          if (board[nx][ny] === 'M') count++;
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
  else if (start === 'M') {
    board[x][y] = 'X';
    return false;
  }
  return true;
}