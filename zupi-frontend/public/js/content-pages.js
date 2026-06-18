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
    const endpoint = isPfChild ? '/content/pf/desafios-semanais' : '/content/desafios-semanais';
    const items = (await ZupiAPI.fetchJson(endpoint)) || [];
    if (!items.length) return;
    if (!isPfChild) {
      el.innerHTML = items.map((q) => `
        <article class="desafio-quiz-card mb-3">${this.escape(q.title || 'Quiz')}</article>
      `).join('');
      return;
    }
    el.innerHTML = items.map((q) => `
      <article class="desafio-quiz-card weekly-quiz-card mb-3" data-weekly-quiz="${this.escape(q.slug)}">
        <span class="weekly-quiz-card__icon" aria-hidden="true">${q.slug === 'meus-superpoderes' ? '⚡' : '💛'}</span>
        <section>
          <h3 class="h5 mb-1">${this.escape(q.title)}</h3>
          <p class="mb-2 text-muted">${this.escape(q.objective)}</p>
          <span class="badge rounded-pill text-bg-light">${q.questions.length} perguntas</span>
        </section>
        <button class="btn btn-primary ms-md-auto" type="button" data-start-quiz="${this.escape(q.slug)}">Começar</button>
      </article>
    `).join('');
    el.insertAdjacentHTML('beforeend', '<section id="weeklyQuizPlayer" class="weekly-quiz-player d-none" aria-live="polite"></section>');
    el.addEventListener('click', (event) => {
      const button = event.target.closest('[data-start-quiz]');
      if (button) this.startWeeklyQuiz(items.find(q => q.slug === button.dataset.startQuiz));
    });
  },

  startWeeklyQuiz(quiz) {
    if (!quiz) return;
    this.activeWeeklyQuiz = { quiz, index: 0, answers: [] };
    this.renderWeeklyQuestion();
    document.getElementById('weeklyQuizPlayer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  renderWeeklyQuestion() {
    const state = this.activeWeeklyQuiz;
    const player = document.getElementById('weeklyQuizPlayer');
    if (!state || !player) return;
    const question = state.quiz.questions[state.index];
    const progress = Math.round(((state.index + 1) / state.quiz.questions.length) * 100);
    player.classList.remove('d-none');
    player.innerHTML = `
      <header class="mb-3">
        <p class="small text-muted mb-1">Pergunta ${state.index + 1} de ${state.quiz.questions.length}</p>
        <div class="progress weekly-quiz-progress" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar" style="width:${progress}%"></div>
        </div>
      </header>
      <h3 class="h4 mb-4">${this.escape(question.prompt)}</h3>
      <section class="weekly-quiz-options">
        ${question.options.map((option) => `<button class="weekly-quiz-option" type="button" data-weekly-answer="${this.escape(option)}">${this.escape(option)}</button>`).join('')}
      </section>`;
    player.querySelectorAll('[data-weekly-answer]').forEach(button => {
      button.addEventListener('click', () => this.answerWeeklyQuiz(button.dataset.weeklyAnswer));
    });
  },

  answerWeeklyQuiz(answer) {
    const state = this.activeWeeklyQuiz;
    if (!state) return;
    state.answers[state.index] = answer;
    if (state.index < state.quiz.questions.length - 1) {
      state.index += 1;
      this.renderWeeklyQuestion();
      return;
    }
    this.finishWeeklyQuiz();
  },

  finishWeeklyQuiz() {
    const state = this.activeWeeklyQuiz;
    const player = document.getElementById('weeklyQuizPlayer');
    if (!state || !player) return;
    const isStrengths = state.quiz.slug === 'meus-superpoderes';
    const highlights = state.answers.slice(0, 3).map(answer => answer.replace(/^\S+\s*/, '')).join(', ');
    const feedback = isStrengths
      ? `Seus superpoderes incluem ${highlights}. Cada um deles torna seu jeito de aprender e ajudar muito especial!`
      : `${state.quiz.feedback} Quando precisar, lembre que respirar, pedir ajuda ou fazer uma pausa são escolhas muito corajosas.`;
    localStorage.setItem(`weeklyQuiz:${state.quiz.slug}:${this.childId()}`, JSON.stringify({
      answers: state.answers,
      completedAt: new Date().toISOString()
    }));
    player.innerHTML = `
      <section class="text-center py-3">
        <div class="weekly-quiz-result-icon" aria-hidden="true">${isStrengths ? '🌟' : '🌈'}</div>
        <h3 class="h4 mt-3">Você conseguiu!</h3>
        <p class="weekly-quiz-feedback">${this.escape(feedback)}</p>
        <button class="btn btn-outline-primary" type="button" data-restart-weekly>Responder novamente</button>
      </section>`;
    player.querySelector('[data-restart-weekly]')?.addEventListener('click', () => this.startWeeklyQuiz(state.quiz));
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
