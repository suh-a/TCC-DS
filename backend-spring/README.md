# TCC-DS Backend - Spring Boot

Backend em Java com Spring Boot para o projeto TCC-DS, incluindo integração com MySQL e navegação por rotas REST.

## 📋 Pré-requisitos

- **Java 17+** instalado
- **Maven 3.6+** instalado
- **MySQL 8.0+** instalado e rodando
- IDE recomendada: IntelliJ IDEA ou VS Code com extensão para Java

## 🚀 Setup Inicial

### 1. Clonar/Navegar para o projeto

```bash
cd backend-spring
```

### 2. Criar o banco de dados MySQL

```bash
# Abra o MySQL CLI ou MySQL Workbench e execute o arquivo database.sql
mysql -u root -p < src/main/resources/database.sql
```

Ou manualmente:
- Abra o MySQL e execute os comandos contidos em `src/main/resources/database.sql`

### 3. Configurar credenciais do MySQL (opcional)

Se suas credenciais do MySQL são diferentes, edite o arquivo `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/tcc_ds_db
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
```

### 4. Compilar o projeto

```bash
mvn clean install
```

### 5. Executar a aplicação

```bash
mvn spring-boot:run
```

Ou via IDE:
- Navegue até `TccDsBackendApplication.java`
- Clique em "Run" (ou pressione Shift+F10 no IntelliJ)

A aplicação estará disponível em: **http://localhost:8080**

## 📁 Estrutura do Projeto

```
backend-spring/
├── pom.xml                          # Dependências do Maven
├── src/main/
│   ├── java/com/tccds/
│   │   ├── TccDsBackendApplication.java    # Classe principal
│   │   ├── config/
│   │   │   └── WebConfig.java              # Configuração Web
│   │   ├── controller/
│   │   │   ├── PaginasController.java      # Navegação entre páginas
│   │   │   ├── UsuarioController.java      # Rotas de usuários
│   │   │   ├── CriancaController.java      # Rotas de crianças
│   │   │   ├── PlanoController.java        # Rotas de planos
│   │   │   └── RelatorioController.java    # Rotas de relatórios
│   │   ├── model/
│   │   │   ├── Usuario.java                # Entidade Usuario
│   │   │   ├── Crianca.java                # Entidade Crianca
│   │   │   ├── Plano.java                  # Entidade Plano
│   │   │   └── Relatorio.java              # Entidade Relatorio
│   │   ├── repository/
│   │   │   ├── UsuarioRepository.java      # Acesso a dados Usuario
│   │   │   ├── CriancaRepository.java      # Acesso a dados Crianca
│   │   │   ├── PlanoRepository.java        # Acesso a dados Plano
│   │   │   └── RelatorioRepository.java    # Acesso a dados Relatorio
│   │   ├── service/
│   │   │   ├── UsuarioService.java         # Lógica Usuario
│   │   │   ├── CriancaService.java         # Lógica Crianca
│   │   │   ├── PlanoService.java           # Lógica Plano
│   │   │   └── RelatorioService.java       # Lógica Relatorio
│   │   └── dto/
│   │       ├── UsuarioDTO.java             # DTO Usuario
│   │       ├── CriancaDTO.java             # DTO Crianca
│   │       ├── PlanoDTO.java               # DTO Plano
│   │       └── RelatorioDTO.java           # DTO Relatorio
│   └── resources/
│       ├── application.properties          # Configurações da aplicação
│       └── database.sql                    # Script de inicialização do BD
```

## 🔌 API REST - Rotas Disponíveis

### Autenticação e Usuários

#### Registrar novo usuário
```http
POST /api/usuarios/registrar
Content-Type: application/json

{
  "email": "pai@example.com",
  "senha": "senha123",
  "nome": "João Silva",
  "tipoPlano": "gratis"
}
```

#### Login
```http
POST /api/usuarios/login
Content-Type: application/json

{
  "email": "pai@example.com",
  "senha": "senha123"
}
```

#### Obter usuário por ID
```http
GET /api/usuarios/{id}
```

#### Listar todos os usuários
```http
GET /api/usuarios
```

#### Atualizar usuário
```http
PUT /api/usuarios/{id}
Content-Type: application/json

{
  "nome": "João Silva Atualizado",
  "tipoPlano": "premium"
}
```

#### Deletar usuário
```http
DELETE /api/usuarios/{id}
```

### Crianças

#### Criar criança
```http
POST /api/criancas
Content-Type: application/json

{
  "usuarioId": 1,
  "nome": "Maria",
  "idade": 6,
  "dataNascimento": "2018-05-15"
}
```

#### Obter criança por ID
```http
GET /api/criancas/{id}
```

#### Listar crianças de um usuário
```http
GET /api/criancas/usuario/{usuarioId}
```

#### Atualizar criança
```http
PUT /api/criancas/{id}
Content-Type: application/json

{
  "nome": "Maria Silva",
  "idade": 7
}
```

#### Deletar criança
```http
DELETE /api/criancas/{id}
```

### Planos

#### Listar todos os planos
```http
GET /api/planos
```

#### Obter plano por ID
```http
GET /api/planos/{id}
```

#### Obter plano por tipo
```http
GET /api/planos/tipo/{tipo}
```

Tipos: `gratis`, `premium`, `pro`

#### Criar novo plano
```http
POST /api/planos
Content-Type: application/json

{
  "nome": "Plano Novo",
  "preco": 39.90,
  "descricao": "Descrição do plano",
  "tipo": "novo",
  "limiteCriancas": 5
}
```

### Relatórios

#### Registrar sessão de jogo
```http
POST /api/relatorios
Content-Type: application/json

{
  "criancaId": 1,
  "usuarioId": 1,
  "tempoJogado": 15,
  "acertos": 8,
  "erros": 2,
  "pontuacao": 80,
  "tipoJogo": "memoria"
}
```

#### Obter relatório por ID
```http
GET /api/relatorios/{id}
```

#### Obter relatórios de uma criança
```http
GET /api/relatorios/crianca/{criancaId}
```

#### Obter relatórios de um usuário
```http
GET /api/relatorios/usuario/{usuarioId}
```

### Navegação de Páginas

As rotas abaixo servem para navegação entre as páginas HTML:

```
GET / ou /index          → /index.html
GET /login               → /login.html
GET /cadastro            → /cadastro.html
GET /selecao-perfil      → /selecao-perfil.html
GET /dashboard           → /dashboard-pais.html
GET /menu-jogos          → /menu-jogos.html
GET /jogo                → /jogo.html
GET /jogo-memoria        → /jogo-memoria.html
GET /relatorios          → /relatorios.html
GET /perfil-criancas     → /perfil-criancas.html
GET /configuracoes       → /configuracoes.html
GET /planos              → /planos.html
GET /plano-gratis        → /plano-gratis.html
GET /plano-premium       → /plano-premium.html
GET /plano-pro           → /plano-pro.html
GET /pagamento           → /pagamento.html
GET /videos              → /videos.html
GET /recompensas         → /recompensas.html
GET /agenda              → /agenda.html
GET /sobre               → /sobre.html
GET /contato             → /contato.html
GET /erro                → /erro.html
GET /zupi                → /zupi.html
```

## 🔐 CORS Configuration

A aplicação está configurada para aceitar requisições CORS de:
- `http://localhost:3000`
- `http://localhost:8080`
- `file://` (para teste local)

Para modificar, edite `TccDsBackendApplication.java` na classe `corsConfigurer()`.

## 📦 Dependências Principais

- **Spring Boot 3.1.5**
- **Spring Data JPA** - ORM e acesso a dados
- **MySQL Connector** - Driver JDBC para MySQL
- **Lombok** - Reduz boilerplate (getters, setters, etc)
- **Spring Validation** - Validação de dados

## 🛠️ Desenvolvimento

### Adicionar novas dependências

Edite `pom.xml` e adicione a dependência, depois execute:
```bash
mvn clean install
```

### Hot Reload (DevTools)

A dependência `spring-boot-devtools` permite recarregar a aplicação automaticamente ao salvar arquivos. Para usar:

1. Ative o "Build project automatically" em sua IDE
2. Pressione `Ctrl+Shift+F9` (IntelliJ) para disparar um hot reload

## 🐛 Troubleshooting

### Erro: "Connection refused" no MySQL
- Verifique se MySQL está rodando: `mysql -u root -p`
- Altere as credenciais em `application.properties`

### Erro: "Dependência não encontrada"
- Execute: `mvn clean install`
- Limpe o cache Maven se necessário: `mvn clean`

### Porta 8080 já em uso
- Altere em `application.properties`: `server.port=8081`

### Driver MySQL não encontrado
- Verifique se MySQL Connector está em `pom.xml`
- Execute: `mvn dependency:resolve`

## 📝 Notas Importantes

1. **Segurança**: Em produção, implemente:
   - Hashing de senhas com BCrypt
   - Autenticação com JWT
   - Validação mais rigorosa de dados

2. **Banco de Dados**: O arquivo `database.sql` cria automaticamente:
   - Banco de dados `tcc_ds_db`
   - 4 tabelas principais
   - Índices para otimização
   - Planos iniciais pré-configurados

3. **Arquivos Estáticos**: Coloque os arquivos HTML, CSS, JS em:
   ```
   src/main/resources/static/
   ```

## 📚 Recursos Adicionais

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## ✨ Próximos Passos

1. Copiar arquivos HTML, CSS, JS para `src/main/resources/static/`
2. Implementar autenticação com JWT
3. Adicionar validação com Bean Validation
4. Criar testes unitários com JUnit 5
5. Implementar tratamento de erros global com `@ExceptionHandler`

---

**Desenvolvido para TCC-DS** 🎓
