"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

interface UserStats {
  username: string;
  upvotes: number;
  downvotes: number;
}

export function AccountWidget() {
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
    <div className="rounded-none border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="mb-2 text-xs font-semibold text-slate-700">Account</h3>
        {status === "loading" ? (
          <div className="h-[4.5rem] animate-pulse rounded-none bg-slate-100" />
        ) : session ? (
          <div className="space-y-2">
            <Link
              href={`/u/${stats?.username ?? (session.user as { username?: string })?.username ?? session.user?.name ?? session.user?.email ?? "me"}`}
              className="flex items-center gap-2"
            >
              <span className="flex h-[1.875rem] w-[1.875rem] shrink-0 items-center justify-center rounded-full bg-slate-200 text-[0.65rem] font-semibold text-slate-600">
                {(stats?.username ?? session.user?.name ?? "?")
                  .charAt(0)
                  .toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-900">
                  {stats?.username ?? session.user?.name ?? session.user?.email}
                </p>
                <p className="text-[0.65rem] text-slate-500">View profile</p>
              </div>
            </Link>
            <div className="flex gap-3 border-t border-slate-100 pt-2">
              <div className="flex items-center gap-1">
                <svg
                  className="h-3 w-3 text-emerald-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4l8 8h-5v8h-6v-8H4l8-8z" />
                </svg>
                <span className="text-xs font-medium text-slate-700">
                  {stats?.upvotes ?? 0}
                </span>
                <span className="text-[0.65rem] text-slate-500">upvotes</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="h-3 w-3 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 20l-8-8h5V4h6v8h5l-8 8z" />
                </svg>
                <span className="text-xs font-medium text-slate-700">
                  {stats?.downvotes ?? 0}
                </span>
                <span className="text-[0.65rem] text-slate-500">downvotes</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Link
                href="/account"
                className="block w-full rounded-none border border-slate-200 px-3 py-1.5 text-center text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full rounded-none border border-slate-200 px-3 py-1.5 text-center text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Log out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Link
              href="/auth/sign-in"
              className="block w-full rounded-none border border-slate-200 px-3 py-1.5 text-center text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Log in
            </Link>
            <Link
              href="/auth/sign-up"
              className="block w-full rounded-none bg-accent px-3 py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Sign up
            </Link>
          </div>
        )}
    </div>
  );
}
