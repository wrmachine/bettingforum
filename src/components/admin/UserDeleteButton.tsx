"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserDeleteButton({
  userId,
  username,
  disabled,
}: {
  userId: string;
  username: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `Delete user "${username}"? This removes their posts, comments, and reviews (cascade). This cannot be undone.`
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Delete failed");
        return;
      }
      router.refresh();
    } catch {
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={handleDelete}
      className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
