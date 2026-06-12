document.addEventListener('DOMContentLoaded', async function () {
  if (typeof ZupiAPI === 'undefined' || !ZupiAPI.requireAuth()) return;

  const childId = resolveChildId();
  if (!childId) {
    showProfileError('Perfil infantil nao encontrado. Selecione uma crianca novamente.');
    return;
  }

  persistChildId(childId);

  if (window.ChildNav) {
    ChildNav.init({ active: 'perfil' });
  }

  try {
    const child = await ZupiAPI.fetchJson(`/child/details/${childId}`);
    renderChildData(child);
    await renderGameData(childId);
  } catch (error) {
    console.error('Erro ao carregar perfil infantil:', error);
    showProfileError('Nao foi possivel carregar o perfil infantil agora.');
  }
});

function resolveChildId() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('childId');
  if (fromUrl) return fromUrl;

  const stored = localStorage.getItem('activeChildId')
    || localStorage.getItem('selectedChildId')
    || localStorage.getItem('childId');
  if (stored) return stored;

  const user = typeof ZupiAPI !== 'undefined' ? ZupiAPI.getUser() : {};
  return ['CRIANCA', 'ALUNO_CREDENCIADO'].includes(user.type) ? user.id : null;
}

function persistChildId(childId) {
  localStorage.setItem('activeChildId', String(childId));
  localStorage.setItem('selectedChildId', String(childId));
  localStorage.setItem('childId', String(childId));
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderChildData(child) {
  setText('nomeCrianca', child?.name || 'Nome nao informado');
  setText('cpfCrianca', formatCpf(child?.cpf));
  setText('idadeCrianca', child?.age != null ? `${child.age} anos` : 'Nao informado');
  setText('condicaoCrianca', child?.condition || 'Nao informado');
  setText('anoEscolar', child?.schoolClass || 'Nao informado');
}

async function renderGameData(childId) {
  const sessions = window.ZupiGameReports
    ? await ZupiGameReports.loadSessions(childId)
    : [];

  const summary = window.ZupiGameReports
    ? ZupiGameReports.summarize(sessions)
    : emptySummary();

  const totalPoints = sessions.reduce((sum, session) => sum + (Number(session.score) || 0), 0);
  const medals = sessions.filter(session => Number(session.percentage) >= 80).length;

  setText('pontos', String(totalPoints));
  setText('jogosCompletos', String(summary.totalSessions));
  setText('medalhas', String(medals));

  if (window.ZupiGameReports) {
    ZupiGameReports.renderMiniReport(
      document.getElementById('perfilJogoResumo'),
      sessions,
      { title: 'Resumo dos jogos' }
    );
    ZupiGameReports.renderLatestSessions(document.getElementById('perfilUltimasPartidas'), sessions);
  }

  renderRewards(sessions);
}

function renderRewards(sessions) {
  const container = document.getElementById('recompensas-list');
  if (!container) return;

  if (!sessions.length) {
    container.innerHTML = `
      <div class="col-12 text-center text-muted py-4">
        <p>Voce ainda nao desbloqueou recompensas. Continue jogando!</p>
      </div>
    `;
    return;
  }

  const rewards = buildRewards(sessions);
  container.innerHTML = rewards.map(reward => `
    <div class="col-md-4">
      <div class="card h-100 text-center">
        <div class="card-body">
          <div class="display-6 mb-2">${reward.badge}</div>
          <h4 class="h6">${escapeHtml(reward.title)}</h4>
          <p class="small text-muted mb-0">${escapeHtml(reward.description)}</p>
        </div>
      </div>
    </div>
  `).join('');
}

function buildRewards(sessions) {
  const summary = window.ZupiGameReports ? ZupiGameReports.summarize(sessions) : emptySummary();
  const categories = window.ZupiGameReports ? ZupiGameReports.areaAverages(sessions) : [];
  const rewards = [];

  rewards.push({
    badge: '1',
    title: 'Primeira partida',
    description: 'Voce concluiu seu primeiro jogo no Zupi.'
  });

  if (summary.totalSessions >= 5) {
    rewards.push({
      badge: '5',
      title: 'Cinco jogos',
      description: 'Voce ja registrou cinco partidas.'
    });
  }

  if (summary.average >= 80) {
    rewards.push({
      badge: `${summary.average}%`,
      title: 'Otimo aproveitamento',
      description: 'Sua media geral esta acima de 80%.'
    });
  }

  if (categories.length >= 3) {
    rewards.push({
      badge: '3+',
      title: 'Explorador',
      description: 'Voce treinou tres ou mais categorias diferentes.'
    });
  }

  const best = summary.best;
  if (best) {
    rewards.push({
      badge: `${best.percentage}%`,
      title: best.gameName || 'Melhor jogo',
      description: `Melhor resultado recente em ${best.skillArea || 'Atividades'}.`
    });
  }

  return rewards.slice(0, 6);
}

function emptySummary() {
  return {
    totalSessions: 0,
    average: 0,
    best: null
  };
}

function formatCpf(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length !== 11) return value || 'Nao informado';
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function showProfileError(message) {
  const main = document.querySelector('.dashboard-main-content') || document.body;
  const alert = document.createElement('div');
  alert.className = 'alert alert-danger';
  alert.textContent = message;
  main.prepend(alert);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
