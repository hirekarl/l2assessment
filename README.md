# Customer Inbox Triage App

## Overview

An AI-powered triage tool that classifies incoming customer support messages, assesses urgency, and recommends a routing action — all in a single LLM call. Built for Relay AI, a SaaS customer operations platform.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **AI**: Groq API (Llama 3.3 70B)
- **Runtime**: Browser-based (local development only)

## Setup

### Prerequisites

- Node.js v16+
- npm or yarn
- A free Groq API key from [console.groq.com](https://console.groq.com)

### Installation

```bash
git clone https://github.com/hirekarl/l2assessment.git
cd l2assessment
npm install
```

Create `.env.local` in the project root:

```
VITE_GROQ_API_KEY=gsk_your-actual-key-here
```

Start the dev server:

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## How It Works

A customer message is submitted and analyzed in two steps:

1. **LLM classification** — A structured prompt asks the Llama 3.3 70B model to return a JSON object with `category`, `urgency`, and `reasoning`. Temperature is set to 0.2 for consistent output.
2. **Template routing** — The category and urgency are mapped to a recommended action. High-urgency messages get escalation-specific instructions; the UI surfaces an escalation banner for immediate visibility.

Results are saved to `localStorage` and viewable in the History tab, sorted newest-first.

### Categories

| Category | Description |
|---|---|
| Billing Issue | Payments, charges, invoices, refunds, cancellations |
| Technical Problem | Bugs, errors, outages, slow performance |
| Feature Request | Suggestions for new or improved functionality |
| General Inquiry | How-to questions, account info, general feedback |

### Urgency Levels

| Level | Signals |
|---|---|
| High | Service down, data loss, fraud, words like "ASAP" / "immediately", ALL CAPS frustration |
| Medium | Genuine issue, not an emergency |
| Low | Casual question, positive feedback, future suggestion |

High-urgency messages trigger an escalation banner and receive urgency-specific routing instructions instead of the standard template.

## Improvements Made (Week 2 Assessment)

The original codebase had several bugs that made the triage output unreliable. Below is a summary of what was found and fixed.

### 1. LLM integration was fragile (`llmHelper.js`)

**Before:** No system prompt. The model responded in free text and the app extracted a category by scanning the response for words like "billing" or "technical". Temperature was 0.7, making results inconsistent. Urgency was not assessed by the LLM at all.

**After:** A system prompt defines the four categories, urgency rules, and required JSON output format. The model returns `{ category, urgency, reasoning }` in a single call. Temperature lowered to 0.2. JSON is validated against the allowed value sets before use.

### 2. Urgency scorer had inverted logic (`urgencyScorer.js`)

**Before:** A rule-based heuristic scored messages on a 0–100 scale. ALL CAPS *decreased* urgency by 50 points. Off-hours and weekends also *decreased* urgency. Polite language like "please" deducted 15 points per word. A message like "PLEASE FIX THIS IMMEDIATELY" would score Low.

**After:** Urgency is assessed by the LLM using the context of the full message. The heuristic scorer is no longer used. `urgencyScorer.js` remains in the repo but is not imported.

### 3. Templates had a copy-paste bug and dead logic (`templates.js`)

**Before:** `"Feature Request"` was mapped to `"Ask user to check billing portal."` — an exact copy of the Billing Issue action. `shouldEscalate()` ignored its `category` and `urgency` parameters and returned `true` for any message over 100 characters. `getRecommendedAction()` accepted an `urgency` argument but never used it.

**After:** Each category has a correct, distinct recommended action. High-urgency messages receive escalation-specific overrides. `shouldEscalate()` returns `true` for High urgency, or Medium urgency on a Billing Issue. `getRecommendedAction()` uses urgency to select the right action.

### 4. History sorted alphabetically by message text (`HistoryPage.jsx`)

**Before:** `history.sort((a, b) => a.message.localeCompare(b.message))` — sorted A–Z by message content.

**After:** Sorted newest-first by timestamp: `sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))`.

## Security Note

This app exposes the Groq API key in the browser via `dangerouslyAllowBrowser: true`. This is acceptable for local development only. In production, API calls must be proxied through a backend server so the key is never shipped to the client.

## License

Educational use only.
