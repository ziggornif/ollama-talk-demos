import { LLMOllamaAdapter } from './llm-ollama-adapter';

(async () => {
  const ollamaAdapter = new LLMOllamaAdapter({
    ollamaURL: 'http://localhost:11434',
    redisURL: 'redis://localhost:6379',
    llmModel: 'llama3',
    systemPrompt:
      "Ecrit en français de France uniquement. Utilise les pièces suivantes présentes dans le contexte pour répondre aux questions. Si tu ne connais pas la réponse, dis que tu ne sais pas. N'invente pas de réponse.",
  });
  const stream = await ollamaAdapter.call({
    prompt: 'Quelle valeur peut prendre la colonne geo_type ?', //'Explique moi la colonne nb_adresses',
    sessionId: '1234',
  });

  let response = '';
  for await (const chunk of stream) {
    response += chunk;
  }
  console.log(response);
  process.exit(0);
})();
