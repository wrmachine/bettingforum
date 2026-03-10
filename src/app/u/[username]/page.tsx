import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProfileByUsername } from "@/lib/user-profile";
import { formatRelativeTime } from "@/lib/format";

function postHref(type: string, slug: string): string {
  switch (type) {
    case "product":
      return `/products/${slug}`;
    case "listicle":
      return `/listicles/${slug}`;
    case "article":
      return `/articles/${slug}`;
    case "thread":
    default:
      return `/threads/${slug}`;
  }
}

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    product: "Product",
    listicle: "Listicle",
    thread: "Discussion",
    article: "Article",
  };
  return labels[type] ?? type;
}

function getRoleBadge(role: string): { label: string; className: string } {
  switch (role) {
    case "admin":
      return { label: "Admin", className: "bg-amber-500/20 text-amber-800 border-amber-300" };
    case "moderator":
      return { label: "Mod", className: "bg-slate-200 text-slate-800 border-slate-300" };
    default:
      return { label: "Member", className: "bg-header-green/15 text-header-green border-header-green/40" };
  }
}

function getReputationTier(stats: { posts: number; comments: number; reviews: number }): string {
  const score = stats.posts * 2 + stats.comments + stats.reviews * 3;
  if (score >= 100) return "Sharp Bettor";
  if (score >= 50) return "Regular";
  if (score >= 20) return "Contributor";
  if (score >= 5) return "Newcomer";
  return "Lurker";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getUserProfileByUsername(username);
  if (!profile) return { title: "User not found" };
  return {
    title: `${profile.username} – Betting Forum`,
    description: `View ${profile.username}'s profile, activity, and contributions on Betting Forum.`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [profile, session] = await Promise.all([
    getUserProfileByUsername(username),
    getServerSession(authOptions),
  ]);

  if (!profile) notFound();

  const isOwnProfile = session?.user?.id === profile.id;
  const roleBadge = getRoleBadge(profile.role);
  const reputationTier = getReputationTier(profile.stats);

  const statStyles = [
    { iconBg: "bg-emerald-500/15", iconColor: "text-felt" },
    { iconBg: "bg-sky-500/15", iconColor: "text-sky-600" },
    { iconBg: "bg-violet-500/15", iconColor: "text-violet-600" },
    { iconBg: "bg-amber-500/15", iconColor: "text-amber-700" },
    { iconBg: "bg-rose-500/15", iconColor: "text-rose-600" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-0">
      {/* Profile header - avatar overlaps banner, content stays in white area */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
        {/* Banner - no overflow-hidden on parent so content isn't clipped */}
        <div className="relative h-24 overflow-hidden rounded-t-2xl bg-gradient-to-br from-felt via-felt-light to-felt-dark">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        <div className="relative px-6 pb-6 pt-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Avatar - only this overlaps the banner; neg margin on this element alone */}
            <div className="-mt-12 shrink-0 sm:-mt-14">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-slate-100 text-2xl font-bold text-slate-600 shadow-lg sm:h-28 sm:w-28 sm:text-3xl">
                {profile.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt={profile.username} width={112} height={112} className="h-full w-full object-cover" unoptimized={profile.avatarUrl.startsWith("/uploads/")} />
                ) : (
                  profile.username.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Username, badges, etc - stays in white area, never clipped */}
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{profile.username}</h1>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleBadge.className}`}
                  >
                    {roleBadge.label}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {reputationTier}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-slate-500">
                  Member since {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                  {profile.location && <span> · {profile.location}</span>}
                </p>
                {profile.bio && (
                  <div
                    className="mt-2 max-w-2xl text-sm text-slate-600 prose prose-slate prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: profile.bio }}
                  />
                )}
              </div>
              {isOwnProfile && (
                <Link
                  href="/account"
                  className="group inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  <svg className="h-4 w-4 transition-transform group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Account settings
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid - betting forum metrics with personality */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          {
            label: "Threads",
            value: profile.stats.threads,
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            ),
          },
          {
            label: "Posts",
            value: profile.stats.posts,
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            ),
          },
          {
            label: "Comments",
            value: profile.stats.comments,
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            ),
          },
          {
            label: "Reviews",
            value: profile.stats.reviews,
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            ),
          },
          {
            label: "Votes",
            value: profile.stats.votesGiven,
            icon: (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4l8 8h-5v8h-6v-8H4l8-8z" />
              </svg>
            ),
          },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="group flex flex-col gap-2.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300/80 hover:shadow-md hover:shadow-slate-200/40"
          >
            <span className="flex items-center gap-2 text-slate-500 [&>svg]:shrink-0">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${statStyles[i].iconBg} ${statStyles[i].iconColor} [&>svg]:h-4 [&>svg]:w-4`}>
                {stat.icon}
              </span>
              <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
            </span>
            <span className="text-2xl font-bold tabular-nums text-slate-900">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Activity section - tabs for Posts & Comments */}
      <div id="posts" className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
        <div className="border-b border-slate-200/80 bg-slate-50/50 px-6">
          <h2 className="py-4 text-lg font-semibold text-slate-900">Activity</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Recent posts */}
          <div className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </span>
              Recent submissions
            </h3>
            {profile.recentPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/80 text-slate-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">No submissions yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  {isOwnProfile ? (
                    <>Share your first thread, article, or product review.</>
                  ) : (
                    <>{profile.username} hasn&apos;t posted anything yet.</>
                  )}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/threads"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                  >
                    Start a discussion
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </Link>
                )}
              </div>
            ) : (
              <ul className="space-y-3">
                {profile.recentPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={postHref(post.type, post.slug)}
                      className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50"
                    >
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 group-hover:bg-slate-200">
                        {typeLabel(post.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-slate-900 group-hover:text-accent group-hover:underline">
                          {post.title}
                        </span>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                          <span>{formatRelativeTime(post.createdAt)}</span>
                          <span>{post.votes} votes</span>
                          <span>{post.comments} comments</span>
                        </div>
                      </div>
                      <svg
                        className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent comments */}
          <div className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </span>
              Recent comments
            </h3>
            {profile.recentComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/80 text-slate-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">No comments yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  {isOwnProfile ? (
                    <>Jump into a discussion and share your thoughts.</>
                  ) : (
                    <>{profile.username} hasn&apos;t commented yet.</>
                  )}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/threads"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Browse discussions
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            ) : (
              <ul className="space-y-4">
                {profile.recentComments.map((comment) => (
                  <li key={comment.id}>
                    <Link
                      href={`${postHref(comment.postType, comment.postSlug)}#comment-${comment.id}`}
                      className="group block rounded-lg border border-slate-100 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50"
                    >
                      <p className="line-clamp-2 text-sm text-slate-700">
                        {comment.body?.replace(/<[^>]*>/g, "") || comment.body}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-600">{comment.postTitle}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
