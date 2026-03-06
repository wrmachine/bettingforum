"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <h2 className="text-xl font-semibold text-slate-900">Something went wrong</h2>
      <p className="mt-2 text-center text-slate-600">
        An error occurred. You can try again or return home.
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-4 max-w-xl overflow-auto rounded bg-red-50 p-4 text-left text-xs text-red-800">
          {error.message}
        </pre>
      )}
      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
