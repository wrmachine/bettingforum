import { Suspense } from "react";
import { SignUpForm } from "./SignUpForm";

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpFallback />}>
      <SignUpForm />
    </Suspense>
  );
}

function SignUpFallback() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="h-9 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 space-y-4">
            <div className="h-12 animate-pulse rounded bg-slate-100" />
            <div className="h-12 animate-pulse rounded bg-slate-100" />
            <div className="h-12 animate-pulse rounded bg-slate-100" />
            <div className="h-12 animate-pulse rounded bg-accent/10" />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="h-6 w-72 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 space-y-3">
            <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="mt-6 h-28 animate-pulse rounded-lg bg-slate-700" />
        </div>
      </div>
    </div>
  );
}
