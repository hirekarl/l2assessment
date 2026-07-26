# CLAUDE.md

Customer Inbox Triage — React 19 + TypeScript + Vite SPA with a Vercel serverless function (`api/categorize.ts`) calling Groq (Llama 3.3 70B) to classify support messages. See README.md for the full architecture and feature writeup.

## Commands

- `npm run dev:full` — frontend + `/api/categorize` via `vercel dev` (needs `GROQ_API_KEY` in `.env.local`). Plain `npm run dev` skips the API route and falls back to a local mock.
- `npm run typecheck` — TypeScript type checking (`tsc --noEmit`)
- `npm run lint` / `npm run format` / `npm run format:check`
- `npm test` / `npm run test:coverage` / `npm run test:e2e`
- `npm run build` / `npm run docs` (TypeDoc → `docs/api`, gitignored)

## Hard requirements

- **100% statement/branch/function/line coverage**, enforced by `coverage.thresholds` in `vite.config.js`. New source code needs new tests, not just passing existing ones.
- **Conventional Commits** (`type(scope): summary`), matching existing git history.
- **No AI co-author trailers in commits.** `.husky/commit-msg` rejects any `Co-Authored-By` line naming a known AI coding assistant. Do not bypass with `--no-verify`.
- License is **MIT** (not the original CC BY-NC 4.0 — relicensed 2026-07).

## Dependency conflicts

When a new devDependency's declared peer range doesn't cover the installed tool version (has happened with `eslint-plugin-jsx-a11y` vs. ESLint 10): prefer an npm `overrides` peer-pin — `"overrides": { "pkg": { "peerDep": "$peerDep" } }` — over `--legacy-peer-deps` or `--force`. The latter silently breaks `npm ci` in CI (which has no override flags), since it re-resolves from the lockfile under strict peer rules. After any `overrides` change: `rm -rf node_modules && npm ci` (not just `npm install`) to confirm CI's exact install path still succeeds, and `npm audit` to confirm zero vulnerabilities.

## Deployment

Vercel, via git integration on push to `main` (no deploy step in `.github/workflows/ci.yml`). `GROQ_API_KEY` lives in Vercel's server-only env vars — CI never exercises the real Groq call path (tests use the mock fallback), so a bad key there won't be caught by CI.
