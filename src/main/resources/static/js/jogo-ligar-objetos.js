// Dados do Jogo (Pares: id e matchId devem corresponder)
        const gameData = [
            { id: 'a1', icon: '🐶', matchId: 'f1' }, // Cachorro
            { id: 'a2', icon: '🐵', matchId: 'f2' }, // Macaco
            { id: 'a3', icon: '🐰', matchId: 'f3' }, // Coelho
            { id: 'a4', icon: '🐱', matchId: 'f4' }  // Gato
        ];

        const matchData = [
            { id: 'f1', icon: '🦴', matchId: 'a1' }, // Osso
            { id: 'f2', icon: '🍌', matchId: 'a2' }, // Banana
            { id: 'f3', icon: '🥕', matchId: 'a3' }, // Cenoura
            { id: 'f4', icon: '🥛', matchId: 'a4' }  // Leite
        ];

        let selectedItem = null;
        let matchesFound = 0;
        const totalMatches = gameData.length;

        // Inicialização
        function initGame() {
            const leftCol = document.getElementById('col-left');
            const rightCol = document.getElementById('col-right');
            const svg = document.getElementById('connections');
            
            // Limpar
            leftCol.innerHTML = '';
            rightCol.innerHTML = '';
            svg.innerHTML = '';
            matchesFound = 0;
            document.getElementById('victory-modal').style.display = 'none';

            // Embaralhar as comidas para não ficarem na mesma linha
            const shuffledMatches = [...matchData].sort(() => Math.random() - 0.5);

            // Criar elementos
            gameData.forEach(item => createCard(item, leftCol, 'left'));
            shuffledMatches.forEach(item => createCard(item, rightCol, 'right'));
        }

        function createCard(item, container, side) {
            const card = document.createElement('div');
            card.className = 'item';
            card.innerText = item.icon;
            card.dataset.id = item.id;
            card.dataset.match = item.matchId;
            card.dataset.side = side;
            
            card.addEventListener('click', () => handleSelection(card));
            container.appendChild(card);
        }

        function handleSelection(card) {
            // Ignorar se já estiver combinado
            if (card.classList.contains('matched')) return;

            // Se for o primeiro clique
            if (!selectedItem) {
                selectedItem = card;
                card.classList.add('selected');
                return;
            }

            // Se clicou no mesmo item, desmarca
            if (selectedItem === card) {
                selectedItem.classList.remove('selected');
                selectedItem = null;
                return;
            }

            // Se clicou em itens da mesma coluna (lado), troca a seleção
            if (selectedItem.dataset.side === card.dataset.side) {
                selectedItem.classList.remove('selected');
                selectedItem = card;
                card.classList.add('selected');
                return;
            }

            // Verificar Match (Lógica Principal)
            if (selectedItem.dataset.match === card.dataset.id) {
                successMatch(selectedItem, card);
            } else {
                errorMatch(selectedItem, card);
            }
        }

        function successMatch(item1, item2) {
            item1.classList.remove('selected');
            item1.classList.add('matched');
            item2.classList.add('matched');

            // Desenhar linha
            drawLine(item1, item2);

            selectedItem = null;
            matchesFound++;

            // Verificar Vitória
            if (matchesFound === totalMatches) {
                setTimeout(() => {
                    document.getElementById('victory-modal').style.display = 'flex';
                }, 500);
            }
        }

        function errorMatch(item1, item2) {
            item1.classList.add('error');
            item2.classList.add('error');

            setTimeout(() => {
                item1.classList.remove('error', 'selected');
                item2.classList.remove('error');
                selectedItem = null;
            }, 500);
        }

        function drawLine(startElem, endElem) {
            const svg = document.getElementById('connections');
            const containerRect = document.getElementById('game-container').getBoundingClientRect();
            
            const startRect = startElem.getBoundingClientRect();
            const endRect = endElem.getBoundingClientRect();

            // Calcular coordenadas relativas ao container SVG
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

        function restartGame() {
            initGame();
        }

        // Iniciar ao carregar
        window.onload = initGame;
        // Atualizar linhas se a janela redimensionar
        window.onresize = () => {
            document.getElementById('connections').innerHTML = ''; // Limpa linhas antigas
            // Nota: Em um app real, redesenharíamos as linhas dos pares já feitos aqui
        };