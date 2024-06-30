import { Server } from './server';

(async () => {
  const server = new Server();
  await server.bootstrap();
  server.run();

  process.on('SIGTERM', () => server.shutdown());
  process.on('SIGINT', () => server.shutdown());
})();
