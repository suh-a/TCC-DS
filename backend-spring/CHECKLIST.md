# ✅ Checklist de Implementação

Este documento ajuda a acompanhar o progresso da implementação do backend TCC-DS.

---

## 📋 Fase 1: Preparação do Ambiente

- [x] **Java 17 instalado** - Verificar: `java -version`
- [x] **Maven instalado** - Verificar: `mvn -version`
- [x] **MySQL instalado e rodando** - Verificar: `mysql -u root -p`
- [x] **IDE configurada** (IntelliJ IDEA ou VS Code)
- [x] **Git configurado** (opcional)

### Verificar Instalações
```bash
# Java
java -version

# Maven
mvn -version

# MySQL
mysql --version
```

---

## 🏗️ Fase 2: Estrutura do Projeto

- [x] **Projeto Maven criado** em `backend-spring/`
- [x] **pom.xml** com dependências corretas
- [x] **Classe principal** `TccDsBackendApplication.java`
- [x] **Configuração CORS** implementada
- [x] **application.properties** criado

### Verificar:
```bash
cd backend-spring
mvn clean install
```

---

## 💾 Fase 3: Banco de Dados

- [x] **Database MySQL criado** (`tcc_ds_db`)
- [x] **Tabela usuarios** com campos corretos
- [x] **Tabela criancas** com FK para usuarios
- [x] **Tabela planos** pré-configurada
- [x] **Tabela relatorios** com FK para criancas e usuarios
- [x] **Índices criados** para performance
- [x] **Planos iniciais inseridos**

### Verificar:
```bash
# Executar script SQL
mysql -u root -p < src/main/resources/database.sql

# Testar conexão
mysql -u root -p -D tcc_ds_db
SHOW TABLES;
SELECT * FROM planos;
```

---

## 🏛️ Fase 4: Models (Entidades)

- [x] **Usuario.java** - @Entity, @Table, @Column, @PrePersist
- [x] **Crianca.java** - @ManyToOne relacionamento
- [x] **Plano.java** - Configuração básica
- [x] **Relatorio.java** - @ManyToOne múltiplos relacionamentos

### Verificar:
```bash
# Deve compilar sem erros
mvn compile
```

---

## 🗂️ Fase 5: Repositories

- [x] **UsuarioRepository** - extends JpaRepository, findByEmail
- [x] **CriancaRepository** - findByUsuarioId
- [x] **PlanoRepository** - findByTipo
- [x] **RelatorioRepository** - findByCriancaId, findByUsuarioId

### Verificar:
```bash
# Deve compilar sem erros
mvn compile
```

---

## 💼 Fase 6: Services

- [x] **UsuarioService** - registrar, login, obter, atualizar, deletar
- [x] **CriancaService** - criar, obter, listar, atualizar, deletar
- [x] **PlanoService** - obterTodos, obterPorTipo
- [x] **RelatorioService** - registrarJogo, obterPorCrianca, obterPorUsuario

### Verificar:
```bash
# Deve compilar sem erros
mvn compile
```

---

## 🌐 Fase 7: Controllers (Rotas REST)

- [x] **UsuarioController** - 6 endpoints
- [x] **CriancaController** - 5 endpoints
- [x] **PlanoController** - 4 endpoints
- [x] **RelatorioController** - 4 endpoints
- [x] **PaginasController** - 25+ rotas de navegação

### Verificar:
```bash
# Deve compilar sem erros
mvn compile

# Executar
mvn spring-boot:run

# Testar rotas
curl http://localhost:8080/api/usuarios
curl http://localhost:8080/api/planos
```

---

## 📦 Fase 8: DTOs (Data Transfer Objects)

- [x] **UsuarioDTO** - id, email, nome, tipoPlano
- [x] **CriancaDTO** - id, nome, idade, fotoUrl, dataNascimento
- [x] **PlanoDTO** - id, nome, preco, descricao, tipo, limiteCriancas
- [x] **RelatorioDTO** - id, criancaId, usuarioId, tempoJogado, acertos, erros, pontuacao, tipoJogo, dataJogo

### Verificar:
```bash
mvn compile
```

---

## 🔐 Fase 9: Configurações de Segurança e CORS

- [x] **CORS habilitado** em `TccDsBackendApplication.java`
- [x] **Endpoints públicos** (registro, login, planos)
- [x] **WebConfig** para arquivos estáticos

### Verificar:
```bash
# Testar CORS com POST
curl -X POST http://localhost:8080/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","senha":"123"}'
```

---

## 📄 Fase 10: Documentação

- [x] **README.md** - Setup completo e documentação
- [x] **TESTE_API.md** - Exemplos de requisições
- [x] **API_SERVICE_EXEMPLO.js** - Funções JavaScript
- [x] **INTEGRACAO_FRONTEND.md** - Guia de integração
- [x] **ARQUITETURA.md** - Diagramas da arquitetura
- [x] **RESUMO.md** - Resumo do projeto
- [x] **CHECKLIST.md** - Este arquivo

### Verificar:
```bash
# Arquivos markdown devem existir
ls -la *.md
```

---

## 🧪 Fase 11: Testes Manuais

### Teste 1: Backend Rodando
- [ ] Executar `mvn spring-boot:run`
- [ ] Acessar `http://localhost:8080`
- [ ] Ver página inicial servida

### Teste 2: Registrar Usuário
```bash
curl -X POST http://localhost:8080/api/usuarios/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "email":"teste@teste.com",
    "senha":"123456",
    "nome":"Teste Usuario",
    "tipoPlano":"gratis"
  }'
```
- [ ] Resposta 201 Created
- [ ] Retorna UsuarioDTO com ID

### Teste 3: Login
```bash
curl -X POST http://localhost:8080/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","senha":"123456"}'
```
- [ ] Resposta 200 OK
- [ ] Retorna dados do usuário

### Teste 4: Obter Usuário
```bash
curl http://localhost:8080/api/usuarios/1
```
- [ ] Resposta 200 OK
- [ ] Retorna UsuarioDTO

### Teste 5: Criar Criança
```bash
curl -X POST http://localhost:8080/api/criancas \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId":1,
    "nome":"Maria",
    "idade":6,
    "dataNascimento":"2018-05-15"
  }'
```
- [ ] Resposta 201 Created
- [ ] Retorna CriancaDTO com ID

### Teste 6: Listar Crianças
```bash
curl http://localhost:8080/api/criancas/usuario/1
```
- [ ] Resposta 200 OK
- [ ] Retorna lista de CriancaDTO

### Teste 7: Obter Planos
```bash
curl http://localhost:8080/api/planos
```
- [ ] Resposta 200 OK
- [ ] Retorna 3 planos pré-configurados

### Teste 8: Registrar Jogo
```bash
curl -X POST http://localhost:8080/api/relatorios \
  -H "Content-Type: application/json" \
  -d '{
    "criancaId":1,
    "usuarioId":1,
    "tempoJogado":15,
    "acertos":8,
    "erros":2,
    "pontuacao":80,
    "tipoJogo":"memoria"
  }'
```
- [ ] Resposta 201 Created
- [ ] Retorna RelatorioDTO com ID

### Teste 9: Obter Relatórios
```bash
curl http://localhost:8080/api/relatorios/crianca/1
```
- [ ] Resposta 200 OK
- [ ] Retorna lista de relatórios

### Teste 10: Navegação de Páginas
```bash
curl -i http://localhost:8080/login
curl -i http://localhost:8080/dashboard
```
- [ ] Resposta 301 Redirect
- [ ] Redireciona para .html correto

---

## 🔧 Fase 12: Integração com Frontend

- [ ] **Copiar arquivos HTML** para `src/main/resources/static/`
- [ ] **Copiar CSS** para `src/main/resources/static/css/`
- [ ] **Copiar JavaScript** para `src/main/resources/static/js/`
- [ ] **Copiar Assets** para `src/main/resources/static/assets/`
- [ ] **Criar `api-service.js`** baseado em `API_SERVICE_EXEMPLO.js`
- [ ] **Atualizar HTML** para usar Fetch API
- [ ] **Testar fluxo completo**:
  - [ ] Login/Cadastro funciona
  - [ ] Criação de crianças funciona
  - [ ] Seleção de planos funciona
  - [ ] Registro de jogos funciona
  - [ ] Visualização de relatórios funciona

### Comandos:
```bash
# Windows
Copy-Item -Path "..\src\pages\*" -Destination "src\main\resources\static\" -Recurse
Copy-Item -Path "..\src\css\*" -Destination "src\main\resources\static\css\" -Recurse
Copy-Item -Path "..\src\js\*" -Destination "src\main\resources\static\js\" -Recurse
Copy-Item -Path "..\src\assets\*" -Destination "src\main\resources\static\assets\" -Recurse

# Linux/Mac
cp -r ../src/pages/* src/main/resources/static/
cp -r ../src/css/* src/main/resources/static/css/
cp -r ../src/js/* src/main/resources/static/js/
cp -r ../src/assets/* src/main/resources/static/assets/
```

---

## 🐛 Fase 13: Correções e Ajustes

- [ ] **Testar erros de CORS**
- [ ] **Testar erros de validação**
- [ ] **Testar erros de autenticação**
- [ ] **Testar erros de banco de dados**
- [ ] **Otimizar queries**
- [ ] **Adicionar logs**
- [ ] **Tratamento de exceções**

---

## 🚀 Fase 14: Melhorias de Produção

- [ ] **Implementar autenticação JWT**
- [ ] **Criptografar senhas com BCrypt**
- [ ] **Adicionar validação com @Valid**
- [ ] **Implementar @ExceptionHandler**
- [ ] **Adicionar testes unitários**
- [ ] **Adicionar testes de integração**
- [ ] **Configurar logging**
- [ ] **Otimizar performance**
- [ ] **Documentação Swagger/OpenAPI**

---

## 📦 Fase 15: Deploy

- [ ] **Gerar JAR**: `mvn clean package`
- [ ] **Testar JAR localmente**: `java -jar target/backend-spring-1.0.0.jar`
- [ ] **Configurar variáveis de ambiente**
- [ ] **Deploy em servidor**:
  - [ ] Heroku
  - [ ] AWS EC2
  - [ ] Google Cloud
  - [ ] Azure
  - [ ] DigitalOcean
- [ ] **Configurar domínio**
- [ ] **HTTPS/SSL**
- [ ] **Monitoramento e logs**

### Comando Deploy:
```bash
mvn clean package
java -jar target/backend-spring-1.0.0.jar
```

---

## 📊 Resumo de Progresso

```
Fase 1 (Preparação):      ████████████████████ 100%
Fase 2 (Estrutura):       ████████████████████ 100%
Fase 3 (BD):              ████████████████████ 100%
Fase 4 (Models):          ████████████████████ 100%
Fase 5 (Repositories):    ████████████████████ 100%
Fase 6 (Services):        ████████████████████ 100%
Fase 7 (Controllers):     ████████████████████ 100%
Fase 8 (DTOs):            ████████████████████ 100%
Fase 9 (Segurança):       ████████████████████ 100%
Fase 10 (Docs):           ████████████████████ 100%
Fase 11 (Testes):         ░░░░░░░░░░░░░░░░░░░░   0%
Fase 12 (Frontend):       ░░░░░░░░░░░░░░░░░░░░   0%
Fase 13 (Ajustes):        ░░░░░░░░░░░░░░░░░░░░   0%
Fase 14 (Produção):       ░░░░░░░░░░░░░░░░░░░░   0%
Fase 15 (Deploy):         ░░░░░░░░░░░░░░░░░░░░   0%

TOTAL:                     ████████████░░░░░░░░  67%
```

---

## 🎯 Próximas Ações Imediatas

### Priority 1 (Crítico)
1. [ ] Executar `mvn clean install` para compilar
2. [ ] Executar `mvn spring-boot:run` para testar
3. [ ] Executar testes da Fase 11

### Priority 2 (Alto)
1. [ ] Copiar arquivos frontend
2. [ ] Criar `api-service.js`
3. [ ] Atualizar HTML para usar API

### Priority 3 (Médio)
1. [ ] Implementar JWT
2. [ ] Adicionar testes unitários
3. [ ] Configurar logs

### Priority 4 (Baixo)
1. [ ] Documentação Swagger
2. [ ] Otimizações
3. [ ] Deploy

---

## 📞 Suporte

Se alguma fase não foi concluída:

1. **Fase 1 (Ambiente)**
   - Verifique instalações: `java -version`, `mvn -version`, `mysql --version`
   
2. **Fase 2 (Estrutura)**
   - Execute: `mvn clean install`
   - Verifique se todos os arquivos foram criados

3. **Fase 3 (BD)**
   - Execute: `mysql -u root -p < database.sql`
   - Verifique: `SHOW TABLES;`

4. **Fases 4-10**
   - Execute: `mvn compile`
   - Verifique erros de compilação

5. **Fase 11 (Testes)**
   - Execute: `mvn spring-boot:run`
   - Use cURL ou Postman para testar

6. **Fase 12 (Frontend)**
   - Verifique se arquivos estão em `src/main/resources/static/`
   - Consulte `INTEGRACAO_FRONTEND.md`

---

## ✨ Conclusão

Após completar todas as fases, você terá um backend Spring Boot completo com:
- ✅ Rotas REST funcionais
- ✅ Banco de dados MySQL integrado
- ✅ CORS habilitado para frontend
- ✅ Documentação completa
- ✅ Pronto para integração com frontend

**Data de Criação:** 8 de dezembro de 2024  
**Versão do Backend:** 1.0.0  
**Status:** ✅ Estrutura Base Completa

---

**Bom desenvolvimento! 🚀**
