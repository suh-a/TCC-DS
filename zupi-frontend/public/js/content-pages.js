const ContentPages = {
  childId() {
    return localStorage.getItem('activeChildId') || localStorage.getItem('selectedChildId') || localStorage.getItem('childId') || '1';
  },

  escape(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  },

  async schoolItems(type) {
    if (!window.ZupiSchoolParentContent) return [];
    return ZupiSchoolParentContent.list(type);
  },

  emptyMessage(text) {
    return `<section class="col-12"><div class="alert alert-info mb-0">${this.escape(text)}</div></section>`;
  },

  async loadAtividades() {
    const el = document.getElementById('atividadesList');
    if (!el) return;
    const apiItems = (await ZupiAPI.fetchJson(`/content/atividades/${this.childId()}`)) || [];
    const schoolItems = await this.schoolItems('atividade');
    const items = [...schoolItems, ...apiItems];

    el.innerHTML = items.length ? items.map((a) => `
      <section class="col-md-4 col-lg-3">
        <article class="child-book-card">
          <span class="child-book-download">${a.link ? '->' : '+'}</span>
          <p class="mb-1 fw-semibold">${this.escape(a.title)}</p>
          <small>${this.escape(a.body || a.description || 'Atividade enviada pela escola.')}</small>
          ${a.deadline ? `<small class="d-block mt-2">Prazo: ${this.escape(a.deadline)}</small>` : ''}
          ${a.link ? `<a class="stretched-link" href="${this.escape(a.link)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir atividade"></a>` : ''}
        </article>
      </section>`).join('') : this.emptyMessage('Nenhuma atividade enviada ainda.');
  },

  async loadDicas() {
    const el = document.getElementById('dicasList');
    if (!el) return;
    const items = (await ZupiAPI.fetchJson('/content/dicas-inclusao')) || [];
    el.innerHTML = items.map((d) => `
      <article class="col-12">
        <section class="card mb-3">
          <section class="card-body">
            <h2 class="h5">${this.escape(d.title)}</h2>
            <p class="mb-0">${this.escape(d.body)}</p>
          </section>
        </section>
      </article>`).join('');
  },

  async loadFeed() {
    const el = document.getElementById('feedList');
    if (!el) return;
    const items = (await ZupiAPI.fetchJson('/content/feed')) || [];
    el.innerHTML = items.map((f) => `
      <section class="col-md-4">
        <section class="card h-100">
          <section class="card-body">
            <span class="badge bg-secondary mb-2">${this.escape(f.category)}</span>
            <h2 class="h6">${this.escape(f.title)}</h2>
            <p class="small">${this.escape(f.summary)}</p>
          </section>
        </section>
      </section>`).join('');
  },

  async loadGuia() {
    const el = document.getElementById('guiaContent');
    if (!el) return;
    const data = await ZupiAPI.fetchJson(`/content/guia-casa/${this.childId()}`);
    if (!data) return;
    el.innerHTML = `
      <section class="mb-4"><h2 class="h5">Recomendacoes da docente</h2><ul>${(data.recomendacoes || []).map((r) => `<li>${this.escape(r)}</li>`).join('')}</ul></section>
      <section class="mb-4"><h2 class="h5">Recursos personalizados</h2><ul>${(data.recursos || []).map((r) => `<li>${this.escape(r)}</li>`).join('')}</ul></section>
      <section><h2 class="h5">Acompanhamento em casa</h2><p>${this.escape(data.acompanhamento)}</p></section>`;
  },

  async loadDesafios() {
    const el = document.getElementById('desafiosList');
    if (!el) return;
    const apiItems = (await ZupiAPI.fetchJson('/content/desafios-semanais')) || [];
    const schoolItems = await this.schoolItems('desafio');
    const items = [...schoolItems, ...apiItems];

    el.innerHTML = items.length ? items.map((q) => `
      <article class="desafio-quiz-card mb-3" role="button" tabindex="0">
        <span>${this.escape(q.title || 'Desafio semanal')}</span>
        <small>${this.escape(q.body || q.description || 'Desafio enviado pela escola.')}</small>
        ${q.deadline ? `<small>Prazo: ${this.escape(q.deadline)}</small>` : ''}
      </article>
    `).join('') : '<div class="alert alert-info mb-0">Nenhum desafio enviado ainda.</div>';
  },

  async loadBiblioteca() {
    const el = document.getElementById('booksList');
    if (!el) return;
    const fallbackItems = [
      { title: 'Inclusao na pratica', body: 'Guia rapido com orientacoes para rotina escolar e familiar.' },
      { title: 'Historias ilustradas', body: 'Material de leitura para estimular comunicacao e imaginacao.' },
      { title: 'Atividades sensoriais', body: 'Sugestoes simples para trabalhar foco, calma e percepcao.' }
    ];
    let apiItems = [];
    let schoolItems = [];

    try {
      apiItems = (await ZupiAPI.fetchJson('/content/biblioteca')) || [];
    } catch (err) {
      console.warn('Biblioteca da API indisponivel.', err);
    }

    try {
      schoolItems = await this.schoolItems('biblioteca');
    } catch (err) {
      console.warn('Biblioteca da escola indisponivel.', err);
    }

    const items = [...schoolItems, ...apiItems];
    const visibleItems = items.length ? items : fallbackItems;

    el.innerHTML = visibleItems.map((book) => `
      <section class="col-md-4 col-lg-3">
        <article class="child-book-card">
          <span class="child-book-download" title="Material">${book.link ? '->' : '+'}</span>
          <p class="mb-1 fw-semibold">${this.escape(book.title)}</p>
          <small>${this.escape(book.body || book.summary || 'Material enviado pela escola.')}</small>
          ${book.link ? `<a class="stretched-link" href="${this.escape(book.link)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir material"></a>` : ''}
        </article>
      </section>
    `).join('');
  },

  downloadPdf(tipo) {
    const w = window.open('', '_blank');
    const content = document.getElementById('atividadesList') || document.getElementById('dicasList');
    w.document.write('<html><head><title>Zupi - ' + tipo + '</title></head><body>');
    w.document.write('<h1>Zupi - ' + tipo + '</h1>' + (content ? content.innerHTML : ''));
    w.document.write('</body></html>');
    w.document.close();
    w.print();
  }
};

window.ContentPages = ContentPages;
