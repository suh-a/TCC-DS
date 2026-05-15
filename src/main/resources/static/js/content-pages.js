const ContentPages = {
  API: window.API_BASE_URL || window.location.origin,

  childId() {
    return localStorage.getItem('activeChildId') || localStorage.getItem('selectedChildId') || '1';
  },

  async loadAtividades() {
    const el = document.getElementById('atividadesList');
    if (!el) return;
    const res = await fetch(`${this.API}/content/atividades/${this.childId()}`);
    const items = await res.json();
    el.innerHTML = items.map(a => `
      <div class="col-md-6">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h2 class="h5">${a.title}</h2>
            <p>${a.description}</p>
            <p class="small text-muted">Duração: ${a.duration}</p>
          </div>
        </div>
      </div>`).join('');
  },

  async loadDicas() {
    const el = document.getElementById('dicasList');
    if (!el) return;
    const res = await fetch(`${this.API}/content/dicas-inclusao`);
    const items = await res.json();
    el.innerHTML = items.map(d => `
      <article class="col-12">
        <div class="card mb-3">
          <div class="card-body">
            <h2 class="h5">${d.title}</h2>
            <p class="mb-0">${d.body}</p>
          </div>
        </div>
      </article>`).join('');
  },

  async loadFeed() {
    const el = document.getElementById('feedList');
    if (!el) return;
    const res = await fetch(`${this.API}/content/feed`);
    const items = await res.json();
    el.innerHTML = items.map(f => `
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body">
            <span class="badge bg-secondary mb-2">${f.category}</span>
            <h2 class="h6">${f.title}</h2>
            <p class="small">${f.summary}</p>
          </div>
        </div>
      </div>`).join('');
  },

  async loadGuia() {
    const el = document.getElementById('guiaContent');
    if (!el) return;
    const res = await fetch(`${this.API}/content/guia-casa/${this.childId()}`);
    const data = await res.json();
    el.innerHTML = `
      <section class="mb-4"><h2 class="h5">Recomendações da docente</h2><ul>${data.recomendacoes.map(r => `<li>${r}</li>`).join('')}</ul></section>
      <section class="mb-4"><h2 class="h5">Recursos personalizados</h2><ul>${data.recursos.map(r => `<li>${r}</li>`).join('')}</ul></section>
      <section><h2 class="h5">Acompanhamento em casa</h2><p>${data.acompanhamento}</p></section>`;
  },

  async loadDesafios() {
    const el = document.getElementById('desafiosList');
    if (!el) return;
    const res = await fetch(`${this.API}/content/desafios-semanais`);
    const items = await res.json();
    el.innerHTML = items.map(q => `
      <div class="col-md-6">
        <div class="card">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div><h2 class="h6 mb-0">${q.title}</h2><small class="text-muted">${q.questions} perguntas</small></div>
            <button class="btn btn-primary btn-sm" type="button">Iniciar quiz</button>
          </div>
        </div>
      </div>`).join('');
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

