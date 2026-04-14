"use client";

import { useState, useEffect, useCallback } from "react";

interface PostUrl {
  url: string;
  type: string;
  title: string;
  createdAt: string;
}

interface Summary {
  total: number;
  byType: Record<string, number>;
}

interface Settings {
  enabled: boolean;
  apiKey: string;
  batchSize: number;
  autoSubmit: boolean;
}

interface TaskResult {
  success: boolean;
  task_id?: string;
  task_ids?: string[];
  submitted_count?: number;
  batch_count?: number;
  batch_size?: number;
  error?: string;
  message?: string;
}

interface TaskStatus {
  success: boolean;
  task_id: string;
  status?: string;
  total_links?: number;
  indexed?: number;
  not_indexed?: number;
  pending?: number;
}

const TYPE_LABELS: Record<string, string> = {
  product: "Products",
  thread: "Threads",
  article: "Articles",
  listicle: "Listicles",
  bonus: "Bonuses",
};

const ALL_TYPES = Object.keys(TYPE_LABELS);

export default function IndexingPage() {
  const [settings, setSettings] = useState<Settings>({
    enabled: false,
    apiKey: "",
    batchSize: 100,
    autoSubmit: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [urls, setUrls] = useState<PostUrl[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([...ALL_TYPES]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vip, setVip] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [recentHours, setRecentHours] = useState(24);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/indexing/settings").then((r) => r.json()),
      fetch("/api/admin/indexing").then((r) => r.json()),
    ])
      .then(([settingsData, urlData]) => {
        setSettings(settingsData);
        setUrls(urlData.urls ?? []);
        setSummary(urlData.summary ?? null);
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load data" }))
      .finally(() => {
        setSettingsLoading(false);
        setLoading(false);
      });
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/indexing/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setSettings(data);
        setMessage({ type: "ok", text: "Settings saved." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmitResult = (data: TaskResult) => {
    if (data.success && (data.task_id || data.task_ids?.length)) {
      const ids = data.task_ids ?? (data.task_id ? [data.task_id] : []);
      setTaskIds(ids);
      setActiveTaskId(ids[0] ?? null);
      const batchInfo = (data.batch_count ?? 0) > 1
        ? ` across ${data.batch_count} batches (${data.batch_size} per batch)`
        : "";
      setMessage({
        type: "ok",
        text: `Submitted ${data.submitted_count} URLs${batchInfo}.`,
      });
    } else {
      setMessage({ type: "error", text: data.error ?? data.message ?? "Submission failed" });
    }
  };

  const submitAll = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/indexing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit_all", types: selectedTypes, vip }),
      });
      handleSubmitResult(await res.json());
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  const submitRecent = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/indexing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit_recent", hours: recentHours, vip }),
      });
      handleSubmitResult(await res.json());
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  const checkStatus = useCallback(async (tid?: string) => {
    const id = tid ?? activeTaskId;
    if (!id) return;
    setCheckingStatus(true);
    try {
      const res = await fetch(`/api/admin/indexing?action=task_status&task_id=${id}`);
      const data = await res.json();
      setTaskStatus(data);
      setActiveTaskId(id);
    } catch {
      setMessage({ type: "error", text: "Failed to check status" });
    } finally {
      setCheckingStatus(false);
    }
  }, [activeTaskId]);

  const selectedCount = urls.filter((u) => selectedTypes.includes(u.type)).length;
  const isConfigured = settings.enabled && settings.apiKey.length > 0;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Rapid Indexer</h1>
      <p className="mt-2 text-slate-600">
        Submit URLs to Rapid Indexer for fast Google indexing.
      </p>

      {message && (
        <div
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            message.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Settings Panel */}
      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              settings.enabled
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-500"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${settings.enabled ? "bg-emerald-500" : "bg-slate-400"}`} />
              {settings.enabled ? "Active" : "Disabled"}
            </span>
          </div>
        </div>

        {settingsLoading ? (
          <div className="mt-4 text-sm text-slate-500">Loading settings...</div>
        ) : (
          <div className="mt-5 space-y-5">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-700">Enable Rapid Indexer</div>
                <div className="text-xs text-slate-500">Turn on to allow URL submissions and auto-indexing</div>
              </div>
              <button
                onClick={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  settings.enabled ? "bg-emerald-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    settings.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                API Key
              </label>
              <p className="text-xs text-slate-500">
                From your{" "}
                <a href="https://rapid-indexer.com/api_access" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">
                  Rapid Indexer account
                </a>
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={settings.apiKey}
                  onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value }))}
                  placeholder="Enter your API key"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {showApiKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Batch Size */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Batch Size
              </label>
              <p className="text-xs text-slate-500">
                Maximum number of URLs sent per API request. Large submissions are split into batches of this size.
              </p>
              <select
                value={settings.batchSize}
                onChange={(e) => setSettings((s) => ({ ...s, batchSize: Number(e.target.value) }))}
                className="mt-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
                <option value={1000}>1,000</option>
              </select>
            </div>

            {/* Auto-Submit Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-700">Auto-submit new posts</div>
                <div className="text-xs text-slate-500">Automatically submit each new published post for indexing</div>
              </div>
              <button
                onClick={() => setSettings((s) => ({ ...s, autoSubmit: !s.autoSubmit }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  settings.autoSubmit ? "bg-emerald-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    settings.autoSubmit ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {savingSettings ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-8 text-slate-500">Loading URLs...</div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-2xl font-bold text-slate-900">{summary.total}</div>
                <div className="text-xs text-slate-500">Total URLs</div>
              </div>
              {ALL_TYPES.map((type) => (
                <div key={type} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="text-2xl font-bold text-slate-900">{summary.byType[type] ?? 0}</div>
                  <div className="text-xs text-slate-500">{TYPE_LABELS[type]}</div>
                </div>
              ))}
            </div>
          )}

          {/* Bulk Submit Section */}
          <div className={`mt-8 rounded-lg border border-slate-200 bg-white p-6 ${!isConfigured ? "opacity-60 pointer-events-none" : ""}`}>
            <h2 className="text-lg font-semibold text-slate-900">Submit All Published URLs</h2>
            {!isConfigured && (
              <p className="mt-1 text-sm text-amber-600">
                Enable Rapid Indexer and set your API key in settings above to submit URLs.
              </p>
            )}
            <p className="mt-1 text-sm text-slate-500">
              Select which post types to submit for indexing.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {ALL_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    selectedTypes.includes(type)
                      ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300"
                      : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                  }`}
                >
                  {TYPE_LABELS[type]} ({summary?.byType[type] ?? 0})
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={vip}
                  onChange={(e) => setVip(e.target.checked)}
                  className="rounded border-slate-300"
                />
                VIP Queue (faster, costs extra credits)
              </label>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={submitAll}
                disabled={submitting || selectedTypes.length === 0 || !isConfigured}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : `Submit ${selectedCount} URLs`}
              </button>
              {selectedCount > settings.batchSize && (
                <span className="text-xs text-slate-500">
                  Will be split into {Math.ceil(selectedCount / settings.batchSize)} batches of {settings.batchSize}
                </span>
              )}
            </div>
          </div>

          {/* Recent Posts Section */}
          <div className={`mt-6 rounded-lg border border-slate-200 bg-white p-6 ${!isConfigured ? "opacity-60 pointer-events-none" : ""}`}>
            <h2 className="text-lg font-semibold text-slate-900">Submit Recent Posts</h2>
            <p className="mt-1 text-sm text-slate-500">
              Quickly submit only posts published within a time window.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-slate-600">Posts from the last</span>
              <select
                value={recentHours}
                onChange={(e) => setRecentHours(Number(e.target.value))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>3 days</option>
                <option value={168}>7 days</option>
              </select>
              <button
                onClick={submitRecent}
                disabled={submitting || !isConfigured}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Recent"}
              </button>
            </div>
          </div>

          {/* Task Status Section */}
          {taskIds.length > 0 && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Task Status</h2>

              {taskIds.length > 1 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {taskIds.map((tid, i) => (
                    <button
                      key={tid}
                      onClick={() => { setActiveTaskId(tid); setTaskStatus(null); checkStatus(tid); }}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        activeTaskId === tid
                          ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Batch {i + 1}
                    </button>
                  ))}
                </div>
              )}

              <p className="mt-2 text-sm text-slate-500">
                Task ID: <code className="rounded bg-slate-100 px-2 py-0.5 text-xs">{activeTaskId}</code>
              </p>

              <button
                onClick={() => checkStatus()}
                disabled={checkingStatus}
                className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {checkingStatus ? "Checking..." : "Refresh Status"}
              </button>

              {taskStatus && (
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-lg font-bold text-slate-900">{taskStatus.status ?? "—"}</div>
                    <div className="text-xs text-slate-500">Status</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <div className="text-lg font-bold text-emerald-700">{taskStatus.indexed ?? 0}</div>
                    <div className="text-xs text-slate-500">Indexed</div>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3">
                    <div className="text-lg font-bold text-amber-700">{taskStatus.pending ?? 0}</div>
                    <div className="text-xs text-slate-500">Pending</div>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3">
                    <div className="text-lg font-bold text-red-700">{taskStatus.not_indexed ?? 0}</div>
                    <div className="text-xs text-slate-500">Not Indexed</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Task Check */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Check Existing Task</h2>
            <p className="mt-1 text-sm text-slate-500">
              Paste a task ID from a previous submission to check its status.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="text"
                placeholder="Enter task ID"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      setActiveTaskId(val);
                      setTaskIds([val]);
                      setTaskStatus(null);
                      checkStatus(val);
                    }
                  }
                }}
              />
              <button
                onClick={() => checkStatus()}
                disabled={checkingStatus || !activeTaskId}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Check
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
