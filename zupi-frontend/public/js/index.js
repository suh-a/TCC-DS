function setupRevealAnimation() {
  const items = document.querySelectorAll('.reveal-on-scroll');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
    observer.observe(item);
  });
}

const homePlanSummaries = {
  pf: {
    label: 'Plano familiar',
    title: 'Famílias e responsáveis',
    text: 'O plano familiar acompanha a rotina de uma criança com jogos educativos, relatórios simples, agenda e conteúdos de apoio para o responsável entender melhor cada avanço.',
    note: 'Ideal para quem quer apoiar o desenvolvimento em casa, observar habilidades como atenção, memória e linguagem, e levar informações mais claras para conversas com escola e profissionais.',
    action: 'Ver plano familiar completo',
    href: '/planos?tipo=pf'
  },
  pj: {
    label: 'Plano institucional',
    title: 'Escolas e instituições',
    text: 'O plano Pessoa Jurídica organiza o acompanhamento de várias crianças, turmas e profissionais em uma visão mais ampla para gestão pedagógica.',
    note: 'Indicado para escolas, clínicas e instituições que precisam centralizar relatórios, acompanhar evolução por grupo, apoiar docentes e alinhar informações com responsáveis.',
    action: 'Ver plano institucional completo',
    href: '/planos?tipo=pj'
  }
};

function setupHomePlanSelector() {
  const cards = document.querySelectorAll('[data-home-plan]');
  const details = document.getElementById('homePlanDetails');
  const label = document.getElementById('homePlanLabel');
  const title = document.getElementById('homePlanTitle');
  const text = document.getElementById('homePlanText');
  const note = document.getElementById('homePlanNote');
  const action = document.getElementById('homePlanAction');

  if (!cards.length || !details) return;

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const summary = homePlanSummaries[card.dataset.homePlan];
      if (!summary) return;

      cards.forEach((item) => {
        const selected = item === card;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });

      label.textContent = summary.label;
      title.textContent = summary.title;
      text.textContent = summary.text;
      note.textContent = summary.note;
      action.textContent = summary.action;
      action.href = summary.href;

      details.classList.remove('is-switching');
      window.requestAnimationFrame(() => details.classList.add('is-switching'));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupRevealAnimation();
  setupHomePlanSelector();
});
