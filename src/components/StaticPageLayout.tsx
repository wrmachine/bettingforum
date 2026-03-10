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
    "mt-6 w-full prose prose-slate prose-lg max-w-none text-slate-700 prose-p:my-4 prose-p:leading-relaxed prose-headings:font-semibold prose-headings:text-slate-900 prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-200 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5 [&_strong]:font-semibold [&_strong]:text-slate-900 prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-a:text-felt prose-a:no-underline hover:prose-a:underline prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-4 prose-img:rounded-lg prose-img:max-w-full";
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
        <div className={`article-prose ${proseClasses}`}>
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
