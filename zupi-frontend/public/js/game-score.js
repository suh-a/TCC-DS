const GameScore = {
  STORAGE_KEY: 'zupiGameSessions',
  ERROR_CLASSES: ['error', 'wrong', 'no', 'incorrect', 'erro'],
  state: {
    startedAt: Date.now(),
    errors: 0,
    interactions: 0,
    submitted: false,
    lastErrorAt: 0,
    flushPromise: null
  },
  catalog: {
    jogoMemoria: { name: 'Jogo da Memoria', area: 'Memoria', maxScore: 100 },
    JogoMath: { name: 'Matematica Divertida', area: 'Matematica', maxScore: 100 },
    jogoMath: { name: 'Matematica Divertida', area: 'Matematica', maxScore: 100 },
    jogoPalavras: { name: 'Palavras', area: 'Linguagem', maxScore: 100 },
    jogoLetra: { name: 'Letras', area: 'Linguagem', maxScore: 100 },
    jogoSequenciaSons: { name: 'Sequencia Sonora', area: 'Memoria auditiva', maxScore: 12 },
    jogoPadroes: { name: 'Padroes Visuais', area: 'Logica', maxScore: 8 },
    jogoFocoCores: { name: 'Foco nas Cores', area: 'Atencao', maxScore: 8 },
    jogoRotas: { name: 'Caminho Tranquilo', area: 'Planejamento', maxScore: 10 },
    jogoMosaico: { name: 'Mosaico Criativo', area: 'Coordenacao visual', maxScore: 8 },
    jogoCenarios: { name: 'Cenarios Criativos', area: 'Criatividade', maxScore: 6 },
    jogoCatch: { name: 'Pega Frutas', area: 'Coordenacao motora', maxScore: 200 },
    jogoBolao: { name: 'Boliche', area: 'Coordenacao motora', maxScore: 180 },
    jogoColorir: { name: 'Colorir', area: 'Artes', maxScore: 100 },
    jogoPintura: { name: 'Pintura', area: 'Artes', maxScore: 100 },
    jogoCoresFormas: { name: 'Cores e Formas', area: 'Percepcao visual', maxScore: 100 },
    'jogo-cores-formas': { name: 'Cores e Formas', area: 'Percepcao visual', maxScore: 100 },
    'jogo-ligar-objetos': { name: 'Ligar Objetos', area: 'Associacao', maxScore: 100 },
    jogoBolhas: { name: 'Bolhas', area: 'Atencao', maxScore: 100 },
    jogoContagem: { name: 'Contagem', area: 'Matematica', maxScore: 100 },
    jogoBalao: { name: 'Balao', area: 'Atencao', maxScore: 100 },
    jogoClique: { name: 'Clique Certo', area: 'Atencao', maxScore: 100 },
    jogoOrdem: { name: 'Ordem', area: 'Sequenciamento', maxScore: 100 },
    jogoSombras: { name: 'Sombras', area: 'Percepcao visual', maxScore: 100 },
    jogoBomba: { name: 'Desafio da Bomba', area: 'Controle inibitorio', maxScore: 100 }
  },

  getActiveChildId() {
    const user = typeof ZupiAPI !== 'undefined' ? ZupiAPI.getUser() : {};
    const childId = localStorage.getItem('activeChildId')
      || localStorage.getItem('selectedChildId')
      || localStorage.getItem('childId')
      || (['CRIANCA', 'ALUNO_CREDENCIADO'].includes(user.type) ? user.id : null);

    if (childId) {
      localStorage.setItem('activeChildId', String(childId));
      localStorage.setItem('selectedChildId', String(childId));
      localStorage.setItem('childId', String(childId));
    }

    return childId;
  },

  currentGameId() {
    const slug = (window.location.pathname || '').split('/').pop().replace(/\.html$/i, '');
    if (slug === 'JogoMath') return 'JogoMath';
    return slug || 'jogo';
  },

  gameInfo(gameId) {
    return this.catalog[gameId] || { name: gameId.replace(/[-_]/g, ' '), area: 'Atividades', maxScore: 100 };
  },

  readSessions() {
    try {
      const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },

  writeSessions(sessions) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions.slice(-250)));
  },

  resolveApiBase() {
    if (typeof ZupiAPI !== 'undefined' && ZupiAPI.BASE !== undefined) return ZupiAPI.BASE;
    if (window.ZUPI_API_BASE !== undefined && window.ZUPI_API_BASE !== '') {
      const configuredBase = String(window.ZUPI_API_BASE).replace(/\/$/, '');
      const isLocalApi = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredBase);
      const isLocalPage = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
      if (!isLocalApi || isLocalPage) return configuredBase;
    }
    if (window.location.port === '5173' || window.location.port === '4173') return '';
    return 'https://tcc-ds-dzs2.onrender.com';
  },

  authToken() {
    return localStorage.getItem('authToken');
  },

  canPostToApi() {
    if (typeof ZupiAPI !== 'undefined') return ZupiAPI.isAuthenticated();
    const token = this.authToken();
    const userId = localStorage.getItem('userId');
    return !!(token && userId && userId !== 'undefined' && userId !== 'null');
  },

  async postJson(path, payload, options = {}) {
    const token = this.authToken();
    const base = this.resolveApiBase();
    const url = path.startsWith('http') ? path : `${base}${path}`;
    return fetch(url, {
      method: 'POST',
      keepalive: options.keepalive === true,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
  },

  localSessions(childId) {
    return this.readSessions().filter((session) => String(session.childId) === String(childId));
  },

  percentage(score, maxScore) {
    const max = Number(maxScore) || 100;
    return Math.max(0, Math.min(100, Math.round((Number(score) || 0) * 100 / max)));
  },

  saveLocal(session) {
    const sessions = this.readSessions();
    const exists = sessions.some((item) => item.sessionId === session.sessionId);
    if (!exists) {
      sessions.push({ ...session, synced: session.synced === true });
      this.writeSessions(sessions);
    }
    window.dispatchEvent(new CustomEvent('zupi:game-session-saved', { detail: session }));
    return session;
  },

  markSynced(sessionId) {
    if (!sessionId) return;
    const sessions = this.readSessions().map((item) => (
      item.sessionId === sessionId ? { ...item, synced: true, syncedAt: new Date().toISOString() } : item
    ));
    this.writeSessions(sessions);
  },

  buildPayload(session, basic = false) {
    const payload = {
      sessionId: session.sessionId,
      gameId: session.gameId,
      gameName: session.gameName,
      skillArea: session.skillArea,
      score: session.score,
      maxScore: session.maxScore,
      durationSeconds: session.durationSeconds,
      errors: session.errors,
      skillAreaId: session.skillAreaId
    };

    if (!basic) {
      payload.percentage = session.percentage;
      payload.completedAt = session.completedAt;
    }

    return payload;
  },

  async postSessionToApi(session, options = {}) {
    if (!this.canPostToApi()) return false;
    if (!session || !session.childId) return false;

    const requestOptions = {
      skipAuthRedirect: true,
      keepalive: options.keepalive === true
    };
    const path = `/child/${session.childId}/games/session`;
    const post = (payload) => (typeof ZupiAPI !== 'undefined'
      ? ZupiAPI.post(path, payload, requestOptions)
      : this.postJson(path, payload, requestOptions));

    try {
      const response = await post(this.buildPayload(session));
      if (response && response.ok) return true;

      const fallback = await post(this.buildPayload(session, true));
      return !!(fallback && fallback.ok);
    } catch (e) {
      console.warn('Nao foi possivel registrar pontuacao na API. A sessao ficou pendente para reenvio.', e);
      return false;
    }
  },

  async flushPendingSessions(childId = null) {
    if (this.state.flushPromise) return this.state.flushPromise;
    if (!this.canPostToApi()) return Promise.resolve();

    this.state.flushPromise = (async () => {
      const pending = this.readSessions()
        .filter((session) => session && session.synced !== true && session.childId)
        .filter((session) => !childId || String(session.childId) === String(childId))
        .slice(-40);

      for (const session of pending) {
        const synced = await this.postSessionToApi(session);
        if (synced) this.markSynced(session.sessionId);
      }
    })().finally(() => {
      this.state.flushPromise = null;
    });

    return this.state.flushPromise;
  },

  normalizePayload(input, score, maxScore, durationSeconds, skillAreaId) {
    const payload = typeof input === 'object' && input !== null
      ? { ...input }
      : { gameId: input, score, maxScore, durationSeconds, skillAreaId };

    const gameId = payload.gameId || this.currentGameId();
    const info = this.gameInfo(gameId);
    const normalizedMax = Number(payload.maxScore ?? info.maxScore ?? 100) || 100;
    const normalizedScore = Number(payload.score ?? this.inferScore()) || 0;
    const errors = Number(payload.errors ?? this.state.errors) || 0;
    const duration = Number(payload.durationSeconds ?? ((Date.now() - this.state.startedAt) / 1000)) || 0;

    return {
      sessionId: payload.sessionId || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      childId: this.getActiveChildId(),
      gameId,
      gameName: payload.gameName || info.name,
      skillArea: payload.skillArea || info.area,
      skillAreaId: payload.skillAreaId ?? skillAreaId ?? null,
      score: Math.max(0, Math.round(normalizedScore)),
      maxScore: Math.max(1, Math.round(normalizedMax)),
      errors: Math.max(0, Math.round(errors)),
      durationSeconds: Math.max(0, Math.round(duration)),
      percentage: this.percentage(normalizedScore, normalizedMax),
      completedAt: payload.completedAt || new Date().toISOString(),
      source: payload.source || 'game'
    };
  },

  async submit(input, score, maxScore, durationSeconds, skillAreaId, options = {}) {
    const session = this.normalizePayload(input, score, maxScore, durationSeconds, skillAreaId);
    if (!session.childId) return null;

    this.saveLocal(session);
    this.state.submitted = true;

    const synced = await this.postSessionToApi(session, options);
    if (synced) this.markSynced(session.sessionId);
    return session;

  },

  recordError() {
    const now = Date.now();
    if (now - this.state.lastErrorAt < 250) return;
    this.state.errors += 1;
    this.state.lastErrorAt = now;
  },

  inferScore() {
    const selectors = ['#pontos', '#score', '#pontuacao', '[data-score]', '.score', '.pontos'];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (!element) continue;
      const value = element.dataset.score || element.textContent || '';
      const match = String(value).match(/-?\d+/);
      if (match) return Number(match[0]);
    }
    return 0;
  },

  inferMaxScore(gameId, score) {
    const info = this.gameInfo(gameId);
    return Math.max(Number(info.maxScore) || 100, Number(score) || 0, 1);
  },

  shouldAutoSubmit(score, force = false) {
    const duration = (Date.now() - this.state.startedAt) / 1000;
    if (force) {
      return !this.state.submitted && (score > 0 || this.state.errors > 0 || this.state.interactions > 0 || duration >= 3);
    }
    return !this.state.submitted
      && (score > 0 || this.state.errors > 0 || (this.state.interactions >= 3 && duration >= 12));
  },

  autoSubmit(force = false) {
    const gameId = this.currentGameId();
    const score = this.inferScore();
    if (!this.shouldAutoSubmit(score, force)) return Promise.resolve(null);
    const maxScore = this.inferMaxScore(gameId, score);
    return this.submit({
      gameId,
      score,
      maxScore,
      errors: this.state.errors,
      durationSeconds: (Date.now() - this.state.startedAt) / 1000
    }, undefined, undefined, undefined, undefined, { keepalive: force });
  },

  async submitBeforeNavigation(url) {
    await Promise.race([
      this.autoSubmit(true),
      new Promise((resolve) => setTimeout(resolve, 1800))
    ]);
    window.location.href = url;
  },

  observeErrors() {
    const seen = new WeakSet();
    const check = (node) => {
      if (!(node instanceof Element) || seen.has(node)) return;
      const hasErrorClass = this.ERROR_CLASSES.some((className) => node.classList.contains(className));
      if (hasErrorClass) {
        seen.add(node);
        this.recordError();
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') check(mutation.target);
        mutation.addedNodes?.forEach(check);
      });
    });
    observer.observe(document.body, { attributes: true, childList: true, subtree: true, attributeFilter: ['class'] });
  },

  initAutoTracking() {
    ['click', 'keydown', 'pointerdown', 'touchstart'].forEach((eventName) => {
      document.addEventListener(eventName, () => {
        this.state.interactions += 1;
      }, { passive: true });
    });
    this.observeErrors();
    window.addEventListener('pagehide', () => this.autoSubmit(true));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.autoSubmit(true);
    });
  }
};

window.GameScore = GameScore;

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname || '';
  const isMenu = /\/menuJogos(?:\.html)?$/i.test(path);
  const isGame = /\/jogo/i.test(path) || /\/JogoMath(?:\.html)?$/i.test(path);

  window.ZupiGameScoreReady = GameScore.flushPendingSessions();

  if (isGame && !isMenu) {
    GameScore.initAutoTracking();
    document.addEventListener('click', (event) => {
      const link = event.target?.closest?.('a[href]');
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = new URL(link.href, window.location.origin);
      if (target.origin !== window.location.origin || target.pathname !== '/menuJogos') return;

      event.preventDefault();
      GameScore.submitBeforeNavigation(`${target.pathname}${target.search}${target.hash}`);
    }, true);
  }
  if (!isGame || isMenu || document.querySelector('.game-return-menu')) return;

  const style = document.createElement('style');
  style.textContent = `
    .game-return-menu {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 490;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 10px 16px;
      border: 2px solid rgba(126, 200, 230, .46);
      border-radius: 999px;
      background: rgba(255, 255, 255, .96);
      box-shadow: 0 8px 24px rgba(45, 55, 72, .15);
      color: #2d3748;
      font: 800 14px "Nunito", sans-serif;
      text-decoration: none;
      transition: transform .18s ease, background .18s ease;
    }
    .game-return-menu:hover { transform: translateY(-3px); background: #e9f6fb; }
    .game-return-menu::before { content: "\\2190"; font-size: 18px; color: #4aa8cd; }
    @media (max-width: 540px) {
      .game-return-menu { right: 10px; bottom: 10px; padding: 9px 13px; font-size: 12px; }
    }
  `;
  const menuLink = document.createElement('a');
  menuLink.className = 'game-return-menu';
  menuLink.href = '/menuJogos';
  menuLink.textContent = 'Voltar ao menu';
  menuLink.setAttribute('aria-label', 'Voltar ao menu de jogos');
  document.head.appendChild(style);
  document.body.appendChild(menuLink);
});
