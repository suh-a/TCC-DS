// ========== CONFIGURAÇÕES DAS FASES ==========
const fases = [
    { numFormas: 3, tempo: 30000 },  // Fase 1: 3 formas
    { numFormas: 4, tempo: 25000 },  // Fase 2: 4 formas
    { numFormas: 5, tempo: 20000 },  // Fase 3: 5 formas
    { numFormas: 6, tempo: 18000 },  // Fase 4: 6 formas
    { numFormas: 7, tempo: 15000 }   // Fase 5: 7 formas
];

// ========== DADOS DO JOGO ==========
const formas = ['circle', 'square', 'rectangle', 'pentagon', 'triangle'];
const cores = ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'pink', 'cyan'];

const coresPT = {
    red: 'vermelho',
    blue: 'azul',
    yellow: 'amarelo',
    green: 'verde',
    purple: 'roxo',
    orange: 'laranja',
    pink: 'rosa',
    cyan: 'ciano'
};

const formasPT = {
    circle: 'círculo',
    square: 'quadrado',
    rectangle: 'retângulo',
    pentagon: 'pentágono',
    triangle: 'triângulo'
};

// ========== VARIÁVEIS GLOBAIS ==========
let faseAtual = 0;
let pontuacao = 0;
let formasGeradas = [];
let formaAlvo = null;
let bloqueio = false;

// ========== ELEMENTOS DOM ==========
const gameArea = document.getElementById('game-area');
const instructionText = document.getElementById('instruction-text');
const levelIndicator = document.getElementById('level-indicator');
const scoreElement = document.getElementById('score');
const feedbackElement = document.getElementById('feedback');
const feedbackText = document.getElementById('feedback-text');
const modalOverlay = document.getElementById('modal-overlay');
const btnRestart = document.getElementById('btn-restart');
const btnMenu = document.getElementById('btn-menu');

// ========== SONS (opcional, usando os mesmos do jogoMemoria) ==========
const somClick = new Audio('/audio/click.wav');
const somAcerto = new Audio('/audio/acerto.wav');
const somError = new Audio('/audio/error.wav');
const somGameCompleted = new Audio('/audio/gamecompleted.wav');

// ========== INICIALIZAÇÃO ==========
window.onload = () => {
    iniciarJogo();
    btnRestart.addEventListener('click', reiniciarJogo);
    btnMenu.addEventListener('click', () => {
        window.location.href = '/menuJogos';
    });
};

// ========== FUNÇÕES PRINCIPAIS ==========

function iniciarJogo() {
    faseAtual = 0;
    pontuacao = 0;
    atualizarUI();
    carregarFase();
}

function carregarFase() {
    if (faseAtual >= fases.length) {
        finalizarJogo();
        return;
    }

    bloqueio = false;
    const fase = fases[faseAtual];
    levelIndicator.textContent = `Fase ${faseAtual + 1} de ${fases.length}`;
    
    // Limpar área de jogo
    gameArea.innerHTML = '';
    formasGeradas = [];
    ocultarFeedback();

    // Gerar formas
    gerarFormas(fase.numFormas);

    // Selecionar forma alvo aleatória
    selecionarFormaAlvo();

    // Atualizar instrução
    atualizarInstrucao();
}

function gerarFormas(numFormas) {
    const formasUsadas = new Set();
    
    for (let i = 0; i < numFormas; i++) {
        let forma, cor;
        
        // Garantir que não haja duplicatas
        do {
            forma = formas[Math.floor(Math.random() * formas.length)];
            cor = cores[Math.floor(Math.random() * cores.length)];
        } while (formasUsadas.has(`${forma}-${cor}`));
        
        formasUsadas.add(`${forma}-${cor}`);

        const shapeData = {
            id: `shape-${i}`,
            tipo: forma,
            cor: cor,
            classes: `shape shape-${forma} shape-${cor}`
        };

        formasGeradas.push(shapeData);
        criarFormaElemento(shapeData);
    }
}

function criarFormaElemento(shapeData) {
    const shapeElement = document.createElement('div');
    shapeElement.className = shapeData.classes;
    shapeElement.id = shapeData.id;
    shapeElement.dataset.tipo = shapeData.tipo;
    shapeElement.dataset.cor = shapeData.cor;

    // Tamanho aleatório para variedade visual
    const tamanho = 120 + Math.random() * 40; // Entre 120px e 160px
    shapeElement.style.width = `${tamanho}px`;
    shapeElement.style.height = `${tamanho}px`;

    // Posição aleatória inicial
    const posX = Math.random() * (gameArea.offsetWidth - tamanho);
    const posY = Math.random() * (gameArea.offsetHeight - tamanho);
    shapeElement.style.position = 'absolute';
    shapeElement.style.left = `${posX}px`;
    shapeElement.style.top = `${posY}px`;

    // Adicionar olhos
    adicionarOlhos(shapeElement);

    // Adicionar boca (aleatório)
    if (Math.random() > 0.5) {
        shapeElement.classList.add('happy');
    }

    // Adicionar animação de delay aleatório
    const delay = Math.random() * 2;
    shapeElement.style.animationDelay = `${delay}s`;

    // Event listener
    shapeElement.addEventListener('click', () => handleClick(shapeElement));

    gameArea.appendChild(shapeElement);
}

function adicionarOlhos(shapeElement) {
    // Criar elementos de olhos
    const olhoEsquerdo = document.createElement('div');
    const olhoDireito = document.createElement('div');
    const pupilaEsquerda = document.createElement('div');
    const pupilaDireita = document.createElement('div');

    olhoEsquerdo.className = 'olho olho-esquerdo';
    olhoDireito.className = 'olho olho-direito';
    pupilaEsquerda.className = 'pupila';
    pupilaDireita.className = 'pupila';

    olhoEsquerdo.appendChild(pupilaEsquerda);
    olhoDireito.appendChild(pupilaDireita);
    shapeElement.appendChild(olhoEsquerdo);
    shapeElement.appendChild(olhoDireito);
}

function selecionarFormaAlvo() {
    const indiceAleatorio = Math.floor(Math.random() * formasGeradas.length);
    formaAlvo = formasGeradas[indiceAleatorio];
}

function atualizarInstrucao() {
    if (!formaAlvo) return;
    
    const tipoPT = formasPT[formaAlvo.tipo];
    const corPT = coresPT[formaAlvo.cor];
    
    instructionText.textContent = `Clique no ${tipoPT} ${corPT}`;
}

function handleClick(shapeElement) {
    if (bloqueio) return;

    somClick.play().catch(() => {}); // Ignorar erros de áudio

    const tipoClicado = shapeElement.dataset.tipo;
    const corClicada = shapeElement.dataset.cor;

    shapeElement.classList.add('clicked');

    // Verificar se é a forma correta
    if (tipoClicado === formaAlvo.tipo && corClicada === formaAlvo.cor) {
        acertou(shapeElement);
    } else {
        errou(shapeElement);
    }
}

function acertou(shapeElement) {
    bloqueio = true;
    somAcerto.play().catch(() => {});
    
    pontuacao += 10;
    atualizarUI();
    
    mostrarFeedback('✅ Correto!', 'success');
    
    // Animação de sucesso
    shapeElement.style.animation = 'bounce 0.6s ease';
    
    setTimeout(() => {
        ocultarFeedback();
        faseAtual++;
        
        if (faseAtual < fases.length) {
            carregarFase();
        } else {
            finalizarJogo();
        }
    }, 1500);
}

function errou(shapeElement) {
    somError.play().catch(() => {});
    mostrarFeedback('❌ Tente novamente!', 'error');
    
    // Animação de erro
    shapeElement.style.animation = 'shake 0.5s ease';
    
    setTimeout(() => {
        ocultarFeedback();
        shapeElement.classList.remove('clicked');
    }, 1000);
}

function mostrarFeedback(mensagem, tipo) {
    feedbackText.textContent = mensagem;
    feedbackElement.className = tipo;
    feedbackElement.classList.remove('hidden');
}

function ocultarFeedback() {
    feedbackElement.classList.add('hidden');
    feedbackElement.className = 'hidden';
}

function atualizarUI() {
    scoreElement.textContent = `Pontos: ${pontuacao}`;
}

function finalizarJogo() {
    somGameCompleted.play().catch(() => {});
    
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalIcon = document.getElementById('modal-icon');
    
    modalTitle.textContent = '🎉 Parabéns!';
    modalMessage.textContent = `Você completou todas as fases com ${pontuacao} pontos!`;
    modalIcon.textContent = '🏆';
    
    modalOverlay.classList.remove('hidden');
}

function reiniciarJogo() {
    modalOverlay.classList.add('hidden');
    iniciarJogo();
}

// Estilos já estão no CSS, não precisamos adicionar dinamicamente

