function setupReveal() {
  const items = document.querySelectorAll('.contact-reveal');
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

function setupSubjectPills() {
  const subject = document.getElementById('assunto');
  const message = document.getElementById('mensagem');
  const buttons = document.querySelectorAll('[data-subject]');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((item) => item.classList.toggle('is-active', item === button));
      subject.value = button.dataset.subject;
      message.focus();
    });
  });
}

function setupMessageCounter() {
  const message = document.getElementById('mensagem');
  const counter = document.getElementById('messageCount');

  const updateCounter = () => {
    counter.textContent = `${message.value.length}/600`;
  };

  message.addEventListener('input', updateCounter);
  updateCounter();
}

function setupContactForm() {
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('contactFeedback');

  form.addEventListener('reset', () => {
    document.querySelectorAll('[data-subject]').forEach((button) => button.classList.remove('is-active'));
    window.setTimeout(() => {
      document.getElementById('messageCount').textContent = '0/600';
      feedback.innerHTML = '';
    }, 0);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Enviando...';

    const contactUrl = (typeof ZupiAPI !== 'undefined') ? ZupiAPI.buildUrl('/contact') : '/contact';

    fetch(contactUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('assunto').value,
        message: document.getElementById('mensagem').value
      })
    }).then((response) => {
      feedback.innerHTML = response.ok
        ? '<div class="alert alert-success"><strong>Mensagem enviada.</strong> A equipe Zupi responderá em breve.</div>'
        : '<div class="alert alert-danger">Não foi possível enviar. Tente novamente.</div>';

      if (response.ok) form.reset();
    }).catch(() => {
      feedback.innerHTML = '<div class="alert alert-danger">Erro de conexão. Tente novamente mais tarde.</div>';
    }).finally(() => {
      button.disabled = false;
      button.textContent = 'Enviar mensagem';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupReveal();
  setupSubjectPills();
  setupMessageCounter();
  setupContactForm();
});
