/* ============================================================
   SKY ENGINE — Zupi Céu Encantado
   Animações de fundo: nuvens, estrelinhas, passarinhos, balões
   ============================================================ */

function buildSky() {
  var canvas = document.getElementById('sky-canvas');
  if (!canvas) return;

  // NUVENS
  var nuvens = [
    {w:80,  h:34, blur:6, dur:'14s', top:'18%', delay:0},
    {w:120, h:22, blur:4, dur:'20s', top:'55%', delay:-6},
    {w:60,  h:18, blur:3, dur:'11s', top:'75%', delay:-3},
    {w:100, h:28, blur:5, dur:'17s', top:'35%', delay:-9},
    {w:90,  h:20, blur:4, dur:'23s', top:'68%', delay:-15},
  ];

  nuvens.forEach(function(n, i) {
    var c = document.createElement('div');
    c.className = 'sky-cloud';
    c.style.width  = n.w + 'px';
    c.style.height = n.h + 'px';
    c.style.filter = 'blur(' + n.blur + 'px)';
    c.style.animationDuration = n.dur;
    c.style.animationDelay   = n.delay + 's';
    c.style.top  = n.top;

    var bump = document.createElement('div');
    bump.style.position    = 'absolute';
    bump.style.width       = (n.w * 0.55) + 'px';
    bump.style.height      = (n.h * 1.6)  + 'px';
    bump.style.background  = 'rgba(255,255,255,0.75)';
    bump.style.borderRadius= '50%';
    bump.style.top         = '-' + (n.h * 0.55) + 'px';
    bump.style.left        = (n.w * 0.2) + 'px';
    bump.style.filter      = 'blur(' + (n.blur * 0.8) + 'px)';
    c.appendChild(bump);
    canvas.appendChild(c);
  });

  // ESTRELINHAS
  var starCores = ['#FFE66D','#FFB980','#7EC8E6','#A8D5BA','#F9C6D0'];
  for (var i = 0; i < 18; i++) {
    var s = document.createElement('div');
    s.className = 'sky-sparkle';
    var sz = 4 + Math.random() * 6;
    s.style.width           = sz + 'px';
    s.style.height          = sz + 'px';
    s.style.left            = (Math.random() * 100) + '%';
    s.style.top             = (Math.random() * 60)  + '%';
    s.style.animationDuration= (1.5 + Math.random() * 3) + 's';
    s.style.animationDelay  = (Math.random() * 3) + 's';
    s.style.background      = starCores[i % 5];
    canvas.appendChild(s);
  }

  // PASSARINHOS
  var birds = ['🐦','🦜','🦋','🐦','🦜'];
  birds.forEach(function(b, i) {
    var el = document.createElement('div');
    el.className   = 'sky-bird';
    el.textContent = b;
    el.style.top              = (8 + i * 7) + '%';
    el.style.animationDuration= (14 + i * 4) + 's';
    el.style.animationDelay   = (-i * 5) + 's';
    el.style.fontSize         = (0.9 + i * 0.15) + 'rem';
    canvas.appendChild(el);
  });

  // BALÕES DECORATIVOS
  var balloons = ['🎈','🎀','🎈'];
  balloons.forEach(function(b, i) {
    var el = document.createElement('div');
    el.className   = 'sky-balloon';
    el.textContent = b;
    el.style.left             = (10 + i * 38) + '%';
    el.style.bottom           = (5 + i * 3)   + '%';
    el.style.animationDuration= (3 + i) + 's';
    el.style.animationDelay   = (i * 0.8) + 's';
    el.style.fontSize         = (1.4 + i * 0.3) + 'rem';
    el.style.opacity          = '0.35';
    canvas.appendChild(el);
  });
}

/* ── CONFETE ──────────────────────────────────────────────── */
function skyConfete(n) {
  n = n || 28;
  var cores = ['#7EC8E6','#A8D5BA','#FFE66D','#FFB980','#F9C6D0','#C8B8F0'];
  for (var i = 0; i < n; i++) {
    var c = document.createElement('div');
    c.className = 'sky-confete';
    c.style.left   = (Math.random() * 100) + 'vw';
    c.style.top    = '-18px';
    c.style.width  = (7  + Math.random() * 10) + 'px';
    c.style.height = (7  + Math.random() * 10) + 'px';
    c.style.background       = cores[i % 6];
    c.style.animationDuration= (1.4 + Math.random() * 2) + 's';
    c.style.animationDelay   = (Math.random() * 0.6) + 's';
    c.style.borderRadius     = Math.random() > 0.5 ? '50%' : '4px';
    c.style.position         = 'fixed';
    document.body.appendChild(c);
    setTimeout(function(el){ el.remove(); }, 4000, c);
  }
}

/* ── FLOAT TEXT ──────────────────────────────────────────── */
function skyFloat(x, y, txt, cor) {
  cor = cor || '#A8D5BA';
  var el = document.createElement('div');
  el.className   = 'sky-float';
  el.textContent = txt;
  el.style.left     = x + 'px';
  el.style.top      = y + 'px';
  el.style.color    = cor;
  el.style.position = 'fixed';
  document.body.appendChild(el);
  setTimeout(function(){ el.remove(); }, 950);
}

/* ── PARTÍCULAS ESTRELA ───────────────────────────────────── */
function skyStars(x, y) {
  var emojis = ['⭐','✨','💫','🌟'];
  for (var i = 0; i < 10; i++) {
    var s     = document.createElement('div');
    s.className   = 'sky-star-part';
    var angle = (i / 10) * Math.PI * 2;
    var dist  = 35 + Math.random() * 45;
    s.style.left            = x + 'px';
    s.style.top             = y + 'px';
    s.style.fontSize        = (0.9 + Math.random() * 0.8) + 'rem';
    s.style.position        = 'fixed';
    s.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    s.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    s.style.animationDelay  = (i * 0.04) + 's';
    s.textContent = emojis[i % 4];
    document.body.appendChild(s);
    setTimeout(function(el){ el.remove(); }, 800, s);
  }
}

/* ── SONS WEB AUDIO ──────────────────────────────────────── */
var _skyAC = null;
function _getSkyAC() {
  if (!_skyAC) _skyAC = new (window.AudioContext || window.webkitAudioContext)();
  return _skyAC;
}
function skyTone(freq, type, dur, vol) {
  freq = freq || 440; type = type || 'sine'; dur = dur || 0.2; vol = vol || 0.28;
  try {
    var c = _getSkyAC();
    var o = c.createOscillator();
    var g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.start(); o.stop(c.currentTime + dur);
  } catch(e) {}
}
function skyRight()   { skyTone(523); setTimeout(function(){ skyTone(659); }, 80); setTimeout(function(){ skyTone(784); }, 160); }
function skyWrong()   { skyTone(180,'sawtooth',0.4); }
function skyLevelUp() { var f=[392,523,659,784,1047]; f.forEach(function(freq,i){ setTimeout(function(){ skyTone(freq); }, i*100); }); }
function skyBubblePop(size) {
  try {
    var c   = _getSkyAC();
    var buf = c.createBuffer(1, c.sampleRate * 0.18, c.sampleRate);
    var d   = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) {
      var t = i / c.sampleRate;
      d[i] = (Math.random()*2-1) * Math.exp(-t*35) * 0.5
           + Math.sin(2*Math.PI*(800 - size*3)*t) * Math.exp(-t*25) * 0.35;
    }
    var src = c.createBufferSource(); src.buffer = buf;
    var g   = c.createGain();
    g.gain.setValueAtTime(0.45, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
    src.connect(g); g.connect(c.destination); src.start();
  } catch(e) {}
}

