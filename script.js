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

const boardEl = document.getElementById("board");
const cells = [...document.querySelectorAll(".cell")];
const statusEl = document.getElementById("status");
const scoreXEl = document.getElementById("score-x");
const scoreOEl = document.getElementById("score-o");
const scoreDrawEl = document.getElementById("score-draw");
const resetRoundBtn = document.getElementById("reset-round");
const resetAllBtn = document.getElementById("reset-all");
const modeButtons = [...document.querySelectorAll(".mode-btn")];

const state = {
  board: Array(9).fill(""),
  turn: "X",
  locked: false,
  mode: "pvp",
  scores: { X: 0, O: 0, draw: 0 },
};

function getWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { mark: board[a], line };
    }
  }
  if (board.every(Boolean)) {
    return { mark: "draw", line: [] };
  }
  return null;
}

function emptyIndexes(board) {
  return board.map((value, index) => (value ? null : index)).filter((index) => index !== null);
}

function minimax(board, isMaximizing) {
  const result = getWinner(board);
  if (result) {
    if (result.mark === "O") return { score: 10 };
    if (result.mark === "X") return { score: -10 };
    return { score: 0 };
  }

  const moves = emptyIndexes(board);
  let best = { score: isMaximizing ? -Infinity : Infinity, index: moves[0] };

  for (const index of moves) {
    board[index] = isMaximizing ? "O" : "X";
    const outcome = minimax(board, !isMaximizing);
    board[index] = "";
    const candidate = { score: outcome.score, index };
    if (isMaximizing ? candidate.score > best.score : candidate.score < best.score) {
      best = candidate;
    }
  }

  return best;
}

function computerMove() {
  const { index } = minimax([...state.board], true);
  playMove(index);
}

function render() {
  cells.forEach((cell, index) => {
    const mark = state.board[index];
    cell.textContent = mark;
    cell.classList.toggle("x", mark === "X");
    cell.classList.toggle("o", mark === "O");
    cell.disabled = Boolean(mark) || state.locked;
  });
}

function setStatus(text) {
  statusEl.textContent = text;
}

function highlightWin(line) {
  line.forEach((index) => cells[index].classList.add("win"));
}

function clearHighlights() {
  cells.forEach((cell) => cell.classList.remove("win"));
}

function finishRound(result) {
  state.locked = true;
  if (result.mark === "draw") {
    state.scores.draw += 1;
    scoreDrawEl.textContent = String(state.scores.draw);
    setStatus("It's a draw");
    return;
  }

  state.scores[result.mark] += 1;
  if (result.mark === "X") scoreXEl.textContent = String(state.scores.X);
  if (result.mark === "O") scoreOEl.textContent = String(state.scores.O);
  highlightWin(result.line);
  setStatus(`${result.mark} wins`);
}

function playMove(index) {
  if (state.locked || state.board[index]) return;

  state.board[index] = state.turn;
  render();

  const result = getWinner(state.board);
  if (result) {
    finishRound(result);
    return;
  }

  state.turn = state.turn === "X" ? "O" : "X";
  setStatus(`${state.turn}'s turn`);

  if (state.mode === "cpu" && state.turn === "O" && !state.locked) {
    state.locked = true;
    setTimeout(() => {
      state.locked = false;
      computerMove();
    }, 280);
  }
}

function resetRound() {
  state.board = Array(9).fill("");
  state.turn = "X";
  state.locked = false;
  clearHighlights();
  render();
  setStatus("X starts the game");
}

function resetAll() {
  state.scores = { X: 0, O: 0, draw: 0 };
  scoreXEl.textContent = "0";
  scoreOEl.textContent = "0";
  scoreDrawEl.textContent = "0";
  resetRound();
}

boardEl.addEventListener("click", (event) => {
  const cell = event.target.closest(".cell");
  if (!cell) return;
  playMove(Number(cell.dataset.index));
});

resetRoundBtn.addEventListener("click", resetRound);
resetAllBtn.addEventListener("click", resetAll);

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    modeButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.mode = button.dataset.mode;
    resetRound();
  });
});

render();
