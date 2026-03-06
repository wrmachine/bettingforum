"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  getForumBySlug,
  getTopicForums,
  getProductForums,
  getBonusForums,
  getSportsForums,
  getContentForums,
} from "@/lib/forums";
import { RichTextEditor } from "@/components/RichTextEditor";

type ForumGroup = { label: string; forums: { slug: string; name: string }[] };

function getGroupedForums(): ForumGroup[] {
  return [
    {
      label: "Topic Forums",
      forums: getTopicForums().map((f) => ({ slug: f.slug, name: f.name })),
    },
    {
      label: "Content",
      forums: getContentForums().map((f) => ({ slug: f.slug, name: f.name })),
    },
    {
      label: "Sports",
      forums: getSportsForums().map((f) => ({ slug: f.slug, name: f.name })),
    },
    {
      label: "Product Forums",
      forums: getProductForums().map((f) => ({ slug: f.slug, name: f.name })),
    },
    {
      label: "Bonus",
      forums: getBonusForums().map((f) => ({ slug: f.slug, name: f.name })),
    },
  ];
}

const GROUPED_FORUMS = getGroupedForums();

function filterGroupedForums(query: string): ForumGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return GROUPED_FORUMS;
  return GROUPED_FORUMS
    .map((group) => ({
      label: group.label,
      forums: group.forums.filter(
        (f) =>
          f.slug.toLowerCase().includes(q) || f.name.toLowerCase().includes(q)
      ),
    }))
    .filter((g) => g.forums.length > 0);
}

export default function SubmitThreadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const forumFromUrl = searchParams.get("forum");
  const forum = forumFromUrl ? getForumBySlug(forumFromUrl) : null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forumInput, setForumInput] = useState("");
  const [forumDropdownOpen, setForumDropdownOpen] = useState(false);
  const forumDropdownRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    body: "",
    tags: [] as string[],
    forum: forumFromUrl || "",
  });

  useEffect(() => {
    if (forumFromUrl) {
      setForm((f) => (f.forum === forumFromUrl ? f : { ...f, forum: forumFromUrl }));
    }
  }, [forumFromUrl]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        forumDropdownRef.current &&
        !forumDropdownRef.current.contains(e.target as Node)
      ) {
        setForumDropdownOpen(false);
      }
    }
    if (forumDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [forumDropdownOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!session?.user) {
      const callback =
        form.forum ? `/submit/thread?forum=${form.forum}` : "/submit/thread";
      router.push("/auth/sign-in?callbackUrl=" + encodeURIComponent(callback));
      return;
    }
    setLoading(true);
    try {
      const selectedForumConfig = form.forum ? getForumBySlug(form.forum) : null;
      const tags = [...form.tags];
      if (selectedForumConfig?.tag && !tags.includes(selectedForumConfig.tag)) {
        tags.push(selectedForumConfig.tag);
      }
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          type: "thread",
          title: form.title,
          excerpt: form.excerpt,
          body: form.body || undefined,
          tags,
          forum: form.forum || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((typeof data?.error === "string" ? data.error : null) ?? "Failed to post thread. Please try again.");
        return;
      }
      router.push(`/threads/${data.slug}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Link
        href={forum ? `/f/${forum.slug}` : "/threads"}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to {forum ? forum.name : "threads"}
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Start a Thread</h1>
      {(forum || (form.forum && getForumBySlug(form.forum))) && (
        <p className="mt-1 text-slate-600">
          Posting to{" "}
          <span className="font-medium text-slate-900">
            {(forum || getForumBySlug(form.forum))?.name}
          </span>
        </p>
      )}
      <p className="mt-2 text-sm text-slate-600">
        Use a clear, descriptive title that summarizes your topic. Add a short summary to help others decide if they want to read more. Select a forum or category that best fits your discussion. You can add photos, graphics, animated GIFs, and YouTube embeds using the editor toolbar. Bold, italic, lists, and links are supported. Be respectful and follow community guidelines.
      </p>
      {!session?.user && status !== "loading" && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          You need to{" "}
          <Link href="/auth/sign-in" className="font-medium underline hover:no-underline">
            sign in
          </Link>{" "}
          to start a thread.
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="What's on your mind?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Short Summary
            </label>
            <input
              type="text"
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="One-line summary"
            />
          </div>
          <div ref={forumDropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Category / Forum
            </label>
            <p className="mt-0.5 text-xs text-slate-500">
              Optional. Type to search and select a forum — e.g. &quot;nfl&quot;, &quot;strategy&quot;, &quot;sportsbook&quot;.
            </p>
            {form.forum && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-sm text-white">
                  {getForumBySlug(form.forum)?.name ?? form.forum}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, forum: "" }))
                    }
                    className="ml-0.5 hover:text-slate-300"
                    aria-label="Clear forum selection"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}
            <div className="relative mt-1 w-full">
              <input
                type="text"
                value={forumInput}
                onChange={(e) => {
                  setForumInput(e.target.value);
                  setForumDropdownOpen(true);
                }}
                onFocus={() => setForumDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const grouped = filterGroupedForums(forumInput);
                    const firstMatch = grouped[0]?.forums[0];
                    if (firstMatch) {
                      setForm((f) => ({ ...f, forum: firstMatch.slug }));
                      setForumInput("");
                      setForumDropdownOpen(false);
                    }
                  }
                }}
                placeholder="Add forum (e.g. NFL, bet/strategy, Sportsbooks)"
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {forumDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-0.5 max-h-64 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
                  {filterGroupedForums(forumInput).map((group) => (
                    <div key={group.label}>
                      <div className="sticky top-0 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {group.label}
                      </div>
                      {group.forums.map((f) => (
                        <button
                          key={f.slug}
                          type="button"
                          onClick={() => {
                            setForm((frm) => ({ ...frm, forum: f.slug }));
                            setForumInput("");
                            setForumDropdownOpen(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 ${
                            form.forum === f.slug
                              ? "bg-slate-100 font-medium text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  ))}
                  {filterGroupedForums(forumInput).every(
                    (g) => g.forums.length === 0
                  ) && (
                    <p className="px-3 py-2 text-sm text-slate-500">
                      {forumInput.trim()
                        ? "No matching forums"
                        : "Type to search forums"}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <p className="mt-0.5 text-xs text-slate-500">
              Bold, italic, lists, and links are supported.
            </p>
            <div className="mt-2">
              <RichTextEditor
                value={form.body}
                onChange={(html) => setForm((f) => ({ ...f, body: html }))}
                placeholder="Share your thoughts..."
              />
            </div>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading || (status !== "loading" && !session?.user)}
            className="w-full rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Thread"}
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Or{" "}
        <Link href="/submit/comment" className="font-medium text-accent hover:underline">
          reply to a thread
        </Link>
        ,{" "}
        <Link href="/submit/product" className="font-medium text-accent hover:underline">
          submit a product
        </Link>
        ,{" "}
        <Link href="/submit/article" className="font-medium text-accent hover:underline">
          write an article
        </Link>
        , or{" "}
        <Link href="/submit/bonus" className="font-medium text-accent hover:underline">
          share a bonus
        </Link>
        .
      </p>
    </div>
  );
}
