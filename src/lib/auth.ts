import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Required: NEXTAUTH_SECRET must be set in production. Dev fallback for local testing.
const secret = process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === "development" ? "dev-secret-change-in-production" : undefined);
if (!secret) {
  console.error("NEXTAUTH_SECRET is not set. Auth will fail in production.");
}

export const authOptions: NextAuthOptions = {
  secret,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/auth/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        if (!email.includes("@")) return null;
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(String(credentials.password), user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.username, role: user.role };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user: oauthUser, account }) {
      if (account?.provider === "google" && oauthUser?.email) {
        const email = String(oauthUser.email).trim().toLowerCase();
        let dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser) {
          const baseName = (oauthUser.name ?? email.split("@")[0]).replace(/[^a-zA-Z0-9]/g, "_");
          let username = baseName;
          let n = 0;
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseName}_${++n}`;
          }
          dbUser = await prisma.user.create({
            data: {
              email,
              username,
              role: "user",
              emailVerified: new Date(),
              avatarUrl: oauthUser.image ?? undefined,
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const existingId = (user as { id?: string }).id;
        if (existingId) {
          token.id = existingId;
          token.role = (user as { role?: string }).role;
        } else {
          const email = (user.email ?? token.email) as string;
          if (email) {
            const dbUser = await prisma.user.findUnique({
              where: { email: String(email).trim().toLowerCase() },
              select: { id: true, role: true },
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.role = dbUser.role;
            }
          }
        }
      } else if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};
