# Zupi — Frontend (Vite)

Aplicação web MPA servida pelo Vite. Comunica com a API Spring em `VITE_API_BASE`.

## Comandos

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # saída em dist/
npm run preview  # preview do build
```

## Estrutura

| Pasta / arquivo | Conteúdo |
|-----------------|----------|
| `*.html` (raiz) | Páginas HTML |
| `public/css/` | Estilos |
| `public/js/` | Scripts (`api.js`, `routes.js`, por página) |
| `public/img/`, `public/audio/` | Mídia |
| `vite.config.js` | Rotas amigáveis + proxy da API |

## Variáveis

Copie `.env.example` para `.env` e ajuste se necessário:

```
VITE_API_BASE=http://localhost:8080
```

Documentação completa: [docs/arquitetura.md](../docs/arquitetura.md)

## Checklist pós-login (responsável)

1. **Login** → redireciona para `/selecao-perfil`
2. **Card responsável** → `/dashboard` (lista filhos)
3. **Card criança** → `/dashboard-crianca?childId=…`
4. **+ Adicionar** → `/cadastro-dependentes`
5. **Sidebar**: Relatórios → `/selecao-relatorios` → `/relatorios?childId=…`
6. **Agenda**, **Configurações**, **Contato** (formulário via API)
7. **Jogos** (com criança ativa): `/menuJogos` → qualquer jogo

Scripts core injetados em todas as páginas: `npm run build` ou `node scripts/inject-core-scripts.mjs`.
