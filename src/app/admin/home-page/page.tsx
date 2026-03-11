"use client";

import { useEffect, useState } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";

const KEYS = {
  title: "home_title",
  description: "home_description",
};

const DEFAULTS = {
  [KEYS.title]: "Best Betting Products",
  [KEYS.description]: "",
};

export default function AdminHomePageEditor() {
  const [values, setValues] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/site-content?prefix=home_")
      .then((r) => r.json())
      .then((data) => {
        setValues((prev) => ({ ...prev, ...data }));
      })
      .catch(() => setError("Failed to load content"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Request failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Home Page</h1>
      <p className="mt-1 text-slate-600">
        Edit the title and description shown in the hero section of the home page.
      </p>

      <form onSubmit={handleSave} className="mt-8 max-w-3xl space-y-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">Title</label>
          <input
            value={values[KEYS.title] ?? ""}
            onChange={(e) =>
              setValues((v) => ({ ...v, [KEYS.title]: e.target.value }))
            }
            placeholder="Best Betting Products"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-lg font-semibold"
          />
          <p className="mt-1 text-xs text-slate-500">
            Plain text. Displayed as the large heading on the home page.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <RichTextEditor
            value={values[KEYS.description] ?? ""}
            onChange={(html) =>
              setValues((v) => ({ ...v, [KEYS.description]: html }))
            }
            placeholder="Write a description for the home page hero section..."
            minHeight="10rem"
            uploadEndpoint="/api/admin/upload"
          />
          <p className="mt-1 text-xs text-slate-500">
            Supports rich text with links. Shown below the title on the home page.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-sm font-medium text-emerald-600">
              Saved successfully
            </span>
          )}
        </div>
      </form>

      <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-semibold text-slate-700">Preview</h3>
        <div className="mt-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-black">
            {values[KEYS.title] || "Best Betting Products"}
          </h2>
          {values[KEYS.description] && (
            <div
              className="mt-3 text-sm text-slate-700 [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800"
              dangerouslySetInnerHTML={{ __html: values[KEYS.description] }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
