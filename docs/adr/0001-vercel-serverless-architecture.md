# 1. Vercel Serverless Function Architecture

- **Status**: Accepted
- **Date**: 2026-07-26

## Context

The customer inbox triage application requires an AI service integration (Groq API) to classify support messages. Storing API keys directly in client-side code exposes sensitive credentials to browser inspection.

## Decision

We adopt a Vercel Serverless Function architecture located at `api/categorize.ts`.

- The Groq API key is held exclusively in server environment variables (`GROQ_API_KEY`).
- The browser submits POST requests to `/api/categorize`.
- Serverless handlers attach security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) and validate requests using Zod schemas.

## Consequences

- Keeps third-party API credentials completely secure.
- Provides server-side request sanitization and fallback error handling.
- Enables single-command deployment via Vercel CLI (`vercel dev` / `vercel deploy`).
