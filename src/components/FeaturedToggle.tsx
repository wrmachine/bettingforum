"use client";

import { useState } from "react";

export function FeaturedToggle({
  slug,
  featured,
  postType,
}: {
  slug: string;
  featured: boolean;
  postType: string;
}) {
  const [checked, setChecked] = useState(featured);
  const [loading, setLoading] = useState(false);

  if (postType !== "bonus") return null;

  const handleChange = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !checked }),
      });
      if (res.ok) {
        setChecked(!checked);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleChange}
      disabled={loading}
      className={`rounded px-2 py-0.5 text-xs font-medium transition ${
        checked
          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      } disabled:opacity-50`}
      title={checked ? "Click to unfeature" : "Click to feature"}
    >
      {checked ? "★ Featured" : "Feature"}
    </button>
  );
}
