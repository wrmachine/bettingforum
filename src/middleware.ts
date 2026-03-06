import { withAuth } from "next-auth/middleware";

const SUPREME_ADMIN_EMAIL = "partners@wrmachine.com";

export default withAuth({
  callbacks: {
    authorized: async ({ token }) => {
      if (!token) return false;
      return token.role === "admin" || token.email === SUPREME_ADMIN_EMAIL;
    },
  },
  pages: { signIn: "/auth/sign-in" },
});

export const config = {
  matcher: ["/admin/:path*"],
};
