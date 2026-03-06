import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await buildMetadata("/responsible", {
    title: "Responsible Betting – Betting Forum",
    description: "21+ only. Gambling can be addictive. Please gamble responsibly. Set deposit limits, take breaks, and never chase losses.",
  });
  return { title: meta.title, description: meta.description, openGraph: meta.openGraph, twitter: meta.twitter, alternates: meta.alternates };
}

export default function ResponsibleBettingPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">
        Responsible Betting
      </h1>
      <p className="mt-4 text-slate-600">
        21+ only. Gambling can be addictive. Please gamble responsibly. Set
        deposit limits, take breaks, and never chase losses. If you need help,
        visit{" "}
        <a
          href="https://www.begambleaware.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          BeGambleAware.org
        </a>{" "}
        or{" "}
        <a
          href="https://www.gamblersanonymous.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Gamblers Anonymous
        </a>
        .
      </p>
    </div>
  );
}
