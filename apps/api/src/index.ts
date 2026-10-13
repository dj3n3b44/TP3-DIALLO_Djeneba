import { createTraceServer } from './server';

const DEFAULT_PORT = 3000;
const MAX_PORT = 65535;

function resolvePort(raw: string | undefined): number {
  if (raw === undefined || !/^\d+$/.test(raw.trim())) {
    return DEFAULT_PORT;
  }
  const parsed = Number.parseInt(raw.trim(), 10);
  return parsed >= 1 && parsed <= MAX_PORT ? parsed : DEFAULT_PORT;
}

const port = resolvePort(process.env.PORT);
const server = createTraceServer();

server.on('error', (error) => {
  console.error('[api] impossible de démarrer le serveur TRACE', error);
  process.exitCode = 1;
});

function shutdown(): void {
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(port, () => {
  console.log(`[api] TRACE en ligne sur http://localhost:${port}`);
});
