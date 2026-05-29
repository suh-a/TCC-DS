/* zupi-utils.js — Utilitarios compartilhados entre todos os jogos */

/* ── FUNDO ANIMADO ── */
function zupiBackground(containerId) {
  var el = document.getElementById(containerId || 'zj-bg');
  if (!el) return;
  var shapes = [
    { w: 300, h: 300, bg: '#7EC8E6', top: '-80px', left: '-80px',   dur: '13s', br: '50%' },
    { w: 200, h: 200, bg: '#FFE66D', top: '8%',    right: '-60px',  dur: '17s', br: '40% 60%' },
    { w: 250, h: 250, bg: '#A8D5BA', bottom: '12%',left: '-70px',   dur: '11s', br: '50%' },
    { w: 170, h: 170, bg: '#FFB980', bottom:'-30px',right:'8%',     dur: '15s', br: '60% 40%' },
    { w: 130, h: 130, bg: '#FFE66D', top: '40%',   left: '42%',     dur: '19s', br: '70% 30%' },
  ];
  var dotsDiv = document.createElement('div');
  dotsDiv.style.cssText = 'position:absolute;inset:0;background-image:radial-gradient(circle,rgba(126,200,230,0.16) 1.5px,transparent 1.5px);background-size:34px 34px;';
  el.appendChild(dotsDiv);
  shapes.forEach(function(s) {
    var d = document.createElement('div');
    var css = 'position:absolute;opacity:0.12;border-radius:' + s.br + ';width:' + s.w + 'px;height:' + s.h + 'px;background:' + s.bg + ';animation:zupiFloat ' + s.dur + ' ease-in-out infinite alternate;';
    if (s.top)    css += 'top:'    + s.top    + ';';
    if (s.left)   css += 'left:'   + s.left   + ';';
    if (s.right)  css += 'right:'  + s.right  + ';';
    if (s.bottom) css += 'bottom:' + s.bottom + ';';
    d.style.cssText = css;
    el.appendChild(d);
  });
  if (!document.getElementById('zupi-float-kf')) {
    var st = document.createElement('style');
    st.id = 'zupi-float-kf';
    st.textContent = '@keyframes zupiFloat{0%{transform:translateY(0) rotate(0deg) scale(1);opacity:.12}100%{transform:translateY(-26px) rotate(20deg) scale(1.08);opacity:.20}}';
    document.head.appendChild(st);
  }
}

/* ── FLOAT LABEL ── */
function zupiFloat(x, y, texto, cor) {
  var el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;color:' + (cor || '#7EC8E6') + ';font-family:Nunito,sans-serif;font-weight:900;font-size:1.1rem;pointer-events:none;z-index:900;animation:zupiFloatUp .9s ease-out forwards;white-space:nowrap;transform:translateX(-50%)';
  el.textContent = texto;
  if (!document.getElementById('zupi-floatup-kf')) {
    var st = document.createElement('style');
    st.id = 'zupi-floatup-kf';
    st.textContent = '@keyframes zupiFloatUp{0%{transform:translate(-50%,0);opacity:1}100%{transform:translate(-50%,-52px);opacity:0}}';
    document.head.appendChild(st);
  }
  document.body.appendChild(el);
  setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 950);
}

/* ── CONFETE ── */
function zupiConfete(qtd) {
  var cores = ['#7EC8E6','#A8D5BA','#FFE66D','#FFB980','#7EC8E6'];
  for (var i = 0; i < (qtd || 30); i++) {
    (function(i){
      var c = document.createElement('div');
      var dur = (1.4 + Math.random() * 1.8).toFixed(2);
      var delay = (Math.random() * 0.8).toFixed(2);
      c.style.cssText = 'position:fixed;left:' + Math.random()*100 + 'vw;top:-20px;width:' + (7+Math.random()*10) + 'px;height:' + (7+Math.random()*10) + 'px;background:' + cores[Math.floor(Math.random()*cores.length)] + ';border-radius:' + (Math.random()>.5?'50%':'4px') + ';pointer-events:none;z-index:800;animation:zupiConfeteQ ' + dur + 's ease-in ' + delay + 's forwards;';
      document.body.appendChild(c);
      setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); }, (parseFloat(dur)+parseFloat(delay))*1000+200);
    })(i);
  }
  if (!document.getElementById('zupi-confete-kf')) {
    var st = document.createElement('style');
    st.id = 'zupi-confete-kf';
    st.textContent = '@keyframes zupiConfeteQ{0%{transform:translateY(-10vh) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:.1}}';
    document.head.appendChild(st);
  }
}

/* ── SOM ACERTO ── */
var _zupiAC;
function _getAC() { if (!_zupiAC) _zupiAC = new (window.AudioContext || window.webkitAudioContext)(); return _zupiAC; }
function zupiRight() {
  try {
    var c = _getAC(), t = c.currentTime;
    [523, 659, 784].forEach(function(f, i) {
      var o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.frequency.value = f; o.type = 'sine';
      g.gain.setValueAtTime(.15, t + i*.1);
      g.gain.exponentialRampToValueAtTime(.001, t + i*.1 + .15);
      o.start(t + i*.1); o.stop(t + i*.1 + .15);
    });
  } catch(e) {}
}
function zupiWrong() {
  try {
    var c = _getAC(), t = c.currentTime;
    var o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.value = 200; o.type = 'sawtooth';
    g.gain.setValueAtTime(.15, t);
    g.gain.exponentialRampToValueAtTime(.001, t + .35);
    o.start(t); o.stop(t + .35);
  } catch(e) {}
}
function zupiTone(freq, type, vol, dur) {
  try {
    var c = _getAC(), t = c.currentTime;
    var o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.value = freq || 440; o.type = type || 'sine';
    g.gain.setValueAtTime(vol || .15, t);
    g.gain.exponentialRampToValueAtTime(.001, t + (dur || .2));
    o.start(t); o.stop(t + (dur || .2));
  } catch(e) {}
}
function zupiLevelUp() {
  try {
    var c = _getAC(), t = c.currentTime;
    [523,659,784,1046].forEach(function(f,i){
      var o=c.createOscillator(),g=c.createGain();
      o.connect(g);g.connect(c.destination);
      o.frequency.value=f;o.type='sine';
      g.gain.setValueAtTime(.18,t+i*.12);
      g.gain.exponentialRampToValueAtTime(.001,t+i*.12+.18);
      o.start(t+i*.12);o.stop(t+i*.12+.18);
    });
  } catch(e) {}
}

/* ── POP EFFECT (particulas) ── */
function zupiPop(cx, cy, cor) {
  var c = cor || '#7EC8E6';
  for (var i = 0; i < 8; i++) {
    (function(i){
      var g = document.createElement('div');
      var ang = (i/8)*Math.PI*2, d = 28 + Math.random()*40;
      g.style.cssText = 'position:fixed;left:'+cx+'px;top:'+cy+'px;width:'+(5+Math.random()*6)+'px;height:'+(5+Math.random()*6)+'px;background:'+c+';border-radius:50%;pointer-events:none;z-index:700;--gx:'+Math.cos(ang)*d+'px;--gy:'+Math.sin(ang)*d+'px;animation:zupiGota .65s ease-out forwards;margin:-3px 0 0 -3px;';
      document.body.appendChild(g);
      setTimeout(function(){if(g.parentNode)g.parentNode.removeChild(g);},700);
    })(i);
  }
  if (!document.getElementById('zupi-gota-kf')) {
    var st = document.createElement('style');
    st.id = 'zupi-gota-kf';
    st.textContent = '@keyframes zupiGota{0%{transform:translate(0,0);opacity:.9}100%{transform:translate(var(--gx),var(--gy)) scale(0);opacity:0}}';
    document.head.appendChild(st);
  }
}
