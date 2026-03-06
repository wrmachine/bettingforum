import ReactMarkdown from "react-markdown";

interface StaticPageLayoutProps {
  title: string;
  body: string;
  /** Optional last updated date */
  updatedAt?: Date;
}

/** Detect if content is HTML (for RichTextEditor output) vs Markdown */
function isHtml(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

export function StaticPageLayout({ title, body, updatedAt }: StaticPageLayoutProps) {
  const proseClasses =
    "mt-6 w-full prose prose-slate prose-headings:font-semibold prose-a:text-felt prose-a:no-underline hover:prose-a:underline";
  return (
    <div className="w-full max-w-[1280px]">
      <article className="w-full rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {updatedAt && (
          <p className="mt-2 text-sm text-slate-500">
            Last updated: {updatedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        <div className={proseClasses}>
          {isHtml(body) ? (
            <div dangerouslySetInnerHTML={{ __html: body }} />
          ) : (
            <ReactMarkdown>{body}</ReactMarkdown>
          )}
        </div>
      </article>
    </div>
  );
}
