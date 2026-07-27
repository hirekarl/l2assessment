# 3. Component Design & WCAG 2 AA Accessibility

- **Status**: Accepted
- **Date**: 2026-07-26

## Context

A professional enterprise operations tool must be accessible to all users, including those relying on screen readers, keyboard navigation, or high-contrast visual modes.

## Decision

We enforce strict accessibility and component design standards:

- **Automated Axe-Core Audits**: Automated `@axe-core/playwright` tests in the E2E suite verify zero WCAG 2 AA violations across all routes.
- **Color Contrast Enforcement**: Text styles strictly maintain > 4.5:1 contrast ratio in light and dark modes.
- **Keyboard Navigation**: Interactive elements retain focus rings and ARIA roles (`role="alert"`, `aria-label`).
- **Resilient UI Shell**: Class-based React `ErrorBoundary` wraps page routes to prevent unhandled render crashes.

## Consequences

- Guaranteed compliance with accessibility standards (WCAG 2 AA).
- Inclusive user experience across desktop and assistive devices.
