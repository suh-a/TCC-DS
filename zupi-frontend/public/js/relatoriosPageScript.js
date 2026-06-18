const CHART_COLORS = ['#7EC8E6', '#A8D5BA', '#FFB980', '#F7D86A', '#9ED8CE', '#8FB8E8', '#F3A6A6'];
const GAME_SUBJECT_LABELS = {
    jogoMemoria: 'Memoria',
    jogoMath: 'Matematica',
    JogoMath: 'Matematica',
    jogoPalavras: 'Linguagem',
    jogoLetra: 'Linguagem',
    jogoSequenciaSons: 'Memoria auditiva',
    jogoColorir: 'Artes',
    jogoPintura: 'Artes',
    jogoMosaico: 'Coordenacao visual',
    jogoRotas: 'Planejamento',
    jogoFocoCores: 'Atencao',
    jogoPadroes: 'Logica',
    jogoCenarios: 'Criatividade',
    jogoCoresFormas: 'Percepcao visual',
    'jogo-cores-formas': 'Percepcao visual',
    'jogo-ligar-objetos': 'Associacao',
    jogoBolhas: 'Coordenacao',
    jogoContagem: 'Matematica',
    jogoBalao: 'Atencao',
    jogoClique: 'Atencao',
    jogoOrdem: 'Sequenciamento',
    jogoSombras: 'Percepcao visual',
    jogoCatch: 'Coordenacao motora',
    jogoBolao: 'Coordenacao motora',
    jogoBomba: 'Controle inibitorio',
    default: 'Atividades'
};

let chartInstances = [];
let skillThemes = [];

document.addEventListener('DOMContentLoaded', async function () {
    if (typeof ZupiAPI !== 'undefined' && !ZupiAPI.requireAuth()) return;

    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            ZupiAPI.logout();
        });
    });

    const childId = getChildId();
    if (!childId) {
        window.location.href = getReportFallbackPath();
        return;
    }

    setupReportBackLink(childId);

    localStorage.setItem('activeChildId', childId);
    localStorage.setItem('childId', childId);

    if (window.GameScore?.flushPendingSessions) {
        await GameScore.flushPendingSessions(childId);
    } else if (window.ZupiGameScoreReady) {
        await window.ZupiGameScoreReady;
    }

    await loadSkillThemes();
    await loadChildHeader(childId);
    await loadCharts(childId);
    setupReportModal(childId);
});

function getChildId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('childId')
        || localStorage.getItem('activeChildId')
        || localStorage.getItem('childId');
}

function freshUrl(path) {
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}_=${Date.now()}`;
}

function safeLocalPath(value) {
    if (!value) return '';
    try {
        const url = new URL(value, window.location.origin);
        if (url.origin !== window.location.origin) return '';
        return `${url.pathname}${url.search}${url.hash}`;
    } catch (_) {
        return '';
    }
}

function getReportFallbackPath(childId = getChildId()) {
    const type = typeof ZupiAPI !== 'undefined' ? ZupiAPI.getUser().type : '';
    const encodedChildId = childId ? encodeURIComponent(childId) : '';

    if (type === 'ESCOLA') return '/dashboard-escola#relatorios';
    if (type === 'DOCENTE') return '/dashboard-docente#relatorios';
    if (type === 'RESPONSAVEL_CREDENCIADO') return '/dashboard-responsavel-credenciado#relatorios-escola';
    if (type === 'ALUNO_CREDENCIADO') return encodedChildId ? `/perfil-crianca?childId=${encodedChildId}` : '/dashboard-aluno-credenciado';
    if (type === 'CRIANCA') return encodedChildId ? `/perfil-crianca?childId=${encodedChildId}` : '/dashboard-crianca';
    if (type === 'ADMIN') return '/dashboard-admin';
    return '/selecao-relatorios';
}

function resolveReportBackPath(childId) {
    const params = new URLSearchParams(window.location.search);
    const explicitReturn = safeLocalPath(params.get('returnTo'));
    if (explicitReturn) return explicitReturn;

    const referrer = safeLocalPath(document.referrer);
    if (referrer.startsWith('/perfil-crianca')) {
        return `/perfil-crianca?childId=${encodeURIComponent(childId)}`;
    }

    const userType = typeof ZupiAPI !== 'undefined' ? ZupiAPI.getUser().type : '';
    if (userType === 'RESPONSAVEL' && localStorage.getItem('activeProfile') === 'CRIANCA') {
        return `/perfil-crianca?childId=${encodeURIComponent(childId)}`;
    }

    return getReportFallbackPath(childId);
}

function labelForBackPath(path) {
    if (path.includes('/perfil-crianca')) return '\u2190 Voltar ao perfil';
    if (path.includes('/dashboard-escola')) return '\u2190 Voltar ao painel da escola';
    if (path.includes('/dashboard-docente')) return '\u2190 Voltar ao painel do docente';
    if (path.includes('/dashboard-responsavel-credenciado')) return '\u2190 Voltar ao painel do responsavel';
    if (path.includes('/dashboard-aluno-credenciado') || path.includes('/dashboard-crianca')) return '\u2190 Voltar ao painel';
    if (path.includes('/dashboard-admin')) return '\u2190 Voltar ao painel admin';
    return '\u2190 Trocar perfil';
}

function setupReportBackLink(childId) {
    const backLink = document.querySelector('main a[href="/selecao-relatorios"]')
        || document.querySelector('a[href="/selecao-relatorios"]');
    if (!backLink) return;
    const path = resolveReportBackPath(childId);
    backLink.href = path;
    backLink.textContent = labelForBackPath(path);
}

async function loadChildHeader(childId) {
    try {
        const response = await ZupiAPI.get(freshUrl(`/child/details/${childId}`), { skipAuthRedirect: true, cache: 'no-store' });
        if (!response || !response.ok) return;
        const child = await response.json();

        const set = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text || '-';
        };

        set('childFullName', child.name);
        set('childCpf', formatCpf(child.cpf));
        set('childAge', child.age != null ? `${child.age} anos` : '-');
        set('childCondition', child.condition || 'Nao informado');
        set('childGrade', child.schoolClass || '-');
    } catch (e) {
        console.error(e);
    }
}

function formatCpf(cpf) {
    if (!cpf) return '-';
    const d = String(cpf).replace(/\D/g, '');
    if (d.length !== 11) return cpf;
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

async function loadCharts(childId) {
    destroyCharts();

    let averages = [];
    let progress = {};
    let sessions = [];

    try {
        const [avgRes, progRes, sessRes] = await Promise.all([
            ZupiAPI.get(freshUrl(`/child/${childId}/reports/avg`), { skipAuthRedirect: true, cache: 'no-store' }),
            ZupiAPI.get(freshUrl(`/child/${childId}/games/progress`), { skipAuthRedirect: true, cache: 'no-store' }),
            ZupiAPI.get(freshUrl(`/child/${childId}/games/sessions`), { skipAuthRedirect: true, cache: 'no-store' })
        ]);

        if (avgRes && avgRes.ok) averages = await avgRes.json();
        if (progRes && progRes.ok) progress = await progRes.json();
        if (sessRes && sessRes.ok) sessions = await sessRes.json();
    } catch (e) {
        console.error(e);
    }

    if (window.ZupiGameReports) {
        sessions = ZupiGameReports.mergeSessions(sessions, childId, {
            includeLocal: ZupiGameReports.shouldIncludeLocalSessions()
        });
        if (sessions.length) {
            const summary = ZupiGameReports.summarize(sessions);
            progress = {
                ...(progress || {}),
                averageScore: summary.average,
                errors: summary.totalErrors,
                totalSeconds: summary.totalSeconds,
                totalGames: summary.totalSessions
            };
            renderGameReportDetails(sessions);
        } else {
            renderGameReportFallback(averages, progress);
        }
    }

    renderPerformanceChart(averages, sessions);
    renderSubjectsChart(sessions, averages);
    renderActivityChart(sessions, progress);
}

function destroyCharts() {
    chartInstances.forEach(c => c.destroy());
    chartInstances = [];
}

function renderPerformanceChart(averages, sessions) {
    const canvas = document.getElementById('chartPerformance');
    if (!canvas) return;

    let labels = [];
    let data = [];

    if (window.ZupiGameReports && Array.isArray(sessions) && sessions.length) {
        const areas = ZupiGameReports.areaAverages(sessions);
        labels = areas.map(item => item.label);
        data = areas.map(item => item.value);
    } else if (Array.isArray(averages) && averages.length > 0) {
        averages.forEach(item => {
            const name = item.skillArea?.name || item.skillArea || 'Area';
            labels.push(name);
            data.push(Math.round(Number(item.average ?? item.score ?? item.value ?? 0)));
        });
    } else {
        labels = ['Sem dados'];
        data = [1];
    }

    chartInstances.push(new Chart(canvas, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: labels[0] === 'Sem dados' ? ['#E2E8F0'] : CHART_COLORS.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: chartOptions('Desempenho')
    }));
}

function renderSubjectsChart(sessions, averages = []) {
    const canvas = document.getElementById('chartSubjects');
    if (!canvas) return;

    const grouped = {};
    if (Array.isArray(sessions)) {
        sessions.forEach(s => {
            const key = s.skillArea || GAME_SUBJECT_LABELS[s.gameId] || GAME_SUBJECT_LABELS.default;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(s.percentage ?? (s.maxScore ? ((s.score || 0) * 100 / s.maxScore) : (s.score || 0)));
        });
    }

    if (Object.keys(grouped).length === 0 && Array.isArray(averages)) {
        averages.forEach(item => {
            const key = item.skillArea?.name || item.skillArea || 'Area';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(Number(item.average ?? item.score ?? item.value ?? 0));
        });
    }

    let labels = Object.keys(grouped);
    let data = labels.map(k => {
        const arr = grouped[k];
        return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    });

    if (labels.length === 0) {
        labels = ['Sem dados'];
        data = [1];
    }

    chartInstances.push(new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: labels[0] === 'Sem dados' ? ['#E2E8F0'] : CHART_COLORS.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: chartOptions('Por habilidade')
    }));
}

function renderActivityChart(sessions, progress) {
    const canvas = document.getElementById('chartActivity');
    if (!canvas) return;

    const totalMin = Array.isArray(sessions)
        ? sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60
        : 0;
    const fallbackSeconds = Number(progress?.totalSeconds ?? progress?.durationSeconds ?? progress?.totalDurationSeconds ?? 0);
    const effectiveTotalMin = totalMin || (fallbackSeconds / 60);
    const playCount = Array.isArray(sessions) && sessions.length
        ? sessions.length
        : Number(progress?.totalGames ?? progress?.sessions ?? progress?.count ?? 0);
    const avgScore = Number(progress?.averageScore ?? progress?.average ?? progress?.percentage ?? 0);
    const totalErrors = Number(progress?.errors ?? progress?.totalErrors ?? (Array.isArray(sessions) ? sessions.reduce((acc, s) => acc + (s.errors || 0), 0) : 0));

    const labels = ['Tempo de jogo', 'Partidas', 'Desempenho', 'Precisao'];
    const data = [
        Math.min(100, Math.round(effectiveTotalMin)),
        Math.min(100, Math.round(playCount * 8)),
        Math.min(100, Math.round(avgScore)),
        Math.min(100, Math.max(0, Math.round(avgScore - totalErrors)))
    ];

    chartInstances.push(new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Indicadores',
                data,
                backgroundColor: CHART_COLORS,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Atividades', font: { size: 14, weight: '600' } }
            },
            scales: {
                y: { beginAtZero: true, max: 100 },
                x: { ticks: { maxRotation: 45, minRotation: 45 } }
            }
        }
    }));
}

function averageNumbers(values) {
    const nums = values.map(Number).filter(value => Number.isFinite(value));
    return nums.length ? Math.round(nums.reduce((sum, value) => sum + value, 0) / nums.length) : 0;
}

function averageItemsFromReports(averages) {
    if (!Array.isArray(averages)) return [];
    return averages.map(item => ({
        label: item.skillArea?.name || item.skillArea || 'Area',
        value: Math.round(Number(item.average ?? item.score ?? item.value ?? 0))
    })).filter(item => item.label && Number.isFinite(item.value));
}

function renderGameReportFallback(averages, progress = {}) {
    const items = averageItemsFromReports(averages);
    const avg = Number(progress?.averageScore ?? progress?.average ?? progress?.percentage ?? averageNumbers(items.map(item => item.value))) || 0;
    const totalGames = Number(progress?.totalGames ?? progress?.sessions ?? progress?.count ?? 0);
    const totalSeconds = Number(progress?.totalSeconds ?? progress?.durationSeconds ?? progress?.totalDurationSeconds ?? 0);
    const totalErrors = Number(progress?.errors ?? progress?.totalErrors ?? 0);
    const hasAnyData = items.length > 0 || totalGames > 0 || avg > 0 || totalSeconds > 0 || totalErrors > 0;
    const displayItems = items.length ? items : (hasAnyData ? [{ label: 'Desempenho geral', value: avg }] : []);

    if (!hasAnyData) {
        renderGameReportDetails([]);
        return;
    }

    const summary = document.getElementById('gameReportSummary');
    if (summary) {
        const latestRows = displayItems.length
            ? displayItems.slice(0, 4).map(item => `<li><strong>${item.label}</strong><span>Media registrada: ${item.value}%</span></li>`).join('')
            : '<li><strong>Relatorio encontrado</strong><span>Aguardando partidas detalhadas dos jogos.</span></li>';

        summary.innerHTML = `
          <article class="zupi-report-panel">
            <header>
              <p>Relatorio automatico dos jogos</p>
              <strong>${avg}%</strong>
            </header>
            <div class="zupi-report-metrics">
              <span><b>${totalGames}</b> partidas</span>
              <span><b>${window.ZupiGameReports ? ZupiGameReports.formatMinutes(totalSeconds) : '0 min'}</b> de jogo</span>
              <span><b>${totalErrors}</b> erros</span>
            </div>
            <div class="zupi-report-bar" aria-label="Porcentagem media">
              <i style="width:${Math.max(4, avg)}%"></i>
            </div>
            <ul class="zupi-report-list">${latestRows}</ul>
          </article>
        `;
    }

    const avgEl = document.getElementById('gameReportAverage');
    if (avgEl) avgEl.textContent = `${avg}%`;
    if (window.ZupiGameReports) {
        ZupiGameReports.renderSimpleBars(document.getElementById('gameReportBars'), displayItems);
    }

    const category = document.getElementById('gameCategoryDetails');
    if (category) {
        category.innerHTML = `
          <article class="zupi-report-panel">
            <header>
              <p>Categorias trabalhadas</p>
              <strong>${displayItems.length}</strong>
            </header>
            <div class="zupi-category-grid">
              ${displayItems.map((item, index) => `
                <section class="zupi-category-card">
                  <span style="background:${CHART_COLORS[index % CHART_COLORS.length]}"></span>
                  <h3>${item.label}</h3>
                  <strong>${item.value}%</strong>
                  <p>${item.value >= 70 ? 'Bom progresso' : 'Em desenvolvimento'}</p>
                  <small>Media registrada em relatorio</small>
                </section>
              `).join('')}
            </div>
          </article>
        `;
    }

    const details = document.getElementById('gameDetails');
    if (details) {
        details.innerHTML = `
          <article class="zupi-report-panel">
            <header><p>Detalhes por jogo</p><strong>${totalGames}</strong></header>
            <div class="zupi-game-detail-list">
              <section class="zupi-game-detail">
                <div>
                  <p>Resumo geral</p>
                  <h3>Partidas registradas</h3>
                  <small>${totalGames} partida${totalGames === 1 ? '' : 's'} | ${window.ZupiGameReports ? ZupiGameReports.formatMinutes(totalSeconds) : '0 min'} | ${totalErrors} erro${totalErrors === 1 ? '' : 's'}</small>
                </div>
                <div class="zupi-game-score" style="--score-color:${CHART_COLORS[0]}">
                  <strong>${avg}%</strong>
                  <span>${avg >= 70 ? 'Bom progresso' : 'Em desenvolvimento'}</span>
                </div>
              </section>
            </div>
          </article>
        `;
    }

    const latest = document.getElementById('gameLatestSessions');
    if (latest) {
        latest.innerHTML = `<article class="zupi-report-panel"><header><p>Ultimas partidas</p><strong>${totalGames}</strong></header><p class="text-muted mb-0">Resumo carregado. As partidas detalhadas aparecerao aqui assim que a API retornar o historico completo.</p></article>`;
    }

    const narrative = document.getElementById('gameNarrative');
    if (narrative) {
        const best = [...displayItems].sort((a, b) => b.value - a.value)[0];
        narrative.textContent = `Foram carregadas ${totalGames} partida${totalGames === 1 ? '' : 's'} no resumo, com media geral de ${avg}% e ${window.ZupiGameReports ? ZupiGameReports.formatMinutes(totalSeconds) : '0 min'} de jogo. ${best ? `Melhor indicador: ${best.label} (${best.value}%).` : 'As partidas detalhadas aparecerao quando os jogos forem sincronizados com a API.'}`;
    }
}

function renderGameReportDetails(sessions) {
    if (!window.ZupiGameReports) return;
    const summary = ZupiGameReports.summarize(sessions);
    ZupiGameReports.renderMiniReport(
        document.getElementById('gameReportSummary'),
        sessions,
        { title: 'Relatorio automatico dos jogos' }
    );
    const avg = document.getElementById('gameReportAverage');
    if (avg) avg.textContent = `${summary.average}%`;
    ZupiGameReports.renderSimpleBars(
        document.getElementById('gameReportBars'),
        ZupiGameReports.gameAverages(sessions)
    );
    ZupiGameReports.renderCategoryDetails(document.getElementById('gameCategoryDetails'), sessions);
    ZupiGameReports.renderGameDetails(document.getElementById('gameDetails'), sessions);
    ZupiGameReports.renderLatestSessions(document.getElementById('gameLatestSessions'), sessions);
    const narrative = document.getElementById('gameNarrative');
    if (narrative) narrative.textContent = ZupiGameReports.buildNarrative(sessions);
}

function chartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: title, font: { size: 14, weight: '600' } }
        }
    };
}

async function loadSkillThemes() {
    try {
        const response = await ZupiAPI.get('/skillAreas', { skipAuthRedirect: true });
        if (response && response.ok) {
            skillThemes = await response.json();
        }
    } catch (e) {
        console.error(e);
    }
}

function setupReportModal(childId) {
    const select = document.getElementById('reportChild');
    if (select) {
        select.innerHTML = `<option value="${childId}" selected>Dependente selecionado</option>`;
    }

    const addBtn = document.getElementById('addScoreBtn');
    if (addBtn) {
        addBtn.addEventListener('click', addScoreField);
    }
    const container = document.getElementById('scoresContainer');
    if (container && container.children.length === 0) {
        addScoreField();
    }

    const saveBtn = document.getElementById('saveReportButton');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => saveReport(childId));
    }
}

function addScoreField() {
    const container = document.getElementById('scoresContainer');
    if (!container) return;
    const index = container.children.length;

    let options = '<option value="">Selecionar tema...</option>';
    skillThemes.forEach(t => {
        options += `<option value="${t.id}">${t.name}</option>`;
    });

    const wrap = document.createElement('div');
    wrap.className = 'score-field mb-2 p-2 border rounded';
    wrap.dataset.index = index;
    const row = document.createElement('div');
    row.className = 'row g-2';
    const col8 = document.createElement('DIV');
    col8.className = 'col-8';
    const sel = document.createElement('select');
    sel.className = 'form-select form-select-sm theme-select';
    sel.required = true;
    sel.innerHTML = options;
    col8.appendChild(sel);
    const col3 = document.createElement('DIV');
    col3.className = 'col-3';
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.className = 'form-control form-control-sm';
    inp.min = '0';
    inp.max = '100';
    inp.placeholder = '%';
    inp.required = true;
    col3.appendChild(inp);
    const col1 = document.createElement('DIV');
    col1.className = 'col-1';
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'btn btn-sm btn-danger remove-score';
    rm.textContent = 'x';
    rm.addEventListener('click', () => wrap.remove());
    col1.appendChild(rm);
    row.appendChild(col8);
    row.appendChild(col3);
    row.appendChild(col1);
    wrap.appendChild(row);
    container.appendChild(wrap);
}

async function saveReport(childId) {
    const container = document.getElementById('scoresContainer');
    const scores = [];
    container.querySelectorAll('.score-field').forEach(row => {
        const themeId = row.querySelector('select')?.value;
        const score = parseInt(row.querySelector('input')?.value, 10);
        if (themeId && !isNaN(score)) {
            scores.push({ themeId: parseInt(themeId, 10), score });
        }
    });

    if (scores.length === 0) {
        alert('Adicione pelo menos um score.');
        return;
    }

    const response = await ZupiAPI.post(`/child/${childId}/reports`, { scores });
    if (response && response.ok) {
        alert('Relatorio salvo!');
        const modal = bootstrap.Modal.getInstance(document.getElementById('saveReportModal'));
        if (modal) modal.hide();
        await loadCharts(childId);
    } else {
        alert('Erro ao salvar relatorio.');
    }
}

document.getElementById('btnDownloadPdf')?.addEventListener('click', () => window.print());
document.getElementById('btnDescribedReport')?.addEventListener('click', () => {
    const text = document.getElementById('gameNarrative')?.textContent || 'Ainda nao ha dados para descrever.';
    alert(text);
});
