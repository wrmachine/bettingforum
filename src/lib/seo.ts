import { prisma } from "./prisma";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://bettingforum.com";

export interface SeoMeta {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
  articleAuthor?: string;
  articlePublishedTime?: string;
}

export interface GlobalSeoSettings {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  twitterHandle?: string;
  robotsAllow: boolean;
  robotsDisallowPaths: string[];
}

const DEFAULT_SETTINGS: GlobalSeoSettings = {
  siteName: "Betting Forum",
  defaultTitle: "Betting Forum – Sports betting & online gambling community",
  defaultDescription:
    "The Reddit of sports betting. Discuss strategies, share tips, and discover the best sportsbooks, casinos, and tools — ranked by the community.",
  defaultOgImage: `${BASE_URL}/og-default.png`,
  robotsAllow: true,
  robotsDisallowPaths: ["/admin", "/account", "/api"],
};

export async function getGlobalSeoSettings(): Promise<GlobalSeoSettings> {
  try {
    const settings = await prisma.seoSettings.findMany();
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    if (Object.keys(map).length === 0) return DEFAULT_SETTINGS;
    return {
      siteName: map.siteName?.trim() || DEFAULT_SETTINGS.siteName,
      defaultTitle: map.defaultTitle?.trim() || DEFAULT_SETTINGS.defaultTitle,
      defaultDescription: map.defaultDescription?.trim() || DEFAULT_SETTINGS.defaultDescription,
      defaultOgImage: map.defaultOgImage?.trim() || DEFAULT_SETTINGS.defaultOgImage,
      twitterHandle: map.twitterHandle || undefined,
      robotsAllow: map.robotsAllow !== "false",
      robotsDisallowPaths: map.robotsDisallowPaths
        ? JSON.parse(map.robotsDisallowPaths)
        : DEFAULT_SETTINGS.robotsDisallowPaths,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getPageMeta(path: string): Promise<SeoMeta | null> {
  try {
    const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
    const patterns = await prisma.pageMeta.findMany({ orderBy: { pathPattern: "desc" } });
    for (const p of patterns) {
      if (matchPath(normalized, p.pathPattern)) {
        return {
          title: p.title ?? undefined,
          description: p.description ?? undefined,
          ogTitle: p.ogTitle ?? undefined,
          ogDescription: p.ogDescription ?? undefined,
          ogImage: p.ogImage ?? undefined,
          twitterCard: (p.twitterCard as SeoMeta["twitterCard"]) ?? undefined,
          noIndex: p.noIndex,
          noFollow: p.noFollow,
          canonical: p.canonical ?? undefined,
        };
      }
    }
  } catch {
    // DB may not be ready or tables missing
  }
  return null;
}

function matchPath(path: string, pattern: string): boolean {
  if (pattern === path) return true;
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2);
    return path === prefix || path.startsWith(prefix + "/");
  }
  return false;
}

export interface SeoMetaOverrides extends Partial<SeoMeta> {
  title?: string;
  description?: string;
  keywords?: string[];
}

export async function buildMetadata(
  path: string,
  overrides: SeoMetaOverrides
): Promise<{
  title: string;
  description: string;
  keywords?: string[];
  openGraph: Record<string, unknown>;
  twitter: Record<string, unknown>;
  robots?: { index: boolean; follow: boolean };
  alternates?: { canonical: string };
}> {
  const global = await getGlobalSeoSettings();
  const pageMeta = await getPageMeta(path);

  const title =
    overrides.title ??
    pageMeta?.title ??
    global.defaultTitle;
  const description =
    overrides.description ??
    pageMeta?.description ??
    global.defaultDescription;
  const ogImage =
    overrides.ogImage ??
    pageMeta?.ogImage ??
    global.defaultOgImage;
  const ogTitle = overrides.ogTitle ?? pageMeta?.ogTitle ?? title;
  const ogDescription = overrides.ogDescription ?? pageMeta?.ogDescription ?? description;
  const twitterCard = overrides.twitterCard ?? pageMeta?.twitterCard ?? "summary_large_image";
  const noIndex = overrides.noIndex ?? pageMeta?.noIndex ?? false;
  const noFollow = overrides.noFollow ?? pageMeta?.noFollow ?? false;
  const canonical = overrides.canonical ?? pageMeta?.canonical ?? `${BASE_URL}${path === "/" ? "" : path}`;

  const articleAuthor = (overrides as SeoMeta).articleAuthor;
  const articlePublishedTime = (overrides as SeoMeta).articlePublishedTime;
  const isUgc = articleAuthor || articlePublishedTime;

  const openGraph: Record<string, unknown> = {
    title: ogTitle,
    description: ogDescription,
    url: canonical,
    siteName: global.siteName,
    images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    locale: "en_US",
    type: isUgc ? "article" : "website",
  };
  if (articleAuthor) {
    (openGraph as Record<string, string[]>).authors = [articleAuthor];
  }
  if (articlePublishedTime) {
    (openGraph as Record<string, string>).publishedTime = articlePublishedTime;
  }

  const twitter: Record<string, unknown> = {
    card: twitterCard,
    title: ogTitle,
    description: ogDescription,
    images: [ogImage],
  };
  if (global.twitterHandle) {
    (twitter as Record<string, string>).creator = global.twitterHandle;
  }

  const defaultKeywords = [
    "sports betting",
    "online gambling",
    "betting forum",
    "sportsbooks",
    "casinos",
    "betting tips",
    "odds",
  ];
  const keywords = overrides.keywords ?? defaultKeywords;

  const result: ReturnType<typeof buildMetadata> extends Promise<infer R> ? R : never = {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph,
    twitter,
  };

  if (noIndex || noFollow) {
    result.robots = { index: !noIndex, follow: !noFollow };
  }
  result.alternates = { canonical };

  return result;
}

// JSON-LD Schema generators
export function buildOrganizationSchema(settings: GlobalSeoSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: BASE_URL,
    description: settings.defaultDescription,
  };
}

export function buildWebsiteSchema(settings: GlobalSeoSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: BASE_URL,
    description: settings.defaultDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildProductSchema(post: {
  title: string;
  slug: string;
  excerpt?: string | null;
  product?: {
    brandName: string;
    siteUrl?: string | null;
    productType: string;
    logoUrl?: string | null;
    reviews?: { rating: number }[];
  } | null;
  author?: { username: string } | null;
  votes?: number;
}) {
  const url = `${BASE_URL}/products/${post.slug}`;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: post.title,
    description: post.excerpt ?? post.title,
    url,
    ...(post.product?.logoUrl && {
      image: post.product.logoUrl,
    }),
    brand: post.product
      ? {
          "@type": "Brand",
          name: post.product.brandName,
          ...(post.product.siteUrl && { url: post.product.siteUrl }),
        }
      : undefined,
  };
  if (post.author) {
    schema.author = { "@type": "Person", name: post.author.username };
  }
  const reviews = post.product?.reviews ?? [];
  if (reviews.length > 0) {
    const sum = reviews.reduce((a, r) => a + r.rating, 0);
    const avg = sum / reviews.length;
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Math.round(avg * 10) / 10,
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return schema;
}

/** Forum threads – use DiscussionForumPosting for UGC discussions */
export function buildDiscussionForumPostingSchema(post: {
  title: string;
  slug: string;
  body?: string | null;
  excerpt?: string | null;
  author?: { username: string } | null;
  createdAt: string;
  votes?: number;
  comments?: number;
}) {
  const url = `${BASE_URL}/threads/${post.slug}`;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: post.title,
    articleBody: post.body ?? post.excerpt ?? post.title,
    url,
    datePublished: post.createdAt,
    author: post.author ? { "@type": "Person", name: post.author.username } : undefined,
  };
  if (typeof post.comments === "number") {
    schema.commentCount = post.comments;
  }
  if (typeof post.votes === "number" && post.votes > 0) {
    schema.interactionStatistic = {
      "@type": "InteractionCounter",
      interactionType: { "@type": "LikeAction" },
      userInteractionCount: post.votes,
    };
  }
  return schema;
}

/** Listicles – curated lists by users (Article with author) */
export function buildArticleSchema(
  post: {
    title: string;
    slug: string;
    excerpt?: string | null;
    body?: string | null;
    type: string;
    author?: { username: string } | null;
    createdAt: string;
    article?: { featuredImageUrl?: string | null } | null;
  },
  siteName = "Betting Forum"
) {
  const base =
    post.type === "thread" ? "threads" : post.type === "article" ? "articles" : "listicles";
  const url = `${BASE_URL}/${base}/${post.slug}`;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? post.body?.slice(0, 160) ?? post.title,
    url,
    datePublished: post.createdAt,
    publisher: { "@type": "Organization", name: siteName, url: BASE_URL },
    author: post.author ? { "@type": "Person", name: post.author.username } : undefined,
  };
  if (post.article?.featuredImageUrl) {
    schema.image = post.article.featuredImageUrl;
  }
  return schema;
}

export function buildItemListSchema(
  items: { name: string; url: string }[],
  listName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Bonuses – Offer schema for promotional content */
export function buildOfferSchema(bonus: {
  title: string;
  slug: string;
  excerpt?: string | null;
  offerValue?: string | null;
  promoCode?: string | null;
  terms?: string | null;
  claimUrl?: string | null;
  expiresAt?: string | Date | null;
  product?: { brandName: string; post?: { slug: string } | null } | null;
  author?: { username: string } | null;
  createdAt: string;
}) {
  const url = `${BASE_URL}/bonuses/${bonus.slug}`;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: bonus.title,
    description: bonus.excerpt ?? bonus.title,
    url,
    datePublished: bonus.createdAt,
    ...(bonus.author && { author: { "@type": "Person", name: bonus.author.username } }),
    ...(bonus.offerValue && { priceSpecification: { "@type": "PriceSpecification", price: bonus.offerValue } }),
    ...(bonus.promoCode && { promotionalCode: bonus.promoCode }),
    ...(bonus.terms && { termsOfService: bonus.terms }),
    ...(bonus.claimUrl && { url: bonus.claimUrl }),
    ...(bonus.expiresAt && {
      validThrough:
        typeof bonus.expiresAt === "string" ? bonus.expiresAt : (bonus.expiresAt as Date)?.toISOString?.(),
    }),
  };
  if (bonus.product) {
    schema.seller = {
      "@type": "Organization",
      name: bonus.product.brandName,
      ...(bonus.product.post?.slug && { url: `${BASE_URL}/products/${bonus.product.post.slug}` }),
    };
  }
  return schema;
}

export function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export async function getSchemaEnabled(schemaType: string): Promise<boolean> {
  try {
    const config = await prisma.schemaConfig.findUnique({
      where: { schemaType },
    });
    return config?.enabled ?? true;
  } catch {
    return true;
  }
}

export { BASE_URL };
