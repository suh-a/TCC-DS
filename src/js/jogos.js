// ===================================================
// jogo.js — Jogo da Memória (versão com tempo + modal)
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const restartBtn = document.getElementById("restartBtn");
  const movesEl = document.getElementById("moves");
  const matchedEl = document.getElementById("matched");
  const timerEl = document.getElementById("timer");

  // Modal
  const winModal = document.getElementById("winModal");
  const playAgainBtn = document.getElementById("playAgain");
  const closeModalBtn = document.getElementById("closeModal");
  const finalTimeEl = document.getElementById("finalTime");
  const finalMovesEl = document.getElementById("finalMoves");

  // Emojis das cartas
  const icons = ["🍎", "🍌", "🍇", "🍓", "🍍", "🍉", "🍒", "🥝"];
  const totalPairs = icons.length;

  // Variáveis de controle
  let deck = [];
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let moves = 0;
  let matched = 0;
  let time = 0;
  let timerInterval = null;

  // Embaralhar array
  function shuffle(arr) {
    const array = arr.slice();
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Atualiza tempo no formato MM:SS
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function startTimer() {
    clearInterval(timerInterval);
    time = 0;
    timerEl.textContent = "00:00";
    timerInterval = setInterval(() => {
      time++;
      timerEl.textContent = formatTime(time);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function buildBoard() {
    board.innerHTML = "";
    deck = shuffle([...icons, ...icons]);
    deck.forEach((symbol) => {
      const card = document.createElement("button");
      card.className = "card";
      card.dataset.symbol = symbol;
      card.textContent = "?";
      card.addEventListener("click", () => handleCardClick(card));
      board.appendChild(card);
    });
  }

  function handleCardClick(card) {
    if (lockBoard || card.classList.contains("flipped") || card.classList.contains("matched"))
      return;

    card.textContent = card.dataset.symbol;
    card.classList.add("flipped");

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    lockBoard = true;
    moves++;
    movesEl.textContent = moves;

    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      matched++;
      matchedEl.textContent = matched;
      resetTurn();

      if (matched === totalPairs) {
        stopTimer();
        showWinModal();
      }
    } else {
      setTimeout(() => {
        firstCard.textContent = "?";
        secondCard.textContent = "?";
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetTurn();
      }, 800);
    }
  }

  function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  function resetGame() {
    moves = 0;
    matched = 0;
    movesEl.textContent = "0";
    matchedEl.textContent = "0";
    resetTurn();
    buildBoard();
    startTimer();
  }

  function showWinModal() {
    finalTimeEl.textContent = formatTime(time);
    finalMovesEl.textContent = moves;
    winModal.classList.add("show");
    winModal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    winModal.classList.remove("show");
    winModal.setAttribute("aria-hidden", "true");
  }

  // Botões
  restartBtn.addEventListener("click", resetGame);
  playAgainBtn.addEventListener("click", () => {
    closeModal();
    resetGame();
  });
  closeModalBtn.addEventListener("click", closeModal);

  // Inicia o jogo
  resetGame();
});
