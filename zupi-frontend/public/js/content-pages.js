const ContentPages = {
  childId() {
    return localStorage.getItem('activeChildId') || localStorage.getItem('selectedChildId') || '1';
  },

  async loadAtividades() {
    const el = document.getElementById('atividadesList');
    if (!el) return;
    const items = (await ZupiAPI.fetchJson(`/content/atividades/${this.childId()}`)) || [];
    el.innerHTML = items.map((a) => `
      <section class="col-md-4 col-lg-3">
        <article class="child-book-card">
          <span class="child-book-download">⬇</span>
          <p class="mb-0 fw-semibold">${a.title}</p>
        </article>
      </section>`).join('');
  },

  async loadDicas() {
    const el = document.getElementById('dicasList');
    if (!el) return;
    const items = (await ZupiAPI.fetchJson('/content/dicas-inclusao')) || [];
    el.innerHTML = items.map((d) => `
      <article class="col-12">
        <section class="card mb-3">
          <section class="card-body">
            <h2 class="h5">${d.title}</h2>
            <p class="mb-0">${d.body}</p>
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
            <span class="badge bg-secondary mb-2">${f.category}</span>
            <h2 class="h6">${f.title}</h2>
            <p class="small">${f.summary}</p>
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
      <section class="mb-4"><h2 class="h5">Recomendações da docente</h2><ul>${data.recomendacoes.map((r) => `<li>${r}</li>`).join('')}</ul></section>
      <section class="mb-4"><h2 class="h5">Recursos personalizados</h2><ul>${data.recursos.map((r) => `<li>${r}</li>`).join('')}</ul></section>
      <section><h2 class="h5">Acompanhamento em casa</h2><p>${data.acompanhamento}</p></section>`;
  },

  async loadDesafios() {
    const el = document.getElementById('desafiosList');
    if (!el) return;
    const items = (await ZupiAPI.fetchJson('/content/desafios-semanais')) || [];
    if (!items.length) return;
    el.innerHTML = items.map((q) => `
      <article class="desafio-quiz-card mb-3" role="button" tabindex="0">${q.title || 'Quiz'}</article>
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
