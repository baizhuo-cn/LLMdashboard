#!/usr/bin/env node
const shouldSkip = ['SKIP_CI_BUILD', 'OPENAI_CI', 'CODESANDBOX_SSE', 'SANDBOX', 'SKIP_CI_TEST'].some((key) => {
  const value = process.env[key];
  return value && value !== '0';
});

if (shouldSkip) {
  console.log('skipped');
  process.exit(0);
}

console.log('No automated tests are configured for this project.');
process.exit(0);
