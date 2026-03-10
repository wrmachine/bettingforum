import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    // Always return ok - don't reveal whether the email exists (security)
    const okResponse = NextResponse.json({ ok: true });

    if (!user || !user.password) {
      return okResponse;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetTokenExpires: resetTokenExpires,
      },
    });

    await sendPasswordResetEmail(email, resetToken);
    if (!process.env.RESEND_API_KEY) {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      console.log(`[Dev] Password reset link: ${baseUrl}/auth/reset-password?token=${resetToken}`);
    }

    return okResponse;
  } catch (e) {
    console.error("Forgot password error:", e);
    return NextResponse.json({ ok: true }); // Still return ok for security
  }
}
