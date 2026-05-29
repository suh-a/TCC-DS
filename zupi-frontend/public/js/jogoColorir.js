(function () {
  var COLORS = [
    '#ff6b6b', '#ff922b', '#ffd43b', '#69db7c',
    '#38d9a9', '#4dabf7', '#748ffc', '#cc5de8',
    '#f783ac', '#8d6e63', '#ffffff', '#2d3748'
  ];
  var BLANK = '#ffffff';
  var drawings = [
    {
      title: 'Jardim feliz',
      needed: 7,
      svg: '<svg viewBox="0 0 640 460" role="img" aria-label="Jardim para colorir">' +
        '<rect class="colorivel" data-part="ceu" x="10" y="10" width="620" height="440" rx="26" fill="#ffffff"/>' +
        '<circle class="colorivel" data-part="sol" cx="535" cy="88" r="48" fill="#ffffff"/>' +
        '<path class="colorivel" data-part="grama" d="M10 330 Q160 295 315 330 T630 320 V450 H10Z" fill="#ffffff"/>' +
        '<path class="colorivel" data-part="folhas" d="M306 330 C250 294 252 239 304 257 C312 206 354 210 355 258 C411 238 414 292 360 330Z" fill="#ffffff"/>' +
        '<circle class="colorivel" data-part="petala1" cx="316" cy="214" r="29" fill="#ffffff"/><circle class="colorivel" data-part="petala2" cx="364" cy="214" r="29" fill="#ffffff"/>' +
        '<circle class="colorivel" data-part="petala3" cx="340" cy="178" r="29" fill="#ffffff"/><circle class="colorivel" data-part="miolo" cx="340" cy="215" r="20" fill="#ffffff"/>' +
        '<path class="colorivel" data-part="vaso" d="M286 332 H394 L378 416 Q340 432 302 416Z" fill="#ffffff"/>' +
        '</svg>'
    },
    {
      title: 'Foguete espacial',
      needed: 8,
      svg: '<svg viewBox="0 0 640 460" role="img" aria-label="Foguete para colorir">' +
        '<rect class="colorivel" data-part="espaco" x="10" y="10" width="620" height="440" rx="26" fill="#ffffff"/>' +
        '<circle class="colorivel" data-part="planeta" cx="107" cy="104" r="58" fill="#ffffff"/>' +
        '<path class="colorivel" data-part="corpo" d="M321 55 C397 112 405 242 321 319 C237 242 245 112 321 55Z" fill="#ffffff"/>' +
        '<circle class="colorivel" data-part="janela" cx="321" cy="166" r="35" fill="#ffffff"/>' +
        '<path class="colorivel" data-part="asa1" d="M270 224 L208 299 L270 290Z" fill="#ffffff"/><path class="colorivel" data-part="asa2" d="M372 224 L434 299 L372 290Z" fill="#ffffff"/>' +
        '<path class="colorivel" data-part="fogo1" d="M292 309 Q321 420 321 309Z" fill="#ffffff"/><path class="colorivel" data-part="fogo2" d="M321 309 Q321 427 350 309Z" fill="#ffffff"/>' +
        '<circle class="colorivel" data-part="estrela" cx="505" cy="152" r="22" fill="#ffffff"/>' +
        '</svg>'
    },
    {
      title: 'Peixinho no mar',
      needed: 9,
      svg: '<svg viewBox="0 0 640 460" role="img" aria-label="Peixe para colorir">' +
        '<rect class="colorivel" data-part="agua" x="10" y="10" width="620" height="440" rx="26" fill="#ffffff"/>' +
        '<path class="colorivel" data-part="areia" d="M10 368 Q130 340 238 370 T450 370 T630 358 V450 H10Z" fill="#ffffff"/>' +
        '<path class="colorivel" data-part="corpo" d="M145 221 Q256 112 391 221 Q255 331 145 221Z" fill="#ffffff"/>' +
        '<path class="colorivel" data-part="cauda" d="M390 221 L507 143 L478 221 L507 299Z" fill="#ffffff"/>' +
        '<path class="colorivel" data-part="barbatana" d="M270 215 L310 149 L352 222Z" fill="#ffffff"/>' +
        '<circle class="colorivel" data-part="olho" cx="207" cy="203" r="16" fill="#ffffff"/>' +
        '<circle class="colorivel" data-part="bolha1" cx="132" cy="145" r="20" fill="#ffffff"/><circle class="colorivel" data-part="bolha2" cx="92" cy="101" r="14" fill="#ffffff"/>' +
        '<path class="colorivel" data-part="alga" d="M520 390 Q474 315 529 274 Q569 314 536 341 Q579 347 555 390Z" fill="#ffffff"/>' +
        '</svg>'
    }
  ];
  var selected = COLORS[0];
  var current = 0;
  var level = 1;
  var histories = drawings.map(function () { return []; });

  function $(id) { return document.getElementById(id); }
  function createPalette() {
    COLORS.forEach(function (color, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'cor-btn' + (index === 0 ? ' selecionada' : '');
      button.style.background = color;
      button.setAttribute('aria-label', 'Escolher cor ' + (index + 1));
      button.addEventListener('click', function () {
        selected = color;
        document.querySelectorAll('.cor-btn').forEach(function (el) { el.classList.remove('selecionada'); });
        button.classList.add('selecionada');
      });
      $('paleta').appendChild(button);
    });
  }
  function showDrawing(index) {
    current = (index + drawings.length) % drawings.length;
    var item = drawings[current];
    $('titulo-desenho').textContent = item.title;
    $('missao').textContent = 'Pinte ' + item.needed + ' partes para liberar o proximo nivel!';
    $('desenho').innerHTML = item.svg;
    restoreHistory();
    $('desenho').querySelectorAll('.colorivel').forEach(function (part) {
      part.addEventListener('click', function () { paint(part); });
    });
    updateProgress();
  }
  function restoreHistory() {
    histories[current].forEach(function (change) {
      var part = $('desenho').querySelector('[data-part="' + change.part + '"]');
      if (part) part.setAttribute('fill', change.color);
    });
  }
  function paint(part) {
    var partName = part.dataset.part;
    var history = histories[current];
    history.push({ part: partName, color: selected, before: part.getAttribute('fill') || BLANK });
    part.setAttribute('fill', selected);
    updateProgress();
  }
  function paintedParts() {
    var parts = {};
    histories[current].forEach(function (change) {
      parts[change.part] = change.color !== BLANK;
    });
    return Object.keys(parts).filter(function (part) { return parts[part]; }).length;
  }
  function updateProgress() {
    var item = drawings[current];
    var count = paintedParts();
    var progress = Math.min(100, Math.round(count / item.needed * 100));
    $('progresso').textContent = progress;
    $('barra').style.width = progress + '%';
    if (count >= item.needed && !item.completed) {
      item.completed = true;
      level++;
      $('nivel').textContent = level;
      $('level-message').textContent = item.title + ' completo. Um novo desenho espera por voce!';
      $('level-toast').classList.add('show');
      setTimeout(function () { $('level-toast').classList.remove('show'); }, 2700);
    }
  }
  function undo() {
    var last = histories[current].pop();
    if (!last) return;
    var part = $('desenho').querySelector('[data-part="' + last.part + '"]');
    if (part) part.setAttribute('fill', last.before);
    updateProgress();
  }
  function clearDrawing() {
    histories[current] = [];
    showDrawing(current);
  }
  createPalette();
  showDrawing(0);
  $('anterior').addEventListener('click', function () { showDrawing(current - 1); });
  $('proximo').addEventListener('click', function () { showDrawing(current + 1); });
  $('desfazer').addEventListener('click', undo);
  $('limpar').addEventListener('click', clearDrawing);
}());
