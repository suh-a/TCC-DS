# 📁 Estrutura Completa do Backend - TCC-DS

```
c:\Users\Administrator\TCC-DS\
│
├── src/                                      ← Frontend original (não alterado)
│   ├── pages/      (HTML)
│   ├── css/        (Estilos)
│   ├── js/         (Scripts)
│   └── assets/     (Imagens e áudio)
│
└── backend-spring/                           ← ✨ NOVO BACKEND CRIADO
    │
    ├── pom.xml                              ← Dependências Maven
    │   └── Spring Boot 3.1.5
    │   └── Spring Data JPA
    │   └── MySQL Connector
    │   └── Lombok
    │
    ├── src/
    │   ├── main/
    │   │   ├── java/com/tccds/
    │   │   │   │
    │   │   │   ├── TccDsBackendApplication.java
    │   │   │   │   └── Classe principal com CORS configurado
    │   │   │   │
    │   │   │   ├── config/
    │   │   │   │   └── WebConfig.java
    │   │   │   │       └── Configuração para servir arquivos estáticos
    │   │   │   │
    │   │   │   ├── controller/                ⭐ ROTAS REST (19 endpoints)
    │   │   │   │   ├── UsuarioController.java
    │   │   │   │   │   ├── POST   /api/usuarios/registrar
    │   │   │   │   │   ├── POST   /api/usuarios/login
    │   │   │   │   │   ├── GET    /api/usuarios
    │   │   │   │   │   ├── GET    /api/usuarios/{id}
    │   │   │   │   │   ├── PUT    /api/usuarios/{id}
    │   │   │   │   │   └── DELETE /api/usuarios/{id}
    │   │   │   │   │
    │   │   │   │   ├── CriancaController.java
    │   │   │   │   │   ├── POST   /api/criancas
    │   │   │   │   │   ├── GET    /api/criancas/{id}
    │   │   │   │   │   ├── GET    /api/criancas/usuario/{id}
    │   │   │   │   │   ├── PUT    /api/criancas/{id}
    │   │   │   │   │   └── DELETE /api/criancas/{id}
    │   │   │   │   │
    │   │   │   │   ├── PlanoController.java
    │   │   │   │   │   ├── GET    /api/planos
    │   │   │   │   │   ├── GET    /api/planos/{id}
    │   │   │   │   │   ├── GET    /api/planos/tipo/{tipo}
    │   │   │   │   │   └── POST   /api/planos
    │   │   │   │   │
    │   │   │   │   ├── RelatorioController.java
    │   │   │   │   │   ├── POST   /api/relatorios
    │   │   │   │   │   ├── GET    /api/relatorios/{id}
    │   │   │   │   │   ├── GET    /api/relatorios/crianca/{id}
    │   │   │   │   │   └── GET    /api/relatorios/usuario/{id}
    │   │   │   │   │
    │   │   │   │   └── PaginasController.java
    │   │   │   │       └── 25+ rotas para navegar entre páginas HTML
    │   │   │   │
    │   │   │   ├── service/                   ⭐ LÓGICA DE NEGÓCIO
    │   │   │   │   ├── UsuarioService.java
    │   │   │   │   │   └── registrar, login, obter, atualizar, deletar
    │   │   │   │   │
    │   │   │   │   ├── CriancaService.java
    │   │   │   │   │   └── criar, obter, listar, atualizar, deletar
    │   │   │   │   │
    │   │   │   │   ├── PlanoService.java
    │   │   │   │   │   └── obterTodos, obterPorTipo, criar
    │   │   │   │   │
    │   │   │   │   └── RelatorioService.java
    │   │   │   │       └── registrarJogo, obterPorCrianca, obterPorUsuario
    │   │   │   │
    │   │   │   ├── repository/                ⭐ ACESSO AO BANCO
    │   │   │   │   ├── UsuarioRepository.java
    │   │   │   │   ├── CriancaRepository.java
    │   │   │   │   ├── PlanoRepository.java
    │   │   │   │   └── RelatorioRepository.java
    │   │   │   │
    │   │   │   ├── model/                     ⭐ ENTIDADES (Models)
    │   │   │   │   ├── Usuario.java
    │   │   │   │   ├── Crianca.java
    │   │   │   │   ├── Plano.java
    │   │   │   │   └── Relatorio.java
    │   │   │   │
    │   │   │   └── dto/                       ⭐ DATA TRANSFER OBJECTS
    │   │   │       ├── UsuarioDTO.java
    │   │   │       ├── CriancaDTO.java
    │   │   │       ├── PlanoDTO.java
    │   │   │       └── RelatorioDTO.java
    │   │   │
    │   │   └── resources/
    │   │       ├── application.properties     ← MySQL Configuration
    │   │       │   └── URL, usuário, senha, porta
    │   │       │
    │   │       └── database.sql              ← Script SQL
    │   │           └── Cria tabelas + índices + planos iniciais
    │   │
    │   └── test/
    │       └── (testes a implementar)
    │
    ├── .gitignore
    │   └── Ignora target/, .idea/, *.log, etc
    │
    ├── 📚 DOCUMENTAÇÃO
    │   ├── README.md                         ← Guia completo
    │   ├── QUICK_START.md                    ← Comece em 5 minutos
    │   ├── RESUMO.md                         ← Visão geral do projeto
    │   ├── TESTE_API.md                      ← Exemplos de requisições
    │   ├── ARQUITETURA.md                    ← Diagramas do sistema
    │   ├── INTEGRACAO_FRONTEND.md            ← Como conectar HTML/JS
    │   ├── CHECKLIST.md                      ← Fases de desenvolvimento
    │   └── ESTRUTURA.md                      ← Este arquivo
    │
    └── 🔗 INTEGRAÇÃO FRONTEND
        └── API_SERVICE_EXEMPLO.js            ← Funções JS para API
            └── Copie este arquivo para src/js/api-service.js
```

---

## 📊 Tabelas do Banco de Dados

### 1. `usuarios`
```sql
┌────────────────────────────────┐
│         USUARIOS               │
├────────────────────────────────┤
│ id (PK)                        │
│ email (UNIQUE, INDEX)          │
│ senha                          │
│ nome                           │
│ tipo_plano (gratis/premium/pro)│
│ data_cadastro                  │
│ data_atualizacao               │
└────────────────────────────────┘
```

### 2. `criancas`
```sql
┌────────────────────────────────┐
│        CRIANCAS                │
├────────────────────────────────┤
│ id (PK)                        │
│ usuario_id (FK, INDEX)         │
│ nome                           │
│ idade                          │
│ foto_url                       │
│ data_nascimento                │
│ data_criacao                   │
└────────────────────────────────┘
```

### 3. `planos`
```sql
┌────────────────────────────────┐
│         PLANOS                 │
├────────────────────────────────┤
│ id (PK)                        │
│ nome                           │
│ preco                          │
│ descricao                      │
│ tipo (UNIQUE, INDEX)           │
│ limite_criancas                │
│ data_criacao                   │
└────────────────────────────────┘

Dados Iniciais:
1. Plano Gratuito - R$ 0,00 (1 criança)
2. Plano Premium - R$ 29,90 (3 crianças)
3. Plano Pro - R$ 49,90 (ilimitado)
```

### 4. `relatorios`
```sql
┌────────────────────────────────┐
│      RELATORIOS                │
├────────────────────────────────┤
│ id (PK)                        │
│ crianca_id (FK, INDEX)         │
│ usuario_id (FK, INDEX)         │
│ tempo_jogado (minutos)         │
│ acertos                        │
│ erros                          │
│ pontuacao                      │
│ tipo_jogo                      │
│ data_jogo                      │
└────────────────────────────────┘
```

---

## 🔌 Rotas e Endpoints

### Autenticação
```
POST   /api/usuarios/registrar     → Registrar novo usuário
POST   /api/usuarios/login         → Fazer login
```

### Usuários
```
GET    /api/usuarios               → Listar todos
GET    /api/usuarios/{id}          → Obter um
PUT    /api/usuarios/{id}          → Atualizar
DELETE /api/usuarios/{id}          → Deletar
```

### Crianças
```
POST   /api/criancas               → Criar
GET    /api/criancas/{id}          → Obter um
GET    /api/criancas/usuario/{id}  → Listar do usuário
PUT    /api/criancas/{id}          → Atualizar
DELETE /api/criancas/{id}          → Deletar
```

### Planos
```
GET    /api/planos                 → Listar todos
GET    /api/planos/{id}            → Obter um
GET    /api/planos/tipo/{tipo}     → Obter por tipo
POST   /api/planos                 → Criar novo
```

### Relatórios
```
POST   /api/relatorios             → Registrar jogo
GET    /api/relatorios/{id}        → Obter um
GET    /api/relatorios/crianca/{id}→ Listar da criança
GET    /api/relatorios/usuario/{id}→ Listar do usuário
```

### Navegação (25+ rotas)
```
GET /               GET /login         GET /cadastro
GET /dashboard      GET /menu-jogos    GET /jogo
GET /relatorios     GET /perfil-criancas    GET /planos
... (e mais 17 rotas)
```

---

## 🛠️ Tecnologias

```
┌─────────────────────────┐
│   FRONTEND              │
│ HTML / CSS / JavaScript │
│ Fetch API              │
└─────────────────────────┘
           │
           │ HTTP REST
           │
┌─────────────────────────┐
│   BACKEND               │
│ Java 17                 │
│ Spring Boot 3.1.5       │
│ Spring Data JPA         │
│ Lombok                  │
│ MySQL Connector         │
└─────────────────────────┘
           │
           │ JDBC
           │
┌─────────────────────────┐
│   DATABASE              │
│ MySQL 8.0+              │
│ 4 Tabelas               │
│ Índices                 │
│ Constraints             │
└─────────────────────────┘
```

---

## 📈 Fluxo de Dados

```
Browser                 Backend                MySQL
├─ HTML/CSS/JS       ├─ Controller         ├─ Database
│                     ├─ Service            ├─ Tables
│                     ├─ Repository         ├─ Indexes
│                     └─ Model
│
└──── REST API ────→ ← JSON Response ────
      (HTTP)         (CORS Habilitado)
```

---

## 🚀 Como Executar

### 1. Preparar Banco
```bash
mysql -u root -p < src/main/resources/database.sql
```

### 2. Compilar
```bash
mvn clean install
```

### 3. Executar
```bash
mvn spring-boot:run
```

### 4. Testar
```bash
curl http://localhost:8080/api/planos
```

---

## 📚 Arquivos de Documentação

| Arquivo | Descrição | Tempo de Leitura |
|---------|-----------|------------------|
| `QUICK_START.md` | Comece em 5 minutos | 5 min |
| `README.md` | Documentação completa | 15 min |
| `TESTE_API.md` | Exemplos de requisições | 10 min |
| `INTEGRACAO_FRONTEND.md` | Conectar seu HTML/JS | 15 min |
| `ARQUITETURA.md` | Diagramas do sistema | 20 min |
| `CHECKLIST.md` | Fases de desenvolvimento | 10 min |
| `RESUMO.md` | Visão geral do projeto | 5 min |

---

## ✅ Checklist de Implementação

- [x] Estrutura Maven
- [x] Dependências (Spring Boot, MySQL, etc)
- [x] Configuração MySQL
- [x] Script SQL
- [x] 4 Models (Entidades)
- [x] 4 Repositories
- [x] 4 Services
- [x] 5 Controllers
- [x] 4 DTOs
- [x] CORS configurado
- [x] Documentação completa
- [ ] Testes unitários
- [ ] Autenticação JWT
- [ ] Deploy em produção

---

## 🎯 Status Atual

```
✅ Backend estruturado e funcional
✅ 19 endpoints REST implementados
✅ Banco de dados MySQL integrado
✅ CORS habilitado para frontend
✅ Documentação completa
⏳ Aguardando integração com frontend
⏳ Testes e melhorias de produção
```

---

## 💡 Próximos Passos

1. **Copiar Frontend**
   ```bash
   cp -r ../src/pages/* src/main/resources/static/
   cp -r ../src/css/* src/main/resources/static/css/
   cp -r ../src/js/* src/main/resources/static/js/
   cp -r ../src/assets/* src/main/resources/static/assets/
   ```

2. **Criar API Service**
   - Copie `API_SERVICE_EXEMPLO.js` para `src/main/resources/static/js/api-service.js`

3. **Atualizar HTML**
   - Adicione `<script src="/js/api-service.js"></script>`
   - Use funções JavaScript para chamar API

4. **Testar Fluxo Completo**
   - Login/Cadastro
   - Criar criança
   - Jogar e registrar resultado
   - Ver relatório

---

**Desenvolvido com ❤️ para TCC-DS**

📅 Data: 8 de dezembro de 2024  
📦 Versão: 1.0.0  
✨ Status: Pronto para Integração

---
