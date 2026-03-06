"use client";

import { ArticlesIndex } from "@/components/ArticlesIndex";

export default function ArticlesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Articles</h1>
      <p className="mt-1 text-slate-600">
        In-depth articles, discussions, and community insights on sports betting and online gambling.
      </p>
      <ArticlesIndex />
    </div>
  );
}
