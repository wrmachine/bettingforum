"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

interface MobileSidebarDrawerProps {
  children: React.ReactNode;
}

export function MobileSidebarDrawer({ children }: MobileSidebarDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer when navigating to a new page
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  const mobileUI =
    mounted &&
    typeof document !== "undefined" &&
    createPortal(
      <div className="fixed inset-0 z-[9999] hidden" aria-hidden role="presentation">
        {/* FAB + drawer - hidden on mobile (Forums button removed per design) */}
        <button
          type="button"
          onClick={openDrawer}
          className="fixed left-4 z-[10001] flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-full bg-header-green px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-header-green/90"
          style={{
            touchAction: "manipulation",
            bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
          }}
          aria-label="Open forums menu"
        >
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>Forums</span>
        </button>

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-[10000] bg-black/50 transition-opacity"
            aria-hidden="true"
            onClick={closeDrawer}
          />
        )}

        {/* Drawer */}
        <div
          aria-hidden={!isOpen}
          className={`fixed left-0 top-0 z-[10001] h-full w-[min(280px,85vw)] transform overflow-y-auto bg-white shadow-xl transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="font-semibold text-slate-900">Forums</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      {/* Desktop: inline sidebar (children provide their own width/sizing) */}
      <div className="hidden shrink-0 lg:block">
        {children}
      </div>

      {/* Mobile: FAB + drawer rendered via portal */}
      {mobileUI}
    </>
  );
}
