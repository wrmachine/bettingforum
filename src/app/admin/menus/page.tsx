"use client";

import { useEffect, useState } from "react";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  order: number;
  location: string;
  parentId: string | null;
  parent?: MenuItem | null;
  children?: MenuItem[];
}

const LOCATIONS = [
  { value: "header_main", label: "Header (main nav)" },
  { value: "header_secondary", label: "Header (bottom bar)" },
  { value: "footer_services", label: "Footer - Services" },
  { value: "footer_helpful", label: "Footer - Helpful Links" },
  { value: "footer_information", label: "Footer - Information" },
  { value: "footer_legal", label: "Footer - Legal" },
];

export default function AdminMenusPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<MenuItem>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [filterLocation, setFilterLocation] = useState<string>("");

  const load = () =>
    fetch("/api/admin/menus")
      .then((r) => r.json())
      .then(setItems);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const filteredItems = filterLocation
    ? items.filter((i) => i.location === filterLocation)
    : items;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await fetch(`/api/admin/menus/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setEditing(null);
      } else {
        await fetch("/api/admin/menus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setShowAdd(false);
      }
      setForm({});
      load();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    await fetch(`/api/admin/menus/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Menu Items</h1>
      <p className="mt-1 text-slate-600">
        Edit header and footer navigation. Items with children appear as dropdowns.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All locations</option>
          {LOCATIONS.map((loc) => (
            <option key={loc.value} value={loc.value}>
              {loc.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setShowAdd(true);
            setForm({ label: "", href: "/", order: 0, location: filterLocation || "header_main" });
          }}
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Add Item
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSave} className="mt-6 max-w-xl space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-6">
          <h3 className="font-semibold">New Menu Item</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700">Label</label>
            <input
              required
              value={form.label ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Href</label>
            <input
              required
              value={form.href ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
              placeholder="/about"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Location</label>
            <select
              value={form.location ?? "header_main"}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Order</label>
            <input
              type="number"
              value={form.order ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
              Save
            </button>
            <button
              type="button"
              onClick={() => { setShowAdd(false); setForm({}); }}
              className="rounded border px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-6">
        {LOCATIONS.filter((loc) => !filterLocation || loc.value === filterLocation).map((loc) => {
          const locItems = filteredItems.filter((i) => i.location === loc.value && !i.parentId);
          if (locItems.length === 0) return null;
          return (
            <div key={loc.value} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">{loc.label}</h3>
              <div className="space-y-3">
                {locItems.map((item) => (
                  <div key={item.id} className="rounded border border-slate-100 p-3">
                    {editing === item.id ? (
                      <form onSubmit={handleSave} className="space-y-3">
                        <input
                          required
                          value={form.label ?? item.label}
                          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                          placeholder="Label"
                          className="w-full rounded border px-3 py-2"
                        />
                        <input
                          required
                          value={form.href ?? item.href}
                          onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
                          placeholder="/path"
                          className="w-full rounded border px-3 py-2"
                        />
                        <input
                          type="number"
                          value={form.order ?? item.order}
                          onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
                          className="w-24 rounded border px-3 py-2"
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditing(null); setForm({}); }}
                            className="rounded border px-4 py-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{item.label}</span>
                          <span className="ml-2 text-sm text-slate-500">{item.href}</span>
                          {item.children && item.children.length > 0 && (
                            <div className="mt-1 text-xs text-slate-400">
                              + {item.children.length} child(ren)
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditing(item.id); setForm(item); }}
                            className="text-sm text-emerald-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
