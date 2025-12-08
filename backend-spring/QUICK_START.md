# 🚀 Quick Start Guide - TCC-DS Backend

**Começar em 5 minutos!**

---

## ⚡ Passos Rápidos

### 1. Crie o Banco de Dados (2 min)

```bash
# Windows
mysql -u root -p < src\main\resources\database.sql

# Linux/Mac
mysql -u root -p < src/main/resources/database.sql
```

✅ Banco `tcc_ds_db` criado com 4 tabelas + planos pré-configurados

---

### 2. Compile o Projeto (2 min)

```bash
mvn clean install
```

✅ Todas as dependências instaladas

---

### 3. Execute o Backend (1 min)

```bash
mvn spring-boot:run
```

ou via IDE: Clique "Run" em `TccDsBackendApplication.java`

✅ Backend rodando em `http://localhost:8080`

---

### 4. Teste uma Rota (1 min)

Abra o navegador ou terminal:

```bash
curl http://localhost:8080/api/planos
```

✅ Você deve ver os 3 planos em JSON

---

## 🎯 Próximos Passos

### Teste o Fluxo Completo

**1. Registrar usuário**
```bash
curl -X POST http://localhost:8080/api/usuarios/registrar \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","senha":"123","nome":"Teste","tipoPlano":"gratis"}'
```

**2. Fazer login**
```bash
curl -X POST http://localhost:8080/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","senha":"123"}'
```
> Copie o `id` retornado

**3. Criar criança**
```bash
curl -X POST http://localhost:8080/api/criancas \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":1,"nome":"Maria","idade":6,"dataNascimento":"2018-05-15"}'
```
> Copie o `id` retornado

**4. Registrar jogo**
```bash
curl -X POST http://localhost:8080/api/relatorios \
  -H "Content-Type: application/json" \
  -d '{"criancaId":1,"usuarioId":1,"tempoJogado":15,"acertos":8,"erros":2,"pontuacao":80,"tipoJogo":"memoria"}'
```

---

## 📝 Usar o Postman (Recomendado)

1. Baixe [Postman](https://www.postman.com/downloads/)
2. Crie uma nova collection "TCC-DS"
3. Importe essas requisições:

| Método | URL | Body |
|--------|-----|------|
| POST | http://localhost:8080/api/usuarios/registrar | `{"email":"teste@teste.com","senha":"123","nome":"Teste","tipoPlano":"gratis"}` |
| POST | http://localhost:8080/api/usuarios/login | `{"email":"teste@teste.com","senha":"123"}` |
| GET | http://localhost:8080/api/usuarios | - |
| GET | http://localhost:8080/api/planos | - |
| POST | http://localhost:8080/api/criancas | `{"usuarioId":1,"nome":"Maria","idade":6,"dataNascimento":"2018-05-15"}` |
| POST | http://localhost:8080/api/relatorios | `{"criancaId":1,"usuarioId":1,"tempoJogado":15,"acertos":8,"erros":2,"pontuacao":80,"tipoJogo":"memoria"}` |

---

## 🔍 Verificar o Banco de Dados

```bash
# Conectar ao MySQL
mysql -u root -p -D tcc_ds_db

# Ver dados criados
SELECT * FROM usuarios;
SELECT * FROM criancas;
SELECT * FROM relatorios;
SELECT * FROM planos;

# Sair
EXIT;
```

---

## 🐛 Solução Rápida de Problemas

### ❌ Erro: "Connection refused" (porta 8080)
```bash
# Verificar se algo já está usando a porta
# Altere em src/main/resources/application.properties:
server.port=8081
```

### ❌ Erro: "Access denied for user 'root'"
```bash
# Edite src/main/resources/application.properties:
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
```

### ❌ Erro: "Database does not exist"
```bash
# Execute o script SQL:
mysql -u root -p < src/main/resources/database.sql
```

### ❌ Erro: "CORS error"
- O backend está em `http://localhost:8080`
- O frontend deve estar em `http://localhost:3000` ou `file://`
- CORS está habilitado ✅

---

## 📚 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `pom.xml` | Dependências Maven |
| `src/main/resources/application.properties` | Configuração MySQL |
| `src/main/resources/database.sql` | Script de criação do BD |
| `README.md` | Documentação completa |
| `TESTE_API.md` | Exemplos de testes |
| `API_SERVICE_EXEMPLO.js` | Funções para conectar frontend |
| `INTEGRACAO_FRONTEND.md` | Como integrar com seu HTML |

---

## 📖 Documentação Completa

Para mais informações, leia:

- 📘 **README.md** - Documentação completa
- 📋 **TESTE_API.md** - Exemplos de requisições
- 🔗 **INTEGRACAO_FRONTEND.md** - Conectar seu HTML/JS
- 🏗️ **ARQUITETURA.md** - Diagramas do sistema
- ✅ **CHECKLIST.md** - Fases de desenvolvimento
- 📄 **RESUMO.md** - Visão geral do projeto

---

## 💡 Dicas Úteis

### 1. Salvar Logs em Arquivo
```bash
mvn spring-boot:run > backend.log 2>&1
```

### 2. Rodando em Outro Terminal
```bash
# Terminal 1: Backend
mvn spring-boot:run

# Terminal 2: Testes
curl http://localhost:8080/api/planos
```

### 3. Parar o Backend
```bash
Pressione: Ctrl + C
```

### 4. Usar IDE para Debug
- IntelliJ IDEA: Click direito em `TccDsBackendApplication.java` → Debug
- VS Code: Instale "Debugger for Java" e use Debug

### 5. Ver Logs no Console
```properties
# Em application.properties, adicione:
logging.level.root=INFO
logging.level.com.tccds=DEBUG
```

---

## ✨ Conclusão

Seu backend Spring Boot está **100% pronto**! 🎉

### Você tem:
✅ Backend em Java com Spring Boot  
✅ Banco MySQL com 4 tabelas  
✅ 19 rotas REST funcionais  
✅ CORS habilitado para frontend  
✅ Documentação completa  

### Próximo passo:
👉 Integre com seu frontend HTML/CSS/JS usando `API_SERVICE_EXEMPLO.js`

---

## 📞 Ajuda Rápida

**Backend não inicia?**
1. Verifique se Maven está instalado: `mvn -version`
2. Verifique se Java 17+ está instalado: `java -version`
3. Verifique se MySQL está rodando
4. Verifique `application.properties`

**Rotas não respondem?**
1. Verifique se backend está rodando na porta 8080
2. Verifique se URL está correta
3. Verifique se Content-Type está como `application/json`

**Banco de dados não funciona?**
1. Execute: `mysql -u root -p < database.sql`
2. Verifique credenciais em `application.properties`
3. Verifique se MySQL está rodando: `mysql -u root -p`

---

**Desenvolvido com ❤️ para TCC-DS**

Data: 8 de dezembro de 2024  
Versão: 1.0.0  
Status: ✅ Pronto para Uso
