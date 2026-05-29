const CG_COLORS = [
  { name: 'Azul', value: '#7EC8E6' },
  { name: 'Verde', value: '#A8D5BA' },
  { name: 'Amarelo', value: '#FFE66D' },
  { name: 'Coral', value: '#FFB980' }
];

const STROOP_COLORS = [
  ...CG_COLORS,
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Preto', value: '#1F2937' },
  { name: 'Branco', value: '#F8FAFC', textShadow: '0 0 0 #2D3748, 0 2px 10px rgba(45,55,72,.18)' }
];

const CG_TONES = [392, 494, 587, 698];
const CG_STATE = { round: 1, score: 0, max: 8, startedAt: Date.now(), locked: false };

function $(selector) {
  return document.querySelector(selector);
}

function tone(freq = 440, duration = 0.18, type = 'sine') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = window.cgAudioContext || new AudioCtx();
    window.cgAudioContext = ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  } catch (error) {
    // AudioContext can be blocked until the first user action.
  }
}

function rightSound() {
  [523, 659, 784].forEach((freq, index) => setTimeout(() => tone(freq, 0.15), index * 85));
}

function wrongSound() {
  window.GameScore?.recordError?.();
  tone(190, 0.28, 'sawtooth');
}

function winSound() {
  [523, 659, 784, 1046].forEach((freq, index) => setTimeout(() => tone(freq, 0.16), index * 90));
}

function confetti(amount = 28) {
  const colors = ['#7EC8E6', '#A8D5BA', '#FFE66D', '#FFB980'];
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'cg-confetti';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = '-20px';
    piece.style.width = `${7 + Math.random() * 10}px`;
    piece.style.height = `${7 + Math.random() * 10}px`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
    piece.style.animationDuration = `${1.4 + Math.random() * 1.4}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3000);
  }
}

function floatText(text, target, color = '#7EC8E6') {
  const rect = target.getBoundingClientRect();
  const el = document.createElement('span');
  el.className = 'cg-float';
  el.textContent = text;
  el.style.left = `${rect.left + rect.width / 2}px`;
  el.style.top = `${rect.top + rect.height / 2}px`;
  el.style.color = color;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function updateHud() {
  $('#cgRound').textContent = CG_STATE.round;
  $('#cgScore').textContent = CG_STATE.max === Infinity ? String(CG_STATE.score) : `${CG_STATE.score}/${CG_STATE.max}`;
  $('#cgProgress').style.width = CG_STATE.max === Infinity
    ? `${Math.min(96, 12 + (CG_STATE.score % 9) * 10)}%`
    : `${(CG_STATE.score / CG_STATE.max) * 100}%`;
}

function setMessage(text) {
  $('#cgMessage').textContent = text;
}

function resetState(max = 8) {
  CG_STATE.round = 1;
  CG_STATE.score = 0;
  CG_STATE.max = max;
  CG_STATE.startedAt = Date.now();
  CG_STATE.locked = false;
  updateHud();
}

async function submitScore(gameId) {
  const duration = Math.round((Date.now() - CG_STATE.startedAt) / 1000);
  if (window.GameScore) {
    const maxScore = CG_STATE.max === Infinity ? Math.max(CG_STATE.score, 1) : CG_STATE.max;
    await window.GameScore.submit(gameId, CG_STATE.score, maxScore, duration);
  }
}

function showEnd(title, text, gameId, celebrate = true) {
  submitScore(gameId);
  if (celebrate) {
    winSound();
    confetti(38);
  }
  $('#cgEndTitle').textContent = title;
  $('#cgEndText').textContent = text;
  $('#cgEnd').classList.remove('cg-hidden');
}

function makeTile(color, shape = 'shape-circle') {
  return `<span class="cg-color ${shape}" style="--tile-color:${color}"></span>`;
}

function initPatterns() {
  resetState(8);
  const shapes = ['shape-circle', 'shape-diamond', 'shape-bar'];

  function nextRound() {
    updateHud();
    const length = Math.min(3 + CG_STATE.round, 7);
    const base = shuffle(CG_COLORS).slice(0, 3);
    const shape = shapes[CG_STATE.round % shapes.length];
    const sequence = Array.from({ length }, (_, index) => base[index % base.length]);
    const answer = sequence[sequence.length - 1];
    const visible = sequence.slice(0, -1);
    $('#cgStage').innerHTML = `
      <div>
        <span class="cg-kicker">Memória visual e lógica</span>
        <h1 class="cg-title">Complete o padrão</h1>
        <p class="cg-sub">Observe a sequência e escolha a peça que completa a ordem.</p>
      </div>
      <div class="cg-pattern">
        ${visible.map((item) => `<div class="cg-tile">${makeTile(item.value, shape)}</div>`).join('')}
        <div class="cg-tile">?</div>
      </div>
      <div class="cg-options">
        ${shuffle(CG_COLORS).map((item) => `<button class="cg-option" data-answer="${item.name}">${makeTile(item.value, shape)}<span>${item.name}</span></button>`).join('')}
      </div>
      <div class="cg-message" id="cgMessage">Escolha a próxima peça.</div>
    `;

    document.querySelectorAll('.cg-option').forEach((button) => {
      button.addEventListener('click', () => {
        if (CG_STATE.locked) return;
        const ok = button.dataset.answer === answer.name;
        button.classList.add(ok ? 'ok' : 'no');
        if (ok) {
          CG_STATE.score += 1;
          rightSound();
          floatText('Muito bem', button, '#7EC8E6');
        } else {
          wrongSound();
          floatText('Tente observar o padrão', button, '#FFB980');
        }
        CG_STATE.locked = true;
        setTimeout(() => {
          if (CG_STATE.round >= CG_STATE.max) {
            updateHud();
            showEnd('Padrões completos', 'Você treinou memória visual, lógica e atenção aos detalhes.', 'jogoPadroes');
          } else {
            CG_STATE.round += 1;
            CG_STATE.locked = false;
            nextRound();
          }
        }, 760);
        updateHud();
      });
    });
  }

  nextRound();
}

function initStroop() {
  resetState(10);

  function nextRound() {
    updateHud();
    const word = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    let ink = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    if (CG_STATE.round > 2 && Math.random() > 0.45) {
      ink = shuffle(STROOP_COLORS).find((item) => item.name !== word.name) || ink;
    }
    const options = shuffle([ink, ...shuffle(STROOP_COLORS.filter((item) => item.name !== ink.name)).slice(0, 5)]);
    $('#cgStage').innerHTML = `
      <div>
        <span class="cg-kicker">Atenção seletiva</span>
        <h1 class="cg-title">Foco nas cores</h1>
        <p class="cg-sub">Escolha a cor da tinta, não o texto escrito. Agora entram cores fora da paleta para aumentar o desafio.</p>
      </div>
      <div class="cg-word" style="color:${ink.value};text-shadow:${ink.textShadow || 'none'}">${word.name}</div>
      <div class="cg-options cg-options-compact">
        ${options.map((item) => `<button class="cg-option" data-answer="${item.name}"><span class="cg-swatch" style="background:${item.value}"></span>${item.name}</button>`).join('')}
      </div>
      <div class="cg-message" id="cgMessage">Qual é a cor da tinta?</div>
    `;

    document.querySelectorAll('.cg-option').forEach((button) => {
      button.addEventListener('click', () => {
        if (CG_STATE.locked) return;
        const ok = button.dataset.answer === ink.name;
        button.classList.add(ok ? 'ok' : 'no');
        if (ok) {
          CG_STATE.score += 1;
          floatText('Foco excelente', button, '#7EC8E6');
        } else {
          wrongSound();
          floatText('Era a cor da tinta', button, '#FFB980');
        }
        CG_STATE.locked = true;
        setTimeout(() => {
          if (CG_STATE.round >= CG_STATE.max) {
            updateHud();
            showEnd('Atenção treinada', 'Você praticou foco, leitura de regra e controle de impulso.', 'jogoFocoCores', false);
          } else {
            CG_STATE.round += 1;
            CG_STATE.locked = false;
            nextRound();
          }
        }, 720);
        updateHud();
      });
    });
  }

  nextRound();
}

function initSoundSequence() {
  resetState(Infinity);
  let sequence = [];
  let input = [];

  function playPad(index) {
    const button = document.querySelector(`[data-tone="${index}"]`);
    if (button) button.classList.add('active');
    tone(CG_TONES[index], 0.22);
    setTimeout(() => button?.classList.remove('active'), 240);
  }

  function playSequence() {
    CG_STATE.locked = true;
    setMessage('Escute a sequência.');
    sequence.forEach((item, index) => setTimeout(() => playPad(item), 520 * index));
    setTimeout(() => {
      input = [];
      CG_STATE.locked = false;
      setMessage('Agora repita tocando os blocos.');
    }, sequence.length * 520 + 220);
  }

  function nextRound() {
    updateHud();
    sequence.push(Math.floor(Math.random() * 4));
    $('#cgStage').innerHTML = `
      <div>
        <span class="cg-kicker">Memória auditiva</span>
        <h1 class="cg-title">Sequência sonora</h1>
        <p class="cg-sub">Escute os sons e repita a ordem. A sequência cresce sem limite e só termina quando errar.</p>
      </div>
      <div class="cg-tone-row">
        ${CG_COLORS.map((item, index) => `<button class="cg-tone" data-tone="${index}" style="--tile-color:${item.value}" aria-label="Tom ${index + 1}"></button>`).join('')}
      </div>
      <div class="cg-actions"><button class="cg-btn warm" id="repeatSound">Ouvir novamente</button></div>
      <div class="cg-message" id="cgMessage">Escute a sequência.</div>
    `;

    document.querySelectorAll('.cg-tone').forEach((button) => {
      button.addEventListener('click', () => {
        if (CG_STATE.locked) return;
        const selected = Number(button.dataset.tone);
        input.push(selected);
        playPad(selected);
        if (selected !== sequence[input.length - 1]) {
          wrongSound();
          button.classList.add('no');
          setMessage('A sequência reiniciou. Tente bater seu recorde.');
          CG_STATE.locked = true;
          setTimeout(() => {
            showEnd('Sequência reiniciada', `Você repetiu ${CG_STATE.score} sequência${CG_STATE.score === 1 ? '' : 's'} antes de errar.`, 'jogoSequenciaSons', false);
          }, 620);
          return;
        }
        if (input.length === sequence.length) {
          CG_STATE.score += 1;
          rightSound();
          setMessage('Sequência correta.');
          setTimeout(() => {
            CG_STATE.round += 1;
            nextRound();
          }, 760);
          updateHud();
        }
      });
    });

    $('#repeatSound').addEventListener('click', playSequence);
    setTimeout(playSequence, 400);
  }

  nextRound();
}

function initRoutes() {
  const maps = [
    { size: 4, blocks: [6, 9], start: 0, goal: 15 },
    { size: 4, blocks: [5, 9], start: 12, goal: 3 },
    { size: 4, blocks: [6, 10], start: 15, goal: 0 },
    { size: 5, blocks: [7, 12, 17], start: 20, goal: 4 },
    { size: 5, blocks: [3, 8, 13, 18], start: 0, goal: 24 },
    { size: 5, blocks: [6, 11, 16, 18], start: 20, goal: 2 },
    { size: 5, blocks: [2, 7, 12, 16, 18], start: 0, goal: 24 },
    { size: 5, blocks: [6, 8, 13, 14, 18], start: 4, goal: 20 },
    { size: 5, blocks: [1, 6, 11, 18, 23], start: 10, goal: 14 },
    { size: 5, blocks: [3, 8, 13, 17, 18], start: 24, goal: 0 }
  ];
  resetState(maps.length);
  let current = 0;
  let path = [];
  let dragging = false;

  function neighbors(a, b, size) {
    const ax = a % size;
    const ay = Math.floor(a / size);
    const bx = b % size;
    const by = Math.floor(b / size);
    return Math.abs(ax - bx) + Math.abs(ay - by) === 1;
  }

  function renderMap() {
    updateHud();
    const map = maps[CG_STATE.round - 1];
    current = map.start;
    path = [current];
    dragging = false;
    $('#cgStage').innerHTML = `
      <div>
        <span class="cg-kicker">Planejamento e orientação</span>
        <h1 class="cg-title">Caminho tranquilo</h1>
        <p class="cg-sub">Segure no início e arraste até a chegada. As fases têm sempre um caminho possível para treinar planejamento sem travar.</p>
      </div>
      <div class="cg-grid cg-route-grid" id="routeGrid" style="grid-template-columns:repeat(${map.size}, minmax(42px, 72px))">
        ${Array.from({ length: map.size * map.size }, (_, index) => {
          const classes = ['cg-cell'];
          if (map.blocks.includes(index)) classes.push('block');
          if (index === map.start) classes.push('start', 'path');
          if (index === map.goal) classes.push('goal');
          return `<button class="${classes.join(' ')}" data-cell="${index}" ${map.blocks.includes(index) ? 'disabled' : ''}>${index === map.start ? 'Início' : index === map.goal ? 'Fim' : ''}</button>`;
        }).join('')}
      </div>
      <div class="cg-actions"><button class="cg-btn warm" id="resetPath">Recomeçar rota</button></div>
      <div class="cg-message" id="cgMessage">Segure e arraste a partir do início.</div>
    `;

    const grid = $('#routeGrid');
    const startCell = document.querySelector(`[data-cell="${map.start}"]`);

    function resetWrong(cell, text = 'A rota precisa seguir casas vizinhas.') {
      wrongSound();
      cell?.classList.add('no');
      setMessage(text);
      dragging = false;
      setTimeout(() => {
        cell?.classList.remove('no');
        renderMap();
      }, 620);
    }

    function visitCell(cell) {
      if (!dragging || !cell || cell.classList.contains('block')) return;
      const selected = Number(cell.dataset.cell);
      if (selected === current) return;
      if (path.includes(selected)) return;
      if (!neighbors(current, selected, map.size)) {
        resetWrong(cell);
        return;
      }
      current = selected;
      path.push(selected);
      cell.classList.add('path');
      tone(440 + path.length * 24, 0.12);
      if (selected === map.goal) {
        dragging = false;
        CG_STATE.score += 1;
        rightSound();
        setMessage('Rota concluída.');
        setTimeout(() => {
          if (CG_STATE.round >= CG_STATE.max) {
            updateHud();
            showEnd('Planejamento concluído', 'Você treinou orientação, planejamento e sequência de passos.', 'jogoRotas');
          } else {
            CG_STATE.round += 1;
            renderMap();
          }
        }, 760);
        updateHud();
      }
    }

    startCell.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      dragging = true;
      grid.setPointerCapture?.(event.pointerId);
      setMessage('Continue arrastando até a chegada.');
      tone(420, 0.12);
    });

    grid.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      event.preventDefault();
      const element = document.elementFromPoint(event.clientX, event.clientY);
      const cell = element?.closest?.('.cg-cell');
      if (cell && grid.contains(cell)) visitCell(cell);
    });

    grid.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      if (current !== map.goal) {
        setMessage('Soltou antes da chegada. Tente novamente.');
        wrongSound();
        setTimeout(renderMap, 620);
      }
    });

    $('#resetPath').addEventListener('click', renderMap);
  }

  renderMap();
}

function startGame() {
  const type = document.body.dataset.game;
  $('#cgOverlay').classList.add('cg-hidden');
  if (type === 'patterns') initPatterns();
  if (type === 'stroop') initStroop();
  if (type === 'sounds') initSoundSequence();
  if (type === 'routes') initRoutes();
}

document.addEventListener('DOMContentLoaded', () => {
  $('#cgStart').addEventListener('click', startGame);
  $('#cgRestart').addEventListener('click', () => window.location.reload());
});
