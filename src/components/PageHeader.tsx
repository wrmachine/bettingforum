import Link from "next/link";

export interface PageHeaderProps {
  title: string;
  /** Optional: description shown in dark section (replaces author metadata when provided) */
  description?: React.ReactNode;
  intro?: React.ReactNode;
  /** Optional: author display name */
  author?: string;
  /** Optional: author profile URL (e.g. /u/username) */
  authorUrl?: string;
  /** Optional: avatar image URL */
  avatarUrl?: string | null;
  /** Optional: role/title e.g. "Casino Content Editor" */
  role?: string;
  /** Optional: formatted date string */
  date?: string;
  /** Optional: show fact-checked badge */
  factChecked?: boolean;
}

export function PageHeader({
  title,
  description,
  intro,
  author,
  authorUrl,
  avatarUrl,
  role,
  date,
  factChecked = false,
}: PageHeaderProps) {
  const hasMetadata = !description && (author || role || date || factChecked);

  return (
    <header className="w-full">
      {/* Header section - full viewport width */}
      <div className="w-screen" style={{ marginLeft: "calc(50% - 50vw)" }}>
        <div className="mx-auto max-w-[1280px] px-4 py-3 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-black sm:text-3xl">
            {title}
          </h1>
          {description && (
            <div className="mt-3 text-sm text-slate-700 [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800">
              {description}
            </div>
          )}
          {hasMetadata && (
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-black">
              {author && (
                <>
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-black">
                      {author.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {authorUrl ? (
                    <Link
                      href={authorUrl}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {author}
                    </Link>
                  ) : (
                    <span>{author}</span>
                  )}
                  {(role || date || factChecked) && (
                    <span className="text-slate-400">|</span>
                  )}
                </>
              )}
              {role && <span>{role}</span>}
              {role && date && <span className="text-slate-400">|</span>}
              {date && <span className="text-slate-500">{date}</span>}
              {factChecked && (
                <>
                  {(role || date) && <span className="text-slate-400">|</span>}
                  <Link
                    href="/help#fact-checking"
                    className="inline-flex items-center gap-1.5 text-blue-600 underline hover:text-blue-800"
                  >
                    Fact checked
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                      <svg
                        className="h-2.5 w-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Intro paragraph - full viewport width */}
      {intro && (
        <div className="w-screen" style={{ marginLeft: "calc(50% - 50vw)" }}>
          <div className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6 lg:px-8">
            <div className="prose prose-slate max-w-none text-slate-700 prose-p:my-3 prose-p:leading-relaxed [&_strong]:font-semibold [&_strong]:text-slate-900">
              {intro}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
