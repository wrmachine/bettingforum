const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const SEED_PASSWORD = "password123";
const hashedPassword = bcrypt.hashSync(SEED_PASSWORD, 10);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  await prisma.comment.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.listicleItem.deleteMany();
  await prisma.listicle.deleteMany();
  await prisma.bonus.deleteMany();
  await prisma.product.deleteMany();
  await prisma.article.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.adClick.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.adSpace.deleteMany();
  await prisma.staticPage.deleteMany();
  await prisma.user.deleteMany();

  const alice = await prisma.user.create({
    data: { username: "alice", email: "alice@example.com", password: hashedPassword, role: "user" },
  });
  const bob = await prisma.user.create({
    data: { username: "bob", email: "bob@example.com", password: hashedPassword, role: "user" },
  });
  const carol = await prisma.user.create({
    data: { username: "carol", email: "carol@example.com", password: hashedPassword, role: "user" },
  });
  const dave = await prisma.user.create({
    data: { username: "dave", email: "dave@example.com", password: hashedPassword, role: "admin" },
  });

  const tags = await Promise.all(
    [
      "sportsbook",
      "casino",
      "crypto",
      "strategy",
      "news",
      "usa",
      "uk",
      "tips",
      "ama",
      "introduce",
      "promotions",
      "guides",
      "nfl",
      "nba",
      "mlb",
      "nhl",
      "soccer",
      "mma",
      "tennis",
      "golf",
      "boxing",
      "esports",
      "first-time",
      "reload",
      "no-deposit",
      "second-deposit",
      "third-deposit",
      "free-spins",
      "cashback",
      "loyalty",
      "high-roller",
      "referral",
      "birthday",
      "welcome",
    ].map((name) => prisma.tag.create({ data: { name, slug: slugify(name) } }))
  );
  const tag = (name) => tags.find((t) => t.name === name);

  const thread1 = await prisma.post.create({
    data: {
      title: "What's your go-to strategy for live betting?",
      slug: "go-to-strategy-live-betting",
      type: "thread",
      authorId: alice.id,
      excerpt: "Curious how others approach in-play betting. Share your tips!",
      body: "I've been trying to improve my live betting game. Do you wait for specific situations (e.g. after a goal) or have a different approach? Would love to hear what works for you.",
      status: "published",
    },
  });

  const thread2 = await prisma.post.create({
    data: {
      title: "State of US sports betting in 2025",
      slug: "state-us-sports-betting-2025",
      type: "thread",
      authorId: bob.id,
      excerpt: "Discussion on legalization, market trends, and what's next.",
      body: "With more states legalizing, the landscape is changing fast. Which books are you using? Any new states you're watching?",
      status: "published",
    },
  });

  const thread3 = await prisma.post.create({
    data: {
      title: "Best crypto sportsbooks for US players?",
      slug: "best-crypto-sportsbooks-us",
      type: "thread",
      authorId: carol.id,
      excerpt: "Looking for recommendations that accept US customers.",
      body: "I'm tired of the KYC hassle. Which crypto books have you had good experiences with? Bonus points for fast withdrawals.",
      status: "published",
    },
  });

  const threadNFL = await prisma.post.create({
    data: {
      title: "Super Bowl MVP betting - who's your pick?",
      slug: "super-bowl-mvp-betting-picks",
      type: "thread",
      authorId: alice.id,
      excerpt: "Early discussion on MVP odds and value plays.",
      body: "With the season heating up, who do you like for Super Bowl MVP? Mahomes always seems overvalued. Any dark horses?",
      status: "published",
    },
  });

  const threadNBA = await prisma.post.create({
    data: {
      title: "Best player props for NBA tonight?",
      slug: "best-player-props-nba-tonight",
      type: "thread",
      authorId: bob.id,
      excerpt: "Share your top prop picks for today's games.",
      body: "Luka vs Giannis matchup looks interesting. Anyone have strong leans on rebounds or assists?",
      status: "published",
    },
  });

  const thread4 = await prisma.post.create({
    data: {
      title: "Odds comparison tools - which do you use?",
      slug: "odds-comparison-tools",
      type: "thread",
      authorId: dave.id,
      excerpt: "Comparing odds across books to find value.",
      body: "I've tried Oddschecker, OddsJam, and a few others. What's your workflow for finding the best lines?",
      status: "published",
    },
  });

  const thread5 = await prisma.post.create({
    data: {
      title: "Responsible gambling - how do you set limits?",
      slug: "responsible-gambling-limits",
      type: "thread",
      authorId: alice.id,
      excerpt: "Share your approach to staying in control.",
      body: "I set daily deposit limits and use the self-exclusion tools. What works for you?",
      status: "published",
    },
  });

  const productPost1 = await prisma.post.create({
    data: {
      title: "BetMGM Sportsbook",
      slug: "betmgm-sportsbook",
      type: "product",
      authorId: bob.id,
      excerpt: "Leading US sportsbook with great odds and live betting.",
      status: "published",
      product: {
        create: {
          brandName: "BetMGM",
          siteUrl: "https://betmgm.com",
          productType: "sportsbook",
          licenseJurisdiction: "US (multiple states)",
          fiatSupported: true,
          cryptoSupported: false,
          bonusSummary: "$1,500 risk-free bet",
          minDeposit: "$10",
        },
      },
    },
    include: { product: true },
  });

  const productPost2 = await prisma.post.create({
    data: {
      title: "DraftKings",
      slug: "draftkings",
      type: "product",
      authorId: carol.id,
      excerpt: "Daily fantasy and sports betting in one app.",
      status: "published",
      product: {
        create: {
          brandName: "DraftKings",
          siteUrl: "https://draftkings.com",
          productType: "sportsbook",
          fiatSupported: true,
          cryptoSupported: false,
          bonusSummary: "20% deposit match up to $1,000",
          minDeposit: "$5",
        },
      },
    },
    include: { product: true },
  });

  const productPost3 = await prisma.post.create({
    data: {
      title: "Stake.com",
      slug: "stake-com",
      type: "product",
      authorId: dave.id,
      excerpt: "Crypto-native sportsbook and casino.",
      status: "published",
      product: {
        create: {
          brandName: "Stake",
          siteUrl: "https://stake.com",
          productType: "sportsbook",
          fiatSupported: false,
          cryptoSupported: true,
          bonusSummary: "200% up to $2,000",
          minDeposit: "$10 (crypto)",
        },
      },
    },
    include: { product: true },
  });

  const productPost4 = await prisma.post.create({
    data: {
      title: "FanDuel Sportsbook",
      slug: "fanduel-sportsbook",
      type: "product",
      authorId: alice.id,
      excerpt: "Top US sportsbook with daily odds boosts and same-game parlays.",
      status: "published",
      product: {
        create: {
          brandName: "FanDuel",
          siteUrl: "https://fanduel.com",
          productType: "sportsbook",
          fiatSupported: true,
          cryptoSupported: false,
          bonusSummary: "$200 in bonus bets",
          minDeposit: "$10",
        },
      },
    },
    include: { product: true },
  });

  const productPost5 = await prisma.post.create({
    data: {
      title: "Bet365",
      slug: "bet365",
      type: "product",
      authorId: bob.id,
      excerpt: "Global sportsbook with in-play betting and streaming.",
      status: "published",
      product: {
        create: {
          brandName: "Bet365",
          siteUrl: "https://bet365.com",
          productType: "sportsbook",
          licenseJurisdiction: "UK, international",
          fiatSupported: true,
          cryptoSupported: false,
          bonusSummary: "Bet credits for new customers",
          minDeposit: "$5",
        },
      },
    },
    include: { product: true },
  });

  const productPost6 = await prisma.post.create({
    data: {
      title: "Bovada",
      slug: "bovada",
      type: "product",
      authorId: carol.id,
      excerpt: "Popular offshore sportsbook for US players.",
      status: "published",
      product: {
        create: {
          brandName: "Bovada",
          siteUrl: "https://bovada.lv",
          productType: "sportsbook",
          fiatSupported: true,
          cryptoSupported: true,
          bonusSummary: "75% up to $750",
          minDeposit: "$10",
        },
      },
    },
    include: { product: true },
  });

  const productPost7 = await prisma.post.create({
    data: {
      title: "Roobet Casino",
      slug: "roobet-casino",
      type: "product",
      authorId: dave.id,
      excerpt: "Crypto casino with provably fair games and crash.",
      status: "published",
      product: {
        create: {
          brandName: "Roobet",
          siteUrl: "https://roobet.com",
          productType: "casino",
          fiatSupported: false,
          cryptoSupported: true,
          bonusSummary: "Welcome bonus on first deposit",
          minDeposit: "$5 (crypto)",
        },
      },
    },
    include: { product: true },
  });

  const productPost8 = await prisma.post.create({
    data: {
      title: "OddsJam",
      slug: "oddsjam",
      type: "product",
      authorId: alice.id,
      excerpt: "Odds comparison and positive EV betting tool.",
      status: "published",
      product: {
        create: {
          brandName: "OddsJam",
          siteUrl: "https://oddsjam.com",
          productType: "tool",
          fiatSupported: true,
          cryptoSupported: false,
          bonusSummary: "Free trial available",
          minDeposit: "N/A",
        },
      },
    },
    include: { product: true },
  });

  const productPost9 = await prisma.post.create({
    data: {
      title: "Unibet",
      slug: "unibet",
      type: "product",
      authorId: bob.id,
      excerpt: "European sportsbook with strong football coverage.",
      status: "published",
      product: {
        create: {
          brandName: "Unibet",
          siteUrl: "https://unibet.com",
          productType: "sportsbook",
          licenseJurisdiction: "Malta, UK",
          fiatSupported: true,
          cryptoSupported: false,
          bonusSummary: "Money back as bonus",
          minDeposit: "$10",
        },
      },
    },
    include: { product: true },
  });

  const productPost10 = await prisma.post.create({
    data: {
      title: "BC.Game",
      slug: "bc-game",
      type: "product",
      authorId: carol.id,
      excerpt: "Crypto casino and sportsbook with 1000+ games.",
      status: "published",
      product: {
        create: {
          brandName: "BC.Game",
          siteUrl: "https://bc.game",
          productType: "casino",
          fiatSupported: true,
          cryptoSupported: true,
          bonusSummary: "300% first deposit bonus",
          minDeposit: "$10",
        },
      },
    },
    include: { product: true },
  });

  const listiclePost = await prisma.post.create({
    data: {
      title: "Best Crypto Sportsbooks 2025",
      slug: "best-crypto-sportsbooks-2025",
      type: "listicle",
      authorId: alice.id,
      excerpt: "A curated list of the top crypto-friendly betting sites.",
      status: "published",
      listicle: {
        create: {
          intro: "After testing dozens of crypto sportsbooks, these are my top picks for 2025.",
          items: {
            create: [
              { productId: productPost3.product.id, position: 1, note: "Best overall for crypto" },
              { productId: productPost2.product.id, position: 2, note: "Great for US players" },
            ],
          },
        },
      },
    },
  });

  const listiclePost2 = await prisma.post.create({
    data: {
      title: "Top US Sportsbooks for 2025",
      slug: "top-us-sportsbooks-2025",
      type: "listicle",
      authorId: bob.id,
      excerpt: "The best legal US sportsbooks ranked by odds, promos, and UX.",
      status: "published",
      listicle: {
        create: {
          intro: "I've used most of the major US books. Here's my ranking.",
          items: {
            create: [
              { productId: productPost1.product.id, position: 1, note: "Best promos" },
              { productId: productPost4.product.id, position: 2, note: "Best app" },
              { productId: productPost2.product.id, position: 3, note: "Best for DFS crossover" },
            ],
          },
        },
      },
    },
  });

  const listiclePost3 = await prisma.post.create({
    data: {
      title: "Best Odds Comparison Tools",
      slug: "best-odds-comparison-tools",
      type: "listicle",
      authorId: dave.id,
      excerpt: "Tools to find the best lines across sportsbooks.",
      status: "published",
      listicle: {
        create: {
          intro: "If you're serious about +EV betting, you need these.",
          items: {
            create: [
              { productId: productPost8.product.id, position: 1, note: "Best for positive EV" },
            ],
          },
        },
      },
    },
  });

  const listiclePost4 = await prisma.post.create({
    data: {
      title: "Crypto Casinos Worth Trying",
      slug: "crypto-casinos-worth-trying",
      type: "listicle",
      authorId: carol.id,
      excerpt: "Provably fair and fast withdrawals.",
      status: "published",
      listicle: {
        create: {
          intro: "My go-to crypto casinos for slots and table games.",
          items: {
            create: [
              { productId: productPost7.product.id, position: 1, note: "Best crash game" },
              { productId: productPost10.product.id, position: 2, note: "Huge game selection" },
            ],
          },
        },
      },
    },
  });

  const listiclePost5 = await prisma.post.create({
    data: {
      title: "Offshore Books That Pay Out",
      slug: "offshore-books-that-pay-out",
      type: "listicle",
      authorId: alice.id,
      excerpt: "US-friendly books with reliable withdrawal history.",
      status: "published",
      listicle: {
        create: {
          intro: "Based on my experience and community reports.",
          items: {
            create: [
              { productId: productPost6.product.id, position: 1, note: "Fast crypto payouts" },
              { productId: productPost3.product.id, position: 2, note: "No KYC for crypto" },
            ],
          },
        },
      },
    },
  });

  const articlePost1 = await prisma.post.create({
    data: {
      title: "Understanding Value Betting: A Complete Guide for 2025",
      slug: "understanding-value-betting-guide-2025",
      type: "article",
      authorId: dave.id,
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

  // Bonuses
  const bonusPost1 = await prisma.post.create({
    data: {
      title: "BetMGM $1,500 Risk-Free Bet",
      slug: "betmgm-1500-risk-free-bet",
      type: "bonus",
      authorId: bob.id,
      excerpt: "New users get a risk-free first bet up to $1,500. Place your bet—if it loses, get a refund in bonus bets.",
      status: "published",
      bonus: {
        create: {
          productId: productPost1.product.id,
          offerValue: "$1,500 Risk-Free Bet",
          promoCode: "BETMGM500",
          terms: "21+. First bet refunded as bonus bets if it loses. 1x rollover. Eligible states only.",
          claimUrl: "https://betmgm.com",
          expiresAt: new Date("2025-12-31"),
        },
      },
    },
    include: { bonus: true },
  });

  const bonusPost2 = await prisma.post.create({
    data: {
      title: "DraftKings 20% Deposit Match",
      slug: "draftkings-20-deposit-match",
      type: "bonus",
      authorId: carol.id,
      excerpt: "Deposit and get 20% matched up to $1,000 in bonus funds. One of the best welcome offers for new users.",
      status: "published",
      bonus: {
        create: {
          productId: productPost2.product.id,
          offerValue: "20% up to $1,000",
          promoCode: "DK1000",
          terms: "21+. Min deposit $5. 15x playthrough. Available in eligible states.",
          claimUrl: "https://draftkings.com",
          expiresAt: new Date("2025-06-30"),
        },
      },
    },
    include: { bonus: true },
  });

  const bonusPost3 = await prisma.post.create({
    data: {
      title: "Stake 200% Crypto Welcome Bonus",
      slug: "stake-200-welcome-bonus",
      type: "bonus",
      authorId: dave.id,
      excerpt: "Crypto users get 200% matched on first deposit up to $2,000. Instant credit, low rollover.",
      status: "published",
      bonus: {
        create: {
          productId: productPost3.product.id,
          offerValue: "200% up to $2,000",
          promoCode: "STAKE200",
          terms: "Min deposit $10 in crypto. 35x wagering. 21+.",
          claimUrl: "https://stake.com",
        },
      },
    },
    include: { bonus: true },
  });

  const bonusPost4 = await prisma.post.create({
    data: {
      title: "FanDuel $200 in Bonus Bets",
      slug: "fanduel-200-bonus-bets",
      type: "bonus",
      authorId: alice.id,
      excerpt: "Bet $5, get $200 in bonus bets if your first bet wins. No rollover on bonus bets.",
      status: "published",
      bonus: {
        create: {
          productId: productPost4.product.id,
          offerValue: "$200 Bonus Bets",
          promoCode: null,
          terms: "21+. Bet $5 or more, get $200 in bonus bets if bet wins. Bonus bets paid as non-withdrawable credits. Eligible states.",
          claimUrl: "https://fanduel.com",
          expiresAt: new Date("2025-12-31"),
        },
      },
    },
    include: { bonus: true },
  });

  const bonusPost5 = await prisma.post.create({
    data: {
      title: "Bovada 75% Crypto Match",
      slug: "bovada-75-crypto-match",
      type: "bonus",
      authorId: bob.id,
      excerpt: "Deposit with Bitcoin or other crypto and get 75% matched up to $750. Ideal for US players.",
      status: "published",
      bonus: {
        create: {
          productId: productPost6.product.id,
          offerValue: "75% up to $750",
          promoCode: "CRYPTO750",
          terms: "Crypto deposits only. 5x rollover. 21+.",
          claimUrl: "https://bovada.lv",
          expiresAt: new Date("2025-09-15"),
        },
      },
    },
    include: { bonus: true },
  });

  const bonusPost6 = await prisma.post.create({
    data: {
      title: "Bet365 Bet Credits for New Customers",
      slug: "bet365-bet-credits-new-customers",
      type: "bonus",
      authorId: carol.id,
      excerpt: "New customers receive bet credits when placing qualifying bets. Global availability.",
      status: "published",
      bonus: {
        create: {
          productId: productPost5.product.id,
          offerValue: "Bet £10, Get £30 in Credits",
          promoCode: "BET365",
          terms: "Min deposit £5. Qualifying bet £10 at min odds 1/2. Bet credits valid 30 days. 18+.",
          claimUrl: "https://bet365.com",
          expiresAt: new Date("2025-12-31"),
        },
      },
    },
    include: { bonus: true },
  });

  const bonusPost7 = await prisma.post.create({
    data: {
      title: "BC.Game 300% First Deposit",
      slug: "bc-game-300-first-deposit",
      type: "bonus",
      authorId: dave.id,
      excerpt: "Massive 300% welcome bonus on your first crypto deposit. Huge game library to play through.",
      status: "published",
      bonus: {
        create: {
          productId: productPost10.product.id,
          offerValue: "300% up to $500",
          promoCode: "BCGAME",
          terms: "Min deposit $10. 40x rollover. Crypto only. 18+.",
          claimUrl: "https://bc.game",
        },
      },
    },
    include: { bonus: true },
  });

  const bonusPost8 = await prisma.post.create({
    data: {
      title: "Unibet Money Back as Bonus",
      slug: "unibet-money-back-bonus",
      type: "bonus",
      authorId: alice.id,
      excerpt: "Get your stake back as a bonus if your first sports bet loses. Up to £40.",
      status: "published",
      bonus: {
        create: {
          productId: productPost9.product.id,
          offerValue: "Money Back up to £40",
          promoCode: "WELCOME40",
          terms: "UK & Ireland. New customers only. Qualifying bet £10 at evens+. 18+.",
          claimUrl: "https://unibet.com",
          expiresAt: new Date("2025-08-01"),
        },
      },
    },
    include: { bonus: true },
  });

  const articlePost2 = await prisma.post.create({
    data: {
      title: "US Sports Betting Legalization: State-by-State Breakdown",
      slug: "us-sports-betting-legalization-2025",
      type: "article",
      authorId: bob.id,
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

  await prisma.postTag.createMany({
    data: [
      { postId: thread1.id, tagId: tag("strategy").id },
      { postId: thread1.id, tagId: tag("tips").id },
      { postId: thread2.id, tagId: tag("news").id },
      { postId: thread2.id, tagId: tag("usa").id },
      { postId: thread3.id, tagId: tag("crypto").id },
      { postId: thread3.id, tagId: tag("usa").id },
      { postId: threadNFL.id, tagId: tag("nfl").id },
      { postId: threadNFL.id, tagId: tag("tips").id },
      { postId: threadNBA.id, tagId: tag("nba").id },
      { postId: thread4.id, tagId: tag("tips").id },
      { postId: thread5.id, tagId: tag("tips").id },
      { postId: productPost1.id, tagId: tag("sportsbook").id },
      { postId: productPost1.id, tagId: tag("usa").id },
      { postId: productPost2.id, tagId: tag("sportsbook").id },
      { postId: productPost3.id, tagId: tag("crypto").id },
      { postId: productPost4.id, tagId: tag("sportsbook").id },
      { postId: productPost4.id, tagId: tag("usa").id },
      { postId: productPost5.id, tagId: tag("sportsbook").id },
      { postId: productPost5.id, tagId: tag("uk").id },
      { postId: productPost6.id, tagId: tag("sportsbook").id },
      { postId: productPost6.id, tagId: tag("usa").id },
      { postId: productPost7.id, tagId: tag("casino").id },
      { postId: productPost7.id, tagId: tag("crypto").id },
      { postId: productPost8.id, tagId: tag("tips").id },
      { postId: productPost9.id, tagId: tag("sportsbook").id },
      { postId: productPost9.id, tagId: tag("uk").id },
      { postId: productPost10.id, tagId: tag("casino").id },
      { postId: productPost10.id, tagId: tag("crypto").id },
      { postId: listiclePost.id, tagId: tag("crypto").id },
      { postId: listiclePost2.id, tagId: tag("usa").id },
      { postId: listiclePost3.id, tagId: tag("tips").id },
      { postId: listiclePost4.id, tagId: tag("casino").id },
      { postId: listiclePost5.id, tagId: tag("usa").id },
      { postId: articlePost1.id, tagId: tag("strategy").id },
      { postId: articlePost1.id, tagId: tag("tips").id },
      { postId: articlePost2.id, tagId: tag("news").id },
      { postId: articlePost2.id, tagId: tag("usa").id },
      { postId: bonusPost1.id, tagId: tag("sportsbook").id },
      { postId: bonusPost1.id, tagId: tag("usa").id },
      { postId: bonusPost1.id, tagId: tag("first-time").id },
      { postId: bonusPost2.id, tagId: tag("sportsbook").id },
      { postId: bonusPost2.id, tagId: tag("first-time").id },
      { postId: bonusPost3.id, tagId: tag("crypto").id },
      { postId: bonusPost3.id, tagId: tag("first-time").id },
      { postId: bonusPost4.id, tagId: tag("sportsbook").id },
      { postId: bonusPost4.id, tagId: tag("first-time").id },
      { postId: bonusPost5.id, tagId: tag("sportsbook").id },
      { postId: bonusPost5.id, tagId: tag("first-time").id },
      { postId: bonusPost6.id, tagId: tag("sportsbook").id },
      { postId: bonusPost6.id, tagId: tag("uk").id },
      { postId: bonusPost6.id, tagId: tag("first-time").id },
      { postId: bonusPost7.id, tagId: tag("casino").id },
      { postId: bonusPost7.id, tagId: tag("crypto").id },
      { postId: bonusPost7.id, tagId: tag("first-time").id },
      { postId: bonusPost8.id, tagId: tag("sportsbook").id },
      { postId: bonusPost8.id, tagId: tag("uk").id },
      { postId: bonusPost8.id, tagId: tag("reload").id },
    ],
  });

  const allPosts = [
    thread1, thread2, thread3, thread4, thread5,
    productPost1, productPost2, productPost3, productPost4, productPost5,
    productPost6, productPost7, productPost8, productPost9, productPost10,
    listiclePost, listiclePost2, listiclePost3, listiclePost4, listiclePost5,
    bonusPost1, bonusPost2, bonusPost3, bonusPost4, bonusPost5, bonusPost6, bonusPost7, bonusPost8,
    articlePost1, articlePost2,
  ];
  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    const voters = [alice, bob, carol, dave].slice(0, (i % 4) + 1);
    for (const u of voters) {
      await prisma.vote.create({
        data: { postId: post.id, userId: u.id, value: 1 },
      });
    }
  }

  const c1 = await prisma.comment.create({
    data: {
      postId: thread1.id,
      userId: bob.id,
      body: "I usually wait for momentum shifts. If a favorite goes down early, the odds often overcorrect.",
    },
  });
  await prisma.comment.create({
    data: {
      postId: thread1.id,
      userId: carol.id,
      parentId: c1.id,
      body: "Same here. Patience is key with live betting.",
    },
  });
  await prisma.comment.create({
    data: {
      postId: thread1.id,
      userId: dave.id,
      body: "I use a spreadsheet to track my live bet ROI. Game-changer for spotting patterns.",
    },
  });
  await prisma.comment.create({
    data: {
      postId: thread2.id,
      userId: alice.id,
      body: "FanDuel and DraftKings dominate in my state. Curious about the smaller books.",
    },
  });
  await prisma.comment.create({
    data: {
      postId: productPost1.id,
      userId: alice.id,
      body: "Their app is solid. Withdrawals have been fast for me.",
    },
  });
  await prisma.comment.create({
    data: {
      postId: thread3.id,
      userId: bob.id,
      body: "Stake and Bovada both work well. Stake is faster for crypto.",
    },
  });
  await prisma.comment.create({
    data: {
      postId: thread4.id,
      userId: alice.id,
      body: "OddsJam is worth it if you're betting serious volume.",
    },
  });
  await prisma.comment.create({
    data: {
      postId: thread5.id,
      userId: bob.id,
      body: "I use deposit limits + weekly loss limits. Has saved me more than once.",
    },
  });

  await prisma.productReview.create({
    data: {
      productId: productPost1.product.id,
      userId: alice.id,
      rating: 4,
      headline: "Solid book, good promos",
      pros: "Fast payouts, clean app, lots of markets",
      cons: "Customer support can be slow",
      body: "Been using them for 6 months. No complaints.",
    },
  });
  await prisma.productReview.create({
    data: {
      productId: productPost1.product.id,
      userId: bob.id,
      rating: 5,
      headline: "Best in class",
      pros: "Odds, live betting, variety",
      cons: "None really",
    },
  });
  await prisma.productReview.create({
    data: {
      productId: productPost3.product.id,
      userId: carol.id,
      rating: 4,
      headline: "Great for crypto",
      pros: "Instant deposits/withdrawals, no KYC for crypto",
      cons: "Limited fiat options",
    },
  });
  await prisma.productReview.create({
    data: {
      productId: productPost4.product.id,
      userId: bob.id,
      rating: 5,
      headline: "Best app in the game",
      pros: "Smooth UX, great same-game parlays",
      cons: "Could use more crypto options",
    },
  });
  await prisma.productReview.create({
    data: {
      productId: productPost6.product.id,
      userId: alice.id,
      rating: 4,
      headline: "Reliable for US",
      pros: "Been using 2 years, never had payout issues",
      cons: "Odds could be sharper",
    },
  });

  // Default SEO settings
  const base = process.env.NEXTAUTH_URL || "https://bettingforum.com";
  await prisma.seoSettings.upsert({
    where: { key: "siteName" },
    create: { key: "siteName", value: "Betting Forum" },
    update: {},
  });
  await prisma.seoSettings.upsert({
    where: { key: "defaultTitle" },
    create: { key: "defaultTitle", value: "Betting Forum – Sports betting & online gambling community" },
    update: {},
  });
  await prisma.seoSettings.upsert({
    where: { key: "defaultDescription" },
    create: {
      key: "defaultDescription",
      value: "The Reddit of sports betting. Discuss strategies, share tips, and discover the best sportsbooks, casinos, and tools — ranked by the community.",
    },
    update: {},
  });
  await prisma.seoSettings.upsert({
    where: { key: "defaultOgImage" },
    create: { key: "defaultOgImage", value: `${base}/og-default.png` },
    update: {},
  });
  await prisma.seoSettings.upsert({
    where: { key: "robotsAllow" },
    create: { key: "robotsAllow", value: "true" },
    update: {},
  });
  await prisma.seoSettings.upsert({
    where: { key: "robotsDisallowPaths" },
    create: { key: "robotsDisallowPaths", value: '["/admin","/account","/api"]' },
    update: {},
  });

  // Static pages (privacy, terms, about, etc.)
  const staticPages = [
    { slug: "privacy", title: "Privacy Policy", body: "## Privacy Policy\n\nWe respect your privacy. This policy describes how we collect, use, and protect your personal information.\n\n*Last updated: 2025*" },
    { slug: "terms", title: "Terms & Conditions", body: "## Terms & Conditions\n\nBy using Betting Forum, you agree to these terms.\n\n*Last updated: 2025*" },
    { slug: "about", title: "About Us", body: "## About Betting Forum\n\nBetting Forum is a community for sports betting enthusiasts to share strategies, discover products, and connect.\n\n*Last updated: 2025*" },
    { slug: "contact", title: "Contact", body: "## Contact Us\n\nGet in touch with the Betting Forum team.\n\n*Last updated: 2025*" },
    { slug: "help", title: "Help", body: "## Help & FAQ\n\nFind answers to common questions about using Betting Forum.\n\n*Last updated: 2025*" },
    { slug: "affiliate-disclosure", title: "Affiliate Disclosure", body: "## Affiliate Disclosure\n\nWe may earn a commission when you sign up through our links. This does not affect our editorial independence.\n\n*Last updated: 2025*" },
    { slug: "partnerships", title: "Partnerships", body: "## Partnerships\n\nInterested in partnering with Betting Forum? Get in touch.\n\n*Last updated: 2025*" },
    { slug: "jobs", title: "Job Application", body: "## Careers\n\nJoin the Betting Forum team.\n\n*Last updated: 2025*" },
  ];
  for (const p of staticPages) {
    await prisma.staticPage.upsert({
      where: { slug: p.slug },
      create: p,
      update: { title: p.title, body: p.body },
    });
  }

  // Menu items - header_main
  const headerMainItems = [
    { label: "Sportsbooks", href: "/products?type=sportsbook", order: 0, location: "header_main" },
    { label: "Odds", href: "/products", order: 1, location: "header_main" },
    { label: "Bonuses", href: "/bonuses", order: 2, location: "header_main" },
    { label: "Articles", href: "/articles", order: 3, location: "header_main" },
    { label: "Listicles", href: "/listicles", order: 4, location: "header_main" },
  ];
  for (const item of headerMainItems) {
    await prisma.menuItem.create({ data: item });
  }

  // Menu items - header_secondary (with dropdowns)
  const resourcesParent = await prisma.menuItem.create({
    data: { label: "Resources", href: "#", order: 0, location: "header_secondary" },
  });
  await prisma.menuItem.createMany({
    data: [
      { label: "Products", href: "/products", order: 0, location: "header_secondary", parentId: resourcesParent.id },
      { label: "Listicles", href: "/listicles", order: 1, location: "header_secondary", parentId: resourcesParent.id },
    ],
  });
  await prisma.menuItem.createMany({
    data: [
      { label: "Betting Academy", href: "/categories", order: -1, location: "header_secondary" },
      { label: "Calculators", href: "/calculators", order: 1, location: "header_secondary" },
      { label: "Responsible Betting", href: "/responsible", order: 2, location: "header_secondary" },
    ],
  });
  const aboutParent = await prisma.menuItem.create({
    data: { label: "About Us", href: "#", order: 3, location: "header_secondary" },
  });
  await prisma.menuItem.createMany({
    data: [
      { label: "About", href: "/about", order: 0, location: "header_secondary", parentId: aboutParent.id },
      { label: "Privacy", href: "/privacy", order: 1, location: "header_secondary", parentId: aboutParent.id },
      { label: "Terms", href: "/terms", order: 2, location: "header_secondary", parentId: aboutParent.id },
    ],
  });
  await prisma.menuItem.createMany({
    data: [
      { label: "Random", href: "/threads?sort=new", order: 10, location: "header_secondary" },
      { label: "Top Viewed", href: "/products?sort=top", order: 11, location: "header_secondary" },
    ],
  });

  // Menu items - footer
  const footerServices = [
    { label: "Sportsbooks", href: "/products?type=sportsbook", order: 0, location: "footer_services" },
    { label: "Casinos", href: "/products?type=casino", order: 1, location: "footer_services" },
    { label: "Crypto Betting", href: "/products?type=crypto", order: 2, location: "footer_services" },
    { label: "Bonuses", href: "/bonuses", order: 3, location: "footer_services" },
    { label: "Top Reviewed", href: "/products?sort=top", order: 4, location: "footer_services" },
    { label: "Trending Threads", href: "/threads?sort=trending", order: 5, location: "footer_services" },
    { label: "Tipsters", href: "/products?type=tipster", order: 6, location: "footer_services" },
  ];
  const footerHelpful = [
    { label: "About us", href: "/about", order: 0, location: "footer_helpful" },
    { label: "Areas we serve", href: "/products", order: 1, location: "footer_helpful" },
    { label: "Work with us", href: "/submit", order: 2, location: "footer_helpful" },
    { label: "Reviews", href: "/products?sort=top", order: 3, location: "footer_helpful" },
    { label: "Contact", href: "/contact", order: 4, location: "footer_helpful" },
    { label: "Partnerships", href: "/partnerships", order: 5, location: "footer_helpful" },
  ];
  const footerInfo = [
    { label: "Blog", href: "/articles", order: 0, location: "footer_information" },
    { label: "Help", href: "/help", order: 1, location: "footer_information" },
    { label: "Reviews", href: "/products?sort=top", order: 2, location: "footer_information" },
    { label: "Job application", href: "/jobs", order: 3, location: "footer_information" },
    { label: "About us", href: "/about", order: 4, location: "footer_information" },
  ];
  const footerLegal = [
    { label: "Privacy & Policy", href: "/privacy", order: 0, location: "footer_legal" },
    { label: "Terms & Condition", href: "/terms", order: 1, location: "footer_legal" },
  ];
  for (const item of [...footerServices, ...footerHelpful, ...footerInfo, ...footerLegal]) {
    await prisma.menuItem.create({ data: item });
  }

  await prisma.adSpace.create({
    data: {
      name: "Footer Right",
      slot: "footer_right",
      width: 300,
      height: 250,
      rotation: "random",
      enabled: true,
    },
  });

  console.log("Seed complete! Created:");
  console.log("- 4 users (alice, bob, carol, dave)");
  console.log("- 5 forum threads");
  console.log("- 10 products");
  console.log("- 5 listicles");
  console.log("- 2 articles");
  console.log("- 8 bonuses");
  console.log("- 30 posts total");
  console.log("- Votes, comments, reviews, and tags");
  console.log("- Default SEO settings");
  console.log("- 8 static pages (privacy, terms, about, contact, help, affiliate-disclosure, partnerships, jobs)");
  console.log("- Menu items for header and footer");
  console.log("- 1 ad space (footer_right)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
