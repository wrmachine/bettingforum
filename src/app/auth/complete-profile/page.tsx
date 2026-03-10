"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSignup = searchParams.get("from") === "signup";
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setAvatarUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: location.trim() || null,
          bio: bio.trim() || null,
          avatarUrl: avatarUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save profile");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Failed to save profile");
    } finally {
      setLoading(false);
    }
  }

  const skipProfile = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skipped: true }),
      });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  // Give session time to hydrate after OAuth redirect (avoids "kicked to sign-in" race)
  useEffect(() => {
    if (status !== "unauthenticated") return;
    const t = setTimeout(() => router.replace("/auth/sign-in"), 1500);
    return () => clearTimeout(t);
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-md text-center py-12 text-gray-500">Loading...</div>
    );
  }
  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-md text-center py-12 text-gray-500">Checking session...</div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Complete your profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add a few details so the community can get to know you. You can skip and update later.
        </p>
        {fromSignup && (
          <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            We&apos;ve sent a verification link to your email. Please check your inbox to verify your account.
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Avatar</label>
            <div className="mt-1 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" width={64} height={64} className="h-full w-full object-cover" unoptimized={avatarUrl.startsWith("/uploads/")} />
                ) : (
                  <span className="text-gray-400 text-2xl">{session?.user?.name?.[0] ?? "?"}</span>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {avatarUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Where are you from?
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-accent focus:ring-accent"
              placeholder="e.g. London, UK"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              About you
            </label>
            <RichTextEditor
              value={bio}
              onChange={setBio}
              placeholder="A short bio about yourself..."
              minHeight="6rem"
              allowMedia={false}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save profile"}
            </button>
            <button
              type="button"
              onClick={skipProfile}
              disabled={loading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
