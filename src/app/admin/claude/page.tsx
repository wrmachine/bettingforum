"use client";

import { useState } from "react";

export default function AdminClaudePage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState("claude-3-5-sonnet-20241022");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch("/api/admin/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), model }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }
      setResponse(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Claude AI</h1>
      <p className="mt-1 text-slate-600">
        Use Claude for content ideas, moderation help, or general assistance. Admin only.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 rounded border border-slate-300 px-3 py-2"
          >
            <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
            <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
            <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Claude anything..."
            rows={4}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-6 rounded border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-medium text-slate-700">Response</h3>
          <div className="mt-2 whitespace-pre-wrap text-slate-900">{response}</div>
        </div>
      )}
    </div>
  );
}
