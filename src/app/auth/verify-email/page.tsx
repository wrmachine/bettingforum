"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setStatus("success");
        else if (data.error === "expired") setStatus("expired");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg text-center">
        {status === "loading" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Verifying your email...</h1>
            <p className="mt-2 text-sm text-gray-600">Please wait a moment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Email verified!</h1>
            <p className="mt-2 text-sm text-gray-600">Your account has been verified. You can now sign in.</p>
            <Link
              href="/auth/sign-in"
              className="mt-4 inline-block rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover"
            >
              Sign in
            </Link>
          </>
        )}
        {status === "expired" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Link expired</h1>
            <p className="mt-2 text-sm text-gray-600">
              This verification link has expired. Please sign in and request a new verification email.
            </p>
            <Link
              href="/auth/sign-in"
              className="mt-4 inline-block rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover"
            >
              Sign in
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Verification failed</h1>
            <p className="mt-2 text-sm text-gray-600">
              {token ? "This link may be invalid or already used." : "No verification token provided."}
            </p>
            <Link
              href="/auth/sign-in"
              className="mt-4 inline-block rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
