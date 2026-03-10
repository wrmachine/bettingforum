import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AccountEditForm } from "@/components/AccountEditForm";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900">Account</h1>
        <p className="mt-4 text-slate-600">Please sign in to view your account.</p>
        <Link href="/auth/sign-in" className="mt-4 inline-block text-felt hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  const username = (session.user as { username?: string })?.username ?? session.user?.name ?? session.user?.email?.split("@")[0] ?? "me";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
      <p className="mt-2 text-slate-600">
        Manage your profile and preferences.
      </p>
      <div className="mt-8 space-y-6">
        <AccountEditForm />
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Profile</h2>
          <p className="mt-1 text-sm text-slate-600">View your public profile and activity.</p>
          <Link
            href={`/u/${username}`}
            className="mt-3 inline-block text-sm font-medium text-felt hover:underline"
          >
            View profile →
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Activity</h2>
          <p className="mt-1 text-sm text-slate-600">Browse your posts, comments, and votes.</p>
          <Link
            href={`/u/${username}#posts`}
            className="mt-3 inline-block text-sm font-medium text-felt hover:underline"
          >
            My posts & comments →
          </Link>
        </div>
        {(session.user as { role?: string }).role === "admin" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6">
            <h2 className="font-semibold text-amber-900">Admin</h2>
            <p className="mt-1 text-sm text-amber-800">Manage content, users, and site settings.</p>
            <Link
              href="/admin"
              className="mt-3 inline-block text-sm font-medium text-amber-700 hover:underline"
            >
              Open Admin →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
