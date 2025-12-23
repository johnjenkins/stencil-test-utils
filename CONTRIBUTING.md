# Contributing to @johnjenkins/stencil-vitest

Thank you for your interest in contributing! This guide will help you get set up for development.

## Development Setup

### 1. Enable Corepack

Corepack manages package manager versions. Enable it if you haven't already:

```bash
corepack enable
```

This allows the project to use the exact pnpm version specified in `package.json`.

### 2. Clone the Repository

```bash
git clone https://github.com/stenciljs/test-utils.git
cd test-utils
```

### 3. Install Dependencies

```bash
pnpm install
```

This installs all dependencies for the main package and workspaces.

### 4. Build and test

```bash
pnpm build
pnpm test
```

### 5. Run code quality checks

```bash
# Run all quality checks
pnpm quality
```

### 6. Commit your changes

```bash
git add .
git commit -m "feat: add new feature"
```

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Test updates

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
