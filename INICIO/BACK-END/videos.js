(function () {
  const featuredContainer = document.querySelector('.player-frame');
  const featuredTitle = document.getElementById('featured-title');
  const playBtn = document.getElementById('play-featured');
  const btnTranscript = document.getElementById('btn-transcript');
  const transcript = document.getElementById('transcript');
  const btnCC = document.getElementById('btn-cc-link');

  function setFeatured(videoId, title, tags) {
    featuredContainer.dataset.videoId = videoId;
    featuredTitle.textContent = title;
    btnCC.href = `https://youtube.com/watch?v=${videoId}`;
    featuredContainer.innerHTML = `
      <button class="play-button" aria-label="Reproduzir vídeo em destaque" id="play-featured">
        <svg width="70" height="70" viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
      </button>
      <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" alt="Thumbnail do vídeo em destaque" class="thumb" />
    `;
  }

  // troca de vídeo ao clicar no card
  document.querySelectorAll('.video-card').forEach(card => {
    const btn = card.querySelector('.thumb-btn');
    const videoId = card.dataset.video;
    const title = card.dataset.title;
    btn.addEventListener('click', () => setFeatured(videoId, title));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setFeatured(videoId, title);
        setTimeout(() => {
          const newPlay = document.getElementById('play-featured');
          if (newPlay) newPlay.focus();
        }, 150);
      }
    });
  });

  // play do vídeo em destaque
  document.addEventListener('click', (e) => {
    if (e.target.closest('#play-featured')) {
      const parent = e.target.closest('.player-frame');
      const id = parent ? parent.dataset.videoId || parent.getAttribute('data-video-id') : null;
      if (!id) return;
      parent.innerHTML = `<iframe
        src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1"
        title="${featuredTitle.textContent}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>`;
    }
  });

  // toggle transcrição
  btnTranscript.addEventListener('click', () => {
    const expanded = btnTranscript.getAttribute('aria-expanded') === 'true';
    btnTranscript.setAttribute('aria-expanded', String(!expanded));
    transcript.hidden = expanded;
  });

  // keyboard: espaço/enter no play
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.classList.contains('play-button')) {
      e.preventDefault();
      document.activeElement.click();
    }
  });
})();
