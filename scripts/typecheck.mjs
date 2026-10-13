import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tsc = require.resolve('typescript/lib/tsc.js');
const workspaces = ['apps/api', 'apps/web', 'packages/core'];

let failed = false;

for (const workspace of workspaces) {
  const tsconfig = `${workspace}/tsconfig.json`;
  const result = spawnSync(process.execPath, [tsc, '-p', tsconfig, '--noEmit'], {
    stdio: 'inherit',
  });

  if (result.status === 0) {
    console.log(`[typecheck] ${workspace}: OK`);
  } else {
    console.error(`[typecheck] ${workspace}: ECHEC (code ${result.status ?? result.signal})`);
    failed = true;
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log('[typecheck] OK : tous les workspaces passent la verification TypeScript.');
}
