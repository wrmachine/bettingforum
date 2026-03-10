"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

function isValidCallbackUrl(url: string | null): boolean {
  if (!url) return false;
  if (!url.startsWith("/")) return false;
  if (url.startsWith("//")) return false;
  return true;
}

const BENEFITS = [
  "Free Contests",
  "Community Forums",
  "Expert Picks and Advice",
  "Customized Scores and Odds",
];

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") ?? "/";
  const callbackUrl = isValidCallbackUrl(rawCallback) ? rawCallback : "/";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const username = (formData.get("username") as string)?.trim() || "";
    const email = (formData.get("email") as string)?.trim().toLowerCase() || "";
    const password = formData.get("password") as string;
    const newsletterOptIn = formData.get("newsletter") === "on";

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, newsletterOptIn }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (signInResult?.ok) {
        window.location.href = "/auth/complete-profile?from=signup";
      } else {
        router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}&registered=1`);
      }
    } catch {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left: Registration form */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            New Member Registration
          </h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Display Name*
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                minLength={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Name"
              />
              <p className="mt-1 text-xs text-gray-500">
                Display name will be used to login and as public identity
                throughout our website & community
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password*
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="••••••••"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                name="newsletter"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
              />
              <span className="text-sm text-gray-600">
                Yes, I would like to receive occasional newsletters, offers and
                product updates from betting.forum
              </span>
            </label>

            <p className="text-sm text-gray-600">
              By clicking Create an account I verify I am over the age of 18 and
              agree and consent to the{" "}
              <Link
                href="/terms"
                className="font-medium text-accent underline hover:text-accent-hover"
              >
                betting.forum Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-accent underline hover:text-accent-hover"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create an account"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const cb = isValidCallbackUrl(searchParams.get("callbackUrl"))
                  ? searchParams.get("callbackUrl")!
                  : "/auth/complete-profile?from=signup";
                signIn("google", { callbackUrl: cb });
              }}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="font-medium text-accent hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Right: Benefits and community info */}
        <div className="flex flex-col">
          <div className="h-full min-h-0 rounded-lg border border-slate-200 bg-slate-100 p-6">
            <h2 className="text-lg font-bold text-gray-900">
              Create your free account in minutes.
            <br />
            Benefits include:
            </h2>
            <ul className="mt-4 space-y-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 shrink-0 text-emerald-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-gray-600">
              Register an account on betting.forum to be part of the
              world&apos;s largest sports betting community.
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
