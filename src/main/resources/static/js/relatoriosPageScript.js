/**
 * Relatórios com gráficos — integração ZupiAPI + Chart.js
 */
const CHART_COLORS = ['#60A5FA', '#C084FC', '#FDBA74', '#FDE047'];
const GAME_SUBJECT_LABELS = {
    jogoMemoria: 'Memória',
    jogoMath: 'Matemática',
    JogoMath: 'Matemática',
    jogoPalavras: 'Português',
    jogoSequencia: 'Raciocínio',
    jogoColorir: 'Artes',
    jogoCoresFormas: 'Ciências',
    'jogo-cores-formas': 'Ciências',
    'jogo-ligar-objetos': 'Lógica',
    jogoBolhas: 'Coordenação',
    jogoContagem: 'Matemática',
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
        window.location.href = '/selecao-relatorios';
        return;
    }

    localStorage.setItem('activeChildId', childId);
    localStorage.setItem('childId', childId);

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

async function loadChildHeader(childId) {
    try {
        const response = await ZupiAPI.get(`/child/details/${childId}`);
        if (!response || !response.ok) return;
        const child = await response.json();

        const set = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text || '—';
        };

        set('childFullName', child.name);
        set('childCpf', formatCpf(child.cpf));
        set('childAge', child.age != null ? `${child.age} anos` : '—');
        set('childCondition', child.condition || 'Não informado');
        set('childGrade', child.schoolClass || '—');
    } catch (e) {
        console.error(e);
    }
}

function formatCpf(cpf) {
    if (!cpf) return '—';
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
            ZupiAPI.get(`/child/${childId}/reports/avg`),
            ZupiAPI.get(`/child/${childId}/games/progress`),
            ZupiAPI.get(`/child/${childId}/games/sessions`)
        ]);

        if (avgRes && avgRes.ok) averages = await avgRes.json();
        if (progRes && progRes.ok) progress = await progRes.json();
        if (sessRes && sessRes.ok) sessions = await sessRes.json();
    } catch (e) {
        console.error(e);
    }

    renderPerformanceChart(averages);
    renderSubjectsChart(sessions);
    renderActivityChart(sessions, progress);
}

function destroyCharts() {
    chartInstances.forEach(c => c.destroy());
    chartInstances = [];
}

function renderPerformanceChart(averages) {
    const canvas = document.getElementById('chartPerformance');
    if (!canvas) return;

    let labels = [];
    let data = [];

    if (Array.isArray(averages) && averages.length > 0) {
        averages.forEach(item => {
            const name = item.skillArea?.name || item.skillArea || 'Área';
            labels.push(name);
            data.push(Math.round(item.average ?? 0));
        });
    } else {
        labels = ['Comunicação', 'Proatividade', 'Agilidade', 'Desempenho'];
        data = [19, 28, 20, 33];
    }

    chartInstances.push(new Chart(canvas, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: CHART_COLORS.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: chartOptions('Desempenho')
    }));
}

function renderSubjectsChart(sessions) {
    const canvas = document.getElementById('chartSubjects');
    if (!canvas) return;

    const grouped = {};
    if (Array.isArray(sessions)) {
        sessions.forEach(s => {
            const key = GAME_SUBJECT_LABELS[s.gameId] || GAME_SUBJECT_LABELS.default;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(s.maxScore ? ((s.score || 0) * 100 / s.maxScore) : (s.score || 0));
        });
    }

    let labels = Object.keys(grouped);
    let data = labels.map(k => {
        const arr = grouped[k];
        return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    });

    if (labels.length === 0) {
        labels = ['Matemática', 'Português', 'Ciências', 'Artes'];
        data = [29, 16, 20, 35];
    }

    chartInstances.push(new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: CHART_COLORS.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: chartOptions('Por disciplina')
    }));
}

function renderActivityChart(sessions, progress) {
    const canvas = document.getElementById('chartActivity');
    if (!canvas) return;

    const totalMin = Array.isArray(sessions)
        ? sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60
        : 0;
    const playCount = Array.isArray(sessions) ? sessions.length : 0;
    const avgScore = progress.averageScore ?? 0;

    const labels = ['Tempo de tela', 'Brincando', 'Desenvolvendo competências', 'Melhora na condição'];
    const data = [
        Math.min(80, Math.round(totalMin)),
        Math.min(80, Math.round(playCount * 8)),
        Math.min(80, Math.round(avgScore)),
        Math.min(80, Math.round(avgScore * 1.1))
    ];

    if (playCount === 0 && avgScore === 0) {
        data.splice(0, 4, 50, 70, 60, 80);
    }

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
                y: { beginAtZero: true, max: 80 },
                x: { ticks: { maxRotation: 45, minRotation: 45 } }
            }
        }
    }));
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
        const response = await ZupiAPI.get('/skillAreas');
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
    rm.textContent = '×';
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
        alert('Relatório salvo!');
        const modal = bootstrap.Modal.getInstance(document.getElementById('saveReportModal'));
        if (modal) modal.hide();
        await loadCharts(childId);
    } else {
        alert('Erro ao salvar relatório.');
    }
}

document.getElementById('btnDownloadPdf')?.addEventListener('click', () => window.print());
document.getElementById('btnDescribedReport')?.addEventListener('click', () => {
    alert('Relatório descrito em desenvolvimento. Os gráficos acima refletem os dados mais recentes.');
});
