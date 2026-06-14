import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Not recommended for production — API key should live server-side
});

const SYSTEM_PROMPT = `You are a customer support triage assistant for Relay AI, a SaaS customer operations platform.

Analyze the incoming customer support message and classify it. Respond with valid JSON only — no markdown, no extra text.

Use exactly one of these categories:
- "Billing Issue": payments, charges, invoices, subscriptions, refunds, cancellations
- "Technical Problem": bugs, errors, outages, crashes, slow performance, broken features
- "Feature Request": suggestions for new functionality or product improvements
- "General Inquiry": how-to questions, account info, general feedback, compliments

Urgency rules:
- "High": customer is blocked, losing money, or expressing strong frustration. Signals: service is down, data loss, words like "urgent", "ASAP", "immediately", "outage", repeated exclamation marks, writing in ALL CAPS out of anger
- "Low": casual question, positive feedback, or a future improvement suggestion with no immediate impact
- "Medium": everything else — a genuine issue but not an emergency

Respond with this JSON structure:
{
  "category": "<one of the four categories above>",
  "urgency": "<High|Medium|Low>",
  "reasoning": "<1-2 sentences explaining your classification>"
}`;

const VALID_CATEGORIES = ["Billing Issue", "Technical Problem", "Feature Request", "General Inquiry"];
const VALID_URGENCIES = ["High", "Medium", "Low"];

export async function categorizeMessage(message) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    return {
      category: VALID_CATEGORIES.includes(parsed.category) ? parsed.category : "General Inquiry",
      urgency: VALID_URGENCIES.includes(parsed.urgency) ? parsed.urgency : "Medium",
      reasoning: parsed.reasoning || "No reasoning provided."
    };
  } catch (error) {
    console.warn('Groq API failed, using mock response:', error.message);
    return getMockCategorization(message);
  }
}

function getMockCategorization(message) {
  const lower = message.toLowerCase();

  const hasAny = (...terms) => terms.some(t => lower.includes(t));

  if (hasAny('bill', 'payment', 'charge', 'invoice', 'credit card', 'subscription', 'refund', 'cancel')) {
    return {
      category: "Billing Issue",
      urgency: hasAny('urgent', 'asap', 'immediately', 'fraud') ? "High" : "Medium",
      reasoning: "Message contains billing-related keywords such as payments, charges, or account cancellation."
    };
  }

  if (hasAny('bug', 'error', 'broken', 'not working', 'crash', 'down', 'outage', 'slow', 'issue', 'problem')) {
    const isHigh = hasAny('down', 'outage', 'urgent', 'asap', 'immediately') || message.includes('!!')
    return {
      category: "Technical Problem",
      urgency: isHigh ? "High" : "Medium",
      reasoning: "Message describes a technical malfunction or error that is impacting the customer's use of the product."
    };
  }

  if (hasAny('feature', 'improve', 'suggestion', 'wish', 'enhancement', 'would be great', 'would love')) {
    return {
      category: "Feature Request",
      urgency: "Low",
      reasoning: "Customer is requesting a new feature or product improvement rather than reporting an issue."
    };
  }

  return {
    category: "General Inquiry",
    urgency: "Low",
    reasoning: "Message appears to be a general question or inquiry that does not indicate a critical issue."
  };
}
