"use client";

import { useState } from "react";
import Link from "next/link";
import { RichTextEditor } from "@/components/RichTextEditor";

interface ListItem {
  id: string;
  productId: string;
  position: number;
  note: string | null;
  product: {
    id: string;
    brandName: string;
    shortDescription: string | null;
    post: { slug: string; title: string };
  };
}

interface ProductOption {
  id: string;
  brandName: string;
  slug: string;
  title: string;
  productType?: string;
  bonusSummary?: string | null;
  shortDescription?: string | null;
}

interface ListicleEditFormProps {
  slug: string;
  initialData: {
    title: string;
    titleOverride: string | null;
    intro: string | null;
    body: string;
    items: ListItem[];
  };
  products: ProductOption[];
}

export function ListicleEditForm({ slug, initialData, products }: ListicleEditFormProps) {
  const [title, setTitle] = useState(initialData.title);
  const [titleOverride, setTitleOverride] = useState(initialData.titleOverride ?? "");
  const [intro, setIntro] = useState(initialData.intro ?? "");
  const [body, setBody] = useState(initialData.body ?? "");
  const [items, setItems] = useState<{ productId: string; position: number; note: string }[]>(
    initialData.items.map((i) => ({
      productId: i.productId,
      position: i.position,
      note: i.note ?? "",
    }))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [aiLoading, setAiLoading] = useState<"intro" | "picks" | "body" | null>(null);

  const callAi = async (action: "intro" | "picks" | "body", extra?: Record<string, unknown>) => {
    setAiLoading(action);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ai/listicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          title: title.trim() || "Untitled listicle",
          intro: action === "intro" ? intro : undefined,
          body: action === "body" ? body : undefined,
          productTypeFilter: action === "picks" ? extra?.productTypeFilter ?? null : undefined,
          maxPicks: action === "picks" ? extra?.maxPicks ?? 10 : undefined,
          products:
            action === "picks"
              ? products.map((p) => ({
                  id: p.id,
                  brandName: p.brandName,
                  productType: p.productType ?? "casino",
                  bonusSummary: p.bonusSummary ?? null,
                  shortDescription: p.shortDescription ?? null,
                }))
              : undefined,
          selectedProductIds: action === "picks" ? items.map((i) => i.productId) : undefined,
          pickedProductNames:
            action === "body"
              ? items.map((i) => getProductName(i.productId))
              : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "AI request failed");
      }
      const data = await res.json();
      if (action === "intro" && data.html) setIntro(data.html);
      if (action === "body" && data.html) setBody(data.html);
      if (action === "picks" && data.productIds?.length) {
        setItems(
          data.productIds.map((productId: string, i: number) => ({
            productId,
            position: i,
            note: "",
          }))
        );
        setMessage({ type: "ok", text: `AI picked ${data.productIds.length} products. Review and save.` });
      } else if (action === "intro" || action === "body") {
        setMessage({ type: "ok", text: "Content generated. Review and edit as needed." });
      }
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "AI request failed" });
    } finally {
      setAiLoading(null);
    }
  };

  const addItem = (productId: string) => {
    if (!productId) return;
    if (items.some((i) => i.productId === productId)) return;
    setItems((prev) => [
      ...prev,
      { productId, position: prev.length, note: "" },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index).map((it, i) => ({ ...it, position: i })));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    const next = [...items];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    setItems(next.map((it, i) => ({ ...it, position: i })));
  };

  const updateItemNote = (index: number, note: string) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, note } : it)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/listicles/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          titleOverride: titleOverride.trim() || null,
          intro: intro.trim() || null,
          body: body.trim() || null,
          items: items.map((it, i) => ({
            productId: it.productId,
            position: i,
            note: it.note.trim() || undefined,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Save failed");
      }
      setMessage({ type: "ok", text: "Saved successfully." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const getProductName = (productId: string) =>
    products.find((p) => p.id === productId)?.brandName ?? products.find((p) => p.id === productId)?.title ?? "Unknown";

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">List Details</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
              placeholder="e.g. Best Crypto Casinos 2026"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Title Override</label>
            <p className="mt-0.5 text-xs text-slate-500">Optional. Overrides the title on the listicle page.</p>
            <input
              type="text"
              value={titleOverride}
              onChange={(e) => setTitleOverride(e.target.value)}
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Leave empty to use title"
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <label className="block text-sm font-medium text-slate-700">Introduction</label>
              <button
                type="button"
                onClick={() => callAi("intro")}
                disabled={!!aiLoading || !title.trim()}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {aiLoading === "intro" ? "Generating…" : "AI Write"}
              </button>
            </div>
            <RichTextEditor
              value={intro}
              onChange={setIntro}
              placeholder="Introduce your list..."
              minHeight="8rem"
              allowMedia={true}
              uploadEndpoint="/api/admin/upload"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Bottom Content</h2>
            <p className="mt-1 text-sm text-slate-600">
              Content shown below the list. Use for methodology, FAQ, or closing paragraphs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => callAi("body")}
            disabled={!!aiLoading || !title.trim()}
            className="shrink-0 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {aiLoading === "body" ? "Generating…" : "AI Write"}
          </button>
        </div>
        <RichTextEditor
          value={body}
          onChange={setBody}
          placeholder="How we ranked these..."
          minHeight="16rem"
          className="mt-4"
          allowMedia={true}
          uploadEndpoint="/api/admin/upload"
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">List Items</h2>
        <p className="mt-1 text-sm text-slate-600">
          Add products and optional per-item notes. Products show their short description if no note is set.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600">AI Pick:</span>
          <select
            id="ai-pick-type"
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="">Any type</option>
            <option value="casino">Casino</option>
            <option value="sportsbook">Sportsbook</option>
            <option value="crypto">Crypto</option>
            <option value="tool">Tool</option>
            <option value="tipster">Tipster</option>
          </select>
          <select
            id="ai-pick-count"
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
          </select>
          <button
            type="button"
            onClick={() => {
              const typeEl = document.getElementById("ai-pick-type") as HTMLSelectElement;
              const countEl = document.getElementById("ai-pick-count") as HTMLSelectElement;
              callAi("picks", {
                productTypeFilter: typeEl?.value || null,
                maxPicks: parseInt(String(countEl?.value), 10) || 10,
              });
            }}
            disabled={!!aiLoading || !title.trim() || products.length === 0}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {aiLoading === "picks" ? "Picking…" : "AI Pick Products"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <select
            onChange={(e) => {
              const v = e.target.value;
              if (v) addItem(v);
              e.target.value = "";
            }}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">+ Add product</option>
            {products
              .filter((p) => !items.some((i) => i.productId === p.id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brandName}
                </option>
              ))}
          </select>
          {products.filter((p) => !items.some((i) => i.productId === p.id)).length === 0 && items.length > 0 && (
            <span className="text-sm text-slate-500">All products added</span>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {items.map((item, index) => (
            <div
              key={item.productId}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-felt/20 font-bold text-felt">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${products.find((p) => p.id === item.productId)?.slug ?? "#"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-slate-900 hover:text-felt hover:underline"
                  >
                    {getProductName(item.productId)}
                  </Link>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                    className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, "down")}
                    disabled={index === items.length - 1}
                    className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500">Note (overrides product short description)</label>
                <RichTextEditor
                  value={item.note}
                  onChange={(html) => updateItemNote(index, html)}
                  placeholder="Optional per-item description"
                  minHeight="4rem"
                  allowMedia={false}
                  uploadEndpoint="/api/admin/upload"
                  className="mt-1"
                />
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-slate-500">
              No items yet. Add products from the dropdown above.
            </p>
          )}
        </div>
      </section>

      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-felt px-6 py-2 font-medium text-white hover:bg-felt/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <p className="mt-2 text-xs text-slate-500">
          Items only appear on the live page after you save.
        </p>
      </div>
    </form>
  );
}
