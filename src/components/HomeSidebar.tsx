"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

interface UserStats {
  username: string;
  upvotes: number;
  downvotes: number;
}

export function HomeSidebar() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/user/stats")
        .then((r) => r.json())
        .then(setStats)
        .catch(() => setStats(null));
    } else {
      setStats(null);
    }
  }, [session?.user?.id]);

  return (
    <aside className="w-full shrink-0 lg:w-72">
      <div className="space-y-6">
        {/* Auth / Profile */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Account</h3>
          {status === "loading" ? (
            <div className="h-24 animate-pulse rounded bg-slate-100" />
          ) : session ? (
            <div className="space-y-3">
              <Link
                href={`/u/${stats?.username ?? (session.user as { username?: string })?.username ?? session.user?.name ?? session.user?.email ?? "me"}`}
                className="flex items-center gap-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                  {(stats?.username ?? session.user?.name ?? "?")
                    .charAt(0)
                    .toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {stats?.username ?? session.user?.name ?? session.user?.email}
                  </p>
                  <p className="text-xs text-slate-500">View profile</p>
                </div>
              </Link>
              <div className="flex gap-4 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="h-4 w-4 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 4l8 8h-5v8h-6v-8H4l8-8z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">
                    {stats?.upvotes ?? 0}
                  </span>
                  <span className="text-xs text-slate-500">upvotes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    className="h-4 w-4 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 20l-8-8h5V4h6v8h5l-8 8z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">
                    {stats?.downvotes ?? 0}
                  </span>
                  <span className="text-xs text-slate-500">downvotes</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/auth/sign-in"
                className="block w-full rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Log in
              </Link>
              <Link
                href="/auth/sign-up"
                className="block w-full rounded-lg bg-accent px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Ad spot 1 */}
        <div className="flex aspect-[1] w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
          <span className="text-sm text-slate-400">Ad spot 1</span>
        </div>

        {/* Ad spot 2 */}
        <div className="flex aspect-[1] w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
          <span className="text-sm text-slate-400">Ad spot 2</span>
        </div>
      </div>
    </aside>
  );
}
