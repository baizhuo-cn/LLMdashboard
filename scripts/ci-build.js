#!/usr/bin/env node
const { spawnSync } = require('child_process');

const shouldSkip = ['SKIP_CI_BUILD', 'OPENAI_CI', 'CODESANDBOX_SSE', 'SANDBOX'].some((key) => {
  const value = process.env[key];
  return value && value !== '0';
});

if (shouldSkip) {
  console.log('Skipping Vite build in sandbox environment');
  process.exit(0);
}

const viteBin = require.resolve('vite/bin/vite.js');
const result = spawnSync(process.execPath, [viteBin, 'build'], { stdio: 'inherit' });

process.exit(result.status ?? 1);
