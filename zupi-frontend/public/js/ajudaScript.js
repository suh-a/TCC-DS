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
    const typing = document.getElementById('typingIndicator');
    const clearBtn = document.getElementById('clearChat');
    const user = ZupiAPI.getUser();

    if (!form || !input || !messages) return;

    document.querySelectorAll('[data-help-question]').forEach(button => {
        button.addEventListener('click', () => {
            input.value = button.dataset.helpQuestion || '';
            input.focus();
            form.requestSubmit();
        });
    });

    clearBtn?.addEventListener('click', () => {
        messages.innerHTML = '';
        appendMessage(messages, 'Zupi IA', 'Chat limpo. Pode mandar sua proxima pergunta.', 'in');
        input.focus();
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        appendMessage(messages, user.name || 'Voce', text, 'out');
        input.value = '';
        setTyping(typing, true);

        const answer = await getAiAnswer(text, user, messages);

        window.setTimeout(() => {
            setTyping(typing, false);
            appendMessage(messages, 'Zupi IA', answer, 'in');
        }, Math.min(1100, 420 + text.length * 12));

        sendSupportTicket(text, user);
    });
});

async function getAiAnswer(text, user, messagesContainer) {
    const history = Array.from(messagesContainer.querySelectorAll('.ajuda-msg')).slice(-8).map(message => ({
        role: message.classList.contains('ajuda-msg--out') ? 'user' : 'assistant',
        content: message.querySelector('.ajuda-msg-bubble')?.textContent || ''
    }));

    const payload = {
        message: text,
        user: {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            type: user?.type || 'RESPONSAVEL'
        },
        history,
        context: 'Central de ajuda do Zupi. Responda em portugues do Brasil, de forma curta, acolhedora e focada em orientar o usuario no sistema.'
    };

    const endpoints = [
        window.ZUPI_AI_CHAT_PATH || '/support/ai-chat',
        '/ai/chat'
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await ZupiAPI.post(endpoint, payload, { skipAuthRedirect: true });
            if (!response || !response.ok) continue;
            const data = await response.json();
            const answer = data.answer || data.reply || data.message || data.outputText || data.text;
            if (answer) return answer;
        } catch (err) {
            console.warn('IA indisponivel neste endpoint:', endpoint, err);
        }
    }

    return createHelpAnswer(text, user);
}

function normalizeText(text) {
    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function hasAny(text, words) {
    return words.some(word => text.includes(word));
}

function createHelpAnswer(message, user) {
    const text = normalizeText(message);
    const name = user?.name ? user.name.split(' ')[0] : '';
    const greeting = name ? `${name}, ` : '';

    const answers = [
        {
            match: ['cadastro', 'cadastrar', 'dependente', 'crianca', 'filho', 'aluno'],
            reply: `${greeting}para cadastrar uma crianca, entre em "Cadastro de dependentes" no menu lateral, preencha os dados principais e salve. Depois ela aparece em "Selecao de Perfil".`
        },
        {
            match: ['perfil', 'perfis', 'selecionar', 'trocar crianca'],
            reply: 'Para trocar ou abrir um perfil, use "Selecao de Perfil" no menu. Ali voce escolhe a crianca e entra no painel, atividades e relatorios dela.'
        },
        {
            match: ['relatorio', 'relatorios', 'desempenho', 'progresso', 'evolucao'],
            reply: 'Os relatorios ficam no menu "Relatorios". Escolha a crianca para ver desempenho, progresso, tempo de uso e resultados dos jogos.'
        },
        {
            match: ['agenda', 'evento', 'atividade', 'rotina', 'compromisso'],
            reply: 'Na "Agenda" voce consegue organizar atividades, compromissos e rotinas. Use o formulario da tela para criar eventos e acompanhar tudo em um lugar so.'
        },
        {
            match: ['senha', 'login', 'entrar', 'acesso', 'email', 'e-mail'],
            reply: 'Se o problema for acesso, confira email e senha. Para recuperar, saia da conta e use "Esqueci minha senha" na tela de login.'
        },
        {
            match: ['configuracao', 'configuracoes', 'conta', 'dados', 'alterar'],
            reply: 'Em "Configuracoes" voce pode revisar dados da conta, alterar email, senha e preferencias de seguranca.'
        },
        {
            match: ['jogo', 'jogos', 'atividade interativa', 'menu jogos'],
            reply: 'Os jogos ficam no painel da crianca e no menu de jogos. Eles ajudam a registrar tempo, progresso e desempenho para aparecer nos relatorios.'
        },
        {
            match: ['plano', 'pagamento', 'assinatura', 'preco'],
            reply: 'Para duvidas sobre planos ou pagamento, acesse "Planos" ou envie uma mensagem com detalhes. A equipe pode retornar pelo email cadastrado.'
        },
        {
            match: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite'],
            reply: `Ola${name ? `, ${name}` : ''}! Pode me perguntar sobre cadastro, perfis, relatorios, agenda, jogos, senha ou configuracoes.`
        }
    ];

    const found = answers.find(item => hasAny(text, item.match));
    if (found) return found.reply;

    return 'Ainda nao tenho uma resposta exata para isso, mas registrei sua pergunta para o suporte. Tente escrever com palavras como cadastro, relatorios, agenda, senha, jogos ou configuracoes para eu responder melhor agora.';
}

async function sendSupportTicket(text, user) {
    try {
        await ZupiAPI.post('/support/ticket', {
            requesterEmail: user.email,
            requesterName: user.name,
            userType: user.type || 'RESPONSAVEL',
            subject: 'Chat Ajuda - IA basica',
            message: text
        });
    } catch (err) {
        console.warn('Nao foi possivel registrar o chamado automaticamente.', err);
    }
}

function setTyping(element, visible) {
    if (!element) return;
    element.hidden = !visible;
}

function appendMessage(container, name, text, direction) {
    const article = document.createElement('article');
    article.className = 'ajuda-msg ajuda-msg--' + direction;

    const initial = (name || '?').charAt(0).toUpperCase();
    const nameEl = document.createElement('strong');
    nameEl.className = 'ajuda-msg-name';
    nameEl.textContent = name;

    const bubble = document.createElement('p');
    bubble.className = 'ajuda-msg-bubble';
    bubble.textContent = text;

    const avatar = document.createElement('div');
    avatar.className = 'ajuda-msg-avatar';
    avatar.textContent = initial;
    avatar.setAttribute('aria-hidden', 'true');

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
