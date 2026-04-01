// ======== CONFIGURAÇÕES DAS FASES ========
const fases = [
  { pares: 2 },
  { pares: 4 },
  { pares: 6 },
  { pares: 8 },
  { pares: 10 }
];

let faseAtual = 0;
let primeiraCarta = null;
let bloqueio = false;
let acertos = 0;

// ======== ELEMENTOS ========
const telaInicial = document.getElementById('tela-inicial');
const telaJogo = document.getElementById('tela-jogo');
const telaVitoria = document.getElementById('tela-vitoria');
const tabuleiro = document.getElementById('tabuleiro');
const tituloFase = document.getElementById('tituloFase');
const tempo = document.getElementById('tempo');
let tempoRestante;
let intervaloTempo;

// ======== SONS ========
const somClick = new Audio('/audio/click.wav');
const somAcerto = new Audio('/audio/acerto.wav');
const somError = new Audio('/audio/error.wav');
const somGamecompleted = new Audio('/audio/gamecompleted.wav');
const somGameover = new Audio('/audio/gameover.wav');



// ======== EVENTOS ========
document.getElementById('btnIniciar').addEventListener('click', iniciarJogo);
document.getElementById('btnContinuar').addEventListener('click', proximaFase);
document.getElementById('btnReiniciar').addEventListener('click', reiniciarFase);

// ======== FUNÇÕES PRINCIPAIS ========

// Inicia o jogo
function iniciarJogo() {
  telaInicial.classList.add('oculto');
  telaJogo.classList.remove('oculto');
  carregarFase();
}

// Gera o tabuleiro da fase atual
function carregarFase() {
  acertos = 0;
  const fase = fases[faseAtual];
  tituloFase.textContent = `Fase ${faseAtual + 1}`;
  gerarCartas(fase.pares);
  tempoRestante = 30 + faseAtual * 15; // tempo aumenta por fase
  tempo.textContent = `⏱️ Tempo: ${tempoRestante}s`;
  iniciarContagem();

}

function iniciarContagem() {
  clearInterval(intervaloTempo);
  intervaloTempo = setInterval(() => {
    tempoRestante--;
    tempo.textContent = `⏱️ Tempo: ${tempoRestante}s`;
    if (tempoRestante <= 0) {
      clearInterval(intervaloTempo);
      alert("⏰ Tempo esgotado!");
      reiniciarFase();
    }
  }, 1000);
}


// Cria e embaralha as cartas
function gerarCartas(qtdPares) {
  tabuleiro.innerHTML = '';
  const nomes = [
    "aguaviva","aguia","araraazul","cachorro","caranguejo","cavalo","cobra","coelho","elefante","esquilo",
    "flamingo","gato","girafa","guepardo","jacare","joaninha","leao","lobo","macaco","orca",
    "panda","pato","pavao","pinguin","raposa","rato","tartaruga","tucano","vaca","zebra"
  ];

  const imagens = shuffle(nomes).slice(0, qtdPares);
  const pares = shuffle([...imagens, ...imagens]);

  ajustarGrade(pares.length);

  pares.forEach(nome => {
  const carta = document.createElement('div'); // ✅ cria o elemento
  carta.classList.add('carta');
  carta.innerHTML = `
    <div class="carta-inner">
      <div class="carta-verso"></div>
      <div class="carta-frente"><img src="/img/${nome}.jpg" alt="${nome}"></div>
    </div>
  `;
  carta.addEventListener('click', () => virarCarta(carta, nome));
  tabuleiro.appendChild(carta);
});

}

// Define o número de colunas por fase
function ajustarGrade(total) {
  if (total <= 4) tabuleiro.style.gridTemplateColumns = 'repeat(2, 100px)';
  else if (total <= 8) tabuleiro.style.gridTemplateColumns = 'repeat(4, 100px)';
  else if (total <= 12) tabuleiro.style.gridTemplateColumns = 'repeat(4, 100px)';
  else if (total <= 16) tabuleiro.style.gridTemplateColumns = 'repeat(4, 100px)';
  else tabuleiro.style.gridTemplateColumns = 'repeat(5, 100px)';
}

// Lógica de virar cartas
function virarCarta(carta, nome) {
  if (bloqueio || carta.classList.contains('virada')) return;
  carta.classList.add('virada');
  somClick.play();

  if (!primeiraCarta) {
    primeiraCarta = { carta, nome };
  } else {
    bloqueio = true;
    if (nome === primeiraCarta.nome) {
      somAcerto.play();
      acertos++;
      if (acertos === fases[faseAtual].pares) {
        setTimeout(() => venceuFase(), 600);
      }
      primeiraCarta = null;
      bloqueio = false;
    } else {
      somError.play();
      setTimeout(() => {
        carta.classList.remove('virada');
        primeiraCarta.carta.classList.remove('virada');
        primeiraCarta = null;
        bloqueio = false;
      }, 1000);
    }
  }
}

// Quando vence a fase
function venceuFase() {
  telaJogo.classList.add('oculto');
  telaVitoria.classList.remove('oculto');
}

// Próxima fase
function proximaFase() {
  if (faseAtual < fases.length - 1) {
    faseAtual++;
    telaVitoria.classList.add('oculto');
    telaJogo.classList.remove('oculto');
    carregarFase();
  } else {
    somGamecompleted.play();
    alert("🏆 Você concluiu todas as fases!");
    reiniciarFase();
  }
}

// Reinicia o jogo
function reiniciarFase() {
  somGameover.play();
  faseAtual = 0;
  telaVitoria.classList.add('oculto');
  telaInicial.classList.remove('oculto');
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}