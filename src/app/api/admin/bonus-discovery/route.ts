import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { BONUS_TYPE_SLUGS } from "@/lib/bonus-types";
import Anthropic from "@anthropic-ai/sdk";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending | approved | rejected
    const productId = searchParams.get("productId");

    const where: { productId?: string; status?: string } = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) where.status = status;
    if (productId) where.productId = productId;

    // Fetch products first (always needed for dropdown)
    const allProducts = await prisma.product.findMany({
      where: { post: { type: "product", status: "published" } },
      select: {
        id: true,
        brandName: true,
        siteUrl: true,
        productType: true,
        post: { select: { slug: true } },
      },
    });

    // Fetch discovered bonuses (may fail if Prisma client outdated)
    let items: unknown[] = [];
    if (prisma.discoveredBonus) {
      try {
        items = await prisma.discoveredBonus.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              brandName: true,
              post: { select: { slug: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" as const },
        take: 100,
      });
      } catch (dbErr) {
        console.error("DiscoveredBonus query failed:", dbErr);
      }
    }

    return NextResponse.json({
      discovered: items,
      products: allProducts,
    });
  } catch (error) {
    console.error("Bonus discovery GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load", discovered: [], products: [] },
      { status: 500 }
    );
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
      { error: "ANTHROPIC_API_KEY required for bonus discovery" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { productId } = body;
    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { post: { select: { slug: true, title: true } } },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const brandName = product.brandName;
    const baseUrl = product.siteUrl?.replace(/\/+$/, "") ?? "";

    let webContent = "";
    const urlsToTry = [baseUrl];
    if (baseUrl) {
      urlsToTry.push(
        `${baseUrl}/promotions`,
        `${baseUrl}/bonus`,
        `${baseUrl}/bonuses`,
        `${baseUrl}/offers`,
        `${baseUrl}/promo`
      );
    }

    for (const url of urlsToTry) {
      if (!url.startsWith("http")) continue;
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; BettingForumBot/1.0)" },
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const html = await res.text();
          const text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          if (text.length > 200) {
            webContent += `\n--- From ${url} ---\n${text.slice(0, 15000)}`;
            break;
          }
        }
      } catch {
        // Skip failed fetch
      }
    }

    if (!webContent || webContent.length < 100) {
      webContent = `No website content available for ${brandName}. Using your knowledge: list 2-5 typical bonus/promo offers this brand usually has (welcome bonus, deposit match, free spins, etc.). Include realistic offerValue like "100% up to $500" and common promo codes if you know any.`;
    }

    const client = new Anthropic({ apiKey });
    const bonusTypesList = BONUS_TYPE_SLUGS.join(", ");
    const systemPrompt = `You are a bonus code researcher. Extract bonus/promo offers for "${brandName}".

Return a JSON array of objects. Each object must have exactly: offerValue (string), promoCode (string or null), terms (string), claimUrl (string or null), bonusType (string or null).
For bonusType, pick ONE slug from this list that best matches the offer: ${bonusTypesList}
Examples: "first-time" = welcome/first deposit, "second-deposit" = 2nd deposit bonus, "reload" = ongoing deposit bonus, "no-deposit" = no deposit required, "free-spins" = free spins, "cashback" = cashback, "loyalty" = VIP/loyalty, "high-roller" = high roller, "referral" = refer a friend, "birthday" = birthday bonus, "welcome" = welcome package. Use null if unsure.
Example: [{"offerValue":"100% up to $500","promoCode":"BET500","terms":"21+ only","claimUrl":"https://example.com","bonusType":"first-time"}]
Include real offers from the content or your knowledge of this brand. If none found, return [].
Output ONLY the JSON array, no markdown, no code blocks, no explanation.`;
    const userPrompt = `Extract bonus codes for ${brandName}:\n\n${webContent.slice(0, 45000)}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content
        ?.filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("") ?? "";

    let parsed: { offerValue?: string; promoCode?: string; terms?: string; claimUrl?: string; bonusType?: string | null }[] = [];
    try {
      // Strip markdown code blocks if present
      let cleaned = text.trim();
      const codeBlock = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlock) cleaned = codeBlock[1].trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error("Claude response parse error:", parseErr, "Raw:", text.slice(0, 500));
    }

    if (!prisma.discoveredBonus) {
      return NextResponse.json(
        { error: "DiscoveredBonus model missing. Stop the dev server, run: npx prisma generate, then restart." },
        { status: 503 }
      );
    }

    const created: { id: string; offerValue: string | null; promoCode: string | null; bonusType: string | null }[] = [];
    for (const item of parsed) {
      const offerValue = item.offerValue ? String(item.offerValue).trim() : null;
      const promoCode = item.promoCode ? String(item.promoCode).trim() : null;
      if (!offerValue && !promoCode) continue;
      const rawBonusType = item.bonusType ? String(item.bonusType).trim().toLowerCase() : null;
      const bonusType = rawBonusType && (BONUS_TYPE_SLUGS as readonly string[]).includes(rawBonusType) ? rawBonusType : null;
      const db = await prisma.discoveredBonus.create({
        data: {
          productId,
          brandName,
          offerValue,
          promoCode,
          terms: item.terms ? String(item.terms).slice(0, 2000) : null,
          claimUrl: item.claimUrl ? String(item.claimUrl).trim() : baseUrl || null,
          sourceUrl: baseUrl || null,
          rawSnippet: `${offerValue || ""} ${promoCode || ""}`.trim().slice(0, 500),
          bonusType,
          status: "pending",
        },
      });
      created.push({ id: db.id, offerValue: db.offerValue, promoCode: db.promoCode, bonusType: db.bonusType });
    }

    return NextResponse.json({ discovered: created.length, items: created });
  } catch (error) {
    console.error("Bonus discovery error:", error);
    const err = error as { message?: string; status?: number };
    const msg = err?.message ?? "Discovery failed";
    const isAuth = msg.includes("401") || msg.includes("invalid") || msg.includes("API key");
    return NextResponse.json(
      { error: isAuth ? "Check ANTHROPIC_API_KEY in .env" : msg },
      { status: isAuth ? 503 : 500 }
    );
  }
}
