(function () {
  var LEVELS = [
    {
      title: 'Jardim alegre',
      theme: 'garden',
      mission: 'Coloque um sol, uma flor e uma borboleta no jardim.',
      required: ['sol', 'flor', 'borboleta'],
      stickers: [
        { id: 'sol', emoji: '☀️', label: 'Sol' },
        { id: 'flor', emoji: '🌷', label: 'Flor' },
        { id: 'borboleta', emoji: '🦋', label: 'Borboleta' },
        { id: 'arvore', emoji: '🌳', label: 'Arvore' },
        { id: 'abelha', emoji: '🐝', label: 'Abelha' },
        { id: 'arco', emoji: '🌈', label: 'Arco-iris' }
      ]
    },
    {
      title: 'Fundo do mar',
      theme: 'ocean',
      mission: 'Coloque um peixe, um polvo e uma concha no mar.',
      required: ['peixe', 'polvo', 'concha'],
      stickers: [
        { id: 'peixe', emoji: '🐠', label: 'Peixe' },
        { id: 'polvo', emoji: '🐙', label: 'Polvo' },
        { id: 'concha', emoji: '🐚', label: 'Concha' },
        { id: 'tartaruga', emoji: '🐢', label: 'Tartaruga' },
        { id: 'onda', emoji: '🌊', label: 'Onda' },
        { id: 'estrela-mar', emoji: '⭐', label: 'Estrela' }
      ]
    },
    {
      title: 'Espaco brilhante',
      theme: 'space',
      mission: 'Coloque um foguete, um planeta e uma estrela no espaco.',
      required: ['foguete', 'planeta', 'estrela'],
      stickers: [
        { id: 'foguete', emoji: '🚀', label: 'Foguete' },
        { id: 'planeta', emoji: '🪐', label: 'Planeta' },
        { id: 'estrela', emoji: '⭐', label: 'Estrela' },
        { id: 'lua', emoji: '🌙', label: 'Lua' },
        { id: 'alien', emoji: '👽', label: 'Alien' },
        { id: 'cometa', emoji: '☄️', label: 'Cometa' }
      ]
    },
    {
      title: 'Fazenda feliz',
      theme: 'farm',
      mission: 'Coloque uma vaca, um trator e uma espiga na fazenda.',
      required: ['vaca', 'trator', 'milho'],
      stickers: [
        { id: 'vaca', emoji: '🐄', label: 'Vaca' },
        { id: 'trator', emoji: '🚜', label: 'Trator' },
        { id: 'milho', emoji: '🌽', label: 'Milho' },
        { id: 'galinha', emoji: '🐔', label: 'Galinha' },
        { id: 'celeiro', emoji: '🏠', label: 'Celeiro' },
        { id: 'sol-fazenda', emoji: '☀️', label: 'Sol' }
      ]
    },
    {
      title: 'Floresta aventureira',
      theme: 'forest',
      mission: 'Coloque um urso, uma arvore e um cogumelo na floresta.',
      required: ['urso', 'arvore-floresta', 'cogumelo'],
      stickers: [
        { id: 'urso', emoji: '🐻', label: 'Urso' },
        { id: 'arvore-floresta', emoji: '🌲', label: 'Arvore' },
        { id: 'cogumelo', emoji: '🍄', label: 'Cogumelo' },
        { id: 'coruja', emoji: '🦉', label: 'Coruja' },
        { id: 'raposa', emoji: '🦊', label: 'Raposa' },
        { id: 'folha', emoji: '🍂', label: 'Folha' }
      ]
    },
    {
      title: 'Festa colorida',
      theme: 'party',
      mission: 'Coloque um bolo, um balao e um presente na festa.',
      required: ['bolo', 'balao', 'presente'],
      stickers: [
        { id: 'bolo', emoji: '🎂', label: 'Bolo' },
        { id: 'balao', emoji: '🎈', label: 'Balao' },
        { id: 'presente', emoji: '🎁', label: 'Presente' },
        { id: 'musica', emoji: '🎵', label: 'Musica' },
        { id: 'confete', emoji: '🎉', label: 'Confete' },
        { id: 'estrela-festa', emoji: '⭐', label: 'Estrela' }
      ]
    }
  ];

  var levelIndex = 0;
  var works = 0;
  var placed = [];
  var selectedSticker = null;

  var stage = document.getElementById('cenario');
  var stickerShelf = document.getElementById('adesivos');
  var requirements = document.getElementById('necessarios');
  var completeButton = document.getElementById('concluir');
  var status = document.getElementById('statusCena');
  var result = document.getElementById('resultado');
  var nextButton = document.getElementById('proximo');
  var selectedTool = document.getElementById('adesivoSelecionado');

  function currentLevel() {
    return LEVELS[levelIndex];
  }

  function completedIds() {
    return placed.map(function (item) { return item.id; });
  }

  function updateMission() {
    var level = currentLevel();
    var ids = completedIds();
    var finished = level.required.every(function (id) { return ids.indexOf(id) !== -1; });
    requirements.innerHTML = '';
    level.required.forEach(function (id) {
      var sticker = level.stickers.filter(function (item) { return item.id === id; })[0];
      var badge = document.createElement('span');
      var done = ids.indexOf(id) !== -1;
      badge.className = 'requirement' + (done ? ' done' : '');
      badge.textContent = (done ? '✓ ' : '') + sticker.emoji + ' ' + sticker.label;
      requirements.appendChild(badge);
    });
    completeButton.disabled = !finished;
    status.textContent = finished
      ? 'Missao completa! Decore mais ou conclua o mundo.'
      : placed.length
        ? 'Continue! Sua cena tem ' + placed.length + ' adesivo' + (placed.length === 1 ? '.' : 's.')
        : 'Primeiro escolha um adesivo e depois toque na paisagem.';
  }

  function selectSticker(sticker, button) {
    selectedSticker = sticker;
    Array.prototype.forEach.call(stickerShelf.children, function (item) {
      item.classList.toggle('selected', item === button);
    });
    selectedTool.textContent = sticker.emoji + ' ' + sticker.label + ' escolhido! Agora toque no lugar da paisagem.';
  }

  function addSticker(sticker, x, y) {
    var item = document.createElement('span');
    item.className = 'placed-sticker';
    item.textContent = sticker.emoji;
    item.style.left = x + '%';
    item.style.top = y + '%';
    item.setAttribute('aria-label', sticker.label);
    stage.appendChild(item);
    placed.push({ id: sticker.id, node: item });
    updateMission();
  }

  function clearScene() {
    placed.forEach(function (item) {
      item.node.remove();
    });
    placed = [];
    updateMission();
  }

  stage.addEventListener('click', function (event) {
    if (!selectedSticker) {
      selectedTool.textContent = 'Escolha um adesivo primeiro e depois toque na paisagem.';
      return;
    }

    var box = stage.getBoundingClientRect();
    var x = ((event.clientX - box.left) / box.width) * 100;
    var y = ((event.clientY - box.top) / box.height) * 100;
    x = Math.max(7, Math.min(93, x));
    y = Math.max(8, Math.min(92, y));
    addSticker(selectedSticker, x, y);
  });

  function renderLevel() {
    var level = currentLevel();
    selectedSticker = null;
    document.getElementById('mundoAtual').textContent = String(levelIndex + 1);
    document.getElementById('tituloMundo').textContent = level.title;
    document.getElementById('missaoMundo').textContent = level.mission;
    stage.className = 'stage ' + level.theme;
    stickerShelf.innerHTML = '';
    selectedTool.textContent = 'Escolha um adesivo para comecar.';
    clearScene();

    level.stickers.forEach(function (sticker) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'sticker-button';
      button.setAttribute('aria-label', 'Adicionar ' + sticker.label);
      button.innerHTML = '<span>' + sticker.emoji + '</span>' + sticker.label;
      button.addEventListener('click', function () {
        selectSticker(sticker, button);
      });
      stickerShelf.appendChild(button);
    });
  }

  document.getElementById('comecar').addEventListener('click', function () {
    document.getElementById('inicio').classList.add('hidden');
    renderLevel();
  });

  document.getElementById('desfazer').addEventListener('click', function () {
    var removed = placed.pop();
    if (removed) {
      removed.node.remove();
    }
    updateMission();
  });

  document.getElementById('limparCena').addEventListener('click', clearScene);

  completeButton.addEventListener('click', function () {
    if (completeButton.disabled) {
      return;
    }
    works += 1;
    document.getElementById('obras').textContent = String(works);
    var finished = levelIndex === LEVELS.length - 1;
    document.getElementById('iconeResultado').textContent = finished ? '🏆' : '🎨';
    document.getElementById('tituloResultado').textContent = finished ? 'Galeria completa!' : 'Mundo completo!';
    document.getElementById('textoResultado').textContent = finished
      ? 'Voce montou os seis cenarios e criou uma linda colecao.'
      : 'Sua paisagem ficou incrivel! Agora vamos para um novo lugar.';
    nextButton.textContent = finished ? 'Criar novamente' : 'Proximo mundo';
    result.classList.remove('hidden');
  });

  nextButton.addEventListener('click', function () {
    result.classList.add('hidden');
    if (levelIndex === LEVELS.length - 1) {
      levelIndex = 0;
      works = 0;
      document.getElementById('obras').textContent = '0';
    } else {
      levelIndex += 1;
    }
    renderLevel();
  });

  renderLevel();
}());
