(function () {
  var COLORS = [
    { name: 'Azul', value: '#65c8eb' },
    { name: 'Amarelo', value: '#ffd45d' },
    { name: 'Rosa', value: '#ff86ae' },
    { name: 'Verde', value: '#73d49a' },
    { name: 'Roxo', value: '#a87bed' }
  ];

  var LEVELS = [
    { title: 'Primeiras cores', size: 3, colors: 2, pattern: [0, 1, 0, 1, 0, 1, 0, 1, 0] },
    { title: 'Flor colorida', size: 3, colors: 3, pattern: [1, 2, 1, 0, 1, 0, 1, 2, 1] },
    { title: 'Trilhas cruzadas', size: 4, colors: 3, pattern: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0] },
    { title: 'Janela arco-iris', size: 4, colors: 4, pattern: [0, 1, 1, 0, 2, 3, 3, 2, 2, 3, 3, 2, 0, 1, 1, 0] },
    { title: 'Tapete calmo', size: 4, colors: 4, pattern: [3, 0, 0, 3, 1, 2, 2, 1, 1, 2, 2, 1, 3, 0, 0, 3] },
    { title: 'Estrela simples', size: 5, colors: 4, pattern: [0, 0, 1, 0, 0, 0, 2, 1, 2, 0, 1, 1, 3, 1, 1, 0, 2, 1, 2, 0, 0, 0, 1, 0, 0] },
    { title: 'Caminho de cores', size: 5, colors: 5, pattern: [4, 0, 0, 0, 4, 1, 4, 1, 4, 1, 2, 2, 4, 2, 2, 1, 4, 1, 4, 1, 4, 0, 0, 0, 4] },
    { title: 'Grande obra', size: 5, colors: 5, pattern: [4, 0, 1, 0, 4, 0, 3, 2, 3, 0, 1, 2, 4, 2, 1, 0, 3, 2, 3, 0, 4, 0, 1, 0, 4] }
  ];

  var levelIndex = 0;
  var selectedColor = 0;
  var painted = [];
  var stars = 0;

  var model = document.getElementById('modelo');
  var art = document.getElementById('arte');
  var palette = document.getElementById('paleta');
  var feedback = document.getElementById('feedback');
  var result = document.getElementById('resultado');
  var nextButton = document.getElementById('proximo');

  function renderLevel() {
    var level = LEVELS[levelIndex];
    painted = new Array(level.pattern.length).fill(null);
    selectedColor = 0;
    document.getElementById('nivelAtual').textContent = String(levelIndex + 1);
    document.getElementById('totalNiveis').textContent = String(LEVELS.length);
    document.getElementById('missao').textContent = level.title + ': copie cada cor do modelo.';
    feedback.textContent = '';
    model.style.gridTemplateColumns = 'repeat(' + level.size + ', 1fr)';
    art.style.gridTemplateColumns = 'repeat(' + level.size + ', 1fr)';
    model.innerHTML = '';
    art.innerHTML = '';
    palette.innerHTML = '';

    COLORS.slice(0, level.colors).forEach(function (color, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'color-button' + (index === selectedColor ? ' selected' : '');
      button.style.backgroundColor = color.value;
      button.setAttribute('aria-label', 'Escolher cor ' + color.name);
      button.dataset.index = String(index);
      button.addEventListener('click', function () {
        selectedColor = index;
        Array.prototype.forEach.call(palette.children, function (item) {
          item.classList.toggle('selected', item === button);
        });
      });
      palette.appendChild(button);
    });

    level.pattern.forEach(function (colorIndex, index) {
      var exampleTile = document.createElement('div');
      exampleTile.className = 'model-tile';
      exampleTile.style.backgroundColor = COLORS[colorIndex].value;
      exampleTile.dataset.colorIndex = String(colorIndex);
      model.appendChild(exampleTile);

      var tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'paint-tile';
      tile.setAttribute('aria-label', 'Pintar quadradinho ' + (index + 1));
      tile.addEventListener('click', function () {
        painted[index] = selectedColor;
        tile.style.backgroundColor = COLORS[selectedColor].value;
      });
      art.appendChild(tile);
    });
  }

  function verifyMosaic() {
    var pattern = LEVELS[levelIndex].pattern;
    var correct = pattern.reduce(function (total, colorIndex, index) {
      return total + (painted[index] === colorIndex ? 1 : 0);
    }, 0);

    if (correct !== pattern.length) {
      window.GameScore?.recordError?.();
      feedback.textContent = correct + ' de ' + pattern.length + ' pecas estao certas. Continue pintando!';
      return;
    }

    stars += 1;
    document.getElementById('estrelas').textContent = String(stars);
    document.getElementById('tituloResultado').textContent = levelIndex === LEVELS.length - 1 ? 'Voce virou artista!' : 'Mosaico completo!';
    document.getElementById('textoResultado').textContent = levelIndex === LEVELS.length - 1
      ? 'Voce completou todos os mosaicos e ganhou todas as estrelas.'
      : 'Muito bem! O proximo modelo tem um novo desafio.';
    document.getElementById('iconeResultado').textContent = levelIndex === LEVELS.length - 1 ? '\uD83C\uDFC6' : '\u2B50';
    nextButton.textContent = levelIndex === LEVELS.length - 1 ? 'Jogar novamente' : 'Proximo nivel';
    result.classList.remove('hidden');

    if (levelIndex === LEVELS.length - 1) {
      window.GameScore?.submit?.({
        gameId: 'jogoMosaico',
        score: LEVELS.length,
        maxScore: LEVELS.length,
        errors: window.GameScore?.state?.errors || 0
      });
    }
  }

  document.getElementById('comecar').addEventListener('click', function () {
    document.getElementById('inicio').classList.add('hidden');
    renderLevel();
  });

  document.getElementById('verificar').addEventListener('click', verifyMosaic);

  document.getElementById('limpar').addEventListener('click', function () {
    painted.fill(null);
    Array.prototype.forEach.call(art.children, function (tile) {
      tile.style.backgroundColor = '';
    });
    feedback.textContent = 'Pronto! Escolha novas cores para sua arte.';
  });

  nextButton.addEventListener('click', function () {
    result.classList.add('hidden');
    if (levelIndex === LEVELS.length - 1) {
      levelIndex = 0;
      stars = 0;
      document.getElementById('estrelas').textContent = '0';
    } else {
      levelIndex += 1;
    }
    renderLevel();
  });

  renderLevel();
}());
