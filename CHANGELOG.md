# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project does not follow semantic version tags (it's a continuously deployed single application, not a versioned package) — entries are grouped by work session instead.

## 2026-07-26 — React TypeScript & TypeDoc Migration

### Added

- `tsconfig.json` configuring TypeScript (ES2022 target, bundler module resolution, `react-jsx`, strict checking).
- `typedoc.json` configuring TypeDoc entry points and static HTML documentation generation into `docs/api`.
- `src/types/triage.ts` declaring core domain models (`Category`, `Urgency`, `SourceType`, `MockReason`, `CategorizationResult`, `TriageResult`, `TriageHistoryItem`, `DashboardStats`).
- `"typecheck"` script (`tsc --noEmit`) to validate type safety.

### Changed

- Refactored entire React SPA (`src/`), shared logic ([shared/categorization.ts](file:///D:/dev/pursuit/l2/l2assessment/shared/categorization.ts)), and Vercel serverless API route ([api/categorize.ts](file:///D:/dev/pursuit/l2/l2assessment/api/categorize.ts)) from JavaScript (`.js`/`.jsx`) to React TypeScript (`.ts`/`.tsx`).
- Migrated documentation generation from `jsdoc` to **TypeDoc** (`npm run docs`), preserving existing JSDoc comment blocks.
- Integrated `typescript-eslint` flat configs into [eslint.config.js](file:///D:/dev/pursuit/l2/l2assessment/eslint.config.js).
- Updated Claude Code hooks ([.claude/hooks/format-js.sh](file:///D:/dev/pursuit/l2/l2assessment/.claude/hooks/format-js.sh), [.claude/hooks/missing-test-file.sh](file:///D:/dev/pursuit/l2/l2assessment/.claude/hooks/missing-test-file.sh), [.claude/hooks/stop-gate.sh](file:///D:/dev/pursuit/l2/l2assessment/.claude/hooks/stop-gate.sh)) to support `.ts`/`.tsx` files and include `typecheck` in turn completion gates.

## 2026-07-26 — Repo Hygiene & Claude Code Tooling

### Added

- `.husky/commit-msg` hook rejecting any commit whose message contains a `Co-Authored-By` trailer naming a known AI coding assistant.
- `CLAUDE.md` documenting repo conventions (coverage bar, commit conventions, the dependency-override pattern, deployment) for Claude Code sessions.
- Claude Code hooks (`.claude/settings.json`, `.claude/hooks/`): auto-format JS/JSX and Markdown after Write/Edit (mirrors the lint-staged pipeline — eslint --fix + prettier, markdownlint-cli2 --fix + prettier), a Stop hook gating turn completion on lint + 100% coverage when source files changed, a confirmation guard on `git push --force` / `git reset --hard`, and a reminder when a new source file has no sibling test file.

### Changed

- Rewrote and force-pushed one already-published commit to strip an AI co-author trailer that predated this session's sanitization.

## 2026-07-26 — Professional-Repo Polish

### Added

- `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`.
- `.editorconfig` for consistent editor settings across contributors.
- `eslint-plugin-jsx-a11y` for lint-time accessibility checks (previously only caught at E2E/runtime via axe-core).
- Coverage thresholds in `vite.config.js` so `test:coverage` fails CI if coverage regresses below 100%, instead of only reporting it.

### Changed

- Relicensed from CC BY-NC 4.0 to MIT.

### Removed

- Local-only assessment-submission artifacts (`BUSINESS_VALUE.md`, `SESSION_TRANSCRIPT.md`, `VIDEO_SCRIPT.md`) and their `.gitignore` entries.

## 2026-07-26 — Dependency & Security Maintenance

A pass through the open Dependabot backlog and two high-severity `npm audit` findings.

### Fixed

- **Security:** js-yaml ReDoS ([GHSA-pm4m-ph32-ghv5](https://github.com/advisories/GHSA-pm4m-ph32-ghv5)) — forced resolution to patched `5.2.2` via an npm `overrides` entry.
- **Security:** React Router CSRF bypass ([GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2)) — migrated off the unpatched `react-router-dom` onto `react-router` v8 directly.

### Changed

- Migrated Tailwind CSS 3 → 4 (`@tailwindcss/postcss`, CSS-based config) to unblock a grouped Dependabot npm PR that bundled the breaking change with 13 unrelated safe updates.
- Merged four GitHub Actions major-version bumps (`actions/checkout`, `actions/setup-node`, `actions/upload-artifact`, `codecov/codecov-action`).
- Split `.github/dependabot.yml`'s npm group so only minor/patch updates are bundled going forward; major bumps get their own individually reviewable PR.

`npm audit` reports zero vulnerabilities as of this pass.

## 2026-07-26 — Week 8: Production Hardening

Focused on the biggest remaining trust gap (a silent AI failure mode) and hardening the app toward production-grade.

### Added

- Source transparency: every triage result now reports whether it came from the LLM or the mock fallback, plus a `mockReason` (missing/invalid API key, rate limit, network error, AI service error, invalid response format). The Analyze page shows an "AI-analyzed" or "Fallback Mode" banner; History and Dashboard surface fallback-sourced results too.
- Vitest + React Testing Library suite at 100% statement/branch/function/line coverage.
- Playwright E2E suite: navigation, the analyze → history flow, dark mode, and an axe-core accessibility scan on every route.
- CI (GitHub Actions): lint, test with coverage, build, and E2E on every push/PR. Codecov coverage reporting and badge.
- Dark mode toggle (system-preference default, persisted).
- Dependabot configuration for npm and GitHub Actions.
- Prettier + markdownlint, wired into a Husky pre-commit hook via lint-staged.
- JSDoc comments across hooks, components, pages, and utilities, plus `npm run docs` to generate a browsable static HTML API reference.

### Fixed

- **Security:** the Groq API key was shipped to the browser via `dangerouslyAllowBrowser: true`. Moved all Groq calls to a Vercel serverless function (`api/categorize.js`); the key is now read from a server-only env var and never bundled into the client.
- The Groq client was constructed at module scope, so a missing API key crashed the app on load instead of degrading gracefully — fixed by lazily constructing the client inside the try block.
- Missing `<main>` landmark and several WCAG AA color-contrast failures, found by the new axe-core E2E scan.

### Changed

- Refactored `AnalyzePage`, `HistoryPage`, and `DashboardPage` to follow single-responsibility: extracted `useTriageHistory`, `useAnalyzeMessage`, `useDashboardStats` hooks and presentational components per page.

## 2026-06-14 — Week 2: Bug Fixes

The original assessment codebase had several bugs that made triage output unreliable.

### Fixed

- **LLM integration was fragile:** no system prompt (category extracted by scanning free text for keywords), temperature 0.7 (inconsistent results), and urgency was never assessed by the LLM. Added a system prompt defining categories, urgency rules, and a required JSON output format; lowered temperature to 0.2; validated JSON against allowed value sets.
- **Urgency scorer had inverted logic:** ALL CAPS, off-hours, and weekends all _decreased_ the computed urgency score, and polite language like "please" deducted points per occurrence — so "PLEASE FIX THIS IMMEDIATELY" scored Low. Urgency assessment moved to the LLM, using full message context; the heuristic scorer is kept in the repo (with tests documenting its buggy behavior) but is no longer used.
- **Templates had a copy-paste bug and dead logic:** "Feature Request" was mapped to the Billing Issue action text; `shouldEscalate()` ignored its arguments and escalated any message over 100 characters; `getRecommendedAction()` accepted but never used its `urgency` argument. Each category now has a correct, distinct action; escalation is driven by category and urgency.
- **History sorted alphabetically by message text** instead of by recency. Now sorted newest-first by timestamp.

## 2026-01-27 — Initial Commit

- Initial Customer Inbox Triage webapp for the L2 assessment.
