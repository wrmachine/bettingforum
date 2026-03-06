"use client";

import { useEffect, useState } from "react";

interface AdData {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;
  width: number;
  height: number;
}

interface AdSlotProps {
  slot: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function AdSlot({ slot, className = "", fallback }: AdSlotProps) {
  const [ad, setAd] = useState<AdData | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/ads/serve?slot=${encodeURIComponent(slot)}`)
      .then((r) => r.json())
      .then((data) => setAd(data.ad ?? null))
      .catch(() => setAd(null));
  }, [slot]);

  if (ad === undefined) {
    return (
      <div
        className={`flex min-h-[200px] items-center justify-center rounded-2xl bg-slate-100 ${className}`}
      >
        <span className="text-xs text-slate-400">Loading ad…</span>
      </div>
    );
  }

  if (!ad) {
    if (fallback) return <>{fallback}</>;
    return (
      <div
        className={`flex min-h-[200px] flex-col items-center justify-center rounded-2xl bg-slate-800 px-6 py-8 text-center ${className}`}
      >
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Ad Space</span>
        <p className="mt-2 text-sm text-slate-300">Available</p>
        <p className="mt-1 text-xs text-slate-500">Configure ads in Admin</p>
      </div>
    );
  }

  const clickUrl = `/api/ads/${ad.id}/click`;

  return (
    <a
      href={clickUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`block overflow-hidden rounded-2xl bg-slate-800 ${className}`}
      aria-label={`Ad: ${ad.name}`}
    >
      <div
        className="relative overflow-hidden"
        style={{ width: ad.width, height: ad.height, maxWidth: "100%" }}
      >
        <img
          src={ad.imageUrl}
          alt={ad.name}
          width={ad.width}
          height={ad.height}
          className="h-full w-full object-contain"
        />
      </div>
    </a>
  );
}
