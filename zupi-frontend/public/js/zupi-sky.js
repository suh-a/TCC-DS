function zupiSky() {
  var el = document.getElementById('zj-sky') || document.querySelector('.sky-canvas') || document.querySelector('.z-bg-shapes');
  if (!el) {
    el = document.createElement('div');
    el.id = 'zj-sky';
    el.className = 'zj-sky';
    document.body.prepend(el);
  }

  el.classList.add('background-decor');
  if (el.dataset.zupiReady === '1') return;
  el.dataset.zupiReady = '1';
  el.innerHTML = '';

  var colors = ['#7EC8E6', '#A8D5BA', '#FFE66D', '#FFB980'];
  var shapes = [
    ['decor-circle', 96, 96, 6, 10, 0],
    ['decor-square', 78, 78, 82, 8, 2],
    ['zupi-decor-diamond', 62, 62, 18, 72, 4],
    ['decor-circle', 140, 140, 76, 62, 1],
    ['decor-square', 48, 48, 45, 18, 3],
    ['decor-circle', 58, 58, 7, 48, 2],
    ['zupi-decor-diamond', 90, 90, 88, 34, 0],
    ['decor-square', 118, 118, 33, 86, 1]
  ];

  shapes.forEach(function(item, index) {
    var shape = document.createElement('div');
    shape.className = 'decor-shape zupi-decor-shape ' + item[0];
    shape.style.width = item[1] + 'px';
    shape.style.height = item[2] + 'px';
    shape.style.left = item[3] + '%';
    shape.style.top = item[4] + '%';
    shape.style.background = colors[item[5]];
    shape.style.animationDuration = 10 + index + 's';
    shape.style.animationDelay = (index * -.7) + 's';
    el.appendChild(shape);
  });

  for (var i = 0; i < 18; i++) {
    var spark = document.createElement('div');
    var size = 5 + (i % 4) * 2;
    spark.className = 'zupi-spark';
    spark.style.width = size + 'px';
    spark.style.height = size + 'px';
    spark.style.left = (8 + Math.random() * 84) + '%';
    spark.style.top = (10 + Math.random() * 74) + '%';
    spark.style.background = colors[i % colors.length];
    spark.style.animationDelay = (Math.random() * 2.8) + 's';
    spark.style.animationDuration = (2.2 + Math.random() * 2.4) + 's';
    el.appendChild(spark);
  }
}

function zupiConfete(n) {
  n = n || 28;
  var cores = ['#7EC8E6', '#A8D5BA', '#FFE66D', '#FFB980'];
  for (var i = 0; i < n; i++) {
    (function(idx) {
      var c = document.createElement('div');
      c.className = 'zj-confete';
      c.style.left = (Math.random() * 100) + 'vw';
      c.style.top = '-18px';
      c.style.width = (7 + Math.random() * 10) + 'px';
      c.style.height = (7 + Math.random() * 10) + 'px';
      c.style.background = cores[idx % cores.length];
      c.style.animationDuration = (1.4 + Math.random() * 2) + 's';
      c.style.animationDelay = (Math.random() * .6) + 's';
      c.style.borderRadius = Math.random() > .5 ? '50%' : '4px';
      document.body.appendChild(c);
      setTimeout(function() {
        if (c.parentNode) c.parentNode.removeChild(c);
      }, 4200);
    })(i);
  }
}

function zupiFloat(x, y, txt, cor) {
  var el = document.createElement('div');
  el.className = 'zj-float';
  el.textContent = txt;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.color = cor || '#7EC8E6';
  document.body.appendChild(el);
  setTimeout(function() {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 1000);
}

function zupiParts(x, y, cor) {
  cor = cor || '#7EC8E6';
  for (var i = 0; i < 10; i++) {
    (function(idx) {
      var p = document.createElement('div');
      p.className = 'zj-part';
      var ang = (idx / 10) * Math.PI * 2;
      var d = 35 + Math.random() * 40;
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = cor;
      p.style.animationDelay = (idx * .04) + 's';
      p.style.setProperty('--dx', Math.cos(ang) * d + 'px');
      p.style.setProperty('--dy', Math.sin(ang) * d + 'px');
      document.body.appendChild(p);
      setTimeout(function() {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 850);
    })(i);
  }
}

function zupiStars(x, y) {
  var cores = ['#7EC8E6', '#A8D5BA', '#FFE66D', '#FFB980'];
  for (var i = 0; i < 8; i++) {
    (function(idx) {
      var s = document.createElement('div');
      s.className = 'zj-part';
      var ang = (idx / 8) * Math.PI * 2;
      var d = 30 + Math.random() * 45;
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.background = cores[idx % cores.length];
      s.style.animationDelay = (idx * .04) + 's';
      s.style.setProperty('--dx', Math.cos(ang) * d + 'px');
      s.style.setProperty('--dy', Math.sin(ang) * d + 'px');
      document.body.appendChild(s);
      setTimeout(function() {
        if (s.parentNode) s.parentNode.removeChild(s);
      }, 850);
    })(i);
  }
}

var _zAC = null;
function _zGetAC() {
  if (!_zAC) {
    try {
      _zAC = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  return _zAC;
}

function zupiTone(freq, type, dur, vol) {
  freq = freq || 440;
  type = type || 'sine';
  dur = dur || .2;
  vol = vol || .27;
  try {
    var c = _zGetAC();
    if (!c) return;
    var o = c.createOscillator();
    var g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, c.currentTime + dur);
    o.start();
    o.stop(c.currentTime + dur);
  } catch (e) {}
}

function zupiRight() {
  zupiTone(523);
  setTimeout(function() { zupiTone(659); }, 80);
  setTimeout(function() { zupiTone(784); }, 160);
}

function zupiWrong() {
  zupiTone(180, 'sawtooth', .38);
}

function zupiLevelUp() {
  [392, 523, 659, 784, 1047].forEach(function(f, i) {
    setTimeout(function() { zupiTone(f); }, i * 100);
  });
}

function zupiPop(size) {
  try {
    var c = _zGetAC();
    if (!c) return;
    var buf = c.createBuffer(1, Math.floor(c.sampleRate * .18), c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) {
      var t = i / c.sampleRate;
      d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 35) * .5 + Math.sin(6.283 * (800 - (size || 60) * 2) * t) * Math.exp(-t * 25) * .35;
    }
    var s = c.createBufferSource();
    s.buffer = buf;
    var g = c.createGain();
    g.gain.setValueAtTime(.44, c.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .2);
    s.connect(g);
    g.connect(c.destination);
    s.start();
  } catch (e) {}
}

