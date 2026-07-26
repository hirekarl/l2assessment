import Groq from 'groq-sdk';
import { SYSTEM_PROMPT, VALID_CATEGORIES, VALID_URGENCIES, getMockCategorization } from '../shared/categorization.js';

/** Thrown when GROQ_API_KEY is not configured in the server environment. */
class MissingApiKeyError extends Error {}

let groqClient = null;

/** Lazily constructs (and memoizes) the server-side Groq client. */
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new MissingApiKeyError('GROQ_API_KEY is not set');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

/**
 * Maps a caught error to a short, user-safe reason string.
 * @param {unknown} error
 * @returns {string}
 */
function classifyMockReason(error) {
  if (error instanceof MissingApiKeyError) return 'Missing API key';
  if (error instanceof Groq.AuthenticationError) return 'Invalid API key';
  if (error instanceof Groq.RateLimitError) return 'Rate limit exceeded';
  if (error instanceof Groq.APIConnectionError) return 'Network error';
  if (error instanceof Groq.APIError) return 'AI service error';
  if (error instanceof SyntaxError) return 'Invalid response format';
  return 'Unknown error';
}

/**
 * Vercel serverless function: POST { message } -> triage classification.
 * Holds the Groq API key server-side so it is never exposed to the browser.
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message } = req.body ?? {};
  if (typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  try {
    const client = getGroqClient();
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    res.status(200).json({
      category: VALID_CATEGORIES.includes(parsed.category) ? parsed.category : "General Inquiry",
      urgency: VALID_URGENCIES.includes(parsed.urgency) ? parsed.urgency : "Medium",
      reasoning: parsed.reasoning || "No reasoning provided.",
      source: "llm"
    });
  } catch (error) {
    const mockReason = classifyMockReason(error);
    console.warn(`Groq API failed (${mockReason}), using mock response:`, error);
    res.status(200).json({ ...getMockCategorization(message), source: "mock", mockReason });
  }
}
