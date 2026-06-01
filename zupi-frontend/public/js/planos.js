const plans = {
  pf: {
    audience: 'Para famílias',
    title: 'Plano Pessoa Física',
    description: 'Para responsáveis que querem acompanhar a evolução da criança em casa, com atividades guiadas, relatórios simples e apoio para a rotina.',
    price: 'R$ 80',
    cycle: 'por mês',
    buyHref: '/cadastro?tipo=pf',
    includes: [
      'Perfil individual da criança com dados de acompanhamento.',
      'Jogos educativos para memória, atenção, linguagem, contagem, formas e cores.',
      'Relatórios simples para visualizar progresso e frequência.',
      'Agenda para organizar momentos de estudo, brincadeira e apoio.',
      'Biblioteca com conteúdos e dicas para responsáveis.'
    ],
    bestFor: [
      'Famílias que acompanham uma criança em casa.',
      'Responsáveis que querem entender evolução sem relatórios complicados.',
      'Crianças que se engajam melhor com atividades visuais e interativas.'
    ],
    routine: [
      'Escolha atividades curtas durante a semana.',
      'Observe áreas com mais facilidade ou dificuldade.',
      'Use os registros para conversar com escola e profissionais.'
    ],
    highlights: [
      ['1', 'criança acompanhada'],
      ['12+', 'habilidades observadas'],
      ['24h', 'acesso à rotina']
    ],
    buyTitle: 'Pronto para começar com Pessoa Física?',
    buyText: 'Você será levado para o cadastro com o tipo de conta familiar já selecionado.',
    buyLabel: 'Comprar Pessoa Física'
  },
  pj: {
    audience: 'Para escolas e instituições',
    title: 'Plano Pessoa Jurídica',
    description: 'Para escolas, clínicas e instituições que precisam organizar turmas, perfis, docentes e relatórios em uma experiência centralizada.',
    price: 'R$ 700',
    cycle: 'por mês',
    buyHref: '/cadastro?tipo=pj',
    includes: [
      'Cadastro de múltiplas crianças e organização por turma.',
      'Painéis para escola, docentes e administração.',
      'Relatórios por criança, turma, frequência e área de habilidade.',
      'Agenda institucional para alinhar rotina entre equipe e responsáveis.',
      'Biblioteca e conteúdos de apoio para práticas inclusivas.',
      'Base para implantação pedagógica com acompanhamento recorrente.'
    ],
    bestFor: [
      'Escolas que querem acompanhar desenvolvimento com mais clareza.',
      'Instituições que precisam reduzir registros soltos e centralizar dados.',
      'Equipes pedagógicas que trabalham com inclusão, rotina e evolução.'
    ],
    routine: [
      'Cadastre turmas e vincule crianças aos responsáveis.',
      'Acompanhe atividades por docente, turma e habilidade.',
      'Use os relatórios para reuniões pedagógicas e devolutivas familiares.'
    ],
    highlights: [
      ['Turmas', 'organização institucional'],
      ['Equipe', 'acesso para gestão e docentes'],
      ['Dados', 'relatórios por grupo']
    ],
    buyTitle: 'Pronto para começar com Pessoa Jurídica?',
    buyText: 'Você será levado para o cadastro com o tipo de conta institucional já selecionado.',
    buyLabel: 'Comprar Pessoa Jurídica'
  }
};

function fillList(element, items) {
  element.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function setPlan(type) {
  const plan = plans[type] || plans.pf;
  const detail = document.getElementById('planDetail');

  document.querySelectorAll('.plan-switch').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.plan === type);
  });

  document.getElementById('planAudience').textContent = plan.audience;
  document.getElementById('planTitle').textContent = plan.title;
  document.getElementById('planDescription').textContent = plan.description;
  document.getElementById('planPrice').textContent = plan.price;
  document.getElementById('planCycle').textContent = plan.cycle;
  document.getElementById('buyPlan').href = plan.buyHref;
  document.getElementById('buyPlanBottom').href = plan.buyHref;
  document.getElementById('buyPlan').textContent = plan.buyLabel;
  document.getElementById('buyPlanBottom').textContent = plan.buyLabel;
  document.getElementById('buyTitle').textContent = plan.buyTitle;
  document.getElementById('buyText').textContent = plan.buyText;

  fillList(document.getElementById('planIncludes'), plan.includes);
  fillList(document.getElementById('planBestFor'), plan.bestFor);
  fillList(document.getElementById('planRoutine'), plan.routine);

  document.getElementById('highlightOneValue').textContent = plan.highlights[0][0];
  document.getElementById('highlightOneLabel').textContent = plan.highlights[0][1];
  document.getElementById('highlightTwoValue').textContent = plan.highlights[1][0];
  document.getElementById('highlightTwoLabel').textContent = plan.highlights[1][1];
  document.getElementById('highlightThreeValue').textContent = plan.highlights[2][0];
  document.getElementById('highlightThreeLabel').textContent = plan.highlights[2][1];

  const url = new URL(window.location.href);
  url.searchParams.set('tipo', type);
  window.history.replaceState({}, '', url);
  window.localStorage.setItem('zupiPlanoSelecionado', type);
  document.title = `${plan.title} - Zupi`;

  detail.classList.remove('is-switching');
  window.requestAnimationFrame(() => detail.classList.add('is-switching'));
}

function setupPlanPurchase() {
  document.querySelectorAll('#buyPlan, #buyPlanBottom').forEach((link) => {
    link.addEventListener('click', () => {
      const selected = new URLSearchParams(window.location.search).get('tipo') === 'pj' ? 'pj' : 'pf';
      window.localStorage.setItem('zupiPlanoSelecionado', selected);
      link.classList.add('is-loading');
      link.textContent = 'Preparando cadastro...';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const initialPlan = params.get('tipo') === 'pj' ? 'pj' : 'pf';

  document.querySelectorAll('.plan-switch').forEach((button) => {
    button.addEventListener('click', () => setPlan(button.dataset.plan));
  });

  setupPlanPurchase();
  setPlan(initialPlan);
});
