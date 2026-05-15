const GameScore = {
  getActiveChildId() {
    return localStorage.getItem('activeChildId') || localStorage.getItem('selectedChildId');
  },

  async submit(gameId, score, maxScore, durationSeconds, skillAreaId) {
    const childId = this.getActiveChildId();
    if (!childId) return;

    const API_BASE = window.API_BASE_URL || window.location.origin;
    try {
      await fetch(`${API_BASE}/child/${childId}/games/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, score, maxScore, durationSeconds, skillAreaId })
      });
    } catch (e) {
      console.warn('Não foi possível registrar pontuação:', e);
    }
  }
};

window.GameScore = GameScore;

