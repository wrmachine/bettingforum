import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminUserForm } from "@/components/admin/AdminUserForm";

export const metadata = {
  title: "Add User – Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewUserPage() {
  const result = await requireAdmin();
  if (result.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {result.error}
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-slate-500">
        <Link href="/admin/users" className="text-felt hover:underline">
          ← Users
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Add user</h1>
      <p className="mt-2 text-slate-600">
        Create an account with email and password. The user can sign in immediately (email is marked verified).
      </p>
      <AdminUserForm mode="new" />
    </div>
  );
}
