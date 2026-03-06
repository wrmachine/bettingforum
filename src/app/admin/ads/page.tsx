"use client";

import { useEffect, useState } from "react";

interface AdSpace {
  id: string;
  name: string;
  slot: string;
  width: number;
  height: number;
  rotation: string;
  enabled: boolean;
  _count?: { ads: number };
  ads?: { id: string; name: string; active: boolean; clicks: number; impressions: number }[];
}

interface Ad {
  id: string;
  adSpaceId: string;
  name: string;
  imageUrl: string;
  linkUrl: string;
  weight: number;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  impressions: number;
  clicks: number;
  order: number;
  adSpace?: { id: string; name: string; slot: string };
}

const ROTATION_OPTIONS = [
  { value: "random", label: "Random" },
  { value: "round_robin", label: "Round Robin" },
  { value: "weighted", label: "Weighted" },
];

export default function AdminAdsPage() {
  const [spaces, setSpaces] = useState<AdSpace[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"spaces" | "ads">("spaces");
  const [editingSpace, setEditingSpace] = useState<string | null>(null);
  const [editingAd, setEditingAd] = useState<string | null>(null);
  const [showSpaceForm, setShowSpaceForm] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const [spaceForm, setSpaceForm] = useState<Partial<AdSpace>>({});
  const [adForm, setAdForm] = useState<Partial<Ad>>({});
  const [adSpaceFilter, setAdSpaceFilter] = useState<string>("");

  const load = () => {
    Promise.all([
      fetch("/api/admin/ads/spaces").then((r) => r.json()),
      fetch("/api/admin/ads").then((r) => r.json()),
    ])
      .then(([s, a]) => {
        setSpaces(s);
        setAds(a);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSpace) {
        await fetch(`/api/admin/ads/spaces/${editingSpace}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(spaceForm),
        });
        setEditingSpace(null);
      } else {
        await fetch("/api/admin/ads/spaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(spaceForm),
        });
        setShowSpaceForm(false);
      }
      setSpaceForm({});
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await fetch(`/api/admin/ads/${editingAd}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(adForm),
        });
        setEditingAd(null);
      } else {
        await fetch("/api/admin/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(adForm),
        });
        setShowAdForm(false);
      }
      setAdForm({});
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSpace = async (id: string) => {
    if (!confirm("Delete this ad space and all its ads?")) return;
    await fetch(`/api/admin/ads/spaces/${id}`, { method: "DELETE" });
    load();
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Delete this ad?")) return;
    await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
    load();
  };

  const filteredAds = adSpaceFilter ? ads.filter((a) => a.adSpaceId === adSpaceFilter) : ads;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ad Management</h1>
        <p className="mt-1 text-slate-600">
          Create ad spaces, add ads, track impressions and clicks, and control rotation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("spaces")}
          className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition ${
            activeTab === "spaces"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Ad Spaces
        </button>
        <button
          onClick={() => setActiveTab("ads")}
          className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition ${
            activeTab === "ads"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Ads
        </button>
      </div>

      {/* Ad Spaces Tab */}
      {activeTab === "spaces" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Ad spaces define placement slots (e.g. footer_right). Use the slot name in your components.
            </p>
            <button
              onClick={() => {
                setShowSpaceForm(true);
                setSpaceForm({ name: "", slot: "", width: 300, height: 250, rotation: "random", enabled: true });
              }}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              + Add Ad Space
            </button>
          </div>

          {showSpaceForm && (
            <form
              onSubmit={handleSaveSpace}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">New Ad Space</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Name</label>
                  <input
                    required
                    value={spaceForm.name ?? ""}
                    onChange={(e) => setSpaceForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Footer Right"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Slot (code identifier)</label>
                  <input
                    required
                    value={spaceForm.slot ?? ""}
                    onChange={(e) =>
                      setSpaceForm((f) => ({
                        ...f,
                        slot: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                      }))
                    }
                    placeholder="footer_right"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Width</label>
                  <input
                    type="number"
                    min={1}
                    value={spaceForm.width ?? 300}
                    onChange={(e) => setSpaceForm((f) => ({ ...f, width: parseInt(e.target.value, 10) || 300 }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Height</label>
                  <input
                    type="number"
                    min={1}
                    value={spaceForm.height ?? 250}
                    onChange={(e) => setSpaceForm((f) => ({ ...f, height: parseInt(e.target.value, 10) || 250 }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Rotation</label>
                  <select
                    value={spaceForm.rotation ?? "random"}
                    onChange={(e) => setSpaceForm((f) => ({ ...f, rotation: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    {ROTATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={spaceForm.enabled !== false}
                      onChange={(e) => setSpaceForm((f) => ({ ...f, enabled: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Enabled</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSpaceForm(false);
                    setSpaceForm({});
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <div
                key={space.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {editingSpace === space.id ? (
                  <form onSubmit={handleSaveSpace} className="space-y-3">
                    <input
                      required
                      value={spaceForm.name ?? space.name}
                      onChange={(e) => setSpaceForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                      placeholder="Name"
                    />
                    <input
                      value={spaceForm.slot ?? space.slot}
                      onChange={(e) => setSpaceForm((f) => ({ ...f, slot: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                      placeholder="slot"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={spaceForm.width ?? space.width}
                        onChange={(e) => setSpaceForm((f) => ({ ...f, width: parseInt(e.target.value, 10) }))}
                        className="w-20 rounded border px-2 py-2 text-sm"
                      />
                      <span className="flex items-center text-slate-400">×</span>
                      <input
                        type="number"
                        value={spaceForm.height ?? space.height}
                        onChange={(e) => setSpaceForm((f) => ({ ...f, height: parseInt(e.target.value, 10) }))}
                        className="w-20 rounded border px-2 py-2 text-sm"
                      />
                    </div>
                    <select
                      value={spaceForm.rotation ?? space.rotation}
                      onChange={(e) => setSpaceForm((f) => ({ ...f, rotation: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    >
                      {ROTATION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSpace(null);
                          setSpaceForm({});
                        }}
                        className="rounded border px-3 py-1.5 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{space.name}</h3>
                        <p className="mt-0.5 font-mono text-xs text-slate-500">{space.slot}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {space.width} × {space.height}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400 capitalize">{space.rotation} rotation</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          space.enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {space.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                      <span className="text-xs text-slate-500">{space._count?.ads ?? space.ads?.length ?? 0} ads</span>
                      <div className="flex-1" />
                      <button
                        onClick={() => {
                          setEditingSpace(space.id);
                          setSpaceForm(space);
                        }}
                        className="text-sm text-emerald-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSpace(space.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {spaces.length === 0 && !showSpaceForm && (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center">
              <p className="text-slate-600">No ad spaces yet.</p>
              <p className="mt-1 text-sm text-slate-500">Add one to get started — e.g. footer_right for the footer.</p>
              <button
                onClick={() => {
                  setShowSpaceForm(true);
                  setSpaceForm({
                    name: "Footer Right",
                    slot: "footer_right",
                    width: 300,
                    height: 250,
                    rotation: "random",
                    enabled: true,
                  });
                }}
                className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Add First Ad Space
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ads Tab */}
      {activeTab === "ads" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={adSpaceFilter}
                onChange={(e) => setAdSpaceFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">All spaces</option>
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.slot})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setShowAdForm(true);
                setAdForm({
                  adSpaceId: adSpaceFilter || spaces[0]?.id || "",
                  name: "",
                  imageUrl: "",
                  linkUrl: "",
                  weight: 1,
                  active: true,
                  order: 0,
                });
              }}
              disabled={spaces.length === 0}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              + Add Ad
            </button>
          </div>

          {showAdForm && (
            <form
              onSubmit={handleSaveAd}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">New Ad</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Ad Space</label>
                  <select
                    required
                    value={adForm.adSpaceId ?? ""}
                    onChange={(e) => setAdForm((f) => ({ ...f, adSpaceId: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="">Select space</option>
                    {spaces.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.slot})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Name (internal)</label>
                  <input
                    required
                    value={adForm.name ?? ""}
                    onChange={(e) => setAdForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Summer Promo"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Image URL</label>
                  <input
                    required
                    type="url"
                    value={adForm.imageUrl ?? ""}
                    onChange={(e) => setAdForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Link URL</label>
                  <input
                    required
                    type="url"
                    value={adForm.linkUrl ?? ""}
                    onChange={(e) => setAdForm((f) => ({ ...f, linkUrl: e.target.value }))}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Weight (for weighted rotation)</label>
                  <input
                    type="number"
                    min={0}
                    value={adForm.weight ?? 1}
                    onChange={(e) => setAdForm((f) => ({ ...f, weight: parseInt(e.target.value, 10) || 0 }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Order (for round-robin)</label>
                  <input
                    type="number"
                    value={adForm.order ?? 0}
                    onChange={(e) => setAdForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div className="flex items-end sm:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={adForm.active !== false}
                      onChange={(e) => setAdForm((f) => ({ ...f, active: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdForm(false);
                    setAdForm({});
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Ad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Space
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Impressions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Clicks
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                    CTR
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          <img
                            src={ad.imageUrl}
                            alt={ad.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' fill='%2394a3b8'%3E%3Crect width='48' height='48' fill='%23e2e8f0'/%3E%3Ctext x='24' y='28' text-anchor='middle' font-size='12'%3ENo img%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{ad.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">{ad.linkUrl}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {ad.adSpace?.name ?? "-"} ({ad.adSpace?.slot ?? "-"})
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-slate-600">{ad.impressions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-slate-600">{ad.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-slate-600">
                      {ad.impressions > 0
                        ? ((ad.clicks / ad.impressions) * 100).toFixed(2) + "%"
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          ad.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {ad.active ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setEditingAd(ad.id);
                          setAdForm(ad);
                        }}
                        className="text-sm text-emerald-600 hover:underline"
                      >
                        Edit
                      </button>
                      {" · "}
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAds.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center">
              <p className="text-slate-600">
                {ads.length === 0 ? "No ads yet." : "No ads in the selected space."}
              </p>
              <p className="mt-1 text-sm text-slate-500">Add an ad space first, then create ads for it.</p>
              {spaces.length > 0 && (
                <button
                  onClick={() => {
                    setShowAdForm(true);
                    setAdForm({
                      adSpaceId: spaces[0].id,
                      name: "",
                      imageUrl: "",
                      linkUrl: "",
                      weight: 1,
                      active: true,
                      order: 0,
                    });
                  }}
                  className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Add First Ad
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Inline Edit Modal for Ad */}
      {editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSaveAd}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-slate-900">Edit Ad</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  required
                  value={adForm.name ?? ""}
                  onChange={(e) => setAdForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Image URL</label>
                <input
                  required
                  type="url"
                  value={adForm.imageUrl ?? ""}
                  onChange={(e) => setAdForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Link URL</label>
                <input
                  required
                  type="url"
                  value={adForm.linkUrl ?? ""}
                  onChange={(e) => setAdForm((f) => ({ ...f, linkUrl: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Weight</label>
                  <input
                    type="number"
                    min={0}
                    value={adForm.weight ?? 1}
                    onChange={(e) => setAdForm((f) => ({ ...f, weight: parseInt(e.target.value, 10) || 0 }))}
                    className="mt-1 w-24 rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Order</label>
                  <input
                    type="number"
                    value={adForm.order ?? 0}
                    onChange={(e) => setAdForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
                    className="mt-1 w-24 rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={adForm.active !== false}
                      onChange={(e) => setAdForm((f) => ({ ...f, active: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                    />
                    <span className="text-sm font-medium text-slate-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingAd(null);
                  setAdForm({});
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
