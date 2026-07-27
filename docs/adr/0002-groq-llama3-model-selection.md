# 2. Groq Llama 3.3 70B Model Selection

- **Status**: Accepted
- **Date**: 2026-07-26

## Context

Customer message triage demands low latency classification with high reasoning accuracy to route high-urgency outages instantly without bottlenecks.

## Decision

We select `llama-3.3-70b-versatile` on the Groq API provider platform.

- **Low Latency**: Groq LPU inference processes classification requests in under ~300ms.
- **JSON Mode**: Forced `response_format: { type: 'json_object' }` guarantees structured category, urgency, and reasoning attributes.
- **Temperature Setting**: Set to `0.2` to minimize stochastic variance across repeated triage requests.
- **Graceful Fallbacks**: If the Groq API experiences rate limits or network issues, the application degrades to a local keyword-based mock categorization without breaking user workflows. A response that fails to parse or validate is retried once against Groq before falling back — API-level failures (auth, rate limit, network, missing key) fall back immediately without a retry.

## Consequences

- Fast classification response times for end users.
- Deterministic, machine-readable JSON structure for client rendering.
