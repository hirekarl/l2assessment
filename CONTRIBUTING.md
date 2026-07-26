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

## Using Claude Code on This Repo

`.claude/settings.json` and `.claude/hooks/` (see also `CLAUDE.md`) wire up
Claude Code-specific automation on top of the git hooks above:

- JS/JSX and Markdown files are auto-formatted immediately after Claude
  writes or edits them (the same eslint/markdownlint + prettier pipeline as
  `lint-staged`), not just at commit time.
- A `Stop` hook runs `lint` + `test:coverage` before Claude can end a turn
  in which `src`/`shared`/`api` changed, and blocks with the failure output
  if either fails.
- `git push --force` (without `--force-with-lease`) and `git reset --hard`
  require explicit confirmation.
- Writing a new `src/**/*.{js,jsx}` file without a sibling `*.test.*` file
  triggers a reminder, given the 100% coverage requirement above.

These only affect Claude Code sessions — they don't change the human
workflow described above, and none of them replace the Husky/CI gates.

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
