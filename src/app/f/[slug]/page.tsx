import { notFound } from "next/navigation";
import { getForumBySlugWithOverrides, getForumsWithOverrides, FORUM_CONFIGS } from "@/lib/forums";
import { ForumContent } from "@/components/ForumContent";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = await getForumsWithOverrides();
  return all.map((forum) => ({ slug: forum.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const forum = await getForumBySlugWithOverrides(slug);
  if (!forum) return { title: "Forum not found" };

  try {
    const meta = await buildMetadata(`/f/${slug}`, {
      title: `${forum.name} – Betting Forum`,
      description: forum.description,
    });
    return {
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords,
      openGraph: meta.openGraph,
      twitter: meta.twitter,
      alternates: meta.alternates,
    };
  } catch {
    return {
      title: `${forum.name} – Betting Forum`,
      description: forum.description,
    };
  }
}

export default async function ForumPage({ params }: PageProps) {
  const { slug } = await params;
  const forum = await getForumBySlugWithOverrides(slug);
  if (!forum) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">{forum.name}</h1>
      <p className="mt-1 text-slate-600">{forum.description}</p>
      <ForumContent forum={forum} />
    </div>
  );
}
