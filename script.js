const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const STORAGE_STATS = "ttt_stats_v1";
const STORAGE_THEME = "ttt_theme_v1";

const state = {
  board: Array(9).fill(""),
  currentPlayer: "X",
  mode: "pvp",
  isOver: false,
  stats: { X: 0, O: 0, draw: 0 },
};

const elements = {
  cells: Array.from(document.querySelectorAll(".cell")),
  status: document.querySelector("#status"),
  restart: document.querySelector("#restart"),
  modeSelect: document.querySelector("#mode-select"),
  themeToggle: document.querySelector("#theme-toggle"),
  resetStats: document.querySelector("#reset-stats"),
  statX: document.querySelector("#stat-x"),
  statO: document.querySelector("#stat-o"),
  statDraw: document.querySelector("#stat-draw"),
};

init();

function init() {
  restoreStats();
  restoreTheme();
  bindEvents();
  resetBoard();
  updateStatsUi();
  registerServiceWorker();
}

function bindEvents() {
  elements.cells.forEach((cell) => {
    cell.addEventListener("click", () => handleMove(Number(cell.dataset.index)));
  });

  elements.restart.addEventListener("click", resetBoard);
  elements.modeSelect.addEventListener("change", (event) => {
    state.mode = event.target.value;
    resetBoard();
  });

  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.resetStats.addEventListener("click", () => {
    state.stats = { X: 0, O: 0, draw: 0 };
    persistStats();
    updateStatsUi();
  });
}

function handleMove(index) {
  if (state.isOver || state.board[index]) return;
  applyMove(index, state.currentPlayer);

  if (!state.isOver && state.mode === "pve" && state.currentPlayer === "O") {
    window.setTimeout(botMove, 180);
  }
}

function applyMove(index, player) {
  state.board[index] = player;
  renderBoard();

  const winner = getWinner(state.board);
  if (winner) {
    endRound(winner.player, winner.line);
    return;
  }

  if (isDraw(state.board)) {
    endRound("draw");
    return;
  }

  state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
  updateStatus(`Ход: ${state.currentPlayer}`);
}

function botMove() {
  if (state.isOver) return;
  const index = getBestMove(state.board);
  if (index !== -1) applyMove(index, "O");
}

function endRound(result, winLine = []) {
  state.isOver = true;
  if (result === "draw") {
    state.stats.draw += 1;
    updateStatus("Ничья");
  } else {
    state.stats[result] += 1;
    updateStatus(`Победил: ${result}`);
  }

  highlightWin(winLine);
  persistStats();
  updateStatsUi();
}

function resetBoard() {
  state.board = Array(9).fill("");
  state.currentPlayer = "X";
  state.isOver = false;
  clearWinHighlight();
  renderBoard();
  updateStatus(`Ход: ${state.currentPlayer}`);
}

function renderBoard() {
  elements.cells.forEach((cell, index) => {
    const value = state.board[index];
    cell.textContent = value;
    cell.setAttribute("aria-label", value ? `Клетка ${index + 1}: ${value}` : `Клетка ${index + 1}`);
  });
}

function updateStatus(text) {
  elements.status.textContent = text;
}

function updateStatsUi() {
  elements.statX.textContent = state.stats.X;
  elements.statO.textContent = state.stats.O;
  elements.statDraw.textContent = state.stats.draw;
}

function getWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  return null;
}

function isDraw(board) {
  return board.every(Boolean) && !getWinner(board);
}

function clearWinHighlight() {
  elements.cells.forEach((cell) => cell.classList.remove("cell--win"));
}

function highlightWin(line) {
  line.forEach((index) => elements.cells[index].classList.add("cell--win"));
}

function getBestMove(board) {
  const lines = WIN_LINES;

  for (const line of lines) {
    const maybe = findCriticalCell(board, line, "O");
    if (maybe !== -1) return maybe;
  }

  for (const line of lines) {
    const maybe = findCriticalCell(board, line, "X");
    if (maybe !== -1) return maybe;
  }

  if (!board[4]) return 4;

  const corners = [0, 2, 6, 8].filter((index) => !board[index]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  const free = board.map((value, index) => ({ value, index })).filter((item) => !item.value);
  return free.length ? free[Math.floor(Math.random() * free.length)].index : -1;
}

function findCriticalCell(board, [a, b, c], player) {
  const line = [board[a], board[b], board[c]];
  const playerCount = line.filter((v) => v === player).length;
  const emptyCount = line.filter((v) => !v).length;
  if (playerCount === 2 && emptyCount === 1) {
    if (!board[a]) return a;
    if (!board[b]) return b;
    if (!board[c]) return c;
  }
  return -1;
}

function persistStats() {
  localStorage.setItem(STORAGE_STATS, JSON.stringify(state.stats));
}

function restoreStats() {
  try {
    const raw = localStorage.getItem(STORAGE_STATS);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (
      Number.isInteger(parsed?.X) &&
      Number.isInteger(parsed?.O) &&
      Number.isInteger(parsed?.draw)
    ) {
      state.stats = parsed;
    }
  } catch (error) {
    console.error("Не удалось загрузить статистику", error);
  }
}

function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.setItem(STORAGE_THEME, next);
}

function restoreTheme() {
  const saved = localStorage.getItem(STORAGE_THEME);
  if (saved === "dark" || saved === "light") {
    document.documentElement.dataset.theme = saved;
  }
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
  }
}
