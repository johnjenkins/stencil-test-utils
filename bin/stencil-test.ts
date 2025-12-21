#!/usr/bin/env node

import { spawn, type ChildProcess } from 'child_process';
import { watch as fsWatch, type FSWatcher } from 'fs';
import { join, relative } from 'path';
import { createJiti } from 'jiti';
import micromatch from 'micromatch';

/**
 * stencil-test - A wrapper that integrates Stencil build with Vitest testing.
 * 
 * Default behavior (no flags):
 *   - Builds Stencil in production mode
 *   - Runs Vitest tests once
 * 
 * Watch mode (--watch):
 *   - Runs Stencil build in watch mode
 *   - Automatically runs tests after each successful build
 *   - Watches test files and re-runs specific tests on change
 * 
 * Usage:
 *   stencil-test [options] [testPathPattern]
 * 
 * Stencil options:
 *   --watch          Run in watch mode
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

Default (no flags): Build Stencil once and run tests once
Watch mode: Build Stencil in watch mode and auto-run tests

Stencil Options:
  --watch              Run Stencil in watch mode
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
let testFileWatcher: FSWatcher | null = null;
let buildCount = 0;
let lastChangedFile: string | null = null;
let lastChangeTime = 0;
let isRunningTests = false;

const DEBOUNCE_MS = 500;
const cwd = process.cwd();
const verbose = args.verbose;

function log(message: string) {
  console.log(`[stencil-test] ${message}`);
}

/**
 * Runs Vitest tests with the configured arguments
 * @param testFile - Optional path to a specific test file to run
 */
function runTests(testFile?: string) {
  // Prevent overlapping test runs
  if (isRunningTests) {
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
    if (testFile) {
      log(`Running tests for ${testFile} (build #${buildCount})...`);
    } else {
      log(`Running tests (build #${buildCount})...`);
    }
  } else {
    log('Running tests...');
  }

  // Always run tests in 'run' mode (even in watch mode)
  // In watch mode, we re-run tests after each Stencil build
  // Ensure --watch is not passed to vitest (we control when to re-run)
  const filteredVitestArgs = args.vitestArgs.filter(arg => 
    arg !== '--watch' && arg !== '-w'
  );
  const commandArgs = ['vitest', 'run', ...filteredVitestArgs].filter(Boolean);
  
  // Add specific test file if provided (overrides any path patterns in vitestArgs)
  if (testFile) {
    commandArgs.push(testFile);
  }

  if (verbose) {
    log(`Command: npx ${commandArgs.join(' ')}`);
  }

  vitestProcess = spawn('npx', commandArgs, {
    cwd,
    stdio: 'inherit',
    shell: true,
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
  // Stencil outputs build finish with a timestamp like "[12:34.5]  build finished"
  if (output.includes('build finished')) {
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

    // Run tests after each Stencil build
    // In watch mode, we run tests in 'run' mode (not watch) after each build
    // This ensures tests are re-run when components change
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      if (verbose) {
        log('Debouncing test run (clearing previous timer)');
      }
    }

    debounceTimer = setTimeout(() => {
      runTests();
    }, DEBOUNCE_MS);
  }
  
  // Detect what files Stencil is watching/rebuilding for
  if (verbose && output.includes('file updated')) {
    process.stdout.write('[stencil-test] File update detected by Stencil\n');
  }
}

function cleanup() {
  log('Shutting down...');

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  if (testFileWatcher) {
    testFileWatcher.close();
    testFileWatcher = null;
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
  stencilArgs.push('--prod');
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

// Load Vitest config to get test file patterns
async function loadVitestConfig() {
  const jiti = createJiti(import.meta.url, { interopDefault: true });
  
  // Try to load vitest config
  const configPaths = [
    join(cwd, 'vitest.config.ts'),
    join(cwd, 'vitest.config.js'),
    join(cwd, 'vitest.config.mts'),
    join(cwd, 'vitest.config.mjs'),
    join(cwd, 'vite.config.ts'),
    join(cwd, 'vite.config.js'),
  ];

  for (const configPath of configPaths) {
    try {
      const config = await jiti.import(configPath, { default: true }) as any;
      const vitestConfig = config?.default || config;
      
      // Collect all include patterns from all projects
      const includePatterns = new Set<string>();
      
      // Check if config has projects
      if (vitestConfig?.test?.projects && Array.isArray(vitestConfig.test.projects)) {
        for (const project of vitestConfig.test.projects) {
          const projectInclude = project?.test?.include;
          if (projectInclude && Array.isArray(projectInclude)) {
            projectInclude.forEach(pattern => includePatterns.add(pattern));
          }
        }
      } else {
        // Single test config (no projects)
        const include = vitestConfig?.test?.include;
        if (include && Array.isArray(include)) {
          include.forEach(pattern => includePatterns.add(pattern));
        }
      }
      
      if (includePatterns.size > 0) {
        const patterns = Array.from(includePatterns);
        if (verbose) {
          log(`Loaded test patterns from ${configPath}:`);
          patterns.forEach(p => log(`  - ${p}`));
        }
        return patterns;
      }
    } catch (err) {
      // Config file doesn't exist or can't be loaded, try next
      continue;
    }
  }

  // Fallback to Vitest defaults
  const defaults = [
    '**/*.{test,spec}.?(c|m)[jt]s?(x)',
  ];
  
  if (verbose) {
    log(`Using default Vitest patterns: ${defaults.join(', ')}`);
  }
  
  return defaults;
}

// Watch test files for changes using patterns from Vitest config (only in watch mode)
if (args.watch) {
  loadVitestConfig().then((testPatterns) => {
    try {
      if (verbose) {
        log(`Setting up test file watcher with cwd: ${cwd}`);
        log(`Patterns: ${testPatterns.join(', ')}`);
      }

      // Watch src directory recursively with native fs.watch
      const srcDir = join(cwd, 'src');
      testFileWatcher = fsWatch(srcDir, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        
        const relPath = relative(cwd, join(srcDir, filename));
        
        // Check if file matches any of the test patterns
        if (micromatch.isMatch(relPath, testPatterns)) {
          const now = Date.now();
          
          // Suppress duplicate logs for the same file within 100ms (atomic write threshold)
          const shouldLog = lastChangedFile !== relPath || now - lastChangeTime > 100;
          
          if (shouldLog) {
            log(`Test file changed: ${relPath}`);
          }
          
          lastChangedFile = relPath;
          lastChangeTime = now;
          
          // Debounce test execution
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }

          debounceTimer = setTimeout(() => {
            runTests(relPath);
          }, DEBOUNCE_MS);
        }
      });

      if (verbose) {
        log(`Watching test files in ${srcDir}`);
      }
    } catch (error) {
      console.error('[stencil-test] Warning: Could not watch test files:', error);
    }
  }).catch((error) => {
    console.error('[stencil-test] Warning: Could not load Vitest config:', error);
  });
}

