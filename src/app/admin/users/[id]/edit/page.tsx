import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { AdminUserForm } from "@/components/admin/AdminUserForm";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Edit User – Admin",
  robots: { index: false, follow: false },
};

export default async function AdminEditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if (result.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {result.error}
      </div>
    );
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      location: true,
      bio: true,
      avatarUrl: true,
      newsletterOptIn: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div>
      <p className="text-sm text-slate-500">
        <Link href="/admin/users" className="text-felt hover:underline">
          ← Users
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Edit user</h1>
      <p className="mt-2 text-slate-600">
        Update profile, role, or set a new password. OAuth-only accounts can be given a password here.
      </p>
      <AdminUserForm mode="edit" user={user} />
    </div>
  );
}
