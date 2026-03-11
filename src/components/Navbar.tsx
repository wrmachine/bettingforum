"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ForumSidebar } from "./ForumSidebar";

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  order: number;
  children?: MenuItem[];
}

const FALLBACK_HEADER_MAIN: MenuItem[] = [
  { id: "1", label: "Sportsbooks", href: "/f/bet-sportsbooks", order: 0 },
  { id: "2", label: "Odds", href: "/products", order: 1 },
  { id: "3", label: "Bonuses", href: "/bonuses", order: 2 },
  { id: "4", label: "Articles", href: "/articles", order: 3 },
  { id: "5", label: "Best Of", href: "/listicles", order: 4 },
];

const FALLBACK_HEADER_SECONDARY: MenuItem[] = [
  { id: "a", label: "Betting Academy", href: "/categories", order: 0 },
  { id: "b", label: "Resources", href: "#", order: 1, children: [
    { id: "b1", label: "Products", href: "/products", order: 0 },
    { id: "b2", label: "Best Of", href: "/listicles", order: 1 },
    { id: "b3", label: "Calculators", href: "/calculators", order: 2 },
  ]},
  { id: "b4", label: "Calculators", href: "/calculators", order: 1.5 },
  { id: "c", label: "Responsible Betting", href: "/responsible", order: 2 },
  { id: "d", label: "About Us", href: "#", order: 3, children: [
    { id: "d1", label: "About", href: "/about", order: 0 },
    { id: "d2", label: "Privacy", href: "/privacy", order: 1 },
    { id: "d3", label: "Terms", href: "/terms", order: 2 },
  ]},
];

export function Navbar() {
  const { data: session, status } = useSession();
  const [mainNav, setMainNav] = useState<MenuItem[]>(FALLBACK_HEADER_MAIN);
  const [secondaryNav, setSecondaryNav] = useState<MenuItem[]>(FALLBACK_HEADER_SECONDARY);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileId, setExpandedMobileId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = (session?.user as { username?: string })?.username ?? session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "User";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    function handleClickOutsideDropdown(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    if (openDropdownId) {
      document.addEventListener("mousedown", handleClickOutsideDropdown);
      return () => document.removeEventListener("mousedown", handleClickOutsideDropdown);
    }
  }, [openDropdownId]);

  useEffect(() => {
    Promise.all([
      fetch("/api/menus?location=header_main").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/menus?location=header_secondary").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([main, secondary]) => {
        if (main?.length) setMainNav(main);
        if (secondary?.length) {
          const hasCalculators = secondary.some(
            (i: MenuItem) => i.label === "Calculators" && i.href === "/calculators"
          );
          const merged = hasCalculators
            ? secondary
            : [
                ...secondary.filter((i: MenuItem) => i.order < 1.5),
                { id: "calc", label: "Calculators", href: "/calculators", order: 1.5 },
                ...secondary.filter((i: MenuItem) => i.order >= 1.5),
              ].sort((a, b) => (a.order as number) - (b.order as number));
          setSecondaryNav(merged);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          aria-hidden="false"
        >
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
          />
          <div className="absolute left-0 top-0 h-full w-[min(320px,85vw)] overflow-y-auto bg-white shadow-xl transition-transform duration-300 ease-out">
            <div className="flex flex-col gap-6 px-4 py-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <span className="font-semibold text-slate-900">Forums</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close menu"
                >
                  <HamburgerIcon open />
                </button>
              </div>
              <ForumSidebar onLinkClick={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Top bar - bright green */}
      <div className="bg-header-green">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden rounded p-2 text-white hover:bg-white/10"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <HamburgerIcon open={mobileMenuOpen} />
            </button>
            <Link
              href="/"
              className="text-xl font-bold italic uppercase tracking-tight text-white hover:text-white/90"
            >
              Betting Forum
            </Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {mainNav
              .filter((item) => item.label.toLowerCase() !== "news")
              .map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="text-sm font-medium text-white hover:text-white/90"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/search"
              className="hidden text-white hover:text-white/90 md:inline-flex"
              aria-label="Search"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Link>
            {status === "loading" ? (
              <span className="text-sm text-white/70">...</span>
            ) : session ? (
              <>
                <div ref={userMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-1 text-sm font-medium text-white hover:text-white/90"
                  >
                    {displayName}
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 min-w-[160px] rounded-md border border-slate-700 bg-white py-2 shadow-lg">
                    <Link
                      href={`/u/${encodeURIComponent(displayName)}`}
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Account
                    </Link>
                    {(session.user as { role?: string }).role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
                      >
                        Admin
                      </Link>
                    )}
                  </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-header-green hover:bg-white/90"
                >
                  Log off
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="text-sm font-medium text-white hover:text-white/90"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-header-green hover:bg-white/90"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar - green (hidden on mobile, in mobile menu) */}
      <div ref={dropdownRef} className="hidden bg-header-navy md:block">
        <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-4 py-2.5 sm:px-6">
          {secondaryNav
            .filter((i) => i.order < 10)
            .sort((a, b) => a.order - b.order)
            .map((item) =>
              item.children && item.children.length > 0 ? (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdownId((id) => (id === item.id ? null : item.id))}
                    className="flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-white"
                  >
                    {item.label}
                    <svg
                      className={`h-4 w-4 transition-transform ${openDropdownId === item.id ? "rotate-180" : ""}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div
                    className={`absolute left-0 top-full mt-1 min-w-[160px] rounded-md bg-header-navyDark py-2 shadow-lg ${openDropdownId === item.id ? "block" : "hidden"}`}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        onClick={() => setOpenDropdownId(null)}
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-sm font-medium text-slate-300 hover:text-white"
                >
                  {item.label}
                </Link>
              )
            )}
          <div className="ml-auto flex items-center gap-4 border-l border-slate-600 pl-6">
            <Link
              href="/submit/thread"
              className="text-sm font-medium text-slate-300 hover:text-white"
            >
              Submit
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
