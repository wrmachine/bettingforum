import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { parseProductTypes, formatProductTypesDisplay } from "@/lib/product-types";
import { stripHtml } from "@/lib/format";

interface CompleteArticleBody {
  product: {
    brandName: string;
    productType: string;
    siteUrl?: string | null;
    bonusSummary?: string | null;
    minDeposit?: string | null;
    licenseJurisdiction?: string | null;
    geoRestrictions?: string | null;
    shortDescription?: string | null;
    fiatSupported?: boolean;
    cryptoSupported?: boolean;
  };
  post: {
    title: string;
    excerpt?: string | null;
    body?: string | null;
  };
  currentBody?: string | null;
}

interface AiCompleteResult {
  html: string;
  excerpt: string;
  bonusSummary: string;
  minDeposit: string;
  shortDescription: string;
  licenseJurisdiction: string;
  geoRestrictions: string;
}

const AI_COMPLETE_JSON_SCHEMA = {
  type: "object",
  properties: {
    html: { type: "string", description: "Full review article (400-800 words), valid HTML" },
    excerpt: { type: "string", description: "1-2 sentences for product page summary, plain text" },
    bonusSummary: { type: "string", description: "Brief bonus info" },
    minDeposit: { type: "string", description: "e.g. $10 or Varies" },
    shortDescription: { type: "string", description: "1-2 punchy sentences for listicle cards" },
    licenseJurisdiction: { type: "string", description: "e.g. Malta MGA or Curacao" },
    geoRestrictions: { type: "string", description: "e.g. US, UK restricted" },
  },
  required: ["html", "excerpt", "bonusSummary", "minDeposit", "shortDescription", "licenseJurisdiction", "geoRestrictions"],
  additionalProperties: false,
} as const;

const DEFAULT_SYSTEM_PROMPT = `You are an expert betting and gambling product reviewer. Generate complete, professional content for product pages.

Generate ALL of the following. Fill in missing data with reasonable, professional text based on the product type—never invent specific claims (bonus amounts, odds) unless provided. Use "" for fields you cannot reasonably infer.

Keys to fill:
- html: Full review article (400-800 words), valid HTML: <p>, <h2>, <h3>, <ul>, <li>, <strong>, <a>. Sections: Overview, Bonuses, Betting/Payment options, Licensing, Geo restrictions.
- excerpt: 1-2 sentences for product page summary (PLAIN TEXT ONLY—no HTML, no <p> or other tags)
- bonusSummary: Brief bonus info, e.g. "100% up to $500" or "Welcome offer available" (plain text)
- minDeposit: e.g. "$10" or "Varies" (plain text)
- shortDescription: 1-2 punchy sentences for listicle cards—highlights key selling point (plain text)
- licenseJurisdiction: e.g. "Malta MGA" or "Curacao" (plain text)
- geoRestrictions: e.g. "US, UK restricted" or "Most jurisdictions" (plain text)`;

function buildUserPrompt(body: CompleteArticleBody): string {
  const types = formatProductTypesDisplay(parseProductTypes(body.product.productType));
  const productLines = [
    `Brand: ${body.product.brandName}`,
    `Product types: ${types}`,
    body.product.siteUrl && `Website: ${body.product.siteUrl}`,
    body.product.bonusSummary && `[Existing] Bonus: ${body.product.bonusSummary}`,
    body.product.minDeposit && `[Existing] Min deposit: ${body.product.minDeposit}`,
    body.product.licenseJurisdiction && `[Existing] License: ${body.product.licenseJurisdiction}`,
    body.product.geoRestrictions && `[Existing] Restrictions: ${body.product.geoRestrictions}`,
    body.product.shortDescription && `[Existing] Short desc: ${body.product.shortDescription}`,
    `Fiat: ${body.product.fiatSupported ?? true}`,
    `Crypto: ${body.product.cryptoSupported ?? false}`,
  ].filter(Boolean);

  const existing = (body.currentBody || body.post.body || "").trim();
  const hasContent = existing.length > 50;

  return `Generate complete product content for:

**Product:** ${body.post.title}
${productLines.map((l) => `- ${l}`).join("\n")}
${body.post.excerpt ? `[Existing excerpt]: ${body.post.excerpt}` : ""}

${hasContent ? `[Existing article draft - improve and complete it]:\n${existing}\n\n---\n\nGenerate all fields. For html, continue from and improve the draft above.` : "Generate all fields from scratch."}

Output ONLY a raw JSON object with keys: html, excerpt, bonusSummary, minDeposit, shortDescription, licenseJurisdiction, geoRestrictions. No markdown, no code block, no other text.`;
}

function fixTrailingCommas(str: string): string {
  return str.replace(/,(\s*[}\]])/g, "$1");
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) return codeMatch[1].trim();
  const open = trimmed.indexOf("{");
  const close = trimmed.lastIndexOf("}");
  if (open >= 0 && close > open) return trimmed.slice(open, close + 1);
  return trimmed;
}

function parseJsonResponse(text: string): AiCompleteResult | null {
  const raw = extractJson(text);
  const candidates = [raw, fixTrailingCommas(raw)];
  for (const jsonStr of candidates) {
    try {
      const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
      return {
        html: String(parsed.html ?? ""),
        excerpt: String(parsed.excerpt ?? ""),
        bonusSummary: String(parsed.bonusSummary ?? ""),
        minDeposit: String(parsed.minDeposit ?? ""),
        shortDescription: String(parsed.shortDescription ?? ""),
        licenseJurisdiction: String(parsed.licenseJurisdiction ?? ""),
        geoRestrictions: String(parsed.geoRestrictions ?? ""),
      };
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Claude API is not configured. Add ANTHROPIC_API_KEY to your .env file" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as CompleteArticleBody;
    if (!body?.product?.brandName || !body?.post?.title) {
      return NextResponse.json(
        { error: "product.brandName and post.title are required" },
        { status: 400 }
      );
    }

    const customPrompt = await prisma.seoSettings
      .findUnique({ where: { key: "controlPanel_aiCompleteSystemPrompt" } })
      .then((r) => r?.value?.trim());
    const systemPrompt = customPrompt || DEFAULT_SYSTEM_PROMPT;

    const client = new Anthropic({ apiKey });
    const userPrompt = buildUserPrompt(body);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      output_config: {
        format: {
          type: "json_schema",
          schema: AI_COMPLETE_JSON_SCHEMA,
        },
      },
    });

    const text =
      response.content
        ?.filter((block) => block.type === "text")
        .map((block) => (block as { type: "text"; text: string }).text)
        .join("")
        .trim() ?? "";

    const result = parseJsonResponse(text);
    if (!result) {
      console.error("AI complete-article: unexpected response. Raw (first 500 chars):", text?.slice(0, 500));
      return NextResponse.json(
        { error: "AI did not return valid JSON. Try again." },
        { status: 500 }
      );
    }

    if (!result.html.startsWith("<")) {
      result.html = `<p>${result.html.replace(/\n\n/g, "</p><p>")}</p>`;
    }
    // Excerpt should be plain text—strip any HTML the AI may have included
    result.excerpt = stripHtml(result.excerpt);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI complete-article error:", error);
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { error: err?.message ?? "Failed to generate article" },
      { status: 500 }
    );
  }
}
