const ContentPages = {
  atividades: [
    {
      titulo: 'Atenção, Emoções e Organização',
      descricao: 'Atividade adaptada para reconhecimento de emoções, atenção e rotina.',
      objetivo: 'Estimular autopercepção, foco e organização.',
      arquivo: '/atividades/atividade_educativa_neurodivergente.pdf'
    },
    {
      titulo: 'Explorando Emoções',
      descricao: 'Atividade para ajudar a criança a identificar e expressar sentimentos.',
      objetivo: 'Desenvolver educação emocional.',
      arquivo: '/atividades/atividade_neurodivergente_emocoes.pdf'
    },
    {
      titulo: 'Treinando Atenção e Organização',
      descricao: 'Atividade com desafios simples de foco, memória e planejamento.',
      objetivo: 'Estimular atenção, memória e funções executivas.',
      arquivo: '/atividades/atividade_neurodivergente_atencao.pdf'
    }
  ],

  desafiosPf: [
    {
      id: 'missao-gentileza',
      titulo: 'Missão da Gentileza',
      icone: '💛',
      categoria: 'Cuidar',
      descricao: 'Faça uma coisa gentil por alguém nesta semana.',
      missao: 'Você pode ajudar, agradecer, dividir algo ou fazer um elogio.',
      dica: 'Um gesto pequeno já conta. Escolha algo que deixe você confortável.',
      tema: 'amarelo'
    },
    {
      id: 'desafio-emocoes',
      titulo: 'Desafio das Emoções',
      icone: '😊',
      categoria: 'Sentir',
      descricao: 'Escolha uma carinha ou uma cor para mostrar como você se sentiu hoje.',
      missao: 'Vale desenhar, apontar ou contar para uma pessoa de confiança.',
      dica: 'Todas as emoções são bem-vindas. Não existe resposta certa ou errada.',
      tema: 'azul'
    },
    {
      id: 'organizacao-divertida',
      titulo: 'Organização Divertida',
      icone: '🧸',
      categoria: 'Organizar',
      descricao: 'Escolha um cantinho pequeno para organizar.',
      missao: 'Guarde alguns brinquedos, lápis ou materiais enquanto ouve uma música.',
      dica: 'Faça só um pouquinho. Quando terminar, comemore sua conquista!',
      tema: 'verde'
    },
    {
      id: 'explorador-semana',
      titulo: 'Explorador da Semana',
      icone: '🔎',
      categoria: 'Descobrir',
      descricao: 'Observe algo interessante perto de você.',
      missao: 'Encontre três cores, um som diferente ou algo bonito na natureza.',
      dica: 'Você pode contar, desenhar ou mostrar o que descobriu.',
      tema: 'lilas'
    },
    {
      id: 'super-respiracao',
      titulo: 'Super Respiração',
      icone: '🌬️',
      categoria: 'Pausar',
      descricao: 'Faça uma pausa curta para respirar e alongar o corpo.',
      missao: 'Puxe o ar devagar, solte como se apagasse uma vela e repita três vezes.',
      dica: 'Pare se não estiver confortável. Você também pode só espreguiçar os braços.',
      tema: 'coral'
    }
  ],

  childId() {
    const user = typeof ZupiAPI !== 'undefined' ? ZupiAPI.getUser() : {};
    return localStorage.getItem('activeChildId')
      || localStorage.getItem('selectedChildId')
      || (['CRIANCA', 'ALUNO_CREDENCIADO'].includes(user.type) ? user.id : null);
  },

  isSchoolContext() {
    const type = typeof ZupiAPI !== 'undefined' ? ZupiAPI.getUser().type : null;
    return ['ALUNO_CREDENCIADO', 'RESPONSAVEL_CREDENCIADO', 'ESCOLA', 'DOCENTE'].includes(type);
  },

  async loadAtividades() {
    const el = document.getElementById('atividadesList');
    if (!el) return;
    if (this.isSchoolContext()) {
      const childId = this.childId();
      if (!childId) {
        el.innerHTML = '<section class="col-12"><p class="text-muted text-center">Selecione um aluno para ver as atividades da turma.</p></section>';
        return;
      }
      const items = (await ZupiAPI.fetchJson(`/content/school/activities/${childId}`, { skipAuthRedirect: true })) || [];
      if (!items.length) {
        el.innerHTML = '<section class="col-12"><p class="text-muted text-center">Nenhuma atividade publicada para esta turma.</p></section>';
        return;
      }
      el.innerHTML = items.map((atividade) => `
        <section class="col-12 col-md-6 col-xl-4">
          <article class="activity-card h-100">
            <span class="activity-card__badge" aria-hidden="true">${this.escape(atividade.className || 'Turma')}</span>
            <h2 class="activity-card__title">${this.escape(atividade.title)}</h2>
            <p class="activity-card__description">${this.escape(atividade.description || '')}</p>
            ${atividade.deadline ? `<p class="activity-card__objective"><strong>Prazo:</strong> ${new Date(atividade.deadline + 'T00:00:00').toLocaleDateString('pt-BR')}</p>` : ''}
            <section class="activity-card__actions" aria-label="Acoes para ${this.escape(atividade.title)}">
              ${atividade.link ? `<a class="btn btn-primary" href="${this.escape(atividade.link)}" target="_blank" rel="noopener">Abrir atividade</a>` : ''}
            </section>
          </article>
        </section>`).join('');
      return;
    }
    el.innerHTML = this.atividades.map((atividade) => `
      <section class="col-12 col-md-6 col-xl-4">
        <article class="activity-card h-100">
          <span class="activity-card__badge" aria-hidden="true">PDF</span>
          <h2 class="activity-card__title">${atividade.titulo}</h2>
          <p class="activity-card__description">${atividade.descricao}</p>
          <p class="activity-card__objective">
            <strong>Objetivo pedagógico:</strong> ${atividade.objetivo}
          </p>
          <section class="activity-card__actions" aria-label="Ações para ${atividade.titulo}">
            <a class="btn btn-primary" href="${atividade.arquivo}" download>
              Baixar PDF
            </a>
            <a class="btn btn-outline-primary" href="${atividade.arquivo}" target="_blank" rel="noopener">
              Visualizar
            </a>
          </section>
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
    const user = ZupiAPI.getUser();
    const isPfChild = user.type === 'CRIANCA'
      || (user.type === 'RESPONSAVEL' && localStorage.getItem('activeProfile') === 'CRIANCA');
    if (this.isSchoolContext()) {
      const childId = this.childId();
      if (!childId) {
        el.innerHTML = '<p class="text-muted text-center">Selecione um aluno para ver os desafios da turma.</p>';
        return;
      }
      const items = (await ZupiAPI.fetchJson(`/content/school/desafios-semanais/${childId}`, { skipAuthRedirect: true })) || [];
      if (!items.length) {
        el.innerHTML = '<p class="text-muted text-center">Nenhum desafio semanal publicado para esta turma.</p>';
        return;
      }
      el.innerHTML = items.map((q) => `
        <article class="desafio-quiz-card mb-3">
          <h3 class="h5 mb-1">${this.escape(q.title || 'Quiz')}</h3>
          <p class="mb-1">${this.escape(q.description || '')}</p>
          <span class="badge rounded-pill text-bg-light">${this.escape(q.className || 'Turma')}</span>
        </article>
      `).join('');
      return;
    }
    if (!isPfChild) {
      const items = (await ZupiAPI.fetchJson('/content/desafios-semanais')) || [];
      if (!items.length) return;
      el.innerHTML = items.map((q) => `
        <article class="desafio-quiz-card mb-3">${this.escape(q.title || 'Quiz')}</article>
      `).join('');
      return;
    }
    const items = this.desafiosPf;
    const completed = this.completedWeeklyChallenges();
    el.innerHTML = items.map((challenge) => `
      <section class="col-12 col-md-6 col-xl-4">
        <article class="weekly-challenge-card weekly-challenge-card--${challenge.tema} h-100 ${completed.has(challenge.id) ? 'is-complete' : ''}">
          <header class="weekly-challenge-card__header">
            <span class="weekly-challenge-card__icon" aria-hidden="true">${challenge.icone}</span>
            <span class="weekly-challenge-card__category">${this.escape(challenge.categoria)}</span>
          </header>
          <h2 class="weekly-challenge-card__title">${this.escape(challenge.titulo)}</h2>
          <p class="weekly-challenge-card__description">${this.escape(challenge.descricao)}</p>
          <p class="weekly-challenge-card__status" aria-live="polite">
            ${completed.has(challenge.id) ? '⭐ Missão concluída!' : 'Pronta para começar'}
          </p>
          <button class="btn weekly-challenge-card__button" type="button" data-open-challenge="${challenge.id}">
            ${completed.has(challenge.id) ? 'Ver novamente' : 'Começar missão'}
          </button>
        </article>
      </section>
    `).join('');
    el.insertAdjacentHTML('beforeend', '<section class="col-12"><section id="weeklyChallengeDetail" class="weekly-challenge-detail d-none" aria-live="polite"></section></section>');
    el.addEventListener('click', (event) => {
      const button = event.target.closest('[data-open-challenge]');
      if (button) this.openWeeklyChallenge(items.find(item => item.id === button.dataset.openChallenge));
    });
    this.renderWeeklyProgress();
  },

  weeklyChallengeStorageKey() {
    return `weeklyChallenges:${this.childId() || 'pf'}`;
  },

  completedWeeklyChallenges() {
    try {
      return new Set(JSON.parse(localStorage.getItem(this.weeklyChallengeStorageKey()) || '[]'));
    } catch (_) {
      return new Set();
    }
  },

  openWeeklyChallenge(challenge) {
    const detail = document.getElementById('weeklyChallengeDetail');
    if (!challenge || !detail) return;
    const completed = this.completedWeeklyChallenges().has(challenge.id);
    detail.classList.remove('d-none');
    detail.innerHTML = `
      <section class="weekly-challenge-detail__icon" aria-hidden="true">${challenge.icone}</section>
      <section class="weekly-challenge-detail__content">
        <span class="weekly-challenge-detail__eyebrow">Sua missão</span>
        <h2 class="h3">${this.escape(challenge.titulo)}</h2>
        <p class="weekly-challenge-detail__mission">${this.escape(challenge.missao)}</p>
        <p class="weekly-challenge-detail__tip"><span aria-hidden="true">💡</span> ${this.escape(challenge.dica)}</p>
        <section class="weekly-challenge-detail__actions">
          <button class="btn btn-primary" type="button" data-complete-challenge="${challenge.id}">
            ${completed ? 'Já concluí esta missão ⭐' : 'Concluí minha missão!'}
          </button>
          <button class="btn btn-outline-primary" type="button" data-close-challenge>Escolher outra</button>
        </section>
      </section>`;
    detail.querySelector('[data-complete-challenge]').addEventListener('click', () => this.completeWeeklyChallenge(challenge.id));
    detail.querySelector('[data-close-challenge]').addEventListener('click', () => {
      detail.classList.add('d-none');
      document.getElementById('desafiosList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    detail.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  completeWeeklyChallenge(challengeId) {
    const completed = this.completedWeeklyChallenges();
    completed.add(challengeId);
    localStorage.setItem(this.weeklyChallengeStorageKey(), JSON.stringify([...completed]));
    const card = document.querySelector(`[data-open-challenge="${challengeId}"]`)?.closest('.weekly-challenge-card');
    card?.classList.add('is-complete');
    if (card) {
      card.querySelector('.weekly-challenge-card__status').textContent = '⭐ Missão concluída!';
      card.querySelector('.weekly-challenge-card__button').textContent = 'Ver novamente';
    }
    const detail = document.getElementById('weeklyChallengeDetail');
    if (detail) {
      detail.querySelector('[data-complete-challenge]').textContent = 'Você conseguiu! ⭐';
      detail.classList.add('is-complete');
    }
    this.renderWeeklyProgress();
  },

  renderWeeklyProgress() {
    const progress = document.getElementById('weeklyProgress');
    if (!progress) return;
    const count = this.completedWeeklyChallenges().size;
    const total = this.desafiosPf.length;
    const percentage = Math.round((count / total) * 100);
    progress.innerHTML = `
      <section>
        <strong>${count === 0 ? 'Sua semana começa aqui!' : `${count} ${count === 1 ? 'missão concluída' : 'missões concluídas'}`}</strong>
        <span>${count === total ? 'Que semana incrível! Você completou todas as missões.' : 'Cada pequena conquista merece comemoração.'}</span>
      </section>
      <section class="weekly-progress-card__bar" aria-label="${percentage}% das missões concluídas">
        <span style="width:${percentage}%"></span>
      </section>
      <strong class="weekly-progress-card__count">${count}/${total}</strong>`;
  },

  escape(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
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
