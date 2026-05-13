# Separação de frontend e backend (Zupi)

Este documento descreve a reorganização do repositório: o **backend** permanece como API Spring Boot (Java 21) e o **frontend** passou a ser um projeto independente na pasta `zupi-frontend/`.

## Visão geral

| Antes | Depois |
|--------|--------|
| HTML em `src/main/resources/templates/` (Thymeleaf) | HTML na raiz de `zupi-frontend/*.html` (páginas estáticas) |
| CSS/JS/img em `src/main/resources/static/` | Mesmos arquivos em `zupi-frontend/public/` |
| `PagesController` devolvia nomes de templates | Controller removido; rotas de página são do servidor do frontend |
| Scripts de API em IIFE com `API_BASE` duplicado | Módulos ES em `zupi-frontend/src/pages/` + `src/core/api.js` |

## Projeto backend (`pom.xml`, raiz do repositório)

Alterações feitas para **não servir mais UI**:

1. **Removido** `PagesController.java` — não há mais renderização de views no Spring.
2. **Removidas** dependências Maven:
   - `spring-boot-starter-thymeleaf`
   - `thymeleaf-extras-springsecurity6`
3. **Removidos** os diretórios:
   - `src/main/resources/templates/`
   - `src/main/resources/static/`
4. **`SecurityConfig.java`** simplificado: mantém CSRF desabilitado, H2 console e Swagger liberados e `anyRequest().permitAll()` (o mesmo comportamento efetivo que já existia no final da cadeia). Os `requestMatchers` antigos listavam rotas de páginas que deixaram de existir no backend.

Os **REST controllers** (`/auth`, `/child`, `/skillAreas`, `/{userId}/events`, etc.) **não foram alterados** na lógica de negócio. Eles já utilizam `@CrossOrigin("*")`, o que facilita o consumo a partir de outro origin (ex.: Vite em `http://localhost:5173`).

## Projeto frontend (`zupi-frontend/`)

### Ferramentas

- **Vite 6** — servidor de desenvolvimento, build multi-página (MPA) e proxy para a API.
- **JavaScript em módulos ES** (`import` / `export`) nas páginas que chamam a API.

### Estrutura recomendada

```
zupi-frontend/
├── package.json
├── vite.config.js          # entradas = todos os *.html na raiz; proxy → Spring
├── .env.example
├── public/                 # servido em / (css, js dos jogos, img, …)
│   ├── css/
│   │   ├── zupi-jogos.css  # tema compartilhado dos minijogos
│   │   ├── jogos/          # CSS extraído por página (antes inline no HTML)
│   │   │   └── *-page.css
│   │   └── …               # outras folhas (menuJogos.css, jogoLetra.css, …)
│   ├── js/
│   └── img/
├── src/
│   ├── core/
│   │   └── api.js          # getApiBase(), apiUrl(path)
│   └── pages/              # um arquivo por tela que usa API
│       ├── login.js
│       ├── cadastro.js
│       ├── dashboard.js
│       ├── configuracoes.js
│       ├── agenda.js
│       ├── relatorios.js
│       ├── selecao-perfil.js
│       └── perfil-criancas.js
└── *.html                  # 39 páginas copiadas dos templates
```

### CSS das páginas de jogo

As páginas `jogo*.html`, `JogoMath.html` e `menuJogos.html` usavam blocos `<style>` grandes no próprio HTML. Esse CSS foi movido para **`public/css/jogos/<nome-da-pagina>-page.css`**, e cada HTML referencia, em geral:

1. Fontes (Google Fonts), quando aplicável  
2. **`/css/zupi-jogos.css`** — layout comum (nav, botões, fundo)  
3. Folhas já existentes em `/css/*.css` quando aplicável (ex.: `menuJogos.css`, `jogoLetra.css`)  
4. **`/css/jogos/…-page.css`** — regras que antes estavam inline naquela página  

Para repetir a extração após adicionar novo `<style>` em uma página de jogo: **`npm run extract-game-css`** (script em `scripts/extract-inline-game-css.mjs`).

Páginas que **já** estavam só com CSS externo (`jogo-ligar-objetos.html`, `jogoLetra.html`, `jogoCatch.html`, `jogoBolao.html`) não foram alteradas. **Atributos `style="..."` pontuais** no HTML (por exemplo cores dinâmicas no HUD) permanecem; podem virar classes utilitárias numa refatoração seguinte, se desejar.

### Ajustes nos HTML

- Removido o atributo `th:inline="none"` dos `<script>` (não há mais processamento Thymeleaf).
- Ícone: caminho inexistente `../assets/img/favicon.png` substituído por **`/img/mascote-hero.png`** (arquivo que já existia em `public/img/`).
- Páginas que usavam os scripts removidos de `public/js/` agora carregam **`type="module"`** apontando para `src/pages/...`.

### Organização do JavaScript (API)

- **`src/core/api.js`**: centraliza a URL da API.
  - Se existir `window.__ZUPI_API_BASE__`, ela tem prioridade (útil para injeção em HTML ou hosting estático).
  - Senão, usa `import.meta.env.VITE_API_PUBLIC_URL` se definida no build.
  - Caso contrário, usa **paths relativos** (`/auth/...`), ideais com o **proxy do Vite** em desenvolvimento.

### Compatibilidade com HTML existente

- **`onclick="cadastrarCrianca()"`** (dashboard): exposto em `window.cadastrarCrianca` no módulo `dashboard.js`.
- **`onclick="storeChildId(...)"`** (seleção de perfil): `window.storeChildId` em `selecao-perfil.js`.
- **Relatórios**: `window.openDailyReportDetails` para botões gerados em template string.

### Correções pontuais na migração

- **Agenda**: `salveEvent` passou a usar `document.getElementById('eventForm')` em vez de variável fora do escopo (evita erro em tempo de execução).
- **Relatórios**: corrigido `return; ''` (sintaxe inválida) para `return;` no fluxo de validação de scores.

Os **scripts dos jogos** (`jogoMemoria.js`, `zupi-sky.js`, etc.) permanecem em `public/js/` como antes, sem refatoração para módulos (escopo grande; pode ser feito incrementalmente).

Foram adicionados **`public/js/script.js`** (animação `bounceZupi` da página `zupi.html`) e **`public/js/pagamento.js`** (submit demonstrativo em `pagamento.html`), pois os HTML referenciavam arquivos que ainda não existiam no repositório.

## Como rodar em desenvolvimento

1. **Backend** (porta padrão 8080):

   ```bash
   mvn spring-boot:run
   ```

2. **Frontend** (na pasta `zupi-frontend`):

   ```bash
   npm install
   npm run dev
   ```

   O Vite usa o proxy configurado em `vite.config.js` para encaminhar `/auth`, `/child`, `/skillAreas` e `/{id}/events` para `VITE_BACKEND_URL` (padrão `http://localhost:8080`). Copie `.env.example` para `.env` se precisar mudar a URL do Spring.

3. Acesse o site em **`http://localhost:5173`** (não use a porta 8080 para HTML após esta separação).

## Build de produção do frontend

```bash
cd zupi-frontend
npm run build
```

Saída em `zupi-frontend/dist/`. Sirva essa pasta com **nginx**, **Apache**, **S3+CloudFront**, etc. Configure `VITE_API_PUBLIC_URL` no `.env` de produção para a URL pública da API, **ou** sirva API e front no mesmo domínio com reverse proxy e deixe a base vazia para usar URLs relativas.

## Checklist de implantação

- [ ] Banco e perfil Spring (`application-*.properties`) como antes.
- [ ] CORS: controllers já têm `@CrossOrigin("*")`; em produção restrinja origins se necessário.
- [ ] Front: definir `VITE_API_PUBLIC_URL` ou proxy reverso no mesmo host.
- [ ] HTTPS e cookies: se no futuro usar sessão/cookie, ajustar `SameSite` e domínio.

## Resumo dos arquivos tocados no backend

| Arquivo / pasta | Ação |
|-----------------|------|
| `pom.xml` | Remoção Thymeleaf |
| `controllers/PagesController.java` | Removido |
| `config/SecurityConfig.java` | Simplificado |
| `src/main/resources/templates/` | Removido |
| `src/main/resources/static/` | Removido |

---

*Data da alteração: documento gerado junto com a separação dos projetos.*
