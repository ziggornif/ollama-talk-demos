import http from 'node:http';
import { randomUUID } from 'node:crypto';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import listEndpoints from 'express-list-endpoints';
import { LLMOllamaAdapter } from './llm-ollama-adapter';

class Server {
  #app: Express;
  #server?: http.Server;
  #port: number;
  #ollamaAdapter: LLMOllamaAdapter;

  constructor() {
    this.#app = express();
    this.#port = 8080;
    this.#ollamaAdapter = new LLMOllamaAdapter({
      ollamaURL: 'http://localhost:11434',
      redisURL: 'redis://localhost:6379',
      llmModel: 'llama3',
      systemPrompt:
        "Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.",
    });
  }

  bootstrap() {
    this.#app.use(cors());
    this.#app.use(express.json());
    this.#app.use(express.urlencoded({ extended: false }));

    this.#app.use(express.static(`${__dirname}/public`));

    this.#app.post('/api/prompt', async (req: Request, res: Response) => {
      const { prompt } = req.body;
      const xsessionId = req.headers['x-session-id'] as string;

      const sessionId = !xsessionId || xsessionId === '' ? randomUUID() : xsessionId;

      const stream = await this.#ollamaAdapter.call({ prompt, sessionId });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('x-session-id', sessionId);

      for await (const chunk of stream) {
        res.write(chunk);
      }
      res.end();
    });

    this.#server = http.createServer(this.#app);
    listEndpoints(this.#app).forEach((endpoint) => {
      console.log(`${endpoint.methods} ${endpoint.path}`);
    });
  }

  run() {
    this.#server?.listen(this.#port);
    console.log(`🚀 Application running on http://localhost:${this.#port}`);
  }

  async shutdown() {
    this.#server?.close(() => {
      console.log('🛑 Application shutdown');
    });
  }
}

export { Server };
