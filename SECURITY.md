# Security Policy

## Supported Versions

This project is a single-application repository deployed continuously from
`main`. There are no maintained release branches — only the latest commit on
`main` is supported. Security fixes land as regular commits and deploy
automatically via Vercel's git integration.

## Reporting a Vulnerability

If you find a security issue, please report it privately rather than opening
a public GitHub issue:

- Preferred: open a
  [GitHub private security advisory](https://github.com/hirekarl/l2assessment/security/advisories/new)
  on this repository.
- Alternative: contact [Karl Johnson](https://github.com/hirekarl) directly
  through GitHub.

Please include:

- A description of the vulnerability and its potential impact.
- Steps to reproduce (a minimal example is ideal).
- Any suggested remediation, if you have one.

You can expect an initial response within a few days. Confirmed
vulnerabilities will be fixed and disclosed via the repository's commit
history and, for dependency issues, the `CHANGELOG.md`.

## Scope

This app makes server-side calls to the Groq API from a Vercel serverless
function (`api/categorize.js`). The `GROQ_API_KEY` is read from a server-only
environment variable and is never bundled into the client. Reports involving
API key handling, the serverless function, or dependency vulnerabilities
(`npm audit`) are all in scope.

## Track Record

This isn't a purely aspirational policy — dependency vulnerabilities have
been triaged and fixed in this repo before:

- **[GHSA-pm4m-ph32-ghv5](https://github.com/advisories/GHSA-pm4m-ph32-ghv5)**
  (js-yaml ReDoS) — patched via an npm `overrides` entry
  (`942ec05`).
- **[GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2)**
  (React Router CSRF bypass) — fixed by migrating off the unpatched
  `react-router-dom` package onto `react-router` v8 (`ef69d2c`).
- Client-side exposure of the Groq API key was fixed by moving all LLM calls
  into a Vercel serverless function, so the key is never sent to the browser.

See `CHANGELOG.md` for the full history.
