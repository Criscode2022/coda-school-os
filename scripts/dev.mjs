import { spawn } from 'node:child_process';

const children = [];

function run(name, command, args, env = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
    shell: false,
  });
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with ${code}`);
      for (const c of children) c.kill('SIGTERM');
      process.exit(code);
    }
  });
  children.push(child);
}

run('api', 'npm', ['--prefix', 'apps/api', 'run', 'start:dev'], {
  PORT: process.env.API_PORT || '3001',
  HOST: process.env.API_HOST || '127.0.0.1',
});
run('web', 'npm', ['--prefix', 'apps/web', 'run', 'start']);

const stop = () => {
  for (const c of children) c.kill('SIGTERM');
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
