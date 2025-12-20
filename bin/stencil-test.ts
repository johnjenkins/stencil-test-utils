#!/usr/bin/env node

/**
 * CLI helper for @stencil/test-utils
 * 
 * Provides convenient commands for running tests:
 * - stencil-test --spec     (run only component tests)
 * - stencil-test --e2e      (run only browser tests)
 * - stencil-test --watch    (watch mode)
 * - stencil-test            (run all tests)
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const args = process.argv.slice(2);
const cwd = process.cwd();

// Check if vitest is installed
const vitestPath = resolve(cwd, 'node_modules/.bin/vitest');
if (!existsSync(vitestPath)) {
  console.error('Error: vitest not found. Please install it:');
  console.error('  npm install --save-dev vitest');
  process.exit(1);
}

// Parse CLI flags
const flags = {
  spec: args.includes('--spec'),
  e2e: args.includes('--e2e'),
  watch: args.includes('--watch') || args.includes('-w'),
};

// Build vitest arguments
const vitestArgs: string[] = [];

// Add test filter based on flags
if (flags.spec && !flags.e2e) {
  vitestArgs.push('--testNamePattern', '\\.spec\\.');
} else if (flags.e2e && !flags.spec) {
  vitestArgs.push('--testNamePattern', '\\.e2e\\.');
}

// Add watch mode
if (flags.watch) {
  vitestArgs.push('--watch');
}

// Add remaining args (excluding our custom flags)
const remainingArgs = args.filter(
  arg => !['--spec', '--e2e', '--watch', '-w'].includes(arg)
);
vitestArgs.push(...remainingArgs);

// Run vitest
console.log(`Running: vitest ${vitestArgs.join(' ')}`);
const child = spawn('vitest', vitestArgs, {
  stdio: 'inherit',
  cwd,
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
