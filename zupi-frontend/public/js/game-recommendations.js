(function () {
  function childId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('childId')
      || localStorage.getItem('activeChildId')
      || localStorage.getItem('selectedChildId')
      || localStorage.getItem('childId');
  }

  function normalizePath(value) {
    if (!value) return '';
    const url = new URL(value, window.location.origin);
    return url.pathname.replace(/\.html$/i, '').replace(/\/$/, '');
  }

  function loadRecommendations(id) {
    try {
      const data = JSON.parse(localStorage.getItem('zupiGameRecommendations') || '{}') || {};
      return data[String(id)] || null;
    } catch (e) {
      return null;
    }
  }

  function saveRecommendations(id, recommendations) {
    if (!id || !recommendations) return;
    try {
      const data = JSON.parse(localStorage.getItem('zupiGameRecommendations') || '{}') || {};
      data[String(id)] = recommendations;
      localStorage.setItem('zupiGameRecommendations', JSON.stringify(data));
    } catch (e) {
      // Mantem a tela funcional mesmo sem armazenamento local.
    }
  }

  async function loadBackendRecommendations(id) {
    if (typeof ZupiAPI === 'undefined') return null;
    try {
      const response = await ZupiAPI.get(`/quiz/child/${id}`, { skipAuthRedirect: true });
      if (!response || !response.ok) return null;
      const quiz = await response.json();
      if (quiz && quiz.recommendations && Array.isArray(quiz.recommendations.games)) {
        saveRecommendations(id, quiz.recommendations);
        return quiz.recommendations;
      }
    } catch (e) {
      console.warn('Sugestoes do quiz usando cache local.', e);
    }
    return null;
  }

  async function applyRecommendations() {
    const id = childId();
    if (!id) return;

    const recommendations = await loadBackendRecommendations(id) || loadRecommendations(id);
    if (!recommendations || !Array.isArray(recommendations.games)) return;

    const recommended = new Map(
      recommendations.games.map(game => [normalizePath(game.href), game])
    );

    document.querySelectorAll('.zj-card[href]').forEach(card => {
      const game = recommended.get(normalizePath(card.getAttribute('href')));
      if (!game) return;

      card.classList.add('zj-recommended');
      card.dataset.recommendationReason = game.reason || '';
      card.setAttribute(
        'title',
        game.reason ? `Sugerido pelo quiz: ${game.reason}` : 'Sugerido pelo quiz inicial'
      );
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyRecommendations);
  } else {
    applyRecommendations();
  }
})();
