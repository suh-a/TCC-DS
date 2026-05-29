const levels = [
  [
    { animal: '🐶', animalName: 'Cachorro', food: '🦴', foodName: 'Osso' },
    { animal: '🐵', animalName: 'Macaco', food: '🍌', foodName: 'Banana' },
    { animal: '🐱', animalName: 'Gato', food: '🥛', foodName: 'Leite' }
  ],
  [
    { animal: '🐶', animalName: 'Cachorro', food: '🦴', foodName: 'Osso' },
    { animal: '🐵', animalName: 'Macaco', food: '🍌', foodName: 'Banana' },
    { animal: '🐱', animalName: 'Gato', food: '🥛', foodName: 'Leite' },
    { animal: '🐰', animalName: 'Coelho', food: '🥕', foodName: 'Cenoura' }
  ],
  [
    { animal: '🐶', animalName: 'Cachorro', food: '🦴', foodName: 'Osso' },
    { animal: '🐵', animalName: 'Macaco', food: '🍌', foodName: 'Banana' },
    { animal: '🐱', animalName: 'Gato', food: '🥛', foodName: 'Leite' },
    { animal: '🐰', animalName: 'Coelho', food: '🥕', foodName: 'Cenoura' },
    { animal: '🐴', animalName: 'Cavalo', food: '🌿', foodName: 'Capim' }
  ],
  [
    { animal: '🐶', animalName: 'Cachorro', food: '🦴', foodName: 'Osso' },
    { animal: '🐵', animalName: 'Macaco', food: '🍌', foodName: 'Banana' },
    { animal: '🐱', animalName: 'Gato', food: '🥛', foodName: 'Leite' },
    { animal: '🐰', animalName: 'Coelho', food: '🥕', foodName: 'Cenoura' },
    { animal: '🐴', animalName: 'Cavalo', food: '🌿', foodName: 'Capim' },
    { animal: '🐼', animalName: 'Panda', food: '🎋', foodName: 'Bambu' }
  ]
];

let currentLevel = 0;
let selectedItem = null;
let matchesFound = 0;
let matchedPairs = [];

function shuffle(items) {
  return items.slice().sort(() => Math.random() - 0.5);
}

function initGame() {
  const level = levels[currentLevel];
  const leftCol = document.getElementById('col-left');
  const rightCol = document.getElementById('col-right');
  leftCol.innerHTML = '';
  rightCol.innerHTML = '';
  document.getElementById('connections').innerHTML = '';
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('level-indicator').textContent = `Nivel ${currentLevel + 1} de ${levels.length}`;
  document.getElementById('instruction-text').textContent = `${level.length} animais: ligue cada um ao alimento.`;
  selectedItem = null;
  matchesFound = 0;
  matchedPairs = [];

  level.forEach((pair, index) => {
    createCard({ id: `animal-${index}`, match: `food-${index}`, icon: pair.animal, name: pair.animalName }, leftCol, 'left');
  });
  shuffle(level.map((pair, index) => ({ id: `food-${index}`, match: `animal-${index}`, icon: pair.food, name: pair.foodName })))
    .forEach((food) => createCard(food, rightCol, 'right'));
}

function createCard(item, container, side) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'item';
  card.textContent = item.icon;
  card.dataset.id = item.id;
  card.dataset.match = item.match;
  card.dataset.side = side;
  card.setAttribute('aria-label', item.name);
  card.addEventListener('click', () => handleSelection(card));
  container.appendChild(card);
}

function handleSelection(card) {
  if (card.classList.contains('matched')) return;
  if (!selectedItem) {
    selectedItem = card;
    card.classList.add('selected');
    return;
  }
  if (selectedItem === card) {
    card.classList.remove('selected');
    selectedItem = null;
    return;
  }
  if (selectedItem.dataset.side === card.dataset.side) {
    selectedItem.classList.remove('selected');
    selectedItem = card;
    card.classList.add('selected');
    return;
  }
  if (selectedItem.dataset.match === card.dataset.id) {
    successMatch(selectedItem, card);
  } else {
    errorMatch(selectedItem, card);
  }
}

function successMatch(first, second) {
  first.classList.remove('selected');
  first.classList.add('matched');
  second.classList.add('matched');
  matchedPairs.push([first, second]);
  drawLine(first, second);
  selectedItem = null;
  matchesFound++;
  if (matchesFound === levels[currentLevel].length) setTimeout(showLevelComplete, 450);
}

function errorMatch(first, second) {
  window.GameScore?.recordError?.();
  first.classList.add('error');
  second.classList.add('error');
  setTimeout(() => {
    first.classList.remove('error', 'selected');
    second.classList.remove('error');
    selectedItem = null;
  }, 500);
}

function drawLine(start, end) {
  const svg = document.getElementById('connections');
  const area = document.getElementById('game-container').getBoundingClientRect();
  const a = start.getBoundingClientRect();
  const b = end.getBoundingClientRect();
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', a.left + a.width / 2 - area.left);
  line.setAttribute('y1', a.top + a.height / 2 - area.top);
  line.setAttribute('x2', b.left + b.width / 2 - area.left);
  line.setAttribute('y2', b.top + b.height / 2 - area.top);
  svg.appendChild(line);
}

function showLevelComplete() {
  const last = currentLevel === levels.length - 1;
  document.getElementById('modal-icon').textContent = last ? '🏆' : '⭐';
  document.getElementById('modal-title').textContent = last ? 'Mestre dos Animais!' : 'Nivel concluido!';
  document.getElementById('modal-message').textContent = last
    ? 'Voce ligou todos os animais corretamente!'
    : `Agora o nivel ${currentLevel + 2} tem mais animais para combinar.`;
  document.getElementById('modal-btn').textContent = last ? 'Jogar novamente' : 'Proximo nivel';
  document.getElementById('modal-overlay').style.display = 'flex';
  if (last) {
    window.GameScore?.submit?.({
      gameId: 'jogo-ligar-objetos',
      score: levels.length,
      maxScore: levels.length,
      errors: window.GameScore?.state?.errors || 0
    });
  }
}

function nextAction() {
  currentLevel = currentLevel === levels.length - 1 ? 0 : currentLevel + 1;
  initGame();
}

window.addEventListener('load', initGame);
window.addEventListener('resize', () => {
  document.getElementById('connections').innerHTML = '';
  matchedPairs.forEach((pair) => drawLine(pair[0], pair[1]));
});
