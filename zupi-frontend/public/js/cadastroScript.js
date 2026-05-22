let currentStep = 0;
let tipoCadastro = 'pf';
let stepsConfig = [];

document.addEventListener('DOMContentLoaded', function () {
    if (ZupiAPI.isAuthenticated()) {
        ZupiAPI.redirectByUserType(ZupiAPI.getUser().type);
        return;
    }

    const params = new URLSearchParams(window.location.search);
    tipoCadastro = params.get('tipo') === 'pj' ? 'pj' : 'pf';
    stepsConfig = tipoCadastro === 'pj' ? getPessoaJuridicaSteps() : getPessoaFisicaSteps();

    renderCadastro();
    initMasks();
    updateStep();
});

function getPessoaFisicaSteps() {
    return [
        {
            title: 'Dados pessoais',
            fields: [
                field('nome', 'Nome completo'),
                field('cpf', 'CPF'),
                field('nascimento', 'Data de nascimento', 'date')
            ],
            actions: [{ label: 'Proximo', type: 'next' }]
        },
        {
            title: 'Endereco',
            fields: addressFields(),
            actions: [
                { label: 'Anterior', type: 'prev' },
                { label: 'Proximo', type: 'next' }
            ]
        },
        {
            title: 'Contato / Seguranca',
            fields: securityFields(),
            actions: [
                { label: 'Anterior', type: 'prev' },
                { label: 'Proximo', type: 'next' }
            ]
        },
        {
            title: 'Pagamento',
            payment: true,
            actions: [
                { label: 'Anterior', type: 'prev' },
                { label: 'Concluir pagamento e se cadastrar', type: 'finish' }
            ]
        }
    ];
}

function getPessoaJuridicaSteps() {
    return [
        {
            title: 'Dados institucionais / Contato / Seguranca',
            fields: [
                field('nome', 'Nome da instituicao'),
                field('cnpj', 'CNPJ'),
                field('email', 'E-mail', 'email'),
                field('telefone', 'Telefone'),
                field('senha', 'Senha', 'password'),
                field('confirmarSenha', 'Confirmar senha', 'password')
            ],
            actions: [{ label: 'Proximo', type: 'next' }]
        },
        {
            title: 'Endereco',
            fields: addressFields(),
            actions: [
                { label: 'Anterior', type: 'prev' },
                { label: 'Proximo', type: 'next' }
            ]
        },
        {
            title: 'Pagamento',
            payment: true,
            actions: [
                { label: 'Anterior', type: 'prev' },
                { label: 'Concluir pagamento e se cadastrar', type: 'finish' }
            ]
        }
    ];
}

function field(id, label, type = 'text') {
    return { id, label, type };
}

function addressFields() {
    return [
        field('cep', 'CEP'),
        field('rua', 'Rua'),
        field('numero', 'Numero'),
        field('bairro', 'Bairro'),
        field('estado', 'Estado'),
        field('pais', 'Pais')
    ];
}

function securityFields() {
    return [
        field('email', 'E-mail', 'email'),
        field('telefone', 'Telefone'),
        field('senha', 'Senha', 'password'),
        field('confirmarSenha', 'Confirmar senha', 'password')
    ];
}

function renderCadastro() {
    document.getElementById('cadastroTipoLabel').textContent =
        tipoCadastro === 'pj' ? 'Plano Pessoa Juridica' : 'Plano Pessoa Fisica';
    document.getElementById('cadastroTitulo').textContent =
        tipoCadastro === 'pj' ? 'Cadastro Pessoa Juridica' : 'Cadastro Pessoa Fisica';

    renderStepIndicator();
    renderSteps();
}

function renderStepIndicator() {
    const indicator = document.getElementById('stepIndicator');
    indicator.innerHTML = stepsConfig
        .map((_, index) => `<button class="step" type="button" aria-label="Etapa ${index + 1}"></button>`)
        .join('');
}

function renderSteps() {
    const wrapper = document.getElementById('cadastroSteps');

    wrapper.innerHTML = stepsConfig
        .map((step, index) => `
            <section class="cadastro-step" data-step="${index}">
                <h2>${step.title}</h2>
                ${step.payment ? renderPaymentStep() : renderFields(step.fields)}
                ${renderActions(step.actions)}
            </section>
        `)
        .join('');

    const pais = document.getElementById('pais');
    if (pais) {
        pais.value = '';
    }
}

function renderFields(fields) {
    return `<div class="row">${fields.map(renderField).join('')}</div>`;
}

function renderField(fieldConfig) {
    const wide = ['nome', 'rua', 'email'].includes(fieldConfig.id) ? 'col-12' : 'col-12 col-md-6';
    return `
        <div class="${wide} mb-3">
            <label class="form-label" for="${fieldConfig.id}">${fieldConfig.label}</label>
            <input
                type="${fieldConfig.type}"
                id="${fieldConfig.id}"
                name="${fieldConfig.id}"
                class="form-control"
                required
            >
        </div>
    `;
}

function renderPaymentStep() {
    const docLabel = tipoCadastro === 'pj' ? 'CNPJ' : 'CPF';
    const nameLabel = tipoCadastro === 'pj' ? 'Nome da instituicao' : 'Nome';

    return `
        <div class="pagamento-box" id="planoValor">
            Valor do plano: ${tipoCadastro === 'pj' ? 'R$ 700,00' : 'R$ 80,00'}
        </div>

        <div class="row">
            <div class="col-12 mb-3">
                <label class="form-label" for="resumoNome">${nameLabel}</label>
                <input type="text" id="resumoNome" class="form-control" readonly>
            </div>
            <div class="col-12 col-md-6 mb-3">
                <label class="form-label" for="resumoDocumento">${docLabel}</label>
                <input type="text" id="resumoDocumento" class="form-control" readonly>
            </div>
            <div class="col-12 col-md-6 mb-3">
                <label class="form-label" for="resumoEmail">E-mail</label>
                <input type="email" id="resumoEmail" class="form-control" readonly>
            </div>
            <div class="col-12 mb-3">
                <label class="form-label" for="numeroCartao">Numero do cartao</label>
                <input type="text" id="numeroCartao" class="form-control" required>
            </div>
            <div class="col-12 col-md-6 mb-3">
                <label class="form-label" for="validadeCartao">Validade</label>
                <input type="text" id="validadeCartao" class="form-control" placeholder="MM/AA" required>
            </div>
            <div class="col-12 col-md-6 mb-3">
                <label class="form-label" for="cvvCartao">CVV</label>
                <input type="text" id="cvvCartao" class="form-control" required>
            </div>
        </div>
    `;
}

function renderActions(actions) {
    return `
        <div class="cadastro-actions">
            ${actions.map((action) => {
                const className = action.type === 'finish' ? 'btn-success' : action.type === 'prev' ? 'btn-outline-secondary' : 'btn-primary';
                const handler = action.type === 'finish' ? 'finalizarCadastro()' : action.type === 'prev' ? 'prevStep()' : 'nextStep()';
                return `<button type="button" class="btn ${className}" onclick="${handler}">${action.label}</button>`;
            }).join('')}
        </div>
    `;
}

function nextStep() {
    if (!validateCurrentStep()) return;

    if (currentStep < stepsConfig.length - 1) {
        currentStep++;
        updateStep();
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        updateStep();
    }
}

function updateStep() {
    document.querySelectorAll('.cadastro-step').forEach((step, index) => {
        step.classList.toggle('active', index === currentStep);
    });

    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.toggle('active', index <= currentStep);
    });

    updateResumoPagamento();
}

function updateResumoPagamento() {
    const nome = getValue('nome');
    const documento = tipoCadastro === 'pj' ? getValue('cnpj') : getValue('cpf');
    const email = getValue('email');

    setValue('resumoNome', nome);
    setValue('resumoDocumento', documento);
    setValue('resumoEmail', email);
}

async function finalizarCadastro() {
    if (!validateCurrentStep()) return;
    if (!validatePasswords()) return;

    const userData = tipoCadastro === 'pj' ? buildPessoaJuridicaData() : buildPessoaFisicaData();

    try {
        const registerResponse = await ZupiAPI.postPublic('/auth/register', userData);
        if (!registerResponse || !registerResponse.ok) {
            const erroTexto = await registerResponse.text(); // ← lê o corpo do erro
            console.error('❌ Status:', registerResponse.status);
            console.error('❌ Resposta do servidor:', erroTexto);
            alert(`Erro ${registerResponse.status}: ${erroTexto}`);
            return;
        }

        alert('Pagamento aprovado!');

        const loginResponse = await ZupiAPI.postPublic('/auth/login', {
            email: userData.email,
            password: userData.password
        });

        if (!loginResponse || !loginResponse.ok) {
            alert('Cadastro concluido, mas nao foi possivel fazer login automatico.');
            window.location.href = '/login';
            return;
        }

        const data = await loginResponse.json();
        ZupiAPI.saveSession(data);
        ZupiAPI.redirectByUserType(userData.userType);
    } catch (error) {
        console.error('Erro ao finalizar cadastro:', error);
        alert('Erro no servidor.');
    }
}

function buildPessoaFisicaData() {
    return {
        name: getValue('nome'),
        email: getValue('email'),
        password: getValue('senha'),
        cpf: getValue('cpf'),
        cnpj: null,
        birthDate: getValue('nascimento'),
        phone: getValue('telefone'),
        address: buildAddress(),
        userType: 'RESPONSAVEL',
        planType: 'PESSOA_FISICA'
    };
}

function buildPessoaJuridicaData() {
    return {
        name: getValue('nome'),
        email: getValue('email'),
        password: getValue('senha'),
        cpf: null,
        cnpj: getValue('cnpj'),
        birthDate: null,
        phone: getValue('telefone'),
        address: buildAddress(),
        userType: 'ESCOLA',
        planType: 'PESSOA_JURIDICA'
    };
}

function buildAddress() {
    return {
        cep: getValue('cep'),
        street: getValue('rua'),
        number: getValue('numero'),
        neighborhood: getValue('bairro'),
        state: getValue('estado'),
        country: getValue('pais')
    };
}

function validateCurrentStep() {
    const activeStep = document.querySelector('.cadastro-step.active');
    if (!activeStep) return true;

    const fields = Array.from(activeStep.querySelectorAll('input[required]'));

    for (const input of fields) {
        if (!input.value.trim()) {
            alert('Preencha todos os campos obrigatorios desta etapa.');
            input.focus();
            return false;
        }
    }

    return validatePasswords(activeStep);
}

function validatePasswords(scope = document) {
    const senha = document.getElementById('senha');
    const confirmarSenha = document.getElementById('confirmarSenha');

    if (!senha || !confirmarSenha) return true;
    if (!scope.contains(senha) && !scope.contains(confirmarSenha) && scope !== document) return true;

    if (senha.value.length < 6) {
        alert('A senha deve ter no minimo 6 caracteres.');
        senha.focus();
        return false;
    }

    if (senha.value !== confirmarSenha.value) {
        alert('As senhas nao coincidem.');
        confirmarSenha.focus();
        return false;
    }

    return true;
}

function initMasks() {
    maskCpf(document.getElementById('cpf'));
    maskCnpj(document.getElementById('cnpj'));
    maskPhone(document.getElementById('telefone'));
    maskCardNumber(document.getElementById('numeroCartao'));
    maskCardExpiry(document.getElementById('validadeCartao'));
    maskCvv(document.getElementById('cvvCartao'));
}

function maskCpf(el) {
    if (!el) return;

    el.addEventListener('input', () => {
        const d = el.value.replace(/\D/g, '').slice(0, 11);
        el.value = d
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    });
}

function maskCnpj(el) {
    if (!el) return;

    el.addEventListener('input', () => {
        const d = el.value.replace(/\D/g, '').slice(0, 14);
        el.value = d
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    });
}

function maskPhone(el) {
    if (!el) return;

    el.addEventListener('input', () => {
        const d = el.value.replace(/\D/g, '').slice(0, 11);
        if (d.length <= 10) {
            el.value = d
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            el.value = d
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2');
        }
    });
}

function maskCardNumber(el) {
    if (!el) return;

    el.addEventListener('input', () => {
        const d = el.value.replace(/\D/g, '').slice(0, 16);
        el.value = d.replace(/(\d{4})(?=\d)/g, '$1 ');
    });
}

function maskCardExpiry(el) {
    if (!el) return;

    el.addEventListener('input', () => {
        const d = el.value.replace(/\D/g, '').slice(0, 4);
        el.value = d.replace(/(\d{2})(\d)/, '$1/$2');
    });
}

function maskCvv(el) {
    if (!el) return;

    el.addEventListener('input', () => {
        el.value = el.value.replace(/\D/g, '').slice(0, 4);
    });
}

function getValue(id) {
    return document.getElementById(id)?.value.trim() || '';
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.value = value || '';
    }
}
