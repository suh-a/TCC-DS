/* =============================================================
   ZUPI SKY ENGINE  —  Animações de fundo e utilitários
   Arquivo externo seguro para Thymeleaf (sem ${ ou [[]])
   ============================================================= */

/* ── CÉU ANIMADO ─────────────────────────────────────────────── */
function zupiSky() {
  var el = document.getElementById('zj-sky');
  if (!el) return;

  // Nuvens
  var nuvens = [
    [80, 30, 5, '14s', '12%', 0],
    [110, 22, 4, '20s', '48%', -7],
    [65, 18, 3, '11s', '72%', -3],
    [95, 26, 4, '17s', '30%', -10],
    [85, 20, 4, '24s', '62%', -16]
  ];
  nuvens.forEach(function(n, i) {
    var c = document.createElement('div');
    c.className = 'zj-cloud';
    c.style.width  = n[0] + 'px';
    c.style.height = n[1] + 'px';
    c.style.filter = 'blur(' + n[2] + 'px)';
    c.style.animationDuration  = n[3];
    c.style.animationDelay     = n[5] + 's';
    c.style.top  = n[4];
    var b = document.createElement('div');
    b.style.cssText = 'position:absolute;width:' + (n[0]*.55) + 'px;height:' + (n[1]*1.6) + 'px;background:rgba(255,255,255,.72);border-radius:50%;top:-' + (n[1]*.5) + 'px;left:' + (n[0]*.2) + 'px;filter:blur(' + (n[2]*.7) + 'px)';
    c.appendChild(b);
    el.appendChild(c);
  });

  // Brilhos
  var bCores = ['#FFE66D','#FFB980','#7EC8E6','#A8D5BA','#F9C6D0'];
  for (var i = 0; i < 20; i++) {
    var s = document.createElement('div');
    s.className = 'zj-sparkle';
    var sz = 4 + Math.random() * 7;
    s.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;left:' + (Math.random()*100) + '%;top:' + (Math.random()*65) + '%;animation-duration:' + (1.5+Math.random()*3) + 's;animation-delay:' + (Math.random()*3) + 's;background:' + bCores[i%5];
    el.appendChild(s);
  }

  // Passarinhos
  var birds = ['🐦','🦜','🦋','🐦'];
  birds.forEach(function(b, i) {
    var bi = document.createElement('div');
    bi.className = 'zj-bird';
    bi.textContent = b;
    bi.style.cssText = 'top:' + (8+i*8) + '%;animation-duration:' + (13+i*5) + 's;animation-delay:' + (-i*4) + 's;font-size:' + (.85+i*.12) + 'rem';
    el.appendChild(bi);
  });
}

/* ── CONFETE ─────────────────────────────────────────────────── */
function zupiConfete(n) {
  n = n || 28;
  var cores = ['#7EC8E6','#A8D5BA','#FFE66D','#FFB980','#F9C6D0','#C8B8F0'];
  for (var i = 0; i < n; i++) {
    (function(idx) {
      var c = document.createElement('div');
      c.className = 'zj-confete';
      c.style.cssText = 'position:fixed;left:' + (Math.random()*100) + 'vw;top:-18px;width:' + (7+Math.random()*10) + 'px;height:' + (7+Math.random()*10) + 'px;background:' + cores[idx%6] + ';animation-duration:' + (1.4+Math.random()*2) + 's;animation-delay:' + (Math.random()*.6) + 's;border-radius:' + (Math.random()>.5?'50%':'4px');
      document.body.appendChild(c);
      setTimeout(function() { if (c.parentNode) c.parentNode.removeChild(c); }, 4200);
    })(i);
  }
}

/* ── FLOAT TEXT ──────────────────────────────────────────────── */
function zupiFloat(x, y, txt, cor) {
  cor = cor || '#A8D5BA';
  var el = document.createElement('div');
  el.className = 'zj-float';
  el.textContent = txt;
  el.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;color:' + cor;
  document.body.appendChild(el);
  setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 1000);
}

/* ── PARTÍCULAS ──────────────────────────────────────────────── */
function zupiParts(x, y, cor) {
  cor = cor || '#7EC8E6';
  for (var i = 0; i < 10; i++) {
    (function(idx) {
      var p = document.createElement('div');
      p.className = 'zj-part';
      var ang = (idx/10)*Math.PI*2;
      var d = 35 + Math.random()*40;
      p.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;width:8px;height:8px;border-radius:50%;background:' + cor + ';animation-delay:' + (idx*.04) + 's';
      p.style.setProperty('--dx', Math.cos(ang)*d + 'px');
      p.style.setProperty('--dy', Math.sin(ang)*d + 'px');
      document.body.appendChild(p);
      setTimeout(function() { if (p.parentNode) p.parentNode.removeChild(p); }, 850);
    })(i);
  }
}

/* ── STARS (ícones) ──────────────────────────────────────────── */
function zupiStars(x, y) {
  var emjs = ['⭐','✨','💫','🌟'];
  for (var i = 0; i < 8; i++) {
    (function(idx) {
      var s = document.createElement('div');
      s.className = 'zj-part';
      var ang = (idx/8)*Math.PI*2;
      var d = 30 + Math.random()*45;
      s.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;font-size:' + (.9+Math.random()*.7) + 'rem;animation-delay:' + (idx*.04) + 's';
      s.style.setProperty('--dx', Math.cos(ang)*d + 'px');
      s.style.setProperty('--dy', Math.sin(ang)*d + 'px');
      s.textContent = emjs[idx%4];
      document.body.appendChild(s);
      setTimeout(function() { if (s.parentNode) s.parentNode.removeChild(s); }, 850);
    })(i);
  }
}

/* ── WEB AUDIO ───────────────────────────────────────────────── */
var _zAC = null;
function _zGetAC() {
  if (!_zAC) { try { _zAC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} }
  return _zAC;
}
function zupiTone(freq, type, dur, vol) {
  freq=freq||440; type=type||'sine'; dur=dur||.2; vol=vol||.27;
  try {
    var c=_zGetAC(); if(!c) return;
    var o=c.createOscillator(); var g=c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type=type; o.frequency.value=freq;
    g.gain.setValueAtTime(vol,c.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur);
    o.start(); o.stop(c.currentTime+dur);
  } catch(e) {}
}
function zupiRight()   { zupiTone(523); setTimeout(function(){zupiTone(659);},80); setTimeout(function(){zupiTone(784);},160); }
function zupiWrong()   { zupiTone(180,'sawtooth',.38); }
function zupiLevelUp() { var ff=[392,523,659,784,1047]; ff.forEach(function(f,i){setTimeout(function(){zupiTone(f);},i*100);}); }
function zupiPop(size) {
  try {
    var c=_zGetAC(); if(!c) return;
    var buf=c.createBuffer(1,Math.floor(c.sampleRate*.18),c.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<d.length;i++){
      var t=i/c.sampleRate;
      d[i]=(Math.random()*2-1)*Math.exp(-t*35)*.5 + Math.sin(6.283*(800-(size||60)*2)*t)*Math.exp(-t*25)*.35;
    }
    var s=c.createBufferSource(); s.buffer=buf;
    var g=c.createGain();
    g.gain.setValueAtTime(.44,c.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.2);
    s.connect(g); g.connect(c.destination); s.start();
  } catch(e) {}
}
