const actionTemplates = {
  "Billing Issue": "Review the customer's billing history and recent charges. If there's an error, issue a correction or connect them with the billing team.",
  "Technical Problem": "Reproduce the reported issue and check error logs. If confirmed, escalate to engineering with steps to reproduce.",
  "General Inquiry": "Respond with the relevant FAQ or documentation link. If no article covers it, draft a direct answer.",
  "Feature Request": "Log the request in the product feedback tracker and send the customer an acknowledgment.",
  "Unknown": "Review manually — the message could not be automatically classified."
}

const urgentOverrides = {
  "Billing Issue": "ESCALATE immediately to the billing team — customer may be experiencing a fraudulent charge or unexpected service disruption.",
  "Technical Problem": "ESCALATE to on-call engineering — customer reports a critical outage or data loss.",
  "General Inquiry": "Prioritize response — customer has indicated urgency despite this being a general question.",
  "Feature Request": "Acknowledge urgency and log as high-priority product feedback.",
  "Unknown": "ESCALATE for manual triage — high urgency but unclassified message."
}

export function getRecommendedAction(category, urgency) {
  if (urgency === "High") {
    return urgentOverrides[category] || urgentOverrides["Unknown"];
  }
  return actionTemplates[category] || "No recommendation available.";
}

export function getAvailableCategories() {
  return Object.keys(actionTemplates);
}

export function shouldEscalate(category, urgency, message) {
  if (urgency === "High") return true;
  if (urgency === "Medium" && category === "Billing Issue") return true;
  return false;
}
