"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LogEntry = {
  id: string;
  botUserId: string;
  postId: string | null;
  postSlug: string | null;
  commentId: string | null;
  action: string;
  dryRun: boolean;
  errorMsg: string | null;
  createdAt: string;
};

export default function AdminAiBotsActivityPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ai-bots/activity")
      .then((r) => r.json())
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">AI Bot Activity</h1>
      <p className="mt-1 text-slate-600">
        Recent bot actions (comments and threads). Dry runs are included.
      </p>

      <Link
        href="/admin/ai-bots"
        className="mt-4 inline-block text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to Bots
      </Link>

      {loading ? (
        <p className="mt-8 text-slate-500">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="mt-8 text-slate-500">No activity yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Bot</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Action</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Link</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-700">{log.botUserId.slice(0, 8)}…</td>
                  <td className="px-4 py-2 text-sm">{log.action}</td>
                  <td className="px-4 py-2 text-sm">
                    {log.postSlug ? (
                      <Link
                        href={`/threads/${log.postSlug}`}
                        className="text-emerald-600 hover:underline"
                      >
                        View
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {log.dryRun && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                        Dry run
                      </span>
                    )}
                    {log.errorMsg && (
                      <span className="text-red-600" title={log.errorMsg}>
                        Error
                      </span>
                    )}
                    {!log.dryRun && !log.errorMsg && (
                      <span className="text-slate-500">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
