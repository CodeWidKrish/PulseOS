/**
 * Splits the explainer's plain-text answer into display parts.
 * The system prompt (api/app/services/ai_service.py) asks for a summary, explanations,
 * a "Questions to Ask Your Doctor" section and a closing disclaimer line.
 */
export interface ParsedExplanation {
  paragraphs: string[];
  questions: string[];
  urgent: boolean;
}

const QUESTION_HEADING = /questions?\s+(to\s+ask|for)\s+(your\s+)?doctor/i;
const LIST_ITEM = /^\s*(?:\d+[.)]|[-*•])\s+/;
const DISCLAIMER = /does not provide medical advice/i;

export function parseExplanation(raw: string): ParsedExplanation {
  const text = raw.replace(/\*\*/g, "").replace(/^#+\s*/gm, "");
  const paragraphs: string[] = [];
  const questions: string[] = [];
  let inQuestions = false;
  let buffer: string[] = [];

  const flush = () => {
    const para = buffer.join(" ").trim();
    if (para && !DISCLAIMER.test(para)) paragraphs.push(para);
    buffer = [];
  };

  for (const line of text.split("\n")) {
    if (QUESTION_HEADING.test(line)) {
      flush();
      inQuestions = true;
      continue;
    }
    if (inQuestions && LIST_ITEM.test(line)) {
      questions.push(line.replace(LIST_ITEM, "").trim());
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    if (inQuestions && questions.length > 0) inQuestions = false;
    buffer.push(line.trim());
  }
  flush();

  // Only the explainer's explicit notice (ai_service.py rule 6) — never a stray "not urgent"
  return { paragraphs, questions, urgent: /urgent\s+care\s+notice/i.test(text) };
}
