"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTopicForums, getProductForums, getBonusForums, getSportsForums, getContentForums } from "@/lib/forums";
import type { ForumConfig } from "@/lib/forums";

const generalNav = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/forums", label: "All forums", icon: "globe" },
  { href: "/articles?sort=new", label: "Recent articles", icon: "comments" },
  { href: "/search", label: "Search all threads", icon: "search" },
  { href: "/submit/thread", label: "Start new thread", icon: "plus" },
];

function buildNavItems(forums: ForumConfig[]) {
  return forums.map((f) => ({ href: `/f/${f.slug}`, label: f.name, icon: f.icon }));
}

const icons: Record<string, React.ReactNode> = {
  home: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  comments: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  search: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  plus: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  globe: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  chart: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  question: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  hand: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
    </svg>
  ),
  gift: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2M5 12h14" />
    </svg>
  ),
  sportsbook: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-header-green text-xs font-bold text-white">S</span>
  ),
  casino: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-500 text-xs font-bold text-white">C</span>
  ),
  crypto: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-orange-500 text-xs font-bold text-white">₿</span>
  ),
  tool: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  bonus: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-xs font-bold text-white">B</span>
  ),
  article: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  nfl: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-700 text-[9px] font-bold text-white">NFL</span>
  ),
  nba: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-orange-600 text-[9px] font-bold text-white">NBA</span>
  ),
  mlb: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-red-600 text-[9px] font-bold text-white">MLB</span>
  ),
  nhl: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-[9px] font-bold text-white">NHL</span>
  ),
  soccer: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-green-600 text-xs">⚽</span>
  ),
  mma: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-rose-700 text-[9px] font-bold text-white">MMA</span>
  ),
  tennis: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-lime-600 text-xs">🎾</span>
  ),
  golf: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-700 text-xs">⛳</span>
  ),
  boxing: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-red-800 text-xs">🥊</span>
  ),
  esports: (
    <span className="flex h-6 w-6 items-center justify-center rounded bg-violet-600 text-xs">🎮</span>
  ),
};

function NavLink({
  href,
  label,
  icon,
  active,
  variant,
  onLinkClick,
}: {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
  variant?: "sidebar" | "mobile";
  onLinkClick?: () => void;
}) {
  const isMobile = variant === "mobile";
  return (
    <Link
      href={href}
      onClick={onLinkClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-[0.2rem] text-[0.7rem] transition-colors ${
        isMobile
          ? active
            ? "bg-slate-700/50 font-medium text-white"
            : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
          : active
            ? "bg-slate-100 font-medium text-slate-900"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className={isMobile ? "text-slate-400" : "text-slate-400"}>{icons[icon] ?? icons.globe}</span>
      {label}
    </Link>
  );
}

export function ForumSidebar({
  forums: forumsProp,
  variant = "sidebar",
  onLinkClick,
}: { forums?: ForumConfig[]; variant?: "sidebar" | "mobile"; onLinkClick?: () => void }) {
  const pathname = usePathname();

  const topicForums = forumsProp
    ? buildNavItems(forumsProp.filter((f) => f.category === "topic"))
    : buildNavItems(getTopicForums());
  const contentForums = forumsProp
    ? buildNavItems(forumsProp.filter((f) => f.category === "content"))
    : buildNavItems(getContentForums());
  const sportsForums = forumsProp
    ? buildNavItems(forumsProp.filter((f) => f.category === "sports"))
    : buildNavItems(getSportsForums());
  const productForums = forumsProp
    ? buildNavItems(forumsProp.filter((f) => f.category === "product"))
    : buildNavItems(getProductForums());
  const bonusForums = forumsProp
    ? buildNavItems(forumsProp.filter((f) => f.category === "bonus"))
    : buildNavItems(getBonusForums());

  const isActive = (href: string) => {
    const [path] = href.split("?");
    if (path.startsWith("/f/")) {
      return pathname === path;
    }
    if (path === "/") return pathname === "/";
    if (path === "/forums") return pathname === "/forums";
    return pathname === path || (path !== "/" && pathname.startsWith(path));
  };

  const headingClass = variant === "mobile"
    ? "mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
    : "mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500";

  const navLinkProps = { variant, onLinkClick };

  return (
    <aside className={variant === "mobile" ? "shrink-0" : "w-48 shrink-0"}>
      <nav className="space-y-6">
        {/* General navigation */}
        <div className="space-y-0.5">
          {generalNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
              {...navLinkProps}
            />
          ))}
        </div>

        {/* Topic Forums */}
        <div>
          <h3 className={headingClass}>Topic Forums</h3>
          <div className="space-y-0.5">
            {topicForums.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                {...navLinkProps}
              />
            ))}
          </div>
        </div>

        {/* Articles */}
        <div>
          <h3 className={headingClass}>Articles</h3>
          <div className="space-y-0.5">
            <NavLink
              href="/listicles"
              label="Best Of"
              icon="article"
              active={pathname === "/listicles" || pathname.startsWith("/listicles/")}
              {...navLinkProps}
            />
            {contentForums.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                {...navLinkProps}
              />
            ))}
          </div>
        </div>

        {/* Sports Forums */}
        <div>
          <h3 className={headingClass}>Sports</h3>
          <div className="space-y-0.5">
            {sportsForums.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                {...navLinkProps}
              />
            ))}
          </div>
        </div>

        {/* Product Forums */}
        <div>
          <h3 className={headingClass}>Product Forums</h3>
          <div className="space-y-0.5">
            {productForums.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                {...navLinkProps}
              />
            ))}
          </div>
        </div>

        {/* Bonus */}
        <div>
          <h3 className={headingClass}>Bonus</h3>
          <div className="space-y-0.5">
            {bonusForums.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                {...navLinkProps}
              />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
