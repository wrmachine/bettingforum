"use client";

export interface MediaItem {
  type: "screenshot" | "photo" | "logo";
  url: string;
  alt?: string;
  caption?: string;
}

interface ProductMediaProps {
  logoUrl?: string | null;
  mediaJson?: string | null;
  title?: string;
}

function parseMedia(json: string | null | undefined): MediaItem[] {
  if (!json || typeof json !== "string") return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ProductMedia({
  logoUrl,
  mediaJson,
  title,
}: ProductMediaProps) {
  const mediaItems = parseMedia(mediaJson ?? null);
  const hasLogo = !!logoUrl;
  const hasMedia = mediaItems.length > 0;

  if (!hasLogo && !hasMedia) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Media</h2>

      {hasLogo && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-600">Logo</h3>
          <div className="flex items-center gap-4">
            <img
              src={logoUrl!}
              alt={title ? `${title} logo` : "Brand logo"}
              className="h-20 w-auto max-w-[200px] rounded-lg object-contain bg-slate-50 p-2 border border-slate-200"
            />
          </div>
        </div>
      )}

      {mediaItems.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-600">
            Screenshots & Photos
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mediaItems.map((item, i) => (
              <figure key={i} className="space-y-2">
                <img
                  src={item.url}
                  alt={item.alt ?? `Screenshot ${i + 1}`}
                  className="w-full rounded-lg border border-slate-200 object-cover shadow-sm aspect-video"
                />
                {item.caption && (
                  <figcaption className="text-sm text-slate-600">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
