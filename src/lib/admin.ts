import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

const SUPREME_ADMIN_EMAIL = "partners@wrmachine.com";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 as const };
  }
  const { prisma } = await import("./prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, email: true },
  });
  const isAdmin = user?.role === "admin" || user?.email === SUPREME_ADMIN_EMAIL;
  if (!user || !isAdmin) {
    return { error: "Forbidden", status: 403 as const };
  }
  return { session };
}
