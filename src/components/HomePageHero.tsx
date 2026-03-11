import Link from "next/link";
import { prisma } from "@/lib/prisma";

const DEFAULT_TITLE = "Best Betting Products";

const DEFAULT_DESCRIPTION = (
  <>
    Our community has ranked the top{" "}
    <Link href="/f/bet-sportsbooks" className="text-blue-600 underline hover:text-blue-800">
      sportsbooks
    </Link>
    ,{" "}
    <Link href="/f/bet-casinos" className="text-blue-600 underline hover:text-blue-800">
      casinos
    </Link>
    , and{" "}
    <Link href="/f/bet-tools" className="text-blue-600 underline hover:text-blue-800">
      betting tools
    </Link>{" "}
    to help you find the best bonuses, banking options, and features for
    your needs.
  </>
);

async function getHomeContent() {
  const rows = await prisma.siteContent.findMany({
    where: { key: { startsWith: "home_" } },
  });

  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export async function HomePageHero() {
  const content = await getHomeContent();

  const title = content.home_title || DEFAULT_TITLE;
  const hasCustomDescription = content.home_description && content.home_description.trim() !== "";

  return (
    <header>
      <h1 className="text-2xl font-bold uppercase tracking-tight text-black sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-700 [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800">
        {hasCustomDescription ? (
          <span dangerouslySetInnerHTML={{ __html: content.home_description }} />
        ) : (
          DEFAULT_DESCRIPTION
        )}
      </p>
    </header>
  );
}
