"use client";

import { Navbar } from "./Navbar";
import { FooterDirectory } from "./FooterDirectory";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
          {children}
        </main>
        <FooterDirectory />
      </div>
    </div>
  );
}
