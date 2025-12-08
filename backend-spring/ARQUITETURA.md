# 🏗️ Arquitetura do Sistema TCC-DS

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR (Browser)                      │
│                   HTML / CSS / JavaScript                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │  HTTP Requisições   │
                    │  (Fetch API)        │
                    └──────────┬──────────┘
                               │
                               │ CORS Habilitado
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                   SPRING BOOT BACKEND                            │
│                   (Port 8080)                                    │
├──────────────────────────────────────────────────────────────────┤
│  Controllers                                                     │
│  ├─ UsuarioController    → /api/usuarios/**                    │
│  ├─ CriancaController    → /api/criancas/**                    │
│  ├─ PlanoController      → /api/planos/**                      │
│  ├─ RelatorioController  → /api/relatorios/**                  │
│  └─ PaginasController    → / (navegação)                       │
├──────────────────────────────────────────────────────────────────┤
│  Services (Lógica de Negócio)                                   │
│  ├─ UsuarioService                                             │
│  ├─ CriancaService                                             │
│  ├─ PlanoService                                               │
│  └─ RelatorioService                                           │
├──────────────────────────────────────────────────────────────────┤
│  Repositories (Data Access)                                      │
│  ├─ UsuarioRepository                                          │
│  ├─ CriancaRepository                                          │
│  ├─ PlanoRepository                                            │
│  └─ RelatorioRepository                                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │  JDBC Driver        │
                    │  (mysql-connector)  │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                       MySQL DATABASE                             │
│                   (tcc_ds_db)                                   │
├──────────────────────────────────────────────────────────────────┤
│  Tables                                                          │
│  ├─ usuarios       (email, senha, nome, tipo_plano)            │
│  ├─ criancas       (usuario_id, nome, idade, ...)              │
│  ├─ planos         (nome, preco, tipo, limite_criancas)        │
│  └─ relatorios     (crianca_id, usuario_id, pontuacao, ...)    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Requisição

### 1. Login do Usuário

```
Browser                    Backend                 MySQL
  │                          │                        │
  ├─ POST /api/usuarios/login ──→                     │
  │  {email, senha}           │                        │
  │                           ├─ UsuarioController   │
  │                           │   └─ UsuarioService   │
  │                           │       ├─ findByEmail──→
  │                           │       │                ├─ Query
  │                           │       │    ←─────────┤
  │                           │       └─ Validar senha│
  │                           │                        │
  ←─ UsuarioDTO ────────────┤                        │
  │  {id, nome, email, tipo}                          │
  │
  └─ Salvar em localStorage
```

### 2. Criar Criança

```
Browser                    Backend                 MySQL
  │                          │                        │
  ├─ POST /api/criancas ─────→                       │
  │  {usuarioId, nome,        │                       │
  │   idade, data}            │                       │
  │                           ├─ CriancaController   │
  │                           │   └─ CriancaService   │
  │                           │       ├─ findById ────→
  │                           │       │                ├─ Valida
  │                           │       │    ←────────┤
  │                           │       └─ save ───────→
  │                           │                       ├─ INSERT
  │                           │    ←─────────────────┤
  │                           │                       │
  ←─ CriancaDTO ─────────────┤                       │
  │  {id, nome, idade}                                │
```

### 3. Registrar Sessão de Jogo

```
Browser                    Backend                 MySQL
  │                          │                        │
  ├─ POST /api/relatorios ──→                        │
  │  {criancaId, usuarioId,   │                       │
  │   tempo, acertos, erros}  │                       │
  │                           ├─ RelatorioController│
  │                           │   └─ RelatorioService │
  │                           │       └─ save ───────→
  │                           │                       ├─ INSERT
  │                           │    ←────────────────┤
  │                           │                       │
  ←─ RelatorioDTO ───────────┤                       │
  │  {id, pontuacao, data}                            │
```

---

## Padrão Arquitetural: Camadas (Layered Architecture)

```
┌─────────────────────────────────────────┐
│         CAMADA DE APRESENTAÇÃO          │
│         (Presentation Layer)            │
│  Controllers (REST API)                 │
│  @RestController, @RequestMapping       │
├─────────────────────────────────────────┤
│         CAMADA DE LÓGICA                │
│         (Business Logic Layer)          │
│  Services                               │
│  Validações, regras de negócio          │
├─────────────────────────────────────────┤
│         CAMADA DE DADOS                 │
│         (Data Access Layer)             │
│  Repositories (JPA)                     │
│  Entidades (Models)                     │
│  DTOs (Data Transfer Objects)           │
├─────────────────────────────────────────┤
│         CAMADA DE PERSISTÊNCIA          │
│         (Persistence Layer)             │
│  MySQL Database                         │
│  Tables, Indexes, Constraints           │
└─────────────────────────────────────────┘
```

---

## Diagrama de Entidades (ER)

```
                    USUARIOS
                   ┌────────┐
                   │   id   │ (PK)
                   │ email  │ (UNIQUE)
                   │ senha  │
                   │ nome   │
                   │tipo_pl │
                   └────────┘
                        │
                        │ 1:N
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
   CRIANCAS                        RELATORIOS
   ┌────────┐                    ┌────────┐
   │   id   │ (PK)                │   id   │ (PK)
   │usuario_│ (FK)                │criança_│ (FK)
   │ nome   │                     │usuario_│ (FK)
   │ idade  │                     │ tempo  │
   │ foto   │                     │acertos │
   └────────┘                     │ erros  │
        │                         │ pontos │
        │ 1:N                     └────────┘
        │
        └─────────────────→ RELATORIOS (referência)


        PLANOS
        ┌────────┐
        │   id   │ (PK)
        │ nome   │
        │ preco  │
        │ tipo   │ (UNIQUE)
        │ limite │
        └────────┘

Relação: Usuario → Plano = 1:1 (tipo_plano é referência)
         Usuario → Crianca = 1:N
         Crianca → Relatorio = 1:N
         Usuario → Relatorio = 1:N
```

---

## Classe do Banco de Dados

```sql
-- Relacionamentos
ALTER TABLE criancas ADD CONSTRAINT fk_usuario_crianca
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

ALTER TABLE relatorios ADD CONSTRAINT fk_crianca_relatorio
  FOREIGN KEY (crianca_id) REFERENCES criancas(id) ON DELETE CASCADE;

ALTER TABLE relatorios ADD CONSTRAINT fk_usuario_relatorio
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

-- Índices para Performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_criancas_usuario_id ON criancas(usuario_id);
CREATE INDEX idx_relatorios_crianca_id ON relatorios(crianca_id);
CREATE INDEX idx_relatorios_usuario_id ON relatorios(usuario_id);
CREATE INDEX idx_planos_tipo ON planos(tipo);
```

---

## Fluxo de Dados - Exemplo: Criar Criança

```
1. REQUISIÇÃO HTTP
   POST /api/criancas
   {
     "usuarioId": 1,
     "nome": "Maria",
     "idade": 6,
     "dataNascimento": "2018-05-15"
   }

2. CONTROLLER (CriancaController)
   @PostMapping
   public ResponseEntity<CriancaDTO> criar(@RequestBody Map<String, Object> request)
   {
     // Extrai dados do request
     criancaService.criar(usuarioId, nome, idade, dataNascimento)
   }

3. SERVICE (CriancaService)
   public CriancaDTO criar(Long usuarioId, String nome, Integer idade, String dataNascimento)
   {
     // Valida se usuário existe
     Usuario usuario = usuarioRepository.findById(usuarioId)
     
     // Cria objeto Crianca
     Crianca crianca = new Crianca()
     crianca.setUsuario(usuario)
     crianca.setNome(nome)
     crianca.setIdade(idade)
     crianca.setDataNascimento(dataNascimento)
     
     // Salva no banco
     criancaRepository.save(crianca)
     
     // Converte para DTO
     return convertToDTO(crianca)
   }

4. REPOSITORY (CriancaRepository)
   extends JpaRepository
   {
     // Usa Hibernate para converter Java em SQL
     INSERT INTO criancas (usuario_id, nome, idade, data_nascimento, data_criacao)
     VALUES (1, 'Maria', 6, '2018-05-15', NOW())
   }

5. DATABASE
   criancas: {
     id: 1 (gerado automaticamente)
     usuario_id: 1
     nome: 'Maria'
     idade: 6
     data_nascimento: '2018-05-15'
     data_criacao: '2024-01-15 10:30:00'
   }

6. RESPOSTA HTTP
   201 CREATED
   {
     "id": 1,
     "nome": "Maria",
     "idade": 6,
     "fotoUrl": null,
     "dataNascimento": "2018-05-15"
   }

7. BROWSER (JavaScript)
   const crianca = await response.json()
   console.log('Criança criada:', crianca)
```

---

## Ciclo de Vida de uma Requisição

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVEGADOR                                │
│  document.getElementById('btn').addEventListener('click'    │
│    → fetch('/api/usuarios/login', {...})                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ POST JSON
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               REDE HTTP (CORS Check)                         │
│  Browser verifica se servidor permite a origem              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Requisição + Headers
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            SPRING BOOT - SERVLET                            │
│  - DispatcherServlet recebe a requisição                   │
│  - Identifica o Controller correto                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Roteia para o método
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               USUARIO CONTROLLER                             │
│  @PostMapping("/login")                                     │
│  public ResponseEntity<UsuarioDTO> login(...)              │
│    → usuarioService.login(email, senha)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Delega para Service
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               USUARIO SERVICE                                │
│  - Valida entrada                                           │
│  - usuarioRepository.findByEmail(email)                     │
│  - Verifica senha                                           │
│  - Retorna UsuarioDTO                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Chamada Repository
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          JPA REPOSITORY + HIBERNATE                          │
│  - Cria query SQL                                           │
│  - Executa no banco                                         │
│  - Mapeia resultado para Entity                             │
│  SELECT * FROM usuarios WHERE email = ?                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ SQL Query
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  MYSQL DATABASE                              │
│  - Busca usuário                                            │
│  - Retorna dados                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Resultado SQL
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          RESPOSTA: UsuarioDTO (JSON)                         │
│  {                                                           │
│    "id": 1,                                                 │
│    "email": "usuario@example.com",                          │
│    "nome": "João Silva",                                    │
│    "tipoPlano": "gratis"                                    │
│  }                                                           │
│  Status: 200 OK                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ JSON Response
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              NAVEGADOR - JAVASCRIPT                          │
│  .then(response => response.json())                          │
│  .then(usuario => {                                          │
│    localStorage.setItem('usuarioLogado', JSON.stringify)    │
│    window.location.href = '/selecao-perfil'               │
│  })                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Tecnologias por Camada

```
┌────────────────────────────────────────────┐
│  Frontend (Browser)                        │
│  ├─ HTML (Estrutura)                      │
│  ├─ CSS (Estilos)                         │
│  └─ JavaScript (Fetch API, async/await)   │
├────────────────────────────────────────────┤
│  HTTP (REST API)                           │
│  └─ JSON (Formato de dados)               │
├────────────────────────────────────────────┤
│  Backend (Spring Boot)                     │
│  ├─ Java 17 (Linguagem)                   │
│  ├─ Spring Boot 3.1.5 (Framework)         │
│  ├─ Spring Web (REST Controllers)         │
│  └─ Spring Data JPA (ORM)                 │
├────────────────────────────────────────────┤
│  ORM (Object-Relational Mapping)           │
│  ├─ Hibernate (Implementação JPA)         │
│  └─ Annotations (@Entity, @Column)        │
├────────────────────────────────────────────┤
│  JDBC Driver                               │
│  └─ MySQL Connector/J                     │
├────────────────────────────────────────────┤
│  Database (Persistência)                   │
│  └─ MySQL 8.0+ (Banco Relacional)         │
└────────────────────────────────────────────┘
```

---

## Pipeline de Deploy

```
Desenvolvimento
     ↓
Source Code (GitHub)
     ↓
mvn clean install (Maven)
     ↓
Testes (JUnit)
     ↓
mvn package
     ↓
backend-spring-1.0.0.jar
     ↓
java -jar backend-spring-1.0.0.jar
     ↓
Servidor (http://seu-servidor.com:8080)
     ↓
Cliente (Navegador)
```

---

**Documentação completa da arquitetura do sistema TCC-DS** 🏗️
