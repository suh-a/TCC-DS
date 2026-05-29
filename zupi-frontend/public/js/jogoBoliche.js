(function () {
  var LEVELS = [
    { name: 'Treino', frames: 3, precision: 0, target: 90 },
    { name: 'Desafio', frames: 4, precision: 0.035, target: 135 },
    { name: 'Campeao', frames: 5, precision: 0.065, target: 180 }
  ];
  var PINS = [
    { x: 0, y: 0 },
    { x: -0.14, y: 1 }, { x: 0.14, y: 1 },
    { x: -0.28, y: 2 }, { x: 0, y: 2 }, { x: 0.28, y: 2 },
    { x: -0.42, y: 3 }, { x: -0.14, y: 3 }, { x: 0.14, y: 3 }, { x: 0.42, y: 3 }
  ];
  var level = 0;
  var frame = 0;
  var throwInFrame = 1;
  var score = 0;
  var standing = [];
  var results = [];
  var locked = false;
  var pendingAction = null;

  function $(id) { return document.getElementById(id); }

  function startGame() {
    $('inicio').hidden = true;
    $('passagem').hidden = true;
    level = 0;
    beginLevel();
  }

  function beginLevel() {
    frame = 0;
    throwInFrame = 1;
    score = 0;
    results = [];
    $('nome-nivel').textContent = 'Nivel ' + (level + 1) + ' - ' + LEVELS[level].name;
    $('instrucao').textContent = level === 0
      ? 'Ajuste a mira e derrube os 10 pinos!'
      : 'A pista ficou mais exigente. Mire com cuidado!';
    buildFrames();
    resetRack();
    updateHud();
  }

  function buildFrames() {
    $('frames').innerHTML = '';
    for (var i = 0; i < LEVELS[level].frames; i++) {
      var box = document.createElement('div');
      box.className = 'frame' + (i === frame ? ' active' : '');
      box.id = 'frame-' + i;
      box.innerHTML = '<span>Rodada ' + (i + 1) + '</span><div class="balls"><i class="ball-result">-</i><i class="ball-result">-</i></div>';
      $('frames').appendChild(box);
    }
  }

  function resetRack() {
    standing = PINS.map(function (_, index) { return index; });
    throwInFrame = 1;
    renderPins();
    resetBall();
    $('feedback').className = 'throw-feedback';
    $('feedback').textContent = 'Prepare o seu lancamento!';
  }

  function renderPins() {
    var deck = $('pin-deck');
    deck.innerHTML = '';
    PINS.forEach(function (pin, index) {
      var element = document.createElement('span');
      element.className = 'pin' + (standing.indexOf(index) < 0 ? ' down' : '');
      element.style.left = (50 + pin.x * 100) + '%';
      element.style.top = (22 + pin.y * 34) + 'px';
      element.style.setProperty('--fall-x', (pin.x < 0 ? '-22px' : '22px'));
      element.style.setProperty('--fall-r', (pin.x < 0 ? '-70deg' : '70deg'));
      deck.appendChild(element);
    });
  }

  function updateAim() {
    var aim = Number($('mira').value);
    var position = 50 + aim * 0.63;
    $('pista').style.setProperty('--ball-x', position + '%');
    $('mira-label').textContent = aim < -8 ? 'Esquerda' : aim > 8 ? 'Direita' : 'Centro';
    $('forca-label').textContent = $('forca').value + '%';
    document.querySelectorAll('[data-aim]').forEach(function (button) {
      button.classList.toggle('selected', Number(button.dataset.aim) === aim);
    });
  }

  function setAim(value) {
    $('mira').value = value;
    updateAim();
  }

  function resetBall() {
    var ball = $('bola');
    ball.classList.remove('rolling');
    ball.style.removeProperty('--impact-x');
    updateAim();
  }

  function throwBall() {
    if (locked) return;
    locked = true;
    $('lancar').disabled = true;
    var aim = Number($('mira').value) / 100;
    var power = Number($('forca').value);
    var impact = Math.max(-0.46, Math.min(0.46, aim));
    var impactPosition = 50 + impact * 100 * .63;
    $('bola').style.setProperty('--impact-x', impactPosition + '%');
    $('bola').classList.add('rolling');
    tone(260, .1);

    setTimeout(function () {
      var knocked = calculateKnockdown(impact, power);
      applyThrow(knocked);
      setTimeout(resolveThrow, 420);
    }, 860);
  }

  function calculateKnockdown(impact, power) {
    var alive = standing.slice();
    var perfect = Math.abs(impact) <= (0.075 - LEVELS[level].precision / 2) && power >= 82;
    if (perfect && alive.length === 10) return alive;
    var width = 0.11 + power / 225 - LEVELS[level].precision;
    if (power < 42) width *= .56;
    return alive.filter(function (index) {
      var pin = PINS[index];
      var chain = width + (pin.y * Math.max(0, power - 45) / 760);
      return Math.abs(pin.x - impact) <= chain;
    });
  }

  function applyThrow(knocked) {
    standing = standing.filter(function (pin) { return knocked.indexOf(pin) < 0; });
    renderPins();
    var last = results[frame] || [];
    last.push(knocked.length);
    results[frame] = last;
    var frameBox = $('frame-' + frame);
    var slots = frameBox.querySelectorAll('.ball-result');
    slots[throwInFrame - 1].textContent = standing.length === 0 && throwInFrame === 1 ? 'X' : knocked.length;
    var bonus = standing.length === 0 ? (throwInFrame === 1 ? 20 : 10) : 0;
    score += knocked.length * 10 + bonus;
    if (standing.length === 0 && throwInFrame === 2) slots[1].textContent = '/';
    updateHud();
    var text = knocked.length === 0 ? 'Quase! Ajuste a mira.' : knocked.length + ' pino' + (knocked.length === 1 ? '' : 's') + ' derrubado' + (knocked.length === 1 ? '!' : 's!');
    if (knocked.length === 0) window.GameScore?.recordError?.();
    if (standing.length === 0) text = throwInFrame === 1 ? 'STRIKE! Voce derrubou todos!' : 'SPARE! Limpou a pista!';
    $('feedback').textContent = text;
    $('feedback').className = 'throw-feedback' + (standing.length === 0 ? ' celebrate' : '');
    if (standing.length === 0) {
      celebration(throwInFrame === 1 ? 28 : 18);
      fanfare();
    }
  }

  function resolveThrow() {
    var finished = standing.length === 0 || throwInFrame === 2;
    if (finished) {
      setTimeout(completeFrame, 360);
      return;
    }
    throwInFrame = 2;
    resetBall();
    locked = false;
    $('lancar').disabled = false;
    updateHud();
  }

  function completeFrame() {
    $('frame-' + frame).classList.remove('active');
    $('frame-' + frame).classList.add('done');
    frame++;
    if (frame >= LEVELS[level].frames) {
      showLevelResult();
      return;
    }
    $('frame-' + frame).classList.add('active');
    resetRack();
    locked = false;
    $('lancar').disabled = false;
    updateHud();
  }

  function showLevelResult() {
    var passed = score >= LEVELS[level].target;
    var isLast = level === LEVELS.length - 1;
    $('icone-resultado').textContent = passed ? '🏆' : '🎳';
    $('titulo-resultado').textContent = passed ? 'Nivel vencido!' : 'Boa partida!';
    if (!passed) {
      $('texto-resultado').textContent = 'Voce marcou ' + score + ' pontos. Jogue novamente para chegar a ' + LEVELS[level].target + ' pontos.';
      $('continuar').textContent = 'Tentar novamente';
      pendingAction = beginLevel;
    } else if (isLast) {
      $('titulo-resultado').textContent = 'Campeao do Boliche!';
      $('texto-resultado').textContent = 'Voce completou todos os niveis com ' + score + ' pontos na pista final!';
      $('continuar').textContent = 'Jogar novamente';
      pendingAction = function () { level = 0; beginLevel(); };
      celebration(45);
    } else {
      $('texto-resultado').textContent = score + ' pontos! O proximo nivel tem mais rodadas e exige uma mira melhor.';
      $('continuar').textContent = 'Jogar nivel ' + (level + 2);
      pendingAction = function () { level++; beginLevel(); };
      celebration(32);
    }
    window.GameScore?.submit?.({
      gameId: 'jogoBolao',
      score: score,
      maxScore: LEVELS[level].target,
      errors: window.GameScore?.state?.errors || 0
    });
    $('passagem').hidden = false;
  }

  function continueGame() {
    $('passagem').hidden = true;
    locked = false;
    $('lancar').disabled = false;
    if (pendingAction) pendingAction();
  }

  function updateHud() {
    $('nivel').textContent = level + 1;
    $('rodada').textContent = Math.min(frame + 1, LEVELS[level].frames) + '/' + LEVELS[level].frames;
    $('pontos').textContent = score;
    $('pinos').textContent = standing.length;
    $('arremesso').textContent = throwInFrame + ' de 2';
  }

  function tone(frequency, duration) {
    try {
      var audio = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audio.createOscillator();
      var gain = audio.createGain();
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(.12, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
      osc.start();
      osc.stop(audio.currentTime + duration);
    } catch (e) {}
  }

  function fanfare() {
    [523, 659, 784].forEach(function (frequency, index) {
      setTimeout(function () { tone(frequency, .18); }, index * 95);
    });
  }

  function celebration(amount) {
    var colors = ['#7ec8e6', '#a8d5ba', '#ffe66d', '#ffb980'];
    for (var i = 0; i < amount; i++) {
      var piece = document.createElement('i');
      piece.className = 'confetti';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = Math.random() * .35 + 's';
      document.body.appendChild(piece);
      setTimeout(function (element) { element.remove(); }, 1800, piece);
    }
  }

  $('mira').addEventListener('input', updateAim);
  $('forca').addEventListener('input', updateAim);
  document.querySelectorAll('[data-aim]').forEach(function (button) {
    button.addEventListener('click', function () { setAim(Number(button.dataset.aim)); });
  });
  $('lancar').addEventListener('click', throwBall);
  $('comecar').addEventListener('click', startGame);
  $('continuar').addEventListener('click', continueGame);
  updateAim();
  buildFrames();
  resetRack();
  updateHud();
}());
