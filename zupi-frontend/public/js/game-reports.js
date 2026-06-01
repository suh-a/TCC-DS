const ZupiGameReports = (() => {
  const COLORS = ['#7ec8e6', '#a8d5ba', '#ffb980', '#f7d86a', '#9ed8ce', '#8fb8e8', '#f3a6a6'];
  const CATEGORY_LABELS = {
    Memoria: 'Memoria',
    Matematica: 'Matematica',
    Linguagem: 'Linguagem',
    'Memoria auditiva': 'Memoria auditiva',
    Artes: 'Artes',
    'Coordenacao visual': 'Coordenacao visual',
    Planejamento: 'Planejamento',
    Atencao: 'Atencao',
    Logica: 'Logica',
    Criatividade: 'Criatividade',
    'Percepcao visual': 'Percepcao visual',
    Associacao: 'Associacao',
    Coordenacao: 'Coordenacao',
    'Coordenacao motora': 'Coordenacao motora',
    Sequenciamento: 'Sequenciamento',
    'Controle inibitorio': 'Controle inibitorio',
    Atividades: 'Atividades'
  };

  function getChildId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('childId')
      || localStorage.getItem('activeChildId')
      || localStorage.getItem('selectedChildId')
      || localStorage.getItem('childId');
  }

  function displayCategory(area) {
    const value = area || 'Atividades';
    return CATEGORY_LABELS[value] || value;
  }

  function localSessions(childId) {
    if (!window.GameScore) return [];
    if (!childId) return GameScore.readSessions().map(normalizeSession);
    return GameScore.localSessions(childId);
  }

  function normalizeSession(session) {
    const info = window.GameScore?.gameInfo?.(session.gameId) || {};
    const score = Number(session.score) || 0;
    const maxScore = Number(session.maxScore) || info.maxScore || 100;
    return {
      ...session,
      gameName: session.gameName || info.name || session.gameId || 'Jogo',
      skillArea: displayCategory(session.skillArea || info.area || 'Atividades'),
      score,
      maxScore,
      errors: Number(session.errors) || 0,
      durationSeconds: Number(session.durationSeconds) || 0,
      percentage: Number(session.percentage) || Math.round(score * 100 / Math.max(1, maxScore)),
      completedAt: session.completedAt || new Date().toISOString()
    };
  }

  function mergeSessions(apiSessions, childId) {
    const all = [
      ...(Array.isArray(apiSessions) ? apiSessions : []),
      ...localSessions(childId)
    ].map(normalizeSession);

    const unique = new Map();
    all.forEach((session) => {
      const key = session.sessionId || `${session.gameId}-${session.completedAt}-${session.score}-${session.maxScore}`;
      unique.set(key, session);
    });

    return Array.from(unique.values()).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  }

  async function fetchApiSessions(childId) {
    if (!childId || typeof ZupiAPI === 'undefined') return [];
    try {
      const response = await ZupiAPI.get(`/child/${childId}/games/sessions`, { skipAuthRedirect: true });
      if (response && response.ok) return await response.json();
    } catch (e) {
      console.warn('Relatorios usando dados locais dos jogos.', e);
    }
    return [];
  }

  async function loadSessions(childId = getChildId()) {
    const apiSessions = await fetchApiSessions(childId);
    return mergeSessions(apiSessions, childId);
  }

  function average(values) {
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  }

  function statusLabel(value) {
    if (value >= 85) return 'Excelente';
    if (value >= 70) return 'Bom progresso';
    if (value >= 50) return 'Em desenvolvimento';
    if (value > 0) return 'Precisa de apoio';
    return 'Sem dados';
  }

  function summarize(sessions) {
    const list = Array.isArray(sessions) ? sessions.map(normalizeSession) : [];
    const totalSessions = list.length;
    const totalSeconds = list.reduce((sum, item) => sum + item.durationSeconds, 0);
    const totalErrors = list.reduce((sum, item) => sum + item.errors, 0);
    const averageScore = average(list.map(item => item.percentage));
    const best = list.reduce((chosen, item) => !chosen || item.percentage > chosen.percentage ? item : chosen, null);

    const byArea = {};
    const byGame = {};
    list.forEach((item) => {
      byArea[item.skillArea] = byArea[item.skillArea] || [];
      byArea[item.skillArea].push(item);

      byGame[item.gameName] = byGame[item.gameName] || {
        count: 0,
        percentages: [],
        errors: 0,
        seconds: 0,
        area: item.skillArea,
        latest: null
      };
      byGame[item.gameName].count += 1;
      byGame[item.gameName].percentages.push(item.percentage);
      byGame[item.gameName].errors += item.errors;
      byGame[item.gameName].seconds += item.durationSeconds;
      if (!byGame[item.gameName].latest || new Date(item.completedAt) > new Date(byGame[item.gameName].latest.completedAt)) {
        byGame[item.gameName].latest = item;
      }
    });

    return { totalSessions, totalSeconds, totalErrors, average: averageScore, best, byArea, byGame, latest: list.slice(0, 8) };
  }

  function areaAverages(sessions) {
    const summary = summarize(sessions);
    return Object.entries(summary.byArea).map(([label, items]) => {
      const value = average(items.map(item => item.percentage));
      return {
        label,
        value,
        count: items.length,
        errors: items.reduce((sum, item) => sum + item.errors, 0),
        seconds: items.reduce((sum, item) => sum + item.durationSeconds, 0),
        games: [...new Set(items.map(item => item.gameName))].length,
        status: statusLabel(value)
      };
    }).sort((a, b) => b.count - a.count || b.value - a.value);
  }

  function gameAverages(sessions) {
    const summary = summarize(sessions);
    return Object.entries(summary.byGame).map(([label, data]) => {
      const value = average(data.percentages);
      return {
        label,
        value,
        count: data.count,
        errors: data.errors,
        seconds: data.seconds,
        area: data.area,
        latest: data.latest,
        status: statusLabel(value)
      };
    }).sort((a, b) => b.count - a.count || b.value - a.value);
  }

  function formatMinutes(seconds) {
    const minutes = Math.round((seconds || 0) / 60);
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
  }

  function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function describeSession(item) {
    const errorText = item.errors === 0
      ? 'sem erros registrados'
      : `${item.errors} erro${item.errors === 1 ? '' : 's'} registrado${item.errors === 1 ? '' : 's'}`;
    return `${item.percentage}% de aproveitamento, ${formatMinutes(item.durationSeconds)} de jogo e ${errorText}. Categoria: ${item.skillArea}.`;
  }

  function renderMiniReport(container, sessions, options = {}) {
    if (!container) return;
    const summary = summarize(sessions);
    const title = options.title || 'Resumo dos jogos';
    const latestRows = summary.latest.length
      ? summary.latest.map((item) => `
          <li>
            <strong>${item.gameName}</strong>
            <span>${item.skillArea} | ${item.percentage}% | ${item.errors} erro${item.errors === 1 ? '' : 's'}</span>
          </li>
        `).join('')
      : '<li><strong>Nenhuma partida ainda</strong><span>Os dados aparecem aqui apos jogar.</span></li>';

    container.innerHTML = `
      <article class="zupi-report-panel">
        <header>
          <p>${title}</p>
          <strong>${summary.average}%</strong>
        </header>
        <div class="zupi-report-metrics">
          <span><b>${summary.totalSessions}</b> partidas</span>
          <span><b>${formatMinutes(summary.totalSeconds)}</b> de jogo</span>
          <span><b>${summary.totalErrors}</b> erros</span>
        </div>
        <div class="zupi-report-bar" aria-label="Porcentagem media">
          <i style="width:${Math.max(4, summary.average)}%"></i>
        </div>
        <ul class="zupi-report-list">${latestRows}</ul>
      </article>
    `;
  }

  function renderSimpleBars(container, items) {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = '<p class="text-muted mb-0">Jogue uma partida para criar os primeiros indicadores.</p>';
      return;
    }
    container.innerHTML = items.slice(0, 8).map((item, index) => `
      <div class="zupi-report-row">
        <span>${item.label}</span>
        <div><i style="width:${Math.max(4, item.value)}%;background:${COLORS[index % COLORS.length]}"></i></div>
        <strong>${item.value}%</strong>
      </div>
    `).join('');
  }

  function renderCategoryDetails(container, sessions) {
    if (!container) return;
    const items = areaAverages(sessions);
    if (!items.length) {
      container.innerHTML = '<article class="zupi-report-panel"><header><p>Categorias</p><strong>0</strong></header><p class="text-muted mb-0">Ainda nao ha jogos registrados para separar por categoria.</p></article>';
      return;
    }

    container.innerHTML = `
      <article class="zupi-report-panel">
        <header>
          <p>Categorias trabalhadas</p>
          <strong>${items.length}</strong>
        </header>
        <div class="zupi-category-grid">
          ${items.map((item, index) => `
            <section class="zupi-category-card">
              <span style="background:${COLORS[index % COLORS.length]}"></span>
              <h3>${item.label}</h3>
              <strong>${item.value}%</strong>
              <p>${item.status}</p>
              <small>${item.count} partida${item.count === 1 ? '' : 's'} | ${item.games} jogo${item.games === 1 ? '' : 's'} | ${item.errors} erro${item.errors === 1 ? '' : 's'}</small>
            </section>
          `).join('')}
        </div>
      </article>
    `;
  }

  function renderGameDetails(container, sessions) {
    if (!container) return;
    const items = gameAverages(sessions);
    if (!items.length) {
      container.innerHTML = '<article class="zupi-report-panel"><header><p>Detalhes por jogo</p><strong>0</strong></header><p class="text-muted mb-0">Quando a crianca jogar, cada jogo aparecera aqui com categoria, tempo, erros e aproveitamento.</p></article>';
      return;
    }

    container.innerHTML = `
      <article class="zupi-report-panel">
        <header>
          <p>Detalhes por jogo</p>
          <strong>${items.length}</strong>
        </header>
        <div class="zupi-game-detail-list">
          ${items.map((item, index) => `
            <section class="zupi-game-detail">
              <div>
                <p>${item.area}</p>
                <h3>${item.label}</h3>
                <small>${item.count} partida${item.count === 1 ? '' : 's'} | ${formatMinutes(item.seconds)} | ${item.errors} erro${item.errors === 1 ? '' : 's'}</small>
              </div>
              <div class="zupi-game-score" style="--score-color:${COLORS[index % COLORS.length]}">
                <strong>${item.value}%</strong>
                <span>${item.status}</span>
              </div>
            </section>
          `).join('')}
        </div>
      </article>
    `;
  }

  function renderLatestSessions(container, sessions) {
    if (!container) return;
    const list = summarize(sessions).latest;
    if (!list.length) {
      container.innerHTML = '<article class="zupi-report-panel"><header><p>Ultimas partidas</p><strong>0</strong></header><p class="text-muted mb-0">Nenhuma partida registrada ainda.</p></article>';
      return;
    }

    container.innerHTML = `
      <article class="zupi-report-panel">
        <header>
          <p>Ultimas partidas</p>
          <strong>${list.length}</strong>
        </header>
        <ul class="zupi-session-list">
          ${list.map(item => `
            <li>
              <div>
                <strong>${item.gameName}</strong>
                <span>${describeSession(item)}</span>
              </div>
              <time>${formatDate(item.completedAt)}</time>
            </li>
          `).join('')}
        </ul>
      </article>
    `;
  }

  function buildNarrative(sessions) {
    const summary = summarize(sessions);
    if (!summary.totalSessions) {
      return 'Ainda nao ha partidas registradas para este perfil. Assim que a crianca jogar, o Zupi vai organizar os resultados por categoria, jogo, tempo, erros e aproveitamento.';
    }
    const bestArea = areaAverages(sessions).sort((a, b) => b.value - a.value)[0];
    const bestGame = gameAverages(sessions).sort((a, b) => b.value - a.value)[0];
    return `Foram registradas ${summary.totalSessions} partida${summary.totalSessions === 1 ? '' : 's'}, com media geral de ${summary.average}% e ${formatMinutes(summary.totalSeconds)} de uso. A categoria com melhor resultado foi ${bestArea?.label || '-'} (${bestArea?.value || 0}%). O jogo com maior aproveitamento foi ${bestGame?.label || '-'} (${bestGame?.value || 0}%). Total de erros registrados: ${summary.totalErrors}.`;
  }

  return {
    getChildId,
    loadSessions,
    mergeSessions,
    summarize,
    areaAverages,
    gameAverages,
    formatMinutes,
    formatDate,
    describeSession,
    buildNarrative,
    renderMiniReport,
    renderSimpleBars,
    renderCategoryDetails,
    renderGameDetails,
    renderLatestSessions
  };
})();

window.ZupiGameReports = ZupiGameReports;
