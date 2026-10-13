import { spawnSync } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const isWindows = process.platform === 'win32';
const steps = ['lint', 'typecheck', 'test'];

let failed = false;

for (const step of steps) {
  console.log(`\n=== npm run ${step} ===`);
  const args = [`run`, step];
  const result = isWindows
    ? spawnSync(`${npm} ${args.join(' ')}`, { cwd: process.cwd(), stdio: 'inherit', shell: true })
    : spawnSync(npm, args, { cwd: process.cwd(), stdio: 'inherit' });

  if (result.status === 0) {
    console.log(`[check] ${step}: OK`);
  } else {
    console.error(`[check] ${step}: ECHEC (code ${result.status ?? result.signal})`);
    failed = true;
  }
}

if (failed) {
  console.error('\n[check] ECHEC : un ou plusieurs controles ont echoue.');
  process.exitCode = 1;
} else {
  console.log('\n[check] OK : lint, typecheck et test passent.');
}
