#!/usr/bin/env node

import { spawn, type ChildProcess } from 'child_process';

/**
 * stencil-test - A wrapper that integrates Stencil build with Vitest testing.
 *
 * Default behavior (no flags):
 *   - Builds Stencil in dev mode (use --prod for production)
 *   - Runs Vitest tests once
 *
 * Watch mode (--watch):
 *   - Runs Stencil build in watch mode
 *   - Runs Vitest in watch mode with interactive features:
 *     - Press 'p' to filter by filename pattern
 *     - Press 't' to filter by test name pattern
 *     - Press 'f' to rerun only failed tests
 *     - Press 'u' to update snapshots
 *     - Press 'a' to rerun all tests
 *     - Press 'q' to quit
 *   - Automatically re-runs tests when files change
 *
 * Usage:
 *   stencil-test [options] [testPathPattern]
 *
 * Stencil options:
 *   --watch          Run in watch mode (enables interactive Vitest features)
 *   --prod           Build in production mode (default: dev mode)
 *   --serve          Start dev server (with --watch)
 *   --port <number>  Dev server port (with --serve)
 *   --verbose        Show detailed Stencil output
 *
 * Vitest options:
 *   --project <name> Run tests for specific project
 *   --reporter <name> Use specified reporter
 *   --coverage       Collect coverage
 *   --ui             Enable Vitest UI
 *   --no-coverage    Disable coverage
 *   [testPathPattern] Run tests matching this pattern
 *
 * Other options:
 *   --help, -h       Show this help message
 */

interface ParsedArgs {
  // Stencil flags
  watch: boolean;
  serve: boolean;
  port?: string;
  verbose: boolean;
  debug: boolean;
  prod: boolean;

  // Vitest flags
  project?: string[];
  reporter?: string[];
  coverage: boolean;
  noCoverage: boolean;
  ui: boolean;

  // Other
  help: boolean;

  // Remaining args (test path patterns, unknown flags to pass through)
  vitestArgs: string[];
  stencilArgs: string[];
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    watch: false,
    serve: false,
    verbose: false,
    debug: false,
    prod: false,
    coverage: false,
    noCoverage: false,
    ui: false,
    help: false,
    vitestArgs: [],
    stencilArgs: [],
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    switch (arg) {
      // Help
      case '--help':
      case '-h':
        parsed.help = true;
        i++;
        break;

      // Stencil flags
      case '--watch':
        parsed.watch = true;
        i++;
        break;

      case '--serve':
        parsed.serve = true;
        i++;
        break;

      case '--port':
        parsed.port = argv[i + 1];
        i += 2;
        break;

      case '--verbose':
      case '-v':
        parsed.verbose = true;
        i++;
        break;

      case '--debug':
        parsed.debug = true;
        i++;
        break;

      case '--prod':
        parsed.prod = true;
        i++;
        break;

      // Vitest flags
      case '--project':
        if (!parsed.project) parsed.project = [];
        parsed.project.push(argv[i + 1]);
        parsed.vitestArgs.push(arg, argv[i + 1]);
        i += 2;
        break;

      case '--reporter':
        if (!parsed.reporter) parsed.reporter = [];
        parsed.reporter.push(argv[i + 1]);
        parsed.vitestArgs.push(arg, argv[i + 1]);
        i += 2;
        break;

      case '--coverage':
        parsed.coverage = true;
        parsed.vitestArgs.push(arg);
        i++;
        break;

      case '--no-coverage':
        parsed.noCoverage = true;
        parsed.vitestArgs.push(arg);
        i++;
        break;

      case '--ui':
        parsed.ui = true;
        parsed.vitestArgs.push(arg);
        i++;
        break;

      // Unknown flags or test patterns - pass to vitest
      default:
        if (arg.startsWith('-')) {
          // Unknown flag - could be for either, but default to vitest
          parsed.vitestArgs.push(arg);
          // Check if next arg is a value for this flag
          if (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
            parsed.vitestArgs.push(argv[i + 1]);
            i += 2;
          } else {
            i++;
          }
        } else {
          // Positional arg - likely a test path pattern
          parsed.vitestArgs.push(arg);
          i++;
        }
        break;
    }
  }

  return parsed;
}

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(`
stencil-test - Integrated Stencil build and Vitest testing

Usage:
  stencil-test [options] [testPathPattern]

Default (no flags): Build Stencil in dev mode and run tests once
Watch mode: Build Stencil in watch mode and run Vitest with interactive features

Stencil Options:
  --watch              Run Stencil in watch mode (enables Vitest interactive mode)
  --prod               Build in production mode (default: dev mode)
  --serve              Start dev server (requires --watch)
  --port <number>      Dev server port (default: 3333)
  --verbose, -v        Show detailed logging
  --debug              Enable Stencil debug mode

Vitest Options:
  --project <name>     Run tests for specific project
  --reporter <name>    Use specified reporter (default, verbose, dot, json, etc.)
  --coverage           Collect coverage information
  --no-coverage        Disable coverage
  --ui                 Enable Vitest UI
  [testPathPattern]    Run only tests matching this pattern

Interactive Watch Mode (when --watch is enabled):
  Press 'p' to filter by filename pattern
  Press 't' to filter by test name pattern  
  Press 'f' to rerun only failed tests
  Press 'u' to update snapshots
  Press 'a' to rerun all tests
  Press 'q' to quit

Examples:
  stencil-test                           # Build once, test once
  stencil-test --watch                   # Watch mode with auto-testing
  stencil-test --watch --serve           # Watch mode with dev server
  stencil-test button.spec.ts            # Test specific file
  stencil-test --project browser         # Test specific project
  stencil-test --watch --coverage        # Watch with coverage
  `);
  process.exit(0);
}

let stencilProcess: ChildProcess | null = null;
let vitestProcess: ChildProcess | null = null;
let debounceTimer: NodeJS.Timeout | null = null;
let buildCount = 0;
let isRunningTests = false;

const DEBOUNCE_MS = 500;
const cwd = process.cwd();
const verbose = args.verbose;

function log(message: string) {
  console.log(`[stencil-test] ${message}`);
}

/**
 * Runs Vitest tests with the configured arguments
 * In watch mode, starts Vitest in its own watch mode for interactive features
 * In non-watch mode, runs tests once
 */
function runTests() {
  // Prevent overlapping test runs in non-watch mode
  if (!args.watch && isRunningTests) {
    if (verbose) {
      log('Tests already running, skipping...');
    }
    return;
  }

  // Kill existing test process if running
  if (vitestProcess) {
    vitestProcess.kill();
    vitestProcess = null;
  }

  isRunningTests = true;

  if (verbose) {
    log(`Running tests (build #${buildCount})...`);
  } else {
    log('Running tests...');
  }

  // In watch mode, use Vitest's watch mode for interactive features
  // In non-watch mode, use 'run' for a single test run
  const vitestMode = args.watch ? 'watch' : 'run';
  const commandArgs = ['vitest', vitestMode, ...args.vitestArgs].filter(Boolean);

  if (verbose) {
    log(`Command: npx ${commandArgs.join(' ')}`);
  }

  vitestProcess = spawn('npx', commandArgs, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });

  vitestProcess.on('exit', (code) => {
    isRunningTests = false;

    if (verbose) {
      if (code === 0) {
        log('Tests passed ✓');
      } else {
        log(`Tests failed with code ${code}`);
      }
    }
    vitestProcess = null;

    // In one-time mode, exit after tests complete
    if (!args.watch) {
      process.exit(code || 0);
    }
  });

  vitestProcess.on('error', (error) => {
    isRunningTests = false;
    console.error('[stencil-test] Failed to start test process:', error);
    vitestProcess = null;
  });
}

function handleStencilOutput(data: Buffer) {
  const output = data.toString();
  process.stdout.write(output);

  // Detect build completion
  // Stencil outputs "build finished" on first build or "rebuild finished" in watch mode
  if (output.includes('build finished') || output.includes('rebuild finished')) {
    buildCount++;

    if (verbose) {
      log(`Build #${buildCount} finished`);
    }

    // Check if there were errors
    const hasErrors = output.toLowerCase().includes('[ error ]');

    if (hasErrors) {
      if (verbose) {
        log('Skipping tests due to build errors');
      }
      return;
    }

    // Run tests after the first successful build
    // In watch mode, Vitest will automatically re-run when the dist/ files change
    if (!vitestProcess) {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        if (verbose) {
          log('Debouncing initial test run');
        }
      }

      debounceTimer = setTimeout(() => {
        runTests();
      }, DEBOUNCE_MS);
    }
  }
}

function cleanup() {
  log('Shutting down...');

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  if (vitestProcess) {
    vitestProcess.kill();
    vitestProcess = null;
  }

  if (stencilProcess) {
    stencilProcess.kill();
    stencilProcess = null;
  }

  process.exit(0);
}

// Set up signal handlers for clean shutdown
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Build Stencil arguments
const stencilArgs = ['stencil', 'build'];

// Add --dev by default, unless --prod is explicitly passed
if (args.prod) {
  stencilArgs.push('--prod');
} else {
  stencilArgs.push('--dev');
}

if (args.watch) {
  stencilArgs.push('--watch');
  log('Starting Stencil in watch mode...');

  if (args.serve) {
    stencilArgs.push('--serve');
    if (args.port) {
      stencilArgs.push('--port', args.port);
    }
  }
} else {
  log('Building Stencil...');
}

if (args.debug) {
  stencilArgs.push('--debug');
}

// Add any additional stencil args
stencilArgs.push(...args.stencilArgs);

stencilProcess = spawn('npx', stencilArgs, {
  cwd,
  shell: true,
});

// Pipe stdout and watch for build completion
stencilProcess.stdout?.on('data', handleStencilOutput);
stencilProcess.stderr?.on('data', (data) => {
  process.stderr.write(data);
});

stencilProcess.on('error', (error) => {
  console.error('[stencil-test] Failed to start Stencil:', error);
  process.exit(1);
});

stencilProcess.on('exit', (code) => {
  if (verbose) {
    log(`Stencil exited with code ${code}`);
  }

  // In one-time build mode, stencil exits after build
  // Don't cleanup immediately - let tests finish first
  if (!args.watch) {
    stencilProcess = null;
  } else {
    // In watch mode, stencil shouldn't exit - if it does, something went wrong
    log(`Stencil exited unexpectedly with code ${code}`);
    cleanup();
  }
});

// Watch mode: Vitest handles test file watching automatically
// Stencil handles component file watching automatically
if (args.watch && verbose) {
  log('Watch mode enabled - Vitest will watch test files and Stencil will watch component files');
}
