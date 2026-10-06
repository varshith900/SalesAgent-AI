import { stripMarkdown } from "@/components/MarkdownRenderer";

export function parseEmailDraft(content: string) {
  const clean = stripMarkdown(content);
  const match = clean.match(/^\s*Subject:\s*(.+)$/im);
  return {
    subject: match?.[1]?.trim() || "Follow-up from SalesAgent AI",
    body: clean.replace(/^\s*Subject:\s*.+(?:\r?\n)?/im, "").trim(),
  };
}