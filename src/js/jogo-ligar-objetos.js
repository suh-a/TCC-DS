
        // --- CONFIGURAÇÃO DAS FASES ---
        const levels = [
            {
                title: "Animais e Comidas",
                instruction: "O que cada bichinho come?",
                pairs: [
                    { id: 'a1', left: '🐶', right: '🦴' }, // Cachorro -> Osso
                    { id: 'a2', left: '🐵', right: '🍌' }, // Macaco -> Banana
                    { id: 'a3', left: '🐰', right: '🥕' }  // Coelho -> Cenoura
                ]
            },
            {
                title: "Cores e Objetos",
                instruction: "Combine a cor com o objeto!",
                pairs: [
                    { id: 'b1', left: '🔴', right: '🍎' }, // Vermelho -> Maçã
                    { id: 'b2', left: '🟡', right: '☀️' }, // Amarelo -> Sol
                    { id: 'b3', left: '🔵', right: '🚙' }, // Azul -> Carro
                    { id: 'b4', left: '🟢', right: '🐸' }  // Verde -> Sapo
                ]
            },
            {
                title: "Formas e Esportes",
                instruction: "Qual bola parece com a forma?",
                pairs: [
                    { id: 'c1', left: '⚽', right: '⚪' }, // Bola Futebol -> Círculo
                    { id: 'c2', left: '🏉', right: '🥚' }, // Bola Rugby -> Oval
                    { id: 'c3', left: '📦', right: '🟥' }, // Caixa -> Quadrado
                    { id: 'c4', left: '🍕', right: '🔺' }, // Pizza -> Triângulo
                    { id: 'c5', left: '🪁', right: '🔷' }  // Pipa -> Losango
                ]
            }
        ];

        // --- ESTADO DO JOGO ---
        let currentLevelIndex = 0;
        let selectedItem = null;
        let matchesFound = 0;
        let totalMatches = 0;

        // Elementos DOM
        const leftCol = document.getElementById('col-left');
        const rightCol = document.getElementById('col-right');
        const svg = document.getElementById('connections');
        const levelIndicator = document.getElementById('level-indicator');
        const instructionText = document.getElementById('instruction-text');
        const modal = document.getElementById('modal-overlay');

        // --- FUNÇÕES DO JOGO ---

        function initLevel(levelIndex) {
            // Resetar visual
            leftCol.innerHTML = '';
            rightCol.innerHTML = '';
            svg.innerHTML = '';
            modal.style.display = 'none';
            selectedItem = null;
            matchesFound = 0;

            // Carregar dados da fase
            const level = levels[levelIndex];
            totalMatches = level.pairs.length;

            // Atualizar textos
            levelIndicator.innerText = `Fase ${levelIndex + 1} de ${levels.length}`;
            instructionText.innerText = level.instruction;

            // Preparar dados
            // Lado esquerdo (Ordem fixa ou aleatória, vamos deixar fixa para leitura)
            const leftItems = level.pairs.map(p => ({ id: p.id, icon: p.left, side: 'left' }));
            // Lado direito (Embaralhado)
            const rightItems = level.pairs.map(p => ({ matchId: p.id, icon: p.right, side: 'right' }));
            shuffleArray(rightItems);

            // Renderizar
            leftItems.forEach(item => createCard(item, leftCol));
            rightItems.forEach(item => createCard(item, rightCol));
        }

        function createCard(item, container) {
            const card = document.createElement('div');
            card.className = 'item';
            card.innerText = item.icon;
            // Guardamos os dados no dataset
            if(item.side === 'left') {
                card.dataset.id = item.id;
            } else {
                card.dataset.matchId = item.matchId;
            }
            card.dataset.side = item.side;
            
            card.addEventListener('click', () => handleSelection(card));
            container.appendChild(card);
        }

        function handleSelection(card) {
            if (card.classList.contains('matched')) return;

            // Primeiro clique
            if (!selectedItem) {
                selectedItem = card;
                card.classList.add('selected');
                return;
            }

            // Cancelar seleção (clique no mesmo)
            if (selectedItem === card) {
                selectedItem.classList.remove('selected');
                selectedItem = null;
                return;
            }

            // Trocar seleção (clique no mesmo lado)
            if (selectedItem.dataset.side === card.dataset.side) {
                selectedItem.classList.remove('selected');
                selectedItem = card;
                card.classList.add('selected');
                return;
            }

            // Verificar Match
            const id1 = selectedItem.dataset.id || selectedItem.dataset.matchId;
            const id2 = card.dataset.id || card.dataset.matchId;

            if (id1 === id2) {
                successMatch(selectedItem, card);
            } else {
                errorMatch(selectedItem, card);
            }
        }

        function successMatch(item1, item2) {
            item1.classList.remove('selected');
            item1.classList.add('matched');
            item2.classList.remove('selected'); // remove caso tenha sido clicado por último
            item2.classList.add('matched');

            drawLine(item1, item2);
            selectedItem = null;
            matchesFound++;

            if (matchesFound === totalMatches) {
                setTimeout(showVictoryModal, 800);
            }
        }

        function errorMatch(item1, item2) {
            item1.classList.add('error');
            item2.classList.add('error');
            setTimeout(() => {
                item1.classList.remove('error', 'selected');
                item2.classList.remove('error', 'selected');
                selectedItem = null;
            }, 500);
        }

        // --- SISTEMA DE FASES E MODAL ---

        function showVictoryModal() {
            const isLastLevel = currentLevelIndex === levels.length - 1;
            const title = document.getElementById('modal-title');
            const msg = document.getElementById('modal-message');
            const btn = document.getElementById('modal-btn');
            const icon = document.getElementById('modal-icon');

            if (isLastLevel) {
                icon.innerText = "🏆";
                title.innerText = "Parabéns!";
                msg.innerText = "Você completou todas as fases do Zupi!";
                btn.innerText = "Jogar Novamente";
                btn.onclick = restartGame;
            } else {
                icon.innerText = "🌟";
                title.innerText = "Muito bem!";
                msg.innerText = "Vamos para o próximo desafio?";
                btn.innerText = "Próxima Fase ➔";
                btn.onclick = nextLevel;
            }

            modal.style.display = 'flex';
        }

        function nextLevel() {
            currentLevelIndex++;
            initLevel(currentLevelIndex);
        }

        function restartGame() {
            currentLevelIndex = 0;
            initLevel(currentLevelIndex);
        }

        function nextAction() {
            // Esta função é substituída dinamicamente no showVictoryModal, 
            // mas mantemos como placeholder.
        }

        // --- UTILITÁRIOS ---

        function drawLine(startElem, endElem) {
            const containerRect = document.getElementById('game-container').getBoundingClientRect();
            const startRect = startElem.getBoundingClientRect();
            const endRect = endElem.getBoundingClientRect();

            const x1 = startRect.left + startRect.width / 2 - containerRect.left;
            const y1 = startRect.top + startRect.height / 2 - containerRect.top;
            const x2 = endRect.left + endRect.width / 2 - containerRect.left;
            const y2 = endRect.top + endRect.height / 2 - containerRect.top;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            svg.appendChild(line);
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // --- INICIALIZAÇÃO ---
        window.onload = () => initLevel(0);
        
        // Limpar linhas ao redimensionar (simplificação)
        window.onresize = () => { svg.innerHTML = ''; }; 

