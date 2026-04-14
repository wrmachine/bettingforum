import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const {
      email,
      username,
      password,
      role,
      location,
      bio,
      avatarUrl,
      newsletterOptIn,
    } = body;

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

    const roleValue = role === "admin" ? "admin" : "user";

    const existingEmail = await prisma.user.findUnique({ where: { email: emailNormalized } });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: usernameTrimmed } });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: emailNormalized,
        username: usernameTrimmed,
        password: hashedPassword,
        role: roleValue,
        emailVerified: new Date(),
        location: typeof location === "string" ? location.trim() || null : null,
        bio: typeof bio === "string" ? bio.trim() || null : null,
        avatarUrl: typeof avatarUrl === "string" ? avatarUrl.trim() || null : null,
        newsletterOptIn: Boolean(newsletterOptIn),
        verificationToken: null,
        verificationTokenExpires: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (e) {
    console.error("Admin create user:", e);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
