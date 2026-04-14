"use client";

import { ListicleTemplate } from "./ListicleTemplate";
import { AdminEditButton } from "./AdminEditButton";

interface ListicleDetailProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    body: string | null;
    createdAt?: string;
    author: { username: string };
    listicle: {
      titleOverride: string | null;
      intro: string | null;
      items: {
        position: number;
        note: string | null;
        product: {
          id: string;
          brandName: string;
          shortDescription?: string | null;
          bonusSummary?: string | null;
          logoUrl?: string | null;
          siteUrl?: string | null;
          post: { slug: string };
          bonuses?: { promoCode: string | null; featured: boolean }[];
          reviews?: { rating: number }[];
        };
      }[];
    };
  };
}

const proseClasses =
  "prose prose-slate prose-lg max-w-none text-slate-700 prose-p:my-4 prose-p:leading-relaxed prose-headings:font-semibold prose-headings:text-slate-900 prose-headings:tracking-tight [&_strong]:font-semibold [&_strong]:text-slate-900 [&_em]:italic prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5 prose-h1:text-2xl prose-h1:mt-6 prose-h1:mb-4 prose-h1:font-bold prose-h1:border-b prose-h1:border-slate-200 prose-h1:pb-2 prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-xl prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-200 prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-lg prose-h4:mt-4 prose-h4:mb-2 prose-h4:text-base prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:my-4 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-4 prose-a:text-felt prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:max-w-full";

function renderIntro(introRaw: string | null | undefined) {
  if (!introRaw?.trim()) return null;
  const isHtml = /<[a-z][\s\S]*>/i.test(String(introRaw));
  if (isHtml) {
    return (
      <div className={`article-prose ${proseClasses}`} dangerouslySetInnerHTML={{ __html: introRaw }} />
    );
  }
  const paragraphs = introRaw.split(/\n\n+/).filter((p) => p.trim());
  return (
    <div className={proseClasses}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p.trim()}</p>
      ))}
    </div>
  );
}

function renderBody(bodyRaw: string | null | undefined) {
  if (!bodyRaw?.trim()) return null;
  const isHtml = /<[a-z][\s\S]*>/i.test(String(bodyRaw));
  if (isHtml) {
    return (
      <div className={`article-prose ${proseClasses}`} dangerouslySetInnerHTML={{ __html: bodyRaw }} />
    );
  }
  const paragraphs = bodyRaw.split(/\n\n+/).filter((p) => p.trim());
  return (
    <div className={proseClasses}>
      {paragraphs.map((p, i) => {
        const lines = p.trim().split("\n");
        return (
          <p key={i}>
            {lines.map((line, j) => (
              <span key={j}>
                {line}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export function ListicleDetail({ post }: ListicleDetailProps) {
  const items = post.listicle?.items ?? [];
  const intro = renderIntro(post.listicle?.intro ?? post.excerpt);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AdminEditButton type="listicle" slug={post.slug} />
      </div>

      {/* Top – intro, no box */}
      {intro && <div>{intro}</div>}

      {/* Cards */}
      <div className="space-y-4">
        <ListicleTemplate items={items} />
      </div>

      {/* Bottom – body, no box */}
      {post.body?.trim() && (
        <div>{renderBody(post.body)}</div>
      )}
    </div>
  );
}
