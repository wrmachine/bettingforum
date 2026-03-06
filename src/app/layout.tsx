import type { Metadata, Viewport } from "next";
import { Inter_Tight, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/LayoutShell";
import { Providers } from "@/components/Providers";
import { buildMetadata, getGlobalSeoSettings, buildOrganizationSchema, buildWebsiteSchema, getSchemaEnabled, BASE_URL } from "@/lib/seo";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";

const interTight = Inter_Tight({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#166534",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const meta = await buildMetadata("/", {});
    return {
      metadataBase: new URL(BASE_URL),
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords ?? [
        "sports betting",
        "online gambling",
        "betting forum",
        "sportsbooks",
        "casinos",
        "crypto betting",
        "betting tips",
        "odds",
        "promo codes",
        "bonuses",
      ],
      authors: [{ name: "Betting Forum", url: BASE_URL }],
      creator: "Betting Forum",
      publisher: "Betting Forum",
      formatDetection: { email: false, address: false, telephone: false },
      icons: { icon: "/favicon.ico" },
      manifest: "/manifest.webmanifest",
      robots: meta.robots ?? { index: true, follow: true },
      alternates: meta.alternates ?? { canonical: BASE_URL },
      openGraph: meta.openGraph,
      twitter: meta.twitter,
    };
  } catch {
    return {
      metadataBase: new URL(BASE_URL),
      title: "Betting Forum – Sports betting & online gambling community",
      description: "Discuss strategies, share tips, and discover the best sportsbooks, casinos, and tools.",
      manifest: "/manifest.webmanifest",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let schemas: object[] = [];
  try {
    const [settings, orgEnabled, webEnabled] = await Promise.all([
      getGlobalSeoSettings(),
      getSchemaEnabled("organization"),
      getSchemaEnabled("website"),
    ]);
    if (orgEnabled) schemas.push(buildOrganizationSchema(settings));
    if (webEnabled) schemas.push(buildWebsiteSchema(settings));
  } catch {
    // DB may be unavailable; render without schemas
  }

  return (
    <html lang="en">
      <head>
        {schemas.length > 0 && <SchemaJsonLd data={schemas} />}
      </head>
      <body className={`${interTight.className} ${playfair.variable}`}>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
