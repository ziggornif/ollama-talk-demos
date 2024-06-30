import { ChatOllama } from '@langchain/community/chat_models/ollama';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import { RedisChatMessageHistory } from '@langchain/redis';

type OllamaAdapterConfig = {
  ollamaURL: string;
  llmModel: string;
  redisURL: string;
  systemPrompt: string;
};

type UserQuery = {
  prompt: string;
  sessionId: string;
};

class LLMOllamaAdapter {
  #ollamaURL: string;
  #redisURL: string;
  #prompt: ChatPromptTemplate;
  #model: ChatOllama;
  #systemPrompt: string;

  constructor(ollamaAdapterConfig: OllamaAdapterConfig) {
    this.#ollamaURL = ollamaAdapterConfig.ollamaURL;
    this.#redisURL = ollamaAdapterConfig.redisURL;
    this.#systemPrompt = ollamaAdapterConfig.systemPrompt;

    this.#prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(`{system}`),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate(`{prompt}`),
    ]);

    this.#model = new ChatOllama({
      baseUrl: this.#ollamaURL,
      model: ollamaAdapterConfig.llmModel,
      temperature: 0.8,
      repeatPenalty: 1.1,
      verbose: true,
    });
  }

  async call(query: UserQuery): Promise<AsyncIterable<string>> {
    const outputParser = new StringOutputParser();
    const chain = this.#prompt.pipe(this.#model).pipe(outputParser);

    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: (_sessionId) =>
        new RedisChatMessageHistory({
          sessionId: _sessionId,
          sessionTTL: 300,
          config: { url: this.#redisURL },
        }),
      inputMessagesKey: 'prompt',
      historyMessagesKey: 'history',
    });

    const stream = await chainWithHistory.stream(
      {
        system: this.#systemPrompt ?? '',
        prompt: query.prompt,
      },
      {
        configurable: {
          sessionId: query.sessionId,
        },
      }
    );

    return stream;
  }
}

export { LLMOllamaAdapter };
export type { OllamaAdapterConfig, UserQuery };
