import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "User Management – Admin",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const result = await requireAdmin();
  if (result.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {result.error}
      </div>
    );
  }

  const [users, counts] = await Promise.all([
    prisma.user.findMany({
      include: {
        _count: {
          select: { posts: true, comments: true, votes: true, productReviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: true,
    }),
  ]);

  const roleCounts = counts.reduce(
    (acc, c) => {
      acc[c.role] = c._count;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
      <p className="mt-2 text-slate-600">
        View all users, change roles, and manage accounts.
      </p>

      {/* Summary */}
      <div className="mt-6 flex gap-4">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          <p className="text-sm text-slate-500">Total users</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{roleCounts.admin ?? 0}</p>
          <p className="text-sm text-slate-500">Admins</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-700">{roleCounts.user ?? 0}</p>
          <p className="text-sm text-slate-500">Members</p>
        </div>
      </div>

      {/* Users table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Posts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Comments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Reviews
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/u/${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-slate-900 hover:text-felt hover:underline"
                    >
                      {user.username}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user._count.posts}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user._count.comments}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user._count.productReviews}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/u/${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-felt hover:underline"
                    >
                      Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Run <code className="rounded bg-slate-100 px-1 py-0.5">node scripts/make-admin.js [email]</code> to
        promote a user to admin.
      </p>
    </div>
  );
}
