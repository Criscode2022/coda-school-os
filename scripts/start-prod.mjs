import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const apiMain = join(process.cwd(), 'apps/api/dist/main.js');
if (!existsSync(apiMain)) {
  console.error('Missing apps/api/dist/main.js — run npm run build first');
  process.exit(1);
}

const child = spawn(process.execPath, [apiMain], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT || '8080',
    HOST: process.env.HOST || '0.0.0.0',
  },
});
child.on('exit', (code) => process.exit(code ?? 0));
