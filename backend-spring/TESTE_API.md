# 🧪 Guia de Testes - Backend TCC-DS

Este guia fornece exemplos de requisições para testar o backend Spring Boot.

## 📌 Pré-requisitos

- Backend rodando em `http://localhost:8080`
- Postman ou cURL para fazer requisições
- MySQL com banco de dados criado

## 🚀 Sequência de Testes Recomendada

### 1️⃣ Registrar Novo Usuário

**Método:** POST  
**URL:** `http://localhost:8080/api/usuarios/registrar`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "email": "pai@example.com",
  "senha": "senha123",
  "nome": "João Silva",
  "tipoPlano": "gratis"
}
```

**Resposta esperada (201 Created):**
```json
{
  "id": 1,
  "email": "pai@example.com",
  "nome": "João Silva",
  "tipoPlano": "gratis"
}
```

---

### 2️⃣ Fazer Login

**Método:** POST  
**URL:** `http://localhost:8080/api/usuarios/login`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "email": "pai@example.com",
  "senha": "senha123"
}
```

**Resposta esperada (200 OK):**
```json
{
  "id": 1,
  "email": "pai@example.com",
  "nome": "João Silva",
  "tipoPlano": "gratis"
}
```

**❌ Login inválido:**
```json
{
  "email": "pai@example.com",
  "senha": "senhaErrada"
}
```
→ Retorna `401 Unauthorized`

---

### 3️⃣ Obter Dados do Usuário

**Método:** GET  
**URL:** `http://localhost:8080/api/usuarios/1`

**Resposta esperada (200 OK):**
```json
{
  "id": 1,
  "email": "pai@example.com",
  "nome": "João Silva",
  "tipoPlano": "gratis"
}
```

---

### 4️⃣ Criar Criança

**Método:** POST  
**URL:** `http://localhost:8080/api/criancas`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "usuarioId": 1,
  "nome": "Maria Silva",
  "idade": 6,
  "dataNascimento": "2018-05-15"
}
```

**Resposta esperada (201 Created):**
```json
{
  "id": 1,
  "nome": "Maria Silva",
  "idade": 6,
  "fotoUrl": null,
  "dataNascimento": "2018-05-15"
}
```

---

### 5️⃣ Listar Crianças do Usuário

**Método:** GET  
**URL:** `http://localhost:8080/api/criancas/usuario/1`

**Resposta esperada (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "Maria Silva",
    "idade": 6,
    "fotoUrl": null,
    "dataNascimento": "2018-05-15"
  }
]
```

---

### 6️⃣ Obter Todos os Planos

**Método:** GET  
**URL:** `http://localhost:8080/api/planos`

**Resposta esperada (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "Plano Gratuito",
    "preco": 0.00,
    "descricao": "Acesso limitado aos jogos educativos",
    "tipo": "gratis",
    "limiteCriancas": 1
  },
  {
    "id": 2,
    "nome": "Plano Premium",
    "preco": 29.90,
    "descricao": "Acesso completo a todos os jogos e relatórios avançados",
    "tipo": "premium",
    "limiteCriancas": 3
  },
  {
    "id": 3,
    "nome": "Plano Pro",
    "preco": 49.90,
    "descricao": "Acesso ilimitado com suporte prioritário e relatórios personalizados",
    "tipo": "pro",
    "limiteCriancas": null
  }
]
```

---

### 7️⃣ Obter Plano por Tipo

**Método:** GET  
**URL:** `http://localhost:8080/api/planos/tipo/premium`

**Resposta esperada (200 OK):**
```json
{
  "id": 2,
  "nome": "Plano Premium",
  "preco": 29.90,
  "descricao": "Acesso completo a todos os jogos e relatórios avançados",
  "tipo": "premium",
  "limiteCriancas": 3
}
```

---

### 8️⃣ Registrar Jogo (Relatório)

**Método:** POST  
**URL:** `http://localhost:8080/api/relatorios`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
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

**Resposta esperada (201 Created):**
```json
{
  "id": 1,
  "criancaId": 1,
  "usuarioId": 1,
  "tempoJogado": 15,
  "acertos": 8,
  "erros": 2,
  "pontuacao": 80,
  "tipoJogo": "memoria",
  "dataJogo": "2024-01-15 10:30:45"
}
```

---

### 9️⃣ Obter Relatórios da Criança

**Método:** GET  
**URL:** `http://localhost:8080/api/relatorios/crianca/1`

**Resposta esperada (200 OK):**
```json
[
  {
    "id": 1,
    "criancaId": 1,
    "usuarioId": 1,
    "tempoJogado": 15,
    "acertos": 8,
    "erros": 2,
    "pontuacao": 80,
    "tipoJogo": "memoria",
    "dataJogo": "2024-01-15 10:30:45"
  }
]
```

---

### 🔟 Obter Relatórios do Usuário

**Método:** GET  
**URL:** `http://localhost:8080/api/relatorios/usuario/1`

**Resposta esperada (200 OK):**
```json
[
  {
    "id": 1,
    "criancaId": 1,
    "usuarioId": 1,
    "tempoJogado": 15,
    "acertos": 8,
    "erros": 2,
    "pontuacao": 80,
    "tipoJogo": "memoria",
    "dataJogo": "2024-01-15 10:30:45"
  }
]
```

---

## 🧪 Testes com cURL

Se preferir usar cURL, aqui estão os comandos:

### Registrar Usuário
```bash
curl -X POST http://localhost:8080/api/usuarios/registrar \
  -H "Content-Type: application/json" \
  -d '{"email":"pai@example.com","senha":"senha123","nome":"João Silva","tipoPlano":"gratis"}'
```

### Fazer Login
```bash
curl -X POST http://localhost:8080/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pai@example.com","senha":"senha123"}'
```

### Obter Usuário
```bash
curl http://localhost:8080/api/usuarios/1
```

### Criar Criança
```bash
curl -X POST http://localhost:8080/api/criancas \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":1,"nome":"Maria Silva","idade":6,"dataNascimento":"2018-05-15"}'
```

### Listar Crianças
```bash
curl http://localhost:8080/api/criancas/usuario/1
```

### Obter Planos
```bash
curl http://localhost:8080/api/planos
```

### Registrar Jogo
```bash
curl -X POST http://localhost:8080/api/relatorios \
  -H "Content-Type: application/json" \
  -d '{"criancaId":1,"usuarioId":1,"tempoJogado":15,"acertos":8,"erros":2,"pontuacao":80,"tipoJogo":"memoria"}'
```

---

## 🧭 Testes de Navegação de Páginas

As rotas de navegação redirecionam para os arquivos HTML:

```
GET http://localhost:8080/            → redireciona para /index.html
GET http://localhost:8080/login        → redireciona para /login.html
GET http://localhost:8080/cadastro     → redireciona para /cadastro.html
GET http://localhost:8080/dashboard    → redireciona para /dashboard-pais.html
GET http://localhost:8080/menu-jogos   → redireciona para /menu-jogos.html
GET http://localhost:8080/relatorios   → redireciona para /relatorios.html
```

Para testar em cURL:
```bash
curl -i http://localhost:8080/login
```

Você verá uma resposta `301 Moved Permanently` redirecionando para `/login.html`.

---

## 🔍 Dicas de Teste

### No Postman

1. Crie uma nova collection chamada "TCC-DS Backend"
2. Crie as requisições na sequência do guia
3. Use variáveis para armazenar IDs:
   ```
   // Após registrar, salve o ID em uma variável
   pm.environment.set("usuarioId", pm.response.json().id);
   
   // Depois use: {{usuarioId}}
   ```

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|--------|
| `Connection refused` | Backend não rodando | Execute `mvn spring-boot:run` |
| `400 Bad Request` | JSON inválido | Verifique a sintaxe do JSON |
| `401 Unauthorized` | Credenciais erradas | Verifique email/senha |
| `404 Not Found` | Recurso não existe | Verifique se o ID existe |
| `CORS error` | Frontend em origem diferente | Verifique `TccDsBackendApplication.java` |

---

## 📊 Fluxo Recomendado para Teste Completo

```
1. Registrar usuário
   ↓
2. Fazer login com esse usuário
   ↓
3. Criar criança(s) vinculada ao usuário
   ↓
4. Verificar planos disponíveis
   ↓
5. Registrar sessões de jogo
   ↓
6. Verificar relatórios da criança
   ↓
7. Verificar relatórios do usuário
```

---

## ✅ Checklist de Validação

- [ ] Backend rodando em `http://localhost:8080`
- [ ] Banco de dados `tcc_ds_db` criado
- [ ] Tabelas criadas com sucesso
- [ ] Registro de usuário funcionando
- [ ] Login funcionando
- [ ] Criação de crianças funcionando
- [ ] Planos retornando dados
- [ ] Relatórios sendo registrados
- [ ] CORS habilitado para requisições do frontend

---

**Happy Testing! 🎉**
