import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { productTypesInclude } from "@/lib/product-types";

const KEY_LISTICLE_INTRO = "controlPanel_listicleIntroPrompt";
const KEY_LISTICLE_PICKS = "controlPanel_listiclePicksPrompt";
const KEY_LISTICLE_BODY = "controlPanel_listicleBodyPrompt";

type Action = "intro" | "picks" | "body";

interface ProductForAi {
  id: string;
  brandName: string;
  productType: string;
  bonusSummary?: string | null;
  shortDescription?: string | null;
}

interface ListicleAiBody {
  action: Action;
  title: string;
  /** For intro/body: optional context */
  intro?: string | null;
  body?: string | null;
  /** For picks: filter by product type (casino, sportsbook, etc.) */
  productTypeFilter?: string | null;
  /** For picks: max number to select (default 10) */
  maxPicks?: number;
  /** All products with basic info for AI to choose from */
  products: ProductForAi[];
  /** For picks: product IDs already selected (to consider or avoid duplicates) */
  selectedProductIds?: string[];
  /** For body: product names that were picked (for methodology) */
  pickedProductNames?: string[];
}

const DEFAULT_INTRO_SYSTEM = `You are an expert betting and gambling content writer. Write a compelling introduction for a listicle.

Output valid HTML only: <p> tags for paragraphs. 2-4 paragraphs. Engaging, sets context for the list. No headers.
Match the tone to the listicle title. Be informative and helpful, not promotional.`;

const DEFAULT_PICKS_SYSTEM = `You are an expert on betting products (sportsbooks, casinos, crypto sites). Select the best products for a listicle.

You will receive:
1. The listicle title
2. A list of available products with id, brandName, productType, bonusSummary, shortDescription
3. Optional filter: only consider products of a specific type (casino, sportsbook, crypto, tool, tipster)
4. maxPicks: how many to select

Return a JSON object with one key: "productIds" — an array of product IDs in rank order (best first).
Only include IDs from the provided products. Respect the productType filter if given.
Select the most relevant, reputable options for the list theme.`;

const DEFAULT_BODY_SYSTEM = `You are an expert betting and gambling content writer. Write the bottom section of a listicle.

This section typically includes: methodology (how we ranked/picked), FAQ, disclaimers, or closing paragraphs.
Output valid HTML only: <p>, <h2>, <h3>, <ul>, <li>, <strong>, <a>. Use proper structure.
2-6 paragraphs or sections. Professional, helpful tone. Match the listicle theme.`;

async function getListiclePrompts(): Promise<{ intro: string; picks: string; body: string }> {
  const [intro, picks, body] = await Promise.all([
    prisma.seoSettings.findUnique({ where: { key: KEY_LISTICLE_INTRO } }),
    prisma.seoSettings.findUnique({ where: { key: KEY_LISTICLE_PICKS } }),
    prisma.seoSettings.findUnique({ where: { key: KEY_LISTICLE_BODY } }),
  ]);
  return {
    intro: intro?.value?.trim() || DEFAULT_INTRO_SYSTEM,
    picks: picks?.value?.trim() || DEFAULT_PICKS_SYSTEM,
    body: body?.value?.trim() || DEFAULT_BODY_SYSTEM,
  };
}

function buildIntroPrompt(title: string, intro?: string | null): string {
  return `Listicle title: "${title}"
${intro?.trim() ? `Current intro (improve or replace):\n${intro}\n\n` : ""}Write a compelling introduction. Output ONLY valid HTML, no markdown.`;
}

function buildPicksPrompt(
  title: string,
  products: ProductForAi[],
  filter: string | null,
  maxPicks: number
): string {
  const filtered = filter
    ? products.filter((p) => productTypesInclude(p.productType, filter))
    : products;
  const list = filtered
    .map(
      (p) =>
        `- id: "${p.id}", brand: ${p.brandName}, type: ${p.productType}${p.bonusSummary ? `, bonus: ${p.bonusSummary}` : ""}${p.shortDescription ? `, desc: ${p.shortDescription.slice(0, 80)}...` : ""}`
    )
    .join("\n");
  return `Listicle title: "${title}"
Product type filter: ${filter || "any"}
Max picks: ${maxPicks}

Available products:
${list}

Select the best ${maxPicks} products in rank order. Output ONLY a JSON object: {"productIds": ["id1","id2",...]}`;
}

function buildBodyPrompt(
  title: string,
  body?: string | null,
  pickedNames?: string[]
): string {
  return `Listicle title: "${title}"
${pickedNames?.length ? `Products in the list: ${pickedNames.join(", ")}\n` : ""}${body?.trim() ? `Current body (improve or replace):\n${body}\n\n` : ""}Write the bottom section (methodology, FAQ, disclaimers). Output ONLY valid HTML.`;
}

function parsePicksResponse(text: string): string[] | null {
  const trimmed = text.trim();
  let jsonStr = trimmed;
  const codeMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) jsonStr = codeMatch[1].trim();
  const open = jsonStr.indexOf("{");
  const close = jsonStr.lastIndexOf("}");
  if (open >= 0 && close > open) jsonStr = jsonStr.slice(open, close + 1);
  try {
    const parsed = JSON.parse(jsonStr) as { productIds?: unknown };
    const ids = parsed.productIds;
    if (!Array.isArray(ids)) return null;
    return ids.filter((id): id is string => typeof id === "string");
  } catch {
    return null;
  }
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
    const body = (await request.json()) as ListicleAiBody;
    if (!body?.title?.trim() || !body?.action) {
      return NextResponse.json(
        { error: "title and action are required" },
        { status: 400 }
      );
    }

    const action = body.action as Action;
    if (!["intro", "picks", "body"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "picks" && (!body.products || !Array.isArray(body.products))) {
      return NextResponse.json(
        { error: "products array is required for picks action" },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });
    const prompts = await getListiclePrompts();
    let systemPrompt: string;
    let userPrompt: string;

    switch (action) {
      case "intro":
        systemPrompt = prompts.intro;
        userPrompt = buildIntroPrompt(body.title, body.intro);
        break;
      case "picks":
        systemPrompt = prompts.picks;
        userPrompt = buildPicksPrompt(
          body.title,
          body.products,
          body.productTypeFilter?.trim() || null,
          Math.min(body.maxPicks ?? 10, 20)
        );
        break;
      case "body":
        systemPrompt = prompts.body;
        userPrompt = buildBodyPrompt(body.title, body.body, body.pickedProductNames);
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content
        ?.filter((block) => block.type === "text")
        .map((block) => (block as { type: "text"; text: string }).text)
        .join("")
        .trim() ?? "";

    if (action === "picks") {
      const productIds = parsePicksResponse(text);
      if (!productIds || productIds.length === 0) {
        return NextResponse.json(
          { error: "AI did not return valid product IDs. Try again." },
          { status: 500 }
        );
      }
      return NextResponse.json({ productIds });
    }

    let html = text;
    if (!html.startsWith("<")) {
      html = `<p>${html.replace(/\n\n/g, "</p><p>")}</p>`;
    }
    return NextResponse.json({ html });
  } catch (error) {
    console.error("AI listicle error:", error);
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { error: err?.message ?? "AI generation failed" },
      { status: 500 }
    );
  }
}
