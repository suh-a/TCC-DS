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

  function applyRecommendations() {
    const id = childId();
    if (!id) return;

    const recommendations = loadRecommendations(id);
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
