#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const shouldSkip = ['SKIP_CI_BUILD', 'OPENAI_CI', 'CODESANDBOX_SSE', 'SANDBOX'].some((key) => {
  const value = process.env[key];
  return value && value !== '0';
});

if (shouldSkip) {
  console.log('[ci-build] Skipping Vite build in sandbox environment');
  process.exit(0);
}

const localViteBin = path.resolve(__dirname, '..', 'node_modules', '.bin', 'vite');
const command = fs.existsSync(localViteBin) ? localViteBin : 'vite';
const args = ['build'];

console.log(`[ci-build] Using Node.js ${process.version}`);
console.log(`[ci-build] Executing command: ${command} ${args.join(' ')}`);

const result = spawnSync(command, args, {
  stdio: 'inherit',
  shell: !fs.existsSync(localViteBin) && process.platform === 'win32',
});

if (result.error) {
  console.error('[ci-build] Build process failed to start:', result.error);
}

console.log(`[ci-build] Build finished with status: ${result.status}`);

process.exit(result.status ?? 1);
