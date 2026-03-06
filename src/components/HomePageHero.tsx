import Link from "next/link";
import { PageHeader } from "./PageHeader";

export function HomePageHero() {
  return (
    <div className="mb-10">
      <PageHeader
        title="Best Betting Products"
        description={
          <>
            Our community has ranked the top{" "}
            <Link href="/f/bet-sportsbooks" className="text-blue-400 underline hover:text-blue-300">
              sportsbooks
            </Link>
            ,{" "}
            <Link href="/f/bet-casinos" className="text-blue-400 underline hover:text-blue-300">
              casinos
            </Link>
            , and{" "}
            <Link href="/f/bet-tools" className="text-blue-400 underline hover:text-blue-300">
              betting tools
            </Link>{" "}
            to help you find the best bonuses, banking options, and features for
            your needs.
          </>
        }
      />
    </div>
  );
}
