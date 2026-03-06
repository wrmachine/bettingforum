import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    const emailNormalized = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!emailNormalized || !emailNormalized.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    const usernameTrimmed = typeof username === "string" ? username.trim() : "";
    if (!usernameTrimmed || usernameTrimmed.length < 2) {
      return NextResponse.json({ error: "Username must be at least 2 characters" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email: emailNormalized } });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: usernameTrimmed } });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.create({
      data: {
        email: emailNormalized,
        username: usernameTrimmed,
        password: hashedPassword,
        role: "user",
        verificationToken,
        verificationTokenExpires,
      },
    });

    await sendVerificationEmail(emailNormalized, verificationToken);
    if (!process.env.RESEND_API_KEY) {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      console.log(`[Dev] Verification link: ${baseUrl}/auth/verify-email?token=${verificationToken}`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Sign-up error:", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
