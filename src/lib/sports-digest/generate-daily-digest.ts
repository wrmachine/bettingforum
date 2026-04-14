import Anthropic from "@anthropic-ai/sdk";
import type { AiBotProfileWithUser } from "@/lib/ai-bots";
import type { SportDigestEntry } from "@/lib/sports-digest/registry";

const DIGEST_GUARDRAILS = `Do not give financial or legal advice. Do not guarantee wins or returns. Picks are informational and for entertainment. Use web search for today's schedule, injuries, and recent form. Odds API integration is not wired yet—describe lines qualitatively if you cannot quote exact numbers, and say numbers may vary by book.`;

export type DigestJson = {
  title: string;
  excerpt: string;
  primaryIdea: string;
  primaryRationale: string[];
  contrarianIdea: string;
  contrarianRationale: string[];
  disclaimer: string;
};

function jsonToHtml(j: DigestJson): string {
  const primaryList = j.primaryRationale
    .map((x) => `<li>${escapeHtml(x)}</li>`)
    .join("");
  const contraList = j.contrarianRationale
    .map((x) => `<li>${escapeHtml(x)}</li>`)
    .join("");
  return `
<section>
  <h2 class="text-lg font-semibold text-slate-900">Solid look</h2>
  <p>${escapeHtml(j.primaryIdea)}</p>
  <ul class="list-inside list-disc">${primaryList}</ul>
</section>
<section class="mt-4">
  <h2 class="text-lg font-semibold text-slate-900">Contrarian / longshot angle</h2>
  <p>${escapeHtml(j.contrarianIdea)}</p>
  <ul class="list-inside list-disc">${contraList}</ul>
</section>
<p class="mt-4 text-sm text-slate-600">${escapeHtml(j.disclaimer)}</p>
`.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function generateSportDailyDigest(
  profile: AiBotProfileWithUser,
  entry: SportDigestEntry,
  dateLabel: string
): Promise<{ title: string; excerpt: string; bodyHtml: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const userMessage = `You are writing ONE forum thread for "${entry.displayName}" (${entry.forumSlug}) for ${dateLabel} (UTC).

Use web search to find today's or tonight's relevant matches, games, or events (as appropriate for this sport): lineups or starters where relevant, injuries, recent form, and key storylines.

Output **only valid JSON** (no markdown fences) with this exact shape:
{
  "title": "Engaging thread title including date or slate",
  "excerpt": "One line teaser",
  "primaryIdea": "The main lean in one or two sentences naming teams",
  "primaryRationale": ["bullet stat or angle", "bullet", "bullet"],
  "contrarianIdea": "A higher-variance or buy-low angle on a different side/market",
  "contrarianRationale": ["bullet", "bullet"],
  "disclaimer": "Short line that these are opinions, not guarantees; gamble responsibly."
}

The primary idea should sound like the reasonable play; the contrarian idea should use sharp-adjacent language (dog, value, regression, slump, public fade) without promising profit.`;

  const systemPrompt = `${profile.systemPrompt}

${DIGEST_GUARDRAILS}

Output only valid JSON matching the requested shape.`;

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    tools: [{ type: "web_search_20250305", name: "web_search" } as const],
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content
      ?.filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("") ?? "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Digest: no JSON in model response");
  let parsed: DigestJson;
  try {
    parsed = JSON.parse(jsonMatch[0]) as DigestJson;
  } catch {
    throw new Error("Digest: invalid JSON");
  }
  if (!parsed.title || !parsed.primaryIdea || !parsed.contrarianIdea) {
    throw new Error("Digest: missing required fields");
  }
  const bodyHtml = jsonToHtml({
    title: String(parsed.title),
    excerpt: String(parsed.excerpt ?? ""),
    primaryIdea: String(parsed.primaryIdea),
    primaryRationale: Array.isArray(parsed.primaryRationale)
      ? parsed.primaryRationale.map(String)
      : [],
    contrarianIdea: String(parsed.contrarianIdea),
    contrarianRationale: Array.isArray(parsed.contrarianRationale)
      ? parsed.contrarianRationale.map(String)
      : [],
    disclaimer: String(parsed.disclaimer ?? ""),
  });

  return {
    title: String(parsed.title).trim(),
    excerpt: String(parsed.excerpt ?? "").trim(),
    bodyHtml,
  };
}
