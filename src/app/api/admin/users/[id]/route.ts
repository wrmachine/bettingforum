import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

async function countAdmins(excludeUserId?: string) {
  return prisma.user.count({
    where: {
      role: "admin",
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

    const updates: Parameters<typeof prisma.user.update>[0]["data"] = {};

    if (email !== undefined) {
      const emailNormalized = typeof email === "string" ? email.trim().toLowerCase() : "";
      if (!emailNormalized || !emailNormalized.includes("@")) {
        return NextResponse.json({ error: "Valid email required" }, { status: 400 });
      }
      const conflict = await prisma.user.findFirst({
        where: { email: emailNormalized, id: { not: id } },
      });
      if (conflict) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      updates.email = emailNormalized;
    }

    if (username !== undefined) {
      const usernameTrimmed = typeof username === "string" ? username.trim() : "";
      if (!usernameTrimmed || usernameTrimmed.length < 2) {
        return NextResponse.json({ error: "Username must be at least 2 characters" }, { status: 400 });
      }
      const conflict = await prisma.user.findFirst({
        where: { username: usernameTrimmed, id: { not: id } },
      });
      if (conflict) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
      updates.username = usernameTrimmed;
    }

    if (password !== undefined && password !== null && password !== "") {
      if (typeof password !== "string" || password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    if (role !== undefined) {
      const roleValue = role === "admin" ? "admin" : "user";
      if (existing.role === "admin" && roleValue === "user") {
        const otherAdmins = await countAdmins(id);
        if (otherAdmins === 0) {
          return NextResponse.json(
            { error: "Cannot remove the last admin. Promote another user first." },
            { status: 400 }
          );
        }
      }
      updates.role = roleValue;
    }

    if (location !== undefined) {
      updates.location = typeof location === "string" ? location.trim() || null : null;
    }
    if (bio !== undefined) {
      updates.bio = typeof bio === "string" ? bio.trim() || null : null;
    }
    if (avatarUrl !== undefined) {
      updates.avatarUrl = typeof avatarUrl === "string" ? avatarUrl.trim() || null : null;
    }
    if (newsletterOptIn !== undefined) {
      updates.newsletterOptIn = Boolean(newsletterOptIn);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        location: true,
        bio: true,
        avatarUrl: true,
        newsletterOptIn: true,
        createdAt: true,
        emailVerified: true,
      },
    });

    return NextResponse.json(user);
  } catch (e) {
    console.error("Admin update user:", e);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const sessionUserId = auth.session?.user?.id;
  if (!sessionUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  if (id === sessionUserId) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.role === "admin") {
    const otherAdmins = await countAdmins(id);
    if (otherAdmins === 0) {
      return NextResponse.json(
        { error: "Cannot delete the last admin. Promote another user first." },
        { status: 400 }
      );
    }
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
