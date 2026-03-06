import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Claude API is not configured. Set ANTHROPIC_API_KEY in .env" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { message, model = "claude-sonnet-4-6", maxTokens = 1024 } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message (string) is required" },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model,
      max_tokens: Math.min(Math.max(Number(maxTokens) || 1024, 1), 8192),
      messages: [{ role: "user", content: message }],
    });

    const text =
      response.content
        ?.filter((block) => block.type === "text")
        .map((block) => (block as { type: "text"; text: string }).text)
        .join("") ?? "";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Claude API error:", error);
    const err = error as { status?: number; message?: string };
    const status = err.status === 401 ? 503 : 500;
    return NextResponse.json(
      {
        error:
          err.message ?? "Failed to get response from Claude",
      },
      { status }
    );
  }
}
