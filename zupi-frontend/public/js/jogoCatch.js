(function () {
  var FRUITS = [
    { emoji: '🍎', label: 'maca', points: 10 },
    { emoji: '🍊', label: 'laranja', points: 10 },
    { emoji: '🍌', label: 'banana', points: 12 },
    { emoji: '🍓', label: 'morango', points: 14 },
    { emoji: '🍇', label: 'uva', points: 15 },
    { emoji: '🍉', label: 'melancia', points: 18 },
    { emoji: '🍍', label: 'abacaxi', points: 20 }
  ];
  var LEVEL_TARGETS = [0, 6, 14, 24, 36];

  var orchard = document.getElementById('pomar');
  var basket = document.getElementById('cesta');
  var pointsText = document.getElementById('pontos');
  var livesText = document.getElementById('vidas');
  var levelText = document.getElementById('nivel');
  var caughtText = document.getElementById('pegas');
  var toast = document.getElementById('avisoNivel');

  var fruits = [];
  var playing = false;
  var dragging = false;
  var basketX = 0;
  var score = 0;
  var lives = 3;
  var level = 1;
  var caught = 0;
  var lastTime = 0;
  var spawnWait = 0;
  var animationId = 0;
  var toastTimer = 0;
  var audioContext;
  var activePointer = null;

  function audio() {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      return audioContext;
    } catch (error) {
      return null;
    }
  }

  function tone(frequency, duration, volume, type, delay) {
    var context = audio();
    if (!context) return;
    var start = context.currentTime + (delay || 0);
    var oscillator = context.createOscillator();
    var gain = context.createGain();
    oscillator.type = type || 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(volume || .1, start);
    gain.gain.exponentialRampToValueAtTime(.001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  function catchSound() {
    tone(523, .15, .1, 'sine');
    tone(659, .15, .1, 'sine', .08);
  }

  function missSound() {
    tone(215, .25, .09, 'triangle');
  }

  function levelSound() {
    [523, 659, 784, 1046].forEach(function (frequency, index) {
      tone(frequency, .2, .12, 'sine', index * .1);
    });
  }

  function stageWidth() {
    return orchard.clientWidth;
  }

  function basketWidth() {
    return basket.offsetWidth || 124;
  }

  function setBasketPosition(position) {
    var max = Math.max(0, stageWidth() - basketWidth());
    basketX = Math.max(0, Math.min(max, position));
    basket.style.left = basketX + 'px';
  }

  function moveBasketToPointer(clientX) {
    var bounds = orchard.getBoundingClientRect();
    setBasketPosition(clientX - bounds.left - basketWidth() / 2);
  }

  function removeFruits() {
    fruits.forEach(function (fruit) {
      fruit.node.remove();
    });
    fruits = [];
  }

  function updateHud() {
    pointsText.textContent = String(score);
    livesText.textContent = String(Math.max(0, lives));
    levelText.textContent = String(level);
    caughtText.textContent = String(caught);
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.remove('hidden');
    toastTimer = window.setTimeout(function () {
      toast.classList.add('hidden');
    }, 1900);
  }

  function burst(x, y, text, color) {
    var element = document.createElement('span');
    element.className = 'fruit-burst';
    element.textContent = text;
    element.style.left = x + 'px';
    element.style.top = y + 'px';
    element.style.color = color;
    orchard.appendChild(element);
    window.setTimeout(function () {
      element.remove();
    }, 780);
  }

  function spawnFruit() {
    var choice = FRUITS[Math.floor(Math.random() * Math.min(FRUITS.length, level + 2))];
    var golden = Math.random() < .08;
    var node = document.createElement('span');
    var width = stageWidth();
    node.className = 'falling-fruit' + (golden ? ' golden' : '');
    node.textContent = golden ? '🌟' : choice.emoji;
    node.setAttribute('aria-label', golden ? 'fruta estrela' : choice.label);
    orchard.appendChild(node);
    fruits.push({
      node: node,
      x: 38 + Math.random() * Math.max(1, width - 76),
      y: 38,
      speed: 132 + level * 27 + Math.random() * 42,
      points: golden ? 35 : choice.points + (level - 1) * 2
    });
  }

  function loseFruit(fruit) {
    fruit.node.remove();
    window.GameScore?.recordError?.();
    lives -= 1;
    updateHud();
    missSound();
    burst(fruit.x, orchard.clientHeight - 70, '-1 vida', '#de7752');
    if (lives <= 0) {
      endGame();
    }
  }

  function catchFruit(fruit) {
    fruit.node.remove();
    score += fruit.points;
    caught += 1;
    catchSound();
    burst(fruit.x, orchard.clientHeight - 95, '+' + fruit.points, '#4d94b2');
    var newLevel = level;
    for (var index = LEVEL_TARGETS.length - 1; index >= 0; index -= 1) {
      if (caught >= LEVEL_TARGETS[index]) {
        newLevel = index + 1;
        break;
      }
    }
    if (newLevel > level) {
      level = newLevel;
      showToast('Nivel ' + level + '! As frutas caem mais rapido!');
      levelSound();
    }
    updateHud();
  }

  function tick(time) {
    if (!playing) return;
    var elapsed = Math.min((time - lastTime) / 1000 || 0, .05);
    lastTime = time;
    spawnWait -= elapsed;
    if (spawnWait <= 0) {
      spawnFruit();
      spawnWait = Math.max(.46, 1.04 - level * .11) + Math.random() * .32;
    }

    var basketTop = orchard.clientHeight - 100;
    var basketRight = basketX + basketWidth();
    fruits = fruits.filter(function (fruit) {
      fruit.y += fruit.speed * elapsed;
      fruit.node.style.left = fruit.x + 'px';
      fruit.node.style.top = fruit.y + 'px';

      if (fruit.y >= basketTop && fruit.y <= basketTop + 54 &&
          fruit.x >= basketX - 18 && fruit.x <= basketRight + 18) {
        catchFruit(fruit);
        return false;
      }
      if (fruit.y > orchard.clientHeight + 32) {
        loseFruit(fruit);
        return false;
      }
      return true;
    });

    if (playing) {
      animationId = window.requestAnimationFrame(tick);
    }
  }

  function startGame() {
    document.getElementById('inicio').classList.add('hidden');
    document.getElementById('fim').classList.add('hidden');
    window.cancelAnimationFrame(animationId);
    removeFruits();
    score = 0;
    lives = 3;
    level = 1;
    caught = 0;
    spawnWait = .32;
    lastTime = performance.now();
    playing = true;
    dragging = false;
    basket.classList.remove('dragging');
    setBasketPosition((stageWidth() - basketWidth()) / 2);
    updateHud();
    showToast('Pegue as frutas!');
    audio();
    animationId = window.requestAnimationFrame(tick);
  }

  function endGame() {
    playing = false;
    window.cancelAnimationFrame(animationId);
    removeFruits();
    document.getElementById('iconeFim').textContent = score >= 200 ? '🏆' : '🍎';
    document.getElementById('tituloFim').textContent = score >= 200 ? 'Colheita incrivel!' : 'Fim da colheita!';
    document.getElementById('textoFim').textContent = 'Voce pegou ' + caught + ' frutas e marcou ' + score + ' pontos no nivel ' + level + '.';
    document.getElementById('fim').classList.remove('hidden');
    window.GameScore?.submit?.({
      gameId: 'jogoCatch',
      score: score,
      maxScore: Math.max(200, score),
      errors: window.GameScore?.state?.errors || 0
    });
  }

  basket.addEventListener('pointerdown', function (event) {
    if (!playing) return;
    dragging = true;
    activePointer = event.pointerId;
    basket.classList.add('dragging');
    if (basket.setPointerCapture) {
      basket.setPointerCapture(event.pointerId);
    }
    moveBasketToPointer(event.clientX);
    audio();
    event.preventDefault();
  });

  orchard.addEventListener('pointermove', function (event) {
    if (dragging && (activePointer === null || event.pointerId === activePointer)) {
      moveBasketToPointer(event.clientX);
      event.preventDefault();
    }
  });

  function stopDragging(event) {
    if (!dragging) return;
    dragging = false;
    activePointer = null;
    basket.classList.remove('dragging');
    if (event && typeof event.pointerId === 'number' && basket.hasPointerCapture(event.pointerId)) {
      basket.releasePointerCapture(event.pointerId);
    }
  }

  orchard.addEventListener('pointerup', stopDragging);
  orchard.addEventListener('pointercancel', stopDragging);

  basket.addEventListener('touchstart', function (event) {
    if (!playing || !event.touches.length) return;
    dragging = true;
    basket.classList.add('dragging');
    moveBasketToPointer(event.touches[0].clientX);
    audio();
    event.preventDefault();
  }, { passive: false });

  orchard.addEventListener('touchmove', function (event) {
    if (!dragging || !event.touches.length) return;
    moveBasketToPointer(event.touches[0].clientX);
    event.preventDefault();
  }, { passive: false });

  orchard.addEventListener('touchend', stopDragging);

  basket.addEventListener('keydown', function (event) {
    if ((event.key === 'Enter' || event.key === ' ') && playing) {
      showToast('Arraste a cesta com o mouse ou com o dedo!');
      event.preventDefault();
    }
  });

  window.addEventListener('resize', function () {
    setBasketPosition(basketX);
  });

  document.getElementById('comecar').addEventListener('click', startGame);
  document.getElementById('novamente').addEventListener('click', startGame);
  setBasketPosition((stageWidth() - basketWidth()) / 2);
  updateHud();
}());
