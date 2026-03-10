"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "expired">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setStatus("idle");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setStatus("idle");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (data.ok) {
        setStatus("success");
        return;
      }
      if (data.error === "expired") {
        setStatus("expired");
        return;
      }
      setError(data.error || "Something went wrong.");
      setStatus("idle");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid link</h1>
          <p className="mt-2 text-sm text-gray-600">
            No reset token provided. Please use the link from your email.
          </p>
          <Link
            href="/auth/forgot-password"
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900">Password reset</h1>
          <p className="mt-2 text-sm text-gray-600">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Link
            href="/auth/sign-in"
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900">Link expired</h1>
          <p className="mt-2 text-sm text-gray-600">
            This reset link has expired. Please request a new one.
          </p>
          <Link
            href="/auth/forgot-password"
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
        <p className="mt-2 text-sm text-gray-600">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-accent focus:ring-accent"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-accent focus:ring-accent"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {status === "loading" ? "Resetting..." : "Reset password"}
          </button>
          <p className="text-center text-sm text-gray-600">
            <Link href="/auth/sign-in" className="font-medium text-accent hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-md">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-64 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 space-y-4">
            <div className="h-12 animate-pulse rounded bg-slate-100" />
            <div className="h-12 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
