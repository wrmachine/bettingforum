import type { NextConfig } from "next";

const productTypeRedirects: { source: string; has: { type: string; key: string; value: string }[]; destination: string; permanent: boolean }[] = [
  { source: "/products", has: [{ type: "query", key: "type", value: "sportsbook" }], destination: "/f/bet-sportsbooks", permanent: true },
  { source: "/products", has: [{ type: "query", key: "type", value: "casino" }], destination: "/f/bet-casinos", permanent: true },
  { source: "/products", has: [{ type: "query", key: "type", value: "crypto" }], destination: "/f/bet-crypto", permanent: true },
  { source: "/products", has: [{ type: "query", key: "type", value: "tool" }], destination: "/f/bet-tools", permanent: true },
];

const nextConfig: NextConfig = {
  transpilePackages: ["next-auth"],
  redirects: async () => productTypeRedirects,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
