# Endpoint de IA para a tela Ajuda

O front-end chama `POST /support/ai-chat` primeiro e usa `POST /ai/chat` como alternativa. A chave da OpenAI deve ficar somente no backend, em variável de ambiente, nunca no HTML ou JavaScript do navegador.

Exemplo em Node/Express:

```js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/support/ai-chat", async (req, res) => {
  const { message, history = [], user = {} } = req.body;

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.1",
    input: [
      {
        role: "developer",
        content:
          "Voce e a assistente de suporte da Zupi. Responda em portugues do Brasil, com tom acolhedor, curto e pratico. Ajude com cadastro de criancas, perfis, relatorios, agenda, jogos, configuracoes e acesso. Quando nao souber, diga que o suporte vai acompanhar."
      },
      ...history.map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: String(item.content || "").slice(0, 1200)
      })),
      {
        role: "user",
        content: `Usuario: ${user.name || "sem nome"} (${user.type || "sem perfil"})\nPergunta: ${message}`
      }
    ]
  });

  res.json({ answer: response.output_text });
});
```

Instalacao no backend Node:

```bash
npm install openai
```

Variaveis:

```bash
OPENAI_API_KEY=sua_chave
OPENAI_MODEL=gpt-5.1
```
