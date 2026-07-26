# Contributing

Thanks for your interest in this project. This is primarily a solo/portfolio
codebase, but it follows a real contribution workflow so it's easy to pick up
and safe to change.

## Local Setup

See the [README's Setup section](README.md#setup) for prerequisites,
installation, and how to run the app locally (`npm run dev:full`).

## Workflow

1. Create a branch off `main` for your change.
2. Make your change, with tests. This repo maintains 100% statement/branch/
   function/line coverage (enforced by `vite.config.js`'s coverage
   thresholds) — new code needs new tests, not just passing existing ones.
3. Before opening a PR, run:

   ```bash
   npm run lint
   npm run format:check
   npm test
   npm run test:e2e   # if your change touches routing, UI flows, or a11y
   ```

   A Husky pre-commit hook already runs `lint-staged` (ESLint + Prettier on
   staged JS/JSX, Prettier on JSON/CSS, markdownlint + Prettier on Markdown)
   automatically on `git commit`, so most formatting/lint issues are caught
   before you even open a PR. A `commit-msg` hook also runs, rejecting any
   commit whose message contains a `Co-Authored-By` trailer naming an AI
   coding assistant (see [Commit Messages](#commit-messages) below).

4. Open a PR against `main`. CI runs lint, the full test suite with coverage,
   a production build, and the Playwright E2E + accessibility suite — all
   must pass before merge.

## Commit Messages

This repo follows [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<optional scope>): <summary>
```

Common types used here: `feat`, `fix`, `docs`, `test`, `refactor`, `style`,
`ci`, `chore`. Examples from the project history:

```text
fix: migrate from react-router-dom to react-router v8
feat(theme): add light/dark mode toggle
test: add Vitest + RTL suite at 100% coverage
```

Commits should not carry a `Co-Authored-By` trailer for an AI coding
assistant (Claude, Copilot, ChatGPT, etc.) — a `commit-msg` hook
(`.husky/commit-msg`) rejects these automatically.

## Reporting Bugs or Security Issues

- Functional bugs: open a GitHub issue with steps to reproduce.
- Security vulnerabilities: do **not** open a public issue — see
  [SECURITY.md](SECURITY.md) for how to report privately.

## Code of Conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). Participation
implies agreement to its terms.
