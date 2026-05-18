document.addEventListener('DOMContentLoaded', function () {
    if (!ZupiAPI.requireAuth()) return;

    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            ZupiAPI.logout();
        });
    });

    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const user = ZupiAPI.getUser();

    if (!form || !input || !messages) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        appendMessage(messages, user.name || 'Voce', text, 'out');
        input.value = '';

        try {
            const response = await ZupiAPI.post('/support/ticket', {
                requesterEmail: user.email,
                requesterName: user.name,
                userType: user.type || 'RESPONSAVEL',
                subject: 'Chat Ajuda',
                message: text
            });

            if (response && response.ok) {
                appendMessage(messages, 'Equipe Zupi', 'Recebemos sua mensagem! Em breve retornaremos o contato.', 'in');
            } else {
                appendMessage(messages, 'Equipe Zupi', 'Nao foi possivel enviar agora. Tente novamente em instantes.', 'in');
            }
        } catch (err) {
            console.error(err);
            appendMessage(messages, 'Equipe Zupi', 'Erro de conexao. Verifique sua internet.', 'in');
        }
    });
});

function appendMessage(container, name, text, direction) {
    const article = document.createElement('article');
    article.className = 'ajuda-msg ajuda-msg--' + direction;
    const initial = (name || '?').charAt(0).toUpperCase();
    const wrap = document.createElement('div');
    const nameEl = document.createElement('strong');
    nameEl.className = 'ajuda-msg-name';
    nameEl.textContent = name;
    const bubble = document.createElement('p');
    bubble.className = 'ajuda-msg-bubble';
    bubble.textContent = text;
    const avatar = document.createElement('div');
    avatar.className = 'ajuda-msg-avatar';
    avatar.textContent = initial;
    const body = document.createElement('div');
    body.appendChild(nameEl);
    body.appendChild(bubble);

    if (direction === 'out') {
        article.appendChild(body);
        article.appendChild(avatar);
    } else {
        article.appendChild(avatar);
        article.appendChild(body);
    }

    container.appendChild(article);
    container.scrollTop = container.scrollHeight;
}
