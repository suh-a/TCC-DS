# Arquitetura — Frontend (Vite) + Backend (Spring API)

## Estrutura do repositório

```
TCC-DS/
├── src/                    # Backend Spring Boot (somente API REST)
├── zupi-frontend/          # Frontend MPA (Vite)
│   ├── *.html              # Páginas (entrada do Vite)
│   ├── public/             # Assets estáticos (css, js, img, audio)
│   ├── vite.config.js
│   └── package.json
├── docs/                   # Documentação do projeto
├── pom.xml
└── mvnw
```

A fonte de verdade do UI é **`zupi-frontend/`**. O backend **não** serve HTML, CSS nem JS.

## Segurança (API)

- JWT stateless; header `Authorization: Bearer <token>`.
- CORS habilitado para `http://localhost:5173` (Vite).
- Rotas públicas: login, registro, reset de senha, login infantil, contato, Swagger, `GET /`.
- `GET /auth` apenas `ROLE_ADMIN`.
- Ownership via `AccessControlService` (`/auth/me`, `/child/me`, etc.).

## Como rodar em desenvolvimento

```bash
# Terminal 1 — API (porta 8080)
./mvnw spring-boot:run

# Terminal 2 — Frontend (porta 5173)
cd zupi-frontend
npm install
npm run dev
```

Variável em `zupi-frontend/.env`:

```
VITE_API_BASE=http://localhost:8080
```

O Vite injeta `window.ZUPI_API_BASE` nas páginas e faz proxy das rotas da API.

## Scripts do frontend

| Arquivo | Função |
|---------|--------|
| `public/js/api.js` | Cliente HTTP + sessão JWT (`ZupiAPI`) |
| `public/js/routes.js` | Rotas amigáveis (`ZupiRoutes`) |
| Demais `public/js/*` | Lógica por página |

## Build de produção

```bash
cd zupi-frontend
npm run build   # gera zupi-frontend/dist/
```

Servir `dist/` via Nginx/CDN; API em outro host ou reverse proxy.

## Frontend — scripts core

Carregados na maioria das páginas (via `scripts/inject-core-scripts.mjs`):

| Script | Função |
|--------|--------|
| `routes.js` | Constantes de rotas amigáveis |
| `api.js` | `ZupiAPI` — JWT, fetch, login |
| `auth-guard.js` | Redireciona visitantes não autenticados |
| `game-guard.js` | Exige criança ativa nos jogos |
| `main.js` | Logout, tooltips, sidebar |

## Próxima fase (C)

1. `@PreAuthorize` em endpoints sensíveis (backend).
2. Menus dinâmicos por `userType` no HTML.
3. Deploy unificado (API + `dist/` com fallback de rotas).

## Fora de escopo (por enquanto)

- Login Google
- Upload de foto de perfil
