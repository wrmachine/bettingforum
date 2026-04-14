"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type EditUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  location: string | null;
  bio: string | null;
  avatarUrl: string | null;
  newsletterOptIn: boolean;
};

type Props = { mode: "new" } | { mode: "edit"; user: EditUser };

export function AdminUserForm(props: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = props.mode === "edit";
  const initial = isEdit ? props.user : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const username = (formData.get("username") as string)?.trim() || "";
    const email = (formData.get("email") as string)?.trim().toLowerCase() || "";
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const newsletterOptIn = formData.get("newsletter") === "on";
    const location = (formData.get("location") as string)?.trim() || "";
    const bio = (formData.get("bio") as string)?.trim() || "";
    const avatarUrl = (formData.get("avatarUrl") as string)?.trim() || "";

    try {
      if (props.mode === "new") {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
            role: role === "admin" ? "admin" : "user",
            newsletterOptIn,
            location: location || null,
            bio: bio || null,
            avatarUrl: avatarUrl || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to create user");
          return;
        }
        router.push("/admin/users");
        router.refresh();
        return;
      }

      const body: Record<string, unknown> = {
        username,
        email,
        role: role === "admin" ? "admin" : "user",
        newsletterOptIn,
        location: location || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
      };
      if (password && password.length > 0) {
        body.password = password;
      }

      const res = await fetch(`/api/admin/users/${props.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update user");
        return;
      }
      router.push("/admin/users");
      router.refresh();
    } catch {
      setError(isEdit ? "Failed to update user" : "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-slate-700">
          Username *
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          minLength={2}
          defaultValue={initial?.username ?? ""}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={initial?.email ?? ""}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          {isEdit ? "New password (leave blank to keep current)" : "Password *"}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={isEdit ? undefined : 8}
          required={!isEdit}
          autoComplete={isEdit ? "new-password" : "new-password"}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
          placeholder={isEdit ? "••••••••" : "At least 8 characters"}
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-slate-700">
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue={initial?.role === "admin" ? "admin" : "user"}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-slate-700">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={initial?.location ?? ""}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={initial?.bio ?? ""}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-700">
          Avatar URL
        </label>
        <input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          defaultValue={initial?.avatarUrl ?? ""}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
          placeholder="https://..."
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          name="newsletter"
          defaultChecked={initial?.newsletterOptIn ?? false}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-felt focus:ring-felt"
        />
        <span className="text-sm text-slate-600">Newsletter opt-in</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-felt px-4 py-2 text-sm font-medium text-white hover:bg-felt/90 disabled:opacity-50"
        >
          {loading ? "Saving…" : isEdit ? "Save changes" : "Create user"}
        </button>
        <Link
          href="/admin/users"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
