const ZupiSchoolParentContent = (() => {
  const STORAGE_KEY = 'zupiSchoolParentContent';

  function readLocal() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function writeLocal(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(-200)));
  }

  function getUser() {
    return typeof ZupiAPI !== 'undefined' ? ZupiAPI.getUser() : {};
  }

  function activeChildId() {
    return localStorage.getItem('activeChildId')
      || localStorage.getItem('selectedChildId')
      || localStorage.getItem('childId');
  }

  function normalize(item) {
    return {
      id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: item.type || 'atividade',
      title: item.title || 'Conteudo',
      body: item.body || item.description || '',
      link: item.link || '',
      deadline: item.deadline || '',
      targetResponsibleId: item.targetResponsibleId ? String(item.targetResponsibleId) : '',
      targetChildId: item.targetChildId ? String(item.targetChildId) : '',
      authorName: item.authorName || getUser().name || 'Escola',
      createdAt: item.createdAt || new Date().toISOString()
    };
  }

  function visibleForCurrentUser(item) {
    const user = getUser();
    const responsibleId = user.id ? String(user.id) : '';
    const childId = activeChildId() ? String(activeChildId()) : '';
    const targetResponsible = item.targetResponsibleId ? String(item.targetResponsibleId) : '';
    const targetChild = item.targetChildId ? String(item.targetChildId) : '';

    const responsibleMatches = !targetResponsible || targetResponsible === responsibleId;
    const childMatches = !targetChild || !childId || targetChild === childId;
    return responsibleMatches && childMatches;
  }

  async function fetchRemote(type) {
    if (typeof ZupiAPI === 'undefined') return [];
    const user = getUser();
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (user.id) params.set('responsibleId', user.id);
    if (activeChildId()) params.set('childId', activeChildId());

    try {
      const data = await ZupiAPI.fetchJson(`/content/school-parent?${params.toString()}`, { skipAuthRedirect: true });
      return Array.isArray(data) ? data.map(normalize) : [];
    } catch (e) {
      return [];
    }
  }

  async function list(type) {
    const remote = await fetchRemote(type);
    const local = readLocal()
      .map(normalize)
      .filter(item => (!type || item.type === type) && visibleForCurrentUser(item));

    const unique = new Map();
    [...remote, ...local].forEach(item => unique.set(item.id, item));
    return Array.from(unique.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async function publish(item) {
    const payload = normalize(item);
    const local = readLocal().map(normalize);
    local.unshift(payload);
    writeLocal(local);

    if (typeof ZupiAPI !== 'undefined') {
      try {
        await ZupiAPI.post('/content/school-parent', payload, { skipAuthRedirect: true });
      } catch (e) {
        console.warn('Conteudo salvo localmente; backend indisponivel.', e);
      }
    }

    window.dispatchEvent(new CustomEvent('zupi:school-parent-content', { detail: payload }));
    return payload;
  }

  return { list, publish, readLocal, activeChildId };
})();

window.ZupiSchoolParentContent = ZupiSchoolParentContent;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('schoolParentContentForm');
  if (!form) return;

  const responsibleSelect = document.getElementById('contentResponsible');
  const listEl = document.getElementById('schoolParentContentList');

  async function loadResponsibles() {
    if (!responsibleSelect || typeof ZupiAPI === 'undefined') return;
    try {
      const data = await ZupiAPI.fetchJson('/school/responsibles?q=');
      const items = Array.isArray(data) ? data : [];
      responsibleSelect.innerHTML = '<option value="">Todos os responsaveis vinculados</option>' + items.map(item => (
        `<option value="${item.id}">${item.name || 'Responsavel'}${item.email ? ' - ' + item.email : ''}</option>`
      )).join('');
    } catch (e) {
      responsibleSelect.innerHTML = '<option value="">Todos os responsaveis vinculados</option>';
    }
  }

  function renderPublished() {
    if (!listEl) return;
    const items = ZupiSchoolParentContent.readLocal().map(normalize).slice(0, 8);
    if (!items.length) {
      listEl.innerHTML = '<p class="text-muted mb-0">Nenhum conteudo publicado ainda.</p>';
      return;
    }
    listEl.innerHTML = items.map(item => `
      <article class="border rounded p-3 mb-2">
        <div class="d-flex justify-content-between gap-2">
          <strong>${item.title}</strong>
          <span class="badge bg-primary">${labelForType(item.type)}</span>
        </div>
        <p class="small text-muted mb-1">${item.body || 'Sem descricao.'}</p>
        <small class="text-muted">Responsavel: ${item.targetResponsibleId || 'todos'} ${item.targetChildId ? '| Crianca: ' + item.targetChildId : ''}</small>
      </article>
    `).join('');
  }

  function labelForType(type) {
    if (type === 'desafio') return 'Desafio';
    if (type === 'biblioteca') return 'Biblioteca';
    return 'Atividade';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const item = {
      type: document.getElementById('contentType')?.value || 'atividade',
      targetResponsibleId: document.getElementById('contentResponsible')?.value || '',
      targetChildId: document.getElementById('contentChildId')?.value.trim() || '',
      title: document.getElementById('contentTitle')?.value.trim(),
      body: document.getElementById('contentBody')?.value.trim(),
      link: document.getElementById('contentLink')?.value.trim(),
      deadline: document.getElementById('contentDeadline')?.value || ''
    };

    if (!item.title || !item.body) {
      alert('Preencha titulo e descricao.');
      return;
    }

    await ZupiSchoolParentContent.publish(item);
    form.reset();
    await loadResponsibles();
    renderPublished();
    alert('Conteudo publicado para os pais.');
  });

  loadResponsibles();
  renderPublished();
});
