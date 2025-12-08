# 🔗 Guia de Integração Frontend + Backend

Este guia mostra como conectar seu frontend (HTML/CSS/JS) com o backend Spring Boot.

---

## 📋 Pré-requisitos

- Backend Spring Boot rodando em `http://localhost:8080`
- Arquivos HTML/CSS/JS do frontend
- Conhecimento básico de JavaScript Fetch API

---

## 🚀 Passo 1: Copiar Arquivos Frontend para o Backend

O Spring Boot serve arquivos estáticos da pasta `src/main/resources/static/`.

### Windows
```powershell
# Copiar páginas HTML
Copy-Item -Path "..\src\pages\*" -Destination "src\main\resources\static\" -Recurse

# Copiar CSS
Copy-Item -Path "..\src\css\*" -Destination "src\main\resources\static\css\" -Recurse

# Copiar JavaScript
Copy-Item -Path "..\src\js\*" -Destination "src\main\resources\static\js\" -Recurse

# Copiar Assets (imagens e áudio)
Copy-Item -Path "..\src\assets\*" -Destination "src\main\resources\static\assets\" -Recurse
```

### Linux/Mac
```bash
# Copiar páginas HTML
cp -r ../src/pages/* src/main/resources/static/

# Copiar CSS
cp -r ../src/css/* src/main/resources/static/css/

# Copiar JavaScript
cp -r ../src/js/* src/main/resources/static/js/

# Copiar Assets
cp -r ../src/assets/* src/main/resources/static/assets/
```

**Estrutura esperada:**
```
src/main/resources/static/
├── index.html
├── login.html
├── cadastro.html
├── ... (outras páginas HTML)
├── css/
│   ├── style.css
│   └── ... (outros CSS)
├── js/
│   ├── main.js
│   ├── api-service.js        ← Arquivo que vamos criar
│   └── ... (outros JS)
└── assets/
    ├── img/
    └── audio/
```

---

## 🔧 Passo 2: Criar o Arquivo de Serviço API

Crie o arquivo `src/main/resources/static/js/api-service.js` com base no arquivo de exemplo fornecido:

```bash
# Copie o arquivo de exemplo
Copy-Item "API_SERVICE_EXEMPLO.js" -Destination "src\main\resources\static\js\api-service.js"
```

Ou crie manualmente com o conteúdo fornecido em `API_SERVICE_EXEMPLO.js`.

---

## 📝 Passo 3: Atualizar suas Páginas HTML

### 3.1 Adicionar referência ao arquivo de serviço API

Em cada HTML que precisar fazer requisições, adicione:

```html
<script src="/js/api-service.js"></script>
</head>
```

### 3.2 Exemplo: Página de Login

**Antes (sem backend):**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <form id="loginForm">
        <input type="email" id="email" placeholder="Email">
        <input type="password" id="senha" placeholder="Senha">
        <button type="submit">Entrar</button>
    </form>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            // TODO: Conectar com backend
        });
    </script>
</body>
</html>
```

**Depois (com backend):**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <link rel="stylesheet" href="/css/style.css">
    <script src="/js/api-service.js"></script>
</head>
<body>
    <form id="loginForm">
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="senha" placeholder="Senha" required>
        <button type="submit">Entrar</button>
        <div id="mensagem"></div>
    </form>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const email = document.getElementById('email').value;
                const senha = document.getElementById('senha').value;
                
                const usuario = await loginUsuario(email, senha);
                
                // Login bem-sucedido
                document.getElementById('mensagem').innerHTML = 'Bem-vindo, ' + usuario.nome + '!';
                
                // Redirecionar após 2 segundos
                setTimeout(() => {
                    window.location.href = '/selecao-perfil';
                }, 2000);
                
            } catch (erro) {
                document.getElementById('mensagem').innerHTML = 'Erro: ' + erro.message;
            }
        });
    </script>
</body>
</html>
```

---

## 💡 Exemplos de Integração

### Exemplo 1: Cadastro de Usuário

```html
<form id="cadastroForm">
    <input type="text" id="nome" placeholder="Nome completo" required>
    <input type="email" id="email" placeholder="Email" required>
    <input type="password" id="senha" placeholder="Senha" required>
    <select id="tipoPlano">
        <option value="gratis">Plano Gratuito</option>
        <option value="premium">Plano Premium</option>
        <option value="pro">Plano Pro</option>
    </select>
    <button type="submit">Cadastrar</button>
    <div id="resultado"></div>
</form>

<script src="/js/api-service.js"></script>
<script>
document.getElementById('cadastroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const usuario = await registrarUsuario(
            document.getElementById('email').value,
            document.getElementById('senha').value,
            document.getElementById('nome').value,
            document.getElementById('tipoPlano').value
        );
        
        document.getElementById('resultado').innerHTML = 'Cadastro realizado! ID: ' + usuario.id;
        this.reset();
        
    } catch (erro) {
        document.getElementById('resultado').innerHTML = 'Erro: ' + erro.message;
    }
});
</script>
```

### Exemplo 2: Listar Crianças

```html
<div id="criancas"></div>

<script src="/js/api-service.js"></script>
<script>
async function carregarCriancas() {
    try {
        const usuarioLogado = obterUsuarioLogado();
        
        if (!usuarioLogado) {
            window.location.href = '/login';
            return;
        }
        
        const criancas = await obterCriancasDoUsuario(usuarioLogado.id);
        
        let html = '<h2>Minhas Crianças</h2>';
        
        if (criancas.length === 0) {
            html += '<p>Nenhuma criança cadastrada</p>';
        } else {
            html += '<ul>';
            criancas.forEach(crianca => {
                html += `<li>${crianca.nome} (${crianca.idade} anos)</li>`;
            });
            html += '</ul>';
        }
        
        document.getElementById('criancas').innerHTML = html;
        
    } catch (erro) {
        console.error('Erro:', erro);
    }
}

// Carregar ao abrir a página
carregarCriancas();
</script>
```

### Exemplo 3: Registrar Sessão de Jogo

```javascript
// Ao final do jogo, registre os dados:

async function finalizarJogo() {
    const usuarioLogado = obterUsuarioLogado();
    const criancaSelecionada = JSON.parse(localStorage.getItem('criancaSelecionada'));
    
    try {
        const relatorio = await registrarJogo(
            criancaSelecionada.id,
            usuarioLogado.id,
            tempoTotal,           // em minutos
            totalAcertos,
            totalErros,
            pontuacaoFinal,
            'memoria'             // tipo do jogo
        );
        
        console.log('Jogo registrado:', relatorio);
        
    } catch (erro) {
        console.error('Erro ao registrar jogo:', erro);
    }
}
```

### Exemplo 4: Mostrar Planos

```html
<div id="planos"></div>

<script src="/js/api-service.js"></script>
<script>
async function exibirPlanos() {
    try {
        const planos = await obterTodosOsPlanos();
        
        let html = '<h2>Nossos Planos</h2>';
        html += '<div class="planos-container">';
        
        planos.forEach(plano => {
            html += `
                <div class="plano">
                    <h3>${plano.nome}</h3>
                    <p class="preco">R$ ${plano.preco.toFixed(2)}</p>
                    <p>${plano.descricao}</p>
                    <p>Crianças: ${plano.limiteCriancas || 'Ilimitado'}</p>
                    <button onclick="selecionarPlano('${plano.tipo}')">
                        Escolher Plano
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
        document.getElementById('planos').innerHTML = html;
        
    } catch (erro) {
        console.error('Erro:', erro);
    }
}

function selecionarPlano(tipo) {
    localStorage.setItem('planoSelecionado', tipo);
    window.location.href = '/pagamento';
}

exibirPlanos();
</script>
```

---

## 🔒 Proteção de Rotas

Proteja suas páginas verificando se o usuário está logado:

```html
<script src="/js/api-service.js"></script>
<script>
// Verificar se usuário está logado
window.addEventListener('load', function() {
    if (!temUsuarioLogado()) {
        // Redirecionar para login
        window.location.href = '/login';
    }
});
</script>
```

---

## 🔄 Fluxo Recomendado de Navegação

```
/index.html (Home)
    ↓
/login.html (Login ou Cadastro)
    ↓
/selecao-perfil.html (Selecionar criança)
    ↓
/menu-jogos.html (Escolher jogo)
    ↓
/jogo.html ou /jogo-memoria.html (Jogar)
    ↓
/relatorios.html (Ver resultados)
```

---

## 📊 Estrutura de Dados no localStorage

Use `localStorage` para armazenar dados do usuário:

```javascript
// Usuário logado (salvo automaticamente por loginUsuario())
localStorage.getItem('usuarioLogado');
// Retorna: {"id": 1, "email": "...", "nome": "...", "tipoPlano": "..."}

// Criança selecionada
localStorage.setItem('criancaSelecionada', JSON.stringify(crianca));

// Plano selecionado
localStorage.setItem('planoSelecionado', tipoPlano);
```

---

## ⚡ Boas Práticas

### 1. Sempre verificar autenticação
```javascript
const usuario = obterUsuarioLogado();
if (!usuario) {
    window.location.href = '/login';
}
```

### 2. Tratar erros
```javascript
try {
    const resultado = await registrarJogo(...);
    // sucesso
} catch (erro) {
    console.error('Erro:', erro);
    alert('Erro ao registrar jogo. Tente novamente.');
}
```

### 3. Mostrar feedback ao usuário
```javascript
// Mostrar loading
document.getElementById('loading').style.display = 'block';

try {
    await operacao();
} finally {
    // Esconder loading
    document.getElementById('loading').style.display = 'none';
}
```

### 4. Usar async/await
```javascript
// ✅ Recomendado
async function processar() {
    const resultado = await obterPlanos();
}

// ❌ Evitar (callback hell)
obterPlanos().then(resultado => {
    // ...
});
```

---

## 🧪 Testes Locais

### Teste 1: Verificar se Backend está rodando
```javascript
// Abra o DevTools (F12) e execute:
fetch('http://localhost:8080/api/planos')
    .then(r => r.json())
    .then(d => console.log(d));
```

### Teste 2: Testar Login
```javascript
loginUsuario('pai@example.com', 'senha123')
    .then(u => console.log('Login OK:', u))
    .catch(e => console.error('Erro:', e));
```

### Teste 3: Verificar localStorage
```javascript
console.log(localStorage.getItem('usuarioLogado'));
```

---

## 🚀 Deploy

Quando pronto para produção:

1. **Build do backend:**
   ```bash
   mvn package
   ```

2. **JAR gerado:** `target/backend-spring-1.0.0.jar`

3. **Executar em servidor:**
   ```bash
   java -jar backend-spring-1.0.0.jar
   ```

4. **Alterar URL da API:**
   - Localize a linha `const API_BASE_URL = ...` em `api-service.js`
   - Altere para sua URL de produção (ex: `https://seu-servidor.com`)

---

## 🆘 Troubleshooting

### "CORS error" no console
- Backend CORS não está configurado para sua origem
- Edite `TccDsBackendApplication.java` e adicione sua URL

### "Cannot GET /pagina"
- Arquivo HTML não está em `src/main/resources/static/`
- Verifique se copiou os arquivos corretamente

### API retorna 404
- Verifique a URL da requisição
- Verifique se o ID existe no banco
- Consulte `TESTE_API.md` para exemplos

### Dados não salvam no banco
- Verifique se MySQL está rodando
- Verifique credenciais em `application.properties`
- Verifique os logs do backend

---

## 📚 Referências

- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [localStorage MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [async/await MDN](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises)

---

**Bom desenvolvimento! 🚀**
