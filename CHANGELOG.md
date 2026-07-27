# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project does not follow semantic version tags (it's a continuously deployed single application, not a versioned package) — entries are grouped by work session instead.

## [1.2.0](https://github.com/hirekarl/l2assessment/compare/v1.1.0...v1.2.0) (2026-07-27)


### Features

* **api:** retry once on malformed Groq responses, refine classification prompt ([509b6a6](https://github.com/hirekarl/l2assessment/commit/509b6a689738ec5a9fd2d94ccfd7c77b92e83a11))
* **api:** retry once on malformed Groq responses, refine classification prompt ([c03a2ce](https://github.com/hirekarl/l2assessment/commit/c03a2cee8b23c3a148f2acadbc576418e2734bd1))


### Bug Fixes

* **api:** harden prompt injection defense with explicit message delimiters ([7053a9a](https://github.com/hirekarl/l2assessment/commit/7053a9a681edab303b7ed74a8ad43780e3c1bf61))
* **api:** report "Invalid response format" for TypeError/ZodError too ([711a632](https://github.com/hirekarl/l2assessment/commit/711a6321867a8642070a4bfae1b46d752cca579f))

## [1.1.0](https://github.com/hirekarl/l2assessment/compare/v1.0.0...v1.1.0) (2026-07-27)


### Features

* **ci:** gate Vercel production deploy on CI + restrict to main pushes ([#8](https://github.com/hirekarl/l2assessment/issues/8)) ([58fbc47](https://github.com/hirekarl/l2assessment/commit/58fbc47267a38ae83a235c156e14b9362dd4c0ae))

## 1.0.0 (2026-07-27)

### Features

- add GitHub issue and PR templates ([035632e](https://github.com/hirekarl/l2assessment/commit/035632e0a1b2d1f4e69dbce2be63fe37b6b07c30))
- **api:** move Groq categorization to a Vercel serverless function ([2600a6f](https://github.com/hirekarl/l2assessment/commit/2600a6ff6360c7444e44d1ea90558da397004947))
- **brand:** replace default Vite favicon with the header's brand mark ([db5dfa4](https://github.com/hirekarl/l2assessment/commit/db5dfa40c9ed0d84992c5fd37134c76301d26d40))
- complete enterprise excellence overhaul ([4d7c3af](https://github.com/hirekarl/l2assessment/commit/4d7c3afbc046473a0d8f3e195d8a07eb18ebdcae))
- **theme:** add light/dark mode toggle ([b3be30c](https://github.com/hirekarl/l2assessment/commit/b3be30ca9ba239c91ce2d912cb2648ec25c3a354))
- **triage:** surface AI-analyzed vs fallback-mode source in results ([8871160](https://github.com/hirekarl/l2assessment/commit/8871160d0148a3ab23d45be6fe4270decacff1ee))

### Bug Fixes

- **a11y:** add a main landmark and resolve color-contrast failures ([46b82bd](https://github.com/hirekarl/l2assessment/commit/46b82bddfd48aa4b799452ec1c2e761f7553e73b))
- **a11y:** upgrade text color contrast to satisfy WCAG AA standards ([867fca7](https://github.com/hirekarl/l2assessment/commit/867fca72e2263eba629ff0c7bf1a3869c2160bf6))
- **ci:** resolve coverage, browser install, and e2e race-condition failures ([#6](https://github.com/hirekarl/l2assessment/issues/6)) ([31106bf](https://github.com/hirekarl/l2assessment/commit/31106bff43bf2202f270c7fe635dd73fdafad404))
- **deploy:** rewrite client routes to index.html on Vercel ([3bd3460](https://github.com/hirekarl/l2assessment/commit/3bd346030f0a537eaa4ae10ac8c748eb431f11f0))
- **e2e:** generate an HTML Playwright report in CI ([8728345](https://github.com/hirekarl/l2assessment/commit/87283452b6d28f6a385ee1fa9cd6822d5a2cdd6c))
- **home:** compute dashboard stats at render time instead of in an effect ([ddc64fa](https://github.com/hirekarl/l2assessment/commit/ddc64fa2e24c3f89c9f87a6ec907c57a57f0e37c))
- **lint-staged:** include .jsonc in the JSON/CSS glob ([6c0c523](https://github.com/hirekarl/l2assessment/commit/6c0c523d4358fb8476c88714611d770b2bafed06))
- **llm:** lazily initialize Groq client and classify fallback reasons ([58fa2b4](https://github.com/hirekarl/l2assessment/commit/58fa2b41c865d6c81091d94460de63738aa14417))
- migrate from react-router-dom to react-router v8 ([bd8ce5c](https://github.com/hirekarl/l2assessment/commit/bd8ce5cd9db7bff388c3d80080ef7a9afa080c52))
- override js-yaml to patched 5.2.2 (ReDoS) ([29e2ca3](https://github.com/hirekarl/l2assessment/commit/29e2ca345eac6a15b426fbff5c1355dc472941fb))

## 2026-07-27 — AI Response Reliability & Prompt Hardening

### Added

- A bounded retry (one re-ask) in [api/categorize.ts](file:///D:/dev/pursuit/l2/l2assessment/api/categorize.ts) when the Groq response fails to parse or validate (`SyntaxError` / `TypeError` / `ZodError`), before falling back to the local mock. Groq API-level failures (auth, rate limit, network, missing key) are still not retried.

### Changed

- `SYSTEM_PROMPT` ([shared/categorization.ts](file:///D:/dev/pursuit/l2/l2assessment/shared/categorization.ts)): lists `reasoning` before `category`/`urgency` in the required JSON shape so the model reasons before committing, hardened against prompt injection via the customer message, and added guidance for messages that plausibly span two categories.

## 2026-07-26 — CI-Gated Production Deployments

### Changed

- Disabled Vercel's git-integration auto-deploys (`git.deploymentEnabled: false` in [vercel.json](file:///D:/dev/pursuit/l2/l2assessment/vercel.json)) and added a `deploy` job to [.github/workflows/ci.yml](file:///D:/dev/pursuit/l2/l2assessment/.github/workflows/ci.yml), gated on the `lint-test-build` and `e2e` jobs passing and restricted to pushes on `main` — production now only deploys from a fully green `main` build, never a PR or a failing run.

## 2026-07-26 — Enterprise Excellence Overhaul

### Added

- `ErrorBoundary` component ([src/components/shared/ErrorBoundary.tsx](file:///D:/dev/pursuit/l2/l2assessment/src/components/shared/ErrorBoundary.tsx)) and unit tests for application crash resilience.
- `Zod` runtime schema validation (`CategorizationResultSchema`) in [shared/categorization.ts](file:///D:/dev/pursuit/l2/l2assessment/shared/categorization.ts) and [api/categorize.ts](file:///D:/dev/pursuit/l2/l2assessment/api/categorize.ts).
- HTTP Security Headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) in [api/categorize.ts](file:///D:/dev/pursuit/l2/l2assessment/api/categorize.ts) and [vercel.json](file:///D:/dev/pursuit/l2/l2assessment/vercel.json).
- TypeScript path aliases (`@/*` -> `./src/*`, `@shared/*` -> `./shared/*`) in [tsconfig.json](file:///D:/dev/pursuit/l2/l2assessment/tsconfig.json) and [vite.config.js](file:///D:/dev/pursuit/l2/l2assessment/vite.config.js).
- Playwright multi-browser test matrix (`chromium`, `firefox`, `webkit`) and visual snapshot regression tests in [e2e/visual.spec.js](file:///D:/dev/pursuit/l2/l2assessment/e2e/visual.spec.js).
- Commitlint configuration (`.commitlintrc.json`) for Conventional Commits enforcement.
- Release Please GitHub Actions workflow (`.github/workflows/release-please.yml`).
- Architecture Decision Records in `docs/adr/` (`0001-vercel-serverless-architecture.md`, `0002-groq-llama3-model-selection.md`, `0003-component-design-and-accessibility.md`).

### Changed

- Updated [src/App.tsx](file:///D:/dev/pursuit/l2/l2assessment/src/App.tsx) with route-based code splitting using `React.lazy` and `Suspense`.

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
