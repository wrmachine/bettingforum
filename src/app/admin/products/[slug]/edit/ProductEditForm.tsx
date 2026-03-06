"use client";

import { useState, useRef } from "react";
import {
  BANKING_OPTIONS,
  CRYPTO_OPTIONS,
  parseBankingMethods,
  parseCryptoMethods,
  type BankingMethodEntry,
  type CryptoMethodEntry,
} from "@/lib/product-options";
import { ProductContentEditor } from "@/components/ProductContentEditor";
import { RichTextEditor } from "@/components/RichTextEditor";
import { PRODUCT_TYPES, parseProductTypes, serializeProductTypes } from "@/lib/product-types";

interface Product {
  id: string;
  brandName: string;
  siteUrl: string | null;
  productType: string;
  licenseJurisdiction: string | null;
  geoRestrictions: string | null;
  bankingMethods: string | null;
  cryptoMethods: string | null;
  logoUrl: string | null;
  media: string | null;
  acceptedCurrencies: string | null;
  bonusSummary: string | null;
  minDeposit: string | null;
  shortDescription: string | null;
  cryptoSupported: boolean;
  fiatSupported: boolean;
}

interface PostInfo {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
}

interface ProductEditFormProps {
  product: Product;
  post: PostInfo;
}

type MediaItem = { type: string; url: string; alt?: string; caption?: string };

export function ProductEditForm({ product, post }: ProductEditFormProps) {
  const [brandName, setBrandName] = useState(product.brandName ?? "");
  const [siteUrl, setSiteUrl] = useState(product.siteUrl ?? "");
  const [productTypes, setProductTypes] = useState<string[]>(
    () => parseProductTypes(product.productType)
  );
  const toggleProductType = (type: string) => {
    setProductTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };
  const [licenseJurisdiction, setLicenseJurisdiction] = useState(
    product.licenseJurisdiction ?? ""
  );
  const [geoRestrictions, setGeoRestrictions] = useState(product.geoRestrictions ?? "");
  const [bonusSummary, setBonusSummary] = useState(product.bonusSummary ?? "");
  const [minDeposit, setMinDeposit] = useState(product.minDeposit ?? "");
  const [shortDescription, setShortDescription] = useState(product.shortDescription ?? "");

  const [postExcerpt, setPostExcerpt] = useState(post.excerpt ?? "");

  const [logoUrl, setLogoUrl] = useState(product.logoUrl ?? "");
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    if (!product.media?.trim()) return [];
    try {
      const p = JSON.parse(product.media);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  });
  const [mediaUploading, setMediaUploading] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const [acceptedCurrencies, setAcceptedCurrencies] = useState(() => {
    if (!product.acceptedCurrencies?.trim()) return '["USD"]';
    try {
      const p = JSON.parse(product.acceptedCurrencies);
      return JSON.stringify(Array.isArray(p) ? p : ["USD"]);
    } catch {
      return '["USD"]';
    }
  });
  const [cryptoSupported, setCryptoSupported] = useState(product.cryptoSupported);
  const [fiatSupported, setFiatSupported] = useState(product.fiatSupported);

  const [selectedBanking, setSelectedBanking] = useState<BankingMethodEntry[]>(
    () => parseBankingMethods(product.bankingMethods)
  );
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoMethodEntry[]>(
    () => parseCryptoMethods(product.cryptoMethods)
  );
  const [mainContent, setMainContent] = useState(post.body ?? "");

  const [saving, setSaving] = useState(false);
  const [aiCompleting, setAiCompleting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleAiComplete = async () => {
    setAiCompleting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ai/complete-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            brandName: brandName || product.brandName,
            productType: serializeProductTypes(productTypes as ("sportsbook" | "casino" | "crypto" | "tool" | "tipster")[]),
            siteUrl: siteUrl.trim() || null,
            bonusSummary: bonusSummary.trim() || null,
            minDeposit: minDeposit.trim() || null,
            shortDescription: shortDescription.trim() || null,
            licenseJurisdiction: licenseJurisdiction.trim() || null,
            geoRestrictions: geoRestrictions.trim() || null,
            fiatSupported: fiatSupported,
            cryptoSupported: cryptoSupported,
          },
          post: {
            title: post.title,
            excerpt: postExcerpt.trim() || post.excerpt,
            body: mainContent || null,
          },
          currentBody: mainContent || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "AI completion failed");
      }
      const data = await res.json();
      if (data.html) setMainContent(data.html);
      if (data.excerpt != null) setPostExcerpt(data.excerpt);
      if (data.bonusSummary != null) setBonusSummary(data.bonusSummary);
      if (data.minDeposit != null) setMinDeposit(data.minDeposit);
      if (data.shortDescription != null) setShortDescription(data.shortDescription);
      if (data.licenseJurisdiction != null) setLicenseJurisdiction(data.licenseJurisdiction);
      if (data.geoRestrictions != null) setGeoRestrictions(data.geoRestrictions);
      setMessage({ type: "ok", text: "Content generated. Review and edit as needed." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "AI completion failed" });
    } finally {
      setAiCompleting(false);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Upload failed");
    }
    const { url } = await res.json();
    return url;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadFile(file);
      setLogoUrl(url);
      setMessage({ type: "ok", text: "Logo uploaded." });
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Logo upload failed",
      });
    } finally {
      setLogoUploading(false);
      e.target.value = "";
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaUploading(true);
    try {
      const url = await uploadFile(file);
      setMediaItems((prev) => [
        ...prev,
        {
          type: "screenshot",
          url,
          alt: file.name,
          caption: "",
        },
      ]);
      setMessage({ type: "ok", text: "Image added to media." });
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setMediaUploading(false);
      e.target.value = "";
    }
  };

  const removeMediaItem = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleBanking = (id: string) => {
    setSelectedBanking((prev) => {
      const exists = prev.find((x) => x.id.toLowerCase() === id.toLowerCase());
      if (exists) return prev.filter((x) => x.id.toLowerCase() !== id.toLowerCase());
      return [
        ...prev,
        {
          id: id.toLowerCase(),
          deposit: { min: 10, max: 30000, fee: "FREE" },
          withdrawal: { fee: "FREE" },
        },
      ];
    });
  };

  const toggleCrypto = (id: string) => {
    setSelectedCrypto((prev) => {
      const exists = prev.find((x) => x.id.toLowerCase() === id.toLowerCase());
      if (exists) return prev.filter((x) => x.id.toLowerCase() !== id.toLowerCase());
      return [...prev, { id: id.toLowerCase() }];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      let currenciesVal: string | null = null;
      try {
        const parsed = JSON.parse(acceptedCurrencies);
        currenciesVal = JSON.stringify(Array.isArray(parsed) ? parsed : ["USD"]);
      } catch {
        currenciesVal = '["USD"]';
      }

      const productRes = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim() || product.brandName,
          siteUrl: siteUrl.trim() || null,
          productType: productTypes.length > 0 ? serializeProductTypes(productTypes as ("sportsbook" | "casino" | "crypto" | "tool" | "tipster")[]) : serializeProductTypes(["sportsbook"]),
          licenseJurisdiction: licenseJurisdiction.trim() || null,
          geoRestrictions: geoRestrictions.trim() || null,
          bonusSummary: bonusSummary.trim() || null,
          minDeposit: minDeposit.trim() || null,
          shortDescription: shortDescription.trim() || null,
          logoUrl: logoUrl.trim() || null,
          media: JSON.stringify(mediaItems),
          bankingMethods: JSON.stringify(selectedBanking),
          cryptoMethods: JSON.stringify(selectedCrypto),
          acceptedCurrencies: currenciesVal,
          cryptoSupported,
          fiatSupported,
        }),
      });
      if (!productRes.ok) {
        const err = await productRes.json();
        throw new Error(err.error ?? "Product update failed");
      }

      const postRes = await fetch(`/api/posts/${post.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postBody: mainContent || null,
          excerpt: postExcerpt.trim() || null,
        }),
      });
      if (!postRes.ok) {
        const err = await postRes.json();
        throw new Error(err.error ?? "Content update failed");
      }

      setMessage({ type: "ok", text: "Saved successfully." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Basic Info</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Brand name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Bet365"
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Product types</label>
            <p className="mt-1 text-xs text-slate-500">Select all that apply</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRODUCT_TYPES.map((t) => {
                const active = productTypes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleProductType(t)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "border-felt bg-felt text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Site URL</label>
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              License / jurisdiction
            </label>
            <input
              type="text"
              value={licenseJurisdiction}
              onChange={(e) => setLicenseJurisdiction(e.target.value)}
              placeholder="e.g. Malta, UK Gambling Commission"
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Geo restrictions
            </label>
            <input
              type="text"
              value={geoRestrictions}
              onChange={(e) => setGeoRestrictions(e.target.value)}
              placeholder="e.g. US, France"
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Bonus summary</label>
            <input
              type="text"
              value={bonusSummary}
              onChange={(e) => setBonusSummary(e.target.value)}
              placeholder="e.g. 100% up to $500"
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Minimum deposit</label>
            <input
              type="text"
              value={minDeposit}
              onChange={(e) => setMinDeposit(e.target.value)}
              placeholder="e.g. $10"
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Short description</label>
            <p className="mt-1 text-xs text-slate-500">Used in listicles when this product is listed</p>
            <RichTextEditor
              value={shortDescription}
              onChange={setShortDescription}
              placeholder="1-2 punchy sentences for listicle cards"
              minHeight="4rem"
              allowMedia={false}
              uploadEndpoint="/api/admin/upload"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Excerpt</label>
            <p className="mt-1 text-xs text-slate-500">Product page summary / meta description</p>
            <RichTextEditor
              value={postExcerpt}
              onChange={setPostExcerpt}
              placeholder="Brief summary for product page"
              minHeight="4rem"
              allowMedia={false}
              uploadEndpoint="/api/admin/upload"
              className="mt-1"
            />
          </div>
        </div>
      </section>

      {/* Main content – Full HTML editor */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Main content</h2>
            <p className="mt-1 text-sm text-slate-600">
              Custom review text. Use the toolbar for bold, headings, lists, images, tables, and links.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAiComplete}
            disabled={aiCompleting}
            className="rounded-lg border border-felt bg-felt px-4 py-2 text-sm font-medium text-white hover:bg-felt/90 disabled:opacity-50"
          >
            {aiCompleting ? "Generating…" : "AI Complete"}
          </button>
        </div>
        <div className="mt-3">
          <ProductContentEditor
            value={mainContent}
            onChange={setMainContent}
            placeholder="Write your product review..."
            minHeight="20rem"
          />
        </div>
      </section>

      {/* Logo – upload + URL */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Logo</h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex shrink-0 flex-col gap-2">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              {logoUploading ? "Uploading…" : "Upload logo"}
            </button>
            {logoUrl && (
              <div className="h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <label className="block text-sm font-medium text-slate-700">Or paste image URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
        </div>
      </section>

      {/* Banking */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Payment methods</h2>
        <div className="mt-2 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={fiatSupported}
              onChange={(e) => setFiatSupported(e.target.checked)}
            />
            <span className="text-sm">Fiat supported</span>
          </label>
        </div>
        <p className="mt-2 text-sm text-slate-600">Select banking methods.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(BANKING_OPTIONS).map(([id, opt]) => {
            const active = selectedBanking.some(
              (x) => x.id.toLowerCase() === id.toLowerCase()
            );
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleBanking(id)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-felt bg-felt text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {opt.displayName}
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">
            Accepted currencies (JSON array)
          </label>
          <textarea
            value={acceptedCurrencies}
            onChange={(e) => setAcceptedCurrencies(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
          />
        </div>
      </section>

      {/* Crypto */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Cryptocurrency</h2>
        <div className="mt-2 flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={cryptoSupported}
              onChange={(e) => setCryptoSupported(e.target.checked)}
            />
            <span className="text-sm">Supports cryptocurrency</span>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(CRYPTO_OPTIONS).map(([id, opt]) => {
            const active = selectedCrypto.some(
              (x) => x.id.toLowerCase() === id.toLowerCase()
            );
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleCrypto(id)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-felt bg-felt text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {opt.name} ({opt.symbol})
              </button>
            );
          })}
        </div>
      </section>

      {/* Media – upload + list */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Media (screenshots, photos)</h2>
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleMediaUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => mediaInputRef.current?.click()}
          disabled={mediaUploading}
          className="mt-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          {mediaUploading ? "Uploading…" : "Upload image"}
        </button>
        <div className="mt-4 space-y-3">
          {mediaItems.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <img
                src={item.url}
                alt={item.alt ?? ""}
                className="h-16 w-24 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  value={item.caption ?? ""}
                  onChange={(e) => {
                    const next = [...mediaItems];
                    next[i] = { ...next[i], caption: e.target.value };
                    setMediaItems(next);
                  }}
                  placeholder="Caption"
                  className="block w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeMediaItem(i)}
                className="shrink-0 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {mediaItems.length === 0 && (
          <p className="mt-2 text-sm text-slate-500">No media yet. Click Upload image to add.</p>
        )}
      </section>

      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "ok"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-felt px-6 py-2 font-medium text-white hover:bg-felt-dark disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
