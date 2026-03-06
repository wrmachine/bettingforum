const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const dave = await prisma.user.findFirst({ where: { username: "dave" } });
  const bob = await prisma.user.findFirst({ where: { username: "bob" } });
  const alice = await prisma.user.findFirst({ where: { username: "alice" } });
  const author = dave || bob || alice;

  if (!author) {
    console.error("No user found. Run full seed first: npm run db:seed");
    process.exit(1);
  }

  const existing = await prisma.post.findFirst({
    where: { slug: "understanding-value-betting-guide-2025" },
  });
  if (existing) {
    console.log("Articles already exist. Skipping.");
    return;
  }

  await prisma.post.create({
    data: {
      title: "Understanding Value Betting: A Complete Guide for 2025",
      slug: "understanding-value-betting-guide-2025",
      type: "article",
      authorId: author.id,
      excerpt: "Learn how to identify +EV opportunities and build a sustainable betting strategy.",
      body: `Value betting is the cornerstone of long-term profitability in sports betting. Unlike casual punters who bet for entertainment, value bettors focus on finding odds that are mispriced relative to the true probability of an outcome.

The key concept is simple: if you believe a team has a 50% chance to win, but the bookmaker offers odds implying only 45%, you have found value. Over hundreds of bets, these edges compound.

Getting started requires discipline. Track every bet in a spreadsheet. Compare your closing line value (CLV) against the market. Use odds comparison tools to ensure you're getting the best available price. And most importantly, bet only when you have a genuine edge—not when you "feel" like it.

The sportsbooks have sharp lines on major markets. Your edge will often come from niche leagues, player props, or live betting where the books are slower to adjust. Build expertise in one or two areas rather than spreading yourself thin.`,
      status: "published",
      article: {
        create: {
          subheadline: "How to identify +EV opportunities and build a sustainable strategy",
          lead: "Value betting is the cornerstone of long-term profitability in sports betting. Here's everything you need to know to get started in 2025.",
          featuredImageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=630&fit=crop",
        },
      },
    },
  });

  const author2 = bob || dave || alice;
  await prisma.post.create({
    data: {
      title: "US Sports Betting Legalization: State-by-State Breakdown",
      slug: "us-sports-betting-legalization-2025",
      type: "article",
      authorId: author2.id,
      excerpt: "Which states have legalized sports betting, which are pending, and what it means for bettors.",
      body: `As of 2025, over 38 states and Washington D.C. have legalized sports betting in some form. The landscape has shifted dramatically since the Supreme Court struck down PASPA in 2018.

States like New York, New Jersey, and Pennsylvania lead in handle and tax revenue. California and Texas remain the two largest holdouts—both have seen legislative efforts stall amid competing interests from tribes, commercial operators, and daily fantasy companies.

For bettors, legalization means access to regulated books with consumer protections, responsible gambling tools, and dispute resolution. It also means more competition: FanDuel, DraftKings, BetMGM, and Caesars battle for market share in each new state.

If you're in a newly legal state, shop around. Welcome bonuses vary wildly. Some books offer better odds on certain sports. And always verify you're using a licensed operator—avoid offshore books when a legal option exists.`,
      status: "published",
      article: {
        create: {
          subheadline: "Which states have legalized, which are pending, and what it means for you",
          lead: "Over 38 states have legalized sports betting since 2018. Here's the complete breakdown of where you can bet legally—and where things stand for the remaining holdouts.",
        },
      },
    },
  });

  console.log("Added 2 example articles.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
