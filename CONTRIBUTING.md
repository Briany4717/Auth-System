# Contributing to Identity & Authentication Microservice

First off, thank you for considering contributing to this project! It's people like you that make this authentication system better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Security Vulnerabilities](#security-vulnerabilities)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible using our bug report template.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Create an issue using the feature request template and provide the requested information.

### Your First Code Contribution

Unsure where to begin? You can start by looking through `good-first-issue` and `help-wanted` issues.

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code follows the existing code style
5. Write a clear commit message
6. Issue the pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/auth-system.git
cd auth-system

# Add upstream remote
git remote add upstream https://github.com/Briany4717/auth-system.git

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Follow existing patterns for type definitions
- Prefer interfaces over types for object shapes
- Use strict mode settings

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### File Organization

```text
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middlewares/     # Express middlewares
├── services/        # Business logic
├── routes/          # Route definitions
├── utils/           # Helper functions
└── types/           # TypeScript type definitions
```

### Security Guidelines

- Never commit sensitive data (API keys, passwords, etc.)
- Always validate and sanitize user input
- Use parameterized queries (Prisma handles this)
- Follow OWASP security best practices
- Add security-related comments where applicable

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

### Examples

```text
feat(auth): add 2FA backup codes generation

Implement backup codes that users can use to recover their account
if they lose access to their 2FA device.

Closes #123
```

```text
fix(cors): resolve cache not updating after origin deletion

The CORS cache was not refreshing properly after deleting an origin
through the admin API. This commit ensures the cache is cleared and
rebuilt after any DELETE operation.

Fixes #456
```

## Pull Request Process

1. **Update Documentation**: Ensure README and docs are updated for any changes
2. **Add Tests**: Include tests for new features or bug fixes
3. **Update Changelog**: Add a note in CHANGELOG.md under "Unreleased"
4. **Lint Your Code**: Run `npm run lint` (if available) before committing
5. **Build Succeeds**: Ensure `npm run build` completes without errors
6. **PR Description**: Fill out the PR template completely
7. **Review**: Wait for review and address any feedback

### PR Title Format

Follow the same format as commit messages:

```text
feat(scope): add new feature
fix(scope): resolve bug
docs(scope): update documentation
```

## Security Vulnerabilities

**IMPORTANT**: If you discover a security vulnerability, please do NOT open a public issue.

Instead, email directly to: <brianyan4717@gmail.com>

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work with you to resolve the issue before any public disclosure.

## Issue and PR Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `security`: Security-related issue
- `wontfix`: This will not be worked on
- `duplicate`: This issue or PR already exists

## Development Priorities

Current focus areas:

1. **Security**: Always the top priority
2. **Stability**: Bug fixes for existing features
3. **Performance**: Optimizations and improvements
4. **Features**: New functionality that aligns with the project vision

## Additional Resources

- [Project Documentation](docs/)
- [API Examples](docs/API_EXAMPLES.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Security Best Practices](docs/GETTING_STARTED.md#security)

## Recognition

Contributors will be recognized in:

- The project's README
- Release notes for their contributions
- The contributors list on GitHub

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

---

Thank you for contributing! 🎉

If you have questions, feel free to open a discussion or reach out to [@Briany4717](https://github.com/Briany4717).
