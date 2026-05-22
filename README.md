# 🧩 Zupi — Aplicativo de Desenvolvimento Infantil

**Zupi** é um site/aplicativo voltado ao **desenvolvimento de crianças neurodivergentes**, com foco em aprendizado dinâmico e inclusivo.
A plataforma utiliza **jogos e quizzes interativos** para estimular habilidades cognitivas, motoras e emocionais de forma divertida.

---

## 🎯 Objetivo

Promover o aprendizado infantil por meio de experiências lúdicas e personalizadas, respeitando o ritmo e as necessidades de cada criança.
O Zupi também apoia pais, responsáveis e escolas no acompanhamento do progresso educacional.

---

## 💡 Público-Alvo

* Crianças neurodivergentes.
* Pais e responsáveis que desejam acompanhar o progresso de seus filhos.

---

## 🕹️ Funcionalidades Principais

### 👤 Perfil do Usuário

* Cadastro de criança e responsável.
* Edição de informações pessoais.
* Visualização de progresso e conquistas.

### 🎮 Jogos e Quizzes

* Jogos educativos por faixa etária e tema.
* Quizzes interativos com feedback imediato.
* Sistema de pontuação e medalhas.

### 📊 Acompanhamento de Aprendizado

* Exibição de progresso em gráficos e relatórios.
* Recomendação automática de novas atividades conforme o desempenho.

### 💬 Suporte e Comunicação

* Chat de suporte direto com a equipe Zupi.
* Canal de dúvidas e feedback.

### 📦 Atividades Impressas (Plano Premium)

* Atividades complementares enviadas via correio.
* Personalizadas conforme o perfil da criança.

---

## 💎 Planos Disponíveis

| Plano       | Descrição                            | Limitações               | Benefícios Extras                               |
| :---------- | :----------------------------------- | :----------------------- | :---------------------------------------------- |
| **Free**    | Acesso básico aos jogos e quizzes.   | Limitado e com anúncios. | —                                               |
| **Pro**     | Acesso ilimitado e sem anúncios.     | —                        | Experiência fluida e sem interrupções.          |
| **Premium** | Acesso total + atividades impressas. | —                        | Recebimento de atividades físicas via correios. |

---

## 🧠 Tecnologias Utilizadas

| Camada                  | Tecnologia                                                       |
| :---------------------- | :--------------------------------------------------------------- |
| **Front-end**           | HTML5, CSS3, JavaScript, **Vite** (`zupi-frontend/`)             |
| **Back-end**            | **Java 21**, Spring Boot 3 (API REST + JWT)                      |
| **Banco de Dados**      | PostgreSQL (dev/prod), H2 (testes)                               |
| **Integrações**         | Correios API (para envio de atividades), sistema de login e chat |
| **Hospedagem / Deploy** | Docker (API); frontend estático em `zupi-frontend/dist/`         |

### Executar localmente

```bash
# API (porta 8080)
./mvnw spring-boot:run

# Frontend (porta 5173)
cd zupi-frontend && npm install && npm run dev
```

Detalhes da arquitetura: [docs/arquitetura.md](docs/arquitetura.md)  
Documentação completa (rotas, classes, JS, mapa tela↔API): [docs/documentacao-completa-zupi.md](docs/documentacao-completa-zupi.md)

---

## 🔒 Regras de Negócio

1. Usuário Free possui acesso limitado e visualiza anúncios.
2. Usuário Pro tem acesso ilimitado e livre de anúncios.
3. Usuário Premium recebe, além do conteúdo digital, **atividades impressas via correios**.
4. Cada criança possui um perfil vinculado a um responsável.
5. O progresso deve ser salvo e exibido em tempo real.
6. Apenas usuários autenticados podem acessar jogos e quizzes.
7. O chat de suporte está disponível apenas para planos Pro e Premium.

---

## 🧾 Licença e Uso

Projeto desenvolvido para fins **acadêmicos** (TCC).
Uso, modificação e redistribuição autorizados mediante citação do autor.

---

## 👩‍💻 Autoria

**Autores:** Suellen Alves, Ana Rios, João Soares, Auri Sampaio, Kerlon Neves, José Miranda.
**Curso:** Desenvolvimento de Sistemas
**Instituição:** [SENAI-FSA]
**Ano:** 2025

---

> 💬 *“Aprender brincando é o primeiro passo para amar o conhecimento.” — Zupi Team*
