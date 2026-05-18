const GameScore = {
  getActiveChildId() {
    return localStorage.getItem('activeChildId') || localStorage.getItem('selectedChildId');
  },

  async submit(gameId, score, maxScore, durationSeconds, skillAreaId) {
    const childId = this.getActiveChildId();
    if (!childId || typeof ZupiAPI === 'undefined') return;

    try {
      await ZupiAPI.post(`/child/${childId}/games/session`, {
        gameId,
        score,
        maxScore,
        durationSeconds,
        skillAreaId
      });
    } catch (e) {
      console.warn('Não foi possível registrar pontuação:', e);
    }
  }
};

window.GameScore = GameScore;
