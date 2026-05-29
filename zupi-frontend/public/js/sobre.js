const aboutCards = {
  missao: {
    label: 'Missão em prática',
    title: 'Aprendizagem com intenção',
    text: 'Cada jogo e cada relatório existem para ajudar adultos a perceberem avanços, dificuldades e oportunidades de estímulo.'
  },
  visao: {
    label: 'Visão em prática',
    title: 'Tecnologia acessível para acompanhar melhor',
    text: 'A Zupi busca transformar acompanhamento infantil em uma experiência visual, simples e útil para famílias e instituições.'
  },
  valores: {
    label: 'Valores em prática',
    title: 'Cuidado no centro da experiência',
    text: 'Inclusão, empatia e segurança orientam a forma como os dados, os jogos e os fluxos de acompanhamento são apresentados.'
  },
  compromisso: {
    label: 'Compromisso em prática',
    title: 'Informação clara para decisões melhores',
    text: 'A plataforma aproxima responsáveis, docentes e gestores com informações organizadas sobre rotina, evolução e necessidades.'
  }
};

const timelineDetails = {
  inicio: {
    title: 'Pesquisa e cuidado',
    text: 'O Zupi nasce da necessidade de transformar acompanhamento infantil em algo mais claro, visual e colaborativo.'
  },
  jogos: {
    title: 'Jogos educativos',
    text: 'As atividades trabalham habilidades como atenção, memória, linguagem e lógica em uma experiência leve, colorida e segura.'
  },
  dados: {
    title: 'Relatórios claros',
    text: 'Os dados ajudam responsáveis e instituições a entender evolução, frequência e áreas que precisam de novos estímulos.'
  }
};

function animateSwitch(element) {
  element.classList.remove('is-switching');
  window.requestAnimationFrame(() => element.classList.add('is-switching'));
}

function setupAboutCards() {
  const cards = document.querySelectorAll('[data-about-card]');
  const focus = document.getElementById('aboutFocus');
  const label = document.getElementById('aboutFocusLabel');
  const title = document.getElementById('aboutFocusTitle');
  const text = document.getElementById('aboutFocusText');

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const content = aboutCards[card.dataset.aboutCard];
      if (!content) return;

      cards.forEach((item) => item.classList.toggle('is-active', item === card));
      label.textContent = content.label;
      title.textContent = content.title;
      text.textContent = content.text;
      animateSwitch(focus);
    });
  });

  cards[0]?.classList.add('is-active');
}

function setupTimeline() {
  const buttons = document.querySelectorAll('[data-year]');
  const detail = document.getElementById('timelineDetail');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const content = timelineDetails[button.dataset.year];
      if (!content) return;

      buttons.forEach((item) => item.classList.toggle('is-active', item === button));
      detail.querySelector('h3').textContent = content.title;
      detail.querySelector('p').textContent = content.text;
      animateSwitch(detail);
    });
  });
}

function setupReveal() {
  const items = document.querySelectorAll('.about-reveal');
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

document.addEventListener('DOMContentLoaded', () => {
  setupAboutCards();
  setupTimeline();
  setupReveal();
});
