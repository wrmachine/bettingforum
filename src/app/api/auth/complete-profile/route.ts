import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.skipped === true) {
      // Mark that user chose to skip (we could store a flag; for now just return ok)
      return NextResponse.json({ ok: true });
    }

    const { location, bio, avatarUrl } = body;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(typeof location === "string" && { location: location.trim() || null }),
        ...(typeof bio === "string" && { bio: bio.trim() || null }),
        ...(typeof avatarUrl === "string" && { avatarUrl: avatarUrl || null }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Complete profile error:", e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
